import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  HStack,
  Text,
  Progress,
  Badge,
  Box,
  Image,
  Card,
  CardBody,
  useColorModeValue,
  useToast,
  IconButton,
  Tooltip,
  Flex,
  Heading,
  List,
  ListItem,
  ListIcon,
  Code,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider
} from '@chakra-ui/react';
import {
  FaArrowLeft,
  FaArrowRight,
  FaTimes,
  FaPlay,
  FaCheckCircle,
  FaLightbulb,
  FaExclamationTriangle,
  FaRocket,
  FaChartBar,
  FaUsers,
  FaUserMd,
  FaEye,
  FaCog,
  FaFileAlt,
  FaVideo,
  FaMousePointer,
  FaKeyboard,
  FaGraduationCap
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const MotionBox = motion(Box);

// Tour steps configuration by role
const tourSteps = {
  admin: {
    title: 'Tour para Administradores',
    description: 'Aprende a usar todas las funciones administrativas del sistema',
    totalSteps: 5,
    steps: [
      {
        id: 'dashboard-overview',
        title: 'Dashboard Administrativo',
        description: 'El centro de control de tu sistema TomaTurno',
        content: {
          overview: 'Desde aquí puedes monitorear todas las actividades del sistema en tiempo real.',
          features: [
            'Métricas de rendimiento en vivo',
            'Estadísticas de satisfacción',
            'Control de usuarios y permisos',
            'Generación de reportes'
          ],
          tips: [
            'Usa Ctrl+R para actualizar datos rápidamente',
            'Los gráficos son interactivos - haz clic para más detalles',
            'Configura alertas automáticas para eventos importantes'
          ],
          image: '/docs/screenshots/admin-dashboard-overview.png',
          video: '/docs/videos/admin/dashboard-tour.mp4',
          practiceZone: {
            title: 'Zona de Práctica',
            description: 'Prueba generar un reporte rápido:',
            steps: [
              'Haz clic en "Estadísticas" en el menú',
              'Selecciona "Reporte Diario"',
              'Elige la fecha de hoy',
              'Presiona "Generar"'
            ],
            validation: '/api/docs/exercises/validate/dashboard-practice'
          }
        },
        icon: FaChartBar,
        estimatedTime: '3 min',
        difficulty: 'Básico'
      },
      {
        id: 'user-management',
        title: 'Gestión de Usuarios',
        description: 'Administra usuarios y asigna permisos',
        content: {
          overview: 'Crea, edita y gestiona todos los usuarios del sistema con diferentes niveles de acceso.',
          features: [
            'Crear nuevos usuarios con roles específicos',
            'Resetear contraseñas de forma segura',
            'Activar/desactivar cuentas',
            'Auditoría de actividades de usuarios'
          ],
          tips: [
            'Siempre asigna el rol mínimo necesario por seguridad',
            'Revisa regularmente los usuarios inactivos',
            'Usa nombres de usuario descriptivos'
          ],
          image: '/docs/screenshots/user-management.png',
          practiceZone: {
            title: 'Crear Usuario de Prueba',
            description: 'Practica creando un usuario flebotomista:',
            steps: [
              'Ve a Gestión de Usuarios',
              'Haz clic en "Nuevo Usuario"',
              'Completa: Juan Pérez, usuario: jperez',
              'Asigna rol: Flebotomista',
              'Guarda los cambios'
            ],
            validation: '/api/docs/exercises/validate/user-creation'
          }
        },
        icon: FaUsers,
        estimatedTime: '4 min',
        difficulty: 'Intermedio'
      },
      {
        id: 'statistics-reports',
        title: 'Estadísticas y Reportes',
        description: 'Genera reportes detallados y analiza tendencias',
        content: {
          overview: 'Accede a análisis profundos del rendimiento del sistema y genera reportes profesionales.',
          features: [
            'Reportes mensuales y diarios automáticos',
            'Análisis de tendencias y patrones',
            'Exportación a PDF y Excel',
            'Comparativas entre períodos'
          ],
          tips: [
            'Los reportes se generan más rápido en horarios de baja actividad',
            'Programa reportes automáticos para envío por email',
            'Usa filtros para análisis específicos'
          ],
          image: '/docs/screenshots/statistics-dashboard.png'
        },
        icon: FaFileAlt,
        estimatedTime: '5 min',
        difficulty: 'Intermedio'
      },
      {
        id: 'system-configuration',
        title: 'Configuración del Sistema',
        description: 'Personaliza y configura el comportamiento del sistema',
        content: {
          overview: 'Ajusta parámetros del sistema para optimizar el flujo de trabajo de tu institución.',
          features: [
            'Configuración de horarios de atención',
            'Personalización de tipos de cubículos',
            'Ajustes de notificaciones',
            'Configuración de encuestas de satisfacción'
          ],
          tips: [
            'Haz backup antes de cambios importantes',
            'Prueba configuraciones en horarios de baja actividad',
            'Documenta los cambios realizados'
          ]
        },
        icon: FaCog,
        estimatedTime: '6 min',
        difficulty: 'Avanzado'
      },
      {
        id: 'advanced-tools',
        title: 'Herramientas Avanzadas',
        description: 'Funciones especiales para administradores expertos',
        content: {
          overview: 'Herramientas especializadas para diagnóstico, mantenimiento y optimización del sistema.',
          features: [
            'Monitor de rendimiento en tiempo real',
            'Herramientas de diagnóstico',
            'Backup y restauración',
            'Integración con sistemas externos'
          ],
          tips: [
            'Usa estas herramientas solo si tienes experiencia',
            'Mantén siempre backups actualizados',
            'Contacta soporte para funciones críticas'
          ]
        },
        icon: FaRocket,
        estimatedTime: '8 min',
        difficulty: 'Avanzado'
      }
    ]
  },

  flebotomista: {
    title: 'Tour para Flebotomistas',
    description: 'Aprende el flujo de trabajo para atención de pacientes',
    totalSteps: 4,
    steps: [
      {
        id: 'cubicle-selection',
        title: 'Selección de Cubículo',
        description: 'Configura tu espacio de trabajo',
        content: {
          overview: 'Selecciona y configura tu cubículo para comenzar a atender pacientes.',
          features: [
            'Selección entre cubículos generales y especiales',
            'Verificación de equipo disponible',
            'Configuración de preferencias personales'
          ],
          tips: [
            'Verifica siempre que el equipo funcione antes de comenzar',
            'Los cubículos especiales son para casos complejos',
            'Puedes cambiar de cubículo durante tu turno si es necesario'
          ],
          image: '/docs/screenshots/cubicle-selection.png',
          video: '/docs/videos/flebotomista/cubicle-selection.mp4'
        },
        icon: FaUserMd,
        estimatedTime: '2 min',
        difficulty: 'Básico'
      },
      {
        id: 'attention-panel',
        title: 'Panel de Atención',
        description: 'Tu centro de control para atender pacientes',
        content: {
          overview: 'Desde este panel controlas todo el flujo de atención de pacientes.',
          features: [
            'Vista de cola en tiempo real',
            'Información detallada de cada paciente',
            'Controles de llamado y gestión',
            'Registro de procedimientos'
          ],
          tips: [
            'F2 para llamar al siguiente paciente',
            'F3 para repetir el último llamado',
            'Siempre verifica la información del paciente'
          ],
          image: '/docs/screenshots/attention-panel.png',
          practiceZone: {
            title: 'Simulación de Atención',
            description: 'Practica el flujo básico:',
            steps: [
              'Presiona F2 para llamar paciente',
              'Verifica que se presente',
              'Inicia la atención',
              'Completa el procedimiento',
              'Marca como finalizado'
            ],
            validation: '/api/docs/exercises/validate/attention-flow'
          }
        },
        icon: FaPlay,
        estimatedTime: '4 min',
        difficulty: 'Básico'
      },
      {
        id: 'patient-calling',
        title: 'Llamado de Pacientes',
        description: 'Gestiona el flujo de pacientes eficientemente',
        content: {
          overview: 'Aprende las mejores prácticas para llamar y gestionar pacientes.',
          features: [
            'Sistema de llamado automático',
            'Gestión de pacientes no presentados',
            'Priorización de casos especiales',
            'Registro de tiempos de atención'
          ],
          tips: [
            'Llama 3 veces antes de marcar como no presentado',
            'Los pacientes especiales tienen prioridad',
            'Mantén un ritmo constante pero sin prisa'
          ]
        },
        icon: FaMousePointer,
        estimatedTime: '3 min',
        difficulty: 'Básico'
      },
      {
        id: 'reports-personal',
        title: 'Reportes Personales',
        description: 'Revisa tu desempeño y estadísticas',
        content: {
          overview: 'Accede a tus estadísticas personales y reportes de rendimiento.',
          features: [
            'Estadísticas diarias de atención',
            'Tiempo promedio por paciente',
            'Histórico de desempeño',
            'Comparativas con el equipo'
          ],
          tips: [
            'Revisa tus estadísticas al final del día',
            'Busca oportunidades de mejora',
            'Comparte buenas prácticas con el equipo'
          ]
        },
        icon: FaFileAlt,
        estimatedTime: '3 min',
        difficulty: 'Básico'
      }
    ]
  },

  usuario: {
    title: 'Tour para Usuarios',
    description: 'Aprende a navegar y entender el sistema',
    totalSteps: 3,
    steps: [
      {
        id: 'queue-understanding',
        title: 'Entender la Cola de Turnos',
        description: 'Aprende a interpretar la información mostrada',
        content: {
          overview: 'La pantalla de turnos muestra toda la información que necesitas sobre el estado actual.',
          features: [
            'Estados de los turnos (Esperando, Llamando, En Atención)',
            'Tiempo estimado de espera',
            'Información de cubículos',
            'Progreso de la cola'
          ],
          tips: [
            'Los turnos en amarillo están siendo llamados',
            'Los turnos en verde están siendo atendidos',
            'El tiempo estimado se actualiza automáticamente'
          ],
          image: '/docs/screenshots/queue-display.png'
        },
        icon: FaEye,
        estimatedTime: '2 min',
        difficulty: 'Básico'
      },
      {
        id: 'status-interpretation',
        title: 'Interpretación de Estados',
        description: 'Comprende qué significa cada color y símbolo',
        content: {
          overview: 'Cada estado tiene un color y símbolo específico para facilitar la comprensión.',
          features: [
            '🟡 Esperando: Tu turno está en cola',
            '🔵 Llamando: Debes dirigirte al cubículo',
            '🟢 En Atención: Estás siendo atendido',
            '✅ Completado: Atención finalizada'
          ],
          tips: [
            'Mantente atento cuando tu turno esté en amarillo',
            'Si no te presentas en 3 llamados, irás al final',
            'Guarda tu número de turno hasta completar'
          ]
        },
        icon: FaLightbulb,
        estimatedTime: '2 min',
        difficulty: 'Básico'
      },
      {
        id: 'satisfaction-survey',
        title: 'Encuesta de Satisfacción',
        description: 'Ayúdanos a mejorar con tu opinión',
        content: {
          overview: 'Tu opinión es valiosa para mejorar continuamente nuestro servicio.',
          features: [
            'Calificación rápida del servicio',
            'Comentarios opcionales',
            'Sugerencias de mejora',
            'Contribución a la calidad'
          ],
          tips: [
            'Se honesto en tu calificación',
            'Los comentarios específicos son más útiles',
            'Tu opinión es completamente anónima'
          ]
        },
        icon: FaGraduationCap,
        estimatedTime: '1 min',
        difficulty: 'Básico'
      }
    ]
  }
};

const OnboardingTour = ({ isOpen, onClose, userRole = 'usuario' }) => {
  const toast = useToast();

  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [stepStartTime, setStepStartTime] = useState(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceCompleted, setPracticeCompleted] = useState(false);

  // Color mode values
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  // Get tour configuration for user role
  const tourConfig = tourSteps[userRole] || tourSteps.usuario;
  const step = tourConfig.steps[currentStep];
  const progress = ((currentStep + 1) / tourConfig.totalSteps) * 100;

  // Initialize tour
  useEffect(() => {
    if (isOpen && !startTime) {
      setStartTime(Date.now());
      setStepStartTime(Date.now());
      trackEvent('tour_start');
    }
  }, [isOpen]);

  // Track step change
  useEffect(() => {
    if (stepStartTime) {
      setStepStartTime(Date.now());
    }
  }, [currentStep]);

  // Track analytics event
  const trackEvent = async (eventType, metadata = {}) => {
    try {
      await fetch('/api/docs/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          userId: 'current-user-id', // Should come from auth context
          userRole,
          metadata: {
            step: currentStep,
            stepId: step?.id,
            totalSteps: tourConfig.totalSteps,
            ...metadata
          }
        })
      });
    } catch (error) {
      console.error('Failed to track tour event:', error);
    }
  };

  // Handle next step
  const handleNext = useCallback(() => {
    if (stepStartTime) {
      const stepDuration = Date.now() - stepStartTime;
      trackEvent('tour_step_complete', {
        stepDuration,
        stepId: step?.id,
        practiceCompleted
      });
    }

    if (currentStep < tourConfig.totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      setPracticeMode(false);
      setPracticeCompleted(false);
    } else {
      handleComplete();
    }
  }, [currentStep, tourConfig.totalSteps, stepStartTime, step?.id, practiceCompleted]);

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setPracticeMode(false);
      setPracticeCompleted(false);
      trackEvent('tour_step_back');
    }
  };

  // Handle skip
  const handleSkip = () => {
    trackEvent('tour_skip', { atStep: currentStep });
    handleClose();
  };

  // Handle completion
  const handleComplete = () => {
    const totalDuration = startTime ? Date.now() - startTime : 0;

    setIsCompleted(true);

    // Show confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    trackEvent('tour_complete', {
      totalDuration,
      completedSteps: currentStep + 1
    });

    // Mark as seen
    localStorage.setItem('docs-onboarding-seen', 'true');
    localStorage.setItem(`docs-onboarding-${userRole}-completed`, 'true');

    toast({
      title: '¡Tour completado!',
      description: 'Has completado exitosamente el tour de introducción',
      status: 'success',
      duration: 5000,
      isClosable: true
    });

    setTimeout(() => {
      handleClose();
    }, 3000);
  };

  // Handle close
  const handleClose = () => {
    if (startTime && !isCompleted) {
      const totalDuration = Date.now() - startTime;
      trackEvent('tour_exit', {
        totalDuration,
        completedSteps: currentStep,
        completionRate: (currentStep / tourConfig.totalSteps) * 100
      });
    }

    setCurrentStep(0);
    setIsCompleted(false);
    setStartTime(null);
    setStepStartTime(null);
    setPracticeMode(false);
    setPracticeCompleted(false);
    onClose();
  };

  // Handle practice mode
  const handlePracticeMode = () => {
    setPracticeMode(true);
    trackEvent('practice_mode_start', { stepId: step?.id });
  };

  // Handle practice completion
  const handlePracticeComplete = () => {
    setPracticeCompleted(true);
    setPracticeMode(false);
    trackEvent('practice_mode_complete', { stepId: step?.id });

    toast({
      title: '¡Práctica completada!',
      description: 'Has completado exitosamente la zona de práctica',
      status: 'success',
      duration: 3000
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'Escape':
          handleClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, handleNext]);

  if (!step) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="4xl" closeOnOverlayClick={false}>
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent bg={bg} maxH="90vh" overflowY="auto">
        {/* Header */}
        <ModalHeader p={6} pb={0}>
          <Flex justify="space-between" align="start">
            <VStack align="start" spacing={2}>
              <HStack>
                <step.icon color={accentColor} size="24px" />
                <Heading size="lg">{step.title}</Heading>
                <Badge colorScheme="blue">{step.difficulty}</Badge>
              </HStack>
              <Text color="gray.600">{step.description}</Text>
              <HStack>
                <Text fontSize="sm" color="gray.500">
                  Paso {currentStep + 1} de {tourConfig.totalSteps}
                </Text>
                <Text fontSize="sm" color="gray.500">•</Text>
                <Text fontSize="sm" color="gray.500">
                  {step.estimatedTime}
                </Text>
              </HStack>
            </VStack>
            <IconButton
              icon={<FaTimes />}
              variant="ghost"
              size="sm"
              onClick={handleClose}
              aria-label="Cerrar tour"
            />
          </Flex>

          {/* Progress bar */}
          <Box mt={4}>
            <Progress value={progress} colorScheme="blue" size="sm" borderRadius="full" />
          </Box>
        </ModalHeader>

        {/* Body */}
        <ModalBody p={6}>
          <AnimatePresence mode="wait">
            {!isCompleted ? (
              <MotionBox
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <VStack align="stretch" spacing={6}>
                  {/* Main content */}
                  <Box>
                    <Text fontSize="lg" mb={4}>
                      {step.content.overview}
                    </Text>

                    {/* Features list */}
                    {step.content.features && (
                      <Box mb={4}>
                        <Heading size="md" mb={3}>Características principales:</Heading>
                        <List spacing={2}>
                          {step.content.features.map((feature, index) => (
                            <ListItem key={index}>
                              <ListIcon as={FaCheckCircle} color="green.500" />
                              {feature}
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}

                    {/* Tips */}
                    {step.content.tips && (
                      <Alert status="info" borderRadius="md" mb={4}>
                        <AlertIcon as={FaLightbulb} />
                        <Box>
                          <AlertTitle>Consejos útiles:</AlertTitle>
                          <AlertDescription>
                            <List spacing={1} mt={2}>
                              {step.content.tips.map((tip, index) => (
                                <ListItem key={index} fontSize="sm">
                                  • {tip}
                                </ListItem>
                              ))}
                            </List>
                          </AlertDescription>
                        </Box>
                      </Alert>
                    )}

                    {/* Media content */}
                    {(step.content.image || step.content.video) && (
                      <Card mb={4}>
                        <CardBody>
                          {step.content.video && (
                            <Box mb={4}>
                              <Text fontWeight="bold" mb={2}>Video tutorial:</Text>
                              <video
                                controls
                                width="100%"
                                height="auto"
                                poster={step.content.image}
                              >
                                <source src={step.content.video} type="video/mp4" />
                                Tu navegador no soporta videos HTML5.
                              </video>
                            </Box>
                          )}

                          {step.content.image && !step.content.video && (
                            <Box>
                              <Text fontWeight="bold" mb={2}>Captura de pantalla:</Text>
                              <Image
                                src={step.content.image}
                                alt={step.title}
                                borderRadius="md"
                                w="100%"
                                fallback={
                                  <Box
                                    h="200px"
                                    bg="gray.100"
                                    borderRadius="md"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                  >
                                    <Text color="gray.500">Imagen no disponible</Text>
                                  </Box>
                                }
                              />
                            </Box>
                          )}
                        </CardBody>
                      </Card>
                    )}

                    {/* Practice zone */}
                    {step.content.practiceZone && (
                      <Card borderColor="orange.200" border="2px">
                        <CardBody>
                          <VStack align="stretch" spacing={4}>
                            <HStack>
                              <FaMousePointer color="orange.500" />
                              <Heading size="md" color="orange.600">
                                {step.content.practiceZone.title}
                              </Heading>
                            </HStack>

                            <Text>{step.content.practiceZone.description}</Text>

                            <List spacing={2}>
                              {step.content.practiceZone.steps.map((practiceStep, index) => (
                                <ListItem key={index}>
                                  <ListIcon as={practiceCompleted ? FaCheckCircle : FaMousePointer}
                                           color={practiceCompleted ? "green.500" : "orange.500"} />
                                  <Code fontSize="sm">{practiceStep}</Code>
                                </ListItem>
                              ))}
                            </List>

                            <HStack>
                              {!practiceMode && !practiceCompleted && (
                                <Button
                                  colorScheme="orange"
                                  onClick={handlePracticeMode}
                                  leftIcon={<FaPlay />}
                                >
                                  Iniciar Práctica
                                </Button>
                              )}

                              {practiceMode && (
                                <Button
                                  colorScheme="green"
                                  onClick={handlePracticeComplete}
                                  leftIcon={<FaCheckCircle />}
                                >
                                  Marcar como Completado
                                </Button>
                              )}

                              {practiceCompleted && (
                                <Badge colorScheme="green" p={2}>
                                  <FaCheckCircle /> Práctica Completada
                                </Badge>
                              )}
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    )}
                  </Box>
                </VStack>
              </MotionBox>
            ) : (
              <MotionBox
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                textAlign="center"
                py={8}
              >
                <VStack spacing={6}>
                  <Box fontSize="60px">🎉</Box>
                  <Heading size="xl" color={accentColor}>
                    ¡Felicitaciones!
                  </Heading>
                  <Text fontSize="lg">
                    Has completado exitosamente el tour de {tourConfig.title}
                  </Text>
                  <Text color="gray.600">
                    Ahora estás listo para usar todas las funciones del sistema TomaTurno
                  </Text>
                  <HStack spacing={4}>
                    <Button colorScheme="blue" onClick={() => window.location.href = '/docs'}>
                      Ir a Documentación
                    </Button>
                    <Button variant="outline" onClick={handleClose}>
                      Comenzar a Usar
                    </Button>
                  </HStack>
                </VStack>
              </MotionBox>
            )}
          </AnimatePresence>
        </ModalBody>

        {/* Footer */}
        {!isCompleted && (
          <ModalFooter p={6} pt={0}>
            <Flex justify="space-between" w="100%">
              <HStack>
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  size="sm"
                >
                  Saltar Tour
                </Button>

                <Text fontSize="sm" color="gray.500">
                  Usa ← → o barra espaciadora para navegar
                </Text>
              </HStack>

              <HStack>
                <Button
                  leftIcon={<FaArrowLeft />}
                  onClick={handlePrevious}
                  isDisabled={currentStep === 0}
                  variant="ghost"
                >
                  Anterior
                </Button>

                <Button
                  rightIcon={<FaArrowRight />}
                  onClick={handleNext}
                  colorScheme="blue"
                >
                  {currentStep === tourConfig.totalSteps - 1 ? 'Finalizar' : 'Siguiente'}
                </Button>
              </HStack>
            </Flex>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default OnboardingTour;