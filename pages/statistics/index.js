import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Grid, 
  Flex, 
  ChakraProvider, 
  SimpleGrid,
  Button,
  IconButton,
  Select,
  Badge,
  Progress,
  Spinner,
  VStack,
  HStack,
  Tooltip,
  useToast,
  Avatar,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from "@chakra-ui/react";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);
import { 
  FaCalendarAlt, 
  FaChartBar, 
  FaUsers, 
  FaClock, 
  FaArrowUp, 
  FaDownload, 
  FaEye, 
  FaStar,
  FaCheckCircle,
  FaExclamationTriangle,
  FaChevronRight,
  FaUserMd,
  FaArrowLeft
} from 'react-icons/fa';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { modernTheme, fadeInUp, slideInFromRight, slideInFromLeft, GlassCard, ModernContainer, ModernHeader } from '../../components/theme/ModernTheme';

const StatisticsDashboard = memo(function StatisticsDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const userRole = user?.role;
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [dashboardData, setDashboardData] = useState({
    overview: {},
    monthlyData: [],
    dailyData: [],
    phlebotomistData: [],
    trends: {}
  });

  const toast = useToast();

  // Effect para marcar el componente como montado
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cargar datos simulados - Optimizado con useCallback
  const loadDashboardData = useCallback(() => {
    setTimeout(() => {
      setDashboardData({
        overview: {
          totalPatients: 2847,
          totalToday: 127,
          averageWaitTime: 18.5,
          efficiency: 94.2,
          activePhlebotomists: 8,
          completedToday: 96,
          trendsPatients: 12.5,
          trendsEfficiency: 3.2,
          trendsWaitTime: -8.1
        },
        monthlyData: [
          { month: 'Ene', pacientes: 245, promedio: 16.2, porcentaje: 60 },
          { month: 'Feb', pacientes: 289, promedio: 15.8, porcentaje: 70 },
          { month: 'Mar', pacientes: 324, promedio: 17.1, porcentaje: 80 },
          { month: 'Abr', pacientes: 298, promedio: 16.9, porcentaje: 73 },
          { month: 'May', pacientes: 387, promedio: 18.2, porcentaje: 95 },
          { month: 'Jun', pacientes: 412, promedio: 17.5, porcentaje: 100 },
          { month: 'Jul', pacientes: 456, promedio: 19.1, porcentaje: 88 },
          { month: 'Ago', pacientes: 431, promedio: 18.7, porcentaje: 84 }
        ],
        dailyData: [
          { day: 'Lun', pacientes: 45, tiempo: 17.2, porcentaje: 90 },
          { day: 'Mar', pacientes: 52, tiempo: 16.8, porcentaje: 100 },
          { day: 'Mié', pacientes: 48, tiempo: 18.1, porcentaje: 85 },
          { day: 'Jue', pacientes: 41, tiempo: 17.5, porcentaje: 75 },
          { day: 'Vie', pacientes: 38, tiempo: 16.9, porcentaje: 70 },
          { day: 'Sáb', pacientes: 28, tiempo: 15.2, porcentaje: 55 },
          { day: 'Dom', pacientes: 22, tiempo: 14.8, porcentaje: 40 }
        ],
        phlebotomistData: [
          { 
            name: 'María García', 
            pacientes: 156, 
            tiempo: 16.2, 
            eficiencia: 96.5,
            status: 'active',
            especialidad: 'Pediatría',
            rating: 4.9
          },
          { 
            name: 'Carlos López', 
            pacientes: 142, 
            tiempo: 17.8, 
            eficiencia: 94.2,
            status: 'active',
            especialidad: 'General',
            rating: 4.7
          },
          { 
            name: 'Ana Rodríguez', 
            pacientes: 134, 
            tiempo: 15.9, 
            eficiencia: 97.1,
            status: 'break',
            especialidad: 'Geriatría',
            rating: 4.8
          },
          { 
            name: 'Luis Martínez', 
            pacientes: 128, 
            tiempo: 18.5, 
            eficiencia: 92.8,
            status: 'active',
            especialidad: 'General',
            rating: 4.6
          },
          { 
            name: 'Sofia Hernández', 
            pacientes: 119, 
            tiempo: 16.7, 
            eficiencia: 95.3,
            status: 'inactive',
            especialidad: 'Urgencias',
            rating: 4.5
          }
        ]
      });
      setLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadDashboardData();
    }
  }, [mounted, loadDashboardData]);

  // Función para navegar a vistas detalladas - Optimizada con useCallback
  const navigateToDetail = useCallback((page) => {
    router.push(`/statistics/${page}`);
  }, [router]);

  // Función para exportar datos - Optimizada con useCallback
  const handleExport = useCallback(async (format, metric = 'overview') => {
    setExportLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: `Exportación ${format.toUpperCase()} exitosa`,
        description: `El reporte de ${metric} ha sido descargado correctamente.`,
        status: 'success',
        duration: 4000,
        isClosable: true,
        position: 'top-right'
      });
    } catch (error) {
      toast({
        title: 'Error en la exportación',
        description: 'No se pudo generar el reporte. Intenta nuevamente.',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setExportLoading(false);
    }
  }, [toast]);

  // Función para obtener iniciales del nombre - Memoizada
  const getInitials = useCallback((name) => {
    if (!name) return "??";
    return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
  }, []);

  // Componente de gráfica de barras simple - Optimizado
  const SimpleBarChart = useMemo(() => {
    const BarChart = ({ data, dataKey, height = "200px", color = "#4F7DF3" }) => {
    const maxValue = Math.max(...data.map(item => item[dataKey]));
    
    return (
      <HStack spacing={2} align="end" justify="center" h={height} px={4}>
        {data.map((item, index) => (
          <VStack key={index} spacing={2} flex={1}>
            <Tooltip label={`${item[dataKey]} ${dataKey}`} hasArrow>
              <Box
                background={`linear-gradient(135deg, ${color} 0%, #6B73FF 100%)`}
                borderRadius="lg"
                w="full"
                h={`${(item[dataKey] / maxValue) * 80}%`}
                minH="20px"
                cursor="pointer"
                _hover={{ opacity: 0.8, transform: 'translateY(-2px)' }}
                transition="all 0.3s ease"
                boxShadow="sm"
              />
            </Tooltip>
            <Text fontSize="xs" color="secondary.600" textAlign="center" fontWeight="medium">
              {item.month || item.day}
            </Text>
          </VStack>
        ))}
      </HStack>
    );
    };
    BarChart.displayName = 'SimpleBarChart';
    return BarChart;
  }, []);

  // Componente de progreso circular - Optimizado
  const SimpleProgressRing = useMemo(() => {
    const ProgressRing = ({ value, size = 80, strokeWidth = 8, color = "#4F7DF3" }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
      <Box position="relative" w={`${size}px`} h={`${size}px`}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
          />
        </svg>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          textAlign="center"
        >
          <Text fontSize="lg" fontWeight="bold" color="secondary.800">
            {value}%
          </Text>
        </Box>
      </Box>
    );
    };
    ProgressRing.displayName = 'SimpleProgressRing';
    return ProgressRing;
  }, []);

  // No renderizar hasta que esté montado para evitar errores de hidratación
  if (!mounted) {
    return (
      <ChakraProvider theme={modernTheme}>
        <ModernContainer>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
          >
            <GlassCard p={8} textAlign="center">
              <Spinner size="xl" color="primary.500" thickness="4px" mb={4} />
              <Text fontSize="xl" color="secondary.600">
                Cargando Dashboard de Estadísticas...
              </Text>
            </GlassCard>
          </Box>
        </ModernContainer>
      </ChakraProvider>
    );
  }

  if (loading) {
    return (
      <ChakraProvider theme={modernTheme}>
        <ModernContainer>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
          >
            <GlassCard p={8} textAlign="center">
              <Spinner size="xl" color="primary.500" thickness="4px" mb={4} />
              <VStack spacing={3}>
                <Heading size="lg" color="secondary.700">
                  Cargando Dashboard
                </Heading>
                <Text color="secondary.500">
                  Procesando datos estadísticos...
                </Text>
              </VStack>
            </GlassCard>
          </Box>
        </ModernContainer>
      </ChakraProvider>
    );
  }

  // Configurar acceso según el rol
  const isAdmin = userRole === 'Administrador';
  const isFlebotomista = userRole === 'Flebotomista';

  return (
    <ChakraProvider theme={modernTheme}>
      <ModernContainer>
        {/* Header Principal con Glassmorphism */}
        <ModernHeader
          title="Dashboard de Estadísticas"
          subtitle={isAdmin ? "Sistema Inteligente de Análisis de Turnos - Vista Completa" : "Estadísticas Operativas - Vista de Flebotomista"}
        >
          <Flex gap={4} align="center">
            <Button
              leftIcon={<FaArrowLeft />}
              variant="outline"
              size="sm"
              onClick={() => router.push('/')}
              _hover={{
                transform: 'translateY(-1px)',
                boxShadow: 'md'
              }}
            >
              Volver
            </Button>
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              variant="modern"
              size="sm"
              maxW="200px"
            >
              <option value="today">Hoy</option>
              <option value="thisWeek">Esta Semana</option>
              <option value="thisMonth">Este Mes</option>
              <option value="lastMonth">Mes Anterior</option>
              <option value="thisYear">Este Año</option>
            </Select>
            <Tooltip label="Exportar a Excel" hasArrow>
              <IconButton
                icon={<FaDownload />}
                variant="gradient"
                size="sm"
                onClick={() => handleExport('excel')}
                isLoading={exportLoading}
              />
            </Tooltip>
          </Flex>
        </ModernHeader>
        
        {/* Botón de Volver */}
        <Flex align="center" gap={4} justify="flex-start" mb={6}>
          <Button
            leftIcon={<FaArrowLeft />}
            onClick={() => router.push("/")}
            variant="outline"
            colorScheme="gray"
            size="sm"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'md'
            }}
          >
            Volver
          </Button>
        </Flex>
        
        {/* Métricas Principales */}
        <SimpleGrid columns={{ base: 1, sm: 2, md: 2, lg: 4 }} spacing={{ base: 4, md: 6 }} mb={4}>
          {/* Total de Pacientes */}
          <GlassCard
            p={4}
            cursor="pointer"
            onClick={() => navigateToDetail('monthly')}
            _hover={{ 
              transform: 'translateY(-4px)', 
              boxShadow: 'xl',
              background: "rgba(255, 255, 255, 0.35)"
            }}
            transition="all 0.3s ease"
            animation={`${fadeInUp} 0.6s ease-out`}
            position="relative"
            overflow="hidden"
          >
            {/* Decorative gradient line */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              height="3px"
              background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
              borderTopRadius="2xl"
            />
            
            <Flex justify="space-between" align="center" mb={4}>
              <Box
                w={{ base: 10, md: 12 }}
                h={{ base: 10, md: 12 }}
                borderRadius="xl"
                background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                boxShadow="lg"
              >
                <Box as={FaCalendarAlt} fontSize={{ base: "lg", md: "xl" }} />
              </Box>
              <Box as={FaChevronRight} color="secondary.400" fontSize="lg" />
            </Flex>
            
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="secondary.600" fontWeight="medium">
                Total Pacientes
              </Text>
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="extrabold" color="secondary.800" lineHeight="1">
                {dashboardData.overview.totalPatients?.toLocaleString()}
              </Text>
              <HStack spacing={2}>
                <Box
                  as={FaArrowUp}
                  color="success"
                  fontSize="sm"
                />
                <Text fontSize="sm" color="success" fontWeight="semibold">
                  +{dashboardData.overview.trendsPatients}% este mes
                </Text>
              </HStack>
            </VStack>
          </GlassCard>

          {/* Pacientes Hoy */}
          <GlassCard
            p={4}
            cursor="pointer"
            onClick={() => navigateToDetail('daily')}
            _hover={{ 
              transform: 'translateY(-4px)', 
              boxShadow: 'xl',
              background: "rgba(255, 255, 255, 0.35)"
            }}
            transition="all 0.3s ease"
            animation={`${fadeInUp} 0.8s ease-out`}
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              height="3px"
              background="linear-gradient(135deg, #10b981 0%, #059669 100%)"
              borderTopRadius="2xl"
            />
            
            <Flex justify="space-between" align="center" mb={4}>
              <Box
                w={12}
                h={12}
                borderRadius="xl"
                background="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                boxShadow="lg"
              >
                <Box as={FaEye} fontSize="xl" />
              </Box>
              <Box as={FaChevronRight} color="secondary.400" fontSize="lg" />
            </Flex>
            
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="secondary.600" fontWeight="medium">
                Pacientes Hoy
              </Text>
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="extrabold" color="secondary.800" lineHeight="1">
                {dashboardData.overview.totalToday}
              </Text>
              <Progress 
                value={(dashboardData.overview.totalToday / 150) * 100} 
                background="rgba(255, 255, 255, 0.3)"
                sx={{
                  '& > div': {
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  }
                }}
                size="sm" 
                borderRadius="full"
                w="full"
              />
              <Text fontSize="xs" color="secondary.500">
                Meta diaria: 150 pacientes
              </Text>
            </VStack>
          </GlassCard>

          {/* Tiempo Promedio */}
          <GlassCard
            p={4}
            cursor="pointer"
            onClick={() => navigateToDetail('average-time')}
            _hover={{ 
              transform: 'translateY(-4px)', 
              boxShadow: 'xl',
              background: "rgba(255, 255, 255, 0.35)"
            }}
            transition="all 0.3s ease"
            animation={`${fadeInUp} 1.0s ease-out`}
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              height="3px"
              background="linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
              borderTopRadius="2xl"
            />
            
            <Flex justify="space-between" align="center" mb={4}>
              <Box
                w={12}
                h={12}
                borderRadius="xl"
                background="linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                boxShadow="lg"
              >
                <Box as={FaClock} fontSize="xl" />
              </Box>
              <Box as={FaChevronRight} color="secondary.400" fontSize="lg" />
            </Flex>
            
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="secondary.600" fontWeight="medium">
                Tiempo Promedio
              </Text>
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="extrabold" color="secondary.800" lineHeight="1">
                {dashboardData.overview.averageWaitTime} min
              </Text>
              <HStack spacing={2}>
                <Box
                  as={FaArrowUp}
                  color="success"
                  fontSize="sm"
                  transform="rotate(180deg)"
                />
                <Text fontSize="sm" color="success" fontWeight="semibold">
                  -{Math.abs(dashboardData.overview.trendsWaitTime)}% mejor
                </Text>
              </HStack>
            </VStack>
          </GlassCard>

          {/* Eficiencia */}
          <GlassCard
            p={4}
            cursor="pointer"
            onClick={() => navigateToDetail('phlebotomists')}
            _hover={{ 
              transform: 'translateY(-4px)', 
              boxShadow: 'xl',
              background: "rgba(255, 255, 255, 0.35)"
            }}
            transition="all 0.3s ease"
            animation={`${fadeInUp} 1.2s ease-out`}
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              height="3px"
              background="linear-gradient(135deg, #6B73FF 0%, #9333EA 100%)"
              borderTopRadius="2xl"
            />
            
            <Flex justify="space-between" align="center" mb={4}>
              <Box
                w={12}
                h={12}
                borderRadius="xl"
                background="linear-gradient(135deg, #6B73FF 0%, #9333EA 100%)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                boxShadow="lg"
              >
                <Box as={FaChartBar} fontSize="xl" />
              </Box>
              <Box as={FaChevronRight} color="secondary.400" fontSize="lg" />
            </Flex>
            
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="secondary.600" fontWeight="medium">
                Eficiencia
              </Text>
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="extrabold" color="secondary.800" lineHeight="1">
                {dashboardData.overview.efficiency}%
              </Text>
              <HStack spacing={2}>
                <Box
                  as={FaArrowUp}
                  color="success"
                  fontSize="sm"
                />
                <Text fontSize="sm" color="success" fontWeight="semibold">
                  +{dashboardData.overview.trendsEfficiency}% este mes
                </Text>
              </HStack>
            </VStack>
          </GlassCard>
        </SimpleGrid>

        {/* Gráficas Principales */}
        <Grid templateColumns={{ base: '1fr', md: '1fr', lg: isAdmin ? '2fr 1fr' : '1fr' }} gap={{ base: 3, md: 4 }} mb={4}>
          {/* Gráfica de Tendencias Mensuales - Layout Optimizado */}
          <GlassCard p={{ base: 2, md: 3 }} animation={`${slideInFromLeft} 0.8s ease-out`} h="fit-content">
            {/* Header compacto */}
            <Flex justify="space-between" align="center" mb={2}>
              <HStack spacing={3}>
                <VStack align="start" spacing={0}>
                  <Heading size="sm" color="secondary.800" fontWeight="bold">
                    Tendencias Mensuales
                  </Heading>
                  <Text color="secondary.500" fontSize="2xs">
                    Pacientes por mes
                  </Text>
                </VStack>
              </HStack>
              <HStack spacing={1}>
                <IconButton
                  icon={<FaDownload />}
                  size="xs"
                  variant="ghost"
                  onClick={() => handleExport('excel', 'monthly')}
                />
                <IconButton
                  icon={<FaEye />}
                  size="xs"
                  variant="ghost"
                  onClick={() => navigateToDetail('monthly')}
                />
              </HStack>
            </Flex>
            
            {/* Layout compacto side by side */}
            <Grid 
              templateColumns={{ base: '1fr', md: '2fr 1fr' }} 
              gap={2} 
              alignItems="start"
              minH="180px"
            >
              {/* Gráfico más grande y compacto */}
              <Box h="100%">
                <Box height={{ base: "180px", md: "200px" }}>
                  <Bar
                    data={{
                      labels: dashboardData.monthlyData.map(item => item.month),
                      datasets: [{
                        label: 'Pacientes',
                        data: dashboardData.monthlyData.map(item => item.pacientes),
                        backgroundColor: 'rgba(79, 125, 243, 0.7)',
                        borderColor: '#4F7DF3',
                        borderWidth: 2,
                        borderRadius: 6,
                        borderSkipped: false,
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      layout: {
                        padding: {
                          top: 20,
                          right: 10,
                          bottom: 10,
                          left: 10
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(148, 163, 184, 0.2)',
                            drawBorder: true,
                          },
                          ticks: {
                            color: '#64748b',
                            font: {
                              size: 11,
                              weight: '500'
                            },
                            padding: 8,
                            stepSize: Math.ceil(Math.max(...dashboardData.monthlyData.map(item => item.pacientes)) / 5)
                          },
                          title: {
                            display: true,
                            text: 'Pacientes',
                            color: '#475569',
                            font: {
                              size: 12,
                              weight: 'bold'
                            },
                            padding: 15
                          }
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                          ticks: {
                            color: '#64748b',
                            font: {
                              size: 10
                            },
                            maxRotation: 45,
                            padding: 5
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          titleColor: '#1e293b',
                          bodyColor: '#475569',
                          borderColor: '#4F7DF3',
                          borderWidth: 1,
                          cornerRadius: 8,
                          displayColors: false,
                          callbacks: {
                            title: function(context) {
                              return context[0].label;
                            },
                            label: function(context) {
                              return `Pacientes: ${context.parsed.y}`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </Box>
              </Box>
              
              {/* Tabla lateral más densa */}
              <VStack spacing={1} align="stretch" h="100%">
                <Text fontSize="xs" color="secondary.700" fontWeight="bold">
                  Últimos 6 Meses
                </Text>
                <Box 
                  overflowY="auto" 
                  maxH="160px"
                  css={{
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#f1f1f1',
                      borderRadius: '2px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#c1c1c1',
                      borderRadius: '2px',
                    },
                  }}
                >
                  <Table size="xs" variant="simple">
                    <Thead position="sticky" top={0} bg="white" zIndex={1}>
                      <Tr>
                        <Th color="secondary.600" fontSize="2xs" py={1} px={2}>Mes</Th>
                        <Th color="secondary.600" fontSize="2xs" isNumeric py={1} px={2}>Pac.</Th>
                        <Th color="secondary.600" fontSize="2xs" isNumeric py={1} px={2}>Min</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {dashboardData.monthlyData.slice(-6).map((item, index) => (
                        <Tr key={index} _hover={{ bg: "rgba(79, 125, 243, 0.05)" }}>
                          <Td fontSize="2xs" fontWeight="medium" color="secondary.700" py={1} px={2}>
                            {item.month.substring(0, 3)}
                          </Td>
                          <Td fontSize="2xs" isNumeric fontWeight="bold" color="secondary.800" py={1} px={2}>
                            {item.pacientes}
                          </Td>
                          <Td fontSize="2xs" isNumeric color="secondary.600" py={1} px={2}>
                            {item.promedio}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
                
                {/* Botón de acción compacto */}
                <Button 
                  size="xs" 
                  variant="ghost" 
                  onClick={() => navigateToDetail('monthly')}
                  fontSize="2xs"
                  h="6"
                  mt={1}
                  _hover={{
                    bg: "rgba(79, 125, 243, 0.1)"
                  }}
                >
                  Ver más
                </Button>
              </VStack>
            </Grid>
          </GlassCard>

          {/* Top Flebotomistas - Solo para Administradores */}
          {isAdmin && (
          <GlassCard p={{ base: 4, md: 6 }} animation={`${slideInFromRight} 0.8s ease-out`}>
            <Flex justify="space-between" align="center" mb={6}>
              <VStack align="start" spacing={1}>
                <Heading size="md" color="secondary.800" fontWeight="bold">
                  Top Flebotomistas
                </Heading>
                <Text color="secondary.600" fontSize="sm">
                  Rendimiento este mes
                </Text>
              </VStack>
              <Button
                size="sm"
                variant="ghost"
                rightIcon={<FaChevronRight />}
                onClick={() => navigateToDetail('phlebotomists')}
                color="secondary.600"
              >
                Ver todos
              </Button>
            </Flex>
            
            <VStack spacing={4} align="stretch">
              {dashboardData.phlebotomistData.slice(0, 4).map((phlebotomist, index) => (
                <Box
                  key={index}
                  p={4}
                  background="rgba(255, 255, 255, 0.4)"
                  backdropFilter="blur(10px)"
                  borderRadius="xl"
                  border="1px solid rgba(255, 255, 255, 0.3)"
                  _hover={{ 
                    background: "rgba(255, 255, 255, 0.6)", 
                    transform: 'translateY(-2px)',
                    boxShadow: 'md'
                  }}
                  transition="all 0.3s ease"
                  cursor="pointer"
                  onClick={() => navigateToDetail('phlebotomists')}
                >
                  <HStack spacing={3}>
                    <Box
                      w={10}
                      h={10}
                      borderRadius="full"
                      background={index === 0 ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' : 
                                 index === 1 ? 'linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%)' : 
                                 index === 2 ? 'linear-gradient(135deg, #CD7F32 0%, #B8860B 100%)' : 
                                 'linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)'}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="white"
                      fontWeight="bold"
                      fontSize="sm"
                      boxShadow="md"
                    >
                      {getInitials(phlebotomist.name)}
                    </Box>
                    <VStack align="start" spacing={0} flex={1}>
                      <HStack justify="space-between" w="full">
                        <Text fontWeight="bold" fontSize="sm" color="secondary.800" noOfLines={1}>
                          {phlebotomist.name}
                        </Text>
                        <HStack spacing={1}>
                          <Box as={FaStar} w={3} h={3} color="warning" />
                          <Text fontSize="xs" color="secondary.600">
                            {phlebotomist.rating}
                          </Text>
                        </HStack>
                      </HStack>
                      <Text fontSize="xs" color="secondary.500">
                        {phlebotomist.especialidad}
                      </Text>
                      <HStack spacing={3} fontSize="xs" color="secondary.600" mt={1}>
                        <Text>{phlebotomist.pacientes} pacientes</Text>
                        <Text>{phlebotomist.tiempo} min</Text>
                      </HStack>
                      <HStack justify="space-between" w="full" mt={2}>
                        <Progress
                          value={phlebotomist.eficiencia}
                          background="rgba(255, 255, 255, 0.3)"
                          sx={{
                            '& > div': {
                              background: phlebotomist.eficiencia >= 95 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 
                                         phlebotomist.eficiencia >= 90 ? 'linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)' : 
                                         'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
                            }
                          }}
                          size="sm"
                          flex={1}
                          borderRadius="full"
                          mr={2}
                        />
                        <Badge
                          bg={phlebotomist.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 
                             phlebotomist.status === 'break' ? 'rgba(245, 158, 11, 0.1)' : 
                             'rgba(239, 68, 68, 0.1)'}
                          color={phlebotomist.status === 'active' ? 'success' : 
                                phlebotomist.status === 'break' ? 'warning' : 'error'}
                          size="sm"
                          px={2}
                          py={1}
                          borderRadius="md"
                          fontSize="xs"
                          fontWeight="semibold"
                        >
                          {phlebotomist.status === 'active' ? 'Activo' :
                           phlebotomist.status === 'break' ? 'Pausa' : 'Inactivo'}
                        </Badge>
                      </HStack>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </GlassCard>
          )}
        </Grid>

        {/* Footer */}
        <Box
          as="footer"
          p={4}
          textAlign="center"
          background="rgba(255, 255, 255, 0.25)"
          backdropFilter="blur(20px)"
          color="secondary.600"
          borderRadius="lg"
          fontSize="sm"
          animation={`${fadeInUp} 1.5s ease-out`}
        >
          <Text>
            Instituto Nacional de Enfermedades Respiratorias Ismael Cosío Villegas (INER) | 
            Desarrollado por DT Diagnósticos by Labsis © {new Date().getFullYear()}
          </Text>
        </Box>
      </ModernContainer>
    </ChakraProvider>
  );
});

export default StatisticsDashboard;