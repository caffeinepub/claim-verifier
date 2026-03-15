import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { useStorageClient } from "@/hooks/useStorageClient";
import { useVerifiedAccount } from "@/hooks/useVerifiedAccount";
import { ArrowLeft, BadgeCheck, Camera, Info, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface ProfilePageProps {
  username: string;
  onBack: () => void;
}

export function ProfilePage({ username, onBack }: ProfilePageProps) {
  const { displayName, joinDate, avatarUrl, setAvatarUrl, isVerified } =
    useVerifiedAccount();
  const isOwnProfile = isVerified && displayName === username;

  const { data: storageClient } = useStorageClient();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formattedJoinDate = joinDate
    ? new Date(joinDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

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
      <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center gap-4">
        {/* Avatar + upload */}
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

        {/* Username */}
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl font-bold text-foreground">
            {username}
          </h1>
          <BadgeCheck className="h-6 w-6 text-primary" />
        </div>

        {/* Join date */}
        {formattedJoinDate && (
          <p className="text-sm text-muted-foreground font-body">
            Member since {formattedJoinDate}
          </p>
        )}

        {/* Change avatar button (visible below avatar on own profile) */}
        {isOwnProfile && (
          <Button
            variant="outline"
            size="sm"
            data-ocid="profile.secondary_button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !storageClient}
            className="gap-2 font-body text-xs mt-1"
          >
            {isUploading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Camera className="h-3 w-3" />
            )}
            {isUploading ? "Uploading…" : "Change Avatar"}
          </Button>
        )}

        {/* Contributions note */}
        <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground font-body bg-muted/50 rounded-lg px-4 py-3 w-full max-w-sm">
          <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <span>
            Contributions are anonymous on Rebunked. Individual votes and
            evidence are not attributed to your profile.
          </span>
        </div>
      </div>
    </motion.div>
  );
}
