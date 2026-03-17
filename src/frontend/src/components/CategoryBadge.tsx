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
    style: "bg-blue-950 text-white border-blue-800",
    icon: FlaskConical,
  },
  Politics: {
    style: "bg-purple-950 text-white border-purple-800",
    icon: Landmark,
  },
  Health: {
    style: "bg-green-950 text-white border-green-800",
    icon: HeartPulse,
  },
  Technology: {
    style: "bg-cyan-950 text-white border-cyan-800",
    icon: Cpu,
  },
  Sports: {
    style: "bg-orange-950 text-white border-orange-800",
    icon: Trophy,
  },
  Entertainment: {
    style: "bg-pink-950 text-white border-pink-800",
    icon: Clapperboard,
  },
  Religion: {
    style: "bg-amber-950 text-white border-amber-800",
    icon: BookOpen,
  },
  Art: {
    style: "bg-rose-950 text-white border-rose-800",
    icon: Palette,
  },
  Finance: {
    style: "bg-emerald-950 text-white border-emerald-800",
    icon: TrendingUp,
  },
  Conspiracy: {
    style: "bg-violet-950 text-white border-violet-800",
    icon: Eye,
  },
  General: {
    style: "bg-slate-600 text-white border-slate-500",
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
