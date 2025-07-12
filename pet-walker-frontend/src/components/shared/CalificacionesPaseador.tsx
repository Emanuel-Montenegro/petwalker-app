"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StarIcon, MessageCircleIcon, CalendarIcon, ThumbsUpIcon, ThumbsDownIcon, FilterIcon } from 'lucide-react';
import Rating from '@/components/ui/rating';
import { obtenerCalificacionesPaseador, obtenerPromedioPaseador } from '../../lib/api/calificaciones';
import { Calificacion, PromedioCalificacion } from '../../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CalificacionesPaseadorProps {
  paseadorId: number;
  paseadorNombre?: string;
  mostrarTitulo?: boolean;
  limite?: number;
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
  const [filtro, setFiltro] = useState<string>('todas');

  useEffect(() => {
    const fetchCalificaciones = async () => {
      try {
        setLoading(true);
        setError(null);

        const [calificacionesData, promedioData] = await Promise.all([
          obtenerCalificacionesPaseador(paseadorId),
          obtenerPromedioPaseador(paseadorId)
        ]);

        let calificacionesParaMostrar = calificacionesData.calificaciones;
        
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
    if (puntuacion >= 4.5) return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800';
    if (puntuacion >= 4) return 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800';
    if (puntuacion >= 3) return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800';
    return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800';
  };

  const getIconoPorPuntuacion = (puntuacion: number) => {
    if (puntuacion >= 4.5) return '🏆';
    if (puntuacion >= 4) return '⭐';
    if (puntuacion >= 3) return '👍';
    return '📈';
  };

  const getTextoPorPuntuacion = (puntuacion: number) => {
    if (puntuacion >= 4.5) return 'Excelente';
    if (puntuacion >= 4) return 'Muy Bueno';
    if (puntuacion >= 3) return 'Bueno';
    return 'Regular';
  };

  const calificacionesFiltradas = calificaciones.filter(cal => {
    if (filtro === 'todas') return true;
    if (filtro === 'positivas') return cal.puntuacion >= 4;
    if (filtro === 'negativas') return cal.puntuacion < 3;
    return true;
  });

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
          <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">
                <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {promedio.promedio.toFixed(1)}
                </span>
                <div className="mt-2">
                  <Rating value={promedio.promedio} readonly size="lg" />
                </div>
              </div>
              <div className="space-y-2">
                <Badge variant="secondary" className="text-sm">
                  {promedio.total} {promedio.total === 1 ? 'calificación' : 'calificaciones'} en total
                </Badge>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {getTextoPorPuntuacion(promedio.promedio)} {getIconoPorPuntuacion(promedio.promedio)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="mb-6 flex items-center gap-3">
          <FilterIcon className="h-4 w-4 text-gray-500" />
          <Select value={filtro} onValueChange={setFiltro}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar calificaciones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las calificaciones</SelectItem>
              <SelectItem value="positivas">Solo positivas (4-5 ⭐)</SelectItem>
              <SelectItem value="negativas">Solo negativas (1-2 ⭐)</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-500">
            {calificacionesFiltradas.length} resultado{calificacionesFiltradas.length !== 1 ? 's' : ''}
          </span>
        </div>

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
            {calificacionesFiltradas.map((calificacion) => (
              <div
                key={calificacion.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Rating value={calificacion.puntuacion} readonly size="sm" />
                      <Badge className={getColorPorPuntuacion(calificacion.puntuacion)}>
                        {getTextoPorPuntuacion(calificacion.puntuacion)} {getIconoPorPuntuacion(calificacion.puntuacion)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <CalendarIcon className="h-3 w-3" />
                      <span>{formatearFecha(calificacion.creadoEn)}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {calificacion.puntuacion} {calificacion.puntuacion === 1 ? 'estrella' : 'estrellas'}
                  </Badge>
                </div>

                {calificacion.comentario && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <MessageCircleIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-900 dark:text-gray-100 text-sm leading-relaxed">
                          "{calificacion.comentario}"
                        </p>
                        <div className="mt-2 flex items-center gap-4">
                          <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <ThumbsUpIcon className="h-3 w-3" />
                            <span>Útil</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <ThumbsDownIcon className="h-3 w-3" />
                            <span>No útil</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Indicador si hay más calificaciones */}
        {limite && promedio && promedio.total > limite && (
          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
            <p className="text-sm text-gray-500">
              Mostrando las {limite} calificaciones más recientes de {promedio.total} total
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalificacionesPaseador; 