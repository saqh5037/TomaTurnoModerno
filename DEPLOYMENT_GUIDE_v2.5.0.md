# 🚀 DEPLOYMENT GUIDE v2.5.0-prod250925
## Sistema de Gestión de Turnos - INER

**Última Actualización:** 25 de Septiembre de 2025
**Versión:** 2.5.0
**Ambiente:** Producción

---

## 📁 ESTRUCTURA DEL PROYECTO

```
toma-turno/
├── .next/                     # Build de producción (generado)
├── components/                # Componentes React reutilizables
│   ├── docs/                  # Componentes de documentación
│   ├── theme/                 # Tema y estilos globales
│   └── *.js                   # Componentes principales
├── contexts/                  # Context API de React
│   └── AuthContext.js         # Contexto de autenticación
├── lib/                       # Utilidades y configuraciones
│   ├── docs/                  # Contenido de documentación
│   └── prisma.js              # Cliente Prisma singleton
├── pages/                     # Pages Router (Frontend)
│   ├── api/                   # API Routes (legacy)
│   ├── cubicles/              # Gestión de cubículos
│   ├── docs/                  # Sistema de documentación
│   ├── statistics/            # Módulo de estadísticas
│   ├── turns/                 # Gestión de turnos
│   ├── users/                 # Gestión de usuarios
│   └── index.js               # Página principal
├── prisma/
│   ├── schema.prisma          # Esquema de base de datos
│   └── migrations/            # Migraciones de DB
├── public/                    # Assets estáticos
├── scripts/                   # Scripts de utilidad
├── src/
│   └── app/
│       └── api/               # App Router API (nuevo)
│           ├── attention/     # APIs de atención
│           ├── auth/          # APIs de autenticación
│           ├── cubicles/      # APIs de cubículos
│           ├── docs/          # APIs de documentación
│           ├── profile/       # APIs de perfil
│           ├── statistics/    # APIs de estadísticas
│           ├── turns/         # APIs de turnos
│           └── users/         # APIs de usuarios
├── tests/                     # Tests unitarios y E2E
├── .env.production            # Variables de entorno
├── ecosystem.config.js        # Configuración PM2
├── package.json               # Dependencias
└── next.config.js             # Configuración Next.js
```

## 🔧 REQUISITOS DEL SISTEMA

### Hardware Mínimo (Producción)
- **CPU:** 2 cores @ 2.4GHz
- **RAM:** 4GB (2GB para app + 2GB sistema)
- **Disco:** 20GB SSD
- **Red:** 100Mbps

### Software Requerido
```bash
# Verificar versiones
node --version      # >= 18.17.0
npm --version       # >= 9.0.0
psql --version      # >= 14.0
pm2 --version       # >= 5.3.0
nginx --version     # >= 1.18.0 (opcional, para proxy reverso)
```

## 🔐 CONFIGURACIÓN DE VARIABLES DE ENTORNO

### 1. Crear archivo `.env.production`
```bash
# Base de Datos
DATABASE_URL="postgresql://labsis:labsis@localhost:5432/toma_turno?schema=public"

# Autenticación
NEXTAUTH_SECRET="your-secret-key-here"  # CRÍTICO: No cambiar en producción existente
NEXTAUTH_URL="http://localhost:3005"

# Aplicación
NODE_ENV="production"
PORT=3005

# Opcional - Monitoreo
SENTRY_DSN="your-sentry-dsn"
LOG_LEVEL="info"
```

### 2. Validar variables
```bash
# Script de validación
cat > check-env.sh << 'EOF'
#!/bin/bash
required_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "NODE_ENV" "PORT")
missing=0

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing: $var"
    missing=$((missing + 1))
  else
    echo "✅ Found: $var"
  fi
done

if [ $missing -gt 0 ]; then
  echo "⚠️  Missing $missing required variables"
  exit 1
else
  echo "✅ All required variables are set"
fi
EOF

chmod +x check-env.sh
./check-env.sh
```

