import type { RestCountryFacts } from "@/lib/types";

// REST Countries: alpha endpoint + fields filtering is widely used in examples.
// (If fields ever changes, remove it and just consume the full payload.)
export async function getRestCountryFacts(iso2: string): Promise<RestCountryFacts | null> {
  const code = iso2.toUpperCase();

  const url =
    `https://restcountries.com/v3.1/alpha/${encodeURIComponent(code)}` +
    `?fields=name,flags,currencies,languages,idd,timezones,capital,latlng,region,subregion`;

  const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 * 30 } }); // 30 days
  if (!res.ok) return null;

  const data = await res.json();
  const c = Array.isArray(data) ? data[0] : data;
  if (!c) return null;

  const currencies =
    c.currencies
      ? Object.entries(c.currencies).map(([code, v]: any) => ({
          code,
          name: v?.name,
          symbol: v?.symbol,
        }))
      : undefined;

    const languages =
        c.languages
            ? (Object.values(c.languages) as unknown[]).filter(
            (v): v is string => typeof v === "string"
            )
        : undefined;


  return {
    name: c?.name?.common,
    flagUrl: c?.flags?.png || c?.flags?.svg,
    currencies,
    languages,
    calling: c?.idd ? { root: c.idd.root, suffixes: c.idd.suffixes } : undefined,
    timezones: c?.timezones,
    capital: c?.capital,
    latlng: Array.isArray(c?.latlng) && c.latlng.length >= 2 ? [c.latlng[0], c.latlng[1]] : null,
    region: c?.region,
    subregion: c?.subregion,
  };
}
