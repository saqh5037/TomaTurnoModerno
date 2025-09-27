# Release Notes - v2.6.0
**Fecha de Release**: 27 de Septiembre de 2025
**Tipo de Release**: Minor Release - Nuevas Funcionalidades
**Estado**: Listo para Producción

## 📝 Resumen Ejecutivo

La versión 2.6.0 introduce un sistema mejorado de gestión de usuarios con estados diferenciados (ACTIVE/INACTIVE/BLOCKED), permitiendo una mejor administración de usuarios eliminados y proporcionando opciones de restauración. Esta actualización resuelve el requerimiento de poder "eliminar" usuarios sin perder su historial, marcándolos como BLOQUEADOS y ocultándolos del listado principal.

## 🚀 Cambios Principales

### 1. Sistema de Estados de Usuario

#### Nuevo Campo en Base de Datos
- Agregado campo `status` al modelo `User` con enum `UserStatus`
- Tres estados posibles:
  - `ACTIVE`: Usuario activo y operativo
  - `INACTIVE`: Usuario temporalmente desactivado
  - `BLOCKED`: Usuario eliminado/bloqueado permanentemente

#### Funcionalidad de Eliminación Mejorada
- Los usuarios "eliminados" ahora se marcan como `BLOCKED`
- No aparecen en el listado por defecto
- Se pueden visualizar activando el filtro "Mostrar eliminados"
- Posibilidad de restaurar usuarios bloqueados

### 2. Mejoras en la Interfaz de Usuario

#### Panel de Gestión de Usuarios
- **Nuevo filtro de estado**: Incluye opción "Eliminados (Bloqueados)"
- **Switch "Mostrar eliminados"**: Toggle para incluir/excluir usuarios bloqueados
- **Badges de estado mejorados**: Diferenciación visual clara entre estados
- **Estadística adicional**: Contador de usuarios bloqueados en dashboard

#### Acciones Diferenciadas
- **Switch de activación**: Para cambios temporales (ACTIVE ↔ INACTIVE)
- **Botón "Eliminar (Bloquear)"**: Para eliminación permanente (→ BLOCKED)
- **Botón "Restaurar Usuario"**: Disponible para usuarios bloqueados

### 3. Actualizaciones de API

#### GET /api/users
- Nuevo parámetro opcional `includeBlocked` (boolean)
- Por defecto excluye usuarios con status BLOCKED
- Estadísticas actualizadas incluyen contador de bloqueados

#### DELETE /api/users/[id]
- Ahora marca usuarios como BLOCKED en lugar de solo desactivar
- Mantiene integridad de datos históricos
- Cierra todas las sesiones activas del usuario

#### PATCH /api/users/[id]/status
- Sincroniza campo `status` con `isActive`
- ACTIVE cuando isActive = true
- INACTIVE cuando isActive = false

## 🗄️ Cambios en Base de Datos

### Migración Aplicada
```sql
ALTER TABLE "User" ADD COLUMN "status" "UserStatus" DEFAULT 'ACTIVE';
CREATE INDEX "User_status_idx" ON "User"("status");
```

### Valores por Defecto
- Usuarios existentes marcados como ACTIVE
- Nuevos usuarios creados con status ACTIVE

## 📋 Instrucciones de Deployment

### Pre-requisitos
1. Backup de base de datos antes de aplicar cambios
2. Notificar a usuarios sobre actualización del sistema
3. Verificar que no hay sesiones críticas activas

### Pasos de Deployment

1. **Detener servicios**:
```bash
pm2 stop toma-turno
```

2. **Actualizar código**:
```bash
git pull origin main
git checkout v2.6.0
```

3. **Instalar dependencias**:
```bash
npm install
```

4. **Aplicar migraciones de base de datos**:
```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." npx prisma generate
```

5. **Construir aplicación**:
```bash
npm run build:prod
```

6. **Reiniciar servicios**:
```bash
pm2 restart ecosystem.config.js --env production
```

7. **Verificación post-deployment**:
```bash
pm2 logs toma-turno
pm2 monit
```

## ⚠️ Consideraciones Importantes

### Para Administradores
- Los usuarios eliminados antes de esta versión permanecen con isActive = false
- Se recomienda revisar usuarios inactivos y decidir si deben ser marcados como BLOCKED
- El filtro "Mostrar eliminados" está desactivado por defecto

### Para Desarrolladores
- El campo `isActive` se mantiene por compatibilidad pero `status` es la fuente de verdad
- Todas las operaciones de eliminación ahora son soft-delete con status BLOCKED
- Las APIs mantienen retrocompatibilidad con sistemas existentes

## 🧪 Testing Recomendado

### Casos de Prueba Críticos
1. ✅ Eliminar un usuario y verificar que se marca como BLOCKED
2. ✅ Activar filtro "Mostrar eliminados" y verificar visibilidad
3. ✅ Restaurar un usuario bloqueado y verificar cambio de estado
4. ✅ Verificar que switch de activación sigue funcionando (ACTIVE ↔ INACTIVE)
5. ✅ Confirmar que usuarios bloqueados no pueden iniciar sesión

### Validaciones de Integridad
- Verificar que no se puede eliminar el último administrador activo
- Confirmar que no se puede auto-eliminar (usuario actual)
- Validar que sesiones de usuarios bloqueados se cierran automáticamente

## 📊 Métricas de Impacto

- **Tiempo de implementación**: 2 horas
- **Archivos modificados**: 7
- **Líneas de código agregadas**: ~250
- **Migraciones de DB**: 1
- **APIs actualizadas**: 3
- **Impacto en usuarios**: Mínimo (mejora de funcionalidad)

## 🔄 Rollback Plan

En caso de necesitar revertir:

1. Detener servicios: `pm2 stop toma-turno`
2. Revertir a versión anterior: `git checkout v2.5.0`
3. Revertir migración si es necesario (mantener campo no causa problemas)
4. Rebuild: `npm run build:prod`
5. Reiniciar: `pm2 restart ecosystem.config.js --env production`

## 📞 Soporte

Para cualquier problema durante el deployment:
- **Desarrollador Principal**: Samuel Quiroz
- **Email**: saqh5037@gmail.com
- **Documentación**: Ver CLAUDE.md para detalles técnicos

## ✅ Checklist Pre-Release

- [x] Código probado en desarrollo
- [x] Migraciones de DB aplicadas en desarrollo
- [x] Documentación actualizada (CHANGELOG.md, CLAUDE.md)
- [x] Version bump en package.json
- [x] Release notes creadas
- [ ] Backup de producción realizado
- [ ] Comunicación a usuarios enviada
- [ ] Plan de rollback validado

---

**Nota**: Esta versión es compatible con la infraestructura actual y no requiere cambios en configuración de servidor o variables de entorno.