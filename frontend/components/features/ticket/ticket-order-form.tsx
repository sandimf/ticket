'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { TicketType, OrderItem, CreateOrderRequest } from '@/types/type';
import { createOrder } from '@/lib/api/order-api';
import { toast } from 'sonner';

interface TicketOrderFormProps {
  eventId: number;
  ticketTypes: TicketType[];
  userId: number;
}

export function TicketOrderForm({ eventId, ticketTypes, userId }: TicketOrderFormProps) {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<number, number>>(
    ticketTypes.reduce((acc, ticket) => ({ ...acc, [ticket.id]: 0 }), {})
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuantityChange = (ticketId: number, value: string) => {
    const quantity = parseInt(value, 10);
    if (isNaN(quantity) || quantity < 0) return;
    
    setQuantities((prev) => ({
      ...prev,
      [ticketId]: quantity,
    }));
  };

  const calculateTotal = () => {
    return ticketTypes.reduce((total, ticket) => {
      return total + (ticket.price * (quantities[ticket.id] || 0));
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi: minimal 1 tiket harus dipilih
    const totalTickets = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
    if (totalTickets === 0) {
      toast.error("Silakan pilih minimal 1 tiket untuk melanjutkan", {
        description: "Pilih tiket"
      });
      return;
    }

    // Siapkan data order
    const items: OrderItem[] = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([ticketId, quantity]) => ({
        ticket_type_id: parseInt(ticketId, 10),
        quantity,
      }));

    const orderData: CreateOrderRequest = {
      user_id: userId,
      items,
    };

    setIsSubmitting(true);
    
    try {
      const response = await createOrder(orderData);
      toast.success("Order berhasil dibuat", {
        description: `Invoice: ${response.data.invoice_code}`,
      });
      
      // Redirect ke halaman pembayaran
      router.replace(`/member/orders/${response.data.id}/payment`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error("Gagal membuat order", {
        description: error instanceof Error ? error.message : "Terjadi kesalahan"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Pilih Tiket</h3>
        
        {ticketTypes.map((ticket) => (
          <Card key={ticket.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{ticket.name}</h4>
                  <p className="text-sm text-gray-500">{ticket.description}</p>
                  <p className="font-bold mt-1">Rp {ticket.price.toLocaleString('id-ID')}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`ticket-${ticket.id}`} className="sr-only">
                    Jumlah
                  </Label>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="icon"
                    onClick={() => handleQuantityChange(ticket.id, String(Math.max(0, (quantities[ticket.id] || 0) - 1)))}
                    disabled={quantities[ticket.id] === 0}
                  >
                    -
                  </Button>
                  <Input
                    id={`ticket-${ticket.id}`}
                    type="number"
                    min="0"
                    max={ticket.total_stock}
                    value={quantities[ticket.id] || 0}
                    onChange={(e) => handleQuantityChange(ticket.id, e.target.value)}
                    className="w-16 text-center"
                  />
                  <Button 
                    type="button"
                    variant="outline" 
                    size="icon"
                    onClick={() => handleQuantityChange(ticket.id, String((quantities[ticket.id] || 0) + 1))}
                    disabled={(quantities[ticket.id] || 0) >= ticket.total_stock}
                  >
                    +
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total</span>
          <span className="font-bold text-lg">Rp {calculateTotal().toLocaleString('id-ID')}</span>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting || Object.values(quantities).every(qty => qty === 0)}
      >
        {isSubmitting ? "Memproses..." : "Lanjut ke Pembayaran"}
      </Button>
    </form>
  );
}