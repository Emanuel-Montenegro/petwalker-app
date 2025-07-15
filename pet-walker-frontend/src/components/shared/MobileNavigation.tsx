
'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import { useNotificationsStore } from '@/lib/store/notificationsStore';
import { fetchNotifications, markAllNotificationsAsRead } from '@/lib/api/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, Menu, X, User, LogOut, Home, Calendar, Star, Settings, PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PetWalkerLogo from './PetWalkerLogo';
import { toast } from 'sonner';
import io from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

const MobileNavigation = () => {
  const { logout, usuario, token, isAuthenticated, isInitialized, initializeAuth } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { notifications, unreadCount, setNotifications, addNotification, markAllAsRead } = useNotificationsStore();

  useEffect(() => {
    setIsMounted(true);
    initializeAuth();
    
    if (!usuario || !token) return;
    
    // Cargar notificaciones
    fetchNotifications(token).then((notis) => {
      setNotifications(notis);
    }).catch((error) => {
      console.error('Error al obtener notificaciones:', error);
    });

    // Configurar socket
    const sock = io(SOCKET_URL, { transports: ['websocket'] });
    sock.emit('registrar-usuario', usuario.id);
    sock.on('nueva-notificacion', (noti) => {
      addNotification(noti);
      toast.success('Nueva notificación recibida');
    });

    return () => {
      sock.disconnect();
    };
  }, [initializeAuth, usuario, token, setNotifications, addNotification]);

  const handleLogout = async () => {
    try {
      await logout();
      queryClient.clear();
      router.push('/');
      toast.success('Sesión cerrada correctamente');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const handleNotificationsToggle = async () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (!isNotificationsOpen && unreadCount > 0 && token) {
      await markAllNotificationsAsRead(token);
      markAllAsRead();
    }
  };

  const getMenuItems = () => {
    if (!usuario) return [];
    
    const baseItems = [
      { icon: Home, label: 'Dashboard', href: '/dashboard' },
      { icon: Star, label: 'Calificaciones', href: '/dashboard/calificaciones' },
    ];

    if (usuario.rol === 'DUENO') {
      baseItems.push(
        { icon: PawPrint, label: 'Mis Mascotas', href: '/dashboard/mascotas' },
        { icon: Calendar, label: 'Historial', href: '/dashboard/historial' }
      );
    }

    if (usuario.rol === 'PASEADOR') {
      baseItems.push(
        { icon: Calendar, label: 'Paseos', href: '/dashboard/paseos' }
      );
    }

    if (usuario.rol === 'ADMIN') {
      baseItems.push(
        { icon: Settings, label: 'Administración', href: '/dashboard/admin' }
      );
    }

    return baseItems;
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Hoy';
    if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const groupNotificationsByDate = (notifications: any[]) => {
    const grouped = notifications.reduce((acc, notification) => {
      const date = formatDate(new Date(notification.creadaEn));
      if (!acc[date]) acc[date] = [];
      acc[date].push(notification);
      return acc;
    }, {} as Record<string, any[]>);
    
    return Object.entries(grouped);
  };

  if (!isMounted) return null;

    return (
    <>
      {/* Botón flotante para acceder al menú - Solo cuando está autenticado */}
      {isAuthenticated && isInitialized && usuario && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 md:hidden">
          {/* Avatar flotante */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200/50"
            aria-label="Menú de usuario"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {usuario.nombre?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block pr-2">
              {usuario.nombre}
            </span>
          </button>
        </div>
      )}

       {/* Panel de notificaciones elegante */}
       {isNotificationsOpen && (
         <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px]" onClick={() => setIsNotificationsOpen(false)}>
           <div className="fixed top-16 right-4 w-80 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 max-h-[70vh] overflow-hidden">
             <div className="p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-b border-gray-100/50">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                   <Bell className="w-5 h-5 text-blue-600" />
                 </div>
                 <div>
                   <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                   <p className="text-sm text-gray-600">
                     {notifications.length === 0 ? 'No hay nuevas' : `${unreadCount} sin leer`}
                   </p>
                 </div>
               </div>
             </div>
             <div className="overflow-y-auto max-h-[50vh] scrollbar-hide">
               {notifications.length === 0 ? (
                 <div className="p-8 text-center">
                   <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Bell className="w-8 h-8 text-gray-400" />
                   </div>
                   <p className="text-gray-500 font-medium">No tienes notificaciones</p>
                   <p className="text-sm text-gray-400 mt-1">Te avisaremos cuando lleguen nuevas</p>
                 </div>
               ) : (
                 <div className="p-4 space-y-4">
                   {groupNotificationsByDate(notifications).map(([dateGroup, groupNotifications]) => (
                     <div key={dateGroup}>
                       <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                         {dateGroup}
                       </div>
                       <div className="space-y-2">
                         {(groupNotifications as any[]).map((noti: any) => (
                           <div
                             key={noti.id}
                             className={`p-4 rounded-2xl transition-all duration-200 ${
                               !noti.leida 
                                 ? 'bg-blue-50/80 border border-blue-200/50 shadow-sm' 
                                 : 'bg-gray-50/80 border border-gray-200/50'
                             }`}
                           >
                             <div className="flex items-start gap-3">
                               <div className={`w-2 h-2 rounded-full mt-2 ${
                                 !noti.leida ? 'bg-blue-500' : 'bg-gray-300'
                               }`} />
                               <div className="flex-1">
                                 <div className="text-sm text-gray-900 font-medium leading-relaxed">
                                   {noti.mensaje}
                                 </div>
                                 <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                   <span>🕐</span>
                                   {new Date(noti.creadaEn).toLocaleTimeString('es-ES', { 
                                     hour: '2-digit', 
                                     minute: '2-digit' 
                                   })}
                                 </div>
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>
           </div>
         </div>
       )}

             {/* Menú desplegable elegante */}
       {isMenuOpen && (
         <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px]" onClick={() => setIsMenuOpen(false)}>
           <div className="fixed top-16 right-4 w-72 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
             {isAuthenticated && usuario ? (
               <>
                 {/* Header del menú con info del usuario */}
                 <div className="p-6 bg-gradient-to-r from-primary/5 to-accent/5">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
                       <span className="text-white font-bold text-lg">
                         {usuario.nombre?.charAt(0).toUpperCase()}
                       </span>
                     </div>
                     <div>
                       <div className="font-semibold text-gray-900 text-lg">{usuario.nombre}</div>
                       <div className="text-sm text-gray-600 capitalize bg-gray-100 px-2 py-1 rounded-full inline-block">
                         {usuario.rol.toLowerCase()}
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Navegación rápida */}
                 <div className="p-4 space-y-1">
                   {getMenuItems().map((item) => (
                     <button
                       key={item.href}
                       onClick={() => {
                         router.push(item.href);
                         setIsMenuOpen(false);
                       }}
                       className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-gray-50/80 rounded-2xl transition-all duration-200 group"
                     >
                       <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                         <item.icon className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" />
                       </div>
                       <span className="text-gray-900 font-medium">{item.label}</span>
                     </button>
                   ))}
                 </div>

                 {/* Cerrar sesión */}
                 <div className="border-t border-gray-100/50 p-4">
                   <button
                     onClick={handleLogout}
                     className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-red-50/80 rounded-2xl transition-all duration-200 text-red-600 group"
                   >
                     <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-100 transition-colors">
                       <LogOut className="w-5 h-5" />
                     </div>
                     <span className="font-medium">Cerrar Sesión</span>
                   </button>
                 </div>
               </>
             ) : (
               <div className="p-6 text-center">
                 <div className="text-gray-500">Cargando...</div>
               </div>
             )}
           </div>
         </div>
       )}
    </>
  );
};

export default MobileNavigation; 