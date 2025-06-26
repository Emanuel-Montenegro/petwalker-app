# 🐕 Pet Walker App

Una aplicación completa para conectar dueños de mascotas con paseadores profesionales.

## 🚀 Características

- **Autenticación segura** con JWT
- **Gestión de mascotas** con perfiles detallados
- **Sistema de paseos** con seguimiento en tiempo real
- **Calificaciones y reseñas** para paseadores
- **Notificaciones en tiempo real** con WebSockets
- **Seguimiento GPS** durante los paseos
- **Panel de administración** para gestión de usuarios
- **Interfaz responsive** con diseño moderno

## 🛠️ Tecnologías

### Backend

- **Node.js** con Express
- **TypeScript** para tipado estático
- **Prisma ORM** para base de datos
- **PostgreSQL** como base de datos
- **JWT** para autenticación
- **WebSockets** para tiempo real
- **Multer** para subida de archivos

### Frontend

- **Next.js 14** con App Router
- **React** con TypeScript
- **Tailwind CSS** para estilos
- **Shadcn/ui** para componentes
- **TanStack Query** para gestión de estado
- **Zustand** para estado global
- **React Hook Form** para formularios

## 📦 Instalación

### Prerrequisitos

- Node.js 18+
- PostgreSQL
- npm o yarn

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/pet-walker-app.git
cd pet-walker-app
```

### 2. Configurar el backend

```bash
cd pet-walker-backend
npm install
```

Crear archivo `.env`:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/pet_walker_db"
JWT_SECRET="tu-jwt-secret-super-seguro"
PORT=4000
NODE_ENV=development
```

### 3. Configurar la base de datos

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

### 4. Configurar el frontend

```bash
cd ../pet-walker-frontend
npm install
```

Crear archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 5. Ejecutar el proyecto

```bash
# Terminal 1 - Backend
cd pet-walker-backend
npm run dev

# Terminal 2 - Frontend
cd pet-walker-frontend
npm run dev
```

O usar el script de inicio:

```bash
./start-servers.sh
```

## 🗄️ Estructura de la Base de Datos

### Entidades principales:

- **Usuarios**: Dueños y paseadores
- **Mascotas**: Perfiles de mascotas con características
- **Paseos**: Sesiones de paseo con seguimiento
- **Calificaciones**: Sistema de reseñas
- **Certificados**: Documentación de paseadores
- **Notificaciones**: Sistema de alertas

## 🔐 Roles de Usuario

- **Dueño**: Gestiona mascotas y contrata paseadores
- **Paseador**: Ofrece servicios de paseo
- **Admin**: Administra la plataforma

## 📱 Funcionalidades por Rol

### Dueños

- Registrar y gestionar mascotas
- Buscar y contratar paseadores
- Seguir paseos en tiempo real
- Calificar servicios
- Ver historial de paseos

### Paseadores

- Crear perfil profesional
- Subir certificados
- Gestionar disponibilidad
- Realizar paseos con seguimiento GPS
- Ver calificaciones y ganancias

### Administradores

- Gestionar usuarios
- Moderar contenido
- Ver estadísticas
- Gestionar certificados

## 🚀 Despliegue

### Backend (Railway/Heroku)

```bash
cd pet-walker-backend
npm run build
npm start
```

### Frontend (Vercel/Netlify)

```bash
cd pet-walker-frontend
npm run build
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Autores

- **Emanuel Montenegro** - _Desarrollo inicial_

## 🙏 Agradecimientos

- Shadcn/ui por los componentes
- Prisma por el ORM
- Next.js por el framework
- Tailwind CSS por los estilos
