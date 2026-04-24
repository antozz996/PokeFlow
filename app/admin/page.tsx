// app/admin/page.tsx

"use client";

import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/shared/Logo";
import KanbanBoard from "@/components/admin/KanbanBoard";
import NewOrderForm from "@/components/admin/NewOrderForm";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { signOut } = useAuth();
  const router = useRouter();

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
          <span className="bg-poke/20 border border-poke/40 text-poke-light text-[10px] font-bold tracking-widest px-2 py-0.5 rounded uppercase hidden sm:inline-block">
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

      {/* Form di inserimento rapido */}
      <NewOrderForm />

      {/* Kanban Board */}
      <KanbanBoard />
    </div>
  );
}
