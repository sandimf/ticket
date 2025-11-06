'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserOrders } from '@/lib/api/order-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getUserOrders();
        setOrders(response.data || []);
      } catch (err) {
        setError('Gagal memuat riwayat pemesanan');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Menunggu Pembayaran</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Dibayar</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Dibatalkan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Riwayat Pemesanan</h1>
        <p>Memuat data pemesanan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Riwayat Pemesanan</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Riwayat Pemesanan</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Anda belum memiliki riwayat pemesanan</p>
          <Button onClick={() => router.push('/events')}>Jelajahi Event</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{order.event?.name || 'Event'}</CardTitle>
                    <CardDescription>Invoice: {order.invoice_code}</CardDescription>
                  </div>
                  {getStatusBadge(order.payment_status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-500">Tanggal Pemesanan:</span> {formatDate(order.created_at)}
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Total:</span> Rp {order.total_amount.toLocaleString('id-ID')}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => router.push(`/member/orders/${order.invoice_code}`)}
                    >
                      Detail
                    </Button>
                    
                    {order.payment_status === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => router.push(`/member/orders/${order.invoice_code}/payment`)}
                      >
                        Bayar Sekarang
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}