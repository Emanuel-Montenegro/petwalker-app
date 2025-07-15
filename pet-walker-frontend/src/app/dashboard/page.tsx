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
import { ScheduleWalkModal } from '@/components/shared/ScheduleWalkModal';

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
      <>
          {/* Premium Welcome Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 rounded-3xl p-8 shadow-2xl border border-blue-200/50 dark:border-blue-500/20 m-8">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent dark:from-blue-500/20 dark:to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 to-transparent dark:from-purple-500/20 dark:to-transparent rounded-full blur-2xl"></div>
            
            <div className="relative z-10 text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 dark:from-blue-500 dark:via-purple-600 dark:to-pink-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl animate-bounce">
                <span className="text-white text-3xl">🏃‍♂️</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-3">
                ¡Bienvenido, <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-pink-400 dark:to-purple-400 bg-clip-text text-transparent">{usuario?.nombre || 'Paseador'}</span>!
              </h1>
              <p className="text-gray-600 dark:text-blue-100 text-lg">Tu centro de control premium para paseos</p>
            </div>

            {/* Premium Quick Actions */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-300/50 dark:border-blue-400/30 hover:border-blue-400/70 dark:hover:border-blue-400/50 transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">🔍</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Paseos Disponibles</h3>
                    <p className="text-gray-600 dark:text-blue-100 text-sm">Encuentra y acepta nuevos paseos</p>
                  </div>
                </div>
                <Button 
                  onClick={() => router.push('/dashboard/paseos')}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Explorar Paseos
                </Button>
              </div>

              <div className="group bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-300/50 dark:border-green-400/30 hover:border-green-400/70 dark:hover:border-green-400/50 transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-400 dark:to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">📋</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Mis Paseos</h3>
                    <p className="text-gray-600 dark:text-green-100 text-sm">Gestiona tus paseos aceptados</p>
                  </div>
                </div>
                <Button 
                  onClick={() => router.push('/dashboard/historial')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Ver Mis Paseos
                </Button>
              </div>
            </div>
          </div>

          {/* Premium Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mx-8">
            {/* Total de Paseos */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 dark:from-blue-600 dark:via-blue-700 dark:to-blue-800 rounded-2xl p-6 shadow-2xl border border-blue-400/30 dark:border-blue-400/30 hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Total Paseos</p>
                  <p className="text-3xl font-bold text-white">{misPaseos?.length || 0}</p>
                  <p className="text-blue-200 text-xs mt-1">Experiencias completadas</p>
                </div>
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl">🐕</span>
                </div>
              </div>
            </div>

            {/* Paseos Completados */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-green-700 dark:from-green-600 dark:via-green-700 dark:to-green-800 rounded-2xl p-6 shadow-2xl border border-green-400/30 dark:border-green-400/30 hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">Completados</p>
                  <p className="text-3xl font-bold text-white">
                    {misPaseos?.filter(p => p.estado === 'FINALIZADO').length || 0}
                  </p>
                  <p className="text-green-200 text-xs mt-1">Paseos exitosos</p>
                      </div>
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl">✅</span>
                </div>
              </div>
            </div>

            {/* Paseos en Curso */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 dark:from-orange-600 dark:via-orange-700 dark:to-orange-800 rounded-2xl p-6 shadow-2xl border border-orange-400/30 dark:border-orange-400/30 hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl"></div>
              <div className="relative z-10 flex items-center justify-between">
                      <div>
                  <p className="text-orange-100 text-sm font-medium mb-1">En Curso</p>
                  <p className="text-3xl font-bold text-white">
                    {misPaseos?.filter(p => p.estado === 'EN_CURSO').length || 0}
                  </p>
                  <p className="text-orange-200 text-xs mt-1">Actualmente activos</p>
                </div>
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                  <span className="text-white text-2xl">⏰</span>
                </div>
                      </div>
                    </div>
                    
            {/* Calificación Promedio */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 dark:from-purple-600 dark:via-purple-700 dark:to-purple-800 rounded-2xl p-6 shadow-2xl border border-purple-400/30 dark:border-purple-400/30 hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium mb-1">Calificación</p>
                  <p className="text-3xl font-bold text-white">
                    {(() => {
                      const paseosConCalificacion = misPaseos?.filter(p => p.calificacion) || [];
                      if (paseosConCalificacion.length === 0) return 'N/A';
                      const promedio = paseosConCalificacion.reduce((acc, p) => acc + (p.calificacion?.puntuacion || 0), 0) / paseosConCalificacion.length;
                      return promedio.toFixed(1);
                    })()}
                  </p>
                  <p className="text-purple-200 text-xs mt-1">Promedio de estrellas</p>
                </div>
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl">⭐</span>
                </div>
              </div>
            </div>
                    </div>
                    
          {/* Premium Info Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 mx-8">
            {/* Actividad Reciente */}
            <div className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-800 dark:via-gray-800 dark:to-slate-900 rounded-2xl p-6 shadow-2xl border border-gray-200/50 dark:border-gray-600/30">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 dark:from-green-500/5 dark:to-emerald-500/5"></div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-transparent dark:from-green-500/10 dark:to-transparent rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-400 dark:to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">📝</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Actividad Reciente</h3>
                    <p className="text-gray-600 dark:text-green-200 text-sm">Últimos paseos completados</p>
                  </div>
                </div>
                
                {(() => {
                  const paseosRecientes = misPaseos?.filter(p => p.estado === 'FINALIZADO').slice(0, 3) || [];
                  return paseosRecientes.length > 0 ? (
                    <div className="space-y-4">
                      {paseosRecientes.map((paseo) => (
                        <div key={paseo.id} className="p-4 bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-white/20">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-600 rounded-xl flex items-center justify-center">
                              <span className="text-white text-xl">🐕</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 dark:text-white">{paseo.mascota?.nombre || 'Mascota'}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {paseo.fecha} • {paseo.duracion} min
                              </p>
                            </div>
                            {paseo.calificacion ? (
                              <div className="flex items-center gap-1">
                                <span className="text-yellow-500 dark:text-yellow-400 text-lg">⭐</span>
                                <span className="font-semibold text-gray-800 dark:text-white">{paseo.calificacion.puntuacion}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className="text-green-500 dark:text-green-400 text-lg">✅</span>
                                <span className="text-sm text-gray-600 dark:text-gray-300">Completado</span>
                              </div>
                            )}
                          </div>
                          {paseo.calificacion?.comentario && (
                            <div className="mt-2 p-3 bg-gray-50/80 dark:bg-white/5 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-white/10">
                              <p className="text-sm text-gray-700 dark:text-gray-200 italic">"{paseo.calificacion.comentario}"</p>
                            </div>
                          )}
                        </div>
                      ))}
                    <Button 
                        variant="outline" 
                        onClick={() => router.push('/dashboard/historial')}
                        className="w-full border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10"
                      >
                        Ver Historial Completo
                    </Button>
              </div>
            ) : (
                    <div className="text-center py-8">
                      <span className="text-4xl mb-4 block">📝</span>
                      <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No hay actividad reciente</h4>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">Completa tu primer paseo para ver tu actividad aquí</p>
                      <Button 
                        onClick={() => router.push('/dashboard/paseos')}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                      >
                        Buscar Paseos
                      </Button>
                </div>
                  );
                })()}
              </div>
            </div>

            {/* Métricas de Rendimiento */}
            <div className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-800 dark:via-gray-800 dark:to-slate-900 rounded-2xl p-6 shadow-2xl border border-gray-200/50 dark:border-gray-600/30">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-500/5 dark:to-purple-500/5"></div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent dark:from-blue-500/10 dark:to-transparent rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">📊</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Métricas de Rendimiento</h3>
                    <p className="text-gray-600 dark:text-blue-200 text-sm">Tu progreso y estadísticas</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-white/20">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Tiempo Total</p>
                      <p className="text-xl font-bold text-gray-800 dark:text-white">
                        {misPaseos?.reduce((acc, p) => acc + (p.duracion || 0), 0) || 0} min
                      </p>
                    </div>
                    <span className="text-2xl">⏱️</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-white/20">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Paseos Este Mes</p>
                      <p className="text-xl font-bold text-gray-800 dark:text-white">
                        {(() => {
                          const esteMes = new Date().getMonth();
                          return misPaseos?.filter(p => new Date(p.fecha).getMonth() === esteMes).length || 0;
                        })()}
                      </p>
                    </div>
                    <span className="text-2xl">📈</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-white/20">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Ingresos Totales</p>
                      <p className="text-xl font-bold text-gray-800 dark:text-white">
                        ${misPaseos?.reduce((acc, p) => acc + (p.precio || 0), 0) || 0}
                      </p>
                    </div>
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Herramientas Rápidas */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-800 dark:via-gray-800 dark:to-slate-900 rounded-2xl p-6 shadow-2xl border border-gray-200/50 dark:border-gray-600/30 mx-8 mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 dark:from-orange-500/5 dark:to-red-500/5"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/10 to-transparent dark:from-orange-500/10 dark:to-transparent rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 dark:from-orange-400 dark:to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">🛠️</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Herramientas Rápidas</h3>
                  <p className="text-gray-600 dark:text-orange-200 text-sm">Acceso directo a funciones importantes</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => router.push('/dashboard/calificaciones')}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 dark:from-yellow-500/20 dark:to-orange-500/20 backdrop-blur-sm border border-yellow-400/50 dark:border-yellow-400/30 hover:border-yellow-500/70 dark:hover:border-yellow-400/50 hover:scale-105 transition-all duration-300"
                >
                  <span className="text-2xl">⭐</span>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800 dark:text-white">Ver Calificaciones</p>
                    <p className="text-sm text-gray-600 dark:text-yellow-200">Revisa tus evaluaciones</p>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => router.push('/dashboard/configuraciones')}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-500/20 dark:to-purple-500/20 backdrop-blur-sm border border-blue-400/50 dark:border-blue-400/30 hover:border-blue-500/70 dark:hover:border-blue-400/50 hover:scale-105 transition-all duration-300"
                >
                  <span className="text-2xl">⚙️</span>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800 dark:text-white">Configuración</p>
                    <p className="text-sm text-gray-600 dark:text-blue-200">Ajusta tu perfil</p>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => router.push('/dashboard/historial')}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 dark:from-green-500/20 dark:to-emerald-500/20 backdrop-blur-sm border border-green-400/50 dark:border-green-400/30 hover:border-green-500/70 dark:hover:border-green-400/50 hover:scale-105 transition-all duration-300"
                >
                  <span className="text-2xl">📋</span>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800 dark:text-white">Historial</p>
                    <p className="text-sm text-gray-600 dark:text-green-200">Ver todos los paseos</p>
                  </div>
                </Button>
              </div>
            </div>
              </div>
        
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

  // DUEÑO Dashboard
    return (
    <>
        {/* Welcome Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 shadow-lg dark:shadow-gray-900/50 mb-8 border border-gray-200 dark:border-gray-700 m-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 rounded-2xl mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">👨‍👩‍👧‍👦</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-light text-gray-800 dark:text-gray-200 mb-2">
                ¡Bienvenido, <span className="bg-gradient-to-r from-blue-600 via-pink-500 to-purple-600 bg-clip-text text-transparent font-medium">{usuario?.nombre || 'Dueño'}</span>!
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
          <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 border border-green-200/50 dark:border-green-500/30 rounded-3xl p-4 shadow-2xl mb-6 mx-8">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-transparent dark:from-green-500/20 dark:to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-emerald-500/10 to-transparent dark:from-emerald-500/20 dark:to-transparent rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-400 dark:to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">⏰</span>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Paseo en Curso</h2>
                    <p className="text-gray-600 dark:text-green-200 text-base">Seguimiento en tiempo real</p>
                </div>
              </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400 text-base font-semibold">En vivo</span>
              </div>
            </div>
              
              <div className="space-y-3">
            {liveWalks.map((paseo) => (
                  <div key={paseo.id} className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-green-200/50 dark:border-green-500/30 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10"></div>
                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-2xl">{paseo.mascota?.especie?.toLowerCase().includes('gato') ? '🐱' : '🐶'}</span>
                      </div>
                <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{paseo.mascota?.nombre}</h3>
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-1">
                            <span className="text-base">📅</span>
                            <span className="font-medium text-sm">
                    {new Date(paseo.fecha).toLocaleDateString('es-ES', { 
                      day: '2-digit', 
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-base">🕐</span>
                            <span className="font-medium text-sm">{paseo.horaInicio?.slice(0, 5) || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-base">⏱️</span>
                            <span className="font-medium text-sm">{paseo.duracion} min</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                            <div className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
                            En progreso
                          </span>
                  </div>
                </div>
                <Button 
                        size="default"
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 dark:from-green-400 dark:to-emerald-500 dark:hover:from-green-500 dark:hover:to-emerald-600 text-white font-bold px-6 py-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl" 
                  onClick={() => router.push(`/dashboard/paseos/${paseo.id}`)}
                >
                        <span className="mr-2">📍</span>
                        Ver Tracking en Vivo
                </Button>
                    </div>
              </div>
            ))}
              </div>
            </div>
          </div>
        )}

        {/* Widgets Premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 mx-8">
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
        <div className="max-w-2xl mx-auto mb-10 mx-8">
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
        <ScheduleWalkModal
            isOpen={openScheduleWalkDialog}
            onClose={() => setOpenScheduleWalkDialog(false)}
          mascota={selectedMascota}
        />
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