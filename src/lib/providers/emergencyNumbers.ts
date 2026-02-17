import type { EmergencyNumbers } from "@/lib/types";
import { EMERGENCY_OVERRIDES } from "@/data/emergencyOverrides";
import { prisma } from "@/lib/db/prisma";

type AnyObj = Record<string, any>;

const MEMORY_TTL_MS = 1000 * 60 * 60 * 6; // 6h in-memory (fast local snapshot)
const DB_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days in Postgres (you can tune)

const memoryCache = new Map<string, { expiresAt: number; value: EmergencyNumbers }>();

function uniqStrings(values: any[]): string[] {
  const out: string[] = [];
  for (const v of values) {
    if (v == null) continue;
    const s = String(v).trim();
    if (!s) continue;
    out.push(s);
  }
  return Array.from(new Set(out));
}

function getAny(obj: AnyObj | undefined, keys: string[]) {
  if (!obj) return undefined;
  for (const k of keys) if (obj[k] !== undefined) return obj[k];
  return undefined;
}

function collectNumbers(node: any, out: any[] = []): any[] {
  if (!node) return out;
  if (Array.isArray(node)) {
    for (const x of node) collectNumbers(x, out);
    return out;
  }
  if (typeof node === "object") {
    const all = getAny(node, ["All", "all"]);
    const gsm = getAny(node, ["GSM", "gsm"]);
    const fixed = getAny(node, ["Fixed", "fixed"]);
    if (Array.isArray(all)) out.push(...all);
    if (Array.isArray(gsm)) out.push(...gsm);
    if (Array.isArray(fixed)) out.push(...fixed);
    for (const v of Object.values(node)) collectNumbers(v, out);
  }
  return out;
}

function flattenService(svc: any): string[] {
  return uniqStrings(collectNumbers(svc, []));
}

function unwrapData(body: any): AnyObj | undefined {
  const d0 = body?.data;
  if (!d0) return undefined;
  if (Array.isArray(d0)) return d0[0];
  if (typeof d0 === "object" && d0.data && typeof d0.data === "object") return d0.data;
  return d0;
}

function applyOverrides(code: string, base: EmergencyNumbers): EmergencyNumbers {
  const o = EMERGENCY_OVERRIDES[code];
  if (!o) return base;

  const merged: EmergencyNumbers = {
    ...base,
    source: "override",
    verified: true,
    verifiedSources: o.sources,
    services: {
      police: o.services.police ?? base.services.police,
      ambulance: o.services.ambulance ?? base.services.ambulance,
      fire: o.services.fire ?? base.services.fire,
      dispatch: o.services.dispatch ?? base.services.dispatch,
    },
  };

  return merged;
}

async function readFromDb(code: string): Promise<EmergencyNumbers | null> {
  const row = await prisma.emergencyNumbersCache.findUnique({ where: { countryCode: code } });
  if (!row) return null;
  if (row.expiresAt.getTime() <= Date.now()) return null;

  const payload = row.payload as any;

  return {
    ...payload,
    source: "postgres-cache",
    verified: row.verified,
    verifiedSources: row.verifiedSources,
    fetchedAt: row.fetchedAt.toISOString(),
    expiresAt: row.expiresAt.toISOString(),
  } satisfies EmergencyNumbers;
}

async function writeToDb(code: string, value: EmergencyNumbers, ttlMs: number) {
  const now = new Date();
  const expiresAt = new Date(Date.now() + ttlMs);

  await prisma.emergencyNumbersCache.upsert({
    where: { countryCode: code },
    create: {
      countryCode: code,
      payload: value as any,
      verified: value.verified,
      verifiedSources: value.verifiedSources,
      source: value.source,
      fetchedAt: now,
      expiresAt,
    },
    update: {
      payload: value as any,
      verified: value.verified,
      verifiedSources: value.verifiedSources,
      source: value.source,
      fetchedAt: now,
      expiresAt,
    },
  });
}

