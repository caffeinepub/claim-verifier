import { EditHistoryModal } from "@/components/EditHistoryModal";
import { ImageUploader } from "@/components/ImageUploader";
import { Lightbox } from "@/components/Lightbox";
import { ReportDialog } from "@/components/ReportDialog";
import { UrlInputList } from "@/components/UrlInputList";
import { UserAvatar } from "@/components/UserAvatar";
import {
  UserProfileCard,
  isVerifiedUsername,
} from "@/components/UserProfileCard";
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
  canEditContent,
  getEditRecord,
  saveEditRecord,
} from "@/hooks/useEditSystem";
import {
  type Reply,
  useAddReply,
  useLikeReply,
  useProfileByUsername,
  useReplies,
  useReplyLikeCounts,
  useReportReply,
  useSessionLikeForReply,
  useUsername,
} from "@/hooks/useQueries";
import { useAddReputationEvent } from "@/hooks/useQueries";
import { useSessionGate } from "@/hooks/useSessionGate";
import {
  appendUserComment,
  getActivePrincipalId,
  isTrustedContributorSession,
  useVerifiedAccount,
} from "@/hooks/useVerifiedAccount";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/time";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  CornerDownRight,
  ExternalLink,
  Flag,
  Link2,
  Loader2,
  LogIn,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Send,
  Share2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ── Attachment helpers ────────────────────────────────────────────────────────────

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

// ── URL Chips ────────────────────────────────────────────────────────────────────

