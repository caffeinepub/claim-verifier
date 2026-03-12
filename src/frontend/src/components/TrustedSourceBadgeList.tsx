import type { TrustedSourceInfo } from "@/backend.d";
import { useTrustedSources } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import {
  getSourceTypeBadgeClasses,
  getSourceTypeBonus,
  getSourceTypeLabel,
} from "@/pages/TrustedSourcesPage";
import { ShieldCheck } from "lucide-react";

function extractDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return url
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .split("/")[0]
      .toLowerCase();
  }
}

interface TrustedSourceBadgeListProps {
  urls: string[];
}

export function TrustedSourceBadgeList({ urls }: TrustedSourceBadgeListProps) {
  const { data: trustedSources } = useTrustedSources();

  if (!trustedSources || trustedSources.length === 0 || urls.length === 0) {
    return null;
  }

  const trustedOnly = trustedSources.filter((s) => s.isTrusted);
  if (trustedOnly.length === 0) return null;

  const trustedMap = new Map<string, TrustedSourceInfo>();
  for (const s of trustedOnly) {
    trustedMap.set(s.domain.toLowerCase(), s);
  }

  const matches: TrustedSourceInfo[] = [];
  for (const url of urls) {
    const domain = extractDomain(url);
    const found = trustedMap.get(domain);
    if (found && !matches.find((m) => m.domain === found.domain)) {
      matches.push(found);
    }
  }

  if (matches.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {matches.map((s) => (
        <span
          key={s.domain}
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-body font-medium border",
            getSourceTypeBadgeClasses(s.sourceType),
          )}
          title={`${getSourceTypeLabel(s.sourceType)} — ${getSourceTypeBonus(s.sourceType)} credibility bonus`}
        >
          <ShieldCheck className="h-2.5 w-2.5" />
          <span>{s.domain}</span>
          <span className="opacity-70">{getSourceTypeBonus(s.sourceType)}</span>
        </span>
      ))}
    </div>
  );
}
