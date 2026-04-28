import type { AlertSeverity } from "@/lib/types";

type Props = {
  severity: AlertSeverity;
};

function badgeStyles(severity: AlertSeverity) {
  if (severity === "CRITICAL") {
    return "bg-[#ffdad6] text-[#93000a]";
  }

  if (severity === "WARNING") {
    return "bg-[#ffddba] text-[#693f00]";
  }

  return "bg-[#93e6fe]/40 text-[#00687b]";
}

export default function AlertBadge({ severity }: Props) {
  return (
    <span
      className={`font-body inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${badgeStyles(
        severity
      )}`}
    >
      {severity}
    </span>
  );
}