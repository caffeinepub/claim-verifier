import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BadgeCheck } from "lucide-react";

interface VerifiedBadgeProps {
  size?: number;
  className?: string;
}

export function VerifiedBadge({
  size = 13,
  className = "",
}: VerifiedBadgeProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center ${className}`}
            aria-label="Verified account"
          >
            <BadgeCheck
              style={{ width: size, height: size }}
              className="text-emerald-500 flex-shrink-0"
            />
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="text-xs max-w-[180px] text-center"
        >
          Verified account — votes count 1.5×
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
