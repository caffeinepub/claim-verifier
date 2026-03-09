import { cn } from "@/lib/utils";
import type { OverallVerdict } from "@/utils/verdict";
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Scale,
  XCircle,
} from "lucide-react";

interface OverallVerdictBannerProps {
  verdict: OverallVerdict;
  className?: string;
}

const config: Record<
  OverallVerdict,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    bannerClass: string;
    iconClass: string;
    labelClass: string;
  }
> = {
  True: {
    label: "TRUE",
    icon: CheckCircle2,
    bannerClass: "bg-emerald-50 border-emerald-200",
    iconClass: "text-emerald-600",
    labelClass: "text-emerald-800",
  },
  False: {
    label: "FALSE",
    icon: XCircle,
    bannerClass: "bg-red-50 border-red-200",
    iconClass: "text-red-600",
    labelClass: "text-red-800",
  },
  Unverified: {
    label: "UNVERIFIED",
    icon: HelpCircle,
    bannerClass: "bg-amber-50 border-amber-200",
    iconClass: "text-amber-600",
    labelClass: "text-amber-800",
  },
  Contested: {
    label: "CONTESTED",
    icon: Scale,
    bannerClass: "bg-slate-50 border-slate-200",
    iconClass: "text-slate-600",
    labelClass: "text-slate-800",
  },
  "Insufficient Data": {
    label: "INSUFFICIENT DATA",
    icon: AlertCircle,
    bannerClass: "bg-muted border-border",
    iconClass: "text-muted-foreground",
    labelClass: "text-muted-foreground",
  },
};

export function OverallVerdictBanner({
  verdict,
  className,
}: OverallVerdictBannerProps) {
  const {
    label,
    icon: Icon,
    bannerClass,
    iconClass,
    labelClass,
  } = config[verdict];

  return (
    <div
      className={cn(
        "w-full rounded-xl border-2 px-6 py-5 flex items-center gap-4",
        bannerClass,
        className,
      )}
    >
      <Icon className={cn("w-10 h-10 flex-shrink-0", iconClass)} />
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5 font-body">
          Community Verdict
        </p>
        <p
          className={cn(
            "text-3xl font-display font-black tracking-tight",
            labelClass,
          )}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
