import fs from "node:fs";
import path from "node:path";
import { load } from "cheerio";

const root = process.cwd();

const ONLY =
  process.argv.find((a) => a.startsWith("--only="))?.split("=")[1]?.toUpperCase() || null;

const overwrite = process.argv.includes("--overwrite");

const countriesPath = path.join(root, "src", "data", "countries.json");
const destinationsPath = path.join(root, "src", "data", "destinations.json");

const cacheDirCA = path.join(root, ".cache", "cultural", "ca");
const cacheDirUK = path.join(root, ".cache", "cultural", "uk");
fs.mkdirSync(cacheDirCA, { recursive: true });
fs.mkdirSync(cacheDirUK, { recursive: true });

function safeReadJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// travel.gc.ca destination slugs that differ from our country slugs
const SLUG_OVERRIDES = {
  CV: "cabo-verde",
  CD: "congo-kinshasa",
  CG: "congo-brazzaville",
  CI: "cote-d-ivoire-ivory-coast",
  TL: "timor-leste-east-timor",
  IL: "israel-and-palestine",
  GM: "gambia-the",
  FM: "micronesia-fsm",
  VC: "saint-vincent-the-grenadines",
};

// Supports both destination shapes:
// - old: destination.name is slug
// - new: destination.slug exists
function getDestSlug(d) {
  return d?.slug || d?.name;
}

