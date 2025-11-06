'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOrderByInvoice } from '@/lib/api/order-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function OrderDetailPage({ params }: { params: { invoice: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoiceCode, setInvoiceCode] = useState<string>('');

  useEffect(() => {
    // Simpan invoice ke state untuk menghindari penggunaan params.invoice langsung
    setInvoiceCode(params.invoice);
  }, [params]);

  useEffect(() => {
    // Hanya jalankan fetch jika invoiceCode sudah tersedia
    if (!invoiceCode) return;
    
    const fetchOrder = async () => {
      try {
        const response = await getOrderByInvoice(invoiceCode);
        setOrder(response.data);
      } catch (err) {
        setError('Gagal memuat data order');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [invoiceCode]);

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
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Detail Pemesanan</h1>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Detail Pemesanan</h1>
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>{error || 'Terjadi kesalahan'}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => router.push('/member/orders')}>Kembali ke Daftar Pemesanan</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Detail Pemesanan</h1>
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Invoice: {order.invoice_code}</CardTitle>
                <CardDescription>Tanggal Pemesanan: {formatDate(order.created_at)}</CardDescription>
              </div>
              {getStatusBadge(order.payment_status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Informasi Event</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium">{order.event?.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.event?.start_date && formatDate(order.event.start_date)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{order.event?.location}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Detail Tiket</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Tiket</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.order_items?.map((item: any) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.ticket_type?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Rp {item.price_per_item.toLocaleString('id-ID')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Rp {(item.price_per_item * item.quantity).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          Total
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Rp {order.total_amount.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push('/member/orders')}>
              Kembali
            </Button>
            
            {order.payment_status === 'pending' && (
              <Button onClick={() => router.push(`/member/orders/${order.invoice_code}/payment`)}>
                Lanjutkan Pembayaran
              </Button>
            )}
            
            {order.payment_status === 'paid' && (
              <Button onClick={() => router.push('/member/tickets')}>
                Lihat Tiket
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}