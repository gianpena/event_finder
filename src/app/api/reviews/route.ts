import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";

// GET /api/reviews?hostName=xxx → all reviews for an organizer
export async function GET(req: NextRequest) {
    const hostName = req.nextUrl.searchParams.get("hostName");
    if (!hostName) {
        return NextResponse.json({ error: "hostName required" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("host_name", hostName)
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map snake_case DB columns → camelCase Review shape
    return NextResponse.json(
        data.map((r) => ({
            id: r.id,
            hostName: r.host_name,
            eventId: r.event_id,
            eventTitle: r.event_title,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.created_at,
        }))
    );
}

// POST /api/reviews { eventId, hostName, eventTitle, rating, comment }
export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, hostName, eventTitle, rating, comment } = await req.json();
    const userId = session.user.email;

    const { data, error } = await supabase
        .from("reviews")
        .insert({
            user_id: userId,
            event_id: eventId,
            host_name: hostName,
            event_title: eventTitle,
            rating,
            comment,
        })
        .select()
        .single();

    if (error) {
        // Unique constraint hit → already reviewed
        if (error.code === "23505") {
            return NextResponse.json({ error: "Already reviewed" }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
}
