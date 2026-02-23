"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEventStore } from '@/lib/store';
import { addDays } from 'date-fns';

/**
 * Hook to handle Google Calendar OAuth callback
 * Checks URL parameters for calendar token and fetches events
 */
export function useCalendarCallback() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { connectCalendar, setCalendarEvents, disconnectCalendar } = useEventStore();

    useEffect(() => {
        const token = searchParams.get('calendar_token');
        const error = searchParams.get('calendar_error');

        if (error) {
            alert(`Calendar connection failed: ${error.replace(/_/g, ' ')}`);

            // Clean URL
            const url = new URL(window.location.href);
            url.searchParams.delete('calendar_error');
            router.replace(url.pathname);
            return;
        }

        if (token) {
            // Save token to store
            connectCalendar(token);

            // Fetch calendar events
            fetchCalendarEvents(token);

            // Clean URL
            const url = new URL(window.location.href);
            url.searchParams.delete('calendar_token');
            router.replace(url.pathname);
        }
    }, [searchParams, router, connectCalendar, setCalendarEvents]);

    async function fetchCalendarEvents(accessToken: string) {
        try {
            const response = await fetch('/api/calendar/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken }),
            });

            const result = await response.json();

            if (result.expired) {
                alert('Your calendar session has expired. Please reconnect.');
                disconnectCalendar();
                return;
            }

            if (result.events) {
                setCalendarEvents(result.events);
            }
        } catch (error) {
            console.error('Failed to fetch calendar events:', error);
        }
    }
}
