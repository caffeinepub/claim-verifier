# Rebunked

## Current State
The app has a localStorage-only evidence edit system (15-minute window, not persisted to backend). Claims and comments/replies have no edit functionality at all. The backend has no update functions for claims, evidence, or replies.

## Requested Changes (Diff)

### Add
- `updateClaim(id, newTitle, newDescription, principalId, password)` backend function
- `updateEvidence(id, newText, principalId, password)` backend function
- `updateReply(id, newText, principalId, password)` backend function
- `updateSourceComment(id, newText, principalId, password)` backend function
- `editedAt: Option<Int>` field to Claim, Evidence, Reply, SourceComment types
- `editHistory: [{text: Text; editedAt: Int}]` array field to Claim, Evidence, Reply, SourceComment types
- `wasEditedAfterVotes: Bool` field to Claim and Evidence types
- Edit UI (pencil icon button) on claims, evidence cards, and reply/comment threads — visible only to the verified author within the edit window
- "edited" label shown inline after edited content
- Edit history viewable via a small "(edited)" link that opens a modal showing previous versions
- "This claim was edited after voting began" notice on claim detail if claim was edited post-votes
- Flag on evidence cards "edited after receiving votes" if evidence was edited post-votes

### Modify
- Remove localStorage-only edit system (`saveEdit`, `getEdit`, `isWithinEditWindow` in `useAccountPermissions.ts`) — replace with real backend calls
- Edit window: 30 minutes for claims and evidence; permanent (no window) for comments/replies
- Only verified (logged-in) users can edit; anonymous users cannot
- Only the author of the content can edit it

### Remove
- `saveEdit`, `getEdit` localStorage edit helpers
- Evidence edit UI that writes to localStorage

## Implementation Plan
1. Add `updateClaim`, `updateEvidence`, `updateReply`, `updateSourceComment` to Motoko backend
2. Add `editedAt`, `editHistory`, `wasEditedAfterVotes` fields to Claim, Evidence, Reply, SourceComment types
3. Replace localStorage edit logic with backend mutation calls in ClaimDetail.tsx
4. Add 30-minute edit window check based on content timestamp (claims + evidence)
5. Add permanent edit capability for comments/replies (no window check)
6. Add edit UI (pencil icon) to claim detail header, evidence cards, and reply threads — only shown to verified author within window
7. Show "(edited)" label with clickable history modal on all edited content
8. Show post-vote edit notices on claims and evidence
