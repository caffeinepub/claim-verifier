import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, bl as Globe, a1 as useTrustedSources, aY as useAllEvidenceForAllClaims, a6 as useAllEvidenceTallies, s as motion, ae as TooltipProvider, af as Tooltip, ag as TooltipTrigger, ai as TooltipContent, am as Search, an as Input, ac as Skeleton, A as AnimatePresence, h as ChartNoAxesColumn, aZ as useWikipediaBlurb, a as cn } from "./index-BjqCw5_m.js";
import { I as Info, S as Shield } from "./shield-BwJRUZ1u.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
];
const ExternalLink = createLucideIcon("external-link", __iconNode);
function computeSourceCredibility(domain, evidenceItems, qualityGate = 3) {
  const normalizedDomain = domain.toLowerCase().replace(/^www\./, "");
  const citingEvidence = evidenceItems.filter((e) => {
    const urls = e.urls ?? [];
    return urls.some((url) => {
      try {
        const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
        return hostname === normalizedDomain || hostname.endsWith(`.${normalizedDomain}`);
      } catch {
        return url.toLowerCase().includes(normalizedDomain);
      }
    });
  });
  const totalCitations = citingEvidence.length;
  if (totalCitations < 5) {
    return { status: "insufficient", citations: totalCitations };
  }
  const qualityCleared = citingEvidence.filter(
    (e) => e.netScore >= qualityGate
  );
  const passRate = qualityCleared.length / totalCitations * 100;
  const avgNetScore = qualityCleared.length > 0 ? qualityCleared.reduce((sum, e) => sum + e.netScore, 0) / qualityCleared.length : 0;
  const normalizedAvgNet = Math.min(avgNetScore / 10 * 100, 100);
  const compositeScore = normalizedAvgNet * 0.6 + passRate * 0.4;
  const label = compositeScore >= 70 ? "High Credibility" : compositeScore >= 40 ? "Mixed" : "Low Credibility";
  return {
    status: "scored",
    score: compositeScore,
    passRate,
    avgNetScore,
    qualityCleared: qualityCleared.length,
    totalCitations,
    label
  };
}
const FLAT_SOURCE_CEILING = 10;
function computeFlatSourceBoost(credibilityScore) {
  if (credibilityScore === null) return 0;
  if (credibilityScore >= 50) {
    return credibilityScore / 100 * FLAT_SOURCE_CEILING;
  }
  return -((50 - credibilityScore) / 50) * FLAT_SOURCE_CEILING;
}
const SOURCE_TYPES = [
  { value: "peer-reviewed", label: "Peer-Reviewed Study", bonus: "+5%" },
  { value: "government", label: "Government Data", bonus: "+4%" },
  { value: "major-news", label: "Major News Organization", bonus: "+3%" },
  { value: "independent", label: "Independent Journalism", bonus: "+2%" },
  { value: "reference", label: "Reference / Encyclopedia", bonus: "+2%" },
  { value: "blog", label: "Blog / Opinion", bonus: "+1%" },
  { value: "archive", label: "Archive", bonus: "+1.5%" },
  { value: "social", label: "Social Media", bonus: "+0.5%" }
];
function getSourceTypeLabel(type) {
  var _a;
  return ((_a = SOURCE_TYPES.find((t) => t.value === type)) == null ? void 0 : _a.label) ?? type;
}
function getSourceTypeBonus(type) {
  var _a;
  return ((_a = SOURCE_TYPES.find((t) => t.value === type)) == null ? void 0 : _a.bonus) ?? "";
}
function getSourceTypeCeiling(type) {
  var _a;
  const bonusStr = ((_a = SOURCE_TYPES.find((t) => t.value === type)) == null ? void 0 : _a.bonus) ?? "+0%";
  return Number.parseFloat(bonusStr.replace("+", "").replace("%", "")) || 0;
}
function getSourceTypeBadgeClasses(type) {
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
function SourceLogo({
  domain,
  size = "sm"
}) {
  const [step, setStep] = reactExports.useState(0);
  const sizeClass = size === "lg" ? "w-10 h-10" : "w-10 h-10";
  const iconSize = size === "lg" ? "h-5 w-5" : "h-5 w-5";
  if (step === 2) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: `${sizeClass} flex items-center justify-center rounded-lg bg-muted p-1 flex-shrink-0`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: `${iconSize} text-muted-foreground` })
      }
    );
  }
  const src = step === 0 ? `https://logo.clearbit.com/${domain}` : `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `${sizeClass} flex-shrink-0 rounded-lg bg-muted p-1`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "img",
    {
      src,
      alt: domain,
      loading: "lazy",
      className: "w-full h-full object-contain rounded",
      onError: () => setStep((s) => s < 2 ? s + 1 : 2)
    }
  ) });
}
function SourceCard({
  source,
  index,
  allEvidenceWithScores,
  onSourceClick
}) {
  var _a, _b;
  const credibility = reactExports.useMemo(
    () => computeSourceCredibility(source.domain, allEvidenceWithScores),
    [source.domain, allEvidenceWithScores]
  );
  const borderColorClass = credibility.status === "scored" && credibility.label === "High Credibility" ? "border-l-green-500" : credibility.status === "scored" && credibility.label === "Low Credibility" ? "border-l-red-500" : "border-l-amber-400";
  const scoreColor = credibility.status === "scored" && credibility.label === "High Credibility" ? "bg-emerald-500" : credibility.status === "scored" && credibility.label === "Low Credibility" ? "bg-red-400" : "bg-amber-400";
  const { data: wikiBlurb } = useWikipediaBlurb(
    ((_a = source.aboutBlurb) == null ? void 0 : _a.trim()) ? null : source.domain
  );
  const aboutText = ((_b = source.aboutBlurb) == null ? void 0 : _b.trim()) || wikiBlurb || null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      "data-ocid": `source.item.${index}`,
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: index * 0.04 },
      onClick: () => onSourceClick == null ? void 0 : onSourceClick(source.domain),
      className: cn(
        "p-5 bg-card border border-l-4 rounded-sm transition-all cursor-pointer hover:shadow-md",
        borderColorClass,
        credibility.status === "scored" && credibility.label === "High Credibility" ? "border-emerald-500/20 hover:border-emerald-500/40" : credibility.status === "scored" && credibility.label === "Low Credibility" ? "border-red-400/20 hover:border-red-400/40" : "border-border hover:border-primary/30"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SourceLogo, { domain: source.domain, size: "sm" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "a",
                {
                  href: `https://${source.domain}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  onClick: (e) => e.stopPropagation(),
                  className: "text-base font-bold font-body text-foreground hover:text-primary transition-colors flex items-center gap-1",
                  children: [
                    source.domain,
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3 opacity-60" })
                  ]
                }
              ),
              source.adminOverride && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-body bg-violet-500/15 text-violet-600 border border-violet-500/30", children: "Admin Approved" })
            ] }),
            aboutText ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-body text-muted-foreground line-clamp-2 leading-relaxed", children: aboutText }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-body text-muted-foreground italic", children: "No description available" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: credibility.status === "insufficient" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[10px] font-body text-muted-foreground mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Citations toward score" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono", children: [
              credibility.citations,
              " / 5"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "h-full bg-amber-400 rounded-full transition-all duration-500",
              style: { width: `${credibility.citations / 5 * 100}%` }
            }
          ) })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-body text-muted-foreground", children: "Credibility" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold font-mono text-foreground", children: Math.round(credibility.score) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-body text-muted-foreground", children: "/100" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-body text-muted-foreground", children: "·" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-body text-muted-foreground", children: [
                credibility.totalCitations,
                " citation",
                credibility.totalCitations !== 1 ? "s" : ""
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: cn(
                "h-full rounded-full transition-all duration-700",
                scoreColor
              ),
              style: { width: `${Math.round(credibility.score)}%` }
            }
          ) })
        ] }) })
      ]
    }
  );
}
function TrustedSourcesPage({
  onSourceClick
}) {
  const { data: sources, isLoading, error } = useTrustedSources();
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [credTooltipOpen, setCredTooltipOpen] = reactExports.useState(false);
  const allEvidence = useAllEvidenceForAllClaims();
  const evidenceIds = reactExports.useMemo(
    () => allEvidence.map((e) => e.id),
    [allEvidence]
  );
  const { data: tallies } = useAllEvidenceTallies(evidenceIds);
  const allEvidenceWithScores = reactExports.useMemo(
    () => allEvidence.map((e) => ({
      ...e,
      netScore: (tallies == null ? void 0 : tallies[e.id.toString()]) ?? 0
    })),
    [allEvidence, tallies]
  );
  const allSources = sources ?? [];
  const filteredSources = allSources.filter(
    (s) => s.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const hasNoSearchResults = searchQuery.trim() !== "" && filteredSources.length === 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      "data-ocid": "sources.page",
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1 h-6 bg-primary rounded-full" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-foreground", children: "Source Index" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground font-body ml-3", children: [
            "Sources are automatically indexed when cited in claims or evidence. Credibility scores are calculated from how well evidence citing each source performs in the community.",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { delayDuration: 100, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { open: credTooltipOpen, onOpenChange: setCredTooltipOpen, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  className: "inline-flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground transition-colors focus-visible:outline-none align-middle",
                  onClick: () => setCredTooltipOpen((v) => !v),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-3.5 w-3.5" })
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                TooltipContent,
                {
                  side: "top",
                  align: "start",
                  className: "max-w-[200px] p-3 bg-white text-foreground border border-border shadow-md",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold text-foreground mb-2", children: "How credibility is calculated" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground leading-relaxed", children: "Only evidence with a community net score of +3 or higher counts toward a source's credibility. Scores are normalized so that average quality and pass rate are weighted equally. A source needs at least 5 citations before receiving a score." })
                  ]
                }
              )
            ] }) })
          ] })
        ] }),
        !isLoading && allSources.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              "data-ocid": "sources.search_input",
              type: "search",
              placeholder: "Search sources...",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              className: "pl-9 font-body bg-secondary border-border"
            }
          )
        ] }),
        isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            "data-ocid": "sources.loading_state",
            className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
            children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "p-5 bg-card border border-l-4 border-l-muted border-border rounded-sm space-y-3",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "w-10 h-10 rounded-lg" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-1/2" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/4" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-1/2" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-2 w-full rounded-full" })
                ]
              },
              i
            ))
          }
        ) : error ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            "data-ocid": "sources.error_state",
            className: "text-center py-16 text-muted-foreground",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-10 w-10 mx-auto mb-3 opacity-30" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-sm", children: "Failed to load sources." })
            ]
          }
        ) : hasNoSearchResults ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            "data-ocid": "sources.empty_state",
            className: "text-center py-12 text-muted-foreground",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-8 w-8 mx-auto mb-3 opacity-25" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-sm", children: "No sources match your search." })
            ]
          }
        ) : allSources.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: filteredSources.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          SourceCard,
          {
            source: s,
            index: i + 1,
            allEvidenceWithScores,
            onSourceClick
          },
          s.id.toString()
        )) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            "data-ocid": "sources.empty_state",
            className: "text-center py-20 text-muted-foreground",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "h-12 w-12 mx-auto mb-4 opacity-20" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-xl font-semibold mb-1", children: "No sources indexed yet" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-body", children: "Sources will appear here automatically as users cite URLs in their claims and evidence." })
            ]
          }
        )
      ]
    }
  );
}
const TrustedSourcesPage$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  SourceLogo,
  TrustedSourcesPage,
  getSourceTypeBadgeClasses,
  getSourceTypeBonus,
  getSourceTypeCeiling,
  getSourceTypeLabel
}, Symbol.toStringTag, { value: "Module" }));
export {
  ExternalLink as E,
  SourceLogo as S,
  TrustedSourcesPage$1 as T,
  getSourceTypeBonus as a,
  getSourceTypeBadgeClasses as b,
  computeSourceCredibility as c,
  computeFlatSourceBoost as d,
  getSourceTypeCeiling as e,
  getSourceTypeLabel as g
};
