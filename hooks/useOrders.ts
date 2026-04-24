// hooks/useOrders.ts

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order, NewOrderInput } from "@/types";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  // Fetch iniziale
  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .lt("status", 3) // esclude consegnati
      .order("created_at", { ascending: true });
    if (!error && data) setOrders(data as Order[]);
    setLoading(false);
  }, [supabase]);

  // Sottoscrizione Realtime
  useEffect(() => {
    fetchOrders();

    // Creiamo un nome canale univoco per evitare crash causati dal React StrictMode
    const channelName = `orders-realtime-${Date.now()}-${Math.random()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setOrders((prev) => [...prev, payload.new as Order]);
          }
          if (payload.eventType === "UPDATE") {
            const updated = payload.new as Order;
            if (updated.status >= 3) {
              setOrders((prev) => prev.filter((o) => o.id !== updated.id));
            } else {
              setOrders((prev) =>
                prev.map((o) => (o.id === updated.id ? updated : o))
              );
            }
          }
          if (payload.eventType === "DELETE") {
            setOrders((prev) =>
              prev.filter((o) => o.id !== payload.old.id)
            );
          }
        }
      );

    channel.subscribe((status: any) => {
      if (status === 'CLOSED') return;
      if (status === 'SUBSCRIBED') console.log('Connected to Realtime');
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders, supabase]);

  // CRUD actions — solo admin
  const addOrder = async (input: NewOrderInput) => {
    const { error } = await supabase.from("orders").insert([input]);
    if (error) throw error;
  };

  const advanceStatus = async (id: string, currentStatus: number) => {
    const nextStatus = currentStatus + 1;
    if (nextStatus > 3) return;
    const { error } = await supabase
      .from("orders")
      .update({ status: nextStatus })
      .eq("id", id);
    if (error) throw error;
    // Se consegnato, elimina dopo 2s (animazione uscita)
    if (nextStatus === 3) {
      setTimeout(async () => {
        await supabase.from("orders").delete().eq("id", id);
      }, 2000);
    }
  };

  const deleteOrder = async (id: string) => {
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) throw error;
  };

  return { orders, loading, addOrder, advanceStatus, deleteOrder };
}
