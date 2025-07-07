import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import React from 'react';
import { PremiumCalendar } from '@/components/shared/PremiumCalendar';
import { TIPOS_PASEO, TIPOS_SERVICIO } from '@/lib/constants/paseo';
import { UseFormReturn } from 'react-hook-form';
import { ScheduleWalkFormData } from '@/types';

interface Props {
  form: UseFormReturn<ScheduleWalkFormData>;
  onSubmit: (data: ScheduleWalkFormData) => void;
  precioTotal: number;
}

export const ScheduleWalkDialog: React.FC<Props> = ({ form, onSubmit, precioTotal }) => {
  return (
    <DialogContent className="w-full max-w-[90vw] sm:max-w-[480px] p-0 overflow-hidden rounded-2xl">
      <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <DialogTitle className="text-lg">Programar Paseo</DialogTitle>
      </DialogHeader>

      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5 bg-white">
        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start h-10">
                {form.watch('fecha') ? format(form.watch('fecha'), 'd MMM yyyy', { locale: es }) : 'Seleccionar fecha'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <PremiumCalendar
                selectedDate={form.watch('fecha')}
                onDateSelect={(date) => form.setValue('fecha', date)}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Hora */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hora</label>
          <Input type="time" {...form.register('hora')} className="w-full h-10" />
        </div>

        {/* Tipo paseo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Paseo</label>
          <Select value={form.watch('tipoPaseo')} onValueChange={(v) => form.setValue('tipoPaseo', v as any)}>
            <SelectTrigger className="w-full h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TIPOS_PASEO).map(([key, t]) => (
                <SelectItem key={key} value={key}>{t.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tipo servicio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Servicio</label>
          <Select value={form.watch('tipoServicio')} onValueChange={(v) => form.setValue('tipoServicio', v as any)}>
            <SelectTrigger className="w-full h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TIPOS_SERVICIO).map(([key, s]) => (
                <SelectItem key={key} value={key}>{s.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Resumen */}
        <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
          <span className="text-sm text-gray-600">Total</span>
          <span className="font-bold text-lg">${precioTotal}</span>
        </div>

        <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white h-12 rounded-xl">Confirmar</Button>
      </form>
    </DialogContent>
  );
}; 