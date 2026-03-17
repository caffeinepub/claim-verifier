import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProfileByUsername, useStatsByUsername } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { generateIdenticonDataUrl } from "@/utils/identicon";
import { CheckCircle } from "lucide-react";
import { useCallback, useState } from "react";

// ── Registry Helper ─────────────────────────────────────────────────────────

/**
 * Checks if a username belongs to a verified account by querying the backend.
 * Falls back to a synchronous check for components that can't await.
 */
export function isVerifiedUsername(_username: string): boolean {
  // A best-effort sync check: if the username exists in the backend's profile system
  // we treat it as potentially verified. The profile card handles the async check.
  // Return false here; UserProfileCard will show the popover only when explicitly
  // passed isVerified=true, or the backend confirms the profile exists.
  return false;
}

// ── Tier Helpers ──────────────────────────────────────────────────────────────

function getTierInfo(points: number): {
  label: string;
  className: string;
} {
  if (points >= 500)
    return { label: "Expert", className: "bg-purple-100 text-purple-700" };
  if (points >= 100)
    return { label: "Investigator", className: "bg-blue-100 text-blue-700" };
  if (points >= 25)
    return { label: "Analyst", className: "bg-green-100 text-green-700" };
  if (points >= 5)
    return { label: "Contributor", className: "bg-yellow-100 text-yellow-700" };
  return { label: "Newcomer", className: "bg-gray-100 text-gray-500" };
}

// ── Card Content ──────────────────────────────────────────────────────────────

