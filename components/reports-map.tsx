"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { MapPinIcon } from "lucide-react";
import {
  Map,
  MapFullscreenControl,
  MapMarker,
  MapPopup,
  MapTileLayer,
  MapZoomControl,
} from "@/components/ui/map";
import { StatusBadge } from "@/app/dashboard/reports/status-badge";
import type { Report } from "@/app/dashboard/reports/reports-table";

export type PinnedReport = Report & { latitude: number; longitude: number };

/** Geographic center of the Philippines — the view when there's nothing to fit. */
const PH_CENTER: [number, number] = [12.8797, 121.774];

/** Frames every pin. `reports` is memoized upstream, so this runs once per load. */
function FitToPins({ reports }: { reports: PinnedReport[] }) {
  const map = useMap();
  useEffect(() => {
    if (!reports.length) return;
    map.fitBounds(
      reports.map((r) => [r.latitude, r.longitude]),
      { padding: [40, 40], maxZoom: 15 },
    );
  }, [map, reports]);
  return null;
}

/** Dynamically import this — Leaflet needs `window`. */
export default function ReportsMap({
  reports,
  className,
}: {
  reports: PinnedReport[];
  className?: string;
}) {
  const points = reports.map(
    (r) => [r.latitude, r.longitude] as [number, number],
  );

  return (
    <Map
      center={points[0] ?? PH_CENTER}
      zoom={points.length ? 13 : 5}
      className={className}
    >
      <MapTileLayer />
      <MapZoomControl />
      <MapFullscreenControl />
      <FitToPins reports={reports} />
      {reports.map((r, i) => (
        <MapMarker
          key={r.id}
          position={points[i]}
          iconAnchor={[12, 24]}
          icon={
            <MapPinIcon className="size-6 fill-primary/20 text-primary drop-shadow" />
          }
        >
          <MapPopup>
            <p className="text-sm font-medium tracking-tight">{r.title}</p>
            <p className="mt-1 font-mono text-[11px] tracking-wider text-muted-foreground">
              {r.report_api_id}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <StatusBadge status={r.status} />
              <span className="text-xs text-muted-foreground">
                {r.category}
              </span>
            </div>
          </MapPopup>
        </MapMarker>
      ))}
    </Map>
  );
}
