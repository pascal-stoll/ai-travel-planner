import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import defaultIconUrl from 'leaflet/dist/images/marker-icon.png';
import defaultRetinaIconUrl from 'leaflet/dist/images/marker-icon-2x.png';
import defaultShadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconUrl: defaultIconUrl,
  iconRetinaUrl: defaultRetinaIconUrl,
  shadowUrl: defaultShadowUrl,
});

export function MapView({ itinerary, className = 'h-96' }) {
  const positions = useMemo(
    () => itinerary?.days.flatMap((day) => day.stops.map((stop) => stop.coordinates).filter(Boolean)) ?? [],
    [itinerary],
  );

  const center = itinerary?.center && Array.isArray(itinerary.center) ? itinerary.center : positions[0] || null;

  if (!itinerary || !center) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-slate-500">
        No map available yet.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <MapContainer center={center} zoom={8} scrollWheelZoom={false} className={`${className} w-full rounded-3xl`}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {itinerary.days.flatMap((day) => day.stops.filter((stop) => Array.isArray(stop.coordinates)).map((stop) => (
          <Marker key={stop.id} position={stop.coordinates}>
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
