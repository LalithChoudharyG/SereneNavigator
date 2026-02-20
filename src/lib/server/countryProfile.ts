import "server-only";

import countries from "@/data/countries.json";
import type { CountryBase, CountryProfile } from "@/lib/types";
import { getRestCountryFacts } from "@/lib/providers/restCountries";
import { getUsAdvisory } from "@/lib/providers/usTravelAdvisory";
import { getEmergencyNumbers } from "@/lib/providers/emergencyNumbers";
import { unstable_cache } from "next/cache";

// ---- Tunables ----
const FACTS_TIMEOUT_MS = 12_000;
const ADVISORY_TIMEOUT_MS = 12_000;
const EMERGENCY_TIMEOUT_MS = 12_000;

// Promise timeout helper (prevents hanging)
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

function timed<T>(
  label: string,
  iso2: string,
  p: Promise<T>,
  onDone: (ms: number) => void
): Promise<T> {
  const t0 = Date.now();
  return p.finally(() => {
    const ms = Date.now() - t0;
    onDone(ms);
    // Per-provider timing log:
    console.log(`[profile] ${label}`, iso2, `${ms}ms`);
  });
}

export type CountryProfileTimings = {
  factsMs?: number;
  advisoryMs?: number;
  emergencyMs?: number;
  totalMs: number;
};

export async function buildCountryProfile(
  iso2Raw: string,
  opts?: { advisorySource?: string; includeEmergency?: boolean }
): Promise<{ profile: CountryProfile | null; timings: CountryProfileTimings }> {
  const totalStart = Date.now();

  const iso2 = String(iso2Raw || "").toUpperCase().trim();
  const advisorySource = (opts?.advisorySource || "us").toLowerCase();
  const includeEmergency = !!opts?.includeEmergency;

  let factsMs: number | undefined;
  let advisoryMs: number | undefined;
  let emergencyMs: number | undefined;

  const base = (countries as any[]).find(
    (x) => String(x.code).toUpperCase() === iso2
  ) as CountryBase | undefined;

  if (!base) {
    return { profile: null, timings: { totalMs: Date.now() - totalStart } };
  }

  // Run providers in parallel + safe
  const factsPromise = timed(
    "facts",
    iso2,
    withTimeout(getRestCountryFacts(iso2), FACTS_TIMEOUT_MS, "facts"),
    (ms) => (factsMs = ms)
  );

  const advisoryPromise =
    advisorySource === "us"
      ? timed(
          "advisory(us)",
          iso2,
          withTimeout(getUsAdvisory(base), ADVISORY_TIMEOUT_MS, "advisory"),
          (ms) => (advisoryMs = ms)
        )
      : Promise.resolve(undefined);

  const emergencyPromise = includeEmergency
    ? timed(
        "emergency",
        iso2,
        withTimeout(
          getEmergencyNumbers({ code: iso2, name: base.name }),
          EMERGENCY_TIMEOUT_MS,
          "emergency"
        ),
        (ms) => (emergencyMs = ms)
      )
    : Promise.resolve(undefined);

  const [factsR, advisoryR, emergencyR] = await Promise.allSettled([
    factsPromise,
    advisoryPromise,
    emergencyPromise,
  ]);

  const facts = factsR.status === "fulfilled" ? factsR.value ?? undefined : undefined;
  if (factsR.status === "rejected") console.warn("[profile] facts failed", iso2, factsR.reason);

  const advisory = advisoryR.status === "fulfilled" ? advisoryR.value ?? undefined : undefined;
  if (advisoryR.status === "rejected") console.warn("[profile] advisory failed", iso2, advisoryR.reason);

  const emergencyNumbers =
    emergencyR.status === "fulfilled" ? emergencyR.value ?? undefined : undefined;
  if (emergencyR.status === "rejected") console.warn("[profile] emergency failed", iso2, emergencyR.reason);

  const out: CountryProfile = {
    code: iso2,
    name: base.name,
    facts,
    advisory,
    emergencyNumbers,
  };

  const timings: CountryProfileTimings = {
    factsMs,
    advisoryMs,
    emergencyMs,
    totalMs: Date.now() - totalStart,
  };

  return { profile: out, timings };
}

// Cached version for pages (keeps your "fast page + background revalidate" behavior)
export const getCountryProfileCached = unstable_cache(
  async (iso2: string, advisorySource = "us", includeEmergency = true) => {
    const { profile } = await buildCountryProfile(iso2, { advisorySource, includeEmergency });
    return profile;
  },
  ["country-profile-v1"],
  { revalidate: 3600 }
);