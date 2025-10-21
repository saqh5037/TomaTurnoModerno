# Plan de Pruebas QA - Versión 2.6.1

**Versión del Sistema**: 2.6.1
**Fecha**: 2025-10-06
**Responsable QA**: [A completar]
**Ambiente de Pruebas**: http://localhost:3005
**Estado**: 📋 Pendiente de Ejecución

---

## 📌 Información General

### Objetivo de las Pruebas
Verificar que las 7 funcionalidades nuevas/modificadas funcionan correctamente sin introducir regresiones en el sistema existente.

### Alcance
- ✅ Pruebas funcionales de nuevas características
- ✅ Pruebas de regresión en módulos afectados
- ✅ Pruebas visuales de cambios de UI
- ✅ Verificación de permisos y roles
- ❌ Pruebas de performance (fuera de alcance)
- ❌ Pruebas de seguridad (fuera de alcance)

### Pre-requisitos
- [ ] Sistema corriendo en http://localhost:3005
- [ ] Base de datos con datos de prueba
- [ ] Usuarios de prueba con diferentes roles:
  - Flebotomista (username: `flebo1`, password: `admin123`)
  - Supervisor (username: `admin`, password: `admin123`)
- [ ] Navegador Chrome/Firefox/Safari actualizado
- [ ] Al menos 5 pacientes en estado "Pending"
- [ ] Al menos 2 pacientes "Especiales" y 2 "Normales"

---

## 🧪 Casos de Prueba

### TC-001: Ordenamiento de Pacientes en Cola Pública

**Prioridad**: 🔴 Alta
**Módulo**: `/turns/queue`
**Tipo**: Funcional

#### Pre-condiciones
1. Crear pacientes con los siguientes datos:
   - Paciente A: Normal, NO diferido, Turno #100
   - Paciente B: Especial, NO diferido, Turno #101
   - Paciente C: Normal, diferido (callCount > 0), Turno #102
   - Paciente D: Especial, diferido (callCount > 0), Turno #103
   - Paciente E: Normal, NO diferido, Turno #104

#### Pasos
1. Navegar a http://localhost:3005/turns/queue
2. Observar el orden de los pacientes en la lista "Pacientes en Espera"

#### Resultado Esperado
El orden debe ser:
1. Paciente B (Especial, NO diferido) #101
2. Paciente D (Especial, diferido) #103
3. Paciente A (Normal, NO diferido) #100
4. Paciente E (Normal, NO diferido) #104
5. Paciente C (Normal, diferido) #102

#### Criterios de Aceptación
- ✅ Los pacientes especiales aparecen primero
- ✅ Los pacientes especiales diferidos aparecen después de los especiales normales
- ✅ Los pacientes normales aparecen después de todos los especiales
- ✅ Los pacientes normales diferidos aparecen al final

#### Resultado Actual: [ ] PASS [ ] FAIL
**Comentarios**: _____________________________________________

---

### TC-002: Color del Icono de Reloj de Arena

**Prioridad**: 🟡 Media
**Módulo**: `/turns/queue`, `/turns/attention`
**Tipo**: Visual

#### Pre-condiciones
1. Tener al menos 1 paciente diferido (con `isDeferred = true`)

#### Pasos - Parte A (Cola Pública)
1. Navegar a http://localhost:3005/turns/queue
2. Localizar un paciente diferido en la lista
3. Observar el icono de reloj de arena al lado del número de turno

