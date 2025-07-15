'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useRef, useState, useMemo } from 'react';
import { ThemeToggle } from '@/components/shared/ThemeToggle'

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const ticking = useRef<boolean>(false);
  const mouseTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const observerRef = useRef<IntersectionObserver | undefined>(undefined);

  useEffect(() => {
    setIsClient(true);
    
    // Optimized scroll handler with throttling
    const handleScroll = () => {
      if (!ticking.current) {
        rafRef.current = requestAnimationFrame(() => {
          setScrollY(window.scrollY * 0.5); // Reduced movement multiplier
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    // Optimized mouse move handler with RAF
    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking.current) {
        rafRef.current = requestAnimationFrame(() => {
          setMousePosition({ 
            x: e.clientX, // Removed multiplier
            y: e.clientY
          });
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    // Optimized intersection observer
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -10% 0px' // Reduced margin for better performance
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => {
            entry.target.classList.add('animate-fade-in');
            entry.target.classList.remove('opacity-0', 'translate-y-12');
          });
          // Unobserve after animation to save resources
          observerRef.current?.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Batch DOM operations
    requestAnimationFrame(() => {
      document.querySelectorAll('.scroll-animate').forEach((el) => {
        observerRef.current?.observe(el);
      });
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafRef.current);
      observerRef.current?.disconnect();
      clearTimeout(mouseTimeout.current);
      ticking.current = false;
    };
  }, []);

  // Memoize static content
  const renderFloatingMesh = useMemo(() => (
    <div className="fixed inset-0 z-0">
      <div className="absolute inset-0 opacity-20">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full mix-blend-screen will-change-transform"
            style={{
              width: (i * 25 + 100) % 120 + 80,
              height: (i * 25 + 100) % 120 + 80,
              left: `${(i * 30 + 20) % 80}%`,
              top: `${(i * 35 + 15) % 80}%`,
              background: `radial-gradient(circle, ${
                ['rgba(59,130,246,0.08)', 'rgba(236,72,153,0.08)', 'rgba(139,69,244,0.08)'][i % 3]
              } 0%, transparent 70%)`,
              animation: `float ${8 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 1}s`,
              transform: `translate3d(0, ${scrollY * (0.01 + i * 0.002)}px, 0)`, // Reduced movement multiplier
              filter: 'blur(40px)',
            }}
          />
        ))}
      </div>
    </div>
  ), [scrollY]);

  // Optimized cursor follower with reduced updates
  const cursorFollower = useMemo(() => (
    isClient && (
      <div 
        className="fixed w-96 h-96 pointer-events-none z-0 mix-blend-screen will-change-transform hidden sm:block"
        style={{
          transform: `translate3d(${mousePosition.x - 192}px, ${mousePosition.y - 192}px, 0)`,
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(236,72,153,0.08) 50%, transparent 70%)',
          filter: 'blur(50px)',
          transition: 'transform 0.05s linear', // Added smooth transition
        }}
      />
    )
  ), [isClient, mousePosition.x, mousePosition.y]);

  return (
    <div className="min-h-screen bg-background">
      {/* ThemeToggle Container */}
      <div className="fixed top-6 right-4 sm:top-10 sm:right-8 z-50">
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700/30 rounded-full p-1.5 shadow-2xl flex items-center justify-center">
          <ThemeToggle />
        </div>
      </div>

      {/* Optimized Dynamic Elements */}
      {cursorFollower}
      {renderFloatingMesh}

      {/* Floating Mesh Background - Optimizado para móvil */}
      {/* This block is now memoized and rendered conditionally */}

      {/* Revolutionary Hero Section - Apple Vision Pro Style */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-0">
        
        {/* 3D Glass Morphism Cards - Ultra Optimized */}
        <div className="absolute inset-0 perspective-1000">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-72 h-44 bg-gradient-to-br from-gray-100/30 to-white/50 dark:from-gray-800/30 dark:to-gray-700/50 backdrop-blur-xl border border-gray-200/20 dark:border-gray-700/20 rounded-3xl shadow-2xl will-change-transform"
              style={{
                transform: `rotateX(${15 + i * 8}deg) rotateY(${-10 + i * 6}deg) translateZ(${i * 40}px)`,
                left: `${15 + i * 20}%`,
                top: `${10 + i * 12}%`,
                animation: `float ${6 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`,
                boxShadow: '0 25px 50px -15px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div className="p-6 h-full flex flex-col justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100/80 to-pink-100/80 dark:from-blue-900/80 dark:to-pink-900/80 rounded-xl backdrop-blur-sm flex items-center justify-center shadow-lg border border-gray-200/30 dark:border-gray-700/30">
                  <span className="text-gray-600 dark:text-gray-300 text-lg">{['🐕', '🐱', '🐾', '🐕‍♂️', '📍', '📸'][i % 6]}</span>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300/40 dark:bg-gray-600/40 rounded-full w-3/4 shadow-sm"></div>
                  <div className="h-3 bg-gray-200/40 dark:bg-gray-700/40 rounded-full w-1/2 shadow-sm"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Revolutionary Content Layout */}
        <div className="container mx-auto px-0 sm:px-8 max-w-8xl relative z-20">
          
          {/* Status Bar - Ajustado para móvil */}
          <div className="fixed top-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:top-8 transform sm:-translate-x-1/2 z-50">
            <div className="bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-2xl border border-gray-700/20 rounded-full px-4 py-2 sm:px-6 sm:py-3 flex items-center gap-3 sm:gap-4 shadow-2xl w-full sm:w-auto">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-sm"></div>
                <span className="text-gray-200 text-sm font-medium whitespace-nowrap">Plataforma activa</span>
              </div>
              <div className="w-px h-4 bg-gray-700/30 hidden sm:block"></div>
              <span className="text-gray-300 text-xs whitespace-nowrap ml-auto sm:ml-0">🐕 47 peludos disfrutando</span>
            </div>
          </div>

          {/* Split Screen Layout - Optimizado para móvil */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-screen pt-24 sm:pt-0">
            
            {/* Left Side - Typography ajustada */}
            <div className="space-y-6 sm:space-y-8 text-center sm:text-left relative">
              {/* Glassmorphism background para el texto - solo en móvil */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-xl rounded-3xl -m-8 z-0 sm:hidden"></div>
              
              <div className="space-y-3 sm:space-y-4 relative z-10 p-8 sm:p-0">
                <div className="inline-block">
                  <span className="text-blue-600 dark:text-blue-300 text-sm font-mono tracking-wider uppercase flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-lg">🐾</span> Cuidado de Mascotas Premium
                  </span>
                </div>
                
                <h1 className="text-4xl sm:text-6xl lg:text-8xl font-light leading-[1.1] sm:leading-[0.9] tracking-tight">
                  <span className="block text-gray-800 dark:text-gray-100 mb-2">Cuidado</span>
                  <span className="block">
                    <span className="bg-gradient-to-r from-blue-400 via-pink-400 to-purple-400 bg-clip-text text-transparent font-medium">
                      inteligente
                    </span>
                  </span>
                  <span className="block text-gray-800 dark:text-gray-300 text-3xl sm:text-5xl lg:text-7xl font-extralight mt-2 sm:mt-4">
                    para cada mascota
                  </span>
                </h1>
              </div>

              <p className="text-lg sm:text-xl text-gray-800 dark:text-gray-300 leading-relaxed max-w-lg mx-auto sm:mx-0 font-light relative z-10 px-8 sm:px-0">
                Conectamos familias y sus <span className="text-blue-600 dark:text-blue-300">peludos compañeros</span> con cuidadores apasionados y verificados. 
                <span className="text-gray-900 dark:text-gray-100 font-medium"> Paseos seguros, fotos en vivo y colas felices garantizadas.</span>
              </p>

              {/* CTA Buttons - Ajustados para móvil */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 sm:pt-8 relative z-10 px-8 sm:px-0">
                <Link href="/login?from=register" className="group w-full sm:w-auto">
                  <Button className="w-full sm:w-auto relative overflow-hidden bg-gradient-to-r from-blue-500 to-pink-500 hover:from-pink-500 hover:to-blue-500 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-500 transform hover:scale-105 shadow-2xl">
                    <span className="relative z-10">Registrarse</span>
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </Button>
                </Link>
                
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    className="w-full sm:w-auto text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-700/30 hover:border-gray-400 dark:hover:border-gray-600/30 px-8 py-4 rounded-2xl backdrop-blur-sm transition-all duration-300 bg-gray-100/80 hover:bg-gray-200/80 dark:bg-gray-800/30 dark:hover:bg-gray-800/50"
                  >
                    Iniciar sesión
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Side - Dashboard Preview ajustado */}
            <div className="relative mt-8 sm:mt-0">
              <div className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-3xl p-4 sm:p-8 shadow-2xl transform rotate-0 sm:rotate-3 hover:rotate-0 transition-transform duration-500 mx-4 sm:mx-0">
                {/* Dashboard Content - Ajustado para móvil */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-400 rounded-full"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-amber-400 rounded-full"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-400 rounded-full"></div>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-mono">Live Dashboard</span>
                </div>

                {/* Pet Cards Grid - Ajustado para móvil */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {[
                      { icon: '🐕', name: 'Luna', status: 'Paseando', color: 'from-blue-900 to-pink-900' },
                      { icon: '🐱', name: 'Milo', status: 'En casa', color: 'from-pink-900 to-purple-900' },
                      { icon: '🐕‍🦺', name: 'Rex', status: 'Jugando', color: 'from-purple-900 to-blue-900' },
                      { icon: '🐾', name: 'Bella', status: 'Activa', color: 'from-gray-900 to-blue-900' }
                    ].map((pet, i) => (
                      <div key={i} className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 group hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-lg">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br ${pet.color} rounded-lg mb-2 sm:mb-3 flex items-center justify-center shadow-sm border border-gray-700/30`}>
                          <span className="text-xs sm:text-sm">{pet.icon}</span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4 shadow-sm"></div>
                          <div className="h-1.5 sm:h-2 bg-gray-100 dark:bg-gray-800 rounded w-1/2 shadow-sm"></div>
                        </div>
                        <div className="text-gray-700 dark:text-gray-300 text-[10px] sm:text-xs mt-2 font-medium truncate">{pet.name} • {pet.status}</div>
                      </div>
                    ))}
                  </div>

                  {/* Live Walk Card - Ajustado para móvil */}
                  <div className="bg-white dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-md space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white text-xs sm:text-sm">🏃‍♂️</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded flex-1 shadow-sm"></div>
                          <span className="text-green-600 dark:text-green-400 text-[10px] sm:text-xs font-medium whitespace-nowrap">● En vivo</span>
                        </div>
                        <div className="h-1.5 sm:h-2 bg-gray-100 dark:bg-gray-800 rounded w-16 shadow-sm"></div>
                      </div>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between text-gray-700 dark:text-gray-300 text-[10px] sm:text-xs font-medium">
                        <span>📍 Ruta actual</span>
                        <span>15 min • 1.2 km</span>
                      </div>
                      <div className="h-1.5 sm:h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full w-3/5 shadow-sm"></div>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs font-medium">
                        <span>🎾 Parque</span>
                        <span>🚿 Hidratación</span>
                        <span>📸 3 fotos</span>
                      </div>
                    </div>
                  </div>

                  {/* Notifications - Ajustadas para móvil */}
                  <div className="space-y-2">
                    {[
                      { icon: '📸', text: 'Nueva foto de Luna', time: '2 min' },
                      { icon: '🎾', text: 'Rex jugando en el parque', time: '5 min' }
                    ].map((notif, i) => (
                      <div key={i} className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-800 rounded-lg p-2.5 sm:p-3 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
                        <span className="text-xs sm:text-sm">{notif.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1 shadow-sm"></div>
                          <div className="h-1 sm:h-1.5 bg-gray-100 dark:bg-gray-800 rounded w-2/3 shadow-sm"></div>
                        </div>
                        <span className="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs font-medium whitespace-nowrap">{notif.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Revolutionary Stats Section - Floating Cards */}
        <section className="relative py-32 overflow-hidden">
          <div className="container mx-auto px-8 max-w-7xl">
            
                         {/* Floating Stats Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {[
                 { number: "2,500+", label: "Mascotas registradas", trend: "+15%", color: "from-blue-500 to-pink-500", icon: "🐕" },
                 { number: "350+", label: "Cuidadores verificados", trend: "+8%", color: "from-pink-500 to-purple-500", icon: "👨‍⚕️" },
                 { number: "4.9", label: "Calificación promedio", trend: "★★★★★", color: "from-purple-500 to-blue-500", icon: "⭐" },
                 { number: "24/7", label: "Soporte activo", trend: "Live", color: "from-blue-600 to-pink-600", icon: "🕒" }
               ].map((stat, index) => (
                <div
                key={index}
                  className="group relative scroll-animate opacity-0 translate-y-12"
                  style={{
                    transform: `translateY(${isClient ? Math.sin(index * 0.5) * 20 : 0}px)`,
                    animationDelay: `${index * 0.2}s`
                  }}
                >
                  <div className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-3xl p-8 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 shadow-2xl">
                     <div className="text-center space-y-4">
                       <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg border border-gray-700/30`}>
                         <span className="text-white text-2xl">
                           {stat.icon}
                         </span>
                       </div>
                       <div className={`text-5xl font-light bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                         {stat.number}
                       </div>
                       <div className="text-gray-700 dark:text-gray-300 font-medium">
                         {stat.label}
                       </div>
                       <div className="text-blue-600 dark:text-blue-400 text-sm font-mono">
                         {stat.trend}
                       </div>
                     </div>
                    <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300`}></div>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </section>

        {/* Revolutionary Features Section - Bento Grid */}
        <section className="relative py-32">
          <div className="container mx-auto px-8 max-w-7xl">
            
            {/* Section Header */}
            <div className="text-center mb-20 scroll-animate opacity-0 translate-y-12">
              <span className="text-blue-600 dark:text-blue-400 text-sm font-mono tracking-wider uppercase mb-4 block">
                Servicios Premium
              </span>
              <h2 className="text-6xl font-light text-gray-800 dark:text-gray-200 mb-6">
                Todo lo que
                <span className="block bg-gradient-to-r from-blue-600 via-pink-500 to-purple-600 bg-clip-text text-transparent font-medium">
                  necesitas
                </span>
            </h2>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-[800px]">
              
              {/* Large Feature Card */}
              <div className="md:col-span-2 lg:col-span-2 md:row-span-2 bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-3xl p-8 group hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-500 shadow-2xl scroll-animate opacity-0 translate-y-12">
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-6 flex items-center justify-center shadow-lg border border-gray-700/30">
                      <span className="text-white text-3xl">📍</span>
                    </div>
                    <h3 className="text-3xl font-light text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-3">
                      <span className="text-2xl">📍</span> Seguimiento GPS
                    </h3>
                    <p className="text-gray-700 dark:text-gray-400 text-lg leading-relaxed">
                      Monitoreo en tiempo real de dónde está tu <span className="text-blue-600 dark:text-blue-400 font-medium">peludo amigo</span> durante todo el paseo. Rutas seguras y reportes con fotos.
                    </p>
                  </div>
                  <div className="mt-8">
                    <div className="bg-gray-50 dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-md">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-sm"></div>
                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Ubicación en vivo</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full shadow-sm"></div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full w-3/4 shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medium Cards */}
              <div className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-3xl p-6 group hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-500 shadow-lg scroll-animate opacity-0 translate-y-12" style={{animationDelay: '0.2s'}}>
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl mb-4 flex items-center justify-center shadow-md border border-gray-700/30">
                  <span className="text-white text-lg">📸</span>
                </div>
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">Fotos en Vivo</h3>
                <p className="text-gray-700 dark:text-gray-400 text-sm">Ve a tu mascota disfrutando</p>
              </div>

              <div className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-3xl p-6 group hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-500 shadow-lg scroll-animate opacity-0 translate-y-12" style={{animationDelay: '0.3s'}}>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-pink-500 rounded-xl mb-4 flex items-center justify-center shadow-md border border-gray-700/30">
                  <span className="text-white text-lg">🛡️</span>
                </div>
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">Paseadores Seguros</h3>
                <p className="text-gray-700 dark:text-gray-400 text-sm">Verificados y con experiencia</p>
              </div>

              <div className="md:col-span-2 bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-3xl p-6 group hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-500 shadow-lg scroll-animate opacity-0 translate-y-12" style={{animationDelay: '0.4s'}}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md border border-gray-700/30">
                    <span className="text-white text-lg">📋</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">Reportes del Paseo</h3>
                    <p className="text-gray-700 dark:text-gray-400 text-sm">Duración, ruta y comportamiento</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-8 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm">
                      <span className="text-gray-600 dark:text-gray-400 text-xs">{['🐕', '⏱️', '📍', '🏃‍♂️', '💧', '🎾'][i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-3xl p-6 group hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-500 shadow-lg scroll-animate opacity-0 translate-y-12" style={{animationDelay: '0.5s'}}>
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-blue-500 rounded-xl mb-4 flex items-center justify-center shadow-md border border-gray-700/30">
                  <span className="text-white text-lg">💬</span>
                </div>
                <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">Chat con Paseador</h3>
                <p className="text-gray-700 dark:text-gray-400 text-sm">Comunicación directa y segura</p>
              </div>

            </div>
        </div>
      </section>

        {/* Revolutionary Footer */}
        <footer className="relative py-8 sm:py-16 bg-gradient-to-br from-gray-900 via-gray-800/95 to-gray-900 z-10">
          <div className="container mx-auto px-4 sm:px-8 max-w-7xl">
            {/* Grid layout optimizado para móvil */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-12">
              {/* Brand Column - full width en móvil */}
              <div className="col-span-2 sm:col-span-1 space-y-2 sm:space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">🐾</span>
                  <span className="text-lg sm:text-xl text-gray-100 font-medium">Pet Walker</span>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Redefiniendo el cuidado de mascotas con tecnología y amor.
                </p>
              </div>

              {/* Enlaces rápidos - 2 columnas en móvil */}
              <div className="space-y-2 sm:space-y-4">
                <h3 className="text-gray-100 font-medium text-sm sm:text-base">Enlaces rápidos</h3>
                <ul className="space-y-1 sm:space-y-2">
                  <li>
                    <Link href="/about" className="text-gray-400 hover:text-gray-300 text-xs sm:text-sm transition-colors">
                      Sobre nosotros
                    </Link>
                  </li>
                  <li>
                    <Link href="/services" className="text-gray-400 hover:text-gray-300 text-xs sm:text-sm transition-colors">
                      Servicios
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-gray-400 hover:text-gray-300 text-xs sm:text-sm transition-colors">
                      Contacto
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div className="space-y-2 sm:space-y-4">
                <h3 className="text-gray-100 font-medium text-sm sm:text-base">Legal</h3>
                <ul className="space-y-1 sm:space-y-2">
                  <li>
                    <Link href="/privacy" className="text-gray-400 hover:text-gray-300 text-xs sm:text-sm transition-colors">
                      Privacidad
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-gray-400 hover:text-gray-300 text-xs sm:text-sm transition-colors">
                      Términos
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Síguenos */}
              <div className="space-y-2 sm:space-y-4">
                <h3 className="text-gray-100 font-medium text-sm sm:text-base">Síguenos</h3>
                <div className="flex gap-3">
                  <Link 
                    href="https://twitter.com/petwalker" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                    </svg>
                  </Link>
                  <Link 
                    href="https://instagram.com/petwalker" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Bar - más compacto en móvil */}
            <div className="mt-6 sm:mt-12 pt-4 sm:pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
              <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
                © 2025 Pet Walker. Todos los derechos reservados.
              </p>
              <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-1">
                Hecho con <span className="text-red-500">❤️</span> en Argentina
              </p>
            </div>
          </div>
        </footer>

        {/* Aseguramos que los modales estén por encima de todo */}
        <style jsx global>{`
          .modal-overlay {
            z-index: 999 !important;
            position: fixed !important;
          }
          .modal-content {
            z-index: 1000 !important;
            position: relative !important;
          }
          /* Aseguramos que el footer no tape otros elementos */
          footer {
            position: relative;
            z-index: 10;
          }
          /* Los contenedores de modales necesitan estar por encima */
          [role="dialog"],
          [data-state="open"] {
            position: relative;
            z-index: 1000 !important;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          
          .animate-fade-in {
            animation: fadeIn 0.8s ease-out forwards;
            will-change: transform, opacity;
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* Hardware acceleration */
          .will-change-transform {
            will-change: transform;
            transform: translateZ(0);
            backface-visibility: hidden;
            perspective: 1000px;
          }
        `}</style>

    </div>
  );
}
