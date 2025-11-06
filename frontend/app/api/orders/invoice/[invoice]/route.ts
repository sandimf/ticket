import { NextRequest, NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoice: string }> }
) {
  const headersList = await headers();
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value || cookieStore.get('token')?.value;
  const GO_BACKEND_URL = process.env.GO_BACKEND_URL || 'http://localhost:5000/api';

  try {
    const { invoice } = await params;
    const response = await fetch(`${GO_BACKEND_URL}/order/invoice/${invoice}`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Error fetching order by invoice:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch order by invoice' },
      { status: 500 }
    );
  }
}