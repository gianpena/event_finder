import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";

// GET /api/rsvps?userId=xxx → list of event IDs the user has RSVP'd to
export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
        return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("rsvps")
        .select("event_id")
        .eq("user_id", userId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data.map((r) => r.event_id));
}

// POST /api/rsvps { eventId, action: 'join' | 'leave' }
export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, action } = await req.json();
    const userId = session.user.email; // use email as stable user identifier

    if (action === "join") {
        const { error } = await supabase
            .from("rsvps")
            .upsert({ user_id: userId, event_id: eventId }, { onConflict: "user_id,event_id" });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, action: "joined" });
    }

    if (action === "leave") {
        const { error } = await supabase
            .from("rsvps")
            .delete()
            .eq("user_id", userId)
            .eq("event_id", eventId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, action: "left" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
