import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  const { pathname } = request.nextUrl;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/' || path === '/register' || path === '/api/auth/login' || path === '/api/auth/register' || path === '/login' || path === '/api/auth/logout';

  // Get the token from the cookies
  const token = request.cookies.get('token')?.value || '';
  
  // Verify the token
  let isAuthenticated = false;
  if (token) {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jwtVerify(token, secret);
      isAuthenticated = true;
    } catch (error) {
      console.error('Token verification failed:', error);
      isAuthenticated = false;
    }
  }

  console.log('middleware:', {
    path: pathname,
    isAuthenticated,
  });
  
  // Redirect logic
  // if (path.startsWith('/api')) return NextResponse.next();

  // if (isPublicPath && isAuthenticated){
  //   if (path.startsWith('/') && path.startsWith('/login')) {
  //     console.log('Redirecting authenticated user from /login to /dashboard');
      
  //     return NextResponse.redirect(new URL('/dashboard', request.url));
  //   }
  // }
  

  // if (isPublicPath && isAuthenticated) {
  //   return NextResponse.redirect(new URL('/dashboard', request.url));
  // }

  // if (!isPublicPath && !isAuthenticated) {
  //   console.log('Redirecting unauthenticated user to /login');
    
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  // if (!isAuthenticated) {
  //   console.log('User is not authenticated, redirecting to /login');
  //   // return NextResponse.redirect(new URL('/', request.url));
  // }
  // console.log('User is authenticated, allowing access to the requested path:', path, 'isAuthenticated:', isAuthenticated);
  
  // return NextResponse.next();

  const isLoginPage = pathname === '/login';
  const isRegisterPage = pathname === '/register';
  const isRoot = pathname === '/';
  const isDashboard = pathname.startsWith('/dashboard');

  // ======= API CASE =========
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  if (request.method !== 'GET') {
  return NextResponse.next(); // หลีกเลี่ยง redirect สำหรับ POST, PUT, DELETE
  }

  // ======= CASE 1: NOT authenticated =======
  if (!isAuthenticated) {
    if (isRoot || isDashboard) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next(); // allow access to /login, /register, etc.
  }

  // ======= CASE 2: Authenticated =======
  if (isLoginPage || isRegisterPage || isRoot) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ======= CASE 3: Authenticated and accessing allowed path =======
  return NextResponse.next();
}

// Configure the paths that should be protected
    // '/api/:path*',
export const config = {
  matcher: [
    '/',
    '/login',
    '/dashboard/:path*',
    '/register'
  ]
};