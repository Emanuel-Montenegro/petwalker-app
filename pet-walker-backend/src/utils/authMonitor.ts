import { Request } from 'express';

interface LoginAttempt {
  ip: string;
  timestamp: number;
  success: boolean;
}

class AuthMonitor {
  private loginAttempts: Map<string, LoginAttempt[]>;
  private readonly MAX_ATTEMPTS = 5;
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutos
  private readonly BLOCK_DURATION_MS = 60 * 60 * 1000; // 1 hora
  private blockedIPs: Map<string, number>;

  constructor() {
    this.loginAttempts = new Map();
    this.blockedIPs = new Map();
  }

  private getClientIP(req: Request): string {
    return req.ip || 
           req.socket.remoteAddress || 
           req.headers['x-forwarded-for']?.toString() || 
           'unknown';
  }

  public recordLoginAttempt(req: Request, success: boolean): void {
    const ip = this.getClientIP(req);
    const now = Date.now();

    // Limpiar intentos antiguos
    this.cleanupOldAttempts(ip, now);

    // Verificar si la IP está bloqueada
    if (this.isIPBlocked(ip)) {
      // Si el bloqueo está deshabilitado, esta línea no debería ejecutarse.
      // throw new Error('Demasiados intentos fallidos. Por favor, intente más tarde.');
    }

    // Registrar el intento
    const attempts = this.loginAttempts.get(ip) || [];
    attempts.push({ ip, timestamp: now, success });
    this.loginAttempts.set(ip, attempts);

    // Verificar si se debe bloquear la IP
    if (!success && this.shouldBlockIP(ip)) {
      this.blockIP(ip);
      // Si el bloqueo está deshabilitado (isIPBlocked retorna false),
      // no debemos lanzar un error que indique que la IP está bloqueada.
      // throw new Error('Demasiados intentos fallidos. Su IP ha sido bloqueada temporalmente.');
    }
  }

  private cleanupOldAttempts(ip: string, now: number): void {
    const attempts = this.loginAttempts.get(ip) || [];
    const recentAttempts = attempts.filter(
      attempt => now - attempt.timestamp < this.WINDOW_MS
    );
    this.loginAttempts.set(ip, recentAttempts);
  }

  private shouldBlockIP(ip: string): boolean {
    const attempts = this.loginAttempts.get(ip) || [];
    const recentFailedAttempts = attempts.filter(
      attempt => !attempt.success && 
                Date.now() - attempt.timestamp < this.WINDOW_MS
    );
    return recentFailedAttempts.length >= this.MAX_ATTEMPTS;
  }

  private isIPBlocked(ip: string): boolean {
    return false; // Siempre retorna false para deshabilitar el bloqueo
  }

  private blockIP(ip: string): void {
    // this.blockedIPs.set(ip, Date.now() + this.blockDuration);
  }

  public getLoginStats(ip: string): { 
    totalAttempts: number; 
    failedAttempts: number; 
    isBlocked: boolean;
    blockTimeRemaining?: number;
  } {
    const attempts = this.loginAttempts.get(ip) || [];
    const now = Date.now();
    const recentAttempts = attempts.filter(
      attempt => now - attempt.timestamp < this.WINDOW_MS
    );

    const blockUntil = this.blockedIPs.get(ip);
    const isBlocked = blockUntil ? now < blockUntil : false;
    const blockTimeRemaining = blockUntil ? blockUntil - now : undefined;

    return {
      totalAttempts: recentAttempts.length,
      failedAttempts: recentAttempts.filter(a => !a.success).length,
      isBlocked,
      blockTimeRemaining
    };
  }

  public getStats(): {
    totalLoginAttempts: number;
    totalFailedAttempts: number;
    uniqueIPsAttempting: number;
    blockedIPsCount: number;
  } {
    let totalLoginAttempts = 0;
    let totalFailedAttempts = 0;
    const uniqueIPs = new Set<string>();

    this.loginAttempts.forEach(attempts => {
      attempts.forEach(attempt => {
        totalLoginAttempts++;
        uniqueIPs.add(attempt.ip);
        if (!attempt.success) {
          totalFailedAttempts++;
        }
      });
    });

    return {
      totalLoginAttempts,
      totalFailedAttempts,
      uniqueIPsAttempting: uniqueIPs.size,
      blockedIPsCount: this.blockedIPs.size, // Aunque la función de bloqueo está deshabilitada, mantenemos el conteo si en el futuro se habilita.
    };
  }

  public getAllLoginAttempts(): LoginAttempt[] {
    const allAttempts: LoginAttempt[] = [];
    this.loginAttempts.forEach(attempts => {
      allAttempts.push(...attempts);
    });
    // Ordenar los intentos por fecha de forma descendente (más recientes primero)
    return allAttempts.sort((a, b) => b.timestamp - a.timestamp);
  }
}

// Exportar una instancia única
export const authMonitor = new AuthMonitor(); 

