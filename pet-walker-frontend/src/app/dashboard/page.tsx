'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserProfile, addPet, scheduleWalk } from '@/lib/api/user';
import { fetchAvailableWalks, acceptWalk, obtenerPaseosPaseador } from '@/lib/api/paseos';
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
import { format } from "date-fns";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ConfirmationModal } from '@/components/shared/ConfirmationModal';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ErrorBoundary from '@/components/shared/ErrorBoundary';

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

const ESTADOS_VACUNACION = {
  AL_DIA: 'Al día',
  PENDIENTE: 'Pendiente',
  VENCIDA: 'Vencida'
} as const;

const formSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  especie: z.string().min(2, { message: "La especie debe tener al menos 2 caracteres." }),
  raza: z.string().min(2, { message: "La raza debe tener al menos 2 caracteres." }),
  edad: z.number().min(0, { message: "La edad debe ser un número positivo." }),
  sociable: z.boolean(),
  alergias: z.array(z.string()),
  discapacidades: z.array(z.string()),
  necesitaBozal: z.boolean(),
  estadoVacunacion: z.string().min(1, { message: "El estado de vacunación es requerido." }),
  observaciones: z.string().optional(),
  foto: z.string().optional(),
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

  useEffect(() => {
    if (isErrorWalks) {
      console.error('Error fetching walks:', errorWalks);
    }
  }, [isErrorWalks, errorWalks]);

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
      console.error('Error al agregar mascota:', error);
      toast.error(error.message || 'No se pudo agregar la mascota.');
    },
  });

  const { mutate: scheduleWalkMutate } = useMutation({
    mutationFn: async (walkData: { mascotaId: number; fecha: string; horaInicio: string; duracion: number; usuarioId: number; tipoServicio: string; precio: number; origenLatitud: number; origenLongitud: number; }) => {
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
      console.error('Error al programar paseo:', error);
      toast.error(error.message || 'No se pudo programar el paseo.');
    },
  });

  const acceptWalkMutate = useMutation({
    mutationFn: async ({ walkId, paseadorId }: { walkId: number; paseadorId: number }) => {
      try {
        const result = await acceptWalk(walkId, paseadorId);
        return result;
      } catch (error) {
        console.error('Error accepting walk:', error);
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
      console.error('Error in acceptWalkMutate:', error);
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
      alergias: [],
      discapacidades: [],
      necesitaBozal: false,
      estadoVacunacion: 'PENDIENTE',
      observaciones: '',
      foto: '',
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
        horaInicio: data.hora,
        duracion: duracion,
        usuarioId: userProfile.id,
        tipoServicio: data.tipoServicio,
        precio: precioTotal,
        origenLatitud: 0, // Valores por defecto, deberían venir del frontend
        origenLongitud: 0 // Valores por defecto, deberían venir del frontend
      };

      console.log('Enviando datos del paseo:', walkData);
      scheduleWalkMutate(walkData);
    } catch (error) {
      console.error('Error al preparar datos del paseo:', error);
      toast.error("Error al preparar los datos del paseo. Por favor, intente nuevamente.");
    }
  };

  const handleScheduleWalkClick = (mascota: Mascota) => {
    setSelectedMascota(mascota);
    setOpenScheduleWalkDialog(true);
  };

  if (isLoading || isLoadingWalks || isLoadingMisPaseos) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center gap-8">
          <div className="w-full max-w-4xl animate-pulse">
            <div className="h-16 bg-gradient-to-r from-primary to-accent rounded-t-xl mb-4" />
            <div className="h-40 bg-gray-200/40 rounded-b-xl" />
          </div>
          <div className="w-full max-w-4xl animate-pulse grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-gray-200/60 rounded-xl" />
            <div className="h-32 bg-gray-200/60 rounded-xl" />
            <div className="h-32 bg-gray-200/60 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || isErrorWalks) {
    return (
      <Alert variant="destructive">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Error al cargar datos</AlertTitle>
        <AlertDescription>
          {error?.message || errorWalks?.message || 'No se pudieron cargar los datos.'}
        </AlertDescription>
      </Alert>
    );
  }

  if (isErrorWalks && (errorWalks as any)?.message?.includes('403')) {
    return (
      <Alert variant="destructive">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Acceso denegado a paseos</AlertTitle>
        <AlertDescription>No tienes permiso para ver los paseos de este paseador.</AlertDescription>
      </Alert>
    );
  }
  if (isErrorWalks && (errorWalks as any)?.message?.includes('404')) {
    return (
      <Alert variant="destructive">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Ruta no encontrada</AlertTitle>
        <AlertDescription>La ruta de paseador no existe. Contacta a soporte.</AlertDescription>
      </Alert>
    );
  }

  if (!isAuthenticated || !userProfile) {
    return (
      <Alert>
        <AlertTitle>Acceso Denegado</AlertTitle>
        <AlertDescription>
          Por favor, inicia sesión para ver esta página.
        </AlertDescription>
      </Alert>
    );
  }

  // Debug logs eliminados para producción

  if (userProfile.rol === 'PASEADOR') {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <Card className="w-full max-w-4xl mx-auto shadow-xl rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-6 rounded-t-xl text-center">
            <CardTitle className="text-3xl font-extrabold tracking-tight">¡Bienvenido, {userProfile?.nombre}!</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-glass">
                <h3 className="text-xl font-semibold mb-4">Paseos Disponibles</h3>
                <p className="text-gray-600 mb-4">Paseos que puedes aceptar</p>
                <Button 
                  onClick={() => router.push('/dashboard/paseos')}
                  className="w-full bg-gradient-to-r from-primary to-accent text-white"
                >
                  Ver Paseos Disponibles
                </Button>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-glass">
                <h3 className="text-xl font-semibold mb-4">Mis Paseos</h3>
                <p className="text-gray-600 mb-4">Paseos que has aceptado</p>
                <Button 
                  onClick={() => router.push('/dashboard/historial')}
                  className="w-full bg-gradient-to-r from-primary to-accent text-white"
                >
                  Ver Mis Paseos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Resumen de Actividad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-glass">
                <h4 className="text-lg font-semibold mb-2">Paseos Pendientes</h4>
                <p className="text-3xl font-bold text-primary">
                  {misPaseos?.filter(p => p.estado === 'PENDIENTE').length || 0}
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-glass">
                <h4 className="text-lg font-semibold mb-2">Paseos Hoy</h4>
                <p className="text-3xl font-bold text-accent">
                  {misPaseos?.filter(p => 
                    new Date(p.fecha).toDateString() === new Date().toDateString()
                  ).length || 0}
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-glass">
                <h4 className="text-lg font-semibold mb-2">Paseos Completados</h4>
                <p className="text-3xl font-bold text-green-600">
                  {misPaseos?.filter(p => p.estado === 'FINALIZADO').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } else if (userProfile.rol === 'DUENO') {
    return (
      <ErrorBoundary>
        <div className="container mx-auto py-8">
          <Card className="w-full max-w-4xl mx-auto shadow-xl rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-6 rounded-t-xl text-center">
              <CardTitle className="text-3xl font-extrabold tracking-tight">¡Bienvenido, {userProfile?.nombre}!</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Mis Mascotas</h2>
                <Dialog open={openAddPetDialog} onOpenChange={setOpenAddPetDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105">
                      Agregar Nueva Mascota
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] p-6 bg-white rounded-lg shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-gray-800">Agregar Nueva Mascota</DialogTitle>
                      <DialogDescription className="text-gray-600">Completa los datos de tu nueva mascota.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(onSubmitAddPet)} className="grid gap-6 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="nombre" className="text-right text-gray-700 font-medium">Nombre</Label>
                        <Input id="nombre" {...form.register('nombre')} className="col-span-3 border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" />
                        {form.formState.errors.nombre && <p className="col-span-4 text-red-500 text-sm italic">{form.formState.errors.nombre.message}</p>}
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="especie" className="text-right text-gray-700 font-medium">Especie</Label>
                        <Input id="especie" {...form.register('especie')} className="col-span-3 border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" />
                        {form.formState.errors.especie && <p className="col-span-4 text-red-500 text-sm italic">{form.formState.errors.especie.message}</p>}
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="raza" className="text-right text-gray-700 font-medium">Raza</Label>
                        <Input id="raza" {...form.register('raza')} className="col-span-3 border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" />
                        {form.formState.errors.raza && <p className="col-span-4 text-red-500 text-sm italic">{form.formState.errors.raza.message}</p>}
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edad" className="text-right text-gray-700 font-medium">Edad</Label>
                        <Input id="edad" type="number" {...form.register('edad', { valueAsNumber: true })} className="col-span-3 border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" />
                        {form.formState.errors.edad && <p className="col-span-4 text-red-500 text-sm italic">{form.formState.errors.edad.message}</p>}
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="sociable" className="text-right text-gray-700 font-medium">Sociable</Label>
                        <Select onValueChange={(value) => form.setValue('sociable', value === 'true')} defaultValue={form.watch('sociable') ? 'true' : 'false'}>
                          <SelectTrigger className="col-span-3 border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
                            <SelectValue placeholder="Selecciona si es sociable" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Sí</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.formState.errors.sociable && <p className="col-span-4 text-red-500 text-sm italic">{form.formState.errors.sociable.message}</p>}
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="alergias" className="text-right text-gray-700 font-medium">Alergias</Label>
                        <Input
                          id="alergias"
                          placeholder="Separadas por comas"
                          value={form.watch('alergias').join(',')}
                          onChange={e => form.setValue('alergias', e.target.value.split(',').map(a => a.trim()).filter(Boolean))}
                          className="col-span-3 border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                        />
                        {form.formState.errors.alergias && <p className="col-span-4 text-red-500 text-sm italic">{form.formState.errors.alergias.message}</p>}
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="discapacidades" className="text-right text-gray-700 font-medium">Discapacidades</Label>
                        <Input
                          id="discapacidades"
                          placeholder="Separadas por comas"
                          value={form.watch('discapacidades').join(',')}
                          onChange={e => form.setValue('discapacidades', e.target.value.split(',').map(d => d.trim()).filter(Boolean))}
                          className="col-span-3 border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                        />
                        {form.formState.errors.discapacidades && <p className="col-span-4 text-red-500 text-sm italic">{form.formState.errors.discapacidades.message}</p>}
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="necesitaBozal" className="text-right text-gray-700 font-medium">Necesita Bozal</Label>
                        <Select onValueChange={(value) => form.setValue('necesitaBozal', value === 'true')} defaultValue={form.watch('necesitaBozal') ? 'true' : 'false'}>
                          <SelectTrigger className="col-span-3 border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
                            <SelectValue placeholder="Selecciona si necesita bozal" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Sí</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.formState.errors.necesitaBozal && <p className="col-span-4 text-red-500 text-sm italic">{form.formState.errors.necesitaBozal.message}</p>}
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="estadoVacunacion" className="text-right text-gray-700 font-medium">Estado de Vacunación</Label>
                        <Select onValueChange={(value) => form.setValue('estadoVacunacion', value)} defaultValue={form.watch('estadoVacunacion')}>
                          <SelectTrigger className="col-span-3 border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
                            <SelectValue placeholder="Selecciona el estado de vacunación" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AL_DIA">Al día</SelectItem>
                            <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                            <SelectItem value="VENCIDA">Vencida</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.formState.errors.estadoVacunacion && <p className="col-span-4 text-red-500 text-sm italic">{form.formState.errors.estadoVacunacion.message}</p>}
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="observaciones" className="text-right text-gray-700 font-medium">Observaciones</Label>
                        <textarea 
                          id="observaciones" 
                          {...form.register('observaciones')} 
                          className="col-span-3 border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 rounded-md" 
                          rows={3}
                        />
                        {form.formState.errors.observaciones && <p className="col-span-4 text-red-500 text-sm italic">{form.formState.errors.observaciones.message}</p>}
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="foto" className="text-right text-gray-700 font-medium">URL de Foto</Label>
                        <Input 
                          id="foto" 
                          type="url" 
                          {...form.register('foto')} 
                          placeholder="https://ejemplo.com/foto.jpg"
                          className="col-span-3 border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" 
                        />
                        {form.formState.errors.foto && <p className="col-span-4 text-red-500 text-sm italic">{form.formState.errors.foto.message}</p>}
                      </div>
                      <Button type="submit" className="w-full py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary-dark text-white">
                        Agregar Mascota
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              {userProfile?.mascotas && userProfile.mascotas.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {userProfile.mascotas.map((mascota: Mascota) => (
                    <li key={mascota.id} className="border border-gray-200 p-6 rounded-lg shadow-lg flex flex-col justify-between h-full transform transition-transform duration-200 hover:scale-105">
                      <div>
                        {mascota.foto && (
                          <div className="mb-4">
                            <img src={mascota.foto} alt={mascota.nombre} className="w-full h-48 object-cover rounded-lg" />
                          </div>
                        )}
                        <p className="font-bold text-2xl text-primary-foreground mb-3">{mascota.nombre}</p>
                        <p className="text-gray-700 text-sm mb-1"><span className="font-medium">Especie:</span> {mascota.especie}</p>
                        <p className="text-gray-700 text-sm mb-1"><span className="font-medium">Raza:</span> {mascota.raza}</p>
                        <p className="text-gray-700 text-sm mb-1"><span className="font-medium">Edad:</span> {mascota.edad} años</p>
                        <p className="text-gray-700 text-sm mb-1"><span className="font-medium">Sociable:</span> {mascota.sociable ? 'Sí' : 'No'}</p>
                        {mascota.alergias && mascota.alergias.length > 0 && (
                          <p className="text-gray-700 text-sm mb-1"><span className="font-medium">Alergias:</span> {mascota.alergias.join(', ')}</p>
                        )}
                        {mascota.discapacidades && mascota.discapacidades.length > 0 && (
                          <p className="text-gray-700 text-sm mb-1"><span className="font-medium">Discapacidades:</span> {mascota.discapacidades.join(', ')}</p>
                        )}
                        <p className="text-gray-700 text-sm mb-1"><span className="font-medium">Necesita Bozal:</span> {mascota.necesitaBozal ? 'Sí' : 'No'}</p>
                        <p className={cn(
                          "text-gray-700 text-sm mb-1",
                          mascota.estadoVacunacion === 'AL_DIA' && "text-green-600",
                          mascota.estadoVacunacion === 'PENDIENTE' && "text-yellow-600",
                          mascota.estadoVacunacion === 'VENCIDA' && "text-red-600"
                        )}>
                          <span className="font-medium">Vacunación:</span> {mascota.estadoVacunacion}
                        </p>
                        {mascota.observaciones && (
                          <p className="text-gray-700 text-sm mb-1"><span className="font-medium">Observaciones:</span> {mascota.observaciones}</p>
                        )}
                      </div>
                      <Button onClick={() => handleScheduleWalkClick(mascota)} className="mt-6 w-full py-2 text-base rounded-md shadow-sm hover:shadow-md transition-all duration-200">Programar Paseo</Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No tienes mascotas registradas aún.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog 
            open={openScheduleWalkDialog} 
            onOpenChange={setOpenScheduleWalkDialog}
          >
            <DialogContent 
              aria-labelledby="schedule-walk-dialog-title"
              id="schedule-walk-dialog-content"
              className="sm:max-w-[425px] p-6 bg-white rounded-lg shadow-2xl"
            >
              <DialogHeader>
                <DialogTitle id="schedule-walk-dialog-title" className="text-2xl font-bold text-gray-800">
                  Programar Paseo
                </DialogTitle>
                <DialogDescription id="schedule-walk-dialog-description" className="text-gray-600">
                  Programa un paseo para {selectedMascota?.nombre}
                </DialogDescription>
              </DialogHeader>
              <form 
                onSubmit={scheduleWalkForm.handleSubmit(onSubmitScheduleWalk)} 
                className="grid gap-6 py-4"
                noValidate
              >
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fecha" className="text-right text-gray-700 font-medium">Fecha</Label>
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !scheduleWalkForm.watch("fecha") && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {scheduleWalkForm.watch("fecha") ? (
                            format(scheduleWalkForm.watch("fecha"), "PPP", { locale: es })
                          ) : (
                            <span>Selecciona una fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-4 rounded-lg shadow-xl bg-white" align="start">
                        <Calendar
                          value={scheduleWalkForm.watch("fecha")}
                          onChange={(date) => {
                            if (date && date >= new Date(new Date().setHours(0,0,0,0))) {
                              scheduleWalkForm.setValue("fecha", date);
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    {scheduleWalkForm.formState.errors.fecha && (
                      <p className="text-red-500 text-sm italic mt-1">
                        {scheduleWalkForm.formState.errors.fecha.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="hora" className="text-right text-gray-700 font-medium">Hora</Label>
                  <div className="col-span-3">
                    <Input
                      id="hora"
                      type="time"
                      step="60"
                      {...scheduleWalkForm.register("hora")}
                      className="border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    />
                    {scheduleWalkForm.formState.errors.hora && (
                      <p className="text-red-500 text-sm italic mt-1">
                        {scheduleWalkForm.formState.errors.hora.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tipoPaseo" className="text-right text-gray-700 font-medium">Tipo de Paseo</Label>
                  <div className="col-span-3">
                    <Select
                      onValueChange={(value) => scheduleWalkForm.setValue("tipoPaseo", value as keyof typeof TIPOS_PASEO)}
                      defaultValue={scheduleWalkForm.getValues("tipoPaseo")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona el tipo de paseo" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TIPOS_PASEO).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value.nombre} - {value.duracion} min (${value.precio})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tipoServicio" className="text-right text-gray-700 font-medium">Tipo de Servicio</Label>
                  <div className="col-span-3">
                    <Select
                      onValueChange={(value) => scheduleWalkForm.setValue("tipoServicio", value as keyof typeof TIPOS_SERVICIO)}
                      defaultValue={scheduleWalkForm.getValues("tipoServicio")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona el tipo de servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TIPOS_SERVICIO).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value.nombre} - {value.descripcion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-lg font-semibold text-gray-800">
                    Precio Total: ${precioTotal.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Duración: {TIPOS_PASEO[scheduleWalkForm.getValues("tipoPaseo")]?.duracion} minutos
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary-dark text-white"
                  disabled={scheduleWalkForm.formState.isSubmitting}
                >
                  {scheduleWalkForm.formState.isSubmitting ? 'Programando...' : 'Programar Paseo'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </ErrorBoundary>
    );
  } else {
    return null;
  }
} 