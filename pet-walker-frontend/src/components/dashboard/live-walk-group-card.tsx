import React, { useMemo } from 'react';
import { Paseo } from '@/types';
import { useRouter } from 'next/navigation';
import { Clock } from 'lucide-react';

interface Props {
  walks: Paseo[];
}

export const LiveWalkGroupCard: React.FC<Props> = ({ walks }) => {
  const router = useRouter();

  const progressByWalk = (walk: Paseo) => {
    try {
      const start = new Date(`${walk.fecha}T${walk.horaInicio}:00`);
      const now = new Date();
      const elapsed = (now.getTime() - start.getTime()) / 60000;
      return Math.min(elapsed / walk.duracion, 1);
    } catch {
      return 0;
    }
  };

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 backdrop-blur-md p-6 space-y-6 shadow-sm">
      <div className="flex items-center gap-3 text-green-700 font-semibold text-lg">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
          <Clock className="text-white w-5 h-5" />
        </div>
        Paseos en Curso
      </div>

      {walks.map((w) => (
        <div key={w.id} className="bg-white rounded-xl p-4 shadow-inner space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-2xl">
                {w.mascota?.especie?.toLowerCase().includes('perro') ? '🐕' : '🐾'}
              </div>
              <div>
                <p className="font-medium text-gray-800">{w.mascota?.nombre}</p>
                <p className="text-xs text-gray-500">{w.duracion} min</p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/dashboard/paseos/${w.id}?enCurso=1`)}
              className="px-5 py-2 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 shadow-lg hover:shadow-xl hover:brightness-110 active:scale-95 transition-all"
            >
              Ver Tracking
            </button>
          </div>

          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-green-500" style={{ width: `${progressByWalk(w)*100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}; 