'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { fetchAvailableWalks, acceptWalk } from '@/lib/api/user';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Paseo } from '@/types';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerMisPaseosComoPaseador } from '@/lib/api/paseos';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { iniciarPaseo, finalizarPaseo } from '@/lib/api/paseos';

export default function PaseosPage() {
  const { isAuthenticated, usuario } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [showActive, setShowActive] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedWalkId, setSelectedWalkId] = useState<number | null>(null);
  const [pendingWalks, setPendingWalks] = useState<Paseo[]>([]);
  const [activeWalks, setActiveWalks] = useState<Paseo[]>([]);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [startingId, setStartingId] = useState<number | null>(null);
  const [finishingId, setFinishingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (usuario?.rol !== 'PASEADOR') {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, usuario, router]);

  const { data: availableWalks, isLoading: isLoadingWalks, isError: isErrorWalks, error: walksError, refetch: refetchAvailableWalks } = useQuery<Paseo[]> ({
    queryKey: ['availableWalks'],
    queryFn: () => fetchAvailableWalks(),
    enabled: isAuthenticated && usuario?.rol === 'PASEADOR',
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const { data: myWalks, isLoading: isLoadingMyWalks, isError: isErrorMyWalks, refetch: refetchMyWalks } = useQuery<Paseo[]>({
    queryKey: ['myWalks'],
    queryFn: () => usuario && usuario.id ? obtenerMisPaseosComoPaseador(usuario.id) : Promise.resolve([]),
    enabled: isAuthenticated && usuario?.rol === 'PASEADOR' && !!usuario?.id,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (myWalks) {
      setPendingWalks(myWalks.filter(p => p.estado === 'ACEPTADO'));
      setActiveWalks(myWalks.filter(p => p.estado === 'EN_CURSO'));
    }
  }, [myWalks]);

  // Filtrar paseos disponibles para mostrar solo los que no tienen paseador asignado
  const paseosDisponibles = (availableWalks || []).filter(p => p.estado === 'PENDIENTE' && !p.paseadorId);

  const handleAcceptWalk = async (walkId: number) => {
    if (!usuario || usuario?.rol !== 'PASEADOR') return;
    setSelectedWalkId(walkId);
    setShowConfirmModal(true);
  };

  const confirmAcceptWalk = async () => {
    if (!selectedWalkId || !usuario) return;
    try {
      setAcceptingId(selectedWalkId);
      toast.info("Aceptando paseo...");
      await acceptWalk(selectedWalkId, usuario.id);
      toast.success("Paseo aceptado exitosamente!");
      await refetchMyWalks();
      await refetchAvailableWalks();
      setShowConfirmModal(false);
    } catch (error: any) {
      console.error('Error al aceptar paseo:', error);
      toast.error(error.message || "No se pudo aceptar el paseo.");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleStartWalk = async (walkId: number) => {
    try {
      setStartingId(walkId);
      toast.info("Iniciando paseo...");
      await iniciarPaseo(walkId);
      toast.success("Paseo iniciado exitosamente!");
      await refetchMyWalks();
    } catch (error: any) {
      console.error('Error al iniciar paseo:', error);
      toast.error(error.message || "No se pudo iniciar el paseo.");
    } finally {
      setStartingId(null);
    }
  };

  const handleFinishWalk = async (walkId: number) => {
    try {
      setFinishingId(walkId);
      toast.info("Finalizando paseo...");
      await finalizarPaseo(walkId);
      toast.success("Paseo finalizado exitosamente!");
      await refetchMyWalks();
    } catch (error: any) {
      console.error('Error al finalizar paseo:', error);
      toast.error(error.message || "No se pudo finalizar el paseo.");
    } finally {
      setFinishingId(null);
    }
  };

  if (isLoadingWalks && isLoadingMyWalks) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isErrorWalks || isErrorMyWalks) {
    return (
      <Alert variant="destructive">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Error al cargar datos</AlertTitle>
        <AlertDescription>
          {(walksError?.message || 'No se pudieron cargar los paseos disponibles.')}
        </AlertDescription>
      </Alert>
    );
  }

  // Mostrar mensaje si no hay paseos disponibles ni pendientes
  if (paseosDisponibles.length === 0 && pendingWalks.length === 0 && activeWalks.length === 0) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Alert>
          <AlertTitle>No hay paseos</AlertTitle>
          <AlertDescription>
            No hay paseos disponibles en este momento.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {paseosDisponibles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Paseos Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Paseos para Aceptar</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paseosDisponibles.map((paseo: Paseo) => (
                <li key={paseo.id} className="border border-gray-200 p-6 rounded-lg shadow-lg flex flex-col justify-between h-full transform transition-transform duration-200 hover:scale-105">
                  <div>
                    <p className="font-bold text-2xl text-primary-foreground mb-3">Mascota: {paseo.mascota?.nombre || 'N/A'}</p>
                    <p className="text-gray-700 text-sm mb-1"><span className="font-medium">Fecha:</span> {new Date(paseo.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
                    <p className="text-gray-700 text-sm mb-1"><span className="font-medium">Hora:</span> {paseo.horaInicio ? paseo.horaInicio.slice(0,5) : 'N/A'}</p>
                    <p className="text-gray-700 text-sm mb-1"><span className="font-medium">Duración:</span> {paseo.duracion ? `${paseo.duracion} min` : 'N/A'}</p>
                    <p className="text-gray-700 text-sm mt-3"><span className="font-medium">Estado:</span> <span className="font-semibold text-accent-foreground">{paseo.estado}</span></p>
                  </div>
                  <Button onClick={() => handleAcceptWalk(paseo.id)} className="mt-6 w-full py-2 text-base rounded-md shadow-sm hover:shadow-md transition-all duration-200" disabled={acceptingId === paseo.id}>
                    {acceptingId === paseo.id ? 'Aceptando...' : 'Aceptar Paseo'}
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {pendingWalks.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Paseos Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pendingWalks.map((paseo: Paseo) => (
                <li key={paseo.id} className="border border-yellow-300 p-6 rounded-lg shadow-lg flex flex-col justify-between h-full">
                  <div>
                    <p className="font-bold text-2xl text-primary-foreground mb-3">Mascota: {paseo.mascota?.nombre || 'N/A'}</p>
                    <p className="text-gray-700 text-sm mb-1"><span className="font-medium">Fecha:</span> {new Date(paseo.fecha).toLocaleDateString('es-ES')}</p>
                    <p className="text-gray-700 text-sm mb-1"><span className="font-medium">Hora:</span> {paseo.horaInicio ? paseo.horaInicio.slice(0,5) : 'N/A'}</p>
                    <p className="text-gray-700 text-sm mb-1"><span className="font-medium">Duración:</span> {paseo.duracion ? `${paseo.duracion} min` : 'N/A'}</p>
                    <p className="text-gray-700 text-sm mt-3"><span className="font-medium">Estado:</span> <span className="font-semibold text-yellow-600">{paseo.estado}</span></p>
                  </div>
                  <Button onClick={() => handleStartWalk(paseo.id)} className="mt-6 w-full py-2 text-base rounded-md shadow-sm hover:shadow-md transition-all duration-200 bg-yellow-600 text-white" disabled={startingId === paseo.id}>
                    {startingId === paseo.id ? 'Iniciando...' : 'Iniciar Paseo'}
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {activeWalks.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Paseos en Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activeWalks.map((paseo: Paseo) => (
                <li key={paseo.id} className="border border-green-300 p-6 rounded-lg shadow-lg flex flex-col justify-between h-full">
                  <div>
                    <p className="font-bold text-2xl text-primary-foreground mb-3">Mascota: {paseo.mascota?.nombre || 'N/A'}</p>
                    <p className="text-gray-700 text-sm mb-1"><span className="font-medium">Fecha:</span> {new Date(paseo.fecha).toLocaleDateString('es-ES')}</p>
                    <p className="text-gray-700 text-sm mb-1"><span className="font-medium">Hora:</span> {paseo.horaInicio ? paseo.horaInicio.slice(0,5) : 'N/A'}</p>
                    <p className="text-gray-700 text-sm mb-1"><span className="font-medium">Duración:</span> {paseo.duracion ? `${paseo.duracion} min` : 'N/A'}</p>
                    <p className="text-gray-700 text-sm mt-3"><span className="font-medium">Estado:</span> <span className="font-semibold text-green-600">{paseo.estado}</span></p>
                  </div>
                  <div className="flex flex-col gap-2 mt-6">
                    {paseo.estado === 'EN_CURSO' ? (
                      <Button onClick={() => router.push(`/dashboard/paseos/${paseo.id}?enCurso=1`)} className="w-full py-2 text-base rounded-md shadow-sm hover:shadow-md transition-all duration-200 bg-green-600 text-white">Ver Tracking</Button>
                    ) : (
                      <Button onClick={() => handleStartWalk(paseo.id)} className="w-full py-2 text-base rounded-md shadow-sm hover:shadow-md transition-all duration-200 bg-yellow-600 text-white" disabled={startingId === paseo.id}>
                        {startingId === paseo.id ? 'Iniciando...' : 'Iniciar Tracking'}
                      </Button>
                    )}
                    <Button onClick={() => handleFinishWalk(paseo.id)} className="w-full py-2 text-base rounded-md shadow-sm hover:shadow-md transition-all duration-200 bg-red-600 text-white" disabled={finishingId === paseo.id}>
                      {finishingId === paseo.id ? 'Finalizando...' : 'Finalizar Paseo'}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Aceptación</DialogTitle>
          </DialogHeader>
          <p>¿Estás seguro de que deseas aceptar este paseo?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>Cancelar</Button>
            <Button onClick={confirmAcceptWalk}>Confirmar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 