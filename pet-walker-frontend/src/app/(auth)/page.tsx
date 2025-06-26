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

const loginSchema = z.object({
  email: z.string().email({ message: "Correo electrónico inválido." }),
  contraseña: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const registerSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Correo electrónico inválido." }),
  contraseña: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  rol: z.enum(["DUENO", "PASEADOR"]),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  
  // Establecer estado inicial basado en el parámetro URL
  const [isLogin, setIsLogin] = useState(mode !== 'register');
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const usuario = useAuthStore((state) => state.usuario);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Actualizar estado cuando cambie el parámetro URL
  useEffect(() => {
    setIsLogin(mode !== 'register');
  }, [mode]);

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
    // Actualizar URL sin recargar la página
    const newMode = isLogin ? 'register' : 'login';
    router.replace(`/auth?mode=${newMode}`, { scroll: false });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 via-white to-cyan-200">
      <div className="relative w-full max-w-4xl h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Contenedor deslizante */}
        <div className={`flex w-[200%] h-full transition-transform duration-700 ease-in-out ${isLogin ? 'translate-x-0' : '-translate-x-1/2'}`}>
          
          {/* Panel de Login */}
          <div className="w-1/2 flex">
            {/* Formulario de Login */}
            <div className="w-3/5 p-8 flex flex-col justify-center">
              <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-primary mb-2 tracking-tight">Iniciar Sesión</h1>
                <p className="text-gray-500 text-base">Accede a tu cuenta para gestionar paseos y mascotas.</p>
              </div>
              
              <form onSubmit={handleLoginSubmit((data) => { setError(null); loginMutation.mutate(data); })} className="space-y-6">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" autoComplete="email" {...registerLogin("email")}/>
                  {loginErrors.email && <p className="text-red-500 text-xs mt-1">{loginErrors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="login-password">Contraseña</Label>
                  <Input id="login-password" type="password" autoComplete="current-password" {...registerLogin("contraseña")}/>
                  {loginErrors.contraseña && <p className="text-red-500 text-xs mt-1">{loginErrors.contraseña.message}</p>}
                </div>
                {error && (
                  <Alert variant="destructive">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={isLoginSubmitting || loginMutation.isPending}>
                  {(isLoginSubmitting || loginMutation.isPending) ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                      Iniciando...
                    </span>
                  ) : "Iniciar Sesión"}
                </Button>
              </form>
            </div>
            
            {/* Panel lateral de Login */}
            <div className="w-2/5 bg-gradient-to-br from-primary to-accent text-white p-8 flex flex-col justify-center items-center">
              <h2 className="text-2xl font-bold mb-4">¡Hola de nuevo!</h2>
              <p className="text-center mb-6 opacity-90">Para mantenerte conectado con nosotros, inicia sesión con tu información personal</p>
              <button
                onClick={handleToggle}
                className="border-2 border-white text-white px-8 py-2 rounded-full hover:bg-white hover:text-primary transition-all duration-300"
              >
                Registrarse
              </button>
            </div>
          </div>

          {/* Panel de Registro */}
          <div className="w-1/2 flex">
            {/* Panel lateral de Registro */}
            <div className="w-2/5 bg-gradient-to-br from-accent to-primary text-white p-8 flex flex-col justify-center items-center">
              <h2 className="text-2xl font-bold mb-4">¡Bienvenido!</h2>
              <p className="text-center mb-6 opacity-90">Ingresa tus datos personales y comienza tu viaje con nosotros</p>
              <button
                onClick={handleToggle}
                className="border-2 border-white text-white px-8 py-2 rounded-full hover:bg-white hover:text-accent transition-all duration-300"
              >
                Iniciar Sesión
              </button>
            </div>
            
            {/* Formulario de Registro */}
            <div className="w-3/5 p-8 flex flex-col justify-center">
              <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-primary mb-2 tracking-tight">Crear Cuenta</h1>
                <p className="text-gray-500 text-base">Únete a Pet Walker y comienza a cuidar mascotas.</p>
              </div>
              
              <form onSubmit={handleRegisterSubmit((data) => { setError(null); registerMutation.mutate(data); })} className="space-y-4">
                <div>
                  <Label htmlFor="register-name">Nombre</Label>
                  <Input id="register-name" type="text" autoComplete="name" {...registerRegister("nombre")}/>
                  {registerErrors.nombre && <p className="text-red-500 text-xs mt-1">{registerErrors.nombre.message}</p>}
                </div>
                <div>
                  <Label htmlFor="register-email">Email</Label>
                  <Input id="register-email" type="email" autoComplete="email" {...registerRegister("email")}/>
                  {registerErrors.email && <p className="text-red-500 text-xs mt-1">{registerErrors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="register-password">Contraseña</Label>
                  <Input id="register-password" type="password" autoComplete="new-password" {...registerRegister("contraseña")}/>
                  {registerErrors.contraseña && <p className="text-red-500 text-xs mt-1">{registerErrors.contraseña.message}</p>}
                </div>
                <div>
                  <Label htmlFor="register-role">Rol</Label>
                  <select id="register-role" className="w-full border rounded-md px-3 py-2 mt-1" {...registerRegister("rol")}>
                    <option value="DUENO">Dueño de Mascota</option>
                    <option value="PASEADOR">Paseador</option>
                  </select>
                  {registerErrors.rol && <p className="text-red-500 text-xs mt-1">{registerErrors.rol.message}</p>}
                </div>
                {error && (
                  <Alert variant="destructive">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={isRegisterSubmitting || registerMutation.isPending}>
                  {(isRegisterSubmitting || registerMutation.isPending) ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                      Registrando...
                    </span>
                  ) : "Registrarse"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
