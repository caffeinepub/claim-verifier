import type { Claim, Evidence } from "@/backend.d";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useAllEvidenceTallies,
  useClaimById,
  useEnhancedVoteTally,
  useEvidence,
  useSessionVote,
  useSubmitEvidence,
  useSubmitVote,
  useUsername,
} from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/time";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  Flag,
  Flame,
  HelpCircle,
  Link2,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  RefreshCw,
  Search,
  Send,
  Share2,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type SortOption = "most_upvotes" | "most_downvotes" | "newest" | "oldest";

function sortEvidence(
  items: Evidence[],
  sort: SortOption,
  tallies: Record<string, number>,
): Evidence[] {
  const arr = [...items];
  switch (sort) {
    case "most_upvotes":
      return arr.sort(
        (a, b) =>
          (tallies[b.id.toString()] ?? 0) - (tallies[a.id.toString()] ?? 0),
      );
    case "most_downvotes":
      return arr.sort(
        (a, b) =>
          (tallies[a.id.toString()] ?? 0) - (tallies[b.id.toString()] ?? 0),
      );
    case "newest":
      return arr.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
    case "oldest":
      return arr.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
  }
}
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { Input } from "@/components/ui/input";
import { useReportContent } from "@/hooks/useQueries";
import { useSessionGate } from "@/hooks/useSessionGate";
import {
  getVerifiedVoteForClaim,
  isVerifiedSessionId,
  useVerifiedAccount,
} from "@/hooks/useVerifiedAccount";
import { getClaimSlug } from "@/utils/slug";
import { computeOverallVerdict } from "@/utils/verdict";
import { CategoryBadge } from "./CategoryBadge";
import { EvidenceTypeBadge } from "./EvidenceTypeBadge";
import { EvidenceVoteButtons } from "./EvidenceVoteButtons";
import { ImageUploader } from "./ImageUploader";
import { Lightbox } from "./Lightbox";
import { OverallVerdictBanner } from "./OverallVerdictBanner";
import { ReplyThread } from "./ReplyThread";
import { ReportDialog } from "./ReportDialog";
import { TrustedSourceBadgeList } from "./TrustedSourceBadgeList";
import { UrlInputList } from "./UrlInputList";
import { VerdictBar } from "./VerdictBar";

interface ClaimDetailProps {
  claimId: bigint;
  sessionId: string;
  allClaims: Claim[];
  onBack: () => void;
}

