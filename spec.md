# Rebunked

## Current State
The SourceDetailPage fetches an 'About' blurb from Wikipedia/Wikidata automatically when a source is loaded. If the fetch succeeds, it displays the blurb. If it fails or returns nothing, the About section is simply hidden with no fallback.

The TrustedSourcesPage has a modal for suggesting a new trusted source with fields for domain and source type. There is no About/description field in the suggestion form.

## Requested Changes (Diff)

### Add
- Manual About blurb field on SourceDetailPage: appears only when auto-fetch returns nothing, editable by the original source suggester AND admin
- 500 character limit on manual blurb with live character counter
- Save/edit controls for the manual blurb (save button, edit button to re-open textarea)
- Priority order for About display: (1) admin manual override, (2) Wikipedia auto-fetch, (3) suggester manual blurb
- Manual blurb stored in localStorage keyed by domain (frontend-only, since backend upgrades are risky)

### Modify
- SourceDetailPage About section: add conditional rendering logic -- show auto-fetched blurb if available, otherwise show manual entry UI for eligible users, otherwise show nothing

### Remove
- Nothing removed

## Implementation Plan
1. In SourceDetailPage, track manual about blurb state per domain in localStorage
2. After Wikipedia fetch completes (and returns nothing), show a textarea for the source suggester and admin to enter a description
3. Textarea has 500 char limit and a live counter
4. On save, persist to localStorage keyed by `about_blurb_{domain}`
5. On load, read from localStorage as fallback when auto-fetch returns nothing
6. Display saved blurb identically to auto-fetched blurb (same styling)
7. Add edit button for suggester/admin to modify a saved blurb
8. Admin always sees the edit controls; non-admin sees them only if their principalId matches the source's suggestedBy field
