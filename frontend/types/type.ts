// Ini adalah "kontrak" data antara frontend dan backend

export interface Event {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  venue_name: string;
  city: string;
  address: string;
  start_datetime: string; // ISO 8601 string, cth: "2025-10-20T19:00:00Z"
  end_datetime: string;
  poster_image_url: string;
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  ticket_types?: TicketType[];
}

export interface TicketType {
  id: number;
  event_id: number;
  name: string;
  description: string;
  price: number;
  total_stock: number;
  sales_start_date: string;
  sales_end_date: string;
}

export interface OrderItem {
  ticket_type_id: number;
  quantity: number;
}

export interface CreateOrderRequest {
  user_id: number;
  items: OrderItem[];
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  payment_method?: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  invoice_code: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}