"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export type DestinationOption = {
  name: string;
  slug: string; // used in /destination/[name]
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
  onSelect?: (dest: DestinationOption) => void; // optional hook for analytics etc.
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
  placeholder = "Search a destination…",
  maxResults = 8,
  minChars = 2,
  className,
  onSelect,
}: Props) {
  const router = useRouter();

  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const [error, setError] = React.useState<string>("");

  const debouncedQuery = useDebouncedValue(query, 250);

  const listboxId = React.useId();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const normalized = debouncedQuery.trim().toLowerCase();

  const results = React.useMemo(() => {
    if (normalized.length < minChars) return [];
    const filtered = destinations.filter((d) => {
      const hay = `${d.name} ${d.country ?? ""} ${d.code ?? ""} ${d.region ?? ""}`.toLowerCase();
      return hay.includes(normalized);
    });
    return filtered.slice(0, maxResults);
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
  router.push(`/destination/${encodeURIComponent(dest.slug)}`); // ✅ slug-only routing
}

  function commitSelection() {
    if (results.length === 0) {
      setError(normalized.length >= minChars ? "No matching destination." : "");
      return;
    }
    const idx = activeIndex >= 0 ? activeIndex : 0;
    const selected = results[idx];
    navigateTo(selected);
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
          ref={inputRef}
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
          className="w-full rounded-md border px-3 py-2 outline-none focus:ring"
        />

        {showDropdown && (
          <div className="absolute z-50 mt-2 w-full rounded-md border bg-white shadow">
            <ul id={listboxId} role="listbox" className="max-h-80 overflow-auto py-1">
              {results.length === 0 ? (
                <li className="px-3 py-2 text-sm opacity-70">No results</li>
              ) : (
                results.map((d, i) => (
                  <li
                    key={`${d.slug}-${i}`}
                    id={optionId(i)}
                    role="option"
                    aria-selected={i === activeIndex}
                    // mousedown so it selects before input blurs
                    onMouseDown={(e) => {
                      e.preventDefault();
                      navigateTo(d);
                    }}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={[
                      "cursor-pointer px-3 py-2 text-sm",
                      i === activeIndex ? "bg-black/5" : "",
                    ].join(" ")}
                  >
                    <div className="font-medium">{d.name}</div>
                    <div className="opacity-70">
                      {[d.country, d.region].filter(Boolean).join(" • ")}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </div>
  );
}