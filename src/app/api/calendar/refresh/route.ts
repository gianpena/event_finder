import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/calendar';
import { cookies } from 'next/headers';

/**
 * POST /api/calendar/refresh
 *
 * Reads the httpOnly `calendar_refresh_token` cookie and exchanges it for a
 * new access token. Returns { accessToken: string } on success.
 *
 * The client should store the returned accessToken in state/store and retry
 * the original failed request.
 */
export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('calendar_refresh_token')?.value;

        if (!refreshToken) {
            return NextResponse.json(
                { success: false, error: { code: 'NO_REFRESH_TOKEN', message: 'No refresh token found. Please reconnect your calendar.' } },
                { status: 401 }
            );
        }

        const { access_token, expiry_date } = await refreshAccessToken(refreshToken);

        return NextResponse.json({
            success: true,
            data: {
                accessToken: access_token,
                expiryDate: expiry_date,
            },
        });
    } catch (error) {
        console.error('Error refreshing calendar token:', error);

        // If the refresh token itself is invalid/revoked, clear the cookie
        const response = NextResponse.json(
            { success: false, error: { code: 'REFRESH_FAILED', message: 'Failed to refresh token. Please reconnect your calendar.' } },
            { status: 401 }
        );

        response.cookies.set('calendar_refresh_token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 0,
        });

        return response;
    }
}
