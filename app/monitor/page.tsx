import MonitorLayout from "@/components/monitor/MonitorLayout";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0; // Disable cache per essere sempre aggiornati o usare route segments

export default async function MonitorPage() {
  const supabase = createClient();
  
  // Fetch iniziale SSR degli ordini
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .lt("status", 3)
    .order("created_at", { ascending: true });

  return <MonitorLayout initialOrders={orders || []} />;
}
