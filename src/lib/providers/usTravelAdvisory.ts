import { XMLParser } from "fast-xml-parser";
import type { CountryBase, UsAdvisory } from "@/lib/types";
import { normalizeName, slugifyForStateGov } from "@/lib/utils/strings";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

// US XML feed (structured) — may fail TLS on some machines/networks
const US_TRAVEL_ADVISORY_XML =
  "https://cadatacatalog.state.gov/dataset/4a387c35-29cb-4902-b91d-3da0dc02e4b2/resource/4c727464-8e6f-4536-b0a5-0a343dc6c7ff/download/traveladvisory.xml";

// Cache per server instance
const htmlCache = new Map<string, { fetchedAt: number; value: UsAdvisory }>();

let xmlCache:
  | {
      fetchedAt: number;
      map: Map<string, UsAdvisory>;
    }
  | null = null;

// If XML fails (TLS, blocked), don’t retry constantly
let xmlDisabledUntil = 0;

// Common slug overrides (add as you discover)
const SLUG_OVERRIDES: Record<string, string> = {
  CI: "cote-d-ivoire",
  CD: "democratic-republic-of-the-congo",
  CG: "republic-of-the-congo",
  MM: "burma",
  BS: "the-bahamas",
  GM: "the-gambia",
};

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(text: string) {
  return text
    // remove weird spaced-out letter sequences (accessibility/menu artifacts)
    .replace(/\b(?:[A-Z]\s){6,}[A-Z]\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


function extractMetaDescription(html: string): string | undefined {
  const patterns = [
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i,
    /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["'][^>]*>/i,
  ];

  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return undefined;
}


function parseDatesFromText(text: string): { dateIssued?: string; dateUpdated?: string } {
  let dateIssued =
    text.match(/\bDate issued:\s*([A-Za-z]+\s+\d{1,2},\s+\d{4})\b/i)?.[1]?.trim();

  let dateUpdated =
    text.match(/\bLast Updated:\s*([A-Za-z]+\s+\d{1,2},\s+\d{4})\b/i)?.[1]?.trim() ||
    text.match(/\bLast Update:\s*([A-Za-z]+\s+\d{1,2},\s+\d{4})\b/i)?.[1]?.trim();

  // Legacy pages: "Travel Advisory April 8, 2024"
  const legacyDate =
    text.match(/\bTravel Advisory\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})\b/i)?.[1]?.trim();

  if (!dateIssued && legacyDate) dateIssued = legacyDate;
  if (!dateUpdated && legacyDate) dateUpdated = legacyDate;

  return { dateIssued, dateUpdated };
}

const LEVEL_TITLES: Record<1 | 2 | 3 | 4, string> = {
  1: "Exercise Normal Precautions",
  2: "Exercise Increased Caution",
  3: "Reconsider Travel",
  4: "Do Not Travel",
};

function parseLevelFromText(text: string): { level?: 1 | 2 | 3 | 4; levelText?: string } {
  const m = text.match(/\bLevel\s*([1-4])\b/i);
  if (!m) return {};

  const level = Number(m[1]) as 1 | 2 | 3 | 4;

  // Try to find one of the canonical titles near the level mention
  const idx = m.index ?? 0;
  const window = text.slice(idx, idx + 220).toLowerCase();

  const canonical = LEVEL_TITLES[level];
  const canonicalLower = canonical.toLowerCase();

  const title = window.includes(canonicalLower)
    ? canonical
    : // fallback: try any canonical title in that window
      (Object.values(LEVEL_TITLES).find((t) => window.includes(t.toLowerCase())) ?? canonical);

  return { level, levelText: `Level ${level} - ${title}` };
}


function firstSentence(s: string) {
  const cleaned = s.replace(/\s+/g, " ").trim();
  const m = cleaned.match(/^(.+?[.!?])\s/);
  return (m?.[1] ?? cleaned).trim();
}

function parseSummaryFromText(text: string): string | undefined {
  // Legacy pages often have: "Updated to reflect ..."
  const updatedLine = text.match(/\bUpdated to reflect[^.]{20,800}\./i)?.[0]?.trim();
  if (updatedLine) return updatedLine;

  // New pages often contain: "Exercise increased caution in X due to ..."
  const exerciseLine = text.match(/\bExercise (?:increased caution|normal precautions)[^.]{20,900}\./i)?.[0]?.trim();
  if (exerciseLine) return firstSentence(exerciseLine);

  // Sometimes: "Country Summary: ..."
  const cs =
    text.match(/Country Summary:\s*(.+?)(?:If you decide to travel|Read the country information page|Travel advisory history|Assistance for U\.S\. Citizens|$)/i)
      ?.[1]?.trim();

  if (cs && cs.length >= 20) return firstSentence(cs);

  return undefined;
}


function buildCandidateUrls(country: CountryBase): string[] {
  const code = country.code.toUpperCase();
  const override = SLUG_OVERRIDES[code];

  const nameCandidates = [
    country.name,
    country.officialName,
    ...(country.aliases ?? []),
    country.slug,
  ].filter(Boolean) as string[];

  const slugs = new Set<string>();
  if (override) slugs.add(override);

  for (const n of nameCandidates) {
    const s = slugifyForStateGov(n);
    if (s) slugs.add(s);
    if (s.startsWith("the-")) slugs.add(s.replace(/^the-/, ""));
  }

  const slugList = Array.from(slugs).slice(0, 12);

  const urls: string[] = [];
  for (const slug of slugList) {
    // New pattern
    urls.push(`https://travel.state.gov/en/international-travel/travel-advisories/${slug}.html`);
    // Legacy pattern
    urls.push(
      `https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/${slug}-travel-advisory.html`
    );
  }

  return Array.from(new Set(urls));
}

/* ---------------- XML helpers (best effort) ---------------- */

function pickFirst(obj: any, keys: string[]): any {
  for (const k of keys) if (obj && obj[k] !== undefined) return obj[k];
  return undefined;
}

function asText(v: any): string | undefined {
  if (v == null) return undefined;
  if (typeof v === "string") return v.trim();
  if (typeof v === "number") return String(v);
  if (typeof v === "object" && typeof v["#text"] === "string") return v["#text"].trim();
  return undefined;
}

function parseLevel(levelRaw?: string): 1 | 2 | 3 | 4 | undefined {
  if (!levelRaw) return undefined;
  const m = levelRaw.match(/([1-4])/);
  return m ? (Number(m[1]) as 1 | 2 | 3 | 4) : undefined;
}

function collectObjects(node: any, out: any[] = []): any[] {
  if (!node) return out;
  if (Array.isArray(node)) {
    for (const x of node) collectObjects(x, out);
    return out;
  }
  if (typeof node === "object") {
    out.push(node);
    for (const v of Object.values(node)) collectObjects(v, out);
  }
  return out;
}

async function loadXmlMap(): Promise<Map<string, UsAdvisory>> {
  const now = Date.now();

  if (now < xmlDisabledUntil) return new Map();
  if (xmlCache && now - xmlCache.fetchedAt < SIX_HOURS_MS) return xmlCache.map;

  try {
    const res = await fetch(US_TRAVEL_ADVISORY_XML, {
      next: { revalidate: 60 * 60 * 6 },
      headers: { accept: "application/xml,text/xml" },
    });

    if (!res.ok) {
      xmlCache = { fetchedAt: now, map: new Map() };
      return xmlCache.map;
    }

    const xml = await res.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      trimValues: true,
    });

    const parsed = parser.parse(xml);
    const allObjects = collectObjects(parsed);

    const map = new Map<string, UsAdvisory>();

    for (const obj of allObjects) {
      const countryName =
        asText(pickFirst(obj, ["countryname", "CountryName", "Country", "Name", "name"])) ||
        asText(pickFirst(obj, ["geographicName", "GeographicName"]));

      const levelText =
        asText(pickFirst(obj, ["advisorylevel", "AdvisoryLevel", "Level", "level"])) ||
        asText(pickFirst(obj, ["Advisory", "advisory"]));

      const lvl = parseLevel(levelText || "");
      if (!countryName || !lvl) continue;

      const summary =
        asText(pickFirst(obj, ["advisorysummary", "AdvisorySummary", "Summary", "summary", "Description"])) ||
        asText(pickFirst(obj, ["AdvisoryText", "advisorytext"]));

      const dateIssued = asText(pickFirst(obj, ["dateissued", "DateIssued", "Issued", "issued"]));
      const dateUpdated = asText(pickFirst(obj, ["dateupdated", "DateUpdated", "Updated", "updated"]));

      const officialUrl =
        asText(pickFirst(obj, ["url", "URL", "link", "Link", "WebURL", "weburl"])) || undefined;

      map.set(normalizeName(countryName), {
        source: "us",
        level: lvl,
        levelText: levelText || undefined,
        summary,
        dateIssued,
        dateUpdated,
        officialUrl,
      });
    }

    xmlCache = { fetchedAt: now, map };
    return map;
  } catch (err) {
    // TLS/proxy failures happen here; avoid retry spam
    xmlDisabledUntil = now + SIX_HOURS_MS;
    xmlCache = { fetchedAt: now, map: new Map() };
    return xmlCache.map;
  }
}

