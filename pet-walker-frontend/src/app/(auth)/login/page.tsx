"use client";

import React, { useState, useEffect } from "react";
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
import PetWalkerLogo from '@/components/shared/PetWalkerLogo';

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
  
  // Si viene de /register, mostrar registro por defecto
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
      setAuth({ usuario: data.usuario, token: data.token });
      queryClient.invalidateQueries();
    },
    onError: (err: any) => {
      setError(err.message || "Ocurrió un error al registrarse.");
    },
  });

  // Redirección tras login/registro exitoso
  useEffect(() => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <PetWalkerLogo className="mx-auto mb-4" size={48} />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
            Pet Walker
          </h1>
          <p className="text-gray-600">Plataforma de cuidado de mascotas</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 relative">
          {/* Contenedor deslizante */}
          <div className={`flex w-[200%] lg:w-[200%] min-h-[600px] transition-transform duration-700 ease-in-out ${isLogin ? 'translate-x-0' : 'lg:-translate-x-1/2'}`}>
            {/* Login Section */}
            <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white text-2xl">🔑</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                  </h2>
                  <p className="text-gray-600">
                    {isLogin 
                      ? 'Accede a tu cuenta para gestionar paseos y mascotas'
                      : 'Únete a Pet Walker y comienza a cuidar mascotas'
                    }
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit((data) => { setError(null); loginMutation.mutate(data); })} className="space-y-6">
                  <div>
                    <Label htmlFor="login-email" className="text-gray-700 font-medium">Email</Label>
                    <Input 
                      id="login-email" 
                      type="email" 
                      autoComplete="email" 
                      {...registerLogin("email")}
                      className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                    />
                    {loginErrors.email && <p className="text-red-500 text-sm mt-1">{loginErrors.email.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="login-password" className="text-gray-700 font-medium">Contraseña</Label>
                    <Input 
                      id="login-password" 
                      type="password" 
                      autoComplete="current-password" 
                      {...registerLogin("contraseña")}
                      className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                    />
                    {loginErrors.contraseña && <p className="text-red-500 text-sm mt-1">{loginErrors.contraseña.message}</p>}
                  </div>
                  
                  {error && (
                    <Alert variant="destructive" className="rounded-xl">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg" 
                    disabled={isLoginSubmitting || loginMutation.isPending}
                  >
                    {(isLoginSubmitting || loginMutation.isPending) ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                        Iniciando...
                      </span>
                    ) : "Iniciar Sesión"}
                  </Button>
                </form>

                <div className="mt-8 text-center">
                  <button
                    onClick={handleToggle}
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                  >
                    ¿No tienes cuenta? Regístrate
                  </button>
                </div>
              </div>
            </div>

            {/* Hero Section - Login */}
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8 lg:p-12 flex items-center justify-center text-white relative overflow-hidden">
              <div className="text-center relative z-10">
                <div className="w-24 h-24 bg-white/20 rounded-3xl mx-auto mb-6 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-4xl">🐾</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">
                  {isLogin ? '¡Bienvenido de vuelta!' : '¡Únete a nosotros!'}
                </h2>
                <p className="text-white/90 text-lg mb-8 leading-relaxed">
                  {isLogin 
                    ? 'Gestiona los paseos de tus mascotas y mantente conectado con sus cuidadores de confianza.'
                    : 'Conecta con dueños de mascotas y paseadores profesionales en nuestra plataforma segura y confiable.'
                  }
                </p>
                
                {/* Features */}
                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-lg">📱</span>
                    </div>
                    <span className="text-white/90">Seguimiento en tiempo real</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🛡️</span>
                    </div>
                    <span className="text-white/90">Cuidadores verificados</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-lg">💬</span>
                    </div>
                    <span className="text-white/90">Comunicación directa</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-lg">📸</span>
                    </div>
                    <span className="text-white/90">Fotos y reportes</span>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full"></div>
              <div className="absolute bottom-10 left-10 w-16 h-16 bg-white/10 rounded-full"></div>
              <div className="absolute top-1/2 left-10 w-12 h-12 bg-white/10 rounded-full"></div>
            </div>

            {/* Register Section */}
            <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white text-2xl">✨</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Crear Cuenta</h2>
                  <p className="text-gray-600">
                    Únete a Pet Walker y comienza a cuidar mascotas
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit((data) => { setError(null); registerMutation.mutate(data); })} className="space-y-4">
                  <div>
                    <Label htmlFor="register-name" className="text-gray-700 font-medium">Nombre</Label>
                    <Input 
                      id="register-name" 
                      type="text" 
                      autoComplete="name" 
                      {...registerRegister("nombre")}
                      className="mt-2 border-gray-300 focus:border-pink-500 focus:ring-pink-500 rounded-xl"
                    />
                    {registerErrors.nombre && <p className="text-red-500 text-sm mt-1">{registerErrors.nombre.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="register-email-2" className="text-gray-700 font-medium">Email</Label>
                    <Input 
                      id="register-email-2" 
                      type="email" 
                      autoComplete="email" 
                      {...registerRegister("email")}
                      className="mt-2 border-gray-300 focus:border-pink-500 focus:ring-pink-500 rounded-xl"
                    />
                    {registerErrors.email && <p className="text-red-500 text-sm mt-1">{registerErrors.email.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="register-password-2" className="text-gray-700 font-medium">Contraseña</Label>
                    <Input 
                      id="register-password-2" 
                      type="password" 
                      autoComplete="new-password" 
                      {...registerRegister("contraseña")}
                      className="mt-2 border-gray-300 focus:border-pink-500 focus:ring-pink-500 rounded-xl"
                    />
                    {registerErrors.contraseña && <p className="text-red-500 text-sm mt-1">{registerErrors.contraseña.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="register-confirm-2" className="text-gray-700 font-medium">Confirmar Contraseña</Label>
                    <Input 
                      id="register-confirm-2" 
                      type="password" 
                      autoComplete="new-password" 
                      {...registerRegister("confirmar")}
                      className="mt-2 border-gray-300 focus:border-pink-500 focus:ring-pink-500 rounded-xl"
                    />
                    {registerErrors.confirmar && <p className="text-red-500 text-sm mt-1">{registerErrors.confirmar.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="register-role-2" className="text-gray-700 font-medium">Rol</Label>
                    <select 
                      id="register-role-2" 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 mt-2 focus:border-pink-500 focus:ring-pink-500" 
                      {...registerRegister("rol")}
                    > 
                      <option value="DUENO">Dueño de Mascota</option>
                      <option value="PASEADOR">Paseador</option>
                    </select>
                    {registerErrors.rol && <p className="text-red-500 text-sm mt-1">{registerErrors.rol.message}</p>}
                  </div>
                  
                  {error && (
                    <Alert variant="destructive" className="rounded-xl">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold py-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg" 
                    disabled={isRegisterSubmitting || registerMutation.isPending}
                  >
                    {(isRegisterSubmitting || registerMutation.isPending) ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                        Registrando...
                      </span>
                    ) : "Registrarse"}
                  </Button>
                </form>

                <div className="mt-8 text-center">
                  <button
                    onClick={handleToggle}
                    className="text-pink-600 hover:text-pink-800 font-medium transition-colors duration-200"
                  >
                    ¿Ya tienes cuenta? Inicia sesión
                  </button>
                </div>
              </div>
            </div>

            {/* Hero Section - Register */}
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 p-8 lg:p-12 flex items-center justify-center text-white relative overflow-hidden">
              <div className="text-center relative z-10">
                <div className="w-24 h-24 bg-white/20 rounded-3xl mx-auto mb-6 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-4xl">🚀</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">¡Únete a nosotros!</h2>
                <p className="text-white/90 text-lg mb-8 leading-relaxed">
                  Conecta con dueños de mascotas y paseadores profesionales en nuestra plataforma segura y confiable.
                </p>
                
                {/* Features */}
                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🎯</span>
                    </div>
                    <span className="text-white/90">Oportunidades de trabajo</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-lg">💰</span>
                    </div>
                    <span className="text-white/90">Pagos seguros</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-lg">⭐</span>
                    </div>
                    <span className="text-white/90">Sistema de calificaciones</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🐾</span>
                    </div>
                    <span className="text-white/90">Cuidado profesional</span>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"></div>
              <div className="absolute bottom-10 right-10 w-16 h-16 bg-white/10 rounded-full"></div>
              <div className="absolute top-1/2 right-10 w-12 h-12 bg-white/10 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 