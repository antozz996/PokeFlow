"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LegacyAdminPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Campi form
  const [num, setNum] = useState("");
  const [name, setName] = useState("");
  const [cassa, setCassa] = useState("");

  const supabase = createClient();

  // Caricamento ordini (Polling ogni 5 secondi invece di Realtime per massima compatibilità)
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .lt("status", 3)
      .order("created_at", { ascending: true });
    
    if (error) {
      console.error(error);
    } else {
      setOrders(data || []);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!num && !name && !cassa) return;

    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.from("orders").insert([{
        order_num: num ? parseInt(num, 10) : null,
        customer_name: name || null,
        cassa: cassa || null,
        status: 2 // Va direttamente in "Pronto" per semplicità
      }]);

      if (error) throw error;
      
      setNum("");
      setName("");
      fetchOrders();
    } catch (err: any) {
      setError("Errore: " + (err.message || "riprova"));
    } finally {
      setLoading(false);
    }
  };

  const markDelivered = async (id: string) => {
    await supabase.from("orders").update({ status: 3 }).eq("id", id);
    fetchOrders();
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", backgroundColor: "#fff", color: "#000", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px", borderBottom: "2px solid #000" }}>PokeFlow LEGACY (iPad)</h1>

      {/* Form Semplice */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "30px", padding: "15px", background: "#f0f0f0", borderRadius: "8px" }}>
        <div style={{ marginBottom: "10px" }}>
          <label>Cassa: </label>
          <select value={cassa} onChange={(e) => setCassa(e.target.value)} style={{ padding: "10px", fontSize: "16px" }}>
            <option value="">-</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>
        
        <div style={{ marginBottom: "10px" }}>
          <label>Numero: </label>
          <input 
            type="number" 
            value={num} 
            onChange={(e) => setNum(e.target.value)} 
            style={{ padding: "10px", fontSize: "16px", width: "60px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Nome: </label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            style={{ padding: "10px", fontSize: "16px", width: "150px" }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: "15px 30px", 
            fontSize: "18px", 
            backgroundColor: "#22c55e", 
            color: "#fff", 
            border: "none", 
            borderRadius: "5px",
            fontWeight: "bold"
          }}
        >
          {loading ? "INVIO..." : "AGGIUNGI ORDINE"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>

      {/* Lista Ordini */}
      <h2 style={{ fontSize: "20px" }}>Ordini Attivi</h2>
      <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
        <thead>
          <tr style={{ background: "#eee" }}>
            <th>Cassa</th>
            <th>N°</th>
            <th>Nome</th>
            <th>Azione</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td align="center">{o.cassa || "-"}</td>
              <td align="center"><b>{o.order_num || "---"}</b></td>
              <td>{o.customer_name || "-"}</td>
              <td align="center">
                <button 
                  onClick={() => markDelivered(o.id)}
                  style={{ padding: "8px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "3px" }}
                >
                  CONSEGNA
                </button>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={4} align="center">Nessun ordine attivo</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
