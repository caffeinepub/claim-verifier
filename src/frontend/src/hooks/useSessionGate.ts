import { ACTIVE_VERIFIED_KEY } from "@/hooks/useVerifiedAccount";
import { toast } from "sonner";

const SESSION_CREATED_AT_KEY = "rebunked_session_created_at";
const SESSION_MATURITY_MS = 15 * 60 * 1000; // 15 minutes

const VOTE_TIMESTAMPS_KEY = "rebunked_vote_timestamps";
const VOTE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const VOTE_LIMIT = 3;

/**
 * Returns true if the current session belongs to a verified (Internet Identity) account.
 * Verified accounts bypass the 15-minute session delay.
 */
function isActiveVerifiedAccount(): boolean {
  return !!localStorage.getItem(ACTIVE_VERIFIED_KEY);
}

/**
 * Reads/initializes the session creation timestamp from localStorage.
 * Returns whether the session is still read-only and how many minutes remain.
 * Verified accounts are never read-only.
 */
export function getSessionAge(): {
  isReadOnly: boolean;
  minutesRemaining: number;
} {
  // Verified accounts (Internet Identity) bypass the 15-minute delay entirely
  if (isActiveVerifiedAccount()) {
    return { isReadOnly: false, minutesRemaining: 0 };
  }

  let createdAt = localStorage.getItem(SESSION_CREATED_AT_KEY);
  if (!createdAt) {
    const now = new Date().toISOString();
    localStorage.setItem(SESSION_CREATED_AT_KEY, now);
    createdAt = now;
  }

  const createdMs = new Date(createdAt).getTime();
  const ageMs = Date.now() - createdMs;
  const remainingMs = SESSION_MATURITY_MS - ageMs;

  if (remainingMs <= 0) {
    return { isReadOnly: false, minutesRemaining: 0 };
  }

  const minutesRemaining = Math.ceil(remainingMs / 60000);
  return { isReadOnly: true, minutesRemaining };
}

/**
 * Hook that returns checkAction() and checkVoteAction() functions.
 * Call checkAction() before any write action.
 * Call checkVoteAction() before any vote action (direct claim or evidence).
 * Both return false and show a toast if the action should be blocked.
 * Verified accounts (Internet Identity) bypass the 15-minute session delay automatically.
 */
export function useSessionGate(): {
  checkAction: () => boolean;
  checkVoteAction: () => boolean;
} {
  function checkAction(): boolean {
    const { isReadOnly, minutesRemaining } = getSessionAge();
    if (isReadOnly) {
      toast.warning(
        `New sessions are read-only for 15 minutes. Please wait ${minutesRemaining} more minute${
          minutesRemaining === 1 ? "" : "s"
        } before participating, or sign in to start immediately.`,
        { duration: 5000, id: "session-gate" },
      );
      return false;
    }
    return true;
  }

  function checkVoteAction(): boolean {
    // First check session maturity
    if (!checkAction()) return false;

    const now = Date.now();
    const windowStart = now - VOTE_WINDOW_MS;

    // Read stored timestamps
    let timestamps: number[] = [];
    try {
      const raw = localStorage.getItem(VOTE_TIMESTAMPS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        timestamps = parsed
          .map((t) => new Date(t).getTime())
          .filter(Number.isFinite);
      }
    } catch {
      timestamps = [];
    }

    // Filter to only timestamps within the last 10 minutes
    const recentTimestamps = timestamps.filter((t) => t > windowStart);

    if (recentTimestamps.length >= VOTE_LIMIT) {
      // Find how long until the oldest recent timestamp expires
      const oldest = Math.min(...recentTimestamps);
      const msUntilExpiry = oldest + VOTE_WINDOW_MS - now;
      const minutesLeft = Math.ceil(msUntilExpiry / 60000);
      toast.warning(
        `You've reached the vote limit. Please wait ${minutesLeft} minute${
          minutesLeft === 1 ? "" : "s"
        } before voting again.`,
        { duration: 5000, id: "vote-rate-limit" },
      );
      return false;
    }

    // Record this vote timestamp
    recentTimestamps.push(now);
    // Trim to last 20 entries to keep localStorage clean
    const trimmed = recentTimestamps.slice(-20);
    localStorage.setItem(
      VOTE_TIMESTAMPS_KEY,
      JSON.stringify(trimmed.map((t) => new Date(t).toISOString())),
    );

    return true;
  }

  return { checkAction, checkVoteAction };
}
