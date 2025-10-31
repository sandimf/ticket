'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOrderById, updateOrderStatus } from '@/lib/api/order-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function PaymentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await getOrderById(parseInt(params.id, 10));
        setOrder(response.data);
      } catch (err) {
        setError('Gagal memuat data order');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      // Simulasi pembayaran berhasil
      await updateOrderStatus(parseInt(params.id, 10), 'paid');
      
      toast({
        title: 'Pembayaran Berhasil',
        description: 'Tiket Anda telah diterbitkan dan dapat dilihat di halaman tiket',
      });
      
      // Redirect ke halaman tiket
      router.push('/member/tickets');
    } catch (err) {
      toast({
        title: 'Pembayaran Gagal',
        description: 'Terjadi kesalahan saat memproses pembayaran',
        variant: 'destructive',
      });
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Memuat Data Pembayaran...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>{error || 'Terjadi kesalahan'}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => router.back()}>Kembali</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Konfirmasi Pembayaran</CardTitle>
            <CardDescription>Invoice: {order.invoice_code}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Detail Order</h3>
                <div className="mt-2 border-t pt-2">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between py-1">
                      <span>{item.ticket_type?.name} x {item.quantity}</span>
                      <span>Rp {(item.price_per_item * item.quantity).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                  <div className="border-t mt-2 pt-2 font-bold flex justify-between">
                    <span>Total</span>
                    <span>Rp {order.total_amount.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium">Metode Pembayaran</h3>
                <div className="mt-2 border-t pt-2">
                  <div className="flex items-center space-x-2 py-2">
                    <input
                      type="radio"
                      id="payment-transfer"
                      name="payment-method"
                      checked
                      readOnly
                    />
                    <label htmlFor="payment-transfer">Transfer Bank (Simulasi)</label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              className="w-full" 
              onClick={handlePayment}
              disabled={processing || order.payment_status === 'paid'}
            >
              {processing ? 'Memproses...' : 'Bayar Sekarang'}
            </Button>
            
            {order.payment_status === 'paid' && (
              <p className="text-green-600 text-center">Pembayaran telah berhasil</p>
            )}
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => router.back()}
            >
              Kembali
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}