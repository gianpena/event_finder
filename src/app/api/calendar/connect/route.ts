import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAuthURL } from '@/lib/calendar';

export async function GET(request: NextRequest) {
    try {
        const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/calendar/callback';
        const authUrl = getGoogleAuthURL(redirectUri);

        return NextResponse.json({ authUrl });
    } catch (error) {
        console.error('Error generating auth URL:', error);
        return NextResponse.json(
            { error: 'Failed to generate authentication URL' },
            { status: 500 }
        );
    }
}
