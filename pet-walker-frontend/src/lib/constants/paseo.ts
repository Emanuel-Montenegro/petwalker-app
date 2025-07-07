export const TIPOS_PASEO = {
  EXPRESS: {
    nombre: 'Paseo Express',
    descripcion: 'Ideal para perros activos que necesitan un paseo rápido',
    duracion: 20,
    precio: 15,
  },
  NORMAL: {
    nombre: 'Paseo Normal',
    descripcion: 'Paseo estándar para mantener a tu mascota saludable',
    duracion: 45,
    precio: 25,
  },
  EXTENDIDO: {
    nombre: 'Paseo Extendido',
    descripcion: 'Paseo más largo para perros con mucha energía',
    duracion: 60,
    precio: 35,
  },
  PREMIUM: {
    nombre: 'Paseo Premium',
    descripcion: 'Paseo largo con atención personalizada',
    duracion: 90,
    precio: 45,
  },
} as const;

export const TIPOS_SERVICIO = {
  INDIVIDUAL: {
    nombre: 'Individual',
    descripcion: 'Paseo personalizado, ideal para perros con problemas de conducta o tímidos',
    precioMultiplier: 1.5,
  },
  GRUPAL: {
    nombre: 'Grupal',
    descripcion: 'Paseo en grupo de 4-6 perros',
    precioMultiplier: 1,
  },
  CON_ENTRENAMIENTO: {
    nombre: 'Con Entrenamiento',
    descripcion: 'Combina caminata con comandos básicos, ideal para cachorros',
    precioMultiplier: 1.8,
  },
} as const; 