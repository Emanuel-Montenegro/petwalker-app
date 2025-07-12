'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarIcon } from 'lucide-react';
import { registrarCalificacion } from '@/lib/api/calificaciones';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface CalificarPaseoModalProps {
  paseo: any;
  onCalificacionRegistrada: () => void;
  children: React.ReactNode;
}

export const CalificarPaseoModal: React.FC<CalificarPaseoModalProps> = ({ 
  paseo, 
  onCalificacionRegistrada,
  children 
}) => {
  const [open, setOpen] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const queryClient = useQueryClient();

  const calificarMutation = useMutation({
    mutationFn: registrarCalificacion,
    onSuccess: () => {
      toast.success('Calificación registrada exitosamente');
      setOpen(false);
      setPuntuacion(0);
      setComentario('');
      setHoveredStar(0);
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['misPaseos'] });
      onCalificacionRegistrada();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Error al registrar la calificación');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (puntuacion === 0) {
      toast.error('Por favor selecciona una puntuación');
      return;
    }

    calificarMutation.mutate({
      paseoId: paseo.id,
      puntuacion,
      comentario
    });
  };

  const handleStarClick = (rating: number) => {
    setPuntuacion(rating);
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {children}
      </div>
      
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl p-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/50 dark:to-orange-900/50 rounded-full flex items-center justify-center">
                  <StarIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Calificar Paseo
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                ¿Cómo fue el paseo de {paseo.mascota?.nombre}?
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                  Puntuación
                </Label>
                <div className="flex gap-1 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="p-1 transition-transform hover:scale-110"
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                    >
                      <StarIcon
                        className={`h-8 w-8 transition-colors ${
                          star <= (hoveredStar || puntuacion)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {puntuacion > 0 && (
                  <p className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {puntuacion === 1 && "Muy malo"}
                    {puntuacion === 2 && "Malo"}
                    {puntuacion === 3 && "Regular"}
                    {puntuacion === 4 && "Bueno"}
                    {puntuacion === 5 && "Excelente"}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="comentario" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Comentario (opcional)
                </Label>
                <Textarea
                  id="comentario"
                  placeholder="Comparte tu experiencia sobre el paseo..."
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows={3}
                  className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl border-gray-300 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-yellow-600 dark:to-orange-600 text-white rounded-xl hover:scale-105 transition-all duration-300" 
                  disabled={calificarMutation.isPending || puntuacion === 0}
                >
                  {calificarMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Enviando...
                    </span>
                  ) : (
                    'Enviar Calificación'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}; 