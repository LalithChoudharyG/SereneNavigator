import countries from "@/data/countries.json";
import type { CountryBase, CountryProfile } from "@/lib/types";
import { getRestCountryFacts } from "@/lib/providers/restCountries";
import { getUsAdvisory } from "@/lib/providers/usTravelAdvisory";
import { getEmergencyNumbers } from "@/lib/providers/emergencyNumbers";

export const runtime = "nodejs";

// ---- Tunables (adjust as needed) ----
const FACTS_TIMEOUT_MS = 12_000;
const ADVISORY_TIMEOUT_MS = 12_000;
const EMERGENCY_TIMEOUT_MS = 12_000;

// Cache to avoid repeating slow upstream calls (even if caller uses no-store)
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

type CacheEntry = { expiresAt: number; value: CountryProfile };

// Keep cache across hot reloads (dev) / requests (node process)
declare global {
  // eslint-disable-next-line no-var
  var __countryProfileCache: Map<string, CacheEntry> | undefined;
}
const memoryCache: Map<string, CacheEntry> =
  globalThis.__countryProfileCache ?? (globalThis.__countryProfileCache = new Map());

// Promise timeout helper (doesn't abort underlying fetch, but prevents your route from hanging)
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

function cacheKey(iso2: string, advisorySource: string, includeEmergency: boolean) {
  return `${iso2}|advisory=${advisorySource}|emergency=${includeEmergency ? 1 : 0}`;
}

// ✅ Next.js 16: params is a Promise -> MUST await
type Ctx = { params: Promise<{ code: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const t0 = Date.now();

  const { code } = await ctx.params; // ✅ unwrap params promise
  const iso2 = String(code || "").toUpperCase().trim();

  if (!iso2) {
    return Response.json({ error: "Missing country code" }, { status: 400 });
  }

  const base = (countries as any[]).find(
    (x) => String(x.code).toUpperCase() === iso2
  ) as CountryBase | undefined;

  if (!base) {
    return Response.json({ error: "Unknown country code" }, { status: 404 });
  }

  const url = new URL(req.url);
  const advisorySource = (url.searchParams.get("advisory") || "us").toLowerCase();

  const include = (url.searchParams.get("include") ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const includeEmergency = include.includes("emergency") || include.includes("all");

  const key = cacheKey(iso2, advisorySource, includeEmergency);

  // ---- Memory cache hit ----
  const cached = memoryCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    console.log("[profile] cache hit", iso2, { key, ms: Date.now() - t0 });
    return Response.json(cached.value, {
      headers: {
        "Cache-Control": "no-store", // caller controls caching; we use internal cache
      },
    });
  }

  console.log("[profile] start", iso2, { advisorySource, includeEmergency });

  // ---- Run providers in parallel (and safely) ----
  const factsPromise = withTimeout(getRestCountryFacts(iso2), FACTS_TIMEOUT_MS, "facts");

  const advisoryPromise =
    advisorySource === "us"
      ? withTimeout(getUsAdvisory(base), ADVISORY_TIMEOUT_MS, "advisory(us)")
      : Promise.resolve(undefined);

  const emergencyPromise = includeEmergency
    ? withTimeout(
        getEmergencyNumbers({ code: iso2, name: base.name }),
        EMERGENCY_TIMEOUT_MS,
        "emergency"
      )
    : Promise.resolve(undefined);

  const [factsR, advisoryR, emergencyR] = await Promise.allSettled([
    factsPromise,
    advisoryPromise,
    emergencyPromise,
  ]);

  const facts = factsR.status === "fulfilled" ? factsR.value ?? undefined : undefined;
  if (factsR.status === "rejected") {
    console.warn("[profile] facts failed", iso2, factsR.reason);
  }

  const advisory = advisoryR.status === "fulfilled" ? advisoryR.value ?? undefined : undefined;
  if (advisoryR.status === "rejected") {
    console.warn("[profile] advisory failed", iso2, advisoryR.reason);
  }

  const emergencyNumbers =
    emergencyR.status === "fulfilled" ? emergencyR.value ?? undefined : undefined;
  if (emergencyR.status === "rejected") {
    console.warn("[profile] emergency failed", iso2, emergencyR.reason);
  }

  const out: CountryProfile = {
    code: iso2,
    name: base.name,
    facts,
    advisory,
    emergencyNumbers,
  };

  // store in memory cache
  memoryCache.set(key, { value: out, expiresAt: Date.now() + CACHE_TTL_MS });

  console.log("[profile] done", iso2, { ms: Date.now() - t0 });

  return Response.json(out, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
