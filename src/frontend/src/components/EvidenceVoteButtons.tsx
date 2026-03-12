import {
  useEvidenceVoteTally,
  useSessionVoteForEvidence,
  useVoteEvidence,
} from "@/hooks/useQueries";
import { useSessionGate } from "@/hooks/useSessionGate";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EvidenceVoteButtonsProps {
  evidenceId: bigint;
  sessionId: string;
  /** Deterministic 1-based index for ocid markers */
  index: number;
  /** Optional claimId so evidence votes can also refresh the claim's enhanced tally */
  claimId?: bigint;
}

export function EvidenceVoteButtons({
  evidenceId,
  sessionId,
  index,
  claimId,
}: EvidenceVoteButtonsProps) {
  const { data: tally } = useEvidenceVoteTally(evidenceId);
  const { data: sessionVote } = useSessionVoteForEvidence(
    evidenceId,
    sessionId,
  );
  const voteEvidence = useVoteEvidence();
  const { checkVoteAction } = useSessionGate();

  // Optimistic local state: null means "use server data"
  const [optimisticVote, setOptimisticVote] = useState<
    string | null | undefined
  >(undefined);
  const [optimisticScore, setOptimisticScore] = useState<number | undefined>(
    undefined,
  );
  const [justVotedUp, setJustVotedUp] = useState(false);
  const [justVotedDown, setJustVotedDown] = useState(false);

  const currentVote =
    optimisticVote !== undefined ? optimisticVote : (sessionVote ?? null);
  const serverScore = tally ? Number(tally.netScore) : 0;
  const displayScore =
    optimisticScore !== undefined ? optimisticScore : serverScore;

  // Reset bounce animation flags after 350ms
  useEffect(() => {
    if (justVotedUp) {
      const t = setTimeout(() => setJustVotedUp(false), 350);
      return () => clearTimeout(t);
    }
  }, [justVotedUp]);

  useEffect(() => {
    if (justVotedDown) {
      const t = setTimeout(() => setJustVotedDown(false), 350);
      return () => clearTimeout(t);
    }
  }, [justVotedDown]);

  async function handleVote(direction: "up" | "down") {
    if (voteEvidence.isPending) return;
    if (!checkVoteAction()) return;

    // Trigger bounce
    if (direction === "up") setJustVotedUp(true);
    else setJustVotedDown(true);

    // Compute optimistic next state
    const prevVote = currentVote;
    const prevScore = displayScore;

    let nextVote: string | null;
    let scoreDelta = 0;

    if (prevVote === direction) {
      // Toggle off
      nextVote = null;
      scoreDelta = direction === "up" ? -1 : 1;
    } else {
      // Switch or fresh vote
      nextVote = direction;
      if (prevVote === null || prevVote === undefined) {
        scoreDelta = direction === "up" ? 1 : -1;
      } else {
        // switching direction: remove old + add new
        scoreDelta = direction === "up" ? 2 : -2;
      }
    }

    setOptimisticVote(nextVote);
    setOptimisticScore(prevScore + scoreDelta);

    try {
      await voteEvidence.mutateAsync({
        evidenceId,
        sessionId,
        direction,
        claimId,
      });
      // Server synced — clear optimistic overrides so React Query data takes over
      setOptimisticVote(undefined);
      setOptimisticScore(undefined);
    } catch {
      // Revert on failure
      setOptimisticVote(prevVote ?? undefined);
      setOptimisticScore(prevScore);
      toast.error("Failed to record vote");
    }
  }

  const isVoting = voteEvidence.isPending;

  const scoreColor =
    displayScore > 0
      ? "text-amber-400"
      : displayScore < 0
        ? "text-blue-400"
        : "text-muted-foreground";

  return (
    <div
      className="flex items-center gap-1 select-none"
      aria-label="Vote on this evidence"
    >
      {/* Upvote */}
      <button
        type="button"
        data-ocid={`evidence.upvote_button.${index}`}
        onClick={() => handleVote("up")}
        disabled={isVoting}
        aria-label="Upvote evidence"
        aria-pressed={currentVote === "up"}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
          "disabled:cursor-not-allowed disabled:opacity-60",
          justVotedUp && "vote-bounce",
          currentVote === "up"
            ? "text-amber-400 bg-amber-400/15 hover:bg-amber-400/25 shadow-sm"
            : "text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10",
        )}
      >
        <ChevronUp
          className={cn(
            "h-5 w-5 transition-transform duration-150",
            currentVote === "up" && "scale-110",
          )}
          strokeWidth={currentVote === "up" ? 2.5 : 2}
        />
      </button>

      {/* Score */}
      <span
        data-ocid={`evidence.score.${index}`}
        className={cn(
          "text-sm font-mono font-bold tabular-nums min-w-[2rem] text-center transition-colors duration-150",
          scoreColor,
        )}
      >
        {displayScore}
      </span>

      {/* Downvote */}
      <button
        type="button"
        data-ocid={`evidence.downvote_button.${index}`}
        onClick={() => handleVote("down")}
        disabled={isVoting}
        aria-label="Downvote evidence"
        aria-pressed={currentVote === "down"}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
          "disabled:cursor-not-allowed disabled:opacity-60",
          justVotedDown && "vote-bounce",
          currentVote === "down"
            ? "text-blue-400 bg-blue-400/15 hover:bg-blue-400/25 shadow-sm"
            : "text-muted-foreground hover:text-blue-400 hover:bg-blue-400/10",
        )}
      >
        <ChevronDown
          className={cn(
            "h-5 w-5 transition-transform duration-150",
            currentVote === "down" && "scale-110",
          )}
          strokeWidth={currentVote === "down" ? 2.5 : 2}
        />
      </button>
    </div>
  );
}
