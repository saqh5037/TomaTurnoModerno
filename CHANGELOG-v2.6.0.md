# Changelog v2.6.0 - 29 de Septiembre de 2025

## 🎯 Resumen Ejecutivo
Esta versión incluye correcciones de bugs reportados por QA y mejoras en la claridad de la interfaz de usuario, específicamente en la gestión de usuarios y el flujo de atención de pacientes.

---

## 🐛 Correcciones de Bugs

### 1. **Fix: Error de Next.js 15 con parámetros dinámicos**
- **Archivo afectado**: `src/app/api/users/[id]/route.js`, `src/app/api/users/[id]/status/route.js`, `src/app/api/users/[id]/reset-password/route.js`
- **Problema**: Error "Route used `params.id`. `params` should be awaited before using its properties"
- **Solución**: Agregado `await` a todos los destructurings de `params` en rutas dinámicas
- **Impacto**: Elimina errores de sintaxis en Next.js 15 que causaban recargas completas de página

```javascript
// ❌ Antes
const { id } = params;

// ✅ Después
const { id } = await params;
```

---

## ✨ Mejoras de UX/UI

### 2. **Mejora: Filtrado de cubículos inactivos en selección**
- **Archivo afectado**: `pages/select-cubicle.js`
- **Cambios**:
  - La API ahora solicita solo cubículos activos con parámetro `?activeOnly=true`
  - Validación frontend para evitar selección de cubículos inactivos
  - Opciones de cubículos inactivos se muestran deshabilitadas y en gris si aparecen
  - Mensaje informativo cuando no hay cubículos activos disponibles
  - Botón de confirmación se deshabilita si no hay cubículos disponibles
- **Beneficio**: Previene errores al intentar usar cubículos fuera de servicio

### 3. **Mejora: Clarificación terminológica en gestión de usuarios**
- **Archivos afectados**: `pages/users/index.js`, `src/app/api/users/route.js`

#### Cambios en nomenclatura:
| Antes | Después | Significado |
|-------|---------|-------------|
| "Eliminados (Bloqueados)" | "Eliminados" | Usuarios con status BLOCKED |
| "Cuenta Bloqueada" | "Bloqueada por seguridad" | Bloqueo temporal por 5 intentos fallidos |
| "Mostrar eliminados" | "Incluir eliminados" | Toggle más claro |

#### Cambios en badges de estado:
- **Eliminado**: Badge rojo (status = BLOCKED)
- **Bloqueada por seguridad**: Badge naranja con icono ⚠️ (isLocked = true)
- **Inactivo**: Badge gris
- **Activo**: Badge verde

#### Dashboard de estadísticas mejorado:
- Cambio de 7 a **8 tarjetas**
- Nueva tarjeta: **"Bloq. Seguridad"** para usuarios temporalmente bloqueados
- Renombrado: "Bloqueados" → **"Eliminados"**
- Contador `stats.locked` agregado al backend

#### Modal de eliminación mejorado:
- Lista de viñetas explicando las consecuencias
- Tip destacado sobre cuándo usar "Inactivo" vs "Eliminar"
- Botón renombrado de "Eliminar (Bloquear)" a "Eliminar Usuario"

### 4. **Mejora: Simplificación del flujo de atención de pacientes**
- **Archivo afectado**: `pages/turns/attention.js`
- **Cambios**:
  - ❌ Eliminado botón "Paciente atendido" de la barra inferior
  - ❌ Eliminado botón "Emergencia" de la barra inferior
  - ✅ Mantenido solo botón "Saltar al siguiente"
- **Razón**: Los botones duplicados en la tarjeta del paciente ya proveen esta funcionalidad
- **Beneficio**: Interfaz más limpia y menos confusa para el usuario

### 5. **Actualización: Documentación del proyecto**
- **Archivo afectado**: `CLAUDE.md`
- **Cambios**:
  - Actualizada versión a v2.6.0
  - Actualizada fecha a 29 de septiembre de 2025
  - Mejorada documentación de modelos de base de datos
  - Agregados detalles de enums (UserStatus, CubicleType)
  - Expandida sección de seguridad con implementación específica
  - Mejorada estructura del proyecto con subdirectorios
  - Actualizado patrón de audit logging con ejemplos

---

## 📊 Estadísticas de Cambios

- **Archivos modificados**: 10
- **Líneas agregadas**: ~150
- **Líneas eliminadas**: ~80
- **Bugs corregidos**: 2 críticos
- **Mejoras de UX**: 4

---

## 🔧 Archivos Modificados

