"use client";

import { Navbar } from "@/components/features/Navbar";
import { FilterBar } from "@/components/features/FilterBar";
import MapWrapper from "@/components/features/MapWrapper";
import { EventsDrawer } from "@/components/features/EventsDrawer";
import { useCalendarCallback } from "@/hooks/useCalendarCallback";

export default function Home() {
  // Handle calendar OAuth callback
  useCalendarCallback();

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {/* Layer 1: Map Background */}
      <div className="absolute inset-0 z-0">
        <MapWrapper />
      </div>

      {/* Layer 2: Floating Top UI */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 via-black/40 to-transparent pb-10 pt-safe">
        <Navbar variant="transparent" />
        <FilterBar variant="transparent" className="mt-2" />
      </div>

      {/* Layer 4: Draggable Events Drawer */}
      <EventsDrawer />
    </div>
  );
}
