import { formatVerdictPercent } from "@/utils/time";
import { motion } from "motion/react";

interface VerdictBarProps {
  trueCount: bigint;
  falseCount: bigint;
  unverifiedCount: bigint;
  compact?: boolean;
}

export function VerdictBar({
  trueCount,
  falseCount,
  unverifiedCount,
  compact = false,
}: VerdictBarProps) {
  const total = trueCount + falseCount + unverifiedCount;
  const trueP = formatVerdictPercent(trueCount, total);
  const falseP = formatVerdictPercent(falseCount, total);
  const unverP = formatVerdictPercent(unverifiedCount, total);

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
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-verdict-true inline-block" />
          <span className="text-muted-foreground">
            True —{" "}
            <span className="verdict-true font-semibold">
              {Number(trueCount)} vote{trueCount !== 1n ? "s" : ""} ({trueP}%)
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-verdict-false inline-block" />
          <span className="text-muted-foreground">
            False —{" "}
            <span className="verdict-false font-semibold">
              {Number(falseCount)} vote{falseCount !== 1n ? "s" : ""} ({falseP}
              %)
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-verdict-unverified inline-block" />
          <span className="text-muted-foreground">
            Unverified —{" "}
            <span className="verdict-unverified font-semibold">
              {Number(unverifiedCount)} vote{unverifiedCount !== 1n ? "s" : ""}{" "}
              ({unverP}%)
            </span>
          </span>
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
