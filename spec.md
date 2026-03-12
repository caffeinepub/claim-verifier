# Rebunked

## Current State
The app has a `useSessionGate` hook in `src/frontend/src/hooks/useSessionGate.ts` that enforces a 15-minute read-only period for new sessions. All write actions call `checkAction()` before proceeding; if the session is under 15 minutes old, a toast is shown with the remaining wait time.

There is currently no rate limiting on the number of votes a session can cast within a time window.

## Requested Changes (Diff)

### Add
- A vote rate limiter in `useSessionGate.ts` (or a new `useVoteRateLimit.ts` hook): tracks timestamps of votes cast by the session using localStorage (`rebunked_vote_timestamps`). A "vote" counts as: direct claim votes (True/False/Unverified) and evidence upvotes/downvotes. Reply likes are excluded.
- Rate limit: 3 votes per 10-minute rolling window per session.
- When the limit is hit, show a toast/banner with the same pattern as the session gate: "You've reached the vote limit. Please wait X minutes before voting again." The toast ID should be unique to avoid stacking.
- A `checkVoteAction()` function exported from the gate hook/utility, called before any vote is cast (claim vote buttons + evidence vote buttons).

### Modify
- `ClaimDetail.tsx`: wrap direct claim vote action with `checkVoteAction()` before submitting.
- `EvidenceVoteButtons.tsx`: wrap evidence upvote/downvote actions with `checkVoteAction()` before submitting.
- `useSessionGate.ts`: add `checkVoteAction()` alongside existing `checkAction()`.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `checkVoteAction()` to `useSessionGate.ts`:
   - Read `rebunked_vote_timestamps` from localStorage (array of ISO timestamp strings).
   - Filter to only timestamps within the last 10 minutes.
   - If filtered count >= 3, show toast with minutes until oldest vote expires, return false.
   - If under limit, append current timestamp to array (trimmed to last 20 entries max), save to localStorage, return true.
2. Update `useSessionGate` hook return to include `checkVoteAction`.
3. In `ClaimDetail.tsx`, call `checkVoteAction()` before submitting a direct claim vote.
4. In `EvidenceVoteButtons.tsx`, call `checkVoteAction()` before submitting an evidence vote.
