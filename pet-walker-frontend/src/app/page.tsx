'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useRef, useState } from 'react';

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const ticking = useRef(false);

  useEffect(() => {
    setIsClient(true);
    
    // Super optimized scroll handler
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    // Debounced mouse move handler
    let mouseTimeout: NodeJS.Timeout;
    const handleMouseMove = (e: MouseEvent) => {
      clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }, 16); // ~60fps
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          entry.target.classList.remove('opacity-0', 'translate-y-12');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
      ticking.current = false;
    };
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-gray-900 overflow-hidden relative">
      
      {/* Dynamic Cursor Follower - Optimized */}
      {isClient && (
        <div 
          className="fixed w-96 h-96 pointer-events-none z-0 mix-blend-screen will-change-transform"
          style={{
            transform: `translate3d(${mousePosition.x - 192}px, ${mousePosition.y - 192}px, 0)`,
            background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(236,72,153,0.05) 50%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      )}

      {/* Floating Mesh Background - Minimal */}
      {isClient && (
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 opacity-15">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full mix-blend-screen will-change-transform"
                style={{
                  width: (i * 25 + 100) % 120 + 80,
                  height: (i * 25 + 100) % 120 + 80,
                  left: `${(i * 30 + 20) % 80}%`,
                  top: `${(i * 35 + 15) % 80}%`,
                  background: `radial-gradient(circle, ${
                    ['rgba(59,130,246,0.05)', 'rgba(236,72,153,0.05)', 'rgba(139,69,244,0.05)'][i % 3]
                  } 0%, transparent 70%)`,
                  animation: `pulse ${8 + i * 2}s ease-in-out infinite`,
                  animationDelay: `${i * 1}s`,
                  transform: `translate3d(0, ${scrollY * (0.01 + i * 0.005)}px, 0)`
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Revolutionary Hero Section - Apple Vision Pro Style */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        
        {/* 3D Glass Morphism Cards - Ultra Optimized */}
        <div className="absolute inset-0 perspective-1000">
          {[...Array(3)].map((_, i) => (
                         <div
               key={i}
               className="absolute w-72 h-44 bg-gradient-to-br from-gray-100/50 to-white/70 backdrop-blur-lg border border-gray-200/30 rounded-3xl shadow-xl will-change-transform"
               style={{
                 transform: `rotateX(${15 + i * 8}deg) rotateY(${-10 + i * 6}deg) translateZ(${i * 40}px)`,
                 left: `${15 + i * 20}%`,
                 top: `${10 + i * 12}%`,
                 animation: `float ${6 + i}s ease-in-out infinite`,
                 animationDelay: `${i * 0.5}s`,
                 boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.1)'
               }}
             >
                                              <div className="p-6 h-full flex flex-col justify-between">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-pink-100 rounded-xl backdrop-blur-sm flex items-center justify-center shadow-md border border-gray-200/50">
                    <span className="text-gray-600 text-lg">{['🐕', '🐱', '🐾', '🏃‍♂️', '📍', '📸'][i % 6]}</span>
                  </div>
                   <div className="space-y-2">
                     <div className="h-3 bg-gray-300/60 rounded-full w-3/4 shadow-sm"></div>
                     <div className="h-3 bg-gray-200/60 rounded-full w-1/2 shadow-sm"></div>
                   </div>
                 </div>
            </div>
          ))}
        </div>

        {/* Revolutionary Content Layout */}
        <div className="container mx-auto px-8 max-w-8xl relative z-20">
          
          {/* Floating Status Bar */}
          <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-gradient-to-r from-gray-50 to-white/95 backdrop-blur-2xl border border-gray-200/60 rounded-full px-6 py-3 flex items-center gap-4 shadow-xl" style={{boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.9)'}}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-sm"></div>
                <span className="text-gray-700 text-sm font-medium">Plataforma activa</span>
              </div>
              <div className="w-px h-4 bg-gray-300/60"></div>
              <span className="text-gray-600 text-xs">🐕 47 peludos disfrutando ahora</span>
            </div>
          </div>

          {/* Split Screen Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-screen">
            
            {/* Left Side - Revolutionary Typography */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-block">
                  <span className="text-blue-600 text-sm font-mono tracking-wider uppercase flex items-center gap-2">
                    <span className="text-lg">🐾</span> Cuidado de Mascotas Premium
                  </span>
                </div>
                
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-light leading-[0.9] tracking-tight">
                  <span className="block text-gray-900 mb-2">Cuidado</span>
                  <span className="block">
                    <span className="bg-gradient-to-r from-blue-600 via-pink-500 to-purple-600 bg-clip-text text-transparent font-medium">
                      inteligente
                    </span>
                  </span>
                  <span className="block text-gray-600 text-5xl sm:text-6xl lg:text-7xl font-extralight mt-4">
                    para cada mascota
                  </span>
                </h1>
              </div>

                             <p className="text-xl text-gray-600 leading-relaxed max-w-lg font-light">
                 Conectamos familias y sus <span className="text-blue-600">peludos compañeros</span> con cuidadores apasionados y verificados. 
                 <span className="text-gray-900 font-medium"> Paseos seguros, fotos en vivo y colas felices garantizadas.</span>
               </p>

              {/* Revolutionary CTA */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <Link href="/register" className="group">
                                   <Button className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-pink-500 hover:from-pink-500 hover:to-blue-600 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-500 transform hover:scale-105 shadow-2xl">
                   <span className="relative z-10">Iniciar experiencia</span>
                   <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                 </Button>
                </Link>
                
                                 <Button variant="ghost" className="text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-400 px-8 py-4 rounded-2xl backdrop-blur-sm transition-all duration-300 bg-white/50">
                   Ver demo en vivo
                 </Button>
              </div>
            </div>

            {/* Right Side - Interactive 3D Dashboard */}
            <div className="relative">
                             <div className="bg-gradient-to-br from-gray-50 to-white/90 backdrop-blur-2xl border border-gray-200/50 rounded-3xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500" style={{boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.8)'}}>
                
                {/* Mock Dashboard Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                  </div>
                                     <span className="text-gray-600 text-sm font-mono">Live Dashboard</span>
                </div>

                {/* Mock Content con Elementos Pet */}
                <div className="space-y-6">
                  {/* Cards de Mascotas */}
                  <div className="grid grid-cols-2 gap-4">
                                         {[
                       { icon: '🐕', name: 'Luna', status: 'Paseando', color: 'from-blue-100 to-pink-100' },
                       { icon: '🐱', name: 'Milo', status: 'En casa', color: 'from-pink-100 to-purple-100' },
                       { icon: '🐕‍🦺', name: 'Rex', status: 'Jugando', color: 'from-purple-100 to-blue-100' },
                       { icon: '🐾', name: 'Bella', status: 'Activa', color: 'from-gray-100 to-blue-100' }
                     ].map((pet, i) => (
                       <div key={i} className="bg-gradient-to-br from-gray-50 to-white/80 rounded-xl p-4 border border-gray-200/40 group hover:bg-white/90 transition-all duration-300 shadow-md hover:shadow-lg">
                         <div className={`w-8 h-8 bg-gradient-to-br ${pet.color} rounded-lg mb-3 flex items-center justify-center shadow-sm border border-gray-200/50`}>
                           <span className="text-sm">{pet.icon}</span>
                         </div>
                         <div className="h-2 bg-gray-300/60 rounded w-3/4 mb-2 shadow-sm"></div>
                         <div className="h-2 bg-gray-200/60 rounded w-1/2 shadow-sm"></div>
                         <div className="text-gray-500 text-xs mt-2 font-medium">{pet.name} • {pet.status}</div>
                       </div>
                    ))}
                  </div>
                  
                  {/* Panel de Paseo Activo */}
                  <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-xl p-6 border border-blue-200/50 shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white text-sm">🏃‍♂️</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-3 bg-gray-300/80 rounded w-24 shadow-sm"></div>
                          <span className="text-green-600 text-xs font-medium">● En vivo</span>
                        </div>
                        <div className="h-2 bg-gray-200/80 rounded w-16 shadow-sm"></div>
                      </div>
                    </div>
                    
                    {/* Barra de Progreso del Paseo */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-gray-700 text-xs font-medium">
                        <span>📍 Ruta actual</span>
                        <span>15 min • 1.2 km</span>
                      </div>
                      <div className="h-2 bg-gray-200/80 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full w-3/5 shadow-sm"></div>
                      </div>
                      <div className="flex justify-between text-gray-600 text-xs font-medium">
                        <span>🎾 Parque iniciado</span>
                        <span>🚿 Hidratación</span>
                        <span>📸 3 fotos</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mini Notificaciones */}
                  <div className="space-y-2">
                    {[
                      { icon: '📸', text: 'Nueva foto de Luna', time: '2 min' },
                      { icon: '🎾', text: 'Rex jugando en el parque', time: '5 min' }
                    ].map((notif, i) => (
                      <div key={i} className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white/90 rounded-lg p-3 border border-gray-200/40 shadow-sm hover:shadow-md transition-all duration-300">
                        <span className="text-sm">{notif.icon}</span>
                        <div className="flex-1">
                          <div className="h-2 bg-gray-300/60 rounded w-full mb-1 shadow-sm"></div>
                          <div className="h-1 bg-gray-200/60 rounded w-2/3 shadow-sm"></div>
                        </div>
                        <span className="text-gray-500 text-xs font-medium">{notif.time}</span>
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
                 { number: "2,500+", label: "Mascotas registradas", trend: "+15%", color: "from-blue-500 to-pink-500" },
                 { number: "350+", label: "Cuidadores verificados", trend: "+8%", color: "from-pink-500 to-purple-500" },
                 { number: "4.9", label: "Calificación promedio", trend: "★★★★★", color: "from-purple-500 to-blue-500" },
                 { number: "24/7", label: "Soporte activo", trend: "Live", color: "from-blue-600 to-pink-600" }
               ].map((stat, index) => (
                <div
                  key={index}
                  className="group relative scroll-animate opacity-0 translate-y-12"
                  style={{
                    transform: `translateY(${isClient ? Math.sin(index * 0.5) * 20 : 0}px)`,
                    animationDelay: `${index * 0.2}s`
                  }}
                >
                                     <div className="bg-gradient-to-br from-gray-50 to-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 hover:bg-white/90 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 shadow-2xl" style={{boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.9)'}}>
                     <div className="text-center space-y-4">
                       <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg`}>
                         <span className="text-white text-2xl">
                           {['🐕', '👨‍⚕️', '⭐', '🕒'][index]}
                         </span>
                       </div>
                       <div className={`text-5xl font-light bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                         {stat.number}
                       </div>
                       <div className="text-gray-700 font-medium">
                         {stat.label}
                       </div>
                       <div className="text-blue-600 text-sm font-mono">
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
              <span className="text-blue-600 text-sm font-mono tracking-wider uppercase mb-4 block">
                Servicios Premium
              </span>
              <h2 className="text-6xl font-light text-gray-800 mb-6">
                Todo lo que
                <span className="block bg-gradient-to-r from-blue-600 via-pink-500 to-purple-600 bg-clip-text text-transparent font-medium">
                  necesitas
                </span>
              </h2>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-[800px]">
              
              {/* Large Feature Card */}
              <div className="md:col-span-2 lg:col-span-2 md:row-span-2 bg-gradient-to-br from-gray-50 to-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 group hover:bg-white/90 transition-all duration-500 shadow-2xl scroll-animate opacity-0 translate-y-12" style={{boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.9)'}}>
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-6 flex items-center justify-center shadow-lg">
                      <span className="text-white text-3xl">📍</span>
                    </div>
                    <h3 className="text-3xl font-light text-gray-800 mb-4 flex items-center gap-3">
                      <span className="text-2xl">📍</span> Seguimiento GPS
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      Monitoreo en tiempo real de dónde está tu <span className="text-blue-600 font-medium">peludo amigo</span> durante todo el paseo. Rutas seguras y reportes con fotos.
                    </p>
                  </div>
                  <div className="mt-8">
                    <div className="bg-gradient-to-r from-gray-100/80 to-white/90 rounded-2xl p-4 border border-gray-200/40 shadow-md">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-sm"></div>
                        <span className="text-gray-700 text-sm font-medium">Ubicación en vivo</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-300/60 rounded-full shadow-sm"></div>
                        <div className="h-2 bg-gray-200/60 rounded-full w-3/4 shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medium Cards */}
              <div className="bg-gradient-to-br from-gray-50 to-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-6 group hover:bg-white/90 transition-all duration-500 shadow-lg scroll-animate opacity-0 translate-y-12" style={{animationDelay: '0.2s'}}>
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl mb-4 flex items-center justify-center shadow-md">
                  <span className="text-white text-lg">📸</span>
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Fotos en Vivo</h3>
                <p className="text-gray-600 text-sm">Ve a tu mascota disfrutando</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-6 group hover:bg-white/90 transition-all duration-500 shadow-lg scroll-animate opacity-0 translate-y-12" style={{animationDelay: '0.3s'}}>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-pink-500 rounded-xl mb-4 flex items-center justify-center shadow-md">
                  <span className="text-white text-lg">🛡️</span>
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Paseadores Seguros</h3>
                <p className="text-gray-600 text-sm">Verificados y con experiencia</p>
              </div>

              <div className="md:col-span-2 bg-gradient-to-br from-gray-50 to-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-6 group hover:bg-white/90 transition-all duration-500 shadow-lg scroll-animate opacity-0 translate-y-12" style={{animationDelay: '0.4s'}}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-white text-lg">📋</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-800">Reportes del Paseo</h3>
                    <p className="text-gray-600 text-sm">Duración, ruta y comportamiento</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-8 bg-gray-100/80 rounded-lg border border-gray-200/50 flex items-center justify-center shadow-sm">
                      <span className="text-gray-500 text-xs">{['🐕', '⏱️', '📍', '🏃‍♂️', '💧', '🎾'][i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-6 group hover:bg-white/90 transition-all duration-500 shadow-lg scroll-animate opacity-0 translate-y-12" style={{animationDelay: '0.5s'}}>
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-blue-500 rounded-xl mb-4 flex items-center justify-center shadow-md">
                  <span className="text-white text-lg">💬</span>
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Chat con Paseador</h3>
                <p className="text-gray-600 text-sm">Comunicación directa y segura</p>
              </div>

            </div>
          </div>
        </section>

        {/* Revolutionary Footer */}
        <footer className="relative py-20 bg-gradient-to-br from-slate-100 via-blue-50 to-purple-100">
          <div className="container mx-auto px-8 max-w-7xl">
            <div className="text-center">
                             <div className="mb-8 scroll-animate opacity-0 translate-y-12">
                 <h3 className="text-4xl font-light text-gray-800 mb-4 flex items-center justify-center gap-3">
                   <span className="text-3xl">🐾</span>
                   Colas felices,
                   <span className="bg-gradient-to-r from-blue-600 via-pink-500 to-purple-600 bg-clip-text text-transparent font-medium"> familias tranquilas</span>
                 </h3>
                 <p className="text-gray-600 text-lg">Donde cada paseo es una aventura segura y llena de amor</p>
               </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12 scroll-animate opacity-0 translate-y-12" style={{animationDelay: '0.2s'}}>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-blue-500 to-pink-500 text-white font-semibold px-8 py-3 rounded-2xl hover:scale-105 transition-transform duration-300 shadow-lg">
                    Unirse al futuro
                  </Button>
                </Link>
                <Button variant="ghost" className="text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-400 px-8 py-3 rounded-2xl bg-white/50 hover:bg-white/80 transition-all duration-300">
                  Contactar
                </Button>
              </div>
              
              <div className="border-t border-gray-300/50 pt-8 scroll-animate opacity-0 translate-y-12" style={{animationDelay: '0.3s'}}>
                <p className="text-gray-500 text-sm">
                  © {new Date().getFullYear()} Pet Walker. Redefiniendo el cuidado de mascotas.
                </p>
              </div>
            </div>
          </div>
        </footer>

          </div>
  );
}
