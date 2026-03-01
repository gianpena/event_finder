"use client";

import Map, { Marker, Popup, type MapMouseEvent, MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Event } from '@/lib/data';
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { MOCK_EVENTS } from "@/lib/data";
import { useEventStore } from "@/lib/store";
import { MapPin, Calendar, Clock, X, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EventMap({ location }: { location?: Event }) {
    const { setSelectedEvent, selectedEventId, locateTrigger } = useEventStore();
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const mapRef = useRef<MapRef>(null);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Helper to handle safe hover selection clearing
    const clearSelection = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
            setSelectedEvent(null);
        }, 300); // Larger grace period
    };

    const cancelClear = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
    };

    const selectedEvent = useMemo(() =>
        MOCK_EVENTS.find(e => e.id === selectedEventId),
        [selectedEventId]);

    const handleLocateMe = useCallback(() => {
        if (userLocation && mapRef.current) {
            mapRef.current.flyTo({
                center: [userLocation.lng, userLocation.lat],
                zoom: 14,
                duration: 2000
            });
        }
    }, [userLocation]);
    // Watch for store trigger
    useEffect(() => {
        if (locateTrigger > 0) {
            handleLocateMe();
        }
    }, [locateTrigger, handleLocateMe]);

    useEffect(() => {
        if ("geolocation" in navigator) {
            // ... existing geolocation init ...
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ lat: latitude, lng: longitude });
                    if (mapRef.current && !location) {
                        mapRef.current.flyTo({
                            center: [longitude, latitude],
                            zoom: 14,
                            duration: 2000
                        });
                    }
                },
                (error) => console.error("Error getting location:", error),
                { enableHighAccuracy: true }
            );
        }
    }, []);

    const pins = useMemo(
        () =>
            (location ? [location] : MOCK_EVENTS).map((event) => (
                <Marker
                    key={event.id}
                    longitude={event.coordinates[1]}
                    latitude={event.coordinates[0]}
                    anchor="bottom"
                    onClick={(e: any) => {
                        e.originalEvent.stopPropagation();
                        // Click also selects (for mobile/touch support)
                        setSelectedEvent(event.id);
                    }}
                >
                    <div
                        className={`cursor-pointer transition-all duration-300 ${selectedEventId === event.id ? "scale-125" : "hover:scale-110"
                            }`}
                        onMouseEnter={() => {
                            cancelClear();
                            setSelectedEvent(event.id);
                        }}
                        onMouseLeave={clearSelection}
                    >
                        <MapPin
                            className={`h-8 w-8 drop-shadow-md ${selectedEventId === event.id
                                ? "text-primary fill-primary"
                                : "text-white fill-black/50"
                                }`}
                        />
                    </div>
                </Marker>
            )),
        [selectedEventId, setSelectedEvent]
    );

    return (
        <div className="relative w-full h-full">
            <Map
                ref={mapRef}
                initialViewState={location ? {
                    longitude: location.coordinates[1],
                    latitude: location.coordinates[0],
                    zoom: 15,
                }: {
                    longitude: -74.006,
                    latitude: 40.7128,
                    zoom: 12,
                }}
                style={{ width: "100%", height: "100%" }}
                mapStyle="mapbox://styles/aaryan1524/cmksv988k005h01rw1doja9ot"
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                onClick={() => {
                    setSelectedEvent(null);
                }}
                attributionControl={false}
                logoPosition="top-right"
            >
                {pins}

                {/* User Location Marker */}
                {userLocation && (
                    <Marker longitude={userLocation.lng} latitude={userLocation.lat}>
                        <div className="relative flex h-6 w-6 items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white shadow-lg"></span>
                        </div>
                    </Marker>
                )}

                {selectedEvent && (
                    <Popup
                        longitude={selectedEvent.coordinates[1]}
                        latitude={selectedEvent.coordinates[0]}
                        anchor="bottom"
                        offset={25}
                        onClose={() => setSelectedEvent(null)}
                        closeButton={false}
                        className="custom-popup bg-transparent shadow-none border-none p-0"
                        maxWidth="320px"
                    >
                        {/* Mini Card Content */}
                        <div
                            className="w-[280px] bg-card/95 backdrop-blur-md border text-card-foreground shadow-lg rounded-xl overflow-hidden relative"
                            onMouseEnter={cancelClear}
                            onMouseLeave={clearSelection}
                        >
                            {/* Close Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2 z-10 hover:bg-black/20 text-white rounded-full h-6 w-6"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedEvent(null);
                                }}
                            >
                                <X className="h-3 w-3" />
                            </Button>

                            {/* Image Header */}
                            <div className="relative h-24">
                                <img src={selectedEvent.image} alt={selectedEvent.title} className="h-full w-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute bottom-2 left-3 text-white">
                                    <Badge className="mb-1 bg-primary/80 backdrop-blur-sm border-none text-[10px] h-5 px-1.5">{selectedEvent.type}</Badge>
                                    <h3 className="text-sm font-bold leading-tight line-clamp-1">{selectedEvent.title}</h3>
                                </div>
                            </div>

                            {/* Content Body */}
                            <div className="p-3 space-y-2">
                                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3 w-3" />
                                            <span>{selectedEvent.date}</span>
                                            <span className="mx-1">•</span>
                                            <Clock className="h-3 w-3" />
                                            <span>{selectedEvent.time}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-3 w-3" />
                                        <span className="line-clamp-1">{selectedEvent.location}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/50 mt-1">
                                    <div className="flex items-center gap-1.5">
                                        <img src={selectedEvent.host.avatar} alt={selectedEvent.host.name} className="h-5 w-5 rounded-full object-cover" />
                                        <span className="text-xs font-medium text-muted-foreground truncate max-w-[80px]">{selectedEvent.host.name}</span>
                                    </div>
                                    {!selectedEvent.isPrivate && (
                                        <Link href={`events/${selectedEvent.id}/chat`}>
                                            <MessageCircle className="h-4 w-4 text-muted-foreground"/>
                                        </Link>
                                    )}
                                    <Button className="h-6 text-[10px] px-3 font-semibold" asChild  >
                                        <Link href={`/events/${selectedEvent.id}`}>View</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Popup>
                )}
            </Map>

        </div>
    );
}
