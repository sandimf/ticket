import { CreateOrderRequest, Order } from "@/types/type";

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const createOrder = async (orderData: CreateOrderRequest): Promise<ApiResponse<Order>> => {
  const response = await fetch(`/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Gagal membuat order');
  }

  return response.json();
};

export const getOrderById = async (orderId: number): Promise<ApiResponse<Order>> => {
  const response = await fetch(`/api/orders/${orderId}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Gagal mengambil data order');
  }

  return response.json();
};

export const getOrderByInvoice = async (invoice: string): Promise<ApiResponse<Order>> => {
  const response = await fetch(`/api/orders/invoice/${invoice}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Gagal mengambil data order berdasarkan invoice');
  }

  return response.json();
};

export const updateOrderStatus = async (orderId: number, paymentStatus: string): Promise<ApiResponse<Order>> => {
  const response = await fetch(`/api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ payment_status: paymentStatus }),
  });

  if (!response.ok) {
    throw new Error('Gagal memperbarui status pembayaran');
  }

  return response.json();
};

export const updateOrderStatusByInvoice = async (invoice: string, paymentStatus: string): Promise<ApiResponse<Order>> => {
  const response = await fetch(`/api/orders/invoice/${invoice}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ payment_status: paymentStatus }),
  });

  if (!response.ok) {
    throw new Error('Gagal memperbarui status pembayaran berdasarkan invoice');
  }

  return response.json();
};

export const getUserOrders = async (): Promise<ApiResponse<Order[]>> => {
  const response = await fetch(`/api/orders/user`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Gagal mengambil riwayat pemesanan');
  }

  return response.json();
};