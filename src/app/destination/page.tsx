"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import countriesRaw from "@/data/countries.json";
import destinationsRaw from "@/data/destinations.json";
import type { Country, Destination } from "@/lib/types";

export default function DestinationIndexPage() {
  const countries = countriesRaw as Country[];
  const destinations = destinationsRaw as Destination[];

  const [query, setQuery] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [openContinents, setOpenContinents] = useState<Record<string, boolean>>(
    {}
  );

  const availableSlugs = useMemo(() => {
    return new Set(destinations.map((d) => d.slug ?? d.name));
  }, [destinations]);

  const filteredCountries = useMemo(() => {
    const q = query.trim().toLowerCase();

    return countries.filter((c) => {
      const isReady = availableSlugs.has(c.slug);
      if (onlyAvailable && !isReady) return false;
      if (!q) return true;

      const inName = c.name.toLowerCase().includes(q);
      const inCode = c.code.toLowerCase().includes(q);
      const inAliases = (c.aliases ?? []).some((a) =>
        a.toLowerCase().includes(q)
      );

      return inName || inCode || inAliases;
    });
  }, [countries, availableSlugs, query, onlyAvailable]);

  const grouped = useMemo(() => {
    const map: Record<string, Country[]> = {};
    for (const c of filteredCountries) {
      map[c.continent] ??= [];
      map[c.continent].push(c);
    }

    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.name.localeCompare(b.name));
    }

    return map;
  }, [filteredCountries]);

  const continents = useMemo(() => {
    return Object.keys(grouped).sort((a, b) => a.localeCompare(b));
  }, [grouped]);

  useEffect(() => {
    const q = query.trim();
    if (!q) return;

    setOpenContinents((prev) => {
      const next = { ...prev };
      for (const continent of continents) next[continent] = true;
      return next;
    });
  }, [query, continents]);

  const totalShown = filteredCountries.length;
  const totalAvailable = countries.filter((c) => availableSlugs.has(c.slug)).length;

  return (
    <main id="main-content" className="bg-[#fef8f4] text-[#1d1b19]">
      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-8 lg:py-16">
        <div className="max-w-3xl">
          <span className="font-body inline-flex rounded-full bg-[#93e6fe]/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#00687b]">
            Explore destinations
          </span>

          <h1 className="font-headline mt-6 text-4xl font-extrabold leading-tight tracking-[-0.03em] text-[#00505e] sm:text-5xl">
            Browse destination guidance by country.
          </h1>

          <p className="font-body mt-5 max-w-2xl text-lg leading-8 text-[#3f484b]">
            Search by country name, code, or alias, then open a destination page
            to review safety, health, emergency, cultural, and alert information.
          </p>
        </div>

        <div className="mt-10 rounded-[1.75rem] bg-white p-6 shadow-[0_12px_32px_rgba(29,27,25,0.06)] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <label
                htmlFor="country-search"
                className="font-body block text-sm font-bold text-[#00505e]"
              >
                Search destinations
              </label>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  id="country-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a country name, code, or alias..."
                  className="font-body w-full rounded-full border border-[#16697a]/10 bg-[#ede7e3] px-5 py-3 text-sm text-[#1d1b19] placeholder:text-[#3f484b] focus:border-[#16697a]/20 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#489fb5]/35"
                />

                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setOpenContinents({});
                  }}
                  className="font-body inline-flex items-center justify-center rounded-full bg-[#e7e1dd] px-5 py-3 text-sm font-bold text-[#00505e] transition hover:bg-[#dfd9d5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#489fb5]/35"
                >
                  Clear
                </button>
              </div>
            </div>

            <label className="font-body inline-flex items-center gap-3 text-sm font-semibold text-[#3f484b]">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="h-4 w-4 rounded border-[#16697a]/20 text-[#16697a] focus:ring-[#489fb5]"
              />
              Show only available destinations
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="font-body inline-flex rounded-full bg-[#f3ede9] px-4 py-2 text-sm font-semibold text-[#00505e]">
              Showing {totalShown} countr{totalShown === 1 ? "y" : "ies"}
            </span>

            <span className="font-body inline-flex rounded-full bg-[#ede7e3] px-4 py-2 text-sm font-semibold text-[#3f484b]">
              {totalAvailable} available destinations
            </span>
          </div>
        </div>

        <div className="mt-10 space-y-4">
          {continents.length === 0 ? (
            <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_12px_32px_rgba(29,27,25,0.06)]">
              <h2 className="font-headline text-xl font-bold text-[#00505e]">
                No results found
              </h2>
              <p className="font-body mt-3 text-sm leading-7 text-[#3f484b]">
                Try a different country name, code, or alias.
              </p>
            </div>
          ) : (
            continents.map((continent) => {
              const list = grouped[continent] ?? [];
              const isOpen = openContinents[continent] ?? false;

              return (
                <details
                  key={continent}
                  className="rounded-[1.75rem] bg-white p-6 shadow-[0_12px_32px_rgba(29,27,25,0.06)]"
                  open={isOpen}
                  onToggle={(e) => {
                    const el = e.currentTarget;
                    setOpenContinents((prev) => ({
                      ...prev,
                      [continent]: el.open,
                    }));
                  }}
                >
                  <summary className="cursor-pointer list-none">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="font-headline text-2xl font-bold text-[#00505e]">
                          {continent}
                        </h2>
                        <p className="font-body mt-1 text-sm text-[#3f484b]">
                          {list.length} countr{list.length === 1 ? "y" : "ies"}
                        </p>
                      </div>

                      <span className="font-body inline-flex rounded-full bg-[#ede7e3] px-4 py-2 text-sm font-semibold text-[#00505e]">
                        {isOpen ? "Hide" : "Show"}
                      </span>
                    </div>
                  </summary>

                  <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((c) => {
                      const isReady = availableSlugs.has(c.slug);

                      return (
                        <li key={c.code}>
                          {isReady ? (
                            <Link
                              href={`/destination/${c.slug}`}
                              className="block rounded-2xl bg-[#f9f2ee] px-4 py-4 transition hover:bg-[#ede7e3] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#489fb5]/35"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="font-headline text-lg font-bold text-[#00505e]">
                                    {c.name}
                                  </div>
                                  <div className="font-body mt-1 text-xs uppercase tracking-[0.14em] text-[#3f484b]">
                                    {c.code}
                                  </div>
                                </div>

                                <span className="font-body rounded-full bg-white px-3 py-1 text-xs font-bold text-[#16697a]">
                                  Open
                                </span>
                              </div>
                            </Link>
                          ) : (
                            <div className="rounded-2xl bg-[#f3ede9] px-4 py-4">
                              <div className="font-headline text-lg font-bold text-[#00505e]">
                                {c.name}
                              </div>
                              <div className="font-body mt-1 text-xs uppercase tracking-[0.14em] text-[#3f484b]">
                                {c.code}
                              </div>
                              <div className="font-body mt-3 text-xs font-semibold text-[#5b534d]">
                                Coming soon
                              </div>
                            </div>
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
      </section>
    </main>
  );
}