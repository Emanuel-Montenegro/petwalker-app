"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PremiumCalendar } from './PremiumCalendar';
import { UseFormReturn } from 'react-hook-form';

interface BottomSheetScheduleModalProps {
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

const BottomSheetScheduleModal: React.FC<BottomSheetScheduleModalProps> = ({
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
  const [showCalendar, setShowCalendar] = useState(false);

  const toLocalDate = (iso: string) => {
    const [y,m,d] = iso.split('-').map(Number);
    return new Date(y, m-1, d);
  };
  const formatDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Bottom Sheet */}
          <motion.div
            className="fixed left-0 right-0 bottom-0 z-50"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ touchAction: 'none' }}
          >
            <div className="bg-white rounded-t-3xl shadow-2xl p-0 w-full max-w-md mx-auto border-t border-gray-100">
              {/* Drag handle */}
              <div className="flex justify-center py-2">
                <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
              </div>
              {/* Header */}
              <div className="px-5 pt-1 pb-3 bg-gradient-to-r from-blue-500 to-pink-500 rounded-t-3xl flex items-center gap-3">
                <span className="text-2xl">🚶‍♂️</span>
                <div>
                  <h2 className="text-lg font-bold text-white">Programar Paseo</h2>
                  <p className="text-xs text-white/90">{selectedMascota?.nombre} • {selectedMascota?.especie}</p>
                </div>
                <button onClick={onClose} className="ml-auto text-white/80 text-xl px-2">×</button>
              </div>
              {/* Form */}
              <form onSubmit={form.handleSubmit(onSubmit)} className="p-5 space-y-4">
                {/* Fecha (colapsable) */}
                <div className="group">
                  <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span className="text-xl">📅</span>
                    <span>Fecha del Paseo</span>
                  </Label>
                  <button
                    type="button"
                    className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-gradient-to-r from-blue-50/50 to-purple-50/50 flex items-center justify-between text-gray-700 font-medium focus:ring-2 focus:ring-blue-400 transition-all"
                    onClick={() => setShowCalendar((v) => !v)}
                  >
                    {form.watch("fecha") ? new Date(form.watch("fecha")).toLocaleDateString('es-ES') : 'Seleccionar fecha'}
                    <span className="ml-2 text-lg">▼</span>
                  </button>
                  <AnimatePresence>
                    {showCalendar && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2"
                      >
                        <PremiumCalendar
                          value={form.watch("fecha") ? formatDate(form.watch("fecha")) : ''}
                          onChange={(dateString) => {
                            form.setValue("fecha", toLocalDate(dateString));
                            setShowCalendar(false);
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {form.formState.errors.fecha && (
                    <p className="text-red-500 text-sm mt-1">{(form.formState.errors.fecha as any).message}</p>
                  )}
                </div>
                {/* Hora */}
                <div className="group">
                  <Label htmlFor="hora" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span className="text-xl">🕐</span>
                    <span>Hora del Paseo</span>
                  </Label>
                  <Input
                    id="hora"
                    type="time"
                    step="60"
                    {...form.register("hora")}
                    className="w-full h-11 px-4 border-gray-200 bg-gradient-to-r from-green-50/50 to-blue-50/50 focus:ring-2 focus:ring-green-400 rounded-xl"
                  />
                  {form.formState.errors.hora && (
                    <p className="text-red-500 text-sm mt-1">{(form.formState.errors.hora as any).message}</p>
                  )}
                </div>
                {/* Tipo de Paseo */}
                <div className="group">
                  <Label htmlFor="tipoPaseo" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span className="text-xl">🏃‍♂️</span>
                    <span>Tipo de Paseo</span>
                  </Label>
                  <Select
                    onValueChange={(value) => form.setValue("tipoPaseo", value)}
                    defaultValue={form.getValues("tipoPaseo")}
                  >
                    <SelectTrigger className="w-full h-11 px-4 border-gray-200 bg-gradient-to-r from-purple-50/50 to-pink-50/50 focus:ring-2 focus:ring-purple-400 rounded-xl">
                      <SelectValue placeholder="Selecciona el tipo de paseo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TIPOS_PASEO).map(([key, value]: [string, any]) => (
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
                <div className="group">
                  <Label htmlFor="tipoServicio" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span className="text-xl">⭐</span>
                    <span>Tipo de Servicio</span>
                  </Label>
                  <Select
                    onValueChange={(value) => form.setValue("tipoServicio", value)}
                    defaultValue={form.getValues("tipoServicio")}
                  >
                    <SelectTrigger className="w-full h-11 px-4 border-gray-200 bg-gradient-to-r from-yellow-50/50 to-orange-50/50 focus:ring-2 focus:ring-yellow-400 rounded-xl">
                      <SelectValue placeholder="Selecciona el tipo de servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TIPOS_SERVICIO).map(([key, value]: [string, any]) => (
                        <SelectItem key={key} value={key}>
                          <div>
                            <div className="font-medium">{value.nombre}</div>
                            <div className="text-xs text-gray-500">{value.descripcion}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Precio Total */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💰</span>
                      <div>
                        <p className="text-sm text-gray-600">Total:</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          ${precioTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Duración</p>
                      <p className="text-lg font-semibold text-gray-700">
                        {TIPOS_PASEO[form.getValues("tipoPaseo")]?.duracion || 0} min
                      </p>
                    </div>
                  </div>
                </div>
                {/* Botones */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={onClose}
                    className="flex-1 h-11 rounded-xl border-gray-300 hover:bg-gray-50 font-medium"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 h-11 bg-gradient-to-r from-blue-500 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomSheetScheduleModal; 