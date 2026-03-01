"use client";

import { use, useMemo, useState, useEffect } from "react";
import { Event } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {Calendar, CalendarCheck, Clock, MapPin, Star, MessageCircle} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/features/Navbar";
import MapWrapper from "@/components/features/MapWrapper";
import { useEventStore } from "@/lib/store";
import { calculateCompatibility, detectConflict } from "@/lib/schedule-analyzer";
import { ScheduleBadge } from "@/components/features/ScheduleBadge";
import { AddToCalendarButton } from "@/components/features/AddToCalendarButton";
import { OrganizerReviews } from "@/components/features/OrganizerReviews";
import { SignInModal } from "@/components/features/SignInModal";
import { useSession } from "next-auth/react";

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { isCalendarConnected, calendarEvents, calendarAccessToken, joinEvent, isJoined, syncRsvps } = useEventStore();
    const { data: session } = useSession();

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [calendarAddedAfterRsvp, setCalendarAddedAfterRsvp] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [showSignIn, setShowSignIn] = useState(false);
    const [hostReviews, setHostReviews] = useState<{ rating: number }[]>([]);

    // Fetch the event from the API
    useEffect(() => {
        async function load() {
            setLoading(true);
            const res = await fetch(`/api/events/${id}`);
            if (!res.ok) { setLoading(false); return; }
            const data: Event = await res.json();
            setEvent(data);
            setLoading(false);
        }
        load();
    }, [id]);

    // Sync this user's RSVPs from DB
    useEffect(() => {
        if (session?.user?.email) syncRsvps(session.user.email);
    }, [session?.user?.email]);

    // Fetch host reviews for the rating display
    useEffect(() => {
        if (!event) return;
        fetch(`/api/reviews?hostName=${encodeURIComponent(event.host.name)}`)
            .then(r => r.json())
            .then(setHostReviews)
            .catch(() => {});
    }, [event?.host.name]);

    const compatibility = useMemo(() => {
        if (!isCalendarConnected || calendarEvents.length === 0 || !event) return null;
        return calculateCompatibility(event, calendarEvents);
    }, [isCalendarConnected, calendarEvents, event]);

    const conflict = useMemo(() => {
        if (!isCalendarConnected || calendarEvents.length === 0 || !event) return null;
        return detectConflict(event, calendarEvents);
    }, [isCalendarConnected, calendarEvents, event]);

    const avgRating = hostReviews.length > 0
        ? hostReviews.reduce((sum, r) => sum + r.rating, 0) / hostReviews.length
        : null;

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="h-[48vh] w-full bg-muted animate-pulse" />
                <div className="container mx-auto px-4 py-8 space-y-4">
                    <div className="h-8 w-2/3 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
                </div>
            </div>
        );
    }

    if (!event) notFound();

    const joined = isJoined(event!.id);

    async function handleJoin() {
        if (!event) return;
        if (!session) { setShowSignIn(true); return; }

        setIsJoining(true);
        const action = joined ? "leave" : "join";
        await joinEvent(event.id, action);

        if (action === "join" && isCalendarConnected && calendarAccessToken) {
            try {
                const res = await fetch("/api/calendar/add-event", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ eventId: event.id, accessToken: calendarAccessToken }),
                });
                const result = await res.json();
                if (result.success) {
                    setCalendarAddedAfterRsvp(true);
                    setTimeout(() => setCalendarAddedAfterRsvp(false), 4000);
                }
            } catch (err) {
                console.error("Auto-add to calendar failed:", err);
            }
        }
        setIsJoining(false);
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} message="Sign in to RSVP" />

            {/* Hero with overlaid navbar */}
            <div className="relative h-[48vh] w-full overflow-hidden">
                <img src={event!.image} alt={event!.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 via-black/40 to-transparent pb-10">
                    <Navbar variant="transparent" />
                </div>
            </div>

            <main className="container mx-auto -mt-10 relative z-10 space-y-8 px-4 sm:px-6">
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="backdrop-blur-md">{event!.type}</Badge>
                        {event!.isPrivate && <Badge variant="outline" className="bg-background/50">Private</Badge>}
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{event!.title}</h1>

                    {compatibility && (
                        <div className="space-y-1.5">
                            <ScheduleBadge compatibility={compatibility} />
                            <p className="text-xs text-muted-foreground">Based on ~2 hr event duration</p>
                            {conflict?.hasConflict && conflict.conflictingEvent && (
                                <p className="text-sm text-muted-foreground">
                                    Conflicts with &ldquo;{conflict.conflictingEvent.summary}&rdquo; in your calendar
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col gap-3 text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" /><span>{event!.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" /><span>{event!.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" /><span>{event!.location}</span>
                        </div>
                    </div>
                </div>

                <section className="space-y-3">
                    <h3 className="text-lg font-semibold">The Vibe</h3>
                    <div className="flex flex-wrap gap-2">
                        {event!.vibe.map(v => (
                            <Badge key={v} variant="outline" className="px-3 py-1 text-sm">{v}</Badge>
                        ))}
                    </div>
                </section>

                <section className="space-y-3">
                    <h3 className="text-lg font-semibold">Hosted By</h3>
                    <div className="flex items-center gap-4 rounded-xl border p-4 bg-card">
                        <img src={event!.host.avatar} alt={event!.host.name} className="h-12 w-12 rounded-full object-cover" />
                        <div>
                            <p className="font-medium">{event!.host.name}</p>
                            {avgRating !== null ? (
                                <div className="flex items-center gap-1 mt-0.5">
                                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm text-muted-foreground">
                                        {avgRating.toFixed(1)} ({hostReviews.length} {hostReviews.length === 1 ? "review" : "reviews"})
                                    </span>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Host · No reviews yet</p>
                            )}
                        </div>
                    </div>
                </section>

                <OrganizerReviews
                    hostName={event!.host.name}
                    hostAvatar={event!.host.avatar}
                    eventId={event!.id}
                    eventTitle={event!.title}
                    canReview={joined}
                />

                {event!.isPrivate ? (
                    <section className="space-y-3">
                        <h3 className="text-lg font-semibold">Location</h3>
                        <div className="aspect-video w-full rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                            <div className="flex flex-col items-center gap-2">
                                <MapPin className="h-8 w-8" /><span>RSVP to see location</span>
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className="space-y-3">
                        <h3 className="text-lg font-semibold">Location</h3>
                        <div className="aspect-video w-full rounded-xl overflow-hidden bg-muted">
                            <MapWrapper location={event!} />
                        </div>
                    </section>
                )}
            </main>

            <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex flex-col gap-2">
                    {calendarAddedAfterRsvp && (
                        <div className="flex items-center gap-2 text-sm text-green-500 justify-end">
                            <CalendarCheck className="h-4 w-4" /><span>Added to your calendar!</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Total</span>
                            <span className="text-xl font-bold">{event!.price}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            {event!.isPrivate && joined && <span className="text-xs text-muted-foreground">Request sent · awaiting approval</span>}
                            {event!.isPrivate && !joined && <span className="text-xs text-muted-foreground">Private · request will be reviewed</span>}
                            <div className="flex gap-2">
                                <AddToCalendarButton eventId={event!.id} variant="outline" />
                                {(!event!.isPrivate || joined) && (
                                    <Link href={`/events/${event!.id}/chat`}>
                                        <MessageCircle className="h-5 w-5" />
                                    </Link>
                                )}
                                <Button size="lg" className="flex-1 sm:max-w-xs" onClick={handleJoin} disabled={isJoining} variant={joined ? "outline" : "default"}>
                                    {joined ? (event!.isPrivate ? "Cancel Request" : "Leave Event") : event!.isPrivate ? "Request to Join" : "Join Event"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
