import { cn } from "@/lib/utils";
import { generateIdenticonDataUrl } from "@/utils/identicon";
import { User } from "lucide-react";
import { useState } from "react";

interface UserAvatarProps {
  username?: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-6 w-6 min-w-[24px] min-h-[24px]",
  md: "h-8 w-8 min-w-[32px] min-h-[32px]",
  lg: "h-20 w-20 min-w-[80px] min-h-[80px]",
};

const iconSizeMap = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-8 w-8",
};

export function UserAvatar({
  username,
  avatarUrl,
  size = "md",
  className,
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClass = sizeMap[size];

  // No username at all — anonymous placeholder
  if (!username) {
    return (
      <div
        className={cn(
          sizeClass,
          "rounded-full bg-muted flex items-center justify-center flex-shrink-0",
          className,
        )}
      >
        <User className={cn(iconSizeMap[size], "text-muted-foreground")} />
      </div>
    );
  }

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

  // Identicon fallback
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
