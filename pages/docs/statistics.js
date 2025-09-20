import React, { useState, useEffect } from 'react';
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
  IconButton,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  useColorModeValue
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaChartBar, FaChartLine, FaChartPie, FaCalendarAlt,
  FaUsers, FaUserMd, FaClock, FaFileExport,
  FaFilter, FaDownload, FaExpand, FaCompress,
  FaTrophy, FaStar, FaArrowUp, FaArrowDown,
  FaPercent, FaCheckCircle, FaTimesCircle,
  FaBullseye, FaRocket, FaLightbulb, FaDatabase,
  FaChartArea, FaHistory, FaExclamationTriangle,
  FaInfoCircle, FaCog, FaSync, FaPrint, FaFilePdf,
  FaFileExcel, FaTable, FaSearch, FaEye,
  FaMedal, FaAward, FaCrown, FaArrowRight, FaArrowLeft
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

const StatisticsDocumentation = () => {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('attendance');
  const [showComparison, setShowComparison] = useState(false);

  // Datos de ejemplo para estadísticas
  const [statistics, setStatistics] = useState({
    daily: {
      totalPatients: 45,
      averageTime: '6:30',
      efficiency: 92,
      noShow: 3
    },
    monthly: {
      totalPatients: 980,
      averageTime: '6:45',
      efficiency: 89,
      trend: 'up'
    },
    phlebotomists: [
      { name: 'Ana García', patients: 210, avgTime: '5:45', rating: 4.8, rank: 1 },
      { name: 'Carlos López', patients: 195, avgTime: '6:15', rating: 4.6, rank: 2 },
      { name: 'María Rodríguez', patients: 185, avgTime: '6:30', rating: 4.7, rank: 3 }
    ]
  });

  // Tipos de estadísticas
  const statisticsTypes = [
    {
      id: 'daily',
      name: 'Estadísticas Diarias',
      icon: FaCalendarAlt,
      description: 'Análisis detallado del día actual',
      color: 'blue',
      metrics: ['Pacientes atendidos', 'Tiempo promedio', 'Tasa de no-show', 'Eficiencia']
    },
    {
      id: 'monthly',
      name: 'Estadísticas Mensuales',
      icon: FaChartBar,
      description: 'Resumen y tendencias del mes',
      color: 'purple',
      metrics: ['Total acumulado', 'Comparación con mes anterior', 'Proyecciones', 'Tendencias']
    },
    {
      id: 'phlebotomist',
      name: 'Por Flebotomista',
      icon: FaUserMd,
      description: 'Rendimiento individual detallado',
      color: 'green',
      metrics: ['Ranking', 'Pacientes atendidos', 'Tiempo promedio', 'Satisfacción']
    },
    {
      id: 'comparative',
      name: 'Análisis Comparativo',
      icon: FaChartLine,
      description: 'Comparación entre períodos',
      color: 'orange',
      metrics: ['Variación porcentual', 'Gráficos comparativos', 'Análisis de tendencias']
    }
  ];

  // Métricas clave
  const keyMetrics = [
    {
      id: 'patients',
      name: 'Pacientes Atendidos',
      value: '45',
      change: '+12%',
      trend: 'increase',
      icon: FaUsers,
      color: 'blue.500',
      description: 'Total de pacientes atendidos en el período'
    },
    {
      id: 'avgTime',
      name: 'Tiempo Promedio',
      value: '6:30',
      change: '-0:45',
      trend: 'decrease',
      icon: FaClock,
      color: 'green.500',
      description: 'Tiempo promedio por atención'
    },
    {
      id: 'efficiency',
      name: 'Eficiencia',
      value: '92%',
      change: '+5%',
      trend: 'increase',
      icon: FaRocket,
      color: 'purple.500',
      description: 'Porcentaje de eficiencia operativa'
    },
    {
      id: 'satisfaction',
      name: 'Satisfacción',
      value: '4.7/5',
      change: '+0.2',
      trend: 'increase',
      icon: FaStar,
      color: 'yellow.500',
      description: 'Calificación promedio de pacientes'
    }
  ];

  // Opciones de exportación
  const exportOptions = [
    {
      id: 'pdf',
      name: 'PDF',
      icon: FaFilePdf,
      color: 'red.500',
      description: 'Reporte completo con gráficos'
    },
    {
      id: 'excel',
      name: 'Excel',
      icon: FaFileExcel,
      color: 'green.500',
      description: 'Datos tabulados para análisis'
    },
    {
      id: 'csv',
      name: 'CSV',
      icon: FaTable,
      color: 'blue.500',
      description: 'Datos sin formato para importación'
    },
    {
      id: 'print',
      name: 'Imprimir',
      icon: FaPrint,
      color: 'gray.500',
      description: 'Versión optimizada para impresión'
    }
  ];

  // Simulación de generación de reporte
  const generateReport = (type) => {
    setIsGeneratingReport(true);
    toast({
      title: `Generando reporte ${type.toUpperCase()}`,
      description: 'Por favor espera mientras se genera el reporte...',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });

    setTimeout(() => {
      setIsGeneratingReport(false);
      toast({
        title: 'Reporte generado exitosamente',
        description: `El reporte ${type.toUpperCase()} ha sido descargado`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }, 2000);
  };

  // Rankings de flebotomistas
  const phlebotomistRankings = [
    { position: 1, name: 'Ana García', score: 98, badge: FaCrown, color: 'gold' },
    { position: 2, name: 'Carlos López', score: 95, badge: FaMedal, color: 'silver' },
    { position: 3, name: 'María Rodríguez', score: 93, badge: FaAward, color: '#CD7F32' }
  ];

  return (
    <ProtectedRoute allowedRoles={['admin', 'flebotomista', 'usuario']}>
      <ChakraProvider theme={modernTheme}>
        <ModernContainer maxW="container.xl">
          <VStack spacing={0} align="center" width="100%">
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              width="100%"
              maxW="1200px"
            >
            {/* Header */}
            <GlassCard mb={8} width="100%">
              <VStack spacing={6} align="center">
                <HStack width="100%" justify="space-between">
                  <Button
                    leftIcon={<FaArrowLeft />}
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/docs')}
                  >
                    Volver
                  </Button>
                  <HStack spacing={2}>
                    <Button
                      leftIcon={<FaSync />}
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.reload()}
                    >
                      Actualizar
                    </Button>
                    <Button
                      leftIcon={<FaFileExport />}
                      size="sm"
                      colorScheme="purple"
                      onClick={() => generateReport('pdf')}
                      isLoading={isGeneratingReport}
                    >
                      Exportar
                    </Button>
                  </HStack>
                </HStack>

                <VStack spacing={4} align="center" width="100%">
                  <Icon as={FaChartBar} boxSize={16} color="purple.500" />
                  <Heading size="xl" textAlign="center">
                    Módulo de Estadísticas
                  </Heading>
                  <Text fontSize="lg" color="gray.600" textAlign="center" maxW="600px" mx="auto">
                    Centro de análisis y métricas del sistema TomaTurno
                  </Text>
                </VStack>

                {/* Navegación rápida */}
                <HStack spacing={4} wrap="wrap" justify="center">
                  {['daily', 'monthly', 'phlebotomist', 'comparative'].map((type) => (
                    <Tag
                      key={type}
                      size="lg"
                      borderRadius="full"
                      variant="subtle"
                      colorScheme={type === selectedPeriod ? 'purple' : 'gray'}
                      cursor="pointer"
                      onClick={() => setSelectedPeriod(type)}
                    >
                      <TagLeftIcon as={statisticsTypes.find(t => t.id === type)?.icon} />
                      <TagLabel>{statisticsTypes.find(t => t.id === type)?.name}</TagLabel>
                    </Tag>
                  ))}
                </HStack>
              </VStack>
            </GlassCard>

            {/* Métricas Principales */}
            <GlassCard mb={8} width="100%">
              <VStack align="stretch" spacing={6}>
                <Heading size="lg">Métricas Principales</Heading>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                  {keyMetrics.map((metric) => (
                    <Box
                      key={metric.id}
                      p={4}
                      borderRadius="xl"
                      bg="white"
                      boxShadow="md"
                      transition="all 0.3s"
                      _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
                      cursor="pointer"
                    >
                      <Stat>
                        <HStack justify="space-between" mb={2}>
                          <Icon as={metric.icon} boxSize={8} color={metric.color} />
                          {metric.trend && (
                            <StatArrow
                              type={metric.trend}
                              color={metric.trend === 'increase' ? 'green.500' : 'red.500'}
                            />
                          )}
                        </HStack>
                        <StatLabel color="gray.600">{metric.name}</StatLabel>
                        <StatNumber fontSize="3xl">{metric.value}</StatNumber>
                        <StatHelpText>
                          <HStack>
                            <Text color={metric.trend === 'increase' ? 'green.500' : 'red.500'}>
                              {metric.change}
                            </Text>
                            <Text color="gray.500">vs período anterior</Text>
                          </HStack>
                        </StatHelpText>
                      </Stat>
                    </Box>
                  ))}
                </SimpleGrid>
              </VStack>
            </GlassCard>

            {/* Tabs de contenido */}
            <Tabs variant="soft-rounded" colorScheme="purple" onChange={setActiveTab}>
              <TabList mb={6}>
                <Tab>📊 Vista General</Tab>
                <Tab>📈 Análisis Diario</Tab>
                <Tab>📅 Análisis Mensual</Tab>
                <Tab>👥 Por Flebotomista</Tab>
                <Tab>⚙️ Configuración</Tab>
              </TabList>

              <TabPanels>
                {/* Vista General */}
                <TabPanel>
                  <VStack spacing={8}>
                    <GlassCard>
                      <VStack align="stretch" spacing={6}>
                        <Heading size="md">Tipos de Estadísticas</Heading>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          {statisticsTypes.map((type) => (
                            <Box
                              key={type.id}
                              p={5}
                              borderRadius="lg"
                              bg={`${type.color}.50`}
                              borderLeft="4px solid"
                              borderColor={`${type.color}.500`}
                            >
                              <HStack mb={3}>
                                <Icon as={type.icon} boxSize={6} color={`${type.color}.500`} />
                                <Heading size="sm">{type.name}</Heading>
                              </HStack>
                              <Text mb={3}>{type.description}</Text>
                              <List spacing={1}>
                                {type.metrics.map((metric, idx) => (
                                  <ListItem key={idx}>
                                    <ListIcon as={FaCheckCircle} color="green.500" />
                                    {metric}
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          ))}
                        </SimpleGrid>
                      </VStack>
                    </GlassCard>

                    <GlassCard>
                      <VStack align="stretch" spacing={6}>
                        <Heading size="md">Opciones de Exportación</Heading>
                        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                          {exportOptions.map((option) => (
                            <Button
                              key={option.id}
                              size="lg"
                              variant="outline"
                              colorScheme={option.color.split('.')[0]}
                              leftIcon={<Icon as={option.icon} />}
                              onClick={() => generateReport(option.id)}
                              isLoading={isGeneratingReport}
                            >
                              {option.name}
                            </Button>
                          ))}
                        </SimpleGrid>
                      </VStack>
                    </GlassCard>
                  </VStack>
                </TabPanel>

                {/* Análisis Diario */}
                <TabPanel>
                  <VStack spacing={8}>
                    <GlassCard>
                      <VStack align="stretch" spacing={6}>
                        <Heading size="md">Estadísticas del Día</Heading>

                        <Alert status="info" borderRadius="lg">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Período actual</AlertTitle>
                            <AlertDescription>
                              Mostrando datos de hoy: {new Date().toLocaleDateString('es-MX')}
                            </AlertDescription>
                          </Box>
                        </Alert>

                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                          <Box p={4} bg="blue.50" borderRadius="lg">
                            <Text fontWeight="bold" color="blue.700">Pacientes Atendidos</Text>
                            <Text fontSize="3xl" fontWeight="bold">45</Text>
                            <Progress value={75} colorScheme="blue" mt={2} />
                            <Text fontSize="sm" color="gray.600">75% del objetivo diario</Text>
                          </Box>
                          <Box p={4} bg="green.50" borderRadius="lg">
                            <Text fontWeight="bold" color="green.700">Tiempo Promedio</Text>
                            <Text fontSize="3xl" fontWeight="bold">6:30</Text>
                            <Badge colorScheme="green">Óptimo</Badge>
                          </Box>
                          <Box p={4} bg="purple.50" borderRadius="lg">
                            <Text fontWeight="bold" color="purple.700">Eficiencia</Text>
                            <Text fontSize="3xl" fontWeight="bold">92%</Text>
                            <HStack>
                              <Icon as={FaArrowUp} color="green.500" />
                              <Text fontSize="sm" color="green.500">+5% vs ayer</Text>
                            </HStack>
                          </Box>
                        </SimpleGrid>

                        <Divider />

                        <VStack align="stretch" spacing={4}>
                          <Heading size="sm">Distribución por Hora</Heading>
                          <Box bg="gray.50" p={4} borderRadius="lg" height="200px">
                            <Text color="gray.600" textAlign="center" mt="80px">
                              [Gráfico de barras por hora]
                            </Text>
                          </Box>
                        </VStack>

                        <VStack align="stretch" spacing={4}>
                          <Heading size="sm">Detalles por Cubículo</Heading>
                          <TableContainer>
                            <Table variant="simple" size="sm">
                              <Thead>
                                <Tr>
                                  <Th>Cubículo</Th>
                                  <Th isNumeric>Pacientes</Th>
                                  <Th isNumeric>Tiempo Prom.</Th>
                                  <Th isNumeric>Eficiencia</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                <Tr>
                                  <Td>Cubículo 1</Td>
                                  <Td isNumeric>15</Td>
                                  <Td isNumeric>6:15</Td>
                                  <Td isNumeric>94%</Td>
                                </Tr>
                                <Tr>
                                  <Td>Cubículo 2</Td>
                                  <Td isNumeric>12</Td>
                                  <Td isNumeric>6:45</Td>
                                  <Td isNumeric>89%</Td>
                                </Tr>
                                <Tr>
                                  <Td>Cubículo 3 (Especial)</Td>
                                  <Td isNumeric>18</Td>
                                  <Td isNumeric>6:30</Td>
                                  <Td isNumeric>93%</Td>
                                </Tr>
                              </Tbody>
                            </Table>
                          </TableContainer>
                        </VStack>
                      </VStack>
                    </GlassCard>
                  </VStack>
                </TabPanel>

                {/* Análisis Mensual */}
                <TabPanel>
                  <VStack spacing={8}>
                    <GlassCard>
                      <VStack align="stretch" spacing={6}>
                        <HStack justify="space-between">
                          <Heading size="md">Estadísticas Mensuales</Heading>
                          <Select width="200px" defaultValue="current">
                            <option value="current">Mes Actual</option>
                            <option value="previous">Mes Anterior</option>
                            <option value="custom">Personalizado</option>
                          </Select>
                        </HStack>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          <Box>
                            <VStack align="stretch" spacing={4}>
                              <Text fontWeight="bold">Resumen del Mes</Text>
                              <Box bg="purple.50" p={4} borderRadius="lg">
                                <HStack justify="space-between" mb={2}>
                                  <Text>Total de Pacientes:</Text>
                                  <Text fontWeight="bold" fontSize="xl">980</Text>
                                </HStack>
                                <HStack justify="space-between" mb={2}>
                                  <Text>Tiempo Promedio:</Text>
                                  <Text fontWeight="bold" fontSize="xl">6:45</Text>
                                </HStack>
                                <HStack justify="space-between" mb={2}>
                                  <Text>Días Laborables:</Text>
                                  <Text fontWeight="bold" fontSize="xl">22</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text>Promedio Diario:</Text>
                                  <Text fontWeight="bold" fontSize="xl">44.5</Text>
                                </HStack>
                              </Box>
                            </VStack>
                          </Box>

                          <Box>
                            <VStack align="stretch" spacing={4}>
                              <Text fontWeight="bold">Comparación con Mes Anterior</Text>
                              <Box bg="green.50" p={4} borderRadius="lg">
                                <HStack justify="space-between" mb={2}>
                                  <Text>Variación Pacientes:</Text>
                                  <Badge colorScheme="green">+8%</Badge>
                                </HStack>
                                <HStack justify="space-between" mb={2}>
                                  <Text>Variación Tiempo:</Text>
                                  <Badge colorScheme="green">-12%</Badge>
                                </HStack>
                                <HStack justify="space-between" mb={2}>
                                  <Text>Variación Eficiencia:</Text>
                                  <Badge colorScheme="green">+5%</Badge>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text>Satisfacción:</Text>
                                  <Badge colorScheme="yellow">+0.2</Badge>
                                </HStack>
                              </Box>
                            </VStack>
                          </Box>
                        </SimpleGrid>

                        <VStack align="stretch" spacing={4}>
                          <Text fontWeight="bold">Tendencia Mensual</Text>
                          <Box bg="gray.50" p={6} borderRadius="lg" height="250px">
                            <Text color="gray.600" textAlign="center" mt="100px">
                              [Gráfico de líneas con tendencia mensual]
                            </Text>
                          </Box>
                        </VStack>

                        <VStack align="stretch" spacing={4}>
                          <Text fontWeight="bold">Días con Mayor Actividad</Text>
                          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                            <Box p={3} bg="red.50" borderRadius="lg">
                              <HStack justify="space-between">
                                <Text fontWeight="bold">Lun 15</Text>
                                <Badge colorScheme="red">68 pacientes</Badge>
                              </HStack>
                            </Box>
                            <Box p={3} bg="orange.50" borderRadius="lg">
                              <HStack justify="space-between">
                                <Text fontWeight="bold">Mie 3</Text>
                                <Badge colorScheme="orange">62 pacientes</Badge>
                              </HStack>
                            </Box>
                            <Box p={3} bg="yellow.50" borderRadius="lg">
                              <HStack justify="space-between">
                                <Text fontWeight="bold">Vie 19</Text>
                                <Badge colorScheme="yellow">58 pacientes</Badge>
                              </HStack>
                            </Box>
                          </SimpleGrid>
                        </VStack>
                      </VStack>
                    </GlassCard>
                  </VStack>
                </TabPanel>

                {/* Por Flebotomista */}
                <TabPanel>
                  <VStack spacing={8}>
                    <GlassCard>
                      <VStack align="stretch" spacing={6}>
                        <HStack justify="space-between">
                          <Heading size="md">Rendimiento por Flebotomista</Heading>
                          <HStack>
                            <Switch colorScheme="purple">Solo Activos</Switch>
                            <Select width="150px" size="sm">
                              <option>Este Mes</option>
                              <option>Última Semana</option>
                              <option>Hoy</option>
                            </Select>
                          </HStack>
                        </HStack>

                        {/* Top 3 Ranking */}
                        <Box>
                          <Text fontWeight="bold" mb={4}>🏆 Top Performers</Text>
                          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                            {phlebotomistRankings.map((performer) => (
                              <Box
                                key={performer.position}
                                p={4}
                                bg="white"
                                borderRadius="lg"
                                boxShadow="md"
                                borderTop="4px solid"
                                borderColor={performer.color}
                              >
                                <VStack spacing={3}>
                                  <Icon
                                    as={performer.badge}
                                    boxSize={8}
                                    color={performer.color}
                                  />
                                  <Text fontWeight="bold" fontSize="lg">
                                    {performer.name}
                                  </Text>
                                  <HStack>
                                    <Badge colorScheme="purple" fontSize="md">
                                      #{performer.position}
                                    </Badge>
                                    <Text fontWeight="bold" fontSize="xl">
                                      {performer.score}%
                                    </Text>
                                  </HStack>
                                </VStack>
                              </Box>
                            ))}
                          </SimpleGrid>
                        </Box>

                        {/* Tabla detallada */}
                        <TableContainer>
                          <Table variant="striped" colorScheme="gray">
                            <Thead>
                              <Tr>
                                <Th>Rank</Th>
                                <Th>Flebotomista</Th>
                                <Th isNumeric>Pacientes</Th>
                                <Th isNumeric>Tiempo Prom.</Th>
                                <Th isNumeric>Eficiencia</Th>
                                <Th isNumeric>Satisfacción</Th>
                                <Th>Estado</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {statistics.phlebotomists.map((phlebotomist, idx) => (
                                <Tr key={idx}>
                                  <Td>
                                    <Badge colorScheme={idx === 0 ? 'gold' : idx === 1 ? 'gray' : idx === 2 ? 'orange' : 'blue'}>
                                      #{phlebotomist.rank}
                                    </Badge>
                                  </Td>
                                  <Td>
                                    <HStack>
                                      <Avatar size="sm" name={phlebotomist.name} />
                                      <Text>{phlebotomist.name}</Text>
                                    </HStack>
                                  </Td>
                                  <Td isNumeric>{phlebotomist.patients}</Td>
                                  <Td isNumeric>{phlebotomist.avgTime}</Td>
                                  <Td isNumeric>
                                    <Badge colorScheme="green">95%</Badge>
                                  </Td>
                                  <Td isNumeric>
                                    <HStack justify="flex-end">
                                      <Text>{phlebotomist.rating}</Text>
                                      <Icon as={FaStar} color="yellow.400" />
                                    </HStack>
                                  </Td>
                                  <Td>
                                    <Badge colorScheme="green">Activo</Badge>
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </TableContainer>

                        {/* Métricas individuales */}
                        <Box>
                          <Text fontWeight="bold" mb={4}>Métricas Detalladas</Text>
                          <Accordion allowToggle>
                            {statistics.phlebotomists.map((phlebotomist, idx) => (
                              <AccordionItem key={idx}>
                                <AccordionButton>
                                  <Box flex="1" textAlign="left">
                                    <HStack>
                                      <Avatar size="xs" name={phlebotomist.name} />
                                      <Text fontWeight="bold">{phlebotomist.name}</Text>
                                    </HStack>
                                  </Box>
                                  <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel pb={4}>
                                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                    <Box>
                                      <Text fontSize="sm" color="gray.600" mb={2}>Estadísticas del Período</Text>
                                      <VStack align="stretch" spacing={2}>
                                        <HStack justify="space-between">
                                          <Text>Total Pacientes:</Text>
                                          <Text fontWeight="bold">{phlebotomist.patients}</Text>
                                        </HStack>
                                        <HStack justify="space-between">
                                          <Text>Tiempo Promedio:</Text>
                                          <Text fontWeight="bold">{phlebotomist.avgTime}</Text>
                                        </HStack>
                                        <HStack justify="space-between">
                                          <Text>Satisfacción:</Text>
                                          <Text fontWeight="bold">{phlebotomist.rating}/5</Text>
                                        </HStack>
                                      </VStack>
                                    </Box>
                                    <Box>
                                      <Text fontSize="sm" color="gray.600" mb={2}>Comparación con Promedio</Text>
                                      <VStack align="stretch" spacing={2}>
                                        <HStack justify="space-between">
                                          <Text>vs Promedio Pacientes:</Text>
                                          <Badge colorScheme="green">+15%</Badge>
                                        </HStack>
                                        <HStack justify="space-between">
                                          <Text>vs Tiempo Promedio:</Text>
                                          <Badge colorScheme="green">-10%</Badge>
                                        </HStack>
                                        <HStack justify="space-between">
                                          <Text>Tendencia:</Text>
                                          <Icon as={FaArrowUp} color="green.500" />
                                        </HStack>
                                      </VStack>
                                    </Box>
                                  </SimpleGrid>
                                </AccordionPanel>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </Box>
                      </VStack>
                    </GlassCard>
                  </VStack>
                </TabPanel>

                {/* Configuración */}
                <TabPanel>
                  <VStack spacing={8}>
                    <GlassCard>
                      <VStack align="stretch" spacing={6}>
                        <Heading size="md">Configuración de Estadísticas</Heading>

                        <Alert status="warning" borderRadius="lg">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Permisos Administrativos</AlertTitle>
                            <AlertDescription>
                              Solo los administradores pueden modificar estas configuraciones
                            </AlertDescription>
                          </Box>
                        </Alert>

                        <VStack align="stretch" spacing={4}>
                          <Text fontWeight="bold">Períodos de Análisis</Text>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl>
                              <FormLabel>Horario de Corte Diario</FormLabel>
                              <Input type="time" defaultValue="23:59" />
                            </FormControl>
                            <FormControl>
                              <FormLabel>Inicio de Semana</FormLabel>
                              <Select defaultValue="monday">
                                <option value="sunday">Domingo</option>
                                <option value="monday">Lunes</option>
                              </Select>
                            </FormControl>
                            <FormControl>
                              <FormLabel>Cierre de Mes</FormLabel>
                              <Select defaultValue="last">
                                <option value="last">Último día del mes</option>
                                <option value="30">Día 30</option>
                                <option value="custom">Personalizado</option>
                              </Select>
                            </FormControl>
                            <FormControl>
                              <FormLabel>Zona Horaria</FormLabel>
                              <Select defaultValue="america/mexico">
                                <option value="america/mexico">América/Ciudad de México</option>
                                <option value="utc">UTC</option>
                              </Select>
                            </FormControl>
                          </SimpleGrid>
                        </VStack>

                        <Divider />

                        <VStack align="stretch" spacing={4}>
                          <Text fontWeight="bold">Métricas y Objetivos</Text>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl>
                              <FormLabel>Objetivo Diario de Pacientes</FormLabel>
                              <Input type="number" defaultValue="60" />
                            </FormControl>
                            <FormControl>
                              <FormLabel>Tiempo Objetivo (minutos)</FormLabel>
                              <Input type="number" defaultValue="6" />
                            </FormControl>
                            <FormControl>
                              <FormLabel>Eficiencia Mínima (%)</FormLabel>
                              <Input type="number" defaultValue="85" />
                            </FormControl>
                            <FormControl>
                              <FormLabel>Satisfacción Objetivo</FormLabel>
                              <Input type="number" step="0.1" defaultValue="4.5" />
                            </FormControl>
                          </SimpleGrid>
                        </VStack>

                        <Divider />

                        <VStack align="stretch" spacing={4}>
                          <Text fontWeight="bold">Notificaciones y Alertas</Text>
                          <VStack align="stretch" spacing={3}>
                            <HStack justify="space-between">
                              <Text>Alerta por baja eficiencia</Text>
                              <Switch colorScheme="purple" defaultChecked />
                            </HStack>
                            <HStack justify="space-between">
                              <Text>Reporte diario automático</Text>
                              <Switch colorScheme="purple" defaultChecked />
                            </HStack>
                            <HStack justify="space-between">
                              <Text>Resumen semanal por email</Text>
                              <Switch colorScheme="purple" />
                            </HStack>
                            <HStack justify="space-between">
                              <Text>Notificar records alcanzados</Text>
                              <Switch colorScheme="purple" defaultChecked />
                            </HStack>
                          </VStack>
                        </VStack>

                        <HStack justify="flex-end" spacing={4}>
                          <Button variant="outline">Cancelar</Button>
                          <Button colorScheme="purple" leftIcon={<FaCheckCircle />}>
                            Guardar Configuración
                          </Button>
                        </HStack>
                      </VStack>
                    </GlassCard>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>

            {/* Tips y mejores prácticas */}
            <GlassCard mt={8}>
              <VStack align="stretch" spacing={6}>
                <Heading size="md">
                  <Icon as={FaLightbulb} color="yellow.500" mr={2} />
                  Tips y Mejores Prácticas
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box p={4} bg="blue.50" borderRadius="lg">
                    <HStack mb={2}>
                      <Icon as={FaBullseye} color="blue.500" />
                      <Text fontWeight="bold">Análisis Diario</Text>
                    </HStack>
                    <Text fontSize="sm">
                      Revisa las estadísticas diarias cada mañana para identificar
                      patrones y ajustar la asignación de recursos.
                    </Text>
                  </Box>
                  <Box p={4} bg="green.50" borderRadius="lg">
                    <HStack mb={2}>
                      <Icon as={FaChartLine} color="green.500" />
                      <Text fontWeight="bold">Tendencias Mensuales</Text>
                    </HStack>
                    <Text fontSize="sm">
                      Compara las tendencias mensuales para identificar temporadas
                      de alta demanda y planificar con anticipación.
                    </Text>
                  </Box>
                  <Box p={4} bg="purple.50" borderRadius="lg">
                    <HStack mb={2}>
                      <Icon as={FaTrophy} color="purple.500" />
                      <Text fontWeight="bold">Reconocimiento</Text>
                    </HStack>
                    <Text fontSize="sm">
                      Utiliza los rankings para reconocer el buen desempeño y
                      motivar al equipo de flebotomistas.
                    </Text>
                  </Box>
                  <Box p={4} bg="orange.50" borderRadius="lg">
                    <HStack mb={2}>
                      <Icon as={FaFileExport} color="orange.500" />
                      <Text fontWeight="bold">Exportación Regular</Text>
                    </HStack>
                    <Text fontSize="sm">
                      Exporta reportes semanalmente para mantener un histórico
                      completo y facilitar auditorías.
                    </Text>
                  </Box>
                </SimpleGrid>
              </VStack>
            </GlassCard>
          </MotionBox>
          </VStack>
        </ModernContainer>
      </ChakraProvider>
    </ProtectedRoute>
  );
};

export default StatisticsDocumentation;