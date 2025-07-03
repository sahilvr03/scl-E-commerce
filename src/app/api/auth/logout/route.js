import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const cookieStore = cookies();
    // Invalidate the token by setting an expired cookie
    cookieStore.set('token', '', {
      httpOnly: true,
      path: '/',
      maxAge: 0, // Set maxAge to 0 to expire the cookie immediately
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}