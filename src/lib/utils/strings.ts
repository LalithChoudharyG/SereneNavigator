export function normalizeName(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/['’]/g, " ")           // ✅ important change
    .replace(/[^a-z0-9\s()-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


export function slugifyForStateGov(input: string): string {
  // Best-effort fallback. Prefer officialUrl from the XML feed when available.
  return normalizeName(input)
    .replace(/[()]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
