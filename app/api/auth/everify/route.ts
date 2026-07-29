import { setSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { verifyWithEVerify, type EVerifyInput } from "@/lib/everify";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const BIRTH_DATE = /^\d{4}-\d{2}-\d{2}$/;

function validName(value: string, required: boolean) {
  return (
    value.length <= 100 &&
    (!required || value.trim().length > 0)
  );
}

function validBirthDate(value: string) {
  if (!BIRTH_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value &&
    date <= new Date()
  );
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const firstName =
    typeof body.firstName === "string" ? body.firstName.trim() : "";
  const middleName =
    typeof body.middleName === "string" ? body.middleName.trim() : "";
  const lastName =
    typeof body.lastName === "string" ? body.lastName.trim() : "";
  const suffix = typeof body.suffix === "string" ? body.suffix.trim() : "";
  const birthDate = typeof body.birthDate === "string" ? body.birthDate : "";
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";

  if (
    !validName(firstName, true) ||
    !validName(middleName, false) ||
    !validName(lastName, true) ||
    !validName(suffix, false) ||
    !validBirthDate(birthDate) ||
    !UUID.test(sessionId)
  ) {
    return Response.json(
      { error: "Enter valid identity details and complete the face check." },
      { status: 400 },
    );
  }

  try {
    const profile = await verifyWithEVerify({
      firstName,
      middleName,
      lastName,
      suffix,
      birthDate,
      sessionId,
    } satisfies EVerifyInput);
    const userProfile: Record<string, string> = {
      phone: profile.phone,
      full_name: profile.fullName,
      role: "user",
    };
    if (profile.email) userProfile.email = profile.email;
    if (profile.gender) userProfile.gender = profile.gender;

    const supabase = getSupabaseAdmin();
    const { data: existingUser, error: lookupError } = await supabase
      .from("users")
      .select("role")
      .eq("phone", profile.phone)
      .maybeSingle();
    if (lookupError) throw new Error("Could not check the user account.");
    if (existingUser?.role === "admin") {
      return Response.json(
        { error: "Admin accounts must use the admin login." },
        { status: 403 },
      );
    }

    const { data: user, error } = await supabase
      .from("users")
      .upsert(userProfile, { onConflict: "phone" })
      .select("id")
      .single();
    if (error || !user) throw new Error("Could not save the verified profile.");

    await setSession(user.id);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Identity verification failed.",
      },
      { status: 502 },
    );
  }
}
