import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { supabase, dbToProfile } from "@/lib/supabase";

// GET /api/profile?userId=xxx — public
export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
        return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

    if (error || !data) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(dbToProfile(data));
}

// PUT /api/profile — update own profile (authenticated)
export async function PUT(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { displayName, bio, location, instagram, twitter } = await req.json();

    const { data, error } = await supabase
        .from("profiles")
        .upsert({
            user_id: session.user.email,
            display_name: displayName ?? null,
            bio: bio ?? null,
            location: location ?? null,
            instagram: instagram ?? null,
            twitter: twitter ?? null,
            updated_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(dbToProfile(data));
}
