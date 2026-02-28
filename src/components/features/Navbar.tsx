"use client";

import Link from "next/link";
import { Search, User, CalendarPlus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarConnectButton } from "@/components/features/CalendarConnectButton";
import { SignInModal } from "@/components/features/SignInModal";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

interface NavbarProps {
    variant?: "default" | "transparent";
}

export function Navbar({ variant = "default" }: NavbarProps) {
    const isTransparent = variant === "transparent";
    const { data: session, status } = useSession();
    const [showSignIn, setShowSignIn] = useState(false);

    return (
        <>
            <nav className={cn(
                "w-full z-50 transition-all duration-300 ease-in-out",
                isTransparent
                    ? "bg-transparent border-none pt-4"
                    : "sticky top-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            )}>
                <div className="w-full px-6 md:px-8 flex h-14 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="mr-6 flex items-center space-x-2">
                            <span className="text-xl font-bold tracking-tight">VibeCheck</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <CalendarConnectButton />
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/search">
                                <Search className="h-5 w-5" />
                                <span className="sr-only">Search</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/create">
                                <CalendarPlus className="h-5 w-5" />
                                <span className="sr-only">Create Event</span>
                            </Link>
                        </Button>

                        {status === "loading" ? (
                            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                        ) : session?.user ? (
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href="/profile">
                                        {session.user.image ? (
                                            <img
                                                src={session.user.image}
                                                alt={session.user.name ?? "Profile"}
                                                className="h-7 w-7 rounded-full object-cover"
                                            />
                                        ) : (
                                            <User className="h-5 w-5" />
                                        )}
                                        <span className="sr-only">Profile</span>
                                    </Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    aria-label="Sign out"
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowSignIn(true)}
                            >
                                Sign In
                            </Button>
                        )}
                    </div>
                </div>
            </nav>

            <SignInModal
                open={showSignIn}
                onClose={() => setShowSignIn(false)}
                message="Welcome to VibeCheck"
            />
        </>
    );
}
