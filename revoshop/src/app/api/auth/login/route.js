import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const loginRes = await fetch('https://api.escuelajs.co/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!loginRes.ok) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    const { access_token } = await loginRes.json();

  
    const profileRes = await fetch('https://api.escuelajs.co/api/v1/auth/profile', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const profile = await profileRes.json();
    const role = profile.role === 'admin' ? 'admin' : 'user';

    const sessionData = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role,
      token: access_token,
    };

   
    const cookieStore = await cookies();
    cookieStore.set('revoshop_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 3 * 24 * 60 * 60,
    });

    return NextResponse.json(sessionData);
  } catch (err) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}