import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression } from 'leaflet';
import { useEffect, useState, useCallback } from 'react';
import type { TileLayerProps } from 'react-leaflet';

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
  console.log('🗺️ LiveMap recibió:', { coords: coords?.length, origenLatitud, origenLongitud });
  
  // Validar que las coordenadas sean válidas
  const validCoords = coords?.filter(coord => 
    coord && 
    typeof coord.lat === 'number' && 
    typeof coord.lng === 'number' && 
    !isNaN(coord.lat) && 
    !isNaN(coord.lng)
  ) || [];
  
  console.log('🗺️ Coordenadas válidas:', validCoords.length);

  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [noUbicacion, setNoUbicacion] = useState(false);
  const [tileProvider, setTileProvider] = useState(0);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  // Proveedores de tiles alternativos
  const tileProviders = [
    {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    {
      url: "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
    },
    {
      url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }
  ];

  // Función para solicitar permisos de geolocalización
  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      return false;
    }

    try {
      // Verificar permisos si están disponibles
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'denied') {
          setError('Permisos de ubicación denegados. Ve a Configuración del navegador y permite el acceso.');
          return false;
        }
      }
      return true;
    } catch (err) {
      console.warn('No se pudieron verificar permisos:', err);
      return true; // Continuar de todos modos
    }
  }, []);

  // Función mejorada para obtener ubicación
  const getCurrentLocation = useCallback(async () => {
    if (isRequestingLocation) return;
    
    setIsRequestingLocation(true);
    const hasPermission = await requestLocationPermission();
    
    if (!hasPermission) {
      setIsRequestingLocation(false);
      setNoUbicacion(true);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000, // Aumentado a 15 segundos
      maximumAge: 60000 // 1 minuto de cache
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // Validar coordenadas más estrictamente
        if (isNaN(latitude) || isNaN(longitude) || 
            Math.abs(latitude) > 90 || Math.abs(longitude) > 180 ||
            accuracy > 10000) { // Rechazar si la precisión es muy baja (>10km)
          setError('Coordenadas GPS inválidas o imprecisas recibidas');
          setNoUbicacion(true);
          setIsRequestingLocation(false);
          return;
        }
        
        console.log('📍 Ubicación obtenida:', { latitude, longitude, accuracy });
        setCurrentLocation([latitude, longitude]);
        setNoUbicacion(false);
        setError(null);
        setIsRequestingLocation(false);
      },
      (error) => {
        console.error('Error obteniendo ubicación en LiveMap:', error);
        const errorMessages = {
          1: 'Permisos de ubicación denegados. Ve a Configuración del navegador y permite el acceso.',
          2: 'Señal GPS no disponible. Verifica que estés en un área con buena cobertura de señal.',
          3: 'Tiempo de espera agotado para obtener ubicación. Intenta moverte a un área con mejor señal GPS.'
        };
        const message = errorMessages[error.code as keyof typeof errorMessages] || 'No se pudo obtener tu ubicación actual';
        setError(message);
        setNoUbicacion(true);
        setIsRequestingLocation(false);
      },
      options
    );
  }, [isRequestingLocation, requestLocationPermission]);

  useEffect(() => {
    if (!validCoords || validCoords.length === 0) {
      getCurrentLocation();
    } else {
      setNoUbicacion(false);
      setError(null);
    }
  }, [validCoords, getCurrentLocation]);

  // Función para cambiar proveedor de tiles en caso de error
  const handleTileError = useCallback(() => {
    if (tileProvider < tileProviders.length - 1) {
      console.log('🔄 Cambiando proveedor de tiles debido a errores de carga');
      setTileProvider(prev => prev + 1);
    }
  }, [tileProvider, tileProviders.length]);

  // Función para reintentar obtener ubicación
  const retryLocation = useCallback(() => {
    setError(null);
    setNoUbicacion(false);
    getCurrentLocation();
  }, [getCurrentLocation]);

  const hasCoords = validCoords && validCoords.length > 0;
  
  // Usar ubicación por defecto si no hay coordenadas disponibles (Ciudad de México)
  const defaultLocation: [number, number] = [19.4326, -99.1332];
  
  const center: LatLngExpression = hasCoords
    ? [validCoords[validCoords.length - 1].lat, validCoords[validCoords.length - 1].lng]
    : currentLocation
      ? currentLocation
      : origenLatitud && origenLongitud
        ? [origenLatitud, origenLongitud]
        : defaultLocation;

  // Mostrar el mapa siempre, con mensajes informativos si es necesario
  const showLocationWarning = !hasCoords && !currentLocation && (!origenLatitud || !origenLongitud);

  const polyline: LatLngExpression[] = validCoords.map(c => [c.lat, c.lng]);

  return (
    <div className="relative w-full h-full">
      {showLocationWarning && (
        <div className="absolute top-2 left-2 z-[1000] bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded shadow max-w-sm">
          <div className="flex items-center justify-between">
            <span>Usando ubicación por defecto. Para ver la ubicación real, permite el acceso a GPS.</span>
            <button 
              onClick={retryLocation}
              className="ml-2 px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute top-14 left-2 z-[1000] bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded max-w-sm">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={retryLocation}
              className="ml-2 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}
      {isRequestingLocation && (
        <div className="absolute top-2 right-2 z-[1000] bg-blue-100 border border-blue-400 text-blue-800 px-4 py-2 rounded shadow">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 mr-2"></div>
            Obteniendo ubicación...
          </div>
        </div>
      )}
      <MapContainer 
        center={center as [number, number]} 
        zoom={hasCoords ? 16 : 12} 
        scrollWheelZoom={true} 
        className="w-full h-full rounded-xl"
        key={`${center[0]}-${center[1]}`} // Force re-render when center changes
      >
        <TileLayer
          url={tileProviders[tileProvider].url}
          attribution={tileProviders[tileProvider].attribution}
          eventHandlers={{
            tileerror: handleTileError
          }}
        />
        {hasCoords && polyline.length > 1 && (
          <Polyline positions={polyline} pathOptions={{ color: 'green', weight: 5 }} />
        )}
        {hasCoords ? (
          <Marker position={center as [number, number]} icon={pawIcon}>
            <Popup>Ubicación actual del paseador</Popup>
          </Marker>
        ) : (
          <Marker position={center as [number, number]} icon={grayIcon}>
            <Popup>
              {showLocationWarning 
                ? 'Ubicación por defecto - Permite GPS para ubicación real' 
                : 'Esperando datos de tracking...'}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}