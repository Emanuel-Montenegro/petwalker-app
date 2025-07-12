'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserProfile, addPet, scheduleWalk } from '@/lib/api/user';
import { fetchAvailableWalks, acceptWalk, obtenerPaseosPaseador, obtenerMisPaseos } from '@/lib/api/paseos';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Paseo, Mascota, UserProfile } from '@/types';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toaster, toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import BottomSheetScheduleModal from '@/components/shared/BottomSheetScheduleModal';
import PremiumScheduleModal from '@/components/shared/PremiumScheduleModal';
import { format, addDays, startOfWeek, addWeeks, isSameDay, isToday, isBefore } from "date-fns";
import { es } from 'date-fns/locale';
import { ConfirmationModal } from '@/components/shared/ConfirmationModal';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LiveWalkCard } from '@/components/dashboard/live-walk-card';
import { PetStatusCard } from '@/components/dashboard/pet-status-card';
import { LiveWalkGroupCard } from '@/components/dashboard/live-walk-group-card';
import { useIsMobile } from '@/lib/utils';
import ClientHydrationWrapper from '@/components/shared/ClientHydrationWrapper';

const TIPOS_PASEO = {
  EXPRESS: {
    nombre: "Paseo Express",
    descripcion: "Ideal para perros activos que necesitan un paseo rápido",
    duracion: 20,
    precio: 15
  },
  NORMAL: {
    nombre: "Paseo Normal",
    descripcion: "Paseo estándar para mantener a tu mascota saludable",
    duracion: 45,
    precio: 25
  },
  EXTENDIDO: {
    nombre: "Paseo Extendido",
    descripcion: "Paseo más largo para perros con mucha energía",
    duracion: 60,
    precio: 35
  },
  PREMIUM: {
    nombre: "Paseo Premium",
    descripcion: "Paseo largo con atención personalizada",
    duracion: 90,
    precio: 45
  }
} as const;

const TIPOS_SERVICIO = {
  INDIVIDUAL: {
    nombre: "Individual",
    descripcion: "Paseo personalizado, ideal para perros con problemas de conducta o tímidos",
    precioMultiplier: 1.5
  },
  GRUPAL: {
    nombre: "Grupal",
    descripcion: "Paseo en grupo de 4-6 perros",
    precioMultiplier: 1
  },
  CON_ENTRENAMIENTO: {
    nombre: "Con Entrenamiento",
    descripcion: "Combina caminata con comandos básicos, ideal para cachorros",
    precioMultiplier: 1.8
  }
} as const;

const formSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  especie: z.string().min(2, { message: "La especie debe tener al menos 2 caracteres." }),
  raza: z.string().min(2, { message: "La raza debe tener al menos 2 caracteres." }),
  edad: z.number().min(0, { message: "La edad debe ser un número positivo." }),
  sociable: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

const scheduleWalkSchema = z.object({
  fecha: z.date({
    required_error: "La fecha del paseo es requerida.",
  }),
  hora: z.string()
    .min(1, { message: "La hora es requerida." })
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Formato de hora inválido (HH:MM)." }),
  tipoPaseo: z.enum(['EXPRESS', 'NORMAL', 'EXTENDIDO', 'PREMIUM']),
  tipoServicio: z.enum(['INDIVIDUAL', 'GRUPAL', 'CON_ENTRENAMIENTO']),
});

type ScheduleWalkFormData = z.infer<typeof scheduleWalkSchema>;

