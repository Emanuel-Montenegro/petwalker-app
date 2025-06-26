import { getAuthHeaders } from './user';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const registrarPuntoGPS = async (paseoId: number, latitud: number, longitud: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/gps`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ paseoId, latitud, longitud }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.mensaje || 'Error al registrar punto GPS');
    }
  } catch (error) {
    console.error('Error al registrar punto GPS:', error);
    throw error;
  }
};

export const obtenerPuntosGPS = async (paseoId: number): Promise<{ coordenadas: [number, number][] }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/gps/${paseoId}`, {
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.mensaje || 'Error al obtener puntos GPS');
    }
    return response.json();
  } catch (error) {
    console.error('Error al obtener puntos GPS:', error);
    throw error;
  }
}; 