import { LoginData, RegisterData, AuthResponse } from "@/types"; // Definiremos estos tipos pronto

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api"; // Usar variable de entorno o default

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const text = await response.text();

  if (!response.ok && !isJson) {
    throw new Error(text || "Ocurrió un error inesperado en el servidor.");
  }

  if (!text) {
    throw new Error("La respuesta del servidor está vacía");
  }

  try {
    const data = JSON.parse(text) as T;
    // Si es una respuesta de autenticación, asegurarse de que tenga token
    if (typeof data === 'object' && data !== null && 'token' in data && !data.token) {
      const token = response.headers.get('Authorization')?.replace('Bearer ', '');
      if (token) {
        (data as any).token = token;
      }
    }
    return data;
  } catch (error) {
    console.error("Error parsing JSON:", text);
    throw new Error("Error al procesar la respuesta del servidor");
  }
}

export async function login(data: LoginData): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await handleResponse<{ message: string }>(response);
      throw new Error(errorData.message || 'Error al iniciar sesión');
    }

    const authResponse = await handleResponse<AuthResponse>(response);
    // Si no hay token en la respuesta, intentar obtenerlo del header
    if (!authResponse.token) {
      const token = response.headers.get('Authorization')?.replace('Bearer ', '');
      if (token) {
        authResponse.token = token;
      }
    }
    return authResponse;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await handleResponse<{ message: string }>(response);
      throw new Error(errorData.message || 'Error al registrar usuario');
    }

    const authResponse = await handleResponse<AuthResponse>(response);
    // Si no hay token en la respuesta, intentar obtenerlo del header
    if (!authResponse.token) {
      const token = response.headers.get('Authorization')?.replace('Bearer ', '');
      if (token) {
        authResponse.token = token;
      }
    }
    return authResponse;
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Error during logout:', error);
    // No lanzar error ya que el logout local siempre debe proceder
  }
}

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Nota: Necesitamos definir los tipos LoginData, RegisterData y AuthResponse en src/types.ts 