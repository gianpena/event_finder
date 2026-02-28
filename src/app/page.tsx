"use client";

import { useEffect } from "react";
import { Navbar } from "@/components/features/Navbar";
import { FilterBar } from "@/components/features/FilterBar";
import MapWrapper from "@/components/features/MapWrapper";
import { EventsDrawer } from "@/components/features/EventsDrawer";
import { CalendarCallbackHandler } from "@/components/features/CalendarCallbackHandler";
import { useEventStore } from "@/lib/store";

export default function Home() {
    const { fetchEvents, events } = useEventStore();

    useEffect(() => {
        async function init() {
            // Seed mock events on first visit if DB is empty, then fetch
            await fetch("/api/seed", { method: "POST" });
            await fetchEvents();
        }
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="relative h-screen w-full overflow-hidden bg-background">
            <CalendarCallbackHandler />

            {/* Layer 1: Map */}
            <div className="absolute inset-0 z-0">
                <MapWrapper />
            </div>

            {/* Layer 2: Floating Top UI */}
            <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 via-black/40 to-transparent pb-10 pt-safe">
                <Navbar variant="transparent" />
                <FilterBar variant="transparent" className="mt-2" />
            </div>

            {/* Layer 3: Drawer */}
            <EventsDrawer />
        </div>
    );
}
