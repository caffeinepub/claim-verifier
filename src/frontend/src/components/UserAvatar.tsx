import { cn } from "@/lib/utils";
import { generateIdenticonDataUrl } from "@/utils/identicon";
import { useState } from "react";

interface UserAvatarProps {
  username?: string;
  avatarUrl?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  /** Only render the avatar for verified (logged-in) users. If false/undefined, returns null. */
  isVerified?: boolean;
}

const sizeMap = {
  xs: "h-5 w-5 min-w-[20px] min-h-[20px]",
  sm: "h-6 w-6 min-w-[24px] min-h-[24px]",
  md: "h-8 w-8 min-w-[32px] min-h-[32px]",
  lg: "h-20 w-20 min-w-[80px] min-h-[80px]",
};

export function UserAvatar({
  username,
  avatarUrl,
  size = "md",
  className,
  isVerified,
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  // Anonymous users (not verified) get no avatar at all
  if (!isVerified) return null;

  const sizeClass = sizeMap[size];

  // Prefer custom avatarUrl if provided and no error
  const showCustom = avatarUrl && !imgError;

  if (showCustom) {
    return (
      <img
        src={avatarUrl}
        alt={username}
        onError={() => setImgError(true)}
        className={cn(
          sizeClass,
          "rounded-full object-cover flex-shrink-0",
          className,
        )}
      />
    );
  }

  // Identicon fallback (only for verified users with a username)
  if (!username) return null;
  const identiconUrl = generateIdenticonDataUrl(username);
  return (
    <img
      src={identiconUrl}
      alt={username}
      className={cn(
        sizeClass,
        "rounded-full object-cover flex-shrink-0",
        className,
      )}
    />
  );
}
