import { logger } from '../../src/utils/logger';

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

describe('Logger', () => {
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;
  let mockConsoleWarn: jest.SpyInstance;

  beforeEach(() => {
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
    mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    mockConsoleWarn.mockRestore();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  describe('debug', () => {
    it('debería loggear en modo desarrollo', () => {
      // Arrange
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Act
      logger.debug('TEST', 'Test debug message', { test: true });

      // Assert
      expect(mockConsoleLog).toHaveBeenCalled();
      const logCall = mockConsoleLog.mock.calls[0][0];
      expect(logCall).toContain('[DEBUG]');
      expect(logCall).toContain('[TEST]');
      expect(logCall).toContain('Test debug message');

      // Cleanup
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('no debería loggear en modo producción', () => {
      // Arrange
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Act
      logger.debug('TEST', 'Test debug message');

      // Assert
      expect(mockConsoleLog).not.toHaveBeenCalled();

      // Cleanup
      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('info', () => {
    it('debería loggear mensajes info', () => {
      // Act
      logger.info('TEST', 'Test info message');

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] [TEST] Test info message')
      );
    });

    it('debería incluir datos adicionales', () => {
      // Act
      logger.info('TEST', 'Test with data', { userId: 123 });

      // Assert
      expect(mockConsoleLog).toHaveBeenCalled();
      const logCall = mockConsoleLog.mock.calls[0][0];
      expect(logCall).toContain('[INFO]');
      expect(logCall).toContain('[TEST]');
      expect(logCall).toContain('Test with data');
      expect(logCall).toContain('userId');
      expect(logCall).toContain('123');
    });
  });

  describe('error', () => {
    it('debería loggear errores', () => {
      // Arrange
      const error = new Error('Test error');

      // Act
      logger.error('TEST', 'Test error message', error);

      // Assert
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringMatching(/\[ERROR\] \[TEST\] Test error message.*message.*Test error/)
      );
    });
  });

  describe('warn', () => {
    it('debería loggear warnings', () => {
      // Act
      logger.warn('TEST', 'Test warning message');

      // Assert
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('[WARN] [TEST] Test warning message')
      );
    });
  });

  describe('métodos de conveniencia', () => {
    it('authDebug debería usar el módulo AUTH', () => {
      // Arrange
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Act
      logger.authDebug('Login attempt', { email: 'test@example.com' });

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] [AUTH] Login attempt')
      );

      // Cleanup
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('paseoDebug debería usar el módulo PASEO', () => {
      // Arrange
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Act
      logger.paseoDebug('Paseo created', { paseoId: 123 });

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] [PASEO] Paseo created')
      );

      // Cleanup
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('apiInfo debería formatear información de API', () => {
      // Act
      logger.apiInfo('GET', '/api/paseos', 123);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringMatching(/\[INFO\] \[API\] GET \/api\/paseos.*userId.*123/)
      );
    });
  });

  describe('formatMessage', () => {
    it('debería incluir timestamp', () => {
      // Act
      logger.info('TEST', 'Test message');

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringMatching(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/)
      );
    });

    it('debería formatear nivel en mayúsculas', () => {
      // Act
      logger.info('TEST', 'Test message');

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]')
      );
    });

    it('debería incluir el módulo', () => {
      // Act
      logger.info('CUSTOM_MODULE', 'Test message');

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[CUSTOM_MODULE]')
      );
    });
  });
}); 