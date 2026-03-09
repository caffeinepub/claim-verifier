# Rebunked

## Current State
Rebunked is a community-driven claim verification platform with anonymous voting, evidence submission, threaded replies, and spam controls. The UI uses a light theme with coral-orange accents, Bricolage Grotesque headings, and Outfit body font. Verdict badges are text-only colored pills. Category filters are plain text pills. Vote buttons are minimal up/down arrows. Claim cards show a thumbnail, title, and basic verdict badge.

## Requested Changes (Diff)

### Add
- Distinct Lucide icons for each verdict type (True, False, Contested, Unverified, Insufficient Data) displayed alongside verdict text on both claim cards and the detail page verdict banner
- Category icons (Lucide icons) next to each category label in the filter bar and on category badges
- Visual confidence/percentage meter on claim cards showing the true/false vote split as a percentage (e.g. "73% True")
- Colored left-border on claim cards based on verdict status (green=True, red=False, yellow=Contested, gray=Unverified/Insufficient)

### Modify
- Vote buttons (up/down) to be chunkier with a subtle scale bounce animation on click
- Verdict badges to include icons and be more visually expressive
- Category badges/pills to include icons

### Remove
- Nothing removed

## Implementation Plan
1. Add verdict icon map (Lucide icons: CheckCircle2 for True, XCircle for False, Swords/GitMerge for Contested, Search for Unverified, BarChart2 for Insufficient Data)
2. Add category icon map (Lucide icons per category)
3. Update VerdictBadge component to include icon
4. Update claim card to show colored left-border based on verdict, and add percentage confidence meter
5. Update verdict banner on detail page to show icon
6. Update CategoryBadge component to include icon
7. Add CSS animation for vote button bounce on click
8. Update vote buttons to be chunkier styled
