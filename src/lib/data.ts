import destinationsRaw from "@/data/destinations.json";
import countriesRaw from "@/data/countries.json";
import type { Country, Destination } from "@/lib/types";

export const destinations = destinationsRaw as Destination[];
export const countries = countriesRaw as Country[];

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function getDestinationBySlug(slug: string) {
  const s = safeDecode(slug);
  return destinations.find((d) => d.slug === s);
}

export function getCountryByCode(code: string) {
  return countries.find((c) => c.code === code);
}