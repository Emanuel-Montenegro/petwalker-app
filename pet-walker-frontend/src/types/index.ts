export interface LoginData {
  email: string;
  contraseña: string;
}

export interface RegisterData {
  nombre: string;
  email: string;
  contraseña: string;
  rol: 'DUENO' | 'PASEADOR';
}

export interface AuthResponse {
  token: string;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    rol: 'DUENO' | 'PASEADOR' | 'ADMIN';
  };
}

// Nuevo tipo para Mascota
export interface Mascota {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
  sociable: boolean;
  alergias: string[];
  discapacidades: string[];
  necesitaBozal: boolean;
  estadoVacunacion: string;
  observaciones?: string;
  foto?: string;
  usuarioId: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  mascotas: Mascota[];
}

// Nuevo tipo para Paseo
export interface Paseo {
  id: number;
  fecha: string;
  horaInicio: string;
  duracion: number;
  estado: string;
  tipoServicio: string;
  precio: number;
  mascotaId: number;
  paseadorId?: number;
  mascota?: Mascota;
  paseador?: {
    id: number;
    nombre: string;
    email: string;
  };
}

export interface MascotaFormData {
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
  sociable: boolean;
  alergias: string[];
  discapacidades: string[];
  necesitaBozal: boolean;
  estadoVacunacion: string;
  observaciones?: string;
  foto?: string;
}

export interface LoginAttempt {
  email: string;
  contraseña: string;
}

export interface RevokedToken {
  token: string;
  revokedAt: Date;
}

export interface ScheduleWalkFormData {
  fecha: Date;
  hora: string;
  tipoPaseo: 'EXPRESS' | 'NORMAL' | 'EXTENDIDO' | 'PREMIUM';
  tipoServicio: 'INDIVIDUAL' | 'GRUPAL' | 'CON_ENTRENAMIENTO';
}

export interface Notification {
  id: number;
  usuarioId: number;
  mensaje: string;
  tipo: string;
  leida: boolean;
  data?: Record<string, any>;
  creadaEn: string;
}

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