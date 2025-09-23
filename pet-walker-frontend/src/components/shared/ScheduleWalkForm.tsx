import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PremiumCalendar } from './PremiumCalendar';
import { useState, useEffect, useCallback } from 'react';
import { format, addMinutes, isBefore, isAfter, startOfDay, endOfDay, addDays } from 'date-fns';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { scheduleWalk } from '@/lib/api/user';
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';

// Constantes compartidas
export const TIPOS_PASEO = {
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

export const TIPOS_SERVICIO = {
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

const scheduleWalkSchema = z.object({
  fecha: z.date({
    required_error: "La fecha del paseo es requerida.",
  }).refine((date) => {
    const now = new Date();
    const today = startOfDay(now);
    return !isBefore(date, today);
  }, "No puedes agendar paseos para fechas pasadas."),
  hora: z.string()
    .min(1, { message: "La hora es requerida." })
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Formato de hora inválido (HH:MM)." }),
  tipoPaseo: z.enum(['EXPRESS', 'NORMAL', 'EXTENDIDO', 'PREMIUM']),
  tipoServicio: z.enum(['INDIVIDUAL', 'GRUPAL', 'CON_ENTRENAMIENTO']),
}).superRefine((data, ctx) => {
  const now = new Date();
  const selectedDateTime = new Date(data.fecha);
  const [hours, minutes] = data.hora.split(':').map(Number);
  selectedDateTime.setHours(hours, minutes, 0, 0);

  // Si es para hoy, validar que la hora sea futura
  const isToday = startOfDay(selectedDateTime).getTime() === startOfDay(now).getTime();
  if (isToday && isBefore(selectedDateTime, addMinutes(now, 10))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Para paseos de hoy, la hora debe ser al menos 10 minutos después de la hora actual.",
      path: ["hora"]
    });
    return false;
  }

  // Si la fecha es futura (más de 2 días), solo validar que sea una hora válida (00:00-23:59)
  const twoDaysFromNow = addDays(now, 2);
  if (isAfter(selectedDateTime, twoDaysFromNow)) {
    const isValidTime = hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
    if (!isValidTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Por favor selecciona una hora válida (00:00-23:59).",
        path: ["hora"]
      });
      return false;
    }
  }

  return true;
});

type ScheduleWalkFormData = z.infer<typeof scheduleWalkSchema>;

