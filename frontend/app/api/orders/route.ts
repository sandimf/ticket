import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const GO_BACKEND_URL = process.env.GO_BACKEND_URL || 'http://localhost:5000/api';
  try {
    const body = await request.json();
    const response = await fetch(`${GO_BACKEND_URL}/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create order' },
      { status: 500 }
    );
  }
}