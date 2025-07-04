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
  CalendarIcon
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles?: string[]; // Roles que pueden ver este elemento
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    name: 'Historial',
    href: '/dashboard/historial',
    icon: HistoryIcon,
    roles: ['DUENO'], // Solo los dueños pueden calificar
  },
  {
    name: 'Calificaciones',
    href: '/dashboard/calificaciones',
    icon: StarIcon,
  },
  {
    name: 'Mis Mascotas',
    href: '/dashboard/mascotas',
    icon: PawPrintIcon,
    roles: ['DUENO'],
  },
  {
    name: 'Paseos',
    href: '/dashboard/paseos',
    icon: CalendarIcon,
    roles: ['PASEADOR'],
  },
  {
    name: 'Administración',
    href: '/dashboard/admin',
    icon: SettingsIcon,
    roles: ['ADMIN'],
  },
];

const DashboardSidebar = memo(function DashboardSidebar() {
  const pathname = usePathname();
  const { usuario } = useAuthStore();

  // Filtrar elementos del menú basado en el rol del usuario
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      if (!item.roles) return true; // Si no hay roles específicos, mostrar a todos
      return usuario && item.roles.includes(usuario.rol);
    });
  }, [usuario]);

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col bg-white border-r border-gray-200">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <PawPrintIcon className="h-8 w-8 text-primary" />
          <h1 className="ml-2 text-xl font-bold text-gray-900">Pet Walker</h1>
        </div>
        
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {filteredMenuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive
                        ? 'text-primary-foreground'
                        : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          {/* Información del usuario */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-foreground">
                    {usuario?.nombre?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {usuario?.nombre}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {usuario?.rol.toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
});

export default DashboardSidebar; 