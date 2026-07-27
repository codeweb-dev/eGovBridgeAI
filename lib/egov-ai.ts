const EGOV_AI_BASE_URL = process.env.EGOV_AI_BASE_URL;
const EGOV_AI_ACCESS_CODE = process.env.EGOV_AI_ACCESS_CODE;
const CATEGORY = "PH";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5000) {
    return cachedToken.token;
  }

  const res = await fetch(`${EGOV_AI_BASE_URL}/api/v1/egov/integration/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_code: EGOV_AI_ACCESS_CODE }),
  });
  if (!res.ok) {
    throw new Error(`eGov AI token request failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in_seconds * 1000,
  };
  return cachedToken.token;
}

export async function askAssistant(prompt: string): Promise<string> {
  const token = await getToken();
  const res = await fetch(`${EGOV_AI_BASE_URL}/api/v1/egov/integration/ai_assistant/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, category: CATEGORY }),
  });
  if (!res.ok) {
    throw new Error(`eGov AI assistant request failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.data;
}
