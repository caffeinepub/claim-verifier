import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Link2, Plus, X } from "lucide-react";

interface UrlInputListProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  ocidPrefix: string;
  placeholder?: string;
}

function isValidUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return true; // empty is fine (optional)
  return trimmed.startsWith("http://") || trimmed.startsWith("https://");
}

export function UrlInputList({
  urls,
  onChange,
  ocidPrefix,
  placeholder = "https://example.com/source",
}: UrlInputListProps) {
  const handleChange = (index: number, value: string) => {
    const updated = urls.map((u, i) => (i === index ? value : u));
    onChange(updated);
  };

  const handleAdd = () => {
    onChange([...urls, ""]);
  };

  const handleRemove = (index: number) => {
    onChange(urls.filter((_, i) => i !== index));
  };

  const lastIsEmpty = urls.length > 0 && urls[urls.length - 1].trim() === "";
  const canAdd = !lastIsEmpty;

  return (
    <div className="space-y-2">
      {urls.map((url, i) => {
        const isInvalid = url.trim() !== "" && !isValidUrl(url);
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: stable ordered URL list
          <div key={i} className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  type="url"
                  data-ocid={`${ocidPrefix}.input`}
                  value={url}
                  onChange={(e) => handleChange(i, e.target.value)}
                  placeholder={placeholder}
                  className={cn(
                    "pl-8 bg-secondary border-border font-body text-sm h-9",
                    isInvalid &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                  aria-label={`URL ${i + 1}`}
                  aria-invalid={isInvalid}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                data-ocid={`${ocidPrefix}.delete_button.${i + 1}`}
                onClick={() => handleRemove(i)}
                className="h-9 w-9 text-muted-foreground hover:text-destructive flex-shrink-0"
                aria-label={`Remove URL ${i + 1}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {isInvalid && (
              <p className="text-xs text-destructive font-body ml-8">
                URL must start with http:// or https://
              </p>
            )}
          </div>
        );
      })}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        data-ocid={`${ocidPrefix}.button`}
        onClick={handleAdd}
        disabled={!canAdd}
        className="text-xs font-body text-muted-foreground hover:text-foreground gap-1.5 h-8 px-2"
      >
        <Plus className="h-3.5 w-3.5" />
        Add another link
      </Button>
    </div>
  );
}