#### Resultado Esperado - Parte A
- El icono de reloj de arena debe ser de color **ámbar/naranja** (#f59e0b)
- El icono NO debe ser rojo

#### Pasos - Parte B (Pantalla de Atención)
1. Login como flebotomista
2. Navegar a http://localhost:3005/turns/attention
3. En el sidebar derecho, buscar la sección "Pacientes en Espera"
4. Localizar un paciente diferido
5. Observar el icono de reloj de arena

#### Resultado Esperado - Parte B
- El icono de reloj de arena debe ser de color **ámbar/naranja** (#f59e0b)
- El icono NO debe ser rojo

#### Criterios de Aceptación
- ✅ El color es consistente en ambas pantallas
- ✅ El color es claramente diferente al rojo
- ✅ El icono es visible y distinguible

#### Resultado Actual: [ ] PASS [ ] FAIL
**Comentarios**: _____________________________________________

---

### TC-003: Funcionalidad "Saltar" con Retorno Automático

**Prioridad**: 🟡 Media
**Módulo**: `/turns/attention`
**Tipo**: Funcional

#### Pre-condiciones
1. Login como flebotomista
2. Tener exactamente 3 pacientes en estado "Pending"
3. No tener pacientes en estado "In Progress"

#### Pasos
1. Navegar a http://localhost:3005/turns/attention
2. Observar que aparece el primer paciente en la tarjeta principal
3. Hacer clic en el botón "Saltar" (ícono de flecha hacia adelante)
4. Observar que aparece el segundo paciente
5. Hacer clic nuevamente en "Saltar"
6. Observar que aparece el tercer paciente
7. Hacer clic nuevamente en "Saltar"
8. **PASO CRÍTICO**: Observar qué sucede

#### Resultado Esperado
- Después de saltar el tercer paciente, el sistema debe mostrar automáticamente el **primer paciente** nuevamente
- Debe aparecer un toast/notificación que diga: "Ciclo completado - Volviendo al primer paciente"
- El sistema NO debe quedar sin pacientes visibles

#### Criterios de Aceptación
- ✅ El ciclo funciona correctamente
- ✅ Aparece la notificación informativa
- ✅ No se requiere recargar la página
- ✅ El flujo es fluido sin errores

#### Resultado Actual: [ ] PASS [ ] FAIL
**Comentarios**: _____________________________________________

---

### TC-004: Botón "Regresar a Cola" - Funcionalidad

**Prioridad**: 🔴 Alta
**Módulo**: `/turns/attention`
**Tipo**: Funcional

#### Pre-condiciones
1. Login como flebotomista
2. Tener al menos 1 paciente en estado "Pending"

#### Pasos
1. Navegar a http://localhost:3005/turns/attention
2. Llamar a un paciente haciendo clic en "Llamar Paciente"
3. Esperar a que el paciente aparezca en la sección "Paciente Activo"
4. **Observar** que aparece el botón "Regresar a Cola" (con icono de reloj de arena)
5. Hacer clic en el botón "Regresar a Cola"
6. Verificar que aparece un modal de confirmación con el mensaje: "¿Estás seguro que deseas regresar este paciente a la cola?"
7. Hacer clic en "Aceptar"
8. Observar los cambios en la interfaz

#### Resultado Esperado
- El paciente desaparece de "Paciente Activo"
- El paciente reaparece en la lista de "Pacientes en Espera"
- El paciente tiene un icono de reloj de arena (ámbar) indicando que es diferido
- El paciente mantiene su tipo (Especial o Normal)
- Si es **Normal**, aparece al **final** de la lista
- Si es **Especial**, aparece al **final del grupo de especiales** (pero antes de los normales)

#### Criterios de Aceptación
- ✅ El botón es visible y funcional
- ✅ El modal de confirmación aparece
- ✅ El paciente cambia correctamente de estado
- ✅ El ordenamiento es correcto según el tipo
- ✅ El icono de diferido aparece correctamente

#### Resultado Actual: [ ] PASS [ ] FAIL
**Comentarios**: _____________________________________________

---

### TC-005: Cambio de Prioridad - Lógica del Botón

**Prioridad**: 🔴 Alta
**Módulo**: `/turns/attention`
**Tipo**: Funcional

#### Pre-condiciones
1. Login como **supervisor** (usuario: `admin`)
2. Tener al menos 2 pacientes: uno Especial y uno Normal

#### Pasos - Parte A (Paciente Normal → Especial)
1. Navegar a http://localhost:3005/turns/attention
2. Llamar a un paciente **Normal**
3. Esperar a que aparezca en "Paciente Activo"
4. **Observar** el botón de cambio de prioridad
5. Verificar que el botón dice: "Cambiar a Especial"
6. Verificar que el icono del botón es un ícono de silla de ruedas
7. Hacer clic en el botón
8. Verificar el modal de confirmación

#### Resultado Esperado - Parte A
- Botón muestra: "Cambiar a Especial"
- Icono: Silla de ruedas (FaWheelchair)
- Color del botón: Naranja/Amber
- Modal muestra:
  - Prioridad actual: GENERAL
  - Nueva prioridad: ESPECIAL

#### Pasos - Parte B (Paciente Especial → Normal)
1. Finalizar la atención del paciente anterior
2. Llamar a un paciente **Especial**
3. Esperar a que aparezca en "Paciente Activo"
4. **Observar** el botón de cambio de prioridad
5. Verificar que el botón dice: "Cambiar a General"
6. Verificar que el icono del botón es un ícono de usuario
7. Hacer clic en el botón
8. Verificar el modal de confirmación

#### Resultado Esperado - Parte B
- Botón muestra: "Cambiar a General"
- Icono: Usuario (FaUser)
- Color del botón: Azul/Indigo
- Modal muestra:
  - Prioridad actual: ESPECIAL
  - Nueva prioridad: GENERAL

#### Criterios de Aceptación
- ✅ El texto del botón es correcto según el estado actual
- ✅ El icono es correcto según la acción a realizar
- ✅ El color del botón es apropiado
- ✅ El modal muestra información correcta

#### Resultado Actual: [ ] PASS [ ] FAIL
**Comentarios**: _____________________________________________

---

### TC-006: Cambio de Prioridad - Permisos de Supervisor

**Prioridad**: 🔴 Alta
**Módulo**: `/turns/attention`
**Tipo**: Seguridad/Permisos

#### Pre-condiciones
1. Tener usuarios de prueba:
   - Flebotomista: `flebo1` / `admin123`
   - Supervisor: `admin` / `admin123`

#### Pasos - Parte A (Flebotomista)
1. **Logout** si hay sesión activa
2. Login como **flebotomista** (`flebo1`)
3. Navegar a http://localhost:3005/turns/attention
4. Llamar a cualquier paciente
5. Esperar a que aparezca en "Paciente Activo"
6. **Buscar** el botón "Cambiar a Especial" o "Cambiar a General"

#### Resultado Esperado - Parte A
- El botón de cambio de prioridad **NO debe ser visible**
- Solo deben aparecer los botones:
  - Llamar Paciente / Repetir Llamado
  - Regresar a Cola
  - (Finalizar Toma - solo si es supervisor)

#### Pasos - Parte B (Supervisor)
1. **Logout**
2. Login como **supervisor** (`admin`)
3. Navegar a http://localhost:3005/turns/attention
4. Llamar a cualquier paciente
5. Esperar a que aparezca en "Paciente Activo"
6. **Buscar** el botón "Cambiar a Especial" o "Cambiar a General"

#### Resultado Esperado - Parte B
- El botón de cambio de prioridad **SÍ debe ser visible**
- El botón debe estar funcional

#### Criterios de Aceptación
- ✅ Flebotomistas NO ven el botón
- ✅ Supervisores SÍ ven el botón
- ✅ No hay errores de consola
- ✅ El control de acceso funciona correctamente

#### Resultado Actual: [ ] PASS [ ] FAIL
**Comentarios**: _____________________________________________

---

### TC-007: Tamaño de Iconos de Cambio de Prioridad

**Prioridad**: 🟢 Baja
**Módulo**: `/turns/attention`
**Tipo**: Visual

#### Pre-condiciones
1. Login como supervisor
2. Tener al menos 1 paciente en cola

#### Pasos
1. Navegar a http://localhost:3005/turns/attention
2. Llamar a un paciente
3. Localizar el botón de cambio de prioridad
4. **Observar** el tamaño de los iconos en el botón:
   - Icono izquierdo (FaUser o FaWheelchair)
   - Icono derecho (FaExchangeAlt - flechas de intercambio)

#### Resultado Esperado
- Los iconos deben tener un tamaño **moderado/pequeño** (16px y 14px)
- Los iconos NO deben ser excesivamente grandes
- Los iconos deben verse proporcionados con el texto del botón
- El botón debe verse profesional y no intrusivo

#### Criterios de Aceptación
- ✅ Los iconos no son demasiado grandes
- ✅ La proporción es visualmente agradable
- ✅ El botón mantiene un aspecto profesional

#### Resultado Actual: [ ] PASS [ ] FAIL
**Comentarios**: _____________________________________________

---

## 🔄 Pruebas de Regresión

### RT-001: Funcionalidad de Llamar Paciente

**Descripción**: Verificar que la función básica de llamar pacientes sigue funcionando.

#### Pasos
1. Login como flebotomista
2. Navegar a `/turns/attention`
3. Hacer clic en "Llamar Paciente"
4. Verificar que el paciente pasa a "In Progress"
5. Verificar que aparece en la pantalla de cola pública con su cubículo

#### Resultado Esperado
- ✅ El paciente se marca como llamado
- ✅ Aparece en la sección correcta
- ✅ Se muestra en la pantalla pública

#### Resultado Actual: [ ] PASS [ ] FAIL

---

### RT-002: Finalizar Atención

**Descripción**: Verificar que finalizar atención funciona correctamente.

#### Pasos
1. Login como supervisor
2. Llamar a un paciente
3. Hacer clic en "Finalizar Toma"
4. Confirmar en el modal
5. Verificar que el paciente desaparece de la vista

#### Resultado Esperado
- ✅ El paciente cambia a estado "Completed"
- ✅ El paciente desaparece de las listas activas
- ✅ Se registra en estadísticas

#### Resultado Actual: [ ] PASS [ ] FAIL

---

### RT-003: Asignación Automática de Sugerencias

**Descripción**: Verificar que el sistema de sugerencias inteligentes sigue funcionando.

#### Pasos
1. Tener múltiples flebotomistas en sesiones activas
2. Tener pacientes pendientes
3. Esperar 15 segundos
4. Verificar en cada sesión qué paciente se sugiere

#### Resultado Esperado
- ✅ Cada flebotomista ve un paciente diferente sugerido
- ✅ El badge "TU TURNO" aparece solo en el sugerido
- ✅ El fondo verde destaca el paciente sugerido

#### Resultado Actual: [ ] PASS [ ] FAIL

---

## 📱 Pruebas de Compatibilidad

### Navegadores
| Navegador | Versión | Estado | Comentarios |
|-----------|---------|--------|-------------|
| Chrome | Última | [ ] PASS [ ] FAIL | |
| Firefox | Última | [ ] PASS [ ] FAIL | |
| Safari | Última | [ ] PASS [ ] FAIL | |
| Edge | Última | [ ] PASS [ ] FAIL | |

### Dispositivos
| Dispositivo | Resolución | Estado | Comentarios |
|-------------|------------|--------|-------------|
| Desktop | 1920x1080 | [ ] PASS [ ] FAIL | |
| Laptop | 1366x768 | [ ] PASS [ ] FAIL | |
| Tablet | 768x1024 | [ ] PASS [ ] FAIL | |
| Mobile | 375x812 | [ ] PASS [ ] FAIL | |

---

## 🐛 Registro de Defectos

### Defecto #1
**Título**: ____________________________________
**Severidad**: [ ] Crítico [ ] Alto [ ] Medio [ ] Bajo
**Pasos para Reproducir**:
1.
2.
3.

**Resultado Esperado**:
**Resultado Actual**:
**Captura de Pantalla**: [Adjuntar]

---

### Defecto #2
**Título**: ____________________________________
**Severidad**: [ ] Crítico [ ] Alto [ ] Medio [ ] Bajo
**Pasos para Reproducir**:
1.
2.
3.

**Resultado Esperado**:
**Resultado Actual**:
**Captura de Pantalla**: [Adjuntar]

---

## ✅ Checklist de Aprobación

### Pruebas Funcionales
- [ ] TC-001: Ordenamiento de pacientes - PASS
- [ ] TC-002: Color de icono de reloj - PASS
- [ ] TC-003: Funcionalidad "Saltar" - PASS
- [ ] TC-004: Botón "Regresar a Cola" - PASS
- [ ] TC-005: Lógica de cambio de prioridad - PASS
- [ ] TC-006: Permisos de supervisor - PASS
- [ ] TC-007: Tamaño de iconos - PASS

### Pruebas de Regresión
- [ ] RT-001: Llamar paciente - PASS
- [ ] RT-002: Finalizar atención - PASS
- [ ] RT-003: Asignación de sugerencias - PASS

### Compatibilidad
- [ ] Al menos 2 navegadores probados - PASS
- [ ] Responsive en desktop - PASS

### Criterios de Aceptación General
- [ ] Sin errores críticos
- [ ] Sin errores en consola del navegador
- [ ] Performance aceptable (carga < 2 segundos)
- [ ] UX fluida sin interrupciones

---

## 📊 Resultados Finales

**Total de Casos de Prueba**: 10 (7 funcionales + 3 regresión)
**Casos PASS**: _____ / 10
**Casos FAIL**: _____ / 10
**Defectos Encontrados**: _____
**Defectos Críticos**: _____

### Decisión Final
[ ] ✅ **APROBADO** - Listo para producción
[ ] ⚠️ **APROBADO CON CONDICIONES** - Listo con defectos menores documentados
[ ] ❌ **RECHAZADO** - Requiere correcciones antes de producción

---

**Responsable QA**: ____________________
**Fecha de Ejecución**: ____________________
**Firma**: ____________________

---

## 📎 Anexos

### Usuarios de Prueba
```
Supervisor:
  Username: admin
  Password: admin123
  Rol: Supervisor

Flebotomista:
  Username: flebo1
  Password: admin123
  Rol: Flebotomista
```

### Datos de Prueba Sugeridos
Crear los siguientes pacientes para pruebas completas:
1. IBRAHIM REYES - Normal - Turno #38937
2. Petra Herrera - Especial - Turno #38939
3. Rosa Lia - Especial - Turno #38940
4. María González - Normal - Turno #38941
5. Juan Pérez - Normal - Turno #38942

### Comandos Útiles
```bash
# Ver logs del servidor
pm2 logs toma-turno

# Abrir Prisma Studio para verificar datos
DATABASE_URL="postgresql://labsis:labsis@localhost:5432/toma_turno?schema=public" npx prisma studio --port 5555

# Ejecutar pruebas automatizadas
node tests/test_apis.js
```

### Enlaces de Referencia
- Changelog completo: `docs/CHANGELOG_v2.6.1.md`
- Reporte de pruebas automatizadas: `TESTS_REPORT.md`
- Documentación del proyecto: `CLAUDE.md`
