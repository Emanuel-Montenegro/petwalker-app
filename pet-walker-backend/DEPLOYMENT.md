# 🚀 Guía de Despliegue - Pet Walker Backend

## Variables de Entorno Requeridas

Configura estas variables en tu plataforma de despliegue:

```env
# Base de datos PostgreSQL
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT Secret (genera uno seguro)
JWT_SECRET="tu-super-secreto-jwt-aqui"

# Puerto del servidor
PORT=3001

# Entorno
NODE_ENV=production

# CORS (URL de tu frontend)
CORS_ORIGIN="https://tu-frontend.vercel.app"

# Opcional: MercadoPago
MERCADOPAGO_ACCESS_TOKEN="tu-token-mercadopago"
```

## Pasos de Despliegue

### 1. Railway (Recomendado)

1. Ve a [railway.app](https://railway.app)
2. Conecta tu cuenta de GitHub
3. Crea un nuevo proyecto
4. Selecciona tu repositorio
5. Agrega una base de datos PostgreSQL
6. Configura las variables de entorno
7. ¡Listo! Railway detectará automáticamente la configuración

### 2. Render

1. Ve a [render.com](https://render.com)
2. Conecta tu cuenta de GitHub
3. Crea un nuevo Web Service
4. Selecciona tu repositorio
5. Configura:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
6. Agrega las variables de entorno
7. ¡Despliega!

### 3. Heroku

1. Ve a [heroku.com](https://heroku.com)
2. Crea una nueva app
3. Conecta tu repositorio de GitHub
4. Agrega un addon de PostgreSQL
5. Configura las variables de entorno
6. ¡Despliega!

## Verificación

Una vez desplegado, verifica que funcione:

```bash
# Health check
curl https://tu-backend.railway.app/health

# Debería devolver algo como:
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": "connected"
  }
}
```

## Troubleshooting

### Error: "No start command found"

- Verifica que el `package.json` tenga el script `start`
- Asegúrate de que el archivo `index.ts` exista en `src/`

### Error de base de datos

- Verifica que `DATABASE_URL` esté configurada correctamente
- Ejecuta las migraciones: `npx prisma migrate deploy`

### Error de CORS

- Configura `CORS_ORIGIN` con la URL exacta de tu frontend
- Para desarrollo local: `http://localhost:3000`
