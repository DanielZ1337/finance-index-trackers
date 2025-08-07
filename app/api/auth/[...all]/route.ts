import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const { GET: AuthGET, POST: AuthPOST } = toNextJsHandler(auth);

// Handle CORS for auth routes
async function handleCORS(request: NextRequest, handler: Function) {
    // Handle preflight requests
    if (request.method === "OPTIONS") {
        return new NextResponse(null, {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": request.headers.get("origin") || "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "86400",
            },
        });
    }

    // Execute the auth handler
    const response = await handler(request);

    // Add CORS headers to the response
    const corsHeaders = {
        "Access-Control-Allow-Origin": request.headers.get("origin") || "*",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
    };

    // Create new response with CORS headers
    const newResponse = new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
            ...Object.fromEntries(response.headers.entries()),
            ...corsHeaders,
        },
    });

    return newResponse;
}

export async function GET(request: NextRequest) {
    return handleCORS(request, AuthGET);
}

export async function POST(request: NextRequest) {
    return handleCORS(request, AuthPOST);
}

export async function OPTIONS(request: NextRequest) {
    return handleCORS(request, () => new NextResponse(null, { status: 200 }));
}
