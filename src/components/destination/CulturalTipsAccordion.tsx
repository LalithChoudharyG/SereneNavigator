import type { Destination } from "@/lib/types";

type Props = {
  cultural: Destination["cultural"];
};

function TipsList({ items }: { items: string[] }) {
  if (!items || items.length === 0) {
    return <p className="mt-2 text-sm opacity-70">No tips available yet.</p>;
  }

  return (
    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
      {items.map((t, i) => (
        <li key={`${t}-${i}`} className="opacity-90">
          {t}
        </li>
      ))}
    </ul>
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