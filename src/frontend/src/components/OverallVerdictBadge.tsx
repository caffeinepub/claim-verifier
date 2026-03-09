import { cn } from "@/lib/utils";
import type { OverallVerdict } from "@/utils/verdict";
import { BarChart2, CheckCircle2, Search, Swords, XCircle } from "lucide-react";

interface OverallVerdictBadgeProps {
  verdict: OverallVerdict;
  className?: string;
}

const config: Record<
  OverallVerdict,
  {
    label: string;
    className: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  True: {
    label: "TRUE",
    className: "bg-emerald-100 text-emerald-800 border-emerald-300",
    icon: CheckCircle2,
  },
  False: {
    label: "FALSE",
    className: "bg-red-100 text-red-800 border-red-300",
    icon: XCircle,
  },
  Unverified: {
    label: "UNVERIFIED",
    className: "bg-amber-100 text-amber-800 border-amber-300",
    icon: Search,
  },
  Contested: {
    label: "CONTESTED",
    className: "bg-slate-100 text-slate-700 border-slate-300",
    icon: Swords,
  },
  "Insufficient Data": {
    label: "INSUFFICIENT DATA",
    className: "bg-muted text-muted-foreground border-border",
    icon: BarChart2,
  },
};

export function OverallVerdictBadge({
  verdict,
  className,
}: OverallVerdictBadgeProps) {
  const { label, className: vcn, icon: Icon } = config[verdict];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider border font-body",
        vcn,
        className,
      )}
    >
      <Icon className="w-3 h-3 flex-shrink-0" />
      {label}
    </span>
  );
}
