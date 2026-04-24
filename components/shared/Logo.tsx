// components/shared/Logo.tsx

"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Logo({ size = "md", className }: LogoProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-20", // Più grande per la pagina di login
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <img 
        src="/icon-512.png" 
        alt="Naturale Beach Club Logo" 
        className={cn("object-contain", sizeClasses[size])}
      />
    </div>
  );
}
