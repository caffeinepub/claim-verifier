# Rebunked

## Current State

Rebunked is a community-driven claim verification platform with:
- Claim cards, claim detail pages, evidence voting
- Source Credibility Index with a Sources directory (TrustedSourcesPage) and Source Detail pages (SourceDetailPage)
- Source discussion via SourceDiscussion component (threaded comments with likes)
- Source status badges (icon-only: ShieldCheck for trusted, Clock for pending, ShieldX for not trusted) with tooltips
- Source categories: Peer-reviewed (5%), Government (4%), Major News Org (3%), Independent journalism (2%), Blog/opinion (1%), Social media (0.5%)
- Admin controls section visible on SourceDetailPage (password-protected but the section/panel is always rendered)

## Requested Changes (Diff)

### Add
- Two new source categories: "Reference/encyclopedia" at 2% bonus and "Archive" at 1.5% bonus
- Image upload support in source discussion comments (inline in comment body, using existing blob storage/ImageUploader)
- Link submission support in source discussion comments (plain hyperlinks, using existing UrlInputList)

### Modify
- Source discussion: replace heart likes with upvotes only (no downvotes) — change the interaction model from likes to thumbs-up upvote counts
- Source status badges: remove background color and border styling — make them fully transparent/bare (icon + color only, no pill/badge container)
- Rename "Major News Org" category label to "Major News Organization" everywhere it appears (TrustedSourcesPage, SourceDetailPage, SubmitClaimDialog, any source type constants)
- Admin controls section on SourceDetailPage: hide the entire section (not just the controls) when not authenticated as admin

### Remove
- Nothing removed

## Implementation Plan

1. **Source category constants** — Add "Reference/encyclopedia" (2%) and "Archive" (1.5%) to the source type list/map wherever categories are defined. Rename "Major News Org" to "Major News Organization".
2. **Source status badges** — In TrustedSourceBadgeList.tsx and anywhere source status badges are rendered, remove background/border classes so only the icon and its color remain (no pill, no bg, no border).
3. **Admin controls section** — In SourceDetailPage.tsx, wrap the entire admin controls section in a conditional so it only renders when `isAdminAuthenticated` (or equivalent auth state) is true.
4. **SourceDiscussion** — Replace like (heart) interactions with upvote-only. Change the vote button from a heart icon to a ThumbsUp icon. Remove any downvote/dislike UI. Update sorting to use upvote count.
5. **SourceDiscussion image+link support** — Add ImageUploader (inline images) and UrlInputList (plain hyperlinks) to the comment submission form. Render uploaded images inline in comment body and URLs as anchor tags.
