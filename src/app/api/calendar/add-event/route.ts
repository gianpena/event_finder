import { NextRequest, NextResponse } from 'next/server';
import { addEventToCalendar } from '@/lib/calendar';
import { supabase, dbToEvent } from '@/lib/supabase';
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

        // Fetch the event from Supabase
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();

        if (error || !data) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        const vibeCheckEvent = dbToEvent(data);

        // Use the ISO startAt field directly for accurate time
        const startTime = new Date(vibeCheckEvent.startAt);
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
