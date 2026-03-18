import { ClaimCard } from "@/components/ClaimCard";
import { OfflineBanner } from "@/components/OfflineBanner";
import { SubmitClaimDialog } from "@/components/SubmitClaimDialog";
import { UserAvatar } from "@/components/UserAvatar";
import { VerifiedBadge } from "@/components/VerifiedBadge";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useActor } from "@/hooks/useActor";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useAllClaims, useSessionId, useUsername } from "@/hooks/useQueries";
import { useVerifiedAccount } from "@/hooks/useVerifiedAccount";
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
import {
  AtSign,
  CheckCircle,
  LogIn,
  LogOut,
  Settings,
  User,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { Suspense, useEffect, useRef, useState } from "react";

// Route-based code splitting
const ClaimDetail = React.lazy(() =>
  import("@/components/ClaimDetail").then((m) => ({ default: m.ClaimDetail })),
);
const ProfilePage = React.lazy(() =>
  import("@/pages/ProfilePage").then((m) => ({ default: m.ProfilePage })),
);
const SettingsPage = React.lazy(() =>
  import("@/pages/SettingsPage").then((m) => ({ default: m.SettingsPage })),
);
const SourceDetailPage = React.lazy(() =>
  import("@/pages/SourceDetailPage").then((m) => ({
    default: m.SourceDetailPage,
  })),
);
const TrustedSourcesPage = React.lazy(() =>
  import("@/pages/TrustedSourcesPage").then((m) => ({
    default: m.TrustedSourcesPage,
  })),
);
const AdminPage = React.lazy(() =>
  import("@/pages/AdminPage").then((m) => ({ default: m.AdminPage })),
);

const PageFallback = (
  <div className="flex items-center justify-center py-20">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
);

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

const PAGE_SIZE = 20;

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClaimId, setSelectedClaimId] = useState<bigint | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [showSourceDomain, setShowSourceDomain] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showProfileUsername, setShowProfileUsername] = useState<string | null>(
    null,
  );

  // Infinite scroll
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // New claims banner
  const seenClaimIdsRef = useRef<Set<string>>(new Set());
  const [newClaimsCount, setNewClaimsCount] = useState(0);

  // Pull-to-refresh
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartYRef = useRef(0);
  const pullContainerRef = useRef<HTMLDivElement | null>(null);

  const { data: sessionId, isLoading: sessionLoading } = useSessionId();
  const {
    isVerified,
    username,
    needsUsernameSetup,
    isLoggingIn,
    avatarUrl,
    login,
    logout,
    setUsername,
    isTrustedContributor,
    canChangeUsername,
    timeUntilUsernameChange,
    principalId,
  } = useVerifiedAccount();
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameDialogOpen, setUsernameDialogOpen] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Open username setup dialog when needed
  useEffect(() => {
    if (needsUsernameSetup) {
      setUsernameDialogOpen(true);
    }
  }, [needsUsernameSetup]);

  const { actor } = useActor();

  // Debounced availability check via backend
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = usernameInput.trim();
    if (!trimmed) {
      setUsernameAvailable(null);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      if (!actor) return;
      try {
        const available = await actor.isUsernameAvailable(trimmed);
        setUsernameAvailable(available);
      } catch {
        setUsernameAvailable(null);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [usernameInput, actor]);

  async function handleSaveUsername() {
    const trimmed = usernameInput.trim();
    if (!trimmed) return;
    setUsernameError(null);
    const result = await setUsername(trimmed);
    if (!result.success) {
      setUsernameError(result.error ?? "Failed to set username");
      return;
    }
    setUsernameDialogOpen(false);
    setUsernameInput("");
    setUsernameAvailable(null);
  }

  const {
    data: claims,
    isLoading: claimsLoading,
    refetch: refetchClaims,
  } = useAllClaims();
  const anonUsername = useUsername();

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
    if (window.location.pathname === "/admin") {
      setShowAdmin(true);
      return;
    }
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
      if (window.location.pathname === "/admin") {
        setShowAdmin(true);
        return;
      }
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
    setShowSettings(false);
    setShowAdmin(false);
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
  function openAdmin() {
    setShowAdmin(true);
    setSelectedClaimId(null);
    setShowSources(false);
    setShowSourceDomain(null);
    setShowProfileUsername(null);
    setShowSettings(false);
    window.history.pushState({}, "", "/admin");
  }

  const allClaims = claims ?? [];

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

  // Paginated slice for infinite scroll
  const visibleClaims = displayClaims.slice(0, visibleCount);
  const hasMore = visibleCount < displayClaims.length;

  // Reset visible count when filters change (track previous values)
  const prevCategoryRef = useRef(selectedCategory);
  const prevSearchRef = useRef(searchQuery);
  if (
    prevCategoryRef.current !== selectedCategory ||
    prevSearchRef.current !== searchQuery
  ) {
    prevCategoryRef.current = selectedCategory;
    prevSearchRef.current = searchQuery;
    if (visibleCount !== PAGE_SIZE) {
      setVisibleCount(PAGE_SIZE);
    }
  }

  // Infinite scroll: IntersectionObserver on sentinel
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + PAGE_SIZE);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore]);

  // New claims banner: track seen IDs
  const isOnMainList =
    selectedClaimId === null &&
    !showSources &&
    showSourceDomain === null &&
    showProfileUsername === null &&
    !showSettings;

  useEffect(() => {
    if (!isOnMainList) return;
    if (!claims || claims.length === 0) return;
    const currentIds = new Set(claims.map((c) => c.id.toString()));
    if (seenClaimIdsRef.current.size === 0) {
      // Initialize on first load
      seenClaimIdsRef.current = currentIds;
      return;
    }
    let newCount = 0;
    for (const id of currentIds) {
      if (!seenClaimIdsRef.current.has(id)) newCount++;
    }
    if (newCount > 0) {
      if (window.scrollY > 100) {
        setNewClaimsCount(newCount);
      } else {
        // User is at top, silently accept
        seenClaimIdsRef.current = currentIds;
      }
    }
  }, [claims, isOnMainList]);

  function dismissNewClaimsBanner() {
    seenClaimIdsRef.current = new Set(
      (claims ?? []).map((c) => c.id.toString()),
    );
    setNewClaimsCount(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Reset banner when leaving / returning to main list
  useEffect(() => {
    if (isOnMainList) {
      setNewClaimsCount(0);
    }
  }, [isOnMainList]);

  // Pull-to-refresh handlers (touch only)
  function handleTouchStart(e: React.TouchEvent) {
    touchStartYRef.current = e.touches[0].clientY;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (window.scrollY !== 0) return;
    const delta = e.touches[0].clientY - touchStartYRef.current;
    if (delta > 0) {
      setPullDistance(Math.min(delta, 120));
      setIsPulling(delta > 80);
    }
  }

  async function handleTouchEnd() {
    if (isPulling) {
      await refetchClaims();
    }
    setPullDistance(0);
    setIsPulling(false);
  }

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
  const isOnSettings =
    showSettings && selectedClaimId === null && showProfileUsername === null;
  const isOnAdmin = showAdmin;

  const isFirstTimeSetup = !username;

  return (
    <div className="min-h-screen bg-background noise-bg flex flex-col">
      <Toaster theme="dark" />

      {/* New claims sticky banner */}
      <AnimatePresence>
        {newClaimsCount > 0 && isOnMainList && (
          <motion.div
            initial={{ y: -48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -48, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-[73px] left-0 right-0 z-30 flex justify-center pointer-events-none"
          >
            <button
              type="button"
              onClick={dismissNewClaimsBanner}
              className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full shadow-lg bg-primary text-primary-foreground text-sm font-body font-medium cursor-pointer hover:bg-primary/90 transition-colors"
            >
              <span>↑</span>
              <span>
                {newClaimsCount} new claim{newClaimsCount !== 1 ? "s" : ""} —
                tap to load
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-ocid="auth.toggle"
                      className="relative h-8 w-8 rounded-full p-0 overflow-hidden"
                    >
                      <UserAvatar
                        username={username ?? undefined}
                        avatarUrl={avatarUrl ?? undefined}
                        size="sm"
                        isVerified={true}
                      />
                      <span className="sr-only">
                        {username ?? "Account menu"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel className="flex items-center gap-2 pb-1">
                      <UserAvatar
                        username={username ?? undefined}
                        avatarUrl={avatarUrl ?? undefined}
                        size="sm"
                        isVerified={true}
                      />
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm font-medium font-body text-foreground truncate">
                          {username ?? "Account"}
                        </span>
                        {isTrustedContributor && <VerifiedBadge size={13} />}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      data-ocid="auth.edit_button"
                      className="text-muted-foreground gap-2 cursor-pointer"
                      onClick={() => username && openProfilePage(username)}
                    >
                      <User className="h-3.5 w-3.5" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      data-ocid="settings.button"
                      className="text-muted-foreground gap-2 cursor-pointer"
                      onClick={() => {
                        setShowSettings(true);
                        setSelectedClaimId(null);
                        setShowSources(false);
                        setShowSourceDomain(null);
                        setShowProfileUsername(null);
                      }}
                    >
                      <Settings className="h-3.5 w-3.5" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      data-ocid="auth.delete_button"
                      className="text-muted-foreground gap-2 cursor-pointer"
                      onClick={logout}
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
        <Suspense fallback={PageFallback}>
          <AnimatePresence mode="wait">
            {isOnAdmin ? (
              <AdminPage key="admin" onClose={goBack} />
            ) : isOnSettings && principalId ? (
              <SettingsPage
                key="settings"
                onBack={goBack}
                onChangeUsername={() => {
                  setShowSettings(false);
                  setUsernameInput(username ?? "");
                  setUsernameError(null);
                  setUsernameAvailable(null);
                  setUsernameDialogOpen(true);
                }}
              />
            ) : isOnProfile && showProfileUsername ? (
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
                    Browse and weigh in on community-submitted claims. Every
                    vote counts.
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

                {/* Pull-to-refresh indicator */}
                {pullDistance > 0 && (
                  <div
                    className="flex justify-center items-center transition-all"
                    style={{ height: Math.min(pullDistance * 0.5, 48) }}
                  >
                    <Loader2
                      className={`h-5 w-5 text-primary transition-opacity ${
                        isPulling ? "opacity-100 animate-spin" : "opacity-40"
                      }`}
                    />
                  </div>
                )}

                {/* Claims grid */}
                <div
                  ref={pullContainerRef}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
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
                          : allClaims.length === 0 && selectedCategory === "All"
                            ? "No claims yet. Be the first to submit one!"
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
                      {visibleClaims.map((claim, index) => (
                        <ClaimCard
                          key={claim.id.toString()}
                          claim={claim}
                          index={index + 1}
                          onClick={() => openClaim(claim.id)}
                          sessionId={sessionId}
                          slug={getClaimSlug(claim, allClaims)}
                        />
                      ))}

                      {/* Infinite scroll sentinel */}
                      {hasMore && (
                        <div
                          ref={sentinelRef}
                          className="flex justify-center py-6"
                        >
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-body">
                Anonymous · Decentralized · Community-Verified
              </span>
            </div>
            {(isVerified ? username : anonUsername) && (
              <span
                data-ocid="session.username"
                className="text-xs text-muted-foreground font-body"
              >
                Connected as: {isVerified ? username : anonUsername}
              </span>
            )}
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground font-body">
                © {new Date().getFullYear()}.{" "}
                <a
                  href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Built with ❤ using caffeine.ai
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
                  setShowProfileUsername(null);
                  setShowSettings(false);
                }}
                className="text-xs text-muted-foreground hover:text-foreground font-body transition-colors select-none"
              >
                Sources
              </button>
              <button
                type="button"
                data-ocid="admin.open_modal_button"
                onClick={openAdmin}
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

      {/* Username Setup / Change Dialog */}
      <Dialog
        open={usernameDialogOpen}
        onOpenChange={(open) => {
          // Prevent closing if it's first-time setup
          if (!open && needsUsernameSetup) return;
          setUsernameDialogOpen(open);
          if (!open) {
            setUsernameInput("");
            setUsernameError(null);
            setUsernameAvailable(null);
          }
        }}
      >
        <DialogContent
          data-ocid="auth.dialog"
          className="sm:max-w-sm"
          onInteractOutside={(e) => {
            if (needsUsernameSetup) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              {isFirstTimeSetup
                ? "Choose your username"
                : "Change your username"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground font-body">
              {isFirstTimeSetup
                ? "Your username will appear on your verified contributions."
                : "You can change your username once every 24 hours."}
            </p>
          </DialogHeader>

          {/* Cooldown notice */}
          {!canChangeUsername && timeUntilUsernameChange && (
            <div className="px-1 py-2 rounded-sm bg-secondary text-sm text-muted-foreground font-body">
              You can change your username again in{" "}
              <span className="font-medium text-foreground">
                {timeUntilUsernameChange}
              </span>
            </div>
          )}

          <div className="py-2">
            <input
              data-ocid="auth.input"
              type="text"
              value={usernameInput}
              onChange={(e) => {
                setUsernameInput(e.target.value);
                setUsernameError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSaveUsername()}
              placeholder="e.g. FactChecker42"
              maxLength={24}
              disabled={!canChangeUsername}
              className="w-full px-3 py-2 text-sm font-body border border-border rounded-sm bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/60 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {/* Availability indicator */}
            {usernameInput.trim() &&
              usernameAvailable !== null &&
              canChangeUsername && (
                <div
                  className={`flex items-center gap-1 mt-1.5 text-xs font-body ${
                    usernameAvailable ? "text-emerald-600" : "text-destructive"
                  }`}
                >
                  {usernameAvailable ? (
                    <CheckCircle className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  {usernameAvailable
                    ? "Username available"
                    : "Username already taken"}
                </div>
              )}
            {/* Server-side error */}
            {usernameError && (
              <div
                className="flex items-center gap-1 mt-1.5 text-xs font-body text-destructive"
                data-ocid="auth.error_state"
              >
                <XCircle className="h-3.5 w-3.5" />
                {usernameError}
              </div>
            )}
            {!usernameError && !usernameInput.trim() && (
              <p className="text-xs text-muted-foreground font-body mt-1.5">
                Max 24 characters. Visible on your comments &amp; evidence.
              </p>
            )}
          </div>
          <DialogFooter className="gap-2">
            {!isFirstTimeSetup && (
              <Button
                variant="ghost"
                size="sm"
                data-ocid="auth.cancel_button"
                className="font-body"
                onClick={() => {
                  setUsernameDialogOpen(false);
                  setUsernameInput("");
                  setUsernameError(null);
                  setUsernameAvailable(null);
                }}
              >
                Cancel
              </Button>
            )}
            {isFirstTimeSetup && (
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
            )}
            <Button
              size="sm"
              data-ocid="auth.submit_button"
              className="font-body bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSaveUsername}
              disabled={
                !usernameInput.trim() ||
                !canChangeUsername ||
                usernameAvailable === false
              }
            >
              {isFirstTimeSetup ? "Set Username" : "Save Username"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Offline banner */}
      <OfflineBanner />
    </div>
  );
}
