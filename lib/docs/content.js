export const documentationContent = {
  // ESTRUCTURA JERÁRQUICA POR ROL
  admin: {
    title: "Manual del Administrador",
    description: "Guía completa para administradores del sistema TomaTurno",
    modules: [
      {
        id: 'dashboard',
        title: 'Dashboard Administrativo',
        icon: 'FaChartBar',
        order: 1,
        estimatedTime: '15 min',
        difficulty: 'basic',
        tags: ['dashboard', 'estadísticas', 'administración'],
        sections: [
          {
            id: 'overview',
            title: 'Vista General del Dashboard',
            content: {
              text: `# Dashboard Administrativo

El dashboard administrativo es el centro de control principal del sistema TomaTurno. Desde aquí puedes monitorear todas las actividades del sistema, generar reportes y administrar usuarios.

## Características Principales

- **Vista en tiempo real** de todos los turnos activos
- **Métricas de rendimiento** de flebotomistas
- **Estadísticas de satisfacción** de pacientes
- **Control de usuarios** y permisos
- **Exportación de reportes** en PDF y Excel

## Navegación Principal

El menú lateral te permite acceder a:
1. Dashboard (inicio)
2. Gestión de usuarios
3. Estadísticas detalladas
4. Configuración del sistema
5. Reportes y auditoría`,
              images: [
                {
                  src: '/docs/screenshots/admin-dashboard-overview.png',
                  alt: 'Vista general del dashboard administrativo',
                  caption: 'Panel principal mostrando métricas en tiempo real'
                },
                {
                  src: '/docs/screenshots/admin-dashboard-stats.png',
                  alt: 'Estadísticas del dashboard',
                  caption: 'Sección de estadísticas con gráficos interactivos'
                }
              ],
              videos: [{
                id: 'admin-dashboard-intro',
                title: 'Introducción al Dashboard Administrativo',
                url: '/docs/videos/admin/dashboard-intro.mp4',
                duration: '5:30',
                thumbnail: '/docs/videos/admin/dashboard-intro-thumb.jpg',
                transcript: `0:00 - Bienvenido al dashboard administrativo de TomaTurno
0:30 - Navegación por el menú principal
1:15 - Interpretación de métricas en tiempo real
2:30 - Uso de filtros de fecha
3:45 - Exportación de reportes
4:30 - Configuraciones rápidas
5:00 - Conclusión y próximos pasos`,
                subtitles: '/docs/videos/admin/dashboard-intro.vtt'
              }],
              codeExamples: [{
                title: 'Filtrar estadísticas por fecha',
                language: 'javascript',
                code: `// Ejemplo de filtrado de estadísticas
const filterStatistics = async (startDate, endDate) => {
  const response = await fetch('/api/statistics/daily', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    })
  });
  return response.json();
};`
              }],
              warnings: [
                'Las estadísticas se actualizan cada 5 minutos. Para datos en tiempo real, usa el botón "Actualizar".',
                'Los reportes grandes (>1000 registros) pueden tardar varios segundos en generarse.'
              ],
              tips: [
                'Usa Ctrl+R para actualizar rápidamente las estadísticas',
                'Los gráficos son interactivos: haz clic para ver detalles',
                'Puedes exportar cualquier gráfico como imagen PNG'
              ],
              relatedLinks: ['users', 'statistics', 'reports']
            }
          },
          {
            id: 'metrics',
            title: 'Interpretación de Métricas',
            content: {
              text: `# Métricas del Dashboard

## Indicadores Clave de Rendimiento (KPIs)

### 1. Turnos por Día
- **Verde (>50 turnos)**: Día normal de operación
- **Amarillo (30-50 turnos)**: Flujo moderado
- **Rojo (<30 turnos)**: Día de baja actividad

### 2. Tiempo Promedio de Atención
- **Óptimo**: 3-5 minutos por paciente
- **Aceptable**: 5-8 minutos por paciente
- **Requiere atención**: >8 minutos por paciente

### 3. Satisfacción del Cliente
- **Excelente**: >4.5/5.0
- **Bueno**: 4.0-4.5/5.0
- **Necesita mejora**: <4.0/5.0`,
              images: [
                {
                  src: '/docs/screenshots/metrics-interpretation.png',
                  alt: 'Interpretación de métricas',
                  caption: 'Guía visual para interpretar los indicadores'
                }
              ]
            }
          }
        ],
        exercises: [
          {
            id: 'monthly-report-exercise',
            title: 'Práctica: Generar reporte mensual',
            difficulty: 'medium',
            estimatedTime: '10 min',
            objective: 'Aprender a generar y configurar reportes mensuales completos',
            steps: [
              'Navega a la sección de Estadísticas → Mensual',
              'Selecciona el mes anterior desde el selector de fechas',
              'Configura los filtros: incluir todos los flebotomistas',
              'Haz clic en "Generar Reporte PDF"',
              'Verifica que el PDF contenga gráficos y tablas',
              'Guarda el archivo con nombre descriptivo'
            ],
            validation: '/api/docs/exercises/validate/monthly-report',
            hints: [
              'Si el PDF está vacío, verifica que haya datos en el mes seleccionado',
              'Los reportes se generan más rápido en horarios de baja actividad'
            ]
          }
        ],
        faqs: [
          {
            id: 'export-data-faq',
            question: '¿Cómo exporto los datos del sistema?',
            answer: `Puedes exportar datos de varias maneras:

1. **Reportes PDF**: Ve a Estadísticas → selecciona período → "Generar PDF"
2. **Datos Excel**: Usa el botón "Exportar Excel" en cualquier tabla
3. **API**: Para integraciones, usa los endpoints de /api/statistics/

**Formatos disponibles**: PDF, Excel (.xlsx), CSV, JSON`,
            category: 'export',
            votes: 45,
            isHelpful: true,
            updated: '2024-01-15',
            tags: ['export', 'pdf', 'excel', 'datos']
          },
          {
            id: 'user-permissions-faq',
            question: '¿Cómo asigno permisos específicos a un usuario?',
            answer: `Para asignar permisos:

1. Ve a **Gestión de Usuarios**
2. Busca y selecciona el usuario
3. En la sección "Rol", elige entre:
   - **Admin**: Acceso completo
   - **Flebotomista**: Panel de atención únicamente
   - **Usuario**: Solo visualización de turnos
4. Guarda los cambios

Los cambios toman efecto inmediatamente.`,
            category: 'users',
            votes: 32,
            isHelpful: true,
            updated: '2024-01-10'
          }
        ],
        changelog: [
          {
            version: '1.3.0',
            date: '2024-01-20',
            changes: [
              'Nuevos gráficos de tendencias semanales',
              'Exportación directa a Google Sheets',
              'Filtros avanzados por flebotomista'
            ]
          },
          {
            version: '1.2.0',
            date: '2024-01-10',
            changes: [
              'Dashboard rediseñado con mejor UX',
              'Métricas en tiempo real',
              'Corrección de bug en exportación PDF'
            ]
          }
        ]
      },
      {
        id: 'users',
        title: 'Gestión de Usuarios',
        icon: 'FaUsers',
        order: 2,
        estimatedTime: '20 min',
        difficulty: 'intermediate',
        tags: ['usuarios', 'permisos', 'administración'],
        sections: [
          {
            id: 'user-management',
            title: 'Administración de Usuarios',
            content: {
              text: `# Gestión de Usuarios

## Crear Nuevo Usuario

Para crear un nuevo usuario en el sistema:

1. Ve a **Gestión de Usuarios** desde el menú principal
2. Haz clic en **"Nuevo Usuario"**
3. Completa los campos obligatorios:
   - Nombre completo
   - Nombre de usuario (único)
   - Email (opcional pero recomendado)
   - Teléfono
   - Rol del sistema
4. La contraseña temporal se genera automáticamente
5. Haz clic en **"Crear Usuario"**

## Roles del Sistema

### Administrador
- **Permisos**: Acceso completo al sistema
- **Funciones**: Gestión de usuarios, reportes, configuración
- **Restricciones**: Ninguna

### Flebotomista
- **Permisos**: Panel de atención, estadísticas propias
- **Funciones**: Llamar pacientes, completar atenciones
- **Restricciones**: No puede gestionar otros usuarios

### Usuario
- **Permisos**: Solo visualización
- **Funciones**: Ver cola de turnos, encuestas
- **Restricciones**: No puede realizar acciones administrativas`,
              images: [
                {
                  src: '/docs/screenshots/user-creation-form.png',
                  alt: 'Formulario de creación de usuario',
                  caption: 'Pantalla de creación con todos los campos requeridos'
                }
              ]
            }
          }
        ]
      },
      {
        id: 'attention',
        title: 'Módulo de Atención',
        icon: 'FaUserMd',
        order: 3,
        estimatedTime: '25 min',
        difficulty: 'intermediate',
        tags: ['atención', 'pacientes', 'cubículos', 'flujo'],
        sections: [
          {
            id: 'attention-flow',
            title: 'Flujo de Atención',
            content: {
              text: `# Módulo de Atención

## Descripción General

El módulo de atención es el corazón operativo del sistema TomaTurno. Gestiona todo el proceso desde que un paciente es llamado hasta que finaliza su atención.

## Flujo de Trabajo Completo

### 1. Selección de Cubículo
- Verificar disponibilidad del cubículo
- Seleccionar tipo: GENERAL o ESPECIAL
- El sistema recordará la selección durante el turno
- Posibilidad de cambiar en cualquier momento

### 2. Llamar Paciente
- Hacer clic en "Llamar Siguiente" o presionar F1
- Anuncio automático por altavoz
- Información del paciente en pantalla
- Notificación en sala de espera

### 3. Atender Paciente
- Confirmar identidad del paciente
- Marcar inicio de atención
- Temporizador automático
- Registro de hora exacta

### 4. Finalizar Atención
- Marcar como completada
- Cálculo automático del tiempo total
- Actualización de estadísticas
- Cubículo disponible para siguiente paciente

### 5. Manejo de No Presentados
- Esperar 2 minutos reglamentarios
- Tres llamados con 30 segundos de espera
- Marcar como "No Presentado"
- Proceder con siguiente paciente

## Métricas Clave
- **Tiempo promedio**: 6:30 minutos
- **Pacientes/hora**: 9.2
- **Tasa de presentación**: 94%
- **Satisfacción**: 4.7/5`,
              images: [
                {
                  src: '/docs/screenshots/attention-flow.png',
                  alt: 'Flujo de atención completo',
                  caption: 'Diagrama del proceso de atención paso a paso'
                },
                {
                  src: '/docs/screenshots/attention-metrics.png',
                  alt: 'Métricas de atención',
                  caption: 'Panel de métricas en tiempo real'
                }
              ],
              videos: [{
                id: 'attention-complete-flow',
                title: 'Flujo Completo de Atención',
                url: '/docs/videos/attention/complete-flow.mp4',
                duration: '8:45',
                thumbnail: '/docs/videos/attention/flow-thumb.jpg'
              }],
              codeExamples: [{
                title: 'Llamar siguiente paciente',
                language: 'javascript',
                code: `const callNextPatient = async () => {
  const response = await fetch('/api/attention/call-next', {
    method: 'POST',
    body: JSON.stringify({
      cubiculoId: currentCubicle.id,
      phlebotomistId: currentUser.id
    })
  });
  const data = await response.json();
  announcePatient(data.patient);
  return data;
};`
              }],
              warnings: [
                'Siempre verificar identidad del paciente antes de iniciar atención',
                'No dejar el cubículo sin marcar finalización de atención',
                'Respetar tiempos de espera para pacientes no presentados'
              ],
              tips: [
                'Usar atajos de teclado para agilizar el proceso',
                'Preparar materiales antes de llamar al paciente',
                'Mantener comunicación clara con el paciente'
              ]
            }
          },
          {
            id: 'special-scenarios',
            title: 'Escenarios Especiales',
            content: {
              text: `# Manejo de Situaciones Especiales

## Pacientes Prioritarios

### Identificación
- Adultos mayores (>65 años)
- Mujeres embarazadas
- Personas con discapacidad
- Niños menores de 5 años

### Protocolo
1. Identificar prioridad en el sistema
2. Usar filtro de pacientes prioritarios
3. Llamar inmediatamente sin importar orden
4. Registrar motivo de prioridad

## Pacientes Nerviosos o con Fobia

### Manejo Especializado
- Hablar con voz calmada
- Explicar procedimiento paso a paso
- Permitir tiempo adicional
- Ofrecer técnicas de respiración
- Permitir acompañante si es necesario

## Pacientes Pediátricos

### Protocolo Especial
- Ambiente amigable
- Uso de distracciones (juguetes, stickers)
- Comunicación apropiada para la edad
- Trabajo rápido pero cuidadoso
- Involucrar a los padres

## Emergencias Médicas

### Protocolo de Emergencia
1. Detener procedimiento inmediatamente
2. Llamar al médico de turno
3. Mantener paciente cómodo y monitorizado
4. Documentar incidente detalladamente
5. Seguir protocolo hospitalario`,
              tips: [
                'Mantener la calma en situaciones difíciles',
                'Tener números de emergencia a mano',
                'Practicar protocolos regularmente'
              ]
            }
          },
          {
            id: 'shortcuts',
            title: 'Atajos y Comandos',
            content: {
              text: `# Atajos de Teclado y Comandos

## Atajos de Teclado

| Tecla | Acción |
|-------|--------|
| F1 | Llamar siguiente paciente |
| F2 | Iniciar atención |
| F3 | Finalizar atención |
| F4 | Marcar no presentado |
| F5 | Ver cola de espera |
| F6 | Cambiar cubículo |
| ESC | Cancelar operación |

## Comandos del Sistema

### Atención
- **/llamar** - Llama al siguiente paciente
- **/atender ID** - Inicia atención de paciente específico
- **/finalizar** - Termina la atención actual
- **/ausente** - Marca paciente como no presentado

### Consultas
- **/cola** - Ver cola de espera
- **/stats** - Ver estadísticas del día
- **/historial** - Ver últimos pacientes
- **/buscar NOMBRE** - Buscar paciente

### Configuración
- **/cubiculo ID** - Cambiar de cubículo
- **/pausa** - Activar pausa temporal
- **/sonido on/off** - Control de sonidos
- **/modo noche** - Cambiar tema visual`,
              codeExamples: [{
                title: 'Sistema de múltiples llamadas',
                language: 'javascript',
                code: `const multipleCallSystem = async (patientId, attempt = 1) => {
  if (attempt > 3) {
    return markNoShow(patientId);
  }

  await callPatient(patientId);
  await wait(30000); // 30 segundos

  const responded = await checkPatientResponse(patientId);
  if (!responded) {
    return multipleCallSystem(patientId, attempt + 1);
  }
};`
              }]
            }
          }
        ],
        faqs: [
          {
            id: 'faq-patient-priority',
            question: '¿Cómo identifico a un paciente prioritario?',
            answer: 'Los pacientes prioritarios aparecen con un ícono especial en la cola. Incluyen adultos mayores, embarazadas, personas con discapacidad y niños pequeños. Usa el filtro de prioridad para verlos rápidamente.'
          },
          {
            id: 'faq-no-show',
            question: '¿Qué hago si un paciente no se presenta?',
            answer: 'Espera 2 minutos después del primer llamado, realiza 3 llamados con 30 segundos de espera entre cada uno. Si no se presenta, marca como "No Presentado" con F4 y continúa con el siguiente.'
          },
          {
            id: 'faq-emergency',
            question: '¿Cómo manejo una emergencia médica?',
            answer: 'Detén inmediatamente el procedimiento, llama al médico de turno o emergencias, mantén al paciente cómodo, documenta todo el incidente y sigue el protocolo del hospital.'
          }
        ],
        exercises: [
          {
            id: 'exercise-patient-flow',
            title: 'Práctica de Flujo Completo',
            objective: 'Practicar el flujo completo de atención desde el llamado hasta la finalización',
            difficulty: 'basic',
            estimatedTime: '15 min',
            steps: [
              'Seleccionar un cubículo disponible',
              'Llamar al siguiente paciente en cola',
              'Marcar inicio de atención cuando llegue',
              'Simular tiempo de atención (5 minutos)',
              'Finalizar atención y registrar'
            ],
            hints: [
              'Usa los atajos de teclado para ser más eficiente',
              'Verifica siempre la identidad del paciente'
            ]
          },
          {
            id: 'exercise-priority-patients',
            title: 'Manejo de Pacientes Prioritarios',
            objective: 'Aprender a identificar y gestionar pacientes con prioridad',
            difficulty: 'intermediate',
            estimatedTime: '20 min',
            steps: [
              'Activar filtro de pacientes prioritarios',
              'Identificar al siguiente paciente prioritario',
              'Llamarlo saltando la cola regular',
              'Registrar el motivo de prioridad',
              'Completar la atención normalmente'
            ]
          }
        ]
      },
      {
        id: 'cubicles',
        title: 'Gestión de Cubículos',
        icon: 'FaDoorOpen',
        order: 4,
        estimatedTime: '20 min',
        difficulty: 'intermediate',
        tags: ['cubículos', 'asignación', 'gestión', 'recursos'],
        sections: [
          {
            id: 'cubicle-types',
            title: 'Tipos de Cubículos',
            content: {
              text: `# Gestión de Cubículos

## Descripción General

El sistema de gestión de cubículos permite administrar, asignar y monitorear los espacios de atención médica de manera eficiente y en tiempo real.

## Clasificación de Cubículos

### Cubículo General
- **Uso**: Procedimientos estándar y tomas de sangre rutinarias
- **Capacidad**: Individual
- **Equipamiento**: Camilla estándar, equipo básico de flebotomía
- **Requisitos**: Flebotomista certificado

### Cubículo Especial
- **Uso**: Procedimientos complejos y pacientes especiales
- **Capacidad**: Ampliada con espacio para acompañante
- **Equipamiento**: Camilla ajustable, monitor de signos vitales, equipamiento especializado
- **Requisitos**: Personal con certificación adicional

### Cubículo Pediátrico
- **Uso**: Atención exclusiva de niños
- **Capacidad**: Familiar
- **Equipamiento**: Decoración infantil, juguetes, material didáctico
- **Requisitos**: Especialización pediátrica

### Cubículo de Emergencia
- **Uso**: Casos urgentes y emergencias médicas
- **Capacidad**: Emergencia
- **Equipamiento**: Equipo completo de emergencia, desfibrilador, oxígeno
- **Requisitos**: Certificación en emergencias y RCP

## Estados de Cubículos

- **Disponible** (Verde): Listo para ser asignado
- **Ocupado** (Azul): En uso por un flebotomista
- **En Mantenimiento** (Naranja): Temporalmente fuera de servicio
- **Reservado** (Morado): Reservado para uso específico
- **Deshabilitado** (Gris): No disponible para uso`,
              images: [
                {
                  src: '/docs/screenshots/cubicle-panel.png',
                  alt: 'Panel de control de cubículos',
                  caption: 'Vista del panel de gestión en tiempo real'
                },
                {
                  src: '/docs/screenshots/cubicle-types.png',
                  alt: 'Tipos de cubículos',
                  caption: 'Clasificación visual de cubículos'
                }
              ],
              videos: [{
                id: 'cubicle-management',
                title: 'Gestión de Cubículos',
                url: '/docs/videos/cubicles/management.mp4',
                duration: '7:30',
                thumbnail: '/docs/videos/cubicles/management-thumb.jpg'
              }],
              warnings: [
                'Verificar siempre la limpieza antes de asignar',
                'No asignar sin confirmar certificaciones',
                'Respetar los protocolos de emergencia'
              ]
            }
          },
          {
            id: 'assignment-flow',
            title: 'Flujo de Asignación',
            content: {
              text: `# Flujo de Asignación y Liberación

## Proceso de Asignación

### 1. Verificación Inicial (2 min)
- Revisar estado y disponibilidad
- Verificar limpieza
- Confirmar equipamiento
- Actualizar estado en sistema

### 2. Asignación (1 min)
- Seleccionar flebotomista
- Verificar certificaciones
- Confirmar asignación
- Registrar en sistema

### 3. Monitoreo (Continuo)
- Verificar actividad
- Monitorear tiempos
- Revisar incidencias
- Actualizar métricas

### 4. Liberación (3 min)
- Finalizar sesión activa
- Registrar estadísticas
- Solicitar limpieza
- Actualizar disponibilidad

### 5. Mantenimiento (Variable)
- Programar mantenimiento preventivo
- Ejecutar protocolo
- Documentar cambios
- Validar funcionamiento

## Protocolos Especiales

### Protocolo de Emergencia
1. Identificar emergencia
2. Liberar cubículo de emergencia inmediatamente
3. Notificar al personal médico
4. Preparar equipamiento
5. Documentar uso de emergencia
6. Restablecer después del uso

### Protocolo de Cambio de Turno
1. Revisar estado de todos los cubículos
2. Transferir cubículos activos
3. Actualizar asignaciones
4. Verificar pendientes de mantenimiento
5. Entregar reporte al siguiente turno
6. Confirmar recepción`,
              codeExamples: [{
                title: 'Asignar cubículo',
                language: 'javascript',
                code: `const assignCubicle = async (cubicleId, phlebotomistId) => {
  // Verificar disponibilidad
  const cubicle = await getCubicle(cubicleId);
  if (cubicle.status !== 'available') {
    throw new Error('Cubículo no disponible');
  }

  // Verificar certificaciones
  const phlebotomist = await getPhlebotomist(phlebotomistId);
  if (!validateCertifications(phlebotomist, cubicle.type)) {
    throw new Error('Certificaciones insuficientes');
  }

  // Realizar asignación
  const response = await fetch('/api/cubicles/assign', {
    method: 'POST',
    body: JSON.stringify({
      cubicleId,
      phlebotomistId,
      timestamp: new Date().toISOString()
    })
  });

  return await response.json();
};`
              }],
              tips: [
                'Mantener balance entre tipos de cubículos',
                'Rotar asignaciones para evitar desgaste',
                'Programar mantenimiento preventivo regularmente'
              ]
            }
          },
          {
            id: 'metrics',
            title: 'Métricas y Monitoreo',
            content: {
              text: `# Métricas de Gestión de Cubículos

## Indicadores Clave

### Tasa de Ocupación
- **Objetivo**: >85%
- **Cálculo**: Tiempo ocupado / Tiempo total disponible
- **Frecuencia**: Actualización cada 5 minutos

### Rotación Diaria
- **Objetivo**: 10-15 pacientes por cubículo
- **Cálculo**: Total de pacientes / Número de cubículos
- **Evaluación**: Diaria

### Tiempo Medio Libre
- **Objetivo**: <5 minutos entre pacientes
- **Cálculo**: Promedio de tiempo sin uso productivo
- **Optimización**: Reducir tiempos muertos

### Incidencias
- **Objetivo**: <3 por semana
- **Tipos**: Fallas técnicas, limpieza, mantenimiento
- **Seguimiento**: Registro detallado de cada incidencia

## Panel de Control

### Vista en Tiempo Real
- Estado actual de cada cubículo
- Flebotomista asignado
- Tiempo de ocupación
- Próximo mantenimiento programado

### Filtros Disponibles
- Por tipo de cubículo
- Por estado
- Por ubicación
- Por flebotomista

### Acciones Rápidas
- Asignar/Liberar cubículo
- Solicitar mantenimiento
- Ver historial
- Generar reportes`,
              tips: [
                'Revisar métricas diariamente',
                'Identificar patrones de uso',
                'Optimizar asignaciones según demanda'
              ]
            }
          }
        ],
        faqs: [
          {
            id: 'faq-cubicle-assignment',
            question: '¿Cómo asigno un cubículo a un flebotomista?',
            answer: 'Verifica que el cubículo esté disponible, selecciona al flebotomista, confirma sus certificaciones y realiza la asignación en el sistema. El cubículo cambiará automáticamente a estado "Ocupado".'
          },
          {
            id: 'faq-emergency-cubicle',
            question: '¿Qué hacer si necesito un cubículo de emergencia y está ocupado?',
            answer: 'El protocolo de emergencia tiene prioridad absoluta. Libera inmediatamente el cubículo de emergencia, transfiere al paciente actual a otro cubículo disponible y prepara el equipamiento de emergencia.'
          },
          {
            id: 'faq-maintenance',
            question: '¿Con qué frecuencia se debe hacer mantenimiento?',
            answer: 'Mantenimiento preventivo cada 7 días o después de 100 usos. Mantenimiento correctivo inmediato cuando se reporta una falla. Limpieza profunda diaria al finalizar el turno.'
          }
        ],
        exercises: [
          {
            id: 'exercise-assignment',
            title: 'Práctica de Asignación',
            objective: 'Aprender el proceso completo de asignación de cubículo',
            difficulty: 'basic',
            estimatedTime: '10 min',
            steps: [
              'Verificar disponibilidad del cubículo',
              'Seleccionar flebotomista apropiado',
              'Confirmar certificaciones',
              'Realizar asignación en sistema',
              'Verificar cambio de estado'
            ]
          },
          {
            id: 'exercise-emergency',
            title: 'Manejo de Emergencia',
            objective: 'Practicar el protocolo de emergencia con cubículos',
            difficulty: 'advanced',
            estimatedTime: '15 min',
            steps: [
              'Identificar situación de emergencia',
              'Liberar cubículo de emergencia',
              'Reasignar paciente actual',
              'Preparar equipamiento',
              'Documentar el proceso'
            ]
          }
        ]
      },
      {
        id: 'queue',
        title: 'Gestión de Cola',
        icon: 'FaListOl',
        order: 5,
        estimatedTime: '30 min',
        difficulty: 'advanced',
        tags: ['cola', 'prioridad', 'turnos', 'algoritmos'],
        sections: [
          {
            id: 'priority-system',
            title: 'Sistema de Prioridades',
            content: {
              text: `# Gestión de Cola de Turnos

## Descripción General

El sistema de gestión de cola administra el flujo de pacientes mediante un algoritmo de prioridad inteligente que garantiza atención justa y eficiente.

## Sistema de Prioridad de 5 Niveles

### Nivel 1 - Emergencia (Máxima Prioridad)
- **Criterios**: Condiciones que amenazan la vida
- **Ejemplos**: Shock anafiláctico, dificultad respiratoria severa, pérdida de conocimiento
- **Tiempo máximo de espera**: 0 minutos (atención inmediata)
- **Código de color**: Rojo
- **Protocolo**: Bypass completo de cola, alerta al personal médico

### Nivel 2 - Muy Urgente
- **Criterios**: Condiciones graves que requieren atención rápida
- **Ejemplos**: Dolor torácico, hemorragia moderada, fractura expuesta
- **Tiempo máximo de espera**: 10 minutos
- **Código de color**: Naranja
- **Protocolo**: Prioridad sobre turnos regulares

### Nivel 3 - Urgente
- **Criterios**: Condiciones que requieren atención pronta
- **Ejemplos**: Dolor abdominal severo, heridas profundas, fiebre alta
- **Tiempo máximo de espera**: 30 minutos
- **Código de color**: Amarillo
- **Protocolo**: Atención prioritaria según disponibilidad

### Nivel 4 - Prioritario
- **Criterios**: Pacientes con necesidades especiales
- **Ejemplos**: Adultos mayores (>65), embarazadas, niños (<5), personas con discapacidad
- **Tiempo máximo de espera**: 45 minutos
- **Código de color**: Verde claro
- **Protocolo**: Prioridad sobre turnos normales

### Nivel 5 - Normal
- **Criterios**: Procedimientos rutinarios
- **Ejemplos**: Análisis preventivos, chequeos regulares
- **Tiempo máximo de espera**: 120 minutos
- **Código de color**: Verde
- **Protocolo**: Atención por orden de llegada`,
              images: [
                {
                  src: '/docs/screenshots/priority-levels.png',
                  alt: 'Niveles de prioridad',
                  caption: 'Sistema de 5 niveles con códigos de color'
                },
                {
                  src: '/docs/screenshots/queue-management.png',
                  alt: 'Panel de gestión de cola',
                  caption: 'Vista del administrador de cola en tiempo real'
                }
              ],
              videos: [{
                id: 'queue-priority-system',
                title: 'Sistema de Prioridades en Acción',
                url: '/docs/videos/queue/priority-system.mp4',
                duration: '10:15',
                thumbnail: '/docs/videos/queue/priority-thumb.jpg'
              }],
              warnings: [
                'Nunca ignorar una emergencia médica por cumplir con el orden de la cola',
                'Validar siempre los criterios de prioridad antes de asignar',
                'Documentar cualquier cambio manual en las prioridades'
              ]
            }
          },
          {
            id: 'queue-states',
            title: 'Estados y Transiciones',
            content: {
              text: `# Estados de los Turnos en Cola

## Estados Principales

### WAITING (Esperando)
- Estado inicial al crear el turno
- Paciente en sala de espera
- Visible en pantallas de llamado

### CALLED (Llamado)
- Paciente ha sido llamado
- Esperando confirmación de presencia
- Timeout de 2 minutos antes de re-llamar

### ATTENDING (En Atención)
- Paciente siendo atendido activamente
- Cubículo ocupado
- Temporizador activo

### COMPLETED (Completado)
- Atención finalizada exitosamente
- Datos guardados en histórico
- Cubículo liberado

### NO_SHOW (No Presentado)
- Paciente no respondió después de 3 llamados
- Movido al final de la cola o cancelado
- Registrado en estadísticas

### CANCELLED (Cancelado)
- Turno cancelado por usuario o sistema
- Motivo documentado
- No cuenta en estadísticas de atención

## Transiciones de Estado

\`\`\`
WAITING → CALLED → ATTENDING → COMPLETED
   ↓        ↓          ↓
CANCELLED  NO_SHOW  CANCELLED
\`\`\`

## Reglas de Transición

1. **WAITING → CALLED**: Solo cuando hay cubículo disponible
2. **CALLED → ATTENDING**: Requiere confirmación del flebotomista
3. **CALLED → NO_SHOW**: Después de 3 llamados sin respuesta
4. **ATTENDING → COMPLETED**: Solo por acción del flebotomista
5. **Cualquier estado → CANCELLED**: Requiere autorización y motivo`,
              codeExamples: [{
                title: 'Máquina de estados de turno',
                language: 'javascript',
                code: `const turnStateMachine = {
  WAITING: {
    call: () => 'CALLED',
    cancel: () => 'CANCELLED'
  },
  CALLED: {
    attend: () => 'ATTENDING',
    noShow: () => 'NO_SHOW',
    recall: () => 'CALLED',
    cancel: () => 'CANCELLED'
  },
  ATTENDING: {
    complete: () => 'COMPLETED',
    cancel: () => 'CANCELLED'
  },
  COMPLETED: {},
  NO_SHOW: {},
  CANCELLED: {}
};`
              }],
              tips: [
                'Monitorear turnos en estado CALLED para evitar no-shows',
                'Usar transiciones automáticas para optimizar flujo',
                'Mantener logs detallados de cada cambio de estado'
              ]
            }
          },
          {
            id: 'queue-algorithms',
            title: 'Algoritmos de Cola',
            content: {
              text: `# Algoritmos de Gestión de Cola

## Algoritmos Implementados

### 1. FIFO con Prioridad (Por Defecto)
Combina orden de llegada con sistema de prioridades

**Ventajas:**
- Justo para pacientes regulares
- Respeta emergencias
- Fácil de entender

**Desventajas:**
- Puede generar esperas largas en horas pico

### 2. Priority with Aging (Prioridad con Envejecimiento)
Las prioridades aumentan con el tiempo de espera

**Fórmula:**
\`\`\`
Prioridad Efectiva = Prioridad Base + (Tiempo Espera / Factor Envejecimiento)
\`\`\`

**Parámetros configurables:**
- Factor de envejecimiento: 10 minutos
- Incremento máximo: 2 niveles
- Tiempo de gracia: 5 minutos

### 3. SJF - Shortest Job First
Prioriza procedimientos más rápidos

**Aplicación:**
- Para cubículos especializados
- En horas de alta demanda
- Optimización de throughput

## Configuración de Algoritmos

### Parámetros Globales
- **Tiempo máximo en cola**: 180 minutos
- **Re-llamados automáticos**: 3
- **Intervalo entre llamados**: 30 segundos
- **Prioridad de emergencia**: Absoluta

### Ajustes Dinámicos
El sistema ajusta automáticamente según:
- Hora del día
- Cantidad de pacientes en espera
- Disponibilidad de cubículos
- Histórico de tiempos`,
              codeExamples: [{
                title: 'Implementación Priority with Aging',
                language: 'javascript',
                code: `function calculateEffectivePriority(turn) {
  const BASE_PRIORITY = turn.priority;
  const AGING_FACTOR = 10; // minutos
  const MAX_BOOST = 2;

  const waitTime = Date.now() - turn.createdAt;
  const minutesWaiting = Math.floor(waitTime / 60000);

  const agingBoost = Math.min(
    Math.floor(minutesWaiting / AGING_FACTOR),
    MAX_BOOST
  );

  return Math.max(1, BASE_PRIORITY - agingBoost);
}`
              }],
              tips: [
                'Evaluar métricas semanalmente para ajustar parámetros',
                'Considerar patrones de demanda por hora',
                'Implementar alertas para colas excesivamente largas'
              ]
            }
          },
          {
            id: 'queue-monitoring',
            title: 'Monitoreo y Alertas',
            content: {
              text: `# Monitoreo en Tiempo Real

## Panel de Control

### Métricas Principales
- **Pacientes en espera**: Total y por prioridad
- **Tiempo promedio de espera**: Global y por nivel
- **Tasa de no-show**: Porcentaje diario
- **Velocidad de atención**: Pacientes/hora

### Visualizaciones
- Gráfico de barras por prioridad
- Timeline de atenciones
- Heatmap de horas pico
- Distribución de tiempos de espera

## Sistema de Alertas

### Alertas Críticas (Rojas)
- Cola de emergencias > 0
- Tiempo de espera Nivel 2 > 15 min
- Todos los cubículos inactivos
- Tasa no-show > 20%

### Alertas Importantes (Amarillas)
- Cola total > 30 pacientes
- Tiempo promedio > 60 min
- Cubículos disponibles < 30%
- Velocidad atención < objetivo

### Notificaciones (Azules)
- Cambios en configuración
- Inicio/fin de turno
- Mantenimiento programado
- Actualizaciones del sistema

## Reportes Automáticos

### Reporte Horario
- Pacientes atendidos
- Tiempo promedio
- Incidencias

### Reporte Diario
- Resumen completo
- Comparación con promedio
- Recomendaciones

### Reporte Semanal
- Tendencias
- Análisis de patrones
- Optimizaciones sugeridas`,
              images: [
                {
                  src: '/docs/screenshots/queue-monitoring.png',
                  alt: 'Panel de monitoreo',
                  caption: 'Dashboard de monitoreo en tiempo real'
                }
              ],
              warnings: [
                'Responder inmediatamente a alertas críticas',
                'Documentar acciones tomadas para cada alerta',
                'Revisar configuración de alertas mensualmente'
              ]
            }
          }
        ],
        faqs: [
          {
            id: 'faq-priority-override',
            question: '¿Se puede cambiar manualmente la prioridad de un paciente?',
            answer: 'Sí, los administradores pueden ajustar prioridades manualmente. Se debe documentar el motivo y el sistema registra quién realizó el cambio para auditoría.'
          },
          {
            id: 'faq-queue-capacity',
            question: '¿Cuál es la capacidad máxima de la cola?',
            answer: 'No hay límite técnico, pero se recomienda no superar 50 pacientes en espera. El sistema genera alertas automáticas cuando se superan 30 pacientes.'
          },
          {
            id: 'faq-aging-algorithm',
            question: '¿Cómo funciona el envejecimiento de prioridad?',
            answer: 'Cada 10 minutos de espera, un paciente sube automáticamente un nivel de prioridad (máximo 2 niveles). Esto evita que pacientes regulares esperen indefinidamente.'
          }
        ],
        exercises: [
          {
            id: 'exercise-priority-assignment',
            title: 'Asignación de Prioridades',
            objective: 'Practicar la asignación correcta de prioridades según criterios',
            difficulty: 'intermediate',
            estimatedTime: '15 min',
            steps: [
              'Revisar lista de pacientes nuevos',
              'Evaluar condición de cada paciente',
              'Asignar nivel de prioridad apropiado',
              'Verificar orden resultante en cola',
              'Ajustar si es necesario con justificación'
            ]
          },
          {
            id: 'exercise-queue-optimization',
            title: 'Optimización de Cola',
            objective: 'Aprender a optimizar el flujo cuando hay alta demanda',
            difficulty: 'advanced',
            estimatedTime: '25 min',
            steps: [
              'Analizar métricas actuales de la cola',
              'Identificar cuellos de botella',
              'Ajustar parámetros del algoritmo',
              'Reasignar recursos si es necesario',
              'Medir mejora en tiempos de espera'
            ]
          }
        ]
      },
      {
        id: 'statistics',
        title: 'Módulo de Estadísticas',
        icon: 'FaChartBar',
        order: 6,
        estimatedTime: '35 min',
        difficulty: 'intermediate',
        tags: ['estadísticas', 'métricas', 'análisis', 'reportes'],
        sections: [
          {
            id: 'overview',
            title: 'Vista General de Estadísticas',
            content: {
              text: `# Módulo de Estadísticas

## Descripción General

El módulo de estadísticas es el centro neurálgico de análisis del sistema TomaTurno, proporcionando métricas en tiempo real y análisis históricos para la toma de decisiones basada en datos.

## Tipos de Análisis Disponibles

### 1. Estadísticas Diarias
- **Objetivo**: Monitoreo operativo en tiempo real
- **Métricas principales**: Pacientes atendidos, tiempo promedio, eficiencia
- **Actualización**: Cada 5 minutos
- **Uso**: Control diario de operaciones

### 2. Estadísticas Mensuales
- **Objetivo**: Análisis de tendencias y patrones
- **Métricas principales**: Totales acumulados, comparaciones, proyecciones
- **Actualización**: Diaria
- **Uso**: Planificación estratégica y recursos

### 3. Análisis por Flebotomista
- **Objetivo**: Evaluación de rendimiento individual
- **Métricas principales**: Ranking, pacientes atendidos, satisfacción
- **Actualización**: En tiempo real
- **Uso**: Gestión de personal y reconocimientos

### 4. Análisis Comparativo
- **Objetivo**: Identificar mejoras y deterioros
- **Métricas principales**: Variaciones porcentuales, tendencias
- **Actualización**: Según período seleccionado
- **Uso**: Identificación de áreas de mejora`,
              images: [
                {
                  src: '/docs/screenshots/statistics-dashboard.png',
                  alt: 'Dashboard de estadísticas',
                  caption: 'Vista principal del módulo de estadísticas'
                },
                {
                  src: '/docs/screenshots/statistics-charts.png',
                  alt: 'Gráficos estadísticos',
                  caption: 'Visualizaciones interactivas de datos'
                }
              ],
              videos: [{
                id: 'statistics-overview',
                title: 'Introducción al Módulo de Estadísticas',
                url: '/docs/videos/statistics/overview.mp4',
                duration: '12:30',
                thumbnail: '/docs/videos/statistics/overview-thumb.jpg'
              }],
              warnings: [
                'Los datos sensibles requieren permisos especiales para su visualización',
                'Las exportaciones masivas pueden tardar varios minutos',
                'Verificar zona horaria antes de generar reportes'
              ]
            }
          },
          {
            id: 'key-metrics',
            title: 'Métricas Clave (KPIs)',
            content: {
              text: `# Indicadores Clave de Rendimiento (KPIs)

## Métricas Principales

### 1. Pacientes Atendidos
- **Definición**: Total de pacientes que completaron su atención
- **Objetivo diario**: 60 pacientes
- **Umbral crítico**: <30 pacientes/día
- **Cálculo**: Suma de turnos en estado COMPLETED

### 2. Tiempo Promedio de Atención
- **Definición**: Tiempo desde inicio hasta fin de atención
- **Objetivo**: 6 minutos
- **Óptimo**: 5-7 minutos
- **Crítico**: >10 minutos
- **Cálculo**: Promedio(tiempo_fin - tiempo_inicio)

### 3. Tasa de Eficiencia
- **Definición**: Porcentaje de tiempo productivo vs disponible
- **Objetivo**: 85%
- **Fórmula**: (Tiempo atendiendo / Tiempo total) × 100
- **Factores**: Incluye preparación y limpieza

### 4. Satisfacción del Cliente
- **Definición**: Calificación promedio de encuestas
- **Objetivo**: 4.5/5.0
- **Fuente**: Encuestas post-atención
- **Peso**: Mayor peso a encuestas recientes

### 5. Tasa de No-Show
- **Definición**: Porcentaje de pacientes no presentados
- **Objetivo**: <5%
- **Cálculo**: (No presentados / Total llamados) × 100
- **Impacto**: Afecta eficiencia operativa

## Métricas Secundarias

### Distribución por Hora
- Identifica horas pico y valle
- Optimiza asignación de personal
- Base para programación de turnos

### Comparación entre Cubículos
- Identifica cubículos más eficientes
- Detecta problemas de equipamiento
- Balancea carga de trabajo

### Tendencias Semanales
- Identifica patrones recurrentes
- Predice demanda futura
- Ajusta recursos preventivamente`,
              codeExamples: [{
                title: 'Cálculo de KPIs',
                language: 'javascript',
                code: `// Ejemplo de cálculo de métricas principales
const calculateKPIs = (data) => {
  const kpis = {
    totalPatients: data.filter(t => t.status === 'COMPLETED').length,

    averageTime: data.reduce((acc, t) => {
      if (t.endTime && t.startTime) {
        return acc + (t.endTime - t.startTime);
      }
      return acc;
    }, 0) / data.length,

    efficiency: (data.filter(t => t.status === 'ATTENDING').length /
                 data.length) * 100,

    satisfaction: data.reduce((acc, t) =>
      acc + (t.rating || 0), 0) / data.filter(t => t.rating).length,

    noShowRate: (data.filter(t => t.status === 'NO_SHOW').length /
                 data.length) * 100
  };

  return kpis;
};`
              }],
              tips: [
                'Revisar KPIs al inicio de cada turno',
                'Comparar con promedios históricos',
                'Establecer alertas para valores críticos'
              ]
            }
          },
          {
            id: 'reports',
            title: 'Generación de Reportes',
            content: {
              text: `# Sistema de Reportes

## Tipos de Reportes

### Reporte Diario
- **Contenido**: Resumen operativo del día
- **Generación**: Automática a las 23:59
- **Distribución**: Email a administradores
- **Formato**: PDF con gráficos

### Reporte Semanal
- **Contenido**: Análisis comparativo de 7 días
- **Generación**: Domingos a las 23:59
- **Incluye**: Tendencias y proyecciones
- **Formato**: PDF y Excel

### Reporte Mensual
- **Contenido**: Análisis completo del mes
- **Generación**: Último día del mes
- **Incluye**: Comparaciones anuales
- **Formato**: PDF ejecutivo y datos raw

### Reporte Personalizado
- **Contenido**: Según selección del usuario
- **Período**: Flexible
- **Filtros**: Por flebotomista, cubículo, horario
- **Formatos**: PDF, Excel, CSV, JSON

## Formatos de Exportación

### PDF
- Incluye gráficos y tablas
- Logo institucional
- Marca de agua de seguridad
- Optimizado para impresión

### Excel
- Datos tabulados
- Múltiples hojas por categoría
- Fórmulas precalculadas
- Gráficos dinámicos

### CSV
- Datos sin formato
- Compatible con cualquier sistema
- Ideal para importación
- Menor tamaño de archivo

## Programación de Reportes

### Configuración
1. Seleccionar tipo de reporte
2. Definir período y frecuencia
3. Elegir destinatarios
4. Configurar filtros
5. Activar programación

### Distribución Automática
- Email con adjuntos
- Almacenamiento en nube
- Notificación push
- Portal de descarga`,
              images: [
                {
                  src: '/docs/screenshots/report-generation.png',
                  alt: 'Generación de reportes',
                  caption: 'Interfaz de configuración de reportes'
                }
              ],
              warnings: [
                'Reportes grandes pueden saturar el servidor',
                'Verificar capacidad de almacenamiento',
                'Configurar límites de tamaño de email'
              ]
            }
          },
          {
            id: 'analysis-tools',
            title: 'Herramientas de Análisis',
            content: {
              text: `# Herramientas Avanzadas de Análisis

## Filtros Disponibles

### Por Período
- Hoy
- Ayer
- Esta semana
- Este mes
- Último trimestre
- Año actual
- Rango personalizado

### Por Personal
- Todos los flebotomistas
- Individual
- Por turno
- Por experiencia
- Activos/Inactivos

### Por Ubicación
- Todos los cubículos
- Cubículos generales
- Cubículos especiales
- Por piso/área

## Visualizaciones

### Gráfico de Barras
- Comparación entre categorías
- Distribución por hora
- Rankings

### Gráfico de Líneas
- Tendencias temporales
- Evolución de métricas
- Proyecciones

### Gráfico de Pastel
- Distribución porcentual
- Composición de tiempos
- Tipos de atención

### Mapa de Calor
- Horas pico
- Días de mayor actividad
- Patrones de demanda

### Dashboard Interactivo
- Métricas en tiempo real
- Drill-down en datos
- Filtros dinámicos

## Análisis Predictivo

### Proyección de Demanda
- Basado en históricos
- Considera estacionalidad
- Ajuste por eventos especiales

### Optimización de Recursos
- Sugerencias de personal
- Horarios óptimos
- Distribución de cubículos

### Alertas Inteligentes
- Detección de anomalías
- Predicción de cuellos de botella
- Recomendaciones automáticas`,
              tips: [
                'Usar filtros combinados para análisis profundos',
                'Guardar vistas personalizadas frecuentes',
                'Exportar datos para análisis externos'
              ]
            }
          }
        ],
        faqs: [
          {
            id: 'faq-real-time',
            question: '¿Con qué frecuencia se actualizan las estadísticas?',
            answer: 'Las estadísticas en tiempo real se actualizan cada 5 minutos. Los consolidados diarios se calculan cada hora, y los reportes mensuales se generan cada noche.'
          },
          {
            id: 'faq-export-limits',
            question: '¿Hay límites para la exportación de datos?',
            answer: 'Sí, las exportaciones están limitadas a 10,000 registros por consulta para mantener el rendimiento. Para datos mayores, se debe programar una exportación nocturna.'
          },
          {
            id: 'faq-historical-data',
            question: '¿Por cuánto tiempo se mantienen los datos históricos?',
            answer: 'Los datos detallados se mantienen por 1 año. Los consolidados mensuales se mantienen indefinidamente. Los datos antiguos se archivan pero siguen siendo accesibles.'
          }
        ],
        exercises: [
          {
            id: 'exercise-daily-analysis',
            title: 'Análisis Diario Completo',
            objective: 'Aprender a realizar un análisis diario completo',
            difficulty: 'basic',
            estimatedTime: '20 min',
            steps: [
              'Acceder al módulo de estadísticas',
              'Seleccionar vista diaria',
              'Revisar KPIs principales',
              'Identificar horas pico',
              'Generar reporte PDF',
              'Interpretar resultados'
            ]
          },
          {
            id: 'exercise-comparative',
            title: 'Análisis Comparativo',
            objective: 'Comparar rendimiento entre períodos',
            difficulty: 'intermediate',
            estimatedTime: '30 min',
            steps: [
              'Seleccionar dos períodos a comparar',
              'Aplicar mismos filtros a ambos',
              'Identificar variaciones significativas',
              'Analizar causas de cambios',
              'Generar reporte comparativo',
              'Proponer acciones de mejora'
            ]
          },
          {
            id: 'exercise-phlebotomist-ranking',
            title: 'Ranking de Flebotomistas',
            objective: 'Analizar rendimiento individual del personal',
            difficulty: 'intermediate',
            estimatedTime: '25 min',
            steps: [
              'Acceder a estadísticas por flebotomista',
              'Configurar período de análisis',
              'Revisar métricas individuales',
              'Comparar con promedios del equipo',
              'Identificar top performers',
              'Generar reporte de reconocimiento'
            ]
          }
        ]
      },
      {
        id: 'reports',
        title: 'Módulo de Reportes',
        icon: 'FaFileExport',
        order: 7,
        estimatedTime: '40 min',
        difficulty: 'advanced',
        tags: ['reportes', 'exportación', 'pdf', 'programación'],
        sections: [
          {
            id: 'report-types',
            title: 'Tipos de Reportes',
            content: {
              text: `# Sistema de Reportes

## Descripción General

El módulo de reportes permite generar, exportar y programar documentos con información analítica del sistema TomaTurno en múltiples formatos y diseños.

## Tipos de Reportes Disponibles

### 1. Reporte Diario
- **Objetivo**: Resumen operativo del día
- **Contenido**:
  - Resumen ejecutivo
  - KPIs del día
  - Detalle por hora
  - Incidencias registradas
- **Generación**: Automática a las 23:59
- **Tamaño estimado**: ~2 MB
- **Tiempo de generación**: 30 segundos

### 2. Reporte Semanal
- **Objetivo**: Análisis comparativo de 7 días
- **Contenido**:
  - Comparativa diaria
  - Tendencias identificadas
  - Top performers
  - Recomendaciones operativas
- **Generación**: Domingos a las 23:59
- **Tamaño estimado**: ~5 MB
- **Tiempo de generación**: 45 segundos

### 3. Reporte Mensual
- **Objetivo**: Análisis estratégico completo
- **Contenido**:
  - Dashboard ejecutivo
  - Análisis detallado por área
  - Comparativas con meses anteriores
  - Proyecciones y tendencias
- **Generación**: Último día del mes
- **Tamaño estimado**: ~10 MB
- **Tiempo de generación**: 1 minuto

### 4. Reporte Personalizado
- **Objetivo**: Información específica según necesidad
- **Contenido**: Configurable por el usuario
- **Generación**: Manual o programada
- **Tamaño**: Variable
- **Tiempo**: Depende de la complejidad`,
              images: [
                {
                  src: '/docs/screenshots/report-types.png',
                  alt: 'Tipos de reportes',
                  caption: 'Galería de reportes disponibles'
                },
                {
                  src: '/docs/screenshots/report-sample.png',
                  alt: 'Ejemplo de reporte',
                  caption: 'Muestra de reporte mensual generado'
                }
              ],
              videos: [{
                id: 'report-generation',
                title: 'Generación de Reportes',
                url: '/docs/videos/reports/generation.mp4',
                duration: '8:45',
                thumbnail: '/docs/videos/reports/generation-thumb.jpg'
              }],
              warnings: [
                'Los reportes grandes pueden afectar el rendimiento del servidor',
                'Verificar permisos antes de compartir reportes con datos sensibles',
                'Los reportes programados requieren que el servidor esté activo'
              ]
            }
          },
          {
            id: 'export-formats',
            title: 'Formatos de Exportación',
            content: {
              text: `# Formatos de Exportación

## PDF (Recomendado)
### Características
- Gráficos y tablas incluidos
- Logo institucional integrado
- Marca de agua de seguridad
- Índice interactivo navegable
- Optimizado para impresión

### Opciones de Configuración
- Orientación (vertical/horizontal)
- Tamaño de página (A4, Letter, Legal)
- Márgenes personalizables
- Encriptación con contraseña
- Compresión de imágenes

### Casos de Uso
- Reportes ejecutivos
- Documentación oficial
- Archivo histórico
- Distribución externa

## Excel (.xlsx)
### Características
- Datos editables
- Múltiples hojas organizadas
- Fórmulas activas
- Gráficos dinámicos
- Tablas pivote disponibles

### Ventajas
- Análisis posterior flexible
- Integración con otras herramientas
- Actualización manual de datos
- Creación de dashboards personalizados

### Casos de Uso
- Análisis detallado
- Manipulación de datos
- Importación a otros sistemas
- Trabajo colaborativo

## CSV
### Características
- Formato universal
- Tamaño mínimo de archivo
- Compatible con cualquier sistema
- Procesamiento rápido

### Limitaciones
- Sin formato visual
- Sin gráficos
- Una tabla por archivo
- Sin fórmulas

### Casos de Uso
- Importación a bases de datos
- Procesamiento automatizado
- Integración con APIs
- Análisis con herramientas externas

## JSON
### Características
- Estructura de datos completa
- Metadatos incluidos
- Parseable programáticamente
- Relaciones de datos preservadas

### Ventajas
- Ideal para desarrolladores
- Integración con aplicaciones
- Procesamiento automatizado
- Backup de datos estructurados

### Casos de Uso
- Integraciones API
- Migración de datos
- Desarrollo de aplicaciones
- Análisis programático`,
              codeExamples: [{
                title: 'Configuración de exportación PDF',
                language: 'javascript',
                code: `const pdfConfig = {
  format: 'A4',
  orientation: 'portrait',
  margins: {
    top: 20,
    right: 15,
    bottom: 20,
    left: 15
  },
  header: {
    height: '15mm',
    contents: {
      default: '<h1>{{title}}</h1>'
    }
  },
  footer: {
    height: '10mm',
    contents: {
      default: '<span>Página {{page}} de {{pages}}</span>'
    }
  },
  watermark: {
    text: 'CONFIDENCIAL',
    opacity: 0.1
  },
  encryption: {
    userPassword: 'user123',
    ownerPassword: 'admin456',
    permissions: {
      printing: 'highResolution',
      modifying: false,
      copying: false
    }
  }
};`
              }],
              tips: [
                'PDF para documentos finales y distribución',
                'Excel para análisis y manipulación de datos',
                'CSV para importaciones y exportaciones masivas',
                'JSON para integraciones técnicas'
              ]
            }
          },
          {
            id: 'templates',
            title: 'Plantillas y Diseño',
            content: {
              text: `# Plantillas de Diseño

## Plantillas Predefinidas

### 1. Plantilla Estándar
- **Diseño**: Clásico profesional
- **Características**:
  - Logo institucional en header
  - Colores corporativos
  - Formato A4 vertical
  - Numeración de páginas
- **Ideal para**: Uso diario y reportes rutinarios

### 2. Plantilla Ejecutiva
- **Diseño**: Minimalista elegante
- **Características**:
  - Resumen en primera página
  - Gráficos destacados
  - Conclusiones y recomendaciones
  - Diseño visual impactante
- **Ideal para**: Presentaciones a gerencia

### 3. Plantilla Detallada
- **Diseño**: Información completa
- **Características**:
  - Todos los datos disponibles
  - Tablas extensas
  - Anexos y apéndices
  - Referencias cruzadas
- **Ideal para**: Auditorías y análisis profundos

### 4. Plantilla Minimalista
- **Diseño**: Simple y directo
- **Características**:
  - Solo información esencial
  - Una página cuando es posible
  - Infografías
  - Sin elementos decorativos
- **Ideal para**: Comunicación rápida

## Personalización Visual

### Elementos Configurables
- **Colores**: Paleta corporativa o personalizada
- **Tipografía**: Familia y tamaño de fuentes
- **Logos**: Posición y tamaño
- **Márgenes**: Espaciado del documento
- **Headers/Footers**: Contenido y diseño

### Componentes del Reporte

#### Portada
- Título del reporte
- Período cubierto
- Fecha de generación
- Autor/Departamento
- Logo institucional

#### Índice
- Tabla de contenidos
- Números de página
- Enlaces navegables (PDF)
- Niveles jerárquicos

#### Cuerpo Principal
- Secciones organizadas
- Gráficos integrados
- Tablas formateadas
- Notas al pie
- Referencias

#### Anexos
- Datos complementarios
- Metodología
- Glosario de términos
- Información de contacto`,
              tips: [
                'Mantener consistencia visual en todos los reportes',
                'Usar plantilla ejecutiva para stakeholders externos',
                'Personalizar colores según identidad corporativa',
                'Incluir siempre información de contacto'
              ]
            }
          },
          {
            id: 'scheduling',
            title: 'Programación Automática',
            content: {
              text: `# Programación de Reportes

## Configuración de Programación

### Frecuencias Disponibles
- **Diaria**: Ejecuta todos los días a hora específica
- **Semanal**: Día y hora de la semana seleccionados
- **Mensual**: Día del mes u último día
- **Trimestral**: Primer o último día del trimestre
- **Anual**: Fecha específica del año
- **Personalizada**: Expresión cron avanzada

### Parámetros de Programación
\`\`\`javascript
{
  nombre: "Reporte Semanal Operativo",
  tipo: "weekly",
  configuracion: {
    diaSemana: "domingo",
    hora: "23:59",
    zonaHoraria: "America/Mexico_City"
  },
  filtros: {
    periodo: "ultima_semana",
    incluirFinDeSemana: true,
    departamentos: ["todos"]
  },
  formato: "pdf",
  plantilla: "ejecutiva",
  distribucion: {
    email: ["gerencia@hospital.com"],
    carpetaServidor: "/reportes/semanales/",
    nube: {
      servicio: "Google Drive",
      carpeta: "Reportes_2024"
    }
  }
}
\`\`\`

## Distribución Automática

### Canales de Distribución
1. **Email**
   - Adjunto directo
   - Link de descarga
   - Notificación con resumen
   - Lista de distribución configurable

2. **Servidor Local**
   - Carpeta compartida
   - Permisos por grupo
   - Retención configurable
   - Backup automático

3. **Almacenamiento en Nube**
   - Google Drive
   - Dropbox
   - OneDrive
   - SharePoint

4. **Notificaciones**
   - Sistema interno
   - SMS (opcional)
   - Push notifications
   - Webhook

## Gestión de Programaciones

### Estados de Programación
- **Activa**: Ejecutándose según calendario
- **Pausada**: Temporalmente detenida
- **Desactivada**: No se ejecutará
- **Error**: Falló última ejecución
- **Pendiente**: Esperando primera ejecución

### Monitoreo
- Log de ejecuciones
- Alertas de fallas
- Métricas de rendimiento
- Historial de cambios

### Mantenimiento
- Limpieza automática de reportes antiguos
- Compresión de archivos
- Verificación de integridad
- Respaldo periódico`,
              codeExamples: [{
                title: 'Expresión Cron para programación',
                language: 'javascript',
                code: `// Ejemplos de expresiones cron
const cronExpressions = {
  // Todos los días a las 6 AM
  daily6am: '0 6 * * *',

  // Lunes a viernes a las 23:59
  weekdays: '59 23 * * 1-5',

  // Primer día de cada mes a medianoche
  monthly: '0 0 1 * *',

  // Cada 4 horas
  every4hours: '0 */4 * * *',

  // Último viernes del mes a las 17:00
  lastFriday: '0 17 * * 5L'
};`
              }],
              warnings: [
                'Verificar zona horaria antes de programar',
                'Considerar carga del servidor en horas pico',
                'Establecer límites de reintentos en caso de fallo',
                'Configurar alertas para reportes críticos'
              ]
            }
          }
        ],
        faqs: [
          {
            id: 'faq-report-size',
            question: '¿Cuál es el tamaño máximo de un reporte?',
            answer: 'El tamaño máximo por defecto es 50 MB, pero puede configurarse según las necesidades. Para reportes más grandes, se recomienda dividirlos o usar compresión.'
          },
          {
            id: 'faq-report-retention',
            question: '¿Por cuánto tiempo se guardan los reportes generados?',
            answer: 'Los reportes se mantienen por 90 días en el servidor. Los reportes críticos o anuales se archivan indefinidamente en almacenamiento externo.'
          },
          {
            id: 'faq-failed-schedule',
            question: '¿Qué pasa si falla un reporte programado?',
            answer: 'El sistema reintenta 3 veces con intervalos de 5 minutos. Si falla, envía una alerta al administrador y registra el error para revisión.'
          }
        ],
        exercises: [
          {
            id: 'exercise-create-report',
            title: 'Crear Reporte Personalizado',
            objective: 'Aprender a configurar y generar un reporte personalizado',
            difficulty: 'intermediate',
            estimatedTime: '25 min',
            steps: [
              'Seleccionar tipo de reporte personalizado',
              'Configurar período de datos',
              'Elegir secciones a incluir',
              'Seleccionar formato de exportación',
              'Aplicar plantilla de diseño',
              'Generar y descargar reporte'
            ]
          },
          {
            id: 'exercise-schedule-report',
            title: 'Programar Reporte Automático',
            objective: 'Configurar un reporte semanal automático',
            difficulty: 'intermediate',
            estimatedTime: '20 min',
            steps: [
              'Crear nueva programación',
              'Seleccionar frecuencia semanal',
              'Configurar día y hora',
              'Establecer destinatarios email',
              'Activar programación',
              'Verificar primera ejecución'
            ]
          },
          {
            id: 'exercise-template-customization',
            title: 'Personalizar Plantilla',
            objective: 'Crear una plantilla personalizada para reportes',
            difficulty: 'advanced',
            estimatedTime: '35 min',
            steps: [
              'Seleccionar plantilla base',
              'Modificar colores corporativos',
              'Ajustar diseño de header/footer',
              'Configurar secciones',
              'Guardar como nueva plantilla',
              'Generar reporte de prueba'
            ]
          }
        ]
      }
    ]
  },

  flebotomista: {
    title: "Manual del Flebotomista",
    description: "Guía para el personal de atención médica",
    modules: [
      {
        id: 'attention-panel',
        title: 'Panel de Atención',
        icon: 'FaUserMd',
        order: 1,
        estimatedTime: '10 min',
        difficulty: 'basic',
        tags: ['atención', 'pacientes', 'cubículo'],
        sections: [
          {
            id: 'cubicle-selection',
            title: 'Selección de Cubículo',
            content: {
              text: `# Selección de Cubículo

## Tipos de Cubículos

### Cubículos Generales
- Para procedimientos estándar
- Tomas de sangre rutinarias
- Exámenes básicos

### Cubículos Especiales
- Para pacientes con necesidades especiales
- Procedimientos complejos
- Pacientes pediátricos o geriátricos

## Proceso de Selección

1. Al iniciar tu turno, selecciona tu cubículo asignado
2. Verifica que el equipo esté funcionando correctamente
3. Confirma tu selección en el sistema
4. El sistema te asignará automáticamente a la cola correspondiente`,
              videos: [{
                id: 'cubicle-selection-guide',
                title: 'Cómo seleccionar tu cubículo',
                url: '/docs/videos/flebotomista/cubicle-selection.mp4',
                duration: '3:20',
                thumbnail: '/docs/videos/flebotomista/cubicle-thumb.jpg'
              }]
            }
          },
          {
            id: 'patient-calling',
            title: 'Llamado de Pacientes',
            content: {
              text: `# Llamado de Pacientes

## Proceso Standard

1. **Llamar Paciente**: Presiona F2 o haz clic en "Llamar Siguiente"
2. **Confirmar Asistencia**: El paciente debe presentarse en tu cubículo
3. **Iniciar Atención**: Haz clic en "Iniciar Atención" cuando esté listo
4. **Completar Procedimiento**: Realiza la toma de muestra
5. **Finalizar**: Marca como "Completado" en el sistema

## Atajos de Teclado

- **F2**: Llamar siguiente paciente
- **F3**: Repetir último llamado
- **F4**: Marcar como no presentado
- **F5**: Completar atención actual`,
              codeExamples: [{
                title: 'Estados de atención',
                language: 'text',
                code: `PENDING → CALLED → IN_PROGRESS → COMPLETED
   ↓           ↓           ↓            ↓
Esperando   Llamado    Atendiendo   Finalizado`
              }]
            }
          }
        ],
        faqs: [
          {
            id: 'patient-no-show-faq',
            question: '¿Qué hago si un paciente no se presenta?',
            answer: `Si un paciente no se presenta después de 3 llamados:

1. Presiona **F4** o haz clic en "Marcar como No Presentado"
2. El sistema automáticamente llamará al siguiente paciente
3. El paciente no presentado irá al final de la cola
4. Se registrará el evento en el historial

**Nota**: Después de 30 minutos, los pacientes no presentados son marcados como "No Atendidos".`,
            category: 'attention',
            votes: 28,
            isHelpful: true
          }
        ]
      }
    ]
  },

  usuario: {
    title: "Manual del Usuario",
    description: "Guía completa para la gestión de usuarios y roles en TomaTurno",
    modules: [
      {
        id: 'roles-system',
        title: 'Sistema de Roles y Permisos',
        icon: 'FaUserShield',
        order: 1,
        estimatedTime: '10 min',
        difficulty: 'basic',
        tags: ['roles', 'permisos', 'seguridad', 'usuarios'],
        sections: [
          {
            id: 'roles-overview',
            title: 'Descripción General de Roles',
            content: {
              text: `# Sistema de Roles y Permisos de TomaTurno

## 📋 Introducción

El sistema TomaTurno implementa un modelo de seguridad basado en **roles jerárquicos** que define qué puede hacer cada tipo de usuario. Este sistema garantiza que cada persona tenga acceso únicamente a las funciones necesarias para su trabajo.

## 🎭 Roles del Sistema

### 1. 👨‍💼 **Administrador (Admin)**

#### Descripción:
El Administrador tiene **control total** sobre el sistema. Es el rol con mayores privilegios y es responsable de la gestión integral del sistema.

#### Permisos y Accesos:

##### ✅ **Gestión de Usuarios**
- Crear nuevos usuarios de cualquier tipo
- Modificar datos y roles de usuarios existentes
- Activar/desactivar cuentas
- Restablecer contraseñas
- Ver historial de accesos

##### ✅ **Gestión de Turnos**
- Ver la cola completa en tiempo real
- Crear turnos manuales
- Modificar/cancelar cualquier turno
- Reassignar turnos entre cubículos
- Ver historial completo de turnos

##### ✅ **Gestión de Cubículos**
- Crear y configurar nuevos cubículos
- Asignar tipos (General/Especial)
- Activar/desactivar cubículos
- Asignar flebotomistas a cubículos
- Ver estadísticas por cubículo

##### ✅ **Estadísticas y Reportes**
- Acceso total a todas las métricas
- Generar reportes personalizados
- Exportar datos en múltiples formatos (PDF, Excel, CSV)
- Ver análisis de tendencias
- Acceso a dashboards ejecutivos

##### ✅ **Configuración del Sistema**
- Modificar parámetros globales
- Configurar horarios de atención
- Gestionar días festivos
- Configurar notificaciones
- Realizar mantenimiento del sistema

#### Páginas Disponibles:
\`\`\`
/ - Dashboard principal con resumen ejecutivo
/users - Gestión completa de usuarios
/turns/queue - Visualización de cola en tiempo real
/turns/manual - Creación manual de turnos
/turns/attention - Panel de atención (modo observador)
/statistics - Estadísticas completas
/statistics/daily - Reportes diarios
/statistics/monthly - Reportes mensuales
/statistics/phlebotomists - Análisis por flebotomista
/cubicles - Gestión de cubículos
/configuration - Configuración del sistema
/audit - Logs de auditoría
/docs - Documentación completa
\`\`\`

---

### 2. 👩‍⚕️ **Flebotomista**

#### Descripción:
El Flebotomista es el usuario operativo principal que atiende directamente a los pacientes. Su interfaz está optimizada para la eficiencia en la atención.

#### Permisos y Accesos:

##### ✅ **Panel de Atención**
- Seleccionar cubículo de trabajo
- Llamar pacientes de la cola
- Marcar inicio y fin de atención
- Registrar observaciones del paciente
- Marcar pacientes no presentados

##### ✅ **Visualización Limitada**
- Ver solo pacientes asignados
- Ver cola de espera (sin datos sensibles)
- Ver sus propias estadísticas
- Ver horario del día

##### ✅ **Estadísticas Personales**
- Número de pacientes atendidos (día/semana/mes)
- Tiempo promedio de atención
- Ranking personal
- Historial de atenciones propias

##### ❌ **Sin Acceso a:**
- Gestión de usuarios
- Creación de turnos manuales
- Modificación de configuraciones
- Datos de otros flebotomistas (excepto ranking)
- Reportes administrativos

#### Páginas Disponibles:
\`\`\`
/ - Dashboard personalizado del flebotomista
/select-cubicle - Selección de cubículo
/turns/attention - Panel de atención principal
/statistics - Vista limitada de estadísticas propias
/profile - Perfil personal
/docs - Documentación para flebotomistas
\`\`\`

#### Flujo de Trabajo Típico:
\`\`\`mermaid
graph LR
    A[Iniciar Sesión] --> B[Seleccionar Cubículo]
    B --> C[Panel de Atención]
    C --> D[Llamar Paciente]
    D --> E[Atender]
    E --> F[Finalizar Atención]
    F --> D
\`\`\`

---

### 3. 👤 **Usuario (Visualizador)**

#### Descripción:
El rol Usuario es para personal que necesita ver información pero no interactúa directamente con el sistema. Ideal para supervisores, personal de apoyo o monitores de sala.

#### Permisos y Accesos:

##### ✅ **Visualización**
- Ver cola de turnos en tiempo real
- Ver pantalla de llamados
- Ver estado de cubículos
- Ver estadísticas básicas públicas

##### ❌ **Sin Acceso a:**
- Cualquier función de modificación
- Llamado de pacientes
- Creación de turnos
- Gestión de usuarios
- Configuraciones
- Datos sensibles de pacientes

#### Páginas Disponibles:
\`\`\`
/ - Vista de bienvenida
/turns/queue - Visualización de cola (solo lectura)
/statistics - Estadísticas básicas públicas
/docs - Documentación básica
\`\`\`

---

## 🔐 Matriz de Permisos Detallada

| Funcionalidad | Administrador | Flebotomista | Usuario |
|---------------|:-------------:|:------------:|:-------:|
| **GESTIÓN DE USUARIOS** |
| Crear usuarios | ✅ | ❌ | ❌ |
| Modificar usuarios | ✅ | ❌ | ❌ |
| Eliminar usuarios | ✅ | ❌ | ❌ |
| Ver lista de usuarios | ✅ | ❌ | ❌ |
| Cambiar contraseñas ajenas | ✅ | ❌ | ❌ |
| **GESTIÓN DE TURNOS** |
| Ver cola completa | ✅ | ✅ | ✅ |
| Crear turno manual | ✅ | ❌ | ❌ |
| Llamar paciente | ✅ | ✅ | ❌ |
| Atender paciente | ✅ | ✅ | ❌ |
| Cancelar turno | ✅ | ❌ | ❌ |
| Modificar turno | ✅ | ❌ | ❌ |
| **CUBÍCULOS** |
| Crear cubículo | ✅ | ❌ | ❌ |
| Modificar cubículo | ✅ | ❌ | ❌ |
| Asignar cubículo | ✅ | ✅* | ❌ |
| Ver estado cubículos | ✅ | ✅ | ✅ |
| **ESTADÍSTICAS** |
| Ver estadísticas globales | ✅ | ❌ | ❌ |
| Ver estadísticas propias | ✅ | ✅ | ❌ |
| Ver estadísticas básicas | ✅ | ✅ | ✅ |
| Generar reportes | ✅ | ❌ | ❌ |
| Exportar datos | ✅ | ❌ | ❌ |
| **CONFIGURACIÓN** |
| Modificar configuración | ✅ | ❌ | ❌ |
| Ver configuración | ✅ | ❌ | ❌ |
| Gestionar horarios | ✅ | ❌ | ❌ |
| **DOCUMENTACIÓN** |
| Ver documentación completa | ✅ | ✅ | ✅ |
| Acceso a tutoriales | ✅ | ✅ | ✅ |

*El flebotomista solo puede seleccionar su propio cubículo de trabajo

---

## 🔄 Ciclo de Vida del Usuario

### Creación de Usuario (Solo Admin)
\`\`\`javascript
1. Admin accede a /users
2. Click en "Nuevo Usuario"
3. Completa formulario:
   - Nombre completo
   - Username único
   - Contraseña temporal
   - Rol (Admin/Flebotomista/Usuario)
   - Email (opcional)
   - Teléfono (opcional)
4. Sistema valida y crea usuario
5. Usuario recibe credenciales
\`\`\`

### Primer Acceso
\`\`\`javascript
1. Usuario ingresa con credenciales temporales
2. Sistema solicita cambio de contraseña
3. Usuario establece nueva contraseña
4. Sistema registra fecha de cambio
5. Usuario accede a su dashboard según rol
\`\`\`

---

## 🛡️ Consideraciones de Seguridad

### Políticas de Contraseña
- **Longitud mínima:** 8 caracteres
- **Debe contener:** Mayúsculas, minúsculas y números
- **Expiración:** Cada 90 días (configurable)
- **Historial:** No repetir últimas 5 contraseñas
- **Intentos fallidos:** Bloqueo después de 5 intentos

### Auditoría
- Todos los accesos son registrados
- Cambios críticos requieren confirmación
- Logs disponibles por 90 días
- Alertas automáticas por accesos sospechosos

### Sesiones
- **Duración:** 8 horas de actividad
- **Inactividad:** Cierre después de 30 minutos
- **Concurrencia:** Una sesión activa por usuario
- **Tokens JWT:** Renovación automática

---

## 📊 Estadísticas por Rol

### Métricas del Administrador
- Total de usuarios activos
- Pacientes atendidos por día/semana/mes
- Tiempo promedio de espera global
- Eficiencia por cubículo
- Tendencias y proyecciones

### Métricas del Flebotomista
- Pacientes atendidos personal
- Tiempo promedio de atención propio
- Ranking comparativo (sin nombres)
- Cumplimiento de objetivos
- Historial de atenciones

### Métricas del Usuario
- Número de turnos en cola
- Tiempo estimado de espera
- Cubículos disponibles
- Estado general del servicio

---

## ❓ Preguntas Frecuentes sobre Roles

### ¿Puede un usuario tener múltiples roles?
No, cada usuario tiene un único rol asignado. Si necesita permisos adicionales, el administrador debe cambiar su rol.

### ¿Cómo solicito un cambio de rol?
Debe contactar al administrador del sistema quien evaluará la solicitud y realizará el cambio si procede.

### ¿Qué pasa si olvido mi contraseña?
- **Flebotomistas y Usuarios:** Contactar al administrador
- **Administradores:** Usar el procedimiento de recuperación o contactar soporte técnico

### ¿Puedo ver información de otros usuarios?
- **Administradores:** Sí, tienen acceso completo
- **Flebotomistas:** Solo ven nombres en rankings (sin detalles)
- **Usuarios:** No tienen acceso a información de otros usuarios

### ¿Los permisos son personalizables?
No, los permisos están predefinidos por rol para mantener la seguridad y consistencia del sistema.

---

## 🎯 Mejores Prácticas por Rol

### Para Administradores
1. Revisar logs de acceso semanalmente
2. Actualizar usuarios inactivos mensualmente
3. Generar reportes ejecutivos semanales
4. Realizar respaldos antes de cambios críticos
5. Documentar cambios de configuración

### Para Flebotomistas
1. Seleccionar cubículo al inicio del turno
2. No compartir credenciales
3. Cerrar sesión al finalizar turno
4. Reportar problemas inmediatamente
5. Mantener tiempos de atención eficientes

### Para Usuarios
1. No intentar acceder a funciones restringidas
2. Reportar anomalías al administrador
3. Mantener sesión activa solo cuando sea necesario
4. No compartir información sensible vista en pantalla`,
              images: [
                {
                  src: '/docs/screenshots/roles-matrix.png',
                  alt: 'Matriz de roles y permisos',
                  caption: 'Vista general de permisos por rol'
                }
              ]
            }
          }
        ],
        exercises: [
          {
            id: 'identify-role',
            title: 'Identifica el Rol',
            description: 'Basándote en las siguientes acciones, identifica qué rol mínimo se necesita',
            type: 'quiz',
            questions: [
              {
                question: '¿Qué rol necesitas para crear un nuevo usuario?',
                options: ['Usuario', 'Flebotomista', 'Administrador'],
                correct: 2
              },
              {
                question: '¿Qué rol necesitas para llamar a un paciente?',
                options: ['Usuario', 'Flebotomista', 'Administrador'],
                correct: 1
              },
              {
                question: '¿Qué rol necesitas para ver la cola de turnos?',
                options: ['Usuario', 'Flebotomista', 'Administrador'],
                correct: 0
              }
            ]
          }
        ],
        faqs: [
          {
            question: '¿Puede un flebotomista ver las estadísticas de otros flebotomistas?',
            answer: 'No, los flebotomistas solo pueden ver sus propias estadísticas y un ranking comparativo sin nombres específicos.',
            category: 'permisos',
            votes: 15,
            isHelpful: true
          },
          {
            question: '¿Cómo se asigna el rol inicial a un usuario?',
            answer: 'El administrador asigna el rol al momento de crear el usuario. Este rol define todos los permisos y accesos del usuario en el sistema.',
            category: 'usuarios',
            votes: 12,
            isHelpful: true
          },
          {
            question: '¿Se pueden crear roles personalizados?',
            answer: 'No, el sistema trabaja con tres roles predefinidos (Admin, Flebotomista, Usuario) para mantener la seguridad y simplicidad.',
            category: 'configuracion',
            votes: 8,
            isHelpful: true
          }
        ]
      },
      {
        id: 'queue-viewing',
        title: 'Visualización de Turnos',
        icon: 'FaEye',
        order: 2,
        estimatedTime: '5 min',
        difficulty: 'basic',
        tags: ['turnos', 'cola', 'visualización'],
        sections: [
          {
            id: 'understanding-queue',
            title: 'Entender la Cola de Turnos',
            content: {
              text: `# Visualización de Turnos

## Estados de los Turnos

### 🟡 Esperando
- El turno está en cola
- Espera a ser llamado

### 🔵 Llamando
- El turno está siendo llamado
- Debe dirigirse al cubículo indicado

### 🟢 En Atención
- El paciente está siendo atendido
- Procedimiento en curso

### ✅ Completado
- Atención finalizada exitosamente

### ❌ No Presentado
- El paciente no se presentó después de 3 llamados

## Información Mostrada

- **Número de turno**
- **Nombre del paciente**
- **Tipo de atención** (General/Especial)
- **Cubículo asignado**
- **Estado actual**
- **Tiempo estimado**`,
              images: [
                {
                  src: '/docs/screenshots/queue-display.png',
                  alt: 'Pantalla de visualización de turnos',
                  caption: 'Cola de turnos con diferentes estados'
                }
              ]
            }
          }
        ]
      }
    ]
  },

  // CONTENIDO COMÚN
  common: {
    title: "Información General",
    description: "Recursos compartidos para todos los usuarios",
    glossary: [
      {
        term: 'Turno',
        definition: 'Número asignado secuencialmente a cada paciente que ingresa al sistema para ser atendido.',
        category: 'general'
      },
      {
        term: 'Cubículo',
        definition: 'Espacio físico designado para la atención de pacientes, puede ser General o Especial.',
        category: 'general'
      },
      {
        term: 'Flebotomista',
        definition: 'Profesional de la salud especializado en la extracción de muestras de sangre.',
        category: 'personal'
      },
      {
        term: 'Cola',
        definition: 'Lista ordenada de pacientes esperando ser atendidos, organizada por orden de llegada.',
        category: 'sistema'
      },
      {
        term: 'Atención Especial',
        definition: 'Procedimientos que requieren cuidados adicionales o equipamiento especializado.',
        category: 'procedimientos'
      }
    ],
    shortcuts: [
      {
        key: 'F1',
        action: 'Abrir ayuda contextual',
        context: 'global',
        description: 'Muestra ayuda específica para la pantalla actual'
      },
      {
        key: 'F2',
        action: 'Llamar paciente',
        context: 'attention',
        description: 'Llama al siguiente paciente en la cola'
      },
      {
        key: 'F3',
        action: 'Repetir llamado',
        context: 'attention',
        description: 'Repite el llamado del paciente actual'
      },
      {
        key: 'F4',
        action: 'Marcar como no presentado',
        context: 'attention',
        description: 'Marca al paciente actual como no presentado'
      },
      {
        key: 'F5',
        action: 'Completar atención',
        context: 'attention',
        description: 'Finaliza la atención del paciente actual'
      },
      {
        key: 'Ctrl + R',
        action: 'Actualizar datos',
        context: 'global',
        description: 'Actualiza la información mostrada en pantalla'
      },
      {
        key: 'Ctrl + P',
        action: 'Imprimir/Exportar',
        context: 'reports',
        description: 'Abre opciones de impresión o exportación'
      },
      {
        key: 'Esc',
        action: 'Cancelar acción',
        context: 'global',
        description: 'Cancela la acción actual o cierra modal'
      }
    ],
    errorCodes: [
      {
        code: 'ERR_001',
        message: 'Token de sesión inválido',
        solution: 'Vuelva a iniciar sesión en el sistema',
        severity: 'high'
      },
      {
        code: 'ERR_002',
        message: 'Cubículo no disponible',
        solution: 'Seleccione otro cubículo o contacte al administrador',
        severity: 'medium'
      },
      {
        code: 'ERR_003',
        message: 'No hay pacientes en cola',
        solution: 'Espere a que lleguen nuevos pacientes',
        severity: 'low'
      },
      {
        code: 'ERR_004',
        message: 'Error de conexión con la base de datos',
        solution: 'Verifique su conexión de red o contacte soporte técnico',
        severity: 'critical'
      },
      {
        code: 'ERR_005',
        message: 'Permisos insuficientes',
        solution: 'Contacte al administrador para verificar sus permisos',
        severity: 'high'
      }
    ],
    supportInfo: {
      email: 'soporte@tomaturno.com',
      phone: '+52 55 1234 5678',
      hours: 'Lunes a Viernes, 8:00 AM - 6:00 PM',
      emergency: '+52 55 8765 4321',
      chatAvailable: true,
      responseTime: '2-4 horas en horario laboral'
    }
  }
};

