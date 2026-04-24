// components/shared/Logo.tsx

"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Logo({ size = "md", className }: LogoProps) {
  const sizeMap = {
    sm: { w: 24, h: 24 },
    md: { w: 32, h: 32 },
    lg: { w: 80, h: 80 },
  };

  const { w, h } = sizeMap[size];

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Image 
        src="/icon-512.png" 
        alt="Naturale Beach Club Logo" 
        width={w}
        height={h}
        className="object-contain"
        priority={size === "lg"}
      />
    </div>
  );
}