## 📦 PROCESO DE DEPLOYMENT PASO A PASO

### PASO 1: Preparación (5 min)

```bash
# 1.1 Backup de base de datos
pg_dump -U labsis -h localhost -d toma_turno > backup_$(date +%Y%m%d_%H%M%S).sql

# 1.2 Backup del directorio actual
tar -czf backup_app_$(date +%Y%m%d_%H%M%S).tar.gz /path/to/toma-turno

# 1.3 Verificar espacio en disco
df -h /
# Asegurar al menos 5GB libres
```

### PASO 2: Obtener Código (2 min)

```bash
# 2.1 Clonar o actualizar repositorio
cd /opt/apps/  # o tu directorio de aplicaciones

# Si es primera vez:
git clone https://github.com/saqh5037/TomaTurnoModerno.git toma-turno
cd toma-turno

# Si ya existe:
cd toma-turno
git fetch origin
git checkout v2.5.0-prod250925
```

### PASO 3: Instalación de Dependencias (3 min)

```bash
# 3.1 Limpiar cache anterior
rm -rf node_modules .next

# 3.2 Instalar dependencias de producción
npm ci --production

# 3.3 Verificar instalación
npm ls --depth=0
```

### PASO 4: Base de Datos (2 min)

```bash
# 4.1 Ejecutar migraciones
npx prisma migrate deploy

# 4.2 Generar cliente Prisma
npx prisma generate

# 4.3 Verificar conexión
npx prisma db pull --print
```

### PASO 5: Build de Producción (5 min)

```bash
# 5.1 Limpiar builds anteriores
rm -rf .next

# 5.2 Build optimizado
NODE_ENV=production npm run build

# 5.3 Verificar build
ls -la .next/
# Debe mostrar carpetas: server, static, cache
```

### PASO 6: Configuración PM2 (2 min)

```bash
# 6.1 Verificar ecosystem.config.js
cat ecosystem.config.js

# 6.2 Iniciar aplicación
pm2 start ecosystem.config.js --env production

# 6.3 Guardar configuración
pm2 save
pm2 startup  # Seguir instrucciones para auto-start

# 6.4 Verificar estado
pm2 status
pm2 logs toma-turno --lines 50
```

### PASO 7: Configuración Nginx (Opcional)

```nginx
# /etc/nginx/sites-available/toma-turno
server {
    listen 80;
    server_name toma-turno.iner.gob.mx;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name toma-turno.iner.gob.mx;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/toma-turno.crt;
    ssl_certificate_key /etc/ssl/private/toma-turno.key;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Proxy Settings
    location / {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files
    location /_next/static {
        proxy_cache STATIC;
        proxy_pass http://localhost:3005;

        # Cache for 1 year
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

```bash
# Activar configuración
sudo ln -s /etc/nginx/sites-available/toma-turno /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## ✅ VALIDACIÓN POST-DEPLOYMENT

### 1. Health Checks

```bash
# Check API health
curl -f http://localhost:3005/api/health || echo "API Failed"

# Check database connection
curl http://localhost:3005/api/statistics/dashboard | jq '.success'

# Check authentication
curl -X POST http://localhost:3005/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"test"}' | jq '.success'
```

### 2. Functional Tests

```bash
# Test cubicles endpoint
curl http://localhost:3005/api/cubicles?activeOnly=true | jq 'length'

# Test turn creation (opcional, crea un turno real)
curl -X POST http://localhost:3005/api/turns/create \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Test Deploy",
    "age": 30,
    "gender": "Masculino",
    "contactInfo": "5555555555",
    "studies": ["BH"],
    "tipoAtencion": "General"
  }' | jq '.assignedTurn'
```

### 3. Performance Checks

```bash
# Response time test
time curl -s http://localhost:3005 > /dev/null

# Load test (opcional, requiere Apache Bench)
ab -n 100 -c 10 http://localhost:3005/
```

## 🔄 ROLLBACK PROCEDURE

Si algo sale mal, ejecutar inmediatamente:

