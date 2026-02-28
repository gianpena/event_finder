"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/features/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Profile } from "@/lib/supabase";
import { MapPin, Instagram, Twitter, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = use(params);
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFoundState, setNotFoundState] = useState(false);

    useEffect(() => {
        const decoded = decodeURIComponent(userId);
        fetch(`/api/profile?userId=${encodeURIComponent(decoded)}`)
            .then(r => {
                if (r.status === 404) { setNotFoundState(true); return null; }
                return r.json();
            })
            .then(data => {
                if (data) setProfile(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [userId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="sticky top-0 z-40 bg-gradient-to-b from-black/80 via-black/30 to-transparent pb-4">
                    <Navbar variant="transparent" />
                </div>
                <div className="container mx-auto max-w-2xl py-8 px-4 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="h-20 w-20 rounded-full bg-muted animate-pulse" />
                        <div className="space-y-2">
                            <div className="h-6 w-40 bg-muted rounded animate-pulse" />
                            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (notFoundState || !profile) notFound();

    const displayName = profile!.displayName ?? "VibeCheck User";
    const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="sticky top-0 z-40 bg-gradient-to-b from-black/80 via-black/30 to-transparent pb-4">
                <Navbar variant="transparent" />
            </div>

            <main className="container mx-auto max-w-2xl py-8 space-y-6 px-4 sm:px-0">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 -ml-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                </Button>

                {/* Avatar + name */}
                <div className="flex items-start gap-5">
                    <Avatar className="h-24 w-24 shrink-0">
                        <AvatarImage src={profile!.avatarUrl ?? ""} />
                        <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2 min-w-0">
                        <h1 className="text-2xl font-bold">{displayName}</h1>

                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            {profile!.location && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />{profile!.location}
                                </span>
                            )}
                        </div>

                        {/* Social links */}
                        <div className="flex flex-wrap gap-2 pt-1">
                            {profile!.instagram && (
                                <a
                                    href={`https://instagram.com/${profile!.instagram}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm hover:bg-accent transition-colors"
                                >
                                    <Instagram className="h-3.5 w-3.5" />
                                    @{profile!.instagram}
                                </a>
                            )}
                            {profile!.twitter && (
                                <a
                                    href={`https://twitter.com/${profile!.twitter}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm hover:bg-accent transition-colors"
                                >
                                    <Twitter className="h-3.5 w-3.5" />
                                    @{profile!.twitter}
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bio */}
                {profile!.bio && (
                    <section className="space-y-2">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">About</h2>
                        <p className="text-sm leading-relaxed">{profile!.bio}</p>
                    </section>
                )}

                {/* Empty state */}
                {!profile!.bio && !profile!.location && !profile!.instagram && !profile!.twitter && (
                    <p className="text-sm text-muted-foreground">This user hasn&apos;t filled out their profile yet.</p>
                )}
            </main>
        </div>
    );
}
