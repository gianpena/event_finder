import { Skeleton } from "@/components/ui/skeleton";

export function EventCardSkeleton() {
    return (
        <div className="overflow-hidden">
            {/* Image */}
            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
            <div className="pt-3 space-y-2">
                {/* Date + time */}
                <Skeleton className="h-3 w-28 rounded" />
                {/* Title */}
                <Skeleton className="h-4 w-3/4 rounded" />
                {/* Location */}
                <Skeleton className="h-3 w-1/2 rounded" />
                {/* Host row */}
                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-3 w-20 rounded" />
                    </div>
                    <Skeleton className="h-7 w-14 rounded-md" />
                </div>
            </div>
        </div>
    );
}
