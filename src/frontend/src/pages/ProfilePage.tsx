import { UserAvatar } from "@/components/UserAvatar";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useStorageClient } from "@/hooks/useStorageClient";
import {
  getVerifiedVotes,
  useVerifiedAccount,
} from "@/hooks/useVerifiedAccount";
import {
  ArrowLeft,
  Camera,
  Check,
  FileText,
  Layers,
  Loader2,
  Pencil,
  Vote,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface ProfilePageProps {
  username: string;
  onBack: () => void;
}

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (d.getTime() === today.getTime()) return "today";
  if (d.getTime() === yesterday.getTime()) return "yesterday";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const TIER_CONFIG: Record<string, { label: string; className: string }> = {
  Newcomer: {
    label: "Newcomer",
    className: "bg-muted text-muted-foreground",
  },
  Contributor: {
    label: "Contributor",
    className: "bg-blue-100 text-blue-700",
  },
  Analyst: {
    label: "Analyst",
    className: "bg-amber-100 text-amber-700",
  },
  Investigator: {
    label: "Investigator",
    className: "bg-violet-100 text-violet-700",
  },
  Expert: {
    label: "Expert",
    className: "bg-primary/10 text-primary",
  },
};

function getReputationTier(voteCount: number): string {
  if (voteCount >= 500) return "Expert";
  if (voteCount >= 100) return "Investigator";
  if (voteCount >= 25) return "Analyst";
  if (voteCount >= 5) return "Contributor";
  return "Newcomer";
}

export function ProfilePage({ username, onBack }: ProfilePageProps) {
  const {
    displayName,
    joinDate,
    avatarUrl,
    setAvatarUrl,
    isVerified,
    bio,
    setBio,
    lastActive,
    activityPoints,
    trustScore,
    isTrustedContributor,
  } = useVerifiedAccount();
  const isOwnProfile = isVerified && displayName === username;

  const { data: storageClient } = useStorageClient();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(bio ?? "");

  const formattedJoinDate = joinDate
    ? new Date(joinDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const verifiedVotes = isOwnProfile ? getVerifiedVotes() : {};
  const voteCount = Object.keys(verifiedVotes).length;
  const tier = getReputationTier(voteCount);
  const tierConfig = TIER_CONFIG[tier];

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !storageClient) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes);
      const url = await storageClient.getDirectURL(hash);
      setAvatarUrl(url);
      toast.success("Avatar updated!");
    } catch {
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleSaveBio() {
    setBio(bioInput.trim());
    setIsEditingBio(false);
    toast.success("Bio saved!");
  }

  function handleCancelBio() {
    setBioInput(bio ?? "");
    setIsEditingBio(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="max-w-xl mx-auto"
    >
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        data-ocid="profile.button"
        className="mb-6 gap-2 text-muted-foreground hover:text-foreground font-body -ml-2 h-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Profile card */}
      <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center gap-3">
        {/* Avatar + upload overlay */}
        <div className="relative group">
          <UserAvatar
            username={username}
            avatarUrl={isOwnProfile ? (avatarUrl ?? undefined) : undefined}
            size="lg"
            className="ring-4 ring-border"
          />

          {isOwnProfile && (
            <>
              <button
                type="button"
                data-ocid="profile.upload_button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || !storageClient}
                className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Change avatar"
              >
                {isUploading ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </>
          )}
        </div>

        {/* Identity block: display name + verified badge */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5">
            <h1 className="font-display text-2xl font-bold text-foreground leading-tight">
              {username}
            </h1>
            {isTrustedContributor && <VerifiedBadge />}
          </div>

          {/* Reputation tier badge — below display name */}
          {isOwnProfile && tierConfig && (
            <span
              className={`text-xs font-body font-medium px-2.5 py-0.5 rounded-full ${tierConfig.className}`}
            >
              {tierConfig.label}
            </span>
          )}

          {/* Join date + last active */}
          <div className="flex items-center gap-2 mt-1 flex-wrap justify-center">
            {formattedJoinDate && (
              <p className="text-xs text-muted-foreground font-body">
                Member since {formattedJoinDate}
              </p>
            )}
            {lastActive && formattedJoinDate && (
              <span className="text-muted-foreground/40 text-xs">·</span>
            )}
            {lastActive && (
              <p className="text-xs text-muted-foreground font-body">
                Active {formatRelative(lastActive)}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {isOwnProfile && (
          <div className="w-full max-w-sm mt-1">
            {isEditingBio ? (
              <div className="flex flex-col gap-2">
                <Textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder="Write a short bio…"
                  className="text-sm font-body resize-none"
                  rows={3}
                  maxLength={200}
                  data-ocid="profile.textarea"
                />
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelBio}
                    data-ocid="profile.cancel_button"
                    className="h-7 text-xs font-body gap-1"
                  >
                    <X className="h-3 w-3" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveBio}
                    data-ocid="profile.save_button"
                    className="h-7 text-xs font-body gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Save
                  </Button>
                </div>
              </div>
            ) : bio ? (
              <div className="flex items-start justify-center gap-1.5 group/bio">
                <p className="text-sm text-muted-foreground font-body text-center">
                  {bio}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setBioInput(bio);
                    setIsEditingBio(true);
                  }}
                  data-ocid="profile.edit_button"
                  className="opacity-0 group-hover/bio:opacity-100 transition-opacity text-muted-foreground hover:text-foreground flex-shrink-0 mt-0.5"
                  aria-label="Edit bio"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingBio(true)}
                data-ocid="profile.secondary_button"
                className="text-xs text-muted-foreground hover:text-primary font-body transition-colors w-full text-center"
              >
                + Add a bio…
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats row — own profile only */}
      {isOwnProfile && (
        <div className="mt-4 bg-card border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-4 divide-x divide-border">
            <div className="flex flex-col items-center gap-0.5 py-4 px-2">
              <span className="text-2xl font-bold font-display text-foreground leading-none">
                {voteCount}
              </span>
              <span className="text-[11px] text-muted-foreground font-body mt-1 text-center">
                Votes
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.5 py-4 px-2">
              <span className="text-2xl font-bold font-display text-foreground leading-none">
                0
              </span>
              <span className="text-[11px] text-muted-foreground font-body mt-1 text-center">
                Claims
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.5 py-4 px-2">
              <span className="text-2xl font-bold font-display text-foreground leading-none">
                0
              </span>
              <span className="text-[11px] text-muted-foreground font-body mt-1 text-center">
                Evidence
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.5 py-4 px-2">
              <span className="text-2xl font-bold font-display text-foreground leading-none">
                0
              </span>
              <span className="text-[11px] text-muted-foreground font-body mt-1 text-center">
                Comments
              </span>
            </div>
          </div>
          <div className="border-t border-border px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-body">
              Trust Score
            </span>
            <span className="text-xs font-semibold font-display text-foreground">
              {trustScore}%
            </span>
          </div>
        </div>
      )}

      {/* Trusted Contributor Progress — own profile only, when not yet earned */}
      {isOwnProfile && !isTrustedContributor && (
        <div className="mt-4 bg-muted/40 border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold font-display text-foreground">
              Trusted Contributor Badge Progress
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground font-body mb-3">
            Earn by contributing quality evidence, comments, and votes
          </p>
          <div className="flex flex-col gap-2.5">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[11px] text-muted-foreground font-body">
                  Activity Points
                </span>
                <span className="text-[11px] font-semibold font-display text-foreground">
                  {activityPoints}/25
                </span>
              </div>
              <div className="w-full bg-border rounded-full h-1.5">
                <div
                  className="bg-primary rounded-full h-1.5 transition-all"
                  style={{
                    width: `${Math.min(100, (activityPoints / 25) * 100)}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[11px] text-muted-foreground font-body">
                  Trust Score
                </span>
                <span className="text-[11px] font-semibold font-display text-foreground">
                  {trustScore}% / 70% required
                </span>
              </div>
              <div className="w-full bg-border rounded-full h-1.5">
                <div
                  className="bg-primary rounded-full h-1.5 transition-all"
                  style={{
                    width: `${Math.min(100, (trustScore / 70) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity tabs — own profile only */}
      {isOwnProfile && (
        <div className="mt-5">
          <Tabs defaultValue="votes">
            <TabsList className="w-full bg-muted p-1 rounded-lg h-auto gap-1">
              <TabsTrigger
                value="votes"
                className="flex-1 gap-1.5 font-body text-xs py-1.5 rounded-md data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground transition-all"
                data-ocid="profile.tab"
              >
                <Vote className="h-3.5 w-3.5" />
                Votes
              </TabsTrigger>
              <TabsTrigger
                value="claims"
                className="flex-1 gap-1.5 font-body text-xs py-1.5 rounded-md data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground transition-all"
                data-ocid="profile.tab"
              >
                <FileText className="h-3.5 w-3.5" />
                Claims
              </TabsTrigger>
              <TabsTrigger
                value="evidence"
                className="flex-1 gap-1.5 font-body text-xs py-1.5 rounded-md data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground transition-all"
                data-ocid="profile.tab"
              >
                <Layers className="h-3.5 w-3.5" />
                Evidence
              </TabsTrigger>
            </TabsList>

            <TabsContent value="votes" className="mt-4">
              {voteCount === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-12 text-center"
                  data-ocid="profile.empty_state"
                >
                  <Vote className="h-8 w-8 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-body text-muted-foreground">
                    No votes yet
                  </p>
                  <p className="text-xs font-body text-muted-foreground/60 mt-1">
                    Votes you cast on claims will appear here.
                  </p>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg divide-y divide-border">
                  {Object.entries(verifiedVotes).map(([claimId, record], i) => (
                    <div
                      key={claimId}
                      data-ocid={`profile.item.${i + 1}`}
                      className="flex items-center justify-between px-4 py-3 gap-3"
                    >
                      <span className="text-sm font-body text-foreground truncate">
                        {record.claimTitle}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`text-xs font-body font-medium px-1.5 py-0.5 rounded ${
                            record.voteType === "True"
                              ? "bg-emerald-100 text-emerald-700"
                              : record.voteType === "False"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {record.voteType}
                        </span>
                        <span className="text-xs text-muted-foreground font-body">
                          {new Date(record.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="claims" className="mt-4">
              <div
                className="flex flex-col items-center justify-center py-12 text-center"
                data-ocid="profile.empty_state"
              >
                <FileText className="h-8 w-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-body text-muted-foreground">
                  No claims submitted yet
                </p>
                <p className="text-xs font-body text-muted-foreground/60 mt-1">
                  Claims you submit will appear here.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="evidence" className="mt-4">
              <div
                className="flex flex-col items-center justify-center py-12 text-center"
                data-ocid="profile.empty_state"
              >
                <Layers className="h-8 w-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-body text-muted-foreground">
                  No evidence posted yet
                </p>
                <p className="text-xs font-body text-muted-foreground/60 mt-1">
                  Evidence you submit on claims will appear here.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </motion.div>
  );
}
