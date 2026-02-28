"use client";

import { Navbar } from "@/components/features/Navbar";
import { useEventStore } from "@/lib/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SignInModal } from "@/components/features/SignInModal";
import Link from "next/link";
import { Profile } from "@/lib/supabase";
import { CalendarEvent } from "@/lib/calendar";
import {
    Calendar, Lock, Ticket, Settings, Pencil, X,
    Check, MapPin, Instagram, Twitter, Link2, Loader2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";

function formatCalendarEventTime(event: CalendarEvent): string {
    try {
        return format(parseISO(event.start.dateTime), "EEE, MMM d · h:mm a");
    } catch {
        return event.start.dateTime;
    }
}

export default function ProfilePage() {
    const { myRsvps, isCalendarConnected, calendarEvents, events, syncRsvps } = useEventStore();
    const { data: session, status } = useSession();
    const [showSignIn, setShowSignIn] = useState(false);

    // Profile data
    const [profile, setProfile] = useState<Profile | null>(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Edit form state
    const [editName, setEditName] = useState("");
    const [editBio, setEditBio] = useState("");
    const [editLocation, setEditLocation] = useState("");
    const [editInstagram, setEditInstagram] = useState("");
    const [editTwitter, setEditTwitter] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const rsvpEvents = events.filter((e) => myRsvps.includes(e.id));

    useEffect(() => {
        if (session?.user?.email) syncRsvps(session.user.email);
    }, [session?.user?.email]);

    // Fetch profile on load
    useEffect(() => {
        if (!session?.user?.email) return;
        fetch(`/api/profile?userId=${encodeURIComponent(session.user.email)}`)
            .then(r => r.ok ? r.json() : null)
            .then(setProfile)
            .catch(() => {});
    }, [session?.user?.email]);

    const now = new Date();
    const upcomingCalendarEvents = calendarEvents
        .filter(e => { try { return parseISO(e.start.dateTime) >= now; } catch { return false; } })
        .sort((a, b) => parseISO(a.start.dateTime).getTime() - parseISO(b.start.dateTime).getTime())
        .slice(0, 3);

    function openEdit() {
        setEditName(profile?.displayName ?? session?.user?.name ?? "");
        setEditBio(profile?.bio ?? "");
        setEditLocation(profile?.location ?? "");
        setEditInstagram(profile?.instagram ?? "");
        setEditTwitter(profile?.twitter ?? "");
        setAvatarPreview(null);
        setEditing(true);
    }

    async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarPreview(URL.createObjectURL(file));
        setUploadingAvatar(true);
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/profile/avatar", { method: "POST", body: fd });
        if (res.ok) {
            const { avatarUrl } = await res.json();
            setProfile(prev => prev ? { ...prev, avatarUrl } : { userId: session!.user!.email!, displayName: null, bio: null, location: null, avatarUrl, instagram: null, twitter: null });
        }
        setUploadingAvatar(false);
    }

    async function handleSave() {
        setSaving(true);
        const res = await fetch("/api/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                displayName: editName.trim() || null,
                bio: editBio.trim() || null,
                location: editLocation.trim() || null,
                instagram: editInstagram.trim() || null,
                twitter: editTwitter.trim() || null,
            }),
        });
        if (res.ok) {
            const updated: Profile = await res.json();
            setProfile(updated);
        }
        setSaving(false);
        setEditing(false);
    }

    async function handleCopyLink() {
        if (!session?.user?.email) return;
        const url = `${window.location.origin}/profile/${encodeURIComponent(session.user.email)}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

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

    const displayName = profile?.displayName ?? session?.user?.name ?? "Guest";
    const avatarSrc = avatarPreview ?? profile?.avatarUrl ?? session?.user?.image ?? "";
    const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="sticky top-0 z-40 bg-gradient-to-b from-black/80 via-black/30 to-transparent pb-4">
                <Navbar variant="transparent" />
            </div>

            <main className="container mx-auto max-w-2xl py-8 space-y-8 px-4 sm:px-0">

                {/* ── Profile header ── */}
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        {/* Avatar with upload overlay */}
                        <div className="relative shrink-0 group">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={avatarSrc} />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            {editing && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    {uploadingAvatar
                                        ? <Loader2 className="h-5 w-5 text-white animate-spin" />
                                        : <Pencil className="h-5 w-5 text-white" />
                                    }
                                </button>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </div>

                        <div className="flex-1 min-w-0">
                            {editing ? (
                                <Input
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    placeholder="Display name"
                                    className="text-xl font-bold h-auto py-1 px-2 mb-1"
                                />
                            ) : (
                                <h1 className="text-2xl font-bold truncate">{displayName}</h1>
                            )}
                            <p className="text-muted-foreground text-sm truncate">{session?.user?.email}</p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                            {!editing && (
                                <>
                                    <Button variant="ghost" size="icon" onClick={handleCopyLink} title="Copy profile link">
                                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={openEdit}>
                                        <Pencil className="h-4 w-4" />
                                        <span className="sr-only">Edit profile</span>
                                    </Button>
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href="/settings">
                                            <Settings className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                </>
                            )}
                            {editing && (
                                <>
                                    <Button size="sm" onClick={handleSave} disabled={saving}>
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Bio & location */}
                    {editing ? (
                        <div className="space-y-3">
                            <Textarea
                                value={editBio}
                                onChange={e => setEditBio(e.target.value)}
                                placeholder="Write a short bio…"
                                rows={3}
                                className="resize-none text-sm"
                            />
                            <Input
                                value={editLocation}
                                onChange={e => setEditLocation(e.target.value)}
                                placeholder="City, e.g. Miami, FL"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <Instagram className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={editInstagram}
                                        onChange={e => setEditInstagram(e.target.value)}
                                        placeholder="instagram_handle"
                                        className="pl-9"
                                    />
                                </div>
                                <div className="relative">
                                    <Twitter className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={editTwitter}
                                        onChange={e => setEditTwitter(e.target.value)}
                                        placeholder="twitter_handle"
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {profile?.bio && (
                                <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
                            )}
                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                {profile?.location && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5" />{profile.location}
                                    </span>
                                )}
                                {profile?.instagram && (
                                    <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1 hover:text-foreground transition-colors">
                                        <Instagram className="h-3.5 w-3.5" />@{profile.instagram}
                                    </a>
                                )}
                                {profile?.twitter && (
                                    <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1 hover:text-foreground transition-colors">
                                        <Twitter className="h-3.5 w-3.5" />@{profile.twitter}
                                    </a>
                                )}
                            </div>
                            {!profile?.bio && !profile?.location && !profile?.instagram && !profile?.twitter && (
                                <button onClick={openEdit} className="text-sm text-primary underline underline-offset-2">
                                    Add a bio and socials
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Calendar section ── */}
                {isCalendarConnected && upcomingCalendarEvents.length > 0 && (
                    <section className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold">Your Calendar</h2>
                        </div>
                        <div className="grid gap-3">
                            {upcomingCalendarEvents.map((event) => (
                                <div key={event.id} className="flex items-start gap-4 rounded-lg border p-4 bg-card">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                                        <Calendar className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium leading-tight truncate">{event.summary}</p>
                                        <p className="mt-0.5 text-sm text-muted-foreground">{formatCalendarEventTime(event)}</p>
                                        {event.location && (
                                            <p className="mt-0.5 text-xs text-muted-foreground truncate">{event.location}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── RSVPs section ── */}
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
                                <Link key={event.id} href={`/events/${event.id}`}>
                                    <div className="flex items-center gap-4 rounded-lg border p-4 bg-card hover:bg-accent transition-colors">
                                        <img src={event.image} alt={event.title} className="h-16 w-16 rounded-md object-cover" />
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{event.title}</h3>
                                            <p className="text-sm text-muted-foreground">{event.date} &bull; {event.time}</p>
                                        </div>
                                        <Badge variant={event.isPrivate ? "secondary" : "default"}>
                                            {event.isPrivate ? "Pending" : "Confirmed"}
                                        </Badge>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
