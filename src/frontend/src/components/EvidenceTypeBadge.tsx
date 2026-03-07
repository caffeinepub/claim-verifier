import { cn } from "@/lib/utils";
import type React from "react";

type EvidenceType = "True" | "False" | "Unverified" | string;

interface EvidenceTypeBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  evidenceType: EvidenceType;
}

function normalizeType(raw: string): "True" | "False" | "Unverified" {
  if (raw === "True") return "True";
  if (raw === "False") return "False";
  return "Unverified";
}

export function EvidenceTypeBadge({
  evidenceType,
  className,
  ...props
}: EvidenceTypeBadgeProps) {
  const type = normalizeType(evidenceType ?? "");

  const styles = {
    True: "bg-green-500/15 text-green-500 border-green-500/30",
    False: "bg-red-500/15 text-red-500 border-red-500/30",
    Unverified: "bg-muted/60 text-muted-foreground border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-body font-medium border",
        styles[type],
        className,
      )}
      {...props}
    >
      {type}
    </span>
  );
}
