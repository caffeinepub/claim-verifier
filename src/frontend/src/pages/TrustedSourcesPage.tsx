import type { TrustedSourceInfo } from "@/backend.d";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useSessionVoteForSource,
  useSuggestTrustedSource,
  useTrustedSources,
  useVoteOnSource,
} from "@/hooks/useQueries";
import { useSessionGate } from "@/hooks/useSessionGate";
import { cn } from "@/lib/utils";
import {
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  Plus,
  Shield,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const SOURCE_TYPES = [
  { value: "peer-reviewed", label: "Peer-Reviewed Study", bonus: "+5%" },
  { value: "government", label: "Government Data", bonus: "+4%" },
  { value: "major-news", label: "Major News Org", bonus: "+3%" },
  { value: "independent", label: "Independent Journalism", bonus: "+2%" },
  { value: "blog", label: "Blog / Opinion", bonus: "+1%" },
  { value: "social", label: "Social Media", bonus: "+0.5%" },
];

export function getSourceTypeLabel(type: string): string {
  return SOURCE_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function getSourceTypeBonus(type: string): string {
  return SOURCE_TYPES.find((t) => t.value === type)?.bonus ?? "";
}

export function getSourceTypeBadgeClasses(type: string): string {
  switch (type) {
    case "peer-reviewed":
      return "bg-blue-500/15 text-blue-600 border-blue-500/30";
    case "government":
      return "bg-violet-500/15 text-violet-600 border-violet-500/30";
    case "major-news":
      return "bg-orange-500/15 text-orange-600 border-orange-500/30";
    case "independent":
      return "bg-emerald-500/15 text-emerald-600 border-emerald-500/30";
    case "blog":
      return "bg-yellow-500/15 text-yellow-600 border-yellow-500/30";
    case "social":
      return "bg-zinc-500/15 text-zinc-500 border-zinc-500/30";
    default:
      return "bg-secondary text-muted-foreground border-border";
  }
}

function stripDomain(input: string): string {
  return input
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split("/")[0]
    .toLowerCase();
}

function SourceVoteButtons({
  source,
  sessionId,
}: {
  source: TrustedSourceInfo;
  sessionId: string | null;
}) {
  const { checkVoteAction } = useSessionGate();
  const voteOnSource = useVoteOnSource();
  const { data: sessionVote } = useSessionVoteForSource(source.id, sessionId);

  const upvotes = Number(source.upvotes);
  const downvotes = Number(source.downvotes);
  const netScore = upvotes - downvotes;

  async function handleVote(direction: "up" | "down") {
    if (!sessionId) return;
    if (!checkVoteAction()) return;
    try {
      await voteOnSource.mutateAsync({
        sourceId: source.id,
        sessionId,
        direction,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to vote";
      toast.error(msg);
    }
  }

  const hasUp = sessionVote === "up";
  const hasDown = sessionVote === "down";

  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        data-ocid="source.toggle"
        onClick={() => handleVote("up")}
        disabled={voteOnSource.isPending}
        className={cn(
          "flex items-center justify-center w-7 h-7 rounded transition-colors",
          hasUp
            ? "text-primary bg-primary/10"
            : "text-muted-foreground hover:text-primary hover:bg-primary/10",
        )}
        aria-label="Upvote"
      >
        <ChevronUp className="h-4 w-4" />
      </button>
      <span
        className={cn(
          "text-xs font-bold font-mono w-6 text-center",
          netScore > 0
            ? "text-primary"
            : netScore < 0
              ? "text-destructive"
              : "text-muted-foreground",
        )}
      >
        {netScore}
      </span>
      <button
        type="button"
        data-ocid="source.toggle"
        onClick={() => handleVote("down")}
        disabled={voteOnSource.isPending}
        className={cn(
          "flex items-center justify-center w-7 h-7 rounded transition-colors",
          hasDown
            ? "text-destructive bg-destructive/10"
            : "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
        )}
        aria-label="Downvote"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}

function SourceCard({
  source,
  index,
  sessionId,
}: {
  source: TrustedSourceInfo;
  index: number;
  sessionId: string | null;
}) {
  const upvotes = Number(source.upvotes);
  const downvotes = Number(source.downvotes);
  const totalVotes = upvotes + downvotes;
  const upvotePct =
    totalVotes > 0 ? Math.round((upvotes / totalVotes) * 100) : 0;
  const votesProgress = Math.min(100, (totalVotes / 25) * 100);
  const approvalProgress = Math.min(100, upvotePct);

  const needsMoreVotes = totalVotes < 25;
  const needsMoreApproval = upvotePct < 60;
  const isClose = !source.isTrusted && !needsMoreVotes && needsMoreApproval;

  return (
    <motion.div
      data-ocid={`source.item.${index}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        "p-4 bg-card border rounded-sm transition-all",
        source.isTrusted
          ? "border-emerald-500/30 shadow-sm shadow-emerald-500/10"
          : "border-border",
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <a
              href={`https://${source.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold font-body text-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              {source.domain}
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
            {source.isTrusted && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold font-body bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                <ShieldCheck className="h-2.5 w-2.5" />
                TRUSTED
              </span>
            )}
            {source.adminOverride && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-body bg-violet-500/15 text-violet-600 border border-violet-500/30">
                Admin Approved
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-body font-medium border",
                getSourceTypeBadgeClasses(source.sourceType),
              )}
            >
              {getSourceTypeLabel(source.sourceType)}
            </span>
            <span className="text-[10px] font-body text-muted-foreground">
              {getSourceTypeBonus(source.sourceType)} credibility bonus
            </span>
          </div>
        </div>
        <SourceVoteButtons source={source} sessionId={sessionId} />
      </div>

      {/* Progress toward trust */}
      {!source.isTrusted && (
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-body text-muted-foreground">
                Votes toward threshold
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {totalVotes}/25
              </span>
            </div>
            <Progress
              value={votesProgress}
              className={cn(
                "h-1.5",
                needsMoreVotes
                  ? "[&>div]:bg-amber-400"
                  : "[&>div]:bg-emerald-500",
              )}
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-body text-muted-foreground">
                Upvote ratio
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {upvotePct}% / 60% needed
              </span>
            </div>
            <Progress
              value={approvalProgress}
              className={cn(
                "h-1.5",
                isClose
                  ? "[&>div]:bg-amber-400"
                  : upvotePct >= 60
                    ? "[&>div]:bg-emerald-500"
                    : "[&>div]:bg-muted-foreground/40",
              )}
            />
          </div>
        </div>
      )}

      {/* Submitter + vote count */}
      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border">
        <span className="text-[10px] font-body text-muted-foreground flex items-center gap-1">
          <Users className="h-2.5 w-2.5" />
          {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
        </span>
        <span className="text-[10px] font-body text-muted-foreground">
          Suggested by{" "}
          <span className="font-mono">{source.suggestedBy.slice(0, 8)}</span>
        </span>
      </div>
    </motion.div>
  );
}

function SuggestSourceDialog({ sessionId }: { sessionId: string | null }) {
  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState("");
  const [sourceType, setSourceType] = useState("");
  const { checkAction } = useSessionGate();
  const suggestSource = useSuggestTrustedSource();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionId || !domain.trim() || !sourceType) return;
    if (!checkAction()) return;
    const cleanDomain = stripDomain(domain);
    if (!cleanDomain) {
      toast.error("Please enter a valid domain");
      return;
    }
    try {
      await suggestSource.mutateAsync({
        domain: cleanDomain,
        sourceType,
        sessionId,
      });
      toast.success(`"${cleanDomain}" submitted for community review`);
      setOpen(false);
      setDomain("");
      setSourceType("");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to suggest source";
      toast.error(msg);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          data-ocid="sources.open_modal_button"
          onClick={() => {
            if (!checkAction()) return;
            setOpen(true);
          }}
          size="sm"
          className="font-body gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Suggest Source
        </Button>
      </DialogTrigger>
      <DialogContent data-ocid="sources.dialog" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            Suggest a Trusted Source
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="source-domain" className="font-body text-sm">
              Domain
            </Label>
            <Input
              id="source-domain"
              data-ocid="sources.input"
              placeholder="e.g. reuters.com or https://www.nature.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="font-body bg-secondary border-border"
              autoFocus
            />
            <p className="text-[10px] text-muted-foreground font-body">
              Protocol and www are stripped automatically.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="source-type" className="font-body text-sm">
              Source Type
            </Label>
            <Select value={sourceType} onValueChange={setSourceType}>
              <SelectTrigger
                id="source-type"
                data-ocid="sources.select"
                className="font-body bg-secondary border-border"
              >
                <SelectValue placeholder="Select a type…" />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_TYPES.map((t) => (
                  <SelectItem
                    key={t.value}
                    value={t.value}
                    className="font-body"
                  >
                    <span>{t.label}</span>
                    <span className="ml-2 text-muted-foreground text-xs">
                      {t.bonus}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="sources.cancel_button"
              onClick={() => setOpen(false)}
              className="font-body"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="sources.submit_button"
              disabled={
                suggestSource.isPending || !domain.trim() || !sourceType
              }
              className="font-body bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {suggestSource.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TrustedSourcesPage({
  sessionId,
}: {
  sessionId: string | null;
}) {
  const { data: sources, isLoading, error } = useTrustedSources();

  const trustedSources = (sources ?? []).filter((s) => s.isTrusted);
  const pendingSources = (sources ?? []).filter((s) => !s.isTrusted);

  return (
    <motion.div
      data-ocid="sources.page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-6 bg-primary rounded-full" />
              <h2 className="font-display text-2xl font-bold text-foreground">
                Trusted Sources
              </h2>
            </div>
            <p className="text-sm text-muted-foreground font-body ml-3">
              Community-verified sources that boost evidence quality. Sources
              need 25 votes with 60% approval to become trusted.
            </p>
          </div>
          <SuggestSourceDialog sessionId={sessionId} />
        </div>
      </div>

      {/* Stats bar */}
      {!isLoading && sources && sources.length > 0 && (
        <div className="flex items-center gap-6 mb-6 p-3 bg-secondary border border-border rounded-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-body">
              <span className="font-bold text-foreground">
                {trustedSources.length}
              </span>{" "}
              <span className="text-muted-foreground">trusted</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-body">
              <span className="font-bold text-foreground">
                {pendingSources.length}
              </span>{" "}
              <span className="text-muted-foreground">pending review</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            <span className="text-sm font-body text-muted-foreground">
              Upvote good sources to help them reach trusted status
            </span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div
          data-ocid="sources.loading_state"
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 bg-card border border-border rounded-sm space-y-3"
            >
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div
          data-ocid="sources.error_state"
          className="text-center py-16 text-muted-foreground"
        >
          <Shield className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-body text-sm">Failed to load sources.</p>
        </div>
      ) : sources && sources.length > 0 ? (
        <div className="space-y-8">
          {trustedSources.length > 0 && (
            <section>
              <h3 className="font-display text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Trusted Sources
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AnimatePresence>
                  {trustedSources.map((s, i) => (
                    <SourceCard
                      key={s.id.toString()}
                      source={s}
                      index={i + 1}
                      sessionId={sessionId}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {pendingSources.length > 0 && (
            <section>
              <h3 className="font-display text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                Pending Community Review
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AnimatePresence>
                  {pendingSources.map((s, i) => (
                    <SourceCard
                      key={s.id.toString()}
                      source={s}
                      index={i + 1}
                      sessionId={sessionId}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}
        </div>
      ) : (
        <div
          data-ocid="sources.empty_state"
          className="text-center py-20 text-muted-foreground"
        >
          <Shield className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="font-display text-xl font-semibold mb-1">
            No sources yet
          </p>
          <p className="text-sm font-body">
            Be the first to suggest a trusted source for the community.
          </p>
        </div>
      )}
    </motion.div>
  );
}
