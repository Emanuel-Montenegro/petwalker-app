'use client';

import React from 'react';
import AuthGuard from '@/components/shared/AuthGuard';
import DashboardSidebar from '@/components/shared/DashboardSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
} 