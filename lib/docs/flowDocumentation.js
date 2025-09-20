export const flowDocumentation = {
  'llamado-paciente': {
    id: 'llamado-paciente',
    title: 'Flujo Completo: Llamar un Paciente',
    description: 'Aprende el proceso completo desde la selección hasta la finalización',
    estimatedTime: '15 minutos',
    difficulty: 'Intermedio',
    tags: ['flebotomista', 'esencial', 'flujo-principal'],
    lastUpdated: '2024-01-15',

    sections: [
      {
        id: 'overview',
        title: 'Vista General del Proceso',
        type: 'diagram',
        content: {
          mermaidDiagram: `
            graph TD
              A[Flebotomista inicia sesión] --> B[Selecciona cubículo]
              B --> C[Panel de atención carga]
              C --> D{¿Hay pacientes en espera?}
              D -->|Sí| E[Click en botón llamar]
              D -->|No| F[Esperar nuevos turnos]
              E --> G[Sistema anuncia por altavoz]
              G --> H[Paciente se dirige al cubículo]
              H --> I[Inicia atención]
              I --> J[Toma de muestra]
              J --> K[Finaliza atención]
              K --> L[Sistema llama siguiente]
          `,
          interactivePoints: [
            { step: 'B', description: 'El cubículo define dónde atenderás' },
            { step: 'E', description: 'Aquí comienza la magia del llamado' },
            { step: 'G', description: 'Speech API anuncia al paciente' }
          ]
        }
      },

      {
        id: 'prerequisites',
        title: 'Antes de Empezar',
        type: 'checklist',
        content: {
          requirements: [
            {
              item: 'Cuenta activa con rol de Flebotomista',
              verified: true,
              helpLink: '/docs/users/crear-usuario',
              description: 'Tu administrador debe haberte creado una cuenta'
            },
            {
              item: 'Cubículo físico asignado',
              verified: false,
              helpLink: '/docs/config/cubiculos',
              description: 'Debes tener un espacio físico donde atender'
            },
            {
              item: 'Navegador con soporte para Speech API',
              verified: true,
              testButton: true,
              description: 'Chrome, Edge o Firefox modernos'
            }
          ]
        }
      },

      {
        id: 'step-by-step',
        title: 'Paso a Paso Detallado',
        type: 'interactive',
        content: {
          steps: [
            {
              number: 1,
              title: 'Seleccionar Cubículo',
              shortTitle: 'Cubículo',
              description: 'Al iniciar tu turno, lo primero es indicar en qué cubículo trabajarás',
              screenshot: '/docs/flows/select-cubicle.png',
              video: '/docs/flows/select-cubicle.mp4',
              duration: '30 segundos',
              code: `
// Código que ejecuta el sistema
const handleCubicleSelect = async (cubicleId) => {
  // Guardar en localStorage para persistencia
  localStorage.setItem('selectedCubicle', cubicleId);

  // Actualizar estado en el servidor
  await fetch('/api/cubicles/assign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    },
    body: JSON.stringify({
      cubicleId,
      userId: currentUser.id
    })
  });

  // Actualizar UI
  setCubicle(cubicleId);
  showNotification('Cubículo seleccionado exitosamente');
};`,
              interactiveDemo: {
                type: 'simulator',
                component: 'CubicleSelector'
              },
              commonMistakes: [
                {
                  mistake: 'No seleccionar cubículo antes de llamar',
                  consequence: 'El sistema no sabrá dónde enviar al paciente',
                  solution: 'Siempre verifica el cubículo en la parte superior'
                },
                {
                  mistake: 'Seleccionar cubículo ocupado',
                  consequence: 'Conflictos con otro flebotomista',
                  solution: 'Coordina con tu equipo los cubículos disponibles'
                }
              ],
              tips: [
                'Puedes cambiar de cubículo en cualquier momento',
                'El sistema recuerda tu último cubículo usado',
                'Los cubículos especiales son para casos prioritarios'
              ]
            },

            {
              number: 2,
              title: 'Identificar al Paciente',
              shortTitle: 'Identificar',
              description: 'En la lista de espera, identifica al siguiente paciente',
              screenshot: '/docs/flows/patient-list.png',
              duration: '20 segundos',
              annotations: [
                { x: 100, y: 50, text: 'Pacientes prioritarios aparecen primero' },
                { x: 200, y: 150, text: 'El número de turno es único' },
                { x: 300, y: 200, text: 'El tiempo de espera se muestra aquí' }
              ],
              interactiveDemo: {
                type: 'highlight',
                elements: ['patient-card', 'priority-badge', 'turn-number']
              },
              bestPractices: [
                'Siempre llama en orden, salvo emergencias',
                'Verifica el nombre completo del paciente',
                'Observa los indicadores de prioridad'
              ]
            },

            {
              number: 3,
              title: 'Ejecutar el Llamado',
              shortTitle: 'Llamar',
              description: 'Al hacer click en el botón de llamar, ocurren varias cosas automáticamente',
              duration: '2 segundos',
              diagram: `
sequenceDiagram
    participant F as Flebotomista
    participant UI as Interfaz
    participant API as Servidor
    participant DB as Base de Datos
    participant S as Sistema de Sonido
    participant P as Pantalla TV

    F->>UI: Click en "Llamar"
    UI->>API: POST /api/attention/call
    API->>DB: Actualizar estado turno
    DB-->>API: Confirmación
    API->>S: Trigger anuncio de voz
    API->>P: Actualizar pantalla
    S->>S: "Paciente X, cubículo Y"
    API-->>UI: Respuesta exitosa
    UI->>F: Mostrar confirmación`,
              code: `
// Función principal de llamado
const handleCallPatient = async (turnId) => {
  try {
    // 1. Validaciones previas
    if (!selectedCubicle) {
      throw new Error('Seleccione un cubículo primero');
    }

    // 2. Actualizar UI optimísticamente
    setCallingPatient(turnId);
    setButtonLoading(true);

    // 3. Llamada a la API
    const response = await fetch('/api/attention/call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${token}\`
      },
      body: JSON.stringify({
        turnId,
        cubicleId: selectedCubicle,
        userId: currentUser.id,
        timestamp: new Date().toISOString()
      })
    });

    // 4. Manejo de respuesta
    if (response.ok) {
      const data = await response.json();

      // 5. Actualizar listas locales
      setPendingTurns(prev =>
        prev.filter(t => t.id !== turnId)
      );
      setInProgressTurns(prev =>
        [...prev, data.turn]
      );

      // 6. Reproducir sonido local de confirmación
      playNotificationSound();

      // 7. Mostrar notificación de éxito
      toast.success(\`Paciente \${data.turn.patientName} llamado al cubículo \${selectedCubicle}\`);

      // 8. Preparar siguiente acción
      prepareForNextPatient();
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error al llamar paciente:', error);
    toast.error(error.message || 'Error al llamar al paciente');

    // Revertir cambios optimistas
    setCallingPatient(null);
  } finally {
    setButtonLoading(false);
  }
};`,
              animation: '/docs/flows/calling-animation.gif',
              metrics: {
                'Tiempo de respuesta': '< 200ms',
                'Éxito de llamados': '99.9%',
                'Tiempo hasta anuncio': '< 500ms'
              }
            },

            {
              number: 4,
              title: 'Atender al Paciente',
              shortTitle: 'Atender',
              description: 'Una vez que el paciente llega, inicia el proceso de atención',
              screenshot: '/docs/flows/patient-attending.png',
              duration: '5-10 minutos',
              workflow: [
                'Verificar identidad del paciente',
                'Confirmar tipo de muestra requerida',
                'Realizar toma de muestra',
                'Etiquetar correctamente',
                'Registrar observaciones si es necesario'
              ],
              importantNotes: [
                {
                  type: 'warning',
                  text: 'Siempre verifica la identidad antes de proceder'
                },
                {
                  type: 'info',
                  text: 'El sistema registra automáticamente los tiempos'
                }
              ]
            },

            {
              number: 5,
              title: 'Finalizar Atención',
              shortTitle: 'Finalizar',
              description: 'Marca la atención como completada para liberar el turno',
              screenshot: '/docs/flows/finish-attention.png',
              duration: '5 segundos',
              code: `
// Finalizar atención
const finishAttention = async (turnId) => {
  const response = await fetch('/api/attention/finish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      turnId,
      status: 'completed',
      notes: attendanceNotes,
      completedAt: new Date().toISOString()
    })
  });

  if (response.ok) {
    // Actualizar estadísticas locales
    updateDailyStats();

    // Preparar para siguiente paciente
    if (hasMorePatients) {
      promptNextPatient();
    }
  }
};`,
              postActions: [
                'El sistema actualiza las estadísticas',
                'Se libera el cubículo para el siguiente paciente',
                'Se registra el tiempo total de atención',
                'Se genera registro de auditoría'
              ]
            }
          ]
        }
      },

      {
        id: 'technical-details',
        title: 'Detalles Técnicos',
        type: 'advanced',
        content: {
          architecture: {
            title: 'Arquitectura del Sistema de Llamados',
            description: 'Cómo funciona internamente el sistema',
            components: [
              {
                name: 'Frontend (React)',
                tech: 'Next.js 14 + Chakra UI',
                responsibilities: [
                  'Capturar eventos de usuario',
                  'Actualización optimista de UI',
                  'Manejo de estados locales con useState/useReducer',
                  'WebSocket para actualizaciones en tiempo real'
                ]
              },
              {
                name: 'API (Next.js)',
                tech: 'Node.js + Prisma',
                responsibilities: [
                  'Validación de permisos con JWT',
                  'Transacciones de BD con Prisma',
                  'Emisión de eventos para otros sistemas',
                  'Rate limiting y seguridad'
                ]
              },
              {
                name: 'Base de Datos (PostgreSQL)',
                tech: 'PostgreSQL 14+',
                responsibilities: [
                  'Persistencia de estados ACID',
                  'Integridad referencial con constraints',
                  'Auditoría de cambios con triggers',
                  'Índices optimizados para búsquedas'
                ]
              },
              {
                name: 'Speech API',
                tech: 'Web Speech API nativa',
                responsibilities: [
                  'Síntesis de voz en español',
                  'Selección de voz y velocidad',
                  'Queue de anuncios',
                  'Fallback a notificaciones visuales'
                ]
              }
            ]
          },
          performance: {
            title: 'Métricas de Rendimiento',
            metrics: [
              {
                metric: 'Tiempo de respuesta API',
                target: '< 200ms',
                current: '150ms',
                status: 'optimal'
              },
              {
                metric: 'Inicio de anuncio',
                target: '< 500ms',
                current: '300ms',
                status: 'optimal'
              },
              {
                metric: 'Actualización de pantalla',
                target: '< 100ms',
                current: '50ms',
                status: 'optimal'
              },
              {
                metric: 'Concurrent users',
                target: '100+',
                current: '150',
                status: 'optimal'
              }
            ],
            optimizations: [
              'Caché de Redis para sesiones',
              'CDN para assets estáticos',
              'Lazy loading de componentes',
              'Debouncing en búsquedas'
            ]
          },
          security: {
            title: 'Consideraciones de Seguridad',
            measures: [
              'JWT con expiración de 8 horas',
              'Rate limiting: 100 req/min',
              'HTTPS obligatorio en producción',
              'Sanitización de inputs con DOMPurify',
              'Auditoría completa de acciones'
            ]
          }
        }
      },

      {
        id: 'troubleshooting',
        title: 'Solución de Problemas',
        type: 'faq',
        content: {
          issues: [
            {
              problem: 'No se escucha el anuncio de voz',
              severity: 'high',
              frequency: 'común',
              solutions: [
                {
                  step: 1,
                  action: 'Verificar volumen del sistema',
                  command: 'Settings > Sound > Output volume',
                  screenshot: '/docs/troubleshoot/volume-check.png'
                },
                {
                  step: 2,
                  action: 'Probar Speech API en consola',
                  code: `speechSynthesis.speak(new SpeechSynthesisUtterance('Prueba de audio'))`,
                  expectedResult: 'Debe escucharse "Prueba de audio"'
                },
                {
                  step: 3,
                  action: 'Verificar permisos del navegador',
                  screenshot: '/docs/troubleshoot/audio-permissions.png',
                  note: 'Chrome puede bloquear audio sin interacción'
                },
                {
                  step: 4,
                  action: 'Revisar configuración de idioma',
                  code: `speechSynthesis.getVoices().filter(v => v.lang.includes('es'))`
                }
              ],
              alternativeSolution: 'Usar notificaciones visuales como fallback'
            },
            {
              problem: 'El botón de llamar no responde',
              severity: 'medium',
              frequency: 'ocasional',
              solutions: [
                {
                  step: 1,
                  action: 'Verificar selección de cubículo',
                  check: 'Debe aparecer el número de cubículo arriba'
                },
                {
                  step: 2,
                  action: 'Revisar conexión a internet',
                  command: 'ping api.tomaturno.com'
                },
                {
                  step: 3,
                  action: 'Limpiar caché del navegador',
                  command: 'Ctrl+Shift+R o Cmd+Shift+R'
                },
                {
                  step: 4,
                  action: 'Revisar consola de errores',
                  command: 'F12 > Console',
                  lookFor: 'Errores en rojo relacionados con fetch'
                }
              ]
            },
            {
              problem: 'Paciente no aparece en la lista',
              severity: 'low',
              frequency: 'raro',
              solutions: [
                {
                  step: 1,
                  action: 'Refrescar la lista manualmente',
                  button: 'Botón de actualizar en la esquina'
                },
                {
                  step: 2,
                  action: 'Verificar filtros activos',
                  check: 'Puede haber filtros por tipo o prioridad'
                },
                {
                  step: 3,
                  action: 'Confirmar registro del turno',
                  query: 'Verificar en sistema de turnos principal'
                }
              ]
            }
          ],
          commonErrors: [
            {
              error: 'NetworkError when attempting to fetch resource',
              cause: 'Problemas de conectividad',
              solution: 'Verificar conexión y reintentar'
            },
            {
              error: 'Invalid token',
              cause: 'Sesión expirada',
              solution: 'Cerrar sesión y volver a iniciar'
            },
            {
              error: 'Cubicle already in use',
              cause: 'Otro flebotomista usa el cubículo',
              solution: 'Seleccionar otro cubículo disponible'
            }
          ]
        }
      },

      {
        id: 'practice',
        title: 'Zona de Práctica',
        type: 'sandbox',
        content: {
          simulator: {
            title: 'Simulador de Llamado de Pacientes',
            description: 'Practica sin afectar el sistema real',
            features: [
              'Pacientes de prueba generados automáticamente',
              'Simulación de anuncios de voz',
              'Métricas de tu desempeño en tiempo real',
              'Sin consecuencias en producción',
              'Escenarios de práctica variados'
            ],
            component: 'CallSimulator',
            scenarios: [
              {
                name: 'Día Normal',
                description: 'Flujo estándar con 10 pacientes',
                difficulty: 'fácil',
                duration: '5 minutos'
              },
              {
                name: 'Hora Pico',
                description: '30 pacientes en cola',
                difficulty: 'medio',
                duration: '15 minutos'
              },
              {
                name: 'Emergencias',
                description: 'Manejo de prioridades',
                difficulty: 'difícil',
                duration: '10 minutos'
              }
            ]
          }
        }
      },

      {
        id: 'best-practices',
        title: 'Mejores Prácticas',
        type: 'guidelines',
        content: {
          dos: [
            'Mantén actualizado el estado del cubículo',
            'Verifica siempre la identidad del paciente',
            'Registra observaciones importantes',
            'Comunica retrasos al equipo',
            'Usa el sistema de prioridades correctamente'
          ],
          donts: [
            'No llames múltiples pacientes simultáneamente',
            'No cambies de cubículo sin avisar',
            'No ignores las alertas del sistema',
            'No finalices atención sin completar el proceso',
            'No uses credenciales compartidas'
          ],
          proTips: [
            {
              tip: 'Usa atajos de teclado',
              detail: 'Space para llamar, Enter para finalizar',
              keyboardShortcuts: [
                { key: 'Space', action: 'Llamar siguiente paciente' },
                { key: 'Enter', action: 'Finalizar atención actual' },
                { key: 'R', action: 'Refrescar lista' },
                { key: 'C', action: 'Cambiar cubículo' }
              ]
            },
            {
              tip: 'Prepara el siguiente turno',
              detail: 'Mientras atiendes, el sistema prepara el siguiente'
            },
            {
              tip: 'Usa el modo oscuro en turnos nocturnos',
              detail: 'Reduce fatiga visual'
            }
          ]
        }
      }
    ],

    relatedFlows: [
      {
        id: 'emergency-patient',
        title: 'Manejo de Pacientes de Emergencia',
        link: '/docs/flows/emergency-patient'
      },
      {
        id: 'shift-change',
        title: 'Cambio de Turno',
        link: '/docs/flows/shift-change'
      },
      {
        id: 'reports',
        title: 'Generación de Reportes',
        link: '/docs/flows/reports'
      }
    ],

    changelog: [
      {
        date: '2024-01-15',
        version: '1.2.0',
        changes: [
          'Agregado soporte para múltiples idiomas en Speech API',
          'Mejorado el sistema de prioridades',
          'Optimización de tiempos de respuesta'
        ]
      },
      {
        date: '2024-01-01',
        version: '1.1.0',
        changes: [
          'Nueva interfaz de usuario',
          'Sistema de notificaciones mejorado'
        ]
      }
    ]
  },

  'crear-turno-manual': {
    id: 'crear-turno-manual',
    title: 'Crear Turno Manual',
    description: 'Aprende a crear turnos manualmente para casos especiales',
    estimatedTime: '5 minutos',
    difficulty: 'Básico',
    tags: ['admin', 'turnos', 'gestión'],
    // ... contenido similar estructurado
  },

  'generar-reportes': {
    id: 'generar-reportes',
    title: 'Generación de Reportes',
    description: 'Cómo generar y exportar reportes del sistema',
    estimatedTime: '10 minutos',
    difficulty: 'Intermedio',
    tags: ['admin', 'reportes', 'estadísticas'],
    // ... contenido similar estructurado
  }
};

// Helper functions para trabajar con los flujos
export const getFlowById = (flowId) => flowDocumentation[flowId];

export const getFlowsByRole = (role) => {
  return Object.values(flowDocumentation).filter(flow =>
    flow.tags.includes(role.toLowerCase())
  );
};

export const getFlowsByDifficulty = (difficulty) => {
  return Object.values(flowDocumentation).filter(flow =>
    flow.difficulty.toLowerCase() === difficulty.toLowerCase()
  );
};

export const searchFlows = (query) => {
  const searchTerm = query.toLowerCase();
  return Object.values(flowDocumentation).filter(flow =>
    flow.title.toLowerCase().includes(searchTerm) ||
    flow.description.toLowerCase().includes(searchTerm) ||
    flow.tags.some(tag => tag.includes(searchTerm))
  );
};

export default flowDocumentation;