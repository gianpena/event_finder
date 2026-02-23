import { CalendarEvent } from './calendar';
import { Event } from './data';
import { parseISO, isWithinInterval, isBefore, isAfter, addHours, format } from 'date-fns';

export interface TimeSlot {
    start: Date;
    end: Date;
    duration: number; // in minutes
}

export interface ConflictResult {
    hasConflict: boolean;
    conflictingEvent?: CalendarEvent;
    message?: string;
}

export interface CompatibilityResult {
    score: number; // 0-100
    status: 'perfect' | 'good' | 'warning' | 'conflict';
    message: string;
    conflicts: CalendarEvent[];
}

/**
 * Find free time slots in a user's calendar for a given day
 */
export function findFreeTimeSlots(
    calendarEvents: CalendarEvent[],
    date: Date,
    minDuration: number = 60 // minimum duration in minutes
): TimeSlot[] {
    // Define working hours for students (8 AM - 11 PM)
    const dayStart = new Date(date);
    dayStart.setHours(8, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 0, 0, 0);

    // Get events for this day
    const dayEvents = calendarEvents
        .filter((event) => {
            const eventStart = new Date(event.start.dateTime);
            return eventStart.toDateString() === date.toDateString();
        })
        .sort((a, b) => {
            const aStart = new Date(a.start.dateTime);
            const bStart = new Date(b.start.dateTime);
            return aStart.getTime() - bStart.getTime();
        });

    const freeSlots: TimeSlot[] = [];
    let currentTime = dayStart;

    for (const event of dayEvents) {
        const eventStart = new Date(event.start.dateTime);
        const eventEnd = new Date(event.end.dateTime);

        // Check if there's a gap before this event
        const gapDuration = (eventStart.getTime() - currentTime.getTime()) / (1000 * 60);

        if (gapDuration >= minDuration) {
            freeSlots.push({
                start: currentTime,
                end: eventStart,
                duration: gapDuration,
            });
        }

        // Move current time to end of this event
        currentTime = eventEnd > currentTime ? eventEnd : currentTime;
    }

    // Check for free time after the last event
    const finalGapDuration = (dayEnd.getTime() - currentTime.getTime()) / (1000 * 60);
    if (finalGapDuration >= minDuration) {
        freeSlots.push({
            start: currentTime,
            end: dayEnd,
            duration: finalGapDuration,
        });
    }

    return freeSlots;
}

/**
 * Detect if a VibeCheck event conflicts with calendar events
 */
export function detectConflict(
    vibeCheckEvent: Event,
    calendarEvents: CalendarEvent[]
): ConflictResult {
    // Parse event date and time
    const eventDate = new Date(vibeCheckEvent.date);
    const [hours, minutes] = vibeCheckEvent.time.split(':').map(Number);

    const eventStart = new Date(eventDate);
    eventStart.setHours(hours, minutes, 0, 0);

    // Assume 2-hour duration for events
    const eventEnd = addHours(eventStart, 2);

    // Check for overlaps
    const conflictingEvent = calendarEvents.find((calEvent) => {
        const calStart = new Date(calEvent.start.dateTime);
        const calEnd = new Date(calEvent.end.dateTime);

        // Check if there's any overlap
        return (
            (eventStart >= calStart && eventStart < calEnd) || // Event starts during cal event
            (eventEnd > calStart && eventEnd <= calEnd) || // Event ends during cal event
            (eventStart <= calStart && eventEnd >= calEnd) // Event completely contains cal event
        );
    });

    if (conflictingEvent) {
        return {
            hasConflict: true,
            conflictingEvent,
            message: `Conflicts with: ${conflictingEvent.summary}`,
        };
    }

    return {
        hasConflict: false,
    };
}

/**
 * Calculate schedule compatibility score for an event
 */
export function calculateCompatibility(
    vibeCheckEvent: Event,
    calendarEvents: CalendarEvent[]
): CompatibilityResult {
    let score = 0;
    const conflicts: CalendarEvent[] = [];

    // Parse event time
    const eventDate = new Date(vibeCheckEvent.date);
    const [hours, minutes] = vibeCheckEvent.time.split(':').map(Number);

    const eventStart = new Date(eventDate);
    eventStart.setHours(hours, minutes, 0, 0);

    const eventEnd = addHours(eventStart, 2);

    // Check for direct conflicts
    const conflictResult = detectConflict(vibeCheckEvent, calendarEvents);

    if (conflictResult.hasConflict) {
        conflicts.push(conflictResult.conflictingEvent!);
        return {
            score: 0,
            status: 'conflict',
            message: conflictResult.message!,
            conflicts,
        };
    }

    // Base score for no conflict
    score += 50;

    // Find surrounding events
    const hourBeforeStart = addHours(eventStart, -1);
    const hourAfterEnd = addHours(eventEnd, 1);

    const eventsBefore = calendarEvents.filter((calEvent) => {
        const calEnd = new Date(calEvent.end.dateTime);
        return calEnd <= eventStart && calEnd >= hourBeforeStart;
    });

    const eventsAfter = calendarEvents.filter((calEvent) => {
        const calStart = new Date(calEvent.start.dateTime);
        return calStart >= eventEnd && calStart <= hourAfterEnd;
    });

    // Bonus points for having free time before and after
    if (eventsBefore.length === 0) {
        score += 20; // Free time before
    }

    if (eventsAfter.length === 0) {
        score += 20; // Free time after
    }

    // Check if event is nearby a previous event (same location bonus)
    const nearbyEvent = eventsBefore.find((calEvent) => {
        return calEvent.location && calEvent.location.includes(vibeCheckEvent.location);
    });

    if (nearbyEvent) {
        score += 10; // Nearby previous event
    }

    // Determine status and message
    let status: CompatibilityResult['status'];
    let message: string;

    if (score >= 80) {
        status = 'perfect';
        message = '✅ Perfect fit for your schedule!';
    } else if (score >= 60) {
        status = 'good';
        message = '👍 Fits well in your schedule';
    } else if (score >= 40) {
        status = 'warning';
        message = '⚠️ Tight schedule - may be rushed';
    } else {
        status = 'warning';
        message = '⚠️ Limited time around this event';
    }

    return {
        score,
        status,
        message,
        conflicts,
    };
}

/**
 * Get free hours for a given day
 */
export function getFreeHoursForDay(
    calendarEvents: CalendarEvent[],
    date: Date
): number {
    const freeSlots = findFreeTimeSlots(calendarEvents, date);
    const totalFreeMinutes = freeSlots.reduce((sum, slot) => sum + slot.duration, 0);
    return totalFreeMinutes / 60;
}

/**
 * Format time slot for display
 */
export function formatTimeSlot(slot: TimeSlot): string {
    return `${format(slot.start, 'h:mm a')} - ${format(slot.end, 'h:mm a')}`;
}
