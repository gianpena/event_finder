"use client";

import { Navbar } from "@/components/features/Navbar";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import { EventCard } from "@/components/features/EventCard";
import { CATEGORIES } from "@/lib/data";
import { useEventStore } from "@/lib/store";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { parseISO, isToday, isWeekend } from "date-fns";

const DATE_FILTERS = [
    { label: "All Dates", value: "all" },
    { label: "Today", value: "today" },
    { label: "This Weekend", value: "weekend" },
] as const;

type DateFilter = typeof DATE_FILTERS[number]["value"];

export default function SearchPage() {
    const { events } = useEventStore();
    const [query, setQuery] = useState("");
    const [selectedType, setSelectedType] = useState("All");
    const [dateFilter, setDateFilter] = useState<DateFilter>("all");

    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            const textMatch =
                !query ||
                e.title.toLowerCase().includes(query.toLowerCase()) ||
                e.type.toLowerCase().includes(query.toLowerCase()) ||
                e.location.toLowerCase().includes(query.toLowerCase()) ||
                e.vibe.some(v => v.toLowerCase().includes(query.toLowerCase()));

            const typeMatch = selectedType === "All" || e.type === selectedType;

            let dateMatch = true;
            if (dateFilter !== "all") {
                try {
                    const d = parseISO(e.startAt);
                    if (dateFilter === "today") dateMatch = isToday(d);
                    if (dateFilter === "weekend") dateMatch = isWeekend(d);
                } catch {
                    dateMatch = false;
                }
            }

            return textMatch && typeMatch && dateMatch;
        });
    }, [query, selectedType, dateFilter]);

    const hasActiveFilter = query || selectedType !== "All" || dateFilter !== "all";

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="sticky top-0 z-40 bg-gradient-to-b from-black/80 via-black/30 to-transparent pb-4">
                <Navbar variant="transparent" />
            </div>

            <main className="container mx-auto px-4 py-6 space-y-5">
                {/* Search input */}
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search events, vibes, locations…"
                        className="pl-10 h-12 text-base"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* Type pills */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedType(cat)}
                            className={cn(
                                "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                                selectedType === cat
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-card text-card-foreground hover:bg-accent"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Date pills */}
                <div className="flex gap-2">
                    {DATE_FILTERS.map(df => (
                        <button
                            key={df.value}
                            onClick={() => setDateFilter(df.value)}
                            className={cn(
                                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                                dateFilter === df.value
                                    ? "bg-secondary text-secondary-foreground border-secondary"
                                    : "bg-card text-card-foreground hover:bg-accent"
                            )}
                        >
                            {df.label}
                        </button>
                    ))}
                </div>

                {/* Results */}
                <section>
                    <h2 className="text-base font-semibold mb-4 text-muted-foreground">
                        {hasActiveFilter
                            ? `${filteredEvents.length} result${filteredEvents.length !== 1 ? "s" : ""}`
                            : "Browse All Events"}
                    </h2>

                    {filteredEvents.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredEvents.map(event => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                            <p className="text-muted-foreground">No events match your filters.</p>
                            <button
                                onClick={() => { setQuery(""); setSelectedType("All"); setDateFilter("all"); }}
                                className="text-sm text-primary underline underline-offset-2"
                            >
                                Clear filters
                            </button>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
