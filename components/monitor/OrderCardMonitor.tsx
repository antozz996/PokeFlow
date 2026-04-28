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

  const paddingClass = compactLevel === 2 ? "p-3" : compactLevel === 1 ? "p-4" : "p-6";
  const numSizeClass = compactLevel === 2 ? "text-4xl" : compactLevel === 1 ? "text-5xl" : "text-7xl";
  const nameSizeClass = compactLevel === 2 ? "text-lg mt-1" : compactLevel === 1 ? "text-xl mt-1" : "text-2xl mt-2";

  return (
    <div
      className={cn(
        "rounded-3xl border shadow-2xl transition-all duration-300 animate-fade-in relative overflow-hidden flex flex-col items-center justify-center text-center",
        paddingClass,
        getCardStyle(order.status)
      )}
    >
      {/* Decorative gradient overlay per un look premium */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center gap-1">
        {/* Numero Ordine */}
        <p className={cn("font-display leading-none text-white drop-shadow-md", numSizeClass)}>
          #{order.order_num}
        </p>
        
        {/* Nome Cliente */}
        {order.customer_name && (
          <p className={cn("font-body font-bold text-white/95 uppercase tracking-wide", nameSizeClass)}>
            {order.customer_name}
          </p>
        )}

        {/* Badge Stato (centrato sotto) */}
        <div className="mt-4">
          {order.status === 2 && (
            <span className="text-[10px] font-black tracking-[0.2em] text-white/90 uppercase bg-black/20 backdrop-blur-md border border-white/10 rounded-full px-5 py-1.5 shadow-sm">
              ✓ RITIRA ORA
            </span>
          )}
          {order.status === 1 && (
            <span className="text-[10px] font-black tracking-[0.2em] text-brand-accent uppercase bg-black/30 backdrop-blur-md rounded-full px-5 py-1.5">
              ⏳ IN PREPARAZIONE
            </span>
          )}
          {order.status === 0 && (
            <span className="text-[10px] font-black tracking-[0.2em] text-white/70 uppercase bg-black/20 backdrop-blur-md rounded-full px-5 py-1.5">
              📝 RICEVUTO
            </span>
          )}
        </div>
      </div>

      {order.notes && compactLevel < 2 && (
        <p className={cn("text-white/60 font-body italic mt-3 relative z-10", compactLevel === 1 ? "text-[10px]" : "text-xs")}>
          &quot;{order.notes}&quot;
        </p>
      )}
    </div>
  );
}
