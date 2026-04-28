// components/admin/KanbanColumn.tsx

"use client";

import { cn } from "@/lib/utils";
import OrderCardAdmin from "./OrderCardAdmin";
import type { Order } from "@/types";

interface Props {
  title: string;
  status: 0 | 1 | 2;
  orders: Order[];
  onAdvance: (id: string, status: number) => void;
  onDelete: (id: string) => void;
  headerColorClass: string;
}

export default function KanbanColumn({
  title,
  status,
  orders,
  onAdvance,
  onDelete,
  headerColorClass,
}: Props) {
  // Filtra solo gli ordini per questo stato (includi lo stato 3 nella colonna "Ritira" per l'animazione)
  const columnOrders = orders.filter((o) => 
    o.status === status || (status === 2 && o.status === 3)
  );

  return (
    <div className="flex flex-col min-h-0 border-r border-wood-pale/30 last:border-r-0">
      <div
        className={cn(
          "text-xs font-bold uppercase tracking-wider py-2 text-center shrink-0 border-b border-wood-pale/20",
          headerColorClass
        )}
      >
        {title} ({columnOrders.length})
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-cream custom-scroll">
        {columnOrders.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-wood-pale/60 text-sm font-body text-center">
              Nessun ordine
            </p>
          </div>
        ) : (
          columnOrders.map((order) => (
            <OrderCardAdmin
              key={order.id}
              order={order}
              onAdvance={onAdvance}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
