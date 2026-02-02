"use client";

import { cn } from "@/lib/utils";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { CATEGORIES } from "@/lib/data";
import { useEventStore } from "@/lib/store";

interface FilterBarProps {
    className?: string;
    variant?: "default" | "transparent";
}

export function FilterBar({ className, variant = "default" }: FilterBarProps) {
    const { filter, setFilter } = useEventStore();
    const isTransparent = variant === "transparent";

    return (
        <div className={cn("w-full overflow-x-auto pb-4 pt-4 no-scrollbar", className)}>
            <div className="flex space-x-2 px-6 md:px-8 ">
                {CATEGORIES.map((category) => (
                    <div
                        key={category}
                        onClick={() => setFilter(category)}
                        className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                    >
                        <LiquidGlass className={cn(
                            "rounded-full px-5 py-2",
                            // Active State Highlight
                            filter === category && "bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                        )}>
                            <span className={cn(
                                "text-sm font-medium whitespace-nowrap",
                                filter === category ? "text-white font-bold" : "text-white/80"
                            )}>
                                {category}
                            </span>
                        </LiquidGlass>
                    </div>
                ))}
            </div>
        </div>
    );
}
