import { create } from 'zustand';
import { AuthResponse } from '@/types';
import { logout as apiLogout } from '../api/auth';

// UserInfo se define directamente a partir del tipo de usuario en AuthResponse
type UserInfo = AuthResponse['usuario'];

interface AuthState {
  isAuthenticated: boolean;
  usuario: UserInfo | null;
  token: string | null;
  setAuth: (auth: AuthResponse | null) => void;
  logout: () => Promise<void>;
  isInitialized: boolean;
  initializeAuth: () => void;
}

const getStoredAuth = (): { usuario: UserInfo | null; token: string | null; isAuthenticated: boolean } => {
  if (typeof window === 'undefined') {
    console.log('[AuthStore] Window undefined, retornando estado vacío');
    return { usuario: null, token: null, isAuthenticated: false };
  }
  
  try {
    const storedUser = localStorage.getItem('usuario');
    const storedToken = localStorage.getItem('token');
    console.log('[AuthStore] localStorage - usuario:', !!storedUser, 'token:', !!storedToken);
    
    if (storedUser && storedToken) {
      console.log('[AuthStore] Recuperando autenticación del localStorage');
      return {
        usuario: JSON.parse(storedUser),
        token: storedToken,
        isAuthenticated: true
      };
    }
  } catch (error) {
    console.error('Error al recuperar datos de autenticación:', error);
  }
  
  console.log('[AuthStore] No hay datos válidos en localStorage');
  return { usuario: null, token: null, isAuthenticated: false };
};

const getInitialState = (): Omit<AuthState, 'setAuth' | 'logout' | 'initializeAuth'> => {
  return {
    isAuthenticated: false,
    usuario: null,
    token: null,
    isInitialized: false,
  };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...getInitialState(),

  setAuth: (auth) => {
    console.log('[AuthStore] setAuth llamado con:', auth);
    if (auth && auth.usuario) {
      // Guardar en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('usuario', JSON.stringify(auth.usuario));
        localStorage.setItem('token', auth.token);
        console.log('[AuthStore] Datos guardados en localStorage');
      }
      set({ isAuthenticated: true, usuario: auth.usuario, token: auth.token, isInitialized: true });
    } else {
      // Limpiar localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');
        console.log('[AuthStore] localStorage limpiado');
      }
      set({ isAuthenticated: false, usuario: null, token: null, isInitialized: true });
    }
  },

  logout: async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Error al hacer logout en el backend:', error);
    }
    // Limpiar localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('usuario');
      localStorage.removeItem('token');
    }
    set({ isAuthenticated: false, usuario: null, token: null, isInitialized: true });
  },

  initializeAuth: () => {
    console.log('[AuthStore] initializeAuth llamado, isInitialized:', get().isInitialized);
    if (!get().isInitialized) {
      const storedAuth = getStoredAuth();
      console.log('[AuthStore] Inicializando con:', storedAuth);
      set({ 
        isAuthenticated: storedAuth.isAuthenticated, 
        usuario: storedAuth.usuario, 
        token: storedAuth.token, 
        isInitialized: true 
      });
    }
  },
}));