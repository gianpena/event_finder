"use client";

import { Navbar } from "@/components/features/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, Event } from "@/lib/data";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import { useSession } from "next-auth/react";
import { SignInModal } from "@/components/features/SignInModal";
import { useEventStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { format, parseISO, isToday } from "date-fns";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop";
const FIU_COORDS: [number, number] = [25.7559, -80.3773];

export default function CreateEventPage() {
    const { data: session, status } = useSession();
    const { addEvent } = useEventStore();
    const router = useRouter();

    const [showSignIn, setShowSignIn] = useState(false);
    const [selectedType, setSelectedType] = useState<Event["type"]>("Party");
    const [isPublishing, setIsPublishing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Form fields
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [vibes, setVibes] = useState("");
    const [price, setPrice] = useState("Free");
    const [isPrivate, setIsPrivate] = useState(false);
    const [imageUrl, setImageUrl] = useState("");

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
                        <h2 className="text-xl font-semibold">Sign in to post an event</h2>
                        <p className="text-sm text-muted-foreground">Create an account to share events with the VibeCheck community.</p>
                    </div>
                    <Button onClick={() => setShowSignIn(true)}>Sign In</Button>
                </div>
                <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} message="Sign in to create an event" />
            </div>
        );
    }

    function validate() {
        const errs: Record<string, string> = {};
        if (!title.trim()) errs.title = "Event title is required.";
        if (!date) errs.date = "Date is required.";
        if (!time) errs.time = "Time is required.";
        if (!location.trim()) errs.location = "Location is required.";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;

        setIsPublishing(true);

        const startAt = new Date(`${date}T${time}`).toISOString();
        const parsedDate = parseISO(startAt);
        const displayDate = isToday(parsedDate) ? "Today" : format(parsedDate, "EEE, MMM d");
        const displayTime = format(parsedDate, "h:mm a");

        const vibeArray = vibes
            .split(",")
            .map(v => v.trim())
            .filter(Boolean)
            .map(v => (v.startsWith("#") ? v : `#${v}`));

        const newEvent: Event = {
            id: crypto.randomUUID(),
            title: title.trim(),
            type: selectedType,
            date: displayDate,
            time: displayTime,
            startAt,
            location: location.trim(),
            image: imageUrl.trim() || FALLBACK_IMAGE,
            vibe: vibeArray.length > 0 ? vibeArray : [`#${selectedType}`],
            host: {
                name: session?.user?.name ?? "Anonymous",
                avatar: session?.user?.image ?? `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60`,
            },
            price: price.trim() || "Free",
            isPrivate,
            coordinates: FIU_COORDS,
        };

        const created = await addEvent(newEvent);
        setIsPublishing(false);
        if (created) router.push("/");
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="sticky top-0 z-40 bg-gradient-to-b from-black/80 via-black/30 to-transparent pb-4">
                <Navbar variant="transparent" />
            </div>

            <main className="container mx-auto max-w-lg py-8 space-y-8 px-4 sm:px-0">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Post an Event</h1>
                    <p className="text-muted-foreground">Share your vibe with the community.</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">

                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Event Title</label>
                            <Input
                                placeholder="e.g. Midnight Jazz & Cocktails"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                        </div>

                        {/* Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">The Vibe (Type)</label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.filter(c => c !== "All").map(cat => (
                                    <div
                                        key={cat}
                                        onClick={() => setSelectedType(cat as Event["type"])}
                                        className={cn(
                                            "cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-accent",
                                            selectedType === cat
                                                ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                                                : "bg-card text-card-foreground"
                                        )}
                                    >
                                        {cat}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Date + Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Date</label>
                                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                                {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Time</label>
                                <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
                                {errors.time && <p className="text-xs text-destructive">{errors.time}</p>}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Location</label>
                            <Input
                                placeholder="e.g. Graham Center Ballroom, FIU"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                            />
                            {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
                        </div>

                        {/* Vibes */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Vibe Tags <span className="text-muted-foreground font-normal">(comma-separated)</span></label>
                            <Input
                                placeholder="LateNight, Chill, DJ, College"
                                value={vibes}
                                onChange={e => setVibes(e.target.value)}
                            />
                        </div>

                        {/* Price + Private */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Price</label>
                                <Input
                                    placeholder="Free, $10, $$"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Visibility</label>
                                <div
                                    onClick={() => setIsPrivate(p => !p)}
                                    className={cn(
                                        "flex h-10 cursor-pointer items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors",
                                        isPrivate
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-card text-card-foreground hover:bg-accent"
                                    )}
                                >
                                    {isPrivate ? "Private" : "Public"}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Description & Atmosphere</label>
                            <Textarea
                                placeholder="Describe what attendees can expect..."
                                className="min-h-[100px] resize-none"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>

                        {/* Image URL */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Cover Image URL <span className="text-muted-foreground font-normal">(optional)</span></label>
                            <Input
                                placeholder="https://..."
                                value={imageUrl}
                                onChange={e => setImageUrl(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button size="lg" className="w-full" type="submit" disabled={isPublishing}>
                            {isPublishing ? "Publishing…" : "Publish Event"}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    );
}