export async function getEmergencyNumbers(country: { code: string; name?: string }): Promise<EmergencyNumbers | null> {
  const code = country.code.toUpperCase();
  const now = Date.now();

  // 1) Truth layer: overrides
  if (EMERGENCY_OVERRIDES[code]) {
    const base: EmergencyNumbers = {
      source: "override",
      disclaimer: "Verified override values maintained by this app.",
      country: { name: country.name, isoCode: code },
      localOnly: undefined,
      member112: undefined,
      services: { police: [], ambulance: [], fire: [], dispatch: [] },
      verified: true,
      verifiedSources: EMERGENCY_OVERRIDES[code].sources,
      fetchedAt: new Date().toISOString(),
      expiresAt: new Date(now + DB_TTL_MS).toISOString(),
    };
    const merged = applyOverrides(code, base);

    // also persist so your UI is instant even after restart
    memoryCache.set(code, { expiresAt: now + MEMORY_TTL_MS, value: merged });
    await writeToDb(code, merged, DB_TTL_MS);
    console.log("[emergency] override", code);
    return merged;
  }

  // 2) In-memory cache (local snapshot cache)
  const mem = memoryCache.get(code);
  if (mem && mem.expiresAt > now) {
    console.log("[emergency] memory-cache", code);
    return { ...mem.value, source: "memory-cache" };
  }

  // 3) Postgres cache
  const db = await readFromDb(code);
  if (db) {
    memoryCache.set(code, { expiresAt: now + MEMORY_TTL_MS, value: db });
    console.log("[emergency] postgres-cache", code);
    return db;
  }

  // 4) Fetch from API (best effort)
  const url = `https://emergencynumberapi.com/api/country/${encodeURIComponent(code)}`;
  const res = await fetch(url, {
    next: { revalidate: 60 * 60 * 24 }, // Next fetch cache (separate from DB/memory)
    headers: { accept: "application/json" },
  });

  if (!res.ok) {
  console.log("[emergency] api-failed", code, res.status);
  return null;
}

  const body = await res.json();
  if (body?.error) {
  console.log("[emergency] api-error", code, body.error);
  return null;
}

  const d = unwrapData(body);
  if (!d) {
  console.log("[emergency] api-no-data", code);
  return null;
}

  const countryObj = getAny(d, ["Country", "country"]) as AnyObj | undefined;
  const localOnly = getAny(d, ["LocalOnly", "localOnly"]);
  const member112 = getAny(d, ["Member_112", "member_112", "member112", "Member112"]);

  const police = flattenService(getAny(d, ["Police", "police"]));
  const ambulance = flattenService(getAny(d, ["Ambulance", "ambulance"]));
  const fire = flattenService(getAny(d, ["Fire", "fire"]));
  const dispatch = flattenService(getAny(d, ["Dispatch", "dispatch"]));

  let value: EmergencyNumbers = {
    source: "emergencynumberapi",
    disclaimer: body?.disclaimer,
    country: {
      name: getAny(countryObj, ["Name", "name"]),
      isoCode: getAny(countryObj, ["ISOCode", "isoCode"]) ?? code,
      isoNumeric: getAny(countryObj, ["ISONumeric", "isoNumeric"]),
    },
    localOnly: typeof localOnly === "boolean" ? localOnly : undefined,
    member112: typeof member112 === "boolean" ? member112 : undefined,
    services: { police, ambulance, fire, dispatch },
    verified: false,
    verifiedSources: [],
    fetchedAt: new Date().toISOString(),
    expiresAt: new Date(now + DB_TTL_MS).toISOString(),
  };

  // Small safe enrichment: if they explicitly say member112 and dispatch empty, add it (still unverified)
  if (value.member112 === true && value.services.dispatch.length === 0) {
    value.services.dispatch = ["112"];
  }

  // Save to memory + DB
  memoryCache.set(code, { expiresAt: now + MEMORY_TTL_MS, value });
  await writeToDb(code, value, DB_TTL_MS);
  console.log("[emergency] api", code);

  return value;
}
