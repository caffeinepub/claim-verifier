import { AdminPanel } from "@/components/AdminPanel";
import { ClaimCard } from "@/components/ClaimCard";
import { ClaimDetail } from "@/components/ClaimDetail";
import { SubmitClaimDialog } from "@/components/SubmitClaimDialog";
import { UserAvatar } from "@/components/UserAvatar";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { VoteHistoryPanel } from "@/components/VoteHistoryPanel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useAllClaims, useSessionId, useUsername } from "@/hooks/useQueries";
import { useVerifiedAccount } from "@/hooks/useVerifiedAccount";
import { ProfilePage } from "@/pages/ProfilePage";
import { SourceDetailPage } from "@/pages/SourceDetailPage";
import { TrustedSourcesPage } from "@/pages/TrustedSourcesPage";
import { findClaimBySlug, getClaimSlug } from "@/utils/slug";
import {
  BookOpen,
  Clapperboard,
  Cpu,
  Eye,
  FlaskConical,
  Globe,
  HeartPulse,
  Landmark,
  Layers,
  Loader2,
  Palette,
  Plus,
  RotateCcw,
  Search,
  TrendingUp,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LogIn, LogOut, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const CATEGORIES: { label: string; icon: LucideIcon }[] = [
  { label: "All", icon: Layers },
  { label: "Science", icon: FlaskConical },
  { label: "Politics", icon: Landmark },
  { label: "Health", icon: HeartPulse },
  { label: "Technology", icon: Cpu },
  { label: "Sports", icon: Trophy },
  { label: "Entertainment", icon: Clapperboard },
  { label: "Religion", icon: BookOpen },
  { label: "Art", icon: Palette },
  { label: "Finance", icon: TrendingUp },
  { label: "Conspiracy", icon: Eye },
  { label: "General", icon: Globe },
];

const SEED_CLAIMS_VISIBLE_EMPTY = [
  {
    id: 1n,
    title: "Scientists confirm CRISPR gene therapy cures sickle cell disease",
    description:
      "A peer-reviewed study in The Lancet reports that 28 of 29 patients treated with CRISPR-based gene therapy showed complete remission of sickle cell disease symptoms after a 12-month follow-up.",
    category: "Science",
    timestamp: BigInt(Date.now() - 3600000) * 1_000_000n,
    sessionId: "seed",
    imageUrls: [],
    urls: [],
    ogThumbnailUrl: "",
  },
  {
    id: 2n,
    title: "The Great Wall of China is visible from space with the naked eye",
    description:
      "A commonly repeated claim suggesting that the Great Wall of China is the only man-made structure visible from the Moon or low Earth orbit without optical aids.",
    category: "Science",
    timestamp: BigInt(Date.now() - 86400000) * 1_000_000n,
    sessionId: "seed",
    imageUrls: [],
    urls: [],
    ogThumbnailUrl: "",
  },
  {
    id: 3n,
    title: "Coffee consumption linked to reduced risk of Type 2 diabetes",
    description:
      "A meta-analysis published in Diabetologia found that drinking 3\u20134 cups of coffee per day is associated with a 25% lower risk of developing Type 2 diabetes compared to non-coffee drinkers.",
    category: "Health",
    timestamp: BigInt(Date.now() - 172800000) * 1_000_000n,
    sessionId: "seed",
    imageUrls: [],
    urls: [],
    ogThumbnailUrl: "",
  },
  {
    id: 4n,
    title: "Quantum computers have rendered current encryption obsolete",
    description:
      "Some news outlets claim that recent quantum computing advances mean that RSA and AES encryption are no longer secure for protecting sensitive data.",
    category: "Technology",
    timestamp: BigInt(Date.now() - 259200000) * 1_000_000n,
    sessionId: "seed",
    imageUrls: [],
    urls: [],
    ogThumbnailUrl: "",
  },
  {
    id: 5n,
    title:
      "Voter turnout in the 2024 US Presidential election reached a 50-year high",
    description:
      "Reports circulating on social media claim that the 2024 US Presidential election saw the highest voter participation rate since 1972, exceeding 65% of eligible voters.",
    category: "Politics",
    timestamp: BigInt(Date.now() - 432000000) * 1_000_000n,
    sessionId: "seed",
    imageUrls: [],
    urls: [],
    ogThumbnailUrl: "",
  },
];

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClaimId, setSelectedClaimId] = useState<bigint | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [showSourceDomain, setShowSourceDomain] = useState<string | null>(null);
  const [showProfileUsername, setShowProfileUsername] = useState<string | null>(
    null,
  );

  const { data: sessionId, isLoading: sessionLoading } = useSessionId();
  const {
    isVerified,
    displayName,
    needsUsernameSetup,
    isLoggingIn,
    avatarUrl,
    login,
    logout,
    setDisplayName,
  } = useVerifiedAccount();
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameDialogOpen, setUsernameDialogOpen] = useState(false);

  // Open username setup dialog when needed
  useEffect(() => {
    if (needsUsernameSetup) {
      setUsernameDialogOpen(true);
    }
  }, [needsUsernameSetup]);

  function handleSaveUsername() {
    const trimmed = usernameInput.trim();
    if (!trimmed) return;
    setDisplayName(trimmed);
    setUsernameDialogOpen(false);
    setUsernameInput("");
  }
  const { data: claims, isLoading: claimsLoading } = useAllClaims();
  const username = useUsername();

  // Open Graph / document title meta
  const selectedClaim =
    selectedClaimId !== null
      ? ((claims ?? []).find((c) => c.id === selectedClaimId) ?? null)
      : null;
  useDocumentMeta(
    selectedClaim
      ? {
          title: selectedClaim.title,
          description: selectedClaim.description,
          url: `${window.location.origin}/claim/${getClaimSlug(selectedClaim, claims ?? [])}`,
        }
      : null,
  );

  // On mount: check if URL matches /source/:domain or /claim/<slug> and navigate
  useEffect(() => {
    const profileMatch = window.location.pathname.match(/^\/profile\/(.+)$/);
    if (profileMatch) {
      setShowProfileUsername(decodeURIComponent(profileMatch[1]));
      return;
    }
    const sourceDomainMatch =
      window.location.pathname.match(/^\/source\/(.+)$/);
    if (sourceDomainMatch) {
      setShowSourceDomain(decodeURIComponent(sourceDomainMatch[1]));
      return;
    }
    if (!claims || claims.length === 0) return;
    const match = window.location.pathname.match(/^\/claim\/(.+)$/);
    if (match) {
      const slug = match[1];
      const found = findClaimBySlug(slug, claims);
      if (found) {
        setSelectedClaimId(found.id);
      }
    }
    // Only run when claims first loads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claims]);

  // Listen to browser back/forward
  useEffect(() => {
    function handlePopState() {
      const profileMatch = window.location.pathname.match(/^\/profile\/(.+)$/);
      if (profileMatch) {
        setShowProfileUsername(decodeURIComponent(profileMatch[1]));
        setSelectedClaimId(null);
        setShowSources(false);
        setShowSourceDomain(null);
        return;
      }
      const sourceDomainMatch =
        window.location.pathname.match(/^\/source\/(.+)$/);
      if (sourceDomainMatch) {
        setShowSourceDomain(decodeURIComponent(sourceDomainMatch[1]));
        setSelectedClaimId(null);
        setShowSources(false);
        return;
      }
      const match = window.location.pathname.match(/^\/claim\/(.+)$/);
      if (match) {
        if (claims && claims.length > 0) {
          const found = findClaimBySlug(match[1], claims);
          if (found) {
            setSelectedClaimId(found.id);
            setShowSourceDomain(null);
            return;
          }
        }
      }
      setSelectedClaimId(null);
      setShowSourceDomain(null);
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [claims]);

  function openClaim(id: bigint) {
    setSelectedClaimId(id);
    setShowSourceDomain(null);
    if (claims && claims.length > 0) {
      const claim = claims.find((c) => c.id === id);
      if (claim) {
        const slug = getClaimSlug(claim, claims);
        window.history.pushState({}, "", `/claim/${slug}`);
        return;
      }
    }
    window.history.pushState({}, "", "/");
  }

  function openSourceDetail(domain: string) {
    setShowSourceDomain(domain);
    setSelectedClaimId(null);
    setShowSources(false);
    window.history.pushState({}, "", `/source/${encodeURIComponent(domain)}`);
  }

  function goBack() {
    setSelectedClaimId(null);
    setShowSources(false);
    setShowSourceDomain(null);
    setShowProfileUsername(null);
    window.history.pushState({}, "", "/");
  }

  function openProfilePage(uname: string) {
    setShowProfileUsername(uname);
    setSelectedClaimId(null);
    setShowSources(false);
    setShowSourceDomain(null);
    window.history.pushState({}, "", `/profile/${encodeURIComponent(uname)}`);
  }

  function goBackToSources() {
    setSelectedClaimId(null);
    setShowSources(true);
    setShowSourceDomain(null);
    window.history.pushState({}, "", "/");
  }

  const allClaims =
    claims && claims.length > 0 ? claims : SEED_CLAIMS_VISIBLE_EMPTY;

  const displayClaims = allClaims
    .filter((claim) => {
      const matchesCategory =
        selectedCategory === "All" || claim.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        claim.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .slice()
    .sort((a, b) => Number(b.timestamp - a.timestamp));

  const showDetail = selectedClaimId !== null;
  const isOnSourceDetail =
    showSourceDomain !== null &&
    selectedClaimId === null &&
    showProfileUsername === null;
  const isOnSources =
    showSources &&
    selectedClaimId === null &&
    showSourceDomain === null &&
    showProfileUsername === null;
  const isOnProfile = showProfileUsername !== null && selectedClaimId === null;

  return (
    <div className="min-h-screen bg-background noise-bg flex flex-col">
      <Toaster theme="dark" />

      {/* Masthead Header */}
      <header className="border-b border-border sticky top-0 z-40 bg-background">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-3 group"
              aria-label="Go to homepage"
            >
              <div className="flex flex-col items-start">
                <h1
                  style={{
                    fontWeight: 800,
                    fontSize: "2rem",
                    lineHeight: 1,
                  }}
                  className="font-logo text-foreground leading-none"
                >
                  Rebunk<span className="text-primary">.</span>
                </h1>
                <p className="text-xs text-muted-foreground font-body tracking-widest uppercase mt-0.5">
                  Community Fact-Checking
                </p>
              </div>
            </button>

            <div className="flex items-center gap-2">
              {sessionLoading ? (
                <div
                  data-ocid="session.loading_state"
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="font-body hidden sm:inline">
                    Initializing session…
                  </span>
                </div>
              ) : null}

              {/* Verified account controls */}
              {isVerified ? (
                <>
                  <VoteHistoryPanel />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        data-ocid="auth.toggle"
                        className="gap-1.5 h-8 px-2.5 font-body text-xs border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-500/60"
                      >
                        <UserAvatar
                          username={displayName ?? undefined}
                          avatarUrl={avatarUrl ?? undefined}
                          size="sm"
                        />
                        <span className="hidden sm:inline max-w-[80px] truncate">
                          {displayName ?? "Account"}
                        </span>
                        <VerifiedBadge size={12} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        data-ocid="auth.edit_button"
                        className="text-muted-foreground gap-2 cursor-pointer"
                        onClick={() =>
                          displayName && openProfilePage(displayName)
                        }
                      >
                        <User className="h-3.5 w-3.5" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        data-ocid="auth.secondary_button"
                        className="text-muted-foreground gap-2 cursor-pointer"
                        onClick={logout}
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  data-ocid="auth.primary_button"
                  onClick={login}
                  disabled={isLoggingIn}
                  className="gap-1.5 h-8 px-2.5 font-body text-xs border-border hover:border-primary/40 hover:text-primary"
                >
                  {isLoggingIn ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <LogIn className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline">
                    {isLoggingIn ? "Signing in…" : "Sign In"}
                  </span>
                </Button>
              )}

              <Button
                data-ocid="submit_claim.open_modal_button"
                onClick={() => setIsSubmitOpen(true)}
                disabled={!sessionId}
                size="sm"
                className="font-body gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Submit Claim</span>
                <span className="sm:hidden">Submit</span>
              </Button>
            </div>
          </div>
        </div>
        <div className="h-px masthead-rule" />
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        <AnimatePresence mode="wait">
          {isOnProfile && showProfileUsername ? (
            <ProfilePage
              key={`profile-${showProfileUsername}`}
              username={showProfileUsername}
              onBack={goBack}
            />
          ) : showDetail && selectedClaimId !== null && sessionId ? (
            <ClaimDetail
              key="detail"
              claimId={selectedClaimId}
              sessionId={sessionId}
              allClaims={claims ?? []}
              onBack={goBack}
            />
          ) : isOnSourceDetail && showSourceDomain ? (
            <SourceDetailPage
              key={`source-detail-${showSourceDomain}`}
              domain={showSourceDomain}
              sessionId={sessionId ?? null}
              onBack={goBackToSources}
              onClaimClick={(claim) => openClaim(claim.id)}
            />
          ) : isOnSources ? (
            <TrustedSourcesPage
              key="sources"
              sessionId={sessionId ?? null}
              onSourceClick={openSourceDetail}
            />
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Page header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Claims Under Review
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground font-body ml-3">
                  Browse and weigh in on community-submitted claims. Every vote
                  counts.
                </p>
              </div>

              {/* Filters row */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search claims…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-secondary border-border font-body"
                    data-ocid="claims.search_input"
                  />
                </div>
              </div>

              {/* Category icon grid */}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2 mb-6">
                {CATEGORIES.map(({ label, icon: CatIcon }) => {
                  const isActive = selectedCategory === label;
                  return (
                    <button
                      key={label}
                      type="button"
                      data-ocid="category.tab"
                      onClick={() => setSelectedCategory(label)}
                      className={[
                        "flex flex-col items-center justify-center gap-1.5 rounded-lg border py-2.5 px-1 transition-all duration-150 cursor-pointer",
                        isActive
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-secondary text-muted-foreground border-border hover:border-primary/40 hover:text-foreground hover:bg-secondary/80",
                      ].join(" ")}
                    >
                      <CatIcon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-[10px] font-body font-medium leading-none text-center">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Claims grid */}
              {claimsLoading ? (
                <div
                  data-ocid="claims.loading_state"
                  className="grid grid-cols-1 gap-4"
                >
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="p-5 bg-card border border-border rounded-sm space-y-3"
                    >
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex gap-4 pt-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayClaims.length === 0 ? (
                <div
                  data-ocid="claim.empty_state"
                  className="text-center py-20 text-muted-foreground"
                >
                  <RotateCcw className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="font-display text-xl font-semibold mb-1">
                    No claims found
                  </p>
                  <p className="text-sm font-body">
                    {searchQuery
                      ? `No results for "${searchQuery}". Try a different search term.`
                      : `No claims in ${selectedCategory} yet.`}
                  </p>
                  {!searchQuery && sessionId && (
                    <Button
                      onClick={() => setIsSubmitOpen(true)}
                      variant="outline"
                      className="mt-4 font-body border-border gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Be first to submit a claim
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {displayClaims.map((claim, index) => (
                    <ClaimCard
                      key={claim.id.toString()}
                      claim={claim}
                      index={index + 1}
                      onClick={() => openClaim(claim.id)}
                      sessionId={sessionId}
                      slug={getClaimSlug(claim, allClaims)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-body">
                Anonymous \u00b7 Decentralized \u00b7 Community-Verified
              </span>
            </div>
            {username && (
              <span
                data-ocid="session.username"
                className="text-xs text-muted-foreground font-body"
              >
                Connected as: {username}
              </span>
            )}
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground font-body">
                \u00a9 {new Date().getFullYear()}.{" "}
                <a
                  href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Built with \u2764 using caffeine.ai
                </a>
              </p>
              <button
                type="button"
                data-ocid="sources.link"
                onClick={() => {
                  setShowSources(true);
                  setSelectedClaimId(null);
                  setShowSourceDomain(null);
                  window.history.pushState({}, "", "/");
                }}
                className="text-xs text-muted-foreground hover:text-foreground font-body transition-colors select-none"
              >
                Sources
              </button>
              <button
                type="button"
                data-ocid="admin.open_modal_button"
                onClick={() => setIsAdminOpen(true)}
                className="text-xs text-muted-foreground hover:text-foreground font-body transition-colors select-none"
                aria-label="Admin"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Submit Claim Dialog */}
      {sessionId && (
        <SubmitClaimDialog
          sessionId={sessionId}
          open={isSubmitOpen}
          onOpenChange={setIsSubmitOpen}
        />
      )}

      {/* Admin Panel */}
      {isAdminOpen && <AdminPanel onClose={() => setIsAdminOpen(false)} />}

      {/* Username Setup Dialog */}
      <Dialog open={usernameDialogOpen} onOpenChange={setUsernameDialogOpen}>
        <DialogContent
          data-ocid="auth.dialog"
          className="sm:max-w-sm"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              Set your display name
            </DialogTitle>
            <p className="text-sm text-muted-foreground font-body">
              Choose a name that will appear on your verified contributions.
            </p>
          </DialogHeader>
          <div className="py-2">
            <input
              data-ocid="auth.input"
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveUsername()}
              placeholder="e.g. FactChecker42"
              maxLength={24}
              className="w-full px-3 py-2 text-sm font-body border border-border rounded-sm bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/60"
            />
            <p className="text-xs text-muted-foreground font-body mt-1.5">
              Max 24 characters. Visible on your comments & evidence.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              size="sm"
              data-ocid="auth.cancel_button"
              className="font-body"
              onClick={() => {
                setUsernameDialogOpen(false);
                logout();
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              data-ocid="auth.submit_button"
              className="font-body bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSaveUsername}
              disabled={!usernameInput.trim()}
            >
              Save Name
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
