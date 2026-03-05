import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateClaim } from "@/hooks/useQueries";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ImageUploader } from "./ImageUploader";
import { UrlInputList } from "./UrlInputList";

const CATEGORIES = [
  "Science",
  "Politics",
  "Health",
  "Technology",
  "Sports",
  "Entertainment",
  "Religion",
  "Other",
];

interface SubmitClaimDialogProps {
  sessionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubmitClaimDialog({
  sessionId,
  open,
  onOpenChange,
}: SubmitClaimDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [claimImageUrls, setClaimImageUrls] = useState<string[]>([]);
  const [claimUrls, setClaimUrls] = useState<string[]>([]);
  const createClaim = useCreateClaim();

  function handleClose() {
    onOpenChange(false);
    setTitle("");
    setDescription("");
    setCategory("");
    setClaimImageUrls([]);
    setClaimUrls([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category) return;

    try {
      await createClaim.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        category,
        sessionId,
        imageUrls: claimImageUrls,
        urls: claimUrls.filter((u) => u.trim()),
      });
      toast.success("Claim submitted for community review");
      handleClose();
    } catch {
      toast.error("Failed to submit claim. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border flex flex-col max-h-[90vh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="font-display text-xl">
            Submit a Claim
          </DialogTitle>
          <DialogDescription className="font-body text-muted-foreground">
            Submit a publicly verifiable claim for community fact-checking. Be
            specific and include the claim as it was stated.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto -mx-1 px-1">
          <form
            id="submit-claim-form"
            onSubmit={handleSubmit}
            className="space-y-4 mt-2 pb-2"
          >
            <div className="space-y-1.5">
              <Label
                htmlFor="claim-title"
                className="font-body font-medium text-foreground"
              >
                Claim Title
              </Label>
              <Input
                id="claim-title"
                data-ocid="submit_claim.input"
                placeholder="e.g. Scientists discover new exoplanet in habitable zone"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                required
                className="bg-secondary border-border font-body"
              />
              <p className="text-xs text-muted-foreground text-right">
                {title.length}/200
              </p>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="claim-description"
                className="font-body font-medium text-foreground"
              >
                Description
              </Label>
              <Textarea
                id="claim-description"
                data-ocid="submit_claim.textarea"
                placeholder="Provide context, source, or the full claim statement..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={2000}
                required
                className="bg-secondary border-border font-body resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/2000
              </p>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="claim-category"
                className="font-body font-medium text-foreground"
              >
                Category
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger
                  id="claim-category"
                  data-ocid="submit_claim.select"
                  className="bg-secondary border-border font-body"
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="font-body">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image uploader */}
            <div className="space-y-1.5">
              <Label className="font-body font-medium text-foreground">
                Supporting Images{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <ImageUploader
                onUploaded={setClaimImageUrls}
                maxFiles={5}
                ocidPrefix="submit_claim.image"
              />
            </div>

            {/* URL list */}
            <div className="space-y-1.5">
              <Label className="font-body font-medium text-foreground">
                Supporting Links{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <UrlInputList
                urls={claimUrls}
                onChange={setClaimUrls}
                ocidPrefix="submit_claim.url"
                placeholder="https://example.com/source"
              />
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="gap-2 mt-2 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            data-ocid="submit_claim.cancel_button"
            className="font-body border-border"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="submit-claim-form"
            data-ocid="submit_claim.submit_button"
            disabled={
              createClaim.isPending ||
              !title.trim() ||
              !description.trim() ||
              !category
            }
            className="font-body bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {createClaim.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Submit Claim
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
