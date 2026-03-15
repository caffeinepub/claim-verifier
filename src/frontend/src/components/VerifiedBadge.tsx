import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { BadgeCheck } from "lucide-react";

interface VerifiedBadgeProps {
  size?: number;
  className?: string;
  iconClassName?: string;
}

export function VerifiedBadge({
  size = 13,
  className = "",
  iconClassName = "",
}: VerifiedBadgeProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center ${className}`}
            aria-label="Trusted Contributor"
          >
            <BadgeCheck
              style={{ width: size, height: size }}
              className={cn("text-primary flex-shrink-0", iconClassName)}
            />
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="text-xs max-w-[200px] text-center"
        >
          Trusted Contributor — earned through consistent quality participation
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
