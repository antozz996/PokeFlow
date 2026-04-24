// components/monitor/OrderCardMonitor.tsx

"use client";

import { cn } from "@/lib/utils";
import type { Order } from "@/types";

interface Props {
  order: Order;
  compactLevel?: number; // 0 = normal, 1 = medium, 2 = small
}

export default function OrderCardMonitor({ order, compactLevel = 0 }: Props) {
  const getCardStyle = (status: number) => {
    switch(status) {
      case 0: return "bg-status-preso border-status-preso/40";
      case 1: return "bg-status-prep border-status-prep/40";
      case 2: return "bg-status-ready border-status-ready/40 animate-ready-pulse";
      default: return "bg-brand-light";
    }
  };

  const paddingClass = compactLevel === 2 ? "p-3" : compactLevel === 1 ? "p-4" : "p-5";
  const numSizeClass = compactLevel === 2 ? "text-4xl" : compactLevel === 1 ? "text-5xl" : "text-monitor-num";
  const nameSizeClass = compactLevel === 2 ? "text-lg mt-1" : compactLevel === 1 ? "text-xl mt-1" : "text-monitor-name mt-2";
  const badgeScale = compactLevel === 2 ? "scale-75 origin-top-right" : compactLevel === 1 ? "scale-90 origin-top-right" : "";

  return (
    <div
      className={cn(
        "rounded-2xl border shadow-xl transition-all duration-300 animate-fade-in relative overflow-hidden",
        paddingClass,
        getCardStyle(order.status)
      )}
    >
      {/* Decorative gradient overlay per un look premium */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className={cn("font-display leading-none text-white drop-shadow-sm", numSizeClass)}>
            #{order.order_num}
          </p>
          <p className={cn("font-body font-medium text-white/95", nameSizeClass)}>
            {order.customer_name}
          </p>
        </div>
        <div className={cn("mt-1", badgeScale)}>
          {order.status === 2 && (
            <span className="text-xs font-bold tracking-widest text-white/95 uppercase bg-white/20 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 shadow-sm">
              ✓ RITIRA
            </span>
          )}
          {order.status === 1 && (
            <span className="text-xs font-bold tracking-widest text-brand-accent uppercase bg-black/20 backdrop-blur-sm rounded-full px-4 py-1.5">
              ⏳ IN PREP
            </span>
          )}
          {order.status === 0 && (
            <span className="text-xs font-bold tracking-widest text-white/80 uppercase bg-black/10 backdrop-blur-sm rounded-full px-4 py-1.5">
              📝 RICEVUTO
            </span>
          )}
        </div>
      </div>
      {order.notes && compactLevel < 2 && (
        <p className={cn("text-white/60 font-body italic", compactLevel === 1 ? "text-xs mt-1" : "text-sm mt-2")}>
          {order.notes}
        </p>
      )}
    </div>
  );
}
