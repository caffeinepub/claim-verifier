import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, B as Button, bk as LogOut, bl as Globe, an as Input, ab as useActor, aa as useQueryClient, a$ as useQuery, bm as useMutation, am as Search, bn as Badge, ac as Skeleton, b6 as Select, b7 as SelectTrigger, b8 as SelectValue, b9 as SelectContent, ba as SelectItem, bo as useGetHiddenClaims, bp as useRestoreClaim, bq as useAdminDeleteClaim, br as TriangleAlert, s as motion, M as formatRelativeTime, L as LoaderCircle, g as ue, bs as useGetHiddenEvidence, bt as useRestoreEvidence, bu as useAdminDeleteEvidence, bv as useGetHiddenReplies, bw as useRestoreReply, bx as useAdminDeleteReply, a1 as useTrustedSources, b2 as useAdminRemoveSource, b1 as useAdminOverrideSource, a as cn, l as CircleCheck } from "./index-D_FhFQ6_.js";
import { T as Trash2, A as AlertDialog, b as AlertDialogContent, c as AlertDialogHeader, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction } from "./alert-dialog-CwziAu25.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, F as FileText, c as TabsContent } from "./tabs-CrbsMlui.js";
import { g as getSourceTypeLabel, b as getSourceTypeBadgeClasses, e as getSourceTypeCeiling } from "./TrustedSourcesPage-XLlbd838.js";
import { A as ArrowLeft } from "./arrow-left-BvteElEl.js";
import { S as Shield } from "./shield-CfzopQoY.js";
import { M as MessageSquare, S as ShieldCheck } from "./shield-check-Cn1czz98.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$5 = [
  ["ellipse", { cx: "12", cy: "5", rx: "9", ry: "3", key: "msslwz" }],
  ["path", { d: "M3 5V19A9 3 0 0 0 21 19V5", key: "1wlel7" }],
  ["path", { d: "M3 12A9 3 0 0 0 21 12", key: "mv7ke4" }]
];
const Database = createLucideIcon("database", __iconNode$5);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  [
    "path",
    {
      d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",
      key: "ct8e1f"
    }
  ],
  ["path", { d: "M14.084 14.158a3 3 0 0 1-4.242-4.242", key: "151rxh" }],
  [
    "path",
    {
      d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",
      key: "13bj9a"
    }
  ],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }]
];
const EyeOff = createLucideIcon("eye-off", __iconNode$4);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }]
];
const Lock = createLucideIcon("lock", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "M21 10.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.5", key: "1uzm8b" }],
  ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]
];
const SquareCheckBig = createLucideIcon("square-check-big", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M9 14 4 9l5-5", key: "102s5s" }],
  ["path", { d: "M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11", key: "f3b9sd" }]
];
const Undo2 = createLucideIcon("undo-2", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
const Users = createLucideIcon("users", __iconNode);
const ADMIN_PASSWORD = "lunasimbaliamsammy123!";
const ADMIN_SESSION_KEY = "rebunked_admin_authed";
function formatDate(ts) {
  return new Date(Number(ts) / 1e6).toLocaleDateString();
}
function truncate(text, len = 60) {
  return text.length > len ? `${text.slice(0, len)}…` : text;
}
function ConfirmDelete({
  open,
  onConfirm,
  onCancel,
  isPending,
  description
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { "data-ocid": "admin.dialog", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Are you absolutely sure?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: description ?? "This action cannot be undone. The data will be permanently deleted." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        AlertDialogCancel,
        {
          "data-ocid": "admin.cancel_button",
          onClick: onCancel,
          disabled: isPending,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        AlertDialogAction,
        {
          "data-ocid": "admin.confirm_button",
          onClick: onConfirm,
          disabled: isPending,
          className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          children: [
            isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
            "Delete"
          ]
        }
      )
    ] })
  ] }) });
}
function EmptyState({ label }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "admin.empty_state",
      className: "flex flex-col items-center py-16 text-muted-foreground",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "h-8 w-8 mb-3 opacity-20" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: label })
      ]
    }
  );
}
function LoadingRows() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-ocid": "admin.loading_state", className: "space-y-2 p-3", children: [1, 2, 3, 4, 5].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full rounded" }, i)) });
}
function UsersTab({ password }) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [search, setSearch] = reactExports.useState("");
  const [pendingDelete, setPendingDelete] = reactExports.useState(null);
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin", "users", password],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllUsers(password);
    },
    enabled: !!actor,
    staleTime: 0,
    refetchOnMount: true
  });
  const deleteMut = useMutation({
    mutationFn: async (username) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.adminDeleteUser(username, password);
      if ((result == null ? void 0 : result.__kind__) === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      ue.success("User deleted");
      setPendingDelete(null);
    },
    onError: (e) => {
      ue.error(e.message ?? "Failed to delete user");
      setPendingDelete(null);
    }
  });
  const filtered = (users ?? []).filter(
    (u) => u.username.toLowerCase().includes(search.toLowerCase())
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            "data-ocid": "admin.users.search_input",
            placeholder: "Search by username\\u2026",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            className: "pl-8 h-8 text-sm"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
        (users ?? []).length,
        " users"
      ] })
    ] }),
    !actor || isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingRows, {}) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { label: "No users found" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-md overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "grid gap-2 px-3 py-2 border-b border-border bg-muted/30",
          style: { gridTemplateColumns: "2fr 1fr 1fr 2fr auto" },
          children: ["Username", "Joined", "Last Active", "Bio", ""].map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "text-xs font-medium text-muted-foreground uppercase tracking-wide",
              children: col
            },
            col
          ))
        }
      ),
      filtered.map((user, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          "data-ocid": `admin.users.item.${idx + 1}`,
          className: "grid gap-2 px-3 py-2.5 border-b border-border/50 last:border-0 items-center hover:bg-muted/20 transition-colors",
          style: { gridTemplateColumns: "2fr 1fr 1fr 2fr auto" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium truncate", children: user.username }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: formatDate(user.joinDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: formatDate(user.lastActive) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground truncate", children: truncate(user.bio || "—", 40) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                variant: "destructive",
                "data-ocid": `admin.users.delete_button.${idx + 1}`,
                onClick: () => setPendingDelete(user.username),
                className: "h-7 w-7 p-0",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
              }
            )
          ]
        },
        user.username
      ))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDelete,
      {
        open: !!pendingDelete,
        description: `Delete user "${pendingDelete}"? This will also delete all their claims, evidence, votes, and comments. This cannot be undone.`,
        isPending: deleteMut.isPending,
        onConfirm: () => pendingDelete && deleteMut.mutate(pendingDelete),
        onCancel: () => setPendingDelete(null)
      }
    )
  ] });
}
function ClaimsTab({ password }) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [search, setSearch] = reactExports.useState("");
  const [pendingDelete, setPendingDelete] = reactExports.useState(null);
  const { data: claims, isLoading } = useQuery({
    queryKey: ["admin", "claims", password],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllClaims(password);
    },
    enabled: !!actor,
    staleTime: 0,
    refetchOnMount: true
  });
  const deleteMut = useMutation({
    mutationFn: async (id) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.adminDeleteClaim(id, password);
      if ((result == null ? void 0 : result.__kind__) === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "claims"] });
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      ue.success("Claim deleted");
      setPendingDelete(null);
    },
    onError: (e) => {
      ue.error(e.message ?? "Failed to delete claim");
      setPendingDelete(null);
    }
  });
  const filtered = (claims ?? []).filter(
    (c) => c.title.toLowerCase().includes(search.toLowerCase()) || c.authorUsername.toLowerCase().includes(search.toLowerCase())
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            "data-ocid": "admin.claims.search_input",
            placeholder: "Search by title or author\\u2026",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            className: "pl-8 h-8 text-sm"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
        (claims ?? []).length,
        " claims"
      ] })
    ] }),
    !actor || isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingRows, {}) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { label: "No claims found" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-md overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "grid gap-2 px-3 py-2 border-b border-border bg-muted/30",
          style: { gridTemplateColumns: "3fr 1fr 1fr 1fr auto" },
          children: ["Title", "Author", "Category", "Date", ""].map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "text-xs font-medium text-muted-foreground uppercase tracking-wide",
              children: col
            },
            col
          ))
        }
      ),
      filtered.map((claim, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          "data-ocid": `admin.claims.item.${idx + 1}`,
          className: "grid gap-2 px-3 py-2.5 border-b border-border/50 last:border-0 items-center hover:bg-muted/20 transition-colors",
          style: { gridTemplateColumns: "3fr 1fr 1fr 1fr auto" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: "text-sm font-medium truncate",
                title: claim.title,
                children: truncate(claim.title, 50)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground truncate", children: claim.authorUsername }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs w-fit", children: claim.category }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: formatDate(claim.timestamp) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                variant: "destructive",
                "data-ocid": `admin.claims.delete_button.${idx + 1}`,
                onClick: () => setPendingDelete(claim.id),
                className: "h-7 w-7 p-0",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
              }
            )
          ]
        },
        claim.id.toString()
      ))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDelete,
      {
        open: !!pendingDelete,
        description: "Delete this claim? All votes and evidence will also be deleted. This cannot be undone.",
        isPending: deleteMut.isPending,
        onConfirm: () => pendingDelete !== null && deleteMut.mutate(pendingDelete),
        onCancel: () => setPendingDelete(null)
      }
    )
  ] });
}
function EvidenceTab({ password }) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [selectedClaimId, setSelectedClaimId] = reactExports.useState("");
  const [pendingDelete, setPendingDelete] = reactExports.useState(null);
  const { data: claims, isLoading: claimsLoading } = useQuery({
    queryKey: ["admin", "claims", password],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllClaims(password);
    },
    enabled: !!actor,
    staleTime: 0,
    refetchOnMount: true
  });
  const { data: evidence, isLoading: evidenceLoading } = useQuery({
    queryKey: ["admin", "evidence", selectedClaimId],
    queryFn: async () => {
      if (!actor || !selectedClaimId) return [];
      return actor.getEvidenceForClaim(BigInt(selectedClaimId));
    },
    enabled: !!actor && !!selectedClaimId,
    staleTime: 0,
    refetchOnMount: true
  });
  const deleteMut = useMutation({
    mutationFn: async (id) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.adminDeleteEvidence(id, password);
      if ((result == null ? void 0 : result.__kind__) === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "evidence", selectedClaimId]
      });
      queryClient.invalidateQueries({ queryKey: ["evidence"] });
      ue.success("Evidence deleted");
      setPendingDelete(null);
    },
    onError: (e) => {
      ue.error(e.message ?? "Failed to delete evidence");
      setPendingDelete(null);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-medium uppercase tracking-wide", children: "Select a claim" }),
      !actor || claimsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-full" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedClaimId, onValueChange: setSelectedClaimId, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SelectTrigger,
          {
            "data-ocid": "admin.evidence.select",
            className: "text-sm",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choose a claim to view its evidence\\u2026" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: (claims ?? []).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id.toString(), children: truncate(c.title, 60) }, c.id.toString())) })
      ] })
    ] }),
    selectedClaimId && (evidenceLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingRows, {}) : !evidence || evidence.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { label: "No evidence for this claim" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-md overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "grid gap-2 px-3 py-2 border-b border-border bg-muted/30",
          style: { gridTemplateColumns: "3fr 1fr 1fr 1fr auto" },
          children: ["Text", "Author", "Type", "Date", ""].map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "text-xs font-medium text-muted-foreground uppercase tracking-wide",
              children: col
            },
            col
          ))
        }
      ),
      evidence.map((ev, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          "data-ocid": `admin.evidence.item.${idx + 1}`,
          className: "grid gap-2 px-3 py-2.5 border-b border-border/50 last:border-0 items-center hover:bg-muted/20 transition-colors",
          style: { gridTemplateColumns: "3fr 1fr 1fr 1fr auto" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm truncate", title: ev.text, children: truncate(ev.text, 50) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground truncate", children: ev.authorUsername }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Badge,
              {
                variant: "outline",
                className: `text-xs w-fit ${ev.evidenceType === "rebunked" ? "border-emerald-500/40 text-emerald-700" : ev.evidenceType === "debunked" ? "border-red-500/40 text-red-700" : "border-amber-500/40 text-amber-700"}`,
                children: ev.evidenceType
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: formatDate(ev.timestamp) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                variant: "destructive",
                "data-ocid": `admin.evidence.delete_button.${idx + 1}`,
                onClick: () => setPendingDelete(ev.id),
                className: "h-7 w-7 p-0",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
              }
            )
          ]
        },
        ev.id.toString()
      ))
    ] })),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDelete,
      {
        open: !!pendingDelete,
        description: "Delete this evidence? All replies will also be deleted. This cannot be undone.",
        isPending: deleteMut.isPending,
        onConfirm: () => pendingDelete !== null && deleteMut.mutate(pendingDelete),
        onCancel: () => setPendingDelete(null)
      }
    )
  ] });
}
function VotesTab({ password }) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [selectedClaimId, setSelectedClaimId] = reactExports.useState("");
  const [pendingDelete, setPendingDelete] = reactExports.useState(null);
  const { data: claims, isLoading: claimsLoading } = useQuery({
    queryKey: ["admin", "claims", password],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllClaims(password);
    },
    enabled: !!actor,
    staleTime: 0,
    refetchOnMount: true
  });
  const { data: votes, isLoading: votesLoading } = useQuery({
    queryKey: ["admin", "votes", selectedClaimId, password],
    queryFn: async () => {
      if (!actor || !selectedClaimId) return [];
      return actor.adminGetVotesForClaim(
        BigInt(selectedClaimId),
        password
      );
    },
    enabled: !!actor && !!selectedClaimId,
    staleTime: 0,
    refetchOnMount: true
  });
  const deleteMut = useMutation({
    mutationFn: async ({
      claimId,
      sessionId
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.adminDeleteVote(
        claimId,
        sessionId,
        password
      );
      if ((result == null ? void 0 : result.__kind__) === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "votes", selectedClaimId]
      });
      queryClient.invalidateQueries({ queryKey: ["votes"] });
      ue.success("Vote deleted");
      setPendingDelete(null);
    },
    onError: (e) => {
      ue.error(e.message ?? "Failed to delete vote");
      setPendingDelete(null);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-medium uppercase tracking-wide", children: "Select a claim" }),
      !actor || claimsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-full" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedClaimId, onValueChange: setSelectedClaimId, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-ocid": "admin.votes.select", className: "text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choose a claim to view its votes\\u2026" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: (claims ?? []).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id.toString(), children: truncate(c.title, 60) }, c.id.toString())) })
      ] })
    ] }),
    selectedClaimId && (votesLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingRows, {}) : !votes || votes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { label: "No votes for this claim" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-md overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "grid gap-2 px-3 py-2 border-b border-border bg-muted/30",
          style: { gridTemplateColumns: "3fr 1fr auto" },
          children: ["Session ID", "Verdict", ""].map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "text-xs font-medium text-muted-foreground uppercase tracking-wide",
              children: col
            },
            col
          ))
        }
      ),
      votes.map((vote, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          "data-ocid": `admin.votes.item.${idx + 1}`,
          className: "grid gap-2 px-3 py-2.5 border-b border-border/50 last:border-0 items-center hover:bg-muted/20 transition-colors",
          style: { gridTemplateColumns: "3fr 1fr auto" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono text-muted-foreground truncate", children: truncate(vote.sessionId, 40) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Badge,
              {
                variant: "outline",
                className: `text-xs w-fit ${vote.verdict === "true" ? "border-emerald-500/40 text-emerald-700" : vote.verdict === "false" ? "border-red-500/40 text-red-700" : "border-amber-500/40 text-amber-700"}`,
                children: vote.verdict
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                variant: "destructive",
                "data-ocid": `admin.votes.delete_button.${idx + 1}`,
                onClick: () => setPendingDelete({
                  claimId: BigInt(selectedClaimId),
                  sessionId: vote.sessionId
                }),
                className: "h-7 w-7 p-0",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
              }
            )
          ]
        },
        vote.sessionId
      ))
    ] })),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDelete,
      {
        open: !!pendingDelete,
        description: "Delete this vote? This cannot be undone.",
        isPending: deleteMut.isPending,
        onConfirm: () => pendingDelete && deleteMut.mutate(pendingDelete),
        onCancel: () => setPendingDelete(null)
      }
    )
  ] });
}
function CommentsTab({ password }) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [selectedSourceId, setSelectedSourceId] = reactExports.useState("");
  const [pendingDelete, setPendingDelete] = reactExports.useState(null);
  const { data: sources, isLoading: sourcesLoading } = useQuery({
    queryKey: ["admin", "sources", password],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllSources(password);
    },
    enabled: !!actor,
    staleTime: 0,
    refetchOnMount: true
  });
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["admin", "source-comments", selectedSourceId],
    queryFn: async () => {
      if (!actor || !selectedSourceId) return [];
      return actor.getSourceComments(BigInt(selectedSourceId));
    },
    enabled: !!actor && !!selectedSourceId,
    staleTime: 0,
    refetchOnMount: true
  });
  const deleteMut = useMutation({
    mutationFn: async (id) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.adminDeleteSourceComment(
        id,
        password
      );
      if ((result == null ? void 0 : result.__kind__) === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "source-comments", selectedSourceId]
      });
      queryClient.invalidateQueries({ queryKey: ["source-comments"] });
      ue.success("Comment deleted");
      setPendingDelete(null);
    },
    onError: (e) => {
      ue.error(e.message ?? "Failed to delete comment");
      setPendingDelete(null);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-medium uppercase tracking-wide", children: "Select a source" }),
      !actor || sourcesLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-full" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedSourceId, onValueChange: setSelectedSourceId, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SelectTrigger,
          {
            "data-ocid": "admin.comments.select",
            className: "text-sm",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choose a source to view its comments\\u2026" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: (sources ?? []).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.id.toString(), children: s.domain }, s.id.toString())) })
      ] })
    ] }),
    selectedSourceId && (commentsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingRows, {}) : !comments || comments.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { label: "No comments for this source" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-md overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "grid gap-2 px-3 py-2 border-b border-border bg-muted/30",
          style: { gridTemplateColumns: "3fr 1fr 1fr auto" },
          children: ["Text", "Author", "Date", ""].map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "text-xs font-medium text-muted-foreground uppercase tracking-wide",
              children: col
            },
            col
          ))
        }
      ),
      comments.map((comment, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          "data-ocid": `admin.comments.item.${idx + 1}`,
          className: "grid gap-2 px-3 py-2.5 border-b border-border/50 last:border-0 items-center hover:bg-muted/20 transition-colors",
          style: { gridTemplateColumns: "3fr 1fr 1fr auto" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm truncate", title: comment.text, children: truncate(comment.text, 50) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground truncate", children: comment.authorUsername }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: formatDate(comment.timestamp) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                variant: "destructive",
                "data-ocid": `admin.comments.delete_button.${idx + 1}`,
                onClick: () => setPendingDelete(comment.id),
                className: "h-7 w-7 p-0",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
              }
            )
          ]
        },
        comment.id.toString()
      ))
    ] })),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDelete,
      {
        open: !!pendingDelete,
        description: "Delete this comment? This cannot be undone.",
        isPending: deleteMut.isPending,
        onConfirm: () => pendingDelete !== null && deleteMut.mutate(pendingDelete),
        onCancel: () => setPendingDelete(null)
      }
    )
  ] });
}
function SourcesTab({ password }) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [search, setSearch] = reactExports.useState("");
  const [pendingDelete, setPendingDelete] = reactExports.useState(null);
  const { data: sources, isLoading } = useQuery({
    queryKey: ["admin", "sources", password],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllSources(password);
    },
    enabled: !!actor,
    staleTime: 0,
    refetchOnMount: true
  });
  const deleteMut = useMutation({
    mutationFn: async (id) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.adminRemoveSource(id, password);
      if ((result == null ? void 0 : result.__kind__) === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sources"] });
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      ue.success("Source deleted");
      setPendingDelete(null);
    },
    onError: (e) => {
      ue.error(e.message ?? "Failed to delete source");
      setPendingDelete(null);
    }
  });
  const filtered = (sources ?? []).filter(
    (s) => s.domain.toLowerCase().includes(search.toLowerCase())
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            "data-ocid": "admin.sources.search_input",
            placeholder: "Search by domain\\u2026",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            className: "pl-8 h-8 text-sm"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
        (sources ?? []).length,
        " sources"
      ] })
    ] }),
    !actor || isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingRows, {}) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { label: "No sources found" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-md overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "grid gap-2 px-3 py-2 border-b border-border bg-muted/30",
          style: { gridTemplateColumns: "2fr 1fr 1fr 1fr auto" },
          children: ["Domain", "Type", "Suggested By", "Date", ""].map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "text-xs font-medium text-muted-foreground uppercase tracking-wide",
              children: col
            },
            col
          ))
        }
      ),
      filtered.map((source, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          "data-ocid": `admin.sources.item.${idx + 1}`,
          className: "grid gap-2 px-3 py-2.5 border-b border-border/50 last:border-0 items-center hover:bg-muted/20 transition-colors",
          style: { gridTemplateColumns: "2fr 1fr 1fr 1fr auto" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium truncate", children: source.domain }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs w-fit", children: source.sourceType }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground truncate", children: source.suggestedByUsername }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: formatDate(source.timestamp) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                variant: "destructive",
                "data-ocid": `admin.sources.delete_button.${idx + 1}`,
                onClick: () => setPendingDelete(source.id),
                className: "h-7 w-7 p-0",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
              }
            )
          ]
        },
        source.id.toString()
      ))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDelete,
      {
        open: !!pendingDelete,
        description: "Delete this source? This cannot be undone.",
        isPending: deleteMut.isPending,
        onConfirm: () => pendingDelete !== null && deleteMut.mutate(pendingDelete),
        onCancel: () => setPendingDelete(null)
      }
    )
  ] });
}
function HiddenClaimsTab({ password }) {
  const { data: claims, isLoading, error } = useGetHiddenClaims(password);
  const restoreClaim = useRestoreClaim();
  const deleteClaim = useAdminDeleteClaim();
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingRows, {});
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "admin.hidden_claims.error_state",
        className: "flex flex-col items-center py-12 text-muted-foreground",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-8 w-8 mb-3 text-destructive opacity-60" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Failed to load hidden claims." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1 opacity-60", children: "Check your password." })
        ]
      }
    );
  }
  if (!claims || claims.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "admin.hidden_claims.empty_state",
        className: "flex flex-col items-center py-12 text-muted-foreground",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-8 w-8 mb-3 opacity-20" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No hidden claims." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1 opacity-60", children: "Claims with 10+ reports appear here." })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: claims.map((claim, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      "data-ocid": `admin.hidden_claims.item.${idx + 1}`,
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: idx * 0.04 },
      className: "flex items-start gap-3 p-4 bg-secondary border border-border rounded-md",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground leading-snug line-clamp-2 mb-1", children: claim.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs", children: claim.category }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: formatRelativeTime(claim.timestamp) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-destructive font-medium", children: "Hidden" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "outline",
              "data-ocid": `admin.hidden_claims.restore_button.${idx + 1}`,
              onClick: async () => {
                try {
                  await restoreClaim.mutateAsync({ id: claim.id, password });
                  ue.success("Claim restored");
                } catch {
                  ue.error("Failed to restore claim");
                }
              },
              disabled: restoreClaim.isPending || deleteClaim.isPending,
              className: "h-8 px-2.5 text-xs",
              children: [
                restoreClaim.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Undo2, { className: "h-3.5 w-3.5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 hidden sm:inline", children: "Restore" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "destructive",
              "data-ocid": `admin.hidden_claims.delete_button.${idx + 1}`,
              onClick: async () => {
                try {
                  await deleteClaim.mutateAsync({ id: claim.id, password });
                  ue.success("Claim permanently deleted");
                } catch {
                  ue.error("Failed to delete claim");
                }
              },
              disabled: restoreClaim.isPending || deleteClaim.isPending,
              className: "h-8 px-2.5 text-xs",
              children: [
                deleteClaim.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 hidden sm:inline", children: "Delete" })
              ]
            }
          )
        ] })
      ]
    },
    claim.id.toString()
  )) });
}
function HiddenEvidenceTab({ password }) {
  const {
    data: evidenceList,
    isLoading,
    error
  } = useGetHiddenEvidence(password);
  const restoreEvidence = useRestoreEvidence();
  const deleteEvidence = useAdminDeleteEvidence();
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingRows, {});
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "admin.hidden_evidence.error_state",
        className: "flex flex-col items-center py-12 text-muted-foreground",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-8 w-8 mb-3 text-destructive opacity-60" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Failed to load hidden evidence." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1 opacity-60", children: "Check your password." })
        ]
      }
    );
  }
  if (!evidenceList || evidenceList.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "admin.hidden_evidence.empty_state",
        className: "flex flex-col items-center py-12 text-muted-foreground",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-8 w-8 mb-3 opacity-20" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No hidden evidence." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1 opacity-60", children: "Evidence with 10+ reports appears here." })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: evidenceList.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      "data-ocid": `admin.hidden_evidence.item.${idx + 1}`,
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: idx * 0.04 },
      className: "flex items-start gap-3 p-4 bg-secondary border border-border rounded-md",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground leading-relaxed line-clamp-3 mb-1", children: item.text }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: formatRelativeTime(item.timestamp) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-destructive font-medium", children: "Hidden" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "outline",
              "data-ocid": `admin.hidden_evidence.restore_button.${idx + 1}`,
              onClick: async () => {
                try {
                  await restoreEvidence.mutateAsync({ id: item.id, password });
                  ue.success("Evidence restored");
                } catch {
                  ue.error("Failed to restore evidence");
                }
              },
              disabled: restoreEvidence.isPending || deleteEvidence.isPending,
              className: "h-8 px-2.5 text-xs",
              children: [
                restoreEvidence.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Undo2, { className: "h-3.5 w-3.5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 hidden sm:inline", children: "Restore" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "destructive",
              "data-ocid": `admin.hidden_evidence.delete_button.${idx + 1}`,
              onClick: async () => {
                try {
                  await deleteEvidence.mutateAsync({ id: item.id, password });
                  ue.success("Evidence permanently deleted");
                } catch {
                  ue.error("Failed to delete evidence");
                }
              },
              disabled: restoreEvidence.isPending || deleteEvidence.isPending,
              className: "h-8 px-2.5 text-xs",
              children: [
                deleteEvidence.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 hidden sm:inline", children: "Delete" })
              ]
            }
          )
        ] })
      ]
    },
    item.id.toString()
  )) });
}
function HiddenRepliesTab({ password }) {
  const { data: replyList, isLoading, error } = useGetHiddenReplies(password);
  const restoreReply = useRestoreReply();
  const deleteReply = useAdminDeleteReply();
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingRows, {});
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "admin.hidden_replies.error_state",
        className: "flex flex-col items-center py-12 text-muted-foreground",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-8 w-8 mb-3 text-destructive opacity-60" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Failed to load hidden replies." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1 opacity-60", children: "Check your password." })
        ]
      }
    );
  }
  if (!replyList || replyList.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "admin.hidden_replies.empty_state",
        className: "flex flex-col items-center py-12 text-muted-foreground",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-8 w-8 mb-3 opacity-20" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No hidden replies." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1 opacity-60", children: "Replies with 10+ reports appear here." })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: replyList.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      "data-ocid": `admin.hidden_replies.item.${idx + 1}`,
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: idx * 0.04 },
      className: "flex items-start gap-3 p-4 bg-secondary border border-border rounded-md",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground leading-relaxed line-clamp-3 mb-1", children: item.text }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono text-muted-foreground", children: item.authorUsername }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: formatRelativeTime(item.timestamp) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-destructive font-medium", children: "Hidden" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "outline",
              "data-ocid": `admin.hidden_replies.restore_button.${idx + 1}`,
              onClick: async () => {
                try {
                  await restoreReply.mutateAsync({ id: item.id, password });
                  ue.success("Reply restored");
                } catch {
                  ue.error("Failed to restore reply");
                }
              },
              disabled: restoreReply.isPending || deleteReply.isPending,
              className: "h-8 px-2.5 text-xs",
              children: [
                restoreReply.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Undo2, { className: "h-3.5 w-3.5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 hidden sm:inline", children: "Restore" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "destructive",
              "data-ocid": `admin.hidden_replies.delete_button.${idx + 1}`,
              onClick: async () => {
                try {
                  await deleteReply.mutateAsync({ id: item.id, password });
                  ue.success("Reply permanently deleted");
                } catch {
                  ue.error("Failed to delete reply");
                }
              },
              disabled: restoreReply.isPending || deleteReply.isPending,
              className: "h-8 px-2.5 text-xs",
              children: [
                deleteReply.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 hidden sm:inline", children: "Delete" })
              ]
            }
          )
        ] })
      ]
    },
    item.id.toString()
  )) });
}
function TrustedSourcesAdminTab({ password }) {
  const { data: sources, isLoading, error } = useTrustedSources();
  const adminRemove = useAdminRemoveSource();
  const adminOverride = useAdminOverrideSource();
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingRows, {});
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "admin.trusted_sources.error_state",
        className: "flex flex-col items-center py-12 text-muted-foreground",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-8 w-8 mb-3 text-destructive opacity-60" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Failed to load sources." })
        ]
      }
    );
  }
  if (!sources || sources.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "admin.trusted_sources.empty_state",
        className: "flex flex-col items-center py-12 text-muted-foreground",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-8 w-8 mb-3 opacity-20" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No sources submitted yet." })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: sources.map((source, idx) => {
    const upvotes = Number(source.upvotes);
    const downvotes = Number(source.downvotes);
    const netScore = upvotes - downvotes;
    const totalVotes = upvotes + downvotes;
    const upvotePct = totalVotes > 0 ? Math.round(upvotes / totalVotes * 100) : 0;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        "data-ocid": `admin.trusted_sources.item.${idx + 1}`,
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: idx * 0.04 },
        className: "flex items-start gap-3 p-4 bg-secondary border border-border rounded-md",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-foreground", children: source.domain }),
              source.isTrusted && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-2.5 w-2.5" }),
                "TRUSTED"
              ] }),
              source.adminOverride && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-violet-500/15 text-violet-600 border border-violet-500/30", children: "Admin Approved" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: cn(
                    "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] border",
                    getSourceTypeBadgeClasses(source.sourceType)
                  ),
                  children: getSourceTypeLabel(source.sourceType)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
                "up to +",
                getSourceTypeCeiling(source.sourceType),
                "% ceiling"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-mono text-muted-foreground", children: [
                netScore > 0 ? "+" : "",
                netScore,
                " votes (",
                totalVotes,
                " total, ",
                upvotePct,
                "% approval)"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "outline",
                "data-ocid": `admin.trusted_sources.edit_button.${idx + 1}`,
                onClick: async () => {
                  try {
                    await adminOverride.mutateAsync({
                      sourceId: source.id,
                      approved: !source.adminOverride,
                      note: "",
                      password
                    });
                    ue.success(
                      source.adminOverride ? "Override removed" : "Source force-approved"
                    );
                  } catch {
                    ue.error("Failed to update source");
                  }
                },
                disabled: adminOverride.isPending,
                className: cn(
                  "h-8 px-2.5 text-xs",
                  source.adminOverride ? "hover:border-amber-500/50 hover:text-amber-500" : "hover:border-emerald-500/50 hover:text-emerald-500"
                ),
                children: [
                  adminOverride.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : source.adminOverride ? /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 hidden sm:inline", children: source.adminOverride ? "Revoke" : "Force Approve" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "destructive",
                "data-ocid": `admin.trusted_sources.delete_button.${idx + 1}`,
                onClick: async () => {
                  try {
                    await adminRemove.mutateAsync({
                      sourceId: source.id,
                      password
                    });
                    ue.success("Source removed");
                  } catch {
                    ue.error("Failed to remove source");
                  }
                },
                disabled: adminRemove.isPending,
                className: "h-8 px-2.5 text-xs",
                children: [
                  adminRemove.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 hidden sm:inline", children: "Remove" })
                ]
              }
            )
          ] })
        ]
      },
      source.id.toString()
    );
  }) });
}
function PasswordGate({ onAuth }) {
  const [input, setInput] = reactExports.useState("");
  const [error, setError] = reactExports.useState(false);
  function tryAuth() {
    if (input === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_SESSION_KEY, "1");
      onAuth(input);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2e3);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center flex-1 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-5 w-5 text-destructive" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-bold", children: "Admin Access" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Enter your admin password to continue" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          "data-ocid": "admin.login.input",
          type: "password",
          placeholder: "Admin password",
          value: input,
          onChange: (e) => setInput(e.target.value),
          onKeyDown: (e) => e.key === "Enter" && tryAuth(),
          className: error ? "border-destructive focus-visible:ring-destructive" : ""
        }
      ),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "p",
        {
          "data-ocid": "admin.login.error_state",
          className: "text-xs text-destructive",
          children: "Incorrect password"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          "data-ocid": "admin.login.submit_button",
          onClick: tryAuth,
          className: "w-full",
          children: "Unlock Dashboard"
        }
      )
    ] })
  ] }) });
}
function AdminPage({ onClose }) {
  const storedAuth = localStorage.getItem(ADMIN_SESSION_KEY);
  const [password, setPassword] = reactExports.useState(
    storedAuth ? ADMIN_PASSWORD : null
  );
  const handleAuth = reactExports.useCallback((pw) => {
    setPassword(pw);
  }, []);
  function logout() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setPassword(null);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "border-b border-border mb-6 pb-3 flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            "data-ocid": "admin.back_button",
            onClick: onClose,
            className: "flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-body", children: "Back" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-4 bg-border" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded bg-destructive/10 border border-destructive/20 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3.5 w-3.5 text-destructive" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-base font-bold text-foreground", children: "Admin Dashboard" })
        ] })
      ] }),
      password && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          "data-ocid": "admin.logout_button",
          onClick: logout,
          className: "h-8 gap-1.5 text-xs text-muted-foreground",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-3.5 w-3.5" }),
            "Logout"
          ]
        }
      )
    ] }) }),
    !password ? /* @__PURE__ */ jsxRuntimeExports.jsx(PasswordGate, { onAuth: handleAuth }) : /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 w-full py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "users", className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex-wrap h-auto gap-1 bg-muted/50 p-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            value: "users",
            "data-ocid": "admin.users.tab",
            className: "gap-1.5 text-xs",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5" }),
              "Users"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            value: "claims",
            "data-ocid": "admin.claims.tab",
            className: "gap-1.5 text-xs",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5" }),
              "Claims"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            value: "evidence",
            "data-ocid": "admin.evidence.tab",
            className: "gap-1.5 text-xs",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { className: "h-3.5 w-3.5" }),
              "Evidence"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            value: "votes",
            "data-ocid": "admin.votes.tab",
            className: "gap-1.5 text-xs",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "h-3.5 w-3.5" }),
              "Votes"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            value: "comments",
            "data-ocid": "admin.comments.tab",
            className: "gap-1.5 text-xs",
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
            "data-ocid": "admin.sources.tab",
            className: "gap-1.5 text-xs",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-3.5 w-3.5" }),
              "Sources"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            value: "hidden-claims",
            "data-ocid": "admin.hidden_claims.tab",
            className: "gap-1.5 text-xs",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-3.5 w-3.5" }),
              "Hidden Claims"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            value: "hidden-evidence",
            "data-ocid": "admin.hidden_evidence.tab",
            className: "gap-1.5 text-xs",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-3.5 w-3.5" }),
              "Hidden Evidence"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            value: "hidden-replies",
            "data-ocid": "admin.hidden_replies.tab",
            className: "gap-1.5 text-xs",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-3.5 w-3.5" }),
              "Hidden Replies"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            value: "trusted-sources",
            "data-ocid": "admin.trusted_sources.tab",
            className: "gap-1.5 text-xs",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3.5 w-3.5" }),
              "Trusted Sources"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "users", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UsersTab, { password }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "claims", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClaimsTab, { password }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "evidence", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EvidenceTab, { password }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "votes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(VotesTab, { password }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "comments", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CommentsTab, { password }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "sources", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SourcesTab, { password }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "hidden-claims", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HiddenClaimsTab, { password }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "hidden-evidence", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HiddenEvidenceTab, { password }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "hidden-replies", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HiddenRepliesTab, { password }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "trusted-sources", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrustedSourcesAdminTab, { password }) })
    ] }) })
  ] });
}
export {
  AdminPage
};
