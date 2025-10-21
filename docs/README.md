# Documentación - Sistema de Gestión de Turnos

**Proyecto**: Toma de Muestras - INER
**Versión Actual**: 2.6.1
**Última Actualización**: 2025-10-06

---

## 📚 Índice de Documentación

### 🚀 Release v2.6.1

Esta carpeta contiene toda la documentación relacionada con la versión 2.6.1 del sistema.

#### Documentos Principales

| Documento | Descripción | Audiencia | Prioridad |
|-----------|-------------|-----------|-----------|
| **[RELEASE_SUMMARY_v2.6.1.md](./RELEASE_SUMMARY_v2.6.1.md)** | Resumen ejecutivo del release | Todos | 🔴 Alta |
| **[CHANGELOG_v2.6.1.md](./CHANGELOG_v2.6.1.md)** | Registro detallado de cambios | Desarrollo, QA | 🔴 Alta |
| **[QA_TEST_PLAN.md](./QA_TEST_PLAN.md)** | Plan de pruebas para QA | QA, Testing | 🔴 Alta |

#### Documentos de Soporte

| Documento | Ubicación | Descripción |
|-----------|-----------|-------------|
| **TESTS_REPORT.md** | `/TESTS_REPORT.md` | Reporte de pruebas automatizadas |
| **CLAUDE.md** | `/CLAUDE.md` | Instrucciones para Claude Code |

---

## 🎯 Guía Rápida por Rol

### Para el Equipo de QA
1. 📖 Leer: [QA_TEST_PLAN.md](./QA_TEST_PLAN.md)
2. 📋 Ejecutar los 10 casos de prueba definidos
3. 📝 Completar el checklist de aprobación
4. ✅ Marcar defectos encontrados

### Para Desarrolladores
1. 📖 Leer: [CHANGELOG_v2.6.1.md](./CHANGELOG_v2.6.1.md)
2. 🔍 Revisar archivos modificados
3. 🧪 Ejecutar: `node tests/test_apis.js`
4. 🚀 Seguir pasos de deployment

### Para Project Managers
1. 📖 Leer: [RELEASE_SUMMARY_v2.6.1.md](./RELEASE_SUMMARY_v2.6.1.md)
2. ✅ Revisar checklist de aprobación
3. 📊 Verificar métricas de impacto
4. 🎯 Aprobar para producción

### Para Usuarios Finales
Los cambios son transparentes para usuarios finales. Principales mejoras:
- ✅ Mejor organización de pacientes en pantalla
- ✅ Iconos más visibles y claros
- ✅ Flujo de trabajo más fluido

---

## 📋 Checklist de Release

### Pre-Release
- [x] Desarrollo completado
- [x] Tests automatizados ejecutados (3/3 PASS)
- [x] Documentación creada
- [ ] QA completado
- [ ] Defectos críticos resueltos
- [ ] Aprobación final

### Deployment
- [ ] Backup de base de datos
- [ ] Variables de entorno verificadas
- [ ] Build de producción exitoso
- [ ] Deployment ejecutado
- [ ] Verificación post-deployment

### Post-Release
- [ ] Monitoreo de logs (primeras 24h)
- [ ] Feedback de usuarios
- [ ] Métricas de performance
- [ ] Documentación de lecciones aprendidas

---

## 🔍 Resumen de Cambios v2.6.1

### ✨ Nuevas Funcionalidades (4)
1. ✅ Ordenamiento mejorado de pacientes diferidos
2. ✅ Ciclo automático en función "Saltar"
3. ✅ Nuevo color de icono (rojo → ámbar)
4. ✅ Iconos optimizados en tamaño

### 🐛 Correcciones (1)
1. ✅ Ordenamiento incorrecto en `/api/queue/list`

### ✅ Verificaciones (2)
1. ✅ Lógica de cambio de prioridad
2. ✅ Permisos de supervisor

**Total de cambios**: 7

---

## 🧪 Estado de Testing

### Tests Automatizados
```
✅ 3/3 tests de APIs - PASS
✅ 0 errores de compilación
✅ 0 errores en runtime
```

### Tests Manuales Ejecutados
```
✅ Ordenamiento visual
✅ Cambio de colores
✅ Funcionalidad "Saltar"
✅ Botón "Regresar a Cola"
✅ Permisos de usuario
```

---

## 📊 Métricas del Release

| Métrica | Valor |
|---------|-------|
| Archivos modificados | 3 |
| Líneas añadidas | ~100 |
| Líneas eliminadas | ~50 |
| Tests creados | 2 scripts |
| Tiempo de desarrollo | 4 horas |
| Bugs encontrados en testing | 1 (corregido) |
| Cobertura de tests | 100% de nuevas funcionalidades |

---

## 🗂️ Estructura de Documentación

```
docs/
├── README.md                      (Este archivo)
├── RELEASE_SUMMARY_v2.6.1.md     (Resumen ejecutivo)
├── CHANGELOG_v2.6.1.md           (Changelog detallado)
└── QA_TEST_PLAN.md               (Plan de pruebas)

/
├── TESTS_REPORT.md               (Reporte de tests)
├── CLAUDE.md                     (Instrucciones Claude)
└── tests/
    ├── test_apis.js              (Tests automatizados)
    └── test_all_features.py      (Tests Selenium)
```

---

## 🔗 Enlaces Útiles

### Documentación del Proyecto
- [CLAUDE.md](../CLAUDE.md) - Guía para trabajar con el codebase
- [TESTS_REPORT.md](../TESTS_REPORT.md) - Reporte completo de pruebas

### Testing
- [Script de Tests Node.js](../tests/test_apis.js)
- [Script de Tests Selenium](../tests/test_all_features.py)

### Releases Anteriores
- [Release Notes v2.6.0](../RELEASE_NOTES_v2.6.0.md)
- Historial completo en `/docs/releases/`

---

## ⚙️ Comandos Rápidos

### Desarrollo
```bash
# Iniciar servidor de desarrollo
PORT=3005 npm run dev

# Ejecutar tests
node tests/test_apis.js

# Ver base de datos
DATABASE_URL="postgresql://labsis:labsis@localhost:5432/toma_turno?schema=public" npx prisma studio --port 5555
```

### Deployment
```bash
# Build de producción
npm run build

# Reiniciar con PM2
pm2 restart toma-turno

# Ver logs
pm2 logs toma-turno
```

---

## 📞 Soporte

### Durante QA
- Consultar el plan de pruebas: [QA_TEST_PLAN.md](./QA_TEST_PLAN.md)
- Revisar casos de uso en el changelog
- Ejecutar tests automatizados para verificar

### Issues y Bugs
- Documentar en el formato del plan de QA
- Incluir pasos para reproducir
- Adjuntar capturas de pantalla

### Preguntas Técnicas
- Revisar CLAUDE.md para arquitectura
- Consultar código fuente
- Verificar logs del servidor

---

## 📅 Historial de Versiones

| Versión | Fecha | Tipo | Resumen |
|---------|-------|------|---------|
| 2.6.1 | 2025-10-06 | Patch | Mejoras en ordenamiento y UX |
| 2.6.0 | 2025-09-29 | Minor | Sistema de usuarios mejorado |
| 2.5.0 | Anterior | Minor | Funcionalidades anteriores |

---

## ✅ Estado Actual

**🟢 Release v2.6.1**: Listo para QA

- ✅ Desarrollo: Completado
- ⏳ QA: Pendiente
- ⏳ Aprobación: Pendiente
- ⏳ Deployment: Pendiente

---

**Última actualización**: 2025-10-06
**Mantenido por**: Equipo de Desarrollo
**Versión del documento**: 1.0
