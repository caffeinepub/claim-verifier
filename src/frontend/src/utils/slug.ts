import type { Claim } from "@/backend.d";

/**
 * Convert a title string to a URL-friendly slug.
 * Example: "Is the Earth Flat?" → "is-the-earth-flat"
 */
export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Compute the slug for a specific claim, accounting for uniqueness.
 * Claims are sorted by timestamp ascending; the first occurrence of a base slug
 * gets no suffix, subsequent ones get -2, -3, etc.
 */
export function getClaimSlug(targetClaim: Claim, allClaims: Claim[]): string {
  const baseSlug = titleToSlug(targetClaim.title);

  // Sort all claims by timestamp ascending to assign slug numbers consistently
  const sorted = [...allClaims].sort((a, b) => {
    if (a.timestamp < b.timestamp) return -1;
    if (a.timestamp > b.timestamp) return 1;
    return 0;
  });

  // Find all claims that share this base slug
  const sameSlug = sorted.filter((c) => titleToSlug(c.title) === baseSlug);

  const position = sameSlug.findIndex((c) => c.id === targetClaim.id);

  if (position <= 0) return baseSlug;
  return `${baseSlug}-${position + 1}`;
}

/**
 * Generate a unique slug for a new claim title (not yet in the list).
 * Used when pushing state after opening a claim.
 */
export function makeUniqueSlug(title: string, allClaims: Claim[]): string {
  const baseSlug = titleToSlug(title);

  const sorted = [...allClaims].sort((a, b) => {
    if (a.timestamp < b.timestamp) return -1;
    if (a.timestamp > b.timestamp) return 1;
    return 0;
  });

  const sameSlug = sorted.filter((c) => titleToSlug(c.title) === baseSlug);

  if (sameSlug.length === 0) return baseSlug;
  return `${baseSlug}-${sameSlug.length + 1}`;
}

/**
 * Find a claim from the list that matches a given slug.
 * Returns the matching Claim or undefined.
 */
export function findClaimBySlug(
  slug: string,
  allClaims: Claim[],
): Claim | undefined {
  const sorted = [...allClaims].sort((a, b) => {
    if (a.timestamp < b.timestamp) return -1;
    if (a.timestamp > b.timestamp) return 1;
    return 0;
  });

  // Group by base slug
  const groups: Record<string, Claim[]> = {};
  for (const claim of sorted) {
    const base = titleToSlug(claim.title);
    if (!groups[base]) groups[base] = [];
    groups[base].push(claim);
  }

  // Check each group to see if slug matches any position
  for (const [base, claims] of Object.entries(groups)) {
    for (let i = 0; i < claims.length; i++) {
      const candidateSlug = i === 0 ? base : `${base}-${i + 1}`;
      if (candidateSlug === slug) return claims[i];
    }
  }

  return undefined;
}
