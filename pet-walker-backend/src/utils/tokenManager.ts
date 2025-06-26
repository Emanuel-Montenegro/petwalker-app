import jwt from 'jsonwebtoken';

interface RevokedToken {
  token: string;
  reason: string;
  timestamp: number;
}

class TokenManager {
  private revokedTokens: Map<string, RevokedToken>;
  private readonly CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 horas

  constructor() {
    this.revokedTokens = new Map();
    this.startCleanupInterval();
  }

  public revokeToken(token: string, reason: string = 'Token revocado por el administrador'): void {
    try {
      // Verificar que el token es válido antes de revocarlo
      const decoded = jwt.verify(token, process.env.JWT_SECRETO || '');
      if (decoded) {
        this.revokedTokens.set(token, {
          token,
          reason,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Error al revocar token:', error);
    }
  }

  public isTokenRevoked(token: string): boolean {
    return this.revokedTokens.has(token);
  }

  public getRevocationReason(token: string): string | null {
    const revokedToken = this.revokedTokens.get(token);
    return revokedToken ? revokedToken.reason : null;
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupOldRevokedTokens();
    }, this.CLEANUP_INTERVAL_MS);
  }

  private cleanupOldRevokedTokens(): void {
    const now = Date.now();
    const oneDayAgo = now - this.CLEANUP_INTERVAL_MS;

    for (const [token, data] of this.revokedTokens.entries()) {
      if (data.timestamp < oneDayAgo) {
        this.revokedTokens.delete(token);
      }
    }
  }

  public getRevokedTokensStats(): {
    totalRevoked: number;
    recentlyRevoked: number;
  } {
    const now = Date.now();
    const oneDayAgo = now - this.CLEANUP_INTERVAL_MS;

    const recentlyRevoked = Array.from(this.revokedTokens.values())
      .filter(token => token.timestamp > oneDayAgo)
      .length;

    return {
      totalRevoked: this.revokedTokens.size,
      recentlyRevoked
    };
  }

  public getAllRevokedTokens(): RevokedToken[] {
    const allTokens: RevokedToken[] = Array.from(this.revokedTokens.values());
    // Opcional: ordenar los tokens revocados por fecha de forma descendente
    return allTokens.sort((a, b) => b.timestamp - a.timestamp);
  }
}

// Exportar una instancia única
export const tokenManager = new TokenManager(); 


