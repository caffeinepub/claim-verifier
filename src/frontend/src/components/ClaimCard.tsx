import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useEnhancedVoteTally,
  useReportContent,
  useUsername,
} from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/time";
import { computeOverallVerdict } from "@/utils/verdict";
import type { OverallVerdict } from "@/utils/verdict";
import {
  BarChart2,
  CheckCircle2,
  Flag,
  MoreHorizontal,
  Search,
  Share2,
  Swords,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Claim } from "../backend.d";
import { CategoryBadge } from "./CategoryBadge";
import { ReportDialog } from "./ReportDialog";
import { VerdictBar } from "./VerdictBar";

interface ClaimCardProps {
  claim: Claim;
  index: number;
  onClick: () => void;
  sessionId?: string;
  slug?: string;
}

const verdictBorderClass: Record<string, string> = {
  True: "border-l-emerald-500",
  False: "border-l-red-500",
  Contested: "border-l-amber-500",
  Unverified: "border-l-slate-400",
  "Insufficient Data": "border-l-border",
};

const verdictBadgeConfig: Record<
  OverallVerdict,
  {
    label: string;
    bg: string;
    text: string;
    ring: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  True: {
    label: "REBUNKED",
    bg: "bg-emerald-500",
    text: "text-white",
    ring: "ring-1 ring-emerald-600",
    icon: CheckCircle2,
  },
  False: {
    label: "DEBUNKED",
    bg: "bg-red-500",
    text: "text-white",
    ring: "ring-1 ring-red-600",
    icon: XCircle,
  },
  Unverified: {
    label: "UNVERIFIED",
    bg: "bg-amber-500",
    text: "text-white",
    ring: "ring-1 ring-amber-600",
    icon: Search,
  },
  Contested: {
    label: "CONTESTED",
    bg: "bg-amber-500",
    text: "text-white",
    ring: "ring-1 ring-amber-600",
    icon: Swords,
  },
  "Insufficient Data": {
    label: "INSUFFICIENT DATA",
    bg: "bg-slate-400",
    text: "text-white",
    ring: "ring-1 ring-slate-500",
    icon: BarChart2,
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
        "group relative cursor-pointer bg-card border border-border border-l-4 hover:border-primary/40 rounded-sm p-5 transition-colors duration-200 overflow-hidden",
        borderClass,
      )}
    >
      {/* Floating verdict badge -- top-left corner overlay (Option A) */}
      {tallyLoading ? (
        <Skeleton className="absolute top-3 left-3 h-6 w-24 rounded-full" />
      ) : verdict ? (
        (() => {
          const cfg = verdictBadgeConfig[verdict];
          const Icon = cfg.icon;
          return (
            <div
              className={cn(
                "absolute top-3 left-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full shadow-sm z-10",
                cfg.bg,
                cfg.text,
                cfg.ring,
              )}
            >
              <Icon className="w-3 h-3" />
              <span className="text-[10px] font-bold tracking-wider font-body">
                {cfg.label}
              </span>
            </div>
          );
        })()
      ) : null}

      {/* Row 1: meta + ellipsis menu */}
      <div className="flex items-start justify-between gap-3 mb-2 mt-7">
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
      <h3 className="font-display text-lg font-semibold text-foreground leading-snug group-hover:text-primary transition-colors mb-2">
        {claim.title}
      </h3>

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
