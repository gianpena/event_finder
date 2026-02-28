import { NextResponse } from "next/server";
import { supabase, eventToDb } from "@/lib/supabase";
import { MOCK_EVENTS } from "@/lib/data";

// POST /api/seed — seeds the mock events if the table is empty.
// Safe to call multiple times (idempotent).
export async function POST() {
    // Check if any events exist already
    const { count } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true });

    if ((count ?? 0) > 0) {
        return NextResponse.json({ message: "Already seeded", count });
    }

    const rows = MOCK_EVENTS.map(({ id: _id, ...rest }) => eventToDb(rest));

    const { error } = await supabase.from("events").insert(rows);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, inserted: rows.length });
}
