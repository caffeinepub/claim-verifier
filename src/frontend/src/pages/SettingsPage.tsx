import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useUpdateProfile } from "@/hooks/useQueries";
import {
  DEFAULT_PRIVACY_SETTINGS,
  useVerifiedAccount,
} from "@/hooks/useVerifiedAccount";
import {
  ArrowLeft,
  AtSign,
  Calendar,
  Eye,
  LayoutGrid,
  Settings,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface SettingsPageProps {
  onBack: () => void;
  onChangeUsername: () => void;
}

export function SettingsPage({ onBack, onChangeUsername }: SettingsPageProps) {
  const {
    username,
    joinDate,
    privacySettings,
    setAvatarUrl: _setAvatarUrl,
    principal,
    logout,
  } = useVerifiedAccount();
  const updateProfile = useUpdateProfile();

  const [showVoteHistory, setShowVoteHistory] = useState(
    () => privacySettings?.showVotes ?? true,
  );
  const [showActivityTabs, setShowActivityTabs] = useState(
    () =>
      (privacySettings?.showClaims &&
        privacySettings?.showEvidence &&
        privacySettings?.showComments) ??
      true,
  );

  function toggleVoteHistory(val: boolean) {
    setShowVoteHistory(val);
    if (principal) {
      const newSettings = {
        ...(privacySettings ?? DEFAULT_PRIVACY_SETTINGS),
        showVotes: val,
      };
      updateProfile.mutate({
        principal,
        username: username ?? "",
        bio: "",
        avatarUrl: "",
        privacySettings: newSettings,
      });
    }
  }

  function toggleActivityTabs(val: boolean) {
    setShowActivityTabs(val);
    if (principal) {
      const newSettings = {
        ...(privacySettings ?? DEFAULT_PRIVACY_SETTINGS),
        showClaims: val,
        showEvidence: val,
        showComments: val,
      };
      updateProfile.mutate({
        principal,
        username: username ?? "",
        bio: "",
        avatarUrl: "",
        privacySettings: newSettings,
      });
    }
  }

  function handleDeleteAccount() {
    // Clear local session data
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("rebunked_") || key?.startsWith("claim_verifier_")) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
    logout();
    toast.success("Account data cleared");
  }

  const formattedJoinDate = joinDate
    ? new Date(joinDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : null;

  return (
    <motion.div
      data-ocid="settings.page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="max-w-2xl mx-auto"
    >
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="mb-6 text-muted-foreground hover:text-foreground gap-2 -ml-2 font-body"
        data-ocid="settings.secondary_button"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground font-body">
            Manage your account and privacy preferences
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Account section */}
        <section className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-muted/30">
            <h2 className="text-sm font-semibold font-body text-foreground uppercase tracking-wide">
              Account
            </h2>
          </div>
          <div className="divide-y divide-border">
            {/* Username */}
            <div className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <AtSign className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium font-body text-foreground">
                    Username
                  </p>
                  <p className="text-xs text-muted-foreground font-body truncate">
                    {username ? `@${username}` : "Not set"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onChangeUsername}
                data-ocid="settings.change_username_button"
                className="shrink-0 font-body text-xs"
              >
                Change
              </Button>
            </div>

            {/* Joined date */}
            <div className="px-5 py-4 flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium font-body text-foreground">
                  Member since
                </p>
                <p className="text-xs text-muted-foreground font-body">
                  {formattedJoinDate ?? "Unknown"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy section */}
        <section className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-muted/30">
            <h2 className="text-sm font-semibold font-body text-foreground uppercase tracking-wide">
              Privacy
            </h2>
          </div>
          <div className="divide-y divide-border">
            {/* Show vote history */}
            <div className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <Label
                    htmlFor="toggle-vote-history"
                    className="text-sm font-medium font-body text-foreground cursor-pointer"
                  >
                    Show vote history tab
                  </Label>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">
                    Allow others to see your Votes tab on your public profile
                  </p>
                </div>
              </div>
              <Switch
                id="toggle-vote-history"
                data-ocid="settings.show_vote_history.switch"
                checked={showVoteHistory}
                onCheckedChange={toggleVoteHistory}
              />
            </div>

            {/* Show activity tabs */}
            <div className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <LayoutGrid className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <Label
                    htmlFor="toggle-activity-tabs"
                    className="text-sm font-medium font-body text-foreground cursor-pointer"
                  >
                    Show activity tabs
                  </Label>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">
                    Allow others to see your Claims, Evidence, and Comments tabs
                  </p>
                </div>
              </div>
              <Switch
                id="toggle-activity-tabs"
                data-ocid="settings.show_activity_tabs.switch"
                checked={showActivityTabs}
                onCheckedChange={toggleActivityTabs}
              />
            </div>
          </div>
        </section>

        {/* Danger zone */}
        <section className="bg-card border border-destructive/30 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-destructive/20 bg-destructive/5">
            <h2 className="text-sm font-semibold font-body text-destructive uppercase tracking-wide">
              Danger Zone
            </h2>
          </div>
          <div className="px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium font-body text-foreground">
                Delete Account
              </p>
              <p className="text-xs text-muted-foreground font-body mt-0.5">
                Permanently remove your account and all associated data. This
                cannot be undone.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  data-ocid="settings.delete_account_button"
                  className="shrink-0 font-body text-xs gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-display">
                    Delete your account?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="font-body">
                    This will permanently delete your account, username, bio,
                    avatar, and all stored preferences. Your public
                    contributions (claims, evidence, comments) will remain but
                    will be attributed to an anonymous user. This action cannot
                    be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    data-ocid="settings.delete_cancel_button"
                    className="font-body"
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    data-ocid="settings.delete_confirm_button"
                    onClick={handleDeleteAccount}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-body"
                  >
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      </div>

      {/* Bottom spacer */}
      <div className="h-12" />
    </motion.div>
  );
}
