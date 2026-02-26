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

function isProbablySlug(s) {
  // lowercase letters/numbers/hyphens only, no spaces
  return typeof s === "string" && /^[a-z0-9-]+$/.test(s) && !s.includes("--");
}

function stubDestination({ code, displayName, slug, region }) {
  return {
    id: code,
    slug,            // ✅ URL slug: "afghanistan"
    name: displayName, // ✅ Display name: "Afghanistan"
    code,            // ISO2
    region,

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
}

function mergeDestination(stub, existing) {
  // Shallow merge top-level + nested sections (preserve existing details)
  return {
    ...stub,
    ...existing,
    // ensure required fields are correct after merge
    id: stub.id,
    code: stub.code,
    slug: stub.slug,
    name: stub.name,
    region: existing?.region ?? stub.region,

    safety: { ...stub.safety, ...(existing?.safety || {}) },
    health: { ...stub.health, ...(existing?.health || {}) },
    emergency: { ...stub.emergency, ...(existing?.emergency || {}) },
    cultural: { ...stub.cultural, ...(existing?.cultural || {}) },
    alerts: Array.isArray(existing?.alerts) ? existing.alerts : stub.alerts,
  };
}

// 1) Load countries
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
  const countryDisplayName = c.name; // e.g., "Afghanistan"
  const countrySlug = c.slug || slugify(countryDisplayName);
  const region = c.continent || c.region || "Unknown";

  const existing = existingByCode.get(code);

  // Compute slug + display name in a migration-friendly way
  let slug = countrySlug;
  let displayName = countryDisplayName;

  if (existing) {
    // If existing already has slug, trust it
    if (typeof existing.slug === "string" && existing.slug.length > 0) {
      slug = existing.slug;
    } else if (typeof existing.name === "string" && existing.name.length > 0) {
      // Old format: existing.name was the slug (like "afghanistan")
      slug = isProbablySlug(existing.name) ? existing.name : slugify(existing.name);
    }

    // If existing.name looks like a slug, replace with proper display name from countries
    // Otherwise keep existing.name (in case you already had real display names)
    if (typeof existing.name === "string" && !isProbablySlug(existing.name)) {
      displayName = existing.name;
    } else {
      displayName = countryDisplayName;
    }

    const stub = stubDestination({ code, displayName, slug, region });
    return mergeDestination(stub, existing);
  }

  // No existing destination → create fresh stub
  return stubDestination({ code, displayName, slug, region });
});

// 4) Write destinations.json
fs.mkdirSync(path.dirname(destinationsPath), { recursive: true });
fs.writeFileSync(destinationsPath, JSON.stringify(out, null, 2), "utf8");

console.log(`✅ Wrote ${out.length} destinations to ${destinationsPath}`);