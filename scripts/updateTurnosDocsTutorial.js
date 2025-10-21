const fs = require('fs');
const path = require('path');

const fullDocPath = path.join(__dirname, '../lib/docs/fullDocumentation.json');
const fullDocumentation = JSON.parse(fs.readFileSync(fullDocPath, 'utf8'));

// Encontrar el módulo de turnos
const turnosModuleIndex = fullDocumentation.findIndex(m => m.moduleId === 'turnos');

if (turnosModuleIndex === -1) {
  console.error('❌ Módulo de turnos no encontrado');
  process.exit(1);
}

// Crear documentación completa para Turnos
const updatedTurnosModule = {
  ...fullDocumentation[turnosModuleIndex],
  content: {
    overview: `# Creación de Turnos

El módulo de **Creación de Turnos** es el punto de entrada del sistema donde se registran los pacientes y se les asigna un número de turno para su atención. Este módulo es utilizado principalmente por personal de recepción.

## ¿Qué aprenderás en esta guía?

En este tutorial aprenderás a:
- ✅ Acceder al módulo de creación de turnos
- ✅ Registrar pacientes en el sistema
- ✅ Asignar turnos generales y especiales
- ✅ Imprimir comprobantes de turno para pacientes
- ✅ Validar información antes de crear turnos
- ✅ Gestionar el flujo de pacientes en recepción
- ✅ Resolver problemas comunes de registro

## Antes de comenzar

### Requisitos previos

Para seguir este tutorial necesitas:
- ✓ Tener credenciales de acceso al sistema
- ✓ Rol de **Administrador** o acceso a recepción
- ✓ Tener al menos un cubículo activo en el sistema
- ✓ Impresora configurada (para comprobantes físicos)
- ✓ Acceso al sistema en \`http://localhost:3005\`

### Conceptos clave

**Turno**: Número único asignado a un paciente para identificar su posición en la cola de espera y facilitar su llamado.

**Tipo de turno**:
- **GENERAL**: Turno estándar para atención regular (Ej: A-001, A-002...)
- **SPECIAL**: Turno prioritario para casos urgentes o pacientes con necesidades especiales (Ej: E-001, E-002...)

**Comprobante**: Documento impreso que el paciente recibe con su número de turno, fecha, hora y recomendaciones de espera.

**Registro de paciente**: Información básica capturada al momento de crear el turno (no incluye historia clínica, solo datos de identificación).

**Cola de espera**: Lista dinámica de turnos ordenada por prioridad (especiales primero) y hora de llegada.

---

## Tutorial completo paso a paso`,

    sections: [
      {
        id: "step-1-access",
        title: "Paso 1: Accede al módulo de turnos",
        description: "Navega al módulo de creación de turnos desde el Dashboard",
        content: `## Paso 1: Accede al módulo de turnos

Para comenzar a registrar pacientes, primero debes acceder al módulo.

### 1.1 Inicia sesión en el sistema

Si aún no has iniciado sesión:

\`\`\`
1. Abre http://localhost:3005/login
2. Ingresa tus credenciales de recepción o admin
3. Haz clic en "Iniciar Sesión"
\`\`\`

### 1.2 Localiza la tarjeta "Creación de Turnos"

En el Dashboard Principal, busca la tarjeta con el ícono **🎫** y el título **"Creación de Turnos"**.

Esta tarjeta muestra:
- **Icono**: 🎫 (representa tickets de turno)
- **Título**: Creación de Turnos
- **Descripción**: "Registra nuevos pacientes en el sistema"
- **Botón**: "Acceder"

### 1.3 Haz clic para acceder

Haz clic en cualquier parte de la tarjeta o en el botón **"Acceder"** para entrar al módulo.

### 1.4 Vista inicial del módulo

Serás redirigido a \`/turns/create\` y verás el formulario de registro:

![Vista inicial del módulo de turnos](/docs/screenshots/turnos/01-turnos-initial.png)

### Componentes de la interfaz

La pantalla de creación de turnos contiene:

#### 📊 Panel de información (parte superior)

Muestra métricas de la cola actual:
- **Turnos en espera**: Número de pacientes esperando atención
- **Tiempo estimado de espera**: Cálculo aproximado en minutos
- **Cubículos activos**: Cantidad de espacios disponibles para atención
- **Último turno creado**: Número del turno más reciente

#### 📝 Formulario de registro

Campos para capturar información del paciente:
- Nombre completo
- Documento de identificación (opcional)
- Tipo de turno (General o Especial)
- Observaciones (opcional)

#### 🎯 Botón de creación

Botón prominente **"Crear Turno"** para registrar al paciente.

#### 📋 Vista previa de cola

Lista de últimos turnos creados:
- Número de turno
- Tipo
- Estado actual
- Hora de creación

![Interfaz completa de creación](/docs/screenshots/turnos/02-turnos-form.png)

> **💡 Tip**: La información de turnos en espera se actualiza automáticamente en tiempo real. No necesitas recargar la página.

### 1.5 Acceso directo (opcional)

Si trabajas exclusivamente en recepción, puedes configurar:

\`\`\`
1. Marca como favorita la URL: http://localhost:3005/turns/create
2. O crea un acceso directo en el escritorio
3. Abre directamente sin pasar por el Dashboard
\`\`\`

> **⚠️ Importante**: Asegúrate de que hay al menos un cubículo activo antes de empezar a registrar pacientes. Sin cubículos activos, los turnos no podrán ser atendidos.

---`
      },
      {
        id: "step-2-create-general",
        title: "Paso 2: Crea un turno general",
        description: "Registra un paciente con turno estándar",
        content: `## Paso 2: Crea un turno general

Los turnos generales son para atención regular de pacientes sin prioridad especial.

### 2.1 Escenario típico

\`\`\`
Paciente: "Buenos días, vengo para examen de sangre"
Recepcionista: "Con gusto. Voy a registrarlo en el sistema"
\`\`\`

### 2.2 Completa el formulario

#### Campo: Nombre completo

Solicita al paciente su nombre completo:

\`\`\`
Paciente: "Juan Alberto Pérez González"
Recepcionista: [Escribe en el campo]
\`\`\`

**Validaciones**:
- ✓ Mínimo 3 caracteres
- ✓ Solo letras, espacios y acentos
- ✓ No debe estar vacío

> **💡 Tip**: Escribe el nombre exactamente como lo dice el paciente. Esto facilita el llamado posterior.

#### Campo: Documento de identificación (opcional)

Si el paciente trae identificación:

\`\`\`
Opciones:
- INE/IFE
- Pasaporte
- Cédula profesional
- CURP
\`\`\`

**Ejemplo**:
\`\`\`
INE: 1234567890123
\`\`\`

> **📝 Nota**: Este campo es opcional pero recomendado para evitar duplicados y facilitar el seguimiento.

#### Campo: Tipo de turno

Para un turno general, selecciona:

\`\`\`
[●] General
[ ] Especial
\`\`\`

**Cuándo usar turno general**:
- ✅ Exámenes de sangre regulares
- ✅ Consultas estándar
- ✅ Procedimientos rutinarios
- ✅ Sin urgencia médica
- ✅ Pacientes sin prioridad especial

#### Campo: Observaciones (opcional)

Si hay información relevante:

\`\`\`
Ejemplos:
- "Paciente en ayunas"
- "Requiere silla de ruedas"
- "Habla solo inglés"
- "Primera vez en el instituto"
\`\`\`

### 2.3 Revisa la información

Antes de crear el turno, verifica:

- ✅ Nombre escrito correctamente (sin errores ortográficos)
- ✅ Documento capturado correctamente (si aplica)
- ✅ Tipo de turno correcto (General seleccionado)
- ✅ Observaciones relevantes añadidas

### 2.4 Haz clic en "Crear Turno"

Presiona el botón **"Crear Turno"** (botón verde).

### 2.5 Sistema asigna número automáticamente

El sistema genera el número de turno:

\`\`\`
Formato: A-XXX (para turnos generales)

Ejemplos:
- A-001 (primer turno del día)
- A-002 (segundo turno)
- A-123 (turno 123)
\`\`\`

**Lógica de numeración**:
- Prefijo **A** = General
- Número secuencial = Orden de llegada
- Reinicia cada día a las 00:00

### 2.6 Confirmación exitosa

Después de crear el turno verás:

1. ✅ **Mensaje de éxito**: Toast notification verde
   \`\`\`
   "Turno A-123 creado exitosamente"
   \`\`\`

2. ✅ **Modal de comprobante**: Vista previa del ticket
   ![Vista previa de comprobante](/docs/screenshots/turnos/03-comprobante-preview.png)

3. ✅ **Opciones disponibles**:
   - **Imprimir**: Imprime comprobante físico
   - **Cerrar**: Cierra modal y vuelve al formulario

### 2.7 Imprime el comprobante

#### Opción 1: Impresión directa

1. Haz clic en el botón **"Imprimir"**
2. Se abre ventana de impresión del navegador
3. Verifica que la impresora esté seleccionada
4. Haz clic en "Imprimir"
5. Entrega el comprobante al paciente

#### Opción 2: Vista previa antes de imprimir

1. En la ventana de impresión, haz clic en "Vista previa"
2. Verifica que toda la información sea visible
3. Ajusta configuración si es necesario
4. Imprime

### 2.8 Contenido del comprobante

El comprobante impreso incluye:

\`\`\`
═══════════════════════════════════════
  INSTITUTO NACIONAL DE ENFERMEDADES
         RESPIRATORIAS (INER)

  Sistema de Gestión de Turnos
═══════════════════════════════════════

  SU TURNO ES:

       🎫  A-123  🎫

  Tipo: GENERAL

  Fecha: 07/10/2025
  Hora: 09:45 AM

  Paciente: Juan Alberto Pérez González

───────────────────────────────────────
  INSTRUCCIONES:

  • Permanezca en la sala de espera
  • Observe la pantalla de TV
  • Cuando vea su número, diríjase
    al cubículo indicado
  • Turnos especiales tienen prioridad

  Tiempo estimado de espera: 15-20 min
───────────────────────────────────────

  ¡Gracias por su visita!
═══════════════════════════════════════
\`\`\`

### 2.9 Entrega e instrucciones al paciente

\`\`\`
Recepcionista: "Su turno es A-123. Por favor tome asiento en la sala de espera
y observe la pantalla. Cuando vea su número, se dirigirá al cubículo indicado.
El tiempo de espera es aproximadamente 15-20 minutos."

Paciente: "Gracias, ¿puedo salir a comprar algo?"

Recepcionista: "Puede salir brevemente, pero esté atento porque cuando llamemos
su turno y no se presente, pasaremos al siguiente paciente."
\`\`\`

> **💡 Tip**: Recomienda al paciente que permanezca en sala de espera o cerca. Los turnos se llaman en orden y no esperan indefinidamente.

### 2.10 El formulario se limpia automáticamente

Después de imprimir o cerrar el modal:
- ✅ Campos del formulario se limpian
- ✅ Sistema listo para registrar el siguiente paciente
- ✅ Contador de turnos en espera se actualiza

---`
      },
      {
        id: "step-3-create-special",
        title: "Paso 3: Crea un turno especial",
        description: "Registra un paciente con prioridad especial",
        content: `## Paso 3: Crea un turno especial

Los turnos especiales son para pacientes con prioridad o casos urgentes.

### 3.1 Escenarios para turno especial

#### Caso 1: Adulto mayor (>65 años)

\`\`\`
Paciente: "Buenos días, vengo para análisis"
Recepcionista: [Observa que es adulto mayor]
Recepcionista: "¿Cuántos años tiene señor/señora?"
Paciente: "72 años"
Recepcionista: "Le voy a asignar un turno especial para que sea atendido con prioridad"
\`\`\`

#### Caso 2: Mujer embarazada

\`\`\`
Paciente: "Hola, tengo cita para exámenes, estoy embarazada"
Recepcionista: "Perfecto, le asigno turno especial por su condición"
\`\`\`

#### Caso 3: Persona con discapacidad

\`\`\`
Paciente: [Llega en silla de ruedas]
Recepcionista: "Le asignaré turno especial para atención prioritaria"
\`\`\`

#### Caso 4: Urgencia médica

\`\`\`
Paciente: "Tengo una orden urgente del doctor, necesito examen urgente"
Recepcionista: [Revisa la orden]
Recepcionista: "Está bien, le doy turno especial"
\`\`\`

### 3.2 Criterios para asignar turno especial

**Asigna turno especial si**:
- ✅ Adulto mayor (>65 años)
- ✅ Mujer embarazada
- ✅ Persona con discapacidad
- ✅ Urgencia médica documentada
- ✅ Paciente con limitaciones de movilidad
- ✅ Indicación específica del médico tratante

**NO asignes turno especial si**:
- ❌ Paciente dice "tengo prisa" (sin justificación médica)
- ❌ "Tengo una reunión después" (no es criterio médico)
- ❌ "Llegué primero" (se respeta orden de llegada en generales)
- ❌ Solicitud por amistad o preferencia personal

> **⚠️ Importante**: Los turnos especiales son para casos que realmente lo requieren. Abusar de ellos genera molestia en pacientes con turno general.

### 3.3 Completa el formulario

Similar al turno general, pero con diferencia en el tipo:

#### Nombre y documento

Captura igual que en turno general:
\`\`\`
Nombre: María del Carmen Sánchez Ruiz
Documento: INE 9876543210987
\`\`\`

#### Tipo de turno

Selecciona **Especial**:

\`\`\`
[ ] General
[●] Especial
\`\`\`

#### Observaciones (MUY IMPORTANTE)

**Documenta el motivo**:

\`\`\`
Ejemplos:
- "Adulto mayor de 75 años"
- "Embarazo de 7 meses"
- "Paciente en silla de ruedas"
- "Urgencia médica - Orden del Dr. Gómez"
- "Discapacidad motriz"
\`\`\`

> **📝 Importante**: SIEMPRE documenta en observaciones el motivo del turno especial. Esto justifica la prioridad y queda registrado para auditoría.

### 3.4 Crea el turno especial

Haz clic en **"Crear Turno"**.

### 3.5 Numeración de turnos especiales

El sistema asigna número con formato diferente:

\`\`\`
Formato: E-XXX (para turnos especiales)

Ejemplos:
- E-001 (primer turno especial del día)
- E-002 (segundo turno especial)
- E-025 (turno especial 25)
\`\`\`

**Diferencias con turnos generales**:
- Prefijo **E** = Especial (vs **A** = General)
- Numeración independiente (E-001 puede existir junto con A-001)
- Color morado en pantallas (vs azul para generales)

### 3.6 Comprobante de turno especial

El comprobante es similar pero con diferencias visuales:

\`\`\`
═══════════════════════════════════════
  INSTITUTO NACIONAL DE ENFERMEDADES
         RESPIRATORIAS (INER)

  Sistema de Gestión de Turnos
═══════════════════════════════════════

  SU TURNO ES:

      🟣  E-012  🟣

  Tipo: ESPECIAL (PRIORITARIO)

  Fecha: 07/10/2025
  Hora: 10:15 AM

  Paciente: María del Carmen Sánchez Ruiz
  Motivo: Adulto mayor de 75 años

───────────────────────────────────────
  INSTRUCCIONES:

  • Su turno tiene PRIORIDAD
  • Será atendido antes que turnos generales
  • Observe la pantalla en sala de espera
  • Diríjase al cubículo cuando vea su número

  Tiempo estimado de espera: 5-10 min
───────────────────────────────────────

  ¡Gracias por su visita!
═══════════════════════════════════════
\`\`\`

**Diferencias visuales**:
- 🟣 Emoticones morados (vs azules)
- Texto "ESPECIAL (PRIORITARIO)"
- Motivo impreso en el comprobante
- Tiempo estimado menor

### 3.7 Instrucciones al paciente

\`\`\`
Recepcionista: "Señora María, su turno es E-012, que es un turno especial prioritario.
Esto significa que será atendida antes que los turnos generales. Por favor tome asiento
en la sala de espera y observe la pantalla. El tiempo de espera será aproximadamente
5 a 10 minutos."

Paciente: "Muchas gracias, muy amable"
\`\`\`

### 3.8 Prioridad en el sistema

Cuando el flebotomista llama al siguiente paciente:

\`\`\`
Sistema verifica:
1. ¿Hay turnos especiales (E-XXX) en espera? → Llama al más antiguo
2. Si no hay especiales → Llama al turno general (A-XXX) más antiguo
\`\`\`

**Ejemplo de orden de llamado**:

\`\`\`
Cola actual:
- A-100 (creado 09:00)
- A-101 (creado 09:05)
- E-005 (creado 09:10)
- A-102 (creado 09:12)
- E-006 (creado 09:15)

Orden de atención:
1° → E-005 (especial más antiguo)
2° → E-006 (especial siguiente)
3° → A-100 (general más antiguo, después de especiales)
4° → A-101
5° → A-102
\`\`\`

### 3.9 Gestión de expectativas

**Con el paciente con turno especial**:
\`\`\`
✅ "Será atendido con prioridad"
✅ "Su tiempo de espera será menor"
✅ "Los turnos especiales se llaman primero"
\`\`\`

**Con pacientes con turno general (si preguntan)**:
\`\`\`
✅ "Los turnos especiales son para adultos mayores, embarazadas y casos urgentes"
✅ "Se respeta el orden de llegada dentro de cada tipo"
✅ "Su turno será llamado después de los especiales que llegaron antes"
\`\`\`

> **💡 Tip**: Sé transparente sobre el sistema de prioridades. La mayoría de pacientes comprenden y aceptan que adultos mayores y embarazadas tengan prioridad.

### 3.10 Registro en auditoría

Cada turno especial queda registrado con:
- 👤 Usuario que lo creó (recepcionista)
- ⏰ Fecha y hora exacta
- 📝 Motivo documentado en observaciones
- 🎯 Tipo marcado como SPECIAL

Esto permite:
- Auditar que se usan correctamente
- Generar estadísticas de turnos especiales
- Justificar prioridades ante quejas
- Cumplir con normativas de atención prioritaria

---`
      },
      {
        id: "step-4-best-practices",
        title: "Paso 4: Mejores prácticas y flujo eficiente",
        description: "Optimiza el proceso de registro de pacientes",
        content: `## Paso 4: Mejores prácticas y flujo eficiente

Aprende técnicas para registrar pacientes de manera rápida y efectiva.

### 4.1 Flujo óptimo de atención en recepción

#### Paciente llega

\`\`\`
Recepcionista: "Buenos días, ¿en qué puedo ayudarle?"
Paciente: "Vengo para examen de sangre"
\`\`\`

#### Evaluación rápida (5 segundos)

\`\`\`
Recepcionista observa:
- ¿Es adulto mayor? → Turno especial
- ¿Es mujer embarazada? → Turno especial
- ¿Tiene discapacidad visible? → Turno especial
- ¿Ninguna de las anteriores? → Turno general
\`\`\`

#### Captura de datos (30 segundos)

\`\`\`
Recepcionista: "¿Me puede dar su nombre completo?"
Paciente: [Nombre]
Recepcionista: [Escribe en sistema]

Recepcionista: "¿Trae alguna identificación?"
Paciente: [Muestra INE]
Recepcionista: [Captura número]
\`\`\`

#### Creación e impresión (15 segundos)

\`\`\`
1. Seleccionar tipo de turno
2. Clic en "Crear Turno"
3. Clic en "Imprimir"
4. Entrega comprobante al paciente
\`\`\`

#### Instrucciones (20 segundos)

\`\`\`
Recepcionista: "Su turno es A-123. Tome asiento en la sala de espera y observe
la pantalla. Cuando vea su número, diríjase al cubículo indicado. El tiempo
aproximado es 15-20 minutos."
\`\`\`

**Tiempo total ideal**: 70 segundos (~1 minuto por paciente)

### 4.2 Técnicas de captura rápida

#### Nombre completo

**Método eficiente**:
\`\`\`
Recepcionista: "¿Nombre completo como aparece en su identificación?"
Paciente: "Juan Alberto Pérez González"
Recepcionista: [Escribe mientras el paciente habla]
\`\`\`

**Evita**:
❌ Preguntar "¿Cuál es su primer nombre? ¿Segundo nombre? ¿Apellido paterno?"
✅ Pregunta todo de una vez para ahorrar tiempo

#### Documento de identificación

**Método eficiente**:
\`\`\`
Recepcionista: "¿Trae identificación? Puedo capturar el número"
[Si trae] → Captura número de INE/CURP
[Si no trae] → Deja campo vacío, no es obligatorio
\`\`\`

**Evita**:
❌ Insistir mucho si el paciente no trae identificación
✅ Es opcional, no retrases el registro

### 4.3 Validación de datos

Antes de crear el turno, valida mentalmente:

| Dato | Validación rápida |
|------|------------------|
| **Nombre** | Al menos 2 palabras, sin números |
| **Documento** | 13-18 caracteres (si se capturó) |
| **Tipo** | Coincide con evaluación visual (adulto mayor = especial) |
| **Observaciones** | Si es especial, hay motivo documentado |

> **💡 Tip**: No busques perfección. Si el nombre tiene un error menor, el flebotomista puede llamar al paciente de todas formas. Velocidad > Perfección en campos no críticos.

### 4.4 Gestión de situaciones especiales

#### Paciente no habla español

\`\`\`
Situación: Paciente habla solo inglés/otro idioma

Acción:
1. Registra el nombre como aparece en identificación
2. En observaciones: "Habla solo inglés"
3. Informa al flebotomista verbalmente o por interno
4. Considera usar traductor de Google para instrucciones básicas
\`\`\`

#### Paciente sin identificación

\`\`\`
Situación: No trae INE, CURP ni ninguna identificación

Acción:
1. Captura solo el nombre completo que menciona
2. Deja campo de documento vacío
3. No es impedimento para crear turno
4. Sistema permite turnos sin documento
\`\`\`

#### Paciente con nombre muy largo

\`\`\`
Situación: Nombre de 50+ caracteres

Acción:
1. Captura completo si es posible
2. Si el sistema tiene límite, usa abreviaciones lógicas:
   "María de los Ángeles" → "María de los A."
3. Documenta en observaciones si es relevante
\`\`\`

#### Paciente pide turno para otra persona

\`\`\`
Situación: "Vengo a sacar turno para mi mamá que viene en camino"

Recomendación:
✅ Acepta: Si la persona llegará pronto (5-10 min)
❌ Rechaza educadamente: Si llegará mucho después

Razón: Si el paciente no está cuando lo llamen, pierde turno y genera ineficiencia
\`\`\`

### 4.5 Coordinación con flebotomistas

#### Comunicación de casos especiales

Si registras un caso que requiere atención especial:

\`\`\`
1. Crea el turno normalmente
2. Usa el chat interno o walkie-talkie para avisar:
   "E-012 es paciente en silla de ruedas, requiere rampa"
3. O marca en observaciones y confía en que el flebotomista lo leerá
\`\`\`

#### Información de demanda

Mantén informado al equipo:

\`\`\`
Ejemplos:
- "Hay 15 personas esperando en sala"
- "Llegó grupo grande, espera aumento de demanda"
- "Día tranquilo, solo 5 en espera"
\`\`\`

### 4.6 Manejo de múltiples pacientes simultáneos

Si llegan varios pacientes al mismo tiempo:

#### Priorización en recepción

\`\`\`
1° → Adultos mayores o embarazadas (turno especial)
2° → Orden de llegada para el resto
\`\`\`

#### Delegación (si hay dos recepcionistas)

\`\`\`
Recepcionista 1: Atiende adultos mayores/embarazadas (especiales)
Recepcionista 2: Atiende resto de pacientes (generales)

Resultado: Flujo más rápido, menos tiempo de espera
\`\`\`

#### Comunicación en fila

\`\`\`
Recepcionista: "Buenos días a todos. Atenderé por orden de llegada.
Adultos mayores y embarazadas tienen prioridad. Gracias por su paciencia."
\`\`\`

### 4.7 Horarios pico y estrategias

#### Identificar horarios pico

Basado en estadísticas del módulo de Estadísticas:

\`\`\`
Típicamente:
- 🔴 08:00-10:00 (apertura, mayor demanda)
- 🟡 10:00-12:00 (demanda media)
- 🔴 12:00-14:00 (pico de mediodía)
- 🟢 14:00-17:00 (demanda baja)
- 🟡 17:00-19:00 (cierre, demanda media)
\`\`\`

#### Estrategias para horarios pico

**Antes del pico** (7:45 AM):
\`\`\`
- Verificar que impresora funciona
- Tener papel suficiente
- Revisar que todos los cubículos están activos
- Preparar área de recepción
\`\`\`

**Durante el pico** (8:00-10:00 AM):
\`\`\`
- Registra pacientes lo más rápido posible
- Minimiza conversación no esencial
- Enfócate en velocidad sin sacrificar amabilidad
- Si hay dos recepcionistas, ambos registran turnos
\`\`\`

**Después del pico** (10:00 AM):
\`\`\`
- Revisa que todos los turnos se crearon correctamente
- Verifica que no haya duplicados
- Toma descanso si es posible
\`\`\`

### 4.8 Checklist diario del recepcionista

#### Al iniciar turno (7:00 AM)

\`\`\`
[ ] Iniciar sesión en el sistema
[ ] Verificar que módulo de turnos carga correctamente
[ ] Probar impresora (imprimir comprobante de prueba)
[ ] Verificar papel y tinta suficiente
[ ] Revisar que cubículos estén activos (consultar con flebotomistas)
[ ] Limpiar escritorio de recepción
[ ] Preparar área de espera (sillas, señalización)
\`\`\`

#### Durante turno

\`\`\`
[ ] Registrar cada paciente que llega
[ ] Mantener área de recepción ordenada
[ ] Responder preguntas de pacientes
[ ] Coordinar con flebotomistas si hay dudas
[ ] Monitorear tiempo de espera (si es excesivo, informar)
\`\`\`

#### Al finalizar turno (7:00 PM)

\`\`\`
[ ] Verificar que no haya pacientes pendientes de registro
[ ] Confirmar con flebotomistas que todos fueron atendidos
[ ] Cerrar sesión en el sistema
[ ] Apagar impresora
[ ] Dejar área limpia y ordenada
[ ] Documentar incidencias del día (si las hubo)
\`\`\`

### 4.9 Métricas de rendimiento de recepción

El sistema puede rastrear (si está configurado):

\`\`\`
📊 Métricas ideales:
- Turnos registrados por hora: 15-30 (depende de demanda)
- Tiempo promedio de registro: 60-90 segundos
- Errores en registros: <5% (nombres incorrectos, tipo equivocado)
- Satisfacción de pacientes: >90% positiva
\`\`\`

---

## ✅ ¡Has completado el tutorial de creación de turnos!

Ahora dominas el proceso completo de registro de pacientes y gestión de recepción.

### Resumen de lo aprendido

- ✅ Acceder al módulo y navegar la interfaz
- ✅ Crear turnos generales para atención regular
- ✅ Crear turnos especiales para casos prioritarios
- ✅ Imprimir comprobantes con información clara
- ✅ Aplicar mejores prácticas para flujo eficiente
- ✅ Manejar situaciones especiales con confianza
- ✅ Coordinar con flebotomistas efectivamente

### Próximos pasos

- 🎫 Practica registrando pacientes hasta dominar el flujo
- 📊 Revisa estadísticas para identificar horarios pico
- 👥 Coordina con flebotomistas para optimizar atención
- 📺 Verifica que pacientes puedan ver sus turnos en pantallas
- 🔄 Sugiere mejoras al proceso basadas en tu experiencia

`
      }
    ],

    features: [
      {
        icon: "🎫",
        title: "Asignación automática de números",
        description: "Sistema genera números únicos secuenciales automáticamente. Formato A-XXX para generales, E-XXX para especiales."
      },
      {
        icon: "⚡",
        title: "Registro rápido de pacientes",
        description: "Formulario simple y optimizado. Registra pacientes en menos de 90 segundos. Interfaz intuitiva para recepcionistas."
      },
      {
        icon: "🟣",
        title: "Sistema de prioridades",
        description: "Turnos especiales (E-XXX) para adultos mayores, embarazadas, casos urgentes. Prioridad automática en el sistema."
      },
      {
        icon: "🖨️",
        title: "Impresión de comprobantes",
        description: "Genera tickets físicos con número de turno, fecha, hora e instrucciones. Diseño claro y profesional."
      },
      {
        icon: "📊",
        title: "Vista previa de cola en tiempo real",
        description: "Muestra turnos en espera, tiempo estimado, cubículos activos. Información actualizada automáticamente."
      },
      {
        icon: "📝",
        title: "Campo de observaciones",
        description: "Captura información adicional relevante: motivo de prioridad, necesidades especiales, alertas para flebotomistas."
      },
      {
        icon: "✅",
        title: "Validaciones automáticas",
        description: "Sistema valida datos antes de crear turno. Previene errores comunes: nombres vacíos, formatos incorrectos."
      },
      {
        icon: "🔄",
        title: "Reinicio automático diario",
        description: "Numeración se reinicia cada día a las 00:00. Empieza cada jornada con A-001 y E-001 frescos."
      },
      {
        icon: "📋",
        title: "Historial de turnos creados",
        description: "Lista de últimos turnos registrados visible en pantalla. Facilita verificación y seguimiento."
      },
      {
        icon: "🎨",
        title: "Interfaz amigable para recepción",
        description: "Diseño pensado para personal de recepción. Botones grandes, flujo claro, sin complejidad innecesaria."
      }
    ],

    tips: [
      {
        icon: "💡",
        title: "Captura nombre mientras el paciente habla",
        description: "No esperes a que termine de decir su nombre. Escribe simultáneamente para ahorrar tiempo."
      },
      {
        icon: "🎯",
        title: "Documento de identificación es opcional",
        description: "No retrases el registro si el paciente no trae INE. El nombre es suficiente para crear el turno."
      },
      {
        icon: "🟣",
        title: "Documenta SIEMPRE el motivo de turnos especiales",
        description: "En observaciones, anota por qué es especial: 'Adulto mayor 75 años', 'Embarazo', etc. Para auditoría."
      },
      {
        icon: "🖨️",
        title: "Verifica que impresora funcione al inicio del día",
        description: "Imprime un comprobante de prueba a las 7 AM. Evita problemas durante horario pico."
      },
      {
        icon: "📊",
        title: "Monitorea tiempo de espera en pantalla",
        description: "Si ves más de 30 minutos de espera, informa a coordinador. Puede activar más cubículos."
      },
      {
        icon: "🚀",
        title: "Velocidad en horas pico, calidad en horas valle",
        description: "8-10 AM: registra rápido. 2-5 PM: puedes ser más detallado con los datos."
      },
      {
        icon: "👥",
        title: "Comunica casos especiales a flebotomistas",
        description: "Si registras paciente en silla de ruedas, avisa al equipo por interno o chat."
      },
      {
        icon: "🔢",
        title: "Si llegas a E-050, considera más cubículos SPECIAL",
        description: "Muchos turnos especiales indican que necesitas más capacidad prioritaria."
      },
      {
        icon: "📱",
        title: "Ten manual de instrucciones a la mano",
        description: "Imprime esta guía o márca la como favorita. Útil cuando capacites a nuevo personal."
      }
    ],

    warnings: [
      {
        icon: "⚠️",
        title: "No abuses de turnos especiales",
        description: "Solo asigna turno especial si cumple criterios médicos. Abusar genera molestia en pacientes generales."
      },
      {
        icon: "🚫",
        title: "'Tengo prisa' no es motivo para turno especial",
        description: "Todos tienen prisa. Solo razones médicas (adulto mayor, embarazo, etc.) justifican prioridad."
      },
      {
        icon: "🔴",
        title: "Sin cubículos activos no puedes registrar turnos",
        description: "Antes de abrir recepción, verifica que al menos un cubículo esté activo. Si no, los turnos no podrán atenderse."
      },
      {
        icon: "📋",
        title: "No registres turnos para personas que no están presentes",
        description: "Si el paciente no está en sala de espera, no crees el turno. Llegan después y pierden su lugar en cola."
      },
      {
        icon: "🖨️",
        title: "Impresora sin papel causa retrasos grandes",
        description: "Siempre ten papel extra. Quedarse sin papel en hora pico genera caos en recepción."
      },
      {
        icon: "⏰",
        title: "Pacientes que salen pierden su lugar si no regresan",
        description: "Advierte claramente: si salen y no están cuando los llamen, pasan al siguiente. No hay re-llamados."
      },
      {
        icon: "🔢",
        title: "Números no se pueden cambiar después de creados",
        description: "Una vez asignado A-123, no puedes cambiarlo a E-123. Elige el tipo correcto desde el inicio."
      }
    ],

    screenshots: [
      {
        step: 1,
        filename: "01-turnos-initial.png",
        title: "Vista inicial del módulo",
        description: "Pantalla principal de creación de turnos con panel de información y formulario de registro listo",
        path: "/docs/screenshots/turnos/01-turnos-initial.png",
        tags: ["inicial", "formulario", "vista-general"]
      },
      {
        step: 2,
        filename: "02-turnos-form.png",
        title: "Formulario de registro completo",
        description: "Formulario con todos los campos visibles: nombre, documento, tipo de turno, observaciones y botón de creación",
        path: "/docs/screenshots/turnos/02-turnos-form.png",
        tags: ["formulario", "campos", "registro"]
      },
      {
        step: 3,
        filename: "03-comprobante-preview.png",
        title: "Vista previa de comprobante",
        description: "Modal mostrando comprobante de turno antes de imprimir, con número asignado e información del paciente",
        path: "/docs/screenshots/turnos/03-comprobante-preview.png",
        tags: ["comprobante", "preview", "impresión"]
      },
      {
        step: 4,
        filename: "04-queue-info.png",
        title: "Panel de información de cola",
        description: "Sección superior mostrando métricas en tiempo real: turnos en espera, tiempo estimado, cubículos activos",
        path: "/docs/screenshots/turnos/04-queue-info.png",
        tags: ["cola", "métricas", "tiempo-real"]
      },
      {
        step: 5,
        filename: "05-recent-turns.png",
        title: "Listado de turnos recientes",
        description: "Lista de últimos turnos creados con número, tipo, estado y hora, actualizada automáticamente",
        path: "/docs/screenshots/turnos/05-recent-turns.png",
        tags: ["historial", "turnos", "listado"]
      }
    ]
  }
};

// Actualizar el módulo en el array
fullDocumentation[turnosModuleIndex] = updatedTurnosModule;

// Guardar el archivo actualizado
fs.writeFileSync(fullDocPath, JSON.stringify(fullDocumentation, null, 2));

console.log('\n✅ Documentación de Turnos creada exitosamente');
console.log('📚 Formato: Tutorial completo paso a paso');
console.log('📊 Total de secciones: 4 pasos detallados');
console.log('📸 Total de screenshots: 5 capturas con contexto');
console.log('💡 Total de tips: 9 consejos prácticos');
console.log('⚠️  Total de warnings: 7 advertencias importantes');
console.log('🎯 Total de features: 10 características destacadas');
console.log('\n📁 Archivo actualizado:', fullDocPath);
console.log('\n🎉 Módulo de Turnos documentado completamente!');
