import { UserAvatar } from "@/components/UserAvatar";
import {
  UserProfileCard,
  isVerifiedUsername,
} from "@/components/UserProfileCard";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type TrustedSourceInfo,
  useSuggestTrustedSource,
  useTrustedSources,
} from "@/hooks/useQueries";
import { useSessionGate } from "@/hooks/useSessionGate";
import {
  appendRepEvent,
  appendUserSource,
  getActivePrincipalId,
  useVerifiedAccount,
} from "@/hooks/useVerifiedAccount";
import { cn } from "@/lib/utils";
import {
  computeDynamicSourceBoost,
  getEvidenceCardsForDomain,
} from "@/utils/sourceCredibility";
import {
  CheckCircle2,
  ExternalLink,
  Globe,
  Loader2,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const SOURCE_TYPES = [
  { value: "peer-reviewed", label: "Peer-Reviewed Study", bonus: "+5%" },
  { value: "government", label: "Government Data", bonus: "+4%" },
  { value: "major-news", label: "Major News Organization", bonus: "+3%" },
  { value: "independent", label: "Independent Journalism", bonus: "+2%" },
  { value: "reference", label: "Reference / Encyclopedia", bonus: "+2%" },
  { value: "blog", label: "Blog / Opinion", bonus: "+1%" },
  { value: "archive", label: "Archive", bonus: "+1.5%" },
  { value: "social", label: "Social Media", bonus: "+0.5%" },
];

export function getSourceTypeLabel(type: string): string {
  return SOURCE_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function getSourceTypeBonus(type: string): string {
  return SOURCE_TYPES.find((t) => t.value === type)?.bonus ?? "";
}

export function getSourceTypeCeiling(type: string): number {
  const bonusStr = SOURCE_TYPES.find((t) => t.value === type)?.bonus ?? "+0%";
  return Number.parseFloat(bonusStr.replace("+", "").replace("%", "")) || 0;
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
    case "reference":
      return "bg-sky-500/15 text-sky-600 border-sky-500/30";
    case "archive":
      return "bg-teal-500/15 text-teal-600 border-teal-500/30";
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

/** Tries Clearbit logo → Google favicon → Globe icon */
function SourceLogo({
  domain,
  size = "sm",
}: {
  domain: string;
  size?: "sm" | "lg";
}) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const sizeClass = size === "lg" ? "w-10 h-10" : "w-8 h-8";
  const iconSize = size === "lg" ? "h-5 w-5" : "h-4 w-4";

  if (step === 2) {
    return (
      <Globe className={cn(iconSize, "text-muted-foreground flex-shrink-0")} />
    );
  }

  const src =
    step === 0
      ? `https://logo.clearbit.com/${domain}`
      : `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  return (
    <img
      src={src}
      alt={domain}
      className={cn(sizeClass, "rounded object-contain flex-shrink-0")}
      onError={() => setStep((s) => (s < 2 ? ((s + 1) as 0 | 1 | 2) : 2))}
    />
  );
}

function DynamicBonusLabel({
  sourceType,
  domain,
  upvotes,
  downvotes,
}: {
  sourceType: string;
  domain: string;
  upvotes: number;
  downvotes: number;
}) {
  const total = upvotes + downvotes;
  const ratio = total > 0 ? upvotes / total : 0;
  const cards = getEvidenceCardsForDomain(domain);
  const { dynamicBonus, ceilingLabel, hasTrackRecord } =
    computeDynamicSourceBoost(sourceType, ratio, cards);
  return (
    <span className="text-[10px] font-body text-muted-foreground">
      {hasTrackRecord ? dynamicBonus : ceilingLabel} credibility bonus
    </span>
  );
}

function SourceCard({
  source,
  index,
  onSourceClick,
}: {
  source: TrustedSourceInfo;
  index: number;
  sessionId: string | null;
  onSourceClick?: (domain: string) => void;
}) {
  const currentPrincipalId = getActivePrincipalId();
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
      onClick={() => onSourceClick?.(source.domain)}
      className={cn(
        "p-4 bg-card border rounded-sm transition-all cursor-pointer",
        source.isTrusted
          ? "border-emerald-500/30 shadow-sm shadow-emerald-500/10 hover:border-emerald-500/60 hover:shadow-emerald-500/20"
          : "border-border hover:border-primary/40 hover:shadow-sm",
        onSourceClick && "hover:bg-secondary/40",
      )}
    >
      {/* Header row */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 mt-0.5">
          <SourceLogo domain={source.domain} size="sm" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <a
              href={`https://${source.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-bold font-body text-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              {source.domain}
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
            {source.isTrusted && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center cursor-default text-emerald-600">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs max-w-[220px]">
                    Trusted source — verified by the community with 60%+
                    approval
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
            <DynamicBonusLabel
              sourceType={source.sourceType}
              domain={source.domain}
              upvotes={Number(source.upvotes)}
              downvotes={Number(source.downvotes)}
            />
          </div>
        </div>
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
        <span className="text-[10px] font-body text-muted-foreground flex items-center gap-1">
          {(() => {
            const isSugg = !!(
              currentPrincipalId &&
              localStorage.getItem(`source_principal_${source.domain}`) ===
                currentPrincipalId
            );
            const sugUsername = isSugg
              ? localStorage.getItem(
                  `rebunked_username_${currentPrincipalId}`,
                ) ||
                source.suggestedByUsername ||
                "unknown"
              : source.suggestedByUsername || "unknown";
            const sugAvatarUrl = isSugg
              ? (localStorage.getItem(
                  `rebunked_avatar_${currentPrincipalId}`,
                ) ?? undefined)
              : undefined;
            const sugVerified = isSugg || isVerifiedUsername(sugUsername);
            return (
              <UserProfileCard username={sugUsername} isVerified={sugVerified}>
                <UserAvatar
                  username={sugUsername}
                  avatarUrl={sugAvatarUrl}
                  size="xs"
                  isVerified={isSugg}
                />
              </UserProfileCard>
            );
          })()}
          Suggested by{" "}
          <span>
            {(() => {
              if (currentPrincipalId) {
                const storedPrincipal = localStorage.getItem(
                  `source_principal_${source.domain}`,
                );
                if (storedPrincipal === currentPrincipalId) {
                  const verifiedName = localStorage.getItem(
                    `rebunked_username_${currentPrincipalId}`,
                  );
                  if (verifiedName) return verifiedName;
                }
              }
              return source.suggestedByUsername || "unknown";
            })()}
          </span>
        </span>
      </div>
    </motion.div>
  );
}

type WikiFetchStatus = "idle" | "checking" | "found" | "not-found";

function SuggestSourceDialog({ sessionId }: { sessionId: string | null }) {
  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [aboutBlurb, setAboutBlurb] = useState("");
  const [wikiStatus, setWikiStatus] = useState<WikiFetchStatus>("idle");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { checkAction } = useSessionGate();
  const suggestSource = useSuggestTrustedSource();
  const { principalId, username: verifiedUsername } = useVerifiedAccount();

  // Debounced Wikipedia fetch when domain changes
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    const cleaned = stripDomain(domain);
    if (cleaned.length < 4) {
      setWikiStatus("idle");
      return;
    }

    setWikiStatus("checking");

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleaned)}`,
        );
        if (!res.ok) {
          setWikiStatus("not-found");
          return;
        }
        const data = await res.json();
        const hasContent =
          (data.extract && data.extract.trim().length > 0) ||
          (data.description && data.description.trim().length > 0);
        setWikiStatus(hasContent ? "found" : "not-found");
      } catch {
        setWikiStatus("not-found");
      }
    }, 500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [domain]);

  function resetForm() {
    setDomain("");
    setSourceType("");
    setAboutBlurb("");
    setWikiStatus("idle");
  }

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
      const username =
        verifiedUsername ??
        localStorage.getItem("claim_verifier_username") ??
        "anonymous";
      await suggestSource.mutateAsync({
        domain: cleanDomain,
        sourceType,
        sessionId,
        username,
      });
      // Save about blurb if the About field was shown (wiki not found) and filled in
      if (wikiStatus === "not-found" && aboutBlurb.trim()) {
        localStorage.setItem(`about_blurb_${cleanDomain}`, aboutBlurb.trim());
      }
      // Store principalId as canonical suggester identity for blurb editing
      if (principalId) {
        localStorage.setItem(`source_principal_${cleanDomain}`, principalId);
      }
      const pid = getActivePrincipalId();
      if (pid) {
        const ts = new Date().toISOString();
        appendUserSource(pid, {
          domain: cleanDomain,
          sourceType,
          timestamp: ts,
        });
        appendRepEvent(pid, {
          id: `source-${Date.now()}`,
          label: "Trusted source suggested",
          pointChange: 1,
          trustChange: 0,
          timestamp: ts,
        });
      }
      toast.success(`"${cleanDomain}" submitted for community review`);
      setOpen(false);
      resetForm();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to suggest source";
      toast.error(msg);
    }
  }

  const showAboutField = wikiStatus === "not-found";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
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
            {/* Wiki fetch status indicator */}
            <AnimatePresence mode="wait">
              {wikiStatus === "checking" && (
                <motion.p
                  key="checking"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-body"
                >
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Checking for About info...
                </motion.p>
              )}
              {wikiStatus === "found" && (
                <motion.p
                  key="found"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-body"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  About info found automatically
                </motion.p>
              )}
              {wikiStatus === "idle" && (
                <motion.p
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-[10px] text-muted-foreground font-body"
                >
                  Protocol and www are stripped automatically.
                </motion.p>
              )}
            </AnimatePresence>
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
                <SelectValue placeholder="Select a type\u2026" />
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

          {/* About field — only shown when wiki auto-fetch fails */}
          <AnimatePresence>
            {showAboutField && (
              <motion.div
                key="about-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-1.5 pt-0.5">
                  <Label htmlFor="source-about" className="text-sm font-body">
                    About this source{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea
                    id="source-about"
                    data-ocid="sources.textarea"
                    placeholder="Briefly describe this source (e.g. its focus, credibility, ownership)..."
                    value={aboutBlurb}
                    onChange={(e) =>
                      setAboutBlurb(e.target.value.slice(0, 500))
                    }
                    className="font-body text-sm resize-none"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {aboutBlurb.length}/500
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="sources.cancel_button"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
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
  onSourceClick,
}: {
  sessionId: string | null;
  onSourceClick?: (domain: string) => void;
}) {
  const { data: sources, isLoading, error } = useTrustedSources();
  const [searchQuery, setSearchQuery] = useState("");

  const allSources = sources ?? [];
  const filteredTrusted = allSources
    .filter((s) => s.isTrusted)
    .filter((s) => s.domain.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredPending = allSources
    .filter((s) => !s.isTrusted)
    .filter((s) => s.domain.toLowerCase().includes(searchQuery.toLowerCase()));

  const trustedSources = allSources.filter((s) => s.isTrusted);
  const pendingSources = allSources.filter((s) => !s.isTrusted);

  const hasNoSearchResults =
    searchQuery.trim() !== "" &&
    filteredTrusted.length === 0 &&
    filteredPending.length === 0;

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

      {/* Stats summary */}
      {!isLoading && sources && sources.length > 0 && (
        <p className="mb-4 text-sm font-body text-muted-foreground leading-relaxed">
          There are{" "}
          <span className="font-semibold text-primary tabular-nums">
            {trustedSources.length} trusted
          </span>{" "}
          and{" "}
          <span className="font-semibold text-foreground tabular-nums">
            {pendingSources.length} pending
          </span>{" "}
          sources.
        </p>
      )}

      {/* Search bar */}
      {!isLoading && sources && sources.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            data-ocid="sources.search_input"
            type="search"
            placeholder="Search sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 font-body bg-secondary border-border"
          />
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
      ) : hasNoSearchResults ? (
        <div
          data-ocid="sources.empty_state"
          className="text-center py-12 text-muted-foreground"
        >
          <Search className="h-8 w-8 mx-auto mb-3 opacity-25" />
          <p className="font-body text-sm">No sources match your search.</p>
        </div>
      ) : sources && sources.length > 0 ? (
        <div className="space-y-8">
          {filteredTrusted.length > 0 && (
            <section>
              <h3 className="font-display text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Trusted Sources
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AnimatePresence>
                  {filteredTrusted.map((s, i) => (
                    <SourceCard
                      key={s.id.toString()}
                      source={s}
                      index={i + 1}
                      sessionId={sessionId}
                      onSourceClick={onSourceClick}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {filteredPending.length > 0 && (
            <section>
              <h3 className="font-display text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                Pending Community Review
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AnimatePresence>
                  {filteredPending.map((s, i) => (
                    <SourceCard
                      key={s.id.toString()}
                      source={s}
                      index={i + 1}
                      sessionId={sessionId}
                      onSourceClick={onSourceClick}
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
