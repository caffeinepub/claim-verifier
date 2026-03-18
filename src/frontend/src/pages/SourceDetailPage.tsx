import type { Claim, Evidence } from "@/backend.d";
import { SourceDiscussion } from "@/components/SourceDiscussion";
import { UserProfileCard } from "@/components/UserProfileCard";
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
import { Textarea } from "@/components/ui/textarea";
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
  useAllEvidenceForAllClaims,
  useAllEvidenceTallies,
  useEnhancedVoteTally,
  useTrustedSources,
  useWikipediaBlurb,
} from "@/hooks/useQueries";
import { useSessionGate } from "@/hooks/useSessionGate";
import { useVerifiedAccount } from "@/hooks/useVerifiedAccount";
import { cn } from "@/lib/utils";
import {
  SourceLogo,
  getSourceTypeBadgeClasses,
  getSourceTypeLabel,
} from "@/pages/TrustedSourcesPage";
import { computeSourceCredibility } from "@/utils/sourceCredibility";
import { computeOverallVerdict } from "@/utils/verdict";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart2,
  BookOpen,
  ChevronUp,
  ExternalLink,
  FileQuestion,
  Flag,
  Loader2,
  LogIn,
  Pencil,
  Pin,
  Shield,
  ShieldCheck,
  Users,
  Vote,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const ADMIN_PASSWORD = "lunasimbaliamsammy123!";
const ADMIN_SESSION_KEY = "rebunked_admin_authed";

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
function CredibilityBadge({
  credibility,
}: {
  credibility: ReturnType<typeof computeSourceCredibility>;
}) {
  if (credibility.status === "insufficient") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-body font-medium border bg-muted text-muted-foreground border-border">
        Insufficient Data
      </span>
    );
  }
  const colorMap: Record<string, string> = {
    "High Credibility":
      "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    Mixed: "bg-amber-500/15 text-amber-700 border-amber-400/30",
    "Low Credibility": "bg-red-500/15 text-red-700 border-red-400/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-body font-medium border",
        colorMap[credibility.label],
      )}
    >
      {credibility.label}
    </span>
  );
}

