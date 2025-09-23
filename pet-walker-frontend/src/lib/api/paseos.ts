import { Paseo } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api";

const handleResponse = async <T>(response: Response): Promise<T> => {
  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error('Respuesta del servidor no es JSON válido.');
  }
  if (!response.ok) {
    console.error('Error en la respuesta:', data);
    throw new Error(data.mensaje || data.error || `Error ${response.status}: ${response.statusText}`);
  }
  return data;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
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
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al obtener los paseos');
    }

    const result = await response.json();
    return result.paseos || [];
  } catch (error) {
    console.error('Error al obtener paseos:', error);
    throw error;
  }
};

// Obtener paseos como paseador
export const obtenerMisPaseosComoPaseador = async (usuarioId: number): Promise<Paseo[]> => {
  const response = await fetch(`${API_BASE_URL}/paseos/mios/paseador`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  
  const result = await handleResponse<{ paseos: Paseo[] }>(response);
  return result.paseos || [];
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
      throw new Error('Ruta de paseador no encontrada (404)');
    }
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.mensaje || 'Error al obtener los paseos del paseador');
    }
    const data = await response.json();
    return data.paseos || [];
  } catch (error) {
    console.error('Error al obtener paseos del paseador:', error);
    throw error;
  }
};

export const fetchAvailableWalks = async (): Promise<Paseo[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/paseos/disponibles`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al obtener paseos disponibles');
    }

    const data = await response.json();
    return data.paseos || [];
  } catch (error) {
    console.error('Error al obtener paseos disponibles:', error);
    throw error;
  }
};

export const acceptWalk = async (walkId: number, paseadorId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/paseos/${walkId}/aceptar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
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
    console.error('❌ Error al iniciar paseo:', error);
    throw error;
  }
};

export const finalizarPaseo = async (paseoId: number): Promise<void> => {
  console.log('🔄 Iniciando finalización de paseo:', paseoId);
  
  try {
    const response = await fetch(`${API_BASE_URL}/paseos/${paseoId}/finalizar`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    
    if (!response.ok) {
      let errorMessage = 'Error al finalizar el paseo';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.mensaje || errorData.error || errorMessage;
      } catch (parseError) {
        console.warn('⚠️ No se pudo parsear error del servidor:', parseError);
        // Usar mensaje de error basado en status code
        if (response.status === 404) {
          errorMessage = 'Paseo no encontrado';
        } else if (response.status === 403) {
          errorMessage = 'No tienes permisos para finalizar este paseo';
        } else if (response.status === 500) {
          errorMessage = 'Error interno del servidor';
        } else {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
      }
      
      console.error('❌ Error HTTP al finalizar paseo:', {
        status: response.status,
        statusText: response.statusText,
        message: errorMessage
      });
      
      throw new Error(errorMessage);
    }
    
    console.log('✅ Paseo finalizado exitosamente:', paseoId);
    
  } catch (error) {
    // Mejorar el manejo de errores de red
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('❌ Error de conexión al finalizar paseo:', error);
      throw new Error('Error de conexión. Verifica tu internet e intenta nuevamente.');
    }
    
    console.error('❌ Error al finalizar paseo:', error);
    throw error;
  }
};