import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from '@/components/shared/QueryProvider';
import { Toaster } from 'sonner';
import MobileNavigation from '@/components/shared/MobileNavigation';
import AuthInitializer from '@/components/shared/AuthInitializer';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import ThemeProvider from '@/components/shared/ThemeProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Pet Walker - Paseadores de Mascotas y Seguimiento en Tiempo Real',
  description: 'Encuentra paseadores de mascotas confiables, programa paseos, sigue el recorrido en tiempo real y califica el servicio. Pet Walker: la mejor app para dueños y paseadores de perros.',
  keywords: 'paseadores de mascotas, paseo de perros, Pet Walker, seguimiento en tiempo real, calificaciones de paseadores, servicio de paseadores, paseos para perros, app de paseadores',
  openGraph: {
    title: 'Pet Walker - Paseadores de Mascotas',
    description: 'Encuentra paseadores de mascotas confiables, programa paseos, sigue el recorrido en tiempo real y califica el servicio.',
    url: 'https://petwalker.com',
    siteName: 'Pet Walker',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Pet Walker - Paseadores de Mascotas',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pet Walker - Paseadores de Mascotas',
    description: 'Encuentra paseadores de mascotas confiables, programa paseos, sigue el recorrido en tiempo real y califica el servicio.',
    site: '@petwalker',
    creator: '@petwalker',
    images: ['/og-image.png'],
    },
  alternates: {
    canonical: 'https://petwalker.com',
    languages: {
      'es-ES': 'https://petwalker.com',
    },
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme-storage');
                  if (theme) {
                    var parsed = JSON.parse(theme);
                    if (parsed.state && parsed.state.isDarkMode) {
                      document.documentElement.classList.add('dark');
                    }
                  } else {
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (prefersDark) {
                      document.documentElement.classList.add('dark');
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Pet Walker",
          "url": "https://petwalker.com",
          "description": "Encuentra paseadores de mascotas confiables, programa paseos, sigue el recorrido en tiempo real y califica el servicio.",
          "inLanguage": "es-ES"
        }` }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <ErrorBoundary>
          <ThemeProvider>
            <QueryProvider>
              <AuthInitializer />
              <MobileNavigation />
              <main role="main" tabIndex={-1} id="main-content">
              {children}
              </main>
              <Toaster richColors closeButton position="top-right" />
            </QueryProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
