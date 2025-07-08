import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Paseo } from '@/types';
import { cn } from '@/lib/utils';

interface LiveWalkCardProps {
  walk: Paseo;
}

export const LiveWalkCard: React.FC<LiveWalkCardProps> = ({ walk }) => {
  const router = useRouter();
  // calcular progreso simple
  const progress = useMemo(() => {
    if (!walk) return 0;
    try {
      const start = new Date(`${walk.fecha}T${walk.horaInicio}:00`);
      const now = new Date();
      const elapsedMin = (now.getTime() - start.getTime()) / 1000 / 60;
      return Math.min(elapsedMin / walk.duracion, 1);
    } catch {
      return 0;
    }
  }, [walk]);

  return (
    <div className="rounded-2xl border border-green-100 bg-green-50/40 backdrop-blur-sm p-6 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600/10 text-green-700 rounded-xl flex items-center justify-center text-xl">
            ⏱️
          </div>
          <div>
            <h3 className="font-semibold text-green-700">Paseo en Curso</h3>
            <p className="text-sm text-green-600">Seguimiento en tiempo real</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium text-green-700">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> En vivo
        </div>
      </div>

      {/* Inner card */}
      <div className="bg-white rounded-xl p-4 flex items-center justify-between gap-4 shadow-inner">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center text-2xl">
            {walk.mascota?.especie?.toLowerCase().includes('perro') ? '🐕' : '🐾'}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-800 truncate">{walk.mascota?.nombre || 'Mascota'}</p>
            <p className="text-sm text-gray-500 truncate">{walk.fecha} • {walk.horaInicio}</p>
          </div>
        </div>
        <div className="flex-shrink-0 flex gap-2">
          <button onClick={() => router.push(`/dashboard/paseos/${walk.id}?enCurso=1`)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm">Ver Tracking</button>
          <button onClick={() => router.push(`/dashboard/paseos/${walk.id}/ruta`)} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:brightness-110 text-white px-4 py-2 rounded-lg text-sm">Ver Ruta</button>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0 min</span>
          <span>{walk.duracion} min</span>
        </div>
      </div>
    </div>
  );
}; 