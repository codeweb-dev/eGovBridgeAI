import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const SECRET = process.env.AUTH_SECRET!;
const COOKIE_NAME = "session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function sign(userId: string) {
  return createHmac("sha256", SECRET).update(userId).digest("base64url");
}

export async function setSession(userId: string) {
  const value = `${userId}.${sign(userId)}`;
  (await cookies()).set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getSession(): Promise<string | null> {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!value) return null;

  const [userId, signature] = value.split(".");
  if (!userId || !signature) return null;

  const expected = sign(userId);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  return userId;
}

export async function clearSession() {
  (await cookies()).delete(COOKIE_NAME);
}
