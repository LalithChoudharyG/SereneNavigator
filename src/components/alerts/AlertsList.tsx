import Link from "next/link";
import type { Alert } from "@/lib/types";
import { getAlertStatus } from "@/lib/alerts";
import AlertBadge from "@/components/alerts/AlertBadge";

type AlertListItem = Alert & {
  destinationName?: string;
  destinationSlug?: string;
};

type Props = {
  alerts: AlertListItem[];
  showDestination?: boolean;
  emptyMessage?: string;
};

function formatDate(value?: string) {
  if (!value) return null;

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function formatDateRange(alert: Alert) {
  const start = formatDate(alert.startDate);
  const end = formatDate(alert.endDate);

  if (start && end) return `${start} – ${end}`;
  if (start) return `Starts ${start}`;
  if (end) return `Until ${end}`;
  return "No date provided";
}

export default function AlertsList({
  alerts,
  showDestination = false,
  emptyMessage = "No active alerts right now.",
}: Props) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="rounded-xl border border-[#82c0cc] bg-white p-4 text-sm text-[#2c2c2a]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => {
        const status = getAlertStatus(alert);

        return (
          <article
            key={alert.id}
            className="rounded-xl border border-[#82c0cc] bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <AlertBadge severity={alert.severity} />
              <span className="rounded-full border border-[#82c0cc] bg-[#ede7e3] px-2.5 py-1 text-xs font-semibold text-[#16697a]">
                {status}
              </span>
            </div>

            <h3 className="mt-3 text-lg font-bold text-[#16697a]">
              {alert.title}
            </h3>

            {showDestination && alert.destinationName && alert.destinationSlug && (
              <p className="mt-2 text-sm">
                <Link
                  href={`/destination/${encodeURIComponent(alert.destinationSlug)}`}
                  className="font-semibold text-[#16697a] underline underline-offset-4"
                >
                  {alert.destinationName}
                </Link>
              </p>
            )}

            <p className="mt-3 text-sm leading-6 text-[#2c2c2a]">
              {alert.description}
            </p>

            <p className="mt-3 text-xs font-medium text-[#16697a]">
              {formatDateRange(alert)}
            </p>
          </article>
        );
      })}
    </div>
  );
}