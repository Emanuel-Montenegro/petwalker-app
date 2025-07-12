'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserProfile } from '@/lib/api/user';
import { createPet } from '@/lib/api/pets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ConfirmationModal } from '@/components/shared/ConfirmationModal';
import { useAuthStore } from '@/lib/store/authStore';
import { scheduleWalk } from '@/lib/api/user';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { createPortal } from 'react-dom';

// Constantes de tipos de paseo y servicio (las mismas del dashboard)
const TIPOS_PASEO = {
  EXPRESS: {
    nombre: "Paseo Express",
    descripcion: "Ideal para perros activos que necesitan un paseo rápido",
    duracion: 20,
    precio: 15
  },
  NORMAL: {
    nombre: "Paseo Normal",
    descripcion: "Paseo estándar para mantener a tu mascota saludable",
    duracion: 45,
    precio: 25
  },
  EXTENDIDO: {
    nombre: "Paseo Extendido",
    descripcion: "Paseo más largo para perros con mucha energía",
    duracion: 60,
    precio: 35
  },
  PREMIUM: {
    nombre: "Paseo Premium",
    descripcion: "Paseo largo con atención personalizada",
    duracion: 90,
    precio: 45
  }
} as const;

const TIPOS_SERVICIO = {
  INDIVIDUAL: {
    nombre: "Individual",
    descripcion: "Paseo personalizado, ideal para perros con problemas de conducta o tímidos",
    precioMultiplier: 1.5
  },
  GRUPAL: {
    nombre: "Grupal",
    descripcion: "Paseo en grupo de 4-6 perros",
    precioMultiplier: 1
  },
  CON_ENTRENAMIENTO: {
    nombre: "Con Entrenamiento",
    descripcion: "Combina caminata con comandos básicos, ideal para cachorros",
    precioMultiplier: 1.8
  }
} as const;

// Modal de Estadísticas Detalladas
const PetDetailsModal = ({ isOpen, onClose, pet }: { isOpen: boolean; onClose: () => void; pet: any }) => {
  if (!isOpen || !pet) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 transform transition-all">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center text-5xl mx-auto mb-4">
            {pet.especie?.toLowerCase().includes('gato') ? '🐱' : '🐶'}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{pet.nombre}</h2>
          <p className="text-gray-600 dark:text-gray-400">{pet.especie} • {pet.raza}</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{pet.edad}</div>
              <div className="text-xs text-blue-600 dark:text-blue-400">{pet.edad === 1 ? 'Año' : 'Años'}</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-xl">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{pet.paseosCount || 0}</div>
              <div className="text-xs text-green-600 dark:text-green-400">Paseos</div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Sociable</span>
              <span className={`px-2 py-1 rounded-full text-xs ${pet.sociable ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'}`}>
                {pet.sociable ? 'Sí' : 'No'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">Estado</div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Disponible para paseos</div>
            </div>
          </div>
        </div>

        <Button onClick={onClose} className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          Cerrar
        </Button>
      </div>
    </div>
  );
};

// Modal de Editar Mascota
const EditPetModal = ({ isOpen, onClose, pet, onSave }: { isOpen: boolean; onClose: () => void; pet: any; onSave: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    nombre: pet?.nombre || '',
    especie: pet?.especie || '',
    raza: pet?.raza || '',
    edad: pet?.edad || 0,
    sociable: pet?.sociable || false
  });

  useEffect(() => {
    if (pet) {
      setFormData({
        nombre: pet.nombre || '',
        especie: pet.especie || '',
        raza: pet.raza || '',
        edad: pet.edad || 0,
        sociable: pet.sociable || false
      });
    }
  }, [pet]);

  if (!isOpen || !pet) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: pet.id });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 transform transition-all max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Editar {pet.nombre}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="mt-1"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="especie">Especie</Label>
            <Input
              id="especie"
              value={formData.especie}
              onChange={(e) => setFormData({...formData, especie: e.target.value})}
              className="mt-1"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="raza">Raza</Label>
            <Input
              id="raza"
              value={formData.raza}
              onChange={(e) => setFormData({...formData, raza: e.target.value})}
              className="mt-1"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="edad">Edad</Label>
            <Input
              id="edad"
              type="number"
              value={formData.edad}
              onChange={(e) => setFormData({...formData, edad: parseInt(e.target.value) || 0})}
              className="mt-1"
              min="0"
              required
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sociable"
              checked={formData.sociable}
              onCheckedChange={(checked) => setFormData({...formData, sociable: !!checked})}
            />
            <Label htmlFor="sociable">Es sociable</Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal de Agendar Paseo Completo (como el del dashboard)
