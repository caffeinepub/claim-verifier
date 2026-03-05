import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useClaimById,
  useEvidence,
  useSessionVote,
  useSubmitEvidence,
  useSubmitVote,
  useVoteTally,
} from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/time";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Link2,
  Loader2,
  MessageSquare,
  Send,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { CategoryBadge } from "./CategoryBadge";
import { ImageUploader } from "./ImageUploader";
import { Lightbox } from "./Lightbox";
import { UrlInputList } from "./UrlInputList";
import { VerdictBar } from "./VerdictBar";

interface ClaimDetailProps {
  claimId: bigint;
  sessionId: string;
  onBack: () => void;
}

function UrlChips({ urls }: { urls: string[] }) {
  const valid = urls.filter((u) => u.trim());
  if (!valid.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-3">
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

function ImageGrid({
  imageUrls,
  size = "md",
}: {
  imageUrls: string[];
  size?: "sm" | "md";
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!imageUrls.length) return null;
  const heightClass = size === "sm" ? "h-24" : "h-32";

  function openLightbox(index: number) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-3">
        {imageUrls.map((url, i) => (
          <button
            // biome-ignore lint/suspicious/noArrayIndexKey: stable ordered list
            key={i}
            type="button"
            data-ocid="image.open_modal_button"
            onClick={() => openLightbox(i)}
            className={cn(
              "block rounded-sm overflow-hidden border border-border hover:border-primary/40 transition-colors flex-shrink-0 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
              heightClass,
            )}
            aria-label={`View attachment ${i + 1} fullscreen`}
          >
            <img
              src={url}
              alt={`Attachment ${i + 1}`}
              className={cn("object-cover h-full w-auto max-w-[160px]")}
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

export function ClaimDetail({ claimId, sessionId, onBack }: ClaimDetailProps) {
  const [evidenceText, setEvidenceText] = useState("");
  const [evidenceImageUrls, setEvidenceImageUrls] = useState<string[]>([]);
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);

  const { data: claim, isLoading: claimLoading } = useClaimById(claimId);
  const { data: tally, isLoading: tallyLoading } = useVoteTally(claimId);
  const { data: sessionVote } = useSessionVote(claimId, sessionId);
  const { data: evidence, isLoading: evidenceLoading } = useEvidence(claimId);
  const submitVote = useSubmitVote();
  const submitEvidence = useSubmitEvidence();

  const hasVoted = !!sessionVote;

  async function handleVote(verdict: string) {
    if (!sessionId || hasVoted) return;
    try {
      await submitVote.mutateAsync({ claimId, sessionId, verdict });
      toast.success(`Your verdict: ${verdict}`);
    } catch {
      toast.error("Failed to record vote");
    }
  }

  async function handleSubmitEvidence(e: React.FormEvent) {
    e.preventDefault();
    if (!evidenceText.trim() || !sessionId) return;
    try {
      await submitEvidence.mutateAsync({
        claimId,
        sessionId,
        text: evidenceText.trim(),
        imageUrls: evidenceImageUrls,
        urls: evidenceUrls.filter((u) => u.trim()),
      });
      toast.success("Evidence submitted");
      setEvidenceText("");
      setEvidenceImageUrls([]);
      setEvidenceUrls([]);
    } catch {
      toast.error("Failed to submit evidence");
    }
  }

  return (
    <motion.div
      data-ocid="claim_detail.panel"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto"
    >
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={onBack}
        data-ocid="nav.back_button"
        className="mb-6 -ml-2 font-body text-muted-foreground hover:text-foreground gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Claims
      </Button>

      {claimLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : claim ? (
        <article className="space-y-6">
          {/* Header */}
          <header>
            <div className="flex items-center gap-2 mb-3">
              <CategoryBadge category={claim.category} />
              <span className="text-xs text-muted-foreground font-body">
                {formatRelativeTime(claim.timestamp)}
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight text-foreground mb-4">
              {claim.title}
            </h1>
            <p className="font-body text-base text-muted-foreground leading-relaxed">
              {claim.description}
            </p>
            {/* Claim images */}
            <ImageGrid imageUrls={claim.imageUrls ?? []} size="md" />
            {/* Claim URLs */}
            <UrlChips urls={claim.urls ?? []} />
          </header>

          <div className="h-px masthead-rule" />

          {/* Verdict Tally */}
          <section>
            <h2 className="font-display text-lg font-semibold mb-4 text-foreground">
              Community Verdict
            </h2>
            {tallyLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-3 w-full rounded-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ) : tally ? (
              <VerdictBar
                trueCount={tally.trueCount}
                falseCount={tally.falseCount}
                unverifiedCount={tally.unverifiedCount}
              />
            ) : null}
          </section>

          {/* Vote Buttons */}
          <section>
            <h2 className="font-display text-lg font-semibold mb-3 text-foreground">
              Cast Your Verdict
            </h2>
            <p className="text-sm text-muted-foreground font-body mb-4">
              {hasVoted
                ? `You've already voted: ${sessionVote}. Only one vote is allowed per claim.`
                : "Vote anonymously. Your session ID is used to track one vote per claim."}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                data-ocid="claim_detail.true_button"
                onClick={() => handleVote("True")}
                disabled={submitVote.isPending || hasVoted}
                variant="outline"
                className={cn(
                  "font-body gap-2 border-2 transition-all",
                  sessionVote === "True"
                    ? "bg-verdict-true-subtle border-verdict-true verdict-true"
                    : hasVoted
                      ? "border-border opacity-40 cursor-not-allowed"
                      : "border-border hover:border-verdict-true hover:bg-verdict-true-subtle hover:verdict-true",
                )}
              >
                {submitVote.isPending &&
                submitVote.variables?.verdict === "True" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                True
              </Button>

              <Button
                data-ocid="claim_detail.false_button"
                onClick={() => handleVote("False")}
                disabled={submitVote.isPending || hasVoted}
                variant="outline"
                className={cn(
                  "font-body gap-2 border-2 transition-all",
                  sessionVote === "False"
                    ? "bg-verdict-false-subtle border-verdict-false verdict-false"
                    : hasVoted
                      ? "border-border opacity-40 cursor-not-allowed"
                      : "border-border hover:border-verdict-false hover:bg-verdict-false-subtle hover:verdict-false",
                )}
              >
                {submitVote.isPending &&
                submitVote.variables?.verdict === "False" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                False
              </Button>

              <Button
                data-ocid="claim_detail.unverified_button"
                onClick={() => handleVote("Unverified")}
                disabled={submitVote.isPending || hasVoted}
                variant="outline"
                className={cn(
                  "font-body gap-2 border-2 transition-all",
                  sessionVote === "Unverified"
                    ? "bg-verdict-unverified-subtle border-verdict-unverified verdict-unverified"
                    : hasVoted
                      ? "border-border opacity-40 cursor-not-allowed"
                      : "border-border hover:border-verdict-unverified hover:bg-verdict-unverified-subtle hover:verdict-unverified",
                )}
              >
                {submitVote.isPending &&
                submitVote.variables?.verdict === "Unverified" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <HelpCircle className="h-4 w-4" />
                )}
                Unverified
              </Button>
            </div>
          </section>

          <div className="h-px masthead-rule" />

          {/* Evidence */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-display text-lg font-semibold text-foreground">
                Community Evidence
              </h2>
              {evidence && (
                <span className="text-sm text-muted-foreground font-body">
                  ({evidence.length})
                </span>
              )}
            </div>

            {/* Add Evidence Form */}
            <form onSubmit={handleSubmitEvidence} className="mb-6">
              <div className="space-y-3">
                <Textarea
                  data-ocid="evidence.textarea"
                  placeholder="Share a source, counter-argument, or supporting evidence…"
                  value={evidenceText}
                  onChange={(e) => setEvidenceText(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  className="bg-secondary border-border font-body resize-none"
                />

                {/* Image uploader */}
                <div>
                  <p className="text-xs text-muted-foreground font-body mb-1.5">
                    Attach images (optional)
                  </p>
                  <ImageUploader
                    onUploaded={setEvidenceImageUrls}
                    maxFiles={5}
                    ocidPrefix="evidence.image"
                  />
                </div>

                {/* URL list */}
                <div>
                  <p className="text-xs text-muted-foreground font-body mb-1.5">
                    Attach links (optional)
                  </p>
                  <UrlInputList
                    urls={evidenceUrls}
                    onChange={setEvidenceUrls}
                    ocidPrefix="evidence.url"
                    placeholder="https://example.com/source"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-body">
                    {evidenceText.length}/1000
                  </span>
                  <Button
                    type="submit"
                    data-ocid="evidence.submit_button"
                    disabled={submitEvidence.isPending || !evidenceText.trim()}
                    size="sm"
                    className="font-body gap-2 bg-primary text-primary-foreground"
                  >
                    {submitEvidence.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                    Add Evidence
                  </Button>
                </div>
              </div>
            </form>

            {/* Evidence List */}
            {evidenceLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="space-y-2 p-3 bg-secondary rounded-sm"
                  >
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))}
              </div>
            ) : evidence && evidence.length > 0 ? (
              <ScrollArea className="max-h-[600px]">
                <div className="space-y-3 pr-4">
                  <AnimatePresence>
                    {evidence.map((item, idx) => (
                      <motion.div
                        key={item.id.toString()}
                        data-ocid={`evidence.item.${idx + 1}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-4 bg-secondary border border-border rounded-sm"
                      >
                        <p className="text-sm text-foreground font-body leading-relaxed">
                          {item.text}
                        </p>
                        {/* Evidence images */}
                        <ImageGrid imageUrls={item.imageUrls ?? []} size="sm" />
                        {/* Evidence URLs */}
                        <UrlChips urls={item.urls ?? []} />
                        <p className="text-xs text-muted-foreground font-body mt-2">
                          Anonymous · {formatRelativeTime(item.timestamp)}
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground font-body">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No evidence submitted yet.</p>
                <p className="text-xs mt-1 opacity-70">
                  Be the first to share a source or argument.
                </p>
              </div>
            )}
          </section>
        </article>
      ) : (
        <div
          data-ocid="claim_detail.error_state"
          className="text-center py-16 text-muted-foreground"
        >
          <p>Claim not found.</p>
          <Button variant="ghost" onClick={onBack} className="mt-4 font-body">
            Go back
          </Button>
        </div>
      )}
    </motion.div>
  );
}
