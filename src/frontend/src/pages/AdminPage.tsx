import type {
  Claim,
  Evidence,
  TrustedSource,
  UserProfile,
  Vote,
} from "@/backend.d";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActor } from "@/hooks/useActor";
import {
  type Reply,
  type TrustedSourceInfo,
  useAdminDeleteClaim,
  useAdminDeleteEvidence,
  useAdminDeleteReply,
  useAdminOverrideSource,
  useAdminRemoveSource,
  useGetHiddenClaims,
  useGetHiddenEvidence,
  useGetHiddenReplies,
  useRestoreClaim,
  useRestoreEvidence,
  useRestoreReply,
  useTrustedSources,
} from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import {
  getSourceTypeBadgeClasses,
  getSourceTypeCeiling,
  getSourceTypeLabel,
} from "@/pages/TrustedSourcesPage";
import { formatRelativeTime } from "@/utils/time";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CheckSquare,
  Database,
  EyeOff,
  FileText,
  Globe,
  Loader2,
  Lock,
  LogOut,
  MessageSquare,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  Undo2,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const ADMIN_PASSWORD = "lunasimbaliamsammy123!";
const ADMIN_SESSION_KEY = "rebunked_admin_authed";

function formatDate(ts: bigint): string {
  return new Date(Number(ts) / 1e6).toLocaleDateString();
}

function truncate(text: string, len = 60): string {
  return text.length > len ? `${text.slice(0, len)}\u2026` : text;
}

// ── Confirmation Dialog ───────────────────────────────────────────────────────

interface ConfirmDeleteProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isPending?: boolean;
  description?: string;
}

function ConfirmDelete({
  open,
  onConfirm,
  onCancel,
  isPending,
  description,
}: ConfirmDeleteProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent data-ocid="admin.dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {description ??
              "This action cannot be undone. The data will be permanently deleted."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            data-ocid="admin.cancel_button"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            data-ocid="admin.confirm_button"
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── Table helpers ─────────────────────────────────────────────────────────────

function EmptyState({ label }: { label: string }) {
  return (
    <div
      data-ocid="admin.empty_state"
      className="flex flex-col items-center py-16 text-muted-foreground"
    >
      <Database className="h-8 w-8 mb-3 opacity-20" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

function LoadingRows() {
  return (
    <div data-ocid="admin.loading_state" className="space-y-2 p-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-10 w-full rounded" />
      ))}
    </div>
  );
}

// ── Users Tab ─────────────────────────────────────────────────────────────────

