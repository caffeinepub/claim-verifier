import { c as createLucideIcon, r as reactExports, m as useUsername, n as useVerifiedAccount, aS as useReportSourceComment, aT as useSourceComments, aU as useSourceCommentLikeCounts, j as jsxRuntimeExports, ac as Skeleton, s as motion, aV as useAddSourceComment, w as Textarea, A as AnimatePresence, I as ImageUploader, L as LoaderCircle, x as Link2, U as UrlInputList, y as Clock, B as Button, f as useSessionGate, g as ue, E as useProfileByUsername, aW as useLikeSourceComment, G as useAccountPermissions, aX as useSessionLikeForSourceComment, a as cn, J as UserProfileCard, K as isVerifiedUsername, M as UserAvatar, O as formatRelativeTime, P as Check, C as ChevronUp, Q as DropdownMenu, R as DropdownMenuTrigger, W as Ellipsis, X as DropdownMenuContent, Y as DropdownMenuItem, Z as Share2, _ as Flag, a0 as X, a1 as useTrustedSources, aY as useAllEvidenceForAllClaims, a6 as useAllEvidenceTallies, aZ as useWikipediaBlurb, ae as TooltipProvider, a_ as BookOpen, ab as useActor, a$ as useQuery, av as useAllClaims, b0 as useQueries, h as ChartNoAxesColumn, b1 as useAdminOverrideSource, b2 as useAdminRemoveSource, b3 as useAdminSetPinnedComment, b4 as getDispute, b5 as getDisputeVote, b6 as Select, b7 as SelectTrigger, b8 as SelectValue, b9 as SelectContent, ba as SelectItem, a3 as useEnhancedVoteTally, ak as computeOverallVerdict, bb as saveDispute, bc as clearDispute, bd as saveDisputeVote } from "./index-BjqCw5_m.js";
import { S as Send, g as getEditRecord, c as canEditContent, s as saveEditRecord, E as EditHistoryModal, C as CornerDownRight, L as Lightbox } from "./Lightbox-C7LC4rG3.js";
import { M as MessageSquare, S as ShieldCheck } from "./shield-check-Dwy2jzUY.js";
import { P as Pencil } from "./pencil-BZ7MzYr3.js";
import { E as ExternalLink, c as computeSourceCredibility, S as SourceLogo, g as getSourceTypeLabel } from "./TrustedSourcesPage-B_we1yoB.js";
import { A as ArrowLeft } from "./arrow-left-_CYU5Dap.js";
import { S as Shield } from "./shield-BwJRUZ1u.js";
import { V as Vote } from "./vote-BxB89mvf.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M12 17h.01", key: "p32p05" }],
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z", key: "1mlx9k" }],
  ["path", { d: "M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3", key: "mhlwft" }]
];
const FileQuestion = createLucideIcon("file-question", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M12 17v5", key: "bb1du9" }],
  [
    "path",
    {
      d: "M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z",
      key: "1nkz8b"
    }
  ]
];
const Pin = createLucideIcon("pin", __iconNode);
const ATTACHMENT_SEP = "\0";
function encodeAttachments(text, imageUrls, urls) {
  const filteredUrls = urls.filter(Boolean);
  if (imageUrls.length === 0 && filteredUrls.length === 0) return text;
  return text + ATTACHMENT_SEP + JSON.stringify({ imageUrls, urls: filteredUrls });
}
function decodeAttachments(raw) {
  const idx = raw.indexOf(ATTACHMENT_SEP);
  if (idx === -1) return { text: raw, imageUrls: [], urls: [] };
  try {
    const parsed = JSON.parse(raw.slice(idx + 1));
    return {
      text: raw.slice(0, idx),
      imageUrls: parsed.imageUrls ?? [],
      urls: parsed.urls ?? []
    };
  } catch {
    return { text: raw, imageUrls: [], urls: [] };
  }
}
function UrlChips({ urls }) {
  const valid = urls.filter((u) => u.trim());
  if (!valid.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mt-2", children: valid.map((url, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
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
function CommentImageGrid({ imageUrls }) {
  const [lightboxOpen, setLightboxOpen] = reactExports.useState(false);
  const [lightboxIndex, setLightboxIndex] = reactExports.useState(0);
  if (!imageUrls.length) return null;
  function openLightbox(index) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5 mb-2", children: imageUrls.map((url, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        "data-ocid": "image.open_modal_button",
        onClick: () => openLightbox(i),
        className: "block rounded-sm overflow-hidden border border-border hover:border-primary/40 transition-colors flex-shrink-0 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 h-24",
        "aria-label": `View attachment ${i + 1} fullscreen`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: url,
            alt: `Attachment ${i + 1}`,
            className: "object-cover h-full w-auto max-w-[200px]",
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
function CommentForm({
  sourceId,
  parentCommentId,
  sessionId,
  authorUsername,
  onCancel,
  onSuccess,
  autoFocus = false,
  ocidPrefix,
  placeholder = "Write a comment…",
  collapsible = false
}) {
  const [text, setText] = reactExports.useState("");
  const [imageUrls, setImageUrls] = reactExports.useState([]);
  const [isImageUploading, setIsImageUploading] = reactExports.useState(false);
  const [uploaderKey, setUploaderKey] = reactExports.useState(0);
  const [urls, setUrls] = reactExports.useState([]);
  const [showLinks, setShowLinks] = reactExports.useState(false);
  const [cooldownLeft, setCooldownLeft] = reactExports.useState(0);
  const [isExpanded, setIsExpanded] = reactExports.useState(!collapsible || autoFocus);
  const textareaRef = reactExports.useRef(null);
  const addComment = useAddSourceComment();
  const { checkAction } = useSessionGate();
  reactExports.useEffect(() => {
    if (isExpanded && collapsible && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isExpanded, collapsible]);
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
  function handleTextChange(e) {
    setText(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }
  function handleFormBlur(e) {
    if (!collapsible) return;
    if (!e.currentTarget.contains(e.relatedTarget)) {
      if (!text.trim() && imageUrls.length === 0) {
        setIsExpanded(false);
        setShowLinks(false);
      }
    }
  }
  function collapse() {
    setText("");
    setImageUrls([]);
    setIsImageUploading(false);
    setUploaderKey((k) => k + 1);
    setUrls([]);
    setShowLinks(false);
    if (collapsible) setIsExpanded(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() || cooldownLeft > 0) return;
    if (!checkAction()) return;
    try {
      await addComment.mutateAsync({
        sourceId,
        parentCommentId,
        text: encodeAttachments(text.trim(), imageUrls, urls),
        authorUsername,
        sessionId
      });
      collapse();
      onSuccess == null ? void 0 : onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.startsWith("cooldown:")) {
        const secs = Number.parseInt(msg.split(":")[1], 10);
        setCooldownLeft(Number.isFinite(secs) ? secs : 120);
      } else {
        ue.error("Failed to post comment");
      }
    }
  }
  if (collapsible && !isExpanded) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => setIsExpanded(true),
        className: "w-full text-left px-3 py-2 rounded-md border border-border bg-muted/30 text-sm text-muted-foreground font-body hover:border-primary/40 hover:bg-muted/40 transition-colors",
        children: placeholder
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, onBlur: handleFormBlur, className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Textarea,
      {
        ref: textareaRef,
        "data-ocid": `${ocidPrefix}.textarea`,
        placeholder,
        value: text,
        onChange: handleTextChange,
        maxLength: 500,
        autoFocus: autoFocus || collapsible && isExpanded,
        className: "bg-card border-border font-body resize-none text-sm min-h-[4rem] overflow-hidden",
        style: { height: "auto" }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { initial: false, children: isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, height: 0 },
        animate: { opacity: 1, height: "auto" },
        exit: { opacity: 0, height: 0 },
        transition: { duration: 0.15 },
        className: "overflow-hidden space-y-2",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ImageUploader,
            {
              onUploaded: setImageUrls,
              onUploadingChange: setIsImageUploading,
              maxFiles: 3,
              ocidPrefix: `${ocidPrefix}.image`
            },
            uploaderKey
          ),
          isImageUploading && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground font-body flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }),
            "Uploading images, please wait..."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => setShowLinks((v) => !v),
                className: "flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-body transition-colors",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "h-3 w-3" }),
                  showLinks ? "Hide links" : "Add links"
                ]
              }
            ),
            showLinks && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              UrlInputList,
              {
                urls,
                onChange: setUrls,
                ocidPrefix: `${ocidPrefix}.url`,
                placeholder: "https://example.com/source"
              }
            ) })
          ] }),
          cooldownLeft > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-amber-400 font-body bg-amber-400/10 border border-amber-400/20 rounded-sm px-2 py-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Comment again in",
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
              (onCancel || collapsible) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  variant: "ghost",
                  size: "sm",
                  "data-ocid": `${ocidPrefix}.cancel_button`,
                  onClick: () => {
                    collapse();
                    onCancel == null ? void 0 : onCancel();
                  },
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
                  disabled: addComment.isPending || cooldownLeft > 0 || isImageUploading || !text.trim(),
                  className: "h-7 px-2.5 font-body text-xs bg-primary text-primary-foreground gap-1",
                  children: [
                    addComment.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : cooldownLeft > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-3 w-3" }),
                    cooldownLeft > 0 ? "On Cooldown" : "Post"
                  ]
                }
              )
            ] })
          ] })
        ]
      },
      "comment-controls"
    ) })
  ] });
}
function CommentCard({
  comment,
  sourceId,
  sessionId,
  username,
  verifiedUsername,
  avatarUrl,
  index,
  depth,
  reportedIds,
  onReport,
  replyingToId,
  onToggleReply,
  children,
  likeCounts,
  principalId
}) {
  const {
    text: displayText,
    imageUrls: attachedImages,
    urls: attachedUrls
  } = decodeAttachments(comment.text);
  const isOwnComment = comment.sessionId === sessionId;
  const displayAuthor = isOwnComment ? verifiedUsername ?? username : comment.authorUsername;
  const { data: authorProfile } = useProfileByUsername(
    isOwnComment ? null : comment.authorUsername
  );
  const displayAvatarUrl = isOwnComment ? avatarUrl : (authorProfile == null ? void 0 : authorProfile.avatarUrl) || void 0;
  const isReplying = replyingToId === comment.id;
  const [isEditingComment, setIsEditingComment] = reactExports.useState(false);
  const [commentEditText, setCommentEditText] = reactExports.useState("");
  const [commentEditHistoryOpen, setCommentEditHistoryOpen] = reactExports.useState(false);
  const commentEditRecord = principalId ? getEditRecord("comment", comment.id.toString(), principalId) : null;
  const showCommentEdit = !!principalId && canEditContent(
    "comment",
    comment.timestamp,
    comment.sessionId,
    sessionId,
    principalId
  );
  const likeComment = useLikeSourceComment();
  const { checkAction } = useSessionGate();
  useAccountPermissions();
  const { data: isLiked = false } = useSessionLikeForSourceComment(
    comment.id,
    sessionId
  );
  const likeCount = likeCounts[comment.id.toString()] ?? 0;
  async function handleLike() {
    if (!checkAction()) return;
    try {
      await likeComment.mutateAsync({
        commentId: comment.id,
        sessionId,
        sourceId
      });
    } catch {
      ue.error("Failed to like comment");
    }
  }
  function handleShare() {
    const base = window.location.href.split("#")[0];
    navigator.clipboard.writeText(`${base}#comment-${comment.id.toString()}`);
    ue.success("Link copied");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      id: `comment-${comment.id.toString()}`,
      "data-ocid": `source_discussion.item.${index}`,
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
                isVerified: isOwnComment ? !!verifiedUsername : isVerifiedUsername(),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    UserAvatar,
                    {
                      username: displayAuthor,
                      size: "sm",
                      avatarUrl: displayAvatarUrl,
                      isVerified: isOwnComment ? !!verifiedUsername : !!(authorProfile == null ? void 0 : authorProfile.username)
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-foreground font-body", children: displayAuthor })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-body", children: "·" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-body", children: formatRelativeTime(comment.timestamp) })
          ] }),
          isEditingComment ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                value: commentEditText,
                onChange: (e) => setCommentEditText(e.target.value),
                rows: 3,
                maxLength: 1e3,
                className: "bg-card border-border font-body resize-none text-sm",
                autoFocus: true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    if (!commentEditText.trim() || !principalId) return;
                    saveEditRecord(
                      "comment",
                      comment.id.toString(),
                      principalId,
                      commentEditText.trim(),
                      (commentEditRecord == null ? void 0 : commentEditRecord.currentText) ?? displayText,
                      0
                    );
                    setIsEditingComment(false);
                    ue.success("Comment updated");
                  },
                  className: "flex items-center gap-1 h-6 px-2 text-xs font-body bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3" }),
                    "Save"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    setCommentEditText("");
                    setIsEditingComment(false);
                  },
                  className: "flex items-center gap-1 h-6 px-2 text-xs font-body text-muted-foreground hover:text-foreground rounded-sm hover:bg-secondary transition-colors",
                  children: "Cancel"
                }
              )
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 group/commenttext", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground font-body leading-relaxed inline", children: (commentEditRecord == null ? void 0 : commentEditRecord.currentText) ?? displayText }),
            commentEditRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setCommentEditHistoryOpen(true),
                className: "ml-1 text-xs text-muted-foreground italic font-body hover:text-foreground transition-colors",
                children: "(edited)"
              }
            ),
            showCommentEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  setCommentEditText(
                    (commentEditRecord == null ? void 0 : commentEditRecord.currentText) ?? displayText
                  );
                  setIsEditingComment(true);
                },
                className: "ml-1.5 inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover/commenttext:opacity-100 transition-opacity",
                "aria-label": "Edit comment",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-2.5 w-2.5" })
              }
            )
          ] }),
          attachedImages.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(CommentImageGrid, { imageUrls: attachedImages }),
          attachedUrls.filter(Boolean).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(UrlChips, { urls: attachedUrls }),
          commentEditRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(
            EditHistoryModal,
            {
              open: commentEditHistoryOpen,
              onClose: () => setCommentEditHistoryOpen(false),
              history: commentEditRecord.editHistory,
              currentText: commentEditRecord.currentText,
              currentEditedAt: commentEditRecord.lastEditedAt
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 mt-2", children: [
            depth < 4 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                "data-ocid": `source_discussion.button.${index}`,
                onClick: () => onToggleReply(isReplying ? null : comment.id),
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
                "data-ocid": `source_discussion.toggle.${index}`,
                onClick: handleLike,
                disabled: likeComment.isPending,
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
                  "data-ocid": `source_discussion.dropdown_menu.${index}`,
                  "aria-label": "More options",
                  className: "flex items-center justify-center w-6 h-6 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "h-3.5 w-3.5" })
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", className: "w-40", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  DropdownMenuItem,
                  {
                    "data-ocid": `source_discussion.secondary_button.${index}`,
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
                    "data-ocid": `source_discussion.delete_button.${index}`,
                    className: "text-muted-foreground cursor-pointer gap-2",
                    disabled: reportedIds.has(comment.id.toString()),
                    onClick: () => {
                      if (checkAction()) onReport(comment.id);
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "h-3.5 w-3.5 text-muted-foreground" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: reportedIds.has(comment.id.toString()) ? "Reported" : "Report" })
                    ]
                  }
                )
              ] })
            ] })
          ] }),
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
                      className: "w-4 h-4 flex items-center justify-center rounded text-primary/60 hover:text-primary hover:bg-primary/10 transition-colors focus-visible:outline-none",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  CommentForm,
                  {
                    sourceId,
                    parentCommentId: comment.id,
                    sessionId,
                    authorUsername: verifiedUsername ?? username,
                    onCancel: () => onToggleReply(null),
                    onSuccess: () => onToggleReply(null),
                    autoFocus: true,
                    ocidPrefix: `source_discussion.nested.${index}`,
                    placeholder: "Write a reply\\u2026"
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
function SourceDiscussion({
  sourceId,
  sessionId
}) {
  const [replyingToId, setReplyingToId] = reactExports.useState(null);
  const [reportedIds, setReportedIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const username = useUsername();
  const {
    username: verifiedUsername,
    avatarUrl,
    principal: verifiedPrincipal
  } = useVerifiedAccount();
  const reportComment = useReportSourceComment();
  const { checkAction } = useSessionGate();
  const { data: comments = [], isLoading } = useSourceComments(sourceId);
  const { data: likeCounts = {} } = useSourceCommentLikeCounts(sourceId);
  async function handleReport(commentId) {
    const key = commentId.toString();
    if (!checkAction()) return;
    if (reportedIds.has(key)) return;
    try {
      await reportComment.mutateAsync({ commentId, sessionId });
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
  const childrenByParent = /* @__PURE__ */ new Map();
  for (const c of comments) {
    if (c.parentCommentId === 0n) continue;
    const key = c.parentCommentId.toString();
    if (!childrenByParent.has(key)) childrenByParent.set(key, []);
    childrenByParent.get(key).push(c);
  }
  for (const [key, children] of childrenByParent.entries()) {
    childrenByParent.set(
      key,
      [...children].sort(
        (a, b) => (likeCounts[b.id.toString()] ?? 0) - (likeCounts[a.id.toString()] ?? 0)
      )
    );
  }
  const topLevelComments = comments.filter((c) => c.parentCommentId === 0n);
  const sortedTopLevel = [...topLevelComments].sort(
    (a, b) => (likeCounts[b.id.toString()] ?? 0) - (likeCounts[a.id.toString()] ?? 0)
  );
  let globalIndex = 0;
  function nextIndex() {
    globalIndex += 1;
    return globalIndex;
  }
  function renderComment(comment, depth) {
    const idx = nextIndex();
    const nested = childrenByParent.get(comment.id.toString()) ?? [];
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      CommentCard,
      {
        comment,
        sourceId,
        sessionId,
        username,
        verifiedUsername: verifiedUsername ?? void 0,
        avatarUrl: avatarUrl ?? void 0,
        index: idx,
        depth,
        reportedIds,
        onReport: handleReport,
        replyingToId,
        onToggleReply: setReplyingToId,
        likeCounts,
        principalId: (verifiedPrincipal == null ? void 0 : verifiedPrincipal.toString()) ?? null,
        children: nested.length > 0 && depth < 4 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-0", children: nested.map((child) => renderComment(child, depth + 1)) })
      },
      comment.id.toString()
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-ocid": "source_discussion.panel", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      CommentForm,
      {
        sourceId,
        parentCommentId: 0n,
        sessionId,
        authorUsername: verifiedUsername ?? username,
        ocidPrefix: "source_discussion.toplevel",
        placeholder: "Share your analysis of this source\\u2026",
        collapsible: true
      }
    ) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-ocid": "source_discussion.loading_state", className: "space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-24" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" })
    ] }, i)) }) : comments.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "source_discussion.empty_state",
        className: "flex flex-col items-center py-10 text-center text-muted-foreground",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-8 w-8 mb-3 opacity-20" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-body", children: "No comments yet. Start the discussion!" })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        "data-ocid": "source_discussion.list",
        className: "space-y-0",
        initial: "hidden",
        animate: "visible",
        variants: {
          visible: { transition: { staggerChildren: 0.04 } },
          hidden: {}
        },
        children: sortedTopLevel.map((comment) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            variants: {
              hidden: { opacity: 0, y: 4 },
              visible: { opacity: 1, y: 0 }
            },
            children: renderComment(comment, 0)
          },
          comment.id.toString()
        ))
      }
    )
  ] });
}
const ADMIN_PASSWORD = "lunasimbaliamsammy123!";
const ADMIN_SESSION_KEY = "rebunked_admin_authed";
function extractDomain(url) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0].toLowerCase();
  }
}
const VERDICT_STYLES = {
  REBUNKED: {
    label: "REBUNKED",
    className: "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30"
  },
  DEBUNKED: {
    label: "DEBUNKED",
    className: "bg-red-500/15 text-red-700 border border-red-500/30"
  },
  "Leaning TRUE": {
    label: "LEANING TRUE",
    className: "bg-emerald-500/10 text-emerald-600 border border-emerald-400/25"
  },
  "Leaning FALSE": {
    label: "LEANING FALSE",
    className: "bg-red-500/10 text-red-600 border border-red-400/25"
  },
  Contested: {
    label: "CONTESTED",
    className: "bg-amber-500/15 text-amber-700 border border-amber-400/30"
  },
  "Insufficient Data": {
    label: "INSUFFICIENT",
    className: "bg-muted text-muted-foreground border border-border"
  }
};
function useSourceReportCount(sourceId) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["report-count", "source", sourceId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getReportCount(sourceId, "source");
    },
    enabled: !!actor && !isFetching
  });
}
function CredibilityBadge({
  credibility
}) {
  if (credibility.status === "insufficient") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-body font-medium border bg-muted text-muted-foreground border-border", children: "Insufficient Data" });
  }
  const colorMap = {
    "High Credibility": "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    Mixed: "bg-amber-500/15 text-amber-700 border-amber-400/30",
    "Low Credibility": "bg-red-500/15 text-red-700 border-red-400/30"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-body font-medium border",
        colorMap[credibility.label]
      ),
      children: credibility.label
    }
  );
}
function EvidencePerformanceSection({
  credibility
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { children: credibility.status === "insufficient" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs font-body", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Citations so far" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-foreground", children: [
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
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-body text-muted-foreground italic mt-1.5", children: [
      "Insufficient data — needs ",
      5 - credibility.citations,
      " more citation",
      5 - credibility.citations !== 1 ? "s" : "",
      " for a score"
    ] })
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-card border border-border rounded-sm space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-body font-semibold text-foreground", children: "Credibility Score" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-body text-muted-foreground mt-0.5", children: "Based on quality-cleared evidence performance" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold font-mono text-foreground", children: [
          Math.round(credibility.score),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-body text-muted-foreground", children: "/100" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CredibilityBadge, { credibility })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: cn(
          "h-full rounded-full transition-all duration-700",
          credibility.label === "High Credibility" ? "bg-emerald-500" : credibility.label === "Mixed" ? "bg-amber-400" : "bg-red-400"
        ),
        style: { width: `${Math.round(credibility.score)}%` }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 pt-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-secondary rounded-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-body text-muted-foreground uppercase tracking-wider mb-1", children: "Quality-cleared" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold font-mono text-foreground", children: [
          credibility.qualityCleared,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground font-body", children: [
            "/",
            credibility.totalCitations
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] font-body text-muted-foreground mt-0.5", children: [
          Math.round(credibility.passRate),
          "% pass rate"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-secondary rounded-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-body text-muted-foreground uppercase tracking-wider mb-1", children: "Avg net score" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold font-mono text-foreground", children: [
          "+",
          credibility.avgNetScore.toFixed(1)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-body text-muted-foreground mt-0.5", children: "quality-cleared only" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground font-body border-t border-border pt-3", children: "Only evidence with net score ≥+3 counts. Score = avg net score (60%) + pass rate (40%). Updates as evidence accumulates." })
  ] }) });
}
function ClaimVerdictBadge({ claimId }) {
  const { data: tally, isLoading } = useEnhancedVoteTally(claimId);
  if (isLoading || !tally) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-16 h-4 bg-muted rounded animate-pulse" });
  }
  const verdict = computeOverallVerdict(
    Number(tally.trueCount),
    Number(tally.falseCount),
    Number(tally.unverifiedCount)
  );
  const style = VERDICT_STYLES[verdict] ?? VERDICT_STYLES["Insufficient Data"];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold font-body whitespace-nowrap",
        style.className
      ),
      children: style.label
    }
  );
}
function ClaimsCitingSource({
  domain,
  onClaimClick
}) {
  const { data: allClaims, isLoading } = useAllClaims();
  const matchingClaims = (allClaims ?? []).filter((claim) => {
    const urlsToCheck = [...claim.urls ?? [], ...claim.imageUrls ?? []];
    return urlsToCheck.some((url) => {
      try {
        return extractDomain(url) === domain;
      } catch {
        return false;
      }
    });
  });
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-ocid": "source_detail.loading_state", className: "space-y-2", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-14 w-full rounded-sm" }, i)) });
  }
  if (matchingClaims.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "source_detail.empty_state",
        className: "text-center py-10 text-muted-foreground",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileQuestion, { className: "h-8 w-8 mx-auto mb-2 opacity-20" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-body", children: "No claims currently cite this source." })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-ocid": "source_detail.list", className: "space-y-2", children: matchingClaims.map((claim, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.button,
    {
      type: "button",
      "data-ocid": `source_detail.item.${i + 1}`,
      initial: { opacity: 0, y: 6 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: i * 0.04 },
      onClick: () => onClaimClick(claim),
      className: "w-full text-left p-3 bg-secondary border border-border rounded-sm hover:border-primary/40 hover:bg-secondary/80 transition-all group",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-body font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1", children: claim.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClaimVerdictBadge, { claimId: claim.id })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground font-body mt-1 capitalize", children: claim.category })
      ]
    },
    claim.id.toString()
  )) });
}
function EvidenceQualitySection({ domain }) {
  const { actor, isFetching } = useActor();
  const { data: allClaims, isLoading: claimsLoading } = useAllClaims();
  const matchingClaims = (allClaims ?? []).filter((claim) => {
    const urlsToCheck = [...claim.urls ?? [], ...claim.imageUrls ?? []];
    return urlsToCheck.some((url) => {
      try {
        return extractDomain(url) === domain;
      } catch {
        return false;
      }
    });
  });
  const evidenceQueries = useQueries({
    queries: matchingClaims.map((claim) => ({
      queryKey: ["evidence", claim.id.toString()],
      queryFn: async () => {
        if (!actor) return [];
        return actor.getEvidenceForClaim(claim.id);
      },
      enabled: !!actor && !isFetching
    }))
  });
  const evidenceLoading = evidenceQueries.some((q) => q.isLoading);
  const citingEvidence = evidenceQueries.flatMap((q) => q.data ?? []).filter((ev) => ev.urls.some((url) => extractDomain(url) === domain));
  const tallyQueries = useQueries({
    queries: citingEvidence.map((ev) => ({
      queryKey: ["evidence-tally", ev.id.toString()],
      queryFn: async () => {
        if (!actor) return { netScore: 0n };
        return actor.getEvidenceVoteTally(ev.id);
      },
      enabled: !!actor && !isFetching && !evidenceLoading
    }))
  });
  const talliesLoading = tallyQueries.some((q) => q.isLoading);
  const isLoading = claimsLoading || evidenceLoading || talliesLoading;
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        "data-ocid": "source_detail.loading_state",
        className: "grid grid-cols-3 gap-3",
        children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-16 w-full rounded-sm" }, i))
      }
    );
  }
  const totalCount = citingEvidence.length;
  if (totalCount === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "source_detail.empty_state",
        className: "text-center py-8 text-muted-foreground",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "h-7 w-7 mx-auto mb-2 opacity-20" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-body", children: "No evidence cites this source yet." })
        ]
      }
    );
  }
  const netScores = tallyQueries.map((q) => {
    var _a;
    return Number(((_a = q.data) == null ? void 0 : _a.netScore) ?? 0n);
  }).filter((_, i) => i < totalCount);
  const avgScore = netScores.length > 0 ? Math.round(
    netScores.reduce((a, b) => a + b, 0) / netScores.length * 10
  ) / 10 : 0;
  const passingCount = netScores.filter((s) => s >= 3).length;
  const passRate = totalCount > 0 ? Math.round(passingCount / totalCount * 100) : 0;
  const stats = [
    {
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "h-4 w-4" }),
      label: "Evidence citing this source",
      value: totalCount.toString()
    },
    {
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4" }),
      label: "Avg. net score",
      value: avgScore > 0 ? `+${avgScore}` : avgScore.toString(),
      highlight: avgScore >= 3
    },
    {
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4" }),
      label: "Quality gate pass rate",
      value: `${passRate}%`,
      highlight: passRate >= 50
    }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-ocid": "source_detail.panel",
      className: "grid grid-cols-1 sm:grid-cols-3 gap-3",
      children: stats.map((stat) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "p-4 bg-secondary border border-border rounded-sm flex flex-col gap-1.5",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: cn(
                  "flex items-center gap-1.5 text-xs font-body",
                  stat.highlight ? "text-primary" : "text-muted-foreground"
                ),
                children: [
                  stat.icon,
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: stat.label })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: cn(
                  "text-2xl font-bold font-mono",
                  stat.highlight ? "text-primary" : "text-foreground"
                ),
                children: stat.value
              }
            )
          ]
        },
        stat.label
      ))
    }
  );
}
function AdminControls({ source }) {
  const [isOpen, setIsOpen] = reactExports.useState(
    () => sessionStorage.getItem(ADMIN_SESSION_KEY) === "1"
  );
  const [password, setPassword] = reactExports.useState("");
  const [authenticated, setAuthenticated] = reactExports.useState(
    () => sessionStorage.getItem(ADMIN_SESSION_KEY) === "1"
  );
  const [confirmRemove, setConfirmRemove] = reactExports.useState(false);
  const [overrideNote, setOverrideNote] = reactExports.useState("");
  const [pinnedComment, setPinnedComment] = reactExports.useState(
    source.pinnedAdminComment ?? ""
  );
  const overrideSource = useAdminOverrideSource();
  const removeSource = useAdminRemoveSource();
  const setPinnedCommentMutation = useAdminSetPinnedComment();
  function tryAuth() {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
      ue.success("Admin access granted");
    } else {
      ue.error("Incorrect password");
    }
  }
  async function handleOverride() {
    try {
      await overrideSource.mutateAsync({
        sourceId: source.id,
        approved: !source.isTrusted,
        note: overrideNote,
        password: ADMIN_PASSWORD
      });
      ue.success(
        source.isTrusted ? "Source marked as not trusted" : "Source marked as trusted"
      );
      setOverrideNote("");
    } catch (err) {
      ue.error(err instanceof Error ? err.message : "Override failed");
    }
  }
  async function handleRemove() {
    if (!confirmRemove) {
      setConfirmRemove(true);
      return;
    }
    try {
      await removeSource.mutateAsync({
        sourceId: source.id,
        password: ADMIN_PASSWORD
      });
      ue.success("Source removed");
      setConfirmRemove(false);
    } catch (err) {
      ue.error(err instanceof Error ? err.message : "Remove failed");
    }
  }
  async function handleSetPinnedComment() {
    try {
      await setPinnedCommentMutation.mutateAsync({
        sourceId: source.id,
        comment: pinnedComment,
        password: ADMIN_PASSWORD
      });
      ue.success(
        pinnedComment.trim() ? "Pinned comment updated" : "Pinned comment cleared"
      );
    } catch (err) {
      ue.error(
        err instanceof Error ? err.message : "Failed to set pinned comment"
      );
    }
  }
  if (!authenticated && !isOpen) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => setIsOpen(true),
        className: "opacity-0 w-0 h-0 overflow-hidden absolute",
        "aria-label": "Admin"
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 border border-border rounded-sm", children: [
    authenticated && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        "data-ocid": "source_detail.toggle",
        onClick: () => setIsOpen(!isOpen),
        className: "w-full flex items-center justify-between p-3 text-left hover:bg-secondary/60 transition-colors",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-body font-medium text-muted-foreground uppercase tracking-wider", children: "Admin Controls" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3.5 w-3.5 text-muted-foreground" })
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-t border-border space-y-5", children: !authenticated ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-body", children: "Enter admin password to access controls." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "password",
            "data-ocid": "source_detail.input",
            placeholder: "Admin password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            onKeyDown: (e) => e.key === "Enter" && tryAuth(),
            className: "flex-1 h-8 px-3 text-xs bg-secondary border border-border rounded font-body focus:outline-none focus:ring-1 focus:ring-primary/40"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "sm",
            "data-ocid": "source_detail.submit_button",
            onClick: tryAuth,
            className: "h-8 text-xs font-body bg-primary text-primary-foreground hover:bg-primary/90",
            children: "Unlock"
          }
        )
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-body font-medium text-muted-foreground uppercase tracking-wider", children: "Override Trust" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            "data-ocid": "source_detail.input",
            placeholder: "Override note (optional, e.g. 'Known misinformation outlet')",
            value: overrideNote,
            onChange: (e) => setOverrideNote(e.target.value),
            className: "w-full h-8 px-3 text-xs bg-secondary border border-border rounded font-body focus:outline-none focus:ring-1 focus:ring-primary/40"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              "data-ocid": "source_detail.secondary_button",
              onClick: handleOverride,
              disabled: overrideSource.isPending,
              className: "text-xs font-body",
              variant: "outline",
              children: [
                overrideSource.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-3 w-3 animate-spin" }) : null,
                source.isTrusted ? "Revoke Trust" : "Override Trust"
              ]
            }
          ),
          !confirmRemove ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              "data-ocid": "source_detail.delete_button",
              onClick: () => setConfirmRemove(true),
              variant: "outline",
              className: "text-xs font-body border-destructive/40 text-destructive hover:bg-destructive/10",
              children: "Remove Source"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                "data-ocid": "source_detail.confirm_button",
                onClick: handleRemove,
                disabled: removeSource.isPending,
                className: "text-xs font-body bg-destructive text-white hover:bg-destructive/90",
                children: [
                  removeSource.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-3 w-3 animate-spin" }) : null,
                  "Confirm Remove"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                "data-ocid": "source_detail.cancel_button",
                onClick: () => setConfirmRemove(false),
                variant: "outline",
                className: "text-xs font-body",
                children: "Cancel"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-body font-medium text-muted-foreground uppercase tracking-wider", children: "Pinned Admin Comment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            "data-ocid": "source_detail.textarea",
            placeholder: "Enter a pinned comment visible to all users (leave empty to clear)",
            value: pinnedComment,
            onChange: (e) => setPinnedComment(e.target.value),
            rows: 3,
            className: "w-full px-3 py-2 text-xs bg-secondary border border-border rounded font-body focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            "data-ocid": "source_detail.save_button",
            onClick: handleSetPinnedComment,
            disabled: setPinnedCommentMutation.isPending,
            className: "text-xs font-body",
            variant: "outline",
            children: [
              setPinnedCommentMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-1 h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Pin, { className: "mr-1 h-3 w-3" }),
              pinnedComment.trim() ? "Update Pinned Comment" : "Clear Pinned Comment"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-body font-medium text-muted-foreground uppercase tracking-wider", children: "About Blurb" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-body text-muted-foreground", children: "About blurb is auto-fetched from Wikipedia on page load." })
      ] })
    ] }) })
  ] });
}
const SOURCE_TYPE_OPTIONS = [
  { value: "peer-reviewed", label: "Peer-Reviewed Study" },
  { value: "government", label: "Government Data" },
  { value: "major-news", label: "Major News Organization" },
  { value: "independent", label: "Independent Journalism" },
  { value: "reference", label: "Reference / Encyclopedia" },
  { value: "blog", label: "Blog / Opinion" },
  { value: "archive", label: "Archive" },
  { value: "social", label: "Social Media" }
];
function SourceDisputePanel({
  source,
  sessionId
}) {
  const sourceKey = source.id.toString();
  const [dispute, setDispute] = reactExports.useState(() => getDispute(sourceKey));
  const [showForm, setShowForm] = reactExports.useState(false);
  const [proposedType, setProposedType] = reactExports.useState("");
  const myVote = dispute ? getDisputeVote(sourceKey, sessionId) : null;
  const currentVotes = dispute ? Object.values(dispute.votes).filter((v) => v === "current").length : 0;
  const proposedVotes = dispute ? Object.values(dispute.votes).filter((v) => v === "proposed").length : 0;
  const totalPollVotes = currentVotes + proposedVotes;
  const resolved = totalPollVotes >= 10;
  const winner = resolved ? currentVotes >= proposedVotes ? "current" : "proposed" : null;
  function handleStartDispute() {
    if (!proposedType || proposedType === source.sourceType) return;
    const record = {
      proposedType,
      creatorSessionId: sessionId,
      timestamp: Date.now(),
      votes: {}
    };
    saveDispute(sourceKey, record);
    setDispute(record);
    setShowForm(false);
    setProposedType("");
  }
  function handleVote(side) {
    if (!dispute || myVote) return;
    const updated = {
      ...dispute,
      votes: { ...dispute.votes, [sessionId]: side }
    };
    saveDispute(sourceKey, updated);
    saveDisputeVote(sourceKey, sessionId, side);
    setDispute(updated);
  }
  function handleClearDispute() {
    clearDispute(sourceKey);
    setDispute(null);
    setShowForm(false);
  }
  if (!dispute && !showForm) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        "data-ocid": "source_dispute.button",
        onClick: () => setShowForm(true),
        className: "flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-body transition-colors",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Vote, { className: "h-3.5 w-3.5" }),
          "Dispute Category"
        ]
      }
    );
  }
  if (showForm && !dispute) {
    const otherTypes = SOURCE_TYPE_OPTIONS.filter(
      (t) => t.value !== source.sourceType
    );
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 p-3 bg-secondary border border-border rounded-sm text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-body font-medium text-foreground", children: [
        "Propose a new category for",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: source.domain })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground font-body", children: [
        "Current:",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: getSourceTypeLabel(source.sourceType) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: proposedType, onValueChange: setProposedType, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs bg-card border-border font-body", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select proposed category" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: otherTypes.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          SelectItem,
          {
            value: t.value,
            className: "text-xs font-body",
            children: t.label
          },
          t.value
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            size: "sm",
            onClick: handleStartDispute,
            disabled: !proposedType,
            className: "h-7 text-xs font-body",
            children: "Start Poll"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "ghost",
            size: "sm",
            onClick: () => setShowForm(false),
            className: "h-7 text-xs font-body text-muted-foreground",
            children: "Cancel"
          }
        )
      ] })
    ] });
  }
  if (!dispute) return null;
  const currentLabel = getSourceTypeLabel(source.sourceType);
  const proposedLabel = getSourceTypeLabel(dispute.proposedType);
  const currentPct = totalPollVotes > 0 ? Math.round(currentVotes / totalPollVotes * 100) : 50;
  const proposedPct = totalPollVotes > 0 ? Math.round(proposedVotes / totalPollVotes * 100) : 50;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "source_dispute.poll",
      className: "p-4 bg-secondary border border-border rounded-sm space-y-3",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Vote, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-body font-semibold text-foreground", children: "Category Dispute" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: handleClearDispute,
              className: "text-xs text-muted-foreground hover:text-foreground font-body",
              children: "Clear"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground font-body", children: [
          "Community is voting on the correct category for",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: source.domain }),
          resolved && winner && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-primary font-medium", children: [
            "· ",
            winner === "current" ? currentLabel : proposedLabel,
            " wins!"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs font-body", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground font-medium", children: [
                "Keep: ",
                currentLabel
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground font-mono", children: [
                currentVotes,
                " votes (",
                currentPct,
                "%)"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "h-full bg-emerald-500 rounded-full transition-all",
                style: { width: `${currentPct}%` }
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs font-body", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground font-medium", children: [
                "Change to: ",
                proposedLabel
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground font-mono", children: [
                proposedVotes,
                " votes (",
                proposedPct,
                "%)"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "h-full bg-primary rounded-full transition-all",
                style: { width: `${proposedPct}%` }
              }
            ) })
          ] })
        ] }),
        !resolved && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              type: "button",
              "data-ocid": "source_dispute.vote_current_button",
              size: "sm",
              variant: myVote === "current" ? "default" : "outline",
              onClick: () => handleVote("current"),
              disabled: !!myVote,
              className: "h-7 text-xs font-body flex-1",
              children: [
                "Keep ",
                currentLabel
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              type: "button",
              "data-ocid": "source_dispute.vote_proposed_button",
              size: "sm",
              variant: myVote === "proposed" ? "default" : "outline",
              onClick: () => handleVote("proposed"),
              disabled: !!myVote,
              className: "h-7 text-xs font-body flex-1",
              children: [
                "Change to ",
                proposedLabel
              ]
            }
          )
        ] }),
        myVote && !resolved && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground font-body text-center", children: [
          "You voted · ",
          totalPollVotes,
          "/10 votes to resolve"
        ] })
      ]
    }
  );
}
function SourceDetailPage({
  domain,
  sessionId,
  onBack,
  onClaimClick
}) {
  var _a, _b;
  const { data: sources, isLoading } = useTrustedSources();
  const { isExpert } = useAccountPermissions();
  const sessionIdStr = sessionId ?? "";
  const source = (sources ?? []).find(
    (s) => s.domain.toLowerCase() === domain.toLowerCase()
  );
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
  const credibility = reactExports.useMemo(
    () => computeSourceCredibility(domain, allEvidenceWithScores),
    [domain, allEvidenceWithScores]
  );
  const { data: reportCount } = useSourceReportCount((source == null ? void 0 : source.id) ?? BigInt(0));
  const isFlagged = Number(reportCount ?? 0n) >= 3;
  const { data: wikiBlurb, isLoading: wikiLoading } = useWikipediaBlurb(
    (source == null ? void 0 : source.domain) ?? null
  );
  const { username: currentUsername } = useVerifiedAccount();
  const manualBlurbAdminKey = `about_blurb_admin_${domain}`;
  const manualBlurbKey = `about_blurb_${domain}`;
  const [manualBlurb, setManualBlurb] = reactExports.useState(
    () => localStorage.getItem(manualBlurbAdminKey) ?? localStorage.getItem(manualBlurbKey) ?? ""
  );
  const [editingBlurb, setEditingBlurb] = reactExports.useState(false);
  const [blurbDraft, setBlurbDraft] = reactExports.useState("");
  const isAdminSession = sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
  const isSuggester = !!currentUsername && !!(source == null ? void 0 : source.suggestedByUsername) && currentUsername === source.suggestedByUsername;
  const canEditBlurb = isAdminSession || isSuggester;
  const adminBlurb = localStorage.getItem(manualBlurbAdminKey) ?? "";
  const suggestorBlurb = localStorage.getItem(manualBlurbKey) ?? "";
  const displayedBlurb = adminBlurb || wikiBlurb || (source == null ? void 0 : source.aboutBlurb) || suggestorBlurb || "";
  function startEditBlurb() {
    setBlurbDraft(manualBlurb);
    setEditingBlurb(true);
  }
  function saveBlurb() {
    const trimmed = blurbDraft.trim();
    const key = isAdminSession ? manualBlurbAdminKey : manualBlurbKey;
    if (trimmed) {
      localStorage.setItem(key, trimmed);
    } else {
      localStorage.removeItem(key);
    }
    setManualBlurb(trimmed);
    setEditingBlurb(false);
    ue.success("About description saved");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      "data-ocid": "source_detail.page",
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "ghost",
            onClick: onBack,
            "data-ocid": "source_detail.link",
            className: "-ml-2 font-body text-muted-foreground hover:text-foreground gap-2 mb-6",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Back to Sources"
            ]
          }
        ),
        isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-ocid": "source_detail.loading_state", className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-48" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-32" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-2 w-full" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-2 w-full" })
        ] }) : !source ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            "data-ocid": "source_detail.error_state",
            className: "text-center py-20 text-muted-foreground",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-12 w-12 mx-auto mb-4 opacity-20" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-xl font-semibold mb-1", children: "Source not found" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-body", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: domain }),
                " is not in the sources directory."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  onClick: onBack,
                  variant: "outline",
                  className: "mt-4 font-body text-sm",
                  children: "Back to Sources"
                }
              )
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: cn(
                "pl-4 border-l-4",
                credibility.status === "scored" && credibility.label === "High Credibility" ? "border-l-green-500" : credibility.status === "scored" && credibility.label === "Low Credibility" ? "border-l-red-500" : "border-l-amber-400"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 flex-wrap mb-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SourceLogo, { domain: source.domain, size: "lg" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-wrap mb-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "a",
                      {
                        href: `https://${source.domain}`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "font-display text-2xl font-bold text-foreground hover:text-primary transition-colors flex items-center gap-2",
                        children: [
                          source.domain,
                          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4 opacity-50" })
                        ]
                      }
                    ),
                    source.adminOverride && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-2 py-1 rounded text-xs font-body bg-violet-500/15 text-violet-600 border border-violet-500/30", children: "Admin Approved" }),
                    isFlagged && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "span",
                      {
                        "data-ocid": "source_detail.card",
                        className: "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-body bg-amber-500/15 text-amber-700 border border-amber-400/30",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "h-3 w-3" }),
                          "Community flagged"
                        ]
                      }
                    )
                  ] }) })
                ] }),
                wikiLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-16 w-full rounded-sm" }) : displayedBlurb ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between gap-2 mb-1", children: canEditBlurb && !wikiBlurb && !editingBlurb && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      variant: "ghost",
                      size: "sm",
                      className: "h-7 text-xs text-muted-foreground gap-1 ml-auto",
                      onClick: startEditBlurb,
                      "data-ocid": "source_detail.edit_button",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }),
                        "Edit"
                      ]
                    }
                  ) }),
                  editingBlurb ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Textarea,
                      {
                        value: blurbDraft,
                        onChange: (e) => setBlurbDraft(e.target.value.slice(0, 500)),
                        placeholder: "Add a description for this source...",
                        className: "text-sm font-body resize-none min-h-[96px]",
                        "data-ocid": "source_detail.textarea"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground font-body", children: [
                        blurbDraft.length,
                        "/500"
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Button,
                          {
                            variant: "ghost",
                            size: "sm",
                            className: "h-7 text-xs",
                            onClick: () => setEditingBlurb(false),
                            "data-ocid": "source_detail.cancel_button",
                            children: "Cancel"
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Button,
                          {
                            size: "sm",
                            className: "h-7 text-xs",
                            onClick: saveBlurb,
                            "data-ocid": "source_detail.save_button",
                            children: "Save"
                          }
                        )
                      ] })
                    ] })
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-body text-muted-foreground leading-relaxed", children: displayedBlurb })
                ] }) : canEditBlurb ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: editingBlurb ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Textarea,
                    {
                      value: blurbDraft,
                      onChange: (e) => setBlurbDraft(e.target.value.slice(0, 500)),
                      placeholder: "Add a description for this source...",
                      className: "text-sm font-body resize-none min-h-[96px]",
                      "data-ocid": "source_detail.textarea"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground font-body", children: [
                      blurbDraft.length,
                      "/500"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: "ghost",
                          size: "sm",
                          className: "h-7 text-xs",
                          onClick: () => setEditingBlurb(false),
                          "data-ocid": "source_detail.cancel_button",
                          children: "Cancel"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          size: "sm",
                          className: "h-7 text-xs",
                          onClick: saveBlurb,
                          "data-ocid": "source_detail.save_button",
                          children: "Save"
                        }
                      )
                    ] })
                  ] })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: startEditBlurb,
                    className: "w-full flex gap-3 p-3 bg-secondary border border-dashed border-border rounded-sm text-left hover:bg-muted/50 transition-colors",
                    "data-ocid": "source_detail.edit_button",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-body text-muted-foreground leading-relaxed", children: "Add a description for this source..." })
                    ]
                  }
                ) }) : null,
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EvidencePerformanceSection, { credibility }) }),
                credibility.status === "scored" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-6 mb-4 pt-3 border-t border-border", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-body text-muted-foreground mb-0.5", children: "Credibility Score" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold font-mono text-foreground leading-none", children: [
                      Math.round(credibility.score),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-body text-muted-foreground font-normal", children: "/100" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-8 bg-border" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-body text-muted-foreground mb-0.5", children: "Evidence Citations" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold font-mono text-foreground leading-none", children: [
                      credibility.totalCitations,
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-body text-muted-foreground font-normal ml-1", children: [
                        "citation",
                        credibility.totalCitations !== 1 ? "s" : ""
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-8 bg-border" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-body text-muted-foreground mb-0.5", children: "Pass Rate" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold font-mono text-foreground leading-none", children: [
                      Math.round(credibility.passRate),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-body text-muted-foreground font-normal", children: "%" })
                    ] })
                  ] })
                ] }),
                credibility.status === "scored" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-body font-semibold text-foreground", children: "Source Credibility" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-body text-muted-foreground", children: [
                      Math.round(credibility.score),
                      "/100"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2.5 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: cn(
                        "h-full rounded-full transition-all duration-700",
                        credibility.label === "High Credibility" ? "bg-emerald-500" : credibility.label === "Mixed" ? "bg-amber-400" : "bg-red-400"
                      ),
                      style: { width: `${Math.round(credibility.score)}%` }
                    }
                  ) })
                ] }),
                ((_a = source.adminOverrideNote) == null ? void 0 : _a.trim()) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 mt-4 px-3 py-2 rounded-sm bg-violet-50 border border-violet-200 text-violet-700", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3.5 w-3.5 flex-shrink-0 mt-0.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-body", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Admin note:" }),
                    " ",
                    source.adminOverrideNote
                  ] })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1 h-5 bg-primary rounded-full" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-base font-semibold text-foreground", children: "Evidence Quality" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-body text-muted-foreground", children: "— how well this source is cited" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(EvidenceQualitySection, { domain })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1 h-5 bg-primary rounded-full" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-base font-semibold text-foreground", children: "Claims Citing This Source" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ClaimsCitingSource, { domain, onClaimClick })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1 h-5 bg-primary rounded-full" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-base font-semibold text-foreground", children: "Discussion" })
            ] }),
            ((_b = source.pinnedAdminComment) == null ? void 0 : _b.trim()) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 p-3 mb-4 bg-violet-50 border border-violet-200 rounded-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pin, { className: "h-4 w-4 text-violet-600 flex-shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5 mb-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold font-body uppercase tracking-wider text-violet-600", children: "Pinned Admin Note" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-body text-violet-800 leading-relaxed", children: source.pinnedAdminComment })
              ] })
            ] }),
            sessionId ? /* @__PURE__ */ jsxRuntimeExports.jsx(SourceDiscussion, { sourceId: source.id, sessionId }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-body text-muted-foreground", children: "Loading session…" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AdminControls, { source }),
          isExpert && source.isTrusted && sessionIdStr && /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SourceDisputePanel, { source, sessionId: sessionIdStr }) })
        ] })
      ]
    }
  ) });
}
export {
  SourceDetailPage
};
