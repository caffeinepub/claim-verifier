import { UserAvatar } from "@/components/UserAvatar";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStorageClient } from "@/hooks/useStorageClient";
import {
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
  Star,
  TrendingDown,
  TrendingUp,
  Trophy,
  Vote,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
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

type RepEventKind =
  | "evidence_upvoted"
  | "evidence_downvoted"
  | "claim_submitted"
  | "vote_cast"
  | "comment_posted"
  | "evidence_quality_gate"
  | "evidence_below_gate";

interface RepEvent {
  id: string;
  kind: RepEventKind;
  label: string;
  pointChange: number; // 0 means trust-only
  trustChange: number; // 0 means points-only
  timestamp: Date;
  relatedLink?: string;
  relatedLabel?: string;
}

const REP_EVENT_TEMPLATES: {
  kind: RepEventKind;
  label: string;
  pts: number;
  trust: number;
}[] = [
  { kind: "evidence_upvoted", label: "Evidence upvoted", pts: 1, trust: 1 },
  {
    kind: "evidence_downvoted",
    label: "Evidence downvoted",
    pts: 0,
    trust: -1,
  },
  { kind: "claim_submitted", label: "Claim submitted", pts: 1, trust: 0 },
  { kind: "vote_cast", label: "Vote cast", pts: 1, trust: 0 },
  { kind: "comment_posted", label: "Comment posted", pts: 1, trust: 0 },
  {
    kind: "evidence_quality_gate",
    label: "Evidence passed quality gate",
    pts: 2,
    trust: 2,
  },
  {
    kind: "evidence_below_gate",
    label: "Evidence downvoted below quality gate",
    pts: 0,
    trust: -2,
  },
];

const MOCK_CLAIM_TITLES = [
  "Is the Earth flat?",
  "Did NASA fake the moon landing?",
  "Do vaccines cause autism?",
  "Is 5G causing health problems?",
  "Was climate data manipulated?",
  "Did ancient Egypt use electricity?",
  "Are crop circles man-made?",
];

/** Seeded pseudo-random number generator (mulberry32) */
function mulberry32(initSeed: number) {
  let s = initSeed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (Math.imul(h, 0x01000193) | 0) >>> 0;
  }
  return h;
}

function generateMockRepEvents(seed: string): RepEvent[] {
  const rng = mulberry32(hashString(seed));
  const now = Date.now();
  const events: RepEvent[] = [];

  for (let i = 0; i < 15; i++) {
    const templateIdx = Math.floor(rng() * REP_EVENT_TEMPLATES.length);
    const tpl = REP_EVENT_TEMPLATES[templateIdx];
    // Spread events over the last 30 days, most recent first after sorting
    const offsetMs = rng() * 30 * 24 * 60 * 60 * 1000;
    const timestamp = new Date(now - offsetMs);

    const hasLink = rng() > 0.4;
    const claimTitle =
      MOCK_CLAIM_TITLES[Math.floor(rng() * MOCK_CLAIM_TITLES.length)];

    events.push({
      id: `rep-${i}`,
      kind: tpl.kind,
      label: tpl.label,
      pointChange: tpl.pts,
      trustChange: tpl.trust,
      timestamp,
      relatedLink: hasLink ? "/" : undefined,
      relatedLabel: hasLink ? claimTitle : undefined,
    });
  }

  // Sort most-recent first
  events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return events;
}

