import { ClaimCard } from "@/components/ClaimCard";
import { ClaimDetail } from "@/components/ClaimDetail";
import { SubmitClaimDialog } from "@/components/SubmitClaimDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAllClaims, useSessionId } from "@/hooks/useQueries";
import { Loader2, Plus, Search, Shield } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const CATEGORIES = [
  "All",
  "Science",
  "Politics",
  "Health",
  "Technology",
  "Sports",
  "Entertainment",
  "Religion",
  "Other",
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
  },
  {
    id: 3n,
    title: "Coffee consumption linked to reduced risk of Type 2 diabetes",
    description:
      "A meta-analysis published in Diabetologia found that drinking 3–4 cups of coffee per day is associated with a 25% lower risk of developing Type 2 diabetes compared to non-coffee drinkers.",
    category: "Health",
    timestamp: BigInt(Date.now() - 172800000) * 1_000_000n,
    sessionId: "seed",
    imageUrls: [],
    urls: [],
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
  },
];

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClaimId, setSelectedClaimId] = useState<bigint | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  const { data: sessionId, isLoading: sessionLoading } = useSessionId();
  const { data: claims, isLoading: claimsLoading } = useAllClaims();

  const displayClaims = (
    claims && claims.length > 0 ? claims : SEED_CLAIMS_VISIBLE_EMPTY
  )
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

  return (
    <div className="min-h-screen bg-background noise-bg flex flex-col">
      <Toaster theme="dark" />

      {/* Masthead Header */}
      <header className="border-b border-border sticky top-0 z-40 bg-background/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedClaimId(null)}
              className="flex items-center gap-3 group"
              aria-label="Go to homepage"
            >
              <div className="w-8 h-8 rounded-sm bg-primary flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="text-left">
                <h1 className="font-display text-xl font-bold text-foreground leading-none tracking-tight group-hover:text-primary transition-colors">
                  Claim Verifier
                </h1>
                <p className="text-xs text-muted-foreground font-body tracking-widest uppercase mt-0.5">
                  Community Fact-Checking
                </p>
              </div>
            </button>

            <div className="flex items-center gap-3">
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
              ) : sessionId ? (
                <span className="text-xs text-muted-foreground font-body hidden sm:inline">
                  Session: {sessionId.slice(0, 8)}…
                </span>
              ) : null}
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
          {showDetail && selectedClaimId !== null && sessionId ? (
            <ClaimDetail
              key="detail"
              claimId={selectedClaimId}
              sessionId={sessionId}
              onBack={() => setSelectedClaimId(null)}
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

              {/* Category tabs */}
              <Tabs
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                className="mb-6"
              >
                <TabsList className="bg-secondary border border-border h-auto flex-wrap gap-1 p-1">
                  {CATEGORIES.map((cat) => (
                    <TabsTrigger
                      key={cat}
                      value={cat}
                      data-ocid="category.tab"
                      className="font-body text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      {cat}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

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
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-20" />
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
                      onClick={() => setSelectedClaimId(claim.id)}
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
              <Shield className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-body">
                Anonymous · Decentralized · Community-Verified
              </span>
            </div>
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
    </div>
  );
}
