import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatTime } from '@/lib/utils';
import type { IncidentLocation } from '@/lib/types';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function Recenter({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 15);
  }, [map, position]);
  return null;
}

interface MapViewProps {
  locations: IncidentLocation[];
  className?: string;
}

export function MapView({ locations, className }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const latest = locations[locations.length - 1];
  const center: [number, number] = latest
    ? [latest.latitude, latest.longitude]
    : [12.9716, 77.5946];

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={15}
        className="h-full w-full rounded-lg"
        ref={(m) => { if (m) mapRef.current = m; }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        {latest && (
          <>
            <Recenter position={center} />
            <Marker position={center}>
              <Popup>
                <div className="text-xs">
                  <p className="font-semibold">Simulated GPS</p>
                  <p>Lat: {latest.latitude.toFixed(6)}</p>
                  <p>Lng: {latest.longitude.toFixed(6)}</p>
                  <p>Accuracy: ±{latest.accuracy}m</p>
                  <p>Time: {formatTime(latest.timestamp)}</p>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={center}
              radius={latest.accuracy}
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.15 }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}
