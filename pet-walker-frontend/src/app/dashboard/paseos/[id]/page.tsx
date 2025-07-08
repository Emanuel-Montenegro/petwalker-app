"use client";
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { io } from 'socket.io-client';
import { useAuthStore } from '@/lib/store/authStore';
import { iniciarPaseo, finalizarPaseo, obtenerMisPaseosComoPaseador } from '@/lib/api/paseos';
import { registrarPuntoGPS, obtenerPuntosGPS } from '@/lib/api/gps';
import type { Paseo } from '@/types';

const MapWithNoSSR = dynamic(() => import('@/components/shared/LiveMap'), { ssr: false });

export default function PaseoTrackingPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { usuario } = useAuthStore();
  const [tracking, setTracking] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number }[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [activeWalks, setActiveWalks] = useState<Paseo[]>([]);
  const [startingId, setStartingId] = useState<number | undefined>(undefined);
  const [finishingId, setFinishingId] = useState<number | undefined>(undefined);
  const watchId = useRef<number | null>(null);
  const [isPaseador, setIsPaseador] = useState(false);
  const [paseoActual, setPaseoActual] = useState<Paseo | null>(null);

  // Obtener todos los paseos en curso si enCurso=1
  useEffect(() => {
    if (searchParams.get('enCurso') === '1' && usuario?.id) {
      obtenerMisPaseosComoPaseador(usuario.id).then((paseos) => {
        setActiveWalks(paseos.filter(p => p.estado === 'EN_CURSO'));
      });
    }
  }, [searchParams, usuario]);

  useEffect(() => {
    if (!id || !usuario) return;
    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000');
    setSocket(s);
    s.emit('unirse-a-paseo', Number(id));
    return () => { s.disconnect(); };
  }, [id, usuario]);

  useEffect(() => {
    // Fetch del paseo actual para saber el paseador asignado
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/paseos/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setPaseoActual(data.paseo || data);
        setIsPaseador(Boolean(usuario && data.paseo?.paseadorId === usuario.id));
      });
  }, [id, usuario]);

  // Cargar puntos GPS históricos y suscribirse a nuevas coordenadas en tiempo real
  useEffect(() => {
    if (!id) return;
    // 1. Cargar puntos GPS históricos
    obtenerPuntosGPS(Number(id))
      .then(data => {
        if (Array.isArray(data.coordenadas)) {
          setCoords(data.coordenadas.map(([lng, lat]: [number, number]) => ({ lat, lng })));
        }
      })
      .catch(() => {
        setCoords([]);
      });
    // 2. Suscribirse a nuevas coordenadas en tiempo real (ubicacion-paseador)
    if (socket) {
      const handleUbicacionPaseador = ({ lat, lng }: { lat: number; lng: number }) => {
        setCoords(prev => [...prev, { lat, lng }]);
      };
      socket.on('ubicacion-paseador', handleUbicacionPaseador);
      return () => {
        socket.off('ubicacion-paseador', handleUbicacionPaseador);
      };
    }
  }, [id, socket]);

  // Refuerzo: Si no hay puntos y el paseo está en curso, intento obtener la ubicación actual y la agrego a coords (solo una vez)
  useEffect(() => {
    if (
      coords.length === 0 &&
      paseoActual?.estado === 'EN_CURSO' &&
      navigator.geolocation
    ) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (!latitude || !longitude || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return;
          setCoords([{ lat: latitude, lng: longitude }]);
        },
        (err) => {
          console.error('[GPS] Error getCurrentPosition para tracking inicial:', err);
          // Opcional: podrías setear un estado de error para mostrar advertencia visual
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
      );
    }
    // Solo se ejecuta si coords.length === 0 y el paseo está en curso
    // Así evitamos loops infinitos
    // Si ya hay puntos, no hace nada
  }, [coords.length, paseoActual?.estado]);

  // Función robusta para registrar el primer punto GPS con reintentos
  const tryRegistrarPrimerPunto = (paseoId: number, lat: number, lng: number, intentos = 0) => {
    console.log('[GPS] Intentando registrar primer punto:', { lat, lng });
    if (!lat || !lng || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      toast.error('Ubicación GPS inválida. Por favor, revisa los permisos de ubicación.');
      return;
    }
    registrarPuntoGPS(paseoId, lat, lng)
      .then(() => {
        setCoords((prev) => [...prev, { lat, lng }]);
        if (socket) socket.emit('nueva-coordenada', { paseoId, lat, lng });
      })
      .catch((err) => {
        if (err.message?.includes('en curso') && intentos < 3) {
          setTimeout(() => tryRegistrarPrimerPunto(paseoId, lat, lng, intentos + 1), 300);
        } else {
          toast.error('No se pudo registrar el primer punto GPS');
        }
      });
  };

  const handleStartTracking = async (paseoId: number) => {
    if (!navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalización. Usa Chrome, Firefox o Edge y habilita la ubicación.');
      return;
    }
    try {
      setStartingId(paseoId);
      await iniciarPaseo(paseoId);
      setTracking(true);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (!latitude || !longitude || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
            toast.error('Ubicación GPS inválida. Por favor, revisa los permisos de ubicación.');
            return;
          }
          tryRegistrarPrimerPunto(paseoId, latitude, longitude);
        },
        (err) => {
          console.error('[GPS] Error getCurrentPosition:', err);
          if (err.code === 1) {
            toast.error('Debes permitir el acceso a tu ubicación para usar el tracking en tiempo real. Haz clic en el ícono de ubicación en la barra de direcciones y selecciona "Permitir".');
          } else if (err.code === 2) {
            toast.error('No se pudo obtener tu ubicación. Verifica tu conexión o intenta de nuevo.');
          } else if (err.code === 3) {
            toast.error('La solicitud de ubicación tardó demasiado. Intenta de nuevo.');
          } else {
            toast.error('Error de geolocalización: ' + err.message);
          }
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
      );

      watchId.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (!latitude || !longitude || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
            toast.error('Ubicación GPS inválida detectada durante el tracking.');
            return;
          }
          setCoords((prev) => [...prev, { lat: latitude, lng: longitude }]);
          if (socket) socket.emit('nueva-coordenada', { paseoId, lat: latitude, lng: longitude });
          registrarPuntoGPS(paseoId, latitude, longitude).catch(err => console.error('Error al registrar punto GPS:', err));
        },
        (err) => {
          console.error('[GPS] Error watchPosition:', err);
          if (err.code === 1) {
            toast.error('Debes permitir el acceso a tu ubicación para usar el tracking en tiempo real. Haz clic en el ícono de ubicación en la barra de direcciones y selecciona "Permitir".');
          } else if (err.code === 2) {
            toast.error('No se pudo obtener tu ubicación. Verifica tu conexión o intenta de nuevo.');
          } else if (err.code === 3) {
            toast.error('La solicitud de ubicación tardó demasiado. Intenta de nuevo.');
          } else {
            toast.error('Error de geolocalización: ' + err.message);
          }
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
      );
    } catch (error) {
      console.error('Error al iniciar paseo:', error);
      toast.error('No se pudo iniciar el paseo');
    } finally {
      setStartingId(undefined);
    }
  };

  const handleStopTracking = async (paseoId: number) => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
    }
    setTracking(false);
    try {
      setFinishingId(paseoId);
      await finalizarPaseo(paseoId);
      toast.success('Paseo finalizado.');
      router.push('/dashboard/paseos');
    } catch (error) {
      console.error('Error al finalizar paseo:', error);
      toast.error('No se pudo finalizar el paseo');
    } finally {
      setFinishingId(undefined);
    }
  };

  // Subida de foto (si el dueño la solicita)
  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    toast.info('Foto subida (simulado)');
  };

  return (
    <div className="container mx-auto py-8">
      {searchParams.get('enCurso') === '1' && (
        <div className="mb-6 flex justify-start">
          <Button onClick={() => router.push('/dashboard/paseos')} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg shadow hover:bg-gray-300">
            ← Volver a Paseos en Curso
          </Button>
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4 text-center">Tracking en Tiempo Real del Paseo</h1>
      <div className="w-full h-96 mb-6">
        <MapWithNoSSR coords={coords} origenLatitud={paseoActual?.origenLatitud} origenLongitud={paseoActual?.origenLongitud} />
      </div>
      {/* Solo mostrar botones de tracking si el usuario es el paseador asignado */}
      {isPaseador && (
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
          {!tracking ? (
            <Button onClick={() => handleStartTracking(Number(id))} className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg">Iniciar Tracking</Button>
          ) : (
            <Button onClick={() => handleStopTracking(Number(id))} className="bg-red-600 text-white px-8 py-3 rounded-lg text-lg">Finalizar Paseo</Button>
          )}
          <label className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg text-base">
            Subir Foto
            <input type="file" accept="image/*" className="hidden" onChange={handleUploadPhoto} />
          </label>
        </div>
      )}
      {searchParams.get('enCurso') === '1' && activeWalks.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 text-center">Todos los Paseos en Curso</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeWalks.map((paseo) => (
              <li key={paseo.id} className="border border-green-300 p-6 rounded-lg shadow-lg flex flex-col justify-between h-full">
                <div>
                  <p className="font-bold text-2xl text-primary-foreground mb-3">Mascota: {paseo.mascota?.nombre || 'N/A'}</p>
                  <p className="text-gray-700 text-sm mb-1"><span className="font-medium">Fecha:</span> {new Date(paseo.fecha).toLocaleDateString('es-ES')}</p>
                  <p className="text-gray-700 text-sm mb-1"><span className="font-medium">Hora:</span> {paseo.horaInicio ? paseo.horaInicio.slice(0,5) : 'N/A'}</p>
                  <p className="text-gray-700 text-sm mb-1"><span className="font-medium">Duración:</span> {paseo.duracion ? `${paseo.duracion} min` : 'N/A'}</p>
                  <p className="text-gray-700 text-sm mt-3"><span className="font-medium">Estado:</span> <span className="font-semibold text-green-600">{paseo.estado}</span></p>
                </div>
                {/* Solo mostrar botón de finalizar si el usuario es el paseador asignado */}
                {isPaseador && (
                  <div className="flex flex-col gap-2 mt-6">
                    <Button onClick={() => handleStopTracking(paseo.id)} className="w-full py-2 text-base rounded-md shadow-sm hover:shadow-md transition-all duration-200 bg-red-600 text-white" disabled={finishingId === paseo.id}>
                      {finishingId === paseo.id ? 'Finalizando...' : 'Finalizar Paseo'}
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 