import { c as createLucideIcon, p as useVerifiedAccount, z as useProfileByUsername, ax as useStatsByUsername, ay as useAllClaims, _ as useTrustedSources, az as useStorageClient, r as reactExports, aA as getVerifiedVotes, aB as useVotesByUsername, Y as getActivePrincipalId, aC as getUserClaims, aD as getUserEvidence, aE as getUserComments, aF as getUserSources, aG as useReputationEvents, j as jsxRuntimeExports, m as motion, B as Button, a8 as Skeleton, H as UserAvatar, L as LoaderCircle, V as VerifiedBadge, x as Textarea, X, an as Check, aa as TooltipProvider, ab as Tooltip, ac as TooltipTrigger, ae as TooltipContent, aH as Layers, aI as Trophy, g as ue, T as TrendingDown, k as TrendingUp } from "./index-BtF6ZgDC.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, F as FileText, c as TabsContent } from "./tabs-Cc3qDuVM.js";
import { A as ArrowLeft } from "./arrow-left-DbXucSST.js";
import { P as Pencil } from "./pencil-D1jRdvwP.js";
import { S as ShieldCheck, M as MessageSquare } from "./shield-check-DjB0n8bz.js";
import { I as Info, S as Shield } from "./shield-D7XO-uxT.js";
import { V as Vote } from "./vote-BKMMIvpb.js";
import { a as ChevronRight, C as ChevronLeft } from "./chevron-right-zWO-p0x8.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  [
    "path",
    {
      d: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",
      key: "1tc9qg"
    }
  ],
  ["circle", { cx: "12", cy: "13", r: "3", key: "1vg3eu" }]
];
const Camera = createLucideIcon("camera", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [["path", { d: "M5 12h14", key: "1ays0h" }]];
const Minus = createLucideIcon("minus", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
      key: "r04s7s"
    }
  ]
];
const Star = createLucideIcon("star", __iconNode);
function formatRelative(dateStr) {
  const date = new Date(dateStr);
  const now = /* @__PURE__ */ new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (d.getTime() === today.getTime()) return "today";
  if (d.getTime() === yesterday.getTime()) return "yesterday";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1e3);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}
