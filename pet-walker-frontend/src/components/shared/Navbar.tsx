'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useNotificationsStore } from '../../lib/store/notificationsStore';
import { fetchNotifications, markAllNotificationsAsRead } from '../../lib/api/notifications';
import { Notification } from '../../types/index';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Bell } from 'lucide-react';
import io from 'socket.io-client';
import GlobalLoader from './GlobalLoader';
import { useQueryClient } from '@tanstack/react-query';
import PetWalkerLogo from './PetWalkerLogo';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

// Función helper para agrupar notificaciones por fecha
const groupNotificationsByDate = (notifications: Notification[]) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { [key: string]: Notification[] } = {};

  notifications.forEach(notification => {
    const notificationDate = new Date(notification.creadaEn);
    const notificationDay = new Date(notificationDate.getFullYear(), notificationDate.getMonth(), notificationDate.getDate());
    
    let groupKey: string;
    if (notificationDay.getTime() === today.getTime()) {
      groupKey = 'Hoy';
    } else if (notificationDay.getTime() === yesterday.getTime()) {
      groupKey = 'Ayer';
    } else {
      groupKey = notificationDay.toLocaleDateString('es-ES', { 
        weekday: 'long',
        day: 'numeric', 
        month: 'long' 
      });
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(notification);
  });

  // Ordenar los grupos por fecha (más reciente primero)
  const sortedGroups = Object.entries(groups).sort(([keyA], [keyB]) => {
    if (keyA === 'Hoy') return -1;
    if (keyB === 'Hoy') return 1;
    if (keyA === 'Ayer') return -1;
    if (keyB === 'Ayer') return 1;
    return 0; // Mantener orden original para fechas específicas
  });

  return sortedGroups;
};

export default function Navbar() {
  const { logout, usuario, token, isAuthenticated, isInitialized, initializeAuth } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);
  const { notifications, unreadCount, setNotifications, addNotification, markAllAsRead } = useNotificationsStore();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    initializeAuth();
    console.log('[Navbar] useEffect ejecutado - usuario:', usuario, 'token:', !!token);
    if (!usuario || !token) {
      console.log('[Navbar] No hay usuario o token, saliendo del useEffect');
      return;
    }
    console.log('[Navbar] Intentando obtener notificaciones para usuario:', usuario.id);
    fetchNotifications(token).then((notis) => {
      console.log('[Navbar] Notificaciones obtenidas:', notis);
      setNotifications(notis);
    }).catch((error) => {
      console.error('[Navbar] Error al obtener notificaciones:', error);
    });
    const sock = io(SOCKET_URL, { transports: ['websocket'] });
    setSocket(sock);
    sock.emit('registrar-usuario', usuario.id);
    sock.on('nueva-notificacion', (noti: Notification) => {
      addNotification(noti);
    });
    return () => { sock.disconnect(); };
  }, [initializeAuth, usuario, token]);

  const handleOpen = async () => {
    setPopoverOpen(true);
    if (unreadCount > 0 && token) {
      await markAllNotificationsAsRead(token);
      markAllAsRead();
    }
  };

  return (
    <nav className="w-full flex items-center justify-between px-4 py-2 bg-white shadow-md">
      <PetWalkerLogo className="h-12" size={36} />
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center">
          {/* Eliminar el span de Pet Walker aquí */}
        </div>
        {isMounted && isInitialized && isAuthenticated ? (
          <div className="flex items-center gap-4">
            {usuario && (
              <span className="text-sm text-gray-600">
                {usuario.nombre}
              </span>
            )}
            <Button
              onClick={async () => {
                await logout();
                queryClient.clear();
                router.push('/');
              }}
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-primary/90 to-accent/90 backdrop-blur-sm text-primary-foreground font-semibold py-2 px-6 rounded-full shadow-glass transition-all duration-300 hover:scale-105 hover:shadow-glass-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Cerrar Sesión
            </Button>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  className="relative focus:outline-none"
                  aria-label="Notificaciones"
                  tabIndex={0}
                  onClick={handleOpen}
                  onKeyDown={e => { if (e.key === 'Enter') handleOpen(); }}
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 max-h-96 overflow-y-auto">
                <div className="font-bold mb-2">Notificaciones</div>
                {notifications.length === 0 ? (
                  <div className="text-gray-500">No tienes notificaciones.</div>
                ) : (
                  <div>
                    {groupNotificationsByDate(notifications).map(([dateGroup, groupNotifications]) => (
                      <div key={dateGroup} className="mb-3">
                        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 border-b border-gray-200 pb-1">
                          {dateGroup}
                        </div>
                        <ul className="space-y-1">
                          {groupNotifications.map(noti => (
                            <li key={noti.id} className={`p-2 rounded mb-1 ${!noti.leida ? 'bg-blue-50 border-l-2 border-blue-400' : 'bg-gray-50'}`}>
                              <div className="text-sm">{noti.mensaje}</div>
                              <div className="text-xs text-gray-400">{new Date(noti.creadaEn).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-24 h-6 bg-gray-200/60 rounded animate-pulse" />
            <div className="w-32 h-8 bg-gray-200/40 rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </nav>
  );
} 