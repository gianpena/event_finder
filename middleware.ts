// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const allowedOrigins = [
    'http://localhost:3000',
    'http://eventfinder.gianpena.xyz:3003'
];

export function middleware(request: NextRequest) {
    const origin = request.headers.get('origin') ?? '';
    const isAllowed = allowedOrigins.includes(origin);

    const response = NextResponse.next();

    if (isAllowed) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: response.headers,
        });
    }

    return response;
}

export const config = {
    matcher: '/api/:path*',
};