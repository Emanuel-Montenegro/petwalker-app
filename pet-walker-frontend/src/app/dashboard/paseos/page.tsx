'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { fetchAvailableWalks, acceptWalk } from '@/lib/api/user';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Paseo } from '@/types';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerMisPaseosComoPaseador } from '@/lib/api/paseos';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { iniciarPaseo, finalizarPaseo } from '@/lib/api/paseos';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  PlayIcon, 
  StopCircleIcon,
  CheckCircleIcon,
  TimerIcon,
  DollarSignIcon,
  UserIcon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { getPaseos, crearPaseo, actualizarPaseo, cancelarPaseo } from '@/lib/api/paseos';
import { getPets } from '@/lib/api/pets';
import { getUsuarios } from '@/lib/api/user';
import { PremiumCalendar } from '@/components/shared/PremiumCalendar';

export default function PaseosPage() {
  const { isAuthenticated, usuario } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [showActive, setShowActive] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedWalkId, setSelectedWalkId] = useState<number | null>(null);
  const [pendingWalks, setPendingWalks] = useState<Paseo[]>([]);
  const [activeWalks, setActiveWalks] = useState<Paseo[]>([]);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [startingId, setStartingId] = useState<number | null>(null);
  const [finishingId, setFinishingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    mascotaId: '',
    paseadorId: '',
    fecha: '',
    hora: '',
    duracion: '',
    precio: '',
    notas: '',
  });
  const [paseoEditando, setPaseoEditando] = useState(false);
  const [mascotas, setMascotas] = useState([]);
  const [paseadores, setPaseadores] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (usuario?.rol !== 'PASEADOR') {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, usuario, router]);

  const { data: availableWalks, isLoading: isLoadingWalks, isError: isErrorWalks, error: walksError, refetch: refetchAvailableWalks } = useQuery<Paseo[]> ({
    queryKey: ['availableWalks'],
    queryFn: () => fetchAvailableWalks(),
    enabled: isAuthenticated && usuario?.rol === 'PASEADOR',
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const { data: myWalks, isLoading: isLoadingMyWalks, isError: isErrorMyWalks, refetch: refetchMyWalks } = useQuery<Paseo[]>({
    queryKey: ['myWalks'],
    queryFn: () => usuario && usuario.id ? obtenerMisPaseosComoPaseador(usuario.id) : Promise.resolve([]),
    enabled: isAuthenticated && usuario?.rol === 'PASEADOR' && !!usuario?.id,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (myWalks) {
      setPendingWalks(myWalks.filter(p => p.estado === 'ACEPTADO'));
      setActiveWalks(myWalks.filter(p => p.estado === 'EN_CURSO'));
    }
  }, [myWalks]);

  // Filtrar paseos disponibles para mostrar solo los que no tienen paseador asignado
  const paseosDisponibles = (availableWalks || []).filter(p => p.estado === 'PENDIENTE' && !p.paseadorId);

  const handleAcceptWalk = async (walkId: number) => {
    if (!usuario || usuario?.rol !== 'PASEADOR') return;
    setSelectedWalkId(walkId);
    setShowConfirmModal(true);
  };

  const confirmAcceptWalk = async () => {
    if (!selectedWalkId || !usuario) return;
    try {
      setAcceptingId(selectedWalkId);
      toast.info("Aceptando paseo...");
      await acceptWalk(selectedWalkId, usuario.id);
      toast.success("Paseo aceptado exitosamente!");
      await refetchMyWalks();
      await refetchAvailableWalks();
      setShowConfirmModal(false);
    } catch (error: any) {
      console.error('Error al aceptar paseo:', error);
      toast.error(error.message || "No se pudo aceptar el paseo.");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleStartWalk = async (walkId: number) => {
    try {
      setStartingId(walkId);
      toast.info("Iniciando paseo...");
      await iniciarPaseo(walkId);
      toast.success("Paseo iniciado exitosamente!");
      await refetchMyWalks();
    } catch (error: any) {
      console.error('Error al iniciar paseo:', error);
      toast.error(error.message || "No se pudo iniciar el paseo.");
    } finally {
      setStartingId(null);
    }
  };

  const handleFinishWalk = async (walkId: number) => {
    try {
      setFinishingId(walkId);
      toast.info("Finalizando paseo...");
      await finalizarPaseo(walkId);
      toast.success("Paseo finalizado exitosamente!");
      await refetchMyWalks();
    } catch (error: any) {
      console.error('Error al finalizar paseo:', error);
      toast.error(error.message || "No se pudo finalizar el paseo.");
    } finally {
      setFinishingId(null);
    }
  };

  const getMascotaIcon = (especie: string) => {
    if (especie?.toLowerCase().includes('gato')) return '🐱';
    return '🐕';
  };

  if (isLoadingWalks && isLoadingMyWalks) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-gray-700 font-medium">Cargando paseos...</span>
          </div>
        </div>
      </div>
    );
  }

  if (isErrorWalks || isErrorMyWalks) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error al cargar</h3>
          <p className="text-red-600 mb-4">{walksError?.message || 'No se pudieron cargar los paseos.'}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-xl hover:scale-105 transition-all duration-300"
          >
            Intentar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  // Mostrar mensaje si no hay paseos disponibles ni pendientes
  if (paseosDisponibles.length === 0 && pendingWalks.length === 0 && activeWalks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-4xl">🐾</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay paseos disponibles</h3>
          <p className="text-gray-600 mb-6">No hay paseos disponibles en este momento. Vuelve más tarde.</p>
          <Button 
            onClick={() => router.push('/dashboard')}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300"
          >
            Ir al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                <MapPinIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Paseos</h1>
                <p className="text-gray-600">Acepta, inicia y gestiona tus paseos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 text-sm font-semibold">
                ● {paseosDisponibles.length + pendingWalks.length + activeWalks.length} paseos
              </span>
            </div>
          </div>
        </div>

        {/* Paseos en Curso - Priority */}
        {activeWalks.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                <PlayIcon className="h-6 w-6 text-white" />
              </div>
                  <div>
                <h2 className="text-2xl font-semibold text-green-800">Paseos en Curso</h2>
                <p className="text-green-600">Paseos activos con tracking en vivo</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 text-sm font-semibold">● En vivo</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeWalks.map((paseo: Paseo) => (
                <div key={paseo.id} className="bg-white rounded-xl p-6 shadow-md border border-green-200 hover:shadow-lg transition-all duration-300">
                  {/* Pet Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">{getMascotaIcon(paseo.mascota?.especie || '')}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg">{paseo.mascota?.nombre}</h3>
                      <p className="text-sm text-gray-600">{paseo.mascota?.especie}</p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>

                  {/* Walk Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{new Date(paseo.fecha).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <TimerIcon className="h-4 w-4" />
                      <span>{paseo.horaInicio ? paseo.horaInicio.slice(0,5) : 'N/A'} • {paseo.duracion} min</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSignIcon className="h-4 w-4" />
                      <span>${paseo.precio}</span>
                    </div>
                  </div>

                  {/* Live Status */}
                  <div className="bg-green-50 rounded-lg p-3 mb-4 border border-green-200">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-700 text-sm font-semibold">Paseo en curso</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button 
                      onClick={() => router.push(`/dashboard/paseos/${paseo.id}?enCurso=1`)} 
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-xl hover:scale-105 transition-all duration-300"
                    >
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      Ver Tracking en Vivo
                    </Button>
                    <Button 
                      onClick={() => handleFinishWalk(paseo.id)} 
                      className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-2 rounded-xl hover:scale-105 transition-all duration-300" 
                      disabled={finishingId === paseo.id}
                    >
                                             <StopCircleIcon className="h-4 w-4 mr-2" />
                      {finishingId === paseo.id ? 'Finalizando...' : 'Finalizar Paseo'}
                  </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
      )}

        {/* Paseos Pendientes */}
      {pendingWalks.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">Paseos Aceptados</h2>
                <p className="text-gray-600">Listos para iniciar</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingWalks.map((paseo: Paseo) => (
                <div key={paseo.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 shadow-md border border-yellow-200 hover:shadow-lg transition-all duration-300">
                  {/* Pet Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">{getMascotaIcon(paseo.mascota?.especie || '')}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg">{paseo.mascota?.nombre}</h3>
                      <p className="text-sm text-gray-600">{paseo.mascota?.especie}</p>
                    </div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  </div>

                  {/* Walk Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{new Date(paseo.fecha).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <TimerIcon className="h-4 w-4" />
                      <span>{paseo.horaInicio ? paseo.horaInicio.slice(0,5) : 'N/A'} • {paseo.duracion} min</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSignIcon className="h-4 w-4" />
                      <span>${paseo.precio}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="bg-yellow-100 rounded-lg p-3 mb-4 border border-yellow-200">
                    <span className="text-yellow-700 text-sm font-semibold">Listo para iniciar</span>
                  </div>

                  {/* Action */}
                  <Button 
                    onClick={() => handleStartWalk(paseo.id)} 
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 rounded-xl hover:scale-105 transition-all duration-300" 
                    disabled={startingId === paseo.id}
                  >
                    <PlayIcon className="h-4 w-4 mr-2" />
                    {startingId === paseo.id ? 'Iniciando...' : 'Iniciar Paseo'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
      )}

        {/* Paseos Disponibles */}
        {paseosDisponibles.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
                  <div>
                <h2 className="text-2xl font-semibold text-gray-800">Paseos Disponibles</h2>
                <p className="text-gray-600">Nuevas oportunidades para aceptar</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paseosDisponibles.map((paseo: Paseo) => (
                <div key={paseo.id} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 shadow-md border border-blue-200 hover:shadow-lg transition-all duration-300 group">
                  {/* Pet Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">{getMascotaIcon(paseo.mascota?.especie || '')}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg">{paseo.mascota?.nombre}</h3>
                      <p className="text-sm text-gray-600">{paseo.mascota?.especie}</p>
                    </div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>

                  {/* Walk Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{new Date(paseo.fecha).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <TimerIcon className="h-4 w-4" />
                      <span>{paseo.horaInicio ? paseo.horaInicio.slice(0,5) : 'N/A'} • {paseo.duracion} min</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSignIcon className="h-4 w-4" />
                      <span>${paseo.precio}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="bg-blue-100 rounded-lg p-3 mb-4 border border-blue-200">
                    <span className="text-blue-700 text-sm font-semibold">Disponible</span>
                  </div>

                  {/* Action */}
                  <Button 
                    onClick={() => handleAcceptWalk(paseo.id)} 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-xl hover:scale-105 transition-all duration-300 group-hover:shadow-lg" 
                    disabled={acceptingId === paseo.id}
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    {acceptingId === paseo.id ? 'Aceptando...' : 'Aceptar Paseo'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
      )}
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-blue-500" />
              Confirmar Aceptación
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 mb-4">¿Estás seguro de que deseas aceptar este paseo?</p>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmModal(false)}
                className="px-6 py-2 rounded-xl"
              >
                Cancelar
              </Button>
              <Button 
                onClick={confirmAcceptWalk}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-xl hover:scale-105 transition-all duration-300"
              >
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 