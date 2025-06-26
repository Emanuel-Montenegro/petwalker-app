'use client';

import { useEffect, useState } from 'react';

interface ClientHydrationWrapperProps {
  children: React.ReactNode;
}

export default function ClientHydrationWrapper({ children }: ClientHydrationWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Renderizar un estado de carga simple en el servidor o durante la hidratación inicial
    // Para evitar el mismatch, podrías renderizar null o un spinner placeholder similar al contenido
    return null; 
  }

  // Una vez que el componente está en el cliente, renderizar el contenido completo
  return <>{children}</>;
} 