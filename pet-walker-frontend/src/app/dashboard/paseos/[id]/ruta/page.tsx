"use client";

import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { obtenerPuntosGPS } from '@/lib/api/gps';
import type { Paseo } from '@/types';
import { Button } from '@/components/ui/button';

const MapWithNoSSR = dynamic(() => import('@/components/shared/LiveMap'), { ssr: false });

export default function RutaPaseoPage() {
  const { id } = useParams();
  const router = useRouter();
  const [coords, setCoords] = useState<{ lat: number; lng: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    obtenerPuntosGPS(Number(id))
      .then((data) => {
        setCoords(data.coordenadas.map(([lng, lat]) => ({ lat, lng })));
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo cargar la ruta');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Cargando ruta...</div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-600">{error}</p>
        <Button onClick={() => router.back()}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Button onClick={() => router.back()} className="mb-4 bg-gray-200 text-gray-800 hover:bg-gray-300">← Volver</Button>
      <h1 className="text-2xl font-bold mb-4 text-center">Ruta del Paseo</h1>
      <div className="w-full h-96 rounded-xl overflow-hidden">
        <MapWithNoSSR coords={coords} />
      </div>
    </div>
  );
} 