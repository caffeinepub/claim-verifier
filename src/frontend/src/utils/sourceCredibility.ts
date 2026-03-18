/**
 * Dynamic Source Credibility Adjustment
 *
 * Computes a dynamic credibility bonus OR penalty for a source based on:
 *  - Community approval ratio (upvote %)
 *  - Evidence track record (how well evidence citing this source performs)
 *
 * Four-state status system:
 *  - pending:    < 25 total votes
 *  - trusted:    >= 25 votes, 60%+ approval → full boost
 *  - contested:  >= 25 votes, 40–60% approval → linear scale between full penalty and full boost
 *  - not-trusted: >= 25 votes, < 40% approval → full penalty
 *
 * Linear scaling:
 *  ratio >= 0.6  → full boost (ceiling)
 *  ratio 0.5–0.6 → linear from 0 to full boost
 *  ratio 0.4–0.5 → linear from full penalty to 0
 *  ratio < 0.4   → full penalty (negative ceiling)
 */

export type SourceStatus = "pending" | "trusted" | "contested" | "not-trusted";

const SOURCE_TYPE_CEILINGS: Record<string, number> = {
  "peer-reviewed": 5,
  government: 4,
  "major-news": 3,
  independent: 2,
  reference: 2,
  blog: 1,
  archive: 1.5,
  social: 0.5,
};

export interface DynamicBoostResult {
  /** Formatted string like "+2.3%" or "-1.5%" */
  dynamicBonus: string;
  /** Formatted ceiling string like "up to +5%" */
  ceilingLabel: string;
  /** Raw ratio score component (-1 to 1) */
  ratioScore: number;
  /** 0–1 score from track record, or null if not enough data */
  trackRecordScore: number | null;
  /** Combined score (-1 to 1) used to compute the bonus */
  combined: number;
  /** Whether track record data was used (>= 5 evidence cards) */
  hasTrackRecord: boolean;
  /** The ceiling % for this source type */
  ceiling: number;
  /** Whether value is a penalty (negative) */
  isPenalty: boolean;
}

/**
 * Get the ceiling (max possible bonus) for a source type as a number.
 */
export function getSourceTypeCeiling(type: string): number {
  return SOURCE_TYPE_CEILINGS[type] ?? 0;
}

/**
 * Determine the four-state status of a source based on vote counts.
 */
export function getSourceStatus(
  upvotes: number,
  downvotes: number,
): SourceStatus {
  const total = upvotes + downvotes;
  if (total < 25) return "pending";
  const ratio = upvotes / total;
  if (ratio >= 0.6) return "trusted";
  if (ratio >= 0.4) return "contested";
  return "not-trusted";
}

/**
 * Compute scaled adjustment (positive = boost, negative = penalty).
 * Full linear scaling:
 *  ratio >= 0.6  → ceiling (full boost)
 *  ratio 0.5–0.6 → 0 to ceiling (linear)
 *  ratio 0.4–0.5 → -ceiling to 0 (linear)
 *  ratio < 0.4   → -ceiling (full penalty)
 */
function computeScaledAdjustment(upvoteRatio: number, ceiling: number): number {
  if (upvoteRatio >= 0.6) return ceiling;
  if (upvoteRatio >= 0.5) return ceiling * ((upvoteRatio - 0.5) / 0.1);
  if (upvoteRatio >= 0.4) return -ceiling * ((0.5 - upvoteRatio) / 0.1);
  return -ceiling;
}

/**
 * Compute the dynamic credibility adjustment for a source.
 * Returns a signed value: positive = boost, negative = penalty.
 * Used for verdict tally calculations.
 *
 * @param upvotes - Total upvotes for this source
 * @param downvotes - Total downvotes for this source
 * @param sourceType - The source type string (e.g. "peer-reviewed")
 * @param evidenceCards - Evidence cards citing this source (for track record)
 */
export function computeSourceAdjustment(
  upvotes: number,
  downvotes: number,
  sourceType: string,
  evidenceCards: { netScore: number }[] = [],
  qualityGateThreshold = 3,
): number {
  const ceiling = getSourceTypeCeiling(sourceType);
  if (ceiling === 0) return 0;

  const total = upvotes + downvotes;
  if (total === 0) return 0;

  const ratio = upvotes / total;
  const status = getSourceStatus(upvotes, downvotes);

  // Pending: no adjustment
  if (status === "pending") return 0;

  const hasTrackRecord = evidenceCards.length >= 5;

  if (!hasTrackRecord) {
    return computeScaledAdjustment(ratio, ceiling);
  }

  // With track record: ratio (50%) + track record (50%)
  // Track record can only be positive (0 to 1)
  const avgNetScore =
    evidenceCards.reduce((sum, c) => sum + Math.max(0, c.netScore), 0) /
    evidenceCards.length;
  const passingRate =
    evidenceCards.filter((c) => c.netScore >= qualityGateThreshold).length /
    evidenceCards.length;
  const trackRecordScore = Math.max(
    0,
    Math.min(1, (avgNetScore / 10) * 0.5 + passingRate * 0.5),
  );

  const ratioComponent = computeScaledAdjustment(ratio, ceiling) * 0.5;
  const trackComponent = trackRecordScore * ceiling * 0.5;
  return ratioComponent + trackComponent;
}

/**
 * Compute the dynamic credibility boost for a source (legacy display function).
 * Returns a DynamicBoostResult for UI display purposes.
 */
