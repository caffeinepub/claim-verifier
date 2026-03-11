import { formatVerdictPercent } from "@/utils/time";
import { motion } from "motion/react";

interface VerdictBarProps {
  trueCount: bigint;
  falseCount: bigint;
  unverifiedCount: bigint;
  compact?: boolean;
  /** Optional breakdown — direct votes vs evidence-weighted contribution */
  breakdown?: {
    trueDirect: bigint;
    trueFromEvidence: bigint;
    falseDirect: bigint;
    falseFromEvidence: bigint;
    unverifiedDirect: bigint;
    unverifiedFromEvidence: bigint;
  };
}

/** Formats a breakdown line: "42 direct + 90 from evidence" or "42 direct − 6 from evidence" */
function formatBreakdown(direct: bigint, fromEvidence: bigint): string | null {
  if (fromEvidence === 0n) return null;
  const sign = fromEvidence >= 0n ? "+" : "−";
  const absEvidence = fromEvidence < 0n ? -fromEvidence : fromEvidence;
  return `${Number(direct)} direct ${sign} ${Number(absEvidence)} from evidence`;
}

export function VerdictBar({
  trueCount,
  falseCount,
  unverifiedCount,
  compact = false,
  breakdown,
}: VerdictBarProps) {
  // Values are pre-floored by callers (evidence floor at 0), safe to use directly
  const total = trueCount + falseCount + unverifiedCount;

  const trueP = formatVerdictPercent(trueCount, total);
  const falseP = formatVerdictPercent(falseCount, total);
  const unverP = formatVerdictPercent(unverifiedCount, total);

  const trueBreakdown = breakdown
    ? formatBreakdown(breakdown.trueDirect, breakdown.trueFromEvidence)
    : null;
  const falseBreakdown = breakdown
    ? formatBreakdown(breakdown.falseDirect, breakdown.falseFromEvidence)
    : null;
  const unverBreakdown = breakdown
    ? formatBreakdown(
        breakdown.unverifiedDirect,
        breakdown.unverifiedFromEvidence,
      )
    : null;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-verdict-true inline-block" />
          <span className="text-xs font-body text-muted-foreground">
            <span className="verdict-true font-semibold">
              {Number(trueCount)}
            </span>{" "}
            True
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-verdict-false inline-block" />
          <span className="text-xs font-body text-muted-foreground">
            <span className="verdict-false font-semibold">
              {Number(falseCount)}
            </span>{" "}
            False
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-verdict-unverified inline-block" />
          <span className="text-xs font-body text-muted-foreground">
            <span className="verdict-unverified font-semibold">
              {Number(unverifiedCount)}
            </span>{" "}
            Unverified
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex h-3 overflow-hidden rounded-full bg-muted">
        {trueP > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${trueP}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-verdict-true h-full"
          />
        )}
        {falseP > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${falseP}%` }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="bg-verdict-false h-full"
          />
        )}
        {unverP > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${unverP}%` }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="bg-verdict-unverified h-full"
          />
        )}
      </div>
      <div className="flex flex-wrap items-start justify-between gap-3 text-sm">
        {/* True */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-verdict-true inline-block flex-shrink-0" />
            <span className="text-muted-foreground">
              True —{" "}
              <span className="verdict-true font-semibold">
                {Number(trueCount)} vote{trueCount !== 1n ? "s" : ""} ({trueP}%)
              </span>
            </span>
          </div>
          {trueBreakdown && (
            <p className="text-xs text-muted-foreground/60 font-body pl-[18px]">
              {trueBreakdown}
            </p>
          )}
        </div>

        {/* False */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-verdict-false inline-block flex-shrink-0" />
            <span className="text-muted-foreground">
              False —{" "}
              <span className="verdict-false font-semibold">
                {Number(falseCount)} vote{falseCount !== 1n ? "s" : ""} (
                {falseP}%)
              </span>
            </span>
          </div>
          {falseBreakdown && (
            <p className="text-xs text-muted-foreground/60 font-body pl-[18px]">
              {falseBreakdown}
            </p>
          )}
        </div>

        {/* Unverified */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-verdict-unverified inline-block flex-shrink-0" />
            <span className="text-muted-foreground">
              Unverified —{" "}
              <span className="verdict-unverified font-semibold">
                {Number(unverifiedCount)} vote
                {unverifiedCount !== 1n ? "s" : ""} ({unverP}%)
              </span>
            </span>
          </div>
          {unverBreakdown && (
            <p className="text-xs text-muted-foreground/60 font-body pl-[18px]">
              {unverBreakdown}
            </p>
          )}
        </div>
      </div>
      {total === 0n && (
        <p className="text-xs text-muted-foreground text-center italic">
          No votes yet — be the first to weigh in
        </p>
      )}
    </div>
  );
}
