import { c as createLucideIcon, j as jsxRuntimeExports, be as Dialog, bf as DialogContent, bg as DialogHeader, bh as DialogTitle, bi as ScrollArea, O as formatRelativeTime, r as reactExports, bj as reactDomExports, A as AnimatePresence, s as motion, a as cn, a0 as X } from "./index-BjqCw5_m.js";
import { a as ChevronLeft, C as ChevronRight } from "./pencil-BZ7MzYr3.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "m15 10 5 5-5 5", key: "qqa56n" }],
  ["path", { d: "M4 4v7a4 4 0 0 0 4 4h12", key: "z08zvw" }]
];
const CornerDownRight = createLucideIcon("corner-down-right", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
  ["path", { d: "M12 7v5l4 2", key: "1fdv2h" }]
];
const History = createLucideIcon("history", __iconNode$1);
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
      d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
      key: "1ffxy3"
    }
  ],
  ["path", { d: "m21.854 2.147-10.94 10.939", key: "12cjpa" }]
];
const Send = createLucideIcon("send", __iconNode);
function EditHistoryModal({
  open,
  onClose,
  history,
  currentText,
  currentEditedAt
}) {
  const allVersions = [
    { text: currentText, editedAt: currentEditedAt, isCurrent: true },
    ...[...history].reverse().map((h) => ({ ...h, isCurrent: false }))
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Dialog,
    {
      open,
      onOpenChange: (v) => {
        if (!v) onClose();
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", "data-ocid": "edit_history.dialog", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "font-display flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-4 w-4 text-muted-foreground" }),
          "Edit History"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "max-h-[60vh] pr-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          allVersions.map(
            (version, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "rounded-sm border border-border bg-secondary p-3 space-y-1",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold font-body text-muted-foreground", children: version.isCurrent ? "Current version" : `Version ${allVersions.length - idx - 1}` }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-body", children: formatRelativeTime(BigInt(version.editedAt * 1e6)) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-body text-foreground leading-relaxed whitespace-pre-wrap", children: version.text })
                ]
              },
              version.editedAt.toString()
            )
          ),
          allVersions.length === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-body italic text-center py-2", children: "No previous versions" })
        ] }) })
      ] })
    }
  );
}
const EDIT_PREFIX = "rebunked_edit_v2_";
const EDIT_WINDOW_MS = 30 * 60 * 1e3;
function storageKey(contentType, id, principalId) {
  return `${EDIT_PREFIX}${contentType}_${id}_${principalId}`;
}
function canEditContent(contentType, contentTimestampNs, authorSessionId, currentSessionId, currentPrincipalId) {
  if (!currentPrincipalId) return false;
  if (authorSessionId !== currentSessionId) return false;
  if (contentType === "reply" || contentType === "comment") return true;
  const ms = Number(contentTimestampNs) / 1e6;
  return Date.now() - ms < EDIT_WINDOW_MS;
}
function getEditRecord(contentType, id, principalId) {
  try {
    const raw = localStorage.getItem(storageKey(contentType, id, principalId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function saveEditRecord(contentType, id, principalId, newText, previousText, currentVoteCount) {
  const existing = getEditRecord(contentType, id, principalId);
  const history = (existing == null ? void 0 : existing.editHistory) ?? [];
  history.push({
    text: previousText,
    editedAt: (existing == null ? void 0 : existing.lastEditedAt) ?? Date.now()
  });
  const record = {
    currentText: newText,
    editHistory: history,
    wasEditedAfterVotes: ((existing == null ? void 0 : existing.wasEditedAfterVotes) ?? false) || currentVoteCount > 0,
    lastEditedAt: Date.now()
  };
  localStorage.setItem(
    storageKey(contentType, id, principalId),
    JSON.stringify(record)
  );
  return record;
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
export {
  CornerDownRight as C,
  EditHistoryModal as E,
  Lightbox as L,
  Send as S,
  canEditContent as c,
  getEditRecord as g,
  saveEditRecord as s
};
