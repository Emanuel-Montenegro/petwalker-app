"use client";

import React, { useState, Suspense } from "react";
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
import { Select } from "@/components/ui/select";

const loginSchema = z.object({
  email: z.string().email({ message: "Correo electrónico inválido." }),
  contrasena: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const registerSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Correo electrónico inválido." }),
  contrasena: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  confirmar: z.string().min(6, { message: "La confirmación debe tener al menos 6 caracteres." }),
  rol: z.enum(["DUENO", "PASEADOR"]),
}).refine((data) => data.contrasena === data.confirmar, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmar"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

function LoginPageContent() {
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
  const toggleForm = () => {
    setError(null);
    setIsLogin((prev) => !prev);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Card container */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
        {/* Contenedor de paneles con altura fija */}
        <div className="relative w-full h-[650px]">
          {/* Panel de Login */}
          <div 
            className={`absolute inset-0 w-full h-full transition-transform duration-1000 ease-in-out ${
              isLogin ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Contenedor flex que cambia dirección en móvil */}
            <div className="flex flex-col-reverse md:flex-row h-full">
              {/* Panel lateral con gradiente - En móvil va abajo */}
              <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 dark:from-blue-500 dark:via-purple-500 dark:to-pink-500 rounded-[32px] flex flex-col items-center justify-center p-8 relative">
                {/* Botón volver al inicio */}
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute top-6 left-6 text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2 group"
                  onClick={() => router.push('/')}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="transform transition-transform group-hover:-translate-x-1"
                  >
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                  Volver al inicio
                </Button>

                <h2 className="text-3xl md:text-4xl font-light mb-4 text-white">¡Bienvenido de nuevo!</h2>
                <p className="text-base md:text-lg max-w-xs mx-auto opacity-90 font-light leading-relaxed text-white">
                  Accede a tu cuenta para gestionar paseos y mascotas.
                </p>
                <Button
                  onClick={toggleForm}
                  variant="outline"
                  className="mt-6 border-2 border-white text-white hover:bg-white/10"
                >
                  Crear cuenta
                </Button>
              </div>

              {/* Formulario - En móvil va arriba */}
              <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8">
                {/* Logo mejorado */}
                <div className="mb-12 relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-pink-400/10 rounded-[24px] transform group-hover:scale-110 transition-transform duration-300"></div>
                  <div className="relative w-20 h-20 md:w-24 md:h-24 bg-white dark:bg-gray-800 rounded-[24px] shadow-lg flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
                    <span className="text-5xl md:text-6xl">🐾</span>
                  </div>
                </div>

                <div className="-mt-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Iniciar Sesión</h2>

                  {/* Formulario de login */}
                  <form onSubmit={handleLoginSubmit((data) => { setError(null); loginMutation.mutate(data); })} className="w-full max-w-sm space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        {...registerLogin("email")}
                        className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
                      />
                      {loginErrors.email && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{loginErrors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        {...registerLogin("contrasena")}
                        className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
                      />
                      {loginErrors.contrasena && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{loginErrors.contrasena.message}</p>}
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
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600"
                      disabled={isLoginSubmitting || loginMutation.isPending}
                    >
                      {isLoginSubmitting || loginMutation.isPending ? 'Iniciando sesión...' : 'Iniciar sesión'}
                    </Button>

                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                        onClick={() => router.push('/auth/recuperar-password')}
                      >
                        ¿Olvidaste tu contraseña?
              </Button>
                    </div>
            </form>
                </div>
        </div>
            </div>
          </div>

          {/* Panel de Registro */}
          <div 
            className={`absolute inset-0 w-full h-full transition-transform duration-1000 ease-in-out ${
              !isLogin ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Contenedor flex que cambia dirección en móvil */}
            <div className="flex flex-col-reverse md:flex-row h-full">
              {/* Panel lateral con gradiente - En móvil va abajo */}
              <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 dark:from-blue-500 dark:via-purple-500 dark:to-pink-500 rounded-[32px] flex flex-col items-center justify-center p-8 relative">
                {/* Botón volver al inicio */}
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute top-6 left-6 text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2 group"
                  onClick={() => router.push('/')}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="transform transition-transform group-hover:-translate-x-1"
                  >
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                  Volver al inicio
                </Button>

                <h2 className="text-3xl md:text-4xl font-light mb-4 text-white">¡Únete a nosotros!</h2>
                <p className="text-base md:text-lg max-w-xs mx-auto opacity-90 font-light leading-relaxed text-white">
                  Crea una cuenta para empezar a usar nuestros servicios.
                </p>
                <Button
                  onClick={toggleForm}
                  variant="outline"
                  className="mt-6 border-2 border-white text-white hover:bg-white/10"
                >
                  Iniciar sesión
                </Button>
              </div>

              {/* Formulario - En móvil va arriba */}
              <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8">
                {/* Logo mejorado */}
                <div className="mb-12 relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-pink-400/10 rounded-[24px] transform group-hover:scale-110 transition-transform duration-300"></div>
                  <div className="relative w-20 h-20 md:w-24 md:h-24 bg-white dark:bg-gray-800 rounded-[24px] shadow-lg flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
                    <span className="text-5xl md:text-6xl">🐾</span>
                  </div>
                </div>

                <div className="-mt-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Crear Cuenta</h2>

                  {/* Formulario de registro */}
                  <form onSubmit={handleRegisterSubmit((data) => { setError(null); registerMutation.mutate(data); })} className="w-full max-w-sm space-y-4">
                    <div className="space-y-2">
              <Label htmlFor="register-name" className="text-gray-700 dark:text-gray-300">Nombre</Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Tu nombre"
                        {...registerRegister("nombre")}
                        className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
                      />
              {registerErrors.nombre && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{registerErrors.nombre.message}</p>}
            </div>

                    <div className="space-y-2">
              <Label htmlFor="register-email" className="text-gray-700 dark:text-gray-300">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="tu@email.com"
                        {...registerRegister("email")}
                        className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
                      />
              {registerErrors.email && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{registerErrors.email.message}</p>}
            </div>

                    <div className="space-y-2">
              <Label htmlFor="register-password" className="text-gray-700 dark:text-gray-300">Contraseña</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        {...registerRegister("contrasena")}
                        className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
                      />
              {registerErrors.contrasena && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{registerErrors.contrasena.message}</p>}
            </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password" className="text-gray-700 dark:text-gray-300">Confirmar Contraseña</Label>
                      <Input
                        id="register-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        {...registerRegister("confirmar")}
                        className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
                      />
              {registerErrors.confirmar && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{registerErrors.confirmar.message}</p>}
            </div>

                    <div className="space-y-2">
              <Label htmlFor="register-role" className="text-gray-700 dark:text-gray-300">Rol</Label>
                      <select 
                        id="register-role" 
                        {...registerRegister("rol")}
                        className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Selecciona un rol</option>
                <option value="DUENO">Dueño de Mascota</option>
                <option value="PASEADOR">Paseador</option>
              </select>
              {registerErrors.rol && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{registerErrors.rol.message}</p>}
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
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600"
                      disabled={isRegisterSubmitting || registerMutation.isPending}
                    >
                      {isRegisterSubmitting || registerMutation.isPending ? 'Registrando...' : 'Crear cuenta'}
            </Button>

          </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-lg">Cargando...</div></div>}>
      <LoginPageContent />
    </Suspense>
  );
}