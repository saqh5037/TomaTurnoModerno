const fs = require('fs');
const path = require('path');

const fullDocPath = path.join(__dirname, '../lib/docs/fullDocumentation.json');
const fullDocumentation = JSON.parse(fs.readFileSync(fullDocPath, 'utf8'));

// Encontrar el módulo de cola
const colaModuleIndex = fullDocumentation.findIndex(m => m.moduleId === 'cola');

if (colaModuleIndex === -1) {
  console.error('❌ Módulo de cola no encontrado');
  process.exit(1);
}

// Crear documentación completa para Cola
const updatedColaModule = {
  ...fullDocumentation[colaModuleIndex],
  content: {
    overview: `# Gestión de Cola

El módulo de **Gestión de Cola** es la interfaz pública donde los pacientes visualizan en tiempo real el estado de la cola de espera. Este módulo se muestra en pantallas de TV en las salas de espera y permite a los pacientes saber cuándo serán llamados para atención.

## ¿Qué aprenderás en esta guía?

En este tutorial aprenderás a:
- ✅ Entender el funcionamiento del sistema de cola pública
- ✅ Configurar pantallas de TV para visualización
- ✅ Interpretar el estado de los turnos en pantalla
- ✅ Comprender la actualización en tiempo real (SSE)
- ✅ Gestionar prioridades (turnos especiales vs generales)
- ✅ Solucionar problemas comunes de visualización
- ✅ Optimizar la experiencia del paciente en sala de espera

## Antes de comenzar

### Requisitos previos

Para implementar este módulo necesitas:
- ✓ Sistema de turnos operativo con cubículos activos
- ✓ Al menos una pantalla de TV o monitor
- ✓ Conexión de red estable (para actualizaciones en tiempo real)
- ✓ Navegador web compatible (Chrome, Firefox, Edge recomendados)

### Conceptos clave

**Cola de espera**: Lista ordenada de pacientes que esperan ser atendidos. Se actualiza en tiempo real conforme se llaman turnos.

**Turno**: Número único asignado a cada paciente al registrarse. Identifica su posición en la cola y cubículo de atención.

**Estado del turno**:
- **WAITING**: Paciente en espera, aún no ha sido llamado
- **CALLED**: Paciente llamado, debe dirigirse al cubículo indicado
- **IN_ATTENTION**: Paciente siendo atendido actualmente
- **COMPLETED**: Atención finalizada

**Actualización en tiempo real (SSE)**: Tecnología que permite actualizar automáticamente las pantallas sin recargar la página. Cuando un flebotomista llama a un paciente, todas las pantallas se actualizan instantáneamente.

**Prioridad de turnos**: Los turnos SPECIAL tienen prioridad visual y se muestran destacados en la interfaz.

---

## Tutorial completo paso a paso`,

    sections: [
      {
        id: "step-1-access",
        title: "Paso 1: Accede a la vista de cola pública",
        description: "Configura y accede a la interfaz de visualización para pacientes",
        content: `## Paso 1: Accede a la vista de cola pública

La cola pública es una interfaz diseñada específicamente para mostrarse en pantallas de TV en salas de espera.

### 1.1 URL de acceso

La cola pública está disponible en:

\`\`\`
http://localhost:3005/queue
\`\`\`

O en producción:

\`\`\`
https://tu-dominio.com/queue
\`\`\`

> **💡 Tip**: Puedes acceder desde cualquier navegador. No requiere autenticación, es una vista pública.

### 1.2 Abre la URL en el navegador

En la computadora conectada a la pantalla de TV:

1. Abre Chrome, Firefox o Edge (navegadores recomendados)
2. Ingresa la URL \`http://localhost:3005/queue\`
3. Presiona Enter

![Vista inicial de cola](/docs/screenshots/cola/01-queue-initial.png)

### 1.3 Activa modo pantalla completa

Para una mejor experiencia en TV:

**En Chrome/Edge**:
\`\`\`
Presiona: F11
O: Clic derecho → Pantalla completa
\`\`\`

**En Firefox**:
\`\`\`
Presiona: F11
\`\`\`

**Atajos de teclado**:
- **F11**: Activar/desactivar pantalla completa
- **ESC**: Salir de pantalla completa
- **F5**: Recargar página (si es necesario)

> **📺 Configuración de TV**: Asegúrate de que la TV esté configurada en la entrada HDMI correcta donde está conectada la computadora.

### 1.4 Componentes de la interfaz

La vista de cola muestra:

#### 🎯 Encabezado institucional

En la parte superior:
- **Logo de INER**: Identidad institucional
- **Título**: "Sistema de Gestión de Turnos"
- **Subtítulo**: "Sala de Espera"

#### 📋 Sección "Turno Actual"

Muestra el turno que está siendo llamado en este momento:
- **Número de turno**: Grande y destacado (ej: "A-123")
- **Cubículo asignado**: "Diríjase al Cubículo 3"
- **Estado**: Badge indicando el estado actual
- **Animación**: Parpadeo o resaltado para llamar la atención

#### 📊 Sección "Próximos Turnos"

Lista de turnos en espera:
- **Número de turno**: Identificador del paciente
- **Estado**: Badge visual (Amarillo=WAITING, Verde=CALLED)
- **Cubículo**: Muestra el cubículo asignado cuando son llamados
- **Orden**: Organizados por prioridad (SPECIAL primero, luego GENERAL)

#### 🔄 Indicador de actualización

Pequeño indicador visual que muestra:
- 🟢 Verde: Conexión activa, recibiendo actualizaciones
- 🔴 Rojo: Sin conexión, intentando reconectar
- ⚠️ Amarillo: Reconectando...

![Interfaz completa de cola](/docs/screenshots/cola/02-queue-interface.png)

### 1.5 Verificación de funcionamiento

Para confirmar que funciona correctamente:

1. ✅ La página carga sin errores
2. ✅ Se muestran turnos activos (si existen)
3. ✅ El indicador de conexión está verde
4. ✅ No hay mensajes de error en pantalla

> **⚠️ Importante**: Si no ves turnos, es porque aún no se han creado. Esto es normal al iniciar el sistema.

### 1.6 Configuración de múltiples pantallas

Si tienes varias salas de espera:

1. Abre la misma URL en cada computadora/TV
2. Todas las pantallas se sincronizarán automáticamente
3. Cuando se llame un turno, TODAS las pantallas se actualizarán simultáneamente

\`\`\`
Ejemplo de configuración:
- TV 1 (Sala A): http://localhost:3005/queue
- TV 2 (Sala B): http://localhost:3005/queue
- TV 3 (Recepción): http://localhost:3005/queue
\`\`\`

> **💡 Tip**: Todas las pantallas muestran la misma información. No hay vistas diferenciadas por sala (por diseño).

---`
      },
      {
        id: "step-2-realtime",
        title: "Paso 2: Comprende las actualizaciones en tiempo real",
        description: "Aprende cómo funciona la sincronización automática",
        content: `## Paso 2: Comprende las actualizaciones en tiempo real

El sistema de cola usa tecnología SSE (Server-Sent Events) para actualizaciones instantáneas sin recargar la página.

### 2.1 ¿Qué es SSE?

**Server-Sent Events (SSE)** es una tecnología web que permite:

- 🔄 Actualizaciones automáticas desde el servidor al cliente
- ⚡ Sin necesidad de recargar la página
- 🔌 Conexión persistente y ligera
- 📡 Ideal para datos que cambian frecuentemente

**Ventajas sobre otras tecnologías**:
- ✅ Más simple que WebSockets
- ✅ Funciona sobre HTTP estándar
- ✅ Reconexión automática si se pierde conexión
- ✅ Menor consumo de recursos

### 2.2 Flujo de actualización

Cuando un flebotomista llama a un paciente:

\`\`\`
1. Flebotomista hace clic en "Llamar siguiente paciente" en su módulo
   ↓
2. Servidor actualiza el estado del turno en la base de datos
   ↓
3. Servidor envía evento SSE a todas las pantallas conectadas
   ↓
4. Pantallas de TV reciben el evento y actualizan la interfaz
   ↓
5. Pacientes ven su turno llamado en tiempo real (<1 segundo)
\`\`\`

![Flujo de actualización](/docs/screenshots/cola/03-update-flow.png)

### 2.3 Estados de conexión

#### 🟢 Conectado

**Indicadores**:
- Punto verde en esquina superior derecha
- Mensaje: "Conectado"
- Actualizaciones funcionando normalmente

**Qué significa**:
- ✅ Conexión SSE activa
- ✅ Recibiendo eventos en tiempo real
- ✅ Sistema funcionando correctamente

#### 🔴 Desconectado

**Indicadores**:
- Punto rojo en esquina superior derecha
- Mensaje: "Desconectado - Reconectando..."
- Actualizaciones pausadas temporalmente

**Causas comunes**:
- 🌐 Problemas de red
- 🔌 Servidor reiniciándose
- 💻 Computadora en suspensión
- 🔧 Mantenimiento del sistema

**Qué hacer**:
- ⏰ Espera 5-10 segundos (reconexión automática)
- 🔄 Si no reconecta, recarga la página (F5)
- 📞 Si persiste, contacta a soporte técnico

#### ⚠️ Reconectando

**Indicadores**:
- Punto amarillo en esquina superior derecha
- Mensaje: "Reconectando..."
- Sistema intentando restablecer conexión

**Qué significa**:
- 🔄 Reconexión automática en proceso
- ⏳ Puede tomar 5-15 segundos
- 📡 No requiere intervención manual

### 2.4 Eventos que actualizan la pantalla

La cola se actualiza automáticamente cuando:

| Evento | Qué sucede en pantalla |
|--------|------------------------|
| **Turno llamado** | Aparece en "Turno Actual" con cubículo asignado |
| **Nuevo turno creado** | Se agrega a "Próximos Turnos" |
| **Turno completado** | Desaparece de la lista visible |
| **Estado cambiado** | Badge de estado se actualiza |
| **Cubículo asignado** | Se muestra el número de cubículo |

### 2.5 Prioridad en actualizaciones

El sistema maneja prioridades para mostrar información relevante:

#### Turnos SPECIAL (Prioritarios)

- 🟣 Se muestran primero en la lista
- ⚡ Tienen prioridad para ser llamados
- 🎯 Identificados con badge morado "ESPECIAL"

#### Turnos GENERAL (Regulares)

- 🔵 Se muestran después de los especiales
- ⏳ Siguen orden de llegada
- 📋 Identificados con badge azul "GENERAL"

#### Orden final en pantalla

\`\`\`
1. Turno Actual (el que está siendo llamado ahora)
   ↓
2. Turnos SPECIAL en espera (ordenados por hora de creación)
   ↓
3. Turnos GENERAL en espera (ordenados por hora de creación)
\`\`\`

![Ejemplo de prioridades](/docs/screenshots/cola/04-priority-order.png)

### 2.6 Sincronización entre pantallas

Si tienes múltiples pantallas:

- 📺 Todas reciben el mismo evento SSE simultáneamente
- 🔄 Todas se actualizan al mismo tiempo (<1 segundo)
- ✅ No hay inconsistencias entre pantallas
- 🎯 Los pacientes ven la misma información en cualquier sala

**Ejemplo de sincronización**:

\`\`\`
10:30:00 - Flebotomista llama turno A-123
10:30:00.5 - Servidor envía evento SSE
10:30:01 - TV 1 actualiza
10:30:01 - TV 2 actualiza
10:30:01 - TV 3 actualiza
\`\`\`

> **💡 Tip**: La sincronización es casi instantánea. Los pacientes ven su turno llamado en menos de 1 segundo.

### 2.7 Manejo de errores de conexión

El sistema tiene mecanismos de recuperación automática:

#### Reconexión exponencial

\`\`\`
Intento 1: Espera 1 segundo → Reintentar
Intento 2: Espera 2 segundos → Reintentar
Intento 3: Espera 4 segundos → Reintentar
Intento 4: Espera 8 segundos → Reintentar
Máximo: Espera 30 segundos entre intentos
\`\`\`

#### Recuperación de datos

Cuando reconecta:
- 🔄 Solicita estado actual de la cola
- ✅ Sincroniza con datos actualizados del servidor
- 📊 Muestra la información más reciente
- ⏳ No se pierden turnos ni actualizaciones

> **⚠️ Importante**: Aunque se pierda conexión temporalmente, el sistema recupera el estado correcto al reconectar.

---`
      },
      {
        id: "step-3-patient-view",
        title: "Paso 3: Interpreta la vista del paciente",
        description: "Entiende qué ve y cómo interactúa el paciente con la cola",
        content: `## Paso 3: Interpreta la vista del paciente

Aprende a interpretar la información desde la perspectiva del paciente.

### 3.1 Flujo de experiencia del paciente

#### Momento 1: Registro (Recepción)

El paciente llega a recepción y recibe su número de turno:

\`\`\`
Paciente: "Buenos días, vengo para examen de sangre"
Recepcionista: [Crea turno en sistema]
Recepcionista: "Su turno es A-123. Por favor espere en la sala"
Paciente: [Recibe comprobante impreso con número A-123]
\`\`\`

#### Momento 2: Espera (Sala de espera)

El paciente observa la pantalla de TV:

![Vista de espera del paciente](/docs/screenshots/cola/05-patient-waiting.png)

**Qué ve el paciente**:

1. **Turno Actual**: "A-120 - Cubículo 2"
   - Entiende: "Aún no es mi turno, están atendiendo al A-120"

2. **Próximos Turnos**:
   \`\`\`
   A-121 - WAITING (esperando)
   A-122 - WAITING (esperando)
   A-123 - WAITING (esperando) ← Su turno
   \`\`\`
   - Entiende: "Soy el tercero en la lista"

#### Momento 3: Llamado (Turno activo)

La pantalla se actualiza y muestra:

\`\`\`
TURNO ACTUAL
  A-123
Diríjase al Cubículo 3
\`\`\`

![Turno llamado](/docs/screenshots/cola/06-turn-called.png)

**Qué debe hacer el paciente**:
- ✅ Identificar que es su turno (A-123)
- ✅ Leer el cubículo asignado (Cubículo 3)
- ✅ Dirigirse al cubículo indicado
- ✅ Presentarse con el flebotomista

#### Momento 4: Atención (En cubículo)

El paciente está siendo atendido:
- Su turno ya no aparece en "Próximos Turnos"
- Puede aparecer brevemente en "Turno Actual" o desaparecer
- El siguiente paciente es llamado

### 3.2 Interpretación de badges de estado

Los pacientes ven badges de colores que indican el estado:

#### 🟡 WAITING (Amarillo)

**Significado**: "Tu turno está en espera"

\`\`\`
A-123 | WAITING | -
\`\`\`

**Qué debe hacer el paciente**:
- ⏰ Permanecer en sala de espera
- 👀 Estar atento a la pantalla
- 🔊 Escuchar anuncios (si hay sistema de audio)

#### 🟢 CALLED (Verde)

**Significado**: "Tu turno ha sido llamado"

\`\`\`
A-123 | CALLED | Cubículo 3
\`\`\`

**Qué debe hacer el paciente**:
- 🚶 Dirigirse al cubículo indicado inmediatamente
- 📄 Llevar su comprobante de turno
- 🚪 Tocar la puerta o esperar indicación del flebotomista

#### 🔵 IN_ATTENTION (Azul)

**Significado**: "Turno en atención actualmente"

\`\`\`
A-123 | EN ATENCIÓN | Cubículo 3
\`\`\`

**Qué significa para otros pacientes**:
- ⏳ Ese cubículo está ocupado
- 📊 Avance en la cola
- 🔜 Pronto llamarán al siguiente

### 3.3 Tipos de turno visibles

#### 🔵 Turno GENERAL (Azul)

**Características visuales**:
- Badge azul con texto "GENERAL"
- Número estándar: "A-123", "A-124", etc.
- Se muestran después de turnos especiales

**Tiempo de espera típico**: 15-25 minutos (depende de volumen)

#### 🟣 Turno SPECIAL (Morado)

**Características visuales**:
- Badge morado con texto "ESPECIAL"
- Número con prefijo: "E-001", "E-002", etc.
- Se muestran primero en la lista (prioridad)
- Pueden tener ícono de estrella ⭐

**Tiempo de espera típico**: 5-15 minutos (atención prioritaria)

**Motivos de turno especial**:
- 🏥 Pacientes prioritarios (adultos mayores, embarazadas)
- 🚑 Casos urgentes
- 🎯 Procedimientos especiales
- ⏰ Citas programadas con horario específico

![Diferencia entre turnos](/docs/screenshots/cola/07-turn-types.png)

### 3.4 Estimación de tiempo de espera

Aunque el sistema no muestra tiempo exacto, el paciente puede estimarlo:

#### Fórmula mental del paciente

\`\`\`
Turnos delante de mí × Tiempo promedio por atención = Tiempo estimado

Ejemplo:
3 turnos delante × 8 minutos = ~24 minutos de espera
\`\`\`

#### Factores que afectan el tiempo

| Factor | Impacto en espera |
|--------|-------------------|
| **Cubículos activos** | + cubículos = - espera |
| **Turnos especiales delante** | Retrasan turnos generales |
| **Hora del día** | Mañanas más concurridas |
| **Complejidad del caso** | Algunos pacientes toman más tiempo |

> **💡 Tip para pacientes**: Si ves muchos turnos especiales (morados) delante, tu espera será mayor aunque tu número sea próximo.

### 3.5 Señalización complementaria

Para mejorar la experiencia del paciente, se recomienda:

#### Carteles físicos en sala de espera

\`\`\`
┌─────────────────────────────────────┐
│  OBSERVE LA PANTALLA                │
│  🔵 TURNO GENERAL - Espera estándar │
│  🟣 TURNO ESPECIAL - Prioritario    │
│                                     │
│  Cuando vea su número:              │
│  ✅ Verifique el cubículo asignado  │
│  ✅ Diríjase de inmediato           │
│  ✅ Presente su comprobante         │
└─────────────────────────────────────┘
\`\`\`

#### Indicadores de dirección

- 🚪 Flechas señalando ubicación de cubículos
- 🔢 Números en puertas de cubículos
- 🗺️ Mapa de la sala (opcional)

### 3.6 Problemas comunes desde la perspectiva del paciente

#### "No veo mi turno en la pantalla"

**Posibles causas**:
- 🔍 El turno ya fue llamado y completado
- ⏰ El paciente llegó tarde
- 📱 Error al registrar turno
- 🖥️ Pantalla sin conexión

**Qué hacer**:
- Acercarse a recepción
- Mostrar comprobante de turno
- Solicitar verificación en sistema

#### "Mi turno fue saltado"

**Posibles causas**:
- 🟣 Turnos especiales tuvieron prioridad
- ⏭️ Sistema detectó ausencia del paciente
- 🔄 Turno fue llamado pero el paciente no se presentó

**Qué hacer**:
- Informar al personal inmediatamente
- Mostrar comprobante
- Solicitar reasignación

#### "La pantalla no se actualiza"

**Posibles causas**:
- 🔴 Conexión SSE perdida
- 💻 Computadora en suspensión
- 🌐 Problemas de red

**Qué hacer**:
- Verificar indicador de conexión (esquina superior)
- Esperar 30 segundos a reconexión automática
- Notificar al personal si persiste

---`
      },
      {
        id: "step-4-troubleshooting",
        title: "Paso 4: Soluciona problemas comunes",
        description: "Resuelve incidencias técnicas en la visualización de cola",
        content: `## Paso 4: Soluciona problemas comunes

Aprende a identificar y resolver los problemas más frecuentes del sistema de cola.

### 4.1 Pantalla no carga / Error de conexión

#### Síntomas

- Pantalla en blanco
- Mensaje: "No se puede conectar al servidor"
- Error 404 o 500

#### Causas posibles

| Causa | Probabilidad | Solución |
|-------|-------------|----------|
| Servidor apagado | Alta | Iniciar servidor: \`npm run start:prod\` |
| URL incorrecta | Media | Verificar: \`http://localhost:3005/queue\` |
| Firewall bloqueando | Baja | Configurar excepción para puerto 3005 |
| Problemas de red | Media | Verificar conectividad con \`ping localhost\` |

#### Pasos de diagnóstico

1. **Verifica que el servidor esté corriendo**

\`\`\`bash
# En el servidor
pm2 status toma-turno

# Debería mostrar: online
\`\`\`

2. **Prueba la URL desde el servidor mismo**

\`\`\`bash
curl http://localhost:3005/queue

# Debería devolver HTML de la página
\`\`\`

3. **Verifica conectividad desde la computadora de la TV**

\`\`\`
Abre navegador → http://[IP-DEL-SERVIDOR]:3005/queue

Ejemplo: http://192.168.1.100:3005/queue
\`\`\`

4. **Revisa logs del servidor**

\`\`\`bash
pm2 logs toma-turno --lines 50

# Busca errores recientes
\`\`\`

### 4.2 Pantalla no se actualiza en tiempo real

#### Síntomas

- Indicador de conexión en rojo 🔴
- Turnos no aparecen aunque se crean
- Información desactualizada

#### Diagnóstico paso a paso

**Paso 1: Verifica el indicador de conexión**

- 🟢 Verde → Conexión OK, problema es otro
- 🔴 Rojo → Problema de conexión SSE
- ⚠️ Amarillo → Reconectando, espera 30 segundos

**Paso 2: Verifica endpoint SSE en servidor**

\`\`\`bash
# Prueba endpoint SSE manualmente
curl http://localhost:3005/api/queue/stream

# Debería mantener conexión abierta y enviar eventos
\`\`\`

**Paso 3: Revisa consola del navegador**

\`\`\`
1. Presiona F12 (Abre DevTools)
2. Ve a la pestaña "Console"
3. Busca errores en rojo
4. Busca mensajes de SSE
\`\`\`

Errores comunes:

\`\`\`javascript
// Error de CORS
Access to XMLHttpRequest blocked by CORS policy

Solución: Verificar configuración de CORS en middleware.ts

// Error de red
Failed to fetch

Solución: Verificar conectividad al servidor
\`\`\`

**Paso 4: Recarga forzada**

\`\`\`
1. Presiona Ctrl + Shift + R (recarga sin caché)
2. O Ctrl + F5
3. Verifica si reconecta
\`\`\`

#### Soluciones

| Problema detectado | Solución |
|-------------------|----------|
| Servidor no responde | Reiniciar: \`pm2 restart toma-turno\` |
| CORS bloqueado | Verificar allowedOrigins en código |
| Cache del navegador | Limpiar cache: Ctrl+Shift+R |
| Red inestable | Verificar switch/router de red |

### 4.3 Turnos duplicados o no desaparecen

#### Síntomas

- Mismo turno aparece múltiples veces
- Turnos completados siguen en pantalla
- Lista muy larga de turnos antiguos

#### Causas

- 🐛 Bug en lógica de actualización
- 🔄 Múltiples conexiones SSE activas
- 💾 Caché del cliente desincronizado

#### Solución inmediata

\`\`\`
1. Presiona F5 para recargar la página
2. Verifica que haya una sola pestaña abierta con /queue
3. Si persiste, reinicia el navegador
\`\`\`

#### Solución definitiva

\`\`\`bash
# Reinicia el servidor para limpiar estado
pm2 restart toma-turno

# Recarga todas las pantallas de cola
# (F5 en cada una)
\`\`\`

### 4.4 Pantalla se congela o se pone lenta

#### Síntomas

- Interfaz no responde
- Animaciones entrecortadas
- Navegador consume mucha memoria

#### Causas

- 💻 Computadora con recursos limitados
- 🖥️ Muchas pestañas abiertas
- 🐌 Navegador desactualizado
- 🗑️ Cache muy grande

#### Soluciones

**Corto plazo**:
\`\`\`
1. Cierra todas las pestañas excepto /queue
2. Reinicia el navegador
3. Recarga la página
\`\`\`

**Largo plazo**:
\`\`\`
1. Actualiza el navegador a última versión
2. Limpia cache y datos de navegación
3. Considera computadora con mejores recursos
4. Usa Chrome o Edge (mejor rendimiento)
\`\`\`

**Optimización del sistema**:
\`\`\`
Windows:
- Desactiva actualizaciones automáticas durante horario de atención
- Configura plan de energía en "Alto rendimiento"
- Cierra programas en segundo plano

Linux:
- Usa modo lightweight (sin efectos visuales)
- Configura x11vnc si controlas remotamente
\`\`\`

### 4.5 Imagen distorsionada en TV

#### Síntomas

- Elementos cortados en bordes
- Texto demasiado pequeño o grande
- Colores incorrectos

#### Soluciones de hardware

**Resolución de pantalla**:
\`\`\`
1. Clic derecho en escritorio → Configuración de pantalla
2. Resolución recomendada: 1920x1080 (Full HD)
3. Escala: 100% (sin zoom)
\`\`\`

**Configuración de TV**:
\`\`\`
1. Accede al menú de la TV
2. Busca "Modo de pantalla" o "Aspect Ratio"
3. Selecciona: "Just Scan" o "1:1 Pixel" o "PC Mode"
4. Evita: "Zoom", "16:9", "Ajustar a pantalla"
\`\`\`

**Ajuste de zoom del navegador**:
\`\`\`
1. Presiona Ctrl + 0 (resetea zoom)
2. O ajusta manualmente:
   - Ctrl + (+): Zoom in
   - Ctrl + (-): Zoom out
3. Recomendado: 100% (por defecto)
\`\`\`

### 4.6 Problemas de conectividad intermitente

#### Síntomas

- Conexión alterna entre verde 🟢 y rojo 🔴
- Actualizaciones se pierden ocasionalmente
- Reconexión constante

#### Diagnóstico de red

\`\`\`bash
# Desde la computadora de la TV, prueba conectividad continua
ping -t 192.168.1.100

# Debe mostrar respuestas consistentes sin pérdida de paquetes
# Ctrl+C para detener

# Verifica latencia
# Ideal: < 10ms
# Aceptable: < 50ms
# Problemático: > 100ms
\`\`\`

#### Soluciones de red

| Problema | Solución |
|----------|----------|
| Pérdida de paquetes >5% | Verificar cables de red, cambiar si es necesario |
| Latencia alta (>100ms) | Verificar switch/router, reducir saltos de red |
| WiFi inestable | Cambiar a conexión cableada (Ethernet) |
| Interferencia WiFi | Cambiar canal del router, alejar de microondas |

**Recomendación**: Siempre usa conexión **Ethernet cableada** para pantallas de TV, no WiFi.

### 4.7 Checklist de verificación general

Usa este checklist para diagnóstico rápido:

\`\`\`
[ ] Servidor corriendo: pm2 status toma-turno → online
[ ] URL correcta: http://[IP]:3005/queue
[ ] Pantalla completa: F11 activo
[ ] Conexión SSE: Indicador verde 🟢
[ ] Resolución correcta: 1920x1080
[ ] Zoom navegador: 100% (Ctrl+0)
[ ] Red estable: ping < 50ms, sin pérdida de paquetes
[ ] Sin pestañas adicionales: Solo /queue abierta
[ ] Navegador actualizado: Chrome/Edge/Firefox última versión
[ ] Sin errores en consola: F12 → Console limpia
\`\`\`

### 4.8 Contacto con soporte

Si ninguna solución funciona:

\`\`\`
📧 Email: soporte@iner.gob.mx
📞 Extensión: 1234
🎫 Sistema de tickets: [URL del sistema]

Información a proporcionar:
- Descripción del problema
- Captura de pantalla (si es posible)
- Indicador de conexión (verde/rojo)
- Mensajes de error en consola (F12)
- Hora en que comenzó el problema
- Acciones realizadas antes del problema
\`\`\`

---`
      }
    ],

    features: [
      {
        icon: "⚡",
        title: "Actualización en tiempo real",
        description: "Tecnología SSE para sincronización instantánea. Turnos aparecen en pantallas en menos de 1 segundo después de ser llamados."
      },
      {
        icon: "📺",
        title: "Diseño optimizado para TV",
        description: "Interfaz específica para pantallas grandes. Texto legible desde lejos, colores de alto contraste, información clara y concisa."
      },
      {
        icon: "🎯",
        title: "Sistema de prioridades",
        description: "Turnos SPECIAL se muestran primero. Identificación visual con badges de colores para diferenciar tipos de atención."
      },
      {
        icon: "🔄",
        title: "Sincronización multi-pantalla",
        description: "Múltiples TVs muestran la misma información simultáneamente. Sin inconsistencias, actualizaciones coordinadas al instante."
      },
      {
        icon: "🟢",
        title: "Indicador de conexión visual",
        description: "Punto de estado en pantalla muestra conexión activa (verde), desconectada (rojo) o reconectando (amarillo)."
      },
      {
        icon: "🔌",
        title: "Reconexión automática",
        description: "Si se pierde conexión, el sistema reintenta automáticamente con estrategia exponencial. No requiere intervención manual."
      },
      {
        icon: "📊",
        title: "Vista jerarquizada",
        description: "Turno actual destacado en grande. Próximos turnos en lista ordenada. Información priorizada para mejor comprensión."
      },
      {
        icon: "🎨",
        title: "Badges de estado intuitivos",
        description: "Colores semánticos: amarillo=esperando, verde=llamado, azul=en atención. Pacientes entienden su estado al instante."
      },
      {
        icon: "🚀",
        title: "Alto rendimiento",
        description: "Optimizado para funcionar 12+ horas sin recargas. Bajo consumo de recursos, interfaz fluida sin lag."
      },
      {
        icon: "🌐",
        title: "Sin autenticación requerida",
        description: "Vista pública accesible sin login. Ideal para salas de espera donde pacientes solo observan información."
      }
    ],

    tips: [
      {
        icon: "💡",
        title: "Usa conexión Ethernet, no WiFi",
        description: "Para pantallas de TV, siempre usa cable de red. WiFi puede causar desconexiones intermitentes."
      },
      {
        icon: "📺",
        title: "Configura TV en modo PC",
        description: "Activa 'PC Mode' o 'Just Scan' en la TV para evitar recorte de bordes y distorsión de imagen."
      },
      {
        icon: "🔋",
        title: "Desactiva modo de ahorro de energía",
        description: "Configura computadora en 'Alto rendimiento' para evitar que entre en suspensión durante horario de atención."
      },
      {
        icon: "🖥️",
        title: "Una sola pestaña /queue por computadora",
        description: "No abras múltiples pestañas de cola en el mismo navegador. Puede causar duplicados y consumo excesivo de recursos."
      },
      {
        icon: "🔄",
        title: "Verifica conexión antes de abrir",
        description: "Cada mañana, revisa que el indicador esté en verde antes de atender pacientes. Evita confusión."
      },
      {
        icon: "📏",
        title: "Mantén resolución 1920x1080",
        description: "Full HD es el estándar recomendado. Menores resoluciones dificultan lectura, mayores pueden causar lag."
      },
      {
        icon: "🚨",
        title: "Ten plan B si la pantalla falla",
        description: "Siempre ten un método alternativo: anuncio por audio, llamado manual, o pantalla de respaldo."
      },
      {
        icon: "🧹",
        title: "Limpia cache del navegador semanalmente",
        description: "Cada viernes después de cerrar, limpia cache para mantener rendimiento óptimo: Ctrl+Shift+Delete."
      },
      {
        icon: "📊",
        title: "Monitorea desde el Dashboard Admin",
        description: "Administradores pueden ver en tiempo real cuántas pantallas están conectadas y su estado desde el dashboard."
      }
    ],

    warnings: [
      {
        icon: "⚠️",
        title: "No cierres el navegador durante horario de atención",
        description: "Mantén el navegador abierto todo el día. Cerrar y reabrir puede causar problemas de sincronización."
      },
      {
        icon: "🚫",
        title: "WiFi no es confiable para producción",
        description: "Conexiones inalámbricas causan desconexiones frecuentes. Siempre usa cable Ethernet para estabilidad."
      },
      {
        icon: "🔴",
        title: "Indicador rojo significa actualizaciones detenidas",
        description: "Si el punto está en rojo, pacientes no verán nuevos turnos. Atiende el problema inmediatamente o usa método alternativo."
      },
      {
        icon: "💻",
        title: "Computadoras antiguas pueden tener problemas",
        description: "PC con menos de 4GB RAM o procesadores antiguos (>5 años) pueden causar lag o congelamientos."
      },
      {
        icon: "🌐",
        title: "Problemas de red afectan todas las pantallas",
        description: "Si el servidor pierde conexión, TODAS las pantallas dejan de actualizarse simultáneamente."
      },
      {
        icon: "🔧",
        title: "No hagas cambios de configuración durante atención",
        description: "Ajustes de red, actualizaciones de Windows o cambios de sistema solo fuera de horario de pacientes."
      },
      {
        icon: "📺",
        title: "TVs muy antiguas pueden no soportar Full HD",
        description: "Pantallas pre-2010 pueden tener resoluciones limitadas o problemas de compatibilidad con HDMI."
      }
    ],

    screenshots: [
      {
        step: 1,
        filename: "01-queue-initial.png",
        title: "Vista inicial de cola",
        description: "Pantalla de cola pública sin turnos activos, mostrando mensaje de bienvenida y estructura de la interfaz",
        path: "/docs/screenshots/cola/01-queue-initial.png",
        tags: ["inicial", "vacía", "estructura"]
      },
      {
        step: 2,
        filename: "02-queue-interface.png",
        title: "Interfaz completa de cola",
        description: "Vista completa con todos los componentes: encabezado, turno actual, próximos turnos, indicador de conexión",
        path: "/docs/screenshots/cola/02-queue-interface.png",
        tags: ["interfaz", "completa", "componentes"]
      },
      {
        step: 3,
        filename: "03-update-flow.png",
        title: "Flujo de actualización SSE",
        description: "Diagrama explicativo del flujo de actualización desde que flebotomista llama hasta que pantalla actualiza",
        path: "/docs/screenshots/cola/03-update-flow.png",
        tags: ["SSE", "flujo", "actualización"]
      },
      {
        step: 4,
        filename: "04-priority-order.png",
        title: "Orden de prioridades",
        description: "Ejemplo visual de cómo se ordenan turnos SPECIAL (morados) primero y GENERAL (azules) después",
        path: "/docs/screenshots/cola/04-priority-order.png",
        tags: ["prioridades", "orden", "especial"]
      },
      {
        step: 5,
        filename: "05-patient-waiting.png",
        title: "Vista de espera del paciente",
        description: "Pantalla desde la perspectiva del paciente esperando su turno, viendo su posición en cola",
        path: "/docs/screenshots/cola/05-patient-waiting.png",
        tags: ["paciente", "espera", "perspectiva"]
      }
    ]
  }
};

// Actualizar el módulo en el array
fullDocumentation[colaModuleIndex] = updatedColaModule;

// Guardar el archivo actualizado
fs.writeFileSync(fullDocPath, JSON.stringify(fullDocumentation, null, 2));

console.log('\n✅ Documentación de Cola creada exitosamente');
console.log('📚 Formato: Tutorial completo paso a paso');
console.log('📊 Total de secciones: 4 pasos detallados');
console.log('📸 Total de screenshots: 5 capturas con contexto');
console.log('💡 Total de tips: 9 consejos prácticos');
console.log('⚠️  Total de warnings: 7 advertencias importantes');
console.log('🎯 Total de features: 10 características destacadas');
console.log('\n📁 Archivo actualizado:', fullDocPath);
console.log('\n🎉 Módulo de Cola documentado completamente!');
