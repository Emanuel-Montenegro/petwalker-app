'use client';

import React from 'react';
import AuthGuard from '@/components/shared/AuthGuard';
import DashboardSidebar, { useSidebar } from '@/components/shared/DashboardSidebar';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="flex">
      {/* Spacer for sidebar on desktop - se ajusta según el estado */}
      <div className={`hidden sm:block flex-shrink-0 transition-all duration-300 ${
        isCollapsed ? 'w-0' : 'w-64'
      }`}></div>
      <main className="flex-1 p-4 md:p-6 lg:p-8 min-w-0">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <DashboardSidebar />
        <DashboardContent>{children}</DashboardContent>
      </div>
    </AuthGuard>
  );
}