import type { Evidence } from "@/backend.d";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type TrustedSourceInfo,
  useAllEvidenceForAllClaims,
  useAllEvidenceTallies,
  useTrustedSources,
  useWikipediaBlurb,
} from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { computeSourceCredibility } from "@/utils/sourceCredibility";
import {
  BarChart2,
  ExternalLink,
  Globe,
  Info,
  Search,
  Shield,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

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

/** Tries Clearbit logo → Google favicon → Globe icon */
export function SourceLogo({
  domain,
  size = "sm",
}: {
  domain: string;
  size?: "sm" | "lg";
}) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const sizeClass = size === "lg" ? "w-10 h-10" : "w-10 h-10";
  const iconSize = size === "lg" ? "h-5 w-5" : "h-5 w-5";

  if (step === 2) {
    return (
      <span
        className={`${sizeClass} flex items-center justify-center rounded-lg bg-muted p-1 flex-shrink-0`}
      >
        <Globe className={`${iconSize} text-muted-foreground`} />
      </span>
    );
  }

  const src =
    step === 0
      ? `https://logo.clearbit.com/${domain}`
      : `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  return (
    <span className={`${sizeClass} flex-shrink-0 rounded-lg bg-muted p-1`}>
      <img
        src={src}
        alt={domain}
        loading="lazy"
        className="w-full h-full object-contain rounded"
        onError={() => setStep((s) => (s < 2 ? ((s + 1) as 0 | 1 | 2) : 2))}
      />
    </span>
  );
}

// ── Source Card ─────────────────────────────────────────────────────────────

function SourceCard({
  source,
  index,
  allEvidenceWithScores,
  onSourceClick,
}: {
  source: TrustedSourceInfo;
  index: number;
  allEvidenceWithScores: { urls?: string[]; netScore: number }[];
  onSourceClick?: (domain: string) => void;
}) {
  const credibility = useMemo(
    () => computeSourceCredibility(source.domain, allEvidenceWithScores),
    [source.domain, allEvidenceWithScores],
  );

  const borderColorClass =
    credibility.status === "scored" && credibility.label === "High Credibility"
      ? "border-l-green-500"
      : credibility.status === "scored" &&
          credibility.label === "Low Credibility"
        ? "border-l-red-500"
        : "border-l-amber-400";

  const scoreColor =
    credibility.status === "scored" && credibility.label === "High Credibility"
      ? "bg-emerald-500"
      : credibility.status === "scored" &&
          credibility.label === "Low Credibility"
        ? "bg-red-400"
        : "bg-amber-400";

  const { data: wikiBlurb } = useWikipediaBlurb(
    source.aboutBlurb?.trim() ? null : source.domain,
  );
  const aboutText = source.aboutBlurb?.trim() || wikiBlurb || null;

  return (
    <motion.div
      data-ocid={`source.item.${index}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => onSourceClick?.(source.domain)}
      className={cn(
        "p-5 bg-card border border-l-4 rounded-sm transition-all cursor-pointer hover:shadow-md",
        borderColorClass,
        credibility.status === "scored" &&
          credibility.label === "High Credibility"
          ? "border-emerald-500/20 hover:border-emerald-500/40"
          : credibility.status === "scored" &&
              credibility.label === "Low Credibility"
            ? "border-red-400/20 hover:border-red-400/40"
            : "border-border hover:border-primary/30",
      )}
    >
      {/* Top area: logo + domain */}
      <div className="flex items-start gap-3 mb-2">
        <SourceLogo domain={source.domain} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <a
              href={`https://${source.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-base font-bold font-body text-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              {source.domain}
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
            {source.adminOverride && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-body bg-violet-500/15 text-violet-600 border border-violet-500/30">
                Admin Approved
              </span>
            )}
          </div>
          {/* About blurb directly beneath domain */}
          {aboutText ? (
            <p className="text-xs font-body text-muted-foreground line-clamp-2 leading-relaxed">
              {aboutText}
            </p>
          ) : (
            <p className="text-xs font-body text-muted-foreground italic">
              No description available
            </p>
          )}
        </div>
      </div>

      {/* Stats area */}
      <div className="mt-3">
        {credibility.status === "insufficient" ? (
          <div>
            <div className="flex items-center justify-between text-[10px] font-body text-muted-foreground mb-1">
              <span>Citations toward score</span>
              <span className="font-mono">{credibility.citations} / 5</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${(credibility.citations / 5) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-body text-muted-foreground">
                Credibility
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold font-mono text-foreground">
                  {Math.round(credibility.score)}
                </span>
                <span className="text-[10px] font-body text-muted-foreground">
                  /100
                </span>
                <span className="text-[10px] font-body text-muted-foreground">
                  ·
                </span>
                <span className="text-[10px] font-body text-muted-foreground">
                  {credibility.totalCitations} citation
                  {credibility.totalCitations !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  scoreColor,
                )}
                style={{ width: `${Math.round(credibility.score)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export function TrustedSourcesPage({
  onSourceClick,
}: {
  sessionId?: string | null;
  onSourceClick?: (domain: string) => void;
}) {
  const { data: sources, isLoading, error } = useTrustedSources();
  const [searchQuery, setSearchQuery] = useState("");
  const [credTooltipOpen, setCredTooltipOpen] = useState(false);

  // Load all evidence for credibility computation
  const allEvidence = useAllEvidenceForAllClaims();
  const evidenceIds = useMemo(
    () => allEvidence.map((e: Evidence) => e.id),
    [allEvidence],
  );
  const { data: tallies } = useAllEvidenceTallies(evidenceIds);

  // Combine evidence with net scores
  const allEvidenceWithScores = useMemo(
    () =>
      allEvidence.map((e: Evidence) => ({
        ...e,
        netScore: tallies?.[e.id.toString()] ?? 0,
      })),
    [allEvidence, tallies],
  );

  const allSources = sources ?? [];
  const filteredSources = allSources.filter((s) =>
    s.domain.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const hasNoSearchResults =
    searchQuery.trim() !== "" && filteredSources.length === 0;

  return (
    <motion.div
      data-ocid="sources.page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h2 className="font-display text-2xl font-bold text-foreground">
            Source Index
          </h2>
        </div>
        <p className="text-sm text-muted-foreground font-body ml-3">
          Sources are automatically indexed when cited in claims or evidence.
          Credibility scores are calculated from how well evidence citing each
          source performs in the community.{" "}
          <TooltipProvider delayDuration={100}>
            <Tooltip open={credTooltipOpen} onOpenChange={setCredTooltipOpen}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground transition-colors focus-visible:outline-none align-middle"
                  onClick={() => setCredTooltipOpen((v) => !v)}
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="start"
                className="max-w-[200px] p-3 bg-white text-foreground border border-border shadow-md"
              >
                <p className="text-[11px] font-semibold text-foreground mb-2">
                  How credibility is calculated
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Only evidence with a community net score of +3 or higher
                  counts toward a source&apos;s credibility. Scores are
                  normalized so that average quality and pass rate are weighted
                  equally. A source needs at least 5 citations before receiving
                  a score.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </p>
      </div>

      {/* Search bar */}
      {!isLoading && allSources.length > 0 && (
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
              className="p-5 bg-card border border-l-4 border-l-muted border-border rounded-sm space-y-3"
            >
              <div className="flex items-start gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
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
      ) : allSources.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnimatePresence>
            {filteredSources.map((s, i) => (
              <SourceCard
                key={s.id.toString()}
                source={s}
                index={i + 1}
                allEvidenceWithScores={allEvidenceWithScores}
                onSourceClick={onSourceClick}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div
          data-ocid="sources.empty_state"
          className="text-center py-20 text-muted-foreground"
        >
          <BarChart2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="font-display text-xl font-semibold mb-1">
            No sources indexed yet
          </p>
          <p className="text-sm font-body">
            Sources will appear here automatically as users cite URLs in their
            claims and evidence.
          </p>
        </div>
      )}
    </motion.div>
  );
}
