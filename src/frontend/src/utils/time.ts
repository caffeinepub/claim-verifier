export function formatRelativeTime(timestamp: bigint): string {
  // Motoko timestamps are in nanoseconds
  const ms = Number(timestamp) / 1_000_000;
  const now = Date.now();
  const diff = now - ms;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: days > 365 ? "numeric" : undefined,
  });
}

export function formatVerdictPercent(count: bigint, total: bigint): number {
  if (total === 0n) return 0;
  return Math.round((Number(count) / Number(total)) * 100);
}
