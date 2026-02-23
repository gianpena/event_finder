import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Event, MOCK_EVENTS } from "@/lib/data";
import { CalendarEvent } from "@/lib/calendar";

interface EventState {
    events: Event[];
    filter: string;
    selectedEventId: string | null;
    myRsvps: string[]; // list of event IDs
    setFilter: (category: string) => void;
    setSelectedEvent: (id: string | null) => void;
    addEvent: (event: Event) => void;
    joinEvent: (eventId: string) => void;
    isJoined: (eventId: string) => boolean;
    locateTrigger: number;
    triggerLocate: () => void;

    // Calendar integration
    isCalendarConnected: boolean;
    calendarAccessToken: string | null;
    calendarEvents: CalendarEvent[];
    connectCalendar: (token: string) => void;
    disconnectCalendar: () => void;
    setCalendarEvents: (events: CalendarEvent[]) => void;
}

export const useEventStore = create<EventState>()(
    persist(
        (set, get) => ({
            events: MOCK_EVENTS,
            filter: "All",
            selectedEventId: null,
            myRsvps: [],
            setFilter: (category) => set({ filter: category }),
            setSelectedEvent: (id) => set({ selectedEventId: id }),
            addEvent: (event) => set((state) => ({ events: [event, ...state.events] })),
            joinEvent: (eventId) => {
                const { myRsvps } = get();
                if (myRsvps.includes(eventId)) {
                    set({ myRsvps: myRsvps.filter(id => id !== eventId) });
                } else {
                    set({ myRsvps: [...myRsvps, eventId] });
                }
            },
            isJoined: (eventId) => get().myRsvps.includes(eventId),
            locateTrigger: 0,
            triggerLocate: () => set((state) => ({ locateTrigger: state.locateTrigger + 1 })),

            // Calendar state
            isCalendarConnected: false,
            calendarAccessToken: null,
            calendarEvents: [],
            connectCalendar: (token) => set({
                isCalendarConnected: true,
                calendarAccessToken: token
            }),
            disconnectCalendar: () => set({
                isCalendarConnected: false,
                calendarAccessToken: null,
                calendarEvents: []
            }),
            setCalendarEvents: (events) => set({ calendarEvents: events }),
        }),
        {
            name: 'vibecheck-storage',
            partialize: (state) => ({
                myRsvps: state.myRsvps,
                isCalendarConnected: state.isCalendarConnected,
                calendarAccessToken: state.calendarAccessToken,
            }),
        }
    )
);

