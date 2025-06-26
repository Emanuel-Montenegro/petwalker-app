import type { ReactNode } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import '../globals.css';
import QueryProvider from '@/components/shared/QueryProvider';
import { Toaster } from 'sonner';
import AuthInitializer from '@/components/shared/AuthInitializer';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthInitializer />
        <main>{children}</main>
        <Toaster richColors closeButton position="top-right" />
      </QueryProvider>
    </ErrorBoundary>
  );
} 