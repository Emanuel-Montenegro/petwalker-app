# 🚀 Configuración del Proyecto Pet Walker

## 📋 **Archivos de Variables de Entorno Requeridos**

### 1. Backend (.env)

Crear archivo `pet-walker-backend/.env` con:

```env
# Database
DATABASE_URL="postgresql://usuario:password@localhost:5432/pet_walker_db"

# JWT Configuration
JWT_SECRETO="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL="http://localhost:3000"

# Admin Configuration
ADMIN_EMAIL="admin@petwalker.com"
ADMIN_PASSWORD="AdminPass123!"

# Optional Backend URL for reference
NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"
```

### 2. Frontend (.env.local)

Crear archivo `pet-walker-frontend/.env.local` con:

```env
# Backend API Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001/api
```

## 🗄️ **Configuración de Base de Datos**

1. **Instalar PostgreSQL** si no lo tienes
2. **Crear base de datos**:

```sql
CREATE DATABASE pet_walker_db;
CREATE USER usuario WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE pet_walker_db TO usuario;
```

3. **Ejecutar migraciones**:

```bash
cd pet-walker-backend
npx prisma migrate dev
npx prisma generate
npm run seed
```

## 🏃‍♂️ **Comandos para Ejecutar**

### Backend:

```bash
cd pet-walker-backend
npm install
npm run dev
```

### Frontend:

```bash
cd pet-walker-frontend
npm install
npm run dev
```

## ✅ **Problemas Resueltos**

- ✅ Inconsistencias en JWT_SECRET → JWT_SECRETO
- ✅ Tipos TypeScript corregidos
- ✅ Configuración CORS arreglada
- ✅ Variables de entorno definidas
- ✅ Imports corregidos en middleware

## 🔧 **URLs de Desarrollo**

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Test endpoint: http://localhost:3001/api/test
