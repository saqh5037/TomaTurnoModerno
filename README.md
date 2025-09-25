# TomaTurnoModerno 🏥

Sistema moderno de gestión de turnos médicos con estadísticas avanzadas y reportes PDF profesionales.

**Versión:** 2.5.0 | **Última actualización:** 25 de Septiembre de 2025 | **Estado:** Producción INER

## 📋 Características

### 🎯 Gestión de Turnos
- **Sistema de colas inteligente** con asignación automática
- **Interfaz moderna** con TailwindCSS 
- **Gestión de cubículos** generales y especiales
- **Llamado automático** de pacientes
- **Tiempo real** con actualizaciones en vivo

### 📊 Estadísticas Avanzadas
- **Estadísticas mensuales** por año y flebotomista
- **Estadísticas diarias** con vista de calendario
- **Tiempo promedio de atención** por flebotomista
- **Reportes individuales** de performance
- **Análisis de tendencias** estacionales

### 📄 Reportes PDF Profesionales
- **Diseño corporativo** con branding INER
- **Múltiples páginas** con análisis detallado
- **Gráficos y tablas** profesionales
- **Recomendaciones automáticas** basadas en datos
- **Metadatos completos** (fecha, usuario, etc.)

### 👥 Gestión de Usuarios
- **Roles diferenciados** (Admin, Flebotomista, Usuario)
- **Autenticación segura** con JWT
- **Protección de rutas** por rol
- **Gestión de permisos** granular

## 🛠 Stack Tecnológico

- **Framework**: Next.js 15.0.3 (Hybrid: App Router + Pages Router)
- **Base de datos**: PostgreSQL 14+ con Prisma ORM
- **Estilos**: Chakra UI + TailwindCSS
- **PDF**: jsPDF con diseño personalizado
- **Autenticación**: NextAuth + JWT con contexto React
- **Iconos**: Lucide React + React Icons
- **Fechas**: date-fns
- **Gestión de procesos**: PM2 (producción)

## 🚀 Instalación

### Prerrequisitos
- Node.js 18.17.0+
- PostgreSQL 14+
- npm 9.0+ o yarn
- PM2 (para producción)

### Configuración

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/saqh5037/TomaTurnoModerno.git
   cd TomaTurnoModerno
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Editar `.env.local` con tus credenciales:
   ```
   DATABASE_URL="postgresql://usuario:password@localhost:5432/toma_turno"
   NEXTAUTH_SECRET="tu-clave-secreta-segura"
   NEXTAUTH_URL="http://localhost:3000"
   NODE_ENV="development"
   PORT=3000
   ```

4. **Configurar la base de datos**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

5. **Cargar datos de prueba** (opcional)
   ```bash
   node scripts/seedFullYearData.js
   ```

6. **Iniciar el servidor**
   ```bash
   # Desarrollo
   npm run dev

   # Producción (puerto 3005)
   PORT=3005 npm run start:prod

   # Con PM2
   pm2 start ecosystem.config.js --env production
   ```

## 📁 Estructura del Proyecto

```
├── .next/                # Build de producción (generado)
├── components/           # Componentes React reutilizables
│   ├── docs/            # Componentes de documentación
│   ├── theme/           # Tema y estilos globales
│   └── ProtectedRoute.js # Protección de rutas
├── contexts/            # Context API de React
│   └── AuthContext.js   # Contexto de autenticación
├── lib/                 # Utilidades y configuraciones
│   ├── docs/           # Contenido de documentación
│   └── prisma.js       # Cliente Prisma singleton
├── pages/              # Pages Router (Frontend)
│   ├── api/            # API Routes (legacy)
│   ├── cubicles/       # Gestión de cubículos
│   ├── docs/           # Sistema de documentación
│   ├── statistics/     # Módulo de estadísticas
│   ├── turns/          # Gestión de turnos
│   ├── users/          # Gestión de usuarios
│   └── index.js        # Página principal
├── prisma/
│   ├── schema.prisma   # Esquema de base de datos
│   └── migrations/     # Migraciones de DB
├── public/             # Assets estáticos
├── scripts/            # Scripts de utilidad
├── src/app/api/        # App Router API (nuevo)
│   ├── attention/      # APIs de atención
│   ├── auth/           # APIs de autenticación
│   ├── cubicles/       # APIs de cubículos
│   ├── docs/           # APIs de documentación
│   ├── profile/        # APIs de perfil
│   ├── statistics/     # APIs de estadísticas
│   ├── turns/          # APIs de turnos
│   └── users/          # APIs de usuarios
├── tests/              # Tests unitarios y E2E
├── .env.production     # Variables de entorno
├── ecosystem.config.js # Configuración PM2
├── package.json        # Dependencias
└── next.config.js      # Configuración Next.js
```

## 📊 Datos de Prueba

El sistema incluye scripts para generar datos realistas:

- **26,539 pacientes** en 2024
- **262 días hábiles** con 80-120 pacientes/día
- **Variación estacional** realista
- **14 flebotomistas** y múltiples cubículos
- **Tiempos de atención** variables (5-25 min)

```bash
# Generar datos del año completo
node scripts/seedFullYearData.js

# Probar estadísticas
node scripts/testStatistics.js
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo (puerto 3000)
PORT=3005 npm run dev    # Puerto personalizado

# Producción
npm run build:prod       # Build optimizado de producción
npm run start:prod       # Iniciar servidor de producción
pm2 start ecosystem.config.js  # Iniciar con PM2

# Base de Datos
npx prisma generate      # Regenerar cliente Prisma
npx prisma migrate dev   # Crear/aplicar migraciones (dev)
npx prisma migrate deploy # Aplicar migraciones (prod)
npx prisma studio        # Interfaz gráfica de BD
npx prisma db seed       # Cargar datos de prueba

# Calidad
npm run lint             # Ejecutar ESLint
npm test                 # Ejecutar tests

# PM2 (Producción)
pm2 status               # Ver estado de procesos
pm2 logs toma-turno      # Ver logs
pm2 monit                # Monitor en tiempo real
pm2 restart toma-turno   # Reiniciar aplicación
```

## 📈 Características del Sistema de Estadísticas

### Reportes PDF Profesionales
- **Cover Page**: Logo, título, fecha de generación
- **Análisis Detallado**: Tablas, gráficos y métricas
- **Recomendaciones**: Sugerencias basadas en datos
- **Metadatos**: Usuario, fecha, período analizado

### APIs Optimizadas
- **Filtros avanzados** por fecha, flebotomista, etc.
- **Consultas eficientes** con Prisma
- **Manejo de errores** robusto
- **Logs detallados** para debugging

### Interfaz Moderna
- **Diseño responsivo** con TailwindCSS
- **Componentes interactivos** para análisis
- **Loading states** y feedback visual
- **Navegación intuitiva** entre módulos

## 🔐 Seguridad

- **Autenticación JWT** con expiración
- **Protección de rutas** por rol
- **Validación de entrada** en APIs
- **Sanitización** de datos de usuario
- **Variables de entorno** para credenciales

## 📝 Contribuir

1. Fork el proyecto
2. Crear una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit los cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🤝 Contacto

**Desarrollado por**: Samuel Quiroz
**Email**: saqh5037@gmail.com
**GitHub**: [@saqh5037](https://github.com/saqh5037)

---

⭐ Si este proyecto te ayuda, ¡dale una estrella en GitHub!
