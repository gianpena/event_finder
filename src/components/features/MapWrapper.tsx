"use client";

import dynamic from "next/dynamic";
import type { Event } from '@/lib/data';

const EventMap = dynamic(() => import("./Map/EventMap"), {
    ssr: false,
    loading: () => <div className="h-screen w-full bg-muted animate-pulse" />
});

export default function MapWrapper({ location }: { location?: Event }) {
    return location ? <EventMap location={location} /> : <EventMap />;
}
