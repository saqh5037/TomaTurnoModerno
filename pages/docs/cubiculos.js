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
  StatArrow,
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
  Card,
  CardHeader,
  CardBody,
  Switch,
  FormControl,
  FormLabel,
  Select,
  Tag,
  TagLabel,
  TagLeftIcon,
  Wrap,
  WrapItem
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { motion } from 'framer-motion';
import {
  FaDoorOpen,
  FaLock,
  FaUnlock,
  FaUserMd,
  FaCheckCircle,
  FaExclamationTriangle,
  FaDesktop,
  FaClock,
  FaChartBar,
  FaSyringe,
  FaBaby,
  FaWheelchair,
  FaHeartbeat,
  FaKey,
  FaToggleOn,
  FaToggleOff,
  FaMapMarkerAlt,
  FaClipboardList,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaMicrophone,
  FaBell,
  FaShieldAlt,
  FaStethoscope,
  FaHospital,
  FaTools,
  FaLightbulb,
  FaInfoCircle,
  FaArrowRight,
  FaPalette,
  FaCog
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
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const MotionBox = motion(Box);

const CubiclesDocumentation = () => {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [selectedCubicle, setSelectedCubicle] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filterType, setFilterType] = useState('all');

  // Tipos de cubículos
  const cubicleTypes = [
    {
      id: 'general',
      name: 'Cubículo General',
      icon: FaDoorOpen,
      color: 'blue',
      description: 'Para procedimientos estándar y tomas de sangre rutinarias',
      capacity: 'Individual',
      equipment: [
        'Camilla estándar',
        'Silla para paciente',
        'Mesa de trabajo',
        'Equipo básico de flebotomía',
        'Computadora con sistema'
      ],
      procedures: [
        'Tomas de sangre rutinarias',
        'Exámenes básicos',
        'Muestras de orina',
        'Controles generales'
      ],
      requirements: [
        'Flebotomista certificado',
        'Acceso al sistema',
        'Kit básico de extracción'
      ]
    },
    {
      id: 'special',
      name: 'Cubículo Especial',
      icon: FaHeartbeat,
      color: 'purple',
      description: 'Equipado para procedimientos complejos y pacientes especiales',
      capacity: 'Ampliado',
      equipment: [
        'Camilla ajustable',
        'Equipo especializado',
        'Silla de ruedas compatible',
        'Monitor de signos vitales',
        'Espacio para acompañante',
        'Equipamiento pediátrico'
      ],
      procedures: [
        'Pacientes con movilidad reducida',
        'Procedimientos pediátricos',
        'Pacientes geriátricos',
        'Casos que requieren acompañante',
        'Procedimientos de mayor duración'
      ],
      requirements: [
        'Personal especializado',
        'Certificación adicional',
        'Experiencia con casos especiales'
      ]
    },
    {
      id: 'pediatric',
      name: 'Cubículo Pediátrico',
      icon: FaBaby,
      color: 'green',
      description: 'Ambiente amigable para niños con decoración especial',
      capacity: 'Familiar',
      equipment: [
        'Decoración infantil',
        'Juguetes y distracciones',
        'Equipamiento pediátrico',
        'Sillas para padres',
        'Material didáctico',
        'Premios y stickers'
      ],
      procedures: [
        'Tomas pediátricas',
        'Bebés y niños pequeños',
        'Procedimientos con anestesia local',
        'Casos que requieren distracción'
      ],
      requirements: [
        'Especialización pediátrica',
        'Habilidades de comunicación infantil',
        'Paciencia y empatía'
      ]
    },
    {
      id: 'emergency',
      name: 'Cubículo de Emergencia',
      icon: FaExclamationTriangle,
      color: 'red',
      description: 'Reservado para casos urgentes y emergencias médicas',
      capacity: 'Emergencia',
      equipment: [
        'Equipo de emergencia completo',
        'Desfibrilador',
        'Oxígeno',
        'Medicamentos de emergencia',
        'Línea directa con médicos',
        'Camilla de transporte'
      ],
      procedures: [
        'Emergencias médicas',
        'Pacientes inestables',
        'Reacciones alérgicas',
        'Casos urgentes',
        'Estabilización inicial'
      ],
      requirements: [
        'Certificación en emergencias',
        'RCP actualizado',
        'Experiencia en casos críticos'
      ]
    }
  ];

  // Estados de cubículos
  const cubicleStates = [
    {
      status: 'available',
      label: 'Disponible',
      icon: FaCheckCircle,
      color: 'green',
      description: 'Cubículo listo para ser asignado',
      actions: ['Asignar', 'Reservar', 'Mantenimiento']
    },
    {
      status: 'occupied',
      label: 'Ocupado',
      icon: FaUserMd,
      color: 'blue',
      description: 'Cubículo en uso por un flebotomista',
      actions: ['Ver detalles', 'Liberar', 'Transferir']
    },
    {
      status: 'maintenance',
      label: 'En Mantenimiento',
      icon: FaTools,
      color: 'orange',
      description: 'Cubículo temporalmente fuera de servicio',
      actions: ['Finalizar mantenimiento', 'Extender', 'Ver reporte']
    },
    {
      status: 'reserved',
      label: 'Reservado',
      icon: FaLock,
      color: 'purple',
      description: 'Cubículo reservado para uso específico',
      actions: ['Liberar reserva', 'Modificar', 'Asignar']
    },
    {
      status: 'disabled',
      label: 'Deshabilitado',
      icon: FaToggleOff,
      color: 'gray',
      description: 'Cubículo no disponible para uso',
      actions: ['Habilitar', 'Ver motivo']
    }
  ];

  // Flujo de gestión
  const managementFlow = [
    {
      step: 1,
      title: 'Verificación Inicial',
      icon: FaClipboardList,
      description: 'Revisar estado y disponibilidad del cubículo',
      actions: [
        'Verificar limpieza',
        'Revisar equipamiento',
        'Confirmar funcionamiento',
        'Actualizar estado en sistema'
      ],
      time: '2 min'
    },
    {
      step: 2,
      title: 'Asignación',
      icon: FaUserMd,
      description: 'Asignar cubículo a flebotomista',
      actions: [
        'Seleccionar flebotomista',
        'Verificar certificaciones',
        'Confirmar asignación',
        'Registrar en sistema'
      ],
      time: '1 min'
    },
    {
      step: 3,
      title: 'Monitoreo',
      icon: FaEye,
      description: 'Supervisar uso durante el turno',
      actions: [
        'Verificar actividad',
        'Monitorear tiempos',
        'Revisar incidencias',
        'Actualizar métricas'
      ],
      time: 'Continuo'
    },
    {
      step: 4,
      title: 'Liberación',
      icon: FaUnlock,
      description: 'Proceso de liberación del cubículo',
      actions: [
        'Finalizar sesión activa',
        'Registrar estadísticas',
        'Solicitar limpieza',
        'Actualizar disponibilidad'
      ],
      time: '3 min'
    },
    {
      step: 5,
      title: 'Mantenimiento',
      icon: FaTools,
      description: 'Mantenimiento preventivo y correctivo',
      actions: [
        'Programar mantenimiento',
        'Ejecutar protocolo',
        'Documentar cambios',
        'Validar funcionamiento'
      ],
      time: 'Variable'
    }
  ];

  // Métricas de cubículos
  const cubicleMetrics = [
    {
      metric: 'Tasa de Ocupación',
      value: '87%',
      change: '+5%',
      trend: 'increase',
      icon: FaChartBar,
      color: 'green',
      description: 'Porcentaje de tiempo en uso productivo'
    },
    {
      metric: 'Rotación Diaria',
      value: '12.4',
      change: '+2.1',
      trend: 'increase',
      icon: FaClock,
      color: 'blue',
      description: 'Cambios de paciente por cubículo/día'
    },
    {
      metric: 'Tiempo Medio Libre',
      value: '3.2 min',
      change: '-0.5',
      trend: 'decrease',
      icon: FaClock,
      color: 'purple',
      description: 'Tiempo promedio entre pacientes'
    },
    {
      metric: 'Incidencias',
      value: '2',
      change: '-3',
      trend: 'decrease',
      icon: FaExclamationTriangle,
      color: 'orange',
      description: 'Problemas reportados esta semana'
    }
  ];

  // Ejemplo de cubículos simulados
  const sampleCubicles = [
    { id: 1, type: 'general', status: 'available', phlebotomist: null, location: 'Piso 1 - Ala Norte' },
    { id: 2, type: 'general', status: 'occupied', phlebotomist: 'Dr. García', location: 'Piso 1 - Ala Norte' },
    { id: 3, type: 'special', status: 'occupied', phlebotomist: 'Dra. Martínez', location: 'Piso 1 - Ala Sur' },
    { id: 4, type: 'pediatric', status: 'available', phlebotomist: null, location: 'Piso 2 - Pediatría' },
    { id: 5, type: 'general', status: 'maintenance', phlebotomist: null, location: 'Piso 1 - Ala Norte' },
    { id: 6, type: 'emergency', status: 'reserved', phlebotomist: null, location: 'Planta Baja - Emergencias' },
    { id: 7, type: 'special', status: 'available', phlebotomist: null, location: 'Piso 1 - Ala Sur' },
    { id: 8, type: 'general', status: 'occupied', phlebotomist: 'Dr. López', location: 'Piso 2 - Ala Este' }
  ];

  // Protocolos de gestión
  const managementProtocols = [
    {
      title: 'Protocolo de Asignación',
      icon: FaKey,
      steps: [
        'Verificar disponibilidad del cubículo',
        'Confirmar certificaciones del flebotomista',
        'Validar tipo de cubículo necesario',
        'Realizar asignación en sistema',
        'Confirmar con el flebotomista',
        'Activar cubículo en panel'
      ],
      alerts: [
        'No asignar sin verificar limpieza',
        'Respetar especialización del cubículo'
      ]
    },
    {
      title: 'Protocolo de Emergencia',
      icon: FaExclamationTriangle,
      steps: [
        'Identificar emergencia',
        'Liberar cubículo de emergencia si está ocupado',
        'Notificar al personal médico',
        'Preparar equipamiento',
        'Documentar uso de emergencia',
        'Restablecer después del uso'
      ],
      alerts: [
        'Prioridad absoluta sobre otros usos',
        'Documentar todo el proceso'
      ]
    },
    {
      title: 'Protocolo de Cambio de Turno',
      icon: FaClock,
      steps: [
        'Revisar estado de todos los cubículos',
        'Transferir cubículos activos',
        'Actualizar asignaciones',
        'Verificar pendientes de mantenimiento',
        'Entregar reporte al siguiente turno',
        'Confirmar recepción'
      ],
      alerts: [
        'No dejar cubículos sin supervisión',
        'Documentar cualquier anomalía'
      ]
    }
  ];

  const handleCubicleSelect = (cubicle) => {
    setSelectedCubicle(cubicle);
    toast({
      title: `Cubículo ${cubicle.id} seleccionado`,
      description: `Tipo: ${cubicle.type} - Estado: ${cubicle.status}`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const getCubicleIcon = (type) => {
    const typeConfig = cubicleTypes.find(t => t.id === type);
    return typeConfig ? typeConfig.icon : FaDoorOpen;
  };

  const getCubicleColor = (status) => {
    const stateConfig = cubicleStates.find(s => s.status === status);
    return stateConfig ? stateConfig.color : 'gray';
  };

  const filteredCubicles = sampleCubicles.filter(cubicle =>
    filterType === 'all' || cubicle.type === filterType
  );

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
                <Circle size="80px" bg="blue.500" color="white">
                  <Icon as={FaDoorOpen} boxSize="40px" />
                </Circle>
                <Heading
                  size="2xl"
                  bgGradient="linear(to-r, blue.400, purple.600)"
                  bgClip="text"
                >
                  Gestión de Cubículos
                </Heading>
                <Text fontSize="lg" color="gray.600" maxW="600px">
                  Sistema integral de administración, asignación y monitoreo de cubículos
                  de atención, con control en tiempo real y gestión de recursos.
                </Text>

                {/* Métricas Rápidas */}
                <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} w="full" mt={4}>
                  {cubicleMetrics.map((metric, index) => (
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
                          <StatArrow type={metric.trend} />
                          <Text fontSize="xs" color={metric.trend === 'increase' ? 'green.500' : 'red.500'}>
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
                    <FaDoorOpen />
                    <Text>Tipos de Cubículos</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <FaDesktop />
                    <Text>Panel de Control</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <FaClipboardList />
                    <Text>Flujo de Gestión</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <FaShieldAlt />
                    <Text>Protocolos</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <FaCog />
                    <Text>Configuración</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                {/* Tipos de Cubículos Tab */}
                <TabPanel px={0}>
                  <VStack spacing={6} align="stretch">
                    <GlassCard p={6} animation={`${fadeInUp} 0.7s ease-out`}>
                      <Heading size="md" mb={4}>
                        Clasificación de Cubículos
                      </Heading>

                      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                        {cubicleTypes.map((type, index) => (
                          <MotionBox
                            key={type.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <GlassCard
                              p={5}
                              cursor="pointer"
                              _hover={{
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
                              }}
                              transition="all 0.3s"
                            >
                              <VStack align="stretch" spacing={4}>
                                <HStack justify="space-between">
                                  <HStack>
                                    <Circle size="50px" bg={`${type.color}.500`} color="white">
                                      <Icon as={type.icon} boxSize="25px" />
                                    </Circle>
                                    <Box>
                                      <Heading size="sm">{type.name}</Heading>
                                      <Badge colorScheme={type.color}>{type.capacity}</Badge>
                                    </Box>
                                  </HStack>
                                </HStack>

                                <Text fontSize="sm" color="gray.600">
                                  {type.description}
                                </Text>

                                <Box>
                                  <Text fontWeight="bold" fontSize="sm" mb={2}>
                                    Equipamiento:
                                  </Text>
                                  <Wrap spacing={2}>
                                    {type.equipment.slice(0, 3).map((item) => (
                                      <WrapItem key={item}>
                                        <Tag size="sm" colorScheme={type.color} variant="subtle">
                                          {item}
                                        </Tag>
                                      </WrapItem>
                                    ))}
                                    {type.equipment.length > 3 && (
                                      <WrapItem>
                                        <Tag size="sm" variant="outline">
                                          +{type.equipment.length - 3} más
                                        </Tag>
                                      </WrapItem>
                                    )}
                                  </Wrap>
                                </Box>

                                <Box>
                                  <Text fontWeight="bold" fontSize="sm" mb={2}>
                                    Procedimientos:
                                  </Text>
                                  <List spacing={1}>
                                    {type.procedures.slice(0, 3).map((proc) => (
                                      <ListItem key={proc} fontSize="xs">
                                        <ListIcon as={FaCheckCircle} color="green.500" />
                                        {proc}
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>

                                <Divider />

                                <Box>
                                  <Text fontWeight="bold" fontSize="sm" mb={2}>
                                    Requisitos:
                                  </Text>
                                  <List spacing={1}>
                                    {type.requirements.map((req) => (
                                      <ListItem key={req} fontSize="xs">
                                        <ListIcon as={FaKey} color="orange.500" />
                                        {req}
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>
                              </VStack>
                            </GlassCard>
                          </MotionBox>
                        ))}
                      </SimpleGrid>
                    </GlassCard>

                    {/* Estados de Cubículos */}
                    <GlassCard p={6} animation={`${fadeInUp} 0.8s ease-out`}>
                      <Heading size="md" mb={4}>
                        Estados Posibles
                      </Heading>

                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                        {cubicleStates.map((state) => (
                          <Box
                            key={state.status}
                            p={4}
                            borderRadius="lg"
                            border="2px solid"
                            borderColor={`${state.color}.200`}
                            bg={`${state.color}.50`}
                          >
                            <HStack mb={2}>
                              <Icon as={state.icon} color={`${state.color}.500`} />
                              <Text fontWeight="bold">{state.label}</Text>
                            </HStack>
                            <Text fontSize="sm" color="gray.600" mb={3}>
                              {state.description}
                            </Text>
                            <Text fontSize="xs" fontWeight="semibold" mb={1}>
                              Acciones disponibles:
                            </Text>
                            <Wrap spacing={1}>
                              {state.actions.map((action) => (
                                <WrapItem key={action}>
                                  <Tag size="sm" variant="outline" colorScheme={state.color}>
                                    {action}
                                  </Tag>
                                </WrapItem>
                              ))}
                            </Wrap>
                          </Box>
                        ))}
                      </SimpleGrid>
                    </GlassCard>
                  </VStack>
                </TabPanel>

                {/* Panel de Control Tab */}
                <TabPanel px={0}>
                  <VStack spacing={6} align="stretch">
                    {/* Controles */}
                    <GlassCard p={6} animation={`${fadeInUp} 0.7s ease-out`}>
                      <HStack justify="space-between" mb={4}>
                        <Heading size="md">Panel de Control en Tiempo Real</Heading>
                        <HStack>
                          <FormControl display="flex" alignItems="center">
                            <FormLabel htmlFor="view-mode" mb="0" mr={2} fontSize="sm">
                              Vista:
                            </FormLabel>
                            <Select
                              id="view-mode"
                              value={viewMode}
                              onChange={(e) => setViewMode(e.target.value)}
                              size="sm"
                              width="120px"
                            >
                              <option value="grid">Cuadrícula</option>
                              <option value="list">Lista</option>
                            </Select>
                          </FormControl>

                          <FormControl display="flex" alignItems="center">
                            <FormLabel htmlFor="filter-type" mb="0" mr={2} fontSize="sm">
                              Filtrar:
                            </FormLabel>
                            <Select
                              id="filter-type"
                              value={filterType}
                              onChange={(e) => setFilterType(e.target.value)}
                              size="sm"
                              width="120px"
                            >
                              <option value="all">Todos</option>
                              <option value="general">General</option>
                              <option value="special">Especial</option>
                              <option value="pediatric">Pediátrico</option>
                              <option value="emergency">Emergencia</option>
                            </Select>
                          </FormControl>

                          <Button
                            size="sm"
                            colorScheme="blue"
                            leftIcon={<FaPlus />}
                          >
                            Nuevo
                          </Button>
                        </HStack>
                      </HStack>

                      {/* Vista de Cubículos */}
                      {viewMode === 'grid' ? (
                        <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                          {filteredCubicles.map((cubicle, index) => (
                            <MotionBox
                              key={cubicle.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => handleCubicleSelect(cubicle)}
                              cursor="pointer"
                            >
                              <Box
                                p={4}
                                borderRadius="xl"
                                bg={cubicle.status === 'available' ? 'green.50' :
                                    cubicle.status === 'occupied' ? 'blue.50' :
                                    cubicle.status === 'maintenance' ? 'orange.50' :
                                    cubicle.status === 'reserved' ? 'purple.50' : 'gray.50'}
                                border="2px solid"
                                borderColor={`${getCubicleColor(cubicle.status)}.300`}
                                _hover={{
                                  transform: 'translateY(-2px)',
                                  boxShadow: 'lg'
                                }}
                                transition="all 0.2s"
                              >
                                <VStack spacing={2}>
                                  <Circle
                                    size="40px"
                                    bg={`${getCubicleColor(cubicle.status)}.500`}
                                    color="white"
                                  >
                                    <Icon as={getCubicleIcon(cubicle.type)} boxSize="20px" />
                                  </Circle>
                                  <Text fontWeight="bold" fontSize="lg">
                                    #{cubicle.id}
                                  </Text>
                                  <Badge colorScheme={getCubicleColor(cubicle.status)}>
                                    {cubicleStates.find(s => s.status === cubicle.status)?.label}
                                  </Badge>
                                  {cubicle.phlebotomist && (
                                    <Text fontSize="xs" color="gray.600">
                                      {cubicle.phlebotomist}
                                    </Text>
                                  )}
                                  <Text fontSize="xs" color="gray.500" textAlign="center">
                                    {cubicle.location}
                                  </Text>
                                </VStack>
                              </Box>
                            </MotionBox>
                          ))}
                        </SimpleGrid>
                      ) : (
                        <TableContainer>
                          <Table variant="simple">
                            <Thead>
                              <Tr>
                                <Th>ID</Th>
                                <Th>Tipo</Th>
                                <Th>Estado</Th>
                                <Th>Flebotomista</Th>
                                <Th>Ubicación</Th>
                                <Th>Acciones</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {filteredCubicles.map((cubicle) => (
                                <Tr key={cubicle.id}>
                                  <Td>
                                    <HStack>
                                      <Circle
                                        size="30px"
                                        bg={`${getCubicleColor(cubicle.status)}.500`}
                                        color="white"
                                      >
                                        <Text fontWeight="bold">#{cubicle.id}</Text>
                                      </Circle>
                                    </HStack>
                                  </Td>
                                  <Td>
                                    <HStack>
                                      <Icon as={getCubicleIcon(cubicle.type)} color="gray.600" />
                                      <Text>{cubicleTypes.find(t => t.id === cubicle.type)?.name}</Text>
                                    </HStack>
                                  </Td>
                                  <Td>
                                    <Badge colorScheme={getCubicleColor(cubicle.status)}>
                                      {cubicleStates.find(s => s.status === cubicle.status)?.label}
                                    </Badge>
                                  </Td>
                                  <Td>{cubicle.phlebotomist || '-'}</Td>
                                  <Td>{cubicle.location}</Td>
                                  <Td>
                                    <HStack spacing={1}>
                                      <Tooltip label="Ver detalles">
                                        <IconButton
                                          size="sm"
                                          icon={<FaEye />}
                                          variant="ghost"
                                          onClick={() => handleCubicleSelect(cubicle)}
                                        />
                                      </Tooltip>
                                      <Tooltip label="Editar">
                                        <IconButton
                                          size="sm"
                                          icon={<FaEdit />}
                                          variant="ghost"
                                        />
                                      </Tooltip>
                                      <Tooltip label="Eliminar">
                                        <IconButton
                                          size="sm"
                                          icon={<FaTrash />}
                                          variant="ghost"
                                          colorScheme="red"
                                        />
                                      </Tooltip>
                                    </HStack>
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </TableContainer>
                      )}
                    </GlassCard>

                    {/* Detalles del Cubículo Seleccionado */}
                    {selectedCubicle && (
                      <GlassCard p={6} animation={`${fadeInUp} 0.8s ease-out`}>
                        <Heading size="md" mb={4}>
                          Detalles del Cubículo #{selectedCubicle.id}
                        </Heading>

                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                          <Box>
                            <VStack align="stretch" spacing={3}>
                              <Box>
                                <Text fontSize="sm" color="gray.500">Tipo</Text>
                                <HStack>
                                  <Icon as={getCubicleIcon(selectedCubicle.type)} />
                                  <Text fontWeight="bold">
                                    {cubicleTypes.find(t => t.id === selectedCubicle.type)?.name}
                                  </Text>
                                </HStack>
                              </Box>
                              <Box>
                                <Text fontSize="sm" color="gray.500">Estado</Text>
                                <Badge colorScheme={getCubicleColor(selectedCubicle.status)} fontSize="md">
                                  {cubicleStates.find(s => s.status === selectedCubicle.status)?.label}
                                </Badge>
                              </Box>
                              <Box>
                                <Text fontSize="sm" color="gray.500">Ubicación</Text>
                                <Text fontWeight="bold">{selectedCubicle.location}</Text>
                              </Box>
                              {selectedCubicle.phlebotomist && (
                                <Box>
                                  <Text fontSize="sm" color="gray.500">Asignado a</Text>
                                  <Text fontWeight="bold">{selectedCubicle.phlebotomist}</Text>
                                </Box>
                              )}
                            </VStack>
                          </Box>

                          <Box>
                            <Text fontSize="sm" color="gray.500" mb={2}>Acciones Rápidas</Text>
                            <VStack align="stretch" spacing={2}>
                              <Button size="sm" leftIcon={<FaUserMd />} colorScheme="blue">
                                Asignar Flebotomista
                              </Button>
                              <Button size="sm" leftIcon={<FaUnlock />} colorScheme="green">
                                Liberar Cubículo
                              </Button>
                              <Button size="sm" leftIcon={<FaTools />} colorScheme="orange">
                                Mantenimiento
                              </Button>
                              <Button size="sm" leftIcon={<FaToggleOff />} colorScheme="red">
                                Deshabilitar
                              </Button>
                            </VStack>
                          </Box>
                        </SimpleGrid>
                      </GlassCard>
                    )}
                  </VStack>
                </TabPanel>

                {/* Flujo de Gestión Tab */}
                <TabPanel px={0}>
                  <VStack spacing={6} align="stretch">
                    <GlassCard p={6} animation={`${fadeInUp} 0.7s ease-out`}>
                      <Heading size="md" mb={4}>
                        Flujo de Gestión de Cubículos
                      </Heading>

                      <Flex
                        direction={{ base: 'column', lg: 'row' }}
                        justify="space-between"
                        align="center"
                        gap={4}
                        mb={6}
                      >
                        {managementFlow.map((step, index) => (
                          <VStack
                            key={step.step}
                            spacing={2}
                            flex={1}
                            animation={`${slideIn} ${0.5 + index * 0.1}s ease-out`}
                          >
                            <Circle
                              size="60px"
                              bg={index === 2 ? 'purple.500' : 'blue.500'}
                              color="white"
                            >
                              <Icon as={step.icon} boxSize="30px" />
                            </Circle>
                            <Text fontWeight="bold" textAlign="center">
                              {step.step}. {step.title}
                            </Text>
                            <Badge colorScheme="gray">{step.time}</Badge>
                            <Text fontSize="xs" color="gray.600" textAlign="center">
                              {step.description}
                            </Text>
                            {index < managementFlow.length - 1 && (
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

                      <Accordion allowMultiple>
                        {managementFlow.map((step) => (
                          <AccordionItem key={step.step}>
                            <h2>
                              <AccordionButton>
                                <Box flex="1" textAlign="left">
                                  <HStack>
                                    <Badge colorScheme="blue">Paso {step.step}</Badge>
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
                                  <Text fontWeight="semibold" mb={2}>Acciones:</Text>
                                  <List spacing={2}>
                                    {step.actions.map((action, i) => (
                                      <ListItem key={i}>
                                        <ListIcon as={FaCheckCircle} color="green.500" />
                                        {action}
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>
                                <HStack>
                                  <Icon as={FaClock} color="gray.500" />
                                  <Text fontSize="sm" color="gray.600">
                                    Tiempo estimado: {step.time}
                                  </Text>
                                </HStack>
                              </VStack>
                            </AccordionPanel>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </GlassCard>

                    {/* Códigos de Gestión */}
                    <GlassCard p={6} animation={`${fadeInUp} 0.8s ease-out`}>
                      <Heading size="md" mb={4}>
                        Ejemplos de Código
                      </Heading>

                      <Tabs variant="enclosed">
                        <TabList>
                          <Tab>Asignación</Tab>
                          <Tab>Liberación</Tab>
                          <Tab>Monitoreo</Tab>
                        </TabList>
                        <TabPanels>
                          <TabPanel>
                            <Box
                              as="pre"
                              p={4}
                              bg="gray.900"
                              color="white"
                              borderRadius="md"
                              overflowX="auto"
                              fontSize="sm"
                            >
                              <Code colorScheme="blue" bg="transparent" color="inherit">
{`// Asignar cubículo a flebotomista
const assignCubicle = async (cubicleId, phlebotomistId) => {
  try {
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

    const result = await response.json();
    notifyAssignment(result);
    return result;
  } catch (error) {
    handleError(error);
  }
};`}
                              </Code>
                            </Box>
                          </TabPanel>

                          <TabPanel>
                            <Box
                              as="pre"
                              p={4}
                              bg="gray.900"
                              color="white"
                              borderRadius="md"
                              overflowX="auto"
                              fontSize="sm"
                            >
                              <Code colorScheme="green" bg="transparent" color="inherit">
{`// Liberar cubículo
const releaseCubicle = async (cubicleId) => {
  try {
    // Finalizar sesión activa
    await endActiveSession(cubicleId);

    // Registrar estadísticas
    const stats = await calculateCubicleStats(cubicleId);
    await saveStatistics(stats);

    // Solicitar limpieza
    await requestCleaning(cubicleId);

    // Actualizar estado
    const response = await fetch('/api/cubicles/release', {
      method: 'POST',
      body: JSON.stringify({
        cubicleId,
        status: 'available',
        cleaningRequested: true
      })
    });

    return await response.json();
  } catch (error) {
    handleError(error);
  }
};`}
                              </Code>
                            </Box>
                          </TabPanel>

                          <TabPanel>
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
{`// Monitorear estado de cubículos
const monitorCubicles = async () => {
  const cubicles = await getAllCubicles();

  const metrics = {
    total: cubicles.length,
    available: 0,
    occupied: 0,
    maintenance: 0,
    avgOccupancyTime: 0
  };

  cubicles.forEach(cubicle => {
    metrics[cubicle.status]++;

    if (cubicle.status === 'occupied') {
      const duration = calculateDuration(cubicle.lastAssigned);
      metrics.avgOccupancyTime += duration;
    }
  });

  metrics.avgOccupancyTime /= metrics.occupied || 1;

  // Actualizar dashboard
  updateDashboard(metrics);

  // Alertas si es necesario
  if (metrics.available === 0) {
    sendAlert('No hay cubículos disponibles');
  }

  return metrics;
};`}
                              </Code>
                            </Box>
                          </TabPanel>
                        </TabPanels>
                      </Tabs>
                    </GlassCard>
                  </VStack>
                </TabPanel>

                {/* Protocolos Tab */}
                <TabPanel px={0}>
                  <VStack spacing={6} align="stretch">
                    {managementProtocols.map((protocol, index) => (
                      <GlassCard
                        key={protocol.title}
                        p={6}
                        animation={`${fadeInUp} ${0.7 + index * 0.1}s ease-out`}
                      >
                        <HStack mb={4}>
                          <Icon as={protocol.icon} color="purple.500" boxSize="24px" />
                          <Heading size="md">{protocol.title}</Heading>
                        </HStack>

                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                          <Box>
                            <Text fontWeight="bold" mb={3}>Pasos del Protocolo:</Text>
                            <List spacing={2}>
                              {protocol.steps.map((step, i) => (
                                <ListItem key={i}>
                                  <HStack align="start">
                                    <Badge colorScheme="blue" minW="25px">{i + 1}</Badge>
                                    <Text fontSize="sm">{step}</Text>
                                  </HStack>
                                </ListItem>
                              ))}
                            </List>
                          </Box>

                          <Box>
                            <Alert status="warning" borderRadius="md">
                              <AlertIcon />
                              <Box>
                                <AlertTitle fontSize="sm">Alertas Importantes:</AlertTitle>
                                <List spacing={1} mt={2}>
                                  {protocol.alerts.map((alert, i) => (
                                    <ListItem key={i} fontSize="xs">
                                      • {alert}
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>
                            </Alert>
                          </Box>
                        </SimpleGrid>
                      </GlassCard>
                    ))}

                    {/* Mejores Prácticas */}
                    <GlassCard p={6} animation={`${fadeInUp} 0.9s ease-out`}>
                      <Heading size="md" mb={4}>
                        Mejores Prácticas
                      </Heading>

                      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                        <Box>
                          <HStack mb={3}>
                            <Icon as={FaLightbulb} color="yellow.500" />
                            <Text fontWeight="bold">Optimización de Recursos</Text>
                          </HStack>
                          <List spacing={2}>
                            <ListItem fontSize="sm">
                              <ListIcon as={FaCheckCircle} color="green.500" />
                              Mantener balance entre tipos de cubículos
                            </ListItem>
                            <ListItem fontSize="sm">
                              <ListIcon as={FaCheckCircle} color="green.500" />
                              Rotar asignaciones para evitar desgaste
                            </ListItem>
                            <ListItem fontSize="sm">
                              <ListIcon as={FaCheckCircle} color="green.500" />
                              Programar mantenimiento preventivo regularmente
                            </ListItem>
                            <ListItem fontSize="sm">
                              <ListIcon as={FaCheckCircle} color="green.500" />
                              Monitorear métricas de uso continuamente
                            </ListItem>
                          </List>
                        </Box>

                        <Box>
                          <HStack mb={3}>
                            <Icon as={FaShieldAlt} color="blue.500" />
                            <Text fontWeight="bold">Seguridad y Calidad</Text>
                          </HStack>
                          <List spacing={2}>
                            <ListItem fontSize="sm">
                              <ListIcon as={FaCheckCircle} color="green.500" />
                              Verificar limpieza antes de cada asignación
                            </ListItem>
                            <ListItem fontSize="sm">
                              <ListIcon as={FaCheckCircle} color="green.500" />
                              Documentar todos los cambios de estado
                            </ListItem>
                            <ListItem fontSize="sm">
                              <ListIcon as={FaCheckCircle} color="green.500" />
                              Mantener registro de incidencias
                            </ListItem>
                            <ListItem fontSize="sm">
                              <ListIcon as={FaCheckCircle} color="green.500" />
                              Actualizar protocolos según necesidad
                            </ListItem>
                          </List>
                        </Box>
                      </SimpleGrid>
                    </GlassCard>
                  </VStack>
                </TabPanel>

                {/* Configuración Tab */}
                <TabPanel px={0}>
                  <VStack spacing={6} align="stretch">
                    <GlassCard p={6} animation={`${fadeInUp} 0.7s ease-out`}>
                      <Heading size="md" mb={4}>
                        Configuración del Sistema
                      </Heading>

                      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                        <Box>
                          <Text fontWeight="bold" mb={3}>Parámetros Generales</Text>
                          <VStack align="stretch" spacing={3}>
                            <FormControl display="flex" alignItems="center">
                              <FormLabel htmlFor="auto-assign" mb="0" flex="1">
                                Asignación automática
                              </FormLabel>
                              <Switch id="auto-assign" colorScheme="blue" />
                            </FormControl>

                            <FormControl display="flex" alignItems="center">
                              <FormLabel htmlFor="notifications" mb="0" flex="1">
                                Notificaciones
                              </FormLabel>
                              <Switch id="notifications" colorScheme="blue" defaultChecked />
                            </FormControl>

                            <FormControl display="flex" alignItems="center">
                              <FormLabel htmlFor="maintenance-alerts" mb="0" flex="1">
                                Alertas de mantenimiento
                              </FormLabel>
                              <Switch id="maintenance-alerts" colorScheme="blue" defaultChecked />
                            </FormControl>

                            <FormControl display="flex" alignItems="center">
                              <FormLabel htmlFor="real-time-sync" mb="0" flex="1">
                                Sincronización en tiempo real
                              </FormLabel>
                              <Switch id="real-time-sync" colorScheme="blue" defaultChecked />
                            </FormControl>
                          </VStack>
                        </Box>

                        <Box>
                          <Text fontWeight="bold" mb={3}>Tiempos y Límites</Text>
                          <VStack align="stretch" spacing={3}>
                            <Box>
                              <Text fontSize="sm" mb={1}>Tiempo máximo de ocupación</Text>
                              <HStack>
                                <Input type="number" defaultValue="30" size="sm" width="80px" />
                                <Text fontSize="sm">minutos</Text>
                              </HStack>
                            </Box>

                            <Box>
                              <Text fontSize="sm" mb={1}>Tiempo de limpieza</Text>
                              <HStack>
                                <Input type="number" defaultValue="5" size="sm" width="80px" />
                                <Text fontSize="sm">minutos</Text>
                              </HStack>
                            </Box>

                            <Box>
                              <Text fontSize="sm" mb={1}>Intervalo de mantenimiento</Text>
                              <HStack>
                                <Input type="number" defaultValue="7" size="sm" width="80px" />
                                <Text fontSize="sm">días</Text>
                              </HStack>
                            </Box>

                            <Box>
                              <Text fontSize="sm" mb={1}>Máximo de asignaciones diarias</Text>
                              <HStack>
                                <Input type="number" defaultValue="15" size="sm" width="80px" />
                                <Text fontSize="sm">por cubículo</Text>
                              </HStack>
                            </Box>
                          </VStack>
                        </Box>
                      </SimpleGrid>

                      <Divider my={6} />

                      <HStack justify="flex-end">
                        <Button variant="outline">Restaurar Valores</Button>
                        <Button colorScheme="blue">Guardar Configuración</Button>
                      </HStack>
                    </GlassCard>

                    {/* Personalización Visual */}
                    <GlassCard p={6} animation={`${fadeInUp} 0.8s ease-out`}>
                      <Heading size="md" mb={4}>
                        Personalización Visual
                      </Heading>

                      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                        <Box>
                          <Text fontWeight="bold" mb={3}>Colores de Estado</Text>
                          <VStack align="stretch" spacing={2}>
                            {cubicleStates.map((state) => (
                              <HStack key={state.status} justify="space-between">
                                <HStack>
                                  <Icon as={state.icon} color={`${state.color}.500`} />
                                  <Text fontSize="sm">{state.label}</Text>
                                </HStack>
                                <HStack>
                                  <Box w="30px" h="30px" bg={`${state.color}.500`} borderRadius="md" />
                                  <Icon as={FaPalette} color="gray.500" cursor="pointer" />
                                </HStack>
                              </HStack>
                            ))}
                          </VStack>
                        </Box>

                        <Box>
                          <Text fontWeight="bold" mb={3}>Opciones de Vista</Text>
                          <VStack align="stretch" spacing={3}>
                            <FormControl display="flex" alignItems="center">
                              <FormLabel htmlFor="show-stats" mb="0" flex="1" fontSize="sm">
                                Mostrar estadísticas
                              </FormLabel>
                              <Switch id="show-stats" size="sm" defaultChecked />
                            </FormControl>

                            <FormControl display="flex" alignItems="center">
                              <FormLabel htmlFor="show-location" mb="0" flex="1" fontSize="sm">
                                Mostrar ubicación
                              </FormLabel>
                              <Switch id="show-location" size="sm" defaultChecked />
                            </FormControl>

                            <FormControl display="flex" alignItems="center">
                              <FormLabel htmlFor="show-timer" mb="0" flex="1" fontSize="sm">
                                Mostrar temporizadores
                              </FormLabel>
                              <Switch id="show-timer" size="sm" defaultChecked />
                            </FormControl>

                            <FormControl display="flex" alignItems="center">
                              <FormLabel htmlFor="animations" mb="0" flex="1" fontSize="sm">
                                Animaciones
                              </FormLabel>
                              <Switch id="animations" size="sm" defaultChecked />
                            </FormControl>
                          </VStack>
                        </Box>
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

export default CubiclesDocumentation;