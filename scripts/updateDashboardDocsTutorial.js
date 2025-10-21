const fs = require('fs');
const path = require('path');

// Ruta al archivo JSON
const jsonPath = path.join(__dirname, '..', 'lib', 'docs', 'fullDocumentation.json');

// Leer el archivo JSON actual
const fullDocumentation = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Encontrar el módulo de dashboard
const dashboardIndex = fullDocumentation.findIndex(m => m.moduleId === 'dashboard');

if (dashboardIndex === -1) {
  console.error('❌ Módulo dashboard no encontrado');
  process.exit(1);
}

// Contenido actualizado del módulo dashboard con estilo tutorial
const updatedDashboardModule = {
  ...fullDocumentation[dashboardIndex],
  content: {
    overview: `# Dashboard Administrativo

El **Dashboard Administrativo** es el centro de control principal del Sistema de Gestión de Turnos INER. Desde aquí puedes monitorear todas las actividades del sistema en tiempo real, visualizar métricas clave y tomar decisiones informadas sobre el flujo de pacientes.

## ¿Qué aprenderás en esta guía?

En este tutorial aprenderás a:
- ✅ Navegar por el dashboard administrativo
- ✅ Interpretar las métricas principales del sistema
- ✅ Utilizar las tarjetas de estadísticas en tiempo real
- ✅ Acceder a reportes y módulos desde el dashboard
- ✅ Entender los indicadores de rendimiento del sistema
- ✅ Gestionar las acciones rápidas disponibles

## Antes de comenzar

### Requisitos previos

Para seguir este tutorial necesitas:
- ✓ Tener credenciales de acceso al sistema
- ✓ Contar con rol de **Administrador**
- ✓ Acceso al sistema en \`http://localhost:3005\`
- ✓ Navegador moderno (Chrome, Firefox, Safari, Edge)

### Conceptos clave

**Dashboard**: Panel de control que muestra información resumida y métricas clave del sistema.

**Métricas en tiempo real**: Datos que se actualizan automáticamente cada 5 minutos o manualmente con el botón de actualización.

**Tarjetas (Cards)**: Componentes visuales que muestran información específica como estadísticas, accesos rápidos o datos de módulos.

**Indicadores de rendimiento**: Valores que muestran el desempeño del sistema (pacientes en cola, tiempos promedio, flebotomistas activos).

---

## Tutorial completo paso a paso`,

    sections: [
      {
        id: "step-1-access",
        title: "Paso 1: Accede al Dashboard",
        description: "Inicia sesión y accede al centro de control principal",
        content: `## Paso 1: Accede al Dashboard

El Dashboard es la primera pantalla que verás al iniciar sesión como administrador.

### 1.1 Inicia sesión en el sistema

Accede a la página de login:

\`\`\`
http://localhost:3005/login
\`\`\`

Ingresa tus credenciales de administrador y haz clic en **"Iniciar Sesión"**.

> **💡 Tip**: Si ya has iniciado sesión previamente y tu sesión sigue activa, serás redirigido automáticamente al Dashboard.

### 1.2 Vista inicial del Dashboard

Una vez autenticado, verás la pantalla principal del Dashboard Administrativo.

![Dashboard inicial](/docs/screenshots/dashboard/01-dashboard-main.png)

### Componentes principales del Dashboard

El Dashboard está organizado en secciones clave:

#### 🎯 Header del Dashboard
- **Título**: "Dashboard Administrativo"
- **Subtítulo**: "Centro de control del sistema"
- **Avatar del usuario**: Muestra tus iniciales
- **Botón de actualización**: Fuerza actualización de datos

#### 📊 Panel de Métricas Principales

Tarjetas con indicadores clave del sistema:
- **Pacientes en Cola**: Número actual de pacientes esperando
- **Tiempo Promedio**: Tiempo promedio de atención en minutos
- **Flebotomistas Activos**: Personal actualmente en servicio
- **Cubículos Disponibles**: Cubículos activos para atención

#### 🗂️ Tarjetas de Módulos

Accesos directos a los módulos principales:
- **Gestión de Usuarios** 👥
- **Gestión de Cubículos** 🏥
- **Estadísticas** 📈
- **Cola de Turnos** 📋
- **Documentación** 📚

> **⚠️ Importante**: Solo verás los módulos a los que tu rol tiene acceso. Los administradores tienen acceso completo.

### 1.3 Actualización automática

El Dashboard se actualiza automáticamente cada **5 minutos** para mantener la información al día.

**Indicador de última actualización**:
Verás un texto pequeño en la esquina superior: "Última actualización: hace 2 minutos"

**Actualización manual**:
Haz clic en el botón **"Actualizar"** (🔄) para forzar una actualización inmediata.

> **💡 Tip**: Usa \`Ctrl+R\` o \`Cmd+R\` para recargar toda la página y obtener los datos más recientes.

---`
      },
      {
        id: "step-2-metrics",
        title: "Paso 2: Interpreta las Métricas Principales",
        description: "Entiende los indicadores clave del sistema",
        content: `## Paso 2: Interpreta las Métricas Principales

Las métricas en la parte superior del Dashboard te dan una visión rápida del estado actual del sistema.

### 2.1 Pacientes en Cola

**Qué muestra**: Número de pacientes actualmente esperando ser atendidos.

![Métrica de pacientes en cola](/docs/screenshots/dashboard/02-patients-queue.png)

**Interpretación**:

- **0-5 pacientes**: 🟢 Cola baja, operación normal
- **6-15 pacientes**: 🟡 Cola moderada, monitorear
- **16+ pacientes**: 🔴 Cola alta, considerar abrir más cubículos

**Desglose por tipo**:
- Pacientes Especiales (🦽): Prioridad alta
- Pacientes Generales: Orden de llegada
- Pacientes Diferidos (🕐): Requieren atención específica

> **💡 Tip**: Haz clic en la tarjeta "Pacientes en Cola" para ver detalles completos de cada paciente en espera.

### 2.2 Tiempo Promedio de Atención

**Qué muestra**: Tiempo promedio (en minutos) desde que se llama al paciente hasta que finaliza la toma de muestra.

**Cálculo**:
\`\`\`
Tiempo Promedio = (calledAt - finishedAt) promedio de todos los pacientes atendidos hoy
\`\`\`

**Interpretación**:

- **0-10 minutos**: 🟢 Excelente eficiencia
- **11-20 minutos**: 🟡 Tiempo normal
- **21+ minutos**: 🔴 Revisar procesos, posible cuello de botella

> **📊 Dato técnico**: Este cálculo solo incluye pacientes con estado "FINISHED" del día actual. Se excluyen pacientes cancelados o sin atender.

### 2.3 Flebotomistas Activos

**Qué muestra**: Número de flebotomistas actualmente trabajando en el sistema.

**Estado del flebotomista**:
- **Activo**: Ha iniciado sesión y su estado es ACTIVE
- **En servicio**: Tiene al menos un cubículo asignado
- **Inactivo**: No ha iniciado sesión o estado INACTIVE

**Recomendaciones por hora**:

| Horario | Pacientes Esperados | Flebotomistas Recomendados |
|---------|---------------------|----------------------------|
| 7:00 - 9:00 AM | Alto | 4-5 |
| 9:00 - 12:00 PM | Muy Alto | 5-6 |
| 12:00 - 2:00 PM | Medio | 3-4 |
| 2:00 - 7:00 PM | Bajo-Medio | 2-3 |

> **⚠️ Advertencia**: Si el número de pacientes en cola supera 3x el número de flebotomistas activos, considera añadir más personal.

### 2.4 Cubículos Disponibles

**Qué muestra**: Número de cubículos activos y listos para recibir pacientes.

**Estados de cubículos**:
- **ACTIVE**: Disponible para asignación
- **INACTIVE**: Fuera de servicio (mantenimiento, limpieza)

**Tipos de cubículos**:
- **GENERAL**: Para pacientes generales
- **SPECIAL**: Para pacientes especiales (sillas de ruedas, movilidad reducida)

> **💡 Tip**: Mantén al menos 1 cubículo SPECIAL siempre activo para emergencias.

### 2.5 Análisis rápido del Dashboard

**Ejemplo de lectura rápida**:

\`\`\`
Pacientes en Cola: 12
Tiempo Promedio: 15 min
Flebotomistas Activos: 3
Cubículos Disponibles: 5
\`\`\`

**Análisis**:
- ✅ Cubículos suficientes (5 disponibles)
- ⚠️ Cola moderada-alta (12 pacientes / 3 flebotomistas = 4 pacientes por persona)
- ✅ Tiempo promedio dentro de rango normal (15 min)

**Acción recomendada**: Considerar activar 1 flebotomista adicional para reducir tiempo de espera.

---`
      },
      {
        id: "step-3-module-cards",
        title: "Paso 3: Navega por las Tarjetas de Módulos",
        description: "Accede a los diferentes módulos del sistema",
        content: `## Paso 3: Navega por las Tarjetas de Módulos

El Dashboard incluye tarjetas de acceso rápido a todos los módulos del sistema.

### 3.1 Estructura de las Tarjetas

Cada tarjeta de módulo contiene:

- **Ícono identificativo**: Visual que representa el módulo (👥, 🏥, 📈, etc.)
- **Título del módulo**: Nombre descriptivo
- **Descripción breve**: Qué hace el módulo
- **Badge de dificultad**: Básico, Intermedio, Avanzado
- **Badge de tiempo estimado**: Tiempo de aprendizaje
- **Botón de acción**: "Ver Documentación" o "Acceder"
- **Barra de progreso**: Indica progreso en documentación (si aplicable)

![Tarjeta de módulo](/docs/screenshots/dashboard/03-module-card.png)

### 3.2 Módulos Disponibles

#### 👥 Gestión de Usuarios
- **Dificultad**: Intermedio
- **Tiempo**: 30 min
- **Función**: Crear, editar y administrar usuarios del sistema
- **Acceso**: Click en la tarjeta → Redirige a \`/users\`

#### 🏥 Gestión de Cubículos
- **Dificultad**: Básico
- **Tiempo**: 15 min
- **Función**: Administrar cubículos de atención
- **Acceso**: Click en la tarjeta → Redirige a \`/cubicles\`

#### 📈 Estadísticas
- **Dificultad**: Intermedio
- **Tiempo**: 25 min
- **Función**: Ver reportes y análisis de datos
- **Acceso**: Click en la tarjeta → Redirige a \`/statistics\`

#### 📋 Cola de Turnos
- **Dificultad**: Intermedio
- **Tiempo**: 20 min
- **Función**: Ver y gestionar cola de pacientes
- **Acceso**: Click en la tarjeta → Redirige a \`/turns/queue\`

#### 📚 Documentación
- **Dificultad**: Básico
- **Tiempo**: Variable
- **Función**: Guías y tutoriales del sistema
- **Acceso**: Click en la tarjeta → Redirige a \`/docs\`

### 3.3 Interacción con las Tarjetas

**Hover (pasar el mouse)**:
- La tarjeta se eleva ligeramente
- Aparece sombra más pronunciada
- Indica que es clickeable

**Click en la tarjeta**:
- **Opción 1**: Redirige directamente al módulo
- **Opción 2**: Abre modal con opciones (Acceder / Ver Documentación)

**Botón "Ver Documentación"**:
- Abre la documentación específica del módulo
- No te saca del Dashboard
- Útil para aprender antes de usar

**Botón "Acceder"**:
- Te lleva directamente al módulo
- Rápido acceso a funcionalidad

> **💡 Tip**: Usa las tarjetas de documentación cuando estés aprendiendo el sistema. Una vez familiarizado, accede directamente a los módulos.

### 3.4 Badges de Dificultad

**Básico** 🟢:
- Módulos sencillos e intuitivos
- No requieren conocimientos previos
- Ejemplo: Gestión de Cubículos

**Intermedio** 🟡:
- Requieren familiarización con el sistema
- Múltiples funcionalidades
- Ejemplo: Gestión de Usuarios, Estadísticas

**Avanzado** 🔴:
- Funcionalidades complejas
- Requieren entrenamiento previo
- Ejemplo: Configuración del Sistema (si aplica)

### 3.5 Barra de Progreso

Algunas tarjetas muestran una barra de progreso que indica:
- **0%**: No has visitado la documentación
- **1-99%**: Has completado parcialmente la documentación
- **100%**: Has completado toda la documentación del módulo

> **📌 Nota**: El progreso se guarda en tu navegador localmente y no afecta el funcionamiento del módulo.

---`
      },
      {
        id: "step-4-quick-actions",
        title: "Paso 4: Utiliza Acciones Rápidas",
        description: "Aprovecha los atajos y funcionalidades del Dashboard",
        content: `## Paso 4: Utiliza Acciones Rápidas

El Dashboard incluye varias acciones rápidas para mejorar tu productividad.

### 4.1 Botón de Actualización

**Ubicación**: Esquina superior derecha del Dashboard

**Función**: Actualiza todas las métricas y datos en tiempo real sin recargar la página completa.

**Cuándo usarlo**:
- Después de realizar cambios en otros módulos
- Cuando necesites confirmar datos actuales
- Si las métricas parecen desactualizadas

**Efecto visual**:
- Botón muestra ícono de "cargando" (spinner)
- Métricas se actualizan una por una
- Toast notification: "Datos actualizados exitosamente"

> **💡 Tip**: El Dashboard se actualiza automáticamente cada 5 minutos, pero puedes forzar actualización en cualquier momento.

### 4.2 Acceso Rápido a Reportes

Algunos Dashboards incluyen botón de **"Generar Reporte"** que permite:

1. Seleccionar rango de fechas
2. Elegir tipo de reporte (Diario, Semanal, Mensual, Personalizado)
3. Exportar en PDF o Excel

**Tipos de reportes disponibles**:
- ✅ Reporte de pacientes atendidos
- ✅ Rendimiento de flebotomistas
- ✅ Estadísticas de satisfacción
- ✅ Tiempos de atención por cubículo

### 4.3 Navegación con Teclado

**Atajos de teclado útiles**:

| Atajo | Acción |
|-------|--------|
| \`Ctrl+R\` / \`Cmd+R\` | Recargar Dashboard completo |
| \`Alt+U\` | Ir a Gestión de Usuarios |
| \`Alt+C\` | Ir a Gestión de Cubículos |
| \`Alt+S\` | Ir a Estadísticas |
| \`Alt+Q\` | Ir a Cola de Turnos |
| \`Alt+D\` | Ir a Documentación |

> **📌 Nota**: Los atajos de teclado pueden variar según tu navegador y sistema operativo.

### 4.4 Menú de Usuario

**Ubicación**: Esquina superior derecha, junto a tu avatar

**Opciones disponibles**:
- **Mi Perfil**: Ver y editar tu información personal
- **Configuración**: Preferencias del sistema
- **Cambiar Contraseña**: Actualizar credenciales
- **Cerrar Sesión**: Salir del sistema de forma segura

**Información mostrada**:
- Nombre completo
- Rol (Admin / Flebotomista)
- Última sesión
- Tiempo en sesión actual

### 4.5 Notificaciones en Tiempo Real

El Dashboard puede mostrar notificaciones importantes:

**Tipos de notificaciones**:
- 🔴 **Alertas críticas**: Cola muy alta, sistema lento
- 🟡 **Advertencias**: Flebotomistas insuficientes, cubículos limitados
- 🔵 **Información**: Nuevos usuarios creados, actualizaciones del sistema
- 🟢 **Éxito**: Operaciones completadas correctamente

**Ubicación**:
- Toast notifications: Esquina superior derecha
- Badge en ícono de campana: Número de notificaciones sin leer

> **⚠️ Importante**: Las notificaciones críticas requieren acción inmediata. Revísalas siempre que aparezcan.

---`
      },
      {
        id: "step-5-best-practices",
        title: "Paso 5: Mejores Prácticas del Dashboard",
        description: "Consejos para aprovechar al máximo el Dashboard",
        content: `## Paso 5: Mejores Prácticas del Dashboard

Sigue estas recomendaciones para usar el Dashboard de manera eficiente y efectiva.

### 5.1 Rutina de Monitoreo Recomendada

**Al inicio del día (7:00 AM)**:
1. ✅ Revisa las métricas principales
2. ✅ Verifica flebotomistas activos vs. esperados
3. ✅ Confirma cubículos ACTIVE
4. ✅ Revisa pacientes pre-registrados (si aplica)

**Durante el día (cada 1-2 horas)**:
1. ✅ Monitorea cola de pacientes
2. ✅ Verifica tiempo promedio de atención
3. ✅ Revisa notificaciones pendientes
4. ✅ Actualiza métricas manualmente si necesario

**Al final del día (6:45 PM)**:
1. ✅ Genera reporte del día
2. ✅ Verifica que todos los turnos estén cerrados
3. ✅ Revisa estadísticas finales
4. ✅ Cierra sesión correctamente

### 5.2 Interpretación de Tendencias

**Cola creciendo rápidamente**:
- 📈 Más pacientes llegan de lo esperado
- **Acción**: Activar flebotomistas de reserva
- **Prevención**: Revisar horarios pico históricos

**Tiempo promedio aumentando**:
- 📈 Posible problema en proceso de atención
- **Acción**: Revisar cubículos con mayor demora
- **Prevención**: Capacitar en procedimientos rápidos

**Flebotomistas activos bajando**:
- 📉 Personal saliendo a descanso/almuerzo
- **Acción**: Coordinar relevos escalonados
- **Prevención**: Planificar horarios de descanso

### 5.3 Uso de Múltiples Dispositivos

**Dashboard en computadora principal**:
- Vista completa con todas las métricas
- Acceso a todos los módulos
- Generación de reportes

**Dashboard en tablet/móvil**:
- Vista responsiva adaptada
- Métricas principales visibles
- Acciones rápidas disponibles

> **💡 Tip**: Mantén el Dashboard abierto en una pestaña o monitor secundario para monitoreo constante mientras trabajas en otros módulos.

### 5.4 Seguridad y Privacidad

**Prácticas recomendadas**:
- 🔒 Nunca compartas tu sesión con otros
- 🔒 Cierra sesión al abandonar tu estación
- 🔒 No dejes el Dashboard abierto sin supervisión
- 🔒 Usa contraseñas seguras y únicas

**Auto-cierre de sesión**:
El sistema cierra automáticamente la sesión después de **20 minutos de inactividad** por seguridad.

> **⚠️ Importante**: Si ves actividad sospechosa en el Dashboard (métricas extrañas, usuarios desconocidos), repórtalo inmediatamente al administrador del sistema.

### 5.5 Optimización de Rendimiento

**Para mejorar la velocidad del Dashboard**:

1. **Limpia caché del navegador** regularmente:
   - Chrome/Edge: \`Ctrl+Shift+Delete\`
   - Firefox: \`Ctrl+Shift+Del\`
   - Safari: \`Cmd+Option+E\`

2. **Cierra pestañas innecesarias**: El Dashboard consume recursos para actualizaciones en tiempo real

3. **Usa navegadores modernos**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

4. **Desactiva extensiones conflictivas**: Bloqueadores de anuncios pueden interferir con actualizaciones

> **📊 Rendimiento óptimo**: El Dashboard debería cargar en menos de 2 segundos con conexión estable.

### 5.6 Resolución de Problemas Comunes

**Problema**: Métricas no se actualizan
- **Solución**: Click en botón "Actualizar" o recarga con \`Ctrl+R\`

**Problema**: Tarjetas de módulos no clickeables
- **Solución**: Verifica que tu rol tenga permisos, recarga la página

**Problema**: Dashboard se ve descuadrado
- **Solución**: Limpia caché, usa zoom 100%, actualiza navegador

**Problema**: Notificaciones no aparecen
- **Solución**: Verifica permisos del navegador, habilita notificaciones del sistema

> **🆘 Soporte**: Si los problemas persisten, contacta al administrador del sistema o consulta la documentación técnica.

---`
      }
    ],

    features: [
      {
        icon: "📊",
        title: "Métricas en Tiempo Real",
        description: "Visualiza datos actualizados automáticamente cada 5 minutos con opción de actualización manual instantánea"
      },
      {
        icon: "🎯",
        title: "Acceso Rápido a Módulos",
        description: "Tarjetas interactivas con acceso directo a todos los módulos del sistema en un solo click"
      },
      {
        icon: "📈",
        title: "Indicadores de Rendimiento",
        description: "KPIs visuales que muestran el estado del sistema: cola, tiempos, personal activo y cubículos"
      },
      {
        icon: "🔄",
        title: "Actualización Automática",
        description: "Datos que se refrescan periódicamente sin necesidad de recargar la página manualmente"
      },
      {
        icon: "🗂️",
        title: "Organización Modular",
        description: "Estructura clara con tarjetas categorizadas por función: usuarios, cubículos, estadísticas, turnos"
      },
      {
        icon: "🎨",
        title: "Interfaz Intuitiva",
        description: "Diseño moderno con glassmorphism, gradientes y animaciones que facilitan la navegación"
      },
      {
        icon: "📱",
        title: "Diseño Responsivo",
        description: "Adaptable a diferentes tamaños de pantalla: desktop, tablet y móvil con vista optimizada"
      },
      {
        icon: "🔔",
        title: "Notificaciones en Tiempo Real",
        description: "Alertas visuales para eventos importantes: colas altas, problemas del sistema, actualizaciones"
      },
      {
        icon: "⚡",
        title: "Rendimiento Optimizado",
        description: "Carga rápida y eficiente incluso con grandes volúmenes de datos y múltiples métricas"
      },
      {
        icon: "🔐",
        title: "Control de Acceso por Rol",
        description: "Muestra solo módulos y funciones autorizadas según el rol del usuario (Admin/Flebotomista)"
      }
    ],

    tips: [
      {
        icon: "💡",
        title: "Actualización Rápida",
        description: "Usa Ctrl+R para actualizar rápidamente todas las estadísticas y métricas del Dashboard"
      },
      {
        icon: "🖱️",
        title: "Gráficos Interactivos",
        description: "Haz clic en las métricas para ver detalles expandidos y gráficos históricos de tendencias"
      },
      {
        icon: "📸",
        title: "Exportar Visualizaciones",
        description: "Puedes exportar cualquier gráfico o métrica como imagen PNG para reportes o presentaciones"
      },
      {
        icon: "⚙️",
        title: "Preferencias Guardadas",
        description: "El Dashboard guarda tus preferencias de visualización (orden de tarjetas, métricas favoritas) localmente"
      },
      {
        icon: "🖥️",
        title: "Monitor Secundario",
        description: "Mantén el Dashboard en un monitor secundario para monitoreo constante mientras trabajas en otros módulos"
      },
      {
        icon: "⏰",
        title: "Horarios Pico",
        description: "Presta especial atención a las métricas entre 9:00 AM - 12:00 PM, horario de mayor afluencia"
      },
      {
        icon: "📊",
        title: "Tendencias Históricas",
        description: "Compara las métricas actuales con promedios históricos para identificar anomalías rápidamente"
      },
      {
        icon: "🎯",
        title: "Atajos de Teclado",
        description: "Usa Alt+[letra] para navegar rápidamente a módulos específicos sin usar el mouse"
      },
      {
        icon: "🔄",
        title: "Auto-actualización",
        description: "Las métricas se actualizan cada 5 minutos automáticamente, observa el indicador de 'última actualización'"
      }
    ],

    warnings: [
      {
        icon: "⚠️",
        title: "Actualización de Estadísticas",
        description: "Las estadísticas se actualizan cada 5 minutos. Para datos en tiempo real exacto, usa el botón 'Actualizar'"
      },
      {
        icon: "⏳",
        title: "Reportes Grandes",
        description: "Los reportes con más de 1000 registros pueden tardar varios segundos en generarse, ten paciencia"
      },
      {
        icon: "🔒",
        title: "Sesión de Inactividad",
        description: "El sistema cerrará tu sesión automáticamente después de 20 minutos de inactividad por seguridad"
      },
      {
        icon: "📶",
        title: "Conexión Requerida",
        description: "El Dashboard requiere conexión estable a internet. Sin conexión, las métricas no se actualizarán"
      },
      {
        icon: "🚫",
        title: "No Compartas Sesión",
        description: "Nunca compartas tu sesión activa con otros usuarios. Cada persona debe usar sus propias credenciales"
      },
      {
        icon: "💾",
        title: "Cambios No Guardados",
        description: "Al navegar a otros módulos desde el Dashboard, asegúrate de guardar cambios pendientes primero"
      },
      {
        icon: "🖥️",
        title: "Navegadores Compatibles",
        description: "Usa navegadores modernos (Chrome 90+, Firefox 88+, Safari 14+). Versiones antiguas pueden tener problemas"
      }
    ],

    screenshots: [
      {
        filename: "dashboard-main.png",
        title: "Vista Principal del Dashboard",
        description: "Dashboard completo mostrando métricas principales, tarjetas de módulos y controles de navegación",
        path: "/docs/screenshots/dashboard/01-dashboard-main.png",
        tags: ["dashboard", "principal", "métricas"]
      },
      {
        filename: "dashboard-metrics.png",
        title: "Panel de Métricas en Tiempo Real",
        description: "Métricas detalladas: pacientes en cola, tiempo promedio, flebotomistas activos y cubículos disponibles",
        path: "/docs/screenshots/dashboard/02-dashboard-metrics.png",
        tags: ["métricas", "estadísticas", "tiempo real"]
      },
      {
        filename: "dashboard-module-cards.png",
        title: "Tarjetas de Módulos",
        description: "Tarjetas interactivas con acceso a gestión de usuarios, cubículos, estadísticas y documentación",
        path: "/docs/screenshots/dashboard/03-module-cards.png",
        tags: ["módulos", "navegación", "accesos"]
      },
      {
        filename: "dashboard-queue-alert.png",
        title: "Alerta de Cola Alta",
        description: "Notificación visual cuando la cola de pacientes supera el umbral recomendado",
        path: "/docs/screenshots/dashboard/04-queue-alert.png",
        tags: ["alerta", "cola", "notificación"]
      },
      {
        filename: "dashboard-responsive.png",
        title: "Vista Responsiva en Tablet",
        description: "Dashboard adaptado a pantallas medianas con layout optimizado para tablets",
        path: "/docs/screenshots/dashboard/05-responsive-tablet.png",
        tags: ["responsivo", "tablet", "móvil"]
      }
    ]
  }
};

// Reemplazar el módulo en el array
fullDocumentation[dashboardIndex] = updatedDashboardModule;

// Guardar el archivo actualizado
fs.writeFileSync(jsonPath, JSON.stringify(fullDocumentation, null, 2), 'utf8');

console.log('✅ Módulo Dashboard actualizado exitosamente con contenido tutorial');
console.log('📝 Secciones agregadas:', updatedDashboardModule.content.sections.length);
console.log('✨ Features agregadas:', updatedDashboardModule.content.features.length);
console.log('💡 Tips agregados:', updatedDashboardModule.content.tips.length);
console.log('⚠️  Warnings agregadas:', updatedDashboardModule.content.warnings.length);
console.log('📸 Screenshots referenciadas:', updatedDashboardModule.content.screenshots.length);
