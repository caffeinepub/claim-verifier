# Rebunked

## Current State
- VerifiedBadge is green and shown automatically for every verified (Internet Identity) account
- Tooltip reads "Verified account — votes count 1.5x"
- Badge appears in: profile page, avatar dropdown, evidence cards, reply threads
- No trust score or activity points system exists beyond vote count

## Requested Changes (Diff)

### Add
- Activity points tracker per principal (localStorage)
- Trust score per principal (localStorage, starts 65%)
- isTrustedContributor flag: activityPoints >= 25 AND trustScore >= 70%
- TC session tracking: when user earns TC status their sessionId is stored
- Progress section on profile page toward earning the badge
- Trust score shown in profile stats

### Modify
- VerifiedBadge: color to text-primary (orange), tooltip to "Trusted Contributor — earned through consistent quality participation"
- Profile page: only show badge if isTrustedContributor; show progress otherwise
- App.tsx dropdown: only show badge if isTrustedContributor
- ClaimDetail + ReplyThread: use isTrustedContributorSession() instead of isVerifiedSessionId()
- useVerifiedAccount: expose activityPoints, trustScore, isTrustedContributor

### Remove
- Automatic badge grant on account creation
