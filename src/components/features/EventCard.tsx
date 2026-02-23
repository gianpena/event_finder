"use client";

import Link from "next/link";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { ScheduleBadge } from "@/components/features/ScheduleBadge";
import { Event } from "@/lib/data";
import { useEventStore } from "@/lib/store";
import { calculateCompatibility } from "@/lib/schedule-analyzer";
import { useMemo } from "react";

interface EventCardProps {
    event: Event;
    variant?: "vertical" | "horizontal";
}

export function EventCard({ event, variant = "vertical" }: EventCardProps) {
    const { isCalendarConnected, calendarEvents } = useEventStore();

    // Calculate schedule compatibility if calendar is connected
    const compatibility = useMemo(() => {
        if (!isCalendarConnected || calendarEvents.length === 0) {
            return null;
        }
        return calculateCompatibility(event, calendarEvents);
    }, [isCalendarConnected, calendarEvents, event]);

    return (
        <Card className="overflow-hidden border-none shadow-none bg-transparent group">
            <Link href={`/events/${event.id}`}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                    <img
                        src={event.image}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute left-3 top-3">
                        <LiquidGlass className="rounded-full px-3 py-1">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">{event.type}</span>
                        </LiquidGlass>
                    </div>
                    {event.isPrivate && (
                        <div className="absolute right-3 top-3">
                            <LiquidGlass className="rounded-full px-3 py-1">
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Private</span>
                            </LiquidGlass>
                        </div>
                    )}
                </div>
            </Link>
            <div className="pt-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
                    <span className="text-primary">{event.date}</span>
                    <span>•</span>
                    <span>{event.time}</span>
                </div>
                <Link href={`/events/${event.id}`} className="group-hover:underline">
                    <h3 className="line-clamp-1 text-base font-semibold tracking-tight">{event.title}</h3>
                </Link>
                {compatibility && (
                    <div className="mt-2">
                        <ScheduleBadge compatibility={compatibility} size="sm" />
                    </div>
                )}
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="line-clamp-1">{event.location}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                    <div className="flex -space-x-2">
                        <img src={event.host.avatar} alt={event.host.name} className="h-5 w-5 rounded-full border-2 border-background object-cover" />
                        <span className="pl-3 text-[10px] text-muted-foreground self-center">Hosted by {event.host.name}</span>
                    </div>
                    <Button size="sm" variant={event.isPrivate ? "outline" : "default"}>
                        {event.isPrivate ? "Request" : "Book"}
                    </Button>
                </div>
            </div>
        </Card>
    );
}
