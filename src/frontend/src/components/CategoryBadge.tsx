import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

const categoryStyles: Record<string, string> = {
  Science: "bg-blue-950 text-blue-300 border-blue-800",
  Politics: "bg-purple-950 text-purple-300 border-purple-800",
  Health: "bg-green-950 text-green-300 border-green-800",
  Technology: "bg-cyan-950 text-cyan-300 border-cyan-800",
  Other: "bg-secondary text-secondary-foreground border-border",
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const style = categoryStyles[category] ?? categoryStyles.Other;
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-body font-medium tracking-wide uppercase border",
        style,
        className,
      )}
    >
      {category}
    </Badge>
  );
}