function UrlChips({ urls }: { urls: string[] }) {
  const valid = urls.filter((u) => u.trim());
  if (!valid.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {valid.map((url, i) => (
        <a
          // biome-ignore lint/suspicious/noArrayIndexKey: stable ordered list
          key={i}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-secondary border border-border text-xs font-body text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors max-w-[200px]"
        >
          <Link2 className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{url.replace(/^https?:\/\//, "")}</span>
          <ExternalLink className="h-2.5 w-2.5 flex-shrink-0 opacity-60" />
        </a>
      ))}
    </div>
  );
}

function ImageGrid({
  imageUrls,
  size = "md",
}: {
  imageUrls: string[];
  size?: "sm" | "md";
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!imageUrls.length) return null;
  const heightClass = size === "sm" ? "h-24" : "h-32";

  function openLightbox(index: number) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-3">
        {imageUrls.map((url, i) => (
          <button
            // biome-ignore lint/suspicious/noArrayIndexKey: stable ordered list
            key={i}
            type="button"
            data-ocid="image.open_modal_button"
            onClick={() => openLightbox(i)}
            className={cn(
              "block rounded-sm overflow-hidden border border-border hover:border-primary/40 transition-colors flex-shrink-0 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
              heightClass,
            )}
            aria-label={`View attachment ${i + 1} fullscreen`}
          >
            <img
              src={url}
              alt={`Attachment ${i + 1}`}
              className={cn("object-cover h-full w-auto max-w-[160px]")}
              loading="lazy"
              draggable={false}
            />
          </button>
        ))}
      </div>
      <Lightbox
        imageUrls={imageUrls}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}

export function ClaimDetail({
  claimId,
  sessionId,
  allClaims,
  onBack,
}: ClaimDetailProps) {
  const [evidenceText, setEvidenceText] = useState("");
  const [hotTooltipOpen, setHotTooltipOpen] = useState(false);
  const [evidenceImageUrls, setEvidenceImageUrls] = useState<string[]>([]);
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>("most_upvotes");
  const [evidenceSearch, setEvidenceSearch] = useState("");
  const [evidenceCooldownLeft, setEvidenceCooldownLeft] = useState(0);
  const [evidenceType, setEvidenceType] = useState<
    "True" | "False" | "Unverified"
  >("Unverified");
  const [evidenceTypeFilter, setEvidenceTypeFilter] = useState<
    "all" | "True" | "False" | "Unverified"
  >("all");
  // Track reported evidence IDs locally (set of stringified bigints)
  const [reportedEvidence, setReportedEvidence] = useState<Set<string>>(
    new Set(),
  );
  // Claim report dialog
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  // Evidence report dialog — tracks which evidence id is being reported
  const [reportingEvidenceId, setReportingEvidenceId] = useState<bigint | null>(
    null,
  );

  const { data: claim, isLoading: claimLoading } = useClaimById(claimId);
  const {
    data: tally,
    isLoading: tallyLoading,
    isError: tallyError,
    refetch: refetchTally,
  } = useEnhancedVoteTally(claimId);
  const { data: sessionVote } = useSessionVote(claimId, sessionId);
  const { data: evidence, isLoading: evidenceLoading } = useEvidence(claimId);

  // Hot threshold: 10+ total votes as proxy for activity
  const claimTotalVotes = tally
    ? Math.max(0, Number(tally.trueCount)) +
      Math.max(0, Number(tally.falseCount)) +
      Math.max(0, Number(tally.unverifiedCount))
    : 0;
  const username = useUsername();
  const {
    isVerified,
    recordVerifiedVote,
    displayName: verifiedDisplayName,
  } = useVerifiedAccount();

  const evidenceIds = useMemo(
    () => (evidence ?? []).map((e) => e.id),
    [evidence],
  );
  const { data: tallies = {} } = useAllEvidenceTallies(evidenceIds);

  const sortedEvidence = useMemo(
    () => (evidence ? sortEvidence(evidence, sortOption, tallies) : []),
    [evidence, sortOption, tallies],
  );

  const typeFilteredEvidence = useMemo(() => {
    if (evidenceTypeFilter === "all") return sortedEvidence;
    return sortedEvidence.filter((item) => {
      const type =
        item.evidenceType && item.evidenceType !== ""
          ? item.evidenceType
          : "Unverified";
      return type === evidenceTypeFilter;
    });
  }, [sortedEvidence, evidenceTypeFilter]);

  const filteredEvidence = useMemo(() => {
    if (!evidenceSearch.trim()) return typeFilteredEvidence;
    const q = evidenceSearch.toLowerCase();
    return typeFilteredEvidence.filter(
      (item) =>
        item.text.toLowerCase().includes(q) ||
        (item.urls ?? []).some((url) => url.toLowerCase().includes(q)),
    );
  }, [typeFilteredEvidence, evidenceSearch]);
  const submitVote = useSubmitVote();
  const submitEvidence = useSubmitEvidence();
  const reportContent = useReportContent();
  const { checkAction, checkVoteAction } = useSessionGate();

  const hasVoted = !!sessionVote;

  // Evidence cooldown countdown
  useEffect(() => {
    if (evidenceCooldownLeft <= 0) return;
    const timer = setInterval(() => {
      setEvidenceCooldownLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [evidenceCooldownLeft]);

  function formatCountdown(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  async function handleShare() {
    if (!claim) return;
    const slug = getClaimSlug(claim, allClaims);
    const url = `${window.location.origin}/claim/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  }

  async function handleVote(verdict: string) {
    if (!sessionId || hasVoted) return;
    if (!checkVoteAction()) return;
    try {
      await submitVote.mutateAsync({ claimId, sessionId, verdict });
      toast.success(`Your verdict: ${verdict}`);
      // Record verified vote for 1.5x multiplier tracking
      if (isVerified && claim) {
        recordVerifiedVote(claimId.toString(), sessionId, verdict, claim.title);
      }
    } catch {
      toast.error("Failed to record vote");
    }
  }

  async function handleSubmitEvidence(e: React.FormEvent) {
    e.preventDefault();
    if (!evidenceText.trim() || !sessionId || evidenceCooldownLeft > 0) return;
    if (!checkAction()) return;
    try {
      await submitEvidence.mutateAsync({
        claimId,
        sessionId,
        text: evidenceText.trim(),
        imageUrls: evidenceImageUrls,
        urls: evidenceUrls.filter((u) => u.trim()),
        evidenceType,
      });
      toast.success("Evidence submitted");
      setEvidenceText("");
      setEvidenceImageUrls([]);
      setEvidenceUrls([]);
      setEvidenceType("Unverified");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.startsWith("cooldown:")) {
        const secs = Number.parseInt(msg.split(":")[1], 10);
        setEvidenceCooldownLeft(Number.isFinite(secs) ? secs : 120);
      } else if (msg.startsWith("duplicate:")) {
        const detail = msg.replace(/^duplicate:/, "").trim();
        toast.error(detail || "Similar evidence already exists.");
      } else {
        toast.error("Failed to submit evidence");
      }
    }
  }

  async function handleReportClaim(_reason: string) {
    if (!checkAction()) return;
    await reportContent.mutateAsync({
      targetId: claimId,
      targetType: "claim",
      sessionId,
    });
  }

  async function handleReportEvidenceConfirm(_reason: string) {
    if (!reportingEvidenceId) return;
    if (!checkAction()) return;
    const key = reportingEvidenceId.toString();
    await reportContent.mutateAsync({
      targetId: reportingEvidenceId,
      targetType: "evidence",
      sessionId,
    });
    setReportedEvidence((prev) => new Set([...prev, key]));
  }

  return (
    <motion.div
      data-ocid="claim_detail.panel"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto"
    >
      {/* Back button row */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          data-ocid="nav.back_button"
          className="-ml-2 font-body text-muted-foreground hover:text-foreground gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Claims
        </Button>

        {claim && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              data-ocid="claim_detail.share_button"
              className="font-body gap-2 border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
              aria-label="Copy claim link to clipboard"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReportDialogOpen(true)}
              data-ocid="claim_detail.report_button"
              className="font-body gap-2 border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
              aria-label="Report this claim"
            >
              <Flag className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Report</span>
            </Button>
          </div>
        )}
      </div>

      {claimLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : claim ? (
        <article className="space-y-6">
          {/* Header */}
          <header>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <CategoryBadge category={claim.category} />
              <span className="text-xs text-muted-foreground font-body">
                {formatRelativeTime(claim.timestamp)}
              </span>
              <span className="text-xs text-muted-foreground font-body">
                ·{" "}
                {claim.sessionId === sessionId && claim.sessionId !== "seed"
                  ? (verifiedDisplayName ?? username)
                  : "Anonymous"}
              </span>
            </div>
            <div className="mb-4">
              <h1 className="font-display text-3xl font-bold leading-tight text-foreground">
                {claim.title}
                {claimTotalVotes >= 10 && (
                  <TooltipProvider>
                    <Tooltip
                      open={hotTooltipOpen}
                      onOpenChange={setHotTooltipOpen}
                    >
                      <TooltipTrigger asChild>
                        <Flame
                          className="inline w-6 h-6 text-orange-500 ml-2 align-middle relative -top-[3px] sm:-top-[3px] cursor-pointer"
                          aria-label="Hot claim"
                          onClick={(e) => {
                            e.stopPropagation();
                            setHotTooltipOpen((v) => !v);
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>High activity in the last 24 hours</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </h1>
            </div>
            <p className="font-body text-base text-muted-foreground leading-relaxed">
              {claim.description}
            </p>
            {/* Claim images */}
            <ImageGrid imageUrls={claim.imageUrls ?? []} size="md" />
            {/* Claim URLs */}
            <UrlChips urls={claim.urls ?? []} />
          </header>

          <div className="h-px masthead-rule" />

          {/* Verdict Tally */}
          <section>
            <h2 className="font-display text-lg font-semibold mb-4 text-foreground">
              Community Verdict
            </h2>
            {tallyLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-3 w-full rounded-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ) : tallyError ? (
              <div
                data-ocid="verdict.error_state"
                className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold font-body">
                    Could not load verdict data
                  </p>
                  <p className="text-xs font-body opacity-80 mt-0.5">
                    The canister may be temporarily unavailable.
                  </p>
                </div>
                <button
                  type="button"
                  data-ocid="verdict.retry_button"
                  onClick={() => refetchTally()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-body border border-destructive/40 hover:bg-destructive/20 transition-colors flex-shrink-0"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </button>
              </div>
            ) : tally ? (
              (() => {
                // Apply 1.5x bonus for verified user's vote (+0.5 extra)
                const verifiedVoteRecord = getVerifiedVoteForClaim(
                  claimId.toString(),
                );
                const verifiedBonus = verifiedVoteRecord ? 0.5 : 0;
                const verifiedTrueBonus =
                  verifiedVoteRecord?.voteType === "True" ? verifiedBonus : 0;
                const verifiedFalseBonus =
                  verifiedVoteRecord?.voteType === "False" ? verifiedBonus : 0;
                const verifiedUnverifiedBonus =
                  verifiedVoteRecord?.voteType === "Unverified"
                    ? verifiedBonus
                    : 0;
                const detailVerdict = computeOverallVerdict(
                  Number(tally.trueCount) + verifiedTrueBonus,
                  Number(tally.falseCount) + verifiedFalseBonus,
                  Number(tally.unverifiedCount) + verifiedUnverifiedBonus,
                  true,
                  Number(tally.trueDirect),
                  Number(tally.falseDirect),
                );
                return (
                  <div className="space-y-4">
                    <OverallVerdictBanner verdict={detailVerdict} />
                    <VerdictBar
                      trueCount={tally.trueCount}
                      falseCount={tally.falseCount}
                      unverifiedCount={tally.unverifiedCount}
                      breakdown={{
                        trueDirect: tally.trueDirect,
                        trueFromEvidence: tally.trueFromEvidence,
                        falseDirect: tally.falseDirect,
                        falseFromEvidence: tally.falseFromEvidence,
                        unverifiedDirect: tally.unverifiedDirect,
                        unverifiedFromEvidence: tally.unverifiedFromEvidence,
                      }}
                    />
                  </div>
                );
              })()
            ) : null}
          </section>

          {/* Vote Buttons */}
          <section>
            <h2 className="font-display text-lg font-semibold mb-3 text-foreground">
              Cast Your Verdict
            </h2>
            <p className="text-sm text-muted-foreground font-body mb-4">
              {hasVoted
                ? `You've already voted: ${sessionVote}. Only one vote is allowed per claim.`
                : "Vote anonymously. Your session ID is used to track one vote per claim."}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                data-ocid="claim_detail.true_button"
                onClick={() => handleVote("True")}
                disabled={submitVote.isPending || hasVoted}
                variant="outline"
                className={cn(
                  "font-body gap-2 border-2 transition-all",
                  sessionVote === "True"
                    ? "bg-verdict-true-subtle border-verdict-true verdict-true"
                    : hasVoted
                      ? "border-border opacity-40 cursor-not-allowed"
                      : "border-border hover:border-verdict-true hover:bg-verdict-true-subtle hover:verdict-true",
                )}
              >
                {submitVote.isPending &&
                submitVote.variables?.verdict === "True" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                True
              </Button>

              <Button
                data-ocid="claim_detail.false_button"
                onClick={() => handleVote("False")}
                disabled={submitVote.isPending || hasVoted}
                variant="outline"
                className={cn(
                  "font-body gap-2 border-2 transition-all",
                  sessionVote === "False"
                    ? "bg-verdict-false-subtle border-verdict-false verdict-false"
                    : hasVoted
                      ? "border-border opacity-40 cursor-not-allowed"
                      : "border-border hover:border-verdict-false hover:bg-verdict-false-subtle hover:verdict-false",
                )}
              >
                {submitVote.isPending &&
                submitVote.variables?.verdict === "False" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                False
              </Button>

              <Button
                data-ocid="claim_detail.unverified_button"
                onClick={() => handleVote("Unverified")}
                disabled={submitVote.isPending || hasVoted}
                variant="outline"
                className={cn(
                  "font-body gap-2 border-2 transition-all",
                  sessionVote === "Unverified"
                    ? "bg-verdict-unverified-subtle border-verdict-unverified verdict-unverified"
                    : hasVoted
                      ? "border-border opacity-40 cursor-not-allowed"
                      : "border-border hover:border-verdict-unverified hover:bg-verdict-unverified-subtle hover:verdict-unverified",
                )}
              >
                {submitVote.isPending &&
                submitVote.variables?.verdict === "Unverified" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <HelpCircle className="h-4 w-4" />
                )}
                Unverified
              </Button>
            </div>
          </section>

          <div className="h-px masthead-rule" />

          {/* Evidence */}
          <section>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <MessageSquare className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <h2 className="font-display text-lg font-semibold text-foreground">
                Community Evidence
              </h2>
              {evidence && (
                <span className="text-sm text-muted-foreground font-body">
                  ({evidence.length})
                </span>
              )}
            </div>

            {/* Add Evidence Form */}
            <form onSubmit={handleSubmitEvidence} className="mb-6">
              <div className="space-y-3">
                <Textarea
                  data-ocid="evidence.textarea"
                  placeholder="Share a source, counter-argument, or supporting evidence…"
                  value={evidenceText}
                  onChange={(e) => setEvidenceText(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  className="bg-secondary border-border font-body resize-none"
                />

                {/* Image uploader */}
                <div>
                  <p className="text-xs text-muted-foreground font-body mb-1.5">
                    Attach images (optional)
                  </p>
                  <ImageUploader
                    onUploaded={setEvidenceImageUrls}
                    maxFiles={5}
                    ocidPrefix="evidence.image"
                  />
                </div>

                {/* URL list */}
                <div>
                  <p className="text-xs text-muted-foreground font-body mb-1.5">
                    Attach links (optional)
                  </p>
                  <UrlInputList
                    urls={evidenceUrls}
                    onChange={setEvidenceUrls}
                    ocidPrefix="evidence.url"
                    placeholder="https://example.com/source"
                  />
                </div>

                {/* Evidence type selector */}
                <div data-ocid="evidence.type_selector" className="space-y-1.5">
                  <p className="text-xs text-muted-foreground font-body">
                    This evidence suggests the claim is:
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      data-ocid="evidence.type.true_button"
                      onClick={() => setEvidenceType("True")}
                      className={cn(
                        "flex-1 h-8 text-xs font-body font-medium rounded border transition-all duration-150",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500/60",
                        evidenceType === "True"
                          ? "bg-green-500/20 text-green-500 border-green-500/50 ring-1 ring-green-500/30"
                          : "bg-transparent text-muted-foreground border-border hover:border-green-500/40 hover:text-green-500 hover:bg-green-500/10",
                      )}
                    >
                      True
                    </button>
                    <button
                      type="button"
                      data-ocid="evidence.type.false_button"
                      onClick={() => setEvidenceType("False")}
                      className={cn(
                        "flex-1 h-8 text-xs font-body font-medium rounded border transition-all duration-150",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500/60",
                        evidenceType === "False"
                          ? "bg-red-500/20 text-red-500 border-red-500/50 ring-1 ring-red-500/30"
                          : "bg-transparent text-muted-foreground border-border hover:border-red-500/40 hover:text-red-500 hover:bg-red-500/10",
                      )}
                    >
                      False
                    </button>
                    <button
                      type="button"
                      data-ocid="evidence.type.unverified_button"
                      onClick={() => setEvidenceType("Unverified")}
                      className={cn(
                        "flex-1 h-8 text-xs font-body font-medium rounded border transition-all duration-150",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60",
                        evidenceType === "Unverified"
                          ? "bg-muted/80 text-foreground border-border ring-1 ring-border"
                          : "bg-transparent text-muted-foreground border-border hover:border-primary/40 hover:text-foreground hover:bg-muted/40",
                      )}
                    >
                      Unverified
                    </button>
                  </div>
                </div>

                {evidenceCooldownLeft > 0 && (
                  <div
                    data-ocid="evidence.loading_state"
                    className="flex items-center gap-2 text-xs text-amber-400 font-body bg-amber-400/10 border border-amber-400/20 rounded-sm px-3 py-2"
                  >
                    <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>
                      You can add evidence again in{" "}
                      <span className="font-mono font-bold">
                        {formatCountdown(evidenceCooldownLeft)}
                      </span>
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-body">
                    {evidenceText.length}/1000
                  </span>
                  <Button
                    type="submit"
                    data-ocid="evidence.submit_button"
                    disabled={
                      submitEvidence.isPending ||
                      evidenceCooldownLeft > 0 ||
                      !evidenceText.trim()
                    }
                    size="sm"
                    className="font-body gap-2 bg-primary text-primary-foreground"
                  >
                    {submitEvidence.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : evidenceCooldownLeft > 0 ? (
                      <Clock className="h-3 w-3" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                    {evidenceCooldownLeft > 0 ? "On Cooldown" : "Add Evidence"}
                  </Button>
                </div>
              </div>
            </form>

            {/* Sort / filter / search controls — single row */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  data-ocid="evidence.search_input"
                  placeholder="Search evidence by text or URL…"
                  value={evidenceSearch}
                  onChange={(e) => setEvidenceSearch(e.target.value)}
                  className="pl-9 h-8 text-xs bg-secondary border-border font-body"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    data-ocid="evidence.filter_sort.open_modal_button"
                    className="h-8 text-xs font-body gap-1.5 bg-secondary border-border text-muted-foreground hover:text-foreground flex-shrink-0"
                  >
                    <span>
                      {evidenceTypeFilter === "all"
                        ? "All"
                        : evidenceTypeFilter}{" "}
                      ·{" "}
                      {sortOption === "most_upvotes"
                        ? "Most Upvotes"
                        : sortOption === "most_downvotes"
                          ? "Most Downvotes"
                          : sortOption === "newest"
                            ? "Newest"
                            : "Oldest"}
                    </span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  data-ocid="evidence.filter_sort.dropdown_menu"
                  className="w-44 font-body"
                >
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-body font-medium px-2 py-1">
                    Filter by
                  </DropdownMenuLabel>
                  {(["all", "True", "False", "Unverified"] as const).map(
                    (filter) => (
                      <DropdownMenuItem
                        key={filter}
                        data-ocid="evidence.filter.tab"
                        onClick={() => setEvidenceTypeFilter(filter)}
                        className="text-xs font-body gap-2 cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "h-3.5 w-3.5 flex-shrink-0",
                            evidenceTypeFilter === filter
                              ? "opacity-100 text-primary"
                              : "opacity-0",
                          )}
                        />
                        {filter === "all" ? "All" : filter}
                      </DropdownMenuItem>
                    ),
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-body font-medium px-2 py-1">
                    Sort by
                  </DropdownMenuLabel>
                  {(
                    [
                      { value: "most_upvotes", label: "Most Upvotes" },
                      { value: "most_downvotes", label: "Most Downvotes" },
                      { value: "newest", label: "Newest" },
                      { value: "oldest", label: "Oldest" },
                    ] as const
                  ).map(({ value, label }) => (
                    <DropdownMenuItem
                      key={value}
                      data-ocid="evidence.sort.select"
                      onClick={() => setSortOption(value)}
                      className="text-xs font-body gap-2 cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "h-3.5 w-3.5 flex-shrink-0",
                          sortOption === value
                            ? "opacity-100 text-primary"
                            : "opacity-0",
                        )}
                      />
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Evidence List */}
            {evidenceLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="space-y-2 p-3 bg-secondary rounded-sm"
                  >
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))}
              </div>
            ) : filteredEvidence.length > 0 ? (
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredEvidence.map((item, idx) => (
                    <motion.div
                      key={item.id.toString()}
                      data-ocid={`evidence.item.${idx + 1}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 bg-secondary border border-border rounded-sm"
                    >
                      {/* Line 1: username · timestamp [evidence type badge] */}
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-semibold text-foreground font-mono flex items-center gap-1">
                          {item.sessionId === sessionId
                            ? (verifiedDisplayName ?? username)
                            : "Anonymous"}
                          {isVerifiedSessionId(item.sessionId) && (
                            <VerifiedBadge />
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground font-body">
                          · {formatRelativeTime(item.timestamp)}
                        </span>
                        <EvidenceTypeBadge
                          data-ocid={`evidence.badge.${idx + 1}`}
                          evidenceType={
                            item.evidenceType && item.evidenceType !== ""
                              ? item.evidenceType
                              : "Unverified"
                          }
                        />
                      </div>

                      {/* Line 2: evidence text */}
                      <p className="text-sm text-foreground font-body leading-relaxed mb-1">
                        {item.text}
                      </p>

                      {/* Evidence images */}
                      <ImageGrid imageUrls={item.imageUrls ?? []} size="sm" />
                      {/* Evidence URLs */}
                      <UrlChips urls={item.urls ?? []} />
                      <TrustedSourceBadgeList urls={item.urls ?? []} />

                      {/* Bottom row: vote buttons (left) + report (right) */}
                      <div className="flex items-center justify-between mt-2 gap-2">
                        <EvidenceVoteButtons
                          evidenceId={item.id}
                          sessionId={sessionId}
                          index={idx + 1}
                          claimId={claimId}
                        />
                        <div className="flex items-center gap-1">
                          {/* Ellipsis menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                data-ocid={`evidence.dropdown_menu.${idx + 1}`}
                                aria-label="More options"
                                className="flex items-center justify-center w-6 h-6 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                              <DropdownMenuItem
                                data-ocid={`evidence.secondary_button.${idx + 1}`}
                                className="text-gray-500 cursor-pointer gap-2"
                                onClick={() =>
                                  navigator.clipboard.writeText(
                                    window.location.href,
                                  )
                                }
                              >
                                <Share2 className="h-3.5 w-3.5 text-gray-500" />
                                <span>Share</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                data-ocid={`evidence.delete_button.${idx + 1}`}
                                className="text-gray-500 cursor-pointer gap-2"
                                disabled={reportedEvidence.has(
                                  item.id.toString(),
                                )}
                                onClick={() => setReportingEvidenceId(item.id)}
                              >
                                <Flag className="h-3.5 w-3.5 text-gray-500" />
                                <span>
                                  {reportedEvidence.has(item.id.toString())
                                    ? "Reported"
                                    : "Report"}
                                </span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      {/* Threaded replies */}
                      <ReplyThread
                        evidenceId={item.id}
                        sessionId={sessionId}
                        evidenceIndex={idx + 1}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : evidenceSearch.trim() ? (
              <div
                data-ocid="evidence.empty_state"
                className="text-center py-8 text-muted-foreground font-body"
              >
                <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No evidence matches your search.</p>
                <p className="text-xs mt-1 opacity-70">
                  Try different keywords or clear the search.
                </p>
              </div>
            ) : (
              <div
                data-ocid="evidence.empty_state"
                className="text-center py-8 text-muted-foreground font-body"
              >
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No evidence submitted yet.</p>
                <p className="text-xs mt-1 opacity-70">
                  Be the first to share a source or argument.
                </p>
              </div>
            )}
          </section>

          {/* Claim report dialog */}
          <ReportDialog
            isOpen={reportDialogOpen}
            onClose={() => setReportDialogOpen(false)}
            onConfirm={handleReportClaim}
            title="Report Claim"
          />

          {/* Evidence report dialog */}
          <ReportDialog
            isOpen={reportingEvidenceId !== null}
            onClose={() => setReportingEvidenceId(null)}
            onConfirm={handleReportEvidenceConfirm}
            title="Report Evidence"
          />
        </article>
      ) : (
        <div
          data-ocid="claim_detail.error_state"
          className="text-center py-16 text-muted-foreground"
        >
          <p>Claim not found.</p>
          <Button variant="ghost" onClick={onBack} className="mt-4 font-body">
            Go back
          </Button>
        </div>
      )}
    </motion.div>
  );
}
