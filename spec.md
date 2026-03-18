# Rebunked

## Current State
Source credibility boost/penalty is calculated using `computeSourceAdjustment` in `sourceCredibility.ts`, which uses a `SOURCE_TYPE_CEILINGS` map with different max caps per category (peer-reviewed: 5%, government: 4%, major-news: 3%, etc.). The category is passed in from the source type field.

## Requested Changes (Diff)

### Add
- Flat 10% max boost/penalty ceiling for all sources regardless of type
- New `computeSourceCredibilityBoost(credibilityScore)` function using evidence-performance credibility score (0-100) instead of vote ratio

### Modify
- `SOURCE_TYPE_CEILINGS` replaced with a single flat `FLAT_CEILING = 10`
- Boost formula: `boost = (credibilityScore / 100) * 10` for scores >= 50
- Penalty formula: `penalty = ((50 - credibilityScore) / 50) * 10` for scores < 50
- Pending sources (insufficient data): 0 boost/penalty
- All callers of `computeSourceAdjustment` updated to use new function

### Remove
- Category-based ceiling map (`SOURCE_TYPE_CEILINGS`)
- `getSourceTypeCeiling` function (no longer needed)

## Implementation Plan
1. Update `sourceCredibility.ts` -- replace category-based ceiling with flat 10%, add new `computeFlatSourceBoost(credibilityScore: number | null): number` function
2. Find and update all callers of the old boost functions in frontend components
3. Remove the `source_type` / category tag display from source cards and source detail page
