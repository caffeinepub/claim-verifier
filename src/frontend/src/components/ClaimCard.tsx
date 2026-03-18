import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEnhancedVoteTally, useReportContent } from "@/hooks/useQueries";
import { useSessionGate } from "@/hooks/useSessionGate";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/time";
import { computeOverallVerdict } from "@/utils/verdict";
import type { OverallVerdict } from "@/utils/verdict";
import {
  BarChart2,
  CheckCircle2,
  Flag,
  Flame,
  MoreHorizontal,
  Share2,
  Swords,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Claim } from "../backend.d";
import { CategoryBadge } from "./CategoryBadge";
import { ReportDialog } from "./ReportDialog";
import { AuthorDisplay } from "./UserProfileCard";
import { VerdictBar } from "./VerdictBar";

interface ClaimCardProps {
  claim: Claim;
  index: number;
  onClick: () => void;
  sessionId?: string;
  slug?: string;
}

const verdictBorderClass: Record<string, string> = {
  REBUNKED: "border-l-emerald-500",
  DEBUNKED: "border-l-red-500",
  Contested: "border-l-amber-500",
  "Insufficient Data": "border-l-border",
  "Leaning TRUE": "border-l-emerald-300",
  "Leaning FALSE": "border-l-red-300",
};

const verdictBadgeConfig: Record<
  OverallVerdict,
  {
    label: string;
    textColor: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  REBUNKED: {
    label: "REBUNKED",
    textColor: "text-emerald-600",
    icon: CheckCircle2,
  },
  DEBUNKED: {
    label: "DEBUNKED",
    textColor: "text-red-600",
    icon: XCircle,
  },
  Contested: {
    label: "CONTESTED",
    textColor: "text-amber-600",
    icon: Swords,
  },
  "Insufficient Data": {
    label: "INSUFFICIENT DATA",
    textColor: "text-slate-500",
    icon: BarChart2,
  },
  "Leaning TRUE": {
    label: "LEANING TRUE",
    textColor: "text-emerald-500",
    icon: TrendingUp,
  },
  "Leaning FALSE": {
    label: "LEANING FALSE",
    textColor: "text-red-500",
    icon: TrendingDown,
  },
};

