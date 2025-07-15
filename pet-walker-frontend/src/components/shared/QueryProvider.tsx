'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // Opcional: herramientas de desarrollo
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';

interface QueryProviderProps {
  children: React.ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { // Opciones por defecto para las queries
      queries: {
        staleTime: 5 * 60 * 1000, // Cachear datos por 5 minutos (ejemplo)
        refetchOnWindowFocus: false, // No refetch al cambiar de ventana (ejemplo)
      },
    },
  }));

  // Limpiar caché al cerrar sesión para evitar fugas de datos entre cuentas
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  useEffect(() => {
    if (!isAuthenticated) {
      queryClient.clear();
    }
  }, [isAuthenticated, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
} 