import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Clapperboard,
  Cpu,
  Eye,
  FlaskConical,
  Globe,
  HeartPulse,
  Landmark,
  Palette,
  TrendingUp,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

const categoryConfig: Record<string, { style: string; icon: LucideIcon }> = {
  Science: {
    style: "bg-blue-950 text-blue-300 border-blue-800",
    icon: FlaskConical,
  },
  Politics: {
    style: "bg-purple-950 text-purple-300 border-purple-800",
    icon: Landmark,
  },
  Health: {
    style: "bg-green-950 text-green-300 border-green-800",
    icon: HeartPulse,
  },
  Technology: {
    style: "bg-cyan-950 text-cyan-300 border-cyan-800",
    icon: Cpu,
  },
  Sports: {
    style: "bg-orange-950 text-orange-300 border-orange-800",
    icon: Trophy,
  },
  Entertainment: {
    style: "bg-pink-950 text-pink-300 border-pink-800",
    icon: Clapperboard,
  },
  Religion: {
    style: "bg-amber-950 text-amber-300 border-amber-800",
    icon: BookOpen,
  },
  Art: {
    style: "bg-rose-950 text-rose-300 border-rose-800",
    icon: Palette,
  },
  Finance: {
    style: "bg-emerald-950 text-emerald-300 border-emerald-800",
    icon: TrendingUp,
  },
  Conspiracy: {
    style: "bg-violet-950 text-violet-300 border-violet-800",
    icon: Eye,
  },
  General: {
    style: "bg-secondary text-secondary-foreground border-border",
    icon: Globe,
  },
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const config = categoryConfig[category] ?? categoryConfig.General;
  const Icon = config.icon;
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-body font-medium tracking-wide uppercase border gap-1.5",
        config.style,
        className,
      )}
    >
      <Icon className="w-3 h-3 flex-shrink-0" />
      {category}
    </Badge>
  );
}
