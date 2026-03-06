import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useStorageClient } from "@/hooks/useStorageClient";
import { cn } from "@/lib/utils";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

interface FileState {
  file: File;
  previewUrl: string;
  progress: number; // 0-100, -1 = error
  uploadedUrl: string | null;
}

interface ImageUploaderProps {
  onUploaded: (urls: string[]) => void;
  maxFiles?: number;
  ocidPrefix?: string;
}

export function ImageUploader({
  onUploaded,
  maxFiles = 5,
  ocidPrefix = "image",
}: ImageUploaderProps) {
  const [files, setFiles] = useState<FileState[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: storageClient } = useStorageClient();

  const uploadFile = useCallback(
    async (fileState: FileState, index: number) => {
      if (!storageClient) {
        toast.error("Storage not ready. Please try again.");
        return;
      }

      try {
        const arrayBuffer = await fileState.file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        const { hash } = await storageClient.putFile(bytes, (pct) => {
          setFiles((prev) =>
            prev.map((f, i) => (i === index ? { ...f, progress: pct } : f)),
          );
        });

        const url = await storageClient.getDirectURL(hash);

        setFiles((prev) => {
          const updated = prev.map((f, i) =>
            i === index ? { ...f, progress: 100, uploadedUrl: url } : f,
          );
          // Notify parent of all completed URLs
          const completedUrls = updated
            .filter((f) => f.uploadedUrl !== null)
            .map((f) => f.uploadedUrl as string);
          onUploaded(completedUrls);
          return updated;
        });
      } catch (err) {
        console.error("Image upload failed:", err);
        toast.error(`Failed to upload ${fileState.file.name}. Skipping.`);
        setFiles((prev) =>
          prev.map((f, i) => (i === index ? { ...f, progress: -1 } : f)),
        );
      }
    },
    [storageClient, onUploaded],
  );

  const handleFiles = useCallback(
    (incoming: FileList | File[]) => {
      const arr = Array.from(incoming).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (!arr.length) return;

      setFiles((prev) => {
        const remaining = maxFiles - prev.length;
        if (remaining <= 0) {
          toast.error(`Maximum ${maxFiles} images allowed.`);
          return prev;
        }

        const slice = arr.slice(0, remaining);
        const newStates: FileState[] = slice.map((file) => ({
          file,
          previewUrl: URL.createObjectURL(file),
          progress: 0,
          uploadedUrl: null,
        }));

        const nextFiles = [...prev, ...newStates];
        // Start uploads for each new file
        const baseIndex = prev.length;
        newStates.forEach((fs, i) => {
          uploadFile(fs, baseIndex + i);
        });

        return nextFiles;
      });
    },
    [maxFiles, uploadFile],
  );

  const removeFile = useCallback(
    (index: number) => {
      setFiles((prev) => {
        const toRemove = prev[index];
        if (toRemove?.previewUrl) {
          URL.revokeObjectURL(toRemove.previewUrl);
        }
        const updated = prev.filter((_, i) => i !== index);
        // Notify parent of updated URLs
        const completedUrls = updated
          .filter((f) => f.uploadedUrl !== null)
          .map((f) => f.uploadedUrl as string);
        onUploaded(completedUrls);
        return updated;
      });
    },
    [onUploaded],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const canAddMore = files.length < maxFiles;

  return (
    <div className="space-y-3">
      {/* Thumbnails row */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((fs, i) => (
            <div
              key={`${fs.file.name}-${i}`}
              className="relative group w-20 h-20 rounded-sm overflow-hidden border border-border bg-secondary flex-shrink-0"
            >
              <img
                src={fs.previewUrl}
                alt={fs.file.name}
                className="w-full h-full object-cover"
              />
              {/* Upload progress overlay */}
              {fs.progress < 100 && fs.progress >= 0 && (
                <div className="absolute inset-0 bg-background/70 flex flex-col items-center justify-center gap-1 p-1">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <Progress value={fs.progress} className="h-1 w-14" />
                  <span className="text-[10px] text-primary font-body">
                    {fs.progress}%
                  </span>
                </div>
              )}
              {/* Error overlay */}
              {fs.progress === -1 && (
                <div className="absolute inset-0 bg-destructive/30 flex items-center justify-center">
                  <span className="text-[10px] text-destructive-foreground font-body text-center px-1">
                    Failed
                  </span>
                </div>
              )}
              {/* Remove button */}
              <button
                type="button"
                data-ocid={`${ocidPrefix}.delete_button.${i + 1}`}
                onClick={() => removeFile(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-background/80 hover:bg-destructive/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove image ${i + 1}`}
              >
                <X className="h-3 w-3 text-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone / add button */}
      {canAddMore && (
        <button
          type="button"
          data-ocid={`${ocidPrefix}.dropzone`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "w-full border-2 border-dashed rounded-sm p-4 transition-colors text-center cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-secondary/50",
          )}
          onClick={() => inputRef.current?.click()}
          aria-label="Add images"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            data-ocid={`${ocidPrefix}.upload_button`}
          />
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <ImagePlus className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs font-body">
              {files.length === 0
                ? "Drop images here or click to upload"
                : `Add more images (${files.length}/${maxFiles})`}
            </span>
          </div>
          {files.length === 0 && (
            <p className="text-[10px] text-muted-foreground/60 font-body mt-1">
              Supports JPEG, PNG, GIF, WebP
            </p>
          )}
        </button>
      )}
    </div>
  );
}
