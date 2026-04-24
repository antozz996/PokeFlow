// components/shared/StatusBadge.tsx

"use client";

import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";
import { STATUS_LABELS } from "@/types";

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const badgeStyles: Record<OrderStatus, string> = {
  0: "bg-amber-100 text-status-preso border-status-preso/30",
  1: "bg-blue-50 text-status-prep border-status-prep/30",
  2: "bg-green-50 text-status-ready border-status-ready/30",
  3: "bg-wood-pale/20 text-wood-med border-wood-pale/30",
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border tracking-wide uppercase",
        badgeStyles[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
