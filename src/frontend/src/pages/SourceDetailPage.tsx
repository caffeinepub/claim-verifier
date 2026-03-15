import type { Claim, Evidence } from "@/backend.d";
import { SourceDiscussion } from "@/components/SourceDiscussion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  clearDispute,
  getDispute,
  getDisputeVote,
  saveDispute,
  saveDisputeVote,
  useAccountPermissions,
} from "@/hooks/useAccountPermissions";
import { useActor } from "@/hooks/useActor";
import type { TrustedSourceInfo } from "@/hooks/useQueries";
import {
  useAdminOverrideSource,
  useAdminRemoveSource,
  useAdminSetPinnedComment,
  useAllClaims,
  useEnhancedVoteTally,
  useSessionVoteForSource,
  useTrustedSources,
  useVoteOnSource,
  useWikipediaBlurb,
} from "@/hooks/useQueries";
import { useSessionGate } from "@/hooks/useSessionGate";
import {
  getVerifiedVotes,
  useVerifiedAccount,
} from "@/hooks/useVerifiedAccount";
import { cn } from "@/lib/utils";
import {
  getSourceTypeBadgeClasses,
  getSourceTypeBonus,
  getSourceTypeLabel,
} from "@/pages/TrustedSourcesPage";
import { computeOverallVerdict } from "@/utils/verdict";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  FileQuestion,
  Flag,
  Globe,
  Loader2,
  LogIn,
  Pin,
  Shield,
  ShieldCheck,
  ShieldX,
  Users,
  Vote,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const ADMIN_PASSWORD = "lunasimbaliamsammy123!";

// ── Helpers ──────────────────────────────────────────────────────────────────

function extractDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return url
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .split("/")[0]
      .toLowerCase();
  }
}

function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
}

const VERDICT_STYLES: Record<string, { label: string; className: string }> = {
  REBUNKED: {
    label: "REBUNKED",
    className:
      "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30",
  },
  DEBUNKED: {
    label: "DEBUNKED",
    className: "bg-red-500/15 text-red-700 border border-red-500/30",
  },
  "Leaning TRUE": {
    label: "LEANING TRUE",
    className:
      "bg-emerald-500/10 text-emerald-600 border border-emerald-400/25",
  },
  "Leaning FALSE": {
    label: "LEANING FALSE",
    className: "bg-red-500/10 text-red-600 border border-red-400/25",
  },
  Contested: {
    label: "CONTESTED",
    className: "bg-amber-500/15 text-amber-700 border border-amber-400/30",
  },
  "Insufficient Data": {
    label: "INSUFFICIENT",
    className: "bg-muted text-muted-foreground border border-border",
  },
};

// ── Inline hooks ─────────────────────────────────────────────────────────────

