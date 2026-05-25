import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware de Next.js para proteger rutas /admin/*.
 * Verifica presencia de cookie 'session'.
 * La validez real se verifica en AdminLayout (server component).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('session')?.value;

  const isLoginPage = pathname === '/admin/login';

  // Sin cookie → redirigir a login (excepto si ya está en login)
  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Con cookie → si está en login, redirigir al panel
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/((?!login).*)?'],
};
