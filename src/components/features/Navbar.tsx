"use client";

import Link from "next/link";
import { Search, User, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarConnectButton } from "@/components/features/CalendarConnectButton";
import { cn } from "@/lib/utils";

interface NavbarProps {
    variant?: "default" | "transparent";
}

export function Navbar({ variant = "default" }: NavbarProps) {
    const isTransparent = variant === "transparent";

    return (
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
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/profile">
                            <User className="h-5 w-5" />
                            <span className="sr-only">Profile</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </nav>
    );
}