```bash
#!/bin/bash
# rollback.sh

echo "🔄 Starting rollback..."

# 1. Stop current version
pm2 stop toma-turno

# 2. Restore previous version
cd /opt/apps/toma-turno
git checkout v2.4.0-prod  # Version anterior

# 3. Reinstall dependencies
npm ci --production

# 4. Rebuild
npm run build:prod

# 5. Restore database if needed
# psql -U labsis -d toma_turno < backup_YYYYMMDD_HHMMSS.sql

# 6. Restart application
pm2 restart toma-turno

# 7. Verify
curl http://localhost:3005/api/health

echo "✅ Rollback completed"
```

## 📊 MONITOREO Y LOGS

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Logs
pm2 logs toma-turno --lines 100
pm2 logs toma-turno --err --lines 50

# Metrics
pm2 show toma-turno
```

### Log Files Locations

```bash
# Application logs
/home/user/.pm2/logs/toma-turno-out.log    # stdout
/home/user/.pm2/logs/toma-turno-error.log  # stderr

# System logs
/var/log/nginx/access.log
/var/log/nginx/error.log
/var/log/postgresql/postgresql-14-main.log
```

### Alerting Setup

```bash
# PM2 Plus (opcional, requiere cuenta)
pm2 link <secret_key> <public_key>

# Custom alerts con cron
cat > /opt/monitoring/check_toma_turno.sh << 'EOF'
#!/bin/bash

# Check if app is running
if ! pm2 list | grep -q "online.*toma-turno"; then
    echo "ALERT: TomaTurno is down!" | mail -s "TomaTurno Alert" admin@hospital.com
    pm2 restart toma-turno
fi

# Check response time
response_time=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:3005)
if (( $(echo "$response_time > 2" | bc -l) )); then
    echo "ALERT: Slow response time: ${response_time}s" | mail -s "Performance Alert" admin@hospital.com
fi
EOF

# Add to crontab
*/5 * * * * /opt/monitoring/check_toma_turno.sh
```

## 🛠️ TROUBLESHOOTING

### Problema: Puerto 3005 en uso
```bash
# Identificar proceso
sudo lsof -i:3005
# Matar proceso si es necesario
sudo kill -9 <PID>
```

### Problema: Out of Memory
```bash
# Aumentar límite de memoria en ecosystem.config.js
max_memory_restart: '2G'

# Restart
pm2 restart toma-turno
```

### Problema: Database Connection Failed
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Test connection
psql -U labsis -h localhost -d toma_turno -c "SELECT 1"

# Check connection pool
npx prisma db execute --url $DATABASE_URL --command "SELECT count(*) FROM pg_stat_activity"
```

### Problema: Build Failed
```bash
# Clear all caches
rm -rf .next node_modules package-lock.json

# Fresh install
npm install
npm run build

# Check Node version
node --version  # Must be >= 18.17.0
```

## 📱 CONTACTOS DE EMERGENCIA

### Equipo de Desarrollo
- **Lead Developer:** Samuel Quiroz
- **Email:** desarrollo@dtdiagnosticos.com
- **GitHub Issues:** https://github.com/saqh5037/TomaTurnoModerno/issues

### Infraestructura INER
- **DevOps:** [Contacto DevOps]
- **DBA:** [Contacto DBA]
- **Soporte 24/7:** [Teléfono de guardia]

## 📝 CHECKLIST FINAL

- [ ] Backup de base de datos realizado
- [ ] Código en versión v2.5.0-prod250925
- [ ] Dependencias instaladas sin errores
- [ ] Migraciones ejecutadas exitosamente
- [ ] Build de producción completado
- [ ] PM2 iniciado y guardado
- [ ] Health checks pasando
- [ ] Logs sin errores críticos
- [ ] Monitoreo configurado
- [ ] Documentación actualizada
- [ ] Equipo notificado del deployment

---

**Documento generado:** 25 de Septiembre de 2025
**Versión del documento:** 1.0
**Próxima revisión:** Con cada release mayor

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>