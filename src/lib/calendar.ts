import { google } from 'googleapis';

/**
 * Google Calendar API integration utilities
 */

export interface CalendarEvent {
    id: string;
    summary: string;
    description?: string;
    location?: string;
    start: {
        dateTime: string;
        timeZone?: string;
    };
    end: {
        dateTime: string;
        timeZone?: string;
    };
}

/**
 * Generate Google OAuth URL for calendar access
 */
export function getGoogleAuthURL(redirectUri: string): string {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
    );

    const scopes = [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events',
    ];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent', // Force consent screen to get refresh token
    });
}

/**
 * Exchange authorization code for access tokens
 */
export async function getTokensFromCode(code: string, redirectUri: string) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
}

/**
 * Create authenticated Google Calendar client
 */
export function getCalendarClient(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({ access_token: accessToken });

    return google.calendar({ version: 'v3', auth: oauth2Client });
}

/**
 * Fetch user's calendar events within a time range
 */
export async function fetchUserEvents(
    accessToken: string,
    timeMin: Date,
    timeMax: Date
): Promise<CalendarEvent[]> {
    const calendar = getCalendarClient(accessToken);

    try {
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
        });

        return (response.data.items || []).map((event: any) => ({
            id: event.id,
            summary: event.summary || 'Untitled Event',
            description: event.description,
            location: event.location,
            start: {
                dateTime: event.start.dateTime || event.start.date,
                timeZone: event.start.timeZone,
            },
            end: {
                dateTime: event.end.dateTime || event.end.date,
                timeZone: event.end.timeZone,
            },
        }));
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        throw new Error('Failed to fetch calendar events');
    }
}

/**
 * Add event to user's Google Calendar
 */
export async function addEventToCalendar(
    accessToken: string,
    event: {
        title: string;
        description?: string;
        location?: string;
        startTime: Date;
        endTime: Date;
    }
) {
    const calendar = getCalendarClient(accessToken);

    const calendarEvent = {
        summary: event.title,
        description: event.description,
        location: event.location,
        start: {
            dateTime: event.startTime.toISOString(),
            timeZone: 'America/New_York', // Default, should be configurable
        },
        end: {
            dateTime: event.endTime.toISOString(),
            timeZone: 'America/New_York',
        },
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'popup', minutes: 60 }, // 1 hour before
                { method: 'popup', minutes: 1440 }, // 1 day before
            ],
        },
    };

    try {
        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: calendarEvent,
        });

        return response.data;
    } catch (error) {
        console.error('Error adding event to calendar:', error);
        throw new Error('Failed to add event to calendar');
    }
}
