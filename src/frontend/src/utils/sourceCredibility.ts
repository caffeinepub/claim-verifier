/**
 * Dynamic Source Credibility Boost
 *
 * Computes a dynamic credibility bonus for a trusted source based on:
 *  - Community approval ratio (upvote %)
 *  - Evidence track record (how well evidence citing this source performs)
 *
 * If < 5 evidence cards cite the source, weight falls 100% on ratio.
 * If >= 5 cards exist, weight is 50% ratio + 50% track record.
 */

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
  /** Formatted string like "+2.3%" */
  dynamicBonus: string;
  /** Formatted ceiling string like "up to +5%" */
  ceilingLabel: string;
  /** 0–1 score from upvote ratio component */
  ratioScore: number;
  /** 0–1 score from track record, or null if not enough data */
  trackRecordScore: number | null;
  /** Combined 0–1 score used to compute the bonus */
  combined: number;
  /** Whether track record data was used (>= 5 evidence cards) */
  hasTrackRecord: boolean;
  /** The ceiling % for this source type */
  ceiling: number;
}

/**
 * Get the ceiling (max possible bonus) for a source type as a number.
 */
export function getSourceTypeCeiling(type: string): number {
  return SOURCE_TYPE_CEILINGS[type] ?? 0;
}

/**
 * Compute the dynamic credibility boost for a source.
 *
 * @param sourceType - The source type string (e.g. "peer-reviewed")
 * @param upvoteRatio - Upvote ratio 0–1 (e.g. 0.82 for 82%)
 * @param evidenceCards - All evidence cards citing this source domain
 * @param qualityGateThreshold - Net score threshold for quality gate (default 3)
 */
export function computeDynamicSourceBoost(
  sourceType: string,
  upvoteRatio: number,
  evidenceCards: { netScore: number }[],
  qualityGateThreshold = 3,
): DynamicBoostResult {
  const ceiling = getSourceTypeCeiling(sourceType);

  // Ratio component: scales 0 at 60% approval to 1.0 at 100% approval
  const ratioScore = Math.max(0, Math.min(1, (upvoteRatio - 0.6) / 0.4));

  const hasTrackRecord = evidenceCards.length >= 5;
  let trackRecordScore: number | null = null;
  let combined: number;

  if (hasTrackRecord) {
    // Average net score (floor each card at 0, don't let negatives drag it down)
    const avgNetScore =
      evidenceCards.reduce((sum, c) => sum + Math.max(0, c.netScore), 0) /
      evidenceCards.length;
    // Passing rate: % of cards that meet the quality gate
    const passingRate =
      evidenceCards.filter((c) => c.netScore >= qualityGateThreshold).length /
      evidenceCards.length;
    // Track record score: 0–1
    trackRecordScore = Math.max(
      0,
      Math.min(1, (avgNetScore / 10) * 0.5 + passingRate * 0.5),
    );
    combined = ratioScore * 0.5 + trackRecordScore * 0.5;
  } else {
    combined = ratioScore;
  }

  const bonusValue = ceiling * combined;
  const dynamicBonus = `+${bonusValue.toFixed(1)}%`;
  const ceilingLabel = `up to +${ceiling % 1 === 0 ? ceiling.toFixed(0) : ceiling.toFixed(1)}%`;

  return {
    dynamicBonus,
    ceilingLabel,
    ratioScore,
    trackRecordScore,
    combined,
    hasTrackRecord,
    ceiling,
  };
}

/**
 * Get evidence cards from localStorage that cite a given domain.
 */
export function getEvidenceCardsForDomain(
  domain: string,
): { netScore: number }[] {
  try {
    const raw = localStorage.getItem("rebunked_evidence");
    if (!raw) return [];
    const allEvidence = JSON.parse(raw) as {
      urls?: string[];
      upvotes?: number;
      downvotes?: number;
      netScore?: number;
    }[];
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
        netScore:
          e.netScore !== undefined
            ? e.netScore
            : (e.upvotes ?? 0) - (e.downvotes ?? 0),
      }));
  } catch {
    return [];
  }
}
