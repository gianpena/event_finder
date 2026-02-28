import { NextRequest, NextResponse } from 'next/server';
import { addEventToCalendar } from '@/lib/calendar';
import { MOCK_EVENTS } from '@/lib/data';
import { addHours } from 'date-fns';

export async function POST(request: NextRequest) {
    try {
        const { eventId, accessToken } = await request.json();

        if (!accessToken || !eventId) {
            return NextResponse.json(
                { error: 'Access token and event ID are required' },
                { status: 400 }
            );
        }

        // Find the event
        const vibeCheckEvent = MOCK_EVENTS.find(e => e.id === eventId);

        if (!vibeCheckEvent) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        // Parse event date and time
        const eventDate = new Date(vibeCheckEvent.date);
        const [hours, minutes] = vibeCheckEvent.time.split(':').map(Number);

        const startTime = new Date(eventDate);
        startTime.setHours(hours, minutes, 0, 0);

        // Assume 2-hour duration
        const endTime = addHours(startTime, 2);

        // Create event description with link back to VibeCheck
        const description = `${vibeCheckEvent.vibe.join(' ')}\n\nHosted by: ${vibeCheckEvent.host.name}\nPrice: ${vibeCheckEvent.price}\n\nView on VibeCheck: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/events/${eventId}`;

        // Add to Google Calendar
        const result = await addEventToCalendar(accessToken, {
            title: vibeCheckEvent.title,
            description,
            location: vibeCheckEvent.location,
            startTime,
            endTime,
        });

        return NextResponse.json({
            success: true,
            calendarEventId: result.id,
            message: 'Event added to your calendar!'
        });
    } catch (error: any) {
        console.error('Error adding event to calendar:', error);

        if (error.message?.includes('invalid_grant') || error.message?.includes('Token has been expired')) {
            return NextResponse.json(
                { error: 'Token expired', expired: true },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to add event to calendar' },
            { status: 500 }
        );
    }
}
