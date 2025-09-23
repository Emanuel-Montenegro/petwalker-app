#!/bin/bash

# Pet Walker - Production Deployment Script
# Uso: ./deploy.sh [environment]

set -e

ENV=${1:-production}
echo "🚀 Iniciando deployment para entorno: $ENV"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Verificar dependencias
log "Verificando dependencias..."
command -v docker >/dev/null 2>&1 || error "Docker no está instalado"
command -v docker-compose >/dev/null 2>&1 || error "Docker Compose no está instalado"

# Verificar archivos de configuración
log "Verificando archivos de configuración..."
[ ! -f ".env.production" ] && warn "Archivo .env.production no encontrado, usando valores por defecto"
[ ! -f "docker-compose.prod.yml" ] && error "Archivo docker-compose.prod.yml no encontrado"

# Detener servicios existentes
log "Deteniendo servicios existentes..."
docker-compose -f docker-compose.prod.yml down --remove-orphans || true

# Limpiar imágenes antiguas
log "Limpiando imágenes antiguas..."
docker system prune -f
docker image prune -f

# Construir imágenes
log "Construyendo imágenes..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Ejecutar migraciones de base de datos
log "Ejecutando migraciones de base de datos..."
docker-compose -f docker-compose.prod.yml up -d postgres
sleep 10

# Esperar a que PostgreSQL esté listo
log "Esperando a que PostgreSQL esté listo..."
until docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U pet_walker; do
    sleep 2
done

# Ejecutar migraciones
docker-compose -f docker-compose.prod.yml run --rm backend npm run db:migrate

# Iniciar todos los servicios
log "Iniciando servicios..."
docker-compose -f docker-compose.prod.yml up -d

# Verificar estado de los servicios
log "Verificando estado de los servicios..."
sleep 15

# Health checks
log "Ejecutando health checks..."

# Check backend
if curl -f http://localhost:3000/health >/dev/null 2>&1; then
    log "✅ Backend está funcionando correctamente"
else
    error "❌ Backend no responde"
fi

# Check frontend
if curl -f http://localhost:3001 >/dev/null 2>&1; then
    log "✅ Frontend está funcionando correctamente"
else
    error "❌ Frontend no responde"
fi

# Check nginx
if curl -f http://localhost >/dev/null 2>&1; then
    log "✅ Nginx está funcionando correctamente"
else
    error "❌ Nginx no responde"
fi

# Mostrar logs de servicios
log "Mostrando logs de servicios..."
docker-compose -f docker-compose.prod.yml logs --tail=50

# Información final
log "🎉 Deployment completado exitosamente!"
log "📊 Servicios disponibles:"
log "   - Frontend: http://localhost (Nginx)"
log "   - Frontend directo: http://localhost:3001"
log "   - Backend API: http://localhost:3000/api"
log "   - Base de datos: localhost:5432"
log ""
log "📝 Comandos útiles:"
log "   - Ver logs: docker-compose -f docker-compose.prod.yml logs -f"
log "   - Detener servicios: docker-compose -f docker-compose.prod.yml down"
log "   - Reiniciar servicios: docker-compose -f docker-compose.prod.yml restart"
log "   - Estado de servicios: docker-compose -f docker-compose.prod.yml ps"

log "✨ Pet Walker está listo para producción!"