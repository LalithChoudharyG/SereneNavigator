import type { AlertSeverity } from "@/lib/types";

type Props = {
  severity: AlertSeverity;
};

export default function AlertBadge({ severity }: Props) {
  const styles =
    severity === "CRITICAL"
      ? "border border-red-300 bg-red-100 text-red-800"
      : severity === "WARNING"
      ? "border border-[#ffa62b] bg-[#fff3e0] text-[#7c4a03]"
      : "border border-[#82c0cc] bg-[#e7f3f6] text-[#16697a]";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${styles}`}
    >
      {severity}
    </span>
  );
}