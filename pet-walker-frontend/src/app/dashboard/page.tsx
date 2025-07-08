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
import { ScheduleWalkDialog } from '@/components/dashboard/ScheduleWalkDialog';
import { format, addDays, startOfWeek, addWeeks, isSameDay, isToday, isBefore } from "date-fns";
import { es } from 'date-fns/locale';
import { ConfirmationModal } from '@/components/shared/ConfirmationModal';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LiveWalkCard } from '@/components/dashboard/live-walk-card';
import { PetStatusCard } from '@/components/dashboard/pet-status-card';
import { LiveWalkGroupCard } from '@/components/dashboard/live-walk-group-card';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto py-8 space-y-8">
          {/* Welcome Card */}
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">🏃‍♂️</span>
              </div>
              <h1 className="text-3xl font-light text-gray-800 mb-2">
                ¡Bienvenido, <span className="bg-gradient-to-r from-blue-600 via-pink-500 to-purple-600 bg-clip-text text-transparent font-medium">{userProfile?.nombre}</span>!
              </h1>
              <p className="text-gray-600">Panel de control para paseadores</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-200">
                <h3 className="text-xl font-medium text-gray-800 mb-2">Paseos Disponibles</h3>
                <p className="text-gray-600 text-sm mb-4">Encuentra y acepta nuevos paseos</p>
                <Button 
                  onClick={() => router.push('/dashboard/paseos')}
                  className="w-full bg-gradient-to-r from-blue-500 to-pink-500 text-white font-semibold py-2 rounded-xl hover:scale-105 transition-all duration-300"
                >
                  Ver Paseos Disponibles
                </Button>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border border-green-200">
                <h3 className="text-xl font-medium text-gray-800 mb-2">Mis Paseos</h3>
                <p className="text-gray-600 text-sm mb-4">Gestiona tus paseos aceptados</p>
                <Button 
                  onClick={() => router.push('/dashboard/historial')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-2 rounded-xl hover:scale-105 transition-all duration-300"
                >
                  Ver Mis Paseos
                </Button>
              </div>
            </div>
          </div>

          {/* Available Walks */}
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-light text-gray-800 mb-6">Paseos Disponibles</h2>
            
            {availableWalks && availableWalks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableWalks.map((walk) => (
                  <div key={walk.id} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">🐕</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{walk.mascota?.nombre || 'Mascota'}</h3>
                        <p className="text-sm text-gray-600">{walk.mascota?.especie || 'Especie'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p><span className="font-medium">Fecha:</span> {walk.fecha}</p>
                      <p><span className="font-medium">Hora:</span> {walk.horaInicio}</p>
                      <p><span className="font-medium">Duración:</span> {walk.duracion} min</p>
                      <p><span className="font-medium">Precio:</span> ${walk.precio}</p>
                    </div>
                    
                    <Button 
                      onClick={() => acceptWalkMutate.mutate({ walkId: walk.id, paseadorId: userProfile.id })}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-2 rounded-xl hover:scale-105 transition-all duration-300"
                      disabled={acceptWalkMutate.isPending}
                    >
                      {acceptWalkMutate.isPending ? 'Aceptando...' : 'Aceptar Paseo'}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-4xl">🚶‍♂️</span>
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">No hay paseos disponibles</h3>
                <p className="text-gray-600">Vuelve más tarde para ver nuevos paseos</p>
              </div>
            )}
              </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="container mx-auto py-8">
        {/* Welcome Panel */}
        <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <div className="flex justify-between items-center mb-8">
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">👨‍👩‍👧‍👦</span>
              </div>
              <h1 className="text-3xl font-light text-gray-800 mb-2">
                ¡Bienvenido, <span className="bg-gradient-to-r from-blue-600 via-pink-500 to-purple-600 bg-clip-text text-transparent font-medium">{userProfile?.nombre}</span>!
              </h1>
              <p className="text-gray-600">Panel de control para dueños de mascotas</p>
            </div>
            
                <Dialog open={openAddPetDialog} onOpenChange={setOpenAddPetDialog}>
                  <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-pink-500 text-white font-semibold px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300">
                  <span className="mr-2">🐕</span>
                      Agregar Nueva Mascota
                    </Button>
                  </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                  <DialogTitle>Agregar Nueva Mascota</DialogTitle>
                  <DialogDescription>Completa los datos de tu nueva mascota.</DialogDescription>
                    </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmitAddPet)} className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nombre" className="text-right">Nombre</Label>
                    <Input id="nombre" {...form.register('nombre')} className="col-span-3" />
                    {form.formState.errors.nombre && <p className="col-span-4 text-red-500 text-sm">{form.formState.errors.nombre.message}</p>}
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="especie" className="text-right">Especie</Label>
                    <Input id="especie" {...form.register('especie')} className="col-span-3" />
                    {form.formState.errors.especie && <p className="col-span-4 text-red-500 text-sm">{form.formState.errors.especie.message}</p>}
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="raza" className="text-right">Raza</Label>
                    <Input id="raza" {...form.register('raza')} className="col-span-3" />
                    {form.formState.errors.raza && <p className="col-span-4 text-red-500 text-sm">{form.formState.errors.raza.message}</p>}
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edad" className="text-right">Edad</Label>
                    <Input id="edad" type="number" {...form.register('edad', { valueAsNumber: true })} className="col-span-3" />
                    {form.formState.errors.edad && <p className="col-span-4 text-red-500 text-sm">{form.formState.errors.edad.message}</p>}
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sociable" className="text-right">Sociable</Label>
                        <Select onValueChange={(value) => form.setValue('sociable', value === 'true')} defaultValue={form.watch('sociable') ? 'true' : 'false'}>
                      <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Selecciona si es sociable" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Sí</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:scale-105 transition-all duration-300">
                        Agregar Mascota
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
        </div>

        {/* Sección de Paseos en Curso */}
        {liveWalks && liveWalks.length > 0 && (
          <div className="mb-8">
            <LiveWalkGroupCard walks={liveWalks} />
          </div>
        )}

        {/* Pets Grid detallado */}
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-light text-gray-800 mb-6">Mis Mascotas</h2>

          {userProfile.mascotas && userProfile.mascotas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProfile.mascotas.map((mascota) => (
                <div key={mascota.id} className="relative rounded-2xl p-6 bg-white/30 backdrop-blur-md border border-white/70 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-pink-100 rounded-xl mb-4 flex items-center justify-center">
                    <span className="text-2xl">
                      {mascota.especie.toLowerCase().includes('perro') ? '🐕' : mascota.especie.toLowerCase().includes('gato') ? '🐱' : '🐾'}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{mascota.nombre}</h3>
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <p><span className="font-medium">Especie:</span> {mascota.especie}</p>
                    <p><span className="font-medium">Raza:</span> {mascota.raza}</p>
                    <p><span className="font-medium">Edad:</span> {mascota.edad} años</p>
                    <p><span className="font-medium">Sociable:</span> {mascota.sociable ? 'Sí' : 'No'}</p>
                  </div>

                  <Button 
                    onClick={() => handleScheduleWalkClick(mascota)}
                    className="w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white font-semibold py-2 rounded-xl hover:brightness-110 active:scale-95 transition-all duration-300"
                  >
                    <span className="mr-2">🚶‍♂️</span>
                    Programar Paseo
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl">🐾</div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">No tienes mascotas registradas</h3>
              <p className="text-gray-600 mb-6">Agrega tu primera mascota para comenzar a programar paseos</p>
              <Button 
                onClick={() => setOpenAddPetDialog(true)}
                className="bg-gradient-to-r from-blue-500 to-pink-500 text-white font-semibold px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300"
              >
                <span className="mr-2">🐕</span>
                Agregar Primera Mascota
              </Button>
            </div>
          )}
        </div>
      </div>

        {/* Nuevo diálogo premium */}
        <Dialog open={openScheduleWalkDialog} onOpenChange={setOpenScheduleWalkDialog}>
          <ScheduleWalkDialog form={scheduleWalkForm} onSubmit={onSubmitScheduleWalk} precioTotal={precioTotal} />
        </Dialog>

      {/* Modals and Toaster */}
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