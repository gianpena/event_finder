import { createClient } from "@supabase/supabase-js";
import { Event } from "@/lib/data";

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Maps a Supabase row → Event shape used throughout the app
export function dbToEvent(row: Record<string, unknown>): Event {
    return {
        id: row.id as string,
        title: row.title as string,
        type: row.type as Event["type"],
        date: row.date as string,
        time: row.time as string,
        startAt: row.start_at as string,
        location: row.location as string,
        image: row.image as string,
        vibe: row.vibe as string[],
        host: {
            name: row.host_name as string,
            avatar: row.host_avatar as string,
        },
        price: row.price as string,
        isPrivate: row.is_private as boolean,
        coordinates: [row.lat as number, row.lng as number],
    };
}

// Maps an Event shape → Supabase insert payload
export function eventToDb(event: Omit<Event, "id">) {
    return {
        title: event.title,
        type: event.type,
        date: event.date,
        time: event.time,
        start_at: event.startAt,
        location: event.location,
        image: event.image,
        vibe: event.vibe,
        host_name: event.host.name,
        host_avatar: event.host.avatar,
        price: event.price,
        is_private: event.isPrivate,
        lat: event.coordinates[0],
        lng: event.coordinates[1],
    };
}
