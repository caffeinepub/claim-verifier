export type OverallVerdict =
  | "True"
  | "False"
  | "Unverified"
  | "Contested"
  | "Insufficient Data";

export function computeOverallVerdict(
  trueCount: number,
  falseCount: number,
  unverifiedCount: number,
): OverallVerdict {
  const total =
    Math.max(0, trueCount) +
    Math.max(0, falseCount) +
    Math.max(0, unverifiedCount);

  if (total < 5) return "Insufficient Data";

  const max = Math.max(trueCount, falseCount, unverifiedCount);
  const tiedCount = [trueCount, falseCount, unverifiedCount].filter(
    (v) => v === max,
  ).length;

  if (tiedCount > 1) return "Contested";
  if (trueCount === max) return "True";
  if (falseCount === max) return "False";
  return "Unverified";
}
