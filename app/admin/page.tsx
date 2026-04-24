// app/admin/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/shared/Logo";
import KanbanBoard from "@/components/admin/KanbanBoard";
import NewOrderForm from "@/components/admin/NewOrderForm";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import { LogOut, BarChart3, LayoutDashboard } from "lucide-react";

export default function AdminPage() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"orders" | "analytics">("orders");

  const handleSignOut = async () => {
    await signOut();
    router.push("/admin/login");
  };

  return (
    <div className="flex flex-col h-screen bg-cream overflow-hidden">
      {/* Header sticky */}
      <header className="bg-wood-dark sticky top-0 z-50 h-14 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <span className="bg-brand/10 border border-brand/20 text-brand-accent text-[10px] font-bold tracking-widest px-2 py-0.5 rounded uppercase hidden sm:inline-block">
            Operatore
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="text-wood-pale hover:text-white transition-colors flex items-center gap-2"
          title="Esci"
        >
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline-block">
            Esci
          </span>
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Tab Navigation */}
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

      {activeTab === "orders" ? (
        <>
          {/* Form di inserimento rapido */}
          <NewOrderForm />

          {/* Kanban Board */}
          <KanbanBoard />
        </>
      ) : (
        <AnalyticsDashboard />
      )}
    </div>
  );
}
