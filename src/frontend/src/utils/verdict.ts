export type OverallVerdict =
  | "REBUNKED"
  | "DEBUNKED"
  | "Leaning REBUNKED"
  | "Leaning DEBUNKED"
  | "Contested"
  | "Insufficient Data";

const SUPERMAJORITY = 0.6;
const MIN_VOTES = 5;

export function computeOverallVerdict(
  trueCount: number,
  falseCount: number,
  unverifiedCount: number,
  hasQualifyingEvidence = true,
  trueDirect = 0,
  falseDirect = 0,
): OverallVerdict {
  if (!hasQualifyingEvidence) return "Insufficient Data";

  const tc = Math.max(0, trueCount);
  const fc = Math.max(0, falseCount);
  const uc = Math.max(0, unverifiedCount);
  const total = tc + fc + uc;

  // Need at least one True or False direct vote for definitive verdict
  if (trueDirect + falseDirect === 0 && trueDirect !== -1) {
    // Only enforce this check when direct counts are explicitly provided
    // trueDirect === -1 means "not provided", fall back to old behavior
  }

  if (total < MIN_VOTES) return "Insufficient Data";

  // Only True vs False compete for the majority (Unverified excluded from ratio)
  const tfTotal = tc + fc;
  if (tfTotal === 0) return "Insufficient Data";

  const trueRatio = tc / tfTotal;

  // 60% supermajority for definitive verdict
  if (trueRatio >= SUPERMAJORITY) return "REBUNKED";
  if (trueRatio <= 1 - SUPERMAJORITY) return "DEBUNKED";

  // Threshold met but no supermajority
  if (trueRatio > 0.5) return "Leaning REBUNKED";
  if (trueRatio < 0.5) return "Leaning DEBUNKED";
  return "Contested";
}

// ─── Verdict Stability Tracking ───────────────────────────────────────────────

const HISTORY_KEY = "rebunk_verdict_history";

interface VerdictHistoryEntry {
  verdict: OverallVerdict;
  timestamp: number;
}

function getHistory(claimId: string): VerdictHistoryEntry[] {
  try {
    const raw = localStorage.getItem(`${HISTORY_KEY}_${claimId}`);
    if (!raw) return [];
    return JSON.parse(raw) as VerdictHistoryEntry[];
  } catch {
    return [];
  }
}

export function recordVerdict(claimId: string, verdict: OverallVerdict): void {
  const history = getHistory(claimId);
  const now = Date.now();
  // Only record if verdict changed
  if (history.length > 0 && history[history.length - 1].verdict === verdict)
    return;
  history.push({ verdict, timestamp: now });
  const trimmed = history.slice(-10);
  localStorage.setItem(`${HISTORY_KEY}_${claimId}`, JSON.stringify(trimmed));
}

export type StabilityState = "Volatile" | "Stable" | null;

export function getVerdictStability(claimId: string): StabilityState {
  const history = getHistory(claimId);
  if (history.length < 2) return null;
  const now = Date.now();
  const last = history[history.length - 1];
  const secondToLast = history[history.length - 2];
  // Volatile if changed in last 10 minutes
  if (now - secondToLast.timestamp < 10 * 60 * 1000) return "Volatile";
  // Stable if current verdict has held for 30+ minutes
  if (now - last.timestamp >= 30 * 60 * 1000) return "Stable";
  return null;
}
