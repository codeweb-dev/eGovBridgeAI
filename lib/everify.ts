export interface EVerifyInput {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  birthDate: string;
  sessionId: string;
}

export interface EVerifyProfile {
  phone: string;
  fullName: string;
  email: string | null;
  gender: "Male" | "Female" | null;
}

export function normalizePhilippinePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (/^63\d{10}$/.test(digits)) return `+${digits}`;
  if (/^09\d{9}$/.test(digits)) return `+63${digits.slice(1)}`;
  if (/^9\d{9}$/.test(digits)) return `+63${digits}`;
  return null;
}

export function parseEVerifyProfile(payload: unknown): EVerifyProfile | null {
  const response = payload as {
    data?: Record<string, unknown>;
    meta?: { result_grade?: unknown };
  };
  const data = response?.data;
  if (!data || Number(response.meta?.result_grade) !== 1) return null;

  const phone = normalizePhilippinePhone(String(data.mobile_number ?? ""));
  const fullName = String(data.full_name ?? "").trim();
  if (!phone || !fullName) return null;

  const rawEmail = String(data.email ?? "").trim().toLowerCase();
  const email =
    rawEmail !== "n/a" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)
      ? rawEmail
      : null;
  const rawGender = String(data.gender ?? "").toLowerCase();
  const gender =
    rawGender === "male"
      ? "Male"
      : rawGender === "female"
        ? "Female"
        : null;

  return { phone, fullName, email, gender };
}

export async function verifyWithEVerify(input: EVerifyInput) {
  const baseUrl = process.env.EVERIFY_BASE_URL?.replace(/\/+$/, "");
  const clientId = process.env.EVERIFY_CLIENT_ID;
  const clientSecret = process.env.EVERIFY_CLIENT_SECRET;
  if (!baseUrl || !clientId || !clientSecret) {
    throw new Error("eVerify is not configured.");
  }

  const authResponse = await fetch(`${baseUrl}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  if (!authResponse.ok) {
    throw new Error("eVerify authentication is unavailable.");
  }

  const auth = (await authResponse.json()) as {
    data?: { access_token?: unknown };
  };
  const accessToken = auth.data?.access_token;
  if (typeof accessToken !== "string" || !accessToken) {
    throw new Error("eVerify returned an invalid access token.");
  }

  const verifyResponse = await fetch(`${baseUrl}/api/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      first_name: input.firstName,
      middle_name: input.middleName || undefined,
      last_name: input.lastName,
      suffix: input.suffix || undefined,
      birth_date: input.birthDate,
      face_liveness_session_id: input.sessionId,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });
  if (!verifyResponse.ok) {
    throw new Error("Your identity could not be verified.");
  }

  const profile = parseEVerifyProfile(await verifyResponse.json());
  if (!profile) throw new Error("Your identity could not be verified.");
  return profile;
}
