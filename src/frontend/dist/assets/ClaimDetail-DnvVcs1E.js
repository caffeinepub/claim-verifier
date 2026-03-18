import { c as createLucideIcon, j as jsxRuntimeExports, a as cn, u as useEvidenceVoteTally, b as useSessionVoteForEvidence, d as useVoteEvidence, r as reactExports, C as ChevronUp, e as ChevronDown, f as useSessionGate, g as ue, h as reactDomExports, A as AnimatePresence, m as motion, X, i as ChartNoAxesColumn, S as Swords, T as TrendingDown, k as TrendingUp, l as CircleX, n as CircleCheck, o as useUsername, p as useVerifiedAccount, q as useReportReply, s as useReplies, t as useReplyLikeCounts, L as LoaderCircle, v as useAddReply, w as useAddReputationEvent, x as Textarea, y as Clock, B as Button, z as useProfileByUsername, D as useLikeReply, E as useAccountPermissions, F as useSessionLikeForReply, U as UserProfileCard, G as isVerifiedUsername, H as UserAvatar, I as isTrustedContributorSession, V as VerifiedBadge, J as formatRelativeTime, K as DropdownMenu, M as DropdownMenuTrigger, N as Ellipsis, O as DropdownMenuContent, P as DropdownMenuItem, Q as Share2, R as Flag, W as ReportDialog, Y as getActivePrincipalId, Z as appendUserComment, _ as useTrustedSources, $ as useClaimById, a0 as useEnhancedVoteTally, a1 as useSessionVote, a2 as useEvidenceForClaim, a3 as useAllEvidenceTallies, a4 as useSubmitVote, a5 as useSubmitEvidence, a6 as useReportContent, a7 as useActor, a8 as Skeleton, a9 as CategoryBadge, aa as TooltipProvider, ab as Tooltip, ac as TooltipTrigger, ad as Flame, ae as TooltipContent, af as getVerifiedVoteForClaim, ag as computeOverallVerdict, ah as VerdictBar, ai as ImageUploader, aj as UrlInputList, ak as Search, al as Input, am as DropdownMenuLabel, an as Check, ao as DropdownMenuSeparator, ap as AuthorDisplay, aq as getClaimSlug, ar as Link2, as as getOrInitUsername, at as appendUserEvidence, au as getEdit, av as isWithinEditWindow, aw as saveEdit } from "./index-BtF6ZgDC.js";
import { g as getSourceTypeLabel, a as getSourceTypeBonus, b as getSourceTypeBadgeClasses, c as computeSourceCredibility, d as computeFlatSourceBoost, E as ExternalLink } from "./TrustedSourcesPage-BALp_Pv9.js";
import { C as ChevronLeft, a as ChevronRight } from "./chevron-right-zWO-p0x8.js";
import { M as MessageSquare, S as ShieldCheck } from "./shield-check-DjB0n8bz.js";
import { S as Send, C as CornerDownRight } from "./send-l9xq099d.js";
import { A as ArrowLeft } from "./arrow-left-DbXucSST.js";
import { P as Pencil } from "./pencil-D1jRdvwP.js";
import "./shield-D7XO-uxT.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
];
const CircleAlert = createLucideIcon("circle-alert", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3", key: "1u773s" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
];
const CircleHelp = createLucideIcon("circle-help", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
];
const RefreshCw = createLucideIcon("refresh-cw", __iconNode);
function normalizeType(raw) {
  if (raw === "True") return "True";
  if (raw === "False") return "False";
  return "Unverified";
}
function EvidenceTypeBadge({
  evidenceType,
  className,
  ...props
}) {
  const type = normalizeType(evidenceType ?? "");
  const styles = {
    True: "bg-green-500/15 text-green-500 border-green-500/30",
    False: "bg-red-500/15 text-red-500 border-red-500/30",
    Unverified: "bg-muted/60 text-muted-foreground border-border"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-body font-medium border",
        styles[type],
        className
      ),
      ...props,
      children: type
    }
  );
}
function EvidenceVoteButtons({
  evidenceId,
  sessionId,
  index,
  claimId
}) {
  const { data: tally } = useEvidenceVoteTally(evidenceId);
  const { data: sessionVote } = useSessionVoteForEvidence(
    evidenceId,
    sessionId
  );
  const voteEvidence = useVoteEvidence();
  const { checkVoteAction } = useSessionGate();
  const [optimisticVote, setOptimisticVote] = reactExports.useState(void 0);
  const [optimisticScore, setOptimisticScore] = reactExports.useState(
    void 0
  );
  const [justVotedUp, setJustVotedUp] = reactExports.useState(false);
  const [justVotedDown, setJustVotedDown] = reactExports.useState(false);
  const currentVote = optimisticVote !== void 0 ? optimisticVote : sessionVote ?? null;
  const serverScore = tally ? Number(tally.netScore) : 0;
  const displayScore = optimisticScore !== void 0 ? optimisticScore : serverScore;
  reactExports.useEffect(() => {
    if (justVotedUp) {
      const t = setTimeout(() => setJustVotedUp(false), 350);
      return () => clearTimeout(t);
    }
  }, [justVotedUp]);
  reactExports.useEffect(() => {
    if (justVotedDown) {
      const t = setTimeout(() => setJustVotedDown(false), 350);
      return () => clearTimeout(t);
    }
  }, [justVotedDown]);
  async function handleVote(direction) {
    if (voteEvidence.isPending) return;
    if (!checkVoteAction()) return;
    if (direction === "up") setJustVotedUp(true);
    else setJustVotedDown(true);
    const prevVote = currentVote;
    const prevScore = displayScore;
    let nextVote;
    let scoreDelta = 0;
    if (prevVote === direction) {
      nextVote = null;
      scoreDelta = direction === "up" ? -1 : 1;
    } else {
      nextVote = direction;
      if (prevVote === null || prevVote === void 0) {
        scoreDelta = direction === "up" ? 1 : -1;
      } else {
        scoreDelta = direction === "up" ? 2 : -2;
      }
    }
    setOptimisticVote(nextVote);
    setOptimisticScore(prevScore + scoreDelta);
    try {
      await voteEvidence.mutateAsync({
        evidenceId,
        sessionId,
        direction,
        claimId
      });
      setOptimisticVote(void 0);
      setOptimisticScore(void 0);
    } catch {
      setOptimisticVote(prevVote ?? void 0);
      setOptimisticScore(prevScore);
      ue.error("Failed to record vote");
    }
  }
  const isVoting = voteEvidence.isPending;
  const scoreColor = displayScore > 0 ? "text-amber-400" : displayScore < 0 ? "text-blue-400" : "text-muted-foreground";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex items-center gap-1 select-none",
      "aria-label": "Vote on this evidence",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "data-ocid": `evidence.upvote_button.${index}`,
            onClick: () => handleVote("up"),
            disabled: isVoting,
            "aria-label": "Upvote evidence",
            "aria-pressed": currentVote === "up",
            className: cn(
              "flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
              "disabled:cursor-not-allowed disabled:opacity-60",
              justVotedUp && "vote-bounce",
              currentVote === "up" ? "text-amber-400 bg-amber-400/15 hover:bg-amber-400/25 shadow-sm" : "text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10"
            ),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              ChevronUp,
              {
                className: cn(
                  "h-5 w-5 transition-transform duration-150",
                  currentVote === "up" && "scale-110"
                ),
                strokeWidth: currentVote === "up" ? 2.5 : 2
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            "data-ocid": `evidence.score.${index}`,
            className: cn(
              "text-sm font-mono font-bold tabular-nums min-w-[2rem] text-center transition-colors duration-150",
              scoreColor
            ),
            children: displayScore
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "data-ocid": `evidence.downvote_button.${index}`,
            onClick: () => handleVote("down"),
            disabled: isVoting,
            "aria-label": "Downvote evidence",
            "aria-pressed": currentVote === "down",
            className: cn(
              "flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
              "disabled:cursor-not-allowed disabled:opacity-60",
              justVotedDown && "vote-bounce",
              currentVote === "down" ? "text-blue-400 bg-blue-400/15 hover:bg-blue-400/25 shadow-sm" : "text-muted-foreground hover:text-blue-400 hover:bg-blue-400/10"
            ),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              ChevronDown,
              {
                className: cn(
                  "h-5 w-5 transition-transform duration-150",
                  currentVote === "down" && "scale-110"
                ),
                strokeWidth: currentVote === "down" ? 2.5 : 2
              }
            )
          }
        )
      ]
    }
  );
}
function Lightbox({
  imageUrls,
  initialIndex = 0,
  isOpen,
  onClose
}) {
  const [currentIndex, setCurrentIndex] = reactExports.useState(initialIndex);
  reactExports.useEffect(() => {
    if (isOpen) setCurrentIndex(initialIndex);
  }, [isOpen, initialIndex]);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < imageUrls.length - 1;
  const prev = reactExports.useCallback(() => {
    if (hasPrev) setCurrentIndex((i) => i - 1);
  }, [hasPrev]);
  const next = reactExports.useCallback(() => {
    if (hasNext) setCurrentIndex((i) => i + 1);
  }, [hasNext]);
  reactExports.useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, prev, next]);
  reactExports.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  const portal = reactDomExports.createPortal(
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        "data-ocid": "lightbox.dialog",
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
        className: "fixed inset-0 z-[9999] flex items-center justify-center",
        onClick: onClose,
        "aria-modal": "true",
        "aria-label": "Image lightbox",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/90 backdrop-blur-sm" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              "data-ocid": "lightbox.close_button",
              onClick: (e) => {
                e.stopPropagation();
                onClose();
              },
              className: cn(
                "absolute top-4 right-4 z-10 p-2 rounded-full",
                "bg-white/10 hover:bg-white/20 text-white transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              ),
              "aria-label": "Close lightbox",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" })
            }
          ),
          imageUrls.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-white/10 text-white text-sm font-body", children: [
            currentIndex + 1,
            " / ",
            imageUrls.length
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0, scale: 0.96 },
              animate: { opacity: 1, scale: 1 },
              exit: { opacity: 0, scale: 0.96 },
              transition: { duration: 0.18 },
              className: "relative z-10 max-w-[90vw] max-h-[85vh] flex items-center justify-center",
              onClick: (e) => e.stopPropagation(),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: imageUrls[currentIndex],
                  alt: `Attachment ${currentIndex + 1}`,
                  className: "max-w-full max-h-[85vh] object-contain rounded-sm shadow-2xl",
                  draggable: false
                }
              )
            },
            currentIndex
          ),
          hasPrev && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              "data-ocid": "lightbox.pagination_prev",
              onClick: (e) => {
                e.stopPropagation();
                prev();
              },
              className: cn(
                "absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full",
                "bg-white/10 hover:bg-white/20 text-white transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              ),
              "aria-label": "Previous image",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-6 w-6" })
            }
          ),
          hasNext && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              "data-ocid": "lightbox.pagination_next",
              onClick: (e) => {
                e.stopPropagation();
                next();
              },
              className: cn(
                "absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full",
                "bg-white/10 hover:bg-white/20 text-white transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              ),
              "aria-label": "Next image",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-6 w-6" })
            }
          )
        ]
      }
    ) }),
    document.body
  );
  return portal;
}
const config = {
  REBUNKED: {
    label: "REBUNKED",
    icon: CircleCheck,
    bannerClass: "bg-emerald-50 border-emerald-200",
    iconClass: "text-emerald-500",
    labelClass: "text-emerald-700"
  },
  DEBUNKED: {
    label: "DEBUNKED",
    icon: CircleX,
    bannerClass: "bg-red-50 border-red-200",
    iconClass: "text-red-400",
    labelClass: "text-red-700"
  },
  "Leaning TRUE": {
    label: "LEANING TRUE",
    icon: TrendingUp,
    bannerClass: "bg-emerald-50/60 border-emerald-200",
    iconClass: "text-emerald-400",
    labelClass: "text-emerald-600"
  },
  "Leaning FALSE": {
    label: "LEANING FALSE",
    icon: TrendingDown,
    bannerClass: "bg-red-50/60 border-red-200",
    iconClass: "text-red-400",
    labelClass: "text-red-600"
  },
  Contested: {
    label: "CONTESTED",
    icon: Swords,
    bannerClass: "bg-slate-50 border-slate-200",
    iconClass: "text-slate-500",
    labelClass: "text-slate-800"
  },
  "Insufficient Data": {
    label: "INSUFFICIENT DATA",
    icon: ChartNoAxesColumn,
    bannerClass: "bg-muted border-border",
    iconClass: "text-muted-foreground",
    labelClass: "text-muted-foreground"
  }
};
function OverallVerdictBanner({
  verdict,
  className
}) {
  const {
    label,
    icon: Icon,
    bannerClass,
    iconClass,
    labelClass
  } = config[verdict];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "w-full rounded-xl border-2 px-6 py-5 flex items-center gap-4",
        bannerClass,
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: cn("w-10 h-10 flex-shrink-0", iconClass) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5 font-body", children: "Community Verdict" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              className: cn(
                "text-3xl font-display font-black tracking-tight",
                labelClass
              ),
              children: label
            }
          )
        ] })
      ]
    }
  );
}
function ReplyForm({
  evidenceId,
  parentReplyId,
  sessionId,
  authorUsername,
  onCancel,
  onSuccess,
  autoFocus = false,
  ocidPrefix
}) {
  const [text, setText] = reactExports.useState("");
  const [cooldownLeft, setCooldownLeft] = reactExports.useState(0);
  const addReply = useAddReply();
  const { checkAction } = useSessionGate();
  const addRepEvent = useAddReputationEvent();
  const { principal: verifiedPrincipal } = useVerifiedAccount();
  reactExports.useEffect(() => {
    if (cooldownLeft <= 0) return;
    const timer = setInterval(() => {
      setCooldownLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1e3);
    return () => clearInterval(timer);
  }, [cooldownLeft]);
  function formatCountdown(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() || cooldownLeft > 0) return;
    if (!checkAction()) return;
    try {
      await addReply.mutateAsync({
        evidenceId,
        parentReplyId,
        text: text.trim(),
        authorUsername,
        sessionId
      });
      setText("");
      const pid = getActivePrincipalId();
      if (pid) {
        const ts = (/* @__PURE__ */ new Date()).toISOString();
        appendUserComment(pid, {
          replyId: String(Date.now()),
          claimId: String(evidenceId),
          claimTitle: "",
          text: text.trim(),
          timestamp: ts
        });
      }
      if (verifiedPrincipal) {
        addRepEvent.mutate({
          principal: verifiedPrincipal,
          action: "reply_posted",
          points: 1n
        });
      }
      onSuccess == null ? void 0 : onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.startsWith("cooldown:")) {
        const secs = Number.parseInt(msg.split(":")[1], 10);
        setCooldownLeft(Number.isFinite(secs) ? secs : 120);
      } else if (msg.startsWith("duplicate:")) {
        const detail = msg.replace(/^duplicate:/, "").trim();
        ue.error(detail || "Similar reply already exists.");
      } else {
        ue.error("Failed to post reply");
      }
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "mt-2 space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Textarea,
      {
        "data-ocid": `${ocidPrefix}.textarea`,
        placeholder: "Write a reply…",
        value: text,
        onChange: (e) => setText(e.target.value),
        rows: 2,
        maxLength: 500,
        autoFocus,
        className: "bg-card border-border font-body resize-none text-sm min-h-[4rem]"
      }
    ),
    cooldownLeft > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-amber-400 font-body bg-amber-400/10 border border-amber-400/20 rounded-sm px-2 py-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3 flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Reply again in",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-bold", children: formatCountdown(cooldownLeft) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground font-body", children: [
        text.length,
        "/500"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        onCancel && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "ghost",
            size: "sm",
            "data-ocid": `${ocidPrefix}.cancel_button`,
            onClick: onCancel,
            className: "h-7 px-2.5 font-body text-xs text-muted-foreground",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "submit",
            size: "sm",
            "data-ocid": `${ocidPrefix}.submit_button`,
            disabled: addReply.isPending || cooldownLeft > 0 || !text.trim(),
            className: "h-7 px-2.5 font-body text-xs bg-primary text-primary-foreground gap-1",
            children: [
              addReply.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : cooldownLeft > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-3 w-3" }),
              cooldownLeft > 0 ? "On Cooldown" : "Reply"
            ]
          }
        )
      ] })
    ] })
  ] });
}
function ReplyCard({
  reply,
  sessionId,
  username,
  verifiedUsername,
  avatarUrl,
  index,
  depth,
  reportedIds,
  onReport,
  evidenceId,
  replyingToId,
  onToggleReply,
  children,
  evidenceIndex,
  likeCounts
}) {
  const isOwnReply = reply.sessionId === sessionId;
  const displayAuthor = isOwnReply ? verifiedUsername ?? username : reply.authorUsername;
  const { data: authorProfile } = useProfileByUsername(
    isOwnReply ? null : reply.authorUsername
  );
  const displayAvatarUrl = isOwnReply ? avatarUrl : (authorProfile == null ? void 0 : authorProfile.avatarUrl) || void 0;
  const isReplying = replyingToId === reply.id;
  const [reportDialogOpen, setReportDialogOpen] = reactExports.useState(false);
  const likeReply = useLikeReply();
  const { checkAction: checkReplyAction } = useSessionGate();
  useAccountPermissions();
  const { data: isLiked = false } = useSessionLikeForReply(reply.id, sessionId);
  const likeCount = likeCounts[reply.id.toString()] ?? 0;
  async function handleLike() {
    try {
      if (!checkReplyAction()) return;
      await likeReply.mutateAsync({ replyId: reply.id, sessionId, evidenceId });
    } catch {
      ue.error("Failed to upvote reply");
    }
  }
  function handleShare() {
    const base = window.location.href.split("#")[0];
    navigator.clipboard.writeText(`${base}#reply-${reply.id.toString()}`);
    ue.success("Link copied");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": `reply.item.${evidenceIndex}`,
      className: cn(
        "relative",
        depth > 0 && cn(
          "pl-3 border-l border-border/50",
          depth <= 3 ? "ml-3 sm:ml-4" : "ml-0 sm:ml-4"
        )
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              UserProfileCard,
              {
                username: displayAuthor,
                isVerified: isOwnReply ? !!verifiedUsername : isVerifiedUsername(),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    UserAvatar,
                    {
                      username: displayAuthor,
                      size: "sm",
                      avatarUrl: displayAvatarUrl,
                      isVerified: isOwnReply ? !!verifiedUsername : !!(authorProfile == null ? void 0 : authorProfile.username)
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-foreground font-body flex items-center gap-1", children: [
                    displayAuthor,
                    isTrustedContributorSession(reply.sessionId) && /* @__PURE__ */ jsxRuntimeExports.jsx(VerifiedBadge, {})
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-body", children: "·" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-body", children: formatRelativeTime(reply.timestamp) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground font-body leading-relaxed mb-2", children: reply.text }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
            depth < 4 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                "data-ocid": `reply.button.${index}`,
                onClick: () => onToggleReply(isReplying ? null : reply.id),
                className: cn(
                  "flex items-center gap-1 text-xs font-body rounded px-1.5 py-0.5 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60",
                  isReplying ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CornerDownRight, { className: "h-3 w-3" }),
                  "Reply"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                "data-ocid": `reply.toggle.${index}`,
                onClick: handleLike,
                disabled: likeReply.isPending,
                className: cn(
                  "flex items-center gap-1 text-xs font-body rounded px-1.5 py-0.5 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  isLiked ? "text-primary" : "text-muted-foreground hover:text-primary"
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: cn("h-3 w-3", isLiked && "fill-primary") }),
                  likeCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: likeCount })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  "data-ocid": `reply.dropdown_menu.${index}`,
                  "aria-label": "More options",
                  className: "flex items-center justify-center w-6 h-6 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "h-3.5 w-3.5" })
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", className: "w-40", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  DropdownMenuItem,
                  {
                    "data-ocid": `reply.secondary_button.${index}`,
                    className: "text-muted-foreground cursor-pointer gap-2",
                    onClick: handleShare,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-3.5 w-3.5 text-muted-foreground" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Share" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  DropdownMenuItem,
                  {
                    "data-ocid": `reply.delete_button.${index}`,
                    className: "text-muted-foreground cursor-pointer gap-2",
                    disabled: reportedIds.has(reply.id.toString()),
                    onClick: () => {
                      if (checkReplyAction()) setReportDialogOpen(true);
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "h-3.5 w-3.5 text-muted-foreground" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: reportedIds.has(reply.id.toString()) ? "Reported" : "Report" })
                    ]
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ReportDialog,
            {
              isOpen: reportDialogOpen,
              onClose: () => setReportDialogOpen(false),
              onConfirm: async (_reason) => {
                await onReport(reply.id);
              },
              title: "Report Reply"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isReplying && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, height: 0 },
              animate: { opacity: 1, height: "auto" },
              exit: { opacity: 0, height: 0 },
              transition: { duration: 0.18 },
              className: "overflow-hidden",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-2 mb-1 px-1 py-0.5 rounded bg-primary/8 border border-primary/20", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-body text-primary", children: [
                    "Replying to",
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono font-semibold", children: [
                      "@",
                      displayAuthor
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => onToggleReply(null),
                      "aria-label": "Cancel reply",
                      className: "w-4 h-4 flex items-center justify-center rounded text-primary/60 hover:text-primary hover:bg-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ReplyForm,
                  {
                    evidenceId,
                    parentReplyId: reply.id,
                    sessionId,
                    authorUsername: verifiedUsername ?? username,
                    onCancel: () => onToggleReply(null),
                    onSuccess: () => onToggleReply(null),
                    autoFocus: true,
                    ocidPrefix: `reply.nested.${index}`
                  }
                )
              ]
            }
          ) })
        ] }),
        children
      ]
    }
  );
}
function ReplyThread({
  evidenceId,
  sessionId,
  evidenceIndex
}) {
  const [expanded, setExpanded] = reactExports.useState(false);
  const [replyingToId, setReplyingToId] = reactExports.useState(null);
  const [reportedIds, setReportedIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const username = useUsername();
  const { username: verifiedUsername, avatarUrl } = useVerifiedAccount();
  const reportReply = useReportReply();
  const { checkAction: checkThreadAction } = useSessionGate();
  const { data: replies = [], isLoading } = useReplies(
    expanded ? evidenceId : null
  );
  const { data: allReplies = [] } = useReplies(evidenceId);
  const replyCount = allReplies.length;
  const { data: likeCounts = {} } = useReplyLikeCounts(
    expanded ? evidenceId : null
  );
  async function handleReport(replyId) {
    const key = replyId.toString();
    if (!checkThreadAction()) return;
    if (reportedIds.has(key)) return;
    try {
      await reportReply.mutateAsync({ replyId, sessionId });
      setReportedIds((prev) => /* @__PURE__ */ new Set([...prev, key]));
      ue.success("Reported");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("Already reported") || msg.includes("already")) {
        ue.info("Already reported");
      } else {
        ue.error("Failed to report");
      }
    }
  }
  function handleToggleReply(id) {
    setReplyingToId(id);
  }
  const childrenByParent = /* @__PURE__ */ new Map();
  for (const r of replies) {
    if (r.parentReplyId === 0n) continue;
    const key = r.parentReplyId.toString();
    if (!childrenByParent.has(key)) childrenByParent.set(key, []);
    childrenByParent.get(key).push(r);
  }
  for (const [key, children] of childrenByParent.entries()) {
    childrenByParent.set(
      key,
      [...children].sort(
        (a, b) => (likeCounts[b.id.toString()] ?? 0) - (likeCounts[a.id.toString()] ?? 0)
      )
    );
  }
  const topLevelReplies = replies.filter((r) => r.parentReplyId === 0n);
  const sortedTopLevel = [...topLevelReplies].sort(
    (a, b) => (likeCounts[b.id.toString()] ?? 0) - (likeCounts[a.id.toString()] ?? 0)
  );
  let globalIndex = 0;
  function nextIndex() {
    globalIndex += 1;
    return globalIndex;
  }
  function renderReply(reply, depth) {
    const idx = nextIndex();
    const nested = childrenByParent.get(reply.id.toString()) ?? [];
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      ReplyCard,
      {
        reply,
        sessionId,
        username,
        verifiedUsername: verifiedUsername ?? void 0,
        avatarUrl: avatarUrl ?? void 0,
        index: idx,
        depth,
        reportedIds,
        onReport: handleReport,
        evidenceId,
        replyingToId,
        onToggleReply: handleToggleReply,
        evidenceIndex,
        likeCounts,
        children: nested.length > 0 && depth < 4 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-0", children: nested.map((child) => renderReply(child, depth + 1)) })
      },
      reply.id.toString()
    );
  }
  const toggleLabel = replyCount === 0 ? "Reply" : `${replyCount} ${replyCount === 1 ? "reply" : "replies"}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-ocid": `evidence.reply_thread.${evidenceIndex}`, className: "mt-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        "data-ocid": `evidence.reply_toggle.${evidenceIndex}`,
        onClick: () => setExpanded((prev) => !prev),
        className: cn(
          "flex items-center gap-1.5 text-xs font-body rounded px-1.5 py-1 transition-colors",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60",
          expanded ? "text-primary" : "text-muted-foreground hover:text-foreground"
        ),
        "aria-expanded": expanded,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-3.5 w-3.5" }),
          toggleLabel,
          replyCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            ChevronDown,
            {
              className: cn(
                "h-3 w-3 transition-transform duration-200",
                expanded && "rotate-180"
              )
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: expanded && /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, height: 0 },
        animate: { opacity: 1, height: "auto" },
        exit: { opacity: 0, height: 0 },
        transition: { duration: 0.2 },
        className: "overflow-hidden",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 space-y-0", children: [
          isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              "data-ocid": `reply.loading_state.${evidenceIndex}`,
              className: "py-3 text-xs text-muted-foreground font-body flex items-center gap-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }),
                "Loading replies…"
              ]
            }
          ) : replies.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-0", children: sortedTopLevel.map((reply) => renderReply(reply, 0)) }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: replyingToId === null && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0, height: 0 },
              animate: { opacity: 1, height: "auto" },
              exit: { opacity: 0, height: 0 },
              transition: { duration: 0.18 },
              className: "mt-2 overflow-hidden",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                ReplyForm,
                {
                  evidenceId,
                  parentReplyId: 0n,
                  sessionId,
                  authorUsername: verifiedUsername ?? username,
                  ocidPrefix: `reply.toplevel.${evidenceIndex}`
                }
              )
            },
            "toplevel-form"
          ) })
        ] })
      }
    ) })
  ] });
}
function extractDomain(url) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0].toLowerCase();
  }
}
function TrustedSourceBadgeList({ urls }) {
  const { data: trustedSources } = useTrustedSources();
  if (!trustedSources || trustedSources.length === 0 || urls.length === 0) {
    return null;
  }
  const trustedOnly = trustedSources.filter((s) => s.isTrusted);
  if (trustedOnly.length === 0) return null;
  const trustedMap = /* @__PURE__ */ new Map();
  for (const s of trustedOnly) {
    trustedMap.set(s.domain.toLowerCase(), s);
  }
  const matches = [];
  for (const url of urls) {
    const domain = extractDomain(url);
    const found = trustedMap.get(domain);
    if (found && !matches.find((m) => m.domain === found.domain)) {
      matches.push(found);
    }
  }
  if (matches.length === 0) return null;
  function handleBadgeClick(e, domain) {
    e.preventDefault();
    e.stopPropagation();
    window.history.pushState({}, "", `/source/${encodeURIComponent(domain)}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5 mt-2", children: matches.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      "data-ocid": "source.link",
      onClick: (e) => handleBadgeClick(e, s.domain),
      className: cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-body font-medium border cursor-pointer hover:opacity-80 transition-opacity",
        getSourceTypeBadgeClasses(s.sourceType)
      ),
      title: `${getSourceTypeLabel(s.sourceType)} — ${getSourceTypeBonus(s.sourceType)} credibility bonus. Click to view details.`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-2.5 w-2.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: s.domain }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-70", children: getSourceTypeBonus(s.sourceType) })
      ]
    },
    s.domain
  )) });
}
function sortEvidence(items, sort, tallies) {
  const arr = [...items];
  switch (sort) {
    case "most_upvotes":
      return arr.sort(
        (a, b) => (tallies[b.id.toString()] ?? 0) - (tallies[a.id.toString()] ?? 0)
      );
    case "most_downvotes":
      return arr.sort(
        (a, b) => (tallies[a.id.toString()] ?? 0) - (tallies[b.id.toString()] ?? 0)
      );
    case "newest":
      return arr.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
    case "oldest":
      return arr.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
  }
}
function UrlChips({ urls }) {
  const valid = urls.filter((u) => u.trim());
  if (!valid.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mt-3", children: valid.map((url, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "a",
    {
      href: url,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-secondary border border-border text-xs font-body text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors max-w-[200px]",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "h-3 w-3 flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: url.replace(/^https?:\/\//, "") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-2.5 w-2.5 flex-shrink-0 opacity-60" })
      ]
    },
    i
  )) });
}
function ImageGrid({
  imageUrls,
  size = "md"
}) {
  const [lightboxOpen, setLightboxOpen] = reactExports.useState(false);
  const [lightboxIndex, setLightboxIndex] = reactExports.useState(0);
  if (!imageUrls.length) return null;
  const heightClass = size === "sm" ? "h-24" : "h-32";
  function openLightbox(index) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mt-3", children: imageUrls.map((url, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        "data-ocid": "image.open_modal_button",
        onClick: () => openLightbox(i),
        className: cn(
          "block rounded-sm overflow-hidden border border-border hover:border-primary/40 transition-colors flex-shrink-0 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
          heightClass
        ),
        "aria-label": `View attachment ${i + 1} fullscreen`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: url,
            alt: `Attachment ${i + 1}`,
            className: cn("object-cover h-full w-auto max-w-[160px]"),
            loading: "lazy",
            draggable: false
          }
        )
      },
      i
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Lightbox,
      {
        imageUrls,
        initialIndex: lightboxIndex,
        isOpen: lightboxOpen,
        onClose: () => setLightboxOpen(false)
      }
    )
  ] });
}
function EvidenceTextDisplay({
  item,
  sessionId,
  canEdit
}) {
  const editKey = `evidence_${item.id.toString()}`;
  const stored = getEdit(editKey);
  const [isEditing, setIsEditing] = reactExports.useState(false);
  const [editText, setEditText] = reactExports.useState((stored == null ? void 0 : stored.text) ?? item.text);
  const [displayText, setDisplayText] = reactExports.useState((stored == null ? void 0 : stored.text) ?? item.text);
  const [isEdited, setIsEdited] = reactExports.useState(!!stored);
  const isOwn = item.sessionId === sessionId;
  const withinWindow = isWithinEditWindow(item.timestamp);
  const showEdit = canEdit && isOwn && withinWindow;
  function handleSave() {
    if (!editText.trim()) return;
    saveEdit(editKey, editText.trim());
    setDisplayText(editText.trim());
    setIsEdited(true);
    setIsEditing(false);
  }
  if (isEditing) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          value: editText,
          onChange: (e) => setEditText(e.target.value),
          rows: 3,
          maxLength: 1e3,
          className: "bg-card border-border font-body resize-none text-sm",
          autoFocus: true
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            size: "sm",
            onClick: handleSave,
            className: "h-6 px-2 text-xs font-body gap-1",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3" }),
              "Save"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "ghost",
            size: "sm",
            onClick: () => {
              setEditText(displayText);
              setIsEditing(false);
            },
            className: "h-6 px-2 text-xs font-body text-muted-foreground",
            children: "Cancel"
          }
        )
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 group/text", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground font-body leading-relaxed inline", children: displayText }),
    isEdited && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-xs text-muted-foreground italic font-body", children: "(edited)" }),
    showEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => setIsEditing(true),
        className: "ml-1.5 inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover/text:opacity-100 transition-opacity",
        "aria-label": "Edit evidence",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-2.5 w-2.5" })
      }
    )
  ] });
}
function ClaimDetailMeta({
  username,
  timestamp
}) {
  const trimmed = (username == null ? void 0 : username.trim()) ?? "";
  const { data: profile } = useProfileByUsername(trimmed || null);
  const timeNode = /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-body", children: formatRelativeTime(timestamp) });
  if (!trimmed) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5", children: timeNode });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
    timeNode,
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "·" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(UserProfileCard, { username: trimmed, isVerified: !!profile, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-body cursor-pointer hover:underline", children: trimmed }) })
  ] });
}
function ClaimDetail({
  claimId,
  sessionId,
  allClaims,
  onBack
}) {
  var _a, _b, _c;
  const [evidenceText, setEvidenceText] = reactExports.useState("");
  const [hotTooltipOpen, setHotTooltipOpen] = reactExports.useState(false);
  const [evidenceImageUrls, setEvidenceImageUrls] = reactExports.useState([]);
  const [isEvidenceImageUploading, setIsEvidenceImageUploading] = reactExports.useState(false);
  const [evidenceUploaderKey, setEvidenceUploaderKey] = reactExports.useState(0);
  const [evidenceUrls, setEvidenceUrls] = reactExports.useState([]);
  const [sortOption, setSortOption] = reactExports.useState("most_upvotes");
  const [evidenceSearch, setEvidenceSearch] = reactExports.useState("");
  const [evidenceCooldownLeft, setEvidenceCooldownLeft] = reactExports.useState(0);
  const [evidenceType, setEvidenceType] = reactExports.useState("Unverified");
  const [evidenceTypeFilter, setEvidenceTypeFilter] = reactExports.useState("all");
  const [reportedEvidence, setReportedEvidence] = reactExports.useState(
    /* @__PURE__ */ new Set()
  );
  const [reportDialogOpen, setReportDialogOpen] = reactExports.useState(false);
  const [reportingEvidenceId, setReportingEvidenceId] = reactExports.useState(
    null
  );
  const { data: claim, isLoading: claimLoading } = useClaimById(claimId);
  const {
    data: tally,
    isLoading: tallyLoading,
    isError: tallyError,
    refetch: refetchTally
  } = useEnhancedVoteTally(claimId);
  const { data: sessionVote } = useSessionVote(claimId, sessionId);
  const { data: evidence, isLoading: evidenceLoading } = useEvidenceForClaim(claimId);
  const claimTotalVotes = tally ? Math.max(0, Number(tally.trueCount)) + Math.max(0, Number(tally.falseCount)) + Math.max(0, Number(tally.unverifiedCount)) : 0;
  const {
    isVerified,
    recordVerifiedVote,
    username: verifiedUsername,
    principal: verifiedPrincipal
  } = useVerifiedAccount();
  const { canReport } = useAccountPermissions();
  const evidenceIds = reactExports.useMemo(
    () => (evidence ?? []).map((e) => e.id),
    [evidence]
  );
  const { data: tallies = {} } = useAllEvidenceTallies(evidenceIds);
  const sortedEvidence = reactExports.useMemo(
    () => evidence ? sortEvidence(evidence, sortOption, tallies) : [],
    [evidence, sortOption, tallies]
  );
  const typeFilteredEvidence = reactExports.useMemo(() => {
    if (evidenceTypeFilter === "all") return sortedEvidence;
    return sortedEvidence.filter((item) => {
      const type = item.evidenceType && item.evidenceType !== "" ? item.evidenceType : "Unverified";
      return type === evidenceTypeFilter;
    });
  }, [sortedEvidence, evidenceTypeFilter]);
  const filteredEvidence = reactExports.useMemo(() => {
    if (!evidenceSearch.trim()) return typeFilteredEvidence;
    const q = evidenceSearch.toLowerCase();
    return typeFilteredEvidence.filter(
      (item) => item.text.toLowerCase().includes(q) || (item.urls ?? []).some((url) => url.toLowerCase().includes(q))
    );
  }, [typeFilteredEvidence, evidenceSearch]);
  const allEvidenceWithScores = reactExports.useMemo(() => {
    return (evidence ?? []).map((e) => ({
      urls: e.urls ?? [],
      netScore: tallies[e.id.toString()] ?? 0
    }));
  }, [evidence, tallies]);
  const uniqueDomains = reactExports.useMemo(() => {
    const domains = /* @__PURE__ */ new Set();
    for (const e of allEvidenceWithScores) {
      for (const url of e.urls ?? []) {
        try {
          const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
          if (hostname) domains.add(hostname);
        } catch {
        }
      }
    }
    return Array.from(domains);
  }, [allEvidenceWithScores]);
  const bestSourceBoost = reactExports.useMemo(() => {
    if (uniqueDomains.length === 0) return 0;
    const boosts = uniqueDomains.map((domain) => {
      const result = computeSourceCredibility(domain, allEvidenceWithScores);
      const score = result.status === "scored" ? result.score : null;
      return computeFlatSourceBoost(score);
    });
    return boosts.reduce((best, b) => b > best ? b : best, boosts[0] ?? 0);
  }, [uniqueDomains, allEvidenceWithScores]);
  const submitVote = useSubmitVote();
  const addRepEvent = useAddReputationEvent();
  const submitEvidence = useSubmitEvidence();
  const reportContent = useReportContent();
  const { actor } = useActor();
  const { checkAction, checkVoteAction } = useSessionGate();
  const hasVoted = !!sessionVote;
  reactExports.useEffect(() => {
    if (evidenceCooldownLeft <= 0) return;
    const timer = setInterval(() => {
      setEvidenceCooldownLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1e3);
    return () => clearInterval(timer);
  }, [evidenceCooldownLeft]);
  function formatCountdown(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
  async function handleShare() {
    if (!claim) return;
    const slug = getClaimSlug(claim, allClaims);
    const url = `${window.location.origin}/claim/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      ue.success("Link copied to clipboard");
    } catch {
      ue.error("Failed to copy link");
    }
  }
  async function handleVote(verdict) {
    if (!sessionId || hasVoted) return;
    if (!checkVoteAction()) return;
    try {
      await submitVote.mutateAsync({
        claimId,
        sessionId,
        verdict,
        authorUsername: verifiedUsername ?? getOrInitUsername(),
        claimTitle: (claim == null ? void 0 : claim.title) ?? ""
      });
      ue.success(`Your verdict: ${verdict}`);
      if (isVerified && claim) {
        recordVerifiedVote(claimId.toString(), sessionId, verdict, claim.title);
      }
      if (verifiedPrincipal) {
        addRepEvent.mutate({
          principal: verifiedPrincipal,
          action: "vote_cast",
          points: 1n
        });
      }
    } catch {
      ue.error("Failed to record vote");
    }
  }
  async function handleSubmitEvidence(e) {
    e.preventDefault();
    if (!evidenceText.trim() || !sessionId || evidenceCooldownLeft > 0) return;
    if (!checkAction()) return;
    try {
      await submitEvidence.mutateAsync({
        claimId,
        sessionId,
        authorUsername: verifiedUsername ?? getOrInitUsername(),
        text: evidenceText.trim(),
        imageUrls: evidenceImageUrls,
        urls: evidenceUrls.filter((u) => u.trim()),
        evidenceType
      });
      const evPid = getActivePrincipalId();
      if (evPid && claim) {
        const ts = (/* @__PURE__ */ new Date()).toISOString();
        appendUserEvidence(evPid, {
          evidenceId: String(Date.now()),
          claimId: String(claimId),
          claimTitle: claim.title,
          text: evidenceText.trim(),
          evidenceType,
          timestamp: ts
        });
      }
      if (verifiedPrincipal) {
        addRepEvent.mutate({
          principal: verifiedPrincipal,
          action: "evidence_submitted",
          points: 1n
        });
      }
      ue.success("Evidence submitted");
      const submittedUrls = evidenceUrls.filter((u) => u.trim());
      if (submittedUrls.length > 0 && sessionId) {
        const autoUsername = verifiedUsername ?? getOrInitUsername();
        const uniqueDomains2 = [
          ...new Set(
            submittedUrls.map((url) => {
              try {
                return new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
              } catch {
                return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0].toLowerCase();
              }
            }).filter(Boolean)
          )
        ];
        for (const d of uniqueDomains2) {
          actor == null ? void 0 : actor.suggestTrustedSource(d, "general", sessionId, autoUsername).catch(() => {
          });
        }
      }
      setEvidenceText("");
      setEvidenceImageUrls([]);
      setIsEvidenceImageUploading(false);
      setEvidenceUploaderKey((k) => k + 1);
      setEvidenceUrls([]);
      setEvidenceType("Unverified");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.startsWith("cooldown:")) {
        const secs = Number.parseInt(msg.split(":")[1], 10);
        setEvidenceCooldownLeft(Number.isFinite(secs) ? secs : 120);
      } else if (msg.startsWith("duplicate:")) {
        const detail = msg.replace(/^duplicate:/, "").trim();
        ue.error(detail || "Similar evidence already exists.");
      } else {
        ue.error("Failed to submit evidence");
      }
    }
  }
  async function handleReportClaim(_reason) {
    if (!checkAction()) return;
    await reportContent.mutateAsync({
      targetId: claimId,
      targetType: "claim",
      sessionId
    });
  }
  async function handleReportEvidenceConfirm(_reason) {
    if (!reportingEvidenceId) return;
    if (!checkAction()) return;
    const key = reportingEvidenceId.toString();
    await reportContent.mutateAsync({
      targetId: reportingEvidenceId,
      targetType: "evidence",
      sessionId
    });
    setReportedEvidence((prev) => /* @__PURE__ */ new Set([...prev, key]));
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      "data-ocid": "claim_detail.panel",
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      transition: { duration: 0.3 },
      className: "max-w-3xl mx-auto",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "ghost",
              onClick: onBack,
              "data-ocid": "nav.back_button",
              className: "-ml-2 font-body text-muted-foreground hover:text-foreground gap-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
                "Back to Claims"
              ]
            }
          ),
          claim && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: handleShare,
                "data-ocid": "claim_detail.share_button",
                className: "font-body gap-2 border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors",
                "aria-label": "Copy claim link to clipboard",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-3.5 w-3.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Share" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: () => setReportDialogOpen(true),
                "data-ocid": "claim_detail.report_button",
                className: "font-body gap-2 border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors",
                "aria-label": "Report this claim",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "h-3.5 w-3.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Report" })
                ]
              }
            )
          ] })
        ] }),
        claimLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-32" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-3/4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 w-full" })
        ] }) : claim ? /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryBadge, { category: claim.category }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ClaimDetailMeta,
                {
                  username: claim.authorUsername,
                  timestamp: claim.timestamp
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-3xl font-bold leading-tight text-foreground", children: [
              claim.title,
              claimTotalVotes >= 10 && /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Tooltip,
                {
                  open: hotTooltipOpen,
                  onOpenChange: setHotTooltipOpen,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Flame,
                      {
                        className: "inline w-6 h-6 text-orange-500 ml-2 align-middle relative -top-[3px] sm:-top-[3px] cursor-pointer",
                        "aria-label": "Hot claim",
                        onClick: (e) => {
                          e.stopPropagation();
                          setHotTooltipOpen((v) => !v);
                        }
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "High activity in the last 24 hours" }) })
                  ]
                }
              ) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-base text-muted-foreground leading-relaxed", children: claim.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ImageGrid, { imageUrls: claim.imageUrls ?? [], size: "md" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(UrlChips, { urls: claim.urls ?? [] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px masthead-rule" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold mb-4 text-foreground", children: "Community Verdict" }),
            tallyLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-14 w-full rounded-xl" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-full rounded-full" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-28" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-28" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-32" })
              ] })
            ] }) : tallyError ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                "data-ocid": "verdict.error_state",
                className: "flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-5 w-5 flex-shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold font-body", children: "Could not load verdict data" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-body opacity-80 mt-0.5", children: "The canister may be temporarily unavailable." })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      "data-ocid": "verdict.retry_button",
                      onClick: () => refetchTally(),
                      className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-body border border-destructive/40 hover:bg-destructive/20 transition-colors flex-shrink-0",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5" }),
                        "Retry"
                      ]
                    }
                  )
                ]
              }
            ) : tally ? (() => {
              const verifiedVoteRecord = getVerifiedVoteForClaim(
                claimId.toString()
              );
              const verifiedBonus = verifiedVoteRecord ? 0.5 : 0;
              const verifiedTrueBonus = (verifiedVoteRecord == null ? void 0 : verifiedVoteRecord.voteType) === "True" ? verifiedBonus : 0;
              const verifiedFalseBonus = (verifiedVoteRecord == null ? void 0 : verifiedVoteRecord.voteType) === "False" ? verifiedBonus : 0;
              const verifiedUnverifiedBonus = (verifiedVoteRecord == null ? void 0 : verifiedVoteRecord.voteType) === "Unverified" ? verifiedBonus : 0;
              const boostMultiplier = 1 + bestSourceBoost / 100;
              const detailVerdict = computeOverallVerdict(
                (Number(tally.trueCount) + verifiedTrueBonus) * boostMultiplier,
                (Number(tally.falseCount) + verifiedFalseBonus) * boostMultiplier,
                (Number(tally.unverifiedCount) + verifiedUnverifiedBonus) * boostMultiplier,
                true,
                Number(tally.trueDirect),
                Number(tally.falseDirect)
              );
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(OverallVerdictBanner, { verdict: detailVerdict }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  VerdictBar,
                  {
                    trueCount: tally.trueCount,
                    falseCount: tally.falseCount,
                    unverifiedCount: tally.unverifiedCount,
                    breakdown: {
                      trueDirect: tally.trueDirect,
                      trueFromEvidence: tally.trueFromEvidence,
                      falseDirect: tally.falseDirect,
                      falseFromEvidence: tally.falseFromEvidence,
                      unverifiedDirect: tally.unverifiedDirect,
                      unverifiedFromEvidence: tally.unverifiedFromEvidence
                    }
                  }
                )
              ] });
            })() : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold mb-3 text-foreground", children: "Cast Your Verdict" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-body mb-4", children: hasVoted ? `You've already voted: ${sessionVote}. Only one vote is allowed per claim.` : "Vote anonymously. Your session ID is used to track one vote per claim." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  "data-ocid": "claim_detail.true_button",
                  onClick: () => handleVote("True"),
                  disabled: submitVote.isPending || hasVoted,
                  variant: "outline",
                  className: cn(
                    "font-body gap-2 border-2 transition-all",
                    sessionVote === "True" ? "bg-verdict-true-subtle border-verdict-true verdict-true" : hasVoted ? "border-border opacity-40 cursor-not-allowed" : "border-border hover:border-verdict-true hover:bg-verdict-true-subtle hover:verdict-true"
                  ),
                  children: [
                    submitVote.isPending && ((_a = submitVote.variables) == null ? void 0 : _a.verdict) === "True" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }),
                    "True"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  "data-ocid": "claim_detail.false_button",
                  onClick: () => handleVote("False"),
                  disabled: submitVote.isPending || hasVoted,
                  variant: "outline",
                  className: cn(
                    "font-body gap-2 border-2 transition-all",
                    sessionVote === "False" ? "bg-verdict-false-subtle border-verdict-false verdict-false" : hasVoted ? "border-border opacity-40 cursor-not-allowed" : "border-border hover:border-verdict-false hover:bg-verdict-false-subtle hover:verdict-false"
                  ),
                  children: [
                    submitVote.isPending && ((_b = submitVote.variables) == null ? void 0 : _b.verdict) === "False" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4" }),
                    "False"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  "data-ocid": "claim_detail.unverified_button",
                  onClick: () => handleVote("Unverified"),
                  disabled: submitVote.isPending || hasVoted,
                  variant: "outline",
                  className: cn(
                    "font-body gap-2 border-2 transition-all",
                    sessionVote === "Unverified" ? "bg-verdict-unverified-subtle border-verdict-unverified verdict-unverified" : hasVoted ? "border-border opacity-40 cursor-not-allowed" : "border-border hover:border-verdict-unverified hover:bg-verdict-unverified-subtle hover:verdict-unverified"
                  ),
                  children: [
                    submitVote.isPending && ((_c = submitVote.variables) == null ? void 0 : _c.verdict) === "Unverified" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleHelp, { className: "h-4 w-4" }),
                    "Unverified"
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px masthead-rule" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-5 w-5 text-muted-foreground flex-shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold text-foreground", children: "Community Evidence" }),
              evidence && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground font-body", children: [
                "(",
                evidence.length,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmitEvidence, className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  "data-ocid": "evidence.textarea",
                  placeholder: "Share a source, counter-argument, or supporting evidence…",
                  value: evidenceText,
                  onChange: (e) => setEvidenceText(e.target.value),
                  rows: 3,
                  maxLength: 1e3,
                  className: "bg-secondary border-border font-body resize-none"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-body mb-1.5", children: "Attach images (optional)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    ImageUploader,
                    {
                      onUploaded: setEvidenceImageUrls,
                      onUploadingChange: setIsEvidenceImageUploading,
                      maxFiles: 5,
                      ocidPrefix: "evidence.image"
                    },
                    evidenceUploaderKey
                  ),
                  isEvidenceImageUploading && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground font-body flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }),
                    "Uploading images, please wait..."
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-body mb-1.5", children: "Attach links (optional)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  UrlInputList,
                  {
                    urls: evidenceUrls,
                    onChange: setEvidenceUrls,
                    ocidPrefix: "evidence.url",
                    placeholder: "https://example.com/source"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-ocid": "evidence.type_selector", className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-body", children: "This evidence suggests the claim is:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      "data-ocid": "evidence.type.true_button",
                      onClick: () => setEvidenceType("True"),
                      className: cn(
                        "flex-1 h-8 text-xs font-body font-medium rounded border transition-all duration-150",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500/60",
                        evidenceType === "True" ? "bg-green-500/20 text-green-500 border-green-500/50 ring-1 ring-green-500/30" : "bg-transparent text-muted-foreground border-border hover:border-green-500/40 hover:text-green-500 hover:bg-green-500/10"
                      ),
                      children: "True"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      "data-ocid": "evidence.type.false_button",
                      onClick: () => setEvidenceType("False"),
                      className: cn(
                        "flex-1 h-8 text-xs font-body font-medium rounded border transition-all duration-150",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500/60",
                        evidenceType === "False" ? "bg-red-500/20 text-red-500 border-red-500/50 ring-1 ring-red-500/30" : "bg-transparent text-muted-foreground border-border hover:border-red-500/40 hover:text-red-500 hover:bg-red-500/10"
                      ),
                      children: "False"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      "data-ocid": "evidence.type.unverified_button",
                      onClick: () => setEvidenceType("Unverified"),
                      className: cn(
                        "flex-1 h-8 text-xs font-body font-medium rounded border transition-all duration-150",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60",
                        evidenceType === "Unverified" ? "bg-muted/80 text-foreground border-border ring-1 ring-border" : "bg-transparent text-muted-foreground border-border hover:border-primary/40 hover:text-foreground hover:bg-muted/40"
                      ),
                      children: "Unverified"
                    }
                  )
                ] })
              ] }),
              evidenceCooldownLeft > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  "data-ocid": "evidence.loading_state",
                  className: "flex items-center gap-2 text-xs text-amber-400 font-body bg-amber-400/10 border border-amber-400/20 rounded-sm px-3 py-2",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5 flex-shrink-0" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      "You can add evidence again in",
                      " ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-bold", children: formatCountdown(evidenceCooldownLeft) })
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground font-body", children: [
                  evidenceText.length,
                  "/1000"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    type: "submit",
                    "data-ocid": "evidence.submit_button",
                    disabled: submitEvidence.isPending || evidenceCooldownLeft > 0 || isEvidenceImageUploading || !evidenceText.trim(),
                    size: "sm",
                    className: "font-body gap-2 bg-primary text-primary-foreground",
                    children: [
                      submitEvidence.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : evidenceCooldownLeft > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-3 w-3" }),
                      evidenceCooldownLeft > 0 ? "On Cooldown" : "Add Evidence"
                    ]
                  }
                )
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    "data-ocid": "evidence.search_input",
                    placeholder: "Search evidence by text or URL…",
                    value: evidenceSearch,
                    onChange: (e) => setEvidenceSearch(e.target.value),
                    className: "pl-9 h-8 text-xs bg-secondary border-border font-body"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    variant: "outline",
                    size: "sm",
                    "data-ocid": "evidence.filter_sort.open_modal_button",
                    className: "h-8 text-xs font-body gap-1.5 bg-secondary border-border text-muted-foreground hover:text-foreground flex-shrink-0",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                        evidenceTypeFilter === "all" ? "All" : evidenceTypeFilter,
                        " · ",
                        sortOption === "most_upvotes" ? "Most Upvotes" : sortOption === "most_downvotes" ? "Most Downvotes" : sortOption === "newest" ? "Newest" : "Oldest"
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3 w-3 opacity-60" })
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  DropdownMenuContent,
                  {
                    align: "end",
                    "data-ocid": "evidence.filter_sort.dropdown_menu",
                    className: "w-44 font-body",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuLabel, { className: "text-xs text-muted-foreground font-body font-medium px-2 py-1", children: "Filter by" }),
                      ["all", "True", "False", "Unverified"].map(
                        (filter) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          DropdownMenuItem,
                          {
                            "data-ocid": "evidence.filter.tab",
                            onClick: () => setEvidenceTypeFilter(filter),
                            className: "text-xs font-body gap-2 cursor-pointer",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                Check,
                                {
                                  className: cn(
                                    "h-3.5 w-3.5 flex-shrink-0",
                                    evidenceTypeFilter === filter ? "opacity-100 text-primary" : "opacity-0"
                                  )
                                }
                              ),
                              filter === "all" ? "All" : filter
                            ]
                          },
                          filter
                        )
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuLabel, { className: "text-xs text-muted-foreground font-body font-medium px-2 py-1", children: "Sort by" }),
                      [
                        { value: "most_upvotes", label: "Most Upvotes" },
                        { value: "most_downvotes", label: "Most Downvotes" },
                        { value: "newest", label: "Newest" },
                        { value: "oldest", label: "Oldest" }
                      ].map(({ value, label }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        DropdownMenuItem,
                        {
                          "data-ocid": "evidence.sort.select",
                          onClick: () => setSortOption(value),
                          className: "text-xs font-body gap-2 cursor-pointer",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Check,
                              {
                                className: cn(
                                  "h-3.5 w-3.5 flex-shrink-0",
                                  sortOption === value ? "opacity-100 text-primary" : "opacity-0"
                                )
                              }
                            ),
                            label
                          ]
                        },
                        value
                      ))
                    ]
                  }
                )
              ] })
            ] }),
            evidenceLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "space-y-2 p-3 bg-secondary rounded-sm",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-2/3" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-20" })
                ]
              },
              i
            )) }) : filteredEvidence.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: filteredEvidence.map((item, idx) => {
              var _a2;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                motion.div,
                {
                  "data-ocid": `evidence.item.${idx + 1}`,
                  initial: { opacity: 0, y: 10 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: idx * 0.05 },
                  className: "p-4 bg-secondary border border-border rounded-sm",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1 flex-wrap", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(AuthorDisplay, { username: item.authorUsername }),
                      ((_a2 = item.authorUsername) == null ? void 0 : _a2.trim()) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-body", children: "·" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-body", children: formatRelativeTime(item.timestamp) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        EvidenceTypeBadge,
                        {
                          "data-ocid": `evidence.badge.${idx + 1}`,
                          evidenceType: item.evidenceType && item.evidenceType !== "" ? item.evidenceType : "Unverified"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      EvidenceTextDisplay,
                      {
                        item,
                        sessionId,
                        canEdit: canReport
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ImageGrid, { imageUrls: item.imageUrls ?? [], size: "sm" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(UrlChips, { urls: item.urls ?? [] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TrustedSourceBadgeList, { urls: item.urls ?? [] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-2 gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        EvidenceVoteButtons,
                        {
                          evidenceId: item.id,
                          sessionId,
                          index: idx + 1,
                          claimId
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            type: "button",
                            "data-ocid": `evidence.dropdown_menu.${idx + 1}`,
                            "aria-label": "More options",
                            className: "flex items-center justify-center w-6 h-6 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60",
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "h-3.5 w-3.5" })
                          }
                        ) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", className: "w-36", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            DropdownMenuItem,
                            {
                              "data-ocid": `evidence.secondary_button.${idx + 1}`,
                              className: "text-gray-500 cursor-pointer gap-2",
                              onClick: () => navigator.clipboard.writeText(
                                window.location.href
                              ),
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-3.5 w-3.5 text-gray-500" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Share" })
                              ]
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            DropdownMenuItem,
                            {
                              "data-ocid": `evidence.delete_button.${idx + 1}`,
                              className: "text-gray-500 cursor-pointer gap-2",
                              disabled: reportedEvidence.has(
                                item.id.toString()
                              ),
                              onClick: () => setReportingEvidenceId(item.id),
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "h-3.5 w-3.5 text-gray-500" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: reportedEvidence.has(item.id.toString()) ? "Reported" : "Report" })
                              ]
                            }
                          )
                        ] })
                      ] }) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      ReplyThread,
                      {
                        evidenceId: item.id,
                        sessionId,
                        evidenceIndex: idx + 1
                      }
                    )
                  ]
                },
                item.id.toString()
              );
            }) }) }) : evidenceSearch.trim() ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                "data-ocid": "evidence.empty_state",
                className: "text-center py-8 text-muted-foreground font-body",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-8 w-8 mx-auto mb-2 opacity-40" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No evidence matches your search." }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1 opacity-70", children: "Try different keywords or clear the search." })
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                "data-ocid": "evidence.empty_state",
                className: "text-center py-8 text-muted-foreground font-body",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-8 w-8 mx-auto mb-2 opacity-40" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No evidence submitted yet." }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1 opacity-70", children: "Be the first to share a source or argument." })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ReportDialog,
            {
              isOpen: reportDialogOpen,
              onClose: () => setReportDialogOpen(false),
              onConfirm: handleReportClaim,
              title: "Report Claim"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ReportDialog,
            {
              isOpen: reportingEvidenceId !== null,
              onClose: () => setReportingEvidenceId(null),
              onConfirm: handleReportEvidenceConfirm,
              title: "Report Evidence"
            }
          )
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            "data-ocid": "claim_detail.error_state",
            className: "text-center py-16 text-muted-foreground",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Claim not found." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onBack, className: "mt-4 font-body", children: "Go back" })
            ]
          }
        )
      ]
    }
  );
}
export {
  ClaimDetail
};
