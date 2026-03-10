import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useEnhancedVoteTally,
  useReportContent,
  useUsername,
} from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/time";
import { computeOverallVerdict } from "@/utils/verdict";
import { Flag } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Claim } from "../backend.d";
import { CategoryBadge } from "./CategoryBadge";
import { OverallVerdictBadge } from "./OverallVerdictBadge";
import { ReportDialog } from "./ReportDialog";
import { VerdictBar } from "./VerdictBar";

interface ClaimCardProps {
  claim: Claim;
  index: number;
  onClick: () => void;
  sessionId?: string;
}

const verdictBorderClass: Record<string, string> = {
  True: "border-l-emerald-500",
  False: "border-l-red-500",
  Contested: "border-l-amber-500",
  Unverified: "border-l-slate-400",
  "Insufficient Data": "border-l-border",
};

export function ClaimCard({
  claim,
  index,
  onClick,
  sessionId,
}: ClaimCardProps) {
  const { data: tally, isLoading: tallyLoading } = useEnhancedVoteTally(
    claim.id,
  );
  const reportContent = useReportContent();
  const username = useUsername();
  const [reported, setReported] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const ocid = `claim.item.${index}` as const;

  async function handleReportConfirm(_reason: string) {
    if (!sessionId || reported) return;
    await reportContent.mutateAsync({
      targetId: claim.id,
      targetType: "claim",
      sessionId,
    });
    setReported(true);
  }

  const thumbnailSrc =
    claim.imageUrls?.[0] ||
    (claim.ogThumbnailUrl ? claim.ogThumbnailUrl : null);

  const verdict = tally
    ? computeOverallVerdict(
        Number(tally.trueCount),
        Number(tally.falseCount),
        Number(tally.unverifiedCount),
      )
    : null;

  // Confidence meter calculation
  const totalVotes = tally
    ? Math.max(0, Number(tally.trueCount)) +
      Math.max(0, Number(tally.falseCount)) +
      Math.max(0, Number(tally.unverifiedCount))
    : 0;
  const truePercent =
    totalVotes >= 5 && tally
      ? Math.round((Math.max(0, Number(tally.trueCount)) / totalVotes) * 100)
      : null;
  const falsePercent =
    totalVotes >= 5 && tally
      ? Math.round((Math.max(0, Number(tally.falseCount)) / totalVotes) * 100)
      : null;

  // Meter bar color based on verdict
  const meterBarColor =
    verdict === "True"
      ? "bg-emerald-500"
      : verdict === "False"
        ? "bg-red-500"
        : verdict === "Contested"
          ? "bg-amber-500"
          : "bg-slate-400";

  // Meter fill % (true % for positive verdicts, false % for false verdict)
  const meterFill =
    verdict === "False" ? (falsePercent ?? 0) : (truePercent ?? 0);

  const borderClass = verdict ? verdictBorderClass[verdict] : "border-l-border";

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      data-ocid={ocid}
      onClick={onClick}
      className={cn(
        "group cursor-pointer bg-card border border-border border-l-4 hover:border-primary/40 rounded-sm p-5 transition-colors duration-200",
        borderClass,
      )}
    >
      {/* Row 1: meta + report button */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge category={claim.category} />
          <span className="text-xs text-muted-foreground font-body">
            {formatRelativeTime(claim.timestamp)}
          </span>
          <span className="text-xs text-muted-foreground font-body">
            ·{" "}
            {claim.sessionId === sessionId && claim.sessionId !== "seed"
              ? username
              : "Anonymous"}
          </span>
        </div>

        {/* Report button */}
        {sessionId && (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  data-ocid={`claim.report_button.${index}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setReportDialogOpen(true);
                  }}
                  disabled={reported}
                  aria-label="Report claim"
                  className={cn(
                    "flex-shrink-0 flex items-center justify-center w-6 h-6 rounded transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                    "disabled:cursor-not-allowed",
                    reported
                      ? "text-amber-400 opacity-60"
                      : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10",
                  )}
                >
                  <Flag className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs font-body">
                {reported ? "Reported" : "Report claim"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Row 2: title + verdict badge */}
      <div className="flex items-start gap-2 mb-2">
        <h3 className="font-display text-lg font-semibold text-foreground leading-snug group-hover:text-primary transition-colors flex-1">
          {claim.title}
        </h3>
        {verdict && !tallyLoading && (
          <OverallVerdictBadge
            verdict={verdict}
            className="flex-shrink-0 mt-0.5"
          />
        )}
      </div>

      {/* Row 3: description */}
      <p className="text-sm text-muted-foreground font-body leading-relaxed line-clamp-2 mb-3">
        {claim.description}
      </p>

      {/* Row 4: full-width image with blurred background (Reddit/Twitter style) */}
      {thumbnailSrc && (
        <div
          className="relative overflow-hidden rounded-md mb-4"
          style={{ minHeight: 180, maxHeight: 400 }}
        >
          {/* Blurred background layer */}
          <img
            src={thumbnailSrc}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 brightness-50 saturate-150"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          {/* Foreground image at natural ratio */}
          <img
            src={thumbnailSrc}
            alt=""
            aria-hidden="true"
            className="relative z-10 w-full object-contain"
            style={{ minHeight: 180, maxHeight: 400 }}
            onError={(e) => {
              const wrapper = (e.currentTarget as HTMLImageElement).closest(
                "div",
              ) as HTMLDivElement | null;
              if (wrapper) wrapper.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Row 5: verdict bar + confidence meter */}
      {tallyLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="flex gap-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ) : tally ? (
        <div className="space-y-3">
          <VerdictBar
            trueCount={tally.trueCount}
            falseCount={tally.falseCount}
            unverifiedCount={tally.unverifiedCount}
            compact
          />
          {/* Confidence meter */}
          {totalVotes >= 5 && truePercent !== null ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-body text-foreground">
                  {verdict === "False"
                    ? `${falsePercent}% False`
                    : verdict === "True"
                      ? `${truePercent}% True`
                      : `${truePercent}% True`}
                </span>
                <span className="text-xs text-muted-foreground font-body">
                  {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${meterFill}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={cn("h-full rounded-full", meterBarColor)}
                />
              </div>
            </div>
          ) : totalVotes > 0 ? (
            <p className="text-xs text-muted-foreground font-body italic">
              Not enough votes yet ({totalVotes}/5 needed)
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Report dialog -- stopPropagation prevents card click */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: dialog handles keyboard */}
      <div onClick={(e) => e.stopPropagation()}>
        <ReportDialog
          isOpen={reportDialogOpen}
          onClose={() => setReportDialogOpen(false)}
          onConfirm={handleReportConfirm}
          title="Report Claim"
        />
      </div>
    </motion.article>
  );
}
