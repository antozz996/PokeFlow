// components/admin/SimpleOrdersList.tsx

"use client";

import { useOrders } from "@/hooks/useOrders";
import { Check, Trash2, Clock } from "lucide-react";
import { formatTime, minutesAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function SimpleOrdersList() {
  const { orders, loading, advanceStatus, deleteOrder } = useOrders();

  // In modalità semplice mostriamo solo gli ordini "Pronti" (Status 2)
  // e quelli in stato 3 (per l'animazione di uscita)
  const readyOrders = orders.filter((o) => o.status === 2 || o.status === 3);

  if (loading) return null;

  return (
    <div className="flex-1 overflow-y-auto bg-cream p-4 custom-scroll">
      <div className="max-w-3xl mx-auto space-y-3">
        {readyOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <Check className="w-16 h-16 mb-4" />
            <p className="font-body text-xl font-bold italic">Nessuna Poke pronta</p>
          </div>
        ) : (
          readyOrders.map((order) => {
            const mins = minutesAgo(order.created_at);
            const isDelivering = order.status === 3;

            return (
              <div
                key={order.id}
                className={cn(
                  "bg-white rounded-2xl p-4 shadow-sm border flex items-center justify-between transition-all duration-300 animate-slide-up",
                  isDelivering ? "opacity-50 border-status-ready/30 scale-95" : "border-wood-pale/20"
                )}
              >
                <div className="flex items-center gap-6">
                  {/* Numero */}
                  {order.order_num && (
                    <div className="bg-brand/5 rounded-xl p-3 min-w-[70px] text-center border border-brand/10">
                      <p className="text-[10px] uppercase font-bold text-brand tracking-widest leading-none mb-1">
                        Num
                      </p>
                      <p className="font-display text-3xl text-brand leading-none">
                        {order.order_num}
                      </p>
                    </div>
                  )}

                  {/* Nome e Tempo */}
                  <div>
                    <h3 className="font-body text-xl font-bold text-wood-dark leading-tight">
                      {order.customer_name || "Senza nome"}
                    </h3>
                    <div className="flex items-center gap-2 text-wood-light mt-1">
                      <Clock className="w-3 h-3" />
                      <p className="text-xs font-body">
                        {formatTime(order.created_at)} ({mins} min fa)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Tasto Elimina */}
                  {!isDelivering && (
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="p-2 text-wood-pale/40 hover:text-red-400 transition-colors"
                      title="Elimina"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}

                  {/* Tasto Consegna */}
                  <button
                    onClick={() => advanceStatus(order.id, order.status)}
                    disabled={isDelivering}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95",
                      isDelivering 
                        ? "bg-status-ready/20 text-status-ready"
                        : "bg-status-ready text-white shadow-lg shadow-green-200 hover:brightness-110"
                    )}
                  >
                    <Check className="w-5 h-5" />
                    {isDelivering ? "CONSEGNATO" : "CONSEGNA"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
