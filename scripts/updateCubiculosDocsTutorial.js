const fs = require('fs');
const path = require('path');

const fullDocPath = path.join(__dirname, '../lib/docs/fullDocumentation.json');
const fullDocumentation = JSON.parse(fs.readFileSync(fullDocPath, 'utf8'));

// Encontrar el módulo de cubículos
const cubiculosModuleIndex = fullDocumentation.findIndex(m => m.moduleId === 'cubiculos');

if (cubiculosModuleIndex === -1) {
  console.error('❌ Módulo de cubículos no encontrado');
  process.exit(1);
}

// Crear documentación completa para Cubículos
const updatedCubiculosModule = {
  ...fullDocumentation[cubiculosModuleIndex],
  content: {
    overview: `# Gestión de Cubículos

El módulo de **Gestión de Cubículos** te permite administrar los espacios físicos de atención donde los flebotomistas atienden a los pacientes. Con este módulo controlarás la disponibilidad, tipos y asignación de personal a cada cubículo.

## ¿Qué aprenderás en esta guía?

En este tutorial aprenderás a:
- ✅ Acceder al módulo de gestión de cubículos
- ✅ Crear nuevos cubículos (Generales y Especiales)
- ✅ Editar información de cubículos existentes
- ✅ Activar y desactivar cubículos según disponibilidad
- ✅ Asignar flebotomistas a cubículos específicos
- ✅ Interpretar el estado y tipos de cubículos
- ✅ Gestionar la capacidad de atención del sistema

## Antes de comenzar

### Requisitos previos

Para seguir este tutorial necesitas:
- ✓ Tener credenciales de acceso al sistema
- ✓ Contar con rol de **Administrador**
- ✓ Tener al menos un usuario Flebotomista creado
- ✓ Acceso al sistema en \`http://localhost:3005\`

### Conceptos clave

**Cubículo**: Espacio físico donde se atienden pacientes. Puede ser un consultorio, área de toma de muestras o sala de procedimientos.

**Tipo de Cubículo**:
- **GENERAL**: Cubículos estándar para atención regular de pacientes
- **SPECIAL**: Cubículos para casos prioritarios o procedimientos especiales

**Estado**: Indica la disponibilidad actual:
- **ACTIVE**: Cubículo operativo y disponible para atención
- **INACTIVE**: Cubículo temporalmente fuera de servicio

**Asignación**: Relación entre un flebotomista y un cubículo. Un flebotomista puede estar asignado a un cubículo específico durante su turno.

---

## Tutorial completo paso a paso`,

    sections: [
      {
        id: "step-1-access",
        title: "Paso 1: Accede al módulo de cubículos",
        description: "Navega al módulo desde el Dashboard administrativo",
        content: `## Paso 1: Accede al módulo de cubículos

Para comenzar a gestionar cubículos, primero debes acceder al módulo desde el Dashboard.

### 1.1 Inicia sesión como administrador

Si aún no has iniciado sesión, sigue estos pasos:

\`\`\`
1. Abre http://localhost:3005/login
2. Ingresa usuario: admin
3. Ingresa contraseña: 123
4. Haz clic en "Iniciar Sesión"
\`\`\`

![Login de administrador](/docs/screenshots/cubiculos/01-admin-login.png)

### 1.2 Localiza la tarjeta "Gestión de Cubículos"

En el Dashboard Principal, busca la tarjeta con el ícono **🏥** y el título **"Gestión de Cubículos"**.

Esta tarjeta muestra:
- **Icono**: 🏥 (representa espacios médicos)
- **Título**: Gestión de Cubículos
- **Descripción**: "Administra los espacios de atención"
- **Botón**: "Acceder"

### 1.3 Haz clic para acceder

Haz clic en cualquier parte de la tarjeta o en el botón **"Acceder"** para entrar al módulo.

### 1.4 Vista inicial del módulo

Serás redirigido a \`/cubicles\` y verás la interfaz completa del módulo:

![Vista inicial del módulo de cubículos](/docs/screenshots/cubiculos/02-cubiculos-initial.png)

### Componentes de la interfaz

La pantalla del módulo de cubículos contiene:

#### 📊 Panel de estadísticas (parte superior)

Muestra cards con métricas clave:
- **Total de cubículos**: Contador de todos los cubículos registrados
- **Cubículos activos**: Cubículos con estado ACTIVE disponibles para atención
- **Cubículos inactivos**: Cubículos temporalmente fuera de servicio
- **Cubículos generales**: Cantidad de cubículos tipo GENERAL
- **Cubículos especiales**: Cantidad de cubículos tipo SPECIAL

#### ➕ Botón "Crear Cubículo"

Botón prominente de color verde para agregar nuevos cubículos al sistema.

#### 📋 Tabla de cubículos

Tabla con columnas:
- **Número**: Identificador numérico del cubículo (ej: Cubículo 1, Cubículo 2)
- **Tipo**: Badge con color según tipo (azul=GENERAL, morado=SPECIAL)
- **Estado**: Badge con color según estado (verde=ACTIVE, gris=INACTIVE)
- **Flebotomista asignado**: Nombre del usuario asignado o "Sin asignar"
- **Acciones**: Botones para Editar y Cambiar Estado

![Tabla de cubículos](/docs/screenshots/cubiculos/03-cubiculos-table.png)

> **💡 Tip**: Los cubículos especiales tienen prioridad en el sistema de turnos. Los pacientes con turno especial serán llamados primero.

---`
      },
      {
        id: "step-2-create",
        title: "Paso 2: Crea un nuevo cubículo",
        description: "Aprende a registrar cubículos generales y especiales",
        content: `## Paso 2: Crea un nuevo cubículo

Aprende a crear nuevos cubículos paso a paso.

### 2.1 Abre el modal de creación

Haz clic en el botón **"Crear Cubículo"** (botón verde con ícono ➕) ubicado en la parte superior derecha de la tabla.

### 2.2 Completa el formulario

Se abrirá un modal con el formulario de creación. Completa los siguientes campos:

#### Campo: Número de Cubículo

Ingresa el número identificador del cubículo:

\`\`\`
Ejemplo: 1
\`\`\`

**Validaciones**:
- ✓ Debe ser un número entero positivo
- ✓ No puede estar vacío
- ✓ Debe ser único (no puede existir otro cubículo con el mismo número)
- ✓ Generalmente se numeran secuencialmente: 1, 2, 3, 4...

> **💡 Tip**: Es recomendable seguir una numeración consecutiva para facilitar la identificación física de los cubículos.

#### Campo: Tipo de Cubículo

Selecciona el tipo en el menú desplegable:

**Opciones**:
- **GENERAL**: Para atención estándar de pacientes regulares
- **SPECIAL**: Para casos prioritarios, procedimientos especiales o atención preferente

\`\`\`
Para este ejemplo, selecciona: GENERAL
\`\`\`

**¿Cuándo usar cada tipo?**

| Tipo | Casos de uso |
|------|-------------|
| **GENERAL** | Toma de muestras regular, consultas estándar, mayoría de pacientes |
| **SPECIAL** | Pacientes prioritarios, procedimientos complejos, casos urgentes |

#### Campo: Flebotomista Asignado (Opcional)

Selecciona un flebotomista del menú desplegable o deja vacío:

\`\`\`
Opciones:
- (Sin asignar)
- Pedro García López
- María Rodríguez
- ... (lista de flebotomistas activos)
\`\`\`

> **📝 Nota**: Solo aparecerán usuarios con rol **Flebotomista** y estado **ACTIVE**. Si no ves usuarios, primero crea flebotomistas en el módulo de Gestión de Usuarios.

**¿Debo asignar ahora?**
- ✅ **Sí**: Si ya sabes qué flebotomista trabajará en ese cubículo
- ⏸️ **No**: Puedes dejarlo sin asignar y hacerlo después cuando llegue el personal

### 2.3 Revisa la información

Antes de crear el cubículo, verifica:

- ✅ Número único y correcto
- ✅ Tipo apropiado según el uso del cubículo
- ✅ Flebotomista asignado (si aplica)

### 2.4 Haz clic en "Crear"

Presiona el botón **"Crear"** (botón verde) en la parte inferior del modal.

### 2.5 Confirmación exitosa

Si todo es correcto, verás:

1. ✅ **Mensaje de éxito**: Toast notification verde indicando "Cubículo creado exitosamente"
2. ✅ **Modal se cierra**: El formulario desaparece automáticamente
3. ✅ **Tabla actualizada**: El nuevo cubículo aparece en la tabla
4. ✅ **Estadísticas actualizadas**: Los contadores reflejan el nuevo cubículo

### Ejemplo completo de creación

#### Ejemplo 1: Cubículo General

| Campo | Valor |
|-------|-------|
| Número | 1 |
| Tipo | GENERAL |
| Flebotomista | Pedro García López |
| Estado inicial | ACTIVE (asignado automáticamente) |

#### Ejemplo 2: Cubículo Especial

| Campo | Valor |
|-------|-------|
| Número | 5 |
| Tipo | SPECIAL |
| Flebotomista | (Sin asignar) |
| Estado inicial | ACTIVE (asignado automáticamente) |

### ¿Qué sucede internamente?

Cuando creas un cubículo:

1. 📝 Se valida que el número no exista
2. 🏥 Se crea el registro en la base de datos
3. 👥 Se vincula al flebotomista (si fue asignado)
4. 📊 Se actualizan los contadores de estadísticas
5. 📋 Se registra la acción en AuditLog
6. 🔔 Se envía notificación de éxito al cliente

> **⚠️ Importante**: El número de cubículo no se puede cambiar después de creado. Asegúrate de ingresar el número correcto.

---`
      },
      {
        id: "step-3-edit",
        title: "Paso 3: Edita cubículos existentes",
        description: "Modifica tipo y asignación de flebotomistas",
        content: `## Paso 3: Edita cubículos existentes

Aprende a modificar la información de cubículos ya creados.

### 3.1 Localiza el cubículo a editar

Navega por la tabla hasta encontrar el cubículo que deseas modificar.

### 3.2 Haz clic en el botón "Editar"

En la columna **"Acciones"**, haz clic en el botón con ícono de lápiz (✏️).

### 3.3 Modifica los campos necesarios

Se abrirá un modal con el formulario de edición precargado con los datos actuales.

#### Campos editables

**Puedes modificar**:
- ✓ Tipo de cubículo (GENERAL ↔ SPECIAL)
- ✓ Flebotomista asignado (cambiar o quitar asignación)

**No puedes modificar**:
- ✗ Número de cubículo (es el identificador único)
- ✗ Fecha de creación

### 3.4 Cambiar el tipo de cubículo

Puedes cambiar entre GENERAL y SPECIAL según las necesidades:

**De GENERAL a SPECIAL**:
\`\`\`
Casos de uso:
- Convertir cubículo regular en espacio prioritario
- Habilitar área para procedimientos especiales
- Responder a aumento de demanda de casos urgentes
\`\`\`

**De SPECIAL a GENERAL**:
\`\`\`
Casos de uso:
- Convertir espacio prioritario en atención regular
- Balancear capacidad según demanda
- Reorganizar distribución de espacios
\`\`\`

> **⚠️ Importante**: Si cambias un cubículo de SPECIAL a GENERAL y hay turnos especiales en cola, podrían no ser llamados por ese cubículo.

### 3.5 Cambiar o asignar flebotomista

#### Caso 1: Asignar flebotomista a cubículo sin asignación

\`\`\`
Estado actual: Sin asignar
Acción: Seleccionar "Pedro García López"
Resultado: Pedro queda asignado al cubículo
\`\`\`

#### Caso 2: Cambiar flebotomista asignado

\`\`\`
Estado actual: Pedro García López
Acción: Seleccionar "María Rodríguez"
Resultado: María reemplaza a Pedro en el cubículo
\`\`\`

#### Caso 3: Quitar asignación

\`\`\`
Estado actual: Pedro García López
Acción: Seleccionar "(Sin asignar)"
Resultado: Cubículo queda libre, sin personal asignado
\`\`\`

> **💡 Tip**: Usa esta función para gestionar turnos rotativos o cambios de horario del personal.

### 3.6 Guarda los cambios

Haz clic en el botón **"Guardar"** (botón azul) para aplicar las modificaciones.

### 3.7 Confirmación

Verás una notificación de éxito y la tabla se actualizará con la nueva información.

### Casos de uso comunes

#### Rotación de personal

\`\`\`
Escenario: Pedro termina su turno, entra María
Acción:
1. Editar Cubículo 1
2. Cambiar flebotomista: Pedro → María
3. Guardar
\`\`\`

#### Habilitar cubículo para casos especiales

\`\`\`
Escenario: Aumento de pacientes prioritarios
Acción:
1. Editar Cubículo 3 (GENERAL)
2. Cambiar tipo: GENERAL → SPECIAL
3. Asignar flebotomista con experiencia
4. Guardar
\`\`\`

#### Liberar cubículo al final del día

\`\`\`
Escenario: Personal termina jornada
Acción:
1. Editar cada cubículo activo
2. Cambiar asignación: Flebotomista → Sin asignar
3. Guardar
\`\`\`

### Validaciones importantes

#### No puedes asignar un flebotomista a múltiples cubículos simultáneamente

Si intentas asignar un flebotomista que ya está en otro cubículo:
- ⚠️ El sistema te advertirá
- 💡 Primero libera el cubículo anterior
- ✅ Luego asigna al nuevo cubículo

#### Solo flebotomistas activos aparecen en la lista

- ✅ Usuarios con rol **Flebotomista** y estado **ACTIVE**
- ❌ No aparecen: Administradores, usuarios INACTIVE o BLOCKED

### Auditoría de cambios

Cada edición queda registrada con:
- 👤 Usuario administrador que realizó el cambio
- 📅 Fecha y hora exacta
- 📝 Valores anteriores y nuevos
- 🌐 Dirección IP

> **📊 Trazabilidad**: Puedes revisar el historial completo de cambios en los logs de auditoría.

---`
      },
      {
        id: "step-4-status",
        title: "Paso 4: Gestiona estados de cubículos",
        description: "Activa y desactiva cubículos según disponibilidad",
        content: `## Paso 4: Gestiona estados de cubículos

Aprende a activar y desactivar cubículos para controlar la capacidad de atención.

### Estados disponibles

#### 🟢 ACTIVE (Activo)

**Características**:
- ✅ Cubículo operativo y disponible
- ✅ Puede recibir pacientes
- ✅ Aparece en el sistema de turnos
- ✅ El flebotomista asignado puede llamar pacientes

**Cuándo usar**: Estado normal para cubículos en operación.

#### ⚪ INACTIVE (Inactivo)

**Características**:
- ⏸️ Cubículo temporalmente fuera de servicio
- 🚫 No puede recibir pacientes nuevos
- 📊 Aún aparece en la lista de cubículos
- 🔄 Puede ser reactivado fácilmente

**Cuándo usar**:
- Mantenimiento del espacio físico
- Limpieza profunda o desinfección
- Falta de personal disponible
- Fuera del horario de atención
- Reparaciones o ajustes técnicos

### Cómo cambiar el estado de un cubículo

#### 4.1 Localiza el cubículo

Encuentra el cubículo en la tabla.

#### 4.2 Haz clic en el botón de estado

En la columna **"Acciones"**, haz clic en el botón con ícono de estado (🔄).

#### 4.3 Selecciona el nuevo estado

Aparecerá un menú con las opciones:
- 🟢 Activar
- ⚪ Desactivar

#### 4.4 Confirma el cambio

Se mostrará un diálogo de confirmación:

**Para INACTIVE**:
\`\`\`
"¿Estás seguro de desactivar este cubículo?
El cubículo no recibirá pacientes hasta que sea reactivado."
\`\`\`

**Para ACTIVE**:
\`\`\`
"¿Estás seguro de activar este cubículo?
El cubículo estará disponible para atender pacientes."
\`\`\`

Haz clic en **"Confirmar"** para proceder.

![Confirmación de cambio de estado](/docs/screenshots/cubiculos/04-status-confirm.png)

#### 4.5 Verificación del cambio

Después de confirmar:
- ✅ El badge en la tabla cambia de color inmediatamente
- 📊 Las estadísticas se actualizan
- 📋 Se registra el cambio en auditoría
- 🔔 Aparece notificación de éxito

### Flujos comunes de gestión de estado

#### Inicio de jornada

\`\`\`
Escenario: 7:00 AM - Apertura del área de atención
Acción:
1. Activar Cubículo 1 (GENERAL)
2. Activar Cubículo 2 (GENERAL)
3. Activar Cubículo 3 (SPECIAL)
4. Asignar flebotomistas a cada cubículo
Resultado: Sistema listo para recibir pacientes
\`\`\`

#### Descanso del personal

\`\`\`
Escenario: 12:00 PM - Hora de comida
Acción:
1. Desactivar Cubículo 2 (flebotomista a descanso)
2. Mantener Cubículo 1 y 3 activos
Resultado: Capacidad reducida durante descanso
\`\`\`

#### Mantenimiento programado

\`\`\`
Escenario: Limpieza profunda del cubículo
Acción:
1. Desactivar Cubículo 1
2. Reasignar flebotomista a otro cubículo
3. Realizar mantenimiento
4. Reactivar cuando esté listo
\`\`\`

#### Fin de jornada

\`\`\`
Escenario: 7:00 PM - Cierre del área
Acción:
1. Desactivar todos los cubículos
2. Quitar asignaciones de flebotomistas
Resultado: Sistema en modo "fuera de servicio"
\`\`\`

### Efectos en el sistema de turnos

#### Cubículo ACTIVE

- ✅ Aparece en la lista de cubículos disponibles
- ✅ El flebotomista puede llamar al siguiente paciente
- ✅ Los turnos se asignan considerando este cubículo
- ✅ Pantallas de TV muestran el cubículo activo

#### Cubículo INACTIVE

- 🚫 No aparece como opción para llamar pacientes
- ⏸️ Turnos pendientes se redirigen a otros cubículos
- 📺 No se muestra en pantallas de TV (o se marca como "No disponible")
- 💾 Los turnos previamente atendidos permanecen en el historial

### Mejores prácticas

#### ✅ Hacer

- Desactivar cubículos al inicio/fin del día
- Informar al equipo antes de desactivar
- Reactivar solo cuando haya personal asignado
- Usar INACTIVE para mantenimientos programados
- Verificar que no haya pacientes en espera antes de desactivar

#### ❌ Evitar

- Desactivar todos los cubículos simultáneamente (sin capacidad de atención)
- Dejar cubículos ACTIVE sin personal asignado
- Cambiar estados sin coordinación con el equipo
- Desactivar cubículos SPECIAL si hay turnos especiales en cola

### Monitoreo de capacidad

El panel de estadísticas te ayuda a monitorear:

\`\`\`
Total: 5 cubículos
Activos: 3 cubículos (60% capacidad)
Inactivos: 2 cubículos (40% fuera de servicio)
\`\`\`

> **💡 Tip**: Mantén al menos el 50% de cubículos activos durante horario de operación para evitar tiempos de espera excesivos.

### Auditoría de cambios de estado

Cada cambio queda registrado:
- 🆔 ID del cubículo
- 📝 Estado anterior → Estado nuevo
- 👤 Usuario que realizó el cambio
- ⏰ Timestamp exacto
- 🌐 Dirección IP

![Vista de auditoría](/docs/screenshots/cubiculos/05-audit-log.png)

> **📊 Reportes**: Puedes generar reportes de disponibilidad de cubículos por período para optimizar recursos.

---`
      },
      {
        id: "step-5-best-practices",
        title: "Paso 5: Mejores prácticas y optimización",
        description: "Aprende a gestionar cubículos de manera eficiente",
        content: `## Paso 5: Mejores prácticas y optimización

Aprende estrategias para gestionar cubículos de manera eficiente y optimizar la atención.

### 5.1 Planificación de cubículos

#### Determinar cantidad necesaria

Para calcular cuántos cubículos necesitas:

\`\`\`
Fórmula básica:
Número de cubículos = (Pacientes promedio por día) / (Capacidad por cubículo)

Ejemplo:
100 pacientes/día ÷ 25 pacientes/cubículo = 4 cubículos necesarios
\`\`\`

**Factores a considerar**:
- 📊 Volumen diario de pacientes
- ⏰ Horario de operación
- 👥 Personal disponible
- 🏥 Espacio físico disponible
- 🚑 Proporción de casos especiales (10-20% recomendado)

#### Distribución recomendada

Para una operación balanceada:

| Tipo | Porcentaje | Ejemplo (5 cubículos) |
|------|-----------|----------------------|
| **GENERAL** | 70-80% | 3-4 cubículos |
| **SPECIAL** | 20-30% | 1-2 cubículos |

> **💡 Tip**: Mantén al menos 1 cubículo SPECIAL para casos prioritarios, incluso en operaciones pequeñas.

### 5.2 Asignación eficiente de personal

#### Estrategia de asignación

**Inicio del día**:
\`\`\`
1. Asignar flebotomistas más experimentados a cubículos SPECIAL
2. Distribuir equitativamente en cubículos GENERAL
3. Dejar 1 cubículo de respaldo sin asignar (para rotaciones)
\`\`\`

**Durante el día**:
\`\`\`
1. Rotar personal para descansos sin cerrar cubículos
2. Reasignar según volumen de pacientes
3. Mantener al menos 60% de cubículos activos
\`\`\`

#### Rotación de personal

Ejemplo de esquema de rotación:

\`\`\`
09:00-11:00  Pedro → Cubículo 1,  María → Cubículo 2
11:00-13:00  María → Cubículo 1,  José → Cubículo 2
13:00-15:00  José → Cubículo 1,   Pedro → Cubículo 2
\`\`\`

**Beneficios**:
- ✅ Evita fatiga del personal
- ✅ Distribuye carga de trabajo
- ✅ Mantiene capacidad de atención constante

### 5.3 Gestión por horarios

#### Horarios pico

**Identificar horarios de mayor demanda**:
\`\`\`
Horarios pico comunes:
- 🌅 08:00-10:00 (apertura)
- 🌞 12:00-14:00 (hora de comida)
- 🌆 16:00-18:00 (salida de trabajos)
\`\`\`

**Estrategia**:
- ✅ Activar **todos** los cubículos en horarios pico
- ✅ Asignar personal adicional si es posible
- ✅ Priorizar cubículos SPECIAL para evitar cuellos de botella

#### Horarios valle

**Horarios de menor demanda**:
\`\`\`
- 🕐 10:00-12:00 (media mañana)
- 🕒 14:00-16:00 (media tarde)
\`\`\`

**Estrategia**:
- ⏸️ Desactivar 1-2 cubículos GENERAL
- 🔄 Aprovechar para mantenimiento
- 👥 Permitir descansos del personal

### 5.4 Mantenimiento preventivo

#### Programación de mantenimiento

Crea un calendario de mantenimiento:

| Cubículo | Lunes | Martes | Miércoles | Jueves | Viernes |
|----------|-------|--------|-----------|--------|---------|
| Cubículo 1 | Activo | Activo | **Mantenimiento** | Activo | Activo |
| Cubículo 2 | Activo | **Mantenimiento** | Activo | Activo | Activo |
| Cubículo 3 | **Mantenimiento** | Activo | Activo | Activo | Activo |

**Beneficios**:
- ✅ Mantienes espacios en condiciones óptimas
- ✅ No afectas capacidad total del sistema
- ✅ Evitas descomposturas inesperadas

#### Desactivación temporal

Usa INACTIVE para:
- 🧹 Limpieza profunda (30-60 min)
- 🔧 Reparaciones menores (1-2 horas)
- 📦 Reabastecimiento de insumos
- 🖥️ Actualizaciones de equipos

### 5.5 Monitoreo de métricas

#### Indicadores clave (KPIs)

Monitorea estas métricas en el módulo:

**1. Tasa de utilización**
\`\`\`
Fórmula: (Cubículos activos / Total cubículos) × 100
Meta: >70% durante horario de operación
\`\`\`

**2. Proporción GENERAL/SPECIAL**
\`\`\`
Recomendado: 75% GENERAL, 25% SPECIAL
Ajustar según demanda real
\`\`\`

**3. Cubículos sin asignar**
\`\`\`
Meta: <10% de cubículos activos sin personal
\`\`\`

#### Panel de estadísticas

Usa el panel superior para monitoreo rápido:

![Panel de estadísticas](/docs/screenshots/cubiculos/06-statistics-panel.png)

Revisa diariamente:
- 📊 Total vs Activos (capacidad disponible)
- 🏥 Distribución GENERAL/SPECIAL
- 👥 Cubículos con/sin asignación

### 5.6 Casos especiales

#### Día de alta demanda

\`\`\`
Escenario: Campaña de salud pública, mayor afluencia esperada
Acciones:
1. Activar TODOS los cubículos disponibles
2. Asignar personal adicional
3. Convertir temporalmente cubículos GENERAL → SPECIAL si se requiere
4. Monitorear tiempos de espera en tiempo real
\`\`\`

#### Falta de personal

\`\`\`
Escenario: Varios flebotomistas ausentes
Acciones:
1. Priorizar cubículos SPECIAL (mantener activos)
2. Desactivar cubículos GENERAL sin personal
3. Informar a recepción sobre capacidad reducida
4. Reasignar personal disponible estratégicamente
\`\`\`

#### Emergencia o incidente

\`\`\`
Escenario: Problema técnico o emergencia en un cubículo
Acciones:
1. Desactivar inmediatamente el cubículo afectado
2. Reasignar flebotomista a otro cubículo disponible
3. Notificar a soporte técnico
4. Activar cubículo de respaldo si existe
\`\`\`

### 5.7 Documentación y comunicación

#### Bitácora de cambios

Mantén un registro complementario de:
- 📝 Motivo de desactivaciones
- ⏰ Duración estimada de mantenimientos
- 👥 Responsable del cambio
- 📞 Contacto en caso de consultas

#### Comunicación con el equipo

Antes de hacer cambios importantes:
- ✅ Notifica al equipo de flebotomistas
- ✅ Informa a recepción (control de flujo)
- ✅ Actualiza pantallas informativas
- ✅ Registra en sistema de comunicación interna

> **💡 Tip**: Usa un grupo de WhatsApp o sistema de mensajería para notificar cambios de estado de cubículos en tiempo real.

### Checklist de gestión diaria

#### Inicio del día (7:00 AM)
- [ ] Activar cubículos según personal disponible
- [ ] Asignar flebotomistas
- [ ] Verificar que al menos 1 SPECIAL esté activo
- [ ] Revisar estadísticas del día anterior

#### Durante el día
- [ ] Monitorear tasa de utilización
- [ ] Ajustar según flujo de pacientes
- [ ] Gestionar rotaciones de personal
- [ ] Realizar mantenimientos programados

#### Fin del día (7:00 PM)
- [ ] Desactivar todos los cubículos
- [ ] Quitar asignaciones de flebotomistas
- [ ] Revisar métricas del día
- [ ] Planificar ajustes para mañana

---

## ✅ ¡Has completado el tutorial de cubículos!

Ahora conoces todas las estrategias para gestionar cubículos de manera eficiente y optimizar la capacidad de atención de tu sistema.

### Próximos pasos

- 📊 Explora el módulo de **Estadísticas** para analizar rendimiento de cubículos
- 🎫 Aprende sobre **Gestión de Cola** para entender el flujo de pacientes
- 👥 Revisa **Gestión de Usuarios** para administrar flebotomistas

`
      }
    ],

    features: [
      {
        icon: "🏥",
        title: "Gestión completa de espacios",
        description: "Crea, edita, activa y desactiva cubículos de atención. Control total sobre la capacidad del sistema."
      },
      {
        icon: "🎯",
        title: "Tipos de cubículo flexibles",
        description: "Configura cubículos GENERAL para atención regular o SPECIAL para casos prioritarios y procedimientos urgentes."
      },
      {
        icon: "👥",
        title: "Asignación de personal",
        description: "Asigna flebotomistas a cubículos específicos. Gestiona rotaciones y cambios de turno fácilmente."
      },
      {
        icon: "📊",
        title: "Estadísticas en tiempo real",
        description: "Visualiza métricas actualizadas: total de cubículos, activos, inactivos, por tipo. Monitoreo instantáneo."
      },
      {
        icon: "🔄",
        title: "Activación/desactivación rápida",
        description: "Cambia el estado de cubículos con un clic. Ideal para mantenimientos, descansos o ajustes de capacidad."
      },
      {
        icon: "🔢",
        title: "Numeración flexible",
        description: "Asigna números identificadores únicos a cada cubículo. Correlación con espacios físicos para facilitar navegación."
      },
      {
        icon: "⚡",
        title: "Actualización instantánea",
        description: "Cambios se reflejan inmediatamente en el sistema de turnos y pantallas de TV. Sin retrasos ni inconsistencias."
      },
      {
        icon: "🛡️",
        title: "Validaciones robustas",
        description: "Previene duplicación de números, asignaciones conflictivas y errores de configuración. Sistema confiable."
      },
      {
        icon: "📝",
        title: "Auditoría completa",
        description: "Cada cambio queda registrado: creación, edición, cambios de estado. Trazabilidad total para cumplimiento."
      },
      {
        icon: "🎨",
        title: "Interfaz intuitiva",
        description: "Diseño claro con badges de colores: verde=activo, gris=inactivo, azul=general, morado=especial. Fácil de usar."
      }
    ],

    tips: [
      {
        icon: "💡",
        title: "Mantén al menos 1 cubículo SPECIAL",
        description: "Incluso en operaciones pequeñas, tener un espacio prioritario evita cuellos de botella con casos urgentes."
      },
      {
        icon: "📊",
        title: "Monitorea la tasa de utilización",
        description: "Mantén al menos 60-70% de cubículos activos durante horario de operación para tiempos de espera aceptables."
      },
      {
        icon: "🔄",
        title: "Rota personal para evitar fatiga",
        description: "Cambia asignaciones cada 2-3 horas. Usa la edición rápida de cubículos para gestionar rotaciones."
      },
      {
        icon: "🏥",
        title: "Numera según ubicación física",
        description: "Usa números que correspondan con la ubicación real del cubículo (ej: 101, 102 para primer piso)."
      },
      {
        icon: "⏰",
        title: "Programa mantenimientos en horarios valle",
        description: "Desactiva cubículos para limpieza/mantenimiento en horarios de baja demanda (10-12 AM, 2-4 PM)."
      },
      {
        icon: "👥",
        title: "Asigna personal experimentado a SPECIAL",
        description: "Los cubículos para casos prioritarios deben tener flebotomistas con mayor experiencia."
      },
      {
        icon: "🚨",
        title: "Deja un cubículo de respaldo",
        description: "Ten al menos 1 cubículo adicional sin asignar para emergencias, rotaciones o picos de demanda."
      },
      {
        icon: "📱",
        title: "Comunica cambios al equipo",
        description: "Notifica a flebotomistas y recepción antes de activar/desactivar cubículos para evitar confusión."
      },
      {
        icon: "📈",
        title: "Revisa estadísticas diariamente",
        description: "Usa el panel de métricas para identificar patrones y optimizar la distribución de cubículos."
      }
    ],

    warnings: [
      {
        icon: "⚠️",
        title: "No desactives todos los cubículos simultáneamente",
        description: "Siempre mantén al menos un cubículo activo durante horario de operación para atender pacientes."
      },
      {
        icon: "🚫",
        title: "El número de cubículo no se puede cambiar",
        description: "Una vez creado, el número es permanente. Verifica bien antes de crear para evitar confusión."
      },
      {
        icon: "👥",
        title: "No asignes flebotomistas inactivos",
        description: "Solo usuarios con rol Flebotomista y estado ACTIVE pueden ser asignados. Actívalos primero si es necesario."
      },
      {
        icon: "🔄",
        title: "Cambios de tipo afectan el sistema de turnos",
        description: "Si cambias SPECIAL→GENERAL, turnos especiales en cola podrían no ser atendidos por ese cubículo."
      },
      {
        icon: "⏸️",
        title: "Cubículos INACTIVE no pueden llamar pacientes",
        description: "Asegúrate de reactivar cubículos antes de que el flebotomista intente atender. De lo contrario, verá error."
      },
      {
        icon: "🏥",
        title: "No dejes cubículos activos sin personal",
        description: "Un cubículo ACTIVE sin flebotomista asignado puede causar confusión en el flujo de pacientes."
      },
      {
        icon: "📊",
        title: "Muy pocos cubículos SPECIAL causan retrasos",
        description: "Si más del 20% de turnos son especiales, necesitas más cubículos SPECIAL para evitar esperas excesivas."
      }
    ],

    screenshots: [
      {
        step: 1,
        filename: "01-admin-login.png",
        title: "Login de administrador",
        description: "Pantalla de autenticación para acceder al sistema con rol de administrador",
        path: "/docs/screenshots/cubiculos/01-admin-login.png",
        tags: ["autenticación", "acceso", "admin"]
      },
      {
        step: 2,
        filename: "02-cubiculos-initial.png",
        title: "Vista inicial del módulo",
        description: "Interfaz completa del módulo de cubículos con tabla, estadísticas y controles de gestión",
        path: "/docs/screenshots/cubiculos/02-cubiculos-initial.png",
        tags: ["vista-general", "interfaz", "dashboard"]
      },
      {
        step: 3,
        filename: "03-cubiculos-table.png",
        title: "Tabla de cubículos",
        description: "Listado de todos los cubículos con número, tipo, estado, flebotomista asignado y acciones disponibles",
        path: "/docs/screenshots/cubiculos/03-cubiculos-table.png",
        tags: ["tabla", "listado", "cubículos"]
      },
      {
        step: 4,
        filename: "04-status-confirm.png",
        title: "Confirmación de cambio de estado",
        description: "Diálogo de confirmación al activar o desactivar un cubículo con advertencias y opciones",
        path: "/docs/screenshots/cubiculos/04-status-confirm.png",
        tags: ["confirmación", "estado", "activación"]
      },
      {
        step: 5,
        filename: "05-audit-log.png",
        title: "Log de auditoría",
        description: "Registro completo de cambios realizados en cubículos: creación, edición, cambios de estado",
        path: "/docs/screenshots/cubiculos/05-audit-log.png",
        tags: ["auditoría", "historial", "logs"]
      }
    ]
  }
};

// Actualizar el módulo en el array
fullDocumentation[cubiculosModuleIndex] = updatedCubiculosModule;

// Guardar el archivo actualizado
fs.writeFileSync(fullDocPath, JSON.stringify(fullDocumentation, null, 2));

console.log('\n✅ Documentación de Cubículos creada exitosamente');
console.log('📚 Formato: Tutorial completo paso a paso');
console.log('📊 Total de secciones: 5 pasos detallados');
console.log('📸 Total de screenshots: 5 capturas con contexto');
console.log('💡 Total de tips: 9 consejos prácticos');
console.log('⚠️  Total de warnings: 7 advertencias importantes');
console.log('🎯 Total de features: 10 características destacadas');
console.log('\n📁 Archivo actualizado:', fullDocPath);
console.log('\n🎉 Módulo de Cubículos documentado completamente!');
