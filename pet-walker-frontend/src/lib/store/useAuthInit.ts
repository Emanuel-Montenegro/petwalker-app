import { useEffect } from 'react';
import { useAuthStore } from './authStore';
import { fetchUserProfile } from '../api/user';

export const useAuthInit = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const usuario = await fetchUserProfile();
        // Mantener el token original al actualizar el usuario
        setAuth({ usuario, token: token || '' });
      } catch (error) {
        setAuth(null);
      }
    };
    
    // Primero inicializar la autenticación desde localStorage
    initializeAuth();
    
    // Luego verificar la sesión con el backend
    checkSession();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};