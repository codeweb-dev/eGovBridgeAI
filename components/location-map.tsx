"use client";

import { useEffect } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { GovernmentServicesLayer } from "@/components/government-services-layer";
import {
  Map,
  MapFullscreenControl,
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

function FocusOnPin({ value }: { value: LatLng | null }) {
  const map = useMap();

  useEffect(() => {
    if (value && map.getZoom() < 13) map.flyTo(value, 14);
  }, [map, value]);

  return null;
}

/** Read-only when `onChange` is omitted. Dynamically import this — Leaflet needs `window`. */
export default function LocationMap({
  value,
  onChange,
  className,
  governmentServices = false,
  serviceContext = "",
}: {
  value: LatLng | null;
  onChange?: (p: LatLng) => void;
  className?: string;
  governmentServices?: boolean;
  serviceContext?: string;
}) {
  return (
    <Map
      center={value ?? PH_CENTER}
      zoom={value ? 16 : 5}
      className={className}
    >
      <MapTileLayer />
      <MapZoomControl />
      <MapFullscreenControl position="right-2 top-2" />
      <FocusOnPin value={value} />
      {governmentServices && (
        <GovernmentServicesLayer origin={value} context={serviceContext} />
      )}
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
