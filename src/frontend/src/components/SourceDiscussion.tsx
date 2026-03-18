import { ImageUploader } from "@/components/ImageUploader";
import { UrlInputList } from "@/components/UrlInputList";
import { UserAvatar } from "@/components/UserAvatar";
import {
  UserProfileCard,
  isVerifiedUsername,
} from "@/components/UserProfileCard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAccountPermissions } from "@/hooks/useAccountPermissions";
import {
  type SourceComment,
  useAddSourceComment,
  useLikeSourceComment,
  useProfileByUsername,
  useReportSourceComment,
  useSessionLikeForSourceComment,
  useSourceCommentLikeCounts,
  useSourceComments,
  useUsername,
} from "@/hooks/useQueries";
import { useSessionGate } from "@/hooks/useSessionGate";
import { useVerifiedAccount } from "@/hooks/useVerifiedAccount";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/time";
import {
  ChevronUp,
  Clock,
  CornerDownRight,
  Flag,
  Link2,
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

// ── Attachment helpers ───────────────────────────────────────────────────────────────────

const ATTACHMENT_SEP = "\u0000";

function encodeAttachments(
  text: string,
  imageUrls: string[],
  urls: string[],
): string {
  const filteredUrls = urls.filter(Boolean);
  if (imageUrls.length === 0 && filteredUrls.length === 0) return text;
  return (
    text + ATTACHMENT_SEP + JSON.stringify({ imageUrls, urls: filteredUrls })
  );
}

function decodeAttachments(raw: string): {
  text: string;
  imageUrls: string[];
  urls: string[];
} {
  const idx = raw.indexOf(ATTACHMENT_SEP);
  if (idx === -1) return { text: raw, imageUrls: [], urls: [] };
  try {
    const parsed = JSON.parse(raw.slice(idx + 1));
    return {
      text: raw.slice(0, idx),
      imageUrls: parsed.imageUrls ?? [],
      urls: parsed.urls ?? [],
    };
  } catch {
    return { text: raw, imageUrls: [], urls: [] };
  }
}

// ── Comment Form ──────────────────────────────────────────────────────────────────

interface CommentFormProps {
  sourceId: bigint;
  parentCommentId: bigint;
  sessionId: string;
  authorUsername: string;
  onCancel?: () => void;
  onSuccess?: () => void;
  autoFocus?: boolean;
  ocidPrefix: string;
  placeholder?: string;
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
  placeholder = "Write a comment\u2026",
}: CommentFormProps) {
  const [text, setText] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [showLinks, setShowLinks] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const addComment = useAddSourceComment();
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
      await addComment.mutateAsync({
        sourceId,
        parentCommentId,
        text: encodeAttachments(text.trim(), imageUrls, urls),
        authorUsername,
        sessionId,
      });
      setText("");
      setImageUrls([]);
      setUrls([]);
      setShowLinks(false);
      onSuccess?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.startsWith("cooldown:")) {
        const secs = Number.parseInt(msg.split(":")[1], 10);
        setCooldownLeft(Number.isFinite(secs) ? secs : 120);
      } else {
        toast.error("Failed to post comment");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        data-ocid={`${ocidPrefix}.textarea`}
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        maxLength={500}
        autoFocus={autoFocus}
        className="bg-card border-border font-body resize-none text-sm min-h-[4rem]"
      />
      {/* Image uploader */}
      <ImageUploader
        onUploaded={setImageUrls}
        maxFiles={3}
        ocidPrefix={`${ocidPrefix}.image`}
      />
      {/* Uploaded image previews in comment body */}
      {imageUrls.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {imageUrls.map((url) => (
            <img
              key={url}
              src={url}
              alt="Attachment"
              className="h-16 w-16 object-cover rounded border border-border"
            />
          ))}
        </div>
      )}
      {/* Link input toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowLinks((v) => !v)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-body transition-colors"
        >
          <Link2 className="h-3 w-3" />
          {showLinks ? "Hide links" : "Add links"}
        </button>
        {showLinks && (
          <div className="mt-2">
            <UrlInputList
              urls={urls}
              onChange={setUrls}
              ocidPrefix={`${ocidPrefix}.url`}
              placeholder="https://example.com/source"
            />
          </div>
        )}
      </div>
      {cooldownLeft > 0 && (
        <div className="flex items-center gap-2 text-xs text-amber-400 font-body bg-amber-400/10 border border-amber-400/20 rounded-sm px-2 py-1.5">
          <Clock className="h-3 w-3 flex-shrink-0" />
          <span>
            Comment again in{" "}
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
            disabled={addComment.isPending || cooldownLeft > 0 || !text.trim()}
            className="h-7 px-2.5 font-body text-xs bg-primary text-primary-foreground gap-1"
          >
            {addComment.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : cooldownLeft > 0 ? (
              <Clock className="h-3 w-3" />
            ) : (
              <Send className="h-3 w-3" />
            )}
            {cooldownLeft > 0 ? "On Cooldown" : "Post"}
          </Button>
        </div>
      </div>
    </form>
  );
}

// ── Single Comment Card ─────────────────────────────────────────────────────────────────

interface CommentCardProps {
  comment: SourceComment;
  sourceId: bigint;
  sessionId: string;
  username: string;
  verifiedUsername?: string;
  avatarUrl?: string;
  index: number;
  depth: number;
  reportedIds: Set<string>;
  onReport: (commentId: bigint) => void;
  replyingToId: bigint | null;
  onToggleReply: (commentId: bigint | null) => void;
  children?: React.ReactNode;
  likeCounts: Record<string, number>;
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
}: CommentCardProps) {
  const {
    text: displayText,
    imageUrls: attachedImages,
    urls: attachedUrls,
  } = decodeAttachments(comment.text);

  const isOwnComment = comment.sessionId === sessionId;
  const displayAuthor = isOwnComment
    ? (verifiedUsername ?? username)
    : comment.authorUsername;
  const { data: authorProfile } = useProfileByUsername(
    isOwnComment ? null : comment.authorUsername,
  );
  const displayAvatarUrl = isOwnComment
    ? avatarUrl
    : authorProfile?.avatarUrl || undefined;
  const isReplying = replyingToId === comment.id;

  const likeComment = useLikeSourceComment();
  const { checkAction } = useSessionGate();
  const { canReport } = useAccountPermissions();
  const { data: isLiked = false } = useSessionLikeForSourceComment(
    comment.id,
    sessionId,
  );
  const likeCount = likeCounts[comment.id.toString()] ?? 0;

  async function handleLike() {
    if (!checkAction()) return;
    try {
      await likeComment.mutateAsync({
        commentId: comment.id,
        sessionId,
        sourceId,
      });
    } catch {
      toast.error("Failed to like comment");
    }
  }

  function handleShare() {
    const base = window.location.href.split("#")[0];
    navigator.clipboard.writeText(`${base}#comment-${comment.id.toString()}`);
    toast.success("Link copied");
  }

  return (
    <div
      id={`comment-${comment.id.toString()}`}
      data-ocid={`source_discussion.item.${index}`}
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
          <UserProfileCard
            username={displayAuthor}
            isVerified={
              isOwnComment
                ? !!verifiedUsername
                : isVerifiedUsername(displayAuthor)
            }
          >
            <UserAvatar
              username={displayAuthor}
              size="sm"
              avatarUrl={displayAvatarUrl}
              isVerified={
                isOwnComment ? !!verifiedUsername : !!authorProfile?.username
              }
            />
            <span className="text-xs font-semibold text-foreground font-body">
              {displayAuthor}
            </span>
          </UserProfileCard>
          <span className="text-xs text-muted-foreground font-body">·</span>
          <span className="text-xs text-muted-foreground font-body">
            {formatRelativeTime(comment.timestamp)}
          </span>
        </div>

        {/* Comment text */}
        <p className="text-sm text-foreground font-body leading-relaxed mb-2">
          {displayText}
        </p>

        {/* Decoded attachments — images */}
        {attachedImages.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {attachedImages.map((url) => (
              <img
                key={url}
                src={url}
                alt="Attachment"
                className="h-24 max-w-[200px] object-cover rounded border border-border"
              />
            ))}
          </div>
        )}

        {/* Decoded attachments — links */}
        {attachedUrls.filter(Boolean).length > 0 && (
          <div className="flex flex-col gap-0.5 mb-2">
            {attachedUrls.filter(Boolean).map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline font-body flex items-center gap-1 truncate"
              >
                <Link2 className="h-2.5 w-2.5 flex-shrink-0" />
                {url}
              </a>
            ))}
          </div>
        )}

        {/* Actions row: [Reply] [ChevronUp + count] [spacer] [⋯] */}
        <div className="flex items-center gap-1">
          {/* Reply button — depth < 4 allows up to 5-level nesting */}
          {depth < 4 && (
            <button
              type="button"
              data-ocid={`source_discussion.button.${index}`}
              onClick={() => onToggleReply(isReplying ? null : comment.id)}
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
            data-ocid={`source_discussion.toggle.${index}`}
            onClick={handleLike}
            disabled={likeComment.isPending}
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
                data-ocid={`source_discussion.dropdown_menu.${index}`}
                aria-label="More options"
                className="flex items-center justify-center w-6 h-6 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                data-ocid={`source_discussion.secondary_button.${index}`}
                className="text-muted-foreground cursor-pointer gap-2"
                onClick={handleShare}
              >
                <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Share</span>
              </DropdownMenuItem>
              {canReport ? (
                <DropdownMenuItem
                  data-ocid={`source_discussion.delete_button.${index}`}
                  className="text-muted-foreground cursor-pointer gap-2"
                  disabled={reportedIds.has(comment.id.toString())}
                  onClick={() => {
                    if (checkAction()) onReport(comment.id);
                  }}
                >
                  <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>
                    {reportedIds.has(comment.id.toString())
                      ? "Reported"
                      : "Report"}
                  </span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  data-ocid={`source_discussion.delete_button.${index}`}
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

        {/* Inline reply form */}
        <AnimatePresence>
          {isReplying && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
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
                  className="w-4 h-4 flex items-center justify-center rounded text-primary/60 hover:text-primary hover:bg-primary/10 transition-colors focus-visible:outline-none"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <CommentForm
                sourceId={sourceId}
                parentCommentId={comment.id}
                sessionId={sessionId}
                authorUsername={verifiedUsername ?? username}
                onCancel={() => onToggleReply(null)}
                onSuccess={() => onToggleReply(null)}
                autoFocus
                ocidPrefix={`source_discussion.nested.${index}`}
                placeholder="Write a reply\u2026"
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

// ── Main SourceDiscussion Component ────────────────────────────────────────────────

interface SourceDiscussionProps {
  sourceId: bigint;
  sessionId: string;
}

export function SourceDiscussion({
  sourceId,
  sessionId,
}: SourceDiscussionProps) {
  const [replyingToId, setReplyingToId] = useState<bigint | null>(null);
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());
  const username = useUsername();
  const { username: verifiedUsername, avatarUrl } = useVerifiedAccount();
  const reportComment = useReportSourceComment();
  const { checkAction } = useSessionGate();

  const { data: comments = [], isLoading } = useSourceComments(sourceId);
  const { data: likeCounts = {} } = useSourceCommentLikeCounts(sourceId);

  async function handleReport(commentId: bigint) {
    const key = commentId.toString();
    if (!checkAction()) return;
    if (reportedIds.has(key)) return;
    try {
      await reportComment.mutateAsync({ commentId, sessionId });
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

  // Build simple parent→children map using actual parentCommentId
  const childrenByParent = new Map<string, SourceComment[]>();
  for (const c of comments) {
    if (c.parentCommentId === 0n) continue;
    const key = c.parentCommentId.toString();
    if (!childrenByParent.has(key)) childrenByParent.set(key, []);
    childrenByParent.get(key)!.push(c);
  }
  // Sort children by most likes
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

  const topLevelComments = comments.filter((c) => c.parentCommentId === 0n);
  const sortedTopLevel = [...topLevelComments].sort(
    (a, b) =>
      (likeCounts[b.id.toString()] ?? 0) - (likeCounts[a.id.toString()] ?? 0),
  );

  let globalIndex = 0;
  function nextIndex() {
    globalIndex += 1;
    return globalIndex;
  }

  function renderComment(
    comment: SourceComment,
    depth: number,
  ): React.ReactNode {
    const idx = nextIndex();
    const nested = childrenByParent.get(comment.id.toString()) ?? [];
    return (
      <CommentCard
        key={comment.id.toString()}
        comment={comment}
        sourceId={sourceId}
        sessionId={sessionId}
        username={username}
        verifiedUsername={verifiedUsername ?? undefined}
        avatarUrl={avatarUrl ?? undefined}
        index={idx}
        depth={depth}
        reportedIds={reportedIds}
        onReport={handleReport}
        replyingToId={replyingToId}
        onToggleReply={setReplyingToId}
        likeCounts={likeCounts}
      >
        {nested.length > 0 && depth < 4 && (
          <div className="space-y-0">
            {nested.map((child) => renderComment(child, depth + 1))}
          </div>
        )}
      </CommentCard>
    );
  }

  return (
    <div data-ocid="source_discussion.panel">
      {/* Top-level comment form */}
      <div className="mb-6">
        <CommentForm
          sourceId={sourceId}
          parentCommentId={0n}
          sessionId={sessionId}
          authorUsername={verifiedUsername ?? username}
          ocidPrefix="source_discussion.toplevel"
          placeholder="Share your analysis of this source\u2026"
        />
      </div>

      {/* Comments list */}
      {isLoading ? (
        <div data-ocid="source_discussion.loading_state" className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div
          data-ocid="source_discussion.empty_state"
          className="flex flex-col items-center py-10 text-center text-muted-foreground"
        >
          <MessageSquare className="h-8 w-8 mb-3 opacity-20" />
          <p className="text-sm font-body">
            No comments yet. Start the discussion!
          </p>
        </div>
      ) : (
        <motion.div
          data-ocid="source_discussion.list"
          className="space-y-0"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.04 } },
            hidden: {},
          }}
        >
          {sortedTopLevel.map((comment) => (
            <motion.div
              key={comment.id.toString()}
              variants={{
                hidden: { opacity: 0, y: 4 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              {renderComment(comment, 0)}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