function EvidencePerformanceSection({
  credibility,
}: {
  credibility: ReturnType<typeof computeSourceCredibility>;
}) {
  return (
    <section>
      {credibility.status === "insufficient" ? (
        <>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-body">
              <span className="text-muted-foreground">Citations so far</span>
              <span className="font-mono text-foreground">
                {credibility.citations} / 5
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${(credibility.citations / 5) * 100}%` }}
              />
            </div>
          </div>
          <p className="text-xs font-body text-muted-foreground italic mt-1.5">
            Insufficient data — needs {5 - credibility.citations} more citation
            {5 - credibility.citations !== 1 ? "s" : ""} for a score
          </p>
        </>
      ) : (
        <div className="p-4 bg-card border border-border rounded-sm space-y-4">
          {/* Score */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-body font-semibold text-foreground">
                Credibility Score
              </p>
              <p className="text-xs font-body text-muted-foreground mt-0.5">
                Based on quality-cleared evidence performance
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold font-mono text-foreground">
                {Math.round(credibility.score)}
                <span className="text-sm font-body text-muted-foreground">
                  /100
                </span>
              </p>
              <CredibilityBadge credibility={credibility} />
            </div>
          </div>

          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                credibility.label === "High Credibility"
                  ? "bg-emerald-500"
                  : credibility.label === "Mixed"
                    ? "bg-amber-400"
                    : "bg-red-400",
              )}
              style={{ width: `${Math.round(credibility.score)}%` }}
            />
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-secondary rounded-sm">
              <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider mb-1">
                Quality-cleared
              </p>
              <p className="text-lg font-bold font-mono text-foreground">
                {credibility.qualityCleared}
                <span className="text-xs text-muted-foreground font-body">
                  /{credibility.totalCitations}
                </span>
              </p>
              <p className="text-[10px] font-body text-muted-foreground mt-0.5">
                {Math.round(credibility.passRate)}% pass rate
              </p>
            </div>
            <div className="p-3 bg-secondary rounded-sm">
              <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider mb-1">
                Avg net score
              </p>
              <p className="text-lg font-bold font-mono text-foreground">
                +{credibility.avgNetScore.toFixed(1)}
              </p>
              <p className="text-[10px] font-body text-muted-foreground mt-0.5">
                quality-cleared only
              </p>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground font-body border-t border-border pt-3">
            Only evidence with net score &ge;+3 counts. Score = avg net score
            (60%) + pass rate (40%). Updates as evidence accumulates.
          </p>
        </div>
      )}
    </section>
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
  const [isOpen, setIsOpen] = useState(
    () => sessionStorage.getItem(ADMIN_SESSION_KEY) === "1",
  );
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem(ADMIN_SESSION_KEY) === "1",
  );
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
      sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
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
  const { isExpert } = useAccountPermissions();
  const sessionIdStr = sessionId ?? "";
  const source = (sources ?? []).find(
    (s) => s.domain.toLowerCase() === domain.toLowerCase(),
  );

  // Evidence-based credibility
  const allEvidence = useAllEvidenceForAllClaims();
  const evidenceIds = useMemo(
    () => allEvidence.map((e) => e.id),
    [allEvidence],
  );
  const { data: tallies } = useAllEvidenceTallies(evidenceIds);
  const allEvidenceWithScores = useMemo(
    () =>
      allEvidence.map((e) => ({
        ...e,
        netScore: tallies?.[e.id.toString()] ?? 0,
      })),
    [allEvidence, tallies],
  );
  const credibility = useMemo(
    () => computeSourceCredibility(domain, allEvidenceWithScores),
    [domain, allEvidenceWithScores],
  );

  // Suggested date from nanosecond timestamp

  // Community flagged indicator
  const { data: reportCount } = useSourceReportCount(source?.id ?? BigInt(0));
  const isFlagged = Number(reportCount ?? 0n) >= 3;

  // Auto-fetched Wikipedia blurb
  const { data: wikiBlurb, isLoading: wikiLoading } = useWikipediaBlurb(
    source?.domain ?? null,
  );

  // About blurb: use backend source.aboutBlurb or wiki, with localStorage fallback for editing
  const { username: currentUsername } = useVerifiedAccount();
  const manualBlurbAdminKey = `about_blurb_admin_${domain}`;
  const manualBlurbKey = `about_blurb_${domain}`;
  const [manualBlurb, setManualBlurb] = useState<string>(
    () =>
      localStorage.getItem(manualBlurbAdminKey) ??
      localStorage.getItem(manualBlurbKey) ??
      "",
  );
  const [editingBlurb, setEditingBlurb] = useState(false);
  const [blurbDraft, setBlurbDraft] = useState("");

  // Check if current user is admin or the source suggester (by username)
  const isAdminSession = sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
  const isSuggester =
    !!currentUsername &&
    !!source?.suggestedByUsername &&
    currentUsername === source.suggestedByUsername;
  const canEditBlurb = isAdminSession || isSuggester;

  // Determine which About blurb to show (priority: admin override > wiki > backend blurb > suggester local)
  const adminBlurb = localStorage.getItem(manualBlurbAdminKey) ?? "";
  const suggestorBlurb = localStorage.getItem(manualBlurbKey) ?? "";
  const displayedBlurb =
    adminBlurb || wikiBlurb || source?.aboutBlurb || suggestorBlurb || "";

  function startEditBlurb() {
    setBlurbDraft(manualBlurb);
    setEditingBlurb(true);
  }

  function saveBlurb() {
    const trimmed = blurbDraft.trim();
    const key = isAdminSession ? manualBlurbAdminKey : manualBlurbKey;
    if (trimmed) {
      localStorage.setItem(key, trimmed);
    } else {
      localStorage.removeItem(key);
    }
    setManualBlurb(trimmed);
    setEditingBlurb(false);
    toast.success("About description saved");
  }

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
                "pl-4 border-l-4",
                credibility.status === "scored" &&
                  credibility.label === "High Credibility"
                  ? "border-l-green-500"
                  : credibility.status === "scored" &&
                      credibility.label === "Low Credibility"
                    ? "border-l-red-500"
                    : "border-l-amber-400",
              )}
            >
              {/* Row 1: Favicon + domain + status badge */}
              <div className="flex items-start gap-3 flex-wrap mb-4">
                <SourceLogo domain={source.domain} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1.5">
                    <a
                      href={`https://${source.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-display text-2xl font-bold text-foreground hover:text-primary transition-colors flex items-center gap-2"
                    >
                      {source.domain}
                      <ExternalLink className="h-4 w-4 opacity-50" />
                    </a>
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
                </div>
              </div>

              {/* About blurb — directly beneath domain/badge row */}
              {wikiLoading ? (
                <Skeleton className="h-16 w-full rounded-sm" />
              ) : displayedBlurb ? (
                <div className="mt-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    {canEditBlurb && !wikiBlurb && !editingBlurb && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-muted-foreground gap-1 ml-auto"
                        onClick={startEditBlurb}
                        data-ocid="source_detail.edit_button"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Button>
                    )}
                  </div>
                  {editingBlurb ? (
                    <div className="space-y-2">
                      <Textarea
                        value={blurbDraft}
                        onChange={(e) =>
                          setBlurbDraft(e.target.value.slice(0, 500))
                        }
                        placeholder="Add a description for this source..."
                        className="text-sm font-body resize-none min-h-[96px]"
                        data-ocid="source_detail.textarea"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-body">
                          {blurbDraft.length}/500
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setEditingBlurb(false)}
                            data-ocid="source_detail.cancel_button"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-xs"
                            onClick={saveBlurb}
                            data-ocid="source_detail.save_button"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-body text-muted-foreground leading-relaxed">
                      {displayedBlurb}
                    </p>
                  )}
                </div>
              ) : canEditBlurb ? (
                <div className="mt-3">
                  {editingBlurb ? (
                    <div className="space-y-2">
                      <Textarea
                        value={blurbDraft}
                        onChange={(e) =>
                          setBlurbDraft(e.target.value.slice(0, 500))
                        }
                        placeholder="Add a description for this source..."
                        className="text-sm font-body resize-none min-h-[96px]"
                        data-ocid="source_detail.textarea"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-body">
                          {blurbDraft.length}/500
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setEditingBlurb(false)}
                            data-ocid="source_detail.cancel_button"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-xs"
                            onClick={saveBlurb}
                            data-ocid="source_detail.save_button"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={startEditBlurb}
                      className="w-full flex gap-3 p-3 bg-secondary border border-dashed border-border rounded-sm text-left hover:bg-muted/50 transition-colors"
                      data-ocid="source_detail.edit_button"
                    >
                      <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-body text-muted-foreground leading-relaxed">
                        Add a description for this source...
                      </p>
                    </button>
                  )}
                </div>
              ) : null}

              {/* Evidence Performance — directly beneath About */}
              <div className="mt-3">
                <EvidencePerformanceSection credibility={credibility} />
              </div>

              {/* Row 2: Stat row — credibility score + citation count */}
              {credibility.status === "scored" && (
                <div className="flex items-center gap-6 mb-4 pt-3 border-t border-border">
                  <div>
                    <p className="text-xs font-body text-muted-foreground mb-0.5">
                      Credibility Score
                    </p>
                    <p className="text-2xl font-bold font-mono text-foreground leading-none">
                      {Math.round(credibility.score)}
                      <span className="text-sm font-body text-muted-foreground font-normal">
                        /100
                      </span>
                    </p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div>
                    <p className="text-xs font-body text-muted-foreground mb-0.5">
                      Evidence Citations
                    </p>
                    <p className="text-2xl font-bold font-mono text-foreground leading-none">
                      {credibility.totalCitations}
                      <span className="text-sm font-body text-muted-foreground font-normal ml-1">
                        citation{credibility.totalCitations !== 1 ? "s" : ""}
                      </span>
                    </p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div>
                    <p className="text-xs font-body text-muted-foreground mb-0.5">
                      Pass Rate
                    </p>
                    <p className="text-2xl font-bold font-mono text-foreground leading-none">
                      {Math.round(credibility.passRate)}
                      <span className="text-sm font-body text-muted-foreground font-normal">
                        %
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Full-width credibility bar */}
              {credibility.status === "scored" && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-body font-semibold text-foreground">
                      Source Credibility
                    </p>
                    <p className="text-xs font-body text-muted-foreground">
                      {Math.round(credibility.score)}/100
                    </p>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        credibility.label === "High Credibility"
                          ? "bg-emerald-500"
                          : credibility.label === "Mixed"
                            ? "bg-amber-400"
                            : "bg-red-400",
                      )}
                      style={{ width: `${Math.round(credibility.score)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Admin override note */}
              {source.adminOverrideNote?.trim() && (
                <div className="flex items-start gap-2 mt-4 px-3 py-2 rounded-sm bg-violet-50 border border-violet-200 text-violet-700">
                  <Shield className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-body">
                    <span className="font-semibold">Admin note:</span>{" "}
                    {source.adminOverrideNote}
                  </p>
                </div>
              )}
            </div>

            {/* ── Evidence Quality Breakdown ────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h2 className="font-display text-base font-semibold text-foreground">
                  Evidence Quality
                </h2>
                <span className="text-xs font-body text-muted-foreground">
                  — how well this source is cited
                </span>
              </div>
              <EvidenceQualitySection domain={domain} />
            </section>

            {/* ── Claims Citing This Source ─────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h2 className="font-display text-base font-semibold text-foreground">
                  Claims Citing This Source
                </h2>
              </div>
              <ClaimsCitingSource domain={domain} onClaimClick={onClaimClick} />
            </section>

            {/* ── Discussion ────────────────────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h2 className="font-display text-base font-semibold text-foreground">
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
