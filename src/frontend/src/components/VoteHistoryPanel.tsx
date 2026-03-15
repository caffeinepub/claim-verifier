import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getVerifiedVotes } from "@/hooks/useVerifiedAccount";
import { formatRelativeTime } from "@/utils/time";
import { History } from "lucide-react";
import { useState } from "react";

const VOTE_LABELS: Record<string, { label: string; color: string }> = {
  True: { label: "REBUNKED", color: "text-emerald-600" },
  False: { label: "DEBUNKED", color: "text-rose-500" },
  Unverified: { label: "Unverified", color: "text-amber-500" },
};

export function VoteHistoryPanel() {
  const [open, setOpen] = useState(false);

  const votes = getVerifiedVotes();
  const entries = Object.entries(votes).sort(
    (a, b) => b[1].timestamp - a[1].timestamp,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          data-ocid="vote_history.open_modal_button"
          className="gap-1.5 h-8 px-2 text-muted-foreground hover:text-foreground font-body"
          aria-label="Vote history"
        >
          <History className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">History</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-72 p-0"
        data-ocid="vote_history.popover"
      >
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold font-display text-foreground">
            Vote History
          </p>
          <p className="text-xs text-muted-foreground font-body mt-0.5">
            Your votes as a verified account
          </p>
        </div>
        {entries.length === 0 ? (
          <div
            data-ocid="vote_history.empty_state"
            className="px-4 py-6 text-center text-xs text-muted-foreground font-body"
          >
            No votes recorded yet.
          </div>
        ) : (
          <ScrollArea className="max-h-64">
            <div className="py-1">
              {entries.map(([claimId, record]) => {
                const meta = VOTE_LABELS[record.voteType] ?? {
                  label: record.voteType,
                  color: "text-foreground",
                };
                return (
                  <div
                    key={claimId}
                    className="px-4 py-2.5 hover:bg-secondary/50 transition-colors"
                  >
                    <p className="text-xs font-body text-foreground line-clamp-1 mb-0.5">
                      {record.claimTitle || `Claim #${claimId}`}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold font-mono ${meta.color}`}
                      >
                        {meta.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-body">
                        ·{" "}
                        {formatRelativeTime(
                          BigInt(record.timestamp) * 1_000_000n,
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
