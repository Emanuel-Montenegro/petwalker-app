'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

interface Mascota {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
  sociable: boolean;
  alergias: string[];
  discapacidades: string[];
  necesitaBozal: boolean;
  estadoVacunacion: string;
  observaciones: string;
  foto?: string;
}

export default function MascotaDetalle() {
  const { id } = useParams();
  const { token } = useAuthStore();
  const [mascota, setMascota] = useState<Mascota | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState<Mascota>({
    id: 0,
    nombre: '',
    especie: '',
    raza: '',
    edad: 0,
    sociable: false,
    alergias: [],
    discapacidades: [],
    necesitaBozal: false,
    estadoVacunacion: '',
    observaciones: '',
    foto: ''
  });

  useEffect(() => {
    const fetchMascota = async () => {
      try {
        const res = await fetch(`/api/mascotas/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Error al cargar la mascota');
        const data = await res.json();
        setMascota(data);
        setFormData(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    fetchMascota();
  }, [id, token]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/mascotas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Error al actualizar la mascota');
      const data = await res.json();
      setMascota(data);
      setEditando(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  if (loading) return <div className="text-center">Cargando...</div>;
  if (error) return <div className="text-center text-danger">{error}</div>;
  if (!mascota) return <div className="text-center">Mascota no encontrada</div>;

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Detalle de Mascota</h1>
      {editando ? (
        <form onSubmit={handleSubmit} className="card p-4">
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="form-control" />
          </div>
          <div className="mb-3">
            <label className="form-label">Especie</label>
            <input type="text" name="especie" value={formData.especie} onChange={handleChange} className="form-control" />
          </div>
          <div className="mb-3">
            <label className="form-label">Raza</label>
            <input type="text" name="raza" value={formData.raza} onChange={handleChange} className="form-control" />
          </div>
          <div className="mb-3">
            <label className="form-label">Edad</label>
            <input type="number" name="edad" value={formData.edad} onChange={handleChange} className="form-control" />
          </div>
          <div className="mb-3 form-check">
            <input type="checkbox" name="sociable" checked={formData.sociable} onChange={handleChange} className="form-check-input" />
            <label className="form-check-label">Sociable</label>
          </div>
          <div className="mb-3">
            <label className="form-label">Alergias (separadas por comas)</label>
            <input type="text" name="alergias" value={formData.alergias.join(', ')} onChange={(e) => setFormData(prev => ({ ...prev, alergias: e.target.value.split(',').map(a => a.trim()) }))} className="form-control" />
          </div>
          <div className="mb-3">
            <label className="form-label">Discapacidades (separadas por comas)</label>
            <input type="text" name="discapacidades" value={formData.discapacidades.join(', ')} onChange={(e) => setFormData(prev => ({ ...prev, discapacidades: e.target.value.split(',').map(d => d.trim()) }))} className="form-control" />
          </div>
          <div className="mb-3 form-check">
            <input type="checkbox" name="necesitaBozal" checked={formData.necesitaBozal} onChange={handleChange} className="form-check-input" />
            <label className="form-check-label">Necesita Bozal</label>
          </div>
          <div className="mb-3">
            <label className="form-label">Estado de Vacunación</label>
            <input type="text" name="estadoVacunacion" value={formData.estadoVacunacion} onChange={handleChange} className="form-control" />
          </div>
          <div className="mb-3">
            <label className="form-label">Observaciones</label>
            <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} className="form-control"></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label">URL de Foto</label>
            <input type="text" name="foto" value={formData.foto} onChange={handleChange} className="form-control" />
          </div>
          <button type="submit" className="btn btn-primary">Guardar</button>
          <button type="button" onClick={() => setEditando(false)} className="btn btn-secondary ms-2">Cancelar</button>
        </form>
      ) : (
        <div className="card p-4">
          <h2>{mascota.nombre}</h2>
          <p><strong>Especie:</strong> {mascota.especie}</p>
          <p><strong>Raza:</strong> {mascota.raza}</p>
          <p><strong>Edad:</strong> {mascota.edad}</p>
          <p><strong>Sociable:</strong> {mascota.sociable ? 'Sí' : 'No'}</p>
          <p><strong>Alergias:</strong> {mascota.alergias.join(', ') || 'Ninguna'}</p>
          <p><strong>Discapacidades:</strong> {mascota.discapacidades.join(', ') || 'Ninguna'}</p>
          <p><strong>Necesita Bozal:</strong> {mascota.necesitaBozal ? 'Sí' : 'No'}</p>
          <p><strong>Estado de Vacunación:</strong> {mascota.estadoVacunacion}</p>
          <p><strong>Observaciones:</strong> {mascota.observaciones}</p>
          {mascota.foto && <img src={mascota.foto} alt={mascota.nombre} className="img-fluid mt-3" />}
          <button onClick={() => setEditando(true)} className="btn btn-primary mt-3">Editar</button>
        </div>
      )}
    </div>
  );
} 