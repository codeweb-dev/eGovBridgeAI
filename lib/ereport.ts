const EREPORT_BASE_URL = process.env.EREPORT_BASE_URL;
const EREPORT_ACCESS_CODE = process.env.EREPORT_ACCESS_CODE;

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5000) {
    return cachedToken.token;
  }

  const res = await fetch(`${EREPORT_BASE_URL}/api/integration/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_code: EREPORT_ACCESS_CODE }),
  });
  if (!res.ok) {
    throw new Error(`eReport token request failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  cachedToken = { token: data.access_token, expiresAt: new Date(data.expires_at).getTime() };
  return cachedToken.token;
}

async function ereportFetch(path: string, init: RequestInit = {}) {
  const token = await getToken();
  const res = await fetch(`${EREPORT_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`eReport request failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export interface EreportOption {
  id: string;
  name: string;
}

export async function getReportTypes(): Promise<(EreportOption & { code: string })[]> {
  const { data } = await ereportFetch("/api/integration/datasets/report_types");
  return data.map((d: { attributes: { code: string; name: string } }) => ({
    id: d.attributes.code,
    code: d.attributes.code,
    name: d.attributes.name,
  }));
}

export async function getRegions(): Promise<EreportOption[]> {
  const { data } = await ereportFetch("/api/integration/datasets/regions");
  return data.map((d: { id: string; attributes: { name: string } }) => ({
    id: d.id,
    name: d.attributes.name,
  }));
}

export async function getProvinces(regionCode: string): Promise<EreportOption[]> {
  const { data } = await ereportFetch(`/api/integration/datasets/provinces?region_code=${regionCode}`);
  return data.map((d: { id: string; attributes: { name: string } }) => ({
    id: d.id,
    name: d.attributes.name,
  }));
}

export async function getMunicipalities(provinceCode: string): Promise<EreportOption[]> {
  const { data } = await ereportFetch(`/api/integration/datasets/municipalities?province_code=${provinceCode}`);
  return data.map((d: { id: string; attributes: { name: string } }) => ({
    id: d.id,
    name: d.attributes.name,
  }));
}

export async function getBarangays(municipalityCode: string): Promise<EreportOption[]> {
  const { data } = await ereportFetch(`/api/integration/datasets/barangays?municipality_code=${municipalityCode}`);
  return data.map((d: { id: string; attributes: { name: string } }) => ({
    id: d.id,
    name: d.attributes.name,
  }));
}

export interface SubmitComplaintInput {
  mobile: string;
  first_name: string;
  last_name: string;
  gender: string;
  complainant_email: string;
  report_type: string;
  subject: string;
  message: string;
  region_code: string;
  province_code: string;
  municipality_code: string;
  barangay_code: string;
}

export async function submitComplaint(
  input: SubmitComplaintInput
): Promise<{ code: number; message: string; case_number: string }> {
  return ereportFetch("/api/integration/submit_complaint", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
