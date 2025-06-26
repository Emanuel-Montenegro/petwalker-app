const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('Modelos disponibles en prisma:');
console.log(Object.keys(prisma));

(async () => {
  try {
    // Intenta listar las notificaciones si existe el modelo
    if (prisma.notification) {
      const notis = await prisma.notification.findMany({ take: 1 });
      console.log('Ejemplo de notificación:', notis);
    } else if (prisma.Notification) {
      const notis = await prisma.Notification.findMany({ take: 1 });
      console.log('Ejemplo de Notification:', notis);
    } else {
      console.log('No se encontró el modelo de notificaciones.');
    }
  } catch (err) {
    console.error('Error al consultar notificaciones:', err);
  } finally {
    await prisma.$disconnect();
  }
})(); 