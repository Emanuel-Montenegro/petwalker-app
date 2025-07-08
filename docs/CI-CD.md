# 🚀 CI/CD Pipeline Documentation

## Descripción General

Este proyecto utiliza **GitHub Actions** para automatizar el proceso de integración continua y despliegue continuo (CI/CD). El pipeline garantiza la calidad del código, ejecuta pruebas automáticas y despliega de forma segura a diferentes entornos.

## 🔄 Workflows Disponibles

### 1. **CI/CD Principal** (`.github/workflows/ci-cd.yml`)

Ejecuta en:

- ✅ Push a `main` y `develop`
- ✅ Pull Requests a `main` y `develop`

**Trabajos incluidos:**

- 🧪 **Testing & Quality**: Tests unitarios, cobertura, linting
- 🔒 **Security Scan**: Análisis de vulnerabilidades con Snyk
- 🏗️ **Build & Package**: Compilación y empaquetado de artefactos
- 🚀 **Deploy Staging**: Despliegue automático a staging (branch `develop`)
- 🌟 **Deploy Production**: Despliegue automático a producción (branch `main`)
- 📊 **Performance**: Análisis de rendimiento con Lighthouse

### 2. **PR Quality Checks** (`.github/workflows/pr-checks.yml`)

Ejecuta en:

- ✅ Apertura de Pull Requests
- ✅ Actualizaciones de Pull Requests

**Trabajos incluidos:**

- 📏 **Code Quality**: Análisis de calidad y complejidad
- 🧪 **Quick Tests**: Tests rápidos para feedback inmediato
- 🔒 **Security Quick Scan**: Auditoría de dependencias y secretos
- 📝 **PR Comment**: Resumen automático de resultados

## 🎯 Estrategia de Branching

```
main (producción)
├── develop (staging)
│   ├── feature/nueva-funcionalidad
│   ├── bugfix/correccion-bug
│   └── hotfix/arreglo-urgente
```

### **Flujo de Trabajo:**

1. **Feature Development**: `feature/*` → `develop`
2. **Staging Testing**: `develop` → Auto-deploy a staging
3. **Production Release**: `develop` → `main` → Auto-deploy a producción

## 🧪 Testing Strategy

### **Backend Testing**

```bash
# Unit tests
npm test

# Coverage report
npm run test:coverage

# CI tests (con timeout)
npm run test:ci
```

### **Frontend Testing**

```bash
# Unit tests
npm test

# Component tests
npm run test:watch

# CI tests
npm run test:ci
```

### **Coverage Requirements**

- ✅ **Minimum**: 70%
- 🎯 **Target**: 80%
- 🏆 **Ideal**: 90%

## 🔒 Security Checks

### **Automated Scans**

- 🔍 **Dependency Audit**: `npm audit`
- 🔒 **Vulnerability Scan**: Snyk
- 🕵️ **Secret Detection**: TruffleHog
- 📋 **SARIF Reports**: GitHub Code Scanning

### **Security Thresholds**

- ❌ **High Severity**: Bloquea el pipeline
- ⚠️ **Medium Severity**: Warning
- ✅ **Low Severity**: Permitido

## 🏗️ Build Process

### **Backend Build**

```bash
npm ci                    # Install dependencies
npm run build            # TypeScript compilation
tar -czf backend.tar.gz  # Package artifacts
```

### **Frontend Build**

```bash
npm ci                   # Install dependencies
npm run build           # Next.js build
tar -czf frontend.tar.gz # Package artifacts
```

### **Artifacts**

- 📦 **Backend**: `dist/`, `package.json`, `prisma/`
- 📦 **Frontend**: `.next/`, `package.json`, `public/`
- 📅 **Retention**: 30 días

## 🚀 Deployment Strategy

### **Staging Environment**

- 🌐 **URL**: `https://staging.petwalker.com`
- 🔄 **Trigger**: Push a `develop`
- 🧪 **Tests**: Smoke tests automáticos
- 📊 **Performance**: Lighthouse CI

### **Production Environment**

- 🌐 **URL**: `https://petwalker.com`
- 🔄 **Trigger**: Push a `main`
- 🧪 **Tests**: Health checks + smoke tests
- 📢 **Notifications**: Slack/Discord/Email

## 📊 Monitoring & Health Checks

### **Health Endpoints**

```
GET /api/health          # Basic health check
GET /api/health/detailed # Detailed system info
GET /api/health/ready    # Kubernetes readiness
GET /api/health/live     # Kubernetes liveness
```

### **Response Example**

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "services": {
    "database": "connected",
    "memory": {
      "used": 150,
      "total": 512
    }
  }
}
```

## 🔧 Configuration

### **Required Secrets**

```bash
# GitHub Repository Secrets
SNYK_TOKEN=xxx                    # Snyk security scanning
BACKEND_URL=https://api.example.com
STAGING_URL=https://staging.example.com
PRODUCTION_URL=https://example.com

# Environment Variables
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRETO=xxx
```

### **Environment Setup**

1. **Staging**: Auto-configured from `develop`
2. **Production**: Manual approval required

## 📈 Performance Budgets

### **Lighthouse Thresholds**

- 🚀 **Performance**: ≥ 80
- ♿ **Accessibility**: ≥ 90
- ✅ **Best Practices**: ≥ 90
- 🔍 **SEO**: ≥ 80
- 📱 **PWA**: ≥ 60 (warning)

### **Bundle Size Limits**

- 📦 **Initial JS**: < 250KB
- 📦 **Total Assets**: < 1MB
- 🖼️ **Images**: WebP optimized

## 🚨 Troubleshooting

### **Common Issues**

#### **Tests Failing**

```bash
# Check logs
npm run test:ci

# Local debugging
npm run test:watch
```

#### **Build Failures**

```bash
# Check TypeScript errors
npm run build

# Check dependencies
npm audit
```

#### **Deployment Issues**

```bash
# Check health endpoint
curl https://api.petwalker.com/health

# Check logs
docker logs container_name
```

### **Emergency Procedures**

#### **Rollback Production**

1. Go to GitHub Actions
2. Find last successful deployment
3. Re-run deployment job
4. Verify health checks

#### **Hotfix Process**

1. Create `hotfix/` branch from `main`
2. Apply fix
3. Test locally
4. Push to trigger emergency pipeline
5. Merge to `main` and `develop`

## 📞 Support

### **CI/CD Issues**

- 📧 **Email**: devops@petwalker.com
- 💬 **Slack**: #ci-cd-support
- 📋 **Issues**: GitHub Issues

### **Monitoring**

- 📊 **Dashboard**: https://monitoring.petwalker.com
- 🚨 **Alerts**: Configured for critical failures
- 📈 **Metrics**: Performance and uptime tracking

---

## 🎉 Benefits

✅ **Automated Quality**: No broken code reaches production  
✅ **Fast Feedback**: Immediate test results on PRs  
✅ **Secure Deployments**: Automated security scanning  
✅ **Performance Monitoring**: Lighthouse CI integration  
✅ **Zero Downtime**: Blue-green deployment strategy  
✅ **Rollback Capability**: Quick recovery from issues

---

_Last updated: 2024-01-15_  
_Pipeline Version: 1.0.0_
