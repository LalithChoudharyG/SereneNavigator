import { load } from "cheerio";
import { unstable_cache } from "next/cache";
import type { AlertSeverity } from "@/lib/types";
import { getDestinationBySlug } from "@/lib/data";

type LiveAlert = {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  source: "CA_TRAVEL_GC" | "US_STATE_DOS";
  sourceUrl: string;
  updatedAt?: string;
  region?: string;
};

function mapCanadaSeverity(text: string): AlertSeverity {
  const t = text.toLowerCase();

  if (t.includes("avoid all travel")) return "CRITICAL";
  if (t.includes("avoid non-essential travel")) return "WARNING";
  if (t.includes("exercise a high degree of caution")) return "WARNING";
  return "INFO";
}

function mapUsSeverity(levelText: string): AlertSeverity {
  const t = levelText.toLowerCase();

  if (t.includes("level 4")) return "CRITICAL";
  if (t.includes("level 3")) return "WARNING";
  return "INFO";
}

async function fetchHtml(url: string) {
  const res = await fetch(url, {
    next: { revalidate: 3600 },
    headers: {
      "user-agent": "TravelSafetyHealthAdvisor/1.0",
      "accept-language": "en-US,en;q=0.9",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }

  return res.text();
}

function parseCanadaAlerts(html: string, url: string, code: string) {
  const $ = load(html);
  const alerts: LiveAlert[] = [];

  // country-level headline usually appears as h3 text like:
  // "India - Exercise a high degree of caution"
  const mainHeadings = $("h3")
    .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
    .get();

  for (const text of mainHeadings) {
    if (!text.includes(" - ")) continue;

    const [left, right] = text.split(/\s-\s(.+)/).filter(Boolean);
    if (!left || !right) continue;

    const severity = mapCanadaSeverity(text);
    alerts.push({
      id: `${code}-main-${alerts.length + 1}`,
      title: right,
      description: `${left}: ${right}`,
      severity,
      source: "CA_TRAVEL_GC",
      sourceUrl: url,
    });
  }

  // regional warnings often appear as additional h3 blocks followed by lists/paragraphs
  $("h3").each((_, el) => {
    const heading = $(el).text().replace(/\s+/g, " ").trim();
    if (!heading.includes(" - ")) return;

    const regionBlock = $(el).nextUntil("h2, h3").text().replace(/\s+/g, " ").trim();
    if (!regionBlock) return;

    const severity = mapCanadaSeverity(heading);
    alerts.push({
      id: `${code}-regional-${alerts.length + 1}`,
      title: heading,
      description: regionBlock,
      severity,
      source: "CA_TRAVEL_GC",
      sourceUrl: url,
      region: heading.split(" - ")[0],
    });
  });

  return alerts.slice(0, 10);
}

function parseUsCanadaAlert(html: string, url: string, code: string) {
  const $ = load(html);

  const levelText =
    $("h3")
      .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
      .get()
      .find((t) => /^Level\s[1-4]/i.test(t)) || "";

  const issuedLine =
    $("body")
      .text()
      .match(/Date issued:\s*([A-Za-z]+\s+\d{1,2},\s+\d{4})/i)?.[1] || undefined;

  if (!levelText) return [];

  return [
    {
      id: `${code}-us-main`,
      title: levelText,
      description: `Current U.S. Department of State travel advisory for Canada.`,
      severity: mapUsSeverity(levelText),
      source: "US_STATE_DOS",
      sourceUrl: url,
      updatedAt: issuedLine,
    },
  ];
}

export const getLiveAlertsBySlug = unstable_cache(
  async (slug: string) => {
    const destination = getDestinationBySlug(slug);
    if (!destination) return [];

    if (destination.code === "CA") {
      const url =
        "https://travel.state.gov/en/international-travel/travel-advisories/canada.html";
      const html = await fetchHtml(url);
      return parseUsCanadaAlert(html, url, destination.code);
    }

    const url = `https://travel.gc.ca/destinations/${destination.slug}`;
    const html = await fetchHtml(url);
    return parseCanadaAlerts(html, url, destination.code);
  },
  ["live-alerts-by-slug"],
  { revalidate: 3600 }
);