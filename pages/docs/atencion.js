import React, { useState } from 'react';
import {
  ChakraProvider,
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Badge,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  List,
  ListItem,
  ListIcon,
  Code,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Icon,
  Circle,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useToast,
  Tooltip
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { motion } from 'framer-motion';
import {
  FaUserMd,
  FaClipboardCheck,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowRight,
  FaPlay,
  FaPause,
  FaStop,
  FaBell,
  FaHistory,
  FaChartLine,
  FaMicrophone,
  FaDesktop,
  FaHandPaper,
  FaUsers,
  FaDoorOpen,
  FaFileAlt,
  FaLightbulb,
  FaKey,
  FaShieldAlt,
  FaStethoscope,
  FaSyringe,
  FaHospitalUser,
  FaVideo,
  FaQuestionCircle
} from 'react-icons/fa';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { modernTheme, GlassCard, ModernContainer } from '../../components/theme/ModernTheme';
import ProtectedRoute from '../../components/ProtectedRoute';

// Animaciones
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const MotionBox = motion(Box);

const AttentionDocumentation = () => {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [selectedStep, setSelectedStep] = useState(null);
  const [activeScenario, setActiveScenario] = useState(0);

  // Flujo de atención paso a paso
  const attentionFlow = [
    {
      id: 1,
      title: 'Selección de Cubículo',
      icon: FaDoorOpen,
      color: 'blue',
      description: 'Selecciona tu cubículo de trabajo al inicio del turno',
      details: [
        'Verifica la disponibilidad del cubículo',
        'Selecciona entre cubículo GENERAL o ESPECIAL',
        'El sistema recordará tu selección durante todo el turno',
        'Puedes cambiar de cubículo en cualquier momento'
      ],
      code: `// Ejemplo de selección de cubículo
const selectCubicle = async (cubiculoId, tipo) => {
  const response = await fetch('/api/cubicles/select', {
    method: 'POST',
    body: JSON.stringify({
      cubiculoId,
      tipo, // "GENERAL" o "ESPECIAL"
      userId: currentUser.id
    })
  });
  return response.json();
};`,
      warnings: [
        'No selecciones un cubículo ya ocupado',
        'Verifica que el tipo de cubículo sea apropiado para tu función'
      ]
    },
    {
      id: 2,
      title: 'Llamar Paciente',
      icon: FaMicrophone,
      color: 'green',
      description: 'Llama al siguiente paciente en la cola de espera',
      details: [
        'Haz clic en el botón "Llamar Siguiente"',
        'El sistema anunciará automáticamente por altavoz',
        'Se mostrará la información del paciente en pantalla',
        'El paciente será notificado en la sala de espera'
      ],
      code: `// Llamar al siguiente paciente
const callNextPatient = async () => {
  const response = await fetch('/api/attention/call-next', {
    method: 'POST',
    body: JSON.stringify({
      cubiculoId: currentCubicle.id,
      phlebotomistId: currentUser.id
    })
  });

  const data = await response.json();
  // data.patient contiene la información del paciente llamado
  announcePatient(data.patient);
  return data;
};`,
      tips: [
        'Espera 30 segundos antes de volver a llamar',
        'Verifica que el paciente anterior haya sido atendido'
      ]
    },
    {
      id: 3,
      title: 'Atender Paciente',
      icon: FaStethoscope,
      color: 'purple',
      description: 'Registra el inicio de la atención del paciente',
      details: [
        'Confirma la identidad del paciente',
        'Marca el inicio de la atención',
        'El temporizador comenzará automáticamente',
        'El sistema registrará la hora exacta'
      ],
      code: `// Iniciar atención del paciente
const startAttention = async (turnId) => {
  const response = await fetch('/api/attention/start', {
    method: 'POST',
    body: JSON.stringify({
      turnId,
      startTime: new Date().toISOString(),
      status: 'attending'
    })
  });
  return response.json();
};`,
      bestPractices: [
        'Verifica los datos del paciente antes de comenzar',
        'Asegúrate de tener todos los materiales necesarios',
        'Informa al paciente sobre el procedimiento'
      ]
    },
    {
      id: 4,
      title: 'Finalizar Atención',
      icon: FaClipboardCheck,
      color: 'orange',
      description: 'Completa y registra la atención del paciente',
      details: [
        'Marca la atención como completada',
        'El sistema calculará el tiempo total',
        'Se actualizarán las estadísticas automáticamente',
        'El cubículo quedará disponible para el siguiente paciente'
      ],
      code: `// Finalizar atención
const finishAttention = async (turnId) => {
  const response = await fetch('/api/attention/finish', {
    method: 'POST',
    body: JSON.stringify({
      turnId,
      endTime: new Date().toISOString(),
      status: 'completed',
      observations: 'Atención completada exitosamente'
    })
  });

  // Actualizar estadísticas
  updateStatistics();
  return response.json();
};`,
      metrics: [
        'Tiempo promedio de atención: 5-7 minutos',
        'Pacientes atendidos por hora: 8-10',
        'Tasa de satisfacción objetivo: >95%'
      ]
    },
    {
      id: 5,
      title: 'No Presentado',
      icon: FaExclamationTriangle,
      color: 'red',
      description: 'Manejo de pacientes que no se presentan',
      details: [
        'Espera el tiempo reglamentario (2 minutos)',
        'Marca al paciente como "No Presentado"',
        'El sistema liberará el turno automáticamente',
        'Procede con el siguiente paciente'
      ],
      code: `// Marcar paciente como no presentado
const markNoShow = async (turnId) => {
  const response = await fetch('/api/attention/no-show', {
    method: 'POST',
    body: JSON.stringify({
      turnId,
      status: 'no_show',
      waitTime: 120, // segundos esperados
      timestamp: new Date().toISOString()
    })
  });
  return response.json();
};`,
      protocol: [
        'Llama al paciente 3 veces',
        'Espera 2 minutos entre llamadas',
        'Documenta la hora de cada llamada',
        'Procede con el siguiente después del tercer llamado'
      ]
    }
  ];

  // Escenarios comunes
  const commonScenarios = [
    {
      title: 'Paciente Prioritario',
      icon: FaShieldAlt,
      situation: 'Llega un paciente con prioridad alta (adulto mayor, embarazada, discapacidad)',
      actions: [
        'Identificar la prioridad del paciente',
        'Usar el filtro de pacientes prioritarios',
        'Llamar inmediatamente sin importar el orden',
        'Registrar el motivo de la prioridad'
      ],
      code: `// Atender paciente prioritario
const attendPriorityPatient = async () => {
  const priorityPatients = await getPriorityPatients();
  if (priorityPatients.length > 0) {
    await callPatient(priorityPatients[0].id);
  }
};`
    },
    {
      title: 'Múltiples Llamadas',
      icon: FaBell,
      situation: 'El paciente no responde al primer llamado',
      actions: [
        'Esperar 30 segundos',
        'Realizar segundo llamado',
        'Esperar otros 30 segundos',
        'Tercer y último llamado',
        'Marcar como no presentado si no responde'
      ],
      code: `// Sistema de múltiples llamadas
const multipleCallSystem = async (patientId, attempt = 1) => {
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
    },
    {
      title: 'Cambio de Cubículo',
      icon: FaDoorOpen,
      situation: 'Necesitas cambiar de cubículo durante el turno',
      actions: [
        'Finalizar cualquier atención en curso',
        'Liberar el cubículo actual',
        'Seleccionar el nuevo cubículo',
        'Continuar con la atención normal'
      ],
      code: `// Cambiar de cubículo
const changeCubicle = async (newCubicleId) => {
  await releaseCubicle(currentCubicle.id);
  await selectCubicle(newCubicleId);
  updateInterface();
};`
    }
  ];

  // Estadísticas clave
  const keyMetrics = [
    {
      label: 'Tiempo Promedio',
      value: '6:30',
      unit: 'min',
      icon: FaClock,
      color: 'blue',
      description: 'Tiempo promedio de atención por paciente'
    },
    {
      label: 'Pacientes/Hora',
      value: '9.2',
      unit: 'pac',
      icon: FaUsers,
      color: 'green',
      description: 'Promedio de pacientes atendidos por hora'
    },
    {
      label: 'Tasa de Presentación',
      value: '94%',
      unit: '',
      icon: FaCheckCircle,
      color: 'purple',
      description: 'Porcentaje de pacientes que se presentan'
    },
    {
      label: 'Satisfacción',
      value: '4.7',
      unit: '/5',
      icon: FaChartLine,
      color: 'orange',
      description: 'Calificación promedio de satisfacción'
    }
  ];

  // Atajos de teclado
  const keyboardShortcuts = [
    { key: 'F1', action: 'Llamar siguiente paciente', icon: FaMicrophone },
    { key: 'F2', action: 'Iniciar atención', icon: FaPlay },
    { key: 'F3', action: 'Finalizar atención', icon: FaStop },
    { key: 'F4', action: 'Marcar no presentado', icon: FaExclamationTriangle },
    { key: 'F5', action: 'Ver cola de espera', icon: FaUsers },
    { key: 'F6', action: 'Cambiar cubículo', icon: FaDoorOpen },
    { key: 'ESC', action: 'Cancelar operación', icon: FaHandPaper }
  ];

  const handleStepClick = (step) => {
    setSelectedStep(step);
    toast({
      title: `Paso: ${step.title}`,
      description: step.description,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleScenarioChange = (index) => {
    setActiveScenario(index);
  };

  return (
    <ChakraProvider theme={modernTheme}>
      <ProtectedRoute>
        <ModernContainer>
          <VStack spacing={8} align="stretch">
            {/* Header */}
            <GlassCard
              p={8}
              textAlign="center"
              animation={`${fadeInUp} 0.6s ease-out`}
            >
              <VStack spacing={4}>
                <Circle size="80px" bg="purple.500" color="white">
                  <Icon as={FaUserMd} boxSize="40px" />
                </Circle>
                <Heading
                  size="2xl"
                  bgGradient="linear(to-r, purple.400, blue.600)"
                  bgClip="text"
                >
                  Módulo de Atención
                </Heading>
                <Text fontSize="lg" color="gray.600" maxW="600px">
                  Guía completa para el proceso de atención de pacientes, desde el llamado
                  hasta el registro final, con mejores prácticas y protocolos.
                </Text>

                {/* Quick Stats */}
                <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} w="full" mt={4}>
                  {keyMetrics.map((metric, index) => (
                    <Box
                      key={metric.label}
                      p={4}
                      bg="rgba(255, 255, 255, 0.1)"
                      borderRadius="xl"
                      backdropFilter="blur(10px)"
                      border="1px solid rgba(255, 255, 255, 0.2)"
                      animation={`${slideIn} ${0.4 + index * 0.1}s ease-out`}
                    >
                      <VStack spacing={1}>
                        <Icon as={metric.icon} color={`${metric.color}.500`} boxSize="24px" />
                        <Text fontSize="2xl" fontWeight="bold">
                          {metric.value}{metric.unit}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {metric.label}
                        </Text>
                      </VStack>
                    </Box>
                  ))}
                </SimpleGrid>
              </VStack>
            </GlassCard>

            {/* Navigation Tabs */}
            <Tabs variant="enclosed">
              <TabList>
                <Tab>
                  <HStack>
                    <FaClipboardCheck />
                    <Text>Flujo de Trabajo</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <FaLightbulb />
                    <Text>Escenarios Comunes</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <FaKey />
                    <Text>Atajos y Comandos</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <FaShieldAlt />
                    <Text>Mejores Prácticas</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                {/* Flujo de Trabajo Tab */}
                <TabPanel px={0}>
                  <VStack spacing={6} align="stretch">
                    {/* Visual Flow */}
                    <GlassCard p={6} animation={`${fadeInUp} 0.7s ease-out`}>
                      <Heading size="md" mb={4}>
                        Flujo de Atención Paso a Paso
                      </Heading>

                      <Flex
                        direction={{ base: 'column', lg: 'row' }}
                        justify="space-between"
                        align="center"
                        mb={6}
                        gap={4}
                      >
                        {attentionFlow.map((step, index) => (
                          <VStack
                            key={step.id}
                            spacing={2}
                            cursor="pointer"
                            onClick={() => handleStepClick(step)}
                            opacity={selectedStep?.id === step.id ? 1 : 0.7}
                            transform={selectedStep?.id === step.id ? 'scale(1.05)' : 'scale(1)'}
                            transition="all 0.3s"
                            animation={`${slideIn} ${0.5 + index * 0.1}s ease-out`}
                          >
                            <Circle
                              size="60px"
                              bg={`${step.color}.500`}
                              color="white"
                              _hover={{ transform: 'scale(1.1)' }}
                              transition="transform 0.2s"
                            >
                              <Icon as={step.icon} boxSize="30px" />
                            </Circle>
                            <Text fontSize="sm" fontWeight="bold" textAlign="center">
                              {step.title}
                            </Text>
                            {index < attentionFlow.length - 1 && (
                              <Icon
                                as={FaArrowRight}
                                color="gray.400"
                                display={{ base: 'none', lg: 'block' }}
                                position="absolute"
                                right="-20px"
                                top="30px"
                              />
                            )}
                          </VStack>
                        ))}
                      </Flex>

                      {selectedStep && (
                        <MotionBox
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Divider my={4} />

                          <VStack align="stretch" spacing={4}>
                            <Box>
                              <Heading size="sm" mb={2}>
                                {selectedStep.title}
                              </Heading>
                              <Text color="gray.600">
                                {selectedStep.description}
                              </Text>
                            </Box>

                            <Box>
                              <Text fontWeight="bold" mb={2}>Pasos a seguir:</Text>
                              <List spacing={2}>
                                {selectedStep.details.map((detail, i) => (
                                  <ListItem key={i}>
                                    <ListIcon as={FaCheckCircle} color="green.500" />
                                    {detail}
                                  </ListItem>
                                ))}
                              </List>
                            </Box>

                            {selectedStep.code && (
                              <Box>
                                <Text fontWeight="bold" mb={2}>Código de ejemplo:</Text>
                                <Box
                                  as="pre"
                                  p={4}
                                  bg="gray.900"
                                  color="white"
                                  borderRadius="md"
                                  overflowX="auto"
                                  fontSize="sm"
                                >
                                  <Code colorScheme="purple" bg="transparent" color="inherit">
                                    {selectedStep.code}
                                  </Code>
                                </Box>
                              </Box>
                            )}

                            {selectedStep.warnings && (
                              <Alert status="warning" borderRadius="md">
                                <AlertIcon />
                                <Box>
                                  <AlertTitle>Precauciones:</AlertTitle>
                                  <List spacing={1} mt={2}>
                                    {selectedStep.warnings.map((warning, i) => (
                                      <ListItem key={i} fontSize="sm">
                                        • {warning}
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>
                              </Alert>
                            )}

                            {selectedStep.tips && (
                              <Alert status="info" borderRadius="md">
                                <AlertIcon as={FaLightbulb} />
                                <Box>
                                  <AlertTitle>Consejos:</AlertTitle>
                                  <List spacing={1} mt={2}>
                                    {selectedStep.tips.map((tip, i) => (
                                      <ListItem key={i} fontSize="sm">
                                        • {tip}
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>
                              </Alert>
                            )}
                          </VStack>
                        </MotionBox>
                      )}
                    </GlassCard>

                    {/* Detailed Steps */}
                    <GlassCard p={6} animation={`${fadeInUp} 0.8s ease-out`}>
                      <Heading size="md" mb={4}>
                        Descripción Detallada del Proceso
                      </Heading>

                      <Accordion allowMultiple>
                        {attentionFlow.map((step) => (
                          <AccordionItem key={step.id}>
                            <h2>
                              <AccordionButton>
                                <Box flex="1" textAlign="left">
                                  <HStack>
                                    <Icon as={step.icon} color={`${step.color}.500`} />
                                    <Text fontWeight="bold">{step.title}</Text>
                                  </HStack>
                                </Box>
                                <AccordionIcon />
                              </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                              <VStack align="stretch" spacing={3}>
                                <Text>{step.description}</Text>

                                <Box>
                                  <Text fontWeight="semibold" mb={1}>Detalles:</Text>
                                  <List spacing={1}>
                                    {step.details.map((detail, i) => (
                                      <ListItem key={i} fontSize="sm">
                                        <ListIcon as={FaCheckCircle} color="green.500" />
                                        {detail}
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>

                                {step.bestPractices && (
                                  <Box>
                                    <Text fontWeight="semibold" mb={1}>Mejores Prácticas:</Text>
                                    <List spacing={1}>
                                      {step.bestPractices.map((practice, i) => (
                                        <ListItem key={i} fontSize="sm">
                                          <ListIcon as={FaLightbulb} color="yellow.500" />
                                          {practice}
                                        </ListItem>
                                      ))}
                                    </List>
                                  </Box>
                                )}

                                {step.metrics && (
                                  <Box>
                                    <Text fontWeight="semibold" mb={1}>Métricas Objetivo:</Text>
                                    <List spacing={1}>
                                      {step.metrics.map((metric, i) => (
                                        <ListItem key={i} fontSize="sm">
                                          <ListIcon as={FaChartLine} color="blue.500" />
                                          {metric}
                                        </ListItem>
                                      ))}
                                    </List>
                                  </Box>
                                )}

                                {step.protocol && (
                                  <Box>
                                    <Text fontWeight="semibold" mb={1}>Protocolo:</Text>
                                    <List spacing={1}>
                                      {step.protocol.map((item, i) => (
                                        <ListItem key={i} fontSize="sm">
                                          <ListIcon as={FaClipboardCheck} color="purple.500" />
                                          {item}
                                        </ListItem>
                                      ))}
                                    </List>
                                  </Box>
                                )}
                              </VStack>
                            </AccordionPanel>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </GlassCard>
                  </VStack>
                </TabPanel>

                {/* Escenarios Comunes Tab */}
                <TabPanel px={0}>
                  <VStack spacing={6} align="stretch">
                    <GlassCard p={6} animation={`${fadeInUp} 0.7s ease-out`}>
                      <Heading size="md" mb={4}>
                        Manejo de Situaciones Especiales
                      </Heading>

                      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mb={6}>
                        {commonScenarios.map((scenario, index) => (
                          <Box
                            key={index}
                            p={4}
                            bg={activeScenario === index ? 'purple.50' : 'transparent'}
                            borderRadius="lg"
                            border="2px solid"
                            borderColor={activeScenario === index ? 'purple.500' : 'gray.200'}
                            cursor="pointer"
                            onClick={() => handleScenarioChange(index)}
                            transition="all 0.3s"
                            _hover={{
                              borderColor: 'purple.400',
                              transform: 'translateY(-2px)'
                            }}
                          >
                            <VStack spacing={2}>
                              <Icon as={scenario.icon} boxSize="30px" color="purple.500" />
                              <Text fontWeight="bold" textAlign="center">
                                {scenario.title}
                              </Text>
                            </VStack>
                          </Box>
                        ))}
                      </SimpleGrid>

                      {commonScenarios[activeScenario] && (
                        <MotionBox
                          key={activeScenario}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <VStack align="stretch" spacing={4}>
                            <Alert status="info" borderRadius="md">
                              <AlertIcon />
                              <Box>
                                <AlertTitle>Situación:</AlertTitle>
                                <AlertDescription>
                                  {commonScenarios[activeScenario].situation}
                                </AlertDescription>
                              </Box>
                            </Alert>

                            <Box>
                              <Text fontWeight="bold" mb={2}>Acciones a Tomar:</Text>
                              <List spacing={2}>
                                {commonScenarios[activeScenario].actions.map((action, i) => (
                                  <ListItem key={i}>
                                    <ListIcon as={FaCheckCircle} color="green.500" />
                                    {action}
                                  </ListItem>
                                ))}
                              </List>
                            </Box>

                            <Box>
                              <Text fontWeight="bold" mb={2}>Implementación:</Text>
                              <Box
                                as="pre"
                                p={4}
                                bg="gray.900"
                                color="white"
                                borderRadius="md"
                                overflowX="auto"
                                fontSize="sm"
                              >
                                <Code colorScheme="purple" bg="transparent" color="inherit">
                                  {commonScenarios[activeScenario].code}
                                </Code>
                              </Box>
                            </Box>
                          </VStack>
                        </MotionBox>
                      )}
                    </GlassCard>

                    {/* Casos de Uso Específicos */}
                    <GlassCard p={6} animation={`${fadeInUp} 0.8s ease-out`}>
                      <Heading size="md" mb={4}>
                        Casos de Uso Específicos
                      </Heading>

                      <Accordion allowToggle>
                        <AccordionItem>
                          <h2>
                            <AccordionButton>
                              <Box flex="1" textAlign="left">
                                <HStack>
                                  <Icon as={FaSyringe} color="red.500" />
                                  <Text fontWeight="bold">Paciente Nervioso o con Fobia</Text>
                                </HStack>
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={4}>
                            <VStack align="stretch" spacing={3}>
                              <Text>
                                Manejo especializado para pacientes con ansiedad o fobia a las agujas.
                              </Text>
                              <List spacing={2}>
                                <ListItem>
                                  <ListIcon as={FaCheckCircle} color="green.500" />
                                  Hablar con voz calmada y tranquilizadora
                                </ListItem>
                                <ListItem>
                                  <ListIcon as={FaCheckCircle} color="green.500" />
                                  Explicar el procedimiento paso a paso
                                </ListItem>
                                <ListItem>
                                  <ListIcon as={FaCheckCircle} color="green.500" />
                                  Permitir que el paciente tome su tiempo
                                </ListItem>
                                <ListItem>
                                  <ListIcon as={FaCheckCircle} color="green.500" />
                                  Ofrecer técnicas de respiración
                                </ListItem>
                                <ListItem>
                                  <ListIcon as={FaCheckCircle} color="green.500" />
                                  Si es necesario, permitir acompañante
                                </ListItem>
                              </List>
                            </VStack>
                          </AccordionPanel>
                        </AccordionItem>

                        <AccordionItem>
                          <h2>
                            <AccordionButton>
                              <Box flex="1" textAlign="left">
                                <HStack>
                                  <Icon as={FaHospitalUser} color="blue.500" />
                                  <Text fontWeight="bold">Paciente Pediátrico</Text>
                                </HStack>
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={4}>
                            <VStack align="stretch" spacing={3}>
                              <Text>
                                Protocolo especial para la atención de niños y bebés.
                              </Text>
                              <List spacing={2}>
                                <ListItem>
                                  <ListIcon as={FaCheckCircle} color="green.500" />
                                  Ambiente amigable y menos clínico
                                </ListItem>
                                <ListItem>
                                  <ListIcon as={FaCheckCircle} color="green.500" />
                                  Uso de distracciones (juguetes, stickers)
                                </ListItem>
                                <ListItem>
                                  <ListIcon as={FaCheckCircle} color="green.500" />
                                  Comunicación apropiada para la edad
                                </ListItem>
                                <ListItem>
                                  <ListIcon as={FaCheckCircle} color="green.500" />
                                  Trabajo rápido pero cuidadoso
                                </ListItem>
                                <ListItem>
                                  <ListIcon as={FaCheckCircle} color="green.500" />
                                  Involucrar a los padres en el proceso
                                </ListItem>
                              </List>
                            </VStack>
                          </AccordionPanel>
                        </AccordionItem>

                        <AccordionItem>
                          <h2>
                            <AccordionButton>
                              <Box flex="1" textAlign="left">
                                <HStack>
                                  <Icon as={FaExclamationTriangle} color="yellow.500" />
                                  <Text fontWeight="bold">Emergencia Médica</Text>
                                </HStack>
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={4}>
                            <VStack align="stretch" spacing={3}>
                              <Alert status="error" mb={3}>
                                <AlertIcon />
                                En caso de emergencia, la seguridad del paciente es prioritaria
                              </Alert>
                              <List spacing={2}>
                                <ListItem>
                                  <ListIcon as={FaExclamationTriangle} color="red.500" />
                                  Detener inmediatamente el procedimiento
                                </ListItem>
                                <ListItem>
                                  <ListIcon as={FaExclamationTriangle} color="red.500" />
                                  Llamar al médico de turno o emergencias
                                </ListItem>
                                <ListItem>
                                  <ListIcon as={FaExclamationTriangle} color="red.500" />
                                  Mantener al paciente cómodo y monitorizado
                                </ListItem>
                                <ListItem>
                                  <ListIcon as={FaExclamationTriangle} color="red.500" />
                                  Documentar el incidente detalladamente
                                </ListItem>
                                <ListItem>
                                  <ListIcon as={FaExclamationTriangle} color="red.500" />
                                  Seguir protocolo de emergencia del hospital
                                </ListItem>
                              </List>
                            </VStack>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    </GlassCard>
                  </VStack>
                </TabPanel>

                {/* Atajos y Comandos Tab */}
                <TabPanel px={0}>
                  <VStack spacing={6} align="stretch">
                    <GlassCard p={6} animation={`${fadeInUp} 0.7s ease-out`}>
                      <Heading size="md" mb={4}>
                        Atajos de Teclado
                      </Heading>

                      <Alert status="info" mb={4}>
                        <AlertIcon />
                        <Text fontSize="sm">
                          Los atajos de teclado te permiten trabajar más eficientemente.
                          Memoriza los más importantes para agilizar tu flujo de trabajo.
                        </Text>
                      </Alert>

                      <TableContainer>
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Tecla</Th>
                              <Th>Acción</Th>
                              <Th>Icono</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {keyboardShortcuts.map((shortcut) => (
                              <Tr key={shortcut.key}>
                                <Td>
                                  <Badge colorScheme="purple" fontSize="md" p={2}>
                                    {shortcut.key}
                                  </Badge>
                                </Td>
                                <Td>{shortcut.action}</Td>
                                <Td>
                                  <Icon as={shortcut.icon} color="purple.500" boxSize="20px" />
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </GlassCard>

                    <GlassCard p={6} animation={`${fadeInUp} 0.8s ease-out`}>
                      <Heading size="md" mb={4}>
                        Comandos del Sistema
                      </Heading>

                      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                        <Box>
                          <Text fontWeight="bold" mb={3}>Comandos de Atención</Text>
                          <List spacing={2}>
                            <ListItem>
                              <Code colorScheme="blue">/llamar</Code> - Llama al siguiente paciente
                            </ListItem>
                            <ListItem>
                              <Code colorScheme="blue">/atender ID</Code> - Inicia atención de paciente específico
                            </ListItem>
                            <ListItem>
                              <Code colorScheme="blue">/finalizar</Code> - Termina la atención actual
                            </ListItem>
                            <ListItem>
                              <Code colorScheme="blue">/ausente</Code> - Marca paciente como no presentado
                            </ListItem>
                          </List>
                        </Box>

                        <Box>
                          <Text fontWeight="bold" mb={3}>Comandos de Consulta</Text>
                          <List spacing={2}>
                            <ListItem>
                              <Code colorScheme="green">/cola</Code> - Ver cola de espera
                            </ListItem>
                            <ListItem>
                              <Code colorScheme="green">/stats</Code> - Ver estadísticas del día
                            </ListItem>
                            <ListItem>
                              <Code colorScheme="green">/historial</Code> - Ver últimos pacientes
                            </ListItem>
                            <ListItem>
                              <Code colorScheme="green">/buscar NOMBRE</Code> - Buscar paciente
                            </ListItem>
                          </List>
                        </Box>

                        <Box>
                          <Text fontWeight="bold" mb={3}>Comandos de Configuración</Text>
                          <List spacing={2}>
                            <ListItem>
                              <Code colorScheme="purple">/cubiculo ID</Code> - Cambiar de cubículo
                            </ListItem>
                            <ListItem>
                              <Code colorScheme="purple">/pausa</Code> - Activar pausa temporal
                            </ListItem>
                            <ListItem>
                              <Code colorScheme="purple">/sonido on/off</Code> - Activar/desactivar sonidos
                            </ListItem>
                            <ListItem>
                              <Code colorScheme="purple">/modo noche</Code> - Cambiar tema visual
                            </ListItem>
                          </List>
                        </Box>

                        <Box>
                          <Text fontWeight="bold" mb={3}>Comandos de Ayuda</Text>
                          <List spacing={2}>
                            <ListItem>
                              <Code colorScheme="orange">/ayuda</Code> - Mostrar ayuda general
                            </ListItem>
                            <ListItem>
                              <Code colorScheme="orange">/protocolo</Code> - Ver protocolos
                            </ListItem>
                            <ListItem>
                              <Code colorScheme="orange">/soporte</Code> - Contactar soporte técnico
                            </ListItem>
                            <ListItem>
                              <Code colorScheme="orange">/version</Code> - Ver versión del sistema
                            </ListItem>
                          </List>
                        </Box>
                      </SimpleGrid>
                    </GlassCard>
                  </VStack>
                </TabPanel>

                {/* Mejores Prácticas Tab */}
                <TabPanel px={0}>
                  <VStack spacing={6} align="stretch">
                    <GlassCard p={6} animation={`${fadeInUp} 0.7s ease-out`}>
                      <Heading size="md" mb={4}>
                        Guías de Excelencia en Atención
                      </Heading>

                      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                        <Box>
                          <VStack align="stretch" spacing={4}>
                            <Box>
                              <HStack mb={3}>
                                <Icon as={FaUserMd} color="blue.500" boxSize="24px" />
                                <Text fontWeight="bold" fontSize="lg">Profesionalismo</Text>
                              </HStack>
                              <List spacing={2}>
                                <ListItem fontSize="sm">
                                  <ListIcon as={FaCheckCircle} color="green.500" />
                                  Mantener siempre una actitud profesional y empática
                                </ListItem>
                                <ListItem fontSize="sm">
                                  <ListIcon as={FaCheckCircle} color="green.500" />
                                  Vestimenta adecuada y presentación impecable
                                </ListItem>
                                <ListItem fontSize="sm">
                                  <ListIcon as={FaCheckCircle} color="green.500" />
                                  Comunicación clara y respetuosa
                                </ListItem>
                                <ListItem fontSize="sm">
                                  <ListIcon as={FaCheckCircle} color="green.500" />
                                  Confidencialidad absoluta de información
                                </ListItem>
                              </List>
                            </Box>

                            <Box>
                              <HStack mb={3}>
                                <Icon as={FaClock} color="purple.500" boxSize="24px" />
                                <Text fontWeight="bold" fontSize="lg">Gestión del Tiempo</Text>
                              </HStack>
                              <List spacing={2}>
                                <ListItem fontSize="sm">
                                  <ListIcon as={FaCheckCircle} color="green.500" />
                                  Preparar materiales antes de llamar al paciente
                                </ListItem>
                                <ListItem fontSize="sm">
                                  <ListIcon as={FaCheckCircle} color="green.500" />
                                  Mantener un ritmo constante sin apresurarse
                                </ListItem>
                                <ListItem fontSize="sm">
                                  <ListIcon as={FaCheckCircle} color="green.500" />
                                  Documentar mientras se atiende
                                </ListItem>
                                <ListItem fontSize="sm">
                                  <ListIcon as={FaCheckCircle} color="green.500" />
                                  Optimizar tiempos muertos entre pacientes
                                </ListItem>
                              </List>
                            </Box>
                          </VStack>
                        </Box>

                        <Box>
                          <VStack align="stretch" spacing={4}>
                            <Box>
                              <HStack mb={3}>
                                <Icon as={FaHospitalUser} color="green.500" boxSize="24px" />
                                <Text fontWeight="bold" fontSize="lg">Atención al Paciente</Text>
                              </HStack>
                              <List spacing={2}>
                                <ListItem fontSize="sm">
                                  <ListIcon as={FaCheckCircle} color="green.500" />
                                  Saludar cordialmente y presentarse
                                </ListItem>
                                <ListItem fontSize="sm">
                                  <ListIcon as={FaCheckCircle} color="green.500" />
                                  Verificar identidad del paciente siempre
                                </ListItem>
                                <ListItem fontSize="sm">
                                  <ListIcon as={FaCheckCircle} color="green.500" />
                                  Explicar el procedimiento claramente
                                </ListItem>
                                <ListItem fontSize="sm">
                                  <ListIcon as={FaCheckCircle} color="green.500" />
                                  Despedirse amablemente y orientar siguiente paso
                                </ListItem>
                              </List>
                            </Box>

                            <Box>
                              <HStack mb={3}>
                                <Icon as={FaShieldAlt} color="orange.500" boxSize="24px" />
                                <Text fontWeight="bold" fontSize="lg">Seguridad y Calidad</Text>
                              </HStack>
                              <List spacing={2}>
                                <ListItem fontSize="sm">
                                  <ListIcon as={FaCheckCircle} color="green.500" />
                                  Seguir protocolos de bioseguridad siempre
                                </ListItem>
                                <ListItem fontSize="sm">
                                  <ListIcon as={FaCheckCircle} color="green.500" />
                                  Verificar órdenes médicas correctamente
                                </ListItem>
                                <ListItem fontSize="sm">
                                  <ListIcon as={FaCheckCircle} color="green.500" />
                                  Etiquetar muestras inmediatamente
                                </ListItem>
                                <ListItem fontSize="sm">
                                  <ListIcon as={FaCheckCircle} color="green.500" />
                                  Reportar incidentes sin demora
                                </ListItem>
                              </List>
                            </Box>
                          </VStack>
                        </Box>
                      </SimpleGrid>
                    </GlassCard>

                    <GlassCard p={6} animation={`${fadeInUp} 0.8s ease-out`}>
                      <Heading size="md" mb={4}>
                        Indicadores de Rendimiento
                      </Heading>

                      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
                        <Stat>
                          <StatLabel>Tiempo Promedio</StatLabel>
                          <StatNumber>5-7 min</StatNumber>
                          <StatHelpText>
                            <Progress value={75} colorScheme="green" size="xs" />
                            Óptimo
                          </StatHelpText>
                        </Stat>

                        <Stat>
                          <StatLabel>Pacientes/Hora</StatLabel>
                          <StatNumber>8-10</StatNumber>
                          <StatHelpText>
                            <Progress value={85} colorScheme="blue" size="xs" />
                            Excelente
                          </StatHelpText>
                        </Stat>

                        <Stat>
                          <StatLabel>Satisfacción</StatLabel>
                          <StatNumber>&gt;95%</StatNumber>
                          <StatHelpText>
                            <Progress value={95} colorScheme="purple" size="xs" />
                            Meta
                          </StatHelpText>
                        </Stat>

                        <Stat>
                          <StatLabel>Incidencias</StatLabel>
                          <StatNumber>&lt;2%</StatNumber>
                          <StatHelpText>
                            <Progress value={10} colorScheme="orange" size="xs" />
                            Aceptable
                          </StatHelpText>
                        </Stat>
                      </SimpleGrid>

                      <Divider my={6} />

                      <Alert status="success">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>Recuerda:</AlertTitle>
                          <AlertDescription>
                            La excelencia en la atención no solo se mide en números, sino en la
                            satisfacción y confianza que generamos en cada paciente. Cada interacción
                            es una oportunidad para marcar la diferencia.
                          </AlertDescription>
                        </Box>
                      </Alert>
                    </GlassCard>

                    <GlassCard p={6} animation={`${fadeInUp} 0.9s ease-out`}>
                      <Heading size="md" mb={4}>
                        Recursos de Apoyo
                      </Heading>

                      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                        <Button
                          leftIcon={<FaFileAlt />}
                          colorScheme="blue"
                          variant="outline"
                          size="lg"
                          onClick={() => router.push('/docs/protocolos')}
                        >
                          Protocolos Completos
                        </Button>

                        <Button
                          leftIcon={<FaVideo />}
                          colorScheme="purple"
                          variant="outline"
                          size="lg"
                          onClick={() => router.push('/docs/videos')}
                        >
                          Videos Tutoriales
                        </Button>

                        <Button
                          leftIcon={<FaQuestionCircle />}
                          colorScheme="green"
                          variant="outline"
                          size="lg"
                          onClick={() => router.push('/docs/faq')}
                        >
                          Preguntas Frecuentes
                        </Button>
                      </SimpleGrid>
                    </GlassCard>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </ModernContainer>
      </ProtectedRoute>
    </ChakraProvider>
  );
};

export default AttentionDocumentation;