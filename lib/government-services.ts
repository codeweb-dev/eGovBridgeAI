export const GOVERNMENT_SERVICE_LABELS = {
  police: "Police station",
  psa: "PSA / civil registry",
  lto: "LTO office",
  dfa: "DFA / passport office",
  bir: "BIR / revenue district office",
  post_office: "Post office / PhilPost",
  fire_station: "Fire station",
  townhall: "City or municipal hall",
  courthouse: "Courthouse",
  government: "Government office",
} as const;

export type GovernmentServiceType = keyof typeof GOVERNMENT_SERVICE_LABELS;

export interface GovernmentService {
  id: string;
  type: GovernmentServiceType;
  name: string;
  latitude: number;
  longitude: number;
  operator: string;
  address: string;
  openingHours: string;
}

export interface GovernmentServiceRecommendation {
  service: GovernmentService;
  distanceKm: number;
}

export interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export function buildGovernmentServicesQuery(bounds: {
  south: number;
  west: number;
  north: number;
  east: number;
}) {
  const bbox = [
    bounds.south,
    bounds.west,
    bounds.north,
    bounds.east,
  ]
    .map((value) => value.toFixed(5))
    .join(",");

  return `[out:json][timeout:15];
(
  nwr["amenity"~"^(police|post_office|fire_station|townhall|courthouse)$"](${bbox});
  nwr["name"~"(Philippine Statistics Authority|National Statistics Office|Land Transportation Office|Department of Foreign Affairs|Bureau of Internal Revenue|PhilPost|PHLPost|PSA|NSO|LTO|DFA|BIR|RDO)",i](${bbox});
  nwr["operator"~"(Philippine Statistics Authority|National Statistics Office|Land Transportation Office|Department of Foreign Affairs|Bureau of Internal Revenue|PhilPost|PHLPost|PSA|NSO|LTO|DFA|BIR|RDO)",i](${bbox});
);
out center 300;`;
}

export function parseGovernmentServices(
  elements: OverpassElement[],
): GovernmentService[] {
  return elements.flatMap((element) => {
    const tags = element.tags ?? {};
    const amenity = tags.amenity;
    const identity = [
      tags.name,
      tags.operator,
      tags.brand,
      tags.short_name,
    ]
      .filter(Boolean)
      .join(" ");
    const type: GovernmentServiceType | null =
      amenity === "police"
        ? "police"
        : /\b(philippine statistics authority|national statistics office|psa|nso)\b/i.test(identity)
          ? "psa"
          : /\b(land transportation office|lto)\b/i.test(identity)
            ? "lto"
            : /\b(department of foreign affairs|dfa|passport)\b/i.test(identity)
              ? "dfa"
              : /\b(bureau of internal revenue|bir|revenue district office|rdo)\b/i.test(identity)
                ? "bir"
                : amenity === "post_office" ||
                    /\b(philpost|phlpost|philippine postal)\b/i.test(identity)
                  ? "post_office"
                  : amenity && amenity in GOVERNMENT_SERVICE_LABELS
        ? (amenity as GovernmentServiceType)
        : tags.office === "government"
          ? "government"
          : null;
    const latitude = element.lat ?? element.center?.lat;
    const longitude = element.lon ?? element.center?.lon;
    if (
      !type ||
      typeof latitude !== "number" ||
      !Number.isFinite(latitude) ||
      typeof longitude !== "number" ||
      !Number.isFinite(longitude)
    ) {
      return [];
    }

    const address = [
      tags["addr:housenumber"],
      tags["addr:street"],
      tags["addr:barangay"],
      tags["addr:city"],
    ]
      .filter(Boolean)
      .join(", ");

    return [{
      id: `${element.type}-${element.id}`,
      type,
      name:
        tags.name ||
        tags.operator ||
        GOVERNMENT_SERVICE_LABELS[type],
      latitude,
      longitude,
      operator: tags.operator ?? "",
      address,
      openingHours: tags.opening_hours ?? "",
    }];
  });
}

const LOST_ID_REPORT =
  /\b(nadukot|nadukutan|dinukutan|nanakaw|snatched|pickpocket|robbed)\b|\b(stolen|lost|missing|nawala)\b.*\b(id|ids|wallet|license|passport|document|documents|card|certificate|tin)\b/i;

function distanceKm(
  [fromLat, fromLng]: [number, number],
  service: GovernmentService,
) {
  const radians = Math.PI / 180;
  const dLat = (service.latitude - fromLat) * radians;
  const dLng = (service.longitude - fromLng) * radians;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(fromLat * radians) *
      Math.cos(service.latitude * radians) *
      Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getGovernmentServiceRecommendations(
  services: GovernmentService[],
  origin: [number, number] | null,
  context: string,
): GovernmentServiceRecommendation[] {
  if (!origin || !LOST_ID_REPORT.test(context)) return [];

  const nearest = (
    type: GovernmentServiceType,
  ): GovernmentServiceRecommendation | null =>
    services
      .filter((service) => service.type === type)
      .map((service) => ({
        service,
        distanceKm: distanceKm(origin, service),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)[0] ?? null;

  const police = nearest("police");
  const documentOffices = ([
    "psa",
    "lto",
    "dfa",
    "bir",
    "post_office",
  ] as GovernmentServiceType[])
    .map(nearest)
    .filter(
      (
        recommendation,
      ): recommendation is GovernmentServiceRecommendation =>
        recommendation !== null,
    )
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return [police, ...documentOffices]
    .filter(
      (
        recommendation,
      ): recommendation is GovernmentServiceRecommendation =>
        recommendation !== null,
    )
    .slice(0, 4);
}
