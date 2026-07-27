const EMESSAGE_BASE_URL = process.env.EMESSAGE_BASE_URL;
const EMESSAGE_API_TOKEN = process.env.EMESSAGE_API_TOKEN;

export async function sendSms(number: string, message: string) {
  const res = await fetch(`${EMESSAGE_BASE_URL}/messaging/v1/sms/push`, {
    method: "POST",
    headers: {
      "X-EMESSAGE-Auth": EMESSAGE_API_TOKEN!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ number, message }),
  });

  if (!res.ok) {
    throw new Error(`eMessage send failed: ${res.status} ${await res.text()}`);
  }
}
