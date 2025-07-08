import { Server } from 'socket.io';

// Mapa para asociar usuarioId con socketId
const userSocketMap = new Map<number, string>();

export function registrarSocketNotificaciones(io: Server): void {
  io.on('connection', (socket) => {
    
    // El frontend debe emitir 'registrar-usuario' con su usuarioId tras autenticarse
    socket.on('registrar-usuario', (usuarioId: number) => {
      userSocketMap.set(usuarioId, socket.id);
      
    });

    socket.on('disconnect', () => {
      // Eliminar usuario del mapa al desconectarse
      for (const [userId, sockId] of userSocketMap.entries()) {
        if (sockId === socket.id) {
          userSocketMap.delete(userId);
          
          break;
        }
      }
    });
  });
}

// Función para emitir una notificación a un usuario específico
export function emitirNotificacionUsuario(io: Server, usuarioId: number, notificacion: any) {
  const socketId = userSocketMap.get(usuarioId);
  if (socketId) {
    
    io.to(socketId).emit('nueva-notificacion', notificacion);
  } else {
    
  }
} 