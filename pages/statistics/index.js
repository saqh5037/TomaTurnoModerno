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
import { 
  FaCalendarAlt, 
  FaChartBar, 
  FaUsers, 
  FaClock, 
  FaTrendingUp, 
  FaDownload, 
  FaEye, 
  FaStar,
  FaCheckCircle,
  FaExclamationTriangle,
  FaChevronRight,
  FaUserMd
} from 'react-icons/fa';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { modernTheme, fadeInUp, slideInFromRight, slideInFromLeft, GlassCard, ModernContainer, ModernHeader } from '../../components/theme/ModernTheme';

const StatisticsDashboard = memo(function StatisticsDashboard() {
  const router = useRouter();
  const { userRole } = useAuth();
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
  const SimpleBarChart = useMemo(() => ({ data, dataKey, height = "200px", color = "#4F7DF3" }) => {
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
  }, []);

  // Componente de progreso circular - Optimizado
  const SimpleProgressRing = useMemo(() => ({ value, size = 80, strokeWidth = 8, color = "#4F7DF3" }) => {
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
        {/* Métricas Principales */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          {/* Total de Pacientes */}
          <GlassCard
            p={6}
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
                w={12}
                h={12}
                borderRadius="xl"
                background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                boxShadow="lg"
              >
                <Box as={FaCalendarAlt} fontSize="xl" />
              </Box>
              <Box as={FaChevronRight} color="secondary.400" fontSize="lg" />
            </Flex>
            
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="secondary.600" fontWeight="medium">
                Total Pacientes
              </Text>
              <Text fontSize="3xl" fontWeight="extrabold" color="secondary.800" lineHeight="1">
                {dashboardData.overview.totalPatients?.toLocaleString()}
              </Text>
              <HStack spacing={2}>
                <Box
                  as={FaTrendingUp}
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
            p={6}
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
              <Text fontSize="3xl" fontWeight="extrabold" color="secondary.800" lineHeight="1">
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
            p={6}
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
              <Text fontSize="3xl" fontWeight="extrabold" color="secondary.800" lineHeight="1">
                {dashboardData.overview.averageWaitTime} min
              </Text>
              <HStack spacing={2}>
                <Box
                  as={FaTrendingUp}
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
            p={6}
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
              <Text fontSize="3xl" fontWeight="extrabold" color="secondary.800" lineHeight="1">
                {dashboardData.overview.efficiency}%
              </Text>
              <HStack spacing={2}>
                <Box
                  as={FaTrendingUp}
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
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6} mb={8}>
          {/* Gráfica de Tendencias Mensuales */}
          <GlassCard p={6} animation={`${slideInFromLeft} 0.8s ease-out`}>
            <Flex justify="space-between" align="center" mb={6}>
              <VStack align="start" spacing={1}>
                <Heading size="lg" color="secondary.800" fontWeight="bold">
                  Tendencias Mensuales
                </Heading>
                <Text color="secondary.600" fontSize="sm">
                  Pacientes atendidos por mes
                </Text>
              </VStack>
              <HStack>
                <IconButton
                  icon={<FaDownload />}
                  size="sm"
                  variant="ghost"
                  onClick={() => handleExport('excel', 'monthly')}
                />
                <IconButton
                  icon={<FaEye />}
                  size="sm"
                  variant="ghost"
                  onClick={() => navigateToDetail('monthly')}
                />
              </HStack>
            </Flex>
            
            <SimpleBarChart 
              data={dashboardData.monthlyData} 
              dataKey="pacientes" 
              height="300px"
              color="#4F7DF3"
            />
            
            <Box mt={6}>
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th color="secondary.600" fontSize="xs">Mes</Th>
                    <Th color="secondary.600" fontSize="xs" isNumeric>Pacientes</Th>
                    <Th color="secondary.600" fontSize="xs" isNumeric>Tiempo Prom.</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {dashboardData.monthlyData.slice(-4).map((item, index) => (
                    <Tr key={index}>
                      <Td fontWeight="medium" color="secondary.700">{item.month}</Td>
                      <Td isNumeric fontWeight="bold" color="secondary.800">{item.pacientes}</Td>
                      <Td isNumeric color="secondary.600">{item.promedio} min</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </GlassCard>

          {/* Top Flebotomistas - Solo para Administradores */}
          {isAdmin && (
          <GlassCard p={6} animation={`${slideInFromRight} 0.8s ease-out`}>
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

        {/* Acciones Rápidas y Alertas */}
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6} mb={8}>
          {/* Acciones Rápidas */}
          <GlassCard p={6} animation={`${slideInFromLeft} 1.0s ease-out`}>
            <VStack align="start" spacing={4} mb={6}>
              <Heading size="md" color="secondary.800" fontWeight="bold">
                Acciones Rápidas
              </Heading>
              <Text color="secondary.600" fontSize="sm">
                {isAdmin ? 'Accede rápidamente a reportes detallados' : 'Reportes disponibles para flebotomistas'}
              </Text>
              {isFlebotomista && (
                <Box
                  p={3}
                  background="rgba(79, 125, 243, 0.1)"
                  borderRadius="lg"
                  border="1px solid rgba(79, 125, 243, 0.2)"
                  w="full"
                >
                  <Text fontSize="sm" color="primary.700" fontWeight="semibold">
                    ℹ️ Vista de Flebotomista: Acceso a estadísticas operativas básicas
                  </Text>
                </Box>
              )}
            </VStack>
            
            <SimpleGrid columns={{ base: 2, md: 2 }} spacing={4}>
              {[
                { icon: FaCalendarAlt, title: 'Reporte Mensual', action: 'monthly', color: 'linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)', roles: ['Administrador'] },
                { icon: FaEye, title: 'Reporte Diario', action: 'daily', color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', roles: ['Administrador', 'Flebotomista'] },
                { icon: FaUserMd, title: 'Por Flebotomista', action: 'phlebotomists', color: 'linear-gradient(135deg, #6B73FF 0%, #9333EA 100%)', roles: ['Administrador'] },
                { icon: FaClock, title: 'Tiempo Promedio', action: 'average-time', color: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)', roles: ['Administrador', 'Flebotomista'] }
              ].filter(item => !item.roles || item.roles.includes(userRole)).map((item, index) => (
                <VStack
                  key={index}
                  spacing={3}
                  p={4}
                  background="rgba(255, 255, 255, 0.4)"
                  backdropFilter="blur(10px)"
                  borderRadius="xl"
                  border="1px solid rgba(255, 255, 255, 0.3)"
                  cursor="pointer"
                  onClick={() => navigateToDetail(item.action)}
                  _hover={{ 
                    background: "rgba(255, 255, 255, 0.6)", 
                    transform: 'translateY(-2px)',
                    boxShadow: 'md'
                  }}
                  transition="all 0.3s ease"
                >
                  <Box
                    w={12}
                    h={12}
                    background={item.color}
                    borderRadius="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    boxShadow="lg"
                  >
                    <Box as={item.icon} fontSize="xl" />
                  </Box>
                  <Text fontWeight="semibold" fontSize="sm" textAlign="center" color="secondary.700">
                    {item.title}
                  </Text>
                </VStack>
              ))}
            </SimpleGrid>
          </GlassCard>

          {/* Alertas del Sistema */}
          <GlassCard p={6} animation={`${slideInFromRight} 1.0s ease-out`}>
            <VStack align="start" spacing={4} mb={6}>
              <Heading size="md" color="secondary.800" fontWeight="bold">
                Alertas del Sistema
              </Heading>
              <Text color="secondary.600" fontSize="sm">
                Notificaciones importantes
              </Text>
            </VStack>
            
            <VStack spacing={4} align="stretch">
              <HStack
                p={4}
                background="rgba(16, 185, 129, 0.1)"
                backdropFilter="blur(10px)"
                borderRadius="lg"
                border="1px solid rgba(16, 185, 129, 0.3)"
              >
                <Box as={FaCheckCircle} color="success" fontSize="lg" />
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontWeight="semibold" fontSize="sm" color="success">
                    Sistema funcionando correctamente
                  </Text>
                  <Text fontSize="xs" color="secondary.600">
                    Todos los servicios operativos
                  </Text>
                </VStack>
                <Badge
                  bg="rgba(16, 185, 129, 0.2)"
                  color="success"
                  size="sm"
                  px={2}
                  py={1}
                  borderRadius="md"
                  fontSize="xs"
                >
                  OK
                </Badge>
              </HStack>

              <HStack
                p={4}
                background="rgba(245, 158, 11, 0.1)"
                backdropFilter="blur(10px)"
                borderRadius="lg"
                border="1px solid rgba(245, 158, 11, 0.3)"
              >
                <Box as={FaExclamationTriangle} color="warning" fontSize="lg" />
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontWeight="semibold" fontSize="sm" color="warning">
                    Carga alta en Cubículo 2
                  </Text>
                  <Text fontSize="xs" color="secondary.600">
                    Tiempo de espera &gt; 25 min
                  </Text>
                </VStack>
                <Badge
                  bg="rgba(245, 158, 11, 0.2)"
                  color="warning"
                  size="sm"
                  px={2}
                  py={1}
                  borderRadius="md"
                  fontSize="xs"
                >
                  Atención
                </Badge>
              </HStack>

              <HStack
                p={4}
                background="rgba(79, 125, 243, 0.1)"
                backdropFilter="blur(10px)"
                borderRadius="lg"
                border="1px solid rgba(79, 125, 243, 0.3)"
              >
                <Box as={FaChartBar} color="primary.500" fontSize="lg" />
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontWeight="semibold" fontSize="sm" color="primary.500">
                    Nuevo record de eficiencia
                  </Text>
                  <Text fontSize="xs" color="secondary.600">
                    96.5% alcanzada este mes
                  </Text>
                </VStack>
                <Badge
                  bg="rgba(79, 125, 243, 0.2)"
                  color="primary.500"
                  size="sm"
                  px={2}
                  py={1}
                  borderRadius="md"
                  fontSize="xs"
                >
                  Info
                </Badge>
              </HStack>
            </VStack>
          </GlassCard>
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