"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMap, useMapEvents } from "react-leaflet";
import {
  Building2,
  Flame,
  Landmark,
  Mail,
  Scale,
  Shield,
  type LucideIcon,
} from "lucide-react";
import {
  MapControlContainer,
  MapMarker,
  MapMarkerClusterGroup,
  MapPopup,
} from "@/components/ui/map";
import {
  GOVERNMENT_SERVICE_LABELS,
  getGovernmentServiceRecommendations,
  type GovernmentService,
  type GovernmentServiceType,
} from "@/lib/government-services";

const MIN_ZOOM = 11;

const MARKERS: Record<
  GovernmentServiceType,
  { icon: LucideIcon; className: string }
> = {
  police: { icon: Shield, className: "bg-blue-600 text-white" },
  psa: { icon: Building2, className: "bg-sky-600 text-white" },
  lto: { icon: Landmark, className: "bg-orange-600 text-white" },
  dfa: { icon: Landmark, className: "bg-indigo-600 text-white" },
  bir: { icon: Building2, className: "bg-teal-600 text-white" },
  post_office: { icon: Mail, className: "bg-amber-500 text-white" },
  fire_station: { icon: Flame, className: "bg-red-600 text-white" },
  townhall: { icon: Landmark, className: "bg-violet-600 text-white" },
  courthouse: { icon: Scale, className: "bg-slate-700 text-white" },
  government: { icon: Building2, className: "bg-emerald-600 text-white" },
};

const SERVICE_EMOJI: Partial<Record<GovernmentServiceType, string>> = {
  police: "👮",
  psa: "🏢",
  lto: "🚗",
  dfa: "✈️",
  bir: "🧾",
  post_office: "📮",
};

export function GovernmentServicesLayer({
  origin = null,
  context = "",
}: {
  origin?: [number, number] | null;
  context?: string;
}) {
  const map = useMap();
  const [services, setServices] = useState<GovernmentService[]>([]);
  const [zoom, setZoom] = useState(map.getZoom());
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    const nextZoom = map.getZoom();
    setZoom(nextZoom);
    requestRef.current?.abort();

    if (nextZoom < MIN_ZOOM) {
      setServices([]);
      setLoading(false);
      setFailed(false);
      return;
    }

    const controller = new AbortController();
    requestRef.current = controller;
    const bounds = map.getBounds();
    const searchBounds = origin
      ? {
          south: origin[0] - 0.12,
          west: origin[1] - 0.12,
          north: origin[0] + 0.12,
          east: origin[1] + 0.12,
        }
      : {
          south: bounds.getSouth(),
          west: bounds.getWest(),
          north: bounds.getNorth(),
          east: bounds.getEast(),
        };
    const params = new URLSearchParams({
      south: String(searchBounds.south),
      west: String(searchBounds.west),
      north: String(searchBounds.north),
      east: String(searchBounds.east),
    });

    setLoading(true);
    setFailed(false);
    try {
      const response = await fetch(
        `/api/map/government-services?${params}`,
        { signal: controller.signal },
      );
      if (!response.ok) throw new Error("Government services lookup failed.");
      setServices((await response.json()) as GovernmentService[]);
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setServices([]);
        setFailed(true);
      }
    } finally {
      if (requestRef.current === controller) setLoading(false);
    }
  }, [map, origin]);

  const scheduleLoad = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => void load(), 450);
  }, [load]);

  useMapEvents({ moveend: scheduleLoad });
  useEffect(() => {
    scheduleLoad();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      requestRef.current?.abort();
    };
  }, [scheduleLoad]);

  const recommendations = useMemo(
    () => getGovernmentServiceRecommendations(services, origin, context),
    [context, origin, services],
  );

  return (
    <>
      <MapControlContainer className="bottom-2 left-2 max-w-[calc(100%-4rem)] rounded-md border bg-background/90 px-2.5 py-1.5 text-[10px] shadow-sm backdrop-blur">
        <p className="font-medium">
          {zoom < MIN_ZOOM
            ? "Choose a location or zoom in to see nearby services"
            : loading
              ? "Loading nearby government services…"
              : failed
                ? "Government services unavailable"
                : `${services.length}${services.length === 300 ? "+" : ""} nearby government services`}
        </p>
        <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-muted-foreground">
          <span>👮 Police</span>
          <span>🏢 PSA</span>
          <span>🚗 LTO</span>
          <span>✈️ DFA</span>
          <span>📮 PhilPost</span>
          <span>🧾 BIR</span>
        </div>
      </MapControlContainer>

      {recommendations.length > 0 && (
        <MapControlContainer className="right-2 top-12 max-w-64 rounded-lg border bg-background/95 p-2.5 text-xs shadow-md backdrop-blur">
          <p className="font-semibold">Nearby help for lost IDs</p>
          <ul className="mt-1.5 space-y-1.5">
            {recommendations.map(({ service, distanceKm }) => (
              <li key={service.id}>
                <p className="truncate font-medium">
                  {SERVICE_EMOJI[service.type]} {service.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {GOVERNMENT_SERVICE_LABELS[service.type]} ·{" "}
                  {distanceKm.toFixed(1)} km
                </p>
              </li>
            ))}
          </ul>
        </MapControlContainer>
      )}

      {services.length > 0 && (
        <MapMarkerClusterGroup
          icon={(count) => (
            <span className="flex size-9 items-center justify-center rounded-full border-2 border-background bg-foreground text-xs font-semibold text-background shadow-lg">
              {count}
            </span>
          )}
        >
          {services.map((service) => {
            const marker = MARKERS[service.type];
            const Icon = marker.icon;
            return (
              <MapMarker
                key={service.id}
                position={[service.latitude, service.longitude]}
                iconAnchor={[14, 14]}
                popupAnchor={[0, -14]}
                icon={
                  <span
                    className={`flex size-7 items-center justify-center rounded-full border-2 border-background shadow-lg ${marker.className}`}
                  >
                    <Icon className="size-3.5" />
                  </span>
                }
              >
                <MapPopup>
                  <p className="text-sm font-semibold tracking-tight">
                    {service.name}
                  </p>
                  <p className="mt-1 text-xs font-medium text-primary">
                    {GOVERNMENT_SERVICE_LABELS[service.type]}
                  </p>
                  {service.operator && service.operator !== service.name && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Operated by {service.operator}
                    </p>
                  )}
                  {service.address && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {service.address}
                    </p>
                  )}
                  {service.openingHours && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Hours: {service.openingHours}
                    </p>
                  )}
                </MapPopup>
              </MapMarker>
            );
          })}
        </MapMarkerClusterGroup>
      )}
    </>
  );
}
