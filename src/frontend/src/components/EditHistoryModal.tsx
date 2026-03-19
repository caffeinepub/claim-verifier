import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { EditHistoryEntry } from "@/hooks/useEditSystem";
import { formatRelativeTime } from "@/utils/time";
import { History } from "lucide-react";

interface EditHistoryModalProps {
  open: boolean;
  onClose: () => void;
  history: EditHistoryEntry[];
  currentText: string;
  currentEditedAt: number;
}

export function EditHistoryModal({
  open,
  onClose,
  history,
  currentText,
  currentEditedAt,
}: EditHistoryModalProps) {
  // Build a combined list: current version first, then history newest→oldest
  const allVersions = [
    { text: currentText, editedAt: currentEditedAt, isCurrent: true },
    ...[...history].reverse().map((h) => ({ ...h, isCurrent: false })),
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-w-lg" data-ocid="edit_history.dialog">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            Edit History
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-2">
          <div className="space-y-3">
            {allVersions.map(
              (
                version,
                idx, // biome-ignore lint/suspicious/noArrayIndexKey: edit history has no stable id
              ) => (
                <div
                  key={version.editedAt.toString()}
                  className="rounded-sm border border-border bg-secondary p-3 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold font-body text-muted-foreground">
                      {version.isCurrent
                        ? "Current version"
                        : `Version ${allVersions.length - idx - 1}`}
                    </span>
                    <span className="text-xs text-muted-foreground font-body">
                      {formatRelativeTime(BigInt(version.editedAt * 1_000_000))}
                    </span>
                  </div>
                  <p className="text-sm font-body text-foreground leading-relaxed whitespace-pre-wrap">
                    {version.text}
                  </p>
                </div>
              ),
            )}
            {allVersions.length === 1 && (
              <p className="text-xs text-muted-foreground font-body italic text-center py-2">
                No previous versions
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
