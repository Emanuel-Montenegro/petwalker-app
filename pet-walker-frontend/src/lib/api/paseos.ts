import { Paseo } from '@/types';

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

// Obtener paseos del usuario (como dueño)
export const obtenerMisPaseos = async (): Promise<Paseo[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/paseos/mios/dueno`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al obtener los paseos');
    }

    const result = await response.json();
    return result.paseos;
  } catch (error) {
    console.error('Error al obtener paseos:', error);
    throw error;
  }
};

// Obtener paseos como paseador
export const obtenerMisPaseosComoPaseador = async (usuarioId: number): Promise<Paseo[]> => {
  console.log('📋 Obteniendo paseos como paseador:', usuarioId);
  
  const response = await fetch(`${API_BASE_URL}/paseos/mios/paseador`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  
  const result = await handleResponse<{ paseos: Paseo[] }>(response);
  console.log('✅ Paseos como paseador obtenidos:', result);
  return result.paseos;
};

export const obtenerPaseosPaseador = async (paseadorId: number): Promise<Paseo[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/paseos/paseador/${paseadorId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (response.status === 403) {
      throw new Error('No tienes permiso para ver estos paseos (403)');
    }
    if (response.status === 404) {
      // Si la ruta no existe, error grave de backend
      throw new Error('Ruta de paseador no encontrada (404)');
    }
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.mensaje || 'Error al obtener los paseos del paseador');
    }
    const data = await response.json();
    // Si la respuesta es { paseos: [] } o similar, devolver el array vacío
    return data.paseos || [];
  } catch (error) {
    console.error('Error al obtener paseos del paseador:', error);
    throw error;
  }
};

export const fetchAvailableWalks = async (): Promise<Paseo[]> => {
  try {
    const response = await fetch('/api/paseos/disponibles', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener paseos disponibles');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener paseos disponibles:', error);
    throw error;
  }
};

export const acceptWalk = async (walkId: number, paseadorId: number): Promise<void> => {
  try {
    const response = await fetch(`/api/paseos/${walkId}/aceptar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paseadorId }),
    });

    if (!response.ok) {
      throw new Error('Error al aceptar el paseo');
    }
  } catch (error) {
    console.error('Error al aceptar paseo:', error);
    throw error;
  }
};

export const iniciarPaseo = async (paseoId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/paseos/${paseoId}/iniciar`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.mensaje || 'Error al iniciar el paseo');
    }
  } catch (error) {
    console.error('Error al iniciar paseo:', error);
    throw error;
  }
};

export const finalizarPaseo = async (paseoId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/paseos/${paseoId}/finalizar`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.mensaje || 'Error al finalizar el paseo');
    }
  } catch (error) {
    console.error('Error al finalizar paseo:', error);
    throw error;
  }
}; 