// ── Edit System ─────────────────────────────────────────────────────────────
// Stores edit data in localStorage keyed by ${contentType}_${id}_${principalId}
// Claims and evidence have a 30-minute edit window.
// Comments/replies have an unlimited edit window.

const EDIT_PREFIX = "rebunked_edit_v2_";

export type EditContentType = "claim" | "evidence" | "reply" | "comment";

export interface EditHistoryEntry {
  text: string;
  editedAt: number;
}

export interface EditRecord {
  currentText: string;
  editHistory: EditHistoryEntry[]; // previous versions
  wasEditedAfterVotes: boolean;
  lastEditedAt: number;
}

const EDIT_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

function storageKey(
  contentType: EditContentType,
  id: string,
  principalId: string,
): string {
  return `${EDIT_PREFIX}${contentType}_${id}_${principalId}`;
}

/** Returns true if the user can edit this content (owns it, within window) */
export function canEditContent(
  contentType: EditContentType,
  contentTimestampNs: bigint,
  authorSessionId: string,
  currentSessionId: string,
  currentPrincipalId: string | null,
): boolean {
  // Must be a verified user (has a principal)
  if (!currentPrincipalId) return false;
  // Must be the author (session ID matches)
  if (authorSessionId !== currentSessionId) return false;
  // Comments/replies: unlimited window
  if (contentType === "reply" || contentType === "comment") return true;
  // Claims/evidence: 30-minute window
  const ms = Number(contentTimestampNs) / 1_000_000;
  return Date.now() - ms < EDIT_WINDOW_MS;
}

export function getEditRecord(
  contentType: EditContentType,
  id: string,
  principalId: string,
): EditRecord | null {
  try {
    const raw = localStorage.getItem(storageKey(contentType, id, principalId));
    if (!raw) return null;
    return JSON.parse(raw) as EditRecord;
  } catch {
    return null;
  }
}

export function saveEditRecord(
  contentType: EditContentType,
  id: string,
  principalId: string,
  newText: string,
  previousText: string,
  currentVoteCount: number,
): EditRecord {
  const existing = getEditRecord(contentType, id, principalId);
  const history: EditHistoryEntry[] = existing?.editHistory ?? [];
  // Push the current (previous) version to history
  history.push({
    text: previousText,
    editedAt: existing?.lastEditedAt ?? Date.now(),
  });
  const record: EditRecord = {
    currentText: newText,
    editHistory: history,
    wasEditedAfterVotes:
      (existing?.wasEditedAfterVotes ?? false) || currentVoteCount > 0,
    lastEditedAt: Date.now(),
  };
  localStorage.setItem(
    storageKey(contentType, id, principalId),
    JSON.stringify(record),
  );
  return record;
}

/** Returns the display text — edited version if available, else original */
export function getDisplayText(
  contentType: EditContentType,
  id: string,
  principalId: string | null,
  originalText: string,
): string {
  if (!principalId) return originalText;
  const record = getEditRecord(contentType, id, principalId);
  return record?.currentText ?? originalText;
}
