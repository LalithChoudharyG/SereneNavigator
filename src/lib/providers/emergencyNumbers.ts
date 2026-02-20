import type { EmergencyNumbers } from "@/lib/types";
import { EMERGENCY_OVERRIDES } from "@/data/emergencyOverrides";
import { prisma } from "@/lib/db/prisma";

type AnyObj = Record<string, any>;

const MEMORY_TTL_MS = 1000 * 60 * 60 * 6; // 6h in-memory
const DB_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days in Postgres

// timeouts (tune)
const API_TIMEOUT_MS = 10_000; // hard abort for upstream API
const DB_READ_TIMEOUT_MS = 1200; // don't let DB stall the request
const DB_WRITE_TIMEOUT_MS = 1500;

const memoryCache = new Map<string, { expiresAt: number; value: EmergencyNumbers }>();

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms);
    p.then((v) => {
      clearTimeout(t);
      resolve(v);
    }).catch((e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

// ✅ Real abort timeout fetch (prevents long hangs)
async function fetchJsonWithAbort(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);

  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { accept: "application/json" },
      // You already do memory + DB caching; avoid Next fetch cache surprises:
      cache: "no-store",
    });
  } finally {
    clearTimeout(t);
  }
}

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

  // ✅ Some fields are strings/numbers instead of arrays
  if (typeof node === "string" || typeof node === "number") {
    out.push(String(node));
    return out;
  }

  if (typeof node === "object") {
    const all = getAny(node, ["All", "all"]);
    const gsm = getAny(node, ["GSM", "gsm"]);
    const fixed = getAny(node, ["Fixed", "fixed"]);

    // API says arrays, but be defensive:
    if (Array.isArray(all)) out.push(...all);
    else if (all != null) out.push(String(all));

    if (Array.isArray(gsm)) out.push(...gsm);
    else if (gsm != null) out.push(String(gsm));

    if (Array.isArray(fixed)) out.push(...fixed);
    else if (fixed != null) out.push(String(fixed));

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

  return {
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
}

async function readFromDbRaw(code: string) {
  return prisma.emergencyNumbersCache.findUnique({ where: { countryCode: code } });
}

async function readFromDb(code: string): Promise<EmergencyNumbers | null> {
  try {
    const row = await withTimeout(readFromDbRaw(code), DB_READ_TIMEOUT_MS, "db-read");
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
  } catch (e) {
    console.warn("[emergency] db-read failed", code, e);
    return null;
  }
}

// Optional: return stale row if API fails (better UX than empty)
async function readStaleFromDb(code: string): Promise<EmergencyNumbers | null> {
  try {
    const row = await withTimeout(readFromDbRaw(code), DB_READ_TIMEOUT_MS, "db-read-stale");
    if (!row) return null;

    const payload = row.payload as any;
    return {
      ...payload,
      source: "postgres-stale",
      verified: row.verified,
      verifiedSources: row.verifiedSources,
      fetchedAt: row.fetchedAt.toISOString(),
      expiresAt: row.expiresAt.toISOString(),
    } satisfies EmergencyNumbers;
  } catch {
    return null;
  }
}

async function writeToDbRaw(code: string, value: EmergencyNumbers, ttlMs: number) {
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

async function writeToDb(code: string, value: EmergencyNumbers, ttlMs: number) {
  try {
    await withTimeout(writeToDbRaw(code, value, ttlMs), DB_WRITE_TIMEOUT_MS, "db-write");
  } catch (e) {
    console.warn("[emergency] db-write failed", code, e);
  }
}

function hasAnyNumbers(v: EmergencyNumbers) {
  const s = v.services;
  return (
    (s.police?.length ?? 0) +
      (s.ambulance?.length ?? 0) +
      (s.fire?.length ?? 0) +
      (s.dispatch?.length ?? 0) >
    0
  );
}

export async function getEmergencyNumbers(country: {
  code: string;
  name?: string;
}): Promise<EmergencyNumbers | null> {
  const code = country.code.toUpperCase();
  const now = Date.now();

  // 1) Overrides (truth layer)
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

    memoryCache.set(code, { expiresAt: now + MEMORY_TTL_MS, value: merged });
    // ✅ DB write is best-effort and time-bounded
    await writeToDb(code, merged, DB_TTL_MS);

    console.log("[emergency] override", code);
    return merged;
  }

  // 2) Memory cache (fresh)
  const mem = memoryCache.get(code);
  if (mem && mem.expiresAt > now) {
    console.log("[emergency] memory-cache", code);
    return { ...mem.value, source: "memory-cache" };
  }

  // keep stale memory for fallback
  const staleMem = mem?.value;

  // 3) Postgres cache (fresh)
  const db = await readFromDb(code);
  if (db) {
    memoryCache.set(code, { expiresAt: now + MEMORY_TTL_MS, value: db });
    console.log("[emergency] postgres-cache", code);
    return db;
  }

  // keep stale DB for fallback
  const staleDb = await readStaleFromDb(code);

  // 4) Fetch from upstream API (hard abort timeout + safe fallback)
  const url = `https://emergencynumberapi.com/api/country/${encodeURIComponent(code)}`;

  let res: Response;
  try {
    res = await fetchJsonWithAbort(url, API_TIMEOUT_MS);
  } catch (e) {
    console.warn("[emergency] api-timeout/fetch-failed", code, e);
    return staleDb ?? staleMem ?? null;
  }

  // Rate limit => fallback instead of empty
  if (res.status === 429) {
    console.warn("[emergency] api-rate-limited 429", code);
    return staleDb ?? staleMem ?? null;
  }

  if (!res.ok) {
    console.log("[emergency] api-failed", code, res.status);
    return staleDb ?? staleMem ?? null;
  }

  let body: any;
  try {
    body = await res.json();
  } catch (e) {
    console.warn("[emergency] api-bad-json", code, e);
    return staleDb ?? staleMem ?? null;
  }

  if (body?.error) {
    console.log("[emergency] api-error", code, body.error);
    return staleDb ?? staleMem ?? null;
  }

  const d = unwrapData(body);
  if (!d) {
    console.log("[emergency] api-no-data", code);
    return staleDb ?? staleMem ?? null;
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

  // If member112 is true and dispatch empty, add 112 (unverified enrichment)
  if (value.member112 === true && value.services.dispatch.length === 0) {
    value.services.dispatch = ["112"];
  }

  // If upstream gave us zero numbers AND we have stale cache, prefer stale (better UX)
  if (!hasAnyNumbers(value) && (staleDb || staleMem)) {
    console.warn("[emergency] api-empty; using stale fallback", code);
    return staleDb ?? staleMem ?? value;
  }

  // Save to memory + DB (best effort)
  memoryCache.set(code, { expiresAt: now + MEMORY_TTL_MS, value });
  await writeToDb(code, value, DB_TTL_MS);

  console.log("[emergency] api", code);
  return value;
}