// Función para obtener contenido por rol
export const getContentByRole = (role) => {
  const normalizedRole = role?.toLowerCase();

  switch (normalizedRole) {
    case 'admin':
    case 'administrador':
      return documentationContent.admin;
    case 'flebotomista':
    case 'phlebotomist':
      return documentationContent.flebotomista;
    case 'usuario':
    case 'user':
      return documentationContent.usuario;
    default:
      return documentationContent.usuario; // Fallback to user content
  }
};

// Función para buscar en el contenido
export const searchContent = (query, role = null) => {
  const results = [];
  const searchTerm = query.toLowerCase();

  const searchInModule = (module, category) => {
    // Buscar en título y descripción del módulo
    if (module.title.toLowerCase().includes(searchTerm) ||
        module.description?.toLowerCase().includes(searchTerm)) {
      results.push({
        type: 'module',
        category,
        id: module.id,
        title: module.title,
        description: module.description,
        relevance: 100
      });
    }

    // Buscar en secciones
    module.sections?.forEach(section => {
      if (section.title.toLowerCase().includes(searchTerm) ||
          section.content.text.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'section',
          category,
          moduleId: module.id,
          id: section.id,
          title: section.title,
          excerpt: section.content.text.substring(0, 150) + '...',
          relevance: 90
        });
      }
    });

    // Buscar en FAQs
    module.faqs?.forEach(faq => {
      if (faq.question.toLowerCase().includes(searchTerm) ||
          faq.answer.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'faq',
          category,
          moduleId: module.id,
          id: faq.id,
          title: faq.question,
          excerpt: faq.answer.substring(0, 150) + '...',
          relevance: 80
        });
      }
    });
  };

  if (role) {
    const content = getContentByRole(role);
    content.modules?.forEach(module => searchInModule(module, role));
  } else {
    // Buscar en todo el contenido
    Object.keys(documentationContent).forEach(category => {
      if (category !== 'common') {
        documentationContent[category].modules?.forEach(module =>
          searchInModule(module, category)
        );
      }
    });
  }

  // Buscar en contenido común
  documentationContent.common.glossary.forEach(item => {
    if (item.term.toLowerCase().includes(searchTerm) ||
        item.definition.toLowerCase().includes(searchTerm)) {
      results.push({
        type: 'glossary',
        category: 'common',
        id: item.term,
        title: item.term,
        excerpt: item.definition,
        relevance: 70
      });
    }
  });

  // Ordenar por relevancia
  return results.sort((a, b) => b.relevance - a.relevance);
};

// Función para obtener módulo específico
export const getModule = (moduleId, role) => {
  const content = getContentByRole(role);
  return content.modules?.find(module => module.id === moduleId);
};

// Función para obtener estadísticas de contenido
export const getContentStats = () => {
  let totalModules = 0;
  let totalSections = 0;
  let totalFAQs = 0;
  let totalVideos = 0;

  Object.keys(documentationContent).forEach(category => {
    if (category !== 'common') {
      const content = documentationContent[category];
      totalModules += content.modules?.length || 0;

      content.modules?.forEach(module => {
        totalSections += module.sections?.length || 0;
        totalFAQs += module.faqs?.length || 0;

        module.sections?.forEach(section => {
          totalVideos += section.content.videos?.length || 0;
        });
      });
    }
  });

  return {
    totalModules,
    totalSections,
    totalFAQs,
    totalVideos,
    totalGlossaryTerms: documentationContent.common.glossary.length,
    totalShortcuts: documentationContent.common.shortcuts.length,
    totalErrorCodes: documentationContent.common.errorCodes.length
  };
};