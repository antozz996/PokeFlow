// components/monitor/OrderCardMonitor.tsx

"use client";

import { cn } from "@/lib/utils";
import type { Order } from "@/types";

interface Props {
  order: Order;
  isReady: boolean;
}

export default function OrderCardMonitor({ order, isReady }: Props) {
  return (
    <div
      className={cn(
        "rounded-xl p-4 mb-3 animate-fade-in transition-all duration-300",
          isReady
            ? "bg-status-ready animate-ready-pulse"
            : "bg-status-prep"
        )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-monitor-num leading-none text-white">
            #{order.order_num}
          </p>
          <p className="font-body text-monitor-name font-medium mt-1 text-white/90">
            {order.customer_name}
          </p>
        </div>
        <div className="mt-1">
          {isReady ? (
            <span className="text-xs font-bold tracking-wide text-white/80 uppercase bg-white/20 rounded-full px-3 py-1">
              ✓ RITIRA
            </span>
          ) : (
            <span className="text-xs font-bold tracking-wide text-brand-accent uppercase">
              ⏳ IN PREP
            </span>
          )}
        </div>
      </div>
      {order.notes && (
        <p className="text-sm text-white/60 mt-2 font-body italic">
          {order.notes}
        </p>
      )}
    </div>
  );
}
