"use client";

import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  defaultValues: { nombre: string; email: string };
  onSave: (data: FormData) => Promise<void>;
}

export const AccountSettingsDialog: React.FC<Props> = ({ defaultValues, onSave }) => {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { ...defaultValues, password: '' },
  });

  return (
    <DialogContent className="w-full max-w-[90vw] sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
      <DialogHeader className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-4">
        <DialogTitle className="text-lg">Configuraciones de la Cuenta</DialogTitle>
      </DialogHeader>

      <form onSubmit={form.handleSubmit(onSave)} className="p-6 space-y-5 bg-white">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <Input {...form.register('nombre')} className="w-full h-10" />
          {form.formState.errors.nombre && (
            <p className="text-xs text-red-600 mt-1">{form.formState.errors.nombre.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <Input type="email" {...form.register('email')} className="w-full h-10" />
          {form.formState.errors.email && (
            <p className="text-xs text-red-600 mt-1">{form.formState.errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña (opcional)</label>
          <Input type="password" {...form.register('password')} className="w-full h-10" />
          {form.formState.errors.password && (
            <p className="text-xs text-red-600 mt-1">{form.formState.errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white h-12 rounded-xl">Guardar Cambios</Button>
      </form>
    </DialogContent>
  );
}; 