import { getAuthHeaders } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
    console.error('❌ Error al registrar punto GPS:', error);
    throw error;
  }
};

export const obtenerPuntosGPS = async (paseoId: number): Promise<{ coordenadas: [number, number][] }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/gps/${paseoId}`, {
      headers: {
        ...getAuthHeaders(),
        'Cache-Control': 'no-cache'
      },
      credentials: 'include',
      cache: 'no-store'
    });

    // Si el servidor responde 304 Not Modified, no hay nuevos datos
    if (response.status === 304) {
      return { coordenadas: [] };
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.mensaje || 'Error al obtener puntos GPS');
    }
    const data = await response.json();
    // Retornar las coordenadas tal como vienen del backend [lng, lat]
    if (data.coordenadas && Array.isArray(data.coordenadas)) {
      return data;
    }
    return { coordenadas: [] };
  } catch (error) {
    console.error('Error al obtener puntos GPS:', error);
    throw error;
  }
}; 