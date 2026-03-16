import type { Claim, Evidence } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  getSourceTypeBonus,
  getSourceTypeLabel,
} from "@/pages/TrustedSourcesPage";
import { getSourceTypeCeiling } from "@/pages/TrustedSourcesPage";
import { formatRelativeTime } from "@/utils/time";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Lock,
  Shield,
  ShieldCheck,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface AdminPanelProps {
  onClose: () => void;
}

// ── Inner authenticated panel ─────────────────────────────────────────────────

function HiddenClaimsTab({ password }: { password: string }) {
  const { data: claims, isLoading, error } = useGetHiddenClaims(password);
  const restoreClaim = useRestoreClaim();
  const deleteClaim = useAdminDeleteClaim();

  if (isLoading) {
    return (
      <div data-ocid="admin.claims.loading_state" className="space-y-3 p-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-secondary rounded-sm space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        data-ocid="admin.claims.error_state"
        className="flex flex-col items-center py-12 text-muted-foreground"
      >
        <AlertTriangle className="h-8 w-8 mb-3 text-destructive opacity-60" />
        <p className="text-sm font-body">Failed to load hidden claims.</p>
        <p className="text-xs mt-1 opacity-60">Check your password.</p>
      </div>
    );
  }

  if (!claims || claims.length === 0) {
    return (
      <div
        data-ocid="admin.claims.empty_state"
        className="flex flex-col items-center py-12 text-muted-foreground"
      >
        <Shield className="h-8 w-8 mb-3 opacity-20" />
        <p className="text-sm font-body">No hidden claims.</p>
        <p className="text-xs mt-1 opacity-60">
          Claims with 10+ reports appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-1">
      {claims.map((claim: Claim, idx: number) => (
        <HiddenClaimRow
          key={claim.id.toString()}
          claim={claim}
          index={idx + 1}
          password={password}
          onRestore={async () => {
            try {
              await restoreClaim.mutateAsync({ id: claim.id, password });
              toast.success("Claim restored");
            } catch {
              toast.error("Failed to restore claim");
            }
          }}
          onDelete={async () => {
            try {
              await deleteClaim.mutateAsync({ id: claim.id, password });
              toast.success("Claim permanently deleted");
            } catch {
              toast.error("Failed to delete claim");
            }
          }}
          isRestoring={restoreClaim.isPending}
          isDeleting={deleteClaim.isPending}
        />
      ))}
    </div>
  );
}

interface HiddenClaimRowProps {
  claim: Claim;
  index: number;
  password: string;
  onRestore: () => void;
  onDelete: () => void;
  isRestoring: boolean;
  isDeleting: boolean;
}

function HiddenClaimRow({
  claim,
  index,
  onRestore,
  onDelete,
  isRestoring,
  isDeleting,
}: HiddenClaimRowProps) {
  return (
    <motion.div
      data-ocid={`admin.claims.item.${index}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-start gap-3 p-4 bg-secondary border border-border rounded-sm"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-display font-semibold text-foreground leading-snug line-clamp-2 mb-1">
          {claim.title}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className="text-xs font-body border-border text-muted-foreground"
          >
            {claim.category}
          </Badge>
          <span className="text-xs text-muted-foreground font-body">
            {formatRelativeTime(claim.timestamp)}
          </span>
          <span className="text-xs text-destructive font-body font-medium">
            Hidden
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Button
          size="sm"
          variant="outline"
          data-ocid={`admin.claims.restore_button.${index}`}
          onClick={onRestore}
          disabled={isRestoring || isDeleting}
          className={cn(
            "h-8 px-2.5 font-body text-xs border-border",
            "hover:border-primary/50 hover:text-primary",
          )}
          aria-label="Restore claim"
        >
          {isRestoring ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Undo2 className="h-3.5 w-3.5" />
          )}
          <span className="ml-1.5 hidden sm:inline">Restore</span>
        </Button>
        <Button
          size="sm"
          variant="destructive"
          data-ocid={`admin.claims.delete_button.${index}`}
          onClick={onDelete}
          disabled={isRestoring || isDeleting}
          className="h-8 px-2.5 font-body text-xs"
          aria-label="Permanently delete claim"
        >
          {isDeleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
          <span className="ml-1.5 hidden sm:inline">Delete</span>
        </Button>
      </div>
    </motion.div>
  );
}

function HiddenEvidenceTab({ password }: { password: string }) {
  const {
    data: evidenceList,
    isLoading,
    error,
  } = useGetHiddenEvidence(password);
  const restoreEvidence = useRestoreEvidence();
  const deleteEvidence = useAdminDeleteEvidence();

  if (isLoading) {
    return (
      <div data-ocid="admin.evidence.loading_state" className="space-y-3 p-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-secondary rounded-sm space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        data-ocid="admin.evidence.error_state"
        className="flex flex-col items-center py-12 text-muted-foreground"
      >
        <AlertTriangle className="h-8 w-8 mb-3 text-destructive opacity-60" />
        <p className="text-sm font-body">Failed to load hidden evidence.</p>
        <p className="text-xs mt-1 opacity-60">Check your password.</p>
      </div>
    );
  }

  if (!evidenceList || evidenceList.length === 0) {
    return (
      <div
        data-ocid="admin.evidence.empty_state"
        className="flex flex-col items-center py-12 text-muted-foreground"
      >
        <Shield className="h-8 w-8 mb-3 opacity-20" />
        <p className="text-sm font-body">No hidden evidence.</p>
        <p className="text-xs mt-1 opacity-60">
          Evidence with 10+ reports appears here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-1">
      {evidenceList.map((item: Evidence, idx: number) => (
        <HiddenEvidenceRow
          key={item.id.toString()}
          item={item}
          index={idx + 1}
          password={password}
          onRestore={async () => {
            try {
              await restoreEvidence.mutateAsync({ id: item.id, password });
              toast.success("Evidence restored");
            } catch {
              toast.error("Failed to restore evidence");
            }
          }}
          onDelete={async () => {
            try {
              await deleteEvidence.mutateAsync({ id: item.id, password });
              toast.success("Evidence permanently deleted");
            } catch {
              toast.error("Failed to delete evidence");
            }
          }}
          isRestoring={restoreEvidence.isPending}
          isDeleting={deleteEvidence.isPending}
        />
      ))}
    </div>
  );
}

interface HiddenEvidenceRowProps {
  item: Evidence;
  index: number;
  password: string;
  onRestore: () => void;
  onDelete: () => void;
  isRestoring: boolean;
  isDeleting: boolean;
}

function HiddenEvidenceRow({
  item,
  index,
  onRestore,
  onDelete,
  isRestoring,
  isDeleting,
}: HiddenEvidenceRowProps) {
  return (
    <motion.div
      data-ocid={`admin.evidence.item.${index}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-start gap-3 p-4 bg-secondary border border-border rounded-sm"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground font-body leading-relaxed line-clamp-3 mb-1">
          {item.text}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-body">
            {formatRelativeTime(item.timestamp)}
          </span>
          <span className="text-xs text-destructive font-body font-medium">
            Hidden
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Button
          size="sm"
          variant="outline"
          data-ocid={`admin.evidence.restore_button.${index}`}
          onClick={onRestore}
          disabled={isRestoring || isDeleting}
          className={cn(
            "h-8 px-2.5 font-body text-xs border-border",
            "hover:border-primary/50 hover:text-primary",
          )}
          aria-label="Restore evidence"
        >
          {isRestoring ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Undo2 className="h-3.5 w-3.5" />
          )}
          <span className="ml-1.5 hidden sm:inline">Restore</span>
        </Button>
        <Button
          size="sm"
          variant="destructive"
          data-ocid={`admin.evidence.delete_button.${index}`}
          onClick={onDelete}
          disabled={isRestoring || isDeleting}
          className="h-8 px-2.5 font-body text-xs"
          aria-label="Permanently delete evidence"
        >
          {isDeleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
          <span className="ml-1.5 hidden sm:inline">Delete</span>
        </Button>
      </div>
    </motion.div>
  );
}

// ── Hidden Replies Tab ────────────────────────────────────────────────────────

function HiddenRepliesTab({ password }: { password: string }) {
  const { data: replyList, isLoading, error } = useGetHiddenReplies(password);
  const restoreReply = useRestoreReply();
  const deleteReply = useAdminDeleteReply();

  if (isLoading) {
    return (
      <div data-ocid="admin.replies.loading_state" className="space-y-3 p-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-secondary rounded-sm space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        data-ocid="admin.replies.error_state"
        className="flex flex-col items-center py-12 text-muted-foreground"
      >
        <AlertTriangle className="h-8 w-8 mb-3 text-destructive opacity-60" />
        <p className="text-sm font-body">Failed to load hidden replies.</p>
        <p className="text-xs mt-1 opacity-60">Check your password.</p>
      </div>
    );
  }

  if (!replyList || replyList.length === 0) {
    return (
      <div
        data-ocid="admin.replies.empty_state"
        className="flex flex-col items-center py-12 text-muted-foreground"
      >
        <Shield className="h-8 w-8 mb-3 opacity-20" />
        <p className="text-sm font-body">No hidden replies.</p>
        <p className="text-xs mt-1 opacity-60">
          Replies with 10+ reports appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-1">
      {replyList.map((item: Reply, idx: number) => (
        <HiddenReplyRow
          key={item.id.toString()}
          item={item}
          index={idx + 1}
          password={password}
          onRestore={async () => {
            try {
              await restoreReply.mutateAsync({ id: item.id, password });
              toast.success("Reply restored");
            } catch {
              toast.error("Failed to restore reply");
            }
          }}
          onDelete={async () => {
            try {
              await deleteReply.mutateAsync({ id: item.id, password });
              toast.success("Reply permanently deleted");
            } catch {
              toast.error("Failed to delete reply");
            }
          }}
          isRestoring={restoreReply.isPending}
          isDeleting={deleteReply.isPending}
        />
      ))}
    </div>
  );
}

interface HiddenReplyRowProps {
  item: Reply;
  index: number;
  password: string;
  onRestore: () => void;
  onDelete: () => void;
  isRestoring: boolean;
  isDeleting: boolean;
}

function HiddenReplyRow({
  item,
  index,
  onRestore,
  onDelete,
  isRestoring,
  isDeleting,
}: HiddenReplyRowProps) {
  return (
    <motion.div
      data-ocid={`admin.replies.item.${index}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-start gap-3 p-4 bg-secondary border border-border rounded-sm"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground font-body leading-relaxed line-clamp-3 mb-1">
          {item.text}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-muted-foreground">
            {item.authorUsername}
          </span>
          <span className="text-xs text-muted-foreground font-body">
            {formatRelativeTime(item.timestamp)}
          </span>
          <span className="text-xs text-destructive font-body font-medium">
            Hidden
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Button
          size="sm"
          variant="outline"
          data-ocid={`admin.replies.restore_button.${index}`}
          onClick={onRestore}
          disabled={isRestoring || isDeleting}
          className={cn(
            "h-8 px-2.5 font-body text-xs border-border",
            "hover:border-primary/50 hover:text-primary",
          )}
          aria-label="Restore reply"
        >
          {isRestoring ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Undo2 className="h-3.5 w-3.5" />
          )}
          <span className="ml-1.5 hidden sm:inline">Restore</span>
        </Button>
        <Button
          size="sm"
          variant="destructive"
          data-ocid={`admin.replies.delete_button.${index}`}
          onClick={onDelete}
          disabled={isRestoring || isDeleting}
          className="h-8 px-2.5 font-body text-xs"
          aria-label="Permanently delete reply"
        >
          {isDeleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
          <span className="ml-1.5 hidden sm:inline">Delete</span>
        </Button>
      </div>
    </motion.div>
  );
}

// ── Trusted Sources Admin Tab ─────────────────────────────────────────────────

function TrustedSourcesAdminTab({ password }: { password: string }) {
  const { data: sources, isLoading, error } = useTrustedSources();
  const adminRemove = useAdminRemoveSource();
  const adminOverride = useAdminOverrideSource();

  if (isLoading) {
    return (
      <div data-ocid="admin.sources.loading_state" className="space-y-3 p-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-secondary rounded-sm space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        data-ocid="admin.sources.error_state"
        className="flex flex-col items-center py-12 text-muted-foreground"
      >
        <AlertTriangle className="h-8 w-8 mb-3 text-destructive opacity-60" />
        <p className="text-sm font-body">Failed to load sources.</p>
      </div>
    );
  }

  if (!sources || sources.length === 0) {
    return (
      <div
        data-ocid="admin.sources.empty_state"
        className="flex flex-col items-center py-12 text-muted-foreground"
      >
        <Shield className="h-8 w-8 mb-3 opacity-20" />
        <p className="text-sm font-body">No sources submitted yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-1">
      {sources.map((source: TrustedSourceInfo, idx: number) => {
        const upvotes = Number(source.upvotes);
        const downvotes = Number(source.downvotes);
        const netScore = upvotes - downvotes;
        const totalVotes = upvotes + downvotes;
        const upvotePct =
          totalVotes > 0 ? Math.round((upvotes / totalVotes) * 100) : 0;

        return (
          <motion.div
            key={source.id.toString()}
            data-ocid={`admin.sources.item.${idx + 1}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="flex items-start gap-3 p-4 bg-secondary border border-border rounded-sm"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-bold font-body text-foreground">
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
                    "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-body border",
                    getSourceTypeBadgeClasses(source.sourceType),
                  )}
                >
                  {getSourceTypeLabel(source.sourceType)}
                </span>
                <span className="text-[10px] text-muted-foreground font-body">
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
                data-ocid={`admin.sources.edit_button.${idx + 1}`}
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
                  "h-8 px-2.5 font-body text-xs border-border",
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
                data-ocid={`admin.sources.delete_button.${idx + 1}`}
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
                className="h-8 px-2.5 font-body text-xs"
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

// ── Password gate ─────────────────────────────────────────────────────────────

interface PasswordGateProps {
  onAuth: (password: string) => void;
}

function PasswordGate({ onAuth }: PasswordGateProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    // We pass the password to the parent; backend will validate.
    // We optimistically proceed and let the data queries show errors.
    await new Promise((r) => setTimeout(r, 300));
    setLoading(false);
    onAuth(input);
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-card border border-border rounded-sm p-6 space-y-5"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Lock className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">
              Admin Access
            </h2>
            <p className="text-xs text-muted-foreground font-body">
              Enter the admin password to continue
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="admin-password" className="font-body text-sm">
              Password
            </Label>
            <Input
              id="admin-password"
              data-ocid="admin.password.input"
              type="password"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError("");
              }}
              placeholder="Enter admin password"
              className="bg-secondary border-border font-body"
              autoFocus
              autoComplete="current-password"
            />
            {error && (
              <p
                data-ocid="admin.password.error_state"
                className="text-xs text-destructive font-body"
              >
                {error}
              </p>
            )}
          </div>
          <Button
            type="submit"
            data-ocid="admin.login.submit_button"
            disabled={!input.trim() || loading}
            className="w-full font-body bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authenticating…
              </>
            ) : (
              "Enter"
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

// ── Main AdminPanel ───────────────────────────────────────────────────────────

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [password, setPassword] = useState<string | null>(null);

  return (
    <AnimatePresence>
      <motion.div
        data-ocid="admin.panel"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-background flex flex-col"
      >
        {/* Admin header */}
        <header className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-sm bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                <Shield className="h-3.5 w-3.5 text-destructive" />
              </div>
              <div>
                <h1 className="font-display text-lg font-bold text-foreground leading-none">
                  Admin Panel
                </h1>
                <p className="text-xs text-muted-foreground font-body mt-0.5">
                  Moderation & content review
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              data-ocid="admin.close_button"
              onClick={onClose}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              aria-label="Close admin panel"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Body */}
        {!password ? (
          <PasswordGate onAuth={setPassword} />
        ) : (
          <div className="flex-1 overflow-hidden max-w-3xl mx-auto w-full px-4 py-6 flex flex-col">
            <Tabs
              defaultValue="claims"
              className="flex flex-col flex-1 min-h-0"
            >
              <TabsList className="bg-secondary border border-border mb-4 flex-shrink-0 w-fit">
                <TabsTrigger
                  value="claims"
                  data-ocid="admin.claims.tab"
                  className="font-body text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Hidden Claims
                </TabsTrigger>
                <TabsTrigger
                  value="evidence"
                  data-ocid="admin.evidence.tab"
                  className="font-body text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Hidden Evidence
                </TabsTrigger>
                <TabsTrigger
                  value="replies"
                  data-ocid="admin.replies.tab"
                  className="font-body text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Hidden Replies
                </TabsTrigger>
                <TabsTrigger
                  value="sources"
                  data-ocid="admin.sources.tab"
                  className="font-body text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Trusted Sources
                </TabsTrigger>
              </TabsList>

              <TabsContent value="claims" className="flex-1 min-h-0 mt-0">
                <ScrollArea className="h-full">
                  <HiddenClaimsTab password={password} />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="evidence" className="flex-1 min-h-0 mt-0">
                <ScrollArea className="h-full">
                  <HiddenEvidenceTab password={password} />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="replies" className="flex-1 min-h-0 mt-0">
                <ScrollArea className="h-full">
                  <HiddenRepliesTab password={password} />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="sources" className="flex-1 min-h-0 mt-0">
                <ScrollArea className="h-full">
                  <TrustedSourcesAdminTab password={password} />
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
