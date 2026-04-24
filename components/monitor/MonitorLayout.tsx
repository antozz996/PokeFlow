// components/monitor/MonitorLayout.tsx

"use client";

import { useOrders } from "@/hooks/useOrders";
import Logo from "@/components/shared/Logo";
import LiveBadge from "@/components/monitor/LiveBadge";
import OrderCardMonitor from "@/components/monitor/OrderCardMonitor";
import QRCode from "@/components/shared/QRCode";
import type { Order } from "@/types";

interface MonitorLayoutProps {
  initialOrders?: Order[];
}

export default function MonitorLayout({ initialOrders }: MonitorLayoutProps) {
  const { orders, loading } = useOrders();
  
  // Usa ordini iniziali (SSR) finché il Realtime non si attiva
  const displayOrders = orders.length > 0 || !loading ? orders : (initialOrders || []);

  const inPreparazione = displayOrders.filter((o) => o.status === 1);
  const pronti = displayOrders.filter((o) => o.status === 2);
  // Status 0 (preso in carico) va nella colonna sinistra
  const presiInCarico = displayOrders.filter((o) => o.status === 0);
  const leftColumn = [...presiInCarico, ...inPreparazione];

  return (
    <div className="monitor-fullscreen bg-[#0D1117] flex flex-col">
      {/* Header */}
      <header className="bg-wood-dark h-16 px-6 flex items-center justify-between shrink-0">
        <Logo size="md" />
        <h1 className="font-body text-cream/80 text-sm font-semibold tracking-widest uppercase hidden sm:block">
          Stato Ordini
        </h1>
        <LiveBadge />
      </header>

      {/* Colonne */}
      <div className="grid grid-cols-2 flex-1 min-h-0">
        {/* Colonna Sinistra — In Preparazione */}
        <div className="flex flex-col min-h-0 border-r border-white/5">
          <div className="bg-[#1D4ED8] py-2.5 px-4 shrink-0">
            <p className="text-monitor-col font-bold uppercase tracking-widest text-white/90 text-center">
              ⏳ In Preparazione
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-0 custom-scroll">
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
                isReady={false}
              />
            ))}
          </div>
        </div>

        {/* Colonna Destra — Pronto / RITIRA */}
        <div className="flex flex-col min-h-0 relative">
          <div className="bg-status-ready py-2.5 px-4 shrink-0">
            <p className="text-monitor-col font-bold uppercase tracking-widest text-white/90 text-center">
              ✓ Pronto — Ritira Ora!
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-0 custom-scroll">
            {pronti.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-white/20 font-body text-lg">
                  Nessun ordine pronto
                </p>
              </div>
            )}
            {pronti.map((order) => (
              <OrderCardMonitor
                key={order.id}
                order={order}
                isReady={true}
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
