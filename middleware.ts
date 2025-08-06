import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

// Define protected routes
const protectedRoutes = ['/profile', '/settings', '/dashboard'];

// Define auth routes (should redirect if already signed in)
const authRoutes = ['/sign-in', '/sign-up'];

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Check for session cookie using Better Auth's helper
    const sessionCookie = getSessionCookie(request);
    const hasSession = !!sessionCookie;

    // Check if current path is protected
    const isProtectedRoute = protectedRoutes.some(route =>
        pathname.startsWith(route)
    );

    // Check if current path is auth route
    const isAuthRoute = authRoutes.some(route =>
        pathname.startsWith(route)
    );

    // Redirect to sign-in if accessing protected route without session
    if (isProtectedRoute && !hasSession) {
        const signInUrl = new URL('/sign-in', request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
    }

    // Redirect to home if accessing auth routes while signed in
    if (isAuthRoute && hasSession) {
        const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
        const redirectUrl = callbackUrl && callbackUrl.startsWith('/')
            ? new URL(callbackUrl, request.url)
            : new URL('/', request.url);
        return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.webp$).*)',
    ],
};
