"use client";

import { useEffect, useState } from "react";
import { createOrder } from "@/lib/api/order-api";
import { OrderItem, CreateOrderRequest } from "@/types/type";

export default function TicketOrderForm({ eventId, userId }: { eventId: number; userId?: number }) {
  const [ticketItems, setTicketItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: CreateOrderRequest = {
        user_id: userId, // optional now
        items: ticketItems,
      };
      const res = await createOrder(payload);
      // assuming API returns { data: { invoice_code } }
      const invoice = res.data?.invoice_code || res.data?.invoiceCode;
      window.location.href = `/member/orders/${invoice}/payment`;
    } catch (err: any) {
      setError(err.message || "Gagal membuat order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* existing controls for selecting tickets stay unchanged */}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading || ticketItems.length === 0}
      >
        {loading ? "Memproses..." : "Pesan Tiket"}
      </button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  );
}