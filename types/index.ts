// types/index.ts

export type OrderStatus = 0 | 1 | 2 | 3;

export const STATUS_LABELS: Record<OrderStatus, string> = {
  0: "Preso in carico",
  1: "In Preparazione",
  2: "Ritira",
  3: "Consegnato",
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  0: "amber",
  1: "blue",
  2: "green",
  3: "wood",
};

export interface Order {
  id: string;
  order_num: number;
  customer_name: string;
  status: OrderStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface NewOrderInput {
  order_num: number;
  customer_name: string;
  notes?: string;
}
