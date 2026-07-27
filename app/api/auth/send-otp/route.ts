import { NextRequest, NextResponse } from "next/server";
import { createOtpChallenge } from "@/lib/otp";
import { sendSms } from "@/lib/emessage";

const PHONE_RE = /^\+[1-9]\d{7,14}$/;

export async function POST(req: NextRequest) {
  const { phone } = await req.json();

  if (typeof phone !== "string" || !PHONE_RE.test(phone)) {
    return NextResponse.json(
      { error: "Enter a valid mobile number in international format, e.g. +639090000000." },
      { status: 400 }
    );
  }

  const { code, challenge } = createOtpChallenge(phone);
  await sendSms(phone, `Your eGovBridgeAI verification code is ${code}. It expires in 5 minutes.`);

  return NextResponse.json({ challenge });
}
