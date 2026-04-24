// components/admin/OrderCardAdmin.tsx

"use client";

import { cn } from "@/lib/utils";
import { formatTime, minutesAgo } from "@/lib/utils";
import { ChevronRight, Check, Trash2 } from "lucide-react";
import type { Order, OrderStatus } from "@/types";
import { STATUS_LABELS } from "@/types";

interface Props {
  order: Order;
  onAdvance: (id: string, status: number) => void;
  onDelete: (id: string) => void;
}

const cardStyles: Record<number, string> = {
  0: "bg-white",
  1: "bg-white",
  2: "bg-green-50 border border-status-ready/30",
};

const buttonStyles: Record<number, string> = {
  0: "bg-status-preso/10 text-status-preso hover:bg-status-preso hover:text-white",
  1: "bg-status-prep/10 text-status-prep hover:bg-status-prep hover:text-white",
  2: "bg-status-ready/10 text-status-ready hover:bg-status-ready hover:text-white",
};

export default function OrderCardAdmin({ order, onAdvance, onDelete }: Props) {
  const mins = minutesAgo(order.created_at);

  return (
    <div
      className={cn(
        "rounded-xl p-3 shadow-sm flex flex-col gap-1 relative animate-slide-up transition-all duration-200",
        cardStyles[order.status] || "bg-white"
      )}
    >
      {/* Header: numero e tempo */}
      <div className="flex items-center justify-between pr-16">
        <span className="font-display text-xl text-wood-dark">
          #{order.order_num}
        </span>
        <span className="text-xs text-wood-light font-body">
          {formatTime(order.created_at)} · {mins}min
        </span>
      </div>

      {/* Nome cliente */}
      <p className="font-body text-sm font-semibold text-wood-dark truncate pr-16">
        {order.customer_name}
      </p>

      {/* Note */}
      {order.notes && (
        <p className="text-xs text-wood-light font-body italic truncate">
          {order.notes}
        </p>
      )}

      {/* Badge stato */}
      <span className="text-[10px] font-bold uppercase tracking-wider text-wood-med/60 mt-0.5">
        {STATUS_LABELS[order.status as OrderStatus]}
      </span>

      {/* Bottone avanza */}
      <button
        onClick={() => onAdvance(order.id, order.status)}
        className={cn(
          "absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl text-sm font-bold flex items-center justify-center transition-all duration-200 active:scale-95",
          buttonStyles[order.status] || "bg-gray-100 text-gray-400"
        )}
        title={order.status === 2 ? "Segna come consegnato" : "Avanza stato"}
      >
        {order.status === 2 ? (
          <Check className="w-6 h-6" />
        ) : (
          <ChevronRight className="w-6 h-6" />
        )}
      </button>

      {/* Bottone elimina (piccolo, in basso a destra) */}
      <button
        onClick={() => onDelete(order.id)}
        className="absolute right-2 bottom-1.5 text-wood-pale/60 hover:text-red-400 transition-colors"
        title="Elimina ordine"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}
