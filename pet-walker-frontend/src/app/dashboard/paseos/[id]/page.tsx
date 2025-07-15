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
import { useQueryClient } from '@tanstack/react-query';

// Estilos CSS personalizados para animaciones premium
const premiumStyles = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fade-in {
    animation: fade-in 0.8s ease-out forwards;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
`;

const MapWithNoSSR = dynamic(() => import('@/components/shared/LiveMap'), { ssr: false });

export default function PaseoTrackingPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
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
    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
    setSocket(s);
    s.emit('unirse-a-paseo', Number(id));
    return () => { s.disconnect(); };
  }, [id, usuario]);

  useEffect(() => {
    // Fetch del paseo actual para saber el paseador asignado
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/paseos/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setPaseoActual(data.paseo || data);
        const paseoData = data.paseo || data;
        console.log('📋 Datos del paseo recibidos:', paseoData);
        setIsPaseador(Boolean(usuario && paseoData?.paseadorId === usuario.id));
        console.log('👤 Cálculo isPaseador:', { usuario: usuario?.id, paseadorId: paseoData?.paseadorId, resultado: Boolean(usuario && paseoData?.paseadorId === usuario.id) });
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

  // Iniciar tracking automáticamente si el paseo está EN_CURSO y el usuario es paseador
  useEffect(() => {
    if (paseoActual?.estado === 'EN_CURSO' && isPaseador && !tracking) {
      console.log('🚀 Iniciando tracking automático para paseo en curso');
      console.log('📍 Datos del paseo:', { 
        id: paseoActual.id, 
        estado: paseoActual.estado, 
        origenLatitud: paseoActual.origenLatitud, 
        origenLongitud: paseoActual.origenLongitud 
      });
      handleStartTracking(Number(id));
    }
  }, [paseoActual?.estado, isPaseador, tracking, id]);

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
    console.log('🔘 Botón Iniciar Tracking presionado para paseo:', paseoId);
    console.log('🚀 Iniciando tracking para paseo:', paseoId);
    if (!navigator.geolocation) {
      console.log('❌ Geolocation no soportado');
      toast.error('Tu navegador no soporta geolocalización');
      return;
    }

    try {
      console.log('📝 Configurando estado de tracking...');
      setStartingId(paseoId);
      console.log('📡 Llamando a iniciarPaseo...');
      await iniciarPaseo(paseoId);
      console.log('✅ Paseo iniciado en backend');
      setTracking(true);
      console.log('🎯 Estado tracking activado');

      // Registrar posición inicial inmediatamente
      console.log('📍 Solicitando posición inicial...');
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          console.log('📍 Posición inicial registrada:', { lat: latitude, lng: longitude });
          try {
            console.log('📡 Enviando posición inicial al backend...');
            await registrarPuntoGPS(paseoId, latitude, longitude);
            console.log('✅ Posición inicial guardada');
            setCoords([{ lat: latitude, lng: longitude }]);
            if (socket) {
              console.log('🔌 Emitiendo por socket...');
              socket.emit('nueva-coordenada', {
                paseoId,
                lat: latitude,
                lng: longitude,
                precision: pos.coords.accuracy,
                velocidad: pos.coords.speed,
                altitud: pos.coords.altitude,
                bateria: (navigator as any).getBattery ? (await (navigator as any).getBattery()).level * 100 : null
              });
            }
          } catch (err) {
            console.error('❌ Error al registrar posición inicial:', err);
          }
        },
        (err) => {
          console.error('❌ Error al obtener posición inicial. Código:', err.code, 'Mensaje:', err.message);
          console.error('❌ Error al obtener posición inicial:', err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );

      // Configuración optimizada de GPS
      const gpsOptions = {
        enableHighAccuracy: true,
        maximumAge: 30000,        // Cache de 30s para ahorrar batería
        timeout: 27000,           // Timeout de 27s
      };

      // Función para validar y filtrar puntos GPS
      const isValidLocation = (pos: GeolocationPosition): boolean => {
        const { latitude, longitude, accuracy, speed, altitude } = pos.coords;
        return (
          Math.abs(latitude) <= 90 &&
          Math.abs(longitude) <= 180 &&
          accuracy <= 100 &&        // Precisión menor a 100m
          (!speed || speed < 50)    // Velocidad razonable para un paseador (aumentado)
        );
      };

      // Buffer para acumular puntos antes de enviar
      let locationBuffer: GeolocationPosition[] = [];
      const BUFFER_SIZE = 2; // Reducido para más frecuencia
      const BUFFER_TIME = 10000; // 10s

      const processAndSendLocations = async () => {
        if (locationBuffer.length === 0) return;

        console.log('📍 Procesando', locationBuffer.length, 'puntos GPS...');

        // Promedio de puntos cercanos para reducir ruido
        const avgPoint = locationBuffer.reduce((acc, curr) => ({
          latitude: acc.latitude + curr.coords.latitude / locationBuffer.length,
          longitude: acc.longitude + curr.coords.longitude / locationBuffer.length,
          accuracy: curr.coords.accuracy,
          speed: curr.coords.speed,
          altitude: curr.coords.altitude,
          timestamp: curr.timestamp
        }), { latitude: 0, longitude: 0 } as any);

        try {
          console.log('📡 Enviando punto GPS:', { lat: avgPoint.latitude, lng: avgPoint.longitude });
          await registrarPuntoGPS(paseoId, avgPoint.latitude, avgPoint.longitude);
          console.log('✅ Punto GPS registrado exitosamente');
          if (socket) {
            socket.emit('nueva-coordenada', {
              paseoId,
              lat: avgPoint.latitude,
              lng: avgPoint.longitude,
              precision: avgPoint.accuracy,
              velocidad: avgPoint.speed,
              altitud: avgPoint.altitude,
              // @ts-ignore - getBattery no está tipado en TypeScript
              bateria: (navigator as any).getBattery ? (await (navigator as any).getBattery()).level * 100 : null
            });
          }
          setCoords(prev => [...prev.slice(-50), { lat: avgPoint.latitude, lng: avgPoint.longitude }]); // Solo mantener últimos 50 puntos
        } catch (err) {
          console.error('❌ Error al enviar ubicación:', err);
        }
        locationBuffer = [];
      };

      // Timer para procesar buffer por tiempo
      const bufferTimer = setInterval(processAndSendLocations, BUFFER_TIME);

      // Fallback: registrar punto si no hay movimiento después de 30s
      const fallbackTimer = setTimeout(async () => {
        if (locationBuffer.length === 0) {
          console.log('⏰ Fallback: registrando punto sin movimiento');
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const { latitude, longitude } = pos.coords;
              try {
                await registrarPuntoGPS(paseoId, latitude, longitude);
                console.log('✅ Punto fallback registrado');
                setCoords(prev => [...prev, { lat: latitude, lng: longitude }]);
              } catch (err) {
                console.error('❌ Error en punto fallback:', err);
              }
            },
            (err) => console.error('❌ Error fallback GPS:', err),
            { enableHighAccuracy: true, timeout: 5000 }
          );
        }
      }, 30000);

      // Watch position con optimizaciones
      watchId.current = navigator.geolocation.watchPosition(
        (pos) => {
          console.log('📍 Nueva posición GPS recibida:', { lat: pos.coords.latitude, lng: pos.coords.longitude });
          if (!isValidLocation(pos)) {
            console.warn('Punto GPS inválido descartado');
            return;
          }
          locationBuffer.push(pos);
          console.log('📦 Punto agregado al buffer. Total:', locationBuffer.length);
          if (locationBuffer.length >= BUFFER_SIZE) {
            processAndSendLocations();
          }
        },
        (err) => {
          console.error('[GPS] Error watchPosition:', err);
          const errorMsg = {
            1: 'Permiso de ubicación denegado',
            2: 'Error de conexión GPS',
            3: 'Timeout de ubicación'
          }[err.code] || 'Error de geolocalización';
          toast.error(errorMsg);
        },
        gpsOptions
      );

      return () => {
        if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
        clearInterval(bufferTimer);
        clearTimeout(fallbackTimer);
      };
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
      // Invalidar todas las cachés relacionadas
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userPets'] });
      queryClient.invalidateQueries({ queryKey: ['misPaseos'] });
      queryClient.invalidateQueries({ queryKey: ['historialPaseos'] });
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
    <>
      <style jsx>{premiumStyles}</style>
            <div className="min-h-screen relative overflow-hidden">

            {/* Premium Header */}
      <div className="relative z-10">
        <div className="relative overflow-hidden bg-gradient-to-br from-white/90 via-blue-50/90 to-purple-50/90 dark:from-gray-900/90 dark:via-gray-800/90 dark:to-gray-900/90 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/30 shadow-2xl rounded-3xl">
          {/* Header Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-3xl"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-purple-600/20 dark:from-blue-500/15 dark:to-purple-600/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/20 to-pink-600/20 dark:from-purple-500/15 dark:to-pink-600/15 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 container mx-auto py-6 px-6">
            {searchParams.get('enCurso') === '1' && (
              <div className="mb-6 flex justify-start">
                <Button 
                  onClick={() => router.push('/dashboard/paseos')} 
                  className="group relative overflow-hidden bg-gradient-to-r from-white/90 to-gray-100/90 dark:from-gray-800/90 dark:to-gray-700/90 hover:from-white hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-white/30 dark:border-gray-600/30 backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20"></div>
                  <span className="relative z-10 flex items-center font-semibold">
                    <span className="mr-2 group-hover:-translate-x-1 transition-transform duration-300 text-lg">←</span>
                    Volver a Paseos en Curso
                  </span>
                </Button>
              </div>
            )}
            
            <div className="text-center">
              {/* Premium Icon */}
              <div className="relative mx-auto mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-500 dark:to-pink-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl relative overflow-hidden animate-float">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-3xl"></div>
                  <span className="relative z-10 text-white text-2xl">📍</span>
                </div>
                {/* Glow Effect */}
                <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 dark:from-blue-400/30 dark:via-purple-500/30 dark:to-pink-500/30 rounded-3xl blur-xl mx-auto animate-pulse"></div>
              </div>
              
              {/* Premium Title */}
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent mb-2 animate-fade-in">
                Tracking en Tiempo Real
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                Seguimiento en vivo del paseo
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto py-8 px-6">
        {/* Ultra Premium Map Container */}
        <div className="relative overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/50 mb-8">
          {/* Map Container Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/15 to-purple-600/15 dark:from-blue-500/20 dark:to-purple-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/15 to-pink-600/15 dark:from-purple-500/20 dark:to-pink-600/20 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-r from-blue-400/10 to-purple-500/10 dark:from-blue-400/15 dark:to-purple-500/15 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 p-6">
            {/* Map Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm">🗺️</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Mapa en Vivo</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Ubicación en tiempo real</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-600 dark:text-green-400">En línea</span>
              </div>
            </div>
            
            {/* Premium Map */}
            <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-2xl border border-white/20 dark:border-gray-600/30 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10"></div>
              {(() => { 
                console.log('🗺️ Renderizando mapa con:', { 
                  coords: coords.length, 
                  origenLatitud: paseoActual?.origenLatitud, 
                  origenLongitud: paseoActual?.origenLongitud 
                }); 
                return null; 
              })()}
              <MapWithNoSSR coords={coords} origenLatitud={paseoActual?.origenLatitud} origenLongitud={paseoActual?.origenLongitud} />
            </div>
          </div>
        </div>



        {/* Premium Active Walks Section */}
        {searchParams.get('enCurso') === '1' && activeWalks.length > 0 && (
          <div className="relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-600/30">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-600/5 dark:from-gray-600/5 dark:to-gray-700/5"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-500/10 to-transparent dark:from-gray-600/10 dark:to-transparent rounded-full blur-2xl"></div>
            
            <div className="relative z-10 p-8">
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 dark:from-gray-500 dark:to-gray-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">🐕</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  Todos los Paseos en Curso
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Paseos activos actualmente
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {activeWalks.map((paseo) => (
                  <div key={paseo.id} className="group relative overflow-hidden bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-700/90 dark:to-gray-600/90 backdrop-blur-sm border border-gray-300/50 dark:border-gray-500/30 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-600/5 dark:from-gray-600/5 dark:to-gray-700/5"></div>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-gray-500/10 to-transparent dark:from-gray-600/10 dark:to-transparent rounded-full blur-xl"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 dark:from-gray-500 dark:to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white text-xl">{paseo.mascota?.especie?.toLowerCase().includes('gato') ? '🐱' : '🐶'}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                            {paseo.mascota?.nombre || 'N/A'}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Mascota</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <span className="text-lg">📅</span>
                          <span className="font-medium">{new Date(paseo.fecha).toLocaleDateString('es-ES')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <span className="text-lg">🕐</span>
                          <span className="font-medium">{paseo.horaInicio ? paseo.horaInicio.slice(0,5) : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <span className="text-lg">⏱️</span>
                          <span className="font-medium">{paseo.duracion ? `${paseo.duracion} min` : 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 rounded-full text-sm font-semibold">
                          <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse"></div>
                          {paseo.estado}
                        </span>
                      </div>
                      
                      {/* Solo mostrar botón de finalizar si el usuario es el paseador asignado */}
                      {isPaseador && (
                        <Button 
                          onClick={() => handleStopTracking(paseo.id)} 
                          className="w-full group relative overflow-hidden bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 dark:from-red-400 dark:to-red-500 dark:hover:from-red-500 dark:hover:to-red-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300" 
                          disabled={finishingId === paseo.id}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                          <span className="relative z-10 flex items-center justify-center">
                            <span className="mr-2">⏹️</span>
                            {finishingId === paseo.id ? 'Finalizando...' : 'Finalizar Paseo'}
                          </span>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
} 