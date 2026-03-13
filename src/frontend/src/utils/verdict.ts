export type OverallVerdict =
  | "REBUNKED"
  | "DEBUNKED"
  | "Leaning TRUE"
  | "Leaning FALSE"
  | "Contested"
  | "Insufficient Data";

const SUPERMAJORITY = 0.66;
const LEANING_THRESHOLD = 0.55;
const MIN_VOTES = 5;

export function computeOverallVerdict(
  trueCount: number,
  falseCount: number,
  unverifiedCount: number,
  hasQualifyingEvidence = true,
  _trueDirect = 0,
  _falseDirect = 0,
): OverallVerdict {
  if (!hasQualifyingEvidence) return "Insufficient Data";

  const tc = Math.max(0, trueCount);
  const fc = Math.max(0, falseCount);
  const uc = Math.max(0, unverifiedCount);
  const total = tc + fc + uc;

  if (total < MIN_VOTES) return "Insufficient Data";

  // Need at least one True or False vote to determine a direction
  const tfTotal = tc + fc;
  if (tfTotal === 0) return "Insufficient Data";

  // Ratios are out of the full total (including Unverified) so that a large
  // Unverified contingent dilutes the confidence in the verdict.
  const trueRatio = tc / total;
  const falseRatio = fc / total;

  // 66%+ supermajority for definitive verdict
  if (trueRatio >= SUPERMAJORITY) return "REBUNKED";
  if (falseRatio >= SUPERMAJORITY) return "DEBUNKED";

  // 55–66%: Leaning
  if (trueRatio >= LEANING_THRESHOLD && trueRatio > falseRatio)
    return "Leaning TRUE";
  if (falseRatio >= LEANING_THRESHOLD && falseRatio > trueRatio)
    return "Leaning FALSE";

  // Below 55% on both sides (includes near-ties and Unverified-dominant splits)
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
  if (now - secondToLast.timestamp < 10 * 60 * 1000) return "Volatile";
  if (now - last.timestamp >= 30 * 60 * 1000) return "Stable";
  return null;
}
