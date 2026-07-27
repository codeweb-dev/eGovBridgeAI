import { NextRequest, NextResponse } from "next/server";
import { verifyOtpChallenge } from "@/lib/otp";
import { setSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const { phone, code, challenge } = await req.json();

  if (typeof phone !== "string" || typeof code !== "string" || typeof challenge !== "string") {
    return NextResponse.json({ error: "Missing phone, code, or challenge." }, { status: 400 });
  }

  if (!verifyOtpChallenge(challenge, phone, code)) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  }

  const { data: user, error } = await getSupabaseAdmin()
    .from("users")
    .upsert({ phone }, { onConflict: "phone" })
    .select("id")
    .single();

  if (error || !user) {
    return NextResponse.json({ error: "Could not create user record." }, { status: 500 });
  }

  await setSession(user.id);

  return NextResponse.json({ ok: true });
}