const ScheduleWalkModal = ({ isOpen, onClose, pet, onSave }: { 
  isOpen: boolean; 
  onClose: () => void; 
  pet: any; 
  onSave: (data: any) => void;
}) => {
  const [walkData, setWalkData] = useState({
    fecha: '',
    hora: '',
    tipoPaseo: 'NORMAL' as keyof typeof TIPOS_PASEO,
    tipoServicio: 'GRUPAL' as keyof typeof TIPOS_SERVICIO
  });

  const [precioTotal, setPrecioTotal] = useState(0);

  // Calcular precio total cuando cambian los valores
  useEffect(() => {
    if (walkData.tipoPaseo && walkData.tipoServicio) {
      const precioBase = TIPOS_PASEO[walkData.tipoPaseo].precio;
      const multiplier = TIPOS_SERVICIO[walkData.tipoServicio].precioMultiplier;
      setPrecioTotal(precioBase * multiplier);
    }
  }, [walkData.tipoPaseo, walkData.tipoServicio]);

  if (!isOpen || !pet) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkData.fecha || !walkData.hora) {
      toast.error('Por favor completa todos los campos');
      return;
    }
    
    const walkDataToSend = {
      ...walkData,
      mascotaId: pet.id,
      precio: precioTotal,
      duracion: TIPOS_PASEO[walkData.tipoPaseo].duracion
    };
    
    onSave(walkDataToSend);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 transform transition-all max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            🚶‍♂️
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Agendar Paseo</h2>
          <p className="text-gray-600 dark:text-gray-400">Para {pet.nombre}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fecha">Fecha</Label>
            <Input
              id="fecha"
              type="date"
              value={walkData.fecha}
              onChange={(e) => setWalkData({...walkData, fecha: e.target.value})}
              className="mt-1"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="hora">Hora</Label>
            <Input
              id="hora"
              type="time"
              value={walkData.hora}
              onChange={(e) => setWalkData({...walkData, hora: e.target.value})}
              className="mt-1"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="tipoPaseo" className="flex items-center gap-2">
              <span>🏃‍♂️</span>
              Tipo de Paseo
            </Label>
            <Select 
              value={walkData.tipoPaseo}
              onValueChange={(value: keyof typeof TIPOS_PASEO) => setWalkData({...walkData, tipoPaseo: value})}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecciona el tipo de paseo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIPOS_PASEO).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center justify-between w-full">
                      <span>{value.nombre}</span>
                      <span className="text-sm text-gray-500 ml-2">{value.duracion}min • ${value.precio}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="tipoServicio" className="flex items-center gap-2">
              <span>⭐</span>
              Tipo de Servicio
            </Label>
            <Select 
              value={walkData.tipoServicio}
              onValueChange={(value: keyof typeof TIPOS_SERVICIO) => setWalkData({...walkData, tipoServicio: value})}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecciona el tipo de servicio" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIPOS_SERVICIO).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    <div>
                      <div className="font-medium">{value.nombre}</div>
                      <div className="text-xs text-gray-500">{value.descripcion}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Precio Total */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total:</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ${precioTotal.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">Duración</p>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {TIPOS_PASEO[walkData.tipoPaseo]?.duracion || 0} min
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              Agendar Paseo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal de Confirmación de Eliminación
const DeleteConfirmModal = ({ isOpen, onClose, pet, onConfirm }: { 
  isOpen: boolean; 
  onClose: () => void; 
  pet: any; 
  onConfirm: () => void;
}) => {
  if (!isOpen || !pet) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 transform transition-all">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/50 dark:to-red-800/50 rounded-full flex items-center justify-center text-5xl mx-auto mb-4">
            ⚠️
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Eliminar Mascota</h2>
          <p className="text-gray-600 dark:text-gray-400">
            ¿Estás seguro de que deseas eliminar a <span className="font-semibold text-red-600 dark:text-red-400">{pet.nombre}</span>?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Esta acción no se puede deshacer.
          </p>
        </div>

        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            className="flex-1 border-gray-300 dark:border-gray-600"
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
          >
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
};

// Modal de Agregar Mascota
const AddPetModal = ({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void }) => {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    especie: '',
    raza: '',
    fechaNacimiento: '',
    sociable: false,
    discapacidades: '',
    necesitaBozal: false,
    observaciones: ''
  });

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const edad = new Date().getFullYear() - new Date(formData.fechaNacimiento).getFullYear();
    onSave({ ...formData, edad });
  };

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Overlay con efecto glassmorphism */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-gray-900/70 to-black/70 backdrop-blur-[8px]" 
        onClick={onClose}
      />
      
      {/* Modal siempre centrado en el viewport */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-xl border border-gray-800/50">
          {/* Gradiente decorativo superior */}
          <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-2xl" />
          
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-100 mb-6">Agregar Nueva Mascota</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nombre" className="text-gray-300">Nombre</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="mt-1 bg-gray-800/50 border-gray-700/50 text-gray-100 placeholder-gray-400"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="especie" className="text-gray-300">Especie</Label>
                <Select 
                  value={formData.especie} 
                  onValueChange={(value) => setFormData({...formData, especie: value})}
                >
                  <SelectTrigger className="mt-1 bg-gray-800/50 border-gray-700/50 text-gray-100">
                    <SelectValue placeholder="Selecciona una especie" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="PERRO">Perro</SelectItem>
                    <SelectItem value="GATO">Gato</SelectItem>
                    <SelectItem value="OTRO">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="raza" className="text-gray-300">Raza</Label>
                <Input
                  id="raza"
                  value={formData.raza}
                  onChange={(e) => setFormData({...formData, raza: e.target.value})}
                  className="mt-1 bg-gray-800/50 border-gray-700/50 text-gray-100 placeholder-gray-400"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="fechaNacimiento" className="text-gray-300">Fecha de Nacimiento</Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => setFormData({...formData, fechaNacimiento: e.target.value})}
                  className="mt-1 bg-gray-800/50 border-gray-700/50 text-gray-100"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sociable"
                  checked={formData.sociable}
                  onCheckedChange={(checked) => setFormData({...formData, sociable: !!checked})}
                  className="border-gray-700 data-[state=checked]:bg-blue-500"
                />
                <Label htmlFor="sociable" className="text-gray-300">Es sociable</Label>
              </div>

              <div>
                <Label htmlFor="discapacidades" className="text-gray-300">Discapacidades</Label>
                <Input
                  id="discapacidades"
                  value={formData.discapacidades}
                  onChange={(e) => setFormData({...formData, discapacidades: e.target.value})}
                  className="mt-1 bg-gray-800/50 border-gray-700/50 text-gray-100 placeholder-gray-400"
                  placeholder="Ej: Cojera en pata trasera, Sordera parcial"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="necesitaBozal"
                  checked={formData.necesitaBozal}
                  onCheckedChange={(checked) => setFormData({...formData, necesitaBozal: !!checked})}
                  className="border-gray-700 data-[state=checked]:bg-blue-500"
                />
                <Label htmlFor="necesitaBozal" className="text-gray-300">Necesita bozal</Label>
              </div>

              <div>
                <Label htmlFor="observaciones" className="text-gray-300">Observaciones</Label>
                <Input
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                  className="mt-1 bg-gray-800/50 border-gray-700/50 text-gray-100 placeholder-gray-400"
                  placeholder="Cualquier información adicional importante"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose} 
                  className="flex-1 bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800/50"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                >
                  Guardar
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default function MascotasPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmationTitle, setConfirmationTitle] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [petToDelete, setPetToDelete] = useState<any>(null);
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { usuario } = useAuthStore();
  const itemsPerPage = 6;

  // Debug: verificar URL del backend
  console.log('🌐 Backend URL configurada:', process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api');
  
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
  });

  // Mutation para eliminar mascota (implementación simplificada y directa)
  const deletePetMutation = useMutation({
    mutationFn: async (petId: number) => {
      console.log('🚀 Iniciando eliminación de mascota con ID:', petId);
      
      try {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api'}/mascotas/${petId}`;
        console.log('📡 Enviando DELETE a:', url);
        
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        console.log('📊 Status de respuesta:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Error del servidor:', errorText);
          throw new Error(`Error ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('✅ Mascota eliminada exitosamente:', result);
        return result;
      } catch (error) {
        console.error('💥 Error en fetch:', error);
        throw error;
      }
    },
    onSuccess: (data, petId) => {
      console.log('🎉 onSuccess - Eliminando mascota con ID:', petId);
      
      // Actualizar inmediatamente el estado local
      queryClient.setQueryData(['userProfile'], (oldData: any) => {
        if (!oldData || !oldData.mascotas) {
          console.log('⚠️ No hay datos o mascotas en oldData');
          return oldData;
        }
        
        const mascotasActuales = oldData.mascotas;
        console.log('📝 Mascotas antes del filtro:', mascotasActuales.map((m: any) => ({ id: m.id, nombre: m.nombre })));
        
        const mascotasFiltradas = mascotasActuales.filter((mascota: any) => {
          const mantener = mascota.id !== petId;
          console.log(`🔍 Mascota ${mascota.nombre} (ID: ${mascota.id}) - Mantener: ${mantener}`);
          return mantener;
        });
        
        console.log('📝 Mascotas después del filtro:', mascotasFiltradas.map((m: any) => ({ id: m.id, nombre: m.nombre })));
        
        const newData = {
          ...oldData,
          mascotas: mascotasFiltradas
        };
        
        console.log('🔄 Actualizando queryClient con nuevos datos');
        return newData;
      });
      
      // Forzar re-render invalidando la query
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      
      toast.success('¡Mascota eliminada exitosamente!');
      console.log('✨ Proceso de eliminación completado');
    },
    onError: (error: any) => {
      console.error('❌ Error en onError:', error);
      toast.error(`Error al eliminar: ${error.message}`);
    }
  });

  // Mutation para editar mascota (implementación correcta)
  const updatePetMutation = useMutation({
    mutationFn: async (petData: any) => {
      const { id, ...dataToSend } = petData;
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api'}/mascotas/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar la mascota');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success('Mascota actualizada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setShowEditModal(false);
      setSelectedPet(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar la mascota');
    }
  });

  // Mutation para agendar paseo
  const scheduleWalkMutation = useMutation({
    mutationFn: async (walkData: any) => {
      if (!userProfile?.id) {
        throw new Error('Usuario no encontrado');
      }

      const walkDataToSend = {
        mascotaId: walkData.mascotaId,
        fecha: walkData.fecha,
        hora: walkData.hora,
        horaInicio: walkData.hora,
        duracion: walkData.duracion,
        usuarioId: userProfile.id,
        tipoServicio: walkData.tipoServicio,
        precio: walkData.precio,
        origenLatitud: 0,
        origenLongitud: 0
      };

      return scheduleWalk(walkDataToSend);
    },
    onSuccess: () => {
      toast.success('Paseo agendado exitosamente');
      setShowScheduleModal(false);
      setSelectedPet(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al agendar el paseo');
    }
  });

  // Agregar la mutación para crear mascotas
  const createPetMutation = useMutation({
    mutationFn: createPet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userPets'] });
      toast.success('Mascota agregada exitosamente');
      setIsAddModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al agregar la mascota');
    }
  });

  const handleViewDetails = (pet: any) => {
    setSelectedPet(pet);
    setShowDetailsModal(true);
  };

  const handleEditPet = (pet: any) => {
    setSelectedPet(pet);
    setShowEditModal(true);
  };

  const handleScheduleWalk = (pet: any) => {
    setSelectedPet(pet);
    setShowScheduleModal(true);
  };

  const handleDeletePet = (pet: any) => {
    console.log('🎯 handleDeletePet llamado con mascota:', { id: pet.id, nombre: pet.nombre });
    
    const mensaje = `¿Estás seguro de que deseas eliminar a ${pet.nombre}? Esta acción no se puede deshacer.`;
    console.log('📋 Mostrando confirmación:', mensaje);
    
    setPetToDelete(pet); // Establecer la mascota a eliminar
    setShowDeleteModal(true); // Mostrar el modal de confirmación
  };

  const handleSavePet = (petData: any) => {
    updatePetMutation.mutate(petData);
  };

  const handleSaveWalk = (walkData: any) => {
    scheduleWalkMutation.mutate(walkData);
  };

  const handleAddPet = (petData: any) => {
    createPetMutation.mutate(petData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">Cargando mascotas...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Error al cargar</h3>
          <p className="text-red-600 dark:text-red-400 mb-4">No se pudieron cargar tus mascotas.</p>
          <Button onClick={() => window.location.reload()} className="bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 text-white">
            Intentar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  // Paginación
  const mascotas = userProfile.mascotas || [];
  const totalPages = Math.ceil(mascotas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const mascotasPaginadas = mascotas.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Mis Mascotas</h1>

      {(!mascotas || mascotas.length === 0) && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center text-5xl mx-auto mb-4">
            🐾
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">¡Comienza tu aventura premium!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Agrega tu primera mascota y descubre todas las funcionalidades premium que tenemos para ti.
          </p>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
          >
            Agregar Primera Mascota
          </Button>
        </div>
      )}

      {mascotas && mascotas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mascotasPaginadas.map((mascota: any) => (
            <Card key={mascota.id} className="relative overflow-hidden group">
              {/* Gradient Background Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <CardHeader className="relative flex flex-col items-center gap-4 pb-4">
                {/* Avatar Premium */}
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center text-5xl mb-2 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    {mascota.especie?.toLowerCase().includes('gato') ? '🐱' : '🐶'}
                  </div>
                  {/* Status Dot */}
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 dark:bg-green-400 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                <div className="text-center">
                  <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                    {mascota.nombre}
                  </CardTitle>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {mascota.especie} • {mascota.raza}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {mascota.edad} {mascota.edad === 1 ? 'año' : 'años'}
                  </div>
                </div>

                {/* Status Badge Premium */}
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                  Disponible
                </span>
              </CardHeader>

              <CardContent className="relative pt-0">
                {/* Stats Premium */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {mascota.paseosCount || 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Paseos</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {mascota.sociable ? 'Sí' : 'No'}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Sociable</div>
                  </div>
                </div>

                {/* Action Buttons Premium */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-emerald-500 to-green-500 dark:from-emerald-600 dark:to-green-600 text-white hover:scale-105 transition-all duration-300 shadow-lg"
                      onClick={() => handleViewDetails(mascota)}
                    >
                      Estadísticas
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 text-white hover:scale-105 transition-all duration-300 shadow-lg"
                      onClick={() => handleEditPet(mascota)}
                      disabled={updatePetMutation.isPending}
                    >
                      {updatePetMutation.isPending ? 'Guardando...' : 'Editar'}
                    </Button>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 text-white hover:scale-105 transition-all duration-300 shadow-lg"
                    onClick={() => handleScheduleWalk(mascota)}
                    disabled={scheduleWalkMutation.isPending}
                  >
                    {scheduleWalkMutation.isPending ? 'Agendando...' : 'Agendar Paseo'}
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="w-full hover:scale-105 transition-all duration-300"
                    onClick={() => handleDeletePet(mascota)}
                    disabled={deletePetMutation.isPending}
                  >
                    {deletePetMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Card 
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer group"
            onClick={() => setIsAddModalOpen(true)}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              🐾
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Agregar Mascota</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Añade una nueva mascota a tu familia
            </p>
          </Card>
        </div>
      )}

      {/* Paginación Premium */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border-gray-300 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 hover:scale-105 transition-all duration-300"
          >
            Anterior
          </Button>
          
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(page)}
                className={`w-10 h-10 hover:scale-105 transition-all duration-300 ${
                  currentPage === page 
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 text-white shadow-lg" 
                    : "border-gray-300 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border-gray-300 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 hover:scale-105 transition-all duration-300"
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Modales */}
      <PetDetailsModal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} pet={selectedPet} />
      <EditPetModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} pet={selectedPet} onSave={handleSavePet} />
      <ScheduleWalkModal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} pet={selectedPet} onSave={handleSaveWalk} />
      
              {/* Modal de Confirmación de Eliminación */}
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setPetToDelete(null);
          }}
          pet={petToDelete}
          onConfirm={() => {
            deletePetMutation.mutate(petToDelete.id);
            setShowDeleteModal(false);
            setPetToDelete(null);
          }}
        />

      {/* Modal de Agregar Mascota */}
      <AddPetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddPet}
      />
    </div>
  );
} 