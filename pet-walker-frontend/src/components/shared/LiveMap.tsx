import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// @ts-expect-error: leaflet no tiene tipos completos en Next.js
import L, { LatLngExpression } from 'leaflet';
import { useEffect, useState } from 'react';

const pawIcon = new L.Icon({
  iconUrl: '/paw.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const grayIcon = new L.Icon({
  iconUrl: '/paw.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  className: 'opacity-40 grayscale',
});

type Coords = { lat: number; lng: number }[];

type LiveMapProps = {
  coords: Coords;
  origenLatitud?: number;
  origenLongitud?: number;
};

export default function LiveMap({ coords, origenLatitud, origenLongitud }: LiveMapProps) {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [noUbicacion, setNoUbicacion] = useState(false);

  useEffect(() => {
    if (!coords || coords.length === 0) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([position.coords.latitude, position.coords.longitude]);
          setNoUbicacion(false);
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          setError('No se pudo obtener tu ubicación actual');
          setNoUbicacion(true);
        }
      );
    } else {
      setNoUbicacion(false);
    }
  }, [coords]);

  const hasCoords = coords && coords.length > 0;
  const center: LatLngExpression | null = hasCoords
    ? [coords[coords.length - 1].lat, coords[coords.length - 1].lng]
    : currentLocation
      ? currentLocation
      : null;

  // Debug visual
  console.log('[LiveMap] coords:', coords);
  console.log('[LiveMap] center:', center);

  if (!center) {
    return (
      <div className="relative w-full h-full">
        <div className="absolute top-2 left-2 z-[1000] bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded shadow">
          No se pudo obtener la ubicación del paseador. Por favor, revisa los permisos de ubicación.
        </div>
        <div className="w-full h-96 flex items-center justify-center text-gray-500">Esperando ubicación válida...</div>
      </div>
    );
  }

  const polyline: LatLngExpression[] = coords.map(c => [c.lat, c.lng]);

  return (
    <div className="relative w-full h-full">
      {noUbicacion && (
        <div className="absolute top-2 left-2 z-[1000] bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded shadow">
          No se pudo obtener la ubicación del paseador. Por favor, revisa los permisos de ubicación.
        </div>
      )}
      {error && (
        <div className="absolute top-14 left-2 z-[1000] bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
          {error}
        </div>
      )}
      <MapContainer center={center as [number, number]} zoom={16} scrollWheelZoom={true} className="w-full h-full rounded-xl">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hasCoords && <Polyline positions={polyline} pathOptions={{ color: 'green', weight: 5 }} />}
        {hasCoords ? (
          <Marker position={center as [number, number]} icon={pawIcon} />
        ) : (
          <Marker position={center as [number, number]} icon={grayIcon}>
            <Popup>Sin datos de tracking aún</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
} 