export function computeDynamicSourceBoost(
  sourceType: string,
  upvoteRatio: number,
  evidenceCards: { netScore: number }[],
  qualityGateThreshold = 3,
): DynamicBoostResult {
  const ceiling = getSourceTypeCeiling(sourceType);

  // Use linear scaling for ratio score (-1 to 1 range, normalize to display)
  const rawScaled = computeScaledAdjustment(upvoteRatio, ceiling);
  const ratioScore = ceiling > 0 ? rawScaled / ceiling : 0; // -1 to 1

  const hasTrackRecord = evidenceCards.length >= 5;
  let trackRecordScore: number | null = null;
  let combined: number;

  if (hasTrackRecord) {
    const avgNetScore =
      evidenceCards.reduce((sum, c) => sum + Math.max(0, c.netScore), 0) /
      evidenceCards.length;
    const passingRate =
      evidenceCards.filter((c) => c.netScore >= qualityGateThreshold).length /
      evidenceCards.length;
    trackRecordScore = Math.max(
      0,
      Math.min(1, (avgNetScore / 10) * 0.5 + passingRate * 0.5),
    );
    combined = ratioScore * 0.5 + trackRecordScore * 0.5;
  } else {
    combined = ratioScore;
  }

  const bonusValue = ceiling * combined;
  const isPenalty = bonusValue < 0;
  const sign = isPenalty ? "" : "+";
  const dynamicBonus = `${sign}${bonusValue.toFixed(1)}%`;
  const ceilingLabel = `up to +${ceiling % 1 === 0 ? ceiling.toFixed(0) : ceiling.toFixed(1)}%`;

  return {
    dynamicBonus,
    ceilingLabel,
    ratioScore,
    trackRecordScore,
    combined,
    hasTrackRecord,
    ceiling,
    isPenalty,
  };
}

/**
 * Filter evidence cards (from backend) that cite a given domain.
 * Pass in evidence items with their net scores.
 */
export function getEvidenceCardsForDomain(
  domain: string,
  allEvidence: { urls?: string[]; netScore?: number }[] = [],
): { netScore: number }[] {
  const normalizedDomain = domain.toLowerCase().replace(/^www\./, "");
  return allEvidence
    .filter((e) => {
      const urls: string[] = e.urls ?? [];
      return urls.some((url) => {
        try {
          const hostname = new URL(url).hostname
            .toLowerCase()
            .replace(/^www\./, "");
          return (
            hostname === normalizedDomain ||
            hostname.endsWith(`.${normalizedDomain}`)
          );
        } catch {
          return url.toLowerCase().includes(normalizedDomain);
        }
      });
    })
    .map((e) => ({
      netScore: e.netScore ?? 0,
    }));
}

// ── Evidence-Performance Credibility System ───────────────────────────────────

export type CredibilityStatus = "insufficient" | "scored";

export type CredibilityResult =
  | { status: "insufficient"; citations: number }
  | {
      status: "scored";
      score: number;
      passRate: number;
      avgNetScore: number;
      qualityCleared: number;
      totalCitations: number;
      label: "High Credibility" | "Mixed" | "Low Credibility";
    };

/**
 * Compute evidence-performance-based credibility for a source domain.
 * Uses RAW (unboosted) evidence net scores.
 *
 * @param domain - The source domain (e.g. "reuters.com")
 * @param evidenceItems - All evidence with their raw net scores and URLs
 * @param qualityGate - Minimum net score to count as quality-cleared (default +3)
 */
export function computeSourceCredibility(
  domain: string,
  evidenceItems: { urls?: string[]; netScore: number }[],
  qualityGate = 3,
): CredibilityResult {
  const normalizedDomain = domain.toLowerCase().replace(/^www\./, "");

  // Filter evidence that cites this domain
  const citingEvidence = evidenceItems.filter((e) => {
    const urls: string[] = e.urls ?? [];
    return urls.some((url) => {
      try {
        const hostname = new URL(url).hostname
          .toLowerCase()
          .replace(/^www\./, "");
        return (
          hostname === normalizedDomain ||
          hostname.endsWith(`.${normalizedDomain}`)
        );
      } catch {
        return url.toLowerCase().includes(normalizedDomain);
      }
    });
  });

  const totalCitations = citingEvidence.length;

  if (totalCitations < 5) {
    return { status: "insufficient", citations: totalCitations };
  }

  const qualityCleared = citingEvidence.filter(
    (e) => e.netScore >= qualityGate,
  );
  const passRate = (qualityCleared.length / totalCitations) * 100;

  const avgNetScore =
    qualityCleared.length > 0
      ? qualityCleared.reduce((sum, e) => sum + e.netScore, 0) /
        qualityCleared.length
      : 0;

  // Normalize avgNetScore: cap at +10 for max score = 100
  const normalizedAvgNet = Math.min((avgNetScore / 10) * 100, 100);

  // Composite: 60% avg net score + 40% pass rate
  const compositeScore = normalizedAvgNet * 0.6 + passRate * 0.4;

  const label =
    compositeScore >= 70
      ? ("High Credibility" as const)
      : compositeScore >= 40
        ? ("Mixed" as const)
        : ("Low Credibility" as const);

  return {
    status: "scored",
    score: compositeScore,
    passRate,
    avgNetScore,
    qualityCleared: qualityCleared.length,
    totalCitations,
    label,
  };
}
