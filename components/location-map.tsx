"use client";

import { useMapEvents } from "react-leaflet";
import {
  Map,
  MapLocateControl,
  MapMarker,
  MapTileLayer,
  MapZoomControl,
} from "@/components/ui/map";

export type LatLng = [number, number];

// Geographic center of the Philippines — the fallback view before anything is pinned.
const PH_CENTER: LatLng = [12.8797, 121.774];

function ClickToPin({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click: (e) => onPick([e.latlng.lat, e.latlng.lng]),
  });
  return null;
}

/** Read-only when `onChange` is omitted. Dynamically import this — Leaflet needs `window`. */
export default function LocationMap({
  value,
  onChange,
  className,
}: {
  value: LatLng | null;
  onChange?: (p: LatLng) => void;
  className?: string;
}) {
  return (
    <Map
      center={value ?? PH_CENTER}
      zoom={value ? 16 : 5}
      className={className}
    >
      <MapTileLayer />
      <MapZoomControl />
      {onChange && (
        <>
          <ClickToPin onPick={onChange} />
          <MapLocateControl
            onLocationFound={(l) => onChange([l.latlng.lat, l.latlng.lng])}
          />
        </>
      )}
      {value && <MapMarker position={value} />}
    </Map>
  );
}
