import fs from "node:fs/promises";
import path from "node:path";

const OUT_FILE = path.join(process.cwd(), "src", "data", "countries.json");

// REST Countries metadata (keep it light)
const REST_API =
  "https://restcountries.com/v3.1/all?fields=name,cca2,cca3,region,subregion,altSpellings,status";

// Wikidata SPARQL endpoint (reliable for “member of UN”)
const WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql";

const SPARQL = `
SELECT ?country ?countryLabel ?iso2 ?iso3 WHERE {
  ?country wdt:P31 wd:Q3624078;     # sovereign state
           wdt:P463 wd:Q1065;      # member of the UN
           wdt:P297 ?iso2;         # ISO 3166-1 alpha-2
           wdt:P298 ?iso3.         # ISO 3166-1 alpha-3
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY ?countryLabel
`;

function toAscii(str = "") {
  return str.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

function slugify(input = "") {
  return toAscii(input)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function continentFrom(region = "", subregion = "") {
  const r = (region || "").toLowerCase();
  const sr = (subregion || "").toLowerCase();

  if (r === "americas") {
    if (sr.includes("south america")) return "South America";
    return "North America"; // includes Central + Caribbean
  }
  if (r === "europe") return "Europe";
  if (r === "asia") return "Asia";
  if (r === "africa") return "Africa";
  if (r === "oceania") return "Oceania";

  return region || "Other";
}

function uniq(arr) {
  return [...new Set(arr)];
}

async function fetchWikidataUNMembers() {
  const body = new URLSearchParams({
    format: "json",
    query: SPARQL,
  });

  const res = await fetch(WIKIDATA_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Accept: "application/sparql-results+json",
      // Wikidata requests a UA; keep it simple:
      "User-Agent": "travel-safety-health-advisor/0.1 (data-generation script)",
    },
    body,
  });

  if (!res.ok) {
    throw new Error(`Wikidata fetch failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const rows = json?.results?.bindings ?? [];

  const list = rows
    .map((r) => ({
      iso2: r.iso2?.value,
      iso3: r.iso3?.value,
      name: r.countryLabel?.value,
    }))
    .filter((x) => x.iso2 && x.name);

  // ISO2 should be unique; enforce it
  const byIso2 = new Map();
  for (const item of list) byIso2.set(item.iso2, item);

  return [...byIso2.values()];
}

async function fetchRestCountriesIndex() {
  const res = await fetch(REST_API, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`REST Countries failed: ${res.status} ${res.statusText}`);
  const all = await res.json();

  const map = new Map();
  for (const c of all) {
    if (!c?.cca2) continue;
    map.set(c.cca2, c);
  }
  return map;
}

async function main() {
  const unMembers = await fetchWikidataUNMembers();
  if (unMembers.length !== 193) {
    const dbg = path.join(process.cwd(), "src", "data", "un.debug.json");
    await fs.mkdir(path.dirname(dbg), { recursive: true });
    await fs.writeFile(dbg, JSON.stringify(unMembers, null, 2) + "\n", "utf8");
    throw new Error(`Expected 193 UN members from Wikidata, got ${unMembers.length}. Wrote ${dbg}`);
  }

  const restIndex = await fetchRestCountriesIndex();

  const mapped = unMembers.map((u) => {
    const r = restIndex.get(u.iso2);

    // Prefer REST Countries “common” name if present; else fallback to Wikidata label
    const name = r?.name?.common || u.name;
    const officialName = r?.name?.official || u.name;

    const aliases = uniq(
      (r?.altSpellings || [])
        .map((x) => (typeof x === "string" ? x.trim() : ""))
        .filter(Boolean)
    ).slice(0, 6);

    const region = r?.region || "";
    const subregion = r?.subregion || "";

    return {
      code: u.iso2,              // ISO alpha-2
      code3: u.iso3 || (r?.cca3 || ""),
      name,
      officialName,
      slug: slugify(name),
      continent: continentFrom(region, subregion),
      region,
      subregion,
      aliases,
      featured: false
    };
  });

  // Ensure unique slugs
  const seen = new Map();
  for (const c of mapped) {
    const n = seen.get(c.slug) || 0;
    if (n > 0) c.slug = `${c.slug}-${c.code.toLowerCase()}`;
    seen.set(c.slug, n + 1);
  }

  // Sort A–Z
  mapped.sort((a, b) => a.name.localeCompare(b.name));

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(mapped, null, 2) + "\n", "utf8");

  console.log(`✅ Wrote ${mapped.length} UN member countries to ${OUT_FILE}`);
}

main().catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});
