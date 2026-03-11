export type OverallVerdict =
  | "True"
  | "False"
  | "Unverified"
  | "Contested"
  | "Insufficient Data";

/**
 * Compute the overall verdict for a claim.
 *
 * @param trueCount  - combined (direct + evidence-weighted, floored ≥ 0) True votes
 * @param falseCount - combined False votes
 * @param unverifiedCount - combined Unverified votes
 * @param directTotal - unused, kept for API compatibility
 *
 * The threshold uses the floored combined total so that:
 *  - positive evidence can help reach the 5-vote minimum
 *  - negative evidence (already floored to 0 before this call) cannot suppress it
 */
export function computeOverallVerdict(
  trueCount: number,
  falseCount: number,
  unverifiedCount: number,
  _directTotal?: number,
): OverallVerdict {
  const combinedTotal = trueCount + falseCount + unverifiedCount;

  if (combinedTotal < 5) return "Insufficient Data";

  const max = Math.max(trueCount, falseCount, unverifiedCount);
  const tiedCount = [trueCount, falseCount, unverifiedCount].filter(
    (v) => v === max,
  ).length;

  if (tiedCount > 1) return "Contested";
  if (trueCount === max) return "True";
  if (falseCount === max) return "False";
  return "Unverified";
}
