"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StarIcon, CalendarIcon, ClockIcon, DogIcon, ChevronDownIcon, ChevronUpIcon, Cat, MapPinIcon, TimerIcon, DollarSignIcon } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { fetchUserProfile } from '@/lib/api/user';
import { obtenerMisPaseos, obtenerPaseosPaseador } from '../../../lib/api/paseos';
import { CalificarPaseoModal } from '@/components/shared/CalificarPaseoModal';
import Rating from '@/components/ui/rating';
import { Paseo, UserProfile } from '@/types';
import GlobalLoader from '@/components/shared/GlobalLoader';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import LiveMap from '@/components/shared/LiveMap';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { obtenerPuntosGPS } from '@/lib/api/gps';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pagination } from '@/components/ui/pagination';
import { useRouter } from 'next/navigation';

const MapWithNoSSR = dynamic(() => import('@/components/shared/LiveMap'), { ssr: false });

const ITEMS_PER_PAGE = 6;

const getMascotaIcon = (especie: string) => {
  if (especie?.toLowerCase().includes('gato')) return '🐱';
  return '🐕';
};

const HistorialPaseosPage = () => {
  const { usuario } = useAuthStore();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [paseos, setPaseos] = useState<Paseo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalCoords, setModalCoords] = useState<{ lat: number; lng: number }[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [paseoEnCurso, setPaseoEnCurso] = useState<Paseo | null>(null);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [routeCoords, setRouteCoords] = useState<{ lat: number; lng: number }[]>([]);
  const [selectedPaseoId, setSelectedPaseoId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedPaseos, setExpandedPaseos] = useState<Set<number>>(new Set());
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (!usuario?.id) return;

      try {
        setLoading(true);
        const profileData = await fetchUserProfile();
        setUserProfile(profileData);
        let paseosData: Paseo[] = [];
        if (profileData.rol === 'DUENO') {
          paseosData = await obtenerMisPaseos();
        } else if (profileData.rol === 'PASEADOR') {
          paseosData = await obtenerPaseosPaseador(usuario.id);
        }
        const enCurso = paseosData.find((p: Paseo) => p.estado === 'EN_CURSO');
        setPaseoEnCurso(enCurso || null);
        const paseosFinalizado = paseosData.filter(
          (paseo: Paseo) => paseo.estado === 'FINALIZADO'
        );
        setPaseos(paseosFinalizado);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar el historial de paseos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [usuario?.id]);

  const handleCalificacionRegistrada = () => {
    if (usuario?.id && userProfile?.rol === 'DUENO') {
      obtenerMisPaseos().then((paseosData: Paseo[]) => {
        const paseosFinalizado = paseosData.filter(
          (paseo: Paseo) => paseo.estado === 'FINALIZADO'
        );
        setPaseos(paseosFinalizado);
      });
    } else if (usuario?.id && userProfile?.rol === 'PASEADOR') {
      obtenerPaseosPaseador(usuario.id).then((paseosData: Paseo[]) => {
        const paseosFinalizado = paseosData.filter(
          (paseo: Paseo) => paseo.estado === 'FINALIZADO'
        );
        setPaseos(paseosFinalizado);
      });
    }
  };

  const getEstadoBadge = (estado: string) => {
    const variants = {
      FINALIZADO: 'bg-green-100 text-green-800',
      CANCELADO: 'bg-red-100 text-red-800',
    };
    
    return variants[estado as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const handleViewRoute = async (paseoId: number) => {
    try {
      const data = await obtenerPuntosGPS(paseoId);
      setRouteCoords(data.coordenadas.map((c: [number, number]) => ({ lat: c[1], lng: c[0] })));
      setSelectedPaseoId(paseoId);
      setShowRouteModal(true);
    } catch (error) {
      console.error('Error al obtener ruta:', error);
      toast.error('No se pudo cargar la ruta del paseo');
    }
  };

  const totalPages = Math.ceil(paseos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPaseos = paseos.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">Cargando historial...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorBoundary>
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Error al cargar</h3>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 text-white px-6 py-2 rounded-xl hover:scale-105 transition-all duration-300"
            >
              Intentar de nuevo
            </Button>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="w-full max-w-3xl mx-auto py-6 px-2 pr-6 sm:px-4 sm:pr-12 space-y-8 min-h-screen overflow-x-hidden max-w-[98vw]">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 mb-8 text-center">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 rounded-2xl flex items-center justify-center">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Historial de Paseos</h1>
                <p className="text-gray-600 dark:text-gray-400">Revisa todos tus paseos completados</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-600 dark:text-green-400 text-sm font-semibold">{paseos.length} paseos completados</span>
            </div>
          </div>
        </div>

        {/* Paseos Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
          {paseos.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-4xl">🐾</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                No hay paseos en el historial
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Cuando completes paseos, aparecerán aquí para que puedas revisarlos.
              </p>
              <Button 
                onClick={() => router.push('/dashboard')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 text-white px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300"
              >
                Ir al Dashboard
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 w-full max-w-full min-w-0">
                {currentPaseos.map((paseo) => (
                  <div key={paseo.id} className="bg-white dark:bg-gray-700 rounded-xl p-4 sm:p-6 shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 w-full max-w-[98vw] lg:max-w-sm xl:max-w-xs min-w-0 text-sm overflow-x-auto flex flex-col">
                    {/* Pet Header */}
                    <div className="flex items-center gap-3 mb-4 min-w-0 w-full">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800 dark:to-purple-800 rounded-xl flex items-center justify-center">
                        <span className="text-xl lg:text-2xl">{getMascotaIcon(paseo.mascota?.especie || '')}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-base lg:text-lg truncate">{paseo.mascota?.nombre}</h3>
                        <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 truncate">{paseo.mascota?.especie}</p>
                      </div>
                      <Badge className={`${getEstadoBadge(paseo.estado)} text-xs`}>
                        {paseo.estado}
                      </Badge>
                    </div>

                    {/* Walk Details */}
                    <div className="space-y-2 lg:space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{new Date(paseo.fecha).toLocaleDateString('es-ES')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                        <TimerIcon className="h-4 w-4" />
                        <span>{paseo.horaInicio ? paseo.horaInicio.slice(0,5) : 'N/A'} • {paseo.duracion} min</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                        <DollarSignIcon className="h-4 w-4" />
                        <span>${paseo.precio}</span>
                      </div>
                      {paseo.paseador && (
                        <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                          <span className="text-lg">👨‍🦱</span>
                          <span>{paseo.paseador.nombre}</span>
                        </div>
                      )}
                    </div>

                    {/* Content wrapper with flex-grow */}
                    <div className="flex-grow">
                      {/* Rating */}
                      {paseo.calificacion && (
                        <div className="flex items-center gap-2 mb-4">
                          <Rating value={paseo.calificacion.puntuacion} readonly size="sm" />
                          <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">({paseo.calificacion.puntuacion}/5)</span>
                        </div>
                      )}
                    </div>

                    {/* Actions - Always at bottom */}
                    <div className="flex flex-col gap-2 w-full min-w-0 lg:flex-row lg:gap-2 mt-auto pt-4">
                      <Button
                        onClick={() => handleViewRoute(paseo.id)}
                        className="flex-1 w-full bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 text-white py-2 rounded-xl hover:scale-105 transition-all duration-300 text-xs lg:text-sm"
                      >
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        Ver Ruta
                      </Button>
                      {(!paseo.calificacion && userProfile?.rol === 'DUENO') && (
                        <CalificarPaseoModal paseo={paseo} onCalificacionRegistrada={handleCalificacionRegistrada}>
                          <Button className="flex-1 w-full bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-yellow-600 dark:to-orange-600 text-white py-2 rounded-xl hover:scale-105 transition-all duration-300 text-xs lg:text-sm">
                            <StarIcon className="h-4 w-4 mr-1" />
                            Calificar
                          </Button>
                        </CalificarPaseoModal>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Route Modal */}
        <Dialog open={showRouteModal} onOpenChange={setShowRouteModal}>
          <DialogContent className="sm:max-w-[800px] h-[600px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPinIcon className="h-5 w-5" />
                Ruta del Paseo
              </DialogTitle>
            </DialogHeader>
            <div className="w-full h-[500px] rounded-xl overflow-hidden">
              <MapWithNoSSR coords={routeCoords} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  );
};

export default HistorialPaseosPage; 