// Premium Calendar Component
const PremiumCalendar = ({ selectedDate, onDateSelect }: { selectedDate: Date | undefined, onDateSelect: (date: Date) => void }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startDate = startOfWeek(currentMonth, { weekStartsOn: 1 });
  const days = Array.from({ length: 42 }, (_, i) => addDays(startDate, i));
  
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  
  return (
    <div className="bg-white rounded-xl shadow-2xl border-0 p-4 w-80">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setCurrentMonth(addWeeks(currentMonth, -4))}
          className="p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200"
        >
          <span className="text-blue-500 text-lg">←</span>
        </button>
        
        <h3 className="text-lg font-bold text-gray-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          type="button"
          onClick={() => setCurrentMonth(addWeeks(currentMonth, 4))}
          className="p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200"
        >
          <span className="text-blue-500 text-lg">→</span>
        </button>
      </div>
      
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          const isPastDate = isBefore(day, today);
          const isDisabled = !isCurrentMonth || isPastDate;
          
      return (
            <button
              key={index}
              type="button"
              onClick={() => !isDisabled && onDateSelect(day)}
              disabled={isDisabled}
              className={`
                p-2 text-sm rounded-lg transition-all duration-200 relative
                ${isDisabled 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-blue-50 cursor-pointer'
                }
                ${isSelected 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105' 
                  : ''
                }
                ${isTodayDate && !isSelected 
                  ? 'bg-blue-100 text-blue-700 font-semibold ring-2 ring-blue-200' 
                  : ''
                }
              `}
            >
              {day.getDate()}
              {isTodayDate && !isSelected && (
                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
            <span>Seleccionado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-100 rounded"></div>
            <span>Hoy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { isAuthenticated, logout, usuario, isInitialized } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [openAddPetDialog, setOpenAddPetDialog] = useState(false);
  const [openScheduleWalkDialog, setOpenScheduleWalkDialog] = useState(false);
  const [selectedMascota, setSelectedMascota] = useState<Mascota | null>(null);
  const [precioTotal, setPrecioTotal] = useState(0);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationModalTitle, setConfirmationModalTitle] = useState('');
  const [confirmationModalMessage, setConfirmationModalMessage] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const { data: userProfile, isLoading, isError, error } = useQuery<UserProfile>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profile = await fetchUserProfile();
      if (!profile || typeof profile.rol === 'undefined') {
        throw new Error('User profile or role missing.');
      }
      return {
        ...profile,
        mascotas: profile.mascotas || []
      };
    },
    enabled: isAuthenticated && isInitialized,
    staleTime: 5 * 60 * 1000,
  });

  const { data: availableWalks, isLoading: isLoadingWalks, isError: isErrorWalks, error: errorWalks } = useQuery<Paseo[]>({
    queryKey: ['availableWalks'],
    queryFn: async () => {
      const walks = await fetchAvailableWalks();
      return walks;
    },
    enabled: isAuthenticated && userProfile?.rol === 'PASEADOR',
    staleTime: 5 * 60 * 1000,
  });

  const { data: misPaseos, isLoading: isLoadingMisPaseos } = useQuery<Paseo[]>({
    queryKey: ['misPaseos'],
    queryFn: async () => {
      if (!userProfile?.id) return [];
      const paseos = await obtenerPaseosPaseador(userProfile.id);
      return paseos;
    },
    enabled: isAuthenticated && userProfile?.rol === 'PASEADOR',
    staleTime: 5 * 60 * 1000,
  });

  const { data: liveWalks } = useQuery<Paseo[]>({
    queryKey: ['liveWalks'],
    queryFn: async () => {
      const paseos = await obtenerMisPaseos();
      return paseos.filter(p => p.estado?.startsWith('EN_CUR') || p.estado?.startsWith('INICI'));
    },
    enabled: isAuthenticated && usuario?.rol === 'DUENO',
    staleTime: 30 * 1000,
  });

  const { mutate: addPetMutate } = useMutation({
    mutationFn: (newPetData: { nombre: string; especie: string; raza: string; edad: number; sociable: boolean; usuarioId: number; }) => {
      return addPet(newPetData);
    },
    onSuccess: () => {
      toast.success("Mascota agregada exitosamente!");
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setOpenAddPetDialog(false);
      setConfirmationModalTitle("Mascota Agregada");
      setConfirmationModalMessage("Tu mascota ha sido agregada exitosamente.");
      setShowConfirmationModal(true);
    },
    onError: (error: any) => {
      toast.error(error.message || 'No se pudo agregar la mascota.');
    },
  });

  const { mutate: scheduleWalkMutate } = useMutation({
    mutationFn: async (walkData: { mascotaId: number; fecha: string; hora: string; horaInicio: string; duracion: number; usuarioId: number; tipoServicio: string; precio: number; origenLatitud: number; origenLongitud: number; }) => {
      return scheduleWalk(walkData);
    },
    onSuccess: () => {
      toast.success("Paseo programado exitosamente!");
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setOpenScheduleWalkDialog(false);
      setSelectedMascota(null);
      setConfirmationModalTitle("Paseo Solicitado");
      setConfirmationModalMessage("Tu solicitud de paseo ha sido enviada exitosamente. Un paseador la aceptará pronto.");
      setShowConfirmationModal(true);
    },
    onError: (error: any) => {
      toast.error(error.message || 'No se pudo programar el paseo.');
    },
  });

  const acceptWalkMutate = useMutation({
    mutationFn: async ({ walkId, paseadorId }: { walkId: number; paseadorId: number }) => {
      try {
        const result = await acceptWalk(walkId, paseadorId);
        return result;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableWalks'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success("Paseo aceptado exitosamente!");
      setConfirmationModalTitle("Paseo Aceptado");
      setConfirmationModalMessage("Has aceptado este paseo exitosamente. ¡A preparar las patitas!");
      setShowConfirmationModal(true);
    },
    onError: (error: any) => {
      toast.error(error.message || 'No se pudo aceptar el paseo.');
    }
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: '',
      especie: '',
      raza: '',
      edad: 0,
      sociable: false,
    },
  });

  const scheduleWalkForm = useForm<ScheduleWalkFormData>({
    resolver: zodResolver(scheduleWalkSchema),
    defaultValues: {
      hora: '',
      tipoPaseo: 'NORMAL',
      tipoServicio: 'GRUPAL',
    },
    mode: 'onTouched',
  });

  // Marcar cuando el componente está montado
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (openScheduleWalkDialog) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [openScheduleWalkDialog]);

  // Calcular precio total cuando cambian los valores
  useEffect(() => {
    const tipoPaseo = scheduleWalkForm.watch('tipoPaseo');
    const tipoServicio = scheduleWalkForm.watch('tipoServicio');
    
    if (tipoPaseo && tipoServicio) {
      const precioBase = TIPOS_PASEO[tipoPaseo].precio;
      const multiplier = TIPOS_SERVICIO[tipoServicio].precioMultiplier;
      setPrecioTotal(precioBase * multiplier);
    }
  }, [scheduleWalkForm.watch('tipoPaseo'), scheduleWalkForm.watch('tipoServicio')]);

  useEffect(() => {
    if (!isInitialized) {
        return;
      }

    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  const onSubmitAddPet = (data: FormData) => {
    if (!userProfile) {
      toast.error("Error: No se pudo obtener el perfil del usuario.");
      return;
    }
    addPetMutate({ ...data, usuarioId: userProfile.id });
  };

  const onSubmitScheduleWalk = (data: ScheduleWalkFormData) => {
    if (!selectedMascota || !userProfile) {
      toast.error("Error: No se pudo obtener la mascota o el perfil del usuario.");
      return;
    }
    if (!data.hora || !/^\d{2}:\d{2}$/.test(data.hora)) {
      toast.error("Por favor selecciona una hora válida para el paseo.");
      return;
    }

    try {
      const formattedDate = format(data.fecha, "yyyy-MM-dd");
      const duracion = TIPOS_PASEO[data.tipoPaseo].duracion;

      const walkData = {
        mascotaId: selectedMascota.id,
        fecha: formattedDate,
        hora: data.hora,
        horaInicio: data.hora,
        duracion: duracion,
        usuarioId: userProfile.id,
        tipoServicio: data.tipoServicio,
        precio: precioTotal,
        origenLatitud: 0,
        origenLongitud: 0
      };

      scheduleWalkMutate(walkData);
    } catch (error) {
      toast.error("Error al preparar los datos del paseo. Por favor, intente nuevamente.");
    }
  };

  const handleScheduleWalkClick = (mascota: Mascota) => {
    setSelectedMascota(mascota);
    setOpenScheduleWalkDialog(true);
  };

  const isMobile = useIsMobile();

  if (isLoading || isLoadingWalks || isLoadingMisPaseos) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (isError || isErrorWalks) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-800">Error al cargar datos</h3>
          </div>
          <p className="text-gray-600">{error?.message || errorWalks?.message || 'No se pudieron cargar los datos.'}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg max-w-md mx-auto text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Acceso Denegado</h3>
          <p className="text-gray-600 mb-4">Por favor, inicia sesión para ver esta página.</p>
          <Button 
            onClick={() => router.push('/login')}
            className="bg-gradient-to-r from-blue-500 to-pink-500 text-white font-semibold px-6 py-2 rounded-xl hover:scale-105 transition-all duration-300"
          >
            Iniciar Sesión
          </Button>
        </div>
      </div>
  );
  }

  if (usuario?.rol === 'PASEADOR') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          {/* Welcome Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">🏃‍♂️</span>
              </div>
              <h1 className="text-3xl font-light text-gray-800 dark:text-gray-200 mb-2">
                ¡Bienvenido, <span className="bg-gradient-to-r from-blue-600 via-pink-500 to-purple-600 bg-clip-text text-transparent font-medium">{userProfile?.nombre}</span>!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Panel de control para paseadores</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-blue-200 dark:border-gray-600">
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">Paseos Disponibles</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Encuentra y acepta nuevos paseos</p>
                <Button 
                  onClick={() => router.push('/dashboard/paseos')}
                  className="w-full bg-gradient-to-r from-blue-500 to-pink-500 dark:from-blue-600 dark:to-pink-600 text-white font-semibold py-2 rounded-xl hover:scale-105 transition-all duration-300"
                >
                  Ver Paseos Disponibles
                </Button>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-white dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-green-200 dark:border-gray-600">
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">Mis Paseos</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Gestiona tus paseos aceptados</p>
                <Button 
                  onClick={() => router.push('/dashboard/historial')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 text-white font-semibold py-2 rounded-xl hover:scale-105 transition-all duration-300"
                >
                  Ver Mis Paseos
                </Button>
              </div>
            </div>
          </div>

          {/* Available Walks */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-light text-gray-800 dark:text-gray-200 mb-6">Paseos Disponibles</h2>
            
            {availableWalks && availableWalks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableWalks.map((walk) => (
                  <div key={walk.id} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-600 dark:to-orange-700 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">🐕</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{walk.mascota?.nombre || 'Mascota'}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{walk.mascota?.especie || 'Especie'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <p><span className="font-medium">Fecha:</span> {walk.fecha}</p>
                      <p><span className="font-medium">Hora:</span> {walk.horaInicio}</p>
                      <p><span className="font-medium">Duración:</span> {walk.duracion} min</p>
                      <p><span className="font-medium">Precio:</span> ${walk.precio}</p>
                    </div>
                    
                    <Button 
                      onClick={() => acceptWalkMutate.mutate({ walkId: walk.id, paseadorId: userProfile.id })}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 text-white font-semibold py-2 rounded-xl hover:scale-105 transition-all duration-300"
                      disabled={acceptWalkMutate.isPending}
                    >
                      {acceptWalkMutate.isPending ? 'Aceptando...' : 'Aceptar Paseo'}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-4xl">🚶‍♂️</span>
                </div>
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">No hay paseos disponibles</h3>
                <p className="text-gray-600 dark:text-gray-400">Vuelve más tarde para ver nuevos paseos</p>
              </div>
            )}
              </div>
        
        <ConfirmationModal 
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          title={confirmationModalTitle}
          message={confirmationModalMessage}
        />
        
        <Toaster />
      </div>
    );
  }

  // DUEÑO Dashboard
    return (
    <>
        {/* Welcome Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 shadow-lg dark:shadow-gray-900/50 mb-8 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 rounded-2xl mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">👨‍👩‍👧‍👦</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-light text-gray-800 dark:text-gray-200 mb-2">
                ¡Bienvenido, <span className="bg-gradient-to-r from-blue-600 via-pink-500 to-purple-600 bg-clip-text text-transparent font-medium">{userProfile?.nombre}</span>!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Panel de control para dueños de mascotas</p>
            </div>
            
                <Button onClick={() => setOpenAddPetDialog(true)} className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-pink-500 dark:from-blue-600 dark:to-pink-600 text-white font-semibold px-6 py-3 rounded-xl mt-4 sm:mt-0">
                  <span className="mr-2">🐕</span>
                      Agregar Nueva Mascota
                    </Button>
                      </div>
                      </div>



        {/* Paseo en Curso */}
        {liveWalks && liveWalks.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 border border-green-200 dark:border-gray-600 rounded-2xl p-6 shadow-lg mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 dark:bg-green-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-2xl">⏰</span>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-green-800 dark:text-green-300">Paseo en Curso</h2>
                  <p className="text-green-600 dark:text-green-400">Seguimiento en tiempo real</p>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-600 dark:text-green-400 text-sm font-semibold">● En vivo</span>
              </div>
            </div>
            {liveWalks.map((paseo) => (
              <div key={paseo.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
                <span className="text-3xl">{paseo.mascota?.especie?.toLowerCase().includes('gato') ? '🐱' : '🐶'}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 dark:text-gray-200">{paseo.mascota?.nombre}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(paseo.fecha).toLocaleDateString('es-ES', { 
                      day: '2-digit', 
                      month: '2-digit' 
                    })} • {paseo.horaInicio?.slice(0, 5) || 'N/A'}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 text-white text-xs sm:text-sm px-3 py-2 rounded-lg whitespace-nowrap" 
                  onClick={() => router.push(`/dashboard/paseos/${paseo.id}`)}
                >
                  Ver Tracking
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Widgets Premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {/* Estado de Mascotas */}
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 shadow-xl glass-morphism animate-fade-in flex flex-col justify-between min-h-[220px] border border-green-200/50 dark:border-gray-600">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 text-lg">Estado de Mascotas</h3>
            {userProfile.mascotas?.length ? userProfile.mascotas.slice(0,2).map((m) => (
              <div key={m.id} className="flex flex-col gap-3 mb-4 p-3 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 bg-white/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-2xl">{m.especie?.toLowerCase().includes('gato') ? '🐱' : '🐶'}</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{m.nombre}</span>
                  <span className={`text-xs px-2 py-1 rounded-lg ${liveWalks?.some(w => w.mascotaId === m.id) ? 'bg-blue-200 text-blue-700 dark:bg-blue-800 dark:text-blue-300 animate-pulse' : 'bg-gray-200 text-gray-500 dark:bg-gray-600 dark:text-gray-400'}`}>
                    {liveWalks?.some(w => w.mascotaId === m.id) ? 'En paseo' : 'Disponible'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Button size="sm" variant="outline" className="flex-1 h-8 text-xs rounded-lg border-gray-300 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:bg-gray-800 min-w-0 whitespace-nowrap" onClick={() => router.push(`/dashboard/mascotas/${m.id}`)}>
                    Ver
                  </Button>
                  <Button size="sm" className="flex-1 h-8 text-xs rounded-lg bg-gradient-to-r from-blue-500 to-green-500 dark:from-blue-600 dark:to-green-600 min-w-0 whitespace-nowrap" onClick={() => { setSelectedMascota(m); setOpenScheduleWalkDialog(true); }}>
                    Agendar
                  </Button>
                </div>
              </div>
            )) : (
              <div className="text-center py-4">
                <span className="text-4xl mb-2 block">🐾</span>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">No tienes mascotas registradas</div>
                <Button size="sm" onClick={() => setOpenAddPetDialog(true)} className="bg-gradient-to-r from-blue-500 to-green-500 dark:from-blue-600 dark:to-green-600 text-white text-xs">
                  Agregar Mascota
                </Button>
              </div>
            )}
          </div>

          {/* Próximos Paseos */}
          <div className="bg-gradient-to-r from-pink-100 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 shadow-xl glass-morphism animate-fade-in flex flex-col justify-between min-h-[220px] border border-pink-200/50 dark:border-gray-600">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 text-lg">Próximos Paseos</h3>
            {(() => {
              const proximosPaseos = misPaseos?.filter(p => p.estado === 'ACEPTADO') || [];
              return proximosPaseos.length > 0 ? (
                <div className="space-y-3">
                  {proximosPaseos.slice(0, 2).map((p) => (
                    <div key={p.id} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{p.mascota?.especie?.toLowerCase().includes('gato') ? '🐱' : '🐶'}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{p.mascota?.nombre}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{p.fecha} • {p.horaInicio}</div>
                          <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded mt-1 inline-block">
                            Aceptado
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {proximosPaseos.length > 2 && (
                    <div className="text-center">
                      <Button size="sm" variant="outline" className="text-xs border-gray-300 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:bg-gray-800" onClick={() => router.push('/dashboard/historial')}>
                        Ver todos ({proximosPaseos.length})
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <span className="text-4xl mb-2 block">📅</span>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">No hay paseos próximos</div>
                  <Button size="sm" variant="outline" className="text-xs border-gray-300 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:bg-gray-800" onClick={() => {
                    if (userProfile.mascotas?.[0]) {
                      setSelectedMascota(userProfile.mascotas[0]);
                      setOpenScheduleWalkDialog(true);
                    } else {
                      toast.error('Primero debes agregar una mascota');
                    }
                  }}>
                    Programar Paseo
                  </Button>
                </div>
              );
            })()}
          </div>

          {/* Paseador Favorito */}
          <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 shadow-xl glass-morphism animate-fade-in flex flex-col justify-between min-h-[220px] border border-blue-200/50 dark:border-gray-600">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 dark:from-blue-600 dark:to-green-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-white text-2xl">👨‍🦲</span>
              </div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-lg">Paseador Favorito</h3>
            </div>
            
            {(() => {
              if (!misPaseos || misPaseos.length === 0) {
                return (
                  <div className="text-center py-4">
                    <span className="text-4xl mb-2 block">🤝</span>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">Aún no tienes un paseador favorito.</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mb-3">¡Programa tu primer paseo!</div>
                    <Button size="sm" variant="outline" className="text-xs border-gray-300 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:bg-gray-800" onClick={() => {
                      if (userProfile.mascotas?.[0]) {
                        setSelectedMascota(userProfile.mascotas[0]);
                        setOpenScheduleWalkDialog(true);
                      } else {
                        toast.error('Primero debes agregar una mascota');
                      }
                    }}>
                      Programar Paseo
                    </Button>
                  </div>
                );
              }

              // Contar frecuencia de paseadores
              const paseadorCount = misPaseos.reduce((acc, paseo) => {
                if (paseo.paseador?.nombre) {
                  acc[paseo.paseador.nombre] = (acc[paseo.paseador.nombre] || 0) + 1;
                }
                return acc;
              }, {} as Record<string, number>);

              const paseadorMasFrecuente = Object.entries(paseadorCount).reduce((max, [nombre, count]) => 
                count > max.count ? { nombre, count } : max, { nombre: '', count: 0 });

              if (paseadorMasFrecuente.count === 0) {
                return (
                  <div className="text-center py-4">
                    <span className="text-4xl mb-2 block">🤝</span>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">Aún no tienes un paseador favorito.</div>
                    <Button size="sm" variant="outline" className="text-xs border-gray-300 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:bg-gray-800" onClick={() => {
                      if (userProfile.mascotas?.[0]) {
                        setSelectedMascota(userProfile.mascotas[0]);
                        setOpenScheduleWalkDialog(true);
                      } else {
                        toast.error('Primero debes agregar una mascota');
                      }
                    }}>
                      Programar Paseo
                    </Button>
                  </div>
                );
              }

              return (
                <div className="text-center">
                  <div className="font-semibold text-gray-800 dark:text-gray-200 text-lg mb-1">{paseadorMasFrecuente.nombre}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{paseadorMasFrecuente.count} paseos realizados</div>
                  <div className="flex justify-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-sm">⭐</span>
                    ))}
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-blue-500 to-green-500 dark:from-blue-600 dark:to-green-600 text-white text-xs">
                    Contactar
                  </Button>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Widget de Actividad - Ancho completo */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 shadow-xl glass-morphism animate-fade-in border border-purple-200/50 dark:border-gray-600">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 text-lg text-center">Resumen de Actividad</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{misPaseos?.length || 0}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Paseos</div>
              </div>
              <div className="text-center bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {misPaseos?.reduce((acc, p) => acc + (p.duracion || 0), 0) || 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Min. Caminados</div>
              </div>
              <div className="text-center bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {misPaseos && misPaseos.length ? Math.round(misPaseos.reduce((acc, p) => acc + (p.duracion || 0), 0) / misPaseos.length) : 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Promedio Min.</div>
              </div>
              <div className="text-center bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {userProfile.mascotas?.length || 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Mascotas</div>
              </div>
            </div>
          </div>
        </div>

      {/* Modales flotando fuera del contenedor principal */}
      {openScheduleWalkDialog && (
        isMobile ? (
          <BottomSheetScheduleModal
            isOpen={openScheduleWalkDialog}
            onClose={() => setOpenScheduleWalkDialog(false)}
            selectedMascota={selectedMascota}
            form={scheduleWalkForm}
            onSubmit={onSubmitScheduleWalk}
            precioTotal={precioTotal}
            TIPOS_PASEO={TIPOS_PASEO}
            TIPOS_SERVICIO={TIPOS_SERVICIO}
            isSubmitting={scheduleWalkForm.formState.isSubmitting}
          />
        ) : (
          <PremiumScheduleModal
            isOpen={openScheduleWalkDialog}
            onClose={() => setOpenScheduleWalkDialog(false)}
            selectedMascota={selectedMascota}
            form={scheduleWalkForm}
            onSubmit={onSubmitScheduleWalk}
            precioTotal={precioTotal}
            TIPOS_PASEO={TIPOS_PASEO}
            TIPOS_SERVICIO={TIPOS_SERVICIO}
            isSubmitting={scheduleWalkForm.formState.isSubmitting}
          />
        )
      )}

      <ConfirmationModal 
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        title={confirmationModalTitle}
        message={confirmationModalMessage}
      />
      
      <Toaster />
    </>
    );
}