import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useCallback, useEffect, useState } from "react";

// ── LocalStorage Keys ────────────────────────────────────────────────────────

const VERIFIED_SESSIONS_KEY = "rebunked_verified_sessions";
const VERIFIED_VOTES_KEY = "rebunked_verified_votes";
const USERNAME_PREFIX = "rebunked_username_";
const JOIN_DATE_PREFIX = "rebunked_joined_";
const AVATAR_PREFIX = "rebunked_avatar_";
const BIO_PREFIX = "rebunked_bio_";
const LAST_ACTIVE_PREFIX = "rebunked_lastactive_";
const ACTIVITY_POINTS_PREFIX = "rebunked_points_";
const TRUST_SCORE_PREFIX = "rebunked_trust_";
const TC_SESSIONS_KEY = "rebunked_tc_sessions";
const USERNAME_REGISTRY_KEY = "rebunked_username_registry";
const USERNAME_CHANGE_TS_PREFIX = "rebunked_username_changed_";

const USERNAME_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

// ── Types ────────────────────────────────────────────────────────────────────

export interface VerifiedVoteRecord {
  voteType: string;
  timestamp: number;
  claimTitle: string;
}

export interface VerifiedVoteMap {
  [claimId: string]: VerifiedVoteRecord;
}

// ── Username Registry Helpers ────────────────────────────────────────────────

