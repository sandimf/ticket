import { NextRequest, NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const headersList = await headers();
  const host = headersList.get('host') ?? 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') ?? 'http';
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value || cookieStore.get('token')?.value;
  
  const GO_BACKEND_URL = process.env.GO_BACKEND_URL || 'http://localhost:5000/api';
  
  try {
    const body = await request.json();
    const { id } = await params;
    
    const response = await fetch(`${GO_BACKEND_URL}/order/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update order status' },
      { status: 500 }
    );
  }
}