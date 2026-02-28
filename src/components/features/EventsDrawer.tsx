"use client";

import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { EventCard } from "./EventCard";
import { EventCardSkeleton } from "./EventCardSkeleton";
import { useState, useEffect } from "react";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useEventStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const PEEK_HEIGHT = "160px";
const SKELETON_COUNT = 6;

export function EventsDrawer() {
    const [snap, setSnap] = useState<number | string | null>(PEEK_HEIGHT);
    const [snapPoints, setSnapPoints] = useState<(string | number)[]>([PEEK_HEIGHT, 0.85, 1]);
    const [isMounted, setIsMounted] = useState(false);
    const { filter, events, isLoadingEvents } = useEventStore();

    // Adapt mid snap point to viewport height
    useEffect(() => {
        const update = () => {
            const h = window.innerHeight;
            setSnapPoints([PEEK_HEIGHT, h < 700 ? 0.65 : 0.85, 1]);
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const filteredEvents = events.filter(event =>
        filter === "All" ? true : event.type === filter
    );

    const showSkeletons = !isMounted || isLoadingEvents;

    return (
        <Drawer
            open={true}
            modal={false}
            snapPoints={snapPoints}
            activeSnapPoint={snap}
            setActiveSnapPoint={setSnap}
            dismissible={false}
        >
            <DrawerContent showOverlay={false} className="h-full max-h-[96vh] fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-transparent border-none outline-none shadow-none">
                {/* Attached Locate Button */}
                <div className="absolute -top-16 right-4 z-50">
                    <LiquidGlass className="rounded-full shadow-lg">
                        <Button
                            onClick={() => useEventStore.getState().triggerLocate()}
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 rounded-full hover:bg-white/10 text-white"
                        >
                            <MapPin className="h-5 w-5" />
                            <span className="sr-only">Locate Me</span>
                        </Button>
                    </LiquidGlass>
                </div>

                <LiquidGlass className="h-full w-full rounded-t-3xl">
                    <div className="flex flex-col h-full">
                        {/* Handle with larger hit area */}
                        <div className="mx-auto w-full flex items-center justify-center py-4 cursor-grab active:cursor-grabbing touch-none">
                            <div className="h-2 w-[80px] rounded-full bg-white/40 backdrop-blur-sm shadow-sm" />
                        </div>
                        <DrawerHeader className="pt-0">
                            <DrawerTitle className="text-white/90">Explore Events</DrawerTitle>
                        </DrawerHeader>
                        <div className="p-8 overflow-y-auto flex-1 pb-32">
                            <div className="grid gap-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                                {showSkeletons
                                    ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                                        <EventCardSkeleton key={i} />
                                    ))
                                    : filteredEvents.map((event) => (
                                        <div key={event.id} className="hover:scale-[1.02] transition-transform duration-300">
                                            <EventCard event={event} />
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </LiquidGlass>
            </DrawerContent>
        </Drawer>
    );
}
