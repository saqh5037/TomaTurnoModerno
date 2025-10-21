const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Leer metadata de screenshots
const screenshotsMetadataPath = path.join(__dirname, '../public/docs/screenshots/screenshots-metadata.json');
const screenshotsMetadata = JSON.parse(fs.readFileSync(screenshotsMetadataPath, 'utf-8'));

// Agrupar screenshots por tags
const getScreenshotsByTags = (tags) => {
  return screenshotsMetadata.filter(ss =>
    tags.some(tag => ss.tags.includes(tag))
  );
};

const fullDocumentation = [
  {
    moduleId: 'dashboard',
    title: 'Dashboard Administrativo',
    description: 'Centro de control principal para monitorear el sistema en tiempo real',
    category: 'admin',
    content: {
      overview: `# Dashboard Administrativo

El dashboard administrativo es el centro de control principal del Sistema de Gestión de Turnos INER. Desde aquí puedes monitorear todas las actividades del sistema en tiempo real, generar reportes y administrar usuarios.

## Características Principales

- **Vista en tiempo real** de todos los turnos activos
- **Métricas de rendimiento** de flebotomistas
- **Estadísticas de satisfacción** de pacientes
- **Control de usuarios** y permisos
- **Exportación de reportes** en PDF y Excel

## Acceso al Dashboard

1. Inicia sesión con tus credenciales de administrador
2. Serás redirigido automáticamente al dashboard principal
3. El dashboard se actualiza automáticamente cada 5 minutos
4. Puedes forzar una actualización con el botón "Actualizar" o presionando Ctrl+R`,

      sections: [
        {
          id: 'metrics',
          title: 'Interpretación de Métricas',
          description: 'Entiende las métricas principales del dashboard',
          content: `## Métricas del Dashboard

### Pacientes en Cola
Muestra el número de pacientes actualmente esperando ser atendidos. Se divide en:
- **Pacientes Especiales** (icono de silla de ruedas)
- **Pacientes Generales** (icono estándar)
- **Pacientes Diferidos** (icono de reloj ámbar)

### Tiempo Promedio de Atención
Calcula el tiempo promedio que toma atender a un paciente desde que es llamado hasta que finaliza la toma de muestra.

### Flebotomistas Activos
Número de flebotomistas actualmente en servicio y atendiendo pacientes.

### Cubículos Disponibles
Muestra los cubículos activos y disponibles para atención.`
        },
        {
          id: 'quick-actions',
          title: 'Acciones Rápidas',
          description: 'Acciones que puedes realizar desde el dashboard',
          content: `## Acciones Rápidas

Desde el dashboard puedes realizar las siguientes acciones:

1. **Ver estadísticas detalladas** - Click en cualquier métrica
2. **Gestionar usuarios** - Botón "Usuarios" en el menú
3. **Exportar reportes** - Botón "Generar Reporte"
4. **Configurar cubículos** - Menú "Gestión de Cubículos"
5. **Ver cola en tiempo real** - Enlace "Cola Pública"`
        }
      ],

      features: [
        'Métricas en tiempo real',
        'Reportes automáticos',
        'Gestión de usuarios',
        'Vista de cola actualizada',
        'Exportación de datos'
      ],

      screenshots: getScreenshotsByTags(['admin', 'dashboard']),

      tips: [
        'Usa Ctrl+R para actualizar rápidamente las estadísticas',
        'Los gráficos son interactivos: haz clic para ver detalles',
        'Puedes exportar cualquier gráfico como imagen PNG',
        'El dashboard guarda tus preferencias de visualización'
      ],

      warnings: [
        'Las estadísticas se actualizan cada 5 minutos. Para datos en tiempo real, usa el botón "Actualizar"',
        'Los reportes grandes (>1000 registros) pueden tardar varios segundos en generarse'
      ]
    },
    order: 1,
    difficulty: 'basic',
    estimatedTime: '15 min',
    tags: ['dashboard', 'estadísticas', 'admin'],
    isActive: true,
    views: 0
  },

  {
    moduleId: 'users',
    title: 'Gestión de Usuarios',
    description: 'Administra usuarios, roles y permisos del sistema',
    category: 'admin',
    content: {
      overview: `# Gestión de Usuarios

El módulo de gestión de usuarios te permite administrar todos los aspectos relacionados con los usuarios del sistema, incluyendo creación, edición, asignación de roles y permisos.

## Tipos de Usuarios

- **Administradores**: Acceso completo al sistema
- **Flebotomistas**: Acceso a atención de pacientes y estadísticas propias

## Capacidades del Módulo

- Crear nuevos usuarios
- Editar información de usuarios existentes
- Cambiar roles y permisos
- Activar/desactivar usuarios
- Bloquear usuarios (estado BLOCKED)
- Ver histórico de actividad`,

      sections: [
        {
          id: 'creation',
          title: 'Crear Nuevos Usuarios',
          description: 'Cómo crear usuarios paso a paso',
          content: `## Crear un Nuevo Usuario

### Paso 1: Acceder al Formulario
1. Ve a **Gestión de Usuarios** desde el menú
2. Click en el botón **"Crear Usuario"**

### Paso 2: Completar Información
Llena los siguientes campos:
- **Nombre completo**: Nombre y apellidos del usuario
- **Nombre de usuario**: Usuario para login (único)
- **Contraseña**: Mínimo 6 caracteres
- **Rol**: Admin o Flebotomista
- **Estado**: ACTIVE, INACTIVE o BLOCKED

### Paso 3: Guardar
Click en **"Guardar Usuario"** y el sistema:
- Valida que el usuario no exista
- Encripta la contraseña
- Crea el registro
- Muestra confirmación`
        },
        {
          id: 'permissions',
          title: 'Gestión de Permisos',
          description: 'Asignación y configuración de roles',
          content: `## Roles y Permisos

### Rol: Administrador
**Permisos completos:**
- Gestión de usuarios
- Gestión de cubículos
- Ver todas las estadísticas
- Generar reportes
- Configuración del sistema
- Cambiar prioridad de pacientes
- Acceso a auditoría

### Rol: Flebotomista
**Permisos limitados:**
- Atención de pacientes
- Ver cola de pacientes
- Llamar pacientes
- Finalizar atención
- Regresar pacientes a cola
- Ver estadísticas propias

### Cambiar Rol de Usuario
1. Selecciona el usuario a modificar
2. Click en "Editar"
3. Cambia el campo "Rol"
4. Guarda los cambios`
        },
        {
          id: 'states',
          title: 'Estados de Usuario',
          description: 'Manejo de estados ACTIVE, INACTIVE y BLOCKED',
          content: `## Estados de Usuario

### ACTIVE (Activo)
- Usuario puede iniciar sesión normalmente
- Todos los permisos funcionan
- **Uso**: Usuarios en servicio activo

### INACTIVE (Inactivo)
- Usuario NO puede iniciar sesión
- Soft-disable temporal
- Datos se conservan
- **Uso**: Vacaciones, licencias temporales

### BLOCKED (Bloqueado)
- Usuario permanentemente deshabilitado
- Hard-disable
- No puede ser reactivado fácilmente
- **Uso**: Empleados dados de baja, seguridad

### Cambiar Estado
1. Selecciona el usuario
2. Click en botón de acción
3. Selecciona "Cambiar Estado"
4. Confirma la operación`
        }
      ],

      features: [
        'Creación de usuarios',
        'Asignación de roles',
        'Control de permisos',
        'Gestión de estados (ACTIVE/INACTIVE/BLOCKED)',
        'Auditoría de cambios',
        'Búsqueda y filtrado'
      ],

      screenshots: getScreenshotsByTags(['admin', 'usuarios']),

      tips: [
        'Usa nombres de usuario descriptivos (ej: "juan.perez" en lugar de "user123")',
        'Cambia el estado a INACTIVE para licencias temporales',
        'Usa BLOCKED solo para bajas definitivas',
        'Revisa periódicamente usuarios inactivos'
      ],

      warnings: [
        'Los cambios en permisos toman efecto inmediatamente',
        'Un usuario BLOCKED no puede ser activado sin permiso especial',
        'Todos los cambios quedan registrados en el log de auditoría'
      ]
    },
    order: 2,
    difficulty: 'intermediate',
    estimatedTime: '20 min',
    tags: ['usuarios', 'permisos', 'admin'],
    isActive: true,
    views: 0
  },

  {
    moduleId: 'atencion',
    title: 'Módulo de Atención',
    description: 'Interfaz principal para atención de pacientes por flebotomistas',
    category: 'phlebotomist',
    content: {
      overview: `# Módulo de Atención de Pacientes

El módulo de atención es la interfaz principal que utilizan los flebotomistas para atender pacientes. Permite llamar pacientes, gestionar la atención y controlar el flujo de trabajo.

## Características Principales

- **Sugerencias inteligentes** de pacientes a atender
- **Control de prioridad** (Especiales vs Generales)
- **Gestión de pacientes diferidos**
- **Cambio de tipo de atención** (solo supervisores)
- **Vista de cola en tiempo real**

## Flujo de Atención

1. **Llamar Paciente** → Sistema sugiere el siguiente paciente
2. **Atender** → Realizar toma de muestra
3. **Finalizar** o **Diferir** → Completar o regresar a cola
4. **Repetir** → Sistema sugiere siguiente paciente`,

      sections: [
        {
          id: 'calling',
          title: 'Llamar Pacientes',
          description: 'Cómo llamar al siguiente paciente',
          content: `## Llamar al Siguiente Paciente

### Método Recomendado: Sugerencias del Sistema

El sistema sugiere automáticamente el siguiente paciente a atender basándose en:
- **Prioridad**: Especiales primero
- **Tiempo de espera**: Pacientes con más tiempo
- **Tu carga de trabajo**: Balanceo entre flebotomistas

### Proceso:
1. Click en **"Llamar Paciente"**
2. Sistema muestra el paciente sugerido
3. Confirma para proceder
4. Paciente pasa a estado "EN ATENCIÓN"

### Paciente Sugerido
- Fondo **verde** indica sugerencia
- Muestra: Nombre, Turno, Tipo de Atención, Estudios
- Incluye icono de prioridad si es especial`
        },
        {
          id: 'deferring',
          title: 'Regresar a Cola (Diferir)',
          description: 'Qué hacer cuando un paciente no puede ser atendido',
          content: `## Regresar Paciente a Cola

### ¿Cuándo Diferir?
- Paciente no está listo
- Falta documentación
- Paciente pide esperar
- Emergencia temporal

### Proceso:
1. Con paciente en atención, click **"Regresar a Cola"**
2. Sistema marca paciente como **DIFERIDO**
3. Paciente regresa a cola con:
   - Icono de reloj **ámbar** (color #f59e0b)
   - Se coloca al final de su grupo de prioridad
   - Mantiene su tipo de atención (Especial/General)

### Ordenamiento de Pacientes Diferidos:
- **Especiales diferidos**: Al final del grupo especial
- **Generales diferidos**: Al final absoluto de la cola

### Botón "Regresar a Cola"
- Color **rojo** con gradiente
- Icono de reloj de arena
- Con sombra para destacarlo
- Ubicado debajo de otros botones de acción`
        },
        {
          id: 'priority-change',
          title: 'Cambiar Prioridad (Solo Supervisores)',
          description: 'Cambiar entre atención General y Especial',
          content: `## Cambiar Tipo de Atención

### Permiso Requerido
⚠️ **Solo Supervisores y Administradores** pueden cambiar la prioridad de un paciente.

### Casos de Uso:
- Paciente general que necesita atención especial
- Paciente especial que ya no requiere prioridad
- Corrección de error en clasificación inicial

### Proceso:
1. Con paciente en atención
2. Click en botón **"Cambiar a Especial"** o **"Cambiar a General"**
3. Sistema actualiza inmediatamente
4. Cambia icono del paciente

### Iconos de Prioridad:
- **Silla de ruedas** (FaWheelchair) → Especial
- **Usuario estándar** (FaUser) → General
- **Tamaño**: 16px (pequeños y sutiles)
- **Intercambio** (FaExchangeAlt): 14px en botón de cambio`
        }
      ],

      features: [
        'Sugerencias inteligentes de pacientes',
        'Llamado con un click',
        'Sistema de diferidos',
        'Cambio de prioridad (supervisores)',
        'Vista de cola lateral',
        'Conteo de llamados',
        'Historial de atención'
      ],

      screenshots: getScreenshotsByTags(['atención', 'pacientes']),

      tips: [
        'Sigue las sugerencias del sistema para mejor flujo',
        'Usa "Diferir" solo cuando sea necesario',
        'Verifica los estudios antes de llamar al paciente',
        'El sistema balancea automáticamente la carga entre flebotomistas'
      ],

      warnings: [
        'Al diferir un paciente, este regresa al final de su grupo de prioridad',
        'Los pacientes especiales siempre tienen prioridad sobre generales',
        'Cambios de prioridad solo disponibles para supervisores'
      ]
    },
    order: 3,
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    tags: ['atención', 'pacientes', 'flebotomista'],
    isActive: true,
    views: 0
  },

  {
    moduleId: 'cola',
    title: 'Gestión de Cola',
    description: 'Visualización y gestión de la cola de pacientes en espera',
    category: 'queue',
    content: {
      overview: `# Gestión de Cola de Pacientes

La cola de pacientes muestra todos los pacientes en espera organizados por prioridad. Es visible públicamente para que los pacientes puedan ver su posición.

## Ordenamiento de la Cola

### Versión 2.6.1 - Mejoras de Ordenamiento

El sistema ordena automáticamente los pacientes según:

1. **Tipo de Atención** (Mayor prioridad)
   - Pacientes **Especiales** primero
   - Pacientes **Generales** después

2. **Estado de Diferido** (Segunda prioridad)
   - Pacientes **NO diferidos** primero en cada grupo
   - Pacientes **diferidos** al final de su grupo

3. **Número de Turno** (Orden final)
   - Menor número de turno = mayor prioridad

### Ejemplo de Ordenamiento:
\`\`\`
1. Especial #101 (NO diferido)
2. Especial #103 (NO diferido)
3. Especial #105 (DIFERIDO) ← Al final de especiales
4. General #102 (NO diferido)
5. General #104 (NO diferido)
6. General #106 (DIFERIDO) ← Al final absoluto
\`\`\``,

      sections: [
        {
          id: 'visual-indicators',
          title: 'Indicadores Visuales',
          description: 'Cómo interpretar los iconos y colores',
          content: `## Indicadores Visuales en la Cola

### Iconos de Prioridad

#### Pacientes Especiales
- **Icono**: Silla de ruedas (FaWheelchair)
- **Color**: Naranja
- **Tamaño**: 16px
- **Indicador**: Alta prioridad

#### Pacientes Generales
- **Icono**: Usuario estándar (FaUser)
- **Color**: Gris/Azul
- **Tamaño**: 16px

### Iconos de Estado

#### Paciente Diferido (Regresado a Cola)
- **Icono**: Reloj de arena (FaHourglass)
- **Color**: **Ámbar (#f59e0b)** ← Nuevo en v2.6.1
- **Significado**: Paciente que fue llamado pero regresó a cola
- **Posición**: Al final de su grupo de prioridad

**Cambio importante v2.6.1**: El color cambió de rojo a ámbar para mejor visibilidad y distinción.

### Colores de Fondo

#### Paciente Sugerido
- **Color**: Verde claro
- **Uso**: Solo en interfaz de atención
- **Significado**: Sistema recomienda atender a este paciente

#### Estados de Atención
- **PENDING**: Sin color especial
- **IN_CALLING**: Amarillo suave
- **IN_PROGRESS**: Azul suave
- **COMPLETED**: Verde suave`
        },
        {
          id: 'special-patients',
          title: 'Manejo de Pacientes Especiales',
          description: 'Quiénes son y cómo se atienden',
          content: `## Pacientes Especiales

### Criterios de Atención Especial

Los siguientes pacientes tienen prioridad alta:

1. **Adultos Mayores** (>65 años)
2. **Mujeres Embarazadas**
3. **Personas con Discapacidad**
4. **Pacientes con Movilidad Reducida**
5. **Casos Urgentes**

### Características:
- Siempre aparecen **primero** en la cola
- Icono de **silla de ruedas**
- Sistema los **sugiere primero** a flebotomistas
- Si son diferidos, van al **final del grupo especial**

### Cambio de Clasificación:
Solo **supervisores** pueden cambiar un paciente de General a Especial o viceversa.`
        }
      ],

      features: [
        'Ordenamiento automático por prioridad',
        'Iconos claros de tipo de atención',
        'Indicador visual de pacientes diferidos',
        'Vista pública en tiempo real',
        'Actualización automática',
        'Contador de pacientes en espera'
      ],

      screenshots: getScreenshotsByTags(['cola', 'turnos']),

      tips: [
        'La cola se actualiza automáticamente cada 30 segundos',
        'Los pacientes especiales siempre están primero',
        'El icono ámbar indica paciente diferido',
        'Puedes ver el número de turno para estimar tiempo de espera'
      ]
    },
    order: 4,
    difficulty: 'basic',
    estimatedTime: '10 min',
    tags: ['cola', 'turnos', 'pacientes'],
    isActive: true,
    views: 0
  },

  {
    moduleId: 'estadisticas',
    title: 'Módulo de Estadísticas',
    description: 'Análisis completo de métricas y rendimiento del sistema',
    category: 'admin',
    content: {
      overview: `# Módulo de Estadísticas

El módulo de estadísticas proporciona análisis completo del rendimiento del sistema, permitiendo tomar decisiones basadas en datos.

## Tipos de Estadísticas

1. **Dashboard General** → Vista consolidada
2. **Estadísticas Diarias** → Análisis por día
3. **Estadísticas Mensuales** → Tendencias mensuales
4. **Rendimiento de Flebotomistas** → Métricas individuales
5. **Tiempo Promedio** → Análisis de tiempos de atención

## Exportación de Datos

Todas las estadísticas pueden ser exportadas en:
- **PDF**: Para reportes impresos
- **Excel**: Para análisis adicional
- **CSV**: Para importar en otros sistemas`,

      sections: [
        {
          id: 'daily',
          title: 'Estadísticas Diarias',
          description: 'Análisis día por día',
          content: `## Estadísticas Diarias

### Métricas Principales
- Total de pacientes atendidos por día
- Pacientes especiales vs generales
- Tiempo promedio de atención
- Distribución por hora del día

### Filtros Disponibles
- Rango de fechas
- Por flebotomista
- Por tipo de atención
- Por cubículo

### Gráficas
- Línea de tendencia diaria
- Barras comparativas
- Tortas de distribución`
        },
        {
          id: 'monthly',
          title: 'Estadísticas Mensuales',
          description: 'Análisis mensual y tendencias',
          content: `## Estadísticas Mensuales

### Métricas
- Total mensual de pacientes
- Comparativa mes a mes
- Tendencia de crecimiento
- Promedios mensuales

### Análisis de Tendencias
El sistema identifica:
- Meses con mayor demanda
- Variaciones estacionales
- Patrones de atención
- Proyecciones futuras`
        },
        {
          id: 'phlebotomists',
          title: 'Rendimiento de Flebotomistas',
          description: 'Métricas individuales de productividad',
          content: `## Rendimiento de Flebotomistas

### Métricas por Flebotomista
- Total de pacientes atendidos
- Tiempo promedio de atención
- Pacientes diferidos
- Tasa de finalización exitosa

### Ranking
El sistema genera ranking automático:
- Por productividad (más pacientes)
- Por eficiencia (menor tiempo promedio)
- Por calidad (menos diferidos)

### Uso de Métricas
- **No punitivo**: Para mejora continua
- **Identificar mejores prácticas**
- **Equilibrar carga de trabajo**
- **Capacitación dirigida**`
        }
      ],

      features: [
        'Dashboard completo de métricas',
        'Gráficas interactivas',
        'Exportación a PDF/Excel',
        'Filtros avanzados',
        'Análisis de tendencias',
        'Comparativas período a período',
        'Métricas en tiempo real'
      ],

      screenshots: getScreenshotsByTags(['estadísticas']),

      tips: [
        'Usa rangos de fechas para comparar períodos',
        'Exporta en Excel para análisis avanzados',
        'Los gráficos son interactivos: haz hover para detalles',
        'Guarda reportes PDF para presentaciones'
      ],

      warnings: [
        'Las estadísticas se calculan cada hora',
        'Reportes muy grandes pueden tardar en generarse',
        'Los datos se conservan por 2 años'
      ]
    },
    order: 5,
    difficulty: 'intermediate',
    estimatedTime: '35 min',
    tags: ['estadísticas', 'métricas', 'reportes'],
    isActive: true,
    views: 0
  },

  {
    moduleId: 'cubiculos',
    title: 'Gestión de Cubículos',
    description: 'Administración de cubículos de atención',
    category: 'admin',
    content: {
      overview: `# Gestión de Cubículos

Los cubículos son los espacios físicos donde se atienden los pacientes. El sistema permite gestionar cubículos de tipo General y Especial.

## Tipos de Cubículos

### Cubículos Generales
- Atención de pacientes generales
- Puede atender pacientes especiales si es necesario
- Mayor cantidad

### Cubículos Especiales
- Diseñados para pacientes con necesidades especiales
- Equipamiento especializado
- Acceso para sillas de ruedas
- Menor cantidad pero prioritarios

## Estados de Cubículos

- **ACTIVE**: Cubículo disponible para uso
- **INACTIVE**: Temporalmente fuera de servicio`,

      sections: [
        {
          id: 'management',
          title: 'Crear y Editar Cubículos',
          description: 'Gestión de cubículos',
          content: `## Gestión de Cubículos

### Crear Nuevo Cubículo
1. Click en "Crear Cubículo"
2. Ingresa nombre (ej: "Cubículo 1")
3. Selecciona tipo (GENERAL o SPECIAL)
4. Define estado inicial (ACTIVE)
5. Guarda

### Editar Cubículo Existente
1. Selecciona cubículo de la lista
2. Click en "Editar"
3. Modifica campos necesarios
4. Guarda cambios

### Activar/Desactivar
- Usa el switch de estado
- Cubículos inactivos no aparecen en asignaciones
- Útil para mantenimiento o limpieza`
        }
      ],

      features: [
        'Crear y editar cubículos',
        'Dos tipos: General y Especial',
        'Control de estado ACTIVE/INACTIVE',
        'Vista de cubículos en uso',
        'Historial de asignaciones',
        'Búsqueda y filtrado'
      ],

      screenshots: getScreenshotsByTags(['cubículos']),

      tips: [
        'Mantén al menos 4 cubículos activos',
        'Designa 1-2 cubículos como especiales',
        'Nombres descriptivos (ej: "Cubículo 1 - Planta Baja")',
        'Desactiva cubículos solo durante mantenimiento'
      ]
    },
    order: 6,
    difficulty: 'basic',
    estimatedTime: '20 min',
    tags: ['cubículos', 'gestión', 'admin'],
    isActive: true,
    views: 0
  },

  {
    moduleId: 'turnos',
    title: 'Creación de Turnos',
    description: 'Cómo crear nuevos turnos para pacientes',
    category: 'turns',
    content: {
      overview: `# Creación de Turnos

El sistema permite crear turnos para pacientes de manera rápida y eficiente. Cada turno contiene información completa del paciente y estudios requeridos.

## Información Requerida

- Nombre completo del paciente
- Edad
- Género
- Información de contacto
- Estudios solicitados
- Número de tubos requeridos
- Tipo de atención (General/Especial)
- Observaciones (opcional)`,

      sections: [
        {
          id: 'process',
          title: 'Proceso de Creación',
          description: 'Paso a paso para crear un turno',
          content: `## Crear un Nuevo Turno

### Paso 1: Acceder al Formulario
1. Click en "Turnos" en el menú
2. O accede directamente a /turns

### Paso 2: Llenar Información del Paciente
- **Nombre**: Apellidos y nombres completos
- **Edad**: Edad en años
- **Género**: Masculino/Femenino
- **Contacto**: Teléfono de contacto

### Paso 3: Detalles Clínicos
- **Estudios**: Lista de estudios solicitados
- **Tubos**: Número de tubos requeridos
- **Tipo de Atención**:
  - General: Paciente estándar
  - Especial: Adulto mayor, embarazada, discapacidad

### Paso 4: Observaciones (Opcional)
- Notas adicionales
- Información clínica relevante
- Alergias o precauciones

### Paso 5: Guardar
- Click en "Crear Turno"
- Sistema genera número de turno único
- Paciente se agrega a la cola automáticamente`
        }
      ],

      features: [
        'Formulario intuitivo',
        'Validación de datos',
        'Asignación automática de turno',
        'Detección de tipo de atención',
        'Información completa del paciente',
        'Confirmación instantánea'
      ],

      screenshots: getScreenshotsByTags(['turnos', 'crear']),

      tips: [
        'Verifica edad para clasificación automática de especiales',
        'Lista completa de estudios ayuda a calcular tiempo',
        'Usa observaciones para notas importantes',
        'El número de turno se asigna automáticamente'
      ],

      warnings: [
        'Verifica información antes de guardar',
        'No se pueden eliminar turnos una vez creados',
        'Turnos duplicados deben evitarse'
      ]
    },
    order: 7,
    difficulty: 'basic',
    estimatedTime: '10 min',
    tags: ['turnos', 'crear', 'pacientes'],
    isActive: true,
    views: 0
  }
];

