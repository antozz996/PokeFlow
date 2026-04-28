// app/admin/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { cn } from "@/lib/utils";
import Logo from "@/components/shared/Logo";
import KanbanBoard from "@/components/admin/KanbanBoard";
import NewOrderForm from "@/components/admin/NewOrderForm";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import SimpleOrdersList from "@/components/admin/SimpleOrdersList";
import { LogOut, BarChart3, LayoutDashboard, Settings2, Unlock } from "lucide-react";

export default function AdminPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdvancedMode, setAdvancedMode } = useOrders();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"orders" | "analytics">("orders");

  const handleSignOut = async () => {
    await signOut();
    router.push("/admin/login");
  };

  // Lo stato di caricamento e la presenza dell'utente sono ora garantiti dal middleware.
  // Manteniamo comunque un controllo minimo per la fase di idratazione client.
  if (authLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen bg-cream overflow-hidden">
      {/* Header sticky */}
      <header className="bg-wood-dark sticky top-0 z-50 h-14 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <span className="bg-brand/10 border border-brand/20 text-brand-accent text-[10px] font-bold tracking-widest px-2 py-0.5 rounded uppercase hidden sm:inline-block">
            {isAdvancedMode ? "Admin Pro" : "Sistema Semplice"}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Toggle Modalità Avanzata */}
          <button
            onClick={() => setAdvancedMode(!isAdvancedMode)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[10px] font-bold uppercase tracking-wider",
              isAdvancedMode 
                ? "bg-brand/20 border-brand/40 text-brand-accent" 
                : "bg-white/5 border-white/10 text-wood-pale hover:bg-white/10"
            )}
          >
            {isAdvancedMode ? <Unlock className="w-3 h-3" /> : <Settings2 className="w-3 h-3" />}
            {isAdvancedMode ? "Sblocca Pro" : "Attiva Avanzato"}
          </button>

          <button
            onClick={handleSignOut}
            className="text-wood-pale hover:text-white transition-colors flex items-center gap-2"
            title="Esci"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Tab Navigation — Mostrate solo in modalità avanzata */}
      {isAdvancedMode && (
        <div className="bg-white border-b border-wood-pale/30 flex items-center justify-center gap-8 px-4 shrink-0">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 py-3 px-2 border-b-2 transition-colors font-bold text-sm ${
              activeTab === "orders"
                ? "border-brand text-brand"
                : "border-transparent text-wood-light hover:text-wood-med"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Ordini Live
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 py-3 px-2 border-b-2 transition-colors font-bold text-sm ${
              activeTab === "analytics"
                ? "border-brand text-brand"
                : "border-transparent text-wood-light hover:text-wood-med"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Statistiche
          </button>
        </div>
      )}

      {/* Se siamo in modalità semplice o tab ordini */}
      {(activeTab === "orders" || !isAdvancedMode) && (
        <>
          <NewOrderForm />
          {isAdvancedMode ? <KanbanBoard /> : <SimpleOrdersList />}
        </>
      )}

      {/* Se siamo in tab analytics (solo pro) */}
      {isAdvancedMode && activeTab === "analytics" && (
        <AnalyticsDashboard />
      )}
    </div>
  );
}
