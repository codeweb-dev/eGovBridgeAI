import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { ADMIN_EMAIL } from "@/lib/admin";
import { setSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const attempts = new Map<string, { count: number; resetAt: number }>();

// ponytail: per-process limiter; use a shared store when the app runs on multiple servers.
function isRateLimited(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return false;
  }
  current.count += 1;
  return current.count > 5;
}

export async function POST(req: NextRequest) {
  const key = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (isRateLimited(key)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in 15 minutes." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  if (
    !body ||
    typeof body.email !== "string" ||
    typeof body.password !== "string" ||
    !body.password ||
    body.password.length > 128
  ) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: admin } = await supabase
    .from("users")
    .select("id, password_hash")
    .eq("email", ADMIN_EMAIL)
    .eq("role", "admin")
    .single();

  const valid =
    body.email.trim().toLowerCase() === ADMIN_EMAIL &&
    admin?.password_hash &&
    (await compare(body.password, admin.password_hash));

  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  attempts.delete(key);
  await setSession(admin.id);
  return NextResponse.json({ ok: true });
}