/* ---------------- Public API ---------------- */

export async function getUsAdvisory(country: CountryBase): Promise<UsAdvisory> {
  const cacheKey = country.code.toUpperCase();
  const now = Date.now();

  const hit = htmlCache.get(cacheKey);
  if (hit && now - hit.fetchedAt < SIX_HOURS_MS) return hit.value;

  // 1) Try XML (fast + structured) — if it works
  const xmlMap = await loadXmlMap();

  const nameKeys = [
    normalizeName(country.name),
    country.officialName ? normalizeName(country.officialName) : "",
    ...(country.aliases ?? []).map(normalizeName),
  ].filter(Boolean);

  for (const k of nameKeys) {
    const xmlHit = xmlMap.get(k);
    if (xmlHit) {
      // Ensure we always have a URL (use XML url if provided, else HTML candidates[0])
      const candidates = buildCandidateUrls(country);
      const value: UsAdvisory = {
        ...xmlHit,
        officialUrl: xmlHit.officialUrl ?? candidates[0],
      };
      htmlCache.set(cacheKey, { fetchedAt: now, value });
      return value;
    }
  }

  // 2) Fallback to HTML scraping (works even when XML host fails)
  const candidates = buildCandidateUrls(country);

  for (const officialUrl of candidates) {
    try {
      const res = await fetch(officialUrl, { next: { revalidate: 60 * 60 * 6 } });
      if (!res.ok) continue;

      const html = await res.text();
      const text = cleanText(stripHtml(html));


      const { level, levelText } = parseLevelFromText(text);
      const { dateIssued, dateUpdated } = parseDatesFromText(text);

      const summary = extractMetaDescription(html) ?? parseSummaryFromText(text);

      const advisory: UsAdvisory = {
        source: "us",
        officialUrl,
        level,
        levelText,
        summary,
        dateIssued,
        dateUpdated,
      };

      htmlCache.set(cacheKey, { fetchedAt: now, value: advisory });
      return advisory;
    } catch {
      // try next candidate
    }
  }

  // final fallback
  const fallback: UsAdvisory = { source: "us", officialUrl: candidates[0] };
  htmlCache.set(cacheKey, { fetchedAt: now, value: fallback });
  return fallback;
}
