import { UserAvatar } from "@/components/UserAvatar";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useAllClaims,
  useProfileByUsername,
  useReputationEvents,
  useStatsByUsername,
  useTrustedSources,
  useVotesByUsername,
} from "@/hooks/useQueries";
import { useStorageClient } from "@/hooks/useStorageClient";
import {
  getActivePrincipalId,
  getUserClaims,
  getUserComments,
  getUserEvidence,
  getUserSources,
  getVerifiedVotes,
  useVerifiedAccount,
} from "@/hooks/useVerifiedAccount";
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Info,
  Layers,
  Loader2,
  MessageSquare,
  Minus,
  Pencil,
  Shield,
  ShieldCheck,
  Star,
  TrendingDown,
  TrendingUp,
  Trophy,
  Vote,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ProfilePageProps {
  username: string;
  onBack: () => void;
}

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (d.getTime() === today.getTime()) return "today";
  if (d.getTime() === yesterday.getTime()) return "yesterday";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

const TIER_CONFIG: Record<string, { label: string; className: string }> = {
  Newcomer: {
    label: "Newcomer",
    className: "bg-muted text-muted-foreground",
  },
  Contributor: {
    label: "Contributor",
    className: "bg-blue-100 text-blue-700",
  },
  Analyst: {
    label: "Analyst",
    className: "bg-amber-100 text-amber-700",
  },
  Investigator: {
    label: "Investigator",
    className: "bg-violet-100 text-violet-700",
  },
  Expert: {
    label: "Expert",
    className: "bg-primary/10 text-primary",
  },
};

const TIER_THRESHOLDS: { tier: string; min: number; next: number | null }[] = [
  { tier: "Newcomer", min: 0, next: 5 },
  { tier: "Contributor", min: 5, next: 25 },
  { tier: "Analyst", min: 25, next: 100 },
  { tier: "Investigator", min: 100, next: 500 },
  { tier: "Expert", min: 500, next: null },
];

function getReputationTier(points: number): string {
  if (points >= 500) return "Expert";
  if (points >= 100) return "Investigator";
  if (points >= 25) return "Analyst";
  if (points >= 5) return "Contributor";
  return "Newcomer";
}

function getTierProgress(points: number): {
  currentTier: string;
  nextTier: string | null;
  current: number;
  threshold: number | null;
  progressPct: number;
} {
  const tierData = TIER_THRESHOLDS.find(
    (t) => t.tier === getReputationTier(points),
  )!;
  if (tierData.next === null) {
    return {
      currentTier: tierData.tier,
      nextTier: null,
      current: points,
      threshold: null,
      progressPct: 100,
    };
  }
  const nextTierData = TIER_THRESHOLDS.find((t) => t.min === tierData.next)!;
  const progressInTier = points - tierData.min;
  const tierRange = tierData.next - tierData.min;
  return {
    currentTier: tierData.tier,
    nextTier: nextTierData.tier,
    current: points,
    threshold: tierData.next,
    progressPct: Math.min(100, (progressInTier / tierRange) * 100),
  };
}

const HOW_TO_EARN = [
  { action: "Submit a claim", pts: "+1 pt" },
  { action: "Post evidence", pts: "+1 pt" },
  { action: "Post a comment", pts: "+1 pt" },
  { action: "Cast a vote", pts: "+1 pt" },
];

const TAB_TRIGGER_CLASS =
  "data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:hover:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground hover:text-primary hover:bg-transparent px-3 py-2 text-xs font-medium font-body rounded-lg gap-1.5 h-auto transition-colors shadow-none shrink-0 whitespace-nowrap";

