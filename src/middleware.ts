import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  sub: string;
  email: string;
  roles: string[];
  iat: number;
  exp: number;
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token');
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isUnauthorizedPage = request.nextUrl.pathname === '/unauthorized';
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');

  // Nếu đang ở trang login, không cần kiểm tra token
  if (isLoginPage) {
    // Chỉ chuyển hướng nếu có token hợp lệ
    if (token) {
      try {
        const decoded = jwtDecode<JWTPayload>(token.value);
        if (decoded && decoded.exp * 1000 > Date.now()) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      } catch (error) {
        // Token không hợp lệ, xóa cookie
        const response = NextResponse.next();
        response.cookies.delete('auth_token');
        return response;
      }
    }
    return NextResponse.next();
  }

  // Nếu không có token và không phải trang unauthorized
  if (!token && !isUnauthorizedPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Kiểm tra quyền truy cập dashboard
  if (isDashboardPage && token) {
    try {
      const decoded = jwtDecode<JWTPayload>(token.value);
      
      // Kiểm tra token hết hạn
      if (decoded.exp * 1000 < Date.now()) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth_token');
        return response;
      }

      // Kiểm tra roles
      if (decoded.roles) {
        if (!decoded.roles.some(role => ['admin', 'moderator'].includes(role))) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      } else {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } catch (error) {
      // Token không hợp lệ
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 