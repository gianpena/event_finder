import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Event } from "@/lib/data";
import { CalendarEvent } from "@/lib/calendar";

interface EventState {
    // Events (from Supabase)
    events: Event[];
    isLoadingEvents: boolean;
    fetchEvents: () => Promise<void>;
    addEvent: (event: Omit<Event, "id">) => Promise<Event | null>;

    // Filters & map UI
    filter: string;
    selectedEventId: string | null;
    setFilter: (category: string) => void;
    setSelectedEvent: (id: string | null) => void;
    locateTrigger: number;
    triggerLocate: () => void;

    // RSVPs (synced from Supabase, cached locally)
    myRsvps: string[];
    syncRsvps: (userId: string) => Promise<void>;
    joinEvent: (eventId: string, action: "join" | "leave") => Promise<void>;
    isJoined: (eventId: string) => boolean;

    // Calendar integration
    isCalendarConnected: boolean;
    isCalendarSyncing: boolean;
    calendarAccessToken: string | null;
    calendarEvents: CalendarEvent[];
    connectCalendar: (token: string) => void;
    disconnectCalendar: () => void;
    setCalendarEvents: (events: CalendarEvent[]) => void;
    setCalendarSyncing: (syncing: boolean) => void;
}

export const useEventStore = create<EventState>()(
    persist(
        (set, get) => ({
            // ── Events ────────────────────────────────────────────────
            events: [],
            isLoadingEvents: false,

            fetchEvents: async () => {
                set({ isLoadingEvents: true });
                try {
                    const res = await fetch("/api/events");
                    if (!res.ok) throw new Error("Failed to fetch events");
                    const data: Event[] = await res.json();
                    set({ events: data });
                } catch (e) {
                    console.error("fetchEvents error:", e);
                } finally {
                    set({ isLoadingEvents: false });
                }
            },

            addEvent: async (event) => {
                try {
                    const res = await fetch("/api/events", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(event),
                    });
                    if (!res.ok) throw new Error("Failed to create event");
                    const created: Event = await res.json();
                    // Prepend optimistically then re-fetch for consistency
                    set((state) => ({ events: [created, ...state.events] }));
                    return created;
                } catch (e) {
                    console.error("addEvent error:", e);
                    return null;
                }
            },

            // ── UI State ──────────────────────────────────────────────
            filter: "All",
            selectedEventId: null,
            setFilter: (category) => set({ filter: category }),
            setSelectedEvent: (id) => set({ selectedEventId: id }),
            locateTrigger: 0,
            triggerLocate: () => set((state) => ({ locateTrigger: state.locateTrigger + 1 })),

            // ── RSVPs ─────────────────────────────────────────────────
            myRsvps: [],

            syncRsvps: async (userId) => {
                try {
                    const res = await fetch(`/api/rsvps?userId=${encodeURIComponent(userId)}`);
                    if (!res.ok) return;
                    const ids: string[] = await res.json();
                    set({ myRsvps: ids });
                } catch (e) {
                    console.error("syncRsvps error:", e);
                }
            },

            joinEvent: async (eventId, action) => {
                // Optimistic update
                set((state) => ({
                    myRsvps: action === "join"
                        ? [...state.myRsvps, eventId]
                        : state.myRsvps.filter((id) => id !== eventId),
                }));
                try {
                    await fetch("/api/rsvps", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ eventId, action }),
                    });
                } catch (e) {
                    // Roll back on failure
                    console.error("joinEvent error:", e);
                    set((state) => ({
                        myRsvps: action === "join"
                            ? state.myRsvps.filter((id) => id !== eventId)
                            : [...state.myRsvps, eventId],
                    }));
                }
            },

            isJoined: (eventId) => get().myRsvps.includes(eventId),

            // ── Calendar ──────────────────────────────────────────────
            isCalendarConnected: false,
            isCalendarSyncing: false,
            calendarAccessToken: null,
            calendarEvents: [],
            connectCalendar: (token) => set({ isCalendarConnected: true, calendarAccessToken: token }),
            disconnectCalendar: () => set({
                isCalendarConnected: false,
                isCalendarSyncing: false,
                calendarAccessToken: null,
                calendarEvents: [],
            }),
            setCalendarEvents: (events) => set({ calendarEvents: events }),
            setCalendarSyncing: (syncing) => set({ isCalendarSyncing: syncing }),
        }),
        {
            name: "vibecheck-storage",
            partialize: (state) => ({
                // Only persist auth-related calendar state; everything else fetched fresh
                isCalendarConnected: state.isCalendarConnected,
                calendarAccessToken: state.calendarAccessToken,
                calendarEvents: state.calendarEvents,
            }),
        }
    )
);
