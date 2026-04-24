"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Order } from "@/types";
import { Calendar, CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react";

type Period = "today" | "week" | "month" | "all";

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState<Period>("today");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      const supabase = createClient();
      
      let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
      
      if (period !== "all") {
        const now = new Date();
        const startDate = new Date();
        
        if (period === "today") {
          startDate.setHours(0, 0, 0, 0);
        } else if (period === "week") {
          startDate.setDate(now.getDate() - 7);
        } else if (period === "month") {
          startDate.setMonth(now.getMonth() - 1);
        }
        
        query = query.gte("created_at", startDate.toISOString());
      }

      const { data, error } = await query;

      if (!error && data) {
        setOrders(data as Order[]);
      }
      setLoading(false);
    };

    fetchAnalytics();
  }, [period]);

  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === 3).length;
  const activeOrders = orders.filter((o) => o.status >= 0 && o.status <= 2).length;
  const cancelledOrders = orders.filter((o) => o.status === 4).length;

  const completionRate = totalOrders > 0 
    ? Math.round((completedOrders / totalOrders) * 100) 
    : 0;

  return (
    <div className="p-4 sm:p-6 overflow-y-auto custom-scroll flex-1 bg-cream">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Intestazione e Filtri */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-wood-pale/30">
          <div className="flex items-center gap-2 text-wood-dark">
            <Calendar className="w-5 h-5" />
            <h2 className="font-display text-xl">Filtro Periodo</h2>
          </div>
          <div className="flex bg-cream-dark p-1 rounded-xl">
            {(["today", "week", "month", "all"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${
                  period === p
                    ? "bg-brand text-white shadow-md"
                    : "text-wood-med hover:bg-white/50"
                }`}
              >
                {p === "today" ? "Oggi" : p === "week" ? "7 Giorni" : p === "month" ? "30 Giorni" : "Tutto"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
          </div>
        ) : (
          <>
            {/* Cards Metriche */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard 
                title="Totale Ordini" 
                value={totalOrders.toString()} 
                icon={<TrendingUp className="w-5 h-5 text-blue-500" />} 
              />
              <StatCard 
                title="Completati" 
                value={completedOrders.toString()} 
                icon={<CheckCircle2 className="w-5 h-5 text-status-ready" />} 
              />
              <StatCard 
                title="In Corso" 
                value={activeOrders.toString()} 
                icon={<Clock className="w-5 h-5 text-status-preso" />} 
              />
              <StatCard 
                title="Annullati" 
                value={cancelledOrders.toString()} 
                icon={<XCircle className="w-5 h-5 text-red-500" />} 
              />
            </div>

            {/* Riepilogo Avanzato */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-wood-pale/30">
              <h3 className="font-display text-lg text-wood-dark mb-4">Performance</h3>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full border-8 border-cream-dark flex items-center justify-center relative">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-status-ready"
                      strokeDasharray={`${(completionRate / 100) * 251} 251`}
                    />
                  </svg>
                  <span className="font-bold text-xl text-wood-dark">{completionRate}%</span>
                </div>
                <div>
                  <p className="text-sm text-wood-med font-body">Tasso di Completamento</p>
                  <p className="text-xs text-wood-light mt-1 max-w-xs">
                    Percentuale di ordini portati a termine con successo rispetto al totale ricevuto nel periodo selezionato.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-wood-pale/30 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-bold text-wood-med uppercase tracking-wider">{title}</span>
      </div>
      <span className="font-display text-4xl text-brand">{value}</span>
    </div>
  );
}
