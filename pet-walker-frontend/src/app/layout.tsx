import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import QueryProvider from '@/components/shared/QueryProvider'
import { Toaster } from 'sonner'
import AuthInitializer from '@/components/shared/AuthInitializer'
import ErrorBoundary from '@/components/shared/ErrorBoundary'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { ThemeInitializer } from '@/components/shared/ThemeInitializer'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pet Walker',
  description: 'Tu compañero de confianza para el cuidado de mascotas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning className="scrollbar-hide">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased scrollbar-hide`}>
        <ErrorBoundary>
          <QueryProvider>
          <ThemeProvider>
              <ThemeInitializer />
              <AuthInitializer />
              <div className="scrollbar-hide">
                {children}
              </div>
              <Toaster richColors closeButton position="top-right" />
            </ThemeProvider>
            </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
