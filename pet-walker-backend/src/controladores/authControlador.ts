import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler';

// Función para generar token JWT
const generateToken = (userId: number, rol: string): string => {
  return jwt.sign(
    { userId, rol },
    process.env.JWT_SECRETO || 'tu_secreto_jwt_super_seguro',
    { expiresIn: '24h' }
  );
};

// Login
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('🔍 LOGIN: Iniciando proceso de login');
    const { email, contrasena } = req.body;
    console.log('🔍 LOGIN: Email:', email);

    console.log('🔍 LOGIN: Buscando usuario en BD...');
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario) {
      console.log('❌ LOGIN: Usuario no encontrado');
      return next(new AppError('Credenciales inválidas', 401));
    }

    console.log('✅ LOGIN: Usuario encontrado, verificando contraseña...');
    const contraseñaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    console.log('🔍 LOGIN: Contraseña válida:', contraseñaValida);
    
    if (!contraseñaValida) {
      console.log('❌ LOGIN: Contraseña inválida');
      return next(new AppError('Credenciales inválidas', 401));
    }

    console.log('🔍 LOGIN: Generando token...');
    const token = generateToken(usuario.id, usuario.rol);
    console.log('✅ LOGIN: Token generado');

    // Setear cookie HTTPOnly y Secure
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });

    res.json({
      token: token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    return next(new AppError('Error al iniciar sesión', 500));
  }
};

// Registro
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nombre, email, contrasena, rol } = req.body;

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      return next(new AppError('El email ya está registrado', 400));
    }

    const contraseñaEncriptada = await bcrypt.hash(contrasena, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        contrasena: contraseñaEncriptada,
        rol
      }
    });

    const token = generateToken(usuario.id, usuario.rol);

    // Setear cookie HTTPOnly y Secure
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });

    res.status(201).json({
      token: token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    return next(new AppError('Error al registrar usuario', 500));
  }
};

// Logout
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.json({ mensaje: 'Sesión cerrada exitosamente' });
  } catch (error) {
    return next(new AppError('Error al cerrar sesión', 500));
  }
};
