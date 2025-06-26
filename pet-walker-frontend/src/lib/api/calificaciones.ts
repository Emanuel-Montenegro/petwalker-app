import { Calificacion, CalificacionFormData, PromedioCalificacion } from '../../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.mensaje || 'Error en la solicitud');
  }
  return response.json();
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Registrar una calificación
export const registrarCalificacion = async (calificacionData: CalificacionFormData): Promise<{ mensaje: string; calificacion: Calificacion }> => {
  console.log('🌟 Registrando calificación:', calificacionData);
  
  const response = await fetch(`${API_BASE_URL}/calificaciones`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(calificacionData),
  });
  
  const result = await handleResponse<{ mensaje: string; calificacion: Calificacion }>(response);
  console.log('✅ Calificación registrada:', result);
  return result;
};

// Obtener calificaciones de un paseador
export const obtenerCalificacionesPaseador = async (paseadorId: number): Promise<{ calificaciones: Calificacion[] }> => {
  console.log('📋 Obteniendo calificaciones del paseador:', paseadorId);
  
  const response = await fetch(`${API_BASE_URL}/calificaciones/paseador/${paseadorId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  
  const result = await handleResponse<{ calificaciones: Calificacion[] }>(response);
  console.log('✅ Calificaciones obtenidas:', result);
  return result;
};

// Obtener promedio de calificaciones de un paseador
export const obtenerPromedioPaseador = async (paseadorId: number): Promise<PromedioCalificacion> => {
  console.log('📊 Obteniendo promedio del paseador:', paseadorId);
  
  const response = await fetch(`${API_BASE_URL}/calificaciones/paseador/${paseadorId}/promedio`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  
  const result = await handleResponse<PromedioCalificacion>(response);
  console.log('✅ Promedio obtenido:', result);
  return result;
}; 