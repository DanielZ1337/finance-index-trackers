import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
    const sessionCookie = getSessionCookie(request);
    const { pathname } = request.nextUrl;

    // Redirect authenticated users away from auth pages to home page
    if (sessionCookie && ["/sign-in", "/sign-up"].includes(pathname)) {
        const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
        const redirectUrl = callbackUrl && callbackUrl.startsWith('/')
            ? new URL(callbackUrl, request.url)
            : new URL('/', request.url);
        return NextResponse.redirect(redirectUrl);
    }

    // Protect profile and settings routes - redirect to sign-in if no session
    if (!sessionCookie && (pathname.startsWith("/profile") || pathname.startsWith("/settings"))) {
        const signInUrl = new URL('/sign-in', request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/profile/:path*",
        "/settings/:path*",
        "/sign-in",
        "/sign-up"
    ],
};
