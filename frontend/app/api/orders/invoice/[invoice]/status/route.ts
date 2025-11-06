import { NextRequest, NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ invoice: string }> }
) {
  const headersList = await headers();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value || cookieStore.get('token')?.value;
  const GO_BACKEND_URL = process.env.GO_BACKEND_URL || 'http://localhost:5000/api';

  try {
    const body = await request.json();
    const { invoice } = await params;

    const response = await fetch(`${GO_BACKEND_URL}/order/invoice/${invoice}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Error updating order status by invoice:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update order status by invoice' },
      { status: 500 }
    );
  }
}