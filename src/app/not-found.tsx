import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <MapPin className="h-9 w-9 text-muted-foreground" />
            </div>
            <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">VibeCheck</p>
                <h1 className="text-4xl font-bold tracking-tight">404</h1>
                <p className="text-lg text-muted-foreground">This spot doesn&apos;t exist on the map.</p>
            </div>
            <Button asChild>
                <Link href="/">Back to Events</Link>
            </Button>
        </div>
    );
}
