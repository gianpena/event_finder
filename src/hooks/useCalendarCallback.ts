"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEventStore } from '@/lib/store';

/**
 * Hook to handle Google Calendar OAuth callback.
 * Reads ?calendar_token from the URL after Google redirects back,
 * stores it in the Zustand store, then fetches the user's calendar events.
 *
 * If the access token is already expired the hook calls
 * /api/calendar/refresh (which reads the httpOnly refresh-token cookie) to
 * obtain a fresh access token and retries the events fetch exactly once.
 */
export function useCalendarCallback() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const {
        connectCalendar,
        setCalendarEvents,
        disconnectCalendar,
        setCalendarSyncing,
    } = useEventStore();

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
            // Persist the access token and mark calendar as connected
            connectCalendar(token);
            setCalendarSyncing(true);

            // Fetch events; refresh token and retry once on expiry
            fetchCalendarEvents(token);

            // Strip the token from the URL — never leave it in browser history
            const url = new URL(window.location.href);
            url.searchParams.delete('calendar_token');
            router.replace(url.pathname);
        }
    }, [searchParams, router, connectCalendar, setCalendarEvents]);

    async function fetchCalendarEvents(
        accessToken: string,
        isRetry = false
    ): Promise<void> {
        try {
            const response = await fetch('/api/calendar/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken }),
            });

            const result = await response.json();

            if (result.expired) {
                if (isRetry) {
                    // Refresh already failed — force re-authentication
                    alert('Your calendar session has expired. Please reconnect.');
                    disconnectCalendar();
                    return;
                }

                // Attempt a silent token refresh using the httpOnly cookie
                const refreshed = await tryRefreshToken();
                if (!refreshed) {
                    alert('Your calendar session has expired. Please reconnect.');
                    disconnectCalendar();
                    return;
                }

                // Retry with the new token (once only)
                return fetchCalendarEvents(refreshed, true);
            }

            if (result.events) {
                setCalendarEvents(result.events);
            }
        } catch (error) {
            console.error('Failed to fetch calendar events:', error);
        } finally {
            setCalendarSyncing(false);
        }
    }

    /**
     * Calls POST /api/calendar/refresh (which reads the httpOnly refresh-token
     * cookie) and, on success, updates the store with the new access token.
     * Returns the new access token string, or null if the refresh failed.
     */
    async function tryRefreshToken(): Promise<string | null> {
        try {
            const response = await fetch('/api/calendar/refresh', {
                method: 'POST',
            });

            const result = await response.json();

            if (result.success && result.data?.accessToken) {
                const newToken: string = result.data.accessToken;
                connectCalendar(newToken);
                return newToken;
            }

            return null;
        } catch {
            return null;
        }
    }
}
