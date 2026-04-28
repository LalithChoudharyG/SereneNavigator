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

function statusStyles(status: string) {
  if (status === "Active") {
    return "bg-[#ede7e3] text-[#00505e]";
  }
  if (status === "Scheduled") {
    return "bg-[#93e6fe]/30 text-[#00687b]";
  }
  return "bg-[#f3ede9] text-[#5b534d]";
}

export default function AlertsList({
  alerts,
  showDestination = false,
  emptyMessage = "No active alerts right now.",
}: Props) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="rounded-[1.5rem] bg-[#f9f2ee] p-5">
        <h3 className="font-headline text-lg font-bold text-[#00505e]">
          No alerts to show
        </h3>
        <p className="font-body mt-2 text-sm leading-7 text-[#3f484b]">
          {emptyMessage}
        </p>
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
            className="rounded-[1.5rem] bg-white p-5 shadow-[0_12px_32px_rgba(29,27,25,0.06)] sm:p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <AlertBadge severity={alert.severity} />

                <span
                  className={`font-body inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${statusStyles(
                    status
                  )}`}
                >
                  {status}
                </span>
              </div>

              <p className="font-body text-xs font-semibold uppercase tracking-[0.14em] text-[#5b534d]">
                {formatDateRange(alert)}
              </p>
            </div>

            <h3 className="font-headline mt-4 text-xl font-bold leading-snug text-[#00505e]">
              {alert.title}
            </h3>

            {showDestination &&
              alert.destinationName &&
              alert.destinationSlug && (
                <div className="mt-3">
                  <Link
                    href={`/destination/${encodeURIComponent(
                      alert.destinationSlug
                    )}`}
                    className="font-body inline-flex rounded-full bg-[#ede7e3] px-3 py-1.5 text-sm font-semibold text-[#00505e] transition hover:bg-[#e7e1dd] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#489fb5]/35"
                  >
                    {alert.destinationName}
                  </Link>
                </div>
              )}

            <p className="font-body mt-4 text-sm leading-7 text-[#3f484b]">
              {alert.description}
            </p>
          </article>
        );
      })}
    </div>
  );
}