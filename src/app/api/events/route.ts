import { NextRequest, NextResponse } from "next/server";
import { supabase, dbToEvent, eventToDb } from "@/lib/supabase";
import { getServerSession } from "next-auth";

export async function GET() {
    const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_at", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data.map(dbToEvent));
}

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const payload = eventToDb(body);

    const { data, error } = await supabase
        .from("events")
        .insert(payload)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(dbToEvent(data), { status: 201 });
}
