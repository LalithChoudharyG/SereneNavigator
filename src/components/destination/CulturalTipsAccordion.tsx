import type { Destination } from "@/lib/types";

type Props = {
  cultural: Destination["cultural"];
};

function TipsList({ items }: { items: string[] }) {
  if (!items || items.length === 0) {
    return (
      <div className="mt-4 rounded-2xl bg-white px-4 py-3">
        <p className="font-body text-sm leading-6 text-[#5b534d]">
          No tips available yet.
        </p>
      </div>
    );
  }

  const groups = new Map<string, string[]>();
  const plain: string[] = [];

  for (const raw of items) {
    const s = String(raw || "").trim();
    if (!s) continue;

    const idx = s.indexOf(":");
    const looksLikeLabel = idx > 0 && idx < 40;

    if (looksLikeLabel) {
      const label = s.slice(0, idx).trim();
      const content = s.slice(idx + 1).trim();

      if (!content) {
        if (!plain.includes(s)) plain.push(s);
        continue;
      }

      const arr = groups.get(label) ?? [];
      if (!arr.includes(content)) arr.push(content);
      groups.set(label, arr);
    } else {
      if (!plain.includes(s)) plain.push(s);
    }
  }

  const orderedLabels = Array.from(groups.keys()).sort((a, b) =>
    a.localeCompare(b)
  );

  return (
    <div className="mt-5 space-y-5">
      {plain.length > 0 && (
        <ul className="space-y-3">
          {plain.map((t, i) => (
            <li
              key={`${t}-${i}`}
              className="font-body rounded-2xl bg-white px-4 py-3 text-sm leading-7 text-[#3f484b]"
            >
              {t}
            </li>
          ))}
        </ul>
      )}

      {orderedLabels.map((label) => {
        const list = groups.get(label) ?? [];

        return (
          <div
            key={label}
            className="rounded-2xl border border-[#16697a]/10 bg-white p-4"
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="font-body inline-flex rounded-full bg-[#ede7e3] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#00505e]">
                {label}
              </span>
              <span className="font-body text-xs font-semibold text-[#5b534d]">
                {list.length} tip{list.length === 1 ? "" : "s"}
              </span>
            </div>

            <ul className="space-y-3">
              {list.map((t, i) => (
                <li
                  key={`${label}-${t}-${i}`}
                  className="font-body rounded-xl bg-[#f9f2ee] px-4 py-3 text-sm leading-7 text-[#3f484b]"
                >
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

function AccordionSection({
  title,
  items,
  defaultOpen = false,
}: {
  title: string;
  items: string[];
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-3xl bg-[#f9f2ee] p-5 transition"
    >
      <summary className="list-none cursor-pointer">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-headline text-xl font-bold text-[#00505e]">
              {title}
            </h3>
            <p className="font-body mt-1 text-sm text-[#5b534d]">
              {items.length} tip{items.length === 1 ? "" : "s"}
            </p>
          </div>

          <span className="font-body inline-flex rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#16697a]">
            View
          </span>
        </div>
      </summary>

      <TipsList items={items} />
    </details>
  );
}

export default function CulturalTipsAccordion({ cultural }: Props) {
  return (
    <div className="space-y-4">
      <AccordionSection
        title="Etiquette"
        items={cultural.etiquette}
        defaultOpen
      />

      <AccordionSection
        title="Transportation"
        items={cultural.transportation}
      />

      <AccordionSection title="Money" items={cultural.money} />

      <AccordionSection
        title="Communication"
        items={cultural.communication}
      />
    </div>
  );
}