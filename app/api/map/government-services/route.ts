import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import {
  buildGovernmentServicesQuery,
  parseGovernmentServices,
  type OverpassElement,
} from "@/lib/government-services";

const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

export async function GET(request: NextRequest) {
  if (!(await getSession())) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const raw = ["south", "west", "north", "east"].map((name) =>
    request.nextUrl.searchParams.get(name),
  );
  if (raw.some((value) => value === null)) {
    return Response.json({ error: "Missing map bounds" }, { status: 400 });
  }

  const [south, west, north, east] = raw.map(Number);
  if (
    ![south, west, north, east].every(Number.isFinite) ||
    south < 3 ||
    north > 22 ||
    west < 115 ||
    east > 128 ||
    south >= north ||
    west >= east ||
    north - south > 1.2 ||
    east - west > 1.5
  ) {
    return Response.json(
      { error: "Map bounds must cover a small Philippine viewport" },
      { status: 400 },
    );
  }

  const query = buildGovernmentServicesQuery({ south, west, north, east });
  for (const url of OVERPASS_URLS) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "eGovBridgeAI/1.0 government services map",
        },
        body: new URLSearchParams({ data: query }),
        cache: "no-store",
        signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok) continue;

      const data = (await response.json()) as {
        elements?: OverpassElement[];
      };
      return Response.json(parseGovernmentServices(data.elements ?? []), {
        headers: { "Cache-Control": "private, max-age=300" },
      });
    } catch {
      continue;
    }
  }

  return Response.json(
    { error: "Government services are temporarily unavailable" },
    { status: 503 },
  );
}
