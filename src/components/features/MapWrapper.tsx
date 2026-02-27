"use client";

import dynamic from "next/dynamic";
import type { Event } from '@/lib/data';

function MapSkeleton() {
    return (
        <div className="h-full w-full bg-zinc-900 relative overflow-hidden animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/60 to-zinc-950" />
            {/* Faint road-like lines */}
            <div className="absolute top-[38%] left-0 right-0 h-px bg-white/5" />
            <div className="absolute top-[62%] left-0 right-0 h-px bg-white/5" />
            <div className="absolute left-[30%] top-0 bottom-0 w-px bg-white/5" />
            <div className="absolute left-[65%] top-0 bottom-0 w-px bg-white/5" />
            {/* Placeholder event pins */}
            <div className="absolute top-[35%] left-[44%] h-3 w-3 rounded-full bg-white/20" />
            <div className="absolute top-[52%] left-[31%] h-3 w-3 rounded-full bg-white/20" />
            <div className="absolute top-[44%] left-[63%] h-3 w-3 rounded-full bg-white/20" />
            <div className="absolute top-[58%] left-[52%] h-3 w-3 rounded-full bg-white/20" />
        </div>
    );
}

const EventMap = dynamic(() => import("./Map/EventMap"), {
    ssr: false,
    loading: () => <MapSkeleton />,
});

export default function MapWrapper({ location }: { location?: Event }) {
    return location ? <EventMap location={location} /> : <EventMap />;
}
