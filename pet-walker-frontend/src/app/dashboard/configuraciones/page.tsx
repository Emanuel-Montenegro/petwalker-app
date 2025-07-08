"use client";
import { useAuthStore } from '@/lib/store/authStore';
import { updateUserProfile, changePassword } from '@/lib/api/user';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const schema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  actual: z.string().optional(),
  nueva: z.string().min(6).optional(),
  confirmar: z.string().optional(),
}).refine((data) => {
  if (data.nueva) return data.nueva === data.confirmar;
  return true;
}, { message: 'Las contraseñas no coinciden', path: ['confirmar'] });

type FormData = z.infer<typeof schema>;

export default function ConfigPage() {
  const { usuario, setUsuario } = useAuthStore();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: usuario?.nombre || '', email: usuario?.email || '' },
  });

  const profileMut = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      setUsuario(data);
      toast.success('Perfil actualizado');
    },
    onError: () => toast.error('Error al actualizar perfil'),
  });

  const passMut = useMutation({
    mutationFn: changePassword,
    onSuccess: () => toast.success('Contraseña cambiada'),
    onError: () => toast.error('Error al cambiar contraseña'),
  });

  const onSubmit = (data: FormData) => {
    profileMut.mutate({ nombre: data.nombre, email: data.email });
    if (data.nueva && data.actual) {
      passMut.mutate({ actual: data.actual, nueva: data.nueva });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Configuraciones de la Cuenta</h1>

      <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 shadow-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <Input {...form.register('nombre')} className="h-10" />
          {form.formState.errors.nombre && <p className="text-xs text-red-600">{form.formState.errors.nombre.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <Input type="email" {...form.register('email')} className="h-10" />
          {form.formState.errors.email && <p className="text-xs text-red-600">{form.formState.errors.email.message}</p>}
        </div>

        <hr />

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
            <Input type="password" {...form.register('actual')} className="h-10" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
            <Input type="password" {...form.register('nueva')} className="h-10" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
            <Input type="password" {...form.register('confirmar')} className="h-10" />
            {form.formState.errors.confirmar && <p className="text-xs text-red-600">{form.formState.errors.confirmar.message}</p>}
          </div>
        </div>

        <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white h-12 rounded-xl" disabled={profileMut.isPending || passMut.isPending}>Guardar Cambios</Button>
      </form>
    </div>
  );
} 