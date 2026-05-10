import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import RecenterControl from './RecenterControl';

const DEFAULT_CENTER = [51.505, -0.09]; // Londra come fallback
const DEFAULT_ZOOM = 13;

// MV03/MV04: divIcon numerato con colore opzionale per selezione
const createNumberedIcon = (number, isSelected = false) => {
  const fill = isSelected ? '#F47B20' : '#1A6B8A';
  return L.divIcon({
    html: `<div style="
      width:32px;height:40px;display:flex;align-items:center;justify-content:center;
      background-color:${fill};color:white;font-family:'Inter',sans-serif;font-weight:bold;
      font-size:14px;border-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,0.2);">${number}</div>`,
    className: '',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
};

const MapView = ({ itinerary, onStopClick }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const recenterControl = useRef(null); // MV08

  // MV02: inizializzazione mappa (eseguita una sola volta)
  useEffect(() => {
    if (mapInstance.current) return;
    const map = L.map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    // MV07: zoom control posizionato in basso a destra
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapInstance.current = map;
    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // MV03–MV08: aggiorna marker, polyline e recenter quando cambia l'itinerario
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !itinerary) return;

    // Pulisce layer precedenti (escluso tile)
    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) return;
      map.removeLayer(layer);
    });

    // MV03/MV04: marker numerati da stop.coordinates [lat, lng]
    const markers = [];
    if (itinerary.days) {
      let stopNumber = 0;
      itinerary.days.forEach(day => {
        day.stops.forEach(stop => {
          const coords = stop.coordinates;
          if (Array.isArray(coords) && coords.length >= 2) {
            stopNumber++;
            const marker = L.marker([coords[0], coords[1]], {
              icon: createNumberedIcon(stopNumber),
            });
            marker.on('click', () => {
              if (onStopClick) onStopClick(stop, stopNumber - 1); // stopIndex 0-based
            });
            marker.addTo(map);
            markers.push(marker);
          }
        });
      });
    }

    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds(), { padding: [20, 20] });
    }

    // MV05/MV06: polyline con stile adattivo al mezzo di trasporto
    const allStopCoords = markers.map(m => m.getLatLng());
    if (allStopCoords.length >= 2) {
      if (itinerary.days && itinerary.days[0].segments && itinerary.days[0].segments.length > 0) {
        const segments = itinerary.days[0].segments;
        let cumulativeIdx = 0;
        segments.forEach(seg => {
          const fromIdx = cumulativeIdx;
          const toIdx = cumulativeIdx + 1;
          if (toIdx < allStopCoords.length) {
            const segmentCoords = [allStopCoords[fromIdx], allStopCoords[toIdx]];
            let dashArray = null;
            switch (seg.mode) {
              case 'walking':
                dashArray = '8 4'; break;
              case 'public_transport':
                dashArray = '4 4'; break;
              default: // car, train, flight
                dashArray = null; break;
            }
            L.polyline(segmentCoords, {
              color: '#1A6B8A',
              weight: 3,
              dashArray: dashArray,
            }).addTo(map);
          }
          cumulativeIdx++;
        });
      } else {
        // Fallback: singola polyline solida
        L.polyline(allStopCoords, {
          color: '#1A6B8A',
          weight: 3,
        }).addTo(map);
      }
    }

    // MV08: recenter control — creato una sola volta, bounds aggiornati ad ogni itinerario
    if (!recenterControl.current) {
      recenterControl.current = new RecenterControl();
      map.addControl(recenterControl.current);
    }
    const bounds = markers.length > 0 ? L.featureGroup(markers).getBounds() : null;
    if (bounds && recenterControl.current) {
      recenterControl.current.setBounds(bounds);
    }
  }, [itinerary]);

  return <div ref={mapRef} className="map-container" />;
};

export default MapView;