const TIER_CONFIG = {
  Newcomer: {
    label: "Newcomer",
    className: "bg-muted text-muted-foreground"
  },
  Contributor: {
    label: "Contributor",
    className: "bg-blue-100 text-blue-700"
  },
  Analyst: {
    label: "Analyst",
    className: "bg-amber-100 text-amber-700"
  },
  Investigator: {
    label: "Investigator",
    className: "bg-violet-100 text-violet-700"
  },
  Expert: {
    label: "Expert",
    className: "bg-primary/10 text-primary"
  }
};
const TIER_THRESHOLDS = [
  { tier: "Newcomer", min: 0, next: 5 },
  { tier: "Contributor", min: 5, next: 25 },
  { tier: "Analyst", min: 25, next: 100 },
  { tier: "Investigator", min: 100, next: 500 },
  { tier: "Expert", min: 500, next: null }
];
function getReputationTier(points) {
  if (points >= 500) return "Expert";
  if (points >= 100) return "Investigator";
  if (points >= 25) return "Analyst";
  if (points >= 5) return "Contributor";
  return "Newcomer";
}
function getTierProgress(points) {
  const tierData = TIER_THRESHOLDS.find(
    (t) => t.tier === getReputationTier(points)
  );
  if (tierData.next === null) {
    return {
      currentTier: tierData.tier,
      nextTier: null,
      current: points,
      threshold: null,
      progressPct: 100
    };
  }
  const nextTierData = TIER_THRESHOLDS.find((t) => t.min === tierData.next);
  const progressInTier = points - tierData.min;
  const tierRange = tierData.next - tierData.min;
  return {
    currentTier: tierData.tier,
    nextTier: nextTierData.tier,
    current: points,
    threshold: tierData.next,
    progressPct: Math.min(100, progressInTier / tierRange * 100)
  };
}
const HOW_TO_EARN = [
  { action: "Submit a claim", pts: "+1 pt" },
  { action: "Post evidence", pts: "+1 pt" },
  { action: "Post a comment", pts: "+1 pt" },
  { action: "Cast a vote", pts: "+1 pt" }
];
const TAB_TRIGGER_CLASS = "data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:hover:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground hover:text-primary hover:bg-transparent px-3 py-2 text-xs font-medium font-body rounded-lg gap-1.5 h-auto transition-colors shadow-none shrink-0 whitespace-nowrap";
function ScrollChevron({
  direction,
  onClick
}) {
  const isRight = direction === "right";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick,
      "aria-label": isRight ? "Scroll tabs right" : "Scroll tabs left",
      className: `md:hidden absolute top-0 bottom-0 z-10 flex items-center justify-center w-8 touch-manipulation ${isRight ? "right-0" : "left-0"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: `absolute inset-y-0 w-full pointer-events-none ${isRight ? "bg-gradient-to-l from-background to-transparent" : "bg-gradient-to-r from-background to-transparent"}`
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative z-10 rounded-full bg-background/80 backdrop-blur-sm border border-border p-0.5 flex items-center justify-center shadow-sm", children: isRight ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5 text-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-3.5 w-3.5 text-foreground" }) })
      ]
    }
  );
}
function eventAccent(event) {
  const isLoss = event.pointChange < 0 || event.trustChange < 0;
  const isGain = event.pointChange > 0 || event.trustChange > 0;
  if (isLoss) {
    return {
      iconBg: "bg-red-50",
      iconColor: "text-destructive",
      Icon: TrendingDown
    };
  }
  if (isGain) {
    return {
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      Icon: TrendingUp
    };
  }
  return {
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
    Icon: Minus
  };
}
function formatChange(event) {
  const parts = [];
  if (event.pointChange !== 0) {
    parts.push(
      `${event.pointChange > 0 ? "+" : ""}${event.pointChange} pt${Math.abs(event.pointChange) === 1 ? "" : "s"}`
    );
  }
  if (event.trustChange !== 0) {
    parts.push(
      `${event.trustChange > 0 ? "+" : ""}${event.trustChange}% trust`
    );
  }
  return parts.join(" / ") || "—";
}
function changeColor(event) {
  if (event.pointChange < 0 || event.trustChange < 0) return "text-destructive";
  if (event.pointChange > 0 || event.trustChange > 0) return "text-emerald-600";
  return "text-muted-foreground";
}
function formatRepEventLabel(action) {
  const labels = {
    claim_submitted: "Claim submitted",
    evidence_submitted: "Evidence submitted",
    vote_cast: "Vote cast",
    reply_posted: "Comment posted",
    source_suggested: "Trusted source suggested"
  };
  return labels[action] ?? action.replace(/_/g, " ");
}
function ProfilePage({ username, onBack }) {
  const {
    username: currentUsername,
    joinDate,
    avatarUrl,
    setAvatarUrl,
    isVerified,
    bio,
    setBio,
    lastActive,
    activityPoints,
    trustScore,
    isTrustedContributor,
    privacySettings,
    principal
  } = useVerifiedAccount();
  const isOwnProfile = isVerified && currentUsername === username;
  const { data: viewedProfile, isLoading: viewedProfileLoading } = useProfileByUsername(!isOwnProfile ? username : null);
  const { data: viewedStats } = useStatsByUsername(
    !isOwnProfile ? username : null
  );
  const { data: allClaims = [] } = useAllClaims();
  const { data: allSources = [] } = useTrustedSources();
  const displayAvatar = isOwnProfile ? avatarUrl ?? void 0 : (viewedProfile == null ? void 0 : viewedProfile.avatarUrl) ?? void 0;
  const displayBio = isOwnProfile ? bio ?? "" : (viewedProfile == null ? void 0 : viewedProfile.bio) ?? "";
  const displayJoinDate = isOwnProfile ? joinDate : (viewedProfile == null ? void 0 : viewedProfile.joinDate) ? new Date(Number(viewedProfile.joinDate) / 1e6).toISOString() : null;
  const displayLastActive = isOwnProfile ? lastActive : (viewedProfile == null ? void 0 : viewedProfile.lastActive) ? new Date(Number(viewedProfile.lastActive) / 1e6).toISOString() : null;
  const displayActivityPoints = isOwnProfile ? activityPoints : Number((viewedStats == null ? void 0 : viewedStats.activityPoints) ?? 0);
  const displayTrustScore = isOwnProfile ? trustScore : Number((viewedStats == null ? void 0 : viewedStats.trustScore) ?? 0);
  const displayClaimCount = isOwnProfile ? null : Number((viewedStats == null ? void 0 : viewedStats.claimCount) ?? 0);
  const displayEvidenceCount = isOwnProfile ? null : Number((viewedStats == null ? void 0 : viewedStats.evidenceCount) ?? 0);
  const displayCommentCount = isOwnProfile ? null : Number((viewedStats == null ? void 0 : viewedStats.commentCount) ?? 0);
  const displayIsTrustedContributor = isOwnProfile ? isTrustedContributor : displayActivityPoints >= 25 && displayTrustScore >= 70;
  const displayTier = getReputationTier(displayActivityPoints);
  const displayTierConfig = TIER_CONFIG[displayTier];
  const displayTierProgress = getTierProgress(displayActivityPoints);
  const displayPrivacySettings = isOwnProfile ? privacySettings : (viewedProfile == null ? void 0 : viewedProfile.privacySettings) ?? {
    showVotes: true,
    showClaims: true,
    showEvidence: true,
    showComments: true
  };
  const { data: storageClient } = useStorageClient();
  const [isUploading, setIsUploading] = reactExports.useState(false);
  const fileInputRef = reactExports.useRef(null);
  const [isEditingBio, setIsEditingBio] = reactExports.useState(false);
  const [bioInput, setBioInput] = reactExports.useState(bio ?? "");
  const tabScrollRef = reactExports.useRef(null);
  const [showLeft, setShowLeft] = reactExports.useState(false);
  const [showRight, setShowRight] = reactExports.useState(false);
  const [earnTooltipOpen, setEarnTooltipOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const el = tabScrollRef.current;
    if (!el) return;
    function updateChevrons() {
      if (!el) return;
      setShowLeft(el.scrollLeft > 2);
      setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    }
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(updateChevrons);
    });
    el.addEventListener("scroll", updateChevrons, { passive: true });
    const ro = new ResizeObserver(updateChevrons);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener("scroll", updateChevrons);
      ro.disconnect();
    };
  }, []);
  function scrollTabs(direction) {
    const el = tabScrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === "right" ? 120 : -120,
      behavior: "smooth"
    });
  }
  const formattedJoinDate = displayJoinDate ? new Date(displayJoinDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }) : null;
  const verifiedVotes = isOwnProfile ? getVerifiedVotes() : {};
  const voteCount = Object.keys(verifiedVotes).length;
  const { data: otherUserVotes = [] } = useVotesByUsername(
    !isOwnProfile && (displayPrivacySettings == null ? void 0 : displayPrivacySettings.showVotes) !== false ? username : null
  );
  const activePrincipalId = getActivePrincipalId();
  const ownClaims = isOwnProfile && activePrincipalId ? getUserClaims(activePrincipalId) : [];
  const ownEvidence = isOwnProfile && activePrincipalId ? getUserEvidence(activePrincipalId) : [];
  const ownComments = isOwnProfile && activePrincipalId ? getUserComments(activePrincipalId) : [];
  const ownSources = isOwnProfile && activePrincipalId ? getUserSources(activePrincipalId) : [];
  const otherUserClaims = !isOwnProfile ? allClaims.filter((c) => c.authorUsername === username) : [];
  const otherUserSources = !isOwnProfile ? allSources.filter((s) => s.suggestedByUsername === username) : [];
  const { data: repEventsRaw = [] } = useReputationEvents(
    isOwnProfile ? principal : null
  );
  const repEvents = repEventsRaw.map((e) => ({
    id: `rep-${e.timestamp.toString()}`,
    label: formatRepEventLabel(e.action),
    pointChange: Number(e.points),
    trustChange: 0,
    timestamp: new Date(Number(e.timestamp) / 1e6).toISOString(),
    relatedLink: void 0,
    relatedLabel: void 0
  }));
  async function handleAvatarUpload(e) {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file || !storageClient) return;
    if (!file.type.startsWith("image/")) {
      ue.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      ue.error("Image must be under 5MB");
      return;
    }
    setIsUploading(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes);
      const url = await storageClient.getDirectURL(hash);
      await setAvatarUrl(url);
      ue.success("Avatar updated!");
    } catch {
      ue.error("Failed to upload avatar");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }
  async function handleSaveBio() {
    try {
      await setBio(bioInput.trim());
      setIsEditingBio(false);
      ue.success("Bio saved!");
    } catch {
      ue.error("Failed to save bio. Please try again.");
    }
  }
  function handleCancelBio() {
    setBioInput(bio ?? "");
    setIsEditingBio(false);
  }
  if (!isOwnProfile && viewedProfileLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        className: "max-w-xl mx-auto",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: onBack,
              "data-ocid": "profile.button",
              className: "mb-6 gap-2 text-muted-foreground hover:text-foreground font-body -ml-2 h-8",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
                "Back"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-xl p-8 flex flex-col items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "w-20 h-20 rounded-full" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-32" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-48" })
          ] })
        ]
      }
    );
  }
  if (!isOwnProfile && !viewedProfileLoading && !viewedProfile) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        className: "max-w-xl mx-auto",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: onBack,
              "data-ocid": "profile.button",
              className: "mb-6 gap-2 text-muted-foreground hover:text-foreground font-body -ml-2 h-8",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
                "Back"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border border-border rounded-xl p-8 flex flex-col items-center gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground font-body text-sm", children: [
            "Profile not found for @",
            username
          ] }) })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -8 },
      transition: { duration: 0.2 },
      className: "max-w-xl mx-auto",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: onBack,
            "data-ocid": "profile.button",
            className: "mb-6 gap-2 text-muted-foreground hover:text-foreground font-body -ml-2 h-8",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Back"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-xl p-8 flex flex-col items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              UserAvatar,
              {
                username,
                avatarUrl: displayAvatar,
                size: "lg",
                className: "ring-4 ring-border",
                isVerified: true
              }
            ),
            isOwnProfile && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  "data-ocid": "profile.upload_button",
                  onClick: () => {
                    var _a;
                    return (_a = fileInputRef.current) == null ? void 0 : _a.click();
                  },
                  disabled: isUploading || !storageClient,
                  className: "absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer",
                  "aria-label": "Change avatar",
                  children: isUploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 text-white animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-6 w-6 text-white" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  ref: fileInputRef,
                  type: "file",
                  accept: "image/*",
                  className: "hidden",
                  onChange: handleAvatarUpload
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-bold text-foreground leading-tight", children: username }),
              displayIsTrustedContributor && /* @__PURE__ */ jsxRuntimeExports.jsx(VerifiedBadge, {})
            ] }),
            displayTierConfig && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `text-xs font-body font-medium px-2.5 py-0.5 rounded-full ${displayTierConfig.className}`,
                children: displayTierConfig.label
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1 flex-wrap justify-center", children: [
              formattedJoinDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground font-body", children: [
                "Member since ",
                formattedJoinDate
              ] }),
              displayLastActive && formattedJoinDate && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-1 text-muted-foreground/40 text-xs", children: "·" }),
              displayLastActive && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground font-body", children: [
                "Active ",
                formatRelative(displayLastActive)
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full max-w-sm mt-1", children: isOwnProfile ? isEditingBio ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                value: bioInput,
                onChange: (e) => setBioInput(e.target.value),
                placeholder: "Write a short bio…",
                className: "text-sm font-body resize-none",
                rows: 3,
                maxLength: 200,
                "data-ocid": "profile.textarea"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  onClick: handleCancelBio,
                  "data-ocid": "profile.cancel_button",
                  className: "h-7 text-xs font-body gap-1",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" }),
                    "Cancel"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  onClick: handleSaveBio,
                  "data-ocid": "profile.save_button",
                  className: "h-7 text-xs font-body gap-1",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3" }),
                    "Save"
                  ]
                }
              )
            ] })
          ] }) : bio ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-center gap-1.5 group/bio", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-body text-center", children: bio }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  setBioInput(bio);
                  setIsEditingBio(true);
                },
                "data-ocid": "profile.edit_button",
                className: "opacity-0 group-hover/bio:opacity-100 transition-opacity text-muted-foreground hover:text-foreground flex-shrink-0 mt-0.5",
                "aria-label": "Edit bio",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" })
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setIsEditingBio(true),
              "data-ocid": "profile.secondary_button",
              className: "text-xs text-muted-foreground hover:text-primary font-body transition-colors w-full text-center",
              children: "+ Add a bio…"
            }
          ) : displayBio ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-body text-center", children: displayBio }) : null })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 bg-muted/50 rounded-xl px-2 py-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-bold font-display text-foreground leading-none", children: isOwnProfile ? voteCount : otherUserVotes.length }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground font-body", children: "Votes" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-bold font-display text-foreground leading-none", children: isOwnProfile ? ownClaims.length : displayClaimCount }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground font-body", children: "Claims" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-bold font-display text-foreground leading-none", children: isOwnProfile ? ownEvidence.length : displayEvidenceCount }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground font-body", children: "Evidence" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-bold font-display text-foreground leading-none", children: isOwnProfile ? ownComments.length : displayCommentCount }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground font-body", children: "Comments" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-primary/[0.04] rounded-xl px-5 py-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-5 h-5 text-primary flex-shrink-0 mt-0.5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold font-body text-foreground", children: "Trust Score" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground font-body mt-0.5", children: "How accurate your contributions have been" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xl font-bold font-display text-primary leading-none", children: [
                displayTrustScore,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-border rounded-full h-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "bg-primary rounded-full h-1.5 transition-all duration-500",
                style: { width: `${Math.min(100, displayTrustScore)}%` }
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 bg-muted/40 border border-border rounded-xl p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold font-display text-foreground", children: "Reputation Progress" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2.5", children: [
            displayTierProgress.nextTier === null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 py-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3.5 w-3.5 text-primary flex-shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-semibold font-display text-primary", children: "Max tier reached" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground font-body ml-auto", children: [
                displayActivityPoints,
                " pts"
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground font-body", children: [
                    "Tier — ",
                    displayTierProgress.currentTier,
                    " →",
                    " ",
                    displayTierProgress.nextTier
                  ] }),
                  isOwnProfile && /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { delayDuration: 100, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Tooltip,
                    {
                      open: earnTooltipOpen,
                      onOpenChange: setEarnTooltipOpen,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, "data-ocid": "profile.tooltip", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            type: "button",
                            className: "inline-flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground transition-colors focus-visible:outline-none",
                            "aria-label": "How to earn points",
                            onClick: () => setEarnTooltipOpen((v) => !v),
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
                              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold text-foreground mb-2", children: "How to earn points" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-1", children: HOW_TO_EARN.map(({ action, pts }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                "div",
                                {
                                  className: "flex items-center justify-between gap-3",
                                  children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: action }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-semibold text-primary font-mono flex-shrink-0", children: pts })
                                  ]
                                },
                                action
                              )) }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border/50 leading-relaxed", children: "Trusted Contributor badge also requires a 70%+ trust score" })
                            ]
                          }
                        )
                      ]
                    }
                  ) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] font-semibold font-display text-foreground", children: [
                  displayActivityPoints,
                  "/",
                  displayTierProgress.threshold
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-border rounded-full h-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "bg-primary rounded-full h-1.5 transition-all",
                  style: { width: `${displayTierProgress.progressPct}%` }
                }
              ) })
            ] }),
            !displayIsTrustedContributor && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border/60 pt-2.5 -mx-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground font-body mb-2.5", children: "Earn the Trusted Contributor badge by reaching Analyst tier (25 pts) with a 70%+ trust score" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between mb-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground font-body", children: "Activity Points" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] font-semibold font-display text-foreground", children: [
                    displayActivityPoints,
                    "/25"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-border rounded-full h-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "bg-primary rounded-full h-1.5 transition-all",
                    style: {
                      width: `${Math.min(100, displayActivityPoints / 25 * 100)}%`
                    }
                  }
                ) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between mb-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground font-body", children: "Trust Score" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] font-semibold font-display text-foreground", children: [
                    displayTrustScore,
                    "% / 70% required"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-border rounded-full h-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "bg-primary rounded-full h-1.5 transition-all",
                    style: {
                      width: `${Math.min(100, displayTrustScore / 70 * 100)}%`
                    }
                  }
                ) })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Tabs,
          {
            defaultValue: isOwnProfile || (displayPrivacySettings == null ? void 0 : displayPrivacySettings.showVotes) !== false ? "votes" : "claims",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                showLeft && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ScrollChevron,
                  {
                    direction: "left",
                    onClick: () => scrollTabs("left")
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    ref: tabScrollRef,
                    className: "overflow-x-auto -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex gap-x-1 flex-nowrap bg-transparent p-0 h-auto w-max", children: [
                      (isOwnProfile || (displayPrivacySettings == null ? void 0 : displayPrivacySettings.showVotes) !== false) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        TabsTrigger,
                        {
                          value: "votes",
                          "data-ocid": "profile.tab",
                          className: TAB_TRIGGER_CLASS,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Vote, { className: "h-3.5 w-3.5" }),
                            "Votes"
                          ]
                        }
                      ),
                      (isOwnProfile || (displayPrivacySettings == null ? void 0 : displayPrivacySettings.showClaims) !== false) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        TabsTrigger,
                        {
                          value: "claims",
                          "data-ocid": "profile.tab",
                          className: TAB_TRIGGER_CLASS,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5" }),
                            "Claims"
                          ]
                        }
                      ),
                      (isOwnProfile || (displayPrivacySettings == null ? void 0 : displayPrivacySettings.showEvidence) !== false) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        TabsTrigger,
                        {
                          value: "evidence",
                          "data-ocid": "profile.tab",
                          className: TAB_TRIGGER_CLASS,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "h-3.5 w-3.5" }),
                            "Evidence"
                          ]
                        }
                      ),
                      (isOwnProfile || (displayPrivacySettings == null ? void 0 : displayPrivacySettings.showComments) !== false) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        TabsTrigger,
                        {
                          value: "comments",
                          "data-ocid": "profile.tab",
                          className: TAB_TRIGGER_CLASS,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-3.5 w-3.5" }),
                            "Comments"
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        TabsTrigger,
                        {
                          value: "sources",
                          "data-ocid": "profile.tab",
                          className: TAB_TRIGGER_CLASS,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3.5 w-3.5" }),
                            "Sources"
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        TabsTrigger,
                        {
                          value: "reputation",
                          "data-ocid": "profile.tab",
                          className: TAB_TRIGGER_CLASS,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3.5 w-3.5" }),
                            "Reputation"
                          ]
                        }
                      )
                    ] })
                  }
                ),
                showRight && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ScrollChevron,
                  {
                    direction: "right",
                    onClick: () => scrollTabs("right")
                  }
                )
              ] }),
              (isOwnProfile || (displayPrivacySettings == null ? void 0 : displayPrivacySettings.showVotes) !== false) && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "votes", className: "mt-4", children: isOwnProfile ? voteCount === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex flex-col items-center justify-center py-12 text-center",
                  "data-ocid": "profile.empty_state",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Vote, { className: "h-8 w-8 text-muted-foreground/30 mb-3" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-body text-muted-foreground", children: "No votes yet" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-body text-muted-foreground/60 mt-1", children: "Votes you cast on claims will appear here." })
                  ]
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border border-border rounded-lg divide-y divide-border", children: Object.entries(verifiedVotes).map(
                ([claimId, record], i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    "data-ocid": `profile.item.${i + 1}`,
                    className: "flex items-center justify-between px-4 py-3 gap-3",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-body text-foreground truncate", children: record.claimTitle }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "span",
                          {
                            className: `text-xs font-body font-medium px-1.5 py-0.5 rounded ${record.voteType === "True" ? "bg-emerald-100 text-emerald-700" : record.voteType === "False" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`,
                            children: record.voteType === "True" ? "REBUNKED" : record.voteType === "False" ? "DEBUNKED" : "Unverified"
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-body", children: new Date(record.timestamp).toLocaleDateString() })
                      ] })
                    ]
                  },
                  claimId
                )
              ) }) : otherUserVotes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex flex-col items-center justify-center py-12 text-center",
                  "data-ocid": "profile.empty_state",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Vote, { className: "h-8 w-8 text-muted-foreground/30 mb-3" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-body text-muted-foreground", children: "No votes yet" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-body text-muted-foreground/60 mt-1", children: "Votes cast on claims will appear here." })
                  ]
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border border-border rounded-lg divide-y divide-border", children: otherUserVotes.map((vote, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  "data-ocid": `profile.item.${i + 1}`,
                  className: "flex items-center justify-between px-4 py-3 gap-3",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "a",
                      {
                        href: `/claim/${vote.claimId}`,
                        className: "text-sm font-body text-foreground truncate hover:underline",
                        children: vote.claimTitle || `Claim #${vote.claimId}`
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: `text-xs font-body font-medium px-1.5 py-0.5 rounded ${vote.verdict === "True" ? "bg-emerald-100 text-emerald-700" : vote.verdict === "False" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`,
                          children: vote.verdict === "True" ? "REBUNKED" : vote.verdict === "False" ? "DEBUNKED" : "Unverified"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-body", children: new Date(
                        Number(vote.timestamp) / 1e6
                      ).toLocaleDateString() })
                    ] })
                  ]
                },
                `${vote.claimId}-${i}`
              )) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "claims", className: "mt-4", children: (() => {
                const claims = isOwnProfile ? ownClaims : null;
                const otherClaims = !isOwnProfile ? otherUserClaims : null;
                if (isOwnProfile) {
                  return (claims ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "flex flex-col items-center justify-center py-12 text-center",
                      "data-ocid": "profile.empty_state",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-8 w-8 text-muted-foreground/30 mb-3" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-body text-muted-foreground", children: "No claims submitted yet" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-body text-muted-foreground/60 mt-1", children: "Claims you submit will appear here." })
                      ]
                    }
                  ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border border-border rounded-xl overflow-hidden", children: (claims ?? []).map((record, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      "data-ocid": `profile.item.${i + 1}`,
                      className: `flex items-center justify-between px-4 py-3 gap-3 ${i < (claims ?? []).length - 1 ? "border-b border-border/50" : ""}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-body text-foreground truncate flex-1", children: record.title }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-body font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground", children: record.category }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-body", children: new Date(record.timestamp).toLocaleDateString() })
                        ] })
                      ]
                    },
                    record.claimId
                  )) });
                }
                return (otherClaims ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "flex flex-col items-center justify-center py-12 text-center",
                    "data-ocid": "profile.empty_state",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-8 w-8 text-muted-foreground/30 mb-3" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-body text-muted-foreground", children: "No claims submitted yet" })
                    ]
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border border-border rounded-xl overflow-hidden", children: (otherClaims ?? []).map((claim, i) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      "data-ocid": `profile.item.${i + 1}`,
                      className: `flex items-center justify-between px-4 py-3 gap-3 ${i < (otherClaims ?? []).length - 1 ? "border-b border-border/50" : ""}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-body text-foreground truncate flex-1", children: claim.title }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-body font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground", children: claim.category }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-body", children: new Date(
                            Number(claim.timestamp) / 1e6
                          ).toLocaleDateString() })
                        ] })
                      ]
                    },
                    ((_a = claim.id) == null ? void 0 : _a.toString()) ?? i
                  );
                }) });
              })() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "evidence", className: "mt-4", children: isOwnProfile ? ownEvidence.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex flex-col items-center justify-center py-12 text-center",
                  "data-ocid": "profile.empty_state",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "h-8 w-8 text-muted-foreground/30 mb-3" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-body text-muted-foreground", children: "No evidence posted yet" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-body text-muted-foreground/60 mt-1", children: "Evidence you submit on claims will appear here." })
                  ]
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border border-border rounded-xl overflow-hidden", children: ownEvidence.map((record, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  "data-ocid": `profile.item.${i + 1}`,
                  className: `flex items-start justify-between px-4 py-3 gap-3 ${i < ownEvidence.length - 1 ? "border-b border-border/50" : ""}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-body text-foreground truncate", children: record.text.length > 80 ? `${record.text.slice(0, 80)}…` : record.text }),
                      record.claimTitle && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground font-body mt-0.5 truncate", children: [
                        "on: ",
                        record.claimTitle
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: `text-xs font-body font-medium px-1.5 py-0.5 rounded ${record.evidenceType === "True" ? "bg-emerald-100 text-emerald-700" : record.evidenceType === "False" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`,
                          children: record.evidenceType
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-body", children: new Date(record.timestamp).toLocaleDateString() })
                    ] })
                  ]
                },
                record.evidenceId
              )) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex flex-col items-center justify-center py-12 text-center",
                  "data-ocid": "profile.empty_state",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "h-8 w-8 text-muted-foreground/30 mb-3" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-body text-muted-foreground", children: "Evidence not available" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-body text-muted-foreground/60 mt-1", children: "Evidence details are not public for other users." })
                  ]
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "comments", className: "mt-4", children: isOwnProfile ? ownComments.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex flex-col items-center justify-center py-12 text-center",
                  "data-ocid": "profile.empty_state",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-8 w-8 text-muted-foreground/30 mb-3" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-body text-muted-foreground", children: "No comments yet" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-body text-muted-foreground/60 mt-1", children: "Comments you post will appear here." })
                  ]
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border border-border rounded-xl overflow-hidden", children: ownComments.map((record, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  "data-ocid": `profile.item.${i + 1}`,
                  className: `flex items-center justify-between px-4 py-3 gap-3 ${i < ownComments.length - 1 ? "border-b border-border/50" : ""}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-body text-foreground truncate flex-1", children: record.text.length > 100 ? `${record.text.slice(0, 100)}…` : record.text }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-body flex-shrink-0", children: new Date(record.timestamp).toLocaleDateString() })
                  ]
                },
                record.replyId
              )) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex flex-col items-center justify-center py-12 text-center",
                  "data-ocid": "profile.empty_state",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-8 w-8 text-muted-foreground/30 mb-3" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-body text-muted-foreground", children: "Comments not available" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-body text-muted-foreground/60 mt-1", children: "Comment details are not public for other users." })
                  ]
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "sources", className: "mt-4", children: (() => {
                const sources = isOwnProfile ? ownSources : otherUserSources;
                return sources.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "flex flex-col items-center justify-center py-12 text-center",
                    "data-ocid": "profile.empty_state",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-8 w-8 text-muted-foreground/30 mb-3" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-body text-muted-foreground", children: "No sources suggested yet" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-body text-muted-foreground/60 mt-1", children: "Trusted sources suggested by this user will appear here." })
                    ]
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border border-border rounded-xl overflow-hidden", children: sources.map((record, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    "data-ocid": `profile.item.${i + 1}`,
                    className: `flex items-center justify-between px-4 py-3 gap-3 ${i < sources.length - 1 ? "border-b border-border/50" : ""}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-body text-foreground font-medium truncate flex-1", children: record.domain }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-body font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize", children: (record.sourceType ?? record.type ?? "").replace(
                          /_/g,
                          " "
                        ) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-body", children: record.timestamp ? new Date(
                          typeof record.timestamp === "string" ? record.timestamp : Number(record.timestamp) / 1e6
                        ).toLocaleDateString() : "" })
                      ] })
                    ]
                  },
                  (record.domain ?? record.claimId) + (record.timestamp ?? i)
                )) });
              })() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                TabsContent,
                {
                  value: "reputation",
                  className: "mt-4",
                  "data-ocid": "profile.panel",
                  children: !isOwnProfile ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "flex flex-col items-center justify-center py-12 text-center",
                      "data-ocid": "profile.empty_state",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-8 w-8 text-muted-foreground/30 mb-3" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-body text-muted-foreground", children: "Reputation history is private" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-body text-muted-foreground/60 mt-1", children: "Only visible to the account owner." })
                      ]
                    }
                  ) : repEvents.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "flex flex-col items-center justify-center py-12 text-center",
                      "data-ocid": "profile.empty_state",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-8 w-8 text-muted-foreground/30 mb-3" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-body text-muted-foreground", children: "No reputation events yet" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-body text-muted-foreground/60 mt-1", children: "Start contributing to earn points." })
                      ]
                    }
                  ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-wrap bg-muted/50 rounded-xl px-4 py-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold font-display text-foreground", children: [
                        displayActivityPoints,
                        " pts"
                      ] }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-1 text-muted-foreground/40 text-xs", children: "·" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: `text-xs font-body font-medium px-2 py-0.5 rounded-full ${(displayTierConfig == null ? void 0 : displayTierConfig.className) ?? "bg-muted text-muted-foreground"}`,
                          children: displayTier
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-1 text-muted-foreground/40 text-xs", children: "·" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-body text-muted-foreground", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-primary", children: [
                          displayTrustScore,
                          "%"
                        ] }),
                        " ",
                        "trust score"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border border-border rounded-xl overflow-hidden", children: repEvents.map((event, i) => {
                      const { iconBg, iconColor, Icon } = eventAccent(event);
                      const change = formatChange(event);
                      const color = changeColor(event);
                      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "div",
                        {
                          "data-ocid": `profile.item.${i + 1}`,
                          className: `flex items-start gap-3 px-4 py-3 ${i < repEvents.length - 1 ? "border-b border-border/50" : ""}`,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "div",
                              {
                                className: `flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${iconBg}`,
                                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `h-3.5 w-3.5 ${iconColor}` })
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-body text-foreground leading-snug", children: event.label }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "span",
                                  {
                                    className: `text-xs font-mono font-semibold flex-shrink-0 ${color}`,
                                    children: change
                                  }
                                )
                              ] }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-0.5 flex-wrap", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground font-body", children: timeAgo(new Date(event.timestamp)) }),
                                event.relatedLink && event.relatedLabel && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-1 text-muted-foreground/40 text-[11px]", children: "·" }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    "a",
                                    {
                                      href: event.relatedLink,
                                      className: "text-[11px] text-muted-foreground hover:text-primary font-body underline-offset-2 hover:underline transition-colors truncate max-w-[160px]",
                                      children: event.relatedLabel
                                    }
                                  )
                                ] })
                              ] })
                            ] })
                          ]
                        },
                        event.id
                      );
                    }) })
                  ] })
                }
              )
            ]
          }
        ) })
      ]
    }
  );
}
export {
  ProfilePage
};
