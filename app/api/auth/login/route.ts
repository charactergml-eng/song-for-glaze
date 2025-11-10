import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Simple in-memory user database
const USERS = {
  'Goddess': { username: 'Goddess', password: 'Steponyou', role: 'Goddess' as const },
  'Slave': { username: 'Slave', password: 'slave', role: 'slave' as const },
};

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Find user
    const user = USERS[username as keyof typeof USERS];

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        username: user.username,
        role: user.role,
      },
    });

    // Set authentication cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', JSON.stringify({ username: user.username, role: user.role }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
