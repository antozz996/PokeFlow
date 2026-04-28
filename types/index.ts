// types/index.ts

export type OrderStatus = 0 | 1 | 2 | 3 | 4;

export const STATUS_LABELS: Record<OrderStatus, string> = {
  0: "Preso in carico",
  1: "In Preparazione",
  2: "Ritira",
  3: "Consegnato",
  4: "Annullato",
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  0: "amber",
  1: "blue",
  2: "green",
  3: "wood",
  4: "red",
};

export interface Order {
  id: string;
  order_num?: number | null;
  customer_name?: string | null;
  status: OrderStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface NewOrderInput {
  order_num?: number | null;
  customer_name?: string | null;
  notes?: string;
  status?: OrderStatus; // Permette di specificare lo stato iniziale (es: 2 per Simple Mode)
}
