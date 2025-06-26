'use client';

import { useEffect, useState } from 'react';
import { getSecurityStats, fetchDetailedLoginAttempts, fetchRevokedTokens } from '@/lib/api/user';
import { AuthResponse, LoginAttempt, RevokedToken } from '@/types';
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SecurityStats {
  loginAttempts: {
    totalLoginAttempts: number;
    totalFailedAttempts: number;
    uniqueIPsAttempting: number;
    blockedIPsCount: number;
  };
  revokedTokens: {
    totalRevoked: number;
    recentlyRevoked: number;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [detailedLoginAttempts, setDetailedLoginAttempts] = useState<LoginAttempt[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);

  const [showRevokedTokensModal, setShowRevokedTokensModal] = useState(false);
  const [revokedTokensList, setRevokedTokensList] = useState<RevokedToken[]>([]);
  const [revokedTokensLoading, setRevokedTokensLoading] = useState(false);
  const [revokedTokensError, setRevokedTokensError] = useState<string | null>(null);

  const { usuario, isInitialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!usuario) {
      router.push('/login');
      return;
    }
    if (usuario.rol !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getSecurityStats();
        setStats(data);
      } catch (err: any) {
        console.error('Error fetching security stats:', err);
        setError(err.message || 'Error al cargar las estadísticas de seguridad.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [usuario, isInitialized, router]);

  const handleViewDetailedLogs = async () => {
    setLogsLoading(true);
    setLogsError(null);
    try {
      const data = await fetchDetailedLoginAttempts();
      setDetailedLoginAttempts(data);
      setShowLogsModal(true);
    } catch (err: any) {
      console.error('Error fetching detailed login attempts:', err);
      setLogsError(err.message || 'Error al cargar los logs detallados.');
    } finally {
      setLogsLoading(false);
    }
  };

  const handleManageTokens = async () => {
    setRevokedTokensLoading(true);
    setRevokedTokensError(null);
    try {
      const data = await fetchRevokedTokens();
      setRevokedTokensList(data);
      setShowRevokedTokensModal(true);
    } catch (err: any) {
      console.error('Error fetching revoked tokens:', err);
      setRevokedTokensError(err.message || 'Error al cargar la lista de tokens revocados.');
    } finally {
      setRevokedTokensLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando estadísticas...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">Error: {error}</div>;
  }

  if (!stats) {
    return <div className="text-center mt-8">No se pudieron cargar las estadísticas.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
          Panel de Administración de Seguridad
        </span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Estadísticas de Intentos de Inicio de Sesión */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Intentos de Inicio de Sesión</CardTitle>
            <CardDescription>Monitoreo de actividad de autenticación.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Intentos totales:</Label>
              <p className="font-semibold">{stats.loginAttempts.totalLoginAttempts}</p>
            </div>
            <div>
              <Label>Intentos fallidos:</Label>
              <p className="font-semibold">{stats.loginAttempts.totalFailedAttempts}</p>
            </div>
            <div>
              <Label>IPs únicas intentando:</Label>
              <p className="font-semibold">{stats.loginAttempts.uniqueIPsAttempting}</p>
            </div>
            <div>
              <Label>IPs bloqueadas (deshabilitado):</Label>
              <p className="font-semibold">{stats.loginAttempts.blockedIPsCount}</p>
            </div>
            <Separator />
            <Button onClick={handleViewDetailedLogs}>Ver logs detallados</Button>
          </CardContent>
        </Card>

        {/* Estadísticas de Tokens Revocados */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Tokens Revocados</CardTitle>
            <CardDescription>Gestión de tokens de sesión inválidos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tokens revocados totales:</Label>
              <p className="font-semibold">{stats.revokedTokens.totalRevoked}</p>
            </div>
            <div>
              <Label>Recientemente revocados (últimas 24h):</Label>
              <p className="font-semibold">{stats.revokedTokens.recentlyRevoked}</p>
            </div>
            <Separator />
            <Button onClick={handleManageTokens}>Gestionar tokens</Button>
          </CardContent>
        </Card>
      </div>

      {/* Modal de logs detallados */}
      <Dialog open={showLogsModal} onOpenChange={setShowLogsModal}>
        <DialogContent className="min-w-[80vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Logs Detallados de Intentos de Inicio de Sesión</DialogTitle>
            <DialogDescription>
              {logsLoading ? 'Cargando logs...' : logsError ? `Error: ${logsError}` : 'Lista de todos los intentos de inicio de sesión.'}
            </DialogDescription>
          </DialogHeader>
          {!logsLoading && !logsError && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP</TableHead>
                  <TableHead>Marca de tiempo</TableHead>
                  <TableHead>Éxito</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailedLoginAttempts.length > 0 ? (
                  detailedLoginAttempts.map((attempt, index) => (
                    <TableRow key={index}>
                      <TableCell>{attempt.ip}</TableCell>
                      <TableCell>{new Date(attempt.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{attempt.success ? 'Sí' : 'No'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">No hay logs detallados disponibles.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de tokens revocados */}
      <Dialog open={showRevokedTokensModal} onOpenChange={setShowRevokedTokensModal}>
        <DialogContent className="min-w-[80vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tokens Revocados</DialogTitle>
            <DialogDescription>
              {revokedTokensLoading ? 'Cargando tokens...' : revokedTokensError ? `Error: ${revokedTokensError}` : 'Lista de tokens de sesión que han sido revocados.'}
            </DialogDescription>
          </DialogHeader>
          {!revokedTokensLoading && !revokedTokensError && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token (Parcial)</TableHead>
                  <TableHead>Razón</TableHead>
                  <TableHead>Marca de tiempo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revokedTokensList.length > 0 ? (
                  revokedTokensList.map((tokenItem, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs text-gray-500">{tokenItem.token.substring(0, 20)}...</TableCell>
                      <TableCell>{tokenItem.reason}</TableCell>
                      <TableCell>{new Date(tokenItem.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">No hay tokens revocados.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 
