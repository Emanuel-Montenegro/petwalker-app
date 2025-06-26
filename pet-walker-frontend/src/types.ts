export interface LoginData {
  email: string;
  contraseña: string; // Coincide con el modelo de backend
}

export interface RegisterData {
  nombre: string;
  email: string;
  contraseña: string;
  // Podríamos añadir el rol aquí si el registro inicial permite elegir entre DUEÑO/PASEADOR
  // Por ahora, asumiremos que hay un registro por defecto o un paso posterior para definir el rol.
}

export interface AuthResponse {
  token: string; // El token JWT recibido del backend
  usuario: {
    id: number;
    nombre: string;
    email: string;
    rol: 'DUENO' | 'PASEADOR' | 'ADMIN';
  };
}

// Definición del tipo para el Perfil de Usuario (basado en el modelo Usuario del backend)
export interface UserProfile {
  id: number;
  nombre: string;
  email: string;
  rol: 'DUENO' | 'PASEADOR' | 'ADMIN'; // Basado en el enum Rol del backend
  mascotas?: Mascota[]; // Si la API devuelve las mascotas anidadas en el perfil
  // paseosAsignados?: Paseo[];
  // etc.
}

// Definición del tipo para Mascota (basado en el modelo Mascota del backend)
export interface Mascota {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
  sociable: boolean;
  usuarioId: number; // ID del dueño
  // Puedes añadir otras propiedades si son necesarias
  // paseos?: Paseo[]; // Si la API devuelve los paseos asociados a la mascota
}

// Definición del tipo para Paseo (basado en el modelo Paseo del backend)
export interface Paseo {
  id: number;
  fecha: string;
  horaInicio: string;
  duracion: number;
  estado: 'PENDIENTE' | 'ACEPTADO' | 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO';
  tipoServicio: string;
  precio: number;
  mascotaId: number;
  paseadorId?: number;
  creadoEn: string;
  canceladoEn?: string;
  canceladoPorRol?: 'DUENO' | 'PASEADOR' | 'ADMIN';
  origenLatitud?: number;
  origenLongitud?: number;
  mascota?: Mascota;
  paseador?: {
    id: number;
    nombre: string;
    email: string;
  };
  calificacion?: Calificacion;
}

// Tipo para formulario de mascota
export interface MascotaFormData {
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
  sociable: boolean;
}

// Tipos para dashboard de admin
export interface LoginAttempt {
  ip: string;
  timestamp: string;
  success: boolean;
}

export interface RevokedToken {
  token: string;
  reason: string;
  timestamp: string;
}

// Tipos para el sistema de calificaciones
export interface Calificacion {
  id: number;
  paseoId: number;
  paseadorId: number;
  puntuacion: number;
  comentario?: string;
  creadoEn: string;
  paseador?: {
    id: number;
    nombre: string;
    email: string;
  };
  paseo?: Paseo;
}

export interface CalificacionFormData {
  paseoId: number;
  puntuacion: number;
  comentario?: string;
}

export interface PromedioCalificacion {
  paseadorId: number;
  promedio: number;
  total: number;
}

// Puedes añadir otros tipos aquí a medida que los necesites para otras partes de la app 