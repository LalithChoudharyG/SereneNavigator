"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export type DestinationOption = {
  name: string;
  slug: string;
  country?: string;
  code?: string;
  region?: string;
};

type Props = {
  destinations: DestinationOption[];
  placeholder?: string;
  maxResults?: number;
  minChars?: number;
  className?: string;
  onSelect?: (dest: DestinationOption) => void;
};

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

export default function DestinationSearch({
  destinations,
  placeholder = "Search a destination...",
  maxResults = 8,
  minChars = 2,
  className,
  onSelect,
}: Props) {
  const router = useRouter();

  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const [error, setError] = React.useState("");

  const debouncedQuery = useDebouncedValue(query, 250);

  const listboxId = React.useId();
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  const normalized = debouncedQuery.trim().toLowerCase();

  const results = React.useMemo(() => {
    if (normalized.length < minChars) return [];

    return destinations
      .filter((d) => {
        const hay =
          `${d.name} ${d.country ?? ""} ${d.code ?? ""} ${d.region ?? ""}`.toLowerCase();
        return hay.includes(normalized);
      })
      .slice(0, maxResults);
  }, [destinations, normalized, minChars, maxResults]);

  React.useEffect(() => {
    if (query.trim().length >= minChars) setOpen(true);
    else setOpen(false);

    setActiveIndex(-1);
    setError("");
  }, [query, minChars]);

  React.useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      const node = rootRef.current;
      if (!node) return;
      if (!node.contains(e.target as Node)) setOpen(false);
    }

    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  function optionId(i: number) {
    return `${listboxId}-opt-${i}`;
  }

  function navigateTo(dest: DestinationOption) {
    if (!dest.slug) {
      setError("This destination is missing a slug.");
      return;
    }

    onSelect?.(dest);
    setOpen(false);
    setError("");
    router.push(`/destination/${encodeURIComponent(dest.slug)}`);
  }

  function commitSelection() {
    if (results.length === 0) {
      setError(normalized.length >= minChars ? "No matching destination found." : "");
      return;
    }

    const idx = activeIndex >= 0 ? activeIndex : 0;
    navigateTo(results[idx]);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) setOpen(true);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length === 0) return;
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length === 0) return;
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      commitSelection();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  const showDropdown = open && query.trim().length >= minChars;

  return (
    <div ref={rootRef} className={className}>
      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= minChars) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
          aria-label="Destination search"
          className="w-full rounded-md border border-[#82c0cc] bg-white px-4 py-3 text-sm text-[#2c2c2a] placeholder:text-[#16697a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#489fb5]"
        />

        {showDropdown && (
          <div className="absolute z-50 mt-2 w-full rounded-md border border-[#82c0cc] bg-white shadow-lg">
            <ul id={listboxId} role="listbox" className="max-h-80 overflow-auto py-1">
              {results.length === 0 ? (
                <li className="px-4 py-3 text-sm text-[#2c2c2a]">
                  No results found.
                </li>
              ) : (
                results.map((d, i) => (
                  <li
                    key={`${d.slug}-${i}`}
                    id={optionId(i)}
                    role="option"
                    aria-selected={i === activeIndex}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      navigateTo(d);
                    }}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`cursor-pointer px-4 py-3 text-sm ${
                      i === activeIndex
                        ? "bg-[#ede7e3] text-[#16697a]"
                        : "bg-white text-[#2c2c2a]"
                    }`}
                  >
                    <div className="font-semibold">{d.name}</div>
                    <div className="text-xs text-[#16697a]">
                      {[d.country, d.region].filter(Boolean).join(" • ")}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm font-medium text-red-700">{error}</p>}
    </div>
  );
}