function getUsernameRegistry(): Record<string, string> {
  try {
    const raw = localStorage.getItem(USERNAME_REGISTRY_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

function saveUsernameRegistry(registry: Record<string, string>): void {
  localStorage.setItem(USERNAME_REGISTRY_KEY, JSON.stringify(registry));
}

export function isUsernameTaken(
  username: string,
  excludePrincipalId?: string,
): boolean {
  const registry = getUsernameRegistry();
  const owner = registry[username.toLowerCase()];
  if (!owner) return false;
  if (excludePrincipalId && owner === excludePrincipalId) return false;
  return true;
}

function registerUsername(
  username: string,
  principalId: string,
  oldUsername?: string | null,
): void {
  const registry = getUsernameRegistry();
  // Release old entry
  if (oldUsername) {
    delete registry[oldUsername.toLowerCase()];
  }
  registry[username.toLowerCase()] = principalId;
  saveUsernameRegistry(registry);
}

// ── Helpers (non-reactive, safe to call anywhere) ────────────────────────────

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

export function getUsernameForPrincipal(principalId: string): string | null {
  return localStorage.getItem(`${USERNAME_PREFIX}${principalId}`);
}

export function setUsernameForPrincipal(
  principalId: string,
  username: string,
): void {
  localStorage.setItem(`${USERNAME_PREFIX}${principalId}`, username);
}

function getJoinDateForPrincipal(principalId: string): string | null {
  return localStorage.getItem(`${JOIN_DATE_PREFIX}${principalId}`);
}

function setJoinDateForPrincipalIfAbsent(principalId: string): void {
  const key = `${JOIN_DATE_PREFIX}${principalId}`;
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, new Date().toISOString());
  }
}

function getAvatarUrlForPrincipal(principalId: string): string | null {
  return localStorage.getItem(`${AVATAR_PREFIX}${principalId}`);
}

function setAvatarUrlForPrincipal(principalId: string, url: string): void {
  localStorage.setItem(`${AVATAR_PREFIX}${principalId}`, url);
}

export function getBioForPrincipal(principalId: string): string | null {
  return localStorage.getItem(`${BIO_PREFIX}${principalId}`);
}

export function setBioForPrincipal(principalId: string, bio: string): void {
  localStorage.setItem(`${BIO_PREFIX}${principalId}`, bio);
}

export function getLastActiveForPrincipal(principalId: string): string | null {
  return localStorage.getItem(`${LAST_ACTIVE_PREFIX}${principalId}`);
}

export function updateLastActiveForPrincipal(principalId: string): void {
  localStorage.setItem(
    `${LAST_ACTIVE_PREFIX}${principalId}`,
    new Date().toISOString(),
  );
}

// ── Trusted Contributor Helpers ──────────────────────────────────────────────

export function getActivityPoints(principalId: string): number {
  try {
    const raw = localStorage.getItem(`${ACTIVITY_POINTS_PREFIX}${principalId}`);
    if (!raw) return 0;
    return Number.parseInt(raw, 10) || 0;
  } catch {
    return 0;
  }
}

export function incrementActivityPointsForPrincipal(
  principalId: string,
  amount = 1,
): void {
  const current = getActivityPoints(principalId);
  localStorage.setItem(
    `${ACTIVITY_POINTS_PREFIX}${principalId}`,
    String(current + amount),
  );
}

export function getTrustScore(principalId: string): number {
  try {
    const raw = localStorage.getItem(`${TRUST_SCORE_PREFIX}${principalId}`);
    if (!raw) return 65; // default: just below 70% threshold
    return Number.parseInt(raw, 10) || 65;
  } catch {
    return 65;
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

// ── Cooldown Helpers ─────────────────────────────────────────────────────────

function getUsernameChangeTimestamp(principalId: string): number | null {
  const raw = localStorage.getItem(
    `${USERNAME_CHANGE_TS_PREFIX}${principalId}`,
  );
  if (!raw) return null;
  const ts = Number(raw);
  return Number.isNaN(ts) ? null : ts;
}

function setUsernameChangeTimestamp(principalId: string): void {
  localStorage.setItem(
    `${USERNAME_CHANGE_TS_PREFIX}${principalId}`,
    String(Date.now()),
  );
}

export function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

// ── Main Hook ────────────────────────────────────────────────────────────────

export interface VerifiedAccountState {
  isVerified: boolean;
  principalId: string | null;
  username: string | null;
  needsUsernameSetup: boolean;
  isLoggingIn: boolean;
  joinDate: string | null;
  avatarUrl: string | null;
  bio: string | null;
  lastActive: string | null;
  activityPoints: number;
  trustScore: number;
  isTrustedContributor: boolean;
  canChangeUsername: boolean;
  timeUntilUsernameChange: string | null;
  login: () => void;
  logout: () => void;
  setUsername: (name: string) => { success: boolean; error?: string };
  setAvatarUrl: (url: string) => void;
  setBio: (bio: string) => void;
  recordVerifiedVote: (
    claimId: string,
    sessionId: string,
    voteType: string,
    claimTitle: string,
  ) => void;
  incrementActivity: (amount?: number) => void;
  updateTrust: (delta: number) => void;
  markCurrentSessionAsTrusted: (sessionId: string) => void;
}

export function useVerifiedAccount(): VerifiedAccountState {
  const { login, clear, loginStatus, identity } = useInternetIdentity();

  const principalId = identity?.getPrincipal().toString() ?? null;
  const isVerified = !!principalId;
  const isLoggingIn = loginStatus === "logging-in";

  // Use version counters to force re-renders when localStorage values change.
  const [usernameVersion, setUsernameVersion] = useState(0);
  const [avatarUrlVersion, setAvatarUrlVersion] = useState(0);
  const [bioVersion, setBioVersion] = useState(0);
  const [pointsVersion, setPointsVersion] = useState(0);
  const [trustVersion, setTrustVersion] = useState(0);

  // Derived synchronously from principalId — no async setState needed
  const username = principalId ? getUsernameForPrincipal(principalId) : null;
  const avatarUrl = principalId ? getAvatarUrlForPrincipal(principalId) : null;
  const joinDate = principalId ? getJoinDateForPrincipal(principalId) : null;
  const bio = principalId ? getBioForPrincipal(principalId) : null;
  const lastActive = principalId
    ? getLastActiveForPrincipal(principalId)
    : null;
  const activityPoints = principalId ? getActivityPoints(principalId) : 0;
  const trustScore = principalId ? getTrustScore(principalId) : 65;
  const isTrustedContributor = activityPoints >= 25 && trustScore >= 70;

  // Cooldown check
  const lastChangeTs = principalId
    ? getUsernameChangeTimestamp(principalId)
    : null;
  const isFirstTimeSetup = !username;
  const msSinceLast =
    lastChangeTs !== null
      ? Date.now() - lastChangeTs
      : Number.POSITIVE_INFINITY;
  const canChangeUsername =
    isFirstTimeSetup || msSinceLast >= USERNAME_COOLDOWN_MS;
  const timeUntilUsernameChange =
    !canChangeUsername && lastChangeTs !== null
      ? formatTimeRemaining(USERNAME_COOLDOWN_MS - msSinceLast)
      : null;

  // Suppress unused variable warnings for version counters used only to trigger re-renders
  void usernameVersion;
  void avatarUrlVersion;
  void bioVersion;
  void pointsVersion;
  void trustVersion;

  // Needs username setup: logged in but no username stored
  const needsUsernameSetup = isVerified && !username;

  // Store join date on first login
  useEffect(() => {
    if (needsUsernameSetup && principalId) {
      setJoinDateForPrincipalIfAbsent(principalId);
    }
  }, [needsUsernameSetup, principalId]);

  // Update last active timestamp on login
  useEffect(() => {
    if (isVerified && principalId) {
      updateLastActiveForPrincipal(principalId);
    }
  }, [isVerified, principalId]);

  // When isTrustedContributor becomes true, register principalId as a TC session proxy
  useEffect(() => {
    if (isTrustedContributor && principalId) {
      addTCSession(principalId);
    }
  }, [isTrustedContributor, principalId]);

  const setUsername = useCallback(
    (name: string): { success: boolean; error?: string } => {
      if (!principalId) return { success: false, error: "Not logged in" };
      const trimmed = name.trim();
      if (!trimmed)
        return { success: false, error: "Username cannot be empty" };

      // Cooldown check (skip for first-time setup)
      const oldUsername = getUsernameForPrincipal(principalId);
      if (oldUsername) {
        const lastTs = getUsernameChangeTimestamp(principalId);
        if (lastTs !== null && Date.now() - lastTs < USERNAME_COOLDOWN_MS) {
          const remaining = formatTimeRemaining(
            USERNAME_COOLDOWN_MS - (Date.now() - lastTs),
          );
          return {
            success: false,
            error: `You can change your username again in ${remaining}`,
          };
        }
      }

      // Uniqueness check
      if (isUsernameTaken(trimmed, principalId)) {
        return { success: false, error: "Username already taken" };
      }

      // Commit
      registerUsername(trimmed, principalId, oldUsername);
      setUsernameForPrincipal(principalId, trimmed);
      // Only set cooldown timestamp when changing (not first-time setup)
      if (oldUsername) {
        setUsernameChangeTimestamp(principalId);
      }
      setUsernameVersion((v) => v + 1);
      return { success: true };
    },
    [principalId],
  );

  const setAvatarUrl = useCallback(
    (url: string) => {
      if (!principalId) return;
      setAvatarUrlForPrincipal(principalId, url);
      setAvatarUrlVersion((v) => v + 1);
    },
    [principalId],
  );

  const setBio = useCallback(
    (bioText: string) => {
      if (!principalId) return;
      setBioForPrincipal(principalId, bioText);
      setBioVersion((v) => v + 1);
    },
    [principalId],
  );

  const incrementActivity = useCallback(
    (amount = 1) => {
      if (!principalId) return;
      incrementActivityPointsForPrincipal(principalId, amount);
      setPointsVersion((v) => v + 1);
    },
    [principalId],
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
      // Mark session as verified
      addVerifiedSession(sessionId);
      // Record vote with multiplier
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

  return {
    isVerified,
    principalId,
    username,
    needsUsernameSetup,
    isLoggingIn,
    joinDate,
    avatarUrl,
    bio,
    lastActive,
    activityPoints,
    trustScore,
    isTrustedContributor,
    canChangeUsername,
    timeUntilUsernameChange,
    login,
    logout: clear,
    setUsername,
    setAvatarUrl,
    setBio,
    recordVerifiedVote,
    incrementActivity,
    updateTrust,
    markCurrentSessionAsTrusted,
  };
}
