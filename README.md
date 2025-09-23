# Pet Walker - Production Ready

🐕 **Aplicación completa de paseadores de mascotas optimizada para producción**

## 🚀 Deployment Rápido

```bash
# Clonar y configurar
git clone <repository>
cd pet-walker-app

# Configurar variables de entorno
cp .env.production .env
# Editar .env con tus valores de producción

# Deployment automático
./deploy.sh production
```

## 📋 Requisitos del Sistema

- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- **Node.js** >= 18 (para desarrollo)
- **PostgreSQL** >= 13 (incluido en Docker)

## 🏗️ Arquitectura

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Nginx     │────│  Frontend   │────│   Backend   │
│ (Port 80)   │    │ (Port 3001) │    │ (Port 3000) │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
                                    ┌─────────────┐
                                    │ PostgreSQL  │
                                    │ (Port 5432) │
                                    └─────────────┘
```

## ⚙️ Configuración de Producción

### Variables de Entorno Críticas

```bash
# Seguridad
JWT_SECRET=your-super-secure-jwt-secret-key
DB_PASSWORD=secure_production_password

# URLs de producción
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://api.your-domain.com
```

### Configuración de Base de Datos

```bash
# Automático con Docker Compose
DATABASE_URL=postgresql://pet_walker:password@postgres:5432/pet_walker
```

## 🔧 Comandos de Gestión

### Deployment
```bash
# Deployment completo
./deploy.sh production

# Solo construir imágenes
docker-compose -f docker-compose.prod.yml build

# Iniciar servicios
docker-compose -f docker-compose.prod.yml up -d
```

### Monitoreo
```bash
# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f

# Estado de servicios
docker-compose -f docker-compose.prod.yml ps

# Health checks
curl http://localhost/health
curl http://localhost:3000/health
```

### Mantenimiento
```bash
# Backup de base de datos
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U pet_walker pet_walker > backup.sql

# Restaurar backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U pet_walker pet_walker < backup.sql

# Limpiar sistema
docker system prune -f
docker volume prune -f
```

## 🛡️ Seguridad

### Headers de Seguridad (Nginx)
- ✅ X-Frame-Options: SAMEORIGIN
- ✅ X-XSS-Protection: 1; mode=block
- ✅ X-Content-Type-Options: nosniff
- ✅ Content-Security-Policy configurado

### Autenticación
- ✅ JWT con secreto seguro
- ✅ Validación de tokens
- ✅ Middleware de autenticación

### Base de Datos
- ✅ Usuario no-root
- ✅ Contraseñas seguras
- ✅ Conexiones encriptadas

## 📊 Optimizaciones de Rendimiento

### Frontend
- ✅ Build optimizado de Next.js
- ✅ Compresión gzip
- ✅ Caché de archivos estáticos
- ✅ Imágenes optimizadas

### Backend
- ✅ Clustering con PM2
- ✅ Conexiones de DB optimizadas
- ✅ Middleware de compresión
- ✅ Rate limiting

### Infraestructura
- ✅ Multi-stage Docker builds
- ✅ Nginx como reverse proxy
- ✅ Health checks automáticos
- ✅ Logs centralizados

## 🌐 URLs de Producción

| Servicio | URL Local | Descripción |
|----------|-----------|-------------|
| **Aplicación** | http://localhost | Frontend a través de Nginx |
| **API** | http://localhost/api | Backend API |
| **Frontend Directo** | http://localhost:3001 | Next.js directo |
| **Backend Directo** | http://localhost:3000 | Express directo |
| **Base de Datos** | localhost:5432 | PostgreSQL |

## 🔍 Troubleshooting

### Problemas Comunes

**Error de conexión a DB:**
```bash
# Verificar estado de PostgreSQL
docker-compose -f docker-compose.prod.yml logs postgres

# Reiniciar servicios
docker-compose -f docker-compose.prod.yml restart
```

**Frontend no carga:**
```bash
# Verificar build de Next.js
docker-compose -f docker-compose.prod.yml logs frontend

# Reconstruir imagen
docker-compose -f docker-compose.prod.yml build --no-cache frontend
```

**API no responde:**
```bash
# Verificar logs del backend
docker-compose -f docker-compose.prod.yml logs backend

# Verificar variables de entorno
docker-compose -f docker-compose.prod.yml exec backend env
```

## 📈 Métricas y Monitoreo

### Health Checks Disponibles
- `GET /health` - Estado general
- `GET /api/health` - Estado del backend
- `GET /api/db/health` - Estado de la base de datos

### Logs
```bash
# Logs por servicio
docker-compose -f docker-compose.prod.yml logs [service_name]

# Logs con timestamp
docker-compose -f docker-compose.prod.yml logs -t

# Seguir logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f --tail=100
```

## 🚀 Deployment en Cloud

### AWS/DigitalOcean/GCP
1. Configurar servidor con Docker
2. Clonar repositorio
3. Configurar variables de entorno
4. Ejecutar `./deploy.sh production`
5. Configurar dominio y SSL

### Vercel/Netlify (Solo Frontend)
```bash
# Build command
npm run build

# Output directory
out/
```

---

## 📞 Soporte

Para problemas de deployment o configuración:
1. Verificar logs con los comandos anteriores
2. Revisar variables de entorno
3. Confirmar que todos los servicios estén ejecutándose

**¡Pet Walker está listo para producción! 🎉**