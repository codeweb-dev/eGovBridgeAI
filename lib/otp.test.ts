import assert from "node:assert";

process.env.AUTH_SECRET ??= "test-secret";
const { createOtpChallenge, verifyOtpChallenge } = await import("./otp.ts");

const { code, challenge } = createOtpChallenge("+639090000000");

assert.strictEqual(verifyOtpChallenge(challenge, "+639090000000", code), true, "correct code should verify");
assert.strictEqual(verifyOtpChallenge(challenge, "+639090000000", "000000"), false, "wrong code should fail");
assert.strictEqual(verifyOtpChallenge(challenge, "+639999999999", code), false, "wrong phone should fail");
assert.strictEqual(verifyOtpChallenge("garbage", "+639090000000", code), false, "malformed challenge should fail");

const expiredChallenge = challenge.replace(/\.\d+\./, ".1.");
assert.strictEqual(verifyOtpChallenge(expiredChallenge, "+639090000000", code), false, "tampered payload should fail");

console.log("otp.test.ts passed");
