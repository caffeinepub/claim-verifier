# Rebunked

## Current State

- Verified accounts have a `displayName` stored in `useVerifiedAccount` hook that is separate from the session `username`
- The `displayName` is set via a "Set your display name" dialog in App.tsx
- The `displayName` can be updated repeatedly with no restrictions
- Username uniqueness is not enforced
- The `needsUsernameSetup` flag sometimes triggers the dialog on page refresh due to async state initialization timing
- The `isSuggester` check in source detail uses display name string matching, causing mismatches

## Requested Changes (Diff)

### Add
- Username uniqueness enforcement: all chosen usernames stored in localStorage registry; when setting/changing a username, check against registry
- Username change cooldown: store `lastUsernameChangeTimestamp` per principal; block changes within 24 hours; show countdown message if blocked
- "Change Username" option in avatar dropdown or profile settings
- Available/taken feedback when typing a username in the setup/change dialog
- Time remaining feedback when attempting to change within 24hrs

### Modify
- Rename all "display name" references to "username" throughout codebase (dialog titles, labels, hooks, state variables)
- The username setup dialog: label it "Choose your username" instead of "Set your display name"
- The username is shown everywhere the display name was shown (profile, comments, evidence, avatar dropdown, source suggestions)
- `isSuggester` and similar checks should use principal ID as the canonical identity anchor, not display name string
- Username setup dialog only shows once, not on every refresh (fix async initialization race)

### Remove
- The concept of "display name" as separate from username -- they are now the same thing

## Implementation Plan

1. Update `useVerifiedAccount` hook:
   - Rename `displayName` -> `username` and `setDisplayName` -> `setUsername`
   - Add `canChangeUsername` boolean (true if no change in last 24hrs)
   - Add `timeUntilUsernameChange` string (e.g. "18h 32m")
   - Store `lastUsernameChangeTimestamp` in localStorage keyed by principal
   - On `setUsername`: check uniqueness registry in localStorage, check cooldown, update registry
   - Fix async initialization: read username synchronously from localStorage on mount, not from async state

2. Update username registry utility:
   - `isUsernameTaken(username, excludePrincipal)` -- checks localStorage registry
   - `registerUsername(username, principal)` -- adds to registry
   - `releaseUsername(oldUsername, principal)` -- removes old entry when changing

3. Update App.tsx:
   - Rename `displayName` -> `username`, `setDisplayName` -> `setUsername`
   - Update dialog title to "Choose your username"
   - Add real-time availability check in the dialog input (debounced)
   - Show "already taken" error or green checkmark inline
   - Add change username option (reuses same dialog with cooldown enforcement)

4. Update ProfilePage.tsx and all other components:
   - Replace `displayName` with `username` everywhere
   - Ensure `isSuggester` uses principal ID for checks, not username string

5. Propagate renames across all components that receive/show display name:
   - ClaimCard, ClaimDetail, EvidenceCard, SourceDetailPage, TrustedSourcesPage, etc.
