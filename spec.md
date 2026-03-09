# Rebunked

## Current State
The app has a `getEnhancedVoteTally` backend query returning `trueCount`, `falseCount`, `unverifiedCount` (combined direct votes + 3x weighted evidence votes) plus breakdown fields. `ClaimCard` shows a `VerdictBar` with the tally. `ClaimDetail` shows a "Community Verdict" section with a `VerdictBar` and breakdown. No overall verdict label is computed or displayed anywhere.

## Requested Changes (Diff)

### Add
- `computeOverallVerdict(trueCount, falseCount, unverifiedCount)` utility function:
  - Total votes = trueCount + falseCount + unverifiedCount (treat negatives as 0 for total sum)
  - If total < 5 → return `"Insufficient Data"`
  - Find the max among the three counts
  - If two or more are tied at the max → return `"Contested"`
  - Otherwise return the winner: `"True"`, `"False"`, or `"Unverified"`
- `OverallVerdictBadge` component: compact colored pill for claim cards
  - True → green, False → red, Unverified → amber, Contested → slate, Insufficient Data → muted
- Prominent verdict **banner** on `ClaimDetail`: full-width, color-coded, large bold label, above the VerdictBar
- Verdict **badge** on `ClaimCard`: near the title, prominent

### Modify
- `ClaimCard`: add verdict badge using existing tally data (useVoteTally already fetched)
- `ClaimDetail`: add verdict banner in Community Verdict section, above VerdictBar

### Remove
- Nothing

## Implementation Plan
1. Add `computeOverallVerdict` to `src/utils/verdict.ts`
2. Create `OverallVerdictBadge` (compact) and `OverallVerdictBanner` (full-width) components
3. Update `ClaimCard` to show badge
4. Update `ClaimDetail` to show banner
5. Validate
