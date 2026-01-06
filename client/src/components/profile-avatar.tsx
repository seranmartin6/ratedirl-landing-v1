import { User } from "lucide-react";

interface ProfileAvatarProps {
  photoUrl?: string | null;
  firstName?: string;
  lastName?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

const iconSizes = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-8 h-8",
  xl: "w-10 h-10",
};

export function ProfileAvatar({ 
  photoUrl, 
  firstName, 
  lastName, 
  size = "md",
  className = "" 
}: ProfileAvatarProps) {
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20 shrink-0 ${className}`}>
      {photoUrl ? (
        <img 
          src={photoUrl} 
          alt={`${firstName || ""} ${lastName || ""}`.trim() || "Profile"} 
          className="w-full h-full object-cover"
        />
      ) : (
        <User className={`${iconSizes[size]} text-white/40`} />
      )}
    </div>
  );
}
