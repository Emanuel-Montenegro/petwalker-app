"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from 'lucide-react';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from '@/lib/utils';
import { UseFormReturn } from 'react-hook-form';

interface PremiumScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMascota: any;
  form: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  precioTotal: number;
  TIPOS_PASEO: any;
  TIPOS_SERVICIO: any;
  isSubmitting: boolean;
}

const PremiumScheduleModal: React.FC<PremiumScheduleModalProps> = ({
  isOpen,
  onClose,
  selectedMascota,
  form,
  onSubmit,
  precioTotal,
  TIPOS_PASEO,
  TIPOS_SERVICIO,
  isSubmitting
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white border-0 rounded-3xl shadow-2xl p-0">
        {/* Premium Header */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6 rounded-t-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">🚶‍♂️</span>
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                Programar Paseo
              </DialogTitle>
              <DialogDescription className="text-white/90">
                Programa un paseo para {selectedMascota?.nombre}
              </DialogDescription>
            </div>
          </div>
          
          {/* Pet Info Card */}
          {selectedMascota && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl">
                    {selectedMascota.especie?.toLowerCase().includes('gato') ? '🐱' : '🐕'}
                  </span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">{selectedMascota.nombre}</h3>
                  <p className="text-white/80 text-sm">{selectedMascota.especie} • {selectedMascota.edad} años</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Fecha */}
            <div className="space-y-2">
              <Label htmlFor="fecha" className="text-gray-700 font-semibold">Fecha del Paseo</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal rounded-xl border-gray-300 hover:border-blue-500 transition-colors",
                      !form.watch("fecha") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("fecha") ? (
                      format(form.watch("fecha"), "PPP", { locale: es })
                    ) : (
                      <span>Selecciona una fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4 rounded-xl shadow-xl bg-white" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch("fecha")}
                    onSelect={(date) => {
                      if (date && date >= new Date(new Date().setHours(0,0,0,0))) {
                        form.setValue("fecha", date);
                      }
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.fecha && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.fecha.message}
                </p>
              )}
            </div>

            {/* Hora */}
            <div className="space-y-2">
              <Label htmlFor="hora" className="text-gray-700 font-semibold">Hora del Paseo</Label>
              <Input
                id="hora"
                type="time"
                step="60"
                {...form.register("hora")}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
              />
              {form.formState.errors.hora && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.hora.message}
                </p>
              )}
            </div>

            {/* Tipo de Paseo */}
            <div className="space-y-2">
              <Label htmlFor="tipoPaseo" className="text-gray-700 font-semibold">Tipo de Paseo</Label>
              <Select
                onValueChange={(value) => form.setValue("tipoPaseo", value)}
                defaultValue={form.getValues("tipoPaseo")}
              >
                <SelectTrigger className="w-full rounded-xl border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="Selecciona el tipo de paseo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPOS_PASEO).map(([key, value]: [string, any]) => (
                    <SelectItem key={key} value={key}>
                      {value.nombre} - {value.duracion} min (${value.precio})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Servicio */}
            <div className="space-y-2">
              <Label htmlFor="tipoServicio" className="text-gray-700 font-semibold">Tipo de Servicio</Label>
              <Select
                onValueChange={(value) => form.setValue("tipoServicio", value)}
                defaultValue={form.getValues("tipoServicio")}
              >
                <SelectTrigger className="w-full rounded-xl border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="Selecciona el tipo de servicio" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPOS_SERVICIO).map(([key, value]: [string, any]) => (
                    <SelectItem key={key} value={key}>
                      {value.nombre} - {value.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Precio Total */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-800">
                    Precio Total: <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">${precioTotal.toFixed(2)}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Duración: {TIPOS_PASEO[form.getValues("tipoPaseo")]?.duracion || 0} minutos
                  </p>
                </div>
                <div className="text-3xl">💰</div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="button"
                variant="outline" 
                onClick={onClose}
                className="flex-1 rounded-xl border-gray-300 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Programando...
                  </span>
                ) : (
                  <>
                    <span className="mr-2">🚶‍♂️</span>
                    Programar Paseo
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumScheduleModal; 