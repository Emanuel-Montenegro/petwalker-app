// Mock de Prisma para testing
const mockPrismaClient = {
  usuario: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  mascota: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  paseo: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  calificacion: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    aggregate: jest.fn(),
  },
  notification: {
    findMany: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
  },
  $disconnect: jest.fn(),
};

jest.mock('../src/lib/prisma', () => ({
  __esModule: true,
  default: mockPrismaClient,
}));

// Variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRETO = 'test_jwt_secret_key_for_testing_purposes_only';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

// Configuración global para tests
beforeAll(() => {
  // Configuración inicial si es necesaria
});

afterAll(() => {
  // Limpieza final si es necesaria
});

beforeEach(() => {
  // Limpiar mocks antes de cada test
  jest.clearAllMocks();
});

// Helper para crear datos de prueba
export const createTestUser = (overrides = {}) => ({
  id: 1,
  nombre: 'Test User',
  email: 'test@example.com',
  rol: 'DUENO' as const,
  ...overrides,
});

export const createTestMascota = (overrides = {}) => ({
  id: 1,
  nombre: 'Test Pet',
  especie: 'Perro',
  raza: 'Labrador',
  edad: 3,
  sociable: true,
  usuarioId: 1,
  alergias: [],
  discapacidades: [],
  necesitaBozal: false,
  estadoVacunacion: 'COMPLETA',
  observaciones: 'Test pet',
  ...overrides,
});

export const createTestPaseo = (overrides = {}) => ({
  id: 1,
  fecha: new Date('2024-01-15'),
  horaInicio: '10:00',
  duracion: 30,
  estado: 'PENDIENTE' as const,
  tipoServicio: 'NORMAL',
  precio: 25.0,
  mascotaId: 1,
  paseadorId: null,
  creadoEn: new Date(),
  ...overrides,
}); 