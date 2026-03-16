"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import countriesRaw from "@/data/countries.json";
import destinationsRaw from "@/data/destinations.json";
import type { Country, Destination } from "@/lib/types";

export default function DestinationIndex() {
  const countries = countriesRaw as Country[];
  const destinations = destinationsRaw as Destination[];

  const [query, setQuery] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Keeps track of which continents are expanded
  const [openContinents, setOpenContinents] = useState<Record<string, boolean>>({});

  const q = query.trim().toLowerCase();
  const hasQuery = q.length > 0;

  const availableSlugs = useMemo(() => {
    // ✅ supports BOTH shapes:
    // - new: { slug, name }
    // - old: { name is slug }
    return new Set(destinations.map((d: any) => d.slug ?? d.name));
  }, [destinations]);

  const filteredCountries = useMemo(() => {
    return countries.filter((c) => {
      const isReady = availableSlugs.has(c.slug);
      if (onlyAvailable && !isReady) return false;
      if (!q) return true;

      const inName = c.name.toLowerCase().includes(q);
      const inCode = c.code.toLowerCase().includes(q);
      const inAliases = (c.aliases ?? []).some((a) => a.toLowerCase().includes(q));

      return inName || inCode || inAliases;
    });
  }, [countries, availableSlugs, q, onlyAvailable]);

  const filteredSorted = useMemo(() => {
    return [...filteredCountries].sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredCountries]);

  const grouped = useMemo(() => {
    const map: Record<string, Country[]> = {};
    for (const c of filteredCountries) {
      map[c.continent] ??= [];
      map[c.continent].push(c);
    }
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => a.name.localeCompare(b.name));
    }
    return map;
  }, [filteredCountries]);

  const continents = useMemo(() => {
    return Object.keys(grouped).sort((a, b) => a.localeCompare(b));
  }, [grouped]);

  // ✅ Auto-open matching continents when searching (only matters when not using flat list)
  useEffect(() => {
    if (!hasQuery) return;
    setOpenContinents((prev) => {
      const next = { ...prev };
      for (const c of continents) next[c] = true;
      return next;
    });
  }, [hasQuery, continents]);

  const totalShown = filteredCountries.length;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Destinations</h1>
      <p className="mt-2 text-sm opacity-80">
        Browse by any of the 193 UN member countries.
      </p>

      {/* Controls */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="text-sm font-medium" htmlFor="country-search">
            Search
          </label>
          <input
            id="country-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a country name (e.g., Japan) or code (JP)…"
            className="w-full rounded-md border px-3 py-2 text-sm sm:w-[420px]"
          />
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpenContinents({});
            }}
            className="rounded-md border px-3 py-2 text-sm"
          >
            Clear
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
          />
          Show only available countries
        </label>
      </div>

      <div className="mt-3 text-sm opacity-80">
        Showing <strong>{totalShown}</strong>{" "}
        countr{totalShown !== 1 ? "ies" : "y"}
        {onlyAvailable ? " (available only)" : ""}.
      </div>

      {/* ✅ Search mode: show ONLY matching countries */}
      {hasQuery ? (
        <div className="mt-6">
          {filteredSorted.length === 0 ? (
            <div className="rounded-lg border p-4 text-sm opacity-80">
              No results. Try a different search.
            </div>
          ) : (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {filteredSorted.map((c) => {
                const isReady = availableSlugs.has(c.slug);
                return (
                  <li key={c.code} className="rounded-md border px-3 py-2">
                    {isReady ? (
                      <Link
                        href={`/destination/${encodeURIComponent(c.slug)}`}
                        className="underline"
                      >
                        {c.name}
                      </Link>
                    ) : (
                      <span className="opacity-70">{c.name}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : (
        /* ✅ Browse mode: continents */
        <div className="mt-6 space-y-3">
          {continents.length === 0 ? (
            <div className="rounded-lg border p-4 text-sm opacity-80">
              No results. Try a different search.
            </div>
          ) : (
            continents.map((continent) => {
              const list = grouped[continent] ?? [];
              const isOpen = openContinents[continent] ?? false;

              return (
                <details
                  key={continent}
                  className="rounded-lg border p-4"
                  open={isOpen}
                  onToggle={(e) => {
                    const el = e.currentTarget;
                    setOpenContinents((prev) => ({ ...prev, [continent]: el.open }));
                  }}
                >
                  <summary className="cursor-pointer text-lg font-medium">
                    {continent} <span className="opacity-70">({list.length})</span>
                  </summary>

                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {list.map((c) => {
                      const isReady = availableSlugs.has(c.slug);
                      return (
                        <li key={c.code} className="rounded-md border px-3 py-2">
                          {isReady ? (
                            <Link
                              href={`/destination/${encodeURIComponent(c.slug)}`}
                              className="underline"
                            >
                              {c.name}
                            </Link>
                          ) : (
                            <span className="opacity-70">{c.name}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </details>
              );
            })
          )}
        </div>
      )}
    </main>
  );
}