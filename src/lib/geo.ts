export function continentFromRegion(region: string): string {
  const r = region.toLowerCase().trim();

  // Asia buckets
  if (r.includes("asia")) return "Asia";

  // Americas
  if (r.includes("north america")) return "North America";
  if (r.includes("south america")) return "South America";
  if (r.includes("central america")) return "North America"; // optional choice

  // Europe / Africa / Oceania
  if (r.includes("europe")) return "Europe";
  if (r.includes("africa")) return "Africa";
  if (r.includes("oceania") || r.includes("australia")) return "Oceania";

  // Fallback: if region is already a continent-like label
  // (or unknown), just title-case it.
  return region;
}
