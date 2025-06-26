"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StarIcon, MessageCircleIcon, CalendarIcon } from 'lucide-react';
import Rating from '@/components/ui/rating';
import { obtenerCalificacionesPaseador, obtenerPromedioPaseador } from '../../lib/api/calificaciones';
import { Calificacion, PromedioCalificacion } from '../../types';

interface CalificacionesPaseadorProps {
  paseadorId: number;
  paseadorNombre?: string;
  mostrarTitulo?: boolean;
  limite?: number; // Para mostrar solo las últimas N calificaciones
}

const CalificacionesPaseador: React.FC<CalificacionesPaseadorProps> = ({
  paseadorId,
  paseadorNombre,
  mostrarTitulo = true,
  limite
}) => {
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [promedio, setPromedio] = useState<PromedioCalificacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalificaciones = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener calificaciones y promedio en paralelo
        const [calificacionesData, promedioData] = await Promise.all([
          obtenerCalificacionesPaseador(paseadorId),
          obtenerPromedioPaseador(paseadorId)
        ]);

        let calificacionesParaMostrar = calificacionesData.calificaciones;
        
        // Aplicar límite si se especifica
        if (limite && calificacionesParaMostrar.length > limite) {
          calificacionesParaMostrar = calificacionesParaMostrar.slice(0, limite);
        }

        setCalificaciones(calificacionesParaMostrar);
        setPromedio(promedioData);
      } catch (err) {
        console.error('Error al cargar calificaciones:', err);
        setError('Error al cargar las calificaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchCalificaciones();
  }, [paseadorId, limite]);

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getColorPorPuntuacion = (puntuacion: number) => {
    if (puntuacion >= 4) return 'bg-green-100 text-green-800';
    if (puntuacion >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {mostrarTitulo && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StarIcon className="h-5 w-5" />
            Calificaciones{paseadorNombre && ` de ${paseadorNombre}`}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-6">
        {/* Resumen del promedio */}
        {promedio && promedio.total > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Rating value={promedio.promedio} readonly size="md" />
                <span className="text-lg font-semibold">
                  {promedio.promedio.toFixed(1)}
                </span>
              </div>
              <Badge variant="secondary">
                {promedio.total} {promedio.total === 1 ? 'calificación' : 'calificaciones'}
              </Badge>
            </div>
          </div>
        )}

        {/* Lista de calificaciones */}
        {calificaciones.length === 0 ? (
          <div className="text-center py-8">
            <StarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">
              Este paseador aún no tiene calificaciones
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {calificaciones.map((calificacion) => (
              <div
                key={calificacion.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Rating value={calificacion.puntuacion} readonly size="sm" />
                    <Badge className={getColorPorPuntuacion(calificacion.puntuacion)}>
                      {calificacion.puntuacion} {calificacion.puntuacion === 1 ? 'estrella' : 'estrellas'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <CalendarIcon className="h-3 w-3" />
                    <span>{formatearFecha(calificacion.creadoEn)}</span>
                  </div>
                </div>

                {calificacion.comentario && (
                  <div className="flex items-start gap-2">
                    <MessageCircleIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 text-sm leading-relaxed">
                      "{calificacion.comentario}"
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Indicador si hay más calificaciones */}
            {limite && promedio && promedio.total > limite && (
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Mostrando las {limite} calificaciones más recientes de {promedio.total} total
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalificacionesPaseador; 