import { NextRequest, NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const headersList = await headers();
  const host = headersList.get('host') ?? 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') ?? 'http';
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  const GO_BACKEND_URL = process.env.GO_BACKEND_URL || 'http://localhost:5000/api';
  
  try {
    const { id } = await params;
    const response = await fetch(`${GO_BACKEND_URL}/order/${id}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      cache: 'no-store',
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}