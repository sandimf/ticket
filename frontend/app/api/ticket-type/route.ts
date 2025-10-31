import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GO_BACKEND_URL = process.env.GO_BACKEND_URL || 'http://localhost:5000/api';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  // Gunakan cookie token yang dipakai untuk endpoint lain (umumnya 'access_token')
  const token = cookieStore.get('access_token')?.value || cookieStore.get('token')?.value;

  try {
    const body = await request.json();

    const response = await fetch(`${GO_BACKEND_URL}/ticket-type`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Error creating ticket type:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create ticket type' },
      { status: 500 }
    );
  }
}