### Backend (API Routes)
1. `src/app/api/users/route.js` - Agregado contador de usuarios locked
2. `src/app/api/users/[id]/route.js` - Fix async params (4 métodos)
3. `src/app/api/users/[id]/status/route.js` - Fix async params
4. `src/app/api/users/[id]/reset-password/route.js` - Fix async params

### Frontend (Pages)
5. `pages/select-cubicle.js` - Filtrado de cubículos activos
6. `pages/users/index.js` - Mejoras terminológicas y dashboard
7. `pages/turns/attention.js` - Simplificación de botones

### Documentación
8. `CLAUDE.md` - Actualización completa
9. `package-lock.json` - Actualización automática de dependencias

---

## 🚀 Instrucciones de Despliegue para DevOps

### Pre-requisitos
- Node.js 18.17.0+
- PostgreSQL 14+
- PM2 instalado

### Pasos de Despliegue

#### 1. Backup de Base de Datos
```bash
pg_dump -U labsis -d toma_turno > backup_pre_v2.6.0_$(date +%Y%m%d_%H%M%S).sql
```

#### 2. Detener Servicio Actual
```bash
pm2 stop toma-turno
```

#### 3. Actualizar Código
```bash
cd /ruta/al/proyecto
git fetch origin
git checkout main
git pull origin main
```

#### 4. Instalar Dependencias
```bash
npm install
```

#### 5. Verificar Variables de Entorno
Asegurar que `.env.production` contenga:
```env
DATABASE_URL="postgresql://labsis:labsis@localhost:5432/toma_turno?schema=public"
NEXTAUTH_SECRET="[CLAVE_SEGURA]"
NEXTAUTH_URL="http://localhost:3005"
NODE_ENV="production"
PORT=3005
```

#### 6. Regenerar Prisma Client
```bash
DATABASE_URL="postgresql://labsis:labsis@localhost:5432/toma_turno?schema=public" npx prisma generate
```

#### 7. Build de Producción
```bash
npm run build:prod
```

#### 8. Reiniciar Servicio
```bash
pm2 restart toma-turno
pm2 save
```

#### 9. Verificar Logs
```bash
pm2 logs toma-turno --lines 50
```

#### 10. Pruebas Post-Despliegue
- ✅ Verificar login funciona correctamente
- ✅ Verificar selección de cubículos solo muestra activos
- ✅ Verificar página de usuarios carga sin errores
- ✅ Verificar dashboard muestra 8 tarjetas de estadísticas
- ✅ Verificar panel de atención muestra solo botón "Saltar al siguiente"

### Rollback (Si es necesario)
```bash
pm2 stop toma-turno
git checkout v2.5.0-prod250925  # Versión anterior
npm install
npm run build:prod
pm2 restart toma-turno
```

---

## ⚠️ Notas Importantes

1. **NO requiere migraciones de base de datos** - Solo cambios en código
2. **Compatibilidad**: 100% compatible con datos existentes
3. **Tiempo estimado de despliegue**: 5-10 minutos
4. **Downtime esperado**: < 30 segundos
5. **Testing recomendado**: Ambiente de staging antes de producción

---

## 🔍 Verificación de QA Post-Despliegue

### Checklist de Pruebas

#### Selección de Cubículos
- [ ] Solo se muestran cubículos con estado ACTIVE
- [ ] No se puede seleccionar cubículos inactivos
- [ ] Mensaje claro cuando no hay cubículos disponibles

#### Gestión de Usuarios
- [ ] Dashboard muestra 8 tarjetas correctamente
- [ ] "Eliminados" muestra usuarios con status BLOCKED
- [ ] "Bloq. Seguridad" muestra usuarios con isLocked = true
- [ ] Badges muestran terminología correcta
- [ ] Modal de eliminación muestra información clara

#### Panel de Atención
- [ ] Solo aparece botón "Saltar al siguiente" en barra inferior
- [ ] Botones en tarjeta de paciente funcionan correctamente
- [ ] No hay errores en consola del navegador

---

## 📞 Contacto y Soporte

**Desarrollador**: Samuel Quiroz
**Email**: saqh5037@gmail.com
**Fecha de Release**: 29 de Septiembre de 2025
**Versión**: v2.6.0

---

## 📝 Notas Adicionales para el Equipo

### Mejoras Futuras Sugeridas (No incluidas en esta versión)
- Implementar validación con Zod en todos los endpoints
- Agregar tests unitarios para flujos críticos
- Implementar paginación en listado de usuarios
- Documentación OpenAPI/Swagger de APIs

### Deuda Técnica Conocida
- Cobertura de tests < 20%
- Migración incompleta a TypeScript
- Algunas consultas sin paginación en datasets grandes

---

**🎉 Release preparado y listo para despliegue**