function UsersTab({ password }: { password: string }) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery<UserProfile[]>({
    queryKey: ["admin", "users", password],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).adminGetAllUsers(password);
    },
    enabled: !!actor,
    staleTime: 0,
    refetchOnMount: true,
  });

  const deleteMut = useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor as any).adminDeleteUser(username, password);
      if (result?.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      toast.success("User deleted");
      setPendingDelete(null);
    },
    onError: (e: Error) => {
      toast.error(e.message ?? "Failed to delete user");
      setPendingDelete(null);
    },
  });

  const filtered = (users ?? []).filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            data-ocid="admin.users.search_input"
            placeholder="Search by username\u2026"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {(users ?? []).length} users
        </span>
      </div>

      {!actor || isLoading ? (
        <LoadingRows />
      ) : filtered.length === 0 ? (
        <EmptyState label="No users found" />
      ) : (
        <div className="border border-border rounded-md overflow-hidden">
          <div
            className="grid gap-2 px-3 py-2 border-b border-border bg-muted/30"
            style={{ gridTemplateColumns: "2fr 1fr 1fr 2fr auto" }}
          >
            {["Username", "Joined", "Last Active", "Bio", ""].map((col) => (
              <span
                key={col}
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
              >
                {col}
              </span>
            ))}
          </div>
          {filtered.map((user, idx) => (
            <div
              key={user.username}
              data-ocid={`admin.users.item.${idx + 1}`}
              className="grid gap-2 px-3 py-2.5 border-b border-border/50 last:border-0 items-center hover:bg-muted/20 transition-colors"
              style={{ gridTemplateColumns: "2fr 1fr 1fr 2fr auto" }}
            >
              <span className="text-sm font-medium truncate">
                {user.username}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(user.joinDate)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(user.lastActive)}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {truncate(user.bio || "\u2014", 40)}
              </span>
              <Button
                size="sm"
                variant="destructive"
                data-ocid={`admin.users.delete_button.${idx + 1}`}
                onClick={() => setPendingDelete(user.username)}
                className="h-7 w-7 p-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDelete
        open={!!pendingDelete}
        description={`Delete user "${pendingDelete}"? This will also delete all their claims, evidence, votes, and comments. This cannot be undone.`}
        isPending={deleteMut.isPending}
        onConfirm={() => pendingDelete && deleteMut.mutate(pendingDelete)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

// ── Claims Tab ────────────────────────────────────────────────────────────────

function ClaimsTab({ password }: { password: string }) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<bigint | null>(null);

  const { data: claims, isLoading } = useQuery<Claim[]>({
    queryKey: ["admin", "claims", password],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).adminGetAllClaims(password);
    },
    enabled: !!actor,
    staleTime: 0,
    refetchOnMount: true,
  });

  const deleteMut = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor as any).adminDeleteClaim(id, password);
      if (result?.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "claims"] });
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      toast.success("Claim deleted");
      setPendingDelete(null);
    },
    onError: (e: Error) => {
      toast.error(e.message ?? "Failed to delete claim");
      setPendingDelete(null);
    },
  });

  const filtered = (claims ?? []).filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.authorUsername.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            data-ocid="admin.claims.search_input"
            placeholder="Search by title or author\u2026"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {(claims ?? []).length} claims
        </span>
      </div>

      {!actor || isLoading ? (
        <LoadingRows />
      ) : filtered.length === 0 ? (
        <EmptyState label="No claims found" />
      ) : (
        <div className="border border-border rounded-md overflow-hidden">
          <div
            className="grid gap-2 px-3 py-2 border-b border-border bg-muted/30"
            style={{ gridTemplateColumns: "3fr 1fr 1fr 1fr auto" }}
          >
            {["Title", "Author", "Category", "Date", ""].map((col) => (
              <span
                key={col}
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
              >
                {col}
              </span>
            ))}
          </div>
          {filtered.map((claim, idx) => (
            <div
              key={claim.id.toString()}
              data-ocid={`admin.claims.item.${idx + 1}`}
              className="grid gap-2 px-3 py-2.5 border-b border-border/50 last:border-0 items-center hover:bg-muted/20 transition-colors"
              style={{ gridTemplateColumns: "3fr 1fr 1fr 1fr auto" }}
            >
              <span
                className="text-sm font-medium truncate"
                title={claim.title}
              >
                {truncate(claim.title, 50)}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {claim.authorUsername}
              </span>
              <Badge variant="secondary" className="text-xs w-fit">
                {claim.category}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDate(claim.timestamp)}
              </span>
              <Button
                size="sm"
                variant="destructive"
                data-ocid={`admin.claims.delete_button.${idx + 1}`}
                onClick={() => setPendingDelete(claim.id)}
                className="h-7 w-7 p-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDelete
        open={!!pendingDelete}
        description="Delete this claim? All votes and evidence will also be deleted. This cannot be undone."
        isPending={deleteMut.isPending}
        onConfirm={() =>
          pendingDelete !== null && deleteMut.mutate(pendingDelete)
        }
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

// ── Evidence Tab ──────────────────────────────────────────────────────────────

function EvidenceTab({ password }: { password: string }) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [selectedClaimId, setSelectedClaimId] = useState<string>("");
  const [pendingDelete, setPendingDelete] = useState<bigint | null>(null);

  const { data: claims, isLoading: claimsLoading } = useQuery<Claim[]>({
    queryKey: ["admin", "claims", password],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).adminGetAllClaims(password);
    },
    enabled: !!actor,
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: evidence, isLoading: evidenceLoading } = useQuery<Evidence[]>({
    queryKey: ["admin", "evidence", selectedClaimId],
    queryFn: async () => {
      if (!actor || !selectedClaimId) return [];
      return actor.getEvidenceForClaim(BigInt(selectedClaimId));
    },
    enabled: !!actor && !!selectedClaimId,
    staleTime: 0,
    refetchOnMount: true,
  });

  const deleteMut = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor as any).adminDeleteEvidence(id, password);
      if (result?.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "evidence", selectedClaimId],
      });
      queryClient.invalidateQueries({ queryKey: ["evidence"] });
      toast.success("Evidence deleted");
      setPendingDelete(null);
    },
    onError: (e: Error) => {
      toast.error(e.message ?? "Failed to delete evidence");
      setPendingDelete(null);
    },
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          Select a claim
        </span>
        {!actor || claimsLoading ? (
          <Skeleton className="h-9 w-full" />
        ) : (
          <Select value={selectedClaimId} onValueChange={setSelectedClaimId}>
            <SelectTrigger
              data-ocid="admin.evidence.select"
              className="text-sm"
            >
              <SelectValue placeholder="Choose a claim to view its evidence\u2026" />
            </SelectTrigger>
            <SelectContent>
              {(claims ?? []).map((c) => (
                <SelectItem key={c.id.toString()} value={c.id.toString()}>
                  {truncate(c.title, 60)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedClaimId &&
        (evidenceLoading ? (
          <LoadingRows />
        ) : !evidence || evidence.length === 0 ? (
          <EmptyState label="No evidence for this claim" />
        ) : (
          <div className="border border-border rounded-md overflow-hidden">
            <div
              className="grid gap-2 px-3 py-2 border-b border-border bg-muted/30"
              style={{ gridTemplateColumns: "3fr 1fr 1fr 1fr auto" }}
            >
              {["Text", "Author", "Type", "Date", ""].map((col) => (
                <span
                  key={col}
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  {col}
                </span>
              ))}
            </div>
            {evidence.map((ev, idx) => (
              <div
                key={ev.id.toString()}
                data-ocid={`admin.evidence.item.${idx + 1}`}
                className="grid gap-2 px-3 py-2.5 border-b border-border/50 last:border-0 items-center hover:bg-muted/20 transition-colors"
                style={{ gridTemplateColumns: "3fr 1fr 1fr 1fr auto" }}
              >
                <span className="text-sm truncate" title={ev.text}>
                  {truncate(ev.text, 50)}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {ev.authorUsername}
                </span>
                <Badge
                  variant="outline"
                  className={`text-xs w-fit ${
                    ev.evidenceType === "rebunked"
                      ? "border-emerald-500/40 text-emerald-700"
                      : ev.evidenceType === "debunked"
                        ? "border-red-500/40 text-red-700"
                        : "border-amber-500/40 text-amber-700"
                  }`}
                >
                  {ev.evidenceType}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(ev.timestamp)}
                </span>
                <Button
                  size="sm"
                  variant="destructive"
                  data-ocid={`admin.evidence.delete_button.${idx + 1}`}
                  onClick={() => setPendingDelete(ev.id)}
                  className="h-7 w-7 p-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        ))}

      <ConfirmDelete
        open={!!pendingDelete}
        description="Delete this evidence? All replies will also be deleted. This cannot be undone."
        isPending={deleteMut.isPending}
        onConfirm={() =>
          pendingDelete !== null && deleteMut.mutate(pendingDelete)
        }
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

// ── Votes Tab ─────────────────────────────────────────────────────────────────

function VotesTab({ password }: { password: string }) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [selectedClaimId, setSelectedClaimId] = useState<string>("");
  const [pendingDelete, setPendingDelete] = useState<{
    claimId: bigint;
    sessionId: string;
  } | null>(null);

  const { data: claims, isLoading: claimsLoading } = useQuery<Claim[]>({
    queryKey: ["admin", "claims", password],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).adminGetAllClaims(password);
    },
    enabled: !!actor,
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: votes, isLoading: votesLoading } = useQuery<Vote[]>({
    queryKey: ["admin", "votes", selectedClaimId, password],
    queryFn: async () => {
      if (!actor || !selectedClaimId) return [];
      return (actor as any).adminGetVotesForClaim(
        BigInt(selectedClaimId),
        password,
      );
    },
    enabled: !!actor && !!selectedClaimId,
    staleTime: 0,
    refetchOnMount: true,
  });

  const deleteMut = useMutation({
    mutationFn: async ({
      claimId,
      sessionId,
    }: { claimId: bigint; sessionId: string }) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor as any).adminDeleteVote(
        claimId,
        sessionId,
        password,
      );
      if (result?.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "votes", selectedClaimId],
      });
      queryClient.invalidateQueries({ queryKey: ["votes"] });
      toast.success("Vote deleted");
      setPendingDelete(null);
    },
    onError: (e: Error) => {
      toast.error(e.message ?? "Failed to delete vote");
      setPendingDelete(null);
    },
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          Select a claim
        </span>
        {!actor || claimsLoading ? (
          <Skeleton className="h-9 w-full" />
        ) : (
          <Select value={selectedClaimId} onValueChange={setSelectedClaimId}>
            <SelectTrigger data-ocid="admin.votes.select" className="text-sm">
              <SelectValue placeholder="Choose a claim to view its votes\u2026" />
            </SelectTrigger>
            <SelectContent>
              {(claims ?? []).map((c) => (
                <SelectItem key={c.id.toString()} value={c.id.toString()}>
                  {truncate(c.title, 60)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedClaimId &&
        (votesLoading ? (
          <LoadingRows />
        ) : !votes || votes.length === 0 ? (
          <EmptyState label="No votes for this claim" />
        ) : (
          <div className="border border-border rounded-md overflow-hidden">
            <div
              className="grid gap-2 px-3 py-2 border-b border-border bg-muted/30"
              style={{ gridTemplateColumns: "3fr 1fr auto" }}
            >
              {["Session ID", "Verdict", ""].map((col) => (
                <span
                  key={col}
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  {col}
                </span>
              ))}
            </div>
            {votes.map((vote, idx) => (
              <div
                key={vote.sessionId}
                data-ocid={`admin.votes.item.${idx + 1}`}
                className="grid gap-2 px-3 py-2.5 border-b border-border/50 last:border-0 items-center hover:bg-muted/20 transition-colors"
                style={{ gridTemplateColumns: "3fr 1fr auto" }}
              >
                <span className="text-xs font-mono text-muted-foreground truncate">
                  {truncate(vote.sessionId, 40)}
                </span>
                <Badge
                  variant="outline"
                  className={`text-xs w-fit ${
                    vote.verdict === "true"
                      ? "border-emerald-500/40 text-emerald-700"
                      : vote.verdict === "false"
                        ? "border-red-500/40 text-red-700"
                        : "border-amber-500/40 text-amber-700"
                  }`}
                >
                  {vote.verdict}
                </Badge>
                <Button
                  size="sm"
                  variant="destructive"
                  data-ocid={`admin.votes.delete_button.${idx + 1}`}
                  onClick={() =>
                    setPendingDelete({
                      claimId: BigInt(selectedClaimId),
                      sessionId: vote.sessionId,
                    })
                  }
                  className="h-7 w-7 p-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        ))}

      <ConfirmDelete
        open={!!pendingDelete}
        description="Delete this vote? This cannot be undone."
        isPending={deleteMut.isPending}
        onConfirm={() => pendingDelete && deleteMut.mutate(pendingDelete)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

// ── Comments Tab ──────────────────────────────────────────────────────────────

interface SourceComment {
  id: bigint;
  sourceId: bigint;
  authorUsername: string;
  text: string;
  timestamp: bigint;
}

function CommentsTab({ password }: { password: string }) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [selectedSourceId, setSelectedSourceId] = useState<string>("");
  const [pendingDelete, setPendingDelete] = useState<bigint | null>(null);

  const { data: sources, isLoading: sourcesLoading } = useQuery<
    TrustedSource[]
  >({
    queryKey: ["admin", "sources", password],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).adminGetAllSources(password);
    },
    enabled: !!actor,
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: comments, isLoading: commentsLoading } = useQuery<
    SourceComment[]
  >({
    queryKey: ["admin", "source-comments", selectedSourceId],
    queryFn: async () => {
      if (!actor || !selectedSourceId) return [];
      return actor.getSourceComments(BigInt(selectedSourceId));
    },
    enabled: !!actor && !!selectedSourceId,
    staleTime: 0,
    refetchOnMount: true,
  });

  const deleteMut = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor as any).adminDeleteSourceComment(
        id,
        password,
      );
      if (result?.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "source-comments", selectedSourceId],
      });
      queryClient.invalidateQueries({ queryKey: ["source-comments"] });
      toast.success("Comment deleted");
      setPendingDelete(null);
    },
    onError: (e: Error) => {
      toast.error(e.message ?? "Failed to delete comment");
      setPendingDelete(null);
    },
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          Select a source
        </span>
        {!actor || sourcesLoading ? (
          <Skeleton className="h-9 w-full" />
        ) : (
          <Select value={selectedSourceId} onValueChange={setSelectedSourceId}>
            <SelectTrigger
              data-ocid="admin.comments.select"
              className="text-sm"
            >
              <SelectValue placeholder="Choose a source to view its comments\u2026" />
            </SelectTrigger>
            <SelectContent>
              {(sources ?? []).map((s) => (
                <SelectItem key={s.id.toString()} value={s.id.toString()}>
                  {s.domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedSourceId &&
        (commentsLoading ? (
          <LoadingRows />
        ) : !comments || comments.length === 0 ? (
          <EmptyState label="No comments for this source" />
        ) : (
          <div className="border border-border rounded-md overflow-hidden">
            <div
              className="grid gap-2 px-3 py-2 border-b border-border bg-muted/30"
              style={{ gridTemplateColumns: "3fr 1fr 1fr auto" }}
            >
              {["Text", "Author", "Date", ""].map((col) => (
                <span
                  key={col}
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  {col}
                </span>
              ))}
            </div>
            {comments.map((comment, idx) => (
              <div
                key={comment.id.toString()}
                data-ocid={`admin.comments.item.${idx + 1}`}
                className="grid gap-2 px-3 py-2.5 border-b border-border/50 last:border-0 items-center hover:bg-muted/20 transition-colors"
                style={{ gridTemplateColumns: "3fr 1fr 1fr auto" }}
              >
                <span className="text-sm truncate" title={comment.text}>
                  {truncate(comment.text, 50)}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {comment.authorUsername}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(comment.timestamp)}
                </span>
                <Button
                  size="sm"
                  variant="destructive"
                  data-ocid={`admin.comments.delete_button.${idx + 1}`}
                  onClick={() => setPendingDelete(comment.id)}
                  className="h-7 w-7 p-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        ))}

      <ConfirmDelete
        open={!!pendingDelete}
        description="Delete this comment? This cannot be undone."
        isPending={deleteMut.isPending}
        onConfirm={() =>
          pendingDelete !== null && deleteMut.mutate(pendingDelete)
        }
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

// ── Sources Tab ───────────────────────────────────────────────────────────────

function SourcesTab({ password }: { password: string }) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<bigint | null>(null);

  const { data: sources, isLoading } = useQuery<TrustedSource[]>({
    queryKey: ["admin", "sources", password],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).adminGetAllSources(password);
    },
    enabled: !!actor,
    staleTime: 0,
    refetchOnMount: true,
  });

  const deleteMut = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor as any).adminRemoveSource(id, password);
      if (result?.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sources"] });
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      toast.success("Source deleted");
      setPendingDelete(null);
    },
    onError: (e: Error) => {
      toast.error(e.message ?? "Failed to delete source");
      setPendingDelete(null);
    },
  });

  const filtered = (sources ?? []).filter((s) =>
    s.domain.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            data-ocid="admin.sources.search_input"
            placeholder="Search by domain\u2026"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {(sources ?? []).length} sources
        </span>
      </div>

      {!actor || isLoading ? (
        <LoadingRows />
      ) : filtered.length === 0 ? (
        <EmptyState label="No sources found" />
      ) : (
        <div className="border border-border rounded-md overflow-hidden">
          <div
            className="grid gap-2 px-3 py-2 border-b border-border bg-muted/30"
            style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr auto" }}
          >
            {["Domain", "Type", "Suggested By", "Date", ""].map((col) => (
              <span
                key={col}
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
              >
                {col}
              </span>
            ))}
          </div>
          {filtered.map((source, idx) => (
            <div
              key={source.id.toString()}
              data-ocid={`admin.sources.item.${idx + 1}`}
              className="grid gap-2 px-3 py-2.5 border-b border-border/50 last:border-0 items-center hover:bg-muted/20 transition-colors"
              style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr auto" }}
            >
              <span className="text-sm font-medium truncate">
                {source.domain}
              </span>
              <Badge variant="secondary" className="text-xs w-fit">
                {source.sourceType}
              </Badge>
              <span className="text-xs text-muted-foreground truncate">
                {source.suggestedByUsername}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(source.timestamp)}
              </span>
              <Button
                size="sm"
                variant="destructive"
                data-ocid={`admin.sources.delete_button.${idx + 1}`}
                onClick={() => setPendingDelete(source.id)}
                className="h-7 w-7 p-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDelete
        open={!!pendingDelete}
        description="Delete this source? This cannot be undone."
        isPending={deleteMut.isPending}
        onConfirm={() =>
          pendingDelete !== null && deleteMut.mutate(pendingDelete)
        }
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

// ── Hidden Claims Tab (from AdminPanel) ───────────────────────────────────────

function HiddenClaimsTab({ password }: { password: string }) {
  const { data: claims, isLoading, error } = useGetHiddenClaims(password);
  const restoreClaim = useRestoreClaim();
  const deleteClaim = useAdminDeleteClaim();

  if (isLoading) return <LoadingRows />;

  if (error) {
    return (
      <div
        data-ocid="admin.hidden_claims.error_state"
        className="flex flex-col items-center py-12 text-muted-foreground"
      >
        <AlertTriangle className="h-8 w-8 mb-3 text-destructive opacity-60" />
        <p className="text-sm">Failed to load hidden claims.</p>
        <p className="text-xs mt-1 opacity-60">Check your password.</p>
      </div>
    );
  }

  if (!claims || claims.length === 0) {
    return (
      <div
        data-ocid="admin.hidden_claims.empty_state"
        className="flex flex-col items-center py-12 text-muted-foreground"
      >
        <Shield className="h-8 w-8 mb-3 opacity-20" />
        <p className="text-sm">No hidden claims.</p>
        <p className="text-xs mt-1 opacity-60">
          Claims with 10+ reports appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {(claims as Claim[]).map((claim, idx) => (
        <motion.div
          key={claim.id.toString()}
          data-ocid={`admin.hidden_claims.item.${idx + 1}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.04 }}
          className="flex items-start gap-3 p-4 bg-secondary border border-border rounded-md"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2 mb-1">
              {claim.title}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {claim.category}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(claim.timestamp)}
              </span>
              <span className="text-xs text-destructive font-medium">
                Hidden
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              data-ocid={`admin.hidden_claims.restore_button.${idx + 1}`}
              onClick={async () => {
                try {
                  await restoreClaim.mutateAsync({ id: claim.id, password });
                  toast.success("Claim restored");
                } catch {
                  toast.error("Failed to restore claim");
                }
              }}
              disabled={restoreClaim.isPending || deleteClaim.isPending}
              className="h-8 px-2.5 text-xs"
            >
              {restoreClaim.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Undo2 className="h-3.5 w-3.5" />
              )}
              <span className="ml-1.5 hidden sm:inline">Restore</span>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              data-ocid={`admin.hidden_claims.delete_button.${idx + 1}`}
              onClick={async () => {
                try {
                  await deleteClaim.mutateAsync({ id: claim.id, password });
                  toast.success("Claim permanently deleted");
                } catch {
                  toast.error("Failed to delete claim");
                }
              }}
              disabled={restoreClaim.isPending || deleteClaim.isPending}
              className="h-8 px-2.5 text-xs"
            >
              {deleteClaim.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              <span className="ml-1.5 hidden sm:inline">Delete</span>
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Hidden Evidence Tab (from AdminPanel) ─────────────────────────────────────

function HiddenEvidenceTab({ password }: { password: string }) {
  const {
    data: evidenceList,
    isLoading,
    error,
  } = useGetHiddenEvidence(password);
  const restoreEvidence = useRestoreEvidence();
  const deleteEvidence = useAdminDeleteEvidence();

  if (isLoading) return <LoadingRows />;

  if (error) {
    return (
      <div
        data-ocid="admin.hidden_evidence.error_state"
        className="flex flex-col items-center py-12 text-muted-foreground"
      >
        <AlertTriangle className="h-8 w-8 mb-3 text-destructive opacity-60" />
        <p className="text-sm">Failed to load hidden evidence.</p>
        <p className="text-xs mt-1 opacity-60">Check your password.</p>
      </div>
    );
  }

  if (!evidenceList || evidenceList.length === 0) {
    return (
      <div
        data-ocid="admin.hidden_evidence.empty_state"
        className="flex flex-col items-center py-12 text-muted-foreground"
      >
        <Shield className="h-8 w-8 mb-3 opacity-20" />
        <p className="text-sm">No hidden evidence.</p>
        <p className="text-xs mt-1 opacity-60">
          Evidence with 10+ reports appears here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {(evidenceList as Evidence[]).map((item, idx) => (
        <motion.div
          key={item.id.toString()}
          data-ocid={`admin.hidden_evidence.item.${idx + 1}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.04 }}
          className="flex items-start gap-3 p-4 bg-secondary border border-border rounded-md"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground leading-relaxed line-clamp-3 mb-1">
              {item.text}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(item.timestamp)}
              </span>
              <span className="text-xs text-destructive font-medium">
                Hidden
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              data-ocid={`admin.hidden_evidence.restore_button.${idx + 1}`}
              onClick={async () => {
                try {
                  await restoreEvidence.mutateAsync({ id: item.id, password });
                  toast.success("Evidence restored");
                } catch {
                  toast.error("Failed to restore evidence");
                }
              }}
              disabled={restoreEvidence.isPending || deleteEvidence.isPending}
              className="h-8 px-2.5 text-xs"
            >
              {restoreEvidence.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Undo2 className="h-3.5 w-3.5" />
              )}
              <span className="ml-1.5 hidden sm:inline">Restore</span>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              data-ocid={`admin.hidden_evidence.delete_button.${idx + 1}`}
              onClick={async () => {
                try {
                  await deleteEvidence.mutateAsync({ id: item.id, password });
                  toast.success("Evidence permanently deleted");
                } catch {
                  toast.error("Failed to delete evidence");
                }
              }}
              disabled={restoreEvidence.isPending || deleteEvidence.isPending}
              className="h-8 px-2.5 text-xs"
            >
              {deleteEvidence.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              <span className="ml-1.5 hidden sm:inline">Delete</span>
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Hidden Replies Tab (from AdminPanel) ──────────────────────────────────────

function HiddenRepliesTab({ password }: { password: string }) {
  const { data: replyList, isLoading, error } = useGetHiddenReplies(password);
  const restoreReply = useRestoreReply();
  const deleteReply = useAdminDeleteReply();

  if (isLoading) return <LoadingRows />;

  if (error) {
    return (
      <div
        data-ocid="admin.hidden_replies.error_state"
        className="flex flex-col items-center py-12 text-muted-foreground"
      >
        <AlertTriangle className="h-8 w-8 mb-3 text-destructive opacity-60" />
        <p className="text-sm">Failed to load hidden replies.</p>
        <p className="text-xs mt-1 opacity-60">Check your password.</p>
      </div>
    );
  }

  if (!replyList || replyList.length === 0) {
    return (
      <div
        data-ocid="admin.hidden_replies.empty_state"
        className="flex flex-col items-center py-12 text-muted-foreground"
      >
        <Shield className="h-8 w-8 mb-3 opacity-20" />
        <p className="text-sm">No hidden replies.</p>
        <p className="text-xs mt-1 opacity-60">
          Replies with 10+ reports appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {(replyList as Reply[]).map((item, idx) => (
        <motion.div
          key={item.id.toString()}
          data-ocid={`admin.hidden_replies.item.${idx + 1}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.04 }}
          className="flex items-start gap-3 p-4 bg-secondary border border-border rounded-md"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground leading-relaxed line-clamp-3 mb-1">
              {item.text}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-muted-foreground">
                {item.authorUsername}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(item.timestamp)}
              </span>
              <span className="text-xs text-destructive font-medium">
                Hidden
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              data-ocid={`admin.hidden_replies.restore_button.${idx + 1}`}
              onClick={async () => {
                try {
                  await restoreReply.mutateAsync({ id: item.id, password });
                  toast.success("Reply restored");
                } catch {
                  toast.error("Failed to restore reply");
                }
              }}
              disabled={restoreReply.isPending || deleteReply.isPending}
              className="h-8 px-2.5 text-xs"
            >
              {restoreReply.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Undo2 className="h-3.5 w-3.5" />
              )}
              <span className="ml-1.5 hidden sm:inline">Restore</span>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              data-ocid={`admin.hidden_replies.delete_button.${idx + 1}`}
              onClick={async () => {
                try {
                  await deleteReply.mutateAsync({ id: item.id, password });
                  toast.success("Reply permanently deleted");
                } catch {
                  toast.error("Failed to delete reply");
                }
              }}
              disabled={restoreReply.isPending || deleteReply.isPending}
              className="h-8 px-2.5 text-xs"
            >
              {deleteReply.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              <span className="ml-1.5 hidden sm:inline">Delete</span>
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Trusted Sources Admin Tab (from AdminPanel) ───────────────────────────────

function TrustedSourcesAdminTab({ password }: { password: string }) {
  const { data: sources, isLoading, error } = useTrustedSources();
  const adminRemove = useAdminRemoveSource();
  const adminOverride = useAdminOverrideSource();

  if (isLoading) return <LoadingRows />;

  if (error) {
    return (
      <div
        data-ocid="admin.trusted_sources.error_state"
        className="flex flex-col items-center py-12 text-muted-foreground"
      >
        <AlertTriangle className="h-8 w-8 mb-3 text-destructive opacity-60" />
        <p className="text-sm">Failed to load sources.</p>
      </div>
    );
  }

  if (!sources || sources.length === 0) {
    return (
      <div
        data-ocid="admin.trusted_sources.empty_state"
        className="flex flex-col items-center py-12 text-muted-foreground"
      >
        <Shield className="h-8 w-8 mb-3 opacity-20" />
        <p className="text-sm">No sources submitted yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {(sources as TrustedSourceInfo[]).map((source, idx) => {
        const upvotes = Number(source.upvotes);
        const downvotes = Number(source.downvotes);
        const netScore = upvotes - downvotes;
        const totalVotes = upvotes + downvotes;
        const upvotePct =
          totalVotes > 0 ? Math.round((upvotes / totalVotes) * 100) : 0;

        return (
          <motion.div
            key={source.id.toString()}
            data-ocid={`admin.trusted_sources.item.${idx + 1}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="flex items-start gap-3 p-4 bg-secondary border border-border rounded-md"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-bold text-foreground">
                  {source.domain}
                </span>
                {source.isTrusted && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                    <ShieldCheck className="h-2.5 w-2.5" />
                    TRUSTED
                  </span>
                )}
                {source.adminOverride && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-violet-500/15 text-violet-600 border border-violet-500/30">
                    Admin Approved
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] border",
                    getSourceTypeBadgeClasses(source.sourceType),
                  )}
                >
                  {getSourceTypeLabel(source.sourceType)}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  up to +{getSourceTypeCeiling(source.sourceType)}% ceiling
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {netScore > 0 ? "+" : ""}
                  {netScore} votes ({totalVotes} total, {upvotePct}% approval)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
              <Button
                size="sm"
                variant="outline"
                data-ocid={`admin.trusted_sources.edit_button.${idx + 1}`}
                onClick={async () => {
                  try {
                    await adminOverride.mutateAsync({
                      sourceId: source.id,
                      approved: !source.adminOverride,
                      note: "",
                      password,
                    });
                    toast.success(
                      source.adminOverride
                        ? "Override removed"
                        : "Source force-approved",
                    );
                  } catch {
                    toast.error("Failed to update source");
                  }
                }}
                disabled={adminOverride.isPending}
                className={cn(
                  "h-8 px-2.5 text-xs",
                  source.adminOverride
                    ? "hover:border-amber-500/50 hover:text-amber-500"
                    : "hover:border-emerald-500/50 hover:text-emerald-500",
                )}
              >
                {adminOverride.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : source.adminOverride ? (
                  <Shield className="h-3.5 w-3.5" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                <span className="ml-1.5 hidden sm:inline">
                  {source.adminOverride ? "Revoke" : "Force Approve"}
                </span>
              </Button>
              <Button
                size="sm"
                variant="destructive"
                data-ocid={`admin.trusted_sources.delete_button.${idx + 1}`}
                onClick={async () => {
                  try {
                    await adminRemove.mutateAsync({
                      sourceId: source.id,
                      password,
                    });
                    toast.success("Source removed");
                  } catch {
                    toast.error("Failed to remove source");
                  }
                }}
                disabled={adminRemove.isPending}
                className="h-8 px-2.5 text-xs"
              >
                {adminRemove.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                <span className="ml-1.5 hidden sm:inline">Remove</span>
              </Button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Password Gate ─────────────────────────────────────────────────────────────

function PasswordGate({ onAuth }: { onAuth: (pw: string) => void }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  function tryAuth() {
    if (input === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_SESSION_KEY, "1");
      onAuth(input);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  }

  return (
    <div className="flex items-center justify-center flex-1 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <Lock className="h-5 w-5 text-destructive" />
          </div>
          <div className="text-center">
            <h2 className="font-display text-xl font-bold">Admin Access</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your admin password to continue
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <Input
            data-ocid="admin.login.input"
            type="password"
            placeholder="Admin password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && tryAuth()}
            className={
              error ? "border-destructive focus-visible:ring-destructive" : ""
            }
          />
          {error && (
            <p
              data-ocid="admin.login.error_state"
              className="text-xs text-destructive"
            >
              Incorrect password
            </p>
          )}
          <Button
            data-ocid="admin.login.submit_button"
            onClick={tryAuth}
            className="w-full"
          >
            Unlock Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

interface AdminPageProps {
  onClose: () => void;
}

export function AdminPage({ onClose }: AdminPageProps) {
  const storedAuth = localStorage.getItem(ADMIN_SESSION_KEY);
  const [password, setPassword] = useState<string | null>(
    storedAuth ? ADMIN_PASSWORD : null,
  );

  const handleAuth = useCallback((pw: string) => {
    setPassword(pw);
  }, []);

  function logout() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setPassword(null);
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="border-b border-border mb-6 pb-3 flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-ocid="admin.back_button"
              onClick={onClose}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-body">Back</span>
            </button>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                <Shield className="h-3.5 w-3.5 text-destructive" />
              </div>
              <h1 className="font-display text-base font-bold text-foreground">
                Admin Dashboard
              </h1>
            </div>
          </div>
          {password && (
            <Button
              variant="outline"
              size="sm"
              data-ocid="admin.logout_button"
              onClick={logout}
              className="h-8 gap-1.5 text-xs text-muted-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </Button>
          )}
        </div>
      </header>

      {/* Body */}
      {!password ? (
        <PasswordGate onAuth={handleAuth} />
      ) : (
        <main className="flex-1 w-full py-6">
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1">
              <TabsTrigger
                value="users"
                data-ocid="admin.users.tab"
                className="gap-1.5 text-xs"
              >
                <Users className="h-3.5 w-3.5" />
                Users
              </TabsTrigger>
              <TabsTrigger
                value="claims"
                data-ocid="admin.claims.tab"
                className="gap-1.5 text-xs"
              >
                <FileText className="h-3.5 w-3.5" />
                Claims
              </TabsTrigger>
              <TabsTrigger
                value="evidence"
                data-ocid="admin.evidence.tab"
                className="gap-1.5 text-xs"
              >
                <CheckSquare className="h-3.5 w-3.5" />
                Evidence
              </TabsTrigger>
              <TabsTrigger
                value="votes"
                data-ocid="admin.votes.tab"
                className="gap-1.5 text-xs"
              >
                <Database className="h-3.5 w-3.5" />
                Votes
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                data-ocid="admin.comments.tab"
                className="gap-1.5 text-xs"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Comments
              </TabsTrigger>
              <TabsTrigger
                value="sources"
                data-ocid="admin.sources.tab"
                className="gap-1.5 text-xs"
              >
                <Globe className="h-3.5 w-3.5" />
                Sources
              </TabsTrigger>
              <TabsTrigger
                value="hidden-claims"
                data-ocid="admin.hidden_claims.tab"
                className="gap-1.5 text-xs"
              >
                <EyeOff className="h-3.5 w-3.5" />
                Hidden Claims
              </TabsTrigger>
              <TabsTrigger
                value="hidden-evidence"
                data-ocid="admin.hidden_evidence.tab"
                className="gap-1.5 text-xs"
              >
                <EyeOff className="h-3.5 w-3.5" />
                Hidden Evidence
              </TabsTrigger>
              <TabsTrigger
                value="hidden-replies"
                data-ocid="admin.hidden_replies.tab"
                className="gap-1.5 text-xs"
              >
                <EyeOff className="h-3.5 w-3.5" />
                Hidden Replies
              </TabsTrigger>
              <TabsTrigger
                value="trusted-sources"
                data-ocid="admin.trusted_sources.tab"
                className="gap-1.5 text-xs"
              >
                <Shield className="h-3.5 w-3.5" />
                Trusted Sources
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <UsersTab password={password} />
            </TabsContent>
            <TabsContent value="claims">
              <ClaimsTab password={password} />
            </TabsContent>
            <TabsContent value="evidence">
              <EvidenceTab password={password} />
            </TabsContent>
            <TabsContent value="votes">
              <VotesTab password={password} />
            </TabsContent>
            <TabsContent value="comments">
              <CommentsTab password={password} />
            </TabsContent>
            <TabsContent value="sources">
              <SourcesTab password={password} />
            </TabsContent>
            <TabsContent value="hidden-claims">
              <HiddenClaimsTab password={password} />
            </TabsContent>
            <TabsContent value="hidden-evidence">
              <HiddenEvidenceTab password={password} />
            </TabsContent>
            <TabsContent value="hidden-replies">
              <HiddenRepliesTab password={password} />
            </TabsContent>
            <TabsContent value="trusted-sources">
              <TrustedSourcesAdminTab password={password} />
            </TabsContent>
          </Tabs>
        </main>
      )}
    </div>
  );
}