function useSourceReportCount(sourceId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["report-count", "source", sourceId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getReportCount(sourceId, "source");
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** Tries Clearbit logo → Google favicon → Globe icon */
function SourceLogo({ domain }: { domain: string }) {
  const [step, setStep] = useState<0 | 1 | 2>(0);

  if (step === 2) {
    return <Globe className="h-6 w-6 text-muted-foreground flex-shrink-0" />;
  }

  const src =
    step === 0
      ? `https://logo.clearbit.com/${domain}`
      : `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  return (
    <img
      src={src}
      alt={domain}
      className="w-10 h-10 rounded object-contain flex-shrink-0"
      onError={() => setStep((s) => (s < 2 ? ((s + 1) as 0 | 1 | 2) : 2))}
    />
  );
}

function ClaimVerdictBadge({ claimId }: { claimId: bigint }) {
  const { data: tally, isLoading } = useEnhancedVoteTally(claimId);

  if (isLoading || !tally) {
    return (
      <span className="inline-block w-16 h-4 bg-muted rounded animate-pulse" />
    );
  }

  const verdict = computeOverallVerdict(
    Number(tally.trueCount),
    Number(tally.falseCount),
    Number(tally.unverifiedCount),
  );

  const style = VERDICT_STYLES[verdict] ?? VERDICT_STYLES["Insufficient Data"];

  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold font-body whitespace-nowrap",
        style.className,
      )}
    >
      {style.label}
    </span>
  );
}

function VotePanel({
  source,
  sessionId,
}: {
  source: TrustedSourceInfo;
  sessionId: string | null;
}) {
  const { checkVoteAction } = useSessionGate();
  const voteOnSource = useVoteOnSource();
  const { data: sessionVote } = useSessionVoteForSource(source.id, sessionId);

  const upvotes = Number(source.upvotes);
  const downvotes = Number(source.downvotes);
  const netScore = upvotes - downvotes;

  async function handleVote(direction: "up" | "down") {
    if (!sessionId) return;
    if (!checkVoteAction()) return;
    try {
      await voteOnSource.mutateAsync({
        sourceId: source.id,
        sessionId,
        direction,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to vote");
    }
  }

  const hasUp = sessionVote === "up";
  const hasDown = sessionVote === "down";

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        data-ocid="source_detail.toggle"
        onClick={() => handleVote("up")}
        disabled={voteOnSource.isPending}
        className={cn(
          "flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-body font-medium border transition-all",
          hasUp
            ? "bg-primary/10 border-primary text-primary"
            : "bg-secondary border-border text-muted-foreground hover:border-primary/60 hover:text-primary hover:bg-primary/5",
        )}
      >
        <ChevronUp className="h-4 w-4" />
        Upvote
      </button>
      <div className="text-center">
        <span
          className={cn(
            "text-2xl font-bold font-mono block",
            netScore > 0
              ? "text-primary"
              : netScore < 0
                ? "text-destructive"
                : "text-muted-foreground",
          )}
        >
          {netScore > 0 ? `+${netScore}` : netScore}
        </span>
        <span className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">
          Net Score
        </span>
      </div>
      <button
        type="button"
        data-ocid="source_detail.toggle"
        onClick={() => handleVote("down")}
        disabled={voteOnSource.isPending}
        className={cn(
          "flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-body font-medium border transition-all",
          hasDown
            ? "bg-destructive/10 border-destructive text-destructive"
            : "bg-secondary border-border text-muted-foreground hover:border-destructive/60 hover:text-destructive hover:bg-destructive/5",
        )}
      >
        <ChevronDown className="h-4 w-4" />
        Downvote
      </button>
    </div>
  );
}

function ClaimsCitingSource({
  domain,
  onClaimClick,
}: {
  domain: string;
  onClaimClick: (claim: Claim) => void;
}) {
  const { data: allClaims, isLoading } = useAllClaims();

  const matchingClaims = (allClaims ?? []).filter((claim) => {
    const urlsToCheck = [...(claim.urls ?? []), ...(claim.imageUrls ?? [])];
    return urlsToCheck.some((url) => {
      try {
        return extractDomain(url) === domain;
      } catch {
        return false;
      }
    });
  });

  if (isLoading) {
    return (
      <div data-ocid="source_detail.loading_state" className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-sm" />
        ))}
      </div>
    );
  }

  if (matchingClaims.length === 0) {
    return (
      <div
        data-ocid="source_detail.empty_state"
        className="text-center py-10 text-muted-foreground"
      >
        <FileQuestion className="h-8 w-8 mx-auto mb-2 opacity-20" />
        <p className="text-sm font-body">
          No claims currently cite this source.
        </p>
      </div>
    );
  }

  return (
    <div data-ocid="source_detail.list" className="space-y-2">
      {matchingClaims.map((claim, i) => (
        <motion.button
          key={claim.id.toString()}
          type="button"
          data-ocid={`source_detail.item.${i + 1}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          onClick={() => onClaimClick(claim)}
          className="w-full text-left p-3 bg-secondary border border-border rounded-sm hover:border-primary/40 hover:bg-secondary/80 transition-all group"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-body font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1">
              {claim.title}
            </p>
            <ClaimVerdictBadge claimId={claim.id} />
          </div>
          <p className="text-[10px] text-muted-foreground font-body mt-1 capitalize">
            {claim.category}
          </p>
        </motion.button>
      ))}
    </div>
  );
}

