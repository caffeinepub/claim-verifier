import { useVerifiedAccount } from "@/hooks/useVerifiedAccount";
import { getVerifiedVotes } from "@/hooks/useVerifiedAccount";

export interface AccountPermissions {
  isVerified: boolean;
  canUploadImages: boolean;
  canVoteOnSources: boolean;
  canSuggestSources: boolean;
  canEdit: boolean;
  canReport: boolean;
  isExpert: boolean;
}

export function useAccountPermissions(): AccountPermissions {
  const { isVerified } = useVerifiedAccount();

  // Expert = 500+ activity points (votes cast)
  const voteCount = isVerified ? Object.keys(getVerifiedVotes()).length : 0;
  const isExpert = voteCount >= 500;

  return {
    isVerified,
    canUploadImages: isVerified,
    canVoteOnSources: true,
    canSuggestSources: isVerified,
    canEdit: isVerified,
    canReport: isVerified,
    isExpert,
  };
}

// Helper: check if an edit is within the 15-minute window
// Timestamp is in nanoseconds (Motoko)
export function isWithinEditWindow(timestampNs: bigint): boolean {
  const ms = Number(timestampNs) / 1_000_000;
  return Date.now() - ms < 15 * 60 * 1000;
}

// ── localStorage edit helpers ─────────────────────────────────────────────────

const EDIT_PREFIX = "rebunked_edit_";

export interface EditRecord {
  text: string;
  editedAt: number;
}

export function getEdit(key: string): EditRecord | null {
  try {
    const raw = localStorage.getItem(`${EDIT_PREFIX}${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as EditRecord;
  } catch {
    return null;
  }
}

export function saveEdit(key: string, text: string): void {
  localStorage.setItem(
    `${EDIT_PREFIX}${key}`,
    JSON.stringify({ text, editedAt: Date.now() }),
  );
}

export function clearEdit(key: string): void {
  localStorage.removeItem(`${EDIT_PREFIX}${key}`);
}

// ── Source type dispute helpers ───────────────────────────────────────────────

const DISPUTE_PREFIX = "rebunked_dispute_";
const DISPUTE_VOTE_PREFIX = "rebunked_dispute_vote_";

export interface DisputeRecord {
  proposedType: string;
  creatorSessionId: string;
  timestamp: number;
  votes: Record<string, "current" | "proposed">;
}

export function getDispute(sourceId: string): DisputeRecord | null {
  try {
    const raw = localStorage.getItem(`${DISPUTE_PREFIX}${sourceId}`);
    if (!raw) return null;
    return JSON.parse(raw) as DisputeRecord;
  } catch {
    return null;
  }
}

export function saveDispute(sourceId: string, record: DisputeRecord): void {
  localStorage.setItem(`${DISPUTE_PREFIX}${sourceId}`, JSON.stringify(record));
}

export function clearDispute(sourceId: string): void {
  localStorage.removeItem(`${DISPUTE_PREFIX}${sourceId}`);
}

export function getDisputeVote(
  sourceId: string,
  sessionId: string,
): "current" | "proposed" | null {
  const raw = localStorage.getItem(
    `${DISPUTE_VOTE_PREFIX}${sourceId}_${sessionId}`,
  );
  if (raw === "current" || raw === "proposed") return raw;
  return null;
}

export function saveDisputeVote(
  sourceId: string,
  sessionId: string,
  vote: "current" | "proposed",
): void {
  localStorage.setItem(`${DISPUTE_VOTE_PREFIX}${sourceId}_${sessionId}`, vote);
}
