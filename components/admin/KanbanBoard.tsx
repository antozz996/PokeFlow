// components/admin/KanbanBoard.tsx

"use client";

import { useOrders } from "@/hooks/useOrders";
import KanbanColumn from "./KanbanColumn";

export default function KanbanBoard() {
  const { orders, loading, advanceStatus, deleteOrder } = useOrders();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-cream">
        <p className="text-wood-med font-body animate-pulse">
          Caricamento ordini...
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden h-full">
      <KanbanColumn
        title="Preso in carico"
        status={0}
        orders={orders}
        onAdvance={advanceStatus}
        onDelete={deleteOrder}
        headerColorClass="bg-amber-100 text-status-preso"
      />
      <KanbanColumn
        title="In Preparazione"
        status={1}
        orders={orders}
        onAdvance={advanceStatus}
        onDelete={deleteOrder}
        headerColorClass="bg-blue-50 text-status-prep"
      />
      <KanbanColumn
        title="Ritira"
        status={2}
        orders={orders}
        onAdvance={advanceStatus}
        onDelete={deleteOrder}
        headerColorClass="bg-green-50 text-status-ready"
      />
    </div>
  );
}
