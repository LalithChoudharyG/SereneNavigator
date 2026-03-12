import type { Destination } from "@/lib/types";

type Props = {
  cultural: Destination["cultural"];
};

function TipsList({ items }: { items: string[] }) {
  if (!items || items.length === 0) {
    return <p className="mt-2 text-sm opacity-70">No tips available yet.</p>;
  }

  // Group "Heading: tip text" into { heading -> [tips...] }
  const groups = new Map<string, string[]>();
  const plain: string[] = [];

  for (const raw of items) {
    const s = String(raw || "").trim();
    if (!s) continue;

    const idx = s.indexOf(":");
    // treat as "heading: content" only if heading is short-ish and looks like a label
    const looksLikeLabel = idx > 0 && idx < 40;

    if (looksLikeLabel) {
      const label = s.slice(0, idx).trim();
      const content = s.slice(idx + 1).trim();
      if (!content) {
        plain.push(s);
        continue;
      }
      const arr = groups.get(label) ?? [];
      // dedupe within the same label
      if (!arr.includes(content)) arr.push(content);
      groups.set(label, arr);
    } else {
      if (!plain.includes(s)) plain.push(s);
    }
  }

  const orderedLabels = Array.from(groups.keys()).sort((a, b) => a.localeCompare(b));

  return (
    <div className="mt-2 space-y-4">
      {/* Plain bullets (no label) */}
      {plain.length > 0 && (
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {plain.map((t, i) => (
            <li key={`${t}-${i}`} className="opacity-90">
              {t}
            </li>
          ))}
        </ul>
      )}

      {/* Grouped sections */}
      {orderedLabels.map((label) => {
        const list = groups.get(label) ?? [];
        return (
          <div key={label}>
            <div className="text-sm font-semibold">{label}</div>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
              {list.map((t, i) => (
                <li key={`${label}-${t}-${i}`} className="opacity-90">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export default function CulturalTipsAccordion({ cultural }: Props) {
  return (
    <div className="mt-3 space-y-3">
      <details className="rounded-lg border p-4">
        <summary className="cursor-pointer text-sm font-medium">
          Etiquette <span className="opacity-70">({cultural.etiquette.length})</span>
        </summary>
        <TipsList items={cultural.etiquette} />
      </details>

      <details className="rounded-lg border p-4">
        <summary className="cursor-pointer text-sm font-medium">
          Transportation <span className="opacity-70">({cultural.transportation.length})</span>
        </summary>
        <TipsList items={cultural.transportation} />
      </details>

      <details className="rounded-lg border p-4">
        <summary className="cursor-pointer text-sm font-medium">
          Money <span className="opacity-70">({cultural.money.length})</span>
        </summary>
        <TipsList items={cultural.money} />
      </details>

      <details className="rounded-lg border p-4">
        <summary className="cursor-pointer text-sm font-medium">
          Communication <span className="opacity-70">({cultural.communication.length})</span>
        </summary>
        <TipsList items={cultural.communication} />
      </details>
    </div>
  );
}