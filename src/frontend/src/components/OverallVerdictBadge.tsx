import { cn } from "@/lib/utils";
import type { OverallVerdict } from "@/utils/verdict";

interface OverallVerdictBadgeProps {
  verdict: OverallVerdict;
  className?: string;
}

const config: Record<OverallVerdict, { label: string; className: string }> = {
  True: {
    label: "TRUE",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  False: {
    label: "FALSE",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  Unverified: {
    label: "UNVERIFIED",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  Contested: {
    label: "CONTESTED",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  "Insufficient Data": {
    label: "INSUFFICIENT DATA",
    className: "bg-muted text-muted-foreground border-border text-[10px]",
  },
};

export function OverallVerdictBadge({
  verdict,
  className,
}: OverallVerdictBadgeProps) {
  const { label, className: vcn } = config[verdict];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wider border font-body",
        vcn,
        className,
      )}
    >
      {label}
    </span>
  );
}
