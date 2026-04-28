// components/monitor/MonitorLayout.tsx

"use client";

import { useOrders } from "@/hooks/useOrders";
import { cn } from "@/lib/utils";
import Logo from "@/components/shared/Logo";
import LiveBadge from "@/components/monitor/LiveBadge";
import OrderCardMonitor from "@/components/monitor/OrderCardMonitor";
import QRCode from "@/components/shared/QRCode";
import type { Order } from "@/types";

interface MonitorLayoutProps {
  initialOrders?: Order[];
}

export default function MonitorLayout({ initialOrders }: MonitorLayoutProps) {
  const { orders, loading, isAdvancedMode } = useOrders();
  
  // Usa ordini iniziali (SSR) finché il Realtime non si attiva
  const displayOrders = orders.length > 0 || !loading ? orders : (initialOrders || []);

  // Se non siamo in modalità avanzata, mostriamo solo la colonna "Pronto"
  const showLeftColumn = isAdvancedMode;

  const inPreparazione = displayOrders.filter((o) => o.status === 1);
  const pronti = displayOrders.filter((o) => o.status === 2 || o.status === 3);
  // Status 0 (preso in carico) va nella colonna sinistra
  const presiInCarico = displayOrders.filter((o) => o.status === 0);
  
  // Ordini in preparazione in alto, poi quelli presi in carico in basso
  const leftColumn = [...inPreparazione, ...presiInCarico];

  const getCompactLevel = (count: number) => {
    // In modalità semplice (colonna singola) possiamo permetterci più spazio
    if (!showLeftColumn) {
      if (count <= 6) return 0;
      if (count <= 10) return 1;
      return 2;
    }
    if (count <= 4) return 0;
    if (count <= 6) return 1;
    return 2;
  };

  const leftCompactLevel = getCompactLevel(leftColumn.length);
  const rightCompactLevel = getCompactLevel(pronti.length);

  return (
    <div className="monitor-fullscreen bg-brand-dark flex flex-col">
      {/* Header */}
      <header className="bg-wood-dark h-16 px-6 flex items-center justify-between shrink-0">
        <Logo size="md" />
        <h1 className="font-body text-cream/80 text-sm font-semibold tracking-widest uppercase hidden sm:block">
          Stato Ordini
        </h1>
        <LiveBadge />
      </header>

      {/* Colonne */}
      <div className={cn(
        "flex-1 min-h-0",
        showLeftColumn ? "grid grid-cols-2" : "flex flex-col"
      )}>
        {/* Colonna Sinistra — In Preparazione (Mostrata solo in Pro) */}
        {showLeftColumn && (
          <div className="flex flex-col min-h-0 border-r border-white/5">
            <div className="bg-[#2A2420] py-2.5 px-4 shrink-0">
              <p className="text-brand-accent font-bold uppercase tracking-widest text-center">
                ⏳ In Coda / Preparazione
              </p>
            </div>
            <div className={`flex-1 overflow-y-auto p-4 custom-scroll ${leftCompactLevel > 0 ? "space-y-2" : "space-y-4"}`}>
              {leftColumn.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-white/20 font-body text-lg">
                    Nessun ordine in preparazione
                  </p>
                </div>
              )}
              {leftColumn.map((order) => (
                <OrderCardMonitor
                  key={order.id}
                  order={order}
                  compactLevel={leftCompactLevel}
                />
              ))}
            </div>
          </div>
        )}

        {/* Colonna Destra — Pronto / RITIRA */}
        <div className="flex flex-col min-h-0 relative flex-1">
          <div className="bg-status-ready py-2.5 px-4 shrink-0">
            <p className="text-white font-bold uppercase tracking-widest text-center text-lg">
              ✓ Pronto — Ritira Ora!
            </p>
          </div>
          <div className={cn(
            "flex-1 overflow-y-auto p-6 custom-scroll",
            !showLeftColumn ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : (rightCompactLevel > 0 ? "space-y-2" : "space-y-4")
          )}>
            {pronti.length === 0 && (
              <div className={cn("flex items-center justify-center h-full", !showLeftColumn && "col-span-full")}>
                <p className="text-white/20 font-body text-2xl italic">
                  In attesa di nuove Poke...
                </p>
              </div>
            )}
            {pronti.map((order) => (
              <OrderCardMonitor
                key={order.id}
                order={order}
                compactLevel={!showLeftColumn ? 0 : rightCompactLevel}
              />
            ))}
          </div>

          {/* QR Code — angolo in basso a destra (nascosto su mobile) */}
          <div className="hidden md:block absolute bottom-4 right-4 opacity-60 hover:opacity-100 transition-opacity">
            <QRCode />
          </div>
        </div>
      </div>
    </div>
  );
}
