"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Link as LinkIcon, X } from 'lucide-react';
import { useEventStore } from '@/lib/store';

export function CalendarConnectButton() {
    const [isConnecting, setIsConnecting] = useState(false);
    const { isCalendarConnected, isCalendarSyncing, connectCalendar, disconnectCalendar } = useEventStore();

    async function handleConnect() {
        setIsConnecting(true);
        try {
            // Get auth URL from our API
            const response = await fetch('/api/calendar/connect');
            const { authUrl } = await response.json();

            // Redirect to Google OAuth
            window.location.href = authUrl;
        } catch (error) {
            console.error('Failed to connect calendar:', error);
            alert('Failed to connect calendar. Please try again.');
            setIsConnecting(false);
        }
    }

    function handleDisconnect() {
        if (confirm('Are you sure you want to disconnect your calendar?')) {
            disconnectCalendar();
        }
    }

    if (isCalendarSyncing) {
        return (
            <Button variant="outline" size="sm" disabled className="gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <span className="hidden sm:inline">
                    <Skeleton className="h-3 w-16 rounded inline-block" />
                </span>
            </Button>
        );
    }

    if (isConnecting) {
        return (
            <Button variant="outline" size="sm" disabled className="gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-3 w-20 rounded hidden sm:block" />
            </Button>
        );
    }

    if (isCalendarConnected) {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                className="gap-2"
            >
                <Calendar className="h-4 w-4 text-green-500" />
                <span className="hidden sm:inline">Calendar Connected</span>
                <X className="h-3 w-3" />
            </Button>
        );
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleConnect}
            className="gap-2"
        >
            <LinkIcon className="h-4 w-4" />
            Connect Calendar
        </Button>
    );
}
