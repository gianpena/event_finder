"use client";

import { Navbar } from "@/components/features/Navbar";
import { useEventStore } from "@/lib/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SignInModal } from "@/components/features/SignInModal";
import Link from "next/link";
import { CalendarEvent } from "@/lib/calendar";
import { Calendar, Lock, Ticket, Settings } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

/** Format a CalendarEvent's start time for display. */
function formatCalendarEventTime(event: CalendarEvent): string {
    try {
        const dt = parseISO(event.start.dateTime);
        return format(dt, "EEE, MMM d · h:mm a");
    } catch {
        return event.start.dateTime;
    }
}

export default function ProfilePage() {
    const { myRsvps, isCalendarConnected, calendarEvents, events, syncRsvps } = useEventStore();
    const { data: session, status } = useSession();
    const [showSignIn, setShowSignIn] = useState(false);
    const rsvpEvents = events.filter((e) => myRsvps.includes(e.id));

    useEffect(() => {
        if (session?.user?.email) syncRsvps(session.user.email);
    }, [session?.user?.email]);

    // Next 3 upcoming calendar events (start >= now, sorted ascending)
    const now = new Date();
    const upcomingCalendarEvents = calendarEvents
        .filter((e) => {
            try {
                return parseISO(e.start.dateTime) >= now;
            } catch {
                return false;
            }
        })
        .sort((a, b) => {
            return (
                parseISO(a.start.dateTime).getTime() -
                parseISO(b.start.dateTime).getTime()
            );
        })
        .slice(0, 3);

    if (status !== "loading" && !session) {
        return (
            <div className="min-h-screen bg-background">
                <div className="sticky top-0 z-40 bg-gradient-to-b from-black/80 via-black/30 to-transparent pb-4">
                    <Navbar variant="transparent" />
                </div>
                <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 px-4 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                        <Lock className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold">Your profile awaits</h2>
                        <p className="text-sm text-muted-foreground">Sign in to see your RSVPs, reviews, and calendar.</p>
                    </div>
                    <Button onClick={() => setShowSignIn(true)}>Sign In</Button>
                </div>
                <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} message="Sign in to view your profile" />
            </div>
        );
    }

    const displayName = session?.user?.name ?? "Guest";
    const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="sticky top-0 z-40 bg-gradient-to-b from-black/80 via-black/30 to-transparent pb-4">
                <Navbar variant="transparent" />
            </div>

            <main className="container mx-auto max-w-2xl py-8 space-y-8 px-4 sm:px-0">
                {/* Profile header */}
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={session?.user?.image ?? ""} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold truncate">{displayName}</h1>
                        <p className="text-muted-foreground text-sm truncate">{session?.user?.email}</p>
                    </div>
                    <Button variant="ghost" size="icon" asChild className="ml-auto shrink-0">
                        <Link href="/settings">
                            <Settings className="h-5 w-5" />
                            <span className="sr-only">Settings</span>
                        </Link>
                    </Button>
                </div>

                {/* Calendar section — only shown when connected and has events */}
                {isCalendarConnected && upcomingCalendarEvents.length > 0 && (
                    <section className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold">Your Calendar</h2>
                        </div>
                        <div className="grid gap-3">
                            {upcomingCalendarEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="flex items-start gap-4 rounded-lg border p-4 bg-card"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                                        <Calendar className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium leading-tight truncate">
                                            {event.summary}
                                        </p>
                                        <p className="mt-0.5 text-sm text-muted-foreground">
                                            {formatCalendarEventTime(event)}
                                        </p>
                                        {event.location && (
                                            <p className="mt-0.5 text-xs text-muted-foreground truncate">
                                                {event.location}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* RSVP section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">My Reservations</h2>
                    {rsvpEvents.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-8 text-center space-y-3">
                            <Ticket className="h-8 w-8 text-muted-foreground mx-auto" />
                            <div className="space-y-1">
                                <p className="font-medium">No RSVPs yet</p>
                                <p className="text-sm text-muted-foreground">Discover something happening near you.</p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/">Browse Events</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {rsvpEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="flex items-center gap-4 rounded-lg border p-4 bg-card"
                                >
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        className="h-16 w-16 rounded-md object-cover"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{event.title}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {event.date} &bull; {event.time}
                                        </p>
                                    </div>
                                    <Badge variant={event.isPrivate ? "secondary" : "default"}>
                                        {event.isPrivate ? "Pending" : "Confirmed"}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
