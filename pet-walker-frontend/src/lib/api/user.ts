// pet-walker-frontend/src/lib/api/user.ts

import { LoginData, AuthResponse, UserProfile, RegisterData, Mascota, Paseo, LoginAttempt, RevokedToken } from '@/types';

// Importa los tipos necesarios si ya los has definido en src/types.ts
// Por ejemplo, una interfaz para el perfil del usuario
// import { UserProfile } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api";

// Función para manejar respuestas HTTP
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

// Función para iniciar sesión
export const loginUser = async (credentials: LoginData): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  return handleResponse<AuthResponse>(response);
};

// Función para registrar un usuario
export const registerUser = async (userData: RegisterData): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return handleResponse<AuthResponse>(response);
};

// Función para obtener el perfil del usuario actual
export const fetchUserProfile = async (): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}/usuarios/me`, {
    credentials: 'include',
  });
  return handleResponse<UserProfile>(response);
};

// NUEVO: Función para agregar una nueva mascota
export const addPet = async (petData: Omit<Mascota, 'id'>): Promise<Mascota> => {
  const response = await fetch(`${API_BASE_URL}/mascotas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(petData),
    credentials: 'include',
  });
  return handleResponse<Mascota>(response);
};

// NUEVO: Función para programar un paseo
export const scheduleWalk = async (walkData: { 
  mascotaId: number; 
  fecha: string; 
  hora: string; // para compatibilidad
  horaInicio: string; // para compatibilidad
  duracion: number; 
  usuarioId: number; 
  tipoServicio: string; 
  precio: number;
  origenLatitud: number;
  origenLongitud: number;
}): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/paseos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(walkData),
      credentials: 'include',
    });
    return handleResponse<any>(response);
  } catch (error) {
    console.error('Error en scheduleWalk:', error);
    throw error;
  }
};

// NUEVO: Función para obtener paseos disponibles (para paseadores)
export const fetchAvailableWalks = async (): Promise<Paseo[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/paseos/disponibles`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    const data = await handleResponse<Paseo[]>(response);
    return data;
  } catch (error) {
    console.error('Error fetching available walks:', error);
    throw error;
  }
};

// NUEVO: Función para que un paseador acepte un paseo
export const acceptWalk = async (walkId: number, paseadorId: number): Promise<Paseo> => {
  const response = await fetch(`${API_BASE_URL}/paseos/${walkId}/aceptar`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paseadorId }),
    credentials: 'include',
  });
  return handleResponse<Paseo>(response);
};

// NUEVO: Función para obtener estadísticas de seguridad (Solo para administradores)
export const getSecurityStats = async (): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/seguridad/stats`, {
    credentials: 'include',
  });
  return handleResponse<any>(response);
};

// NUEVO: Función para obtener los logs detallados de intentos de inicio de sesión
export const fetchDetailedLoginAttempts = async (): Promise<LoginAttempt[]> => {
  const response = await fetch(`${API_BASE_URL}/seguridad/logs-login`, {
    credentials: 'include',
  });
  return handleResponse<LoginAttempt[]>(response);
};

// NUEVO: Función para obtener la lista detallada de tokens revocados
export const fetchRevokedTokens = async (): Promise<RevokedToken[]> => {
  const response = await fetch(`${API_BASE_URL}/seguridad/revoked-tokens`, {
    credentials: 'include',
  });
  return handleResponse<RevokedToken[]>(response);
};

// Actualizar nombre / email
export const updateUserProfile = async (data: { nombre: string; email: string }): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}/usuarios/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return handleResponse<UserProfile>(response);
};

// Cambiar contraseña
export const changePassword = async (payload: { actual: string; nueva: string }): Promise<{ mensaje: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleResponse<{ mensaje: string }>(response);
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Obtener paseadores (administración)
export const getAllPaseadores = async (): Promise<{ id: number; nombre: string; email: string }[]> => {
  const response = await fetch(`${API_BASE_URL}/usuarios?rol=PASEADOR`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Error al obtener paseadores');
  }
  const data = await response.json();
  return data.usuarios || [];
};