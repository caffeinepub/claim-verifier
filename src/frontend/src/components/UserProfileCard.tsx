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
    return {
      label: "Investigator",
      className: "bg-blue-100 text-blue-700",
    };
  if (points >= 25)
    return { label: "Analyst", className: "bg-green-100 text-green-700" };
  if (points >= 5)
    return {
      label: "Contributor",
      className: "bg-yellow-100 text-yellow-700",
    };
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

// ── Circular Arc Meter ───────────────────────────────────────────────────────

function ArcMeter({ value }: { value: number }) {
  // Semi-circle arc from 180° to 0° (left to right)
  const radius = 28;
  const strokeWidth = 5;
  const cx = 36;
  const cy = 36;
  const circumference = Math.PI * radius; // half circle
  const clampedValue = Math.min(100, Math.max(0, value));
  const filled = (clampedValue / 100) * circumference;

  // Arc starts at left (180°) and sweeps clockwise
  const startX = cx - radius;
  const startY = cy;
  const endX = cx + radius;
  const endY = cy;

  return (
    <div className="flex flex-col items-center">
      <svg
        width="72"
        height="42"
        viewBox="0 0 72 42"
        fill="none"
        aria-label="Trust score meter"
        role="img"
      >
        {/* Background arc */}
        <path
          d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`}
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <path
          d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`}
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          style={{ transition: "stroke-dasharray 0.5s ease" }}
        />
        {/* Percentage text */}
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fontWeight="700"
          fill="hsl(var(--primary))"
        >
          {value}%
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="7"
          fill="hsl(var(--muted-foreground))"
        >
          trust
        </text>
      </svg>
    </div>
  );
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
    <div className="w-72 p-4 bg-background border border-border rounded-xl shadow-lg">
      {/* Identity row */}
      <div className="flex items-center gap-3 mb-3">
        <img
          src={avatarSrc}
          alt={username}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-sm text-foreground font-mono truncate">
              {username}
            </span>
            {isTrustedContributor && (
              <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            )}
          </div>
          <Badge
            className={`mt-0.5 text-[10px] px-1.5 py-0 rounded-full font-body ${tier.className} border-0`}
          >
            {tier.label}
          </Badge>
          {formattedJoinDate && (
            <p className="text-[10px] text-muted-foreground font-body mt-0.5">
              Member since {formattedJoinDate}
            </p>
          )}
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <p className="text-xs text-muted-foreground font-body line-clamp-2 mb-3 leading-relaxed">
          {bio}
        </p>
      )}

      {/* Stats row + Arc meter */}
      {showActivityTabs ? (
        <div className="flex items-center justify-between mb-3">
          {/* Claims / Evidence / Comments */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-foreground">
                {claimsCount}
              </span>
              <span className="text-[10px] text-muted-foreground font-body">
                Claims
              </span>
            </div>
            <div className="w-px bg-border" />
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-foreground">
                {evidenceCount}
              </span>
              <span className="text-[10px] text-muted-foreground font-body">
                Evidence
              </span>
            </div>
            <div className="w-px bg-border" />
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-foreground">
                {commentsCount}
              </span>
              <span className="text-[10px] text-muted-foreground font-body">
                Comments
              </span>
            </div>
          </div>

          {/* Arc trust score meter */}
          <ArcMeter value={trustScore} />
        </div>
      ) : (
        /* If activity tabs are hidden, still show trust score arc */
        <div className="flex justify-center mb-3">
          <ArcMeter value={trustScore} />
        </div>
      )}

      {/* View Profile button */}
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