async function fetchWithCache(url, cacheFile) {
  if (fs.existsSync(cacheFile)) {
    return fs.readFileSync(cacheFile, "utf8");
  }

  const res = await fetch(url, {
    headers: {
      "user-agent": "TravelSafetyHealthAdvisor/1.0 (educational project)",
      "accept-language": "en-US,en;q=0.9",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} for ${url} :: ${text.slice(0, 120)}`);
  }

  const html = await res.text();
  fs.writeFileSync(cacheFile, html, "utf8");
  return html;
}

function extractLastUpdatedText($) {
  const bodyText = $("body").text();
  const m = bodyText.match(/Last updated:\s*([A-Za-z]+\s+\d{1,2},\s+\d{4}[^\n]*)/i);
  return m?.[1]?.trim();
}

// Collect content under a given H2 title on a page.
// Also supports H3/H4 subheadings by prefixing "Subheading: content".
function collectSectionBlocks($, sectionTitle) {
  const h2 = $("h2")
    .filter((_, el) => $(el).text().toLowerCase().includes(sectionTitle.toLowerCase()))
    .first();

  if (!h2.length) return [];

  const blocks = [];
  let currentLabel = "";

  let node = h2.next();
  while (node && node.length) {
    if (node.is("h2")) break;

    if (node.is("h3") || node.is("h4")) {
      currentLabel = node.text().trim();
    } else if (node.is("p")) {
      const t = node.text().replace(/\s+/g, " ").trim();
      if (t) blocks.push(currentLabel ? `${currentLabel}: ${t}` : t);
    } else if (node.is("ul") || node.is("ol")) {
      node.find("li").each((_, li) => {
        const t = $(li).text().replace(/\s+/g, " ").trim();
        if (t) blocks.push(currentLabel ? `${currentLabel}: ${t}` : t);
      });
    }

    node = node.next();
  }

  return blocks;
}

function clipTip(s, maxLen = 180) {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen - 1).trimEnd() + "…";
}

function categorizeTips(lines) {
  const out = { etiquette: [], transportation: [], money: [], communication: [] };
  const seen = new Set();

  const rules = [
    {
      key: "transportation",
      re: /\b(taxi|uber|cab|bus|train|metro|subway|tram|ferry|driving|road|traffic|helmet|seatbelt|public transport|car|motorbike|motorcycle)\b/i,
    },
    {
      key: "money",
      re: /\b(atm|cash|currency|card|credit|debit|bank|money|fraud|scam|overcharge|pickpocket|theft)\b/i,
    },
    {
      key: "communication",
      re: /\b(photograph|photography|camera|social media|internet|online|speech|insult|defamation|documents|id\b|passport|visa|satellite|gps|drone)\b/i,
    },
    // etiquette is default bucket
  ];

  for (const raw of lines) {
    const tip = clipTip(raw);
    const canonical = tip.toLowerCase();
    if (!tip || seen.has(canonical)) continue;
    seen.add(canonical);

    let bucket = "etiquette";
    for (const r of rules) {
      if (r.re.test(tip)) {
        bucket = r.key;
        break;
      }
    }
    out[bucket].push(tip);
  }

  // Keep UI manageable
  out.etiquette = out.etiquette.slice(0, 6);
  out.transportation = out.transportation.slice(0, 6);
  out.money = out.money.slice(0, 6);
  out.communication = out.communication.slice(0, 6);

  return out;
}

function hasAnyCultural(dest) {
  const c = dest?.cultural || {};
  return (
    (c.etiquette?.length || 0) +
      (c.transportation?.length || 0) +
      (c.money?.length || 0) +
      (c.communication?.length || 0) >
    0
  );
}

async function main() {
  const countries = safeReadJson(countriesPath, []);
  const destinations = safeReadJson(destinationsPath, []);

  if (!Array.isArray(countries) || countries.length === 0) {
    console.error("❌ countries.json missing/empty:", countriesPath);
    process.exit(1);
  }
  if (!Array.isArray(destinations) || destinations.length === 0) {
    console.error("❌ destinations.json missing/empty:", destinationsPath);
    process.exit(1);
  }

  const destByCode = new Map(
    destinations.map((d) => [String(d.code || "").toUpperCase(), d])
  );

  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const c of countries) {
    const code = String(c.code || "").toUpperCase();
    if (ONLY && code !== ONLY) continue;

    const dest = destByCode.get(code);
    if (!dest) continue;

    // Skip if we already have cultural tips and not overwriting
    if (!overwrite && hasAnyCultural(dest)) {
      skipped++;
      continue;
    }

    // Ensure cultural object exists
    dest.cultural = dest.cultural || {
      etiquette: [],
      transportation: [],
      money: [],
      communication: [],
    };

    // ✅ Special-case Canada: use GOV.UK (server-rendered, reliable parsing)
    if (code === "CA") {
      const ukUrl =
        "https://www.gov.uk/foreign-travel-advice/canada/safety-and-security";
      const cacheFile = path.join(cacheDirUK, "canada-safety-and-security.html");

      try {
        const html = await fetchWithCache(ukUrl, cacheFile);
        const $ = load(html);

        const lawsLines = collectSectionBlocks($, "Laws and cultural differences");
        const transportLines = collectSectionBlocks($, "Transport risks");
        const crimeLines = collectSectionBlocks($, "Crime");

        const merged = [...lawsLines, ...transportLines, ...crimeLines].filter(Boolean);
        if (merged.length === 0) throw new Error("No matching sections found on GOV.UK");

        const tips = categorizeTips(merged);

        dest.cultural.etiquette = tips.etiquette;
        dest.cultural.transportation = tips.transportation;
        dest.cultural.money = tips.money;
        dest.cultural.communication = tips.communication;

        dest.culturalSources = [
          { provider: "UK_FCDO", url: ukUrl, fetchedAt: new Date().toISOString() },
        ];

        ok++;
        await sleep(200);
        continue;
      } catch (err) {
        console.log("FAILED CA:", String(err?.message || err));
        failed++;
        continue;
      }
    }

    // ✅ Everyone else: travel.gc.ca
    const override = SLUG_OVERRIDES[code];
    const candidateSlug = override || getDestSlug(dest) || c.slug || slugify(c.name);

    const url = `https://travel.gc.ca/destinations/${candidateSlug}`;
    const cacheFile = path.join(cacheDirCA, `${candidateSlug}.html`);

    try {
      const html = await fetchWithCache(url, cacheFile);
      const $ = load(html);

      const lastUpdatedText = extractLastUpdatedText($);
      const lawsLines = collectSectionBlocks($, "Laws and culture");
      const safetyLines = collectSectionBlocks($, "Safety and security");

      const merged = [...lawsLines, ...safetyLines].filter(Boolean);
      if (merged.length === 0) throw new Error("No matching sections found on travel.gc.ca");

      const tips = categorizeTips(merged);

      dest.cultural.etiquette = tips.etiquette;
      dest.cultural.transportation = tips.transportation;
      dest.cultural.money = tips.money;
      dest.cultural.communication = tips.communication;

      dest.culturalSources = [
        {
          provider: "CA_TRAVEL_GC",
          url,
          fetchedAt: new Date().toISOString(),
          lastUpdatedText,
        },
      ];

      ok++;
      await sleep(300);
    } catch (err) {
      console.log("FAILED:", code, c.name, url, "::", String(err?.message || err));
      failed++;
      await sleep(150);
    }
  }

  writeJson(destinationsPath, destinations);

  console.log("✅ Cultural enrichment complete");
  console.log({ ok, skipped, failed, overwrite, only: ONLY });
}

main();