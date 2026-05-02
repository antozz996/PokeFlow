// components/admin/NewOrderForm.tsx

"use client";

import { useState, useRef, FormEvent } from "react";
import { useOrders } from "@/hooks/useOrders";
import { Plus } from "lucide-react";

export default function NewOrderForm() {
  const { addOrder } = useOrders();
  const [orderNum, setOrderNum] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [cassa, setCassa] = useState<'A' | 'B' | 'C' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const numInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validazione aggiornata: almeno un campo deve essere presente
    if (!orderNum && !customerName.trim() && !cassa) {
      setError("Inserire almeno un dato (Cassa, Numero o Nome)");
      return;
    }

    const num = orderNum ? parseInt(orderNum, 10) : null;
    if (orderNum && (isNaN(num!) || num! < 1 || num! > 999)) {
      setError("N° non valido");
      return;
    }

    setLoading(true);
    try {
      await addOrder({
        order_num: num,
        customer_name: customerName.trim() || null,
        cassa: cassa,
      });
      // Reset campi testo ma mantengo la cassa selezionata per velocità
      setOrderNum("");
      setCustomerName("");
      numInputRef.current?.focus();
    } catch (err: any) {
      setError(err.message || "Errore durante l'inserimento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream-dark border-b border-wood-pale/30 px-4 py-2">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3 max-w-5xl mx-auto"
      >
        {/* Selettore Cassa */}
        <div className="flex bg-white/50 border border-wood-pale/30 rounded-lg p-0.5 shrink-0">
          {(['A', 'B', 'C'] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setCassa(cassa === id ? null : id)}
              className={cn(
                "w-9 h-9 rounded-md text-xs font-black transition-all flex items-center justify-center",
                cassa === id
                  ? "bg-brand text-white shadow-sm scale-105 z-10"
                  : "text-wood-med hover:bg-wood-pale/20"
              )}
            >
              {id}
            </button>
          ))}
        </div>

        <div className="h-8 w-[1px] bg-wood-pale/20 shrink-0 mx-1 hidden sm:block" />

        <div className="relative">
          <input
            ref={numInputRef}
            type="number"
            min="1"
            max="999"
            value={orderNum}
            onChange={(e) => setOrderNum(e.target.value)}
            placeholder="N°"
            className="w-16 bg-white border border-wood-pale/50 rounded-lg px-3 py-2 text-sm font-body font-bold text-wood-dark focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-shadow"
            disabled={loading}
          />
        </div>

        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Nome cliente..."
          className="flex-1 bg-white border border-wood-pale/50 rounded-lg px-3 py-2 text-sm font-body text-wood-dark focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-shadow"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading || (!orderNum && !customerName.trim() && !cassa)}
          className="bg-brand hover:bg-brand-light text-white rounded-lg px-4 py-2 text-sm font-bold flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span>
        </button>

        {error && (
          <span className="absolute top-full left-4 text-xs text-red-500 mt-1 font-body">
            {error}
          </span>
        )}
      </form>
    </div>
  );
}
