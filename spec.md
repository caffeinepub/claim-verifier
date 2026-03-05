# Claim Verifier

## Current State
- Full-stack app with Motoko backend and React frontend.
- Users can submit claims, vote (True/False/Unverified), and submit evidence with images and links.
- Sessions are tracked via a localStorage session ID for anonymous identity.
- `submitVote` in the backend appends a new Vote record every call -- no deduplication, so a user can vote multiple times.
- `getSessionVoteForClaim` returns the first matching vote, so the UI shows the right highlight, but extra votes accumulate in the tally.
- Images on claims and evidence open in a new browser tab via an `<a href target="_blank">` link.

## Requested Changes (Diff)

### Add
- Lightbox component: clicking any image thumbnail opens a fullscreen overlay with the image centered, a close button, and keyboard (Escape) support.
- Optional arrow navigation if multiple images are in the same grid.

### Modify
- Backend `submitVote`: change from append to upsert -- if a vote already exists for (claimId, sessionId), update the verdict in-place instead of adding a new record. This ensures one vote per session per claim.
- Frontend `ImageGrid`: replace `<a href target="_blank">` with a button that opens the lightbox.

### Remove
- The external-link behavior on image thumbnails (no more opening images in new tab).

## Implementation Plan
1. Fix `submitVote` in `main.mo` to upsert: find existing vote for (claimId, sessionId), replace it if found, otherwise append.
2. Create a `Lightbox` component in the frontend with a full-screen modal overlay, image display, close button, Escape key handler, and prev/next arrows for multi-image grids.
3. Update `ImageGrid` in `ClaimDetail.tsx` to use the lightbox instead of `<a>` links.
4. Validate and deploy.
