import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const countriesPath = path.join(root, "src", "data", "countries.json");
const destinationsPath = path.join(root, "src", "data", "destinations.json");

function safeReadJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// 1) Load countries (193)
const countries = safeReadJson(countriesPath, []);
if (!Array.isArray(countries) || countries.length === 0) {
  console.error("❌ countries.json missing or empty:", countriesPath);
  process.exit(1);
}

// 2) Load existing destinations (keep your detailed ones)
const existingDestinations = safeReadJson(destinationsPath, []);
const existingByCode = new Map(
  (Array.isArray(existingDestinations) ? existingDestinations : [])
    .filter(Boolean)
    .map((d) => [String(d.code || "").toUpperCase(), d])
);

// 3) Build destinations for ALL countries
const out = countries.map((c) => {
  const code = String(c.code || "").toUpperCase();
  const name = c.name;
  const slug = c.slug || slugify(name);
  const region = c.continent || c.region || "Unknown";

  // If you already have a destination for this country, keep it
  const existing = existingByCode.get(code);
  if (existing) return existing;

  // Otherwise create a stub that matches your Destination type
  return {
    id: code,
    name: slug,        // your Destination type uses `name` as slug for URL
    code: code,        // ISO2
    region: region,

    safety: {
      advisoryLevel: "LEVEL1",
      advisorySummary: "Info coming soon.",
      commonScams: [],
      localLaws: [],
      politicalStability: "Info coming soon.",
    },

    health: {
      vaccines: [],
      diseases: [],
      waterSafety: "VARIABLE",
      foodPrecautions: [],
      personalizedTips: [],
    },

    emergency: {
      police: "",
      ambulance: "",
      fire: "",
      embassies: [],
      phrases: [],
    },

    cultural: {
      etiquette: [],
      transportation: [],
      money: [],
      communication: [],
    },

    alerts: [],
  };
});

// 4) Write destinations.json
fs.mkdirSync(path.dirname(destinationsPath), { recursive: true });
fs.writeFileSync(destinationsPath, JSON.stringify(out, null, 2), "utf8");

console.log(`✅ Wrote ${out.length} destinations to ${destinationsPath}`);
