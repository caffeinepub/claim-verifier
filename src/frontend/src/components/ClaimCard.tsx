import { Skeleton } from "@/components/ui/skeleton";
import { useVoteTally } from "@/hooks/useQueries";
import { formatRelativeTime } from "@/utils/time";
import { motion } from "motion/react";
import type { Claim } from "../backend.d";
import { CategoryBadge } from "./CategoryBadge";
import { VerdictBar } from "./VerdictBar";

interface ClaimCardProps {
  claim: Claim;
  index: number;
  onClick: () => void;
}

export function ClaimCard({ claim, index, onClick }: ClaimCardProps) {
  const { data: tally, isLoading: tallyLoading } = useVoteTally(claim.id);

  const ocid = `claim.item.${index}` as const;

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
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge category={claim.category} />
          <span className="text-xs text-muted-foreground font-body">
            {formatRelativeTime(claim.timestamp)}
          </span>
        </div>
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
    </motion.article>
  );
}
