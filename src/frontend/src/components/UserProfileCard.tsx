import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useIsMobile } from "@/hooks/use-mobile";
import { generateIdenticonDataUrl } from "@/utils/identicon";
import { CheckCircle } from "lucide-react";
import { useCallback, useState } from "react";

// ── Registry Helpers ─────────────────────────────────────────────────────────

export function isVerifiedUsername(username: string): boolean {
  try {
    const registry = JSON.parse(
      localStorage.getItem("rebunked_username_registry") ?? "{}",
    ) as Record<string, string>;
    return Object.entries(registry).some(([u]) => u === username.toLowerCase());
  } catch {
    return false;
  }
}

function getPrincipalForUsername(username: string): string | null {
  try {
    const registry = JSON.parse(
      localStorage.getItem("rebunked_username_registry") ?? "{}",
    ) as Record<string, string>;
    return registry[username.toLowerCase()] ?? null;
  } catch {
    return null;
  }
}

// ── Tier Helpers ─────────────────────────────────────────────────────────────

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

// ── Profile Data Loader ───────────────────────────────────────────────────────

function loadProfileData(username: string) {
  const principalId = getPrincipalForUsername(username);
  if (!principalId) return null;

  const avatarUrl =
    localStorage.getItem(`rebunked_avatar_${principalId}`) ?? null;
  const bio = localStorage.getItem(`rebunked_bio_${principalId}`) ?? null;
  const activityPoints = Number.parseInt(
    localStorage.getItem(`rebunked_points_${principalId}`) ?? "0",
    10,
  );
  const trustScore = Number.parseInt(
    localStorage.getItem(`rebunked_trust_${principalId}`) ?? "65",
    10,
  );
  const joinDate =
    localStorage.getItem(`rebunked_joined_${principalId}`) ?? null;

  let claimsCount = 0;
  let evidenceCount = 0;
  let commentsCount = 0;
  try {
    claimsCount = (
      JSON.parse(
        localStorage.getItem(`rebunked_user_claims_${principalId}`) ?? "[]",
      ) as unknown[]
    ).length;
  } catch {
    claimsCount = 0;
  }
  try {
    evidenceCount = (
      JSON.parse(
        localStorage.getItem(`rebunked_user_evidence_${principalId}`) ?? "[]",
      ) as unknown[]
    ).length;
  } catch {
    evidenceCount = 0;
  }
  try {
    commentsCount = (
      JSON.parse(
        localStorage.getItem(`rebunked_user_comments_${principalId}`) ?? "[]",
      ) as unknown[]
    ).length;
  } catch {
    commentsCount = 0;
  }

  let showActivityTabs = true;
  try {
    showActivityTabs =
      localStorage.getItem(
        `rebunked_privacy_showActivityTabs_${principalId}`,
      ) !== "false";
  } catch {
    showActivityTabs = true;
  }

  const isTrustedContributor = activityPoints >= 25 && trustScore >= 70;

  return {
    principalId,
    avatarUrl,
    bio,
    activityPoints,
    trustScore,
    joinDate,
    claimsCount,
    evidenceCount,
    commentsCount,
    showActivityTabs,
    isTrustedContributor,
  };
}

// ── Card Content ──────────────────────────────────────────────────────────────

function ProfileCardContent({ username }: { username: string }) {
  const data = loadProfileData(username);
  if (!data) return null;

  const {
    avatarUrl,
    bio,
    activityPoints,
    trustScore,
    joinDate,
    claimsCount,
    evidenceCount,
    commentsCount,
    showActivityTabs,
    isTrustedContributor,
  } = data;

  const tier = getTierInfo(activityPoints);
  const avatarSrc = avatarUrl ?? generateIdenticonDataUrl(username);

  const formattedJoinDate = joinDate
    ? new Date(joinDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

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
      <div className="relative h-10 bg-primary" />

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
                ·
              </span>
              <span className="text-[10px] text-muted-foreground font-body">
                Since {formattedJoinDate}
              </span>
            </>
          )}
        </div>

        {/* Bio */}
        {bio && (
          <p className="text-xs text-muted-foreground font-body line-clamp-2 leading-relaxed italic mb-2">
            {bio}
          </p>
        )}
      </div>

      {/* Divider */}
      <hr className="border-border mx-4" />

      {/* Stats row */}
      {showActivityTabs && (
        <>
          <div className="flex items-stretch px-4 py-3">
            <div className="flex flex-col items-center flex-1">
              <span className="text-sm font-bold text-foreground">
                {claimsCount}
              </span>
              <span className="text-[10px] text-muted-foreground font-body">
                Claims
              </span>
            </div>
            <div className="w-px bg-border mx-1" />
            <div className="flex flex-col items-center flex-1">
              <span className="text-sm font-bold text-foreground">
                {evidenceCount}
              </span>
              <span className="text-[10px] text-muted-foreground font-body">
                Evidence
              </span>
            </div>
            <div className="w-px bg-border mx-1" />
            <div className="flex flex-col items-center flex-1">
              <span className="text-sm font-bold text-foreground">
                {commentsCount}
              </span>
              <span className="text-[10px] text-muted-foreground font-body">
                Comments
              </span>
            </div>
          </div>
          <hr className="border-border mx-4" />
        </>
      )}

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

// ── Main Component ────────────────────────────────────────────────────────────

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
