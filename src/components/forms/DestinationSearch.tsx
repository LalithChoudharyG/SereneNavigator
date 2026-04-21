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
  const normalized = debouncedQuery.trim().toLowerCase();

  const listboxId = React.useId();
  const rootRef = React.useRef<HTMLDivElement | null>(null);

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
      setError(
        normalized.length >= minChars ? "No matching destination found." : ""
      );
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
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6f797c]"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </span>

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
          aria-activedescendant={
            activeIndex >= 0 ? optionId(activeIndex) : undefined
          }
          aria-label="Destination search"
          className="font-body w-full rounded-full border border-[#16697a]/10 bg-[#ede7e3] px-11 py-3 text-sm font-medium text-[#1d1b19] placeholder:text-[#6f797c] shadow-sm transition focus:border-[#16697a]/20 focus:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#489fb5]/35"
        />

        {showDropdown && (
          <div className="absolute z-50 mt-3 w-full overflow-hidden rounded-3xl bg-white shadow-[0_12px_32px_rgba(29,27,25,0.06)]">
            <ul
              id={listboxId}
              role="listbox"
              className="max-h-80 overflow-auto p-2"
            >
              {results.length === 0 ? (
                <li className="font-body px-4 py-3 text-sm text-[#3f484b]">
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
                    className={[
                      "cursor-pointer rounded-2xl px-4 py-3 transition",
                      i === activeIndex
                        ? "bg-[#f3ede9] text-[#00505e]"
                        : "bg-white text-[#1d1b19]",
                    ].join(" ")}
                  >
                    <div className="font-body font-semibold">{d.name}</div>
                    <div className="font-body mt-1 text-xs text-[#6f797c]">
                      {[d.country, d.region].filter(Boolean).join(" • ")}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      {error && (
        <p className="font-body mt-2 text-sm font-medium text-[#93000a]">
          {error}
        </p>
      )}
    </div>
  );
}