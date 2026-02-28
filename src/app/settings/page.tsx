"use client";

import { Navbar } from "@/components/features/Navbar";
import { Bell, Shield, Palette, HelpCircle } from "lucide-react";

const SETTINGS_SECTIONS = [
    {
        icon: Bell,
        label: "Notifications",
        description: "RSVP reminders, new events nearby",
    },
    {
        icon: Palette,
        label: "Appearance",
        description: "Theme, display preferences",
    },
    {
        icon: Shield,
        label: "Privacy & Security",
        description: "Account security, data settings",
    },
    {
        icon: HelpCircle,
        label: "Help & Feedback",
        description: "Report a bug, contact support",
    },
];

export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="sticky top-0 z-40 bg-gradient-to-b from-black/80 via-black/30 to-transparent pb-4">
                <Navbar variant="transparent" />
            </div>

            <main className="container mx-auto max-w-lg py-8 px-4 space-y-6">
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                {SETTINGS_SECTIONS.map(({ icon: Icon, label, description }) => (
                    <button
                        key={label}
                        className="w-full flex items-center gap-4 rounded-xl border bg-card p-4 text-left hover:bg-accent transition-colors"
                        disabled
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-medium">{label}</p>
                            <p className="text-sm text-muted-foreground">{description}</p>
                        </div>
                        <span className="ml-auto text-xs text-muted-foreground">Coming soon</span>
                    </button>
                ))}
            </main>
        </div>
    );
}
