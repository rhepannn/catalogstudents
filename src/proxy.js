import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function proxy(request) {
  const sessionToken = request.cookies.get('session')?.value;
  const path = request.nextUrl.pathname;

  // Halaman yang tidak butuh login
  if (path === '/login' || path === '/register' || path === '/') {
    // Kalau sudah login dan mencoba ke halaman login, arahkan ke dashboard
    if (sessionToken) {
      const session = await decrypt(sessionToken);
      if (session) {
        if (session.role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        if (session.role === 'penjual') return NextResponse.redirect(new URL('/penjual/dashboard', request.url));
        return NextResponse.redirect(new URL('/pembeli/dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

  // Proteksi rute yang butuh login
  if (!sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const session = await decrypt(sessionToken);
  
  if (!session) {
    // Token tidak valid atau expired
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session');
    return response;
  }

  // Role based access control (RBAC)
  if (path.startsWith('/admin') && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (path.startsWith('/penjual') && session.role !== 'penjual') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (path.startsWith('/pembeli') && session.role !== 'pembeli') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
