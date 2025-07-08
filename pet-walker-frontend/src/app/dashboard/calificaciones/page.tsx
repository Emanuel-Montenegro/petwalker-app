"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  StarIcon, 
  SearchIcon, 
  UsersIcon, 
  TrendingUpIcon,
  FilterIcon,
  UserIcon,
  AwardIcon
} from 'lucide-react';
import Rating from '@/components/ui/rating';
import CalificacionesPaseador from '@/components/shared/CalificacionesPaseador';
import { useAuthStore } from '@/lib/store/authStore';
import { fetchUserProfile, getAllPaseadores } from '@/lib/api/user';
import { UserProfile } from '@/types';
import { obtenerPromedioPaseador } from '@/lib/api/calificaciones';

interface PaseadorConCalificaciones {
  id: number;
  nombre: string;
  email: string;
  promedio: number;
  totalCalificaciones: number;
}

const PAGE_SIZE = 8;

const CalificacionesPage = () => {
  const { usuario } = useAuthStore();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [paseadores, setPaseadores] = useState<PaseadorConCalificaciones[]>([]);
  const [paseadorSeleccionado, setPaseadorSeleccionado] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroPromedio, setFiltroPromedio] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      if (!usuario?.id) return;
      try {
        setLoading(true);
        // Obtener perfil del usuario
        const profileData = await fetchUserProfile();
        setUserProfile(profileData);
        // Obtener lista real de paseadores
        const paseadoresApi = await getAllPaseadores();
        // Para cada paseador, obtener su promedio y total de calificaciones
        const paseadoresConCalificaciones = await Promise.all(
          paseadoresApi.map(async (p) => {
            const promedio = await obtenerPromedioPaseador(p.id);
            return {
              id: p.id,
              nombre: p.nombre,
              email: p.email,
              promedio: promedio.promedio,
              totalCalificaciones: promedio.total
            };
          })
        );
        setPaseadores(paseadoresConCalificaciones);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar la información de calificaciones');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [usuario?.id]);

  const paseadoresFiltrados = useMemo(() => paseadores.filter(paseador => {
    const matchesBusqueda = paseador.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                           paseador.email.toLowerCase().includes(busqueda.toLowerCase());
    
    const matchesPromedio = filtroPromedio === null || paseador.promedio >= filtroPromedio;
    
    return matchesBusqueda && matchesPromedio;
  }), [paseadores, busqueda, filtroPromedio]);

  const paginatedPaseadores = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return paseadoresFiltrados.slice(start, start + PAGE_SIZE);
  }, [paseadoresFiltrados, currentPage]);

  const obtenerColorPromedio = (promedio: number) => {
    if (promedio >= 4.5) return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800';
    if (promedio >= 4.0) return 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800';
    if (promedio >= 3.0) return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800';
    return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800';
  };

  const obtenerTextoPromedio = (promedio: number) => {
    if (promedio >= 4.5) return 'Excelente';
    if (promedio >= 4.0) return 'Muy Bueno';
    if (promedio >= 3.0) return 'Bueno';
    return 'Regular';
  };

  const obtenerIconoPromedio = (promedio: number) => {
    if (promedio >= 4.5) return '🏆';
    if (promedio >= 4.0) return '⭐';
    if (promedio >= 3.0) return '👍';
    return '📈';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-gray-700 font-medium">Cargando calificaciones...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error al cargar</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-xl hover:scale-105 transition-all duration-300"
          >
            Intentar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <StarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Sistema de Calificaciones</h1>
                <p className="text-gray-600">Explora las reseñas y calificaciones de nuestros paseadores</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-yellow-600 text-sm font-semibold">{paseadores.length} paseadores</span>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar paseador..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4 text-gray-500" />
              <select
                value={filtroPromedio || ''}
                onChange={(e) => setFiltroPromedio(e.target.value ? Number(e.target.value) : null)}
                className="flex h-10 w-full rounded-xl border border-gray-300 bg-background px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Todas las calificaciones</option>
                <option value="4.5">4.5+ estrellas</option>
                <option value="4.0">4.0+ estrellas</option>
                <option value="3.0">3.0+ estrellas</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <UsersIcon className="h-4 w-4" />
              <span className="text-sm font-medium">
                {paseadoresFiltrados.length} paseador{paseadoresFiltrados.length !== 1 ? 'es' : ''} encontrado{paseadoresFiltrados.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Paseadores List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <UsersIcon className="h-5 w-5" />
                Paseadores Disponibles
              </h3>
              
              {paseadoresFiltrados.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <StarIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    No se encontraron paseadores
                  </h3>
                  <p className="text-gray-600">
                    Intenta ajustar los filtros de búsqueda.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paginatedPaseadores.map((paseador) => (
                    <div
                      key={paseador.id}
                      className={`bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-102 ${
                        paseadorSeleccionado === paseador.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                      }`}
                      onClick={() => setPaseadorSeleccionado(paseador.id)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{paseador.nombre}</h4>
                          <p className="text-sm text-gray-600">{paseador.email}</p>
                        </div>
                        <div className="text-2xl">
                          {obtenerIconoPromedio(paseador.promedio)}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Rating value={paseador.promedio} readonly size="sm" />
                            <span className="text-sm font-medium text-gray-700">
                              {paseador.promedio.toFixed(1)}
                            </span>
                          </div>
                          <Badge className={`${obtenerColorPromedio(paseador.promedio)} text-xs px-2 py-1 rounded-lg`}>
                            {obtenerTextoPromedio(paseador.promedio)}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <AwardIcon className="h-3 w-3" />
                          {paseador.totalCalificaciones} calificacion{paseador.totalCalificaciones !== 1 ? 'es' : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {paseadoresFiltrados.length > PAGE_SIZE && (
                <div className="flex justify-center mt-6 gap-2">
                  <Button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                    disabled={currentPage === 1}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-xl hover:scale-105 transition-all duration-300 disabled:opacity-50"
                  >
                    Anterior
                  </Button>
                  <span className="px-4 py-2 text-gray-600 font-medium">
                    Página {currentPage} de {Math.ceil(paseadoresFiltrados.length / PAGE_SIZE)}
                  </span>
                  <Button 
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(paseadoresFiltrados.length / PAGE_SIZE), p + 1))} 
                    disabled={currentPage === Math.ceil(paseadoresFiltrados.length / PAGE_SIZE)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:scale-105 transition-all duration-300 disabled:opacity-50"
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Paseador Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 sticky top-8">
              {paseadorSeleccionado ? (
                <CalificacionesPaseador
                  paseadorId={paseadorSeleccionado}
                  paseadorNombre={paseadoresFiltrados.find(p => p.id === paseadorSeleccionado)?.nombre}
                  mostrarTitulo={true}
                />
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <TrendingUpIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Selecciona un paseador
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Haz clic en un paseador para ver sus calificaciones detalladas y comentarios.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalificacionesPage; 