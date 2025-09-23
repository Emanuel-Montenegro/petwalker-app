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
  setUsuario: (usuario: UserInfo) => void;
  logout: () => Promise<void>;
  isInitialized: boolean;
  initializeAuth: () => void;
}

const getStoredAuth = (): { usuario: UserInfo | null; token: string | null; isAuthenticated: boolean } => {
  if (typeof window === 'undefined') {
    return { usuario: null, token: null, isAuthenticated: false };
  }
  
  try {
    const storedUser = localStorage.getItem('usuario');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      return {
        usuario: JSON.parse(storedUser),
        token: storedToken,
        isAuthenticated: true
      };
    }
  } catch (error) {
    console.error('Error al recuperar datos de autenticación:', error);
  }
  
  return { usuario: null, token: null, isAuthenticated: false };
};

const getInitialState = (): Omit<AuthState, 'setAuth' | 'setUsuario' | 'logout' | 'initializeAuth'> => {
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
    if (auth && auth.usuario) {
      console.log('🔐 setAuth llamado con:', { usuario: auth.usuario.email, rol: auth.usuario.rol, tieneToken: !!auth.token });
      // Guardar en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('usuario', JSON.stringify(auth.usuario));
        // Solo guardar el token si se proporciona uno nuevo
        if (auth.token) {
          localStorage.setItem('token', auth.token);
          console.log('💾 Token guardado en localStorage:', auth.token.substring(0, 20) + '...');
        }
      }
      set({ 
        isAuthenticated: true, 
        usuario: auth.usuario, 
        // Mantener el token existente si no se proporciona uno nuevo
        token: auth.token || get().token, 
        isInitialized: true 
      });
    } else {
      // Limpiar localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');
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

  setUsuario: (usuario) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('usuario', JSON.stringify(usuario));
    }
    set({ usuario });
  },

  initializeAuth: () => {
    console.log('🔧 initializeAuth: Ejecutándose, isInitialized:', get().isInitialized);
    if (!get().isInitialized) {
      const storedAuth = getStoredAuth();
      console.log('📱 initializeAuth: Datos desde localStorage:', { 
        tieneUsuario: !!storedAuth.usuario, 
        tieneToken: !!storedAuth.token, 
        isAuthenticated: storedAuth.isAuthenticated 
      });
      set({ 
        isAuthenticated: storedAuth.isAuthenticated, 
        usuario: storedAuth.usuario, 
        token: storedAuth.token, 
        isInitialized: true 
      });
      console.log('✅ initializeAuth: Estado actualizado');
    } else {
      console.log('⚠️ initializeAuth: Ya estaba inicializado');
    }
  },
}));