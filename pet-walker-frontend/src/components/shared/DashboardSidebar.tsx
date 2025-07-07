"use client"

import React, { memo, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  HomeIcon,
  StarIcon,
  HistoryIcon,
  PawPrintIcon,
  MapIcon,
  UsersIcon,
  SettingsIcon,
  CalendarIcon,
  LogOutIcon,
  Bell
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useNotificationsStore } from '@/lib/store/notificationsStore';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles?: string[]; // Roles que pueden ver este elemento
  emoji?: string;
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    emoji: '🏠',
  },
  {
    name: 'Historial',
    href: '/dashboard/historial',
    icon: HistoryIcon,
    emoji: '📋',
    roles: ['DUENO'], // Solo los dueños pueden calificar
  },
  {
    name: 'Calificaciones',
    href: '/dashboard/calificaciones',
    icon: StarIcon,
    emoji: '⭐',
  },
  {
    name: 'Mis Mascotas',
    href: '/mascotas',
    icon: PawPrintIcon,
    emoji: '🐾',
    roles: ['DUENO'],
  },
  {
    name: 'Paseos',
    href: '/dashboard/paseos',
    icon: CalendarIcon,
    emoji: '🚶‍♂️',
    roles: ['PASEADOR'],
  },
  {
    name: 'Administración',
    href: '/dashboard/admin',
    icon: SettingsIcon,
    emoji: '⚙️',
    roles: ['ADMIN'],
  },
  {
    name: 'Configuraciones',
    href: '/dashboard/configuraciones',
    icon: SettingsIcon,
    emoji: '⚙️',
  },
];

const DashboardSidebar = memo(function DashboardSidebar() {
  const pathname = usePathname();
  const { usuario, logout } = useAuthStore();
  const { notifications, unreadCount, markAllAsRead } = useNotificationsStore();
  const [showNoti, setShowNoti] = React.useState(false);

  const toggleNoti = () => {
    setShowNoti(!showNoti);
    if (!showNoti && unreadCount > 0) markAllAsRead();
  };

  // Filtrar elementos del menú basado en el rol del usuario
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      if (!item.roles) return true; // Si no hay roles específicos, mostrar a todos
      return usuario && item.roles.includes(usuario.rol);
    });
  }, [usuario]);

  return (
    <aside className="hidden md:flex md:w-80 md:flex-col bg-white border-r border-gray-200">
      <div className="h-full">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <span className="text-gray-700 text-sm font-semibold">Navigation</span>
        </div>

        <div className="flex flex-col flex-grow p-6">
          {/* Logo + Notifications */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">🐾</span>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-800">Pet Walker</h1>
                <p className="text-xs text-gray-500 font-mono">Dashboard</p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {filteredMenuItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden',
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-pink-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white/80 hover:shadow-md hover:scale-102'
                  )}
                >
                  {/* Background gradient for active state */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-pink-500 opacity-90 rounded-xl"></div>
                  )}
                  
                  {/* Icon container */}
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center mr-3 relative z-10 transition-all duration-300',
                    isActive 
                      ? 'bg-white/20 backdrop-blur-sm' 
                      : 'bg-gradient-to-br from-gray-100 to-gray-200/50'
                  )}>
                    <span className="text-lg">{item.emoji}</span>
                  </div>
                  
                  <span className="relative z-10 font-medium">{item.name}</span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse relative z-10"></div>
                  )}
                </Link>
              );
            })}
          </nav>
          
          {/* User Profile Section */}
          <div className="border-t border-gray-200/50 pt-4 mt-4">
            <div className="bg-gradient-to-br from-gray-50 to-white/80 rounded-xl p-4 border border-gray-200/40 shadow-sm">
              <div className="flex items-center mb-3 justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-sm font-bold text-white">
                      {usuario?.nombre?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-semibold text-gray-800">
                      {usuario?.nombre}
                    </p>
                    <p className="text-xs text-gray-500 capitalize flex items-center gap-1">
                      <span className={cn(
                        'w-2 h-2 rounded-full',
                        {
                          'bg-emerald-500': usuario?.rol === 'ADMIN',
                          'bg-blue-500': usuario?.rol === 'PASEADOR', 
                          'bg-pink-500': usuario?.rol === 'DUENO'
                        }
                      )}></span>
                      {usuario?.rol.toLowerCase()}
                    </p>
                  </div>
                </div>
                <button onClick={toggleNoti} className="relative p-2 bg-white rounded-full shadow hover:shadow-md transition-colors">
                  <Bell className="h-4 w-4 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>
              
              {showNoti && (
                <div className="bg-gray-50 rounded-xl p-3 space-y-2 max-h-40 overflow-y-auto mb-3">
                  {notifications.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center">Sin notificaciones</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="text-sm text-gray-700 bg-white rounded-lg p-2">
                        {n.mensaje}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Logout Button */}
              <button
                onClick={logout}
                className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 bg-gradient-to-r from-gray-50 to-white/80 border border-gray-200/50 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-white/80 hover:text-red-600 hover:border-red-200/50 transition-all duration-300 group"
              >
                <LogOutIcon className="w-4 h-4 mr-2 group-hover:text-red-500" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
});

export default DashboardSidebar; 