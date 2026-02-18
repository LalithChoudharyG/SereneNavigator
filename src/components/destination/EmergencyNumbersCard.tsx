"use client";

import * as React from "react";
import type { EmergencyNumbers } from "@/lib/types";

function formatDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function Badge({ verified }: { verified: boolean }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
        verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800",
      ].join(" ")}
    >
      <span className="text-base leading-none">{verified ? "✅" : "⚠️"}</span>
      {verified ? "Verified" : "Unverified"}
    </span>
  );
}

function NumbersRow({
  label,
  numbers,
}: {
  label: string;
  numbers: string[];
}) {
  const has = numbers?.length > 0;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(numbers.join(", "));
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
      <div className="min-w-0">
        <div className="text-sm font-semibold">{label}</div>
        <div className="mt-1 text-sm text-gray-700">
          {has ? numbers.join(", ") : <span className="text-gray-400">Not available</span>}
        </div>
      </div>

      <button
        type="button"
        onClick={copy}
        disabled={!has}
        className={[
          "shrink-0 rounded-md border px-3 py-1 text-xs font-medium",
          has ? "hover:bg-gray-50" : "cursor-not-allowed opacity-40",
        ].join(" ")}
      >
        Copy
      </button>
    </div>
  );
}

export function EmergencyNumbersCard({ data }: { data?: EmergencyNumbers }) {
  if (!data) {
    return (
      <section className="rounded-xl border p-5">
        <div className="text-lg font-semibold">Emergency numbers</div>
        <p className="mt-2 text-sm text-gray-600">No emergency numbers found for this country.</p>
      </section>
    );
  }

  const updated = formatDate(data.fetchedAt);
  const expires = formatDate(data.expiresAt);

  // Prefer dispatch first if present
  const dispatchFirst = (data.services.dispatch?.length ?? 0) > 0;

  return (
    <section className="rounded-xl border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">Emergency numbers</div>
          <div className="mt-1 text-xs text-gray-500">
            {data.country?.name ? `${data.country.name} • ` : ""}
            Source: <span className="font-medium">{data.source}</span>
          </div>
        </div>

        <Badge verified={data.verified} />
      </div>

      <div className="mt-3 grid gap-3">
        {dispatchFirst && <NumbersRow label="Dispatch (all services)" numbers={data.services.dispatch} />}
        <NumbersRow label="Police" numbers={data.services.police} />
        <NumbersRow label="Ambulance" numbers={data.services.ambulance} />
        <NumbersRow label="Fire" numbers={data.services.fire} />
        {!dispatchFirst && <NumbersRow label="Dispatch (all services)" numbers={data.services.dispatch} />}
      </div>

      <div className="mt-4 space-y-1 text-xs text-gray-500">
        {(updated || expires) && (
          <div>
            {updated ? `Updated: ${updated}` : ""}
            {updated && expires ? " • " : ""}
            {expires ? `Expires: ${expires}` : ""}
          </div>
        )}

        {data.localOnly === true && (
          <div className="text-yellow-700">
            ⚠️ Local numbers only — your SIM/network may affect reachability.
          </div>
        )}

        {data.member112 === true && (
          <div className="text-gray-600">112 supported in this country.</div>
        )}

        {!data.verified && data.disclaimer && (
          <div className="mt-2 rounded-lg bg-yellow-50 p-3 text-yellow-900">
            <div className="font-semibold">Note</div>
            <div className="mt-1">{data.disclaimer}</div>
          </div>
        )}

        {data.verified && (data.verifiedSources?.length ?? 0) > 0 && (
          <div className="mt-2 rounded-lg bg-green-50 p-3 text-green-900">
            <div className="font-semibold">Verified sources</div>
            <ul className="mt-1 list-disc pl-5">
              {data.verifiedSources.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
