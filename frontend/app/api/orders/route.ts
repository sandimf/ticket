import { NextRequest, NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';

export async function POST(request: NextRequest) {
  const headersList = await headers();
  const host = headersList.get('host') ?? 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') ?? 'http';
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  const GO_BACKEND_URL = process.env.GO_BACKEND_URL || 'http://localhost:5000/api';
  
  try {
    const body = await request.json();
    
    const response = await fetch(`${GO_BACKEND_URL}/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create order' },
      { status: 500 }
    );
  }
}