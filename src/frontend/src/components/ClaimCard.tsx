import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useReportContent,
  useUsername,
  useVoteTally,
} from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/time";
import { Flag } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Claim } from "../backend.d";
import { CategoryBadge } from "./CategoryBadge";
import { ReportDialog } from "./ReportDialog";
import { VerdictBar } from "./VerdictBar";

interface ClaimCardProps {
  claim: Claim;
  index: number;
  onClick: () => void;
  sessionId?: string;
}

export function ClaimCard({
  claim,
  index,
  onClick,
  sessionId,
}: ClaimCardProps) {
  const { data: tally, isLoading: tallyLoading } = useVoteTally(claim.id);
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

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      data-ocid={ocid}
      onClick={onClick}
      className="group cursor-pointer bg-card border border-border hover:border-primary/40 rounded-sm p-5 transition-colors duration-200"
    >
      <div className="flex gap-4">
        {/* Thumbnail */}
        {thumbnailSrc && (
          <div className="flex-shrink-0">
            <img
              src={thumbnailSrc}
              alt=""
              aria-hidden="true"
              className="w-[72px] h-[72px] rounded object-cover bg-muted"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        {/* Card body */}
        <div className="flex-1 min-w-0">
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

          <h3 className="font-display text-lg font-semibold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
            {claim.title}
          </h3>

          <p className="text-sm text-muted-foreground font-body leading-relaxed line-clamp-2 mb-4">
            {claim.description}
          </p>

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
            <VerdictBar
              trueCount={tally.trueCount}
              falseCount={tally.falseCount}
              unverifiedCount={tally.unverifiedCount}
              compact
            />
          ) : null}
        </div>
      </div>

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
