'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // Opcional: herramientas de desarrollo
import { useState } from 'react';

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

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
} 