function ProfileCardContent({ username }: { username: string }) {
  const { data: profile, isLoading } = useProfileByUsername(username);
  const { data: stats } = useStatsByUsername(username);

  const claimCount = stats ? Number(stats.claimCount) : 0;
  const evidenceCount = stats ? Number(stats.evidenceCount) : 0;
  const commentCount = stats ? Number(stats.commentCount) : 0;
  const activityPoints = stats ? Number(stats.activityPoints) : 0;
  const trustScore = stats ? Number(stats.trustScore) : 0;

  if (isLoading) {
    return (
      <div className="w-[270px] rounded-xl shadow-lg overflow-hidden bg-background border border-border p-4 space-y-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-full" />
      </div>
    );
  }

  if (!profile) return null;

  const joinDate = profile.joinDate
    ? new Date(Number(profile.joinDate) / 1_000_000).toISOString()
    : null;

  const formattedJoinDate = joinDate
    ? new Date(joinDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  const tier = getTierInfo(activityPoints);
  const avatarSrc = profile.avatarUrl || generateIdenticonDataUrl(username);
  const bio = profile.bio || null;
  const isTrustedContributor = activityPoints >= 25 && trustScore >= 70;

  function handleViewProfile(e: React.MouseEvent) {
    e.stopPropagation();
    window.history.pushState(
      {},
      "",
      `/profile/${encodeURIComponent(username)}`,
    );
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  return (
    <div className="w-[270px] rounded-xl shadow-lg overflow-hidden bg-background border border-border">
      {/* Header band */}
      <div className="relative h-10 bg-gray-100" />

      {/* Avatar — overlaps the header band */}
      <div className="relative flex flex-col items-start px-4">
        <div className="-mt-6 mb-2">
          <img
            src={avatarSrc}
            alt={username}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
          />
        </div>

        {/* Username + badge */}
        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
          <span className="font-bold text-sm text-foreground leading-tight">
            {username}
          </span>
          {isTrustedContributor && (
            <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          )}
        </div>

        {/* Tier + join date */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          <Badge
            className={`text-[10px] px-1.5 py-0 rounded-full font-body border-0 ${tier.className}`}
          >
            {tier.label}
          </Badge>
          {formattedJoinDate && (
            <>
              <span className="text-muted-foreground text-[10px] mx-0.5">
                &middot;
              </span>
              <span className="text-[10px] text-muted-foreground font-body">
                Since {formattedJoinDate}
              </span>
            </>
          )}
        </div>

        {/* Bio */}
        {bio && (
          <p className="text-xs text-muted-foreground font-body line-clamp-2 leading-relaxed mb-2">
            {bio}
          </p>
        )}
      </div>

      {/* Divider */}
      <hr className="border-border mx-4" />

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-border px-4 py-2.5">
        <div className="flex flex-col items-center gap-0.5 pr-3">
          <span className="text-sm font-bold text-foreground">
            {claimCount}
          </span>
          <span className="text-[10px] text-muted-foreground font-body">
            Claims
          </span>
        </div>
        <div className="flex flex-col items-center gap-0.5 px-3">
          <span className="text-sm font-bold text-foreground">
            {evidenceCount}
          </span>
          <span className="text-[10px] text-muted-foreground font-body">
            Evidence
          </span>
        </div>
        <div className="flex flex-col items-center gap-0.5 pl-3">
          <span className="text-sm font-bold text-foreground">
            {commentCount}
          </span>
          <span className="text-[10px] text-muted-foreground font-body">
            Comments
          </span>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-border mx-4" />

      {/* Trust Score */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-foreground">
            Trust Score
          </span>
          <span className="text-xs font-bold text-primary">{trustScore}%</span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${trustScore}%` }}
          />
        </div>
      </div>

      {/* View Profile button */}
      <div className="px-4 pb-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs hover:border-primary hover:text-primary transition-colors"
          onClick={handleViewProfile}
          data-ocid="profile_card.link"
        >
          View Profile
        </Button>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────────

interface UserProfileCardProps {
  username: string;
  isVerified: boolean;
  children: React.ReactNode;
}

export function UserProfileCard({
  username,
  isVerified,
  children,
}: UserProfileCardProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const handleTriggerClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isMobile) {
        setOpen((prev) => !prev);
      }
    },
    [isMobile],
  );

  // No popover for anonymous users
  if (!isVerified) {
    return <>{children}</>;
  }

  return (
    <HoverCard
      open={open}
      onOpenChange={setOpen}
      openDelay={200}
      closeDelay={100}
    >
      <HoverCardTrigger asChild>
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: hover card trigger */}
        <span
          className="inline-flex items-center gap-1.5 cursor-pointer"
          onClick={handleTriggerClick}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
        >
          {children}
        </span>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="start"
        className="p-0 border-0 shadow-none w-auto"
        data-ocid="profile_card.popover"
        onClick={(e) => e.stopPropagation()}
      >
        <ProfileCardContent username={username} />
      </HoverCardContent>
    </HoverCard>
  );
}

// ── AuthorDisplay ─────────────────────────────────────────────────────────────

interface AuthorDisplayProps {
  username: string | undefined | null;
  className?: string;
}

/**
 * Displays an author attribution line.
 * - Empty/null username → renders nothing
 * - Verified username (has a backend profile) → avatar + username + profile popover
 * - Anonymous username (no backend profile) → plain username text only
 */
export function AuthorDisplay({ username, className }: AuthorDisplayProps) {
  const trimmed = username?.trim() ?? "";
  const { data: profile, isLoading } = useProfileByUsername(trimmed || null);

  if (!trimmed) return null;
  if (isLoading) {
    return (
      <span
        className={cn("text-xs text-muted-foreground font-body", className)}
      >
        {trimmed}
      </span>
    );
  }

  if (profile) {
    // Verified account — show avatar + username + profile popover
    const avatarSrc = profile.avatarUrl || generateIdenticonDataUrl(trimmed);
    return (
      <UserProfileCard username={trimmed} isVerified={true}>
        <span
          className={cn("inline-flex items-center gap-1 font-body", className)}
        >
          <img
            src={avatarSrc}
            alt={trimmed}
            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
          />
          <span className="text-xs font-semibold text-foreground">
            {trimmed}
          </span>
        </span>
      </UserProfileCard>
    );
  }

  // Anonymous — plain username, no avatar
  return (
    <span className={cn("text-xs text-muted-foreground font-body", className)}>
      {trimmed}
    </span>
  );
}
