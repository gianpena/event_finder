import { NextRequest, NextResponse } from 'next/server';
import { fetchUserEvents } from '@/lib/calendar';
import { addDays } from 'date-fns';

export async function POST(request: NextRequest) {
    try {
        const { accessToken } = await request.json();

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Access token is required' },
                { status: 400 }
            );
        }

        // Fetch events for the next 30 days
        const timeMin = new Date();
        const timeMax = addDays(new Date(), 30);

        const events = await fetchUserEvents(accessToken, timeMin, timeMax);

        return NextResponse.json({ events });
    } catch (error: any) {
        console.error('Error fetching calendar events:', error);

        // Check if token is expired
        if (error.message?.includes('invalid_grant') || error.message?.includes('Token has been expired')) {
            return NextResponse.json(
                { error: 'Token expired', expired: true },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch calendar events' },
            { status: 500 }
        );
    }
}
