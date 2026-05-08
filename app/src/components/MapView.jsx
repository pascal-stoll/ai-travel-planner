import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultIconUrl = new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href;
const defaultRetinaIconUrl = new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href;
const defaultShadowUrl = new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href;

L.Icon.Default.mergeOptions({
  iconUrl: defaultIconUrl,
  iconRetinaUrl: defaultRetinaIconUrl,
  shadowUrl: defaultShadowUrl,
});

export function MapView({ itinerary }) {
  const positions = useMemo(
    () => itinerary?.days.flatMap((day) => day.stops.map((stop) => stop.coords)) ?? [],
    [itinerary],
  );

  if (!itinerary) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-slate-500">
        No map available yet.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <MapContainer center={itinerary.center} zoom={8} scrollWheelZoom={false} className="h-96 w-full rounded-3xl">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {itinerary.days.flatMap((day) => day.stops.map((stop) => (
          <Marker key={stop.id} position={stop.coords}>
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold">{stop.name}</p>
                <p className="text-xs text-slate-600">{stop.time} • {stop.duration}</p>
              </div>
            </Popup>
          </Marker>
        )))}
        {positions.length > 1 ? <Polyline positions={positions} color="#0f172a" /> : null}
      </MapContainer>
    </div>
  );
}
