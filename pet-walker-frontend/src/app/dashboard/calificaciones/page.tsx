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
  FilterIcon 
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

const PAGE_SIZE = 10;

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
    if (promedio >= 4.5) return 'bg-green-100 text-green-800';
    if (promedio >= 4.0) return 'bg-blue-100 text-blue-800';
    if (promedio >= 3.0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const obtenerTextoPromedio = (promedio: number) => {
    if (promedio >= 4.5) return 'Excelente';
    if (promedio >= 4.0) return 'Muy Bueno';
    if (promedio >= 3.0) return 'Bueno';
    return 'Regular';
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando calificaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Intentar de nuevo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StarIcon className="h-6 w-6" />
            Sistema de Calificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros y búsqueda */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar paseador..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4 text-gray-500" />
              <select
                value={filtroPromedio || ''}
                onChange={(e) => setFiltroPromedio(e.target.value ? Number(e.target.value) : null)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Todas las calificaciones</option>
                <option value="4.5">4.5+ estrellas</option>
                <option value="4.0">4.0+ estrellas</option>
                <option value="3.0">3.0+ estrellas</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {paseadoresFiltrados.length} paseador{paseadoresFiltrados.length !== 1 ? 'es' : ''}
              </span>
            </div>
          </div>

          {/* Lista de paseadores */}
          {paseadoresFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <StarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron paseadores
              </h3>
              <p className="text-gray-500">
                Intenta ajustar los filtros de búsqueda.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Lista de paseadores */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Paseadores</h3>
                {paginatedPaseadores.map((paseador) => (
                  <Card 
                    key={paseador.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      paseadorSeleccionado === paseador.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setPaseadorSeleccionado(paseador.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{paseador.nombre}</h4>
                          <p className="text-sm text-gray-500">{paseador.email}</p>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <Rating value={paseador.promedio} readonly size="sm" />
                            <span className="text-sm font-medium">
                              {paseador.promedio.toFixed(1)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge className={obtenerColorPromedio(paseador.promedio)}>
                              {obtenerTextoPromedio(paseador.promedio)}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {paseador.totalCalificaciones} calificacion{paseador.totalCalificaciones !== 1 ? 'es' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Detalles del paseador seleccionado */}
              <div>
                {paseadorSeleccionado ? (
                  <CalificacionesPaseador
                    paseadorId={paseadorSeleccionado}
                    paseadorNombre={paseadoresFiltrados.find(p => p.id === paseadorSeleccionado)?.nombre}
                    mostrarTitulo={true}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <TrendingUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Selecciona un paseador
                      </h3>
                      <p className="text-gray-500">
                        Haz clic en un paseador para ver sus calificaciones detalladas.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Controles de paginación */}
          {paseadoresFiltrados.length > PAGE_SIZE && (
            <div className="flex justify-center mt-4 gap-2">
              <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Anterior</Button>
              <span className="px-2">Página {currentPage} de {Math.ceil(paseadoresFiltrados.length / PAGE_SIZE)}</span>
              <Button onClick={() => setCurrentPage(p => Math.min(Math.ceil(paseadoresFiltrados.length / PAGE_SIZE), p + 1))} disabled={currentPage === Math.ceil(paseadoresFiltrados.length / PAGE_SIZE)}>Siguiente</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalificacionesPage; 