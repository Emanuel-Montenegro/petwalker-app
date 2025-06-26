import { useEffect } from 'react';
import { useAuthStore } from './authStore';
import { fetchUserProfile } from '../api/user';

export const useAuthInit = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const usuario = await fetchUserProfile();
        setAuth({ usuario, token: '' });
      } catch (error) {
        setAuth(null);
      }
    };
    checkSession();
    initializeAuth();
    // Solo se ejecuta una vez al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}; 