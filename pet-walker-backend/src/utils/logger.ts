interface LogLevel {
  DEBUG: 'debug';
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
}

const LOG_LEVELS: LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  private formatMessage(level: string, module: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const baseMessage = `[${timestamp}] [${level.toUpperCase()}] [${module}] ${message}`;
    
    if (data) {
      return `${baseMessage} ${JSON.stringify(data, null, 2)}`;
    }
    
    return baseMessage;
  }

  debug(module: string, message: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage(LOG_LEVELS.DEBUG, module, message, data));
    }
  }

  info(module: string, message: string, data?: any): void {
    console.log(this.formatMessage(LOG_LEVELS.INFO, module, message, data));
  }

  warn(module: string, message: string, data?: any): void {
    console.warn(this.formatMessage(LOG_LEVELS.WARN, module, message, data));
  }

  error(module: string, message: string, error?: any): void {
    const errorData = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : error;
    
    console.error(this.formatMessage(LOG_LEVELS.ERROR, module, message, errorData));
  }

  // Métodos de conveniencia para casos comunes
  authDebug(message: string, data?: any): void {
    this.debug('AUTH', message, data);
  }

  paseoDebug(message: string, data?: any): void {
    this.debug('PASEO', message, data);
  }

  socketDebug(message: string, data?: any): void {
    this.debug('SOCKET', message, data);
  }

  apiInfo(method: string, endpoint: string, userId?: number): void {
    this.info('API', `${method} ${endpoint}`, { userId });
  }

  // Método para logs de performance
  performance(module: string, operation: string, duration: number): void {
    if (this.isDevelopment) {
      this.info('PERFORMANCE', `${module}.${operation} took ${duration}ms`);
    }
  }
}

// Singleton instance
export const logger = new Logger();

// Función helper para medir performance
export const measurePerformance = async <T>(
  module: string,
  operation: string,
  fn: () => Promise<T>
): Promise<T> => {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    logger.performance(module, operation, duration);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error(module, `${operation} failed after ${duration}ms`, error);
    throw error;
  }
};

export default logger; 