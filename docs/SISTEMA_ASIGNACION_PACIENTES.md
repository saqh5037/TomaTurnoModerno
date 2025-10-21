# Sistema de Asignación de Pacientes por Orden de Login

## 📋 Descripción

El sistema asigna automáticamente pacientes pendientes a flebotomistas activos siguiendo estrictamente el **orden de login**. Esto evita que múltiples flebotomistas intenten atender al mismo paciente simultáneamente.

## 🔄 Funcionamiento

### Orden de Prioridad

1. **Flebotomista #1** (primero en loguearse) → Paciente #1
2. **Flebotomista #2** (segundo en loguearse) → Paciente #2
3. **Flebotomista #3** (tercer en loguearse) → Paciente #3
4. Y así sucesivamente...

### Ejemplo Práctico

Si hay 5 flebotomistas logueados y 10 pacientes esperando:

```
Hora de Login | Flebotomista    | Paciente Asignado
--------------+-----------------+-------------------
08:00 AM      | Juan Pérez      | Turno #1
08:05 AM      | María García    | Turno #2
08:15 AM      | Carlos López    | Turno #3
08:30 AM      | Ana Martínez    | Turno #4
08:45 AM      | Pedro Sánchez   | Turno #5
```

Los turnos #6 al #10 quedarán sin asignar hasta que algún flebotomista termine con su paciente.

## 🎯 Características

### 1. Asignación Automática
- Se ejecuta cada **15 segundos** automáticamente
- Solo asigna pacientes a flebotomistas que no tienen asignación pendiente

### 2. Timeout de Sugerencias
- Si un flebotomista no atiende su paciente asignado en **5 minutos**, la sugerencia se libera
- El paciente vuelve a la cola para ser asignado a otro flebotomista

### 3. Priorización de Pacientes
Los pacientes se asignan en este orden:
1. **Especiales** (★) - Prioridad alta
2. **Diferidos** (⏳) - Segunda prioridad
3. **Regulares** - Por orden de turno

### 4. Estado de Flebotomistas
Solo se consideran activos los flebotomistas que:
- Tienen sesión válida (no expirada)
- Han tenido actividad en los últimos **30 minutos**
- Tienen estado `ACTIVE` en el sistema
- Tienen rol `Flebotomista`

## 🛠️ Endpoints API

### 1. Asignar Sugerencias
```http
POST /api/queue/assignSuggestions
```

Ejecuta la asignación automática de pacientes.

**Respuesta:**
```json
{
  "success": true,
  "assigned": 5,
  "activePhlebotomists": 5,
  "availablePatients": 10,
  "assignments": [
    {
      "loginOrder": 1,
      "assignedTo": "Juan Pérez",
      "turnNumber": 101,
      "patientName": "Paciente 1"
    }
  ]
}
```

### 2. Ver Orden de Flebotomistas
```http
GET /api/queue/phlebotomists-order
```

Muestra el orden actual de flebotomistas logueados (útil para debugging).

**Respuesta:**
```json
{
  "success": true,
  "totalActive": 5,
  "phlebotomists": [
    {
      "order": 1,
      "name": "Juan Pérez",
      "loginTime": "2025-01-07T08:00:00Z",
      "minutesSinceLogin": 45,
      "suggestedPatients": 1,
      "patientsInAttention": 0
    }
  ]
}
```

## 🧪 Pruebas

### Script de Prueba
Ejecutar el siguiente comando para verificar el funcionamiento:

```bash
node scripts/testPhlebotomistOrder.js
```

Este script mostrará:
1. Orden actual de flebotomistas logueados
2. Asignaciones realizadas
3. Resumen de la operación

### Prueba Manual

1. **Login de múltiples flebotomistas** (en orden):
   - Flebotomista 1 → `flebo1` / contraseña
   - Flebotomista 2 → `flebo2` / contraseña
   - Flebotomista 3 → `flebo3` / contraseña

2. **Crear pacientes de prueba**:
   ```bash
   node scripts/create5Turns.js
   ```

3. **Verificar asignaciones** en el panel de atención:
   - Cada flebotomista verá resaltado "TU TURNO" en su paciente asignado
   - El orden será: flebo1 → paciente 1, flebo2 → paciente 2, etc.

## 📊 Indicadores Visuales

En el panel de atención, los pacientes asignados al flebotomista actual se muestran con:
- **Badge verde** "TU TURNO"
- **Fondo verde claro** en la tarjeta
- **Borde verde** en el lateral izquierdo

## ⚡ Optimizaciones

1. **Caché de sesiones**: Se consultan sesiones activas solo cada 15 segundos
2. **Índices en BD**: Las consultas están optimizadas con índices en:
   - `Session.createdAt`
   - `Session.lastActivity`
   - `TurnRequest.suggestedFor`
   - `TurnRequest.status`

3. **Transacciones atómicas**: Todas las asignaciones se realizan en transacciones para evitar condiciones de carrera

## 🔧 Configuración

Variables importantes en el código:

```javascript
// Timeout para liberar sugerencias (5 minutos)
const SUGGESTION_TIMEOUT_MINUTES = 5;

// Tiempo de inactividad permitido (30 minutos)
const activeSessionTime = new Date(Date.now() - 30 * 60 * 1000);

// Frecuencia de asignación automática (15 segundos)
// Configurado en: pages/turns/attention.js línea 287
```

## 📝 Notas Importantes

1. El orden se basa en `Session.createdAt`, no en `User.lastLogin`
2. Si un flebotomista cierra sesión y vuelve a entrar, se le asigna una **nueva posición** al final de la cola
3. Los flebotomistas pueden ver todos los pacientes, pero solo el asignado aparece resaltado
4. Un flebotomista puede llamar a cualquier paciente, no está limitado solo a su sugerencia

## 🐛 Debugging

Para ver logs detallados en consola del servidor:

```bash
# Los logs mostrarán:
✅ 5 pacientes asignados automáticamente (por orden de login)
   Flebotomista #1 (Juan Pérez) → Turno #101 (Paciente 1)
   Flebotomista #2 (María García) → Turno #102 (Paciente 2)
   ...
```

## 🔄 Actualización: Enero 2025

Sistema completamente implementado y funcionando en producción en INER.
