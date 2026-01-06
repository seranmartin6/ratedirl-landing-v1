import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

interface ShimmerLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function ShimmerLogo({ size = "md", showText = true }: ShimmerLogoProps) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  const textClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative overflow-hidden">
        <ShieldCheck 
          className={`${sizeClasses[size]} text-blue-400 fill-blue-400/20`} 
          style={{ transform: 'scaleY(0.95)' }} 
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatDelay: 5,
            ease: "easeInOut"
          }}
          style={{ 
            width: "50%",
            skewX: -15
          }}
        />
      </div>
      {showText && (
        <span 
          className={`font-display font-bold ${textClasses[size]}`} 
          style={{ transform: 'scaleY(0.97)' }}
        >
          RatedIRL
        </span>
      )}
    </div>
  );
}