function eventAccent(event: RepEvent): {
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
  if (
    event.kind === "claim_submitted" ||
    event.kind === "vote_cast" ||
    event.kind === "comment_posted"
  ) {
    return {
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      Icon: TrendingUp,
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

function formatChange(event: RepEvent): string {
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

function changeColor(event: RepEvent): string {
  if (event.pointChange < 0 || event.trustChange < 0) return "text-destructive";
  if (event.pointChange > 0 || event.trustChange > 0) return "text-emerald-600";
  return "text-muted-foreground";
}

// ---------------------------------------------------------------------------

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
  } = useVerifiedAccount();
  const isOwnProfile = isVerified && currentUsername === username;

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

    // Defer initial check until after paint so scrollWidth is accurate
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(updateChevrons);
    });

    el.addEventListener("scroll", updateChevrons, { passive: true });
    // Also re-check on resize in case layout shifts
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

  const formattedJoinDate = joinDate
    ? new Date(joinDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const verifiedVotes = isOwnProfile ? getVerifiedVotes() : {};
  const voteCount = Object.keys(verifiedVotes).length;
  const tier = getReputationTier(activityPoints);
  const tierConfig = TIER_CONFIG[tier];
  const tierProgress = getTierProgress(activityPoints);

  // Seeded mock reputation events — stable across renders
  const repEvents = useMemo(
    () => generateMockRepEvents(username || "anon"),
    [username],
  );

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
      setAvatarUrl(url);
      toast.success("Avatar updated!");
    } catch {
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleSaveBio() {
    setBio(bioInput.trim());
    setIsEditingBio(false);
    toast.success("Bio saved!");
  }

  function handleCancelBio() {
    setBioInput(bio ?? "");
    setIsEditingBio(false);
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
            avatarUrl={isOwnProfile ? (avatarUrl ?? undefined) : undefined}
            size="lg"
            className="ring-4 ring-border"
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
            {isTrustedContributor && <VerifiedBadge />}
          </div>

          {/* Reputation tier badge — below display name */}
          {isOwnProfile && tierConfig && (
            <span
              className={`text-xs font-body font-medium px-2.5 py-0.5 rounded-full ${tierConfig.className}`}
            >
              {tierConfig.label}
            </span>
          )}

          {/* Join date + last active */}
          <div className="flex items-center gap-2 mt-1 flex-wrap justify-center">
            {formattedJoinDate && (
              <p className="text-xs text-muted-foreground font-body">
                Member since {formattedJoinDate}
              </p>
            )}
            {lastActive && formattedJoinDate && (
              <span className="text-muted-foreground/40 text-xs">·</span>
            )}
            {lastActive && (
              <p className="text-xs text-muted-foreground font-body">
                Active {formatRelative(lastActive)}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {isOwnProfile && (
          <div className="w-full max-w-sm mt-1">
            {isEditingBio ? (
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
            )}
          </div>
        )}
      </div>

      {/* Stats row — own profile only */}
      {isOwnProfile && (
        <div className="mt-4 flex flex-col gap-3">
          {/* 4-column activity stats in a single light gray row */}
          <div className="grid grid-cols-4 bg-muted/50 rounded-xl px-2 py-4">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl font-bold font-display text-foreground leading-none">
                {voteCount}
              </span>
              <span className="text-[11px] text-muted-foreground font-body">
                Votes
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl font-bold font-display text-foreground leading-none">
                0
              </span>
              <span className="text-[11px] text-muted-foreground font-body">
                Claims
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl font-bold font-display text-foreground leading-none">
                0
              </span>
              <span className="text-[11px] text-muted-foreground font-body">
                Evidence
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl font-bold font-display text-foreground leading-none">
                0
              </span>
              <span className="text-[11px] text-muted-foreground font-body">
                Comments
              </span>
            </div>
          </div>

          {/* Trust Score — separate quality metric block */}
          <div className="bg-primary/[0.04] rounded-xl px-5 py-4">
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <span className="text-xs font-semibold font-body text-foreground">
                  Trust Score
                </span>
                <p className="text-[11px] text-muted-foreground font-body mt-0.5">
                  How accurate your contributions have been
                </p>
              </div>
              <span className="text-xl font-bold font-display text-primary leading-none">
                {trustScore}%
              </span>
            </div>
            <div className="w-full bg-border rounded-full h-1.5">
              <div
                className="bg-primary rounded-full h-1.5 transition-all duration-500"
                style={{ width: `${Math.min(100, trustScore)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Reputation & Trusted Contributor Progress — own profile only */}
      {isOwnProfile && (
        <div className="mt-4 bg-muted/40 border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold font-display text-foreground">
              Reputation Progress
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {/* Tier progress */}
            {tierProgress.nextTier === null ? (
              /* Expert — max tier reached */
              <div className="flex items-center gap-2 py-1">
                <Star className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="text-[11px] font-semibold font-display text-primary">
                  Max tier reached
                </span>
                <span className="text-[11px] text-muted-foreground font-body ml-auto">
                  {activityPoints} pts
                </span>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-muted-foreground font-body">
                      Tier — {tierProgress.currentTier} →{" "}
                      {tierProgress.nextTier}
                    </span>
                    {/* Info tooltip: how to earn points */}
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
                  </div>
                  <span className="text-[11px] font-semibold font-display text-foreground">
                    {activityPoints}/{tierProgress.threshold}
                  </span>
                </div>
                <div className="w-full bg-border rounded-full h-1.5">
                  <div
                    className="bg-primary rounded-full h-1.5 transition-all"
                    style={{ width: `${tierProgress.progressPct}%` }}
                  />
                </div>
              </div>
            )}

            {/* Trusted Contributor progress — only when not yet earned */}
            {!isTrustedContributor && (
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
                      {activityPoints}/25
                    </span>
                  </div>
                  <div className="w-full bg-border rounded-full h-1.5">
                    <div
                      className="bg-primary rounded-full h-1.5 transition-all"
                      style={{
                        width: `${Math.min(100, (activityPoints / 25) * 100)}%`,
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
                      {trustScore}% / 70% required
                    </span>
                  </div>
                  <div className="w-full bg-border rounded-full h-1.5">
                    <div
                      className="bg-primary rounded-full h-1.5 transition-all"
                      style={{
                        width: `${Math.min(100, (trustScore / 70) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Activity tabs — own profile only */}
      {isOwnProfile && (
        <div className="mt-5">
          <Tabs defaultValue="votes">
            {/*
             * Scrollable tab strip on mobile with dynamic scroll chevrons.
             * The outer wrapper is relative + overflow-hidden so chevrons
             * can be absolutely positioned on the edges.
             * The inner scroll div gets the ref and handles overflow-x-auto.
             */}
            <div className="relative">
              {/* Left chevron — shown when scrolled right */}
              {showLeft && (
                <ScrollChevron
                  direction="left"
                  onClick={() => scrollTabs("left")}
                />
              )}

              {/* Scrollable tab container */}
              <div
                ref={tabScrollRef}
                className="overflow-x-auto -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                <TabsList className="flex gap-x-1 flex-nowrap bg-transparent p-0 h-auto w-max">
                  <TabsTrigger
                    value="votes"
                    data-ocid="profile.tab"
                    className={TAB_TRIGGER_CLASS}
                  >
                    <Vote className="h-3.5 w-3.5" />
                    Votes
                  </TabsTrigger>
                  <TabsTrigger
                    value="claims"
                    data-ocid="profile.tab"
                    className={TAB_TRIGGER_CLASS}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Claims
                  </TabsTrigger>
                  <TabsTrigger
                    value="evidence"
                    data-ocid="profile.tab"
                    className={TAB_TRIGGER_CLASS}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    Evidence
                  </TabsTrigger>
                  <TabsTrigger
                    value="comments"
                    data-ocid="profile.tab"
                    className={TAB_TRIGGER_CLASS}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Comments
                  </TabsTrigger>
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

              {/* Right chevron — shown when more tabs exist to the right */}
              {showRight && (
                <ScrollChevron
                  direction="right"
                  onClick={() => scrollTabs("right")}
                />
              )}
            </div>

            <TabsContent value="votes" className="mt-4">
              {voteCount === 0 ? (
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
                  {Object.entries(verifiedVotes).map(([claimId, record], i) => (
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
                          {record.voteType}
                        </span>
                        <span className="text-xs text-muted-foreground font-body">
                          {new Date(record.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="claims" className="mt-4">
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
            </TabsContent>

            <TabsContent value="evidence" className="mt-4">
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
            </TabsContent>

            <TabsContent value="comments" className="mt-4">
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
            </TabsContent>

            <TabsContent value="sources" className="mt-4">
              <div
                className="flex flex-col items-center justify-center py-12 text-center"
                data-ocid="profile.empty_state"
              >
                <Shield className="h-8 w-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-body text-muted-foreground">
                  No sources suggested yet
                </p>
                <p className="text-xs font-body text-muted-foreground/60 mt-1">
                  Trusted sources you suggest will appear here.
                </p>
              </div>
            </TabsContent>

            {/* ----------------------------------------------------------------
             * Reputation tab
             * ---------------------------------------------------------------- */}
            <TabsContent
              value="reputation"
              className="mt-4"
              data-ocid="profile.panel"
            >
              {repEvents.length === 0 ? (
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
                        {activityPoints} pts
                      </span>
                    </div>
                    <span className="text-muted-foreground/40 text-xs">·</span>
                    <span
                      className={`text-xs font-body font-medium px-2 py-0.5 rounded-full ${tierConfig?.className ?? "bg-muted text-muted-foreground"}`}
                    >
                      {tier}
                    </span>
                    <span className="text-muted-foreground/40 text-xs">·</span>
                    <span className="text-xs font-body text-muted-foreground">
                      <span className="font-semibold text-primary">
                        {trustScore}%
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
                          className={`flex items-start gap-3 px-4 py-3 ${
                            i < repEvents.length - 1
                              ? "border-b border-border/50"
                              : ""
                          }`}
                        >
                          {/* Icon */}
                          <div
                            className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${iconBg}`}
                          >
                            <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
                          </div>

                          {/* Content */}
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
                                {timeAgo(event.timestamp)}
                              </span>
                              {event.relatedLink && event.relatedLabel && (
                                <>
                                  <span className="text-muted-foreground/40 text-[11px]">
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
      )}
    </motion.div>
  );
}
