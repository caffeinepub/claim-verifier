import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const REPORT_REASONS = [
  "Spam",
  "Duplicate",
  "Misinformation",
  "Offensive Content",
  "Other",
] as const;

type ReportReason = (typeof REPORT_REASONS)[number];

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  title?: string;
}

export function ReportDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Report Content",
}: ReportDialogProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | "">("");
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset state whenever the dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedReason("");
      setIsPending(false);
      setIsSuccess(false);
      setErrorMessage(null);
    }
  }, [isOpen]);

  async function handleConfirm() {
    if (!selectedReason) return;
    setIsPending(true);
    setErrorMessage(null);
    try {
      await onConfirm(selectedReason);
      setIsSuccess(true);
    } catch {
      setErrorMessage("Failed to submit report. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      data-ocid="report.dialog"
    >
      <DialogContent
        data-ocid="report.dialog"
        className="sm:max-w-md font-body"
        onInteractOutside={(e) => {
          // Prevent closing while submitting
          if (isPending) e.preventDefault();
        }}
      >
        {isSuccess ? (
          // ── Success State ─────────────────────────────────────────────────
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-foreground">
                {title}
              </DialogTitle>
            </DialogHeader>
            <div
              data-ocid="report.success_state"
              className="flex flex-col items-center gap-3 py-6 text-center"
            >
              <CheckCircle2 className="h-10 w-10 text-green-500" />
              <p className="text-sm text-foreground font-body font-medium">
                Thank you for your report.
              </p>
              <p className="text-xs text-muted-foreground font-body">
                Our community moderators will review this content.
              </p>
            </div>
            <DialogFooter>
              <Button
                data-ocid="report.close_button"
                onClick={onClose}
                className="font-body w-full sm:w-auto"
              >
                Close
              </Button>
            </DialogFooter>
          </>
        ) : (
          // ── Report Form ───────────────────────────────────────────────────
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-foreground">
                {title}
              </DialogTitle>
              <DialogDescription className="font-body text-muted-foreground text-sm">
                Please select a reason so our moderators can review this content
                appropriately.
              </DialogDescription>
            </DialogHeader>

            <div className="py-2">
              <RadioGroup
                value={selectedReason}
                onValueChange={(v) => setSelectedReason(v as ReportReason)}
                className="space-y-2"
              >
                {REPORT_REASONS.map((reason) => (
                  <div key={reason} className="flex items-center gap-3">
                    <RadioGroupItem
                      value={reason}
                      id={`report-reason-${reason.toLowerCase().replace(/\s+/g, "-")}`}
                      data-ocid="report.reason.radio"
                      className="border-border text-primary"
                    />
                    <Label
                      htmlFor={`report-reason-${reason.toLowerCase().replace(/\s+/g, "-")}`}
                      className="font-body text-sm text-foreground cursor-pointer"
                    >
                      {reason}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {/* Error state */}
              {errorMessage && (
                <div
                  data-ocid="report.error_state"
                  className="mt-4 flex items-start gap-2 rounded-sm bg-destructive/10 border border-destructive/20 px-3 py-2.5"
                >
                  <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-body text-destructive">
                    {errorMessage}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                data-ocid="report.cancel_button"
                variant="ghost"
                onClick={onClose}
                disabled={isPending}
                className="font-body text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                data-ocid="report.confirm_button"
                onClick={handleConfirm}
                disabled={!selectedReason || isPending}
                className="font-body gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isPending ? "Reporting…" : "Report"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
