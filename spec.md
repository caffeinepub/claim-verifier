# Rebunked

## Current State

The app is a community claim verification platform. Claims have direct votes (True/False/Unverified). Evidence has up/down votes tracked separately via `evidenceVotesArray`. The `getVoteTally` function currently only counts direct claim votes and returns `{ trueCount, falseCount, unverifiedCount }`. Evidence votes have no influence on the claim verdict tally.

## Requested Changes (Diff)

### Add
- New backend function `getEnhancedVoteTally(claimId)` that returns a breakdown of direct votes and evidence-weighted votes separately, plus combined totals.
- Evidence vote aggregation logic: for each piece of evidence on a claim, compute its net evidence vote score (upvotes - downvotes), multiply by 3.0 (evidence weight multiplier), and add to the tally bucket matching the evidence's `evidenceType` (True/False/Unverified). Negative net scores subtract from the tally (can go below zero if evidence-weighted contribution is negative).
- Response shape: `{ trueCount, falseCount, unverifiedCount, trueDirect, falseDirect, unverifiedDirect, trueFromEvidence, falseFromEvidence, unverifiedFromEvidence }` where `*Direct` = raw direct votes, `*FromEvidence` = evidence-weighted contribution (Float rounded to Int), and `trueCount/falseCount/unverifiedCount` = combined totals.

### Modify
- `getVoteTally` stays unchanged for backward compatibility (existing callers unaffected).
- Frontend verdict display updated to use `getEnhancedVoteTally` and show breakdown: e.g. "42 direct + 90 from evidence" for each verdict category.

### Remove
- Nothing removed.

## Implementation Plan

1. Add `getEnhancedVoteTally(claimId: Nat)` to `main.mo`:
   - Count direct votes per verdict (same as `getVoteTally`).
   - For each evidence on the claim, compute net evidence vote score.
   - Multiply net score by 3.0, convert to Int (truncate), add to the matching verdict bucket.
   - Return `{ trueCount, falseCount, unverifiedCount, trueDirect, falseDirect, unverifiedDirect, trueFromEvidence, falseFromEvidence, unverifiedFromEvidence }` all as Int.
2. Update `backend.d.ts` to include the new `getEnhancedVoteTally` function signature.
3. Update frontend `ClaimDetail` component to call `getEnhancedVoteTally` instead of (or alongside) `getVoteTally`, and render the breakdown display in the verdict tally section.
