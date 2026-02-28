import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/calendar';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
            // User denied access or error occurred
            return NextResponse.redirect(new URL('/?calendar_error=access_denied', request.url));
        }

        if (!code) {
            return NextResponse.redirect(new URL('/?calendar_error=missing_code', request.url));
        }

        const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/calendar/callback';

        // Exchange code for tokens
        const tokens = await getTokensFromCode(code, redirectUri);

        // Redirect back to home with token in URL (will be handled by client)
        const homeUrl = new URL('/', request.url);
        homeUrl.searchParams.set('calendar_token', tokens.access_token || '');

        return NextResponse.redirect(homeUrl);
    } catch (error) {
        console.error('Error in calendar callback:', error);
        return NextResponse.redirect(new URL('/?calendar_error=token_exchange_failed', request.url));
    }
}
