import type { PrivacySettings, UserProfile } from "@/backend.d";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

// ── LocalStorage Keys (kept for anti-brigading & session gate) ───────────────

const VERIFIED_SESSIONS_KEY = "rebunked_verified_sessions";
const VERIFIED_VOTES_KEY = "rebunked_verified_votes";
const TRUST_SCORE_PREFIX = "rebunked_trust_";
const TC_SESSIONS_KEY = "rebunked_tc_sessions";
// Flag used by useSessionGate to bypass the 15-minute delay for verified accounts
export const ACTIVE_VERIFIED_KEY = "rebunked_active_verified";

const USERNAME_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  showVotes: true,
  showClaims: true,
  showReputation: true,
  showSources: true,
  showEvidence: true,
  showComments: true,
};

// ── Types ────────────────────────────────────────────────────────────────────

export type { UserProfile };

export interface VerifiedVoteRecord {
  voteType: string;
  timestamp: number;
  claimTitle: string;
}

export interface VerifiedVoteMap {
  [claimId: string]: VerifiedVoteRecord;
}

// ── Verified Sessions/Votes (localStorage, for 1.5x voting power) ────────────

export function getVerifiedSessions(): Set<string> {
  try {
    const raw = localStorage.getItem(VERIFIED_SESSIONS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function isVerifiedSessionId(sessionId: string): boolean {
  return getVerifiedSessions().has(sessionId);
}

function addVerifiedSession(sessionId: string): void {
  const set = getVerifiedSessions();
  set.add(sessionId);
  localStorage.setItem(VERIFIED_SESSIONS_KEY, JSON.stringify([...set]));
}

export function getVerifiedVotes(): VerifiedVoteMap {
  try {
    const raw = localStorage.getItem(VERIFIED_VOTES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as VerifiedVoteMap;
  } catch {
    return {};
  }
}

export function getVerifiedVoteForClaim(
  claimId: string,
): VerifiedVoteRecord | null {
  return getVerifiedVotes()[claimId] ?? null;
}

function saveVerifiedVote(claimId: string, record: VerifiedVoteRecord): void {
  const votes = getVerifiedVotes();
  votes[claimId] = record;
  localStorage.setItem(VERIFIED_VOTES_KEY, JSON.stringify(votes));
}

// ── Trust Score (localStorage – no backend field) ─────────────────────────────

export function getTrustScore(principalId: string): number {
  try {
    const raw = localStorage.getItem(`${TRUST_SCORE_PREFIX}${principalId}`);
    if (!raw) return 0;
    return Number.parseInt(raw, 10) || 0;
  } catch {
    return 0;
  }
}

export function updateTrustScoreForPrincipal(
  principalId: string,
  delta: number,
): void {
  const current = getTrustScore(principalId);
  const next = Math.max(0, Math.min(100, current + delta));
  localStorage.setItem(`${TRUST_SCORE_PREFIX}${principalId}`, String(next));
}

// ── Trusted Contributor Sessions ─────────────────────────────────────────────

export function getTCSessions(): Set<string> {
  try {
    const raw = localStorage.getItem(TC_SESSIONS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function isTrustedContributorSession(sessionId: string): boolean {
  return getTCSessions().has(sessionId);
}

function addTCSession(sessionId: string): void {
  const set = getTCSessions();
  set.add(sessionId);
  localStorage.setItem(TC_SESSIONS_KEY, JSON.stringify([...set]));
}

// ── Cooldown Formatting ───────────────────────────────────────────────────────

export function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

// ── Active Principal Helper ───────────────────────────────────────────────────

export function getActivePrincipalId(): string | null {
  return localStorage.getItem(ACTIVE_VERIFIED_KEY);
}

// ── Activity Tracking (localStorage – local cache for profile tabs) ───────────

function userClaimsKey(principalId: string) {
  return `rebunked_user_claims_${principalId}`;
}
function userEvidenceKey(principalId: string) {
  return `rebunked_user_evidence_${principalId}`;
}
function userCommentsKey(principalId: string) {
  return `rebunked_user_comments_${principalId}`;
}
function userSourcesKey(principalId: string) {
  return `rebunked_user_sources_${principalId}`;
}

export interface UserClaimRecord {
  claimId: string;
  title: string;
  category: string;
  timestamp: string;
}
export interface UserEvidenceRecord {
  evidenceId: string;
  claimId: string;
  claimTitle: string;
  text: string;
  evidenceType: string;
  timestamp: string;
}
export interface UserCommentRecord {
  replyId: string;
  claimId: string;
  claimTitle: string;
  text: string;
  timestamp: string;
}
export interface UserSourceRecord {
  domain: string;
  sourceType: string;
  timestamp: string;
}

export function getUserClaims(principalId: string): UserClaimRecord[] {
  try {
    return JSON.parse(localStorage.getItem(userClaimsKey(principalId)) ?? "[]");
  } catch {
    return [];
  }
}
export function getUserEvidence(principalId: string): UserEvidenceRecord[] {
  try {
    return JSON.parse(
      localStorage.getItem(userEvidenceKey(principalId)) ?? "[]",
    );
  } catch {
    return [];
  }
}
export function getUserComments(principalId: string): UserCommentRecord[] {
  try {
    return JSON.parse(
      localStorage.getItem(userCommentsKey(principalId)) ?? "[]",
    );
  } catch {
    return [];
  }
}
export function getUserSources(principalId: string): UserSourceRecord[] {
  try {
    return JSON.parse(
      localStorage.getItem(userSourcesKey(principalId)) ?? "[]",
    );
  } catch {
    return [];
  }
}

export function appendUserClaim(principalId: string, record: UserClaimRecord) {
  const arr = getUserClaims(principalId);
  arr.unshift(record);
  localStorage.setItem(
    userClaimsKey(principalId),
    JSON.stringify(arr.slice(0, 200)),
  );
}
export function appendUserEvidence(
  principalId: string,
  record: UserEvidenceRecord,
) {
  const arr = getUserEvidence(principalId);
  arr.unshift(record);
  localStorage.setItem(
    userEvidenceKey(principalId),
    JSON.stringify(arr.slice(0, 200)),
  );
}
export function appendUserComment(
  principalId: string,
  record: UserCommentRecord,
) {
  const arr = getUserComments(principalId);
  arr.unshift(record);
  localStorage.setItem(
    userCommentsKey(principalId),
    JSON.stringify(arr.slice(0, 200)),
  );
}
export function appendUserSource(
  principalId: string,
  record: UserSourceRecord,
) {
  const arr = getUserSources(principalId);
  arr.unshift(record);
  localStorage.setItem(
    userSourcesKey(principalId),
    JSON.stringify(arr.slice(0, 200)),
  );
}

// ── Main Hook ────────────────────────────────────────────────────────────────

export interface VerifiedAccountState {
  isVerified: boolean;
  principalId: string | null;
  principal: Principal | null;
  username: string | null;
  needsUsernameSetup: boolean;
  isLoggingIn: boolean;
  isProfileLoading: boolean;
  joinDate: string | null;
  avatarUrl: string | null;
  bio: string | null;
  lastActive: string | null;
  activityPoints: number;
  trustScore: number;
  isTrustedContributor: boolean;
  canChangeUsername: boolean;
  timeUntilUsernameChange: string | null;
  privacySettings: PrivacySettings;
  login: () => void;
  logout: () => void;
  setUsername: (name: string) => Promise<{ success: boolean; error?: string }>;
  setAvatarUrl: (url: string) => void;
  setBio: (bio: string) => void;
  recordVerifiedVote: (
    claimId: string,
    sessionId: string,
    voteType: string,
    claimTitle: string,
  ) => void;
  updateTrust: (delta: number) => void;
  markCurrentSessionAsTrusted: (sessionId: string) => void;
}

export function useVerifiedAccount(): VerifiedAccountState {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor();
  const queryClient = useQueryClient();

  const principal = identity?.getPrincipal() ?? null;
  const principalId = principal?.toString() ?? null;
  const isVerified = !!principalId;
  const isLoggingIn = loginStatus === "logging-in";

  // Load profile from backend
  const { data: profile, isLoading: isProfileLoading } =
    useQuery<UserProfile | null>({
      queryKey: ["profile", principalId],
      queryFn: async () => {
        if (!actor || !principal) return null;
        return actor.getProfile(principal);
      },
      enabled: !!actor && !isActorFetching && !!principal,
      staleTime: 30_000,
    });

  // Load reputation events from backend for activity points
  const { data: repEventsRaw = [] } = useQuery({
    queryKey: ["reputation-events", principalId],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getReputationEvents(principal);
    },
    enabled: !!actor && !isActorFetching && !!principal,
    staleTime: 30_000,
  });

  // Derived profile values from backend
  const username = profile?.username || null;
  const bio = profile?.bio || null;
  const avatarUrl = profile?.avatarUrl || null;
  const joinDate = profile?.joinDate
    ? new Date(Number(profile.joinDate) / 1_000_000).toISOString()
    : null;
  const lastActive = profile?.lastActive
    ? new Date(Number(profile.lastActive) / 1_000_000).toISOString()
    : null;
  const privacySettings = profile?.privacySettings ?? DEFAULT_PRIVACY_SETTINGS;
  const usernameLastChangedMs = profile?.usernameLastChanged
    ? Number(profile.usernameLastChanged) / 1_000_000
    : null;

  // Activity points = sum of reputation event points from backend
  const activityPoints = repEventsRaw.reduce(
    (sum, e) => sum + Number(e.points),
    0,
  );

  // Trust score: kept in localStorage (no backend field)
  const [trustVersion, setTrustVersion] = useState(0);
  void trustVersion;
  const trustScore = principalId ? getTrustScore(principalId) : 0;
  const isTrustedContributor = activityPoints >= 25 && trustScore >= 70;

  // Username cooldown
  const isFirstTimeSetup = !username;
  const msSinceLast =
    usernameLastChangedMs !== null
      ? Date.now() - usernameLastChangedMs
      : Number.POSITIVE_INFINITY;
  const canChangeUsername =
    isFirstTimeSetup || msSinceLast >= USERNAME_COOLDOWN_MS;
  const timeUntilUsernameChange =
    !canChangeUsername && usernameLastChangedMs !== null
      ? formatTimeRemaining(USERNAME_COOLDOWN_MS - msSinceLast)
      : null;

  // Needs username setup: logged in, profile loaded, no username set
  const needsUsernameSetup =
    isVerified && !isProfileLoading && !username && !isActorFetching;

  // Update last active on login
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally fires only on login
  useEffect(() => {
    if (isVerified && actor && principal) {
      actor.updateLastActive(principal).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVerified]);

  // Sync verified status to localStorage so useSessionGate can read it
  useEffect(() => {
    if (isVerified && principalId) {
      localStorage.setItem(ACTIVE_VERIFIED_KEY, principalId);
    } else if (!isVerified && !isLoggingIn) {
      localStorage.removeItem(ACTIVE_VERIFIED_KEY);
    }
  }, [isVerified, principalId, isLoggingIn]);

  // Register TC session when earned
  useEffect(() => {
    if (isTrustedContributor && principalId) {
      addTCSession(principalId);
    }
  }, [isTrustedContributor, principalId]);

  // Async setUsername – checks availability on backend, then saves profile
  const setUsername = useCallback(
    async (name: string): Promise<{ success: boolean; error?: string }> => {
      if (!principalId || !actor || !principal) {
        return { success: false, error: "Not logged in" };
      }
      const trimmed = name.trim();
      if (!trimmed)
        return { success: false, error: "Username cannot be empty" };

      // Cooldown check (skip for first-time setup)
      if (!isFirstTimeSetup && !canChangeUsername) {
        return {
          success: false,
          error: `You can change your username again in ${
            timeUntilUsernameChange ?? "a while"
          }`,
        };
      }

      // Check availability on backend
      const available = await actor.isUsernameAvailable(trimmed);
      if (!available) {
        return { success: false, error: "Username already taken" };
      }

      // Save to backend
      const currentPrivacy =
        profile?.privacySettings ?? DEFAULT_PRIVACY_SETTINGS;
      const result = await actor.createOrUpdateProfile(
        principal,
        trimmed,
        profile?.bio ?? "",
        profile?.avatarUrl ?? "",
        currentPrivacy,
      );
      if (result.__kind__ === "err") {
        return { success: false, error: result.err };
      }

      queryClient.invalidateQueries({ queryKey: ["profile", principalId] });
      queryClient.invalidateQueries({
        queryKey: ["profile-by-username", trimmed],
      });
      return { success: true };
    },
    [
      principalId,
      actor,
      principal,
      profile,
      isFirstTimeSetup,
      canChangeUsername,
      timeUntilUsernameChange,
      queryClient,
    ],
  );

  const setAvatarUrl = useCallback(
    (url: string) => {
      if (!principalId || !actor || !principal) return;
      const currentPrivacy =
        profile?.privacySettings ?? DEFAULT_PRIVACY_SETTINGS;
      actor
        .createOrUpdateProfile(
          principal,
          profile?.username ?? "",
          profile?.bio ?? "",
          url,
          currentPrivacy,
        )
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["profile", principalId] });
        })
        .catch(() => {});
    },
    [principalId, actor, principal, profile, queryClient],
  );

  const setBio = useCallback(
    (bioText: string) => {
      if (!principalId || !actor || !principal) return;
      const currentPrivacy =
        profile?.privacySettings ?? DEFAULT_PRIVACY_SETTINGS;
      actor
        .createOrUpdateProfile(
          principal,
          profile?.username ?? "",
          bioText,
          profile?.avatarUrl ?? "",
          currentPrivacy,
        )
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["profile", principalId] });
        })
        .catch(() => {});
    },
    [principalId, actor, principal, profile, queryClient],
  );

  const updateTrust = useCallback(
    (delta: number) => {
      if (!principalId) return;
      updateTrustScoreForPrincipal(principalId, delta);
      setTrustVersion((v) => v + 1);
    },
    [principalId],
  );

  const recordVerifiedVote = useCallback(
    (
      claimId: string,
      sessionId: string,
      voteType: string,
      claimTitle: string,
    ) => {
      if (!isVerified) return;
      addVerifiedSession(sessionId);
      saveVerifiedVote(claimId, {
        voteType,
        timestamp: Date.now(),
        claimTitle,
      });
    },
    [isVerified],
  );

  const markCurrentSessionAsTrusted = useCallback((sessionId: string) => {
    addTCSession(sessionId);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ACTIVE_VERIFIED_KEY);
    clear();
  }, [clear]);

  return {
    isVerified,
    principalId,
    principal,
    username,
    needsUsernameSetup,
    isLoggingIn,
    isProfileLoading,
    joinDate,
    avatarUrl,
    bio,
    lastActive,
    activityPoints,
    trustScore,
    isTrustedContributor,
    canChangeUsername,
    timeUntilUsernameChange,
    privacySettings,
    login,
    logout,
    setUsername,
    setAvatarUrl,
    setBio,
    recordVerifiedVote,
    updateTrust,
    markCurrentSessionAsTrusted,
  };
}
