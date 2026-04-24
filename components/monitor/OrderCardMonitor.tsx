// components/monitor/OrderCardMonitor.tsx

"use client";

import { cn } from "@/lib/utils";
import type { Order } from "@/types";

interface Props {
  order: Order;
  isReady: boolean;
}

export default function OrderCardMonitor({ order, isReady }: Props) {
  const getCardStyle = (status: number) => {
    switch(status) {
      case 0: return "bg-status-preso border-status-preso/40";
      case 1: return "bg-status-prep border-status-prep/40";
      case 2: return "bg-status-ready border-status-ready/40 animate-ready-pulse";
      default: return "bg-brand-light";
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-5 border shadow-xl transition-all duration-300 animate-fade-in relative overflow-hidden",
        getCardStyle(order.status)
      )}
    >
      {/* Decorative gradient overlay per un look premium */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="font-display text-monitor-num leading-none text-white drop-shadow-sm">
            #{order.order_num}
          </p>
          <p className="font-body text-monitor-name font-medium mt-2 text-white/95">
            {order.customer_name}
          </p>
        </div>
        <div className="mt-1">
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
      {order.notes && (
        <p className="text-sm text-white/60 mt-2 font-body italic">
          {order.notes}
        </p>
      )}
    </div>
  );
}