function UrlChips({ urls }: { urls: string[] }) {
  const valid = urls.filter((u) => u.trim());
  if (!valid.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {valid.map((url, i) => (
        <a
          // biome-ignore lint/suspicious/noArrayIndexKey: stable ordered list
          key={i}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-secondary border border-border text-xs font-body text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors max-w-[200px]"
        >
          <Link2 className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{url.replace(/^https?:\/\//, "")}</span>
          <ExternalLink className="h-2.5 w-2.5 flex-shrink-0 opacity-60" />
        </a>
      ))}
    </div>
  );
}

// ── Reply Image Grid with Lightbox ───────────────────────────────────────────────

function ReplyImageGrid({ imageUrls }: { imageUrls: string[] }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!imageUrls.length) return null;

  function openLightbox(index: number) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  return (
    <>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {imageUrls.map((url, i) => (
          <button
            // biome-ignore lint/suspicious/noArrayIndexKey: stable ordered list
            key={i}
            type="button"
            data-ocid="image.open_modal_button"
            onClick={() => openLightbox(i)}
            className="block rounded-sm overflow-hidden border border-border hover:border-primary/40 transition-colors flex-shrink-0 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 h-24"
            aria-label={`View attachment ${i + 1} fullscreen`}
          >
            <img
              src={url}
              alt={`Attachment ${i + 1}`}
              className="object-cover h-full w-auto max-w-[200px]"
              loading="lazy"
              draggable={false}
            />
          </button>
        ))}
      </div>
      <Lightbox
        imageUrls={imageUrls}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}

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
  collapsible?: boolean;
  placeholder?: string;
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
  collapsible = false,
  placeholder = "Write a reply\u2026",
}: ReplyFormProps) {
  const [text, setText] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [uploaderKey, setUploaderKey] = useState(0);
  const [urls, setUrls] = useState<string[]>([]);
  const [showLinks, setShowLinks] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [isExpanded, setIsExpanded] = useState(!collapsible || autoFocus);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const addReply = useAddReply();
  const { checkAction } = useSessionGate();
  const addRepEvent = useAddReputationEvent();
  const { principal: verifiedPrincipal } = useVerifiedAccount();

  // Auto-focus textarea when expanded programmatically
  useEffect(() => {
    if (isExpanded && collapsible && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isExpanded, collapsible]);

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

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    // Auto-grow
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  function handleFormBlur(e: React.FocusEvent<HTMLFormElement>) {
    if (!collapsible) return;
    // Only collapse if focus moves entirely outside the form
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
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
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || cooldownLeft > 0) return;
    if (!checkAction()) return;
    try {
      const encodedText = encodeAttachments(text.trim(), imageUrls, urls);
      await addReply.mutateAsync({
        evidenceId,
        parentReplyId,
        text: encodedText,
        authorUsername,
        sessionId,
      });
      collapse();
      const pid = getActivePrincipalId();
      if (pid) {
        const ts = new Date().toISOString();
        appendUserComment(pid, {
          replyId: String(Date.now()),
          claimId: String(evidenceId),
          claimTitle: "",
          text: text.trim(),
          timestamp: ts,
        });
      }
      if (verifiedPrincipal) {
        addRepEvent.mutate({
          principal: verifiedPrincipal,
          action: "reply_posted",
          points: 1n,
        });
      }
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

  // Collapsed placeholder
  if (collapsible && !isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className="w-full text-left px-3 py-2 rounded-md border border-border bg-muted/30 text-sm text-muted-foreground font-body hover:border-primary/40 hover:bg-muted/40 transition-colors"
      >
        {placeholder}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} onBlur={handleFormBlur} className="space-y-2">
      <Textarea
        ref={textareaRef}
        data-ocid={`${ocidPrefix}.textarea`}
        placeholder={placeholder}
        value={text}
        onChange={handleTextChange}
        maxLength={500}
        autoFocus={autoFocus || (collapsible && isExpanded)}
        className="bg-card border-border font-body resize-none text-sm min-h-[4rem] overflow-hidden"
        style={{ height: "auto" }}
      />
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="reply-controls"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden space-y-2"
          >
            {/* Image uploader */}
            <ImageUploader
              key={uploaderKey}
              onUploaded={setImageUrls}
              onUploadingChange={setIsImageUploading}
              maxFiles={3}
              ocidPrefix={`${ocidPrefix}.image`}
            />
            {isImageUploading && (
              <p className="text-xs text-muted-foreground font-body flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Uploading images, please wait...
              </p>
            )}
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
                {(onCancel || collapsible) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    data-ocid={`${ocidPrefix}.cancel_button`}
                    onClick={() => {
                      collapse();
                      onCancel?.();
                    }}
                    className="h-7 px-2.5 font-body text-xs text-muted-foreground"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  size="sm"
                  data-ocid={`${ocidPrefix}.submit_button`}
                  disabled={
                    addReply.isPending ||
                    cooldownLeft > 0 ||
                    isImageUploading ||
                    !text.trim()
                  }
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
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

// ── Single Reply Card ───────────────────────────────────────────────────────────────

interface ReplyCardProps {
  reply: Reply;
  sessionId: string;
  username: string;
  verifiedUsername?: string;
  avatarUrl?: string;
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
  principalId: string | null;
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
  likeCounts,
  principalId,
}: ReplyCardProps) {
  const {
    text: displayText,
    imageUrls: attachedImages,
    urls: attachedUrls,
  } = decodeAttachments(reply.text);

  const isOwnReply = reply.sessionId === sessionId;
  const displayAuthor = isOwnReply
    ? (verifiedUsername ?? username)
    : reply.authorUsername;
  const { data: authorProfile } = useProfileByUsername(
    isOwnReply ? null : reply.authorUsername,
  );
  const displayAvatarUrl = isOwnReply
    ? avatarUrl
    : authorProfile?.avatarUrl || undefined;
  const isReplying = replyingToId === reply.id;
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [isEditingReply, setIsEditingReply] = useState(false);
  const [replyEditText, setReplyEditText] = useState("");
  const [replyEditHistoryOpen, setReplyEditHistoryOpen] = useState(false);

  // Derive edit record (read on each render since principalId may be null initially)
  const replyEditRecord = principalId
    ? getEditRecord("reply", reply.id.toString(), principalId)
    : null;

  const showReplyEdit =
    !!principalId &&
    canEditContent(
      "reply",
      reply.timestamp,
      reply.sessionId,
      sessionId,
      principalId,
    );

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
          <UserProfileCard
            username={displayAuthor}
            isVerified={
              isOwnReply
                ? !!verifiedUsername
                : isVerifiedUsername(displayAuthor)
            }
          >
            <UserAvatar
              username={displayAuthor}
              size="sm"
              avatarUrl={displayAvatarUrl}
              isVerified={
                isOwnReply ? !!verifiedUsername : !!authorProfile?.username
              }
            />
            <span className="text-xs font-semibold text-foreground font-body flex items-center gap-1">
              {displayAuthor}
              {isTrustedContributorSession(reply.sessionId) && (
                <VerifiedBadge />
              )}
            </span>
          </UserProfileCard>
          <span className="text-xs text-muted-foreground font-body">·</span>
          <span className="text-xs text-muted-foreground font-body">
            {formatRelativeTime(reply.timestamp)}
          </span>
        </div>

        {/* Reply text */}
        {isEditingReply ? (
          <div className="mb-2 space-y-1">
            <Textarea
              value={replyEditText}
              onChange={(e) => setReplyEditText(e.target.value)}
              rows={3}
              maxLength={1000}
              className="bg-card border-border font-body resize-none text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!replyEditText.trim() || !principalId) return;
                  saveEditRecord(
                    "reply",
                    reply.id.toString(),
                    principalId,
                    replyEditText.trim(),
                    replyEditRecord?.currentText ?? displayText,
                    0,
                  );
                  setIsEditingReply(false);
                  toast.success("Reply updated");
                }}
                className="flex items-center gap-1 h-6 px-2 text-xs font-body bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors"
              >
                <Check className="h-3 w-3" />
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setReplyEditText("");
                  setIsEditingReply(false);
                }}
                className="flex items-center gap-1 h-6 px-2 text-xs font-body text-muted-foreground hover:text-foreground rounded-sm hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-2 group/replytext">
            <p className="text-sm text-foreground font-body leading-relaxed inline">
              {replyEditRecord?.currentText ?? displayText}
            </p>
            {replyEditRecord && (
              <button
                type="button"
                onClick={() => setReplyEditHistoryOpen(true)}
                className="ml-1 text-xs text-muted-foreground italic font-body hover:text-foreground transition-colors"
              >
                (edited)
              </button>
            )}
            {showReplyEdit && (
              <button
                type="button"
                onClick={() => {
                  setReplyEditText(replyEditRecord?.currentText ?? displayText);
                  setIsEditingReply(true);
                }}
                className="ml-1.5 inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover/replytext:opacity-100 transition-opacity"
                aria-label="Edit reply"
              >
                <Pencil className="h-2.5 w-2.5" />
              </button>
            )}
          </div>
        )}

        {/* Decoded attachments — images with lightbox */}
        {attachedImages.length > 0 && (
          <ReplyImageGrid imageUrls={attachedImages} />
        )}

        {/* Decoded attachments — links */}
        {attachedUrls.filter(Boolean).length > 0 && (
          <UrlChips urls={attachedUrls} />
        )}

        {replyEditRecord && (
          <EditHistoryModal
            open={replyEditHistoryOpen}
            onClose={() => setReplyEditHistoryOpen(false)}
            history={replyEditRecord.editHistory}
            currentText={replyEditRecord.currentText}
            currentEditedAt={replyEditRecord.lastEditedAt}
          />
        )}

        {/* Actions row: [Reply] [ChevronUp] ... [⋯] */}
        <div className="flex items-center gap-1 mt-2">
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
                authorUsername={verifiedUsername ?? username}
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
  const {
    username: verifiedUsername,
    avatarUrl,
    principal: verifiedPrincipal,
  } = useVerifiedAccount();
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
        verifiedUsername={verifiedUsername ?? undefined}
        avatarUrl={avatarUrl ?? undefined}
        index={idx}
        depth={depth}
        reportedIds={reportedIds}
        onReport={handleReport}
        evidenceId={evidenceId}
        replyingToId={replyingToId}
        onToggleReply={handleToggleReply}
        evidenceIndex={evidenceIndex}
        likeCounts={likeCounts}
        principalId={verifiedPrincipal?.toString() ?? null}
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
              {/* Collapsible top-level reply form — at the TOP */}
              <AnimatePresence>
                {replyingToId === null && (
                  <motion.div
                    key="toplevel-form"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="mb-3 overflow-hidden"
                  >
                    <ReplyForm
                      evidenceId={evidenceId}
                      parentReplyId={0n}
                      sessionId={sessionId}
                      authorUsername={verifiedUsername ?? username}
                      ocidPrefix={`reply.toplevel.${evidenceIndex}`}
                      collapsible
                      placeholder="Write a reply\u2026"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Replies list */}
              {isLoading ? (
                <div
                  data-ocid={`reply.loading_state.${evidenceIndex}`}
                  className="py-3 text-xs text-muted-foreground font-body flex items-center gap-2"
                >
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading replies\u2026
                </div>
              ) : replies.length > 0 ? (
                <div className="space-y-0">
                  {sortedTopLevel.map((reply) => renderReply(reply, 0))}
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
