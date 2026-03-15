import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useCallback, useEffect, useState } from "react";

// ── LocalStorage Keys ────────────────────────────────────────────────────────

const VERIFIED_SESSIONS_KEY = "rebunked_verified_sessions";
const VERIFIED_VOTES_KEY = "rebunked_verified_votes";
const USERNAME_PREFIX = "rebunked_username_";
const JOIN_DATE_PREFIX = "rebunked_joined_";
const AVATAR_PREFIX = "rebunked_avatar_";

// ── Types ────────────────────────────────────────────────────────────────────

export interface VerifiedVoteRecord {
  voteType: string;
  timestamp: number;
  claimTitle: string;
}

export interface VerifiedVoteMap {
  [claimId: string]: VerifiedVoteRecord;
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

// ── Main Hook ────────────────────────────────────────────────────────────────

export interface VerifiedAccountState {
  isVerified: boolean;
  principalId: string | null;
  displayName: string | null;
  needsUsernameSetup: boolean;
  isLoggingIn: boolean;
  joinDate: string | null;
  avatarUrl: string | null;
  login: () => void;
  logout: () => void;
  setDisplayName: (name: string) => void;
  setAvatarUrl: (url: string) => void;
  recordVerifiedVote: (
    claimId: string,
    sessionId: string,
    voteType: string,
    claimTitle: string,
  ) => void;
}

export function useVerifiedAccount(): VerifiedAccountState {
  const { login, clear, loginStatus, identity } = useInternetIdentity();

  const principalId = identity?.getPrincipal().toString() ?? null;
  const isVerified = !!principalId;
  const isLoggingIn = loginStatus === "logging-in";

  const [displayName, setDisplayNameState] = useState<string | null>(
    principalId ? getUsernameForPrincipal(principalId) : null,
  );
  const [joinDate, setJoinDateState] = useState<string | null>(
    principalId ? getJoinDateForPrincipal(principalId) : null,
  );
  const [avatarUrl, setAvatarUrlState] = useState<string | null>(
    principalId ? getAvatarUrlForPrincipal(principalId) : null,
  );

  // React to identity changes (login/logout)
  useEffect(() => {
    if (principalId) {
      setDisplayNameState(getUsernameForPrincipal(principalId));
      setJoinDateState(getJoinDateForPrincipal(principalId));
      setAvatarUrlState(getAvatarUrlForPrincipal(principalId));
    } else {
      setDisplayNameState(null);
      setJoinDateState(null);
      setAvatarUrlState(null);
    }
  }, [principalId]);

  // Needs username setup: logged in but no username stored
  const needsUsernameSetup = isVerified && !displayName;

  // Store join date on first login
  useEffect(() => {
    if (needsUsernameSetup && principalId) {
      setJoinDateForPrincipalIfAbsent(principalId);
      setJoinDateState(getJoinDateForPrincipal(principalId));
    }
  }, [needsUsernameSetup, principalId]);

  const setDisplayName = useCallback(
    (name: string) => {
      if (!principalId) return;
      setUsernameForPrincipal(principalId, name);
      setDisplayNameState(name);
    },
    [principalId],
  );

  const setAvatarUrl = useCallback(
    (url: string) => {
      if (!principalId) return;
      setAvatarUrlForPrincipal(principalId, url);
      setAvatarUrlState(url);
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

  return {
    isVerified,
    principalId,
    displayName,
    needsUsernameSetup,
    isLoggingIn,
    joinDate,
    avatarUrl,
    login,
    logout: clear,
    setDisplayName,
    setAvatarUrl,
    recordVerifiedVote,
  };
}
