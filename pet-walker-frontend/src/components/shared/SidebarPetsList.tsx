import React from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon } from 'lucide-react';

interface Mascota {
  id: string;
  nombre: string;
  especie: string;
  avatar?: string;
}

interface SidebarPetsListProps {
  mascotas: Mascota[];
  onAddPet?: () => void;
}

const getPetEmoji = (especie: string) => {
  if (especie.toLowerCase().includes('gato')) return '🐱';
  return '🐶';
};

const SidebarPetsList: React.FC<SidebarPetsListProps> = ({ mascotas, onAddPet }) => {
  const router = useRouter();
  return (
    <div className="mt-6 mb-4 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">Mis Mascotas</span>
        <button
          onClick={onAddPet}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition"
          aria-label="Agregar mascota"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
      <ul className="space-y-1">
        {mascotas.map((m) => (
          <li
            key={m.id}
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-blue-100 cursor-pointer transition"
            onClick={() => router.push(`/dashboard/mascotas/${m.id}`)}
            tabIndex={0}
            aria-label={`Ver ficha de ${m.nombre}`}
          >
            <span className="text-xl">
              {m.avatar || getPetEmoji(m.especie)}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-800">{m.nombre}</span>
              <span className="text-xs text-gray-500">{m.especie}</span>
            </div>
          </li>
        ))}
        {mascotas.length === 0 && (
          <li className="text-xs text-gray-400 px-2 py-1">No tienes mascotas registradas.</li>
        )}
      </ul>
    </div>
  );
};

export default SidebarPetsList; 