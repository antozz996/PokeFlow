"use client";

import React, { createContext, useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { playNotificationSound } from "@/lib/audio";
import type { Order, NewOrderInput } from "@/types";

interface OrdersContextType {
  orders: Order[];
  loading: boolean;
  addOrder: (input: NewOrderInput) => Promise<void>;
  advanceStatus: (id: string, currentStatus: number) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
}

export const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .lt("status", 3) // esclude consegnati e annullati
      .order("created_at", { ascending: true });
    if (!error && data) setOrders(data as Order[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchOrders();

    const channelName = `orders-realtime-${Date.now()}-${Math.random()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            // Play notification sound on new order
            playNotificationSound();
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
      if (status === 'SUBSCRIBED') console.log('Connected to Realtime (Global Provider)');
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders, supabase]);

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
    // Hide from UI when delivered
    if (nextStatus === 3) {
      setTimeout(() => {
        setOrders((prev) => prev.filter((o) => o.id !== id));
      }, 2000);
    }
  };

  const deleteOrder = async (id: string) => {
    // Soft delete (Status 4 = Annullato)
    const { error } = await supabase.from("orders").update({ status: 4 }).eq("id", id);
    if (error) throw error;
  };

  return (
    <OrdersContext.Provider value={{ orders, loading, addOrder, advanceStatus, deleteOrder }}>
      {children}
    </OrdersContext.Provider>
  );
}
