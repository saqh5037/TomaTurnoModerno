import React, { useState, useEffect } from 'react';
import {
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
  Tooltip,
  Tag,
  TagLabel,
  TagLeftIcon,
  Avatar,
  AvatarGroup,
  FormControl,
  FormLabel,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Switch,
  Wrap,
  WrapItem,
  IconButton
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUsers,
  FaClock,
  FaUserClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown,
  FaFilter,
  FaBell,
  FaChartLine,
  FaUserMd,
  FaWheelchair,
  FaBaby,
  FaUserShield,
  FaHistory,
  FaPlay,
  FaPause,
  FaForward,
  FaBackward,
  FaRedo,
  FaSortAmountDown,
  FaSortAmountUp,
  FaSearch,
  FaEye,
  FaCalendarAlt,
  FaHospital,
  FaStethoscope,
  FaHeartbeat,
  FaThermometerHalf,
  FaUserPlus,
  FaUserMinus,
  FaRegClock,
  FaHourglassHalf,
  FaInfoCircle,
  FaLightbulb,
  FaShieldAlt,
  FaExclamationCircle,
  FaArrowRight,
  FaArrowLeft
} from 'react-icons/fa';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { GlassCard, ModernContainer } from '../../components/theme/ModernTheme';
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
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
`;

const MotionBox = motion(Box);

const QueueDocumentation = () => {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [queueData, setQueueData] = useState([]);

  // Sistema de prioridades
  const prioritySystem = [
    {
      level: 1,
      name: 'Emergencia',
      icon: FaExclamationTriangle,
      color: 'red',
      description: 'Casos de vida o muerte, atención inmediata',
      criteria: [
        'Reacciones alérgicas graves',
        'Desmayos o pérdida de consciencia',
        'Dolor torácico agudo',
        'Dificultad respiratoria severa'
      ],
      maxWaitTime: '0 min',
      code: 'P1',
      visualIndicator: 'Parpadeo rojo'
    },
    {
      level: 2,
      name: 'Muy Urgente',
      icon: FaHeartbeat,
      color: 'orange',
      description: 'Condiciones que requieren atención rápida',
      criteria: [
        'Dolor severo',
        'Hemorragias menores',
        'Fiebre alta en niños',
        'Vómitos persistentes'
      ],
      maxWaitTime: '10 min',
      code: 'P2',
      visualIndicator: 'Badge naranja'
    },
    {
      level: 3,
      name: 'Urgente',
      icon: FaThermometerHalf,
      color: 'yellow',
      description: 'Problemas médicos significativos',
      criteria: [
        'Dolor moderado',
        'Fiebre en adultos',
        'Heridas que requieren sutura',
        'Síntomas persistentes'
      ],
      maxWaitTime: '30 min',
      code: 'P3',
      visualIndicator: 'Badge amarillo'
    },
    {
      level: 4,
      name: 'Prioritario',
      icon: FaUserShield,
      color: 'blue',
      description: 'Grupos vulnerables con prioridad',
      criteria: [
        'Adultos mayores (>65 años)',
        'Mujeres embarazadas',
        'Niños menores de 5 años',
        'Personas con discapacidad'
      ],
      maxWaitTime: '45 min',
      code: 'P4',
      visualIndicator: 'Badge azul con ícono'
    },
    {
      level: 5,
      name: 'Normal',
      icon: FaUsers,
      color: 'green',
      description: 'Atención por orden de llegada',
      criteria: [
        'Exámenes de rutina',
        'Controles programados',
        'Síntomas leves',
        'Procedimientos no urgentes'
      ],
      maxWaitTime: '60-90 min',
      code: 'P5',
      visualIndicator: 'Sin indicador especial'
    }
  ];

  // Estados del turno
  const turnStates = [
    {
      state: 'WAITING',
      label: 'En Espera',
      icon: FaUserClock,
      color: 'gray',
      description: 'Paciente esperando ser llamado',
      nextStates: ['CALLED', 'CANCELLED']
    },
    {
      state: 'CALLED',
      label: 'Llamado',
      icon: FaBell,
      color: 'blue',
      description: 'Paciente ha sido llamado al cubículo',
      nextStates: ['ATTENDING', 'NO_SHOW', 'WAITING']
    },
    {
      state: 'ATTENDING',
      label: 'En Atención',
      icon: FaStethoscope,
      color: 'purple',
      description: 'Paciente siendo atendido',
      nextStates: ['COMPLETED', 'CANCELLED']
    },
    {
      state: 'COMPLETED',
      label: 'Completado',
      icon: FaCheckCircle,
      color: 'green',
      description: 'Atención finalizada exitosamente',
      nextStates: []
    },
    {
      state: 'NO_SHOW',
      label: 'No Presentado',
      icon: FaUserMinus,
      color: 'orange',
      description: 'Paciente no respondió al llamado',
      nextStates: ['WAITING', 'CANCELLED']
    },
    {
      state: 'CANCELLED',
      label: 'Cancelado',
      icon: FaExclamationCircle,
      color: 'red',
      description: 'Turno cancelado por paciente o sistema',
      nextStates: []
    }
  ];

  // Métricas de la cola
  const queueMetrics = [
    {
      metric: 'Pacientes en Cola',
      value: '24',
      change: '+3',
      trend: 'increase',
      icon: FaUsers,
      color: 'blue',
      description: 'Total de pacientes esperando'
    },
    {
      metric: 'Tiempo Promedio',
      value: '18 min',
      change: '-2 min',
      trend: 'decrease',
      icon: FaClock,
      color: 'green',
      description: 'Tiempo promedio de espera'
    },
    {
      metric: 'Prioridades Altas',
      value: '3',
      change: '0',
      trend: 'neutral',
      icon: FaExclamationTriangle,
      color: 'orange',
      description: 'Casos urgentes en cola'
    },
    {
      metric: 'Tasa de Abandono',
      value: '5%',
      change: '-1%',
      trend: 'decrease',
      icon: FaUserMinus,
      color: 'purple',
      description: 'Pacientes que abandonan'
    }
  ];

  // Datos de ejemplo para la cola
  const sampleQueue = [
    {
      id: 1,
      turnNumber: 'A001',
      patientName: 'Juan Pérez',
      patientAge: 45,
      priority: 5,
      waitingTime: 12,
      status: 'WAITING',
      checkInTime: '08:30',
      reason: 'Examen de rutina'
    },
    {
      id: 2,
      turnNumber: 'A002',
      patientName: 'María García',
      patientAge: 72,
      priority: 4,
      waitingTime: 8,
      status: 'WAITING',
      checkInTime: '08:35',
      reason: 'Control mensual',
      icon: FaUserShield
    },
    {
      id: 3,
      turnNumber: 'A003',
      patientName: 'Carlos López',
      patientAge: 30,
      priority: 3,
      waitingTime: 15,
      status: 'CALLED',
      checkInTime: '08:28',
      reason: 'Dolor moderado'
    },
    {
      id: 4,
      turnNumber: 'A004',
      patientName: 'Ana Martínez',
      patientAge: 28,
      priority: 4,
      waitingTime: 5,
      status: 'WAITING',
      checkInTime: '08:40',
      reason: 'Embarazo - Control',
      icon: FaBaby
    },
    {
      id: 5,
      turnNumber: 'A005',
      patientName: 'Pedro Rodríguez',
      patientAge: 3,
      priority: 2,
      waitingTime: 2,
      status: 'WAITING',
      checkInTime: '08:43',
      reason: 'Fiebre alta',
      icon: FaThermometerHalf
    }
  ];

  // Algoritmos de gestión de cola
  const queueAlgorithms = [
    {
      name: 'FIFO (First In, First Out)',
      description: 'Orden estricto de llegada',
      pros: ['Simple y justo', 'Fácil de entender', 'Sin discriminación'],
      cons: ['No considera urgencias', 'Puede ser ineficiente'],
      code: `function fifoQueue(patients) {
  return patients.sort((a, b) => a.arrivalTime - b.arrivalTime);
}`
    },
    {
      name: 'Prioridad con Envejecimiento',
      description: 'Prioridad que aumenta con el tiempo de espera',
      pros: ['Evita inanición', 'Balance entre prioridad y espera'],
      cons: ['Más complejo', 'Requiere recálculo constante'],
      code: `function priorityWithAging(patients) {
  return patients.sort((a, b) => {
    const aPriority = a.priority + (a.waitTime / 10);
    const bPriority = b.priority + (b.waitTime / 10);
    return bPriority - aPriority;
  });
}`
    },
    {
      name: 'SJF (Shortest Job First)',
      description: 'Atiende primero los casos más rápidos',
      pros: ['Minimiza tiempo promedio', 'Aumenta throughput'],
      cons: ['Puede causar inanición', 'Difícil estimar duración'],
      code: `function sjfQueue(patients) {
  return patients.sort((a, b) => a.estimatedTime - b.estimatedTime);
}`
    }
  ];

  // Reglas de negocio
  const businessRules = [
    {
      rule: 'Tiempo Máximo de Espera',
      description: 'Ningún paciente debe esperar más del tiempo máximo según su prioridad',
      implementation: 'Sistema de alertas automáticas cuando se acerca al límite',
      consequences: 'Escalación automática de prioridad si se excede'
    },
    {
      rule: 'Validación de Prioridad',
      description: 'La prioridad debe ser validada por personal autorizado',
      implementation: 'Checkbox de verificación en el sistema',
      consequences: 'Registro de quién asignó la prioridad'
    },
    {
      rule: 'No Show Policy',
      description: 'Tres llamados con 2 minutos de espera entre cada uno',
      implementation: 'Timer automático en el sistema',
      consequences: 'Turno marcado como no presentado y liberado'
    },
    {
      rule: 'Reagendamiento',
      description: 'Pacientes no presentados pueden reagendar una vez',
      implementation: 'Flag en el sistema para tracking',
      consequences: 'Segunda ausencia requiere nuevo registro'
    }
  ];

  useEffect(() => {
    // Simular actualización de cola
    setQueueData(sampleQueue);
  }, []);

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    toast({
      title: `Paciente seleccionado: ${patient.patientName}`,
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const getPriorityConfig = (level) => {
    return prioritySystem.find(p => p.level === level) || prioritySystem[4];
  };

  const getStatusConfig = (status) => {
    return turnStates.find(s => s.state === status) || turnStates[0];
  };

  const startSimulation = () => {
    setSimulationRunning(true);
    // Simular movimiento de cola
    const interval = setInterval(() => {
      setQueueData(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          // Simular cambio de estado aleatorio
          const randomIndex = Math.floor(Math.random() * updated.length);
          const states = ['WAITING', 'CALLED', 'ATTENDING'];
          updated[randomIndex].status = states[Math.floor(Math.random() * states.length)];
        }
        return updated;
      });
    }, 3000);

    setTimeout(() => {
      clearInterval(interval);
      setSimulationRunning(false);
    }, 15000);
  };

  const filteredQueue = queueData.filter(patient => {
    const matchesPriority = filterPriority === 'all' || patient.priority === parseInt(filterPriority);
    const matchesSearch = patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.turnNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  return (
    <ProtectedRoute>
        <ModernContainer>
          <VStack spacing={8} align="stretch">
            {/* Header */}
            <GlassCard p={8}>
              <VStack spacing={4}>
                <HStack width="100%" justify="space-between" mb={4}>
                  <Button
                    leftIcon={<FaArrowLeft />}
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/docs')}
                  >
                    Volver
                  </Button>
                  <Box flex={1} />
                </HStack>
                <Circle size="80px" bg="purple.500" color="white">
                  <Icon as={FaUsers} boxSize="40px" />
                </Circle>
                <Heading
                  size="2xl"
                  textAlign="center"
                  bgGradient="linear(to-r, purple.400, blue.600)"
                  bgClip="text"
                >
                  Gestión de Cola de Espera
                </Heading>
                <Text fontSize="lg" color="gray.600" maxW="700px">
                  Sistema inteligente de gestión de turnos con priorización dinámica,
                  monitoreo en tiempo real y algoritmos optimizados para minimizar
                  tiempos de espera.
                </Text>

                {/* Métricas Rápidas */}
                <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} w="full" mt={4}>
                  {queueMetrics.map((metric, index) => (
                    <Box
                      key={metric.metric}
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
                          {metric.value}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {metric.metric}
                        </Text>
                        <HStack>
                          {metric.trend !== 'neutral' && (
                            <Icon
                              as={metric.trend === 'increase' ? FaArrowUp : FaArrowDown}
                              color={metric.trend === 'increase' ? 'green.500' : 'red.500'}
                              boxSize={3}
                            />
                          )}
                          <Text fontSize="xs" color={metric.trend === 'increase' ? 'green.500' :
                                                     metric.trend === 'decrease' ? 'red.500' : 'gray.500'}>
                            {metric.change}
                          </Text>
                        </HStack>
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
                    <FaUserShield />
                    <Text>Sistema de Prioridades</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <FaUsers />
                    <Text>Cola en Tiempo Real</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <FaHistory />
                    <Text>Estados y Flujo</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <FaChartLine />
                    <Text>Algoritmos</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <FaShieldAlt />
                    <Text>Reglas de Negocio</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                {/* Sistema de Prioridades Tab */}
                <TabPanel px={0}>
                  <VStack spacing={6} align="stretch">
                    <GlassCard p={6} animation={`${fadeInUp} 0.7s ease-out`}>
                      <Heading size="md" mb={4}>
                        Niveles de Prioridad
                      </Heading>

                      <Text mb={6} color="gray.600">
                        El sistema utiliza 5 niveles de prioridad para garantizar que los casos
                        más urgentes sean atendidos primero, mientras mantiene equidad para todos.
                      </Text>

                      <VStack spacing={4} align="stretch">
                        {prioritySystem.map((priority, index) => (
                          <MotionBox
                            key={priority.level}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Box
                              p={4}
                              borderRadius="lg"
                              border="2px solid"
                              borderColor={`${priority.color}.300`}
                              bg={`${priority.color}.50`}
                              _hover={{
                                transform: 'translateX(4px)',
                                boxShadow: 'md'
                              }}
                              transition="all 0.3s"
                            >
                              <HStack justify="space-between" mb={3}>
                                <HStack>
                                  <Circle size="40px" bg={`${priority.color}.500`} color="white">
                                    <Icon as={priority.icon} boxSize="20px" />
                                  </Circle>
                                  <VStack align="start" spacing={0}>
                                    <HStack>
                                      <Text fontWeight="bold" fontSize="lg">
                                        Nivel {priority.level}: {priority.name}
                                      </Text>
                                      <Badge colorScheme={priority.color} fontSize="md">
                                        {priority.code}
                                      </Badge>
                                    </HStack>
                                    <Text fontSize="sm" color="gray.600">
                                      {priority.description}
                                    </Text>
                                  </VStack>
                                </HStack>
                                <VStack align="end" spacing={0}>
                                  <Text fontSize="xs" color="gray.500">Tiempo máx.</Text>
                                  <Text fontWeight="bold" color={`${priority.color}.600`}>
                                    {priority.maxWaitTime}
                                  </Text>
                                </VStack>
                              </HStack>

                              <Box ml={12}>
                                <Text fontSize="sm" fontWeight="semibold" mb={2}>
                                  Criterios de asignación:
                                </Text>
                                <Wrap spacing={2}>
                                  {priority.criteria.map((criterion) => (
                                    <WrapItem key={criterion}>
                                      <Tag size="sm" colorScheme={priority.color} variant="subtle">
                                        {criterion}
                                      </Tag>
                                    </WrapItem>
                                  ))}
                                </Wrap>

                                <HStack mt={3} fontSize="xs" color="gray.600">
                                  <Icon as={FaEye} />
                                  <Text>Indicador visual: {priority.visualIndicator}</Text>
                                </HStack>
                              </Box>
                            </Box>
                          </MotionBox>
                        ))}
                      </VStack>
                    </GlassCard>

                    {/* Matriz de Priorización */}
                    <GlassCard p={6} animation={`${fadeInUp} 0.8s ease-out`}>
                      <Heading size="md" mb={4}>
                        Matriz de Decisión de Prioridad
                      </Heading>

                      <TableContainer>
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th>Factor</Th>
                              <Th>P1</Th>
                              <Th>P2</Th>
                              <Th>P3</Th>
                              <Th>P4</Th>
                              <Th>P5</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            <Tr>
                              <Td fontWeight="bold">Severidad Médica</Td>
                              <Td><Badge colorScheme="red">Crítica</Badge></Td>
                              <Td><Badge colorScheme="orange">Alta</Badge></Td>
                              <Td><Badge colorScheme="yellow">Media</Badge></Td>
                              <Td><Badge colorScheme="blue">Baja</Badge></Td>
                              <Td><Badge colorScheme="green">Mínima</Badge></Td>
                            </Tr>
                            <Tr>
                              <Td fontWeight="bold">Tiempo de Respuesta</Td>
                              <Td>Inmediato</Td>
                              <Td>&lt;10 min</Td>
                              <Td>&lt;30 min</Td>
                              <Td>&lt;45 min</Td>
                              <Td>&lt;90 min</Td>
                            </Tr>
                            <Tr>
                              <Td fontWeight="bold">Grupo Vulnerable</Td>
                              <Td>N/A</Td>
                              <Td>Si es crítico</Td>
                              <Td>Considerado</Td>
                              <Td>Prioridad</Td>
                              <Td>Normal</Td>
                            </Tr>
                            <Tr>
                              <Td fontWeight="bold">Reevaluación</Td>
                              <Td>Continua</Td>
                              <Td>Cada 5 min</Td>
                              <Td>Cada 15 min</Td>
                              <Td>Cada 30 min</Td>
                              <Td>Cada hora</Td>
                            </Tr>
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </GlassCard>
                  </VStack>
                </TabPanel>

                {/* Cola en Tiempo Real Tab */}
                <TabPanel px={0}>
                  <VStack spacing={6} align="stretch">
                    {/* Controles */}
                    <GlassCard p={6} animation={`${fadeInUp} 0.7s ease-out`}>
                      <HStack justify="space-between" mb={4}>
                        <Heading size="md">Monitor de Cola en Tiempo Real</Heading>
                        <HStack>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            leftIcon={simulationRunning ? <FaPause /> : <FaPlay />}
                            onClick={startSimulation}
                            isLoading={simulationRunning}
                            loadingText="Simulando..."
                          >
                            {simulationRunning ? 'Pausar' : 'Iniciar'} Simulación
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<FaRedo />}
                          >
                            Actualizar
                          </Button>
                        </HStack>
                      </HStack>

                      {/* Filtros */}
                      <HStack spacing={4} mb={6}>
                        <InputGroup maxW="300px">
                          <InputLeftElement pointerEvents="none">
                            <FaSearch color="gray.300" />
                          </InputLeftElement>
                          <Input
                            placeholder="Buscar paciente o turno..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </InputGroup>

                        <Select
                          maxW="200px"
                          value={filterPriority}
                          onChange={(e) => setFilterPriority(e.target.value)}
                        >
                          <option value="all">Todas las prioridades</option>
                          {prioritySystem.map(p => (
                            <option key={p.level} value={p.level}>
                              {p.name} (P{p.level})
                            </option>
                          ))}
                        </Select>

                        <Button
                          variant="outline"
                          leftIcon={<FaFilter />}
                          size="sm"
                        >
                          Más filtros
                        </Button>
                      </HStack>

                      {/* Lista de Pacientes */}
                      <VStack spacing={3} align="stretch">
                        <AnimatePresence>
                          {filteredQueue.map((patient, index) => {
                            const priority = getPriorityConfig(patient.priority);
                            const status = getStatusConfig(patient.status);

                            return (
                              <MotionBox
                                key={patient.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handlePatientSelect(patient)}
                                cursor="pointer"
                              >
                                <Box
                                  p={4}
                                  borderRadius="lg"
                                  bg="white"
                                  borderLeft="4px solid"
                                  borderLeftColor={`${priority.color}.500`}
                                  boxShadow="sm"
                                  _hover={{
                                    boxShadow: 'md',
                                    transform: 'translateX(4px)'
                                  }}
                                  transition="all 0.2s"
                                  animation={patient.status === 'CALLED' ? `${pulse} 2s infinite` : ''}
                                >
                                  <HStack justify="space-between">
                                    <HStack spacing={4}>
                                      <VStack spacing={0}>
                                        <Text fontSize="2xl" fontWeight="bold" color={`${priority.color}.600`}>
                                          {patient.turnNumber}
                                        </Text>
                                        <Badge colorScheme={priority.color} fontSize="xs">
                                          {priority.code}
                                        </Badge>
                                      </VStack>

                                      <Divider orientation="vertical" height="40px" />

                                      <VStack align="start" spacing={0}>
                                        <HStack>
                                          <Text fontWeight="bold">{patient.patientName}</Text>
                                          {patient.icon && <Icon as={patient.icon} color={`${priority.color}.500`} />}
                                        </HStack>
                                        <HStack spacing={3} fontSize="sm" color="gray.600">
                                          <Text>{patient.patientAge} años</Text>
                                          <Text>•</Text>
                                          <Text>{patient.reason}</Text>
                                        </HStack>
                                      </VStack>
                                    </HStack>

                                    <VStack align="end" spacing={1}>
                                      <Badge colorScheme={status.color} px={3} py={1}>
                                        <HStack spacing={1}>
                                          <Icon as={status.icon} boxSize="12px" />
                                          <Text>{status.label}</Text>
                                        </HStack>
                                      </Badge>
                                      <HStack fontSize="sm" color="gray.500">
                                        <Icon as={FaClock} />
                                        <Text>{patient.waitingTime} min</Text>
                                      </HStack>
                                      <Text fontSize="xs" color="gray.400">
                                        Ingreso: {patient.checkInTime}
                                      </Text>
                                    </VStack>
                                  </HStack>
                                </Box>
                              </MotionBox>
                            );
                          })}
                        </AnimatePresence>
                      </VStack>

                      {filteredQueue.length === 0 && (
                        <Box textAlign="center" py={8}>
                          <Text color="gray.500">No hay pacientes en cola con los filtros aplicados</Text>
                        </Box>
                      )}
                    </GlassCard>

                    {/* Panel de Detalles */}
                    {selectedPatient && (
                      <GlassCard p={6} animation={`${fadeInUp} 0.8s ease-out`}>
                        <Heading size="md" mb={4}>
                          Detalles del Paciente
                        </Heading>

                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                          <Box>
                            <VStack align="stretch" spacing={3}>
                              <HStack>
                                <Text fontWeight="bold" minW="100px">Turno:</Text>
                                <Text>{selectedPatient.turnNumber}</Text>
                              </HStack>
                              <HStack>
                                <Text fontWeight="bold" minW="100px">Paciente:</Text>
                                <Text>{selectedPatient.patientName}</Text>
                              </HStack>
                              <HStack>
                                <Text fontWeight="bold" minW="100px">Edad:</Text>
                                <Text>{selectedPatient.patientAge} años</Text>
                              </HStack>
                              <HStack>
                                <Text fontWeight="bold" minW="100px">Motivo:</Text>
                                <Text>{selectedPatient.reason}</Text>
                              </HStack>
                            </VStack>
                          </Box>

                          <Box>
                            <VStack align="stretch" spacing={2}>
                              <Button size="sm" colorScheme="blue" leftIcon={<FaBell />}>
                                Llamar Paciente
                              </Button>
                              <Button size="sm" colorScheme="green" leftIcon={<FaUserMd />}>
                                Asignar a Cubículo
                              </Button>
                              <Button size="sm" colorScheme="orange" leftIcon={<FaArrowUp />}>
                                Cambiar Prioridad
                              </Button>
                              <Button size="sm" colorScheme="red" variant="outline" leftIcon={<FaUserMinus />}>
                                Cancelar Turno
                              </Button>
                            </VStack>
                          </Box>
                        </SimpleGrid>
                      </GlassCard>
                    )}
                  </VStack>
                </TabPanel>

                {/* Estados y Flujo Tab */}
                <TabPanel px={0}>
                  <VStack spacing={6} align="stretch">
                    <GlassCard p={6} animation={`${fadeInUp} 0.7s ease-out`}>
                      <Heading size="md" mb={4}>
                        Estados del Turno
                      </Heading>

                      <Text mb={6} color="gray.600">
                        Un turno pasa por diferentes estados desde su creación hasta su finalización.
                        Cada transición está controlada por reglas de negocio específicas.
                      </Text>

                      {/* Diagrama de Flujo Visual */}
                      <Box
                        p={6}
                        bg="gray.50"
                        borderRadius="lg"
                        mb={6}
                        overflowX="auto"
                      >
                        <Flex justify="space-between" align="center" minW="700px">
                          {turnStates.slice(0, 4).map((state, index) => (
                            <React.Fragment key={state.state}>
                              <VStack>
                                <Circle
                                  size="60px"
                                  bg={`${state.color}.500`}
                                  color="white"
                                >
                                  <Icon as={state.icon} boxSize="30px" />
                                </Circle>
                                <Text fontWeight="bold">{state.label}</Text>
                                <Text fontSize="xs" color="gray.600" textAlign="center" maxW="100px">
                                  {state.description}
                                </Text>
                              </VStack>
                              {index < 3 && (
                                <Icon
                                  as={FaArrowRight}
                                  color="gray.400"
                                  boxSize="30px"
                                />
                              )}
                            </React.Fragment>
                          ))}
                        </Flex>
                      </Box>

                      {/* Detalles de Estados */}
                      <Accordion allowMultiple>
                        {turnStates.map((state) => (
                          <AccordionItem key={state.state}>
                            <h2>
                              <AccordionButton>
                                <Box flex="1" textAlign="left">
                                  <HStack>
                                    <Icon as={state.icon} color={`${state.color}.500`} />
                                    <Text fontWeight="bold">{state.label}</Text>
                                    <Badge colorScheme={state.color}>{state.state}</Badge>
                                  </HStack>
                                </Box>
                                <AccordionIcon />
                              </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                              <VStack align="stretch" spacing={3}>
                                <Text>{state.description}</Text>

                                {state.nextStates.length > 0 && (
                                  <Box>
                                    <Text fontWeight="semibold" mb={2}>
                                      Transiciones posibles:
                                    </Text>
                                    <Wrap>
                                      {state.nextStates.map(nextState => {
                                        const next = turnStates.find(s => s.state === nextState);
                                        return (
                                          <WrapItem key={nextState}>
                                            <Tag colorScheme={next?.color}>
                                              <TagLeftIcon as={next?.icon} />
                                              {next?.label}
                                            </Tag>
                                          </WrapItem>
                                        );
                                      })}
                                    </Wrap>
                                  </Box>
                                )}

                                <Alert status="info" size="sm">
                                  <AlertIcon />
                                  <Text fontSize="sm">
                                    Cada cambio de estado queda registrado en el historial
                                    con timestamp y usuario responsable.
                                  </Text>
                                </Alert>
                              </VStack>
                            </AccordionPanel>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </GlassCard>

                    {/* Reglas de Transición */}
                    <GlassCard p={6} animation={`${fadeInUp} 0.8s ease-out`}>
                      <Heading size="md" mb={4}>
                        Reglas de Transición de Estados
                      </Heading>

                      <TableContainer>
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th>De Estado</Th>
                              <Th>A Estado</Th>
                              <Th>Condición</Th>
                              <Th>Acción</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            <Tr>
                              <Td>En Espera</Td>
                              <Td>Llamado</Td>
                              <Td>Flebotomista disponible</Td>
                              <Td>Anuncio por altavoz</Td>
                            </Tr>
                            <Tr>
                              <Td>Llamado</Td>
                              <Td>En Atención</Td>
                              <Td>Paciente se presenta</Td>
                              <Td>Iniciar timer</Td>
                            </Tr>
                            <Tr>
                              <Td>Llamado</Td>
                              <Td>No Presentado</Td>
                              <Td>3 llamados sin respuesta</Td>
                              <Td>Liberar turno</Td>
                            </Tr>
                            <Tr>
                              <Td>En Atención</Td>
                              <Td>Completado</Td>
                              <Td>Procedimiento finalizado</Td>
                              <Td>Registrar métricas</Td>
                            </Tr>
                            <Tr>
                              <Td>Cualquier</Td>
                              <Td>Cancelado</Td>
                              <Td>Solicitud o timeout</Td>
                              <Td>Liberar recursos</Td>
                            </Tr>
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </GlassCard>
                  </VStack>
                </TabPanel>

                {/* Algoritmos Tab */}
                <TabPanel px={0}>
                  <VStack spacing={6} align="stretch">
                    <GlassCard p={6} animation={`${fadeInUp} 0.7s ease-out`}>
                      <Heading size="md" mb={4}>
                        Algoritmos de Gestión de Cola
                      </Heading>

                      <Text mb={6} color="gray.600">
                        El sistema puede utilizar diferentes algoritmos según las necesidades
                        del momento y las políticas del hospital.
                      </Text>

                      <VStack spacing={6} align="stretch">
                        {queueAlgorithms.map((algo, index) => (
                          <Box
                            key={algo.name}
                            p={4}
                            borderRadius="lg"
                            border="1px solid"
                            borderColor="gray.200"
                            animation={`${slideIn} ${0.5 + index * 0.1}s ease-out`}
                          >
                            <VStack align="stretch" spacing={4}>
                              <Box>
                                <Heading size="sm" mb={2}>{algo.name}</Heading>
                                <Text fontSize="sm" color="gray.600">
                                  {algo.description}
                                </Text>
                              </Box>

                              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                                <Box>
                                  <Text fontWeight="bold" fontSize="sm" mb={2} color="green.600">
                                    Ventajas:
                                  </Text>
                                  <List spacing={1}>
                                    {algo.pros.map(pro => (
                                      <ListItem key={pro} fontSize="sm">
                                        <ListIcon as={FaCheckCircle} color="green.500" />
                                        {pro}
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>

                                <Box>
                                  <Text fontWeight="bold" fontSize="sm" mb={2} color="red.600">
                                    Desventajas:
                                  </Text>
                                  <List spacing={1}>
                                    {algo.cons.map(con => (
                                      <ListItem key={con} fontSize="sm">
                                        <ListIcon as={FaExclamationCircle} color="red.500" />
                                        {con}
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>
                              </SimpleGrid>

                              <Box>
                                <Text fontWeight="bold" fontSize="sm" mb={2}>
                                  Implementación:
                                </Text>
                                <Box
                                  as="pre"
                                  p={3}
                                  bg="gray.900"
                                  color="white"
                                  borderRadius="md"
                                  fontSize="xs"
                                  overflowX="auto"
                                >
                                  <Code colorScheme="blue" bg="transparent" color="inherit">
                                    {algo.code}
                                  </Code>
                                </Box>
                              </Box>
                            </VStack>
                          </Box>
                        ))}
                      </VStack>
                    </GlassCard>

                    {/* Optimización */}
                    <GlassCard p={6} animation={`${fadeInUp} 0.8s ease-out`}>
                      <Heading size="md" mb={4}>
                        Estrategias de Optimización
                      </Heading>

                      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                        <Box>
                          <HStack mb={3}>
                            <Icon as={FaLightbulb} color="yellow.500" />
                            <Text fontWeight="bold">Predicción de Demanda</Text>
                          </HStack>
                          <Text fontSize="sm" color="gray.600" mb={3}>
                            Usar datos históricos para predecir picos de demanda y
                            ajustar recursos proactivamente.
                          </Text>
                          <Progress value={75} colorScheme="yellow" size="sm" />
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            75% de precisión en predicciones
                          </Text>
                        </Box>

                        <Box>
                          <HStack mb={3}>
                            <Icon as={FaClock} color="blue.500" />
                            <Text fontWeight="bold">Balanceo Dinámico</Text>
                          </HStack>
                          <Text fontSize="sm" color="gray.600" mb={3}>
                            Redistribuir pacientes entre cubículos según la carga
                            de trabajo en tiempo real.
                          </Text>
                          <Progress value={85} colorScheme="blue" size="sm" />
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            85% de utilización óptima
                          </Text>
                        </Box>

                        <Box>
                          <HStack mb={3}>
                            <Icon as={FaUserClock} color="green.500" />
                            <Text fontWeight="bold">Priorización Inteligente</Text>
                          </HStack>
                          <Text fontSize="sm" color="gray.600" mb={3}>
                            Ajustar prioridades dinámicamente según tiempo de
                            espera y condición médica.
                          </Text>
                          <Progress value={90} colorScheme="green" size="sm" />
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            90% de satisfacción del paciente
                          </Text>
                        </Box>

                        <Box>
                          <HStack mb={3}>
                            <Icon as={FaChartLine} color="purple.500" />
                            <Text fontWeight="bold">Análisis Continuo</Text>
                          </HStack>
                          <Text fontSize="sm" color="gray.600" mb={3}>
                            Monitorear KPIs en tiempo real y ajustar estrategias
                            automáticamente.
                          </Text>
                          <Progress value={80} colorScheme="purple" size="sm" />
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            80% de mejora en tiempos
                          </Text>
                        </Box>
                      </SimpleGrid>
                    </GlassCard>
                  </VStack>
                </TabPanel>

                {/* Reglas de Negocio Tab */}
                <TabPanel px={0}>
                  <VStack spacing={6} align="stretch">
                    <GlassCard p={6} animation={`${fadeInUp} 0.7s ease-out`}>
                      <Heading size="md" mb={4}>
                        Reglas de Negocio Principales
                      </Heading>

                      <VStack spacing={4} align="stretch">
                        {businessRules.map((rule, index) => (
                          <Box
                            key={rule.rule}
                            p={4}
                            borderRadius="lg"
                            bg="purple.50"
                            border="1px solid"
                            borderColor="purple.200"
                            animation={`${slideIn} ${0.5 + index * 0.1}s ease-out`}
                          >
                            <VStack align="stretch" spacing={3}>
                              <HStack>
                                <Icon as={FaShieldAlt} color="purple.500" />
                                <Text fontWeight="bold">{rule.rule}</Text>
                              </HStack>

                              <Text fontSize="sm" color="gray.700">
                                {rule.description}
                              </Text>

                              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                                <Box>
                                  <Text fontWeight="semibold" fontSize="sm" mb={1}>
                                    Implementación:
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {rule.implementation}
                                  </Text>
                                </Box>

                                <Box>
                                  <Text fontWeight="semibold" fontSize="sm" mb={1}>
                                    Consecuencias:
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {rule.consequences}
                                  </Text>
                                </Box>
                              </SimpleGrid>
                            </VStack>
                          </Box>
                        ))}
                      </VStack>
                    </GlassCard>

                    {/* Configuración de Parámetros */}
                    <GlassCard p={6} animation={`${fadeInUp} 0.8s ease-out`}>
                      <Heading size="md" mb={4}>
                        Parámetros Configurables
                      </Heading>

                      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                        <Box>
                          <Text fontWeight="bold" mb={3}>Tiempos</Text>
                          <VStack align="stretch" spacing={3}>
                            <FormControl>
                              <FormLabel fontSize="sm">Tiempo entre llamados</FormLabel>
                              <HStack>
                                <Input type="number" defaultValue="2" size="sm" w="80px" />
                                <Text fontSize="sm">minutos</Text>
                              </HStack>
                            </FormControl>

                            <FormControl>
                              <FormLabel fontSize="sm">Número de llamados</FormLabel>
                              <Input type="number" defaultValue="3" size="sm" w="80px" />
                            </FormControl>

                            <FormControl>
                              <FormLabel fontSize="sm">Timeout de espera</FormLabel>
                              <HStack>
                                <Input type="number" defaultValue="120" size="sm" w="80px" />
                                <Text fontSize="sm">minutos</Text>
                              </HStack>
                            </FormControl>
                          </VStack>
                        </Box>

                        <Box>
                          <Text fontWeight="bold" mb={3}>Comportamiento</Text>
                          <VStack align="stretch" spacing={3}>
                            <FormControl display="flex" alignItems="center">
                              <FormLabel htmlFor="auto-priority" mb="0" flex="1" fontSize="sm">
                                Priorización automática
                              </FormLabel>
                              <Switch id="auto-priority" colorScheme="blue" defaultChecked />
                            </FormControl>

                            <FormControl display="flex" alignItems="center">
                              <FormLabel htmlFor="aging" mb="0" flex="1" fontSize="sm">
                                Envejecimiento de prioridad
                              </FormLabel>
                              <Switch id="aging" colorScheme="blue" defaultChecked />
                            </FormControl>

                            <FormControl display="flex" alignItems="center">
                              <FormLabel htmlFor="notifications" mb="0" flex="1" fontSize="sm">
                                Notificaciones push
                              </FormLabel>
                              <Switch id="notifications" colorScheme="blue" />
                            </FormControl>

                            <FormControl display="flex" alignItems="center">
                              <FormLabel htmlFor="auto-cancel" mb="0" flex="1" fontSize="sm">
                                Cancelación automática
                              </FormLabel>
                              <Switch id="auto-cancel" colorScheme="blue" />
                            </FormControl>
                          </VStack>
                        </Box>
                      </SimpleGrid>

                      <Divider my={6} />

                      <HStack justify="flex-end">
                        <Button variant="outline">Restaurar Valores</Button>
                        <Button colorScheme="purple">Guardar Configuración</Button>
                      </HStack>
                    </GlassCard>

                    {/* Alertas y Notificaciones */}
                    <GlassCard p={6} animation={`${fadeInUp} 0.9s ease-out`}>
                      <Heading size="md" mb={4}>
                        Sistema de Alertas
                      </Heading>

                      <VStack spacing={3} align="stretch">
                        <Alert status="error">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Tiempo máximo excedido</AlertTitle>
                            <AlertDescription>
                              Paciente P3-A015 lleva 45 minutos esperando (máximo: 30 min)
                            </AlertDescription>
                          </Box>
                        </Alert>

                        <Alert status="warning">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Cola congestionada</AlertTitle>
                            <AlertDescription>
                              30+ pacientes en espera. Considerar abrir cubículos adicionales
                            </AlertDescription>
                          </Box>
                        </Alert>

                        <Alert status="info">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Patrón detectado</AlertTitle>
                            <AlertDescription>
                              Los lunes entre 8-10 AM hay 40% más demanda. Ajustar personal
                            </AlertDescription>
                          </Box>
                        </Alert>
                      </VStack>
                    </GlassCard>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </ModernContainer>
      </ProtectedRoute>
  );
};

export default QueueDocumentation;