function EvidenceQualitySection({ domain }: { domain: string }) {
  const { actor, isFetching } = useActor();
  const { data: allClaims, isLoading: claimsLoading } = useAllClaims();

  const matchingClaims = (allClaims ?? []).filter((claim) => {
    const urlsToCheck = [...(claim.urls ?? []), ...(claim.imageUrls ?? [])];
    return urlsToCheck.some((url) => {
      try {
        return extractDomain(url) === domain;
      } catch {
        return false;
      }
    });
  });

  // Batch-fetch evidence for all matching claims
  const evidenceQueries = useQueries({
    queries: matchingClaims.map((claim) => ({
      queryKey: ["evidence", claim.id.toString()],
      queryFn: async (): Promise<Evidence[]> => {
        if (!actor) return [];
        return actor.getEvidenceForClaim(claim.id);
      },
      enabled: !!actor && !isFetching,
    })),
  });

  const evidenceLoading = evidenceQueries.some((q) => q.isLoading);

  // Collect all evidence whose URLs include this domain
  const citingEvidence: Evidence[] = evidenceQueries
    .flatMap((q) => q.data ?? [])
    .filter((ev) => ev.urls.some((url) => extractDomain(url) === domain));

  // Batch-fetch tallies for each evidence item
  const tallyQueries = useQueries({
    queries: citingEvidence.map((ev) => ({
      queryKey: ["evidence-tally", ev.id.toString()],
      queryFn: async (): Promise<{ netScore: bigint }> => {
        if (!actor) return { netScore: 0n };
        return actor.getEvidenceVoteTally(ev.id);
      },
      enabled: !!actor && !isFetching && !evidenceLoading,
    })),
  });

  const talliesLoading = tallyQueries.some((q) => q.isLoading);
  const isLoading = claimsLoading || evidenceLoading || talliesLoading;

  if (isLoading) {
    return (
      <div
        data-ocid="source_detail.loading_state"
        className="grid grid-cols-3 gap-3"
      >
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-sm" />
        ))}
      </div>
    );
  }

  const totalCount = citingEvidence.length;

  if (totalCount === 0) {
    return (
      <div
        data-ocid="source_detail.empty_state"
        className="text-center py-8 text-muted-foreground"
      >
        <BarChart2 className="h-7 w-7 mx-auto mb-2 opacity-20" />
        <p className="text-sm font-body">No evidence cites this source yet.</p>
      </div>
    );
  }

  const netScores = tallyQueries
    .map((q) => Number(q.data?.netScore ?? 0n))
    .filter((_, i) => i < totalCount);

  const avgScore =
    netScores.length > 0
      ? Math.round(
          (netScores.reduce((a, b) => a + b, 0) / netScores.length) * 10,
        ) / 10
      : 0;

  const passingCount = netScores.filter((s) => s >= 3).length;
  const passRate =
    totalCount > 0 ? Math.round((passingCount / totalCount) * 100) : 0;

  const stats = [
    {
      icon: <BarChart2 className="h-4 w-4" />,
      label: "Evidence citing this source",
      value: totalCount.toString(),
    },
    {
      icon: <ChevronUp className="h-4 w-4" />,
      label: "Avg. net score",
      value: avgScore > 0 ? `+${avgScore}` : avgScore.toString(),
      highlight: avgScore >= 3,
    },
    {
      icon: <ShieldCheck className="h-4 w-4" />,
      label: "Quality gate pass rate",
      value: `${passRate}%`,
      highlight: passRate >= 50,
    },
  ];

  return (
    <div
      data-ocid="source_detail.panel"
      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="p-4 bg-secondary border border-border rounded-sm flex flex-col gap-1.5"
        >
          <div
            className={cn(
              "flex items-center gap-1.5 text-xs font-body",
              stat.highlight ? "text-primary" : "text-muted-foreground",
            )}
          >
            {stat.icon}
            <span>{stat.label}</span>
          </div>
          <span
            className={cn(
              "text-2xl font-bold font-mono",
              stat.highlight ? "text-primary" : "text-foreground",
            )}
          >
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function AdminControls({ source }: { source: TrustedSourceInfo }) {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [overrideNote, setOverrideNote] = useState("");
  const [pinnedComment, setPinnedComment] = useState(
    source.pinnedAdminComment ?? "",
  );
  const overrideSource = useAdminOverrideSource();
  const removeSource = useAdminRemoveSource();
  const setPinnedCommentMutation = useAdminSetPinnedComment();
  function tryAuth() {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      toast.success("Admin access granted");
    } else {
      toast.error("Incorrect password");
    }
  }

  async function handleOverride() {
    try {
      await overrideSource.mutateAsync({
        sourceId: source.id,
        approved: !source.isTrusted,
        note: overrideNote,
        password: ADMIN_PASSWORD,
      });
      toast.success(
        source.isTrusted
          ? "Source marked as not trusted"
          : "Source marked as trusted",
      );
      setOverrideNote("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Override failed");
    }
  }

  async function handleRemove() {
    if (!confirmRemove) {
      setConfirmRemove(true);
      return;
    }
    try {
      await removeSource.mutateAsync({
        sourceId: source.id,
        password: ADMIN_PASSWORD,
      });
      toast.success("Source removed");
      setConfirmRemove(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Remove failed");
    }
  }

  async function handleSetPinnedComment() {
    try {
      await setPinnedCommentMutation.mutateAsync({
        sourceId: source.id,
        comment: pinnedComment,
        password: ADMIN_PASSWORD,
      });
      toast.success(
        pinnedComment.trim()
          ? "Pinned comment updated"
          : "Pinned comment cleared",
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to set pinned comment",
      );
    }
  }

  // Hidden trigger when not authenticated and not open
  if (!authenticated && !isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="opacity-0 w-0 h-0 overflow-hidden absolute"
        aria-label="Admin"
      />
    );
  }

  return (
    <div className="mt-8 border border-border rounded-sm">
      {authenticated && (
        <button
          type="button"
          data-ocid="source_detail.toggle"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-secondary/60 transition-colors"
        >
          <span className="text-xs font-body font-medium text-muted-foreground uppercase tracking-wider">
            Admin Controls
          </span>
          <Shield className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      )}

      {isOpen && (
        <div className="p-4 border-t border-border space-y-5">
          {!authenticated ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-body">
                Enter admin password to access controls.
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  data-ocid="source_detail.input"
                  placeholder="Admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && tryAuth()}
                  className="flex-1 h-8 px-3 text-xs bg-secondary border border-border rounded font-body focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
                <Button
                  size="sm"
                  data-ocid="source_detail.submit_button"
                  onClick={tryAuth}
                  className="h-8 text-xs font-body bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Unlock
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Override trust + note */}
              <div className="space-y-2">
                <p className="text-xs font-body font-medium text-muted-foreground uppercase tracking-wider">
                  Override Trust
                </p>
                <input
                  type="text"
                  data-ocid="source_detail.input"
                  placeholder="Override note (optional, e.g. 'Known misinformation outlet')"
                  value={overrideNote}
                  onChange={(e) => setOverrideNote(e.target.value)}
                  className="w-full h-8 px-3 text-xs bg-secondary border border-border rounded font-body focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    data-ocid="source_detail.secondary_button"
                    onClick={handleOverride}
                    disabled={overrideSource.isPending}
                    className="text-xs font-body"
                    variant="outline"
                  >
                    {overrideSource.isPending ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : null}
                    {source.isTrusted ? "Revoke Trust" : "Override Trust"}
                  </Button>
                  {!confirmRemove ? (
                    <Button
                      size="sm"
                      data-ocid="source_detail.delete_button"
                      onClick={() => setConfirmRemove(true)}
                      variant="outline"
                      className="text-xs font-body border-destructive/40 text-destructive hover:bg-destructive/10"
                    >
                      Remove Source
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        data-ocid="source_detail.confirm_button"
                        onClick={handleRemove}
                        disabled={removeSource.isPending}
                        className="text-xs font-body bg-destructive text-white hover:bg-destructive/90"
                      >
                        {removeSource.isPending ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : null}
                        Confirm Remove
                      </Button>
                      <Button
                        size="sm"
                        data-ocid="source_detail.cancel_button"
                        onClick={() => setConfirmRemove(false)}
                        variant="outline"
                        className="text-xs font-body"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Pinned comment */}
              <div className="space-y-2">
                <p className="text-xs font-body font-medium text-muted-foreground uppercase tracking-wider">
                  Pinned Admin Comment
                </p>
                <textarea
                  data-ocid="source_detail.textarea"
                  placeholder="Enter a pinned comment visible to all users (leave empty to clear)"
                  value={pinnedComment}
                  onChange={(e) => setPinnedComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-xs bg-secondary border border-border rounded font-body focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
                />
                <Button
                  size="sm"
                  data-ocid="source_detail.save_button"
                  onClick={handleSetPinnedComment}
                  disabled={setPinnedCommentMutation.isPending}
                  className="text-xs font-body"
                  variant="outline"
                >
                  {setPinnedCommentMutation.isPending ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <Pin className="mr-1 h-3 w-3" />
                  )}
                  {pinnedComment.trim()
                    ? "Update Pinned Comment"
                    : "Clear Pinned Comment"}
                </Button>
              </div>

              {/* About Blurb */}
              <div className="space-y-2">
                <p className="text-xs font-body font-medium text-muted-foreground uppercase tracking-wider">
                  About Blurb
                </p>
                <p className="text-xs font-body text-muted-foreground">
                  About blurb is auto-fetched from Wikipedia on page load.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Source Category Dispute ───────────────────────────────────────────────────

const SOURCE_TYPE_OPTIONS = [
  { value: "peer-reviewed", label: "Peer-Reviewed Study" },
  { value: "government", label: "Government Data" },
  { value: "major-news", label: "Major News Organization" },
  { value: "independent", label: "Independent Journalism" },
  { value: "reference", label: "Reference / Encyclopedia" },
  { value: "blog", label: "Blog / Opinion" },
  { value: "archive", label: "Archive" },
  { value: "social", label: "Social Media" },
];

function SourceDisputePanel({
  source,
  sessionId,
}: {
  source: TrustedSourceInfo;
  sessionId: string;
}) {
  const sourceKey = source.id.toString();
  const [dispute, setDispute] = useState(() => getDispute(sourceKey));
  const [showForm, setShowForm] = useState(false);
  const [proposedType, setProposedType] = useState("");

  const myVote = dispute ? getDisputeVote(sourceKey, sessionId) : null;

  const currentVotes = dispute
    ? Object.values(dispute.votes).filter((v) => v === "current").length
    : 0;
  const proposedVotes = dispute
    ? Object.values(dispute.votes).filter((v) => v === "proposed").length
    : 0;
  const totalPollVotes = currentVotes + proposedVotes;
  const resolved = totalPollVotes >= 10;
  const winner = resolved
    ? currentVotes >= proposedVotes
      ? "current"
      : "proposed"
    : null;

  function handleStartDispute() {
    if (!proposedType || proposedType === source.sourceType) return;
    const record = {
      proposedType,
      creatorSessionId: sessionId,
      timestamp: Date.now(),
      votes: {},
    };
    saveDispute(sourceKey, record);
    setDispute(record);
    setShowForm(false);
    setProposedType("");
  }

  function handleVote(side: "current" | "proposed") {
    if (!dispute || myVote) return;
    const updated = {
      ...dispute,
      votes: { ...dispute.votes, [sessionId]: side },
    };
    saveDispute(sourceKey, updated);
    saveDisputeVote(sourceKey, sessionId, side);
    setDispute(updated);
  }

  function handleClearDispute() {
    clearDispute(sourceKey);
    setDispute(null);
    setShowForm(false);
  }

  if (!dispute && !showForm) {
    return (
      <button
        type="button"
        data-ocid="source_dispute.button"
        onClick={() => setShowForm(true)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-body transition-colors"
      >
        <Vote className="h-3.5 w-3.5" />
        Dispute Category
      </button>
    );
  }

  if (showForm && !dispute) {
    const otherTypes = SOURCE_TYPE_OPTIONS.filter(
      (t) => t.value !== source.sourceType,
    );
    return (
      <div className="space-y-2 p-3 bg-secondary border border-border rounded-sm text-sm">
        <p className="text-xs font-body font-medium text-foreground">
          Propose a new category for{" "}
          <span className="font-mono">{source.domain}</span>
        </p>
        <p className="text-xs text-muted-foreground font-body">
          Current:{" "}
          <span className="font-medium">
            {getSourceTypeLabel(source.sourceType)}
          </span>
        </p>
        <Select value={proposedType} onValueChange={setProposedType}>
          <SelectTrigger className="h-8 text-xs bg-card border-border font-body">
            <SelectValue placeholder="Select proposed category" />
          </SelectTrigger>
          <SelectContent>
            {otherTypes.map((t) => (
              <SelectItem
                key={t.value}
                value={t.value}
                className="text-xs font-body"
              >
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleStartDispute}
            disabled={!proposedType}
            className="h-7 text-xs font-body"
          >
            Start Poll
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(false)}
            className="h-7 text-xs font-body text-muted-foreground"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (!dispute) return null;

  const currentLabel = getSourceTypeLabel(source.sourceType);
  const proposedLabel = getSourceTypeLabel(dispute.proposedType);
  const currentPct =
    totalPollVotes > 0 ? Math.round((currentVotes / totalPollVotes) * 100) : 50;
  const proposedPct =
    totalPollVotes > 0
      ? Math.round((proposedVotes / totalPollVotes) * 100)
      : 50;

  return (
    <div
      data-ocid="source_dispute.poll"
      className="p-4 bg-secondary border border-border rounded-sm space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Vote className="h-4 w-4 text-primary" />
          <span className="text-sm font-body font-semibold text-foreground">
            Category Dispute
          </span>
        </div>
        <button
          type="button"
          onClick={handleClearDispute}
          className="text-xs text-muted-foreground hover:text-foreground font-body"
        >
          Clear
        </button>
      </div>
      <p className="text-xs text-muted-foreground font-body">
        Community is voting on the correct category for{" "}
        <span className="font-mono">{source.domain}</span>
        {resolved && winner && (
          <span className="ml-1 text-primary font-medium">
            · {winner === "current" ? currentLabel : proposedLabel} wins!
          </span>
        )}
      </p>
      <div className="space-y-2">
        {/* Current category */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-body">
            <span className="text-foreground font-medium">
              Keep: {currentLabel}
            </span>
            <span className="text-muted-foreground font-mono">
              {currentVotes} votes ({currentPct}%)
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${currentPct}%` }}
            />
          </div>
        </div>
        {/* Proposed category */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-body">
            <span className="text-foreground font-medium">
              Change to: {proposedLabel}
            </span>
            <span className="text-muted-foreground font-mono">
              {proposedVotes} votes ({proposedPct}%)
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${proposedPct}%` }}
            />
          </div>
        </div>
      </div>
      {!resolved && (
        <div className="flex gap-2">
          <Button
            type="button"
            data-ocid="source_dispute.vote_current_button"
            size="sm"
            variant={myVote === "current" ? "default" : "outline"}
            onClick={() => handleVote("current")}
            disabled={!!myVote}
            className="h-7 text-xs font-body flex-1"
          >
            Keep {currentLabel}
          </Button>
          <Button
            type="button"
            data-ocid="source_dispute.vote_proposed_button"
            size="sm"
            variant={myVote === "proposed" ? "default" : "outline"}
            onClick={() => handleVote("proposed")}
            disabled={!!myVote}
            className="h-7 text-xs font-body flex-1"
          >
            Change to {proposedLabel}
          </Button>
        </div>
      )}
      {myVote && !resolved && (
        <p className="text-xs text-muted-foreground font-body text-center">
          You voted · {totalPollVotes}/10 votes to resolve
        </p>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function SourceDetailPage({
  domain,
  sessionId,
  onBack,
  onClaimClick,
}: {
  domain: string;
  sessionId: string | null;
  onBack: () => void;
  onClaimClick: (claim: Claim) => void;
}) {
  const { data: sources, isLoading } = useTrustedSources();
  const { canVoteOnSources, isExpert } = useAccountPermissions();
  const sessionIdStr = sessionId ?? "";
  const source = (sources ?? []).find(
    (s) => s.domain.toLowerCase() === domain.toLowerCase(),
  );

  const upvotes = source ? Number(source.upvotes) : 0;
  const downvotes = source ? Number(source.downvotes) : 0;
  const totalVotes = upvotes + downvotes;
  const upvoteRatio = totalVotes > 0 ? upvotes / totalVotes : 0;
  const upvotePct = Math.round(upvoteRatio * 100);
  const votesProgress = Math.min(100, (totalVotes / 25) * 100);
  const approvalProgress = Math.min(100, upvotePct);
  const needsMoreVotes = totalVotes < 25;

  // Contested indicator: trusted but ratio is narrowly above the 60% threshold
  const isNarrowlyTrusted =
    source?.isTrusted === true && upvoteRatio >= 0.6 && upvoteRatio < 0.65;

  // Suggested date from nanosecond timestamp
  const suggestedMs = source ? Number(source.timestamp) / 1_000_000 : null;
  const suggestedRelative = suggestedMs ? relativeTime(suggestedMs) : null;
  const suggestedFull = suggestedMs
    ? new Date(suggestedMs).toLocaleString()
    : null;

  // Community flagged indicator
  const { data: reportCount } = useSourceReportCount(source?.id ?? BigInt(0));
  const isFlagged = Number(reportCount ?? 0n) >= 3;

  // Auto-fetched Wikipedia blurb
  const { data: wikiBlurb, isLoading: wikiLoading } = useWikipediaBlurb(
    source?.domain ?? null,
  );

  return (
    <TooltipProvider>
      <motion.div
        data-ocid="source_detail.page"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={onBack}
          data-ocid="source_detail.link"
          className="-ml-2 font-body text-muted-foreground hover:text-foreground gap-2 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sources
        </Button>

        {isLoading ? (
          <div data-ocid="source_detail.loading_state" className="space-y-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-2 w-full" />
          </div>
        ) : !source ? (
          <div
            data-ocid="source_detail.error_state"
            className="text-center py-20 text-muted-foreground"
          >
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="font-display text-xl font-semibold mb-1">
              Source not found
            </p>
            <p className="text-sm font-body">
              <span className="font-mono">{domain}</span> is not in the sources
              directory.
            </p>
            <Button
              onClick={onBack}
              variant="outline"
              className="mt-4 font-body text-sm"
            >
              Back to Sources
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* ── Source Header ─────────────────────────────────── */}
            <div
              className={cn(
                "p-5 bg-card border rounded-sm",
                source.isTrusted
                  ? "border-emerald-500/30 shadow-sm shadow-emerald-500/5"
                  : "border-border",
              )}
            >
              {/* Domain name + trust badge row */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap mb-1.5">
                    <SourceLogo domain={source.domain} />
                    <a
                      href={`https://${source.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-display text-2xl font-bold text-foreground hover:text-primary transition-colors flex items-center gap-2"
                    >
                      {source.domain}
                      <ExternalLink className="h-4 w-4 opacity-50" />
                    </a>
                    {source.isTrusted ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center cursor-default text-emerald-600">
                            <ShieldCheck className="h-3.5 w-3.5" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="text-xs max-w-[220px]"
                        >
                          Trusted source — verified by the community with 60%+
                          approval
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center cursor-default text-amber-600">
                            <Clock className="h-3.5 w-3.5" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="text-xs max-w-[240px]"
                        >
                          Pending Review — not yet trusted. Needs 25 votes with
                          at least 60% approval to become trusted
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {source.adminOverride && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-body bg-violet-500/15 text-violet-600 border border-violet-500/30">
                        Admin Approved
                      </span>
                    )}
                    {/* Community flagged badge */}
                    {isFlagged && (
                      <span
                        data-ocid="source_detail.card"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-body bg-amber-500/15 text-amber-700 border border-amber-400/30"
                      >
                        <Flag className="h-3 w-3" />
                        Community flagged
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-body font-medium border",
                        getSourceTypeBadgeClasses(source.sourceType),
                      )}
                    >
                      {getSourceTypeLabel(source.sourceType)}
                    </span>
                    <span className="text-xs font-body text-primary font-semibold">
                      {getSourceTypeBonus(source.sourceType)} credibility bonus
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground font-body">
                  <Users className="h-3.5 w-3.5" />
                  <span>
                    Suggested by{" "}
                    <span className="font-mono">
                      {source.suggestedByUsername ||
                        source.suggestedByUsername ||
                        "unknown"}
                    </span>
                    {suggestedRelative && suggestedFull && (
                      <>
                        {" · "}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-default">
                              {suggestedRelative}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="text-xs">
                            {suggestedFull}
                          </TooltipContent>
                        </Tooltip>
                      </>
                    )}
                  </span>
                </div>

                {/* Admin override note */}
                {source.adminOverrideNote?.trim() && (
                  <div className="flex items-start gap-2 mt-2 px-3 py-2 rounded-sm bg-violet-50 border border-violet-200 text-violet-700">
                    <Shield className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-body">
                      <span className="font-semibold">Admin note:</span>{" "}
                      {source.adminOverrideNote}
                    </p>
                  </div>
                )}
              </div>

              {/* Narrowly trusted indicator */}
              {isNarrowlyTrusted && (
                <div
                  data-ocid="source_detail.card"
                  className="flex items-center gap-2 px-3 py-2 mb-4 rounded-sm bg-amber-50 border border-amber-200 text-amber-700"
                >
                  <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                  <p className="text-xs font-body">
                    <span className="font-semibold">Narrowly trusted</span> —
                    community opinions are divided.
                  </p>
                </div>
              )}

              {/* Progress bars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-body text-muted-foreground">
                      Votes toward threshold
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {totalVotes} / 25
                    </span>
                  </div>
                  <Progress
                    value={votesProgress}
                    className={cn(
                      "h-2",
                      needsMoreVotes
                        ? "[&>div]:bg-amber-400"
                        : "[&>div]:bg-emerald-500",
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-body text-muted-foreground">
                      Upvote ratio
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {upvotePct}% / 60% needed
                    </span>
                  </div>
                  <Progress
                    value={approvalProgress}
                    className={cn(
                      "h-2",
                      upvotePct >= 60
                        ? "[&>div]:bg-emerald-500"
                        : "[&>div]:bg-muted-foreground/40",
                    )}
                  />
                </div>
              </div>

              {/* Voting panel — verified accounts only */}
              <div className="flex items-center justify-center pt-1">
                {canVoteOnSources ? (
                  <VotePanel source={source} sessionId={sessionId} />
                ) : (
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground font-body">
                    <LogIn className="h-3 w-3 flex-shrink-0" />
                    Sign in to vote on sources
                  </p>
                )}
              </div>
            </div>

            {/* ── About Blurb ──────────────────────────────────── */}
            {wikiLoading ? (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 bg-primary rounded-full" />
                  <h2 className="font-display text-lg font-bold text-foreground">
                    About
                  </h2>
                </div>
                <Skeleton className="h-16 w-full rounded-sm" />
              </section>
            ) : wikiBlurb ? (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 bg-primary rounded-full" />
                  <h2 className="font-display text-lg font-bold text-foreground">
                    About
                  </h2>
                </div>
                <div className="flex gap-3 p-4 bg-secondary border border-border rounded-sm">
                  <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-body text-foreground leading-relaxed">
                    {wikiBlurb}
                  </p>
                </div>
              </section>
            ) : null}

            {/* ── Claims Citing This Source ─────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h2 className="font-display text-lg font-bold text-foreground">
                  Claims Citing This Source
                </h2>
              </div>
              <ClaimsCitingSource domain={domain} onClaimClick={onClaimClick} />
            </section>

            {/* ── Evidence Quality Breakdown ────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h2 className="font-display text-lg font-bold text-foreground">
                  Evidence Quality
                </h2>
                <span className="text-xs font-body text-muted-foreground">
                  — how well this source is cited
                </span>
              </div>
              <EvidenceQualitySection domain={domain} />
            </section>

            {/* ── Discussion ────────────────────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h2 className="font-display text-lg font-bold text-foreground">
                  Discussion
                </h2>
              </div>
              {/* Pinned admin comment */}
              {source.pinnedAdminComment?.trim() && (
                <div className="flex gap-3 p-3 mb-4 bg-violet-50 border border-violet-200 rounded-sm">
                  <Pin className="h-4 w-4 text-violet-600 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold font-body uppercase tracking-wider text-violet-600">
                        Pinned Admin Note
                      </span>
                    </div>
                    <p className="text-sm font-body text-violet-800 leading-relaxed">
                      {source.pinnedAdminComment}
                    </p>
                  </div>
                </div>
              )}
              {sessionId ? (
                <SourceDiscussion sourceId={source.id} sessionId={sessionId} />
              ) : (
                <p className="text-sm font-body text-muted-foreground">
                  Loading session…
                </p>
              )}
            </section>

            {/* ── Admin Controls ────────────────────────────────── */}
            <AdminControls source={source} />

            {/* ── Category Dispute (Expert tier only) ──────────── */}
            {isExpert && source.isTrusted && sessionIdStr && (
              <section className="mt-4">
                <SourceDisputePanel source={source} sessionId={sessionIdStr} />
              </section>
            )}
          </div>
        )}
      </motion.div>
    </TooltipProvider>
  );
}