export function ClaimCard({
  claim,
  index,
  onClick,
  sessionId,
  slug,
}: ClaimCardProps) {
  const { data: tally, isLoading: tallyLoading } = useEnhancedVoteTally(
    claim.id,
  );
  const reportContent = useReportContent();
  const { checkAction } = useSessionGate();
  const [reported, setReported] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const ocid = `claim.item.${index}` as const;

  async function handleReportConfirm(_reason: string) {
    if (!sessionId || reported) return;
    if (!checkAction()) return;
    await reportContent.mutateAsync({
      targetId: claim.id,
      targetType: "claim",
      sessionId,
    });
    setReported(true);
  }

  function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    const path = slug ? `/claim/${slug}` : "/";
    const url = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied!");
    });
  }

  const thumbnailSrc =
    claim.imageUrls?.[0] ||
    (claim.ogThumbnailUrl ? claim.ogThumbnailUrl : null);

  const verdict = tally
    ? computeOverallVerdict(
        Number(tally.trueCount),
        Number(tally.falseCount),
        Number(tally.unverifiedCount),
        true,
        Number(tally.trueDirect),
        Number(tally.falseDirect),
      )
    : null;

  // Confidence meter calculation
  const totalVotes = tally
    ? Math.max(0, Number(tally.trueCount)) +
      Math.max(0, Number(tally.falseCount)) +
      Math.max(0, Number(tally.unverifiedCount))
    : 0;

  // Always compute percentages for the meter (even below threshold)
  const trueRaw = tally ? Math.max(0, Number(tally.trueCount)) : 0;
  const falseRaw = tally ? Math.max(0, Number(tally.falseCount)) : 0;

  const truePercent =
    totalVotes > 0 ? Math.round((trueRaw / totalVotes) * 100) : 0;
  const falsePercent =
    totalVotes > 0 ? Math.round((falseRaw / totalVotes) * 100) : 0;

  // Threshold check for a "real" verdict display
  const hasEnoughVotes = totalVotes >= 5;

  // Hot threshold: 10+ total votes as a proxy for activity
  const isHot = totalVotes >= 10;

  // Meter bar color based on verdict (fallback to muted for no/insufficient data)
  const meterBarColor =
    verdict === "REBUNKED"
      ? "bg-emerald-500"
      : verdict === "DEBUNKED"
        ? "bg-red-500"
        : verdict === "Contested"
          ? "bg-amber-400"
          : verdict === "Leaning TRUE"
            ? "bg-emerald-400"
            : verdict === "Leaning FALSE"
              ? "bg-red-400"
              : totalVotes > 0
                ? "bg-muted-foreground/40"
                : "bg-muted-foreground/20";

  // Meter fill % (true % for positive verdicts, false % for false verdict)
  // When there are not enough votes for a verdict, show progress toward the 5-vote threshold
  const meterFill =
    totalVotes === 0
      ? 0
      : !hasEnoughVotes
        ? Math.min(100, Math.round((totalVotes / 5) * 100))
        : verdict === "DEBUNKED" || verdict === "Leaning FALSE"
          ? falsePercent
          : truePercent;

  const borderClass = verdict ? verdictBorderClass[verdict] : "border-l-border";

  return (
    <motion.article
      data-ocid={ocid}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      onClick={onClick}
      className={cn(
        "group relative bg-card border border-border rounded-xl p-4 cursor-pointer transition-all duration-200",
        "hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5",
        "border-l-4",
        borderClass,
      )}
      aria-label={`View claim: ${claim.title}`}
    >
      {/* Row 1: category + meta + ellipsis menu */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <CategoryBadge category={claim.category} />
          <span className="text-xs text-muted-foreground font-body">
            {formatRelativeTime(claim.timestamp)}
          </span>
          <span className="text-muted-foreground text-xs">·</span>
          <AuthorDisplay
            username={claim.authorUsername}
            className="flex items-center gap-1"
            usernameClassName="font-normal text-muted-foreground"
            showAvatar={false}
          />
        </div>

        {/* Ellipsis dropdown menu -- stopPropagation prevents card navigation */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: dropdown handles keyboard */}
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                data-ocid={`claim.open_modal_button.${index}`}
                aria-label="More options"
                className={cn(
                  "flex-shrink-0 flex items-center justify-center w-7 h-7 rounded transition-all duration-150",
                  "text-muted-foreground hover:text-foreground hover:bg-muted",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                )}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem
                onClick={handleShare}
                className="cursor-pointer gap-2"
              >
                <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Share</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setReportDialogOpen(true);
                }}
                disabled={reported}
                className="cursor-pointer gap-2"
              >
                <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {reported ? "Reported" : "Report"}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Row 2: title only */}
      <div className="mb-2">
        <h3 className="font-display text-lg font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
          {claim.title}
          {isHot && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Flame
                    className="inline w-4 h-4 text-orange-500 ml-1.5 align-middle relative -top-[2px] sm:-top-[3px]"
                    aria-label="Hot claim"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>High activity in the last 24 hours</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </h3>
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
            loading="lazy"
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
            loading="lazy"
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

      {/* Row 5: verdict label + verdict bar + confidence meter (always shown) */}
      {tallyLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="flex gap-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Inline verdict label — only show when there's an actual verdict */}
          {verdict &&
            tally &&
            (() => {
              const cfg = verdictBadgeConfig[verdict];
              const Icon = cfg.icon;
              return (
                <div className={cn("flex items-center gap-1.5", cfg.textColor)}>
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-xs font-bold tracking-wider font-body">
                    {cfg.label}
                  </span>
                </div>
              );
            })()}

          {/* Compact vote breakdown — only when there are enough votes for a verdict */}
          {tally && totalVotes > 0 && (
            <VerdictBar
              trueCount={tally.trueCount}
              falseCount={tally.falseCount}
              unverifiedCount={tally.unverifiedCount}
              compact
            />
          )}

          {/* Confidence meter — always visible */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {totalVotes === 0 ? (
                <span className="text-xs text-muted-foreground font-body">
                  No votes yet
                </span>
              ) : !hasEnoughVotes ? (
                <span className="text-xs text-muted-foreground font-body">
                  {totalVotes}/5 votes needed
                </span>
              ) : (
                <span className="text-xs font-bold font-body text-foreground">
                  {verdict === "DEBUNKED" || verdict === "Leaning FALSE"
                    ? `${falsePercent}% False`
                    : `${truePercent}% True`}
                </span>
              )}
              <span className="text-xs text-muted-foreground font-body">
                {totalVotes > 0
                  ? `${totalVotes} vote${totalVotes !== 1 ? "s" : ""}`
                  : ""}
              </span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden cursor-default">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${meterFill}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={cn("h-full rounded-full", meterBarColor)}
                    />
                  </div>
                </TooltipTrigger>
                {!hasEnoughVotes && totalVotes > 0 && (
                  <TooltipContent side="bottom">
                    <p className="text-xs">
                      {totalVotes} of 5 votes needed for a verdict
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}

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
