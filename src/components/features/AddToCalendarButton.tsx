"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarPlus, Check, Loader2 } from 'lucide-react';
import { useEventStore } from '@/lib/store';

interface AddToCalendarButtonProps {
    eventId: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
}

export function AddToCalendarButton({ eventId, variant = 'default', size = 'default' }: AddToCalendarButtonProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const { isCalendarConnected, calendarAccessToken } = useEventStore();

    async function handleAddToCalendar() {
        if (!isCalendarConnected || !calendarAccessToken) {
            alert('Please connect your Google Calendar first!');
            return;
        }

        setIsAdding(true);
        try {
            const response = await fetch('/api/calendar/add-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId,
                    accessToken: calendarAccessToken,
                }),
            });

            const result = await response.json();

            if (result.expired) {
                alert('Your calendar session has expired. Please reconnect your calendar.');
                return;
            }

            if (result.success) {
                setIsAdded(true);
                setTimeout(() => setIsAdded(false), 3000); // Reset after 3 seconds
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Failed to add event to calendar:', error);
            alert('Failed to add event to calendar. Please try again.');
        } finally {
            setIsAdding(false);
        }
    }

    if (!isCalendarConnected) {
        return null; // Don't show if calendar not connected
    }

    if (isAdded) {
        return (
            <Button variant="outline" size={size} disabled className="gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Added to Calendar
            </Button>
        );
    }

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleAddToCalendar}
            disabled={isAdding}
            className="gap-2"
        >
            {isAdding ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                </>
            ) : (
                <>
                    <CalendarPlus className="h-4 w-4" />
                    Add to Calendar
                </>
            )}
        </Button>
    );
}
