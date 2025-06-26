"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StarIcon, CalendarIcon, ClockIcon, DogIcon, ChevronDownIcon, ChevronUpIcon, Cat } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { fetchUserProfile } from '@/lib/api/user';
import { obtenerMisPaseos, obtenerPaseosPaseador } from '../../../lib/api/paseos';
import CalificarPaseoModal from '@/components/shared/CalificarPaseoModal';
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

const ITEMS_PER_PAGE = 9;

const getMascotaIcon = (especie: string) => {
  if (especie?.toLowerCase().includes('gato')) return <Cat className="h-6 w-6 mr-2" />;
  return <DogIcon className="h-6 w-6 mr-2" />;
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

  const toggleExpand = (paseoId: number) => {
    setExpandedPaseos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(paseoId)) {
        newSet.delete(paseoId);
      } else {
        newSet.add(paseoId);
      }
      return newSet;
    });
  };

  const totalPages = Math.ceil(paseos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPaseos = paseos.slice(startIndex, endIndex);

  if (loading) {
    return <GlobalLoader />;
  }

  if (error) {
    return (
      <ErrorBoundary>
        <div className="container mx-auto py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <p className="text-red-600">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                Intentar de nuevo
              </Button>
            </CardContent>
          </Card>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto py-8">
        {paseoEnCurso && (
          <Card className="mb-8 border-green-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <ClockIcon className="h-6 w-6" /> Paseo en Curso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="font-bold text-lg">Mascota: {paseoEnCurso.mascota?.nombre}</div>
                  <div className="text-gray-600 text-sm">Inicio: {new Date(paseoEnCurso.fecha).toLocaleDateString('es-ES')} {paseoEnCurso.horaInicio ? paseoEnCurso.horaInicio.slice(0,5) : 'N/A'}</div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => router.push(`/dashboard/paseos/${paseoEnCurso.id}`)} className="bg-green-600 text-white">Ver Tracking en Vivo</Button>
                  <Button onClick={() => handleViewRoute(paseoEnCurso.id)} className="bg-blue-600 text-white">Ver Ruta Histórica</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <div className="w-full min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 py-8">
          <Card className="bg-transparent shadow-none border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-6 w-6" />
                Historial de Paseos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paseos.length === 0 ? (
                <div className="text-center py-12">
                  <DogIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay paseos en el historial
                  </h3>
                  <p className="text-gray-500">
                    Cuando completes paseos, aparecerán aquí para que puedas calificarlos.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {currentPaseos.map((paseo) => {
                      const isExpanded = expandedPaseos.has(paseo.id);
                      return (
                        <div key={paseo.id} className="flex flex-col items-center">
                          <button
                            className={`flex items-center justify-center rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 w-full shadow-lg border-2 border-green-600 focus:outline-none transition-all duration-300 hover:scale-105 ${isExpanded ? 'ring-2 ring-primary' : ''}`}
                            style={{ minWidth: '180px', maxWidth: '320px' }}
                            onClick={() => toggleExpand(paseo.id)}
                            aria-expanded={isExpanded}
                          >
                            {getMascotaIcon(paseo.mascota?.especie || '')}
                            <span className="font-semibold text-lg truncate">{paseo.mascota?.nombre || 'Mascota'}</span>
                            <span className="ml-4">{isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}</span>
                          </button>
                          <div
                            className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[600px] opacity-100 scale-100 mt-2' : 'max-h-0 opacity-0 scale-95 mt-0'}`}
                            style={{ width: '100%', maxWidth: '420px' }}
                          >
                            {isExpanded && (
                              <div className="bg-white rounded-xl shadow-xl p-6 w-full flex flex-col gap-2 border border-gray-200 animate-fade-in">
                                <div className="flex items-center gap-3 mb-2">
                                  {getMascotaIcon(paseo.mascota?.especie || '')}
                                  <span className="font-bold text-2xl text-primary-foreground">{paseo.mascota?.nombre}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-gray-700 text-sm">
                                  <div><span className="font-medium">Fecha:</span> {new Date(paseo.fecha).toLocaleDateString('es-ES')}</div>
                                  <div><span className="font-medium">Hora:</span> {paseo.horaInicio ? paseo.horaInicio.slice(0,5) : 'N/A'}</div>
                                  <div><span className="font-medium">Duración:</span> {paseo.duracion} min</div>
                                  <div><span className="font-medium">Precio:</span> ${paseo.precio}</div>
                                  <div className="col-span-2"><span className="font-medium">Estado:</span> {paseo.estado}</div>
                                  <div className="col-span-2"><span className="font-medium">Paseador:</span> {paseo.paseador?.nombre || 'N/A'}</div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                                  <button
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-full transition-all duration-300 w-full sm:w-auto shadow-md"
                                    onClick={() => handleViewRoute(paseo.id)}
                                  >
                                    Ver Ruta
                                  </button>
                                  {(!paseo.calificacion && userProfile?.rol === 'DUENO') && (
                                    <CalificarPaseoModal paseo={paseo} onCalificacionRegistrada={handleCalificacionRegistrada}>
                                      <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-full transition-all duration-300 w-full sm:w-auto shadow-md">
                                        Calificar Paseador
                                      </button>
                                    </CalificarPaseoModal>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
            </CardContent>
          </Card>
        </div>

        <Dialog open={showRouteModal} onOpenChange={setShowRouteModal}>
          <DialogContent className="sm:max-w-[800px] h-[600px]">
            <DialogHeader>
              <DialogTitle>Ruta del Paseo</DialogTitle>
            </DialogHeader>
            <div className="w-full h-[500px]">
              <MapWithNoSSR coords={routeCoords} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  );
};

export default HistorialPaseosPage; 