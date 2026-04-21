import type { Alert, AlertSeverity, Destination } from "@/lib/types";

export type AlertWithDestination = Alert & {
  destinationName: string;
  destinationSlug: string;
  destinationCode: string;
};

const severityRank: Record<AlertSeverity, number> = {
  CRITICAL: 3,
  WARNING: 2,
  INFO: 1,
};

function toDateValue(value?: string) {
  if (!value) return 0;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

export function getAlertStatus(alert: Alert, now = new Date()) {
  const nowMs = now.getTime();
  const startMs = toDateValue(alert.startDate);
  const endMs = toDateValue(alert.endDate);

  if (startMs && startMs > nowMs) return "Scheduled";
  if (endMs && endMs < nowMs) return "Ended";
  return "Active";
}

export function isAlertActive(alert: Alert, now = new Date()) {
  return getAlertStatus(alert, now) === "Active";
}

export function sortAlerts<T extends Alert>(alerts: T[], now = new Date()) {
  const statusRank = {
    Active: 3,
    Scheduled: 2,
    Ended: 1,
  } as const;

  return [...alerts].sort((a, b) => {
    const aStatus = getAlertStatus(a, now);
    const bStatus = getAlertStatus(b, now);

    if (statusRank[aStatus] !== statusRank[bStatus]) {
      return statusRank[bStatus] - statusRank[aStatus];
    }

    if (severityRank[a.severity] !== severityRank[b.severity]) {
      return severityRank[b.severity] - severityRank[a.severity];
    }

    const aDate = Math.max(toDateValue(a.startDate), toDateValue(a.endDate));
    const bDate = Math.max(toDateValue(b.startDate), toDateValue(b.endDate));

    return bDate - aDate;
  });
}

export function getRecentAlerts(
  destinations: Destination[],
  options?: { limit?: number; activeOnly?: boolean }
) {
  const limit = options?.limit ?? 6;
  const activeOnly = options?.activeOnly ?? true;

  const flattened: AlertWithDestination[] = destinations.flatMap((destination) =>
    (destination.alerts ?? []).map((alert) => ({
      ...alert,
      destinationName: destination.name,
      destinationSlug: destination.slug,
      destinationCode: destination.code,
    }))
  );

  const filtered = activeOnly
    ? flattened.filter((alert) => isAlertActive(alert))
    : flattened;

  return sortAlerts(filtered).slice(0, limit);
}