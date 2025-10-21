const fs = require('fs');
const path = require('path');

// Ruta al archivo JSON
const jsonPath = path.join(__dirname, '..', 'lib', 'docs', 'fullDocumentation.json');

// Leer el archivo JSON actual
const fullDocumentation = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// ========== MÓDULO DE ATENCIÓN ==========
const atencionIndex = fullDocumentation.findIndex(m => m.moduleId === 'atencion');
if (atencionIndex !== -1) {
  fullDocumentation[atencionIndex] = {
    ...fullDocumentation[atencionIndex],
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    tags: ['atención', 'flebotomista', 'pacientes', 'turnos'],
    content: {
      overview: `# Módulo de Atención

El **Módulo de Atención** es la herramienta principal para flebotomistas que permite gestionar el flujo de pacientes en tiempo real. Desde aquí puedes llamar pacientes, atenderlos y completar el proceso de toma de muestras.

## ¿Qué aprenderás en esta guía?

En este tutorial aprenderás a:
- ✅ Acceder al módulo de atención desde tu cubículo
- ✅ Llamar pacientes desde la cola de espera
- ✅ Atender pacientes de manera eficiente
- ✅ Marcar pacientes como atendidos
- ✅ Gestionar pacientes especiales y diferidos
- ✅ Utilizar las funciones de rellamada

## Antes de comenzar

### Requisitos previos

Para seguir este tutorial necesitas:
- ✓ Tener credenciales de acceso al sistema
- ✓ Contar con rol de **Flebotomista**
- ✓ Tener un cubículo asignado
- ✓ Acceso al sistema en \`http://localhost:3005\`

### Conceptos clave

**Cubículo**: Espacio físico donde se atiende a los pacientes. Cada flebotomista tiene uno o más cubículos asignados.

**Turno**: Número asignado al paciente cuando solicita atención. Se muestra en pantalla y se llama por audio.

**Estado del paciente**:
- **WAITING**: Paciente esperando en cola
- **CALLED**: Paciente llamado pero no atendido aún
- **IN_ATTENTION**: Paciente siendo atendido
- **FINISHED**: Atención completada

**Paciente Especial**: Paciente con movilidad reducida o que requiere atención prioritaria (silla de ruedas, edad avanzada).

---

## Tutorial completo paso a paso`,

      sections: [
        {
          id: "step-1-login-cubicle",
          title: "Paso 1: Inicia sesión y accede a tu cubículo",
          description: "Accede al sistema como flebotomista y selecciona tu cubículo",
          content: `## Paso 1: Inicia sesión y accede a tu cubículo

Como flebotomista, debes iniciar sesión y seleccionar el cubículo desde el cual trabajarás.

### 1.1 Inicia sesión

Accede a la página de login:

\`\`\`
http://localhost:3005/login
\`\`\`

Ingresa tus credenciales de flebotomista:
- **Usuario**: Tu nombre de usuario asignado
- **Contraseña**: Tu contraseña

> **💡 Tip**: Si ya has iniciado sesión previamente, el sistema te redirigirá automáticamente al dashboard.

### 1.2 Accede al módulo de atención

Desde el dashboard, busca la tarjeta **"Módulo de Atención"** con el ícono 🩺 y haz clic para acceder.

Serás redirigido a: \`/turns/attention\`

### 1.3 Vista inicial del módulo

![Vista inicial módulo atención](/docs/screenshots/atencion/01-initial-view.png)

Verás una interfaz con:

#### Panel superior
- **Nombre del cubículo**: Muestra el cubículo asignado
- **Estado**: Indica si estás disponible para atender
- **Botón de actualización**: Refresca la cola de pacientes

#### Sección de pacientes en espera
- **Lista de pacientes**: Muestra pacientes WAITING ordenados por prioridad
- **Información del paciente**: Turno, nombre, tipo (especial/general)
- **Botón "Llamar"**: Para llamar al siguiente paciente

#### Sección de paciente actual
- **Información del paciente en atención**: Se muestra cuando llamas a un paciente
- **Botones de acción**: "Finalizar atención", "Rellamar"

> **⚠️ Importante**: Si no tienes cubículo asignado, el sistema te pedirá que contactes al administrador.

---`
        },
        {
          id: "step-2-call-patient",
          title: "Paso 2: Llama al siguiente paciente",
          description: "Aprende a llamar pacientes de la cola de espera",
          content: `## Paso 2: Llama al siguiente paciente

El sistema te permite llamar al siguiente paciente de la cola con un solo click.

### 2.1 Revisa la cola de pacientes

En la sección **"Pacientes en Espera"**, verás una lista ordenada de pacientes:

**Prioridad de atención**:
1. 🦽 **Pacientes Especiales** (primera prioridad)
2. 👤 **Pacientes Generales** (orden de llegada)
3. 🕐 **Pacientes Diferidos** (según hora programada)

![Cola de pacientes](/docs/screenshots/atencion/02-patient-queue.png)

### 2.2 Haz clic en "Llamar Paciente"

El botón **"Llamar Siguiente Paciente"** está en la parte superior de la lista.

Al hacer clic:

1. ✅ El sistema selecciona automáticamente el siguiente paciente según prioridad
2. ✅ Cambia el estado del paciente a **CALLED**
3. ✅ Muestra el turno en la pantalla pública (TV display)
4. ✅ Reproduce audio con el número de turno y cubículo
5. ✅ Mueve el paciente a tu sección de "Paciente Actual"

> **💡 Tip**: El audio se reproduce 3 veces automáticamente. Si el paciente no se presenta, puedes "Rellamar".

### 2.3 Información del paciente llamado

Una vez llamado, verás:

\`\`\`
Turno: #00045
Nombre: Juan Pérez García
Tipo: Paciente General
Hora de llamada: 09:45:30 AM
Cubículo: Cubículo 1
\`\`\`

**Badges visuales**:
- 🟢 **Verde**: Paciente general
- 🟡 **Amarillo**: Paciente especial
- 🟣 **Morado**: Paciente diferido

### 2.4 ¿Qué sucede en segundo plano?

Cuando llamas a un paciente:

1. 📝 Se actualiza \`calledAt\` con la hora exacta
2. 📝 Se incrementa \`callCount\` en +1
3. 📝 Se asigna tu cubículo al paciente
4. 📝 Se registra en \`AuditLog\` la acción
5. 🔔 Se envía evento SSE a pantallas públicas
6. 🔊 Se reproduce audio en las bocinas del área de espera

> **📊 Dato técnico**: El sistema usa Server-Sent Events (SSE) para actualización en tiempo real de las pantallas.

---`
        },
        {
          id: "step-3-attend-patient",
          title: "Paso 3: Atiende al paciente",
          description: "Proceso de atención y toma de muestras",
          content: `## Paso 3: Atiende al paciente

Una vez que el paciente llega a tu cubículo, procedes con la atención médica.

### 3.1 Verifica la identidad del paciente

**Antes de comenzar**:
- ✅ Confirma el número de turno
- ✅ Verifica el nombre completo
- ✅ Revisa si es paciente especial (requiere consideraciones adicionales)

![Paciente en atención](/docs/screenshots/atencion/03-patient-in-attention.png)

### 3.2 Marca como "En Atención"

Al hacer clic en **"Iniciar Atención"** (si está disponible):

- El estado cambia a \`IN_ATTENTION\`
- Se registra \`attendedAt\` con la hora de inicio
- El cronómetro de tiempo de atención comienza

> **💡 Tip**: Algunos sistemas inician automáticamente la atención al llamar al paciente. Verifica tu configuración.

### 3.3 Realiza el procedimiento

Durante la toma de muestras:

1. **Prepara el material**: Agujas, tubos, algodón, alcohol
2. **Identifica las muestras**: Etiqueta con nombre y turno del paciente
3. **Toma la muestra**: Sigue el protocolo médico establecido
4. **Almacena correctamente**: Coloca en el rack correspondiente

**Tiempo promedio recomendado**: 10-15 minutos

> **⚠️ Importante**: Si el procedimiento toma más de 20 minutos, el sistema puede generar una alerta para el administrador.

### 3.4 Proporciona instrucciones al paciente

**Indicaciones post-procedimiento**:
- Aplicar presión en el sitio de punción por 3-5 minutos
- No cargar objetos pesados con ese brazo durante 2 horas
- Informar sobre cuándo y cómo recoger resultados
- Entregar comprobante de atención (si aplica)

### 3.5 Botones disponibles durante atención

**"Rellamar Paciente"**: Si el paciente no se presentó al cubículo después de ser llamado
- Incrementa \`callCount\`
- Reproduce el audio nuevamente
- No reinicia el estado

**"Cancelar Atención"**: Si el paciente decide no continuar o hay algún problema
- Marca el turno como cancelado
- Libera el cubículo para el siguiente paciente
- Requiere confirmación

---`
        },
        {
          id: "step-4-finish-attention",
          title: "Paso 4: Finaliza la atención",
          description: "Completa el proceso y libera el cubículo",
          content: `## Paso 4: Finaliza la atención

Una vez completado el procedimiento, debes finalizar la atención en el sistema.

### 4.1 Haz clic en "Finalizar Atención"

El botón **"Finalizar Atención"** está en la parte inferior de la información del paciente.

![Finalizar atención](/docs/screenshots/atencion/04-finish-attention.png)

### 4.2 Confirmación de finalización

Al hacer clic, se muestra un modal de confirmación:

**Pregunta**: "¿Deseas finalizar la atención de este paciente?"

**Opciones**:
- **Sí, Finalizar**: Completa la atención
- **Cancelar**: Regresa sin cambios

> **💡 Tip**: Asegúrate de haber completado todas las muestras antes de finalizar.

### 4.3 ¿Qué sucede al finalizar?

El sistema ejecuta las siguientes acciones:

1. ✅ Cambia el estado del paciente a \`FINISHED\`
2. ✅ Registra \`finishedAt\` con la hora de finalización
3. ✅ Calcula el tiempo total de atención (\`finishedAt - calledAt\`)
4. ✅ Libera el cubículo para el siguiente paciente
5. ✅ Actualiza las estadísticas del flebotomista
6. ✅ Registra la acción en \`AuditLog\`
7. ✅ Actualiza la cola pública (el turno desaparece)

### 4.4 Confirmación visual

Verás un mensaje de éxito:

\`\`\`
✅ Atención finalizada exitosamente
Paciente #00045 - Juan Pérez García
Tiempo de atención: 12 minutos
\`\`\`

### 4.5 Listo para el siguiente paciente

Después de finalizar:

- La sección "Paciente Actual" se vacía
- El botón "Llamar Siguiente Paciente" se habilita nuevamente
- La lista de "Pacientes en Espera" se actualiza

> **🔄 Flujo continuo**: Puedes llamar inmediatamente al siguiente paciente sin necesidad de recargar la página.

### 4.6 Métricas actualizadas

El sistema actualiza automáticamente:
- **Contador de pacientes atendidos hoy**: +1
- **Tiempo promedio de atención**: Recalculado con el nuevo dato
- **Eficiencia del flebotomista**: Actualizada en estadísticas

---`
        },
        {
          id: "step-5-special-cases",
          title: "Paso 5: Casos especiales y buenas prácticas",
          description: "Manejo de situaciones especiales y recomendaciones",
          content: `## Paso 5: Casos especiales y buenas prácticas

Aprende a manejar situaciones especiales que pueden presentarse durante la atención.

### 5.1 Pacientes que no se presentan

**Situación**: Llamaste a un paciente pero no se presenta al cubículo.

**Acciones**:

1. **Espera 2-3 minutos** (tiempo razonable de desplazamiento)
2. **Haz clic en "Rellamar"** para reproducir el audio nuevamente
3. **Si después de 3 llamadas no se presenta**:
   - Click en "Pasar al siguiente"
   - El paciente regresa al final de la cola
   - El sistema marca \`callCount = 3\`

> **💡 Tip**: Después de 3 llamadas sin respuesta, el paciente puede ser marcado como "No presentado" y se llamará al siguiente.

### 5.2 Pacientes especiales (Prioridad)

**Identificación**: Badge amarillo 🟡 o ícono 🦽

**Consideraciones**:
- Tienen **prioridad sobre pacientes generales**
- Pueden requerir **cubículos tipo SPECIAL** (más espacio)
- Pueden necesitar **asistencia adicional**
- Tiempo de atención puede ser **ligeramente mayor**

**Protocolo**:
1. Asegúrate de que el cubículo tenga espacio para silla de ruedas
2. Ofrece asistencia si es necesario
3. Sé paciente y considerado
4. Documenta cualquier observación especial

### 5.3 Pacientes diferidos

**¿Qué son?**: Pacientes que por alguna razón fueron pospuestos para atención posterior.

**Identificación**: Badge morado 🟣 o ícono 🕐

**Cuándo diferir un paciente**:
- Falta de material o reactivos
- Paciente no en ayunas (si es requerimiento)
- Problema técnico temporal
- Solicitud del paciente

**Cómo diferir**:
1. Click en "Diferir Paciente"
2. Selecciona motivo del diferimiento
3. Indica hora aproximada de retorno (si aplica)
4. Confirma la acción

> **📌 Nota**: Los pacientes diferidos aparecen al final de la cola con distintivo morado.

### 5.4 Emergencias durante la atención

**Si un paciente presenta síntomas adversos**:

1. 🚨 **Detén el procedimiento inmediatamente**
2. 🚨 **Activa el botón de emergencia** (si está disponible)
3. 🚨 **Llama al personal médico de apoyo**
4. 🚨 **Documenta en el sistema** (sección de observaciones)

**Síntomas comunes**:
- Mareo o desmayo
- Sudoración excesiva
- Palidez
- Náuseas

### 5.5 Buenas prácticas recomendadas

**Inicio del turno**:
- ✅ Verifica que tu cubículo esté limpio y abastecido
- ✅ Confirma que el sistema muestre correctamente tu cubículo
- ✅ Realiza una prueba de audio para verificar que funciona

**Durante el día**:
- ✅ Mantén un ritmo constante (evita apresurarte)
- ✅ Actualiza el estado del paciente en tiempo real
- ✅ Documenta observaciones relevantes
- ✅ Comunica al administrador si hay problemas técnicos

**Fin del turno**:
- ✅ Asegúrate de haber finalizado todas las atenciones pendientes
- ✅ Deja el cubículo limpio y listo para el siguiente turno
- ✅ Cierra sesión correctamente
- ✅ Reporta cualquier incidencia del día

### 5.6 Atajos de teclado útiles

| Atajo | Acción |
|-------|--------|
| \`Ctrl+L\` / \`Cmd+L\` | Llamar siguiente paciente |
| \`Ctrl+F\` / \`Cmd+F\` | Finalizar atención actual |
| \`Ctrl+R\` / \`Cmd+R\` | Rellamar paciente |
| \`Esc\` | Cerrar modal activo |

> **⚡ Productividad**: Usar atajos de teclado puede reducir el tiempo entre pacientes en un 20-30%.

---`
        }
      ],

      features: [
        {
          icon: "🚀",
          title: "Llamadas Automáticas",
          description: "Sistema automatizado que reproduce audio del turno en las bocinas del área de espera 3 veces consecutivas"
        },
        {
          icon: "📊",
          title: "Priorización Inteligente",
          description: "Algoritmo que ordena pacientes especiales primero, luego generales y diferidos según criterios médicos"
        },
        {
          icon: "⏱️",
          title: "Cronómetro en Tiempo Real",
          description: "Seguimiento preciso del tiempo de atención desde llamada hasta finalización para métricas de eficiencia"
        },
        {
          icon: "🔄",
          title: "Actualización Automática",
          description: "Cola de pacientes que se actualiza automáticamente sin recargar la página usando SSE (Server-Sent Events)"
        },
        {
          icon: "🦽",
          title: "Gestión de Pacientes Especiales",
          description: "Identificación visual y prioridad automática para pacientes con movilidad reducida o necesidades especiales"
        },
        {
          icon: "🔊",
          title: "Sistema de Audio Integrado",
          description: "Reproducción automática de audio personalizado con número de turno y cubículo asignado"
        },
        {
          icon: "📱",
          title: "Interfaz Intuitiva",
          description: "Diseño simple y claro con botones grandes y fácil navegación optimizado para uso rápido durante atención"
        },
        {
          icon: "🔔",
          title: "Notificaciones Visuales",
          description: "Alertas en tiempo real para pacientes que no se presentan después de múltiples llamadas"
        },
        {
          icon: "📈",
          title: "Estadísticas en Vivo",
          description: "Contador de pacientes atendidos y tiempo promedio actualizado en tiempo real durante la jornada"
        },
        {
          icon: "🎯",
          title: "Un Clic para Atender",
          description: "Flujo simplificado: Llamar → Atender → Finalizar con solo 3 clicks, optimizado para máxima eficiencia"
        }
      ],

      tips: [
        {
          icon: "💡",
          title: "Velocidad Óptima",
          description: "Mantén un ritmo de 10-15 minutos por paciente. No te apresures demasiado para evitar errores médicos"
        },
        {
          icon: "🔊",
          title: "Verifica el Audio",
          description: "Al inicio del día, haz una prueba llamando un turno ficticio para confirmar que las bocinas funcionan"
        },
        {
          icon: "⏰",
          title: "Gestión de Tiempo",
          description: "Si un paciente no se presenta después de 3 minutos, rellamar. Después de 3 llamadas, pasa al siguiente"
        },
        {
          icon: "🦽",
          title: "Pacientes Prioritarios",
          description: "Los pacientes especiales se muestran primero en la lista. Atiéndelos con prioridad para cumplir normativas"
        },
        {
          icon: "📝",
          title: "Documentación Completa",
          description: "Siempre finaliza la atención en el sistema. Esto actualiza estadísticas y libera el cubículo correctamente"
        },
        {
          icon: "🔄",
          title: "Actualiza la Cola",
          description: "Si la cola no se actualiza automáticamente, usa el botón de actualización o presiona F5 en el navegador"
        },
        {
          icon: "⚡",
          title: "Atajos de Teclado",
          description: "Usa Ctrl+L para llamar y Ctrl+F para finalizar. Aprende los atajos para ser 30% más eficiente"
        },
        {
          icon: "🎯",
          title: "Foco en el Paciente",
          description: "Aunque el sistema es rápido, dedica tiempo de calidad a cada paciente. La eficiencia no debe sacrificar el trato"
        },
        {
          icon: "📊",
          title: "Monitorea tus Métricas",
          description: "Revisa tu tiempo promedio al final del día. Busca estar entre 10-15 min para óptimo balance velocidad-calidad"
        }
      ],

      warnings: [
        {
          icon: "⚠️",
          title: "No Llamar sin Preparación",
          description: "Asegúrate de tener todo el material listo ANTES de llamar al paciente para evitar tiempos de espera innecesarios"
        },
        {
          icon: "🚫",
          title: "No Cerrar sin Finalizar",
          description: "NUNCA cierres la ventana con un paciente en atención sin finalizarlo. Esto genera datos incorrectos en estadísticas"
        },
        {
          icon: "⏳",
          title: "Atención Prolongada",
          description: "Si una atención supera 25 minutos, el sistema genera alerta al supervisor. Documenta el motivo si es necesario"
        },
        {
          icon: "🔒",
          title: "No Compartir Sesión",
          description: "Cada flebotomista debe usar su propia sesión. Compartir sesiones corrompe las estadísticas de rendimiento individual"
        },
        {
          icon: "📱",
          title: "Conexión Requerida",
          description: "El módulo requiere conexión constante a internet. Sin conexión, las actualizaciones en tiempo real no funcionarán"
        },
        {
          icon: "🔊",
          title: "Verificar Audio",
          description: "Si el audio no funciona, pacientes no escucharán su llamada. Reporta inmediatamente al soporte técnico"
        },
        {
          icon: "🦽",
          title: "Cubículos Especiales",
          description: "No llames pacientes especiales si tu cubículo no tiene espacio adecuado. Puede causar situaciones riesgosas"
        }
      ],

      screenshots: [
        {
          filename: "atencion-initial-view.png",
          title: "Vista Inicial del Módulo de Atención",
          description: "Interfaz principal mostrando cola de pacientes, botón de llamar y sección de paciente actual",
          path: "/docs/screenshots/atencion/01-initial-view.png",
          tags: ["atención", "interfaz", "cubículo"]
        },
        {
          filename: "atencion-patient-queue.png",
          title: "Cola de Pacientes en Espera",
          description: "Lista ordenada de pacientes esperando atención con identificación de especiales y diferidos",
          path: "/docs/screenshots/atencion/02-patient-queue.png",
          tags: ["cola", "pacientes", "prioridad"]
        },
        {
          filename: "atencion-patient-in-attention.png",
          title: "Paciente en Atención",
          description: "Vista del paciente actualmente siendo atendido con cronómetro y botones de acción",
          path: "/docs/screenshots/atencion/03-patient-in-attention.png",
          tags: ["atención", "paciente", "cronómetro"]
        },
        {
          filename: "atencion-finish-attention.png",
          title: "Finalizar Atención",
          description: "Modal de confirmación para finalizar la atención del paciente actual",
          path: "/docs/screenshots/atencion/04-finish-attention.png",
          tags: ["finalizar", "confirmación", "modal"]
        },
        {
          filename: "atencion-recall-patient.png",
          title: "Rellamar Paciente",
          description: "Función de rellamada cuando el paciente no se presenta al cubículo después del llamado inicial",
          path: "/docs/screenshots/atencion/05-recall-patient.png",
          tags: ["rellamar", "audio", "paciente"]
        }
      ]
    }
  };
}

console.log('✅ Módulo de Atención actualizado');

// Guardar cambios
fs.writeFileSync(jsonPath, JSON.stringify(fullDocumentation, null, 2), 'utf8');

console.log('\n📊 Resumen de actualización:');
console.log('✅ Módulo Atención: Completado');
console.log('   - Secciones:', fullDocumentation[atencionIndex].content.sections.length);
console.log('   - Features:', fullDocumentation[atencionIndex].content.features.length);
console.log('   - Tips:', fullDocumentation[atencionIndex].content.tips.length);
console.log('   - Warnings:', fullDocumentation[atencionIndex].content.warnings.length);
console.log('   - Screenshots:', fullDocumentation[atencionIndex].content.screenshots.length);
