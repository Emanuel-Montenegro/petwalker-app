"use client"

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Rating from '@/components/ui/rating';
import { registrarCalificacion } from '@/lib/api/calificaciones';
import { CalificacionFormData } from '../../types';
import { Paseo } from '../../types';

interface CalificarPaseoModalProps {
  paseo: Paseo;
  children: React.ReactNode;
  onCalificacionRegistrada?: () => void;
}

const CalificarPaseoModal: React.FC<CalificarPaseoModalProps> = ({
  paseo,
  children,
  onCalificacionRegistrada
}) => {
  const [open, setOpen] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (puntuacion === 0) {
      toast.error("Por favor selecciona una calificación.");
      return;
    }

    setIsSubmitting(true);

    try {
      const calificacionData: CalificacionFormData = {
        paseoId: paseo.id,
        puntuacion,
        comentario: comentario.trim() || undefined,
      };

      await registrarCalificacion(calificacionData);

      toast.success("¡Calificación registrada! Gracias por tu comentario sobre el paseador.");

      // Resetear formulario
      setPuntuacion(0);
      setComentario('');
      setOpen(false);

      // Callback opcional
      if (onCalificacionRegistrada) {
        onCalificacionRegistrada();
      }
    } catch (error) {
      console.error('Error al registrar calificación:', error);
      toast.error(error instanceof Error ? error.message : "No se pudo registrar la calificación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPuntuacion(0);
    setComentario('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Calificar Paseo</DialogTitle>
          <DialogDescription>
            ¿Cómo fue tu experiencia con el paseador? Tu calificación ayudará a otros dueños de mascotas.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del paseo */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Detalles del Paseo</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Mascota:</span> {paseo.mascota?.nombre}</p>
              <p><span className="font-medium">Fecha:</span> {new Date(paseo.fecha).toLocaleDateString('es-ES')}</p>
              <p><span className="font-medium">Duración:</span> {paseo.duracion} minutos</p>
              {paseo.paseador && (
                <p><span className="font-medium">Paseador:</span> {paseo.paseador.nombre}</p>
              )}
            </div>
          </div>

          {/* Calificación */}
          <div className="space-y-2">
            <Label htmlFor="rating">Calificación</Label>
            <div className="flex items-center gap-2">
              <Rating
                value={puntuacion}
                onChange={setPuntuacion}
                size="lg"
              />
              {puntuacion > 0 && (
                <span className="text-sm text-gray-600">
                  {puntuacion === 1 && "Muy malo"}
                  {puntuacion === 2 && "Malo"}
                  {puntuacion === 3 && "Regular"}
                  {puntuacion === 4 && "Bueno"}
                  {puntuacion === 5 && "Excelente"}
                </span>
              )}
            </div>
          </div>

          {/* Comentario */}
          <div className="space-y-2">
            <Label htmlFor="comentario">Comentario (opcional)</Label>
            <Textarea
              id="comentario"
              placeholder="Comparte tu experiencia con el paseador..."
              value={comentario}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComentario(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 text-right">
              {comentario.length}/500 caracteres
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || puntuacion === 0}
            >
              {isSubmitting ? "Registrando..." : "Enviar Calificación"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CalificarPaseoModal; 