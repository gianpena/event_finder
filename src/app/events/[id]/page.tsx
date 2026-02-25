"use client";

import { use, useMemo } from "react";
import { MOCK_EVENTS } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/features/Navbar";
import MapWrapper from "@/components/features/MapWrapper";
import { useEventStore } from "@/lib/store";
import { calculateCompatibility, detectConflict } from "@/lib/schedule-analyzer";
import { ScheduleBadge } from "@/components/features/ScheduleBadge";
import { AddToCalendarButton } from "@/components/features/AddToCalendarButton";

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const event = MOCK_EVENTS.find((e) => e.id === id);
    const { isCalendarConnected, calendarEvents } = useEventStore();

    // Calculate schedule compatibility
    const compatibility = useMemo(() => {
        if (!isCalendarConnected || calendarEvents.length === 0 || !event) {
            return null;
        }
        return calculateCompatibility(event, calendarEvents);
    }, [isCalendarConnected, calendarEvents, event]);

    const conflict = useMemo(() => {
        if (!isCalendarConnected || calendarEvents.length === 0 || !event) {
            return null;
        }
        return detectConflict(event, calendarEvents);
    }, [isCalendarConnected, calendarEvents, event]);

    if (!event) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            <Navbar />

            <div className="relative h-[40vh] w-full overflow-hidden">
                <img
                    src={event.image}
                    alt={event.title}
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                <Button variant="outline" size="icon" className="absolute left-4 top-4 rounded-full bg-background/50 backdrop-blur-md border-none" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
            </div>

            <main className="container mx-auto -mt-10 relative z-10 space-y-8 px-4 sm:px-6">
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="backdrop-blur-md">{event.type}</Badge>
                        {event.isPrivate && <Badge variant="outline" className="bg-background/50">Private</Badge>}
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{event.title}</h1>

                    {/* Schedule Compatibility */}
                    {compatibility && (
                        <div className="space-y-2">
                            <ScheduleBadge compatibility={compatibility} />
                            {conflict?.hasConflict && conflict.conflictingEvent && (
                                <p className="text-sm text-muted-foreground">
                                    ⚠️ Note: Conflicts with "{conflict.conflictingEvent.summary}" in your calendar
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col gap-3 text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            <span>{event.location}</span>
                        </div>
                    </div>
                </div>

                <section className="space-y-3">
                    <h3 className="text-lg font-semibold">The Vibe</h3>
                    <div className="flex flex-wrap gap-2">
                        {event.vibe.map(v => (
                            <Badge key={v} variant="outline" className="px-3 py-1 text-sm">
                                {v}
                            </Badge>
                        ))}
                    </div>
                </section>

                <section className="space-y-3">
                    <h3 className="text-lg font-semibold">Hosted By</h3>
                    <div className="flex items-center gap-4 rounded-xl border p-4 bg-card">
                        <img src={event.host.avatar} alt={event.host.name} className="h-12 w-12 rounded-full object-cover" />
                        <div>
                            <p className="font-medium">{event.host.name}</p>
                            <p className="text-sm text-muted-foreground">Host</p>
                        </div>
                        <Button variant="outline" size="sm" className="ml-auto">
                            View Profile
                        </Button>
                    </div>
                </section>

                {event.isPrivate ? (
                    <section className="space-y-3">
                        <h3 className="text-lg font-semibold">Location</h3>
                        <div className="aspect-video w-full rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                            <div className="flex flex-col items-center gap-2">
                                <MapPin className="h-8 w-8" />
                                <span>RSVP to see location</span>
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className="space-y-3">
                        <h3 className="text-lg font-semibold">Location</h3>
                        <div className="aspect-video w-full rounded-xl overflow-hidden bg-muted">
                            <MapWrapper location={event} />
                        </div>
                    </section>
                )}
            </main>

            <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Total</span>
                        <span className="text-xl font-bold">{event.price}</span>
                    </div>
                    <div className="flex gap-2">
                        <AddToCalendarButton eventId={event.id} variant="outline" />
                        <Button size="lg" className="flex-1 sm:max-w-xs">
                            {event.isPrivate ? "Request to Join" : "Join Event"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