async function seedDocumentation() {
  console.log('🌱 Iniciando seed de documentación completa...\n');

  try {
    // Verificar si existe el modelo DocumentationModule
    console.log('📊 Insertando módulos de documentación...\n');

    for (const doc of fullDocumentation) {
      console.log(`📖 Procesando módulo: ${doc.title}`);

      // Aquí insertarías en la base de datos si tienes el modelo
      // Por ahora, solo mostramos lo que se insertaría
      console.log(`   - ID: ${doc.moduleId}`);
      console.log(`   - Categoría: ${doc.category}`);
      console.log(`   - Dificultad: ${doc.difficulty}`);
      console.log(`   - Tiempo estimado: ${doc.estimatedTime}`);
      console.log(`   - Secciones: ${doc.content.sections.length}`);
      console.log(`   - Screenshots: ${doc.content.screenshots.length}`);
      console.log(`   - Tags: ${doc.tags.join(', ')}`);
      console.log('');
    }

    console.log(`✅ ${fullDocumentation.length} módulos procesados exitosamente!\n`);

    // Guardar como JSON para uso en el frontend
    const outputPath = path.join(__dirname, '../lib/docs/fullDocumentation.json');
    fs.writeFileSync(outputPath, JSON.stringify(fullDocumentation, null, 2));
    console.log(`📄 Documentación guardada en: ${outputPath}\n`);

    console.log('🎉 Seed de documentación completado!');

  } catch (error) {
    console.error('❌ Error al hacer seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDocumentation();
