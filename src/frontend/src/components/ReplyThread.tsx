import { ReportDialog } from "@/components/ReportDialog";
import { UserAvatar } from "@/components/UserAvatar";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useAccountPermissions } from "@/hooks/useAccountPermissions";
import {
  type Reply,
  useAddReply,
  useLikeReply,
  useReplies,
  useReplyLikeCounts,
  useReportReply,
  useSessionLikeForReply,
  useUsername,
} from "@/hooks/useQueries";
import { useSessionGate } from "@/hooks/useSessionGate";
import { isTrustedContributorSession } from "@/hooks/useVerifiedAccount";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/time";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  CornerDownRight,
  Flag,
  Loader2,
  LogIn,
  MessageSquare,
  MoreHorizontal,
  Send,
  Share2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ── Reply Form ────────────────────────────────────────────────────────────────────

interface ReplyFormProps {
  evidenceId: bigint;
  parentReplyId: bigint;
  sessionId: string;
  authorUsername: string;
  onCancel?: () => void;
  onSuccess?: () => void;
  autoFocus?: boolean;
  ocidPrefix: string;
}

function ReplyForm({
  evidenceId,
  parentReplyId,
  sessionId,
  authorUsername,
  onCancel,
  onSuccess,
  autoFocus = false,
  ocidPrefix,
}: ReplyFormProps) {
  const [text, setText] = useState("");
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const addReply = useAddReply();
  const { checkAction } = useSessionGate();

  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const timer = setInterval(() => {
      setCooldownLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownLeft]);

  function formatCountdown(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || cooldownLeft > 0) return;
    if (!checkAction()) return;
    try {
      await addReply.mutateAsync({
        evidenceId,
        parentReplyId,
        text: text.trim(),
        authorUsername,
        sessionId,
      });
      setText("");
      onSuccess?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.startsWith("cooldown:")) {
        const secs = Number.parseInt(msg.split(":")[1], 10);
        setCooldownLeft(Number.isFinite(secs) ? secs : 120);
      } else if (msg.startsWith("duplicate:")) {
        const detail = msg.replace(/^duplicate:/, "").trim();
        toast.error(detail || "Similar reply already exists.");
      } else {
        toast.error("Failed to post reply");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2">
      <Textarea
        data-ocid={`${ocidPrefix}.textarea`}
        placeholder="Write a reply…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        maxLength={500}
        autoFocus={autoFocus}
        className="bg-card border-border font-body resize-none text-sm min-h-[4rem]"
      />
      {cooldownLeft > 0 && (
        <div className="flex items-center gap-2 text-xs text-amber-400 font-body bg-amber-400/10 border border-amber-400/20 rounded-sm px-2 py-1.5">
          <Clock className="h-3 w-3 flex-shrink-0" />
          <span>
            Reply again in{" "}
            <span className="font-mono font-bold">
              {formatCountdown(cooldownLeft)}
            </span>
          </span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-body">
          {text.length}/500
        </span>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-ocid={`${ocidPrefix}.cancel_button`}
              onClick={onCancel}
              className="h-7 px-2.5 font-body text-xs text-muted-foreground"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            data-ocid={`${ocidPrefix}.submit_button`}
            disabled={addReply.isPending || cooldownLeft > 0 || !text.trim()}
            className="h-7 px-2.5 font-body text-xs bg-primary text-primary-foreground gap-1"
          >
            {addReply.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : cooldownLeft > 0 ? (
              <Clock className="h-3 w-3" />
            ) : (
              <Send className="h-3 w-3" />
            )}
            {cooldownLeft > 0 ? "On Cooldown" : "Reply"}
          </Button>
        </div>
      </div>
    </form>
  );
}

// ── Single Reply Card ───────────────────────────────────────────────────────────────

interface ReplyCardProps {
  reply: Reply;
  sessionId: string;
  username: string;
  index: number;
  depth: number;
  reportedIds: Set<string>;
  onReport: (replyId: bigint) => void;
  evidenceId: bigint;
  replyingToId: bigint | null;
  onToggleReply: (replyId: bigint | null) => void;
  children?: React.ReactNode;
  evidenceIndex: number;
  likeCounts: Record<string, number>;
}

function ReplyCard({
  reply,
  sessionId,
  username,
  index,
  depth,
  reportedIds,
  onReport,
  evidenceId,
  replyingToId,
  onToggleReply,
  children,
  evidenceIndex,
  likeCounts,
}: ReplyCardProps) {
  const isOwnReply = reply.sessionId === sessionId;
  const displayAuthor = isOwnReply ? username : reply.authorUsername;
  const isReplying = replyingToId === reply.id;
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const likeReply = useLikeReply();
  const { checkAction: checkReplyAction } = useSessionGate();
  const { canReport } = useAccountPermissions();
  const { data: isLiked = false } = useSessionLikeForReply(reply.id, sessionId);
  const likeCount = likeCounts[reply.id.toString()] ?? 0;

  async function handleLike() {
    try {
      if (!checkReplyAction()) return;
      await likeReply.mutateAsync({ replyId: reply.id, sessionId, evidenceId });
    } catch {
      toast.error("Failed to upvote reply");
    }
  }

  function handleShare() {
    const base = window.location.href.split("#")[0];
    navigator.clipboard.writeText(`${base}#reply-${reply.id.toString()}`);
    toast.success("Link copied");
  }

  return (
    <div
      data-ocid={`reply.item.${evidenceIndex}`}
      className={cn(
        "relative",
        depth > 0 &&
          cn(
            "pl-3 border-l border-border/50",
            depth <= 3 ? "ml-3 sm:ml-4" : "ml-0 sm:ml-4",
          ),
      )}
    >
      <div className="group py-2">
        {/* Author + timestamp */}
        <div className="flex items-center gap-2 mb-1">
          <UserAvatar username={displayAuthor} size="sm" />
          <span className="text-xs font-semibold text-foreground font-mono flex items-center gap-1">
            {displayAuthor}
            {isTrustedContributorSession(reply.sessionId) && <VerifiedBadge />}
          </span>
          <span className="text-xs text-muted-foreground font-body">
            · {formatRelativeTime(reply.timestamp)}
          </span>
        </div>

        {/* Reply text */}
        <p className="text-sm text-foreground font-body leading-relaxed mb-2">
          {reply.text}
        </p>

        {/* Actions row: [Reply] [ChevronUp] ... [⋯] */}
        <div className="flex items-center gap-1">
          {/* Reply button — depth < 4 allows up to 5-level nesting */}
          {depth < 4 && (
            <button
              type="button"
              data-ocid={`reply.button.${index}`}
              onClick={() => onToggleReply(isReplying ? null : reply.id)}
              className={cn(
                "flex items-center gap-1 text-xs font-body rounded px-1.5 py-0.5 transition-colors",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60",
                isReplying
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
              )}
            >
              <CornerDownRight className="h-3 w-3" />
              Reply
            </button>
          )}

          {/* Upvote button */}
          <button
            type="button"
            data-ocid={`reply.toggle.${index}`}
            onClick={handleLike}
            disabled={likeReply.isPending}
            className={cn(
              "flex items-center gap-1 text-xs font-body rounded px-1.5 py-0.5 transition-colors",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isLiked
                ? "text-primary"
                : "text-muted-foreground hover:text-primary",
            )}
          >
            <ChevronUp className={cn("h-3 w-3", isLiked && "fill-primary")} />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Ellipsis menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                data-ocid={`reply.dropdown_menu.${index}`}
                aria-label="More options"
                className="flex items-center justify-center w-6 h-6 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                data-ocid={`reply.secondary_button.${index}`}
                className="text-muted-foreground cursor-pointer gap-2"
                onClick={handleShare}
              >
                <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Share</span>
              </DropdownMenuItem>
              {canReport ? (
                <DropdownMenuItem
                  data-ocid={`reply.delete_button.${index}`}
                  className="text-muted-foreground cursor-pointer gap-2"
                  disabled={reportedIds.has(reply.id.toString())}
                  onClick={() => {
                    if (checkReplyAction()) setReportDialogOpen(true);
                  }}
                >
                  <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>
                    {reportedIds.has(reply.id.toString())
                      ? "Reported"
                      : "Report"}
                  </span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  data-ocid={`reply.delete_button.${index}`}
                  className="text-muted-foreground cursor-default gap-2"
                  disabled
                >
                  <LogIn className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs">Sign in to report</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Report dialog */}
        <ReportDialog
          isOpen={reportDialogOpen}
          onClose={() => setReportDialogOpen(false)}
          onConfirm={async (_reason) => {
            await onReport(reply.id);
          }}
          title="Report Reply"
        />

        {/* Inline reply form — shown only when replying to this specific reply */}
        <AnimatePresence>
          {isReplying && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              {/* "Replying to @username" banner */}
              <div className="flex items-center justify-between mt-2 mb-1 px-1 py-0.5 rounded bg-primary/8 border border-primary/20">
                <span className="text-xs font-body text-primary">
                  Replying to{" "}
                  <span className="font-mono font-semibold">
                    @{displayAuthor}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => onToggleReply(null)}
                  aria-label="Cancel reply"
                  className="w-4 h-4 flex items-center justify-center rounded text-primary/60 hover:text-primary hover:bg-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <ReplyForm
                evidenceId={evidenceId}
                parentReplyId={reply.id}
                sessionId={sessionId}
                authorUsername={username}
                onCancel={() => onToggleReply(null)}
                onSuccess={() => onToggleReply(null)}
                autoFocus
                ocidPrefix={`reply.nested.${index}`}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nested replies */}
      {children}
    </div>
  );
}

// ── Main ReplyThread Component ──────────────────────────────────────────────────────

interface ReplyThreadProps {
  evidenceId: bigint;
  sessionId: string;
  evidenceIndex: number;
}

export function ReplyThread({
  evidenceId,
  sessionId,
  evidenceIndex,
}: ReplyThreadProps) {
  const [expanded, setExpanded] = useState(false);
  const [replyingToId, setReplyingToId] = useState<bigint | null>(null);
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());
  const username = useUsername();
  const reportReply = useReportReply();
  const { checkAction: checkThreadAction } = useSessionGate();

  const { data: replies = [], isLoading } = useReplies(
    expanded ? evidenceId : null,
  );

  // Count by first fetching count even when collapsed — use a separate shallow query
  const { data: allReplies = [] } = useReplies(evidenceId);
  const replyCount = allReplies.length;

  // Fetch like counts for all replies under this evidence
  const { data: likeCounts = {} } = useReplyLikeCounts(
    expanded ? evidenceId : null,
  );

  async function handleReport(replyId: bigint) {
    const key = replyId.toString();
    if (!checkThreadAction()) return;
    if (reportedIds.has(key)) return;
    try {
      await reportReply.mutateAsync({ replyId, sessionId });
      setReportedIds((prev) => new Set([...prev, key]));
      toast.success("Reported");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("Already reported") || msg.includes("already")) {
        toast.info("Already reported");
      } else {
        toast.error("Failed to report");
      }
    }
  }

  function handleToggleReply(id: bigint | null) {
    setReplyingToId(id);
  }

  // Build proper recursive parent→children map supporting up to 5 levels deep
  const childrenByParent = new Map<string, Reply[]>();
  for (const r of replies) {
    if (r.parentReplyId === 0n) continue;
    const key = r.parentReplyId.toString();
    if (!childrenByParent.has(key)) childrenByParent.set(key, []);
    childrenByParent.get(key)!.push(r);
  }
  // Sort each group by most upvotes
  for (const [key, children] of childrenByParent.entries()) {
    childrenByParent.set(
      key,
      [...children].sort(
        (a, b) =>
          (likeCounts[b.id.toString()] ?? 0) -
          (likeCounts[a.id.toString()] ?? 0),
      ),
    );
  }

  const topLevelReplies = replies.filter((r) => r.parentReplyId === 0n);
  const sortedTopLevel = [...topLevelReplies].sort(
    (a, b) =>
      (likeCounts[b.id.toString()] ?? 0) - (likeCounts[a.id.toString()] ?? 0),
  );

  // Global index counter for deterministic ocid markers
  let globalIndex = 0;
  function nextIndex() {
    globalIndex += 1;
    return globalIndex;
  }

  function renderReply(reply: Reply, depth: number): React.ReactNode {
    const idx = nextIndex();
    const nested = childrenByParent.get(reply.id.toString()) ?? [];

    return (
      <ReplyCard
        key={reply.id.toString()}
        reply={reply}
        sessionId={sessionId}
        username={username}
        index={idx}
        depth={depth}
        reportedIds={reportedIds}
        onReport={handleReport}
        evidenceId={evidenceId}
        replyingToId={replyingToId}
        onToggleReply={handleToggleReply}
        evidenceIndex={evidenceIndex}
        likeCounts={likeCounts}
      >
        {nested.length > 0 && depth < 4 && (
          <div className="space-y-0">
            {nested.map((child) => renderReply(child, depth + 1))}
          </div>
        )}
      </ReplyCard>
    );
  }

  const toggleLabel =
    replyCount === 0
      ? "Reply"
      : `${replyCount} ${replyCount === 1 ? "reply" : "replies"}`;

  return (
    <div data-ocid={`evidence.reply_thread.${evidenceIndex}`} className="mt-3">
      {/* Toggle button */}
      <button
        type="button"
        data-ocid={`evidence.reply_toggle.${evidenceIndex}`}
        onClick={() => setExpanded((prev) => !prev)}
        className={cn(
          "flex items-center gap-1.5 text-xs font-body rounded px-1.5 py-1 transition-colors",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60",
          expanded
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-expanded={expanded}
      >
        <MessageSquare className="h-3.5 w-3.5" />
        {toggleLabel}
        {replyCount > 0 && (
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform duration-200",
              expanded && "rotate-180",
            )}
          />
        )}
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-0">
              {isLoading ? (
                <div
                  data-ocid={`reply.loading_state.${evidenceIndex}`}
                  className="py-3 text-xs text-muted-foreground font-body flex items-center gap-2"
                >
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading replies…
                </div>
              ) : replies.length > 0 ? (
                <div className="space-y-0">
                  {sortedTopLevel.map((reply) => renderReply(reply, 0))}
                </div>
              ) : null}

              {/* Default top-level reply form — hidden when replying to a specific reply */}
              <AnimatePresence>
                {replyingToId === null && (
                  <motion.div
                    key="toplevel-form"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="mt-2 overflow-hidden"
                  >
                    <ReplyForm
                      evidenceId={evidenceId}
                      parentReplyId={0n}
                      sessionId={sessionId}
                      authorUsername={username}
                      ocidPrefix={`reply.toplevel.${evidenceIndex}`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
