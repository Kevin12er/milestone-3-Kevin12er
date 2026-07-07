import { NextResponse } from 'next/server';

export function proxy(request) {
  const sessionCookie = request.cookies.get('revoshop_session');
  const { pathname } = request.nextUrl;

  if (!sessionCookie) {
    if (['/dashboard', '/cart', '/checkout'].includes(pathname)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  const session = JSON.parse(sessionCookie.value);

  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (pathname === '/dashboard' && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/dashboard', '/cart', '/checkout'],
};