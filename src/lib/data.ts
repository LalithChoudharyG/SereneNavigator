import destinationsRaw from "@/data/destinations.json";
import countriesRaw from "@/data/countries.json";
import type { Country, Destination } from "@/lib/types";

export const destinations = destinationsRaw as Destination[];
export const countries = countriesRaw as Country[];

export function getDestinationBySlug(slug: string) {
  return destinations.find((d) => d.name === slug);
}

export function getCountryByCode(code: string) {
  return countries.find((c) => c.code === code);
}
