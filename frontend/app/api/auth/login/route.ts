import { NextRequest, NextResponse } from 'next/server';

function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Authentication failed' },
        { status: response.status }
      );
    }
    
    // Token dari backend
    const token: string = typeof data?.data === 'string' ? data.data : (data?.token || '');
    // Buat response dan set cookie token (HTTP-only untuk keamanan)
    const responseWithCookie = NextResponse.json(data);
    responseWithCookie.cookies.set({
      name: 'access_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 3, // 3 hari
    });

    // Decode payload JWT (tanpa verifikasi) untuk mengambil username & user_id
    const payload = token ? decodeJwtPayload(token) : null;
    const username = payload?.username ? String(payload.username) : undefined;
    const userId = payload?.user_id != null ? String(payload.user_id) : undefined;

    // Set cookie non-HTTP-only untuk kebutuhan UI (opsional)
    if (username) {
      responseWithCookie.cookies.set({
        name: 'username',
        value: username,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 3,
      });
    }
    if (userId) {
      responseWithCookie.cookies.set({
        name: 'user_id',
        value: userId,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 3,
      });
    }

    return responseWithCookie;
  } catch (error) {
    console.error('Login proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}