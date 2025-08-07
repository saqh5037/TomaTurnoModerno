# TomaTurnoModerno 🏥

Sistema moderno de gestión de turnos médicos con estadísticas avanzadas y reportes PDF profesionales.

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

- **Framework**: Next.js 14 (Pages Router)
- **Base de datos**: PostgreSQL con Prisma ORM
- **Estilos**: TailwindCSS
- **PDF**: jsPDF con diseño personalizado
- **Autenticación**: JWT con contexto React
- **Iconos**: Lucide React
- **Fechas**: date-fns

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+
- PostgreSQL
- npm o yarn

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
   NEXTAUTH_SECRET="tu-clave-secreta"
   NEXTAUTH_URL="http://localhost:3000"
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
   npm run dev
   ```

## 📁 Estructura del Proyecto

```
├── components/          # Componentes reutilizables
│   ├── ProtectedRoute.js # Protección de rutas
│   └── theme/           # Componentes de tema
├── context/             # Contextos de React
│   └── AuthContext.js   # Contexto de autenticación
├── pages/               # Páginas de Next.js
│   ├── statistics/      # Módulo de estadísticas
│   ├── turns/          # Gestión de turnos
│   └── users/          # Gestión de usuarios
├── prisma/             # Esquema y migraciones
├── scripts/            # Scripts de utilidad y datos
├── src/app/api/        # API Routes de Next.js
└── styles/             # Estilos globales
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
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linting con ESLint
npm run prisma:studio # Interfaz gráfica de BD
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
