import { NextRequest, NextResponse } from 'next/server';

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
    
    // Set the access token as an HTTP-only cookie
    const responseWithCookie = NextResponse.json(data);
    
    // Set access token cookie (HTTP-only for security)
    responseWithCookie.cookies.set({
      name: 'access_token',
      value: typeof data?.data === 'string' ? data.data : (data?.token || ''),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 3, // 3 days to match backend exp ~72h
    });
    
    return responseWithCookie;
  } catch (error) {
    console.error('Login proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}