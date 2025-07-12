"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login, register as registerApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

const loginSchema = z.object({
  email: z.string().email({ message: "Correo electrónico inválido." }),
  contraseña: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const registerSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Correo electrónico inválido." }),
  contraseña: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  confirmar: z.string().min(6, { message: "La confirmación debe tener al menos 6 caracteres." }),
  rol: z.enum(["DUENO", "PASEADOR"]),
}).refine((data) => data.contraseña === data.confirmar, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmar"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const searchParams = useSearchParams();
  const fromRegister = searchParams.get('from') === 'register';
  const [isLogin, setIsLogin] = useState(!fromRegister);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const usuario = useAuthStore((state) => state.usuario);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Login form
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  // Register form
  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors, isSubmitting: isRegisterSubmitting },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      if (!data.usuario) {
        setError("Error: La información del usuario no está disponible.");
        return;
      }
      // Limpiar estado previo (solo local, sin llamar al backend)
      useAuthStore.getState().setAuth(null);
      setAuth({ usuario: data.usuario, token: data.token });
      queryClient.invalidateQueries();
    },
    onError: (err: any) => {
      setError(err.message || "Ocurrió un error al iniciar sesión.");
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      if (!data.usuario) {
        setError("Error: La información del usuario no está disponible.");
        return;
      }
      // Limpiar estado previo (solo local)
      useAuthStore.getState().setAuth(null);
      setAuth({ usuario: data.usuario, token: data.token });
      queryClient.invalidateQueries();
    },
    onError: (err: any) => {
      setError(err.message || "Ocurrió un error al registrarse.");
    },
  });

  // Redirección tras login/registro exitoso
  React.useEffect(() => {
    if ((loginMutation.isSuccess || registerMutation.isSuccess) && isAuthenticated && isInitialized) {
      if (usuario?.rol === "DUENO") {
        router.push("/dashboard");
      } else if (usuario?.rol === "PASEADOR") {
        router.push("/dashboard/paseos");
      } else if (usuario?.rol === "ADMIN") {
        router.push("/dashboard/admin");
      }
    }
  }, [loginMutation.isSuccess, registerMutation.isSuccess, isAuthenticated, isInitialized, usuario, router]);

  // Alternancia visual
  const handleToggle = () => {
    setError(null);
    setIsLogin((prev) => !prev);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 overflow-hidden">
      
      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating Cards */}
        <div className="absolute top-20 left-10 w-32 h-20 bg-gradient-to-r from-blue-100/60 to-purple-100/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 animate-float" style={{animationDelay: '0s'}}>
          <div className="p-4 flex items-center gap-2">
            <span className="text-2xl">🐕</span>
            <div className="space-y-1">
              <div className="h-2 bg-gray-300/50 rounded w-12"></div>
              <div className="h-1 bg-gray-200/50 rounded w-8"></div>
            </div>
          </div>
        </div>
        
        <div className="absolute top-32 right-16 w-28 h-16 bg-gradient-to-r from-pink-100/60 to-blue-100/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 animate-float" style={{animationDelay: '2s'}}>
          <div className="p-3 flex items-center gap-2">
            <span className="text-xl">📍</span>
            <div className="space-y-1">
              <div className="h-2 bg-gray-300/50 rounded w-10"></div>
              <div className="h-1 bg-gray-200/50 rounded w-6"></div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-32 left-20 w-36 h-24 bg-gradient-to-r from-purple-100/60 to-pink-100/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 animate-float" style={{animationDelay: '4s'}}>
          <div className="p-4 flex items-center gap-2">
            <span className="text-2xl">📸</span>
            <div className="space-y-1">
              <div className="h-2 bg-gray-300/50 rounded w-14"></div>
              <div className="h-1 bg-gray-200/50 rounded w-10"></div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-20 right-12 w-30 h-18 bg-gradient-to-r from-blue-100/60 to-pink-100/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 animate-float" style={{animationDelay: '1s'}}>
          <div className="p-3 flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <div className="space-y-1">
              <div className="h-2 bg-gray-300/50 rounded w-12"></div>
              <div className="h-1 bg-gray-200/50 rounded w-8"></div>
            </div>
          </div>
        </div>
        
        {/* Floating Particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400/30 to-pink-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
        
        {/* Geometric Shapes */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 border-2 border-blue-300/40 rotate-45 animate-spin" style={{animationDuration: '20s'}}></div>
        <div className="absolute top-3/4 right-1/4 w-6 h-6 border-2 border-pink-300/40 rounded-full animate-pulse" style={{animationDuration: '3s'}}></div>
        <div className="absolute top-1/2 left-1/6 w-3 h-3 bg-purple-300/40 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Card container */}
      <div className="relative w-full max-w-4xl h-[620px] bg-gradient-to-br from-gray-50 to-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl shadow-2xl ring-1 ring-white/40 overflow-hidden group transform hover:scale-[1.02] transition-all duration-500" style={{boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.9)'}}>
        
        {/* Inner Floating Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Floating Icons */}
          <div className="absolute top-8 left-8 opacity-20">
            <span className="text-3xl animate-bounce" style={{animationDelay: '0.5s'}}>🐾</span>
          </div>
          <div className="absolute top-12 right-12 opacity-20">
            <span className="text-2xl animate-pulse" style={{animationDelay: '1s'}}>💝</span>
          </div>
          <div className="absolute bottom-16 left-16 opacity-20">
            <span className="text-2xl animate-bounce" style={{animationDelay: '2s'}}>🏃‍♂️</span>
          </div>
          <div className="absolute bottom-8 right-8 opacity-20">
            <span className="text-3xl animate-pulse" style={{animationDelay: '1.5s'}}>🌟</span>
          </div>
          
          {/* Gradient Orbs */}
          <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-xl animate-pulse" style={{animationDelay: '0s'}}></div>
          <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-gradient-to-r from-pink-200/30 to-blue-200/30 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Gradient stripe that slides */}
        <div
          className={`absolute top-0 h-full w-1/2 bg-gradient-to-br from-blue-600 via-pink-500 to-purple-600 opacity-95 transition-all duration-700 ease-in-out ${isLogin ? 'right-0' : '-translate-x-full left-0'}`}
          style={{maskImage:'linear-gradient(to left, transparent 0%, black 10%)'}}
        />

        {/* Login Panel */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center p-10 md:p-14 transition-transform duration-700 ease-in-out ${isLogin ? 'translate-x-0' : '-translate-x-full'} bg-gradient-to-br from-white/95 to-gray-50/90 backdrop-blur-xl z-10`}
        >
          {/* Logo */}
          <div className="mb-8 flex items-center gap-3 select-none group-hover:scale-105 transition-transform duration-500 relative">
            <div className="relative">
              <span className="text-4xl animate-pulse filter drop-shadow-lg">🐾</span>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 to-pink-400/20 rounded-full blur-sm -z-10"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-300/10 to-pink-300/10 rounded-full blur-md -z-20 animate-pulse"></div>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">Pet Walker</h1>
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-r from-blue-400 to-pink-400 rounded-full animate-ping"></div>
          </div>
            <h2 className="text-3xl font-light mb-2 text-gray-800">Iniciar Sesión</h2>
            <p className="text-gray-600 mb-8 font-light">Accede a tu cuenta para gestionar paseos y mascotas.</p>
            <form onSubmit={handleLoginSubmit((data) => { setError(null); loginMutation.mutate(data); })} className="w-full max-w-xs space-y-4">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" autoComplete="email" {...registerLogin("email")} className="w-full border-gray-200/50 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-300 bg-white/70 backdrop-blur-sm rounded-xl" />
                {loginErrors.email && <p className="text-red-500 text-xs mt-1">{loginErrors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="login-password">Contraseña</Label>
                <Input id="login-password" type="password" autoComplete="current-password" {...registerLogin("contraseña")} className="w-full border-gray-200/50 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-300 bg-white/70 backdrop-blur-sm rounded-xl" />
                {loginErrors.contraseña && <p className="text-red-500 text-xs mt-1">{loginErrors.contraseña.message}</p>}
              </div>
              {/* Divider */}
              <div className="flex items-center gap-4 my-2">
                <span className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300/50 to-transparent" />
                <span className="text-xs text-gray-500 uppercase tracking-widest font-medium">o</span>
                <span className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300/50 to-transparent" />
              </div>

              {/* Social buttons */}
              <div className="flex gap-3 w-full">
                <Button type="button" variant="outline" className="flex-1 flex items-center justify-center gap-2 hover:bg-blue-50/80 hover:border-blue-200/50 transition-all duration-300 group bg-white/70 backdrop-blur-sm rounded-xl border-gray-200/50">
                  <svg aria-hidden="true" focusable="false" className="h-4 w-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.8v3.5h4.9c-.2 1.3-.9 2.4-1.9 3.1v2.6h3.1c1.8-1.7 2.9-4.2 2.9-7.2 0-.8-.1-1.5-.2-2.2H12z"/><path fill="#34A853" d="M12 21c2.6 0 4.8-.9 6.4-2.4l-3.1-2.6c-.9.6-2 1-3.3 1-2.6 0-4.8-1.8-5.6-4.3H3.2v2.7C4.8 18.9 8.1 21 12 21z"/><path fill="#4A90E2" d="M6.4 12.7c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V6H3.2C2.5 7.5 2 9.2 2 11s.5 3.5 1.2 5l3.2-3.3z"/><path fill="#FBBC05" d="M12 4.8c1.4 0 2.7.5 3.7 1.4l2.8-2.8C16.8 1.7 14.6.9 12 .9 8.1.9 4.8 3 3.2 6l3.2 2.7C7.2 6.6 9.4 4.8 12 4.8z"/></svg>
                  <span className="sr-only md:not-sr-only text-sm font-medium group-hover:text-blue-600 transition-colors">Google</span>
                </Button>
                <Button type="button" variant="outline" className="flex-1 flex items-center justify-center gap-2 hover:bg-purple-50/80 hover:border-purple-200/50 transition-all duration-300 group bg-white/70 backdrop-blur-sm rounded-xl border-gray-200/50">
                  <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M16.365 1.43c-.58.027-1.278.397-1.67.86-.36.422-.69 1.09-.57 1.66.66.05 1.34-.34 1.74-.81.36-.42.64-1.11.5-1.71zM20.592 6.708c-1.04-.05-2.07.6-2.62 1.51-.57.94-.62 2.32-.16 3.32.79-.29 1.57-.86 2-1.7.46-.9.53-2.05.78-3.13zM12 5.09c-2.69 0-4.87 2.2-4.87 4.91 0 2.56 1.95 4.66 4.53 4.9v-4.9h1.66c.06-.31.1-.61.1-.93 0-.32-.04-.63-.1-.93H12V7.53h4.06c.26-.66.41-1.38.41-2.14C16.47 3.22 14.4 1.24 12 1.24 9.35 1.24 7.12 3.44 7.12 6.09c0 .75.15 1.46.41 2.11H12v1.66H7.53c-.06.3-.1.61-.1.93 0 .32.04.63.1.93H12v4.9c2.58-.24 4.53-2.34 4.53-4.9 0-2.71-2.18-4.91-4.87-4.91z"/></svg>
                  <span className="sr-only md:not-sr-only text-sm font-medium group-hover:text-purple-600 transition-colors">Apple</span>
                </Button>
              </div>

              {error && (
                <Alert variant="destructive" className="rounded-xl">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 transition-all duration-300 text-white font-semibold py-3 rounded-xl mt-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] transform relative overflow-hidden group" disabled={isLoginSubmitting || loginMutation.isPending}>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                {isLoginSubmitting || loginMutation.isPending ? 'Iniciando...' : 'Iniciar Sesión'}
              </Button>
            </form>
            <button onClick={handleToggle} className="mt-6 text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium transition-all duration-300">¿No tienes cuenta? Regístrate</button>
        </div>

        {/* Register Panel */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center p-10 md:p-14 transition-transform duration-700 ease-in-out ${isLogin ? 'translate-x-full' : 'translate-x-0'} bg-gradient-to-br from-white/95 to-gray-50/90 backdrop-blur-xl z-20`}
        >
          <div className="mb-8 flex items-center gap-3 select-none group-hover:scale-105 transition-transform duration-500 relative">
            <div className="relative">
              <span className="text-4xl animate-pulse filter drop-shadow-lg">🐾</span>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 to-pink-400/20 rounded-full blur-sm -z-10"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-300/10 to-pink-300/10 rounded-full blur-md -z-20 animate-pulse"></div>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">Pet Walker</h1>
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-ping"></div>
          </div>
          <h2 className="text-3xl font-light mb-2 text-gray-800">Crear Cuenta</h2>
          <p className="mb-6 text-gray-600 font-light">Únete a Pet Walker y comienza a cuidar mascotas.</p>
          <form onSubmit={handleRegisterSubmit((data) => { setError(null); registerMutation.mutate(data); })} className="w-full max-w-xs space-y-4">
            <div>
              <Label htmlFor="register-name">Nombre</Label>
              <Input id="register-name" type="text" autoComplete="name" {...registerRegister("nombre")} className="w-full border-gray-200/50 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-300 bg-white/70 backdrop-blur-sm rounded-xl" />
              {registerErrors.nombre && <p className="text-red-500 text-xs mt-1">{registerErrors.nombre.message}</p>}
            </div>
            <div>
              <Label htmlFor="register-email">Email</Label>
              <Input id="register-email" type="email" autoComplete="email" {...registerRegister("email")} className="w-full border-gray-200/50 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-300 bg-white/70 backdrop-blur-sm rounded-xl" />
              {registerErrors.email && <p className="text-red-500 text-xs mt-1">{registerErrors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="register-password">Contraseña</Label>
              <Input id="register-password" type="password" autoComplete="new-password" {...registerRegister("contraseña")} className="w-full border-gray-200/50 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-300 bg-white/70 backdrop-blur-sm rounded-xl" />
              {registerErrors.contraseña && <p className="text-red-500 text-xs mt-1">{registerErrors.contraseña.message}</p>}
            </div>
            <div>
              <Label htmlFor="register-confirm">Confirmar Contraseña</Label>
              <Input id="register-confirm" type="password" autoComplete="new-password" {...registerRegister("confirmar")} className="w-full border-gray-200/50 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-300 bg-white/70 backdrop-blur-sm rounded-xl" />
              {registerErrors.confirmar && <p className="text-red-500 text-xs mt-1">{registerErrors.confirmar.message}</p>}
            </div>
            <div>
              <Label htmlFor="register-role">Rol</Label>
              <select id="register-role" className="w-full rounded-xl px-4 py-2 border border-gray-200/50 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-300 bg-white/70 backdrop-blur-sm" {...registerRegister("rol")}>
                <option value="DUENO">Dueño de Mascota</option>
                <option value="PASEADOR">Paseador</option>
              </select>
              {registerErrors.rol && <p className="text-red-500 text-xs mt-1">{registerErrors.rol.message}</p>}
            </div>
            {error && (
              <Alert variant="destructive" className="rounded-xl">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all duration-300 text-white font-semibold py-3 rounded-xl mt-2 shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 hover:scale-[1.02] transform relative overflow-hidden group" disabled={isRegisterSubmitting || registerMutation.isPending}>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              {isRegisterSubmitting || registerMutation.isPending ? 'Registrando...' : 'Registrarse'}
            </Button>
          </form>
          <button onClick={handleToggle} className="mt-6 text-purple-600 hover:text-purple-700 hover:underline text-sm font-medium transition-all duration-300">¿Ya tienes cuenta? Inicia sesión</button>
        </div>

        {/* Texto Bienvenido en stripe */}
        {isLogin && (
          <div className="absolute right-0 top-0 h-full w-1/2 flex flex-col items-center justify-center text-white z-0 px-8 text-center pointer-events-none">
            <div className="space-y-6 animate-fade-in text-center relative">
              <h2 className="text-4xl font-light mb-4 drop-shadow-lg">¡Bienvenido!</h2>
              <p className="text-lg max-w-xs mx-auto drop-shadow-md opacity-90 font-light leading-relaxed">Gestiona tus paseos, mascotas y descubre novedades exclusivas para la comunidad Pet Walker.</p>
              
              {/* Floating Stats */}
              <div className="grid grid-cols-2 gap-4 mt-8 opacity-80">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                  <div className="text-2xl font-bold">2.5K+</div>
                  <div className="text-xs">Mascotas</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                  <div className="text-2xl font-bold">4.9⭐</div>
                  <div className="text-xs">Rating</div>
                </div>
              </div>
              
              <div className="flex justify-center gap-4 mt-8">
                <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce shadow-lg"></div>
                <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce shadow-lg" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce shadow-lg" style={{animationDelay: '0.2s'}}></div>
              </div>
              
              {/* Floating Testimonial */}
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 mt-6 text-sm opacity-90">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🐕</span>
                  <span className="font-medium">Luna</span>
                </div>
                <p className="text-xs italic">"¡Mis paseos nunca fueron tan divertidos!"</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 