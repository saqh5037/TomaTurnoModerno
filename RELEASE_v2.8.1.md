# Release v2.8.1 - TomaTurno INER

**Fecha:** 2026-01-09
**Autor:** Samuel Quiroz

---

## Resumen de Cambios

Esta versión incluye correcciones de bugs críticos y mejoras de UX en el sistema de atención.

### Bug Fixes

1. **Asignación automática de holding después de "Devolver a cola"**
   - **Problema:** Al devolver un paciente a la cola, el sistema no asignaba automáticamente el siguiente paciente. Solo funcionaba al refrescar la página.
   - **Solución:** Se agregó llamada a `assignHolding(true)` después de deferir un turno para asignar automáticamente el siguiente paciente en holding.
   - **Archivo:** `pages/turns/attention.js`

2. **Cubículos ocupados no se mostraban correctamente**
   - **Problema:** Cuando el flebotomista 3 se conectaba, solo veía el cubículo 1 como ocupado, no los demás cubículos ocupados.
   - **Solución:** Se modificó la query de `/api/cubicles/status` para buscar sesiones con `selectedCubicleId != null` en lugar de filtrar por `lastActivity >= 10 minutos`.
   - **Archivo:** `src/app/api/cubicles/status/route.js`

### Mejoras de UX

3. **Nombre de usuario en el header**
   - Ahora se muestra el nombre del usuario junto al rol en la pantalla principal.
   - **Archivo:** `pages/index.js`

4. **Botón de cerrar sesión más visible**
   - El botón de "Cerrar Sesión" ahora es rojo y más prominente en la pantalla principal.
   - Se agregó botón de "Salir" en el panel de atención.
   - **Archivos:** `pages/index.js`, `pages/turns/attention.js`

---

## Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `package.json` | Versión 2.8.0 → 2.8.1 |
| `pages/index.js` | Nombre de usuario en header + botón logout rojo |
| `pages/turns/attention.js` | Botón logout + fix asignación holding automática |
| `src/app/api/cubicles/status/route.js` | Fix detección de cubículos ocupados |

---

## Instrucciones de Deployment

### Pre-requisitos
- Node.js 18+
- Acceso SSH al servidor de producción
- Versión v2.8.0 ya instalada

### Paso 1: Pull del Código

```bash
cd /path/to/toma-turno
git fetch origin
git checkout v2.8.1
# O si es rama main:
git pull origin main
```

### Paso 2: Build

```bash
npm ci
npm run build:prod
```

### Paso 3: Reiniciar Servicio

```bash
# Con PM2
pm2 restart toma-turno

# O con systemd
sudo systemctl restart toma-turno
```

### Paso 4: Verificación

```bash
# Verificar que la API responde
curl -s http://localhost:3007/api/health | jq

# Verificar versión
curl -s http://localhost:3007/api/health | jq '.version'
```

---

## Rollback (En caso de problemas)

```bash
git checkout v2.8.0
npm ci
npm run build:prod
pm2 restart toma-turno
```

---

## Testing Realizado

- [x] Asignación automática de holding después de deferir turno
- [x] Visualización correcta de cubículos ocupados (probado con 3 flebotomistas)
- [x] Nombre de usuario visible en header
- [x] Botón de logout visible y funcional en pantalla principal
- [x] Botón de logout visible y funcional en panel de atención

---

## Contacto

- **Desarrollador**: Samuel Quiroz
- **Email**: saqh5037@gmail.com
- **Proyecto**: TomaTurno INER - DT Diagnósticos by Labsis
