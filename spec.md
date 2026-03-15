# Rebunked

## Current State

Rebunked is a community fact-checking platform with:
- Anonymous session-based users (localStorage session IDs)
- Optional verified accounts via Internet Identity (II) stored in useVerifiedAccount.ts
- Username stored in localStorage keyed by principalId
- Blob storage component available for file uploads
- Comments/replies store `authorUsername` in the backend
- No user profiles or avatars exist yet
- Header has Sign In / Sign Out button and displays displayName when logged in

## Requested Changes (Diff)

### Add
- **Avatar system**: Identicon avatars generated from username (client-side, no backend) as default. Logged-in users can upload a custom avatar via blob storage, URL stored in localStorage keyed by principalId.
- **UserAvatar component**: Renders circular avatar -- custom image if set, otherwise deterministic identicon from username. Accepts size prop (sm, md, lg). Shows nothing / fallback for anonymous users.
- **Profile page** (`/profile/:username`): Public-facing page showing large avatar, username + BadgeCheck badge, "Member since" date (stored in localStorage on first login), and avatar upload button (only shown to the profile owner). Accessible via `/profile/:username` URL.
- **Profile settings in header**: When logged in, clicking the user's avatar in the header opens a small dropdown with "View Profile" and "Change Avatar" options (or navigates directly to profile page).
- **Join date tracking**: When a user first logs in (needsUsernameSetup triggers), store a `rebunked_joined_${principalId}` timestamp in localStorage.
- **Avatars in comments**: Show UserAvatar (sm) next to `authorUsername` in ReplyThread replies and SourceDiscussion comments -- identicon-based for all users, custom image for users whose username matches the stored avatar.
- **Avatar in header**: Small circular avatar (32px) shown next to displayName in header when logged in, replacing or alongside the User icon.
- **Avatar in evidence cards**: Small avatar next to submitter session info if the sessionId matches a verified account.

### Modify
- `useVerifiedAccount.ts`: Add `joinDate` (read from localStorage) and `avatarUrl` / `setAvatarUrl` (read/write localStorage). Expose these in the returned state.
- `App.tsx`: Add `/profile/:username` route handling (same pattern as `/claim/:slug` and `/source/:domain`). Add a ProfilePage component render when route matches.
- Header in `App.tsx`: Replace the plain User icon with UserAvatar component when logged in.

### Remove
- Nothing removed.

## Implementation Plan

1. Create `src/frontend/src/utils/identicon.ts` -- deterministic identicon SVG generator from username string (unique color + pattern, no external deps)
2. Create `src/frontend/src/components/UserAvatar.tsx` -- renders avatar from custom URL or identicon, circular, size variants
3. Update `useVerifiedAccount.ts` -- add joinDate tracking on first login, add avatarUrl/setAvatarUrl backed by localStorage
4. Create `src/frontend/src/pages/ProfilePage.tsx` -- shows avatar (large), username, BadgeCheck badge, join date, contribution stats placeholder, avatar upload (owner only)
5. Update `App.tsx` -- add profile route handling, update header to use UserAvatar, add View Profile dropdown on avatar click
6. Update `ReplyThread.tsx` -- add UserAvatar (sm) next to authorUsername in each reply row
7. Update `SourceDiscussion.tsx` -- add UserAvatar (sm) next to authorUsername in each comment row
