"use client"

import React, { memo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Bell,
  ClipboardListIcon,
  CogIcon,
  PlusIcon,
  MenuIcon,
  XIcon
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useNotificationsStore } from '@/lib/store/notificationsStore';
import ThemeToggle from './ThemeToggle';

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
    icon: ClipboardListIcon,
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
    href: '/dashboard/mascotas',
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
    icon: CogIcon,
    emoji: '⚙️',
  },
];

const DashboardSidebar = memo(function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { usuario, logout } = useAuthStore();
  const { notifications, unreadCount, markAllAsRead } = useNotificationsStore();
  const [open, setOpen] = useState(false);

  const toggleNoti = () => {
    if (!open && unreadCount > 0) markAllAsRead();
  };

  // Filtrar elementos del menú basado en el rol del usuario
  const filteredMenuItems = React.useMemo(() => {
    return menuItems.filter(item => {
    if (!item.roles) return true; // Si no hay roles específicos, mostrar a todos
    return usuario && item.roles.includes(usuario.rol);
  });
  }, [usuario]);

  // Sidebar content
  const sidebarContent = (
    <div className="flex flex-col h-full min-h-screen">
      {/* Header - Fixed */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700">
        <span className="text-2xl">🐾</span>
        <span className="font-bold text-lg text-gray-800 dark:text-gray-200">Pet Walker</span>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
        <div className="flex flex-col gap-4 py-4 pb-6">
          {/* Navigation */}
          <nav className="px-2 space-y-2">
            {filteredMenuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 rounded-xl font-medium transition hover:bg-gradient-to-r hover:from-blue-100 hover:to-pink-100 dark:hover:from-gray-700 dark:hover:to-gray-600 text-gray-700 dark:text-gray-200',
                  pathname === item.href && 'bg-gradient-to-r from-blue-500 to-pink-500 dark:from-blue-600 dark:to-pink-600 text-white shadow-lg'
                )}
                onClick={() => setOpen(false)}
              >
                <span className="text-xl">{item.emoji}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Footer - Fixed */}
      <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-4 bg-white dark:bg-gray-800 mt-auto flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 flex items-center justify-center text-white font-bold text-lg">
            {usuario?.nombre?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-800 dark:text-gray-200 truncate">{usuario?.nombre || 'Usuario'}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{usuario?.rol?.toLowerCase() || 'Usuario'}</div>
          </div>
          <ThemeToggle />
        </div>
        <button 
          onClick={logout} 
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium transition"
        >
          <LogOutIcon className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Hamburger for mobile */}
      <button
        className="fixed top-4 left-4 z-[60] bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg sm:hidden"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
      >
        <MenuIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
      </button>
      {/* Sidebar desktop */}
      <aside className="hidden sm:block w-64 h-screen fixed left-0 top-0 bg-white dark:bg-gray-800 shadow-lg z-40 overflow-hidden" style={{ height: '100vh' }}>
        {sidebarContent}
      </aside>
      {/* Sidebar mobile (slide-in) */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 transition-opacity duration-200"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
          />
          <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 shadow-2xl z-[60] animate-slide-in">
            <button className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 z-10" onClick={() => setOpen(false)} aria-label="Cerrar menú">
              <XIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            </button>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
});

export default DashboardSidebar; 