// Componente TimeSelector corregido
const TimeSelector = ({ value, onChange, className = '' }: { value: string; onChange: (time: string) => void; className?: string }) => {
  const [selectedHour, setSelectedHour] = useState(() => {
    return value ? value.split(':')[0] : '09';
  });
  const [selectedMinute, setSelectedMinute] = useState(() => {
    return value ? value.split(':')[1] : '00';
  });

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  // Usar useCallback para evitar recrear la función en cada render
  const handleTimeChange = useCallback(() => {
    const timeString = `${selectedHour}:${selectedMinute}`;
    if (timeString !== value) {
      onChange(timeString);
    }
  }, [selectedHour, selectedMinute, onChange, value]);

  // Ejecutar solo cuando cambian hora o minuto
  useEffect(() => {
    handleTimeChange();
  }, [handleTimeChange]);

  // Sincronizar con el valor externo cuando cambia
  useEffect(() => {
    if (value && value !== `${selectedHour}:${selectedMinute}`) {
      const [hour, minute] = value.split(':');
      setSelectedHour(hour);
      setSelectedMinute(minute);
    }
  }, [value]);

  return (
    <div className={`flex gap-2 ${className}`}>
      <div className="flex-1">
        <Label className="text-xs text-gray-500 mb-1 block">Hora</Label>
        <Select value={selectedHour} onValueChange={setSelectedHour}>
          <SelectTrigger className="h-11 px-3 border-gray-200 dark:border-gray-700 rounded-xl bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/30 dark:to-purple-900/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-60 z-[9999] scrollbar-hide" position="popper">
            {hours.map((hour) => (
              <SelectItem key={hour} value={hour}>
                {hour}:00
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <Label className="text-xs text-gray-500 mb-1 block">Minutos</Label>
        <Select value={selectedMinute} onValueChange={setSelectedMinute}>
          <SelectTrigger className="h-11 px-3 border-gray-200 dark:border-gray-700 rounded-xl bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/30 dark:to-purple-900/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[9999] scrollbar-hide" position="popper">
            {minutes.map((minute) => (
              <SelectItem key={minute} value={minute}>
                :{minute}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end">
        <div className="h-11 px-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 rounded-xl border border-green-200 dark:border-green-800 flex items-center">
          <span className="text-lg font-bold text-green-600 dark:text-green-400">
            {selectedHour}:{selectedMinute}
          </span>
        </div>
      </div>
    </div>
  );
};

interface ScheduleWalkFormProps {
  mascota: any;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function ScheduleWalkForm({ mascota, onSuccess, onCancel, className = '' }: ScheduleWalkFormProps) {
  const [precioTotal, setPrecioTotal] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const queryClient = useQueryClient();
  const { usuario } = useAuthStore();
  const router = useRouter();

  const form = useForm<ScheduleWalkFormData>({
    resolver: zodResolver(scheduleWalkSchema),
    defaultValues: {
      hora: '09:00',
      tipoPaseo: 'NORMAL',
      tipoServicio: 'GRUPAL',
    },
  });

  // Función memoizada para actualizar la hora
  const handleTimeChange = useCallback((time: string) => {
    form.setValue("hora", time, { shouldValidate: true });
  }, [form]);

  const toLocalDate = (iso: string) => {
    const [y,m,d] = iso.split('-').map(Number);
    return new Date(y, m-1, d);
  };

  const formatDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  // Calcular precio total cuando cambian los valores
  useEffect(() => {
    const tipoPaseo = form.watch('tipoPaseo');
    const tipoServicio = form.watch('tipoServicio');
    
    if (tipoPaseo && tipoServicio) {
      const precioBase = TIPOS_PASEO[tipoPaseo].precio;
      const multiplier = TIPOS_SERVICIO[tipoServicio].precioMultiplier;
      setPrecioTotal(precioBase * multiplier);
    }
  }, [form.watch('tipoPaseo'), form.watch('tipoServicio')]);

  const onSubmit = async (data: ScheduleWalkFormData) => {
    if (!mascota || !usuario) {
      toast.error("Error: No se pudo obtener la mascota o el perfil del usuario.");
      return;
    }

    try {
      const formattedDate = format(data.fecha, "yyyy-MM-dd");
      const duracion = TIPOS_PASEO[data.tipoPaseo].duracion;

      const walkData = {
        mascotaId: mascota.id,
        fecha: formattedDate,
        hora: data.hora,
        horaInicio: data.hora,
        duracion: duracion,
        usuarioId: usuario.id,
        tipoServicio: data.tipoServicio,
        precio: precioTotal,
        origenLatitud: 0,
        origenLongitud: 0
      };

      await scheduleWalk(walkData);
      
      // Invalidar queries relevantes
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['misPaseos'] });
      queryClient.invalidateQueries({ queryKey: ['historialPaseos'] });
      
      toast.success("Paseo programado exitosamente!");
      onSuccess?.();
    } catch (error) {
      console.error('Error al agendar paseo:', error);
      toast.error("No se pudo programar el paseo.");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-4 ${className}`}>
      {/* Fecha Field */}
      <div className="group relative">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          <span className="text-xl">📅</span>
          <span>Fecha del Paseo</span>
        </Label>
        <button
          type="button"
          className="w-full h-11 px-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-between text-gray-700 dark:text-gray-300 font-medium focus:ring-2 focus:ring-blue-400 transition-all"
          onClick={() => setShowCalendar(v => !v)}
        >
          {form.watch("fecha") ? new Date(form.watch("fecha")).toLocaleDateString('es-ES') : 'Seleccionar fecha'}
          <span className="ml-2 text-lg">▼</span>
        </button>
        {showCalendar && (
          <div className="absolute z-[9999] mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
            <PremiumCalendar
              value={form.watch("fecha") ? formatDate(form.watch("fecha")) : ''}
              onChange={(dateString) => {
                form.setValue("fecha", toLocalDate(dateString));
                setShowCalendar(false);
              }}
            />
          </div>
        )}
        {form.formState.errors.fecha && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.fecha.message}</p>
        )}
      </div>

      {/* Hora Field - Corregido */}
      <div>
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          <span className="text-xl">⏰</span>
          <span>Hora del Paseo (24h)</span>
        </Label>
        <TimeSelector
          value={form.watch("hora") || '09:00'}
          onChange={handleTimeChange}
        />
        {form.formState.errors.hora && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.hora.message}</p>
        )}
      </div>

      {/* Tipo de Paseo */}
      <div>
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          <span className="text-xl">🏃‍♂️</span>
          <span>Tipo de Paseo</span>
        </Label>
        <Select
          value={form.watch("tipoPaseo")}
          onValueChange={(value: any) => form.setValue("tipoPaseo", value)}
        >
          <SelectTrigger className="h-11 px-4 border-gray-200 dark:border-gray-700 rounded-xl bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/30 dark:to-purple-900/30">
            <SelectValue placeholder="Selecciona el tipo de paseo" />
          </SelectTrigger>
          <SelectContent className="z-[9999]" position="popper">
            {Object.entries(TIPOS_PASEO).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center justify-between w-full">
                  <span>{value.nombre}</span>
                  <span className="text-sm text-gray-500 ml-2">{value.duracion}min • ${value.precio}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tipo de Servicio */}
      <div>
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          <span className="text-xl">🦮</span>
          <span>Tipo de Servicio</span>
        </Label>
        <Select
          value={form.watch("tipoServicio")}
          onValueChange={(value: any) => form.setValue("tipoServicio", value)}
        >
          <SelectTrigger className="h-11 px-4 border-gray-200 dark:border-gray-700 rounded-xl bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/30 dark:to-purple-900/30">
            <SelectValue placeholder="Selecciona el tipo de servicio" />
          </SelectTrigger>
          <SelectContent className="z-[9999]" position="popper">
            {Object.entries(TIPOS_SERVICIO).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center justify-between w-full">
                  <span>{value.nombre}</span>
                  <span className="text-sm text-gray-500 ml-2">x{value.precioMultiplier}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Precio Total */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total:</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ${precioTotal.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Duración</p>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {TIPOS_PASEO[form.watch("tipoPaseo")]?.duracion || 0} min
            </p>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-11 rounded-xl border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium"
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          className="flex-1 h-11 bg-gradient-to-r from-blue-500 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Procesando...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>✨</span>
              <span>Agendar Paseo</span>
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}