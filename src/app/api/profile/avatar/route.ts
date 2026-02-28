import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { supabase } from "@/lib/supabase";

// POST /api/profile/avatar — upload profile picture
export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    // Encode email to make a safe storage path
    const safeId = encodeURIComponent(session.user.email);
    const path = `${safeId}/avatar.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, buffer, {
            contentType: file.type,
            upsert: true,
        });

    if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

    const avatarUrl = urlData.publicUrl;

    // Persist the new avatar URL on the profile row
    await supabase
        .from("profiles")
        .upsert({
            user_id: session.user.email,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
        });

    return NextResponse.json({ avatarUrl });
}
