import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

  // Ambil dari cookie yang sudah diset oleh login route
  const username = cookieStore.get('username')?.value || null;
  const userId = cookieStore.get('user_id')?.value || null;

  return NextResponse.json({
    status: 'success',
    data: {
      username,
      user_id: userId,
    },
  });
}