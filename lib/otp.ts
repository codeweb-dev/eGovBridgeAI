import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

const SECRET = process.env.AUTH_SECRET!;
const TTL_MS = 5 * 60 * 1000;

function sign(payload: string) {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

// Stateless OTP "challenge": the code's hash + expiry travel with the client,
// signed so they can't be tampered with. No server-side storage needed.
export function createOtpChallenge(phone: string) {
  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const codeHash = createHmac("sha256", SECRET).update(code).digest("base64url");
  const expiresAt = Date.now() + TTL_MS;
  const payload = `${phone}.${codeHash}.${expiresAt}`;
  const challenge = `${payload}.${sign(payload)}`;
  return { code, challenge };
}

export function verifyOtpChallenge(challenge: string, phone: string, code: string): boolean {
  const parts = challenge.split(".");
  if (parts.length !== 4) return false;
  const [challengePhone, codeHash, expiresAt, signature] = parts;

  const payload = `${challengePhone}.${codeHash}.${expiresAt}`;
  const expectedSignature = sign(payload);
  if (
    signature.length !== expectedSignature.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    return false;
  }

  if (challengePhone !== phone) return false;
  if (Date.now() > Number(expiresAt)) return false;

  const expectedCodeHash = createHmac("sha256", SECRET).update(code).digest("base64url");
  return (
    codeHash.length === expectedCodeHash.length &&
    timingSafeEqual(Buffer.from(codeHash), Buffer.from(expectedCodeHash))
  );
}
