// components/shared/Logo.tsx

"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Logo({ size = "md", className }: LogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <span
      className={cn(
        "font-display tracking-tight select-none",
        sizeClasses[size],
        className
      )}
    >
      <span className="text-poke-light">Poke</span>
      <span className="text-cream">Flow</span>
    </span>
  );
}