/** Scroll chevron button shown on mobile only */
function ScrollChevron({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
  const isRight = direction === "right";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isRight ? "Scroll tabs right" : "Scroll tabs left"}
      className={`md:hidden absolute top-0 bottom-0 z-10 flex items-center justify-center w-8 touch-manipulation ${isRight ? "right-0" : "left-0"}`}
    >
      {/* gradient fade */}
      <span
        className={`absolute inset-y-0 w-full pointer-events-none ${isRight ? "bg-gradient-to-l from-background to-transparent" : "bg-gradient-to-r from-background to-transparent"}`}
      />
      <span className="relative z-10 rounded-full bg-background/80 backdrop-blur-sm border border-border p-0.5 flex items-center justify-center shadow-sm">
        {isRight ? (
          <ChevronRight className="h-3.5 w-3.5 text-foreground" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5 text-foreground" />
        )}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Reputation event types
// ---------------------------------------------------------------------------

function eventAccent(event: {
  pointChange: number;
  trustChange: number;
  label: string;
}): {
  iconBg: string;
  iconColor: string;
  Icon: React.FC<{ className?: string }>;
} {
  const isLoss = event.pointChange < 0 || event.trustChange < 0;
  const isGain = event.pointChange > 0 || event.trustChange > 0;
  if (isLoss) {
    return {
      iconBg: "bg-red-50",
      iconColor: "text-destructive",
      Icon: TrendingDown,
    };
  }
  if (isGain) {
    return {
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      Icon: TrendingUp,
    };
  }
  return {
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
    Icon: Minus,
  };
}

function formatChange(event: {
  pointChange: number;
  trustChange: number;
}): string {
  const parts: string[] = [];
  if (event.pointChange !== 0) {
    parts.push(
      `${event.pointChange > 0 ? "+" : ""}${event.pointChange} pt${Math.abs(event.pointChange) === 1 ? "" : "s"}`,
    );
  }
  if (event.trustChange !== 0) {
    parts.push(
      `${event.trustChange > 0 ? "+" : ""}${event.trustChange}% trust`,
    );
  }
  return parts.join(" / ") || "—";
}

function changeColor(event: {
  pointChange: number;
  trustChange: number;
}): string {
  if (event.pointChange < 0 || event.trustChange < 0) return "text-destructive";
  if (event.pointChange > 0 || event.trustChange > 0) return "text-emerald-600";
  return "text-muted-foreground";
}

// ---------------------------------------------------------------------------

function formatRepEventLabel(action: string): string {
  const labels: Record<string, string> = {
    claim_submitted: "Claim submitted",
    evidence_submitted: "Evidence submitted",
    vote_cast: "Vote cast",
    reply_posted: "Comment posted",
    source_suggested: "Trusted source suggested",
  };
  return labels[action] ?? action.replace(/_/g, " ");
}

export function ProfilePage({ username, onBack }: ProfilePageProps) {
  const {
    username: currentUsername,
    joinDate,
    avatarUrl,
    setAvatarUrl,
    isVerified,
    bio,
    setBio,
    lastActive,
    activityPoints,
    trustScore,
    isTrustedContributor,
    privacySettings,
    principal,
  } = useVerifiedAccount();
  const isOwnProfile = isVerified && currentUsername === username;

  // ── Fetch other user's data when not own profile ──────────────────────────
  const { data: viewedProfile, isLoading: viewedProfileLoading } =
    useProfileByUsername(!isOwnProfile ? username : null);
  const { data: viewedStats } = useStatsByUsername(
    !isOwnProfile ? username : null,
  );

  // ── All claims & sources for filtering by other user ────────────────────
  const { data: allClaims = [] } = useAllClaims();
  const { data: allSources = [] } = useTrustedSources();

  // ── Unified display data ─────────────────────────────────────────────────
  const displayAvatar = isOwnProfile
    ? (avatarUrl ?? undefined)
    : (viewedProfile?.avatarUrl ?? undefined);

  const displayBio = isOwnProfile ? (bio ?? "") : (viewedProfile?.bio ?? "");

  const displayJoinDate = isOwnProfile
    ? joinDate
    : viewedProfile?.joinDate
      ? new Date(Number(viewedProfile.joinDate) / 1_000_000).toISOString()
      : null;

  const displayLastActive = isOwnProfile
    ? lastActive
    : viewedProfile?.lastActive
      ? new Date(Number(viewedProfile.lastActive) / 1_000_000).toISOString()
      : null;

  const displayActivityPoints = isOwnProfile
    ? activityPoints
    : Number(viewedStats?.activityPoints ?? 0);

  const displayTrustScore = isOwnProfile
    ? trustScore
    : Number(viewedStats?.trustScore ?? 0);

  const displayClaimCount = isOwnProfile
    ? null // own profile uses getUserClaims below
    : Number(viewedStats?.claimCount ?? 0);

  const displayEvidenceCount = isOwnProfile
    ? null
    : Number(viewedStats?.evidenceCount ?? 0);

  const displayCommentCount = isOwnProfile
    ? null
    : Number(viewedStats?.commentCount ?? 0);

  const displayIsTrustedContributor = isOwnProfile
    ? isTrustedContributor
    : displayActivityPoints >= 25 && displayTrustScore >= 70;

  const displayTier = getReputationTier(displayActivityPoints);
  const displayTierConfig = TIER_CONFIG[displayTier];
  const displayTierProgress = getTierProgress(displayActivityPoints);

  const displayPrivacySettings = isOwnProfile
    ? privacySettings
    : (viewedProfile?.privacySettings ?? {
        showVotes: true,
        showClaims: true,
        showEvidence: true,
        showComments: true,
      });

  // ── Own account hooks ────────────────────────────────────────────────────
  const { data: storageClient } = useStorageClient();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(bio ?? "");

  // Scroll chevron state
  const tabScrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const [earnTooltipOpen, setEarnTooltipOpen] = useState(false);

  useEffect(() => {
    const el = tabScrollRef.current;
    if (!el) return;

    function updateChevrons() {
      if (!el) return;
      setShowLeft(el.scrollLeft > 2);
      setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    }

    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(updateChevrons);
    });

    el.addEventListener("scroll", updateChevrons, { passive: true });
    const ro = new ResizeObserver(updateChevrons);
    ro.observe(el);

    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener("scroll", updateChevrons);
      ro.disconnect();
    };
  }, []);

  function scrollTabs(direction: "left" | "right") {
    const el = tabScrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === "right" ? 120 : -120,
      behavior: "smooth",
    });
  }

  const formattedJoinDate = displayJoinDate
    ? new Date(displayJoinDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const verifiedVotes = isOwnProfile ? getVerifiedVotes() : {};
  const voteCount = Object.keys(verifiedVotes).length;
  const { data: otherUserVotes = [] } = useVotesByUsername(
    !isOwnProfile && displayPrivacySettings?.showVotes !== false
      ? username
      : null,
  );

  // Activity data — own profile uses cached localStorage, other uses backend stats
  const activePrincipalId = getActivePrincipalId();
  const ownClaims =
    isOwnProfile && activePrincipalId ? getUserClaims(activePrincipalId) : [];
  const ownEvidence =
    isOwnProfile && activePrincipalId ? getUserEvidence(activePrincipalId) : [];
  const ownComments =
    isOwnProfile && activePrincipalId ? getUserComments(activePrincipalId) : [];
  const ownSources =
    isOwnProfile && activePrincipalId ? getUserSources(activePrincipalId) : [];

  // For other users: filter all claims/sources by authorUsername
  const otherUserClaims = !isOwnProfile
    ? allClaims.filter((c) => c.authorUsername === username)
    : [];
  const otherUserSources = !isOwnProfile
    ? allSources.filter((s: any) => s.suggestedByUsername === username)
    : [];

  // Reputation events from backend (own profile only)
  const { data: repEventsRaw = [] } = useReputationEvents(
    isOwnProfile ? principal : null,
  );
  const repEvents = repEventsRaw.map((e) => ({
    id: `rep-${e.timestamp.toString()}`,
    label: formatRepEventLabel(e.action),
    pointChange: Number(e.points),
    trustChange: 0,
    timestamp: new Date(Number(e.timestamp) / 1_000_000).toISOString(),
    relatedLink: undefined as string | undefined,
    relatedLabel: undefined as string | undefined,
  }));

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !storageClient) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes);
      const url = await storageClient.getDirectURL(hash);
      await setAvatarUrl(url);
      toast.success("Avatar updated!");
    } catch {
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSaveBio() {
    try {
      await setBio(bioInput.trim());
      setIsEditingBio(false);
      toast.success("Bio saved!");
    } catch {
      toast.error("Failed to save bio. Please try again.");
    }
  }

  function handleCancelBio() {
    setBioInput(bio ?? "");
    setIsEditingBio(false);
  }

  // ── Loading state for other users ────────────────────────────────────────
  if (!isOwnProfile && viewedProfileLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          data-ocid="profile.button"
          className="mb-6 gap-2 text-muted-foreground hover:text-foreground font-body -ml-2 h-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </motion.div>
    );
  }

  // ── Profile not found for other users ───────────────────────────────────
  if (!isOwnProfile && !viewedProfileLoading && !viewedProfile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          data-ocid="profile.button"
          className="mb-6 gap-2 text-muted-foreground hover:text-foreground font-body -ml-2 h-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center gap-3">
          <p className="text-muted-foreground font-body text-sm">
            Profile not found for @{username}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="max-w-xl mx-auto"
    >
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        data-ocid="profile.button"
        className="mb-6 gap-2 text-muted-foreground hover:text-foreground font-body -ml-2 h-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Profile card */}
      <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center gap-3">
        {/* Avatar + upload overlay */}
        <div className="relative group">
          <UserAvatar
            username={username}
            avatarUrl={displayAvatar}
            size="lg"
            className="ring-4 ring-border"
            isVerified={true}
          />

          {isOwnProfile && (
            <>
              <button
                type="button"
                data-ocid="profile.upload_button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || !storageClient}
                className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Change avatar"
              >
                {isUploading ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </>
          )}
        </div>

        {/* Identity block: display name + verified badge */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5">
            <h1 className="font-display text-2xl font-bold text-foreground leading-tight">
              {username}
            </h1>
            {displayIsTrustedContributor && <VerifiedBadge />}
          </div>

          {/* Reputation tier badge */}
          {displayTierConfig && (
            <span
              className={`text-xs font-body font-medium px-2.5 py-0.5 rounded-full ${displayTierConfig.className}`}
            >
              {displayTierConfig.label}
            </span>
          )}

          {/* Join date + last active */}
          <div className="flex items-center gap-2 mt-1 flex-wrap justify-center">
            {formattedJoinDate && (
              <p className="text-xs text-muted-foreground font-body">
                Member since {formattedJoinDate}
              </p>
            )}
            {displayLastActive && formattedJoinDate && (
              <span className="mx-1 text-muted-foreground/40 text-xs">·</span>
            )}
            {displayLastActive && (
              <p className="text-xs text-muted-foreground font-body">
                Active {formatRelative(displayLastActive)}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="w-full max-w-sm mt-1">
          {isOwnProfile ? (
            isEditingBio ? (
              <div className="flex flex-col gap-2">
                <Textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder="Write a short bio…"
                  className="text-sm font-body resize-none"
                  rows={3}
                  maxLength={200}
                  data-ocid="profile.textarea"
                />
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelBio}
                    data-ocid="profile.cancel_button"
                    className="h-7 text-xs font-body gap-1"
                  >
                    <X className="h-3 w-3" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveBio}
                    data-ocid="profile.save_button"
                    className="h-7 text-xs font-body gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Save
                  </Button>
                </div>
              </div>
            ) : bio ? (
              <div className="flex items-start justify-center gap-1.5 group/bio">
                <p className="text-sm text-muted-foreground font-body text-center">
                  {bio}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setBioInput(bio);
                    setIsEditingBio(true);
                  }}
                  data-ocid="profile.edit_button"
                  className="opacity-0 group-hover/bio:opacity-100 transition-opacity text-muted-foreground hover:text-foreground flex-shrink-0 mt-0.5"
                  aria-label="Edit bio"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingBio(true)}
                data-ocid="profile.secondary_button"
                className="text-xs text-muted-foreground hover:text-primary font-body transition-colors w-full text-center"
              >
                + Add a bio…
              </button>
            )
          ) : displayBio ? (
            <p className="text-sm text-muted-foreground font-body text-center">
              {displayBio}
            </p>
          ) : null}
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-4 flex flex-col gap-3">
        {/* 4-column activity stats */}
        <div className="grid grid-cols-4 bg-muted/50 rounded-xl px-2 py-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl font-bold font-display text-foreground leading-none">
              {isOwnProfile ? voteCount : otherUserVotes.length}
            </span>
            <span className="text-[11px] text-muted-foreground font-body">
              Votes
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl font-bold font-display text-foreground leading-none">
              {isOwnProfile ? ownClaims.length : displayClaimCount}
            </span>
            <span className="text-[11px] text-muted-foreground font-body">
              Claims
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl font-bold font-display text-foreground leading-none">
              {isOwnProfile ? ownEvidence.length : displayEvidenceCount}
            </span>
            <span className="text-[11px] text-muted-foreground font-body">
              Evidence
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl font-bold font-display text-foreground leading-none">
              {isOwnProfile ? ownComments.length : displayCommentCount}
            </span>
            <span className="text-[11px] text-muted-foreground font-body">
              Comments
            </span>
          </div>
        </div>

        {/* Trust Score */}
        <div className="bg-primary/[0.04] rounded-xl px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold font-body text-foreground">
                  Trust Score
                </span>
                <p className="text-[11px] text-muted-foreground font-body mt-0.5">
                  How accurate your contributions have been
                </p>
              </div>
            </div>
            <span className="text-xl font-bold font-display text-primary leading-none">
              {displayTrustScore}%
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-1.5">
            <div
              className="bg-primary rounded-full h-1.5 transition-all duration-500"
              style={{ width: `${Math.min(100, displayTrustScore)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Reputation & Trusted Contributor Progress */}
      <div className="mt-4 bg-muted/40 border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold font-display text-foreground">
            Reputation Progress
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {/* Tier progress */}
          {displayTierProgress.nextTier === null ? (
            <div className="flex items-center gap-2 py-1">
              <Star className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span className="text-[11px] font-semibold font-display text-primary">
                Max tier reached
              </span>
              <span className="text-[11px] text-muted-foreground font-body ml-auto">
                {displayActivityPoints} pts
              </span>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-muted-foreground font-body">
                    Tier — {displayTierProgress.currentTier} →{" "}
                    {displayTierProgress.nextTier}
                  </span>
                  {isOwnProfile && (
                    <TooltipProvider delayDuration={100}>
                      <Tooltip
                        open={earnTooltipOpen}
                        onOpenChange={setEarnTooltipOpen}
                      >
                        <TooltipTrigger asChild data-ocid="profile.tooltip">
                          <button
                            type="button"
                            className="inline-flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground transition-colors focus-visible:outline-none"
                            aria-label="How to earn points"
                            onClick={() => setEarnTooltipOpen((v) => !v)}
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          align="start"
                          className="max-w-[200px] p-3 bg-white text-foreground border border-border shadow-md"
                        >
                          <p className="text-[11px] font-semibold text-foreground mb-2">
                            How to earn points
                          </p>
                          <div className="flex flex-col gap-1">
                            {HOW_TO_EARN.map(({ action, pts }) => (
                              <div
                                key={action}
                                className="flex items-center justify-between gap-3"
                              >
                                <span className="text-[11px] text-muted-foreground">
                                  {action}
                                </span>
                                <span className="text-[11px] font-semibold text-primary font-mono flex-shrink-0">
                                  {pts}
                                </span>
                              </div>
                            ))}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border/50 leading-relaxed">
                            Trusted Contributor badge also requires a 70%+ trust
                            score
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <span className="text-[11px] font-semibold font-display text-foreground">
                  {displayActivityPoints}/{displayTierProgress.threshold}
                </span>
              </div>
              <div className="w-full bg-border rounded-full h-1.5">
                <div
                  className="bg-primary rounded-full h-1.5 transition-all"
                  style={{ width: `${displayTierProgress.progressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Trusted Contributor progress — only when not yet earned */}
          {!displayIsTrustedContributor && (
            <>
              <div className="border-t border-border/60 pt-2.5 -mx-0">
                <p className="text-[11px] text-muted-foreground font-body mb-2.5">
                  Earn the Trusted Contributor badge by reaching Analyst tier
                  (25 pts) with a 70%+ trust score
                </p>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[11px] text-muted-foreground font-body">
                    Activity Points
                  </span>
                  <span className="text-[11px] font-semibold font-display text-foreground">
                    {displayActivityPoints}/25
                  </span>
                </div>
                <div className="w-full bg-border rounded-full h-1.5">
                  <div
                    className="bg-primary rounded-full h-1.5 transition-all"
                    style={{
                      width: `${Math.min(100, (displayActivityPoints / 25) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[11px] text-muted-foreground font-body">
                    Trust Score
                  </span>
                  <span className="text-[11px] font-semibold font-display text-foreground">
                    {displayTrustScore}% / 70% required
                  </span>
                </div>
                <div className="w-full bg-border rounded-full h-1.5">
                  <div
                    className="bg-primary rounded-full h-1.5 transition-all"
                    style={{
                      width: `${Math.min(100, (displayTrustScore / 70) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Activity tabs */}
      <div className="mt-5">
        <Tabs
          defaultValue={
            isOwnProfile || displayPrivacySettings?.showVotes !== false
              ? "votes"
              : "claims"
          }
        >
          <div className="relative">
            {showLeft && (
              <ScrollChevron
                direction="left"
                onClick={() => scrollTabs("left")}
              />
            )}

            <div
              ref={tabScrollRef}
              className="overflow-x-auto -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <TabsList className="flex gap-x-1 flex-nowrap bg-transparent p-0 h-auto w-max">
                {(isOwnProfile ||
                  displayPrivacySettings?.showVotes !== false) && (
                  <TabsTrigger
                    value="votes"
                    data-ocid="profile.tab"
                    className={TAB_TRIGGER_CLASS}
                  >
                    <Vote className="h-3.5 w-3.5" />
                    Votes
                  </TabsTrigger>
                )}
                {(isOwnProfile ||
                  displayPrivacySettings?.showClaims !== false) && (
                  <TabsTrigger
                    value="claims"
                    data-ocid="profile.tab"
                    className={TAB_TRIGGER_CLASS}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Claims
                  </TabsTrigger>
                )}
                {(isOwnProfile ||
                  displayPrivacySettings?.showEvidence !== false) && (
                  <TabsTrigger
                    value="evidence"
                    data-ocid="profile.tab"
                    className={TAB_TRIGGER_CLASS}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    Evidence
                  </TabsTrigger>
                )}
                {(isOwnProfile ||
                  displayPrivacySettings?.showComments !== false) && (
                  <TabsTrigger
                    value="comments"
                    data-ocid="profile.tab"
                    className={TAB_TRIGGER_CLASS}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Comments
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="sources"
                  data-ocid="profile.tab"
                  className={TAB_TRIGGER_CLASS}
                >
                  <Shield className="h-3.5 w-3.5" />
                  Sources
                </TabsTrigger>
                <TabsTrigger
                  value="reputation"
                  data-ocid="profile.tab"
                  className={TAB_TRIGGER_CLASS}
                >
                  <Trophy className="h-3.5 w-3.5" />
                  Reputation
                </TabsTrigger>
              </TabsList>
            </div>

            {showRight && (
              <ScrollChevron
                direction="right"
                onClick={() => scrollTabs("right")}
              />
            )}
          </div>

          {/* ── Votes tab ── */}
          {(isOwnProfile || displayPrivacySettings?.showVotes !== false) && (
            <TabsContent value="votes" className="mt-4">
              {isOwnProfile ? (
                voteCount === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center py-12 text-center"
                    data-ocid="profile.empty_state"
                  >
                    <Vote className="h-8 w-8 text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-body text-muted-foreground">
                      No votes yet
                    </p>
                    <p className="text-xs font-body text-muted-foreground/60 mt-1">
                      Votes you cast on claims will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-lg divide-y divide-border">
                    {Object.entries(verifiedVotes).map(
                      ([claimId, record], i) => (
                        <div
                          key={claimId}
                          data-ocid={`profile.item.${i + 1}`}
                          className="flex items-center justify-between px-4 py-3 gap-3"
                        >
                          <span className="text-sm font-body text-foreground truncate">
                            {record.claimTitle}
                          </span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span
                              className={`text-xs font-body font-medium px-1.5 py-0.5 rounded ${
                                record.voteType === "True"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : record.voteType === "False"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {record.voteType === "True"
                                ? "REBUNKED"
                                : record.voteType === "False"
                                  ? "DEBUNKED"
                                  : "Unverified"}
                            </span>
                            <span className="text-xs text-muted-foreground font-body">
                              {new Date(record.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )
              ) : otherUserVotes.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-12 text-center"
                  data-ocid="profile.empty_state"
                >
                  <Vote className="h-8 w-8 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-body text-muted-foreground">
                    No votes yet
                  </p>
                  <p className="text-xs font-body text-muted-foreground/60 mt-1">
                    Votes cast on claims will appear here.
                  </p>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg divide-y divide-border">
                  {otherUserVotes.map((vote, i) => (
                    <div
                      key={`${vote.claimId}-${i}`}
                      data-ocid={`profile.item.${i + 1}`}
                      className="flex items-center justify-between px-4 py-3 gap-3"
                    >
                      <a
                        href={`/claim/${vote.claimId}`}
                        className="text-sm font-body text-foreground truncate hover:underline"
                      >
                        {vote.claimTitle || `Claim #${vote.claimId}`}
                      </a>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`text-xs font-body font-medium px-1.5 py-0.5 rounded ${
                            vote.verdict === "True"
                              ? "bg-emerald-100 text-emerald-700"
                              : vote.verdict === "False"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {vote.verdict === "True"
                            ? "REBUNKED"
                            : vote.verdict === "False"
                              ? "DEBUNKED"
                              : "Unverified"}
                        </span>
                        <span className="text-xs text-muted-foreground font-body">
                          {new Date(
                            Number(vote.timestamp) / 1_000_000,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          )}

          {/* ── Claims tab ── */}
          <TabsContent value="claims" className="mt-4">
            {(() => {
              const claims = isOwnProfile ? ownClaims : null;
              const otherClaims = !isOwnProfile ? otherUserClaims : null;
              if (isOwnProfile) {
                return (claims ?? []).length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center py-12 text-center"
                    data-ocid="profile.empty_state"
                  >
                    <FileText className="h-8 w-8 text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-body text-muted-foreground">
                      No claims submitted yet
                    </p>
                    <p className="text-xs font-body text-muted-foreground/60 mt-1">
                      Claims you submit will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-xl overflow-hidden">
                    {(claims ?? []).map((record, i) => (
                      <div
                        key={record.claimId}
                        data-ocid={`profile.item.${i + 1}`}
                        className={`flex items-center justify-between px-4 py-3 gap-3 ${i < (claims ?? []).length - 1 ? "border-b border-border/50" : ""}`}
                      >
                        <span className="text-sm font-body text-foreground truncate flex-1">
                          {record.title}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-body font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {record.category}
                          </span>
                          <span className="text-xs text-muted-foreground font-body">
                            {new Date(record.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }
              // other user's claims from backend
              return (otherClaims ?? []).length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-12 text-center"
                  data-ocid="profile.empty_state"
                >
                  <FileText className="h-8 w-8 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-body text-muted-foreground">
                    No claims submitted yet
                  </p>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  {(otherClaims ?? []).map((claim: any, i: number) => (
                    <div
                      key={claim.id?.toString() ?? i}
                      data-ocid={`profile.item.${i + 1}`}
                      className={`flex items-center justify-between px-4 py-3 gap-3 ${i < (otherClaims ?? []).length - 1 ? "border-b border-border/50" : ""}`}
                    >
                      <span className="text-sm font-body text-foreground truncate flex-1">
                        {claim.title}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-body font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {claim.category}
                        </span>
                        <span className="text-xs text-muted-foreground font-body">
                          {new Date(
                            Number(claim.timestamp) / 1_000_000,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </TabsContent>

          {/* ── Evidence tab ── */}
          <TabsContent value="evidence" className="mt-4">
            {isOwnProfile ? (
              ownEvidence.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-12 text-center"
                  data-ocid="profile.empty_state"
                >
                  <Layers className="h-8 w-8 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-body text-muted-foreground">
                    No evidence posted yet
                  </p>
                  <p className="text-xs font-body text-muted-foreground/60 mt-1">
                    Evidence you submit on claims will appear here.
                  </p>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  {ownEvidence.map((record, i) => (
                    <div
                      key={record.evidenceId}
                      data-ocid={`profile.item.${i + 1}`}
                      className={`flex items-start justify-between px-4 py-3 gap-3 ${i < ownEvidence.length - 1 ? "border-b border-border/50" : ""}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-body text-foreground truncate">
                          {record.text.length > 80
                            ? `${record.text.slice(0, 80)}…`
                            : record.text}
                        </p>
                        {record.claimTitle && (
                          <p className="text-[11px] text-muted-foreground font-body mt-0.5 truncate">
                            on: {record.claimTitle}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`text-xs font-body font-medium px-1.5 py-0.5 rounded ${record.evidenceType === "True" ? "bg-emerald-100 text-emerald-700" : record.evidenceType === "False" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}
                        >
                          {record.evidenceType}
                        </span>
                        <span className="text-xs text-muted-foreground font-body">
                          {new Date(record.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div
                className="flex flex-col items-center justify-center py-12 text-center"
                data-ocid="profile.empty_state"
              >
                <Layers className="h-8 w-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-body text-muted-foreground">
                  Evidence not available
                </p>
                <p className="text-xs font-body text-muted-foreground/60 mt-1">
                  Evidence details are not public for other users.
                </p>
              </div>
            )}
          </TabsContent>

          {/* ── Comments tab ── */}
          <TabsContent value="comments" className="mt-4">
            {isOwnProfile ? (
              ownComments.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-12 text-center"
                  data-ocid="profile.empty_state"
                >
                  <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-body text-muted-foreground">
                    No comments yet
                  </p>
                  <p className="text-xs font-body text-muted-foreground/60 mt-1">
                    Comments you post will appear here.
                  </p>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  {ownComments.map((record, i) => (
                    <div
                      key={record.replyId}
                      data-ocid={`profile.item.${i + 1}`}
                      className={`flex items-center justify-between px-4 py-3 gap-3 ${i < ownComments.length - 1 ? "border-b border-border/50" : ""}`}
                    >
                      <span className="text-sm font-body text-foreground truncate flex-1">
                        {record.text.length > 100
                          ? `${record.text.slice(0, 100)}…`
                          : record.text}
                      </span>
                      <span className="text-xs text-muted-foreground font-body flex-shrink-0">
                        {new Date(record.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div
                className="flex flex-col items-center justify-center py-12 text-center"
                data-ocid="profile.empty_state"
              >
                <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-body text-muted-foreground">
                  Comments not available
                </p>
                <p className="text-xs font-body text-muted-foreground/60 mt-1">
                  Comment details are not public for other users.
                </p>
              </div>
            )}
          </TabsContent>

          {/* ── Sources tab ── */}
          <TabsContent value="sources" className="mt-4">
            {(() => {
              const sources = isOwnProfile ? ownSources : otherUserSources;
              return sources.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-12 text-center"
                  data-ocid="profile.empty_state"
                >
                  <Shield className="h-8 w-8 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-body text-muted-foreground">
                    No sources suggested yet
                  </p>
                  <p className="text-xs font-body text-muted-foreground/60 mt-1">
                    Trusted sources suggested by this user will appear here.
                  </p>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  {sources.map((record: any, i: number) => (
                    <div
                      key={
                        (record.domain ?? record.claimId) +
                        (record.timestamp ?? i)
                      }
                      data-ocid={`profile.item.${i + 1}`}
                      className={`flex items-center justify-between px-4 py-3 gap-3 ${i < sources.length - 1 ? "border-b border-border/50" : ""}`}
                    >
                      <span className="text-sm font-body text-foreground font-medium truncate flex-1">
                        {record.domain}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-body font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">
                          {(record.sourceType ?? record.type ?? "").replace(
                            /_/g,
                            " ",
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground font-body">
                          {record.timestamp
                            ? new Date(
                                typeof record.timestamp === "string"
                                  ? record.timestamp
                                  : Number(record.timestamp) / 1_000_000,
                              ).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </TabsContent>

          {/* ── Reputation tab ── */}
          <TabsContent
            value="reputation"
            className="mt-4"
            data-ocid="profile.panel"
          >
            {!isOwnProfile ? (
              <div
                className="flex flex-col items-center justify-center py-12 text-center"
                data-ocid="profile.empty_state"
              >
                <Trophy className="h-8 w-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-body text-muted-foreground">
                  Reputation history is private
                </p>
                <p className="text-xs font-body text-muted-foreground/60 mt-1">
                  Only visible to the account owner.
                </p>
              </div>
            ) : repEvents.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-12 text-center"
                data-ocid="profile.empty_state"
              >
                <Trophy className="h-8 w-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-body text-muted-foreground">
                  No reputation events yet
                </p>
                <p className="text-xs font-body text-muted-foreground/60 mt-1">
                  Start contributing to earn points.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Summary row */}
                <div className="flex items-center gap-3 flex-wrap bg-muted/50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold font-display text-foreground">
                      {displayActivityPoints} pts
                    </span>
                  </div>
                  <span className="mx-1 text-muted-foreground/40 text-xs">
                    ·
                  </span>
                  <span
                    className={`text-xs font-body font-medium px-2 py-0.5 rounded-full ${displayTierConfig?.className ?? "bg-muted text-muted-foreground"}`}
                  >
                    {displayTier}
                  </span>
                  <span className="mx-1 text-muted-foreground/40 text-xs">
                    ·
                  </span>
                  <span className="text-xs font-body text-muted-foreground">
                    <span className="font-semibold text-primary">
                      {displayTrustScore}%
                    </span>{" "}
                    trust score
                  </span>
                </div>

                {/* Event feed */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  {repEvents.map((event, i) => {
                    const { iconBg, iconColor, Icon } = eventAccent(event);
                    const change = formatChange(event);
                    const color = changeColor(event);
                    return (
                      <div
                        key={event.id}
                        data-ocid={`profile.item.${i + 1}`}
                        className={`flex items-start gap-3 px-4 py-3 ${i < repEvents.length - 1 ? "border-b border-border/50" : ""}`}
                      >
                        <div
                          className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${iconBg}`}
                        >
                          <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-body text-foreground leading-snug">
                              {event.label}
                            </p>
                            <span
                              className={`text-xs font-mono font-semibold flex-shrink-0 ${color}`}
                            >
                              {change}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-[11px] text-muted-foreground font-body">
                              {timeAgo(new Date(event.timestamp))}
                            </span>
                            {event.relatedLink && event.relatedLabel && (
                              <>
                                <span className="mx-1 text-muted-foreground/40 text-[11px]">
                                  ·
                                </span>
                                <a
                                  href={event.relatedLink}
                                  className="text-[11px] text-muted-foreground hover:text-primary font-body underline-offset-2 hover:underline transition-colors truncate max-w-[160px]"
                                >
                                  {event.relatedLabel}
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
