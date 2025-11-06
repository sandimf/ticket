import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GO_BACKEND_URL = process.env.GO_BACKEND_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies(); // ← tambahkan await di sini
  const token = cookieStore.get('token')?.value;
  const userId = cookieStore.get('user_id')?.value;

  if (!token || !userId) {
    return NextResponse.json(
      { status: 'error', message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(`${GO_BACKEND_URL}/orders/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { status: 'error', message: data.message || 'Failed to fetch orders' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
