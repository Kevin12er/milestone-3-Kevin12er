import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('revoshop_session');
  if (!session) return NextResponse.json(null, { status: 401 });

  try {
    const userData = JSON.parse(session.value);
    return NextResponse.json(userData);
  } catch {
    return NextResponse.json(null, { status: 401 });
  }
}