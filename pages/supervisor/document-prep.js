import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  VStack,
  Flex,
  Switch,
  Button,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  Icon,
  Spinner,
  Badge
} from '@chakra-ui/react';
import {
  FiRefreshCw,
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiUsers,
  FiAlertCircle
} from 'react-icons/fi';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute';

// Componente de tarjeta de estadística
const StatCard = ({ label, value, color, icon }) => (
  <Card bg="white" shadow="sm" borderRadius="lg" borderLeft="4px solid" borderLeftColor={`${color}.500`}>
    <CardBody py={3} px={4}>
      <Stat>
        <HStack justify="space-between">
          <Box>
            <StatLabel color="gray.500" fontSize="xs">{label}</StatLabel>
            <StatNumber fontSize="2xl" color={`${color}.600`}>{value}</StatNumber>
          </Box>
          {icon && <Icon as={icon} boxSize={6} color={`${color}.400`} />}
        </HStack>
      </Stat>
    </CardBody>
  </Card>
);

// Componente de tabla de turnos
const TurnTable = ({ title, turns, callingTurn, colorScheme, tipoAtencion }) => {
  const isCallingThisType = callingTurn?.tipoAtencion === tipoAtencion;

  return (
    <Card bg="white" shadow="sm" borderRadius="lg" overflow="hidden">
      <CardHeader bg={`${colorScheme}.50`} py={2} px={4} borderBottom="1px solid" borderColor={`${colorScheme}.100`}>
        <HStack justify="space-between">
          <Heading size="sm" color={`${colorScheme}.700`}>
            {tipoAtencion === 'Special' ? '🔴' : '👥'} {title}
          </Heading>
          <Badge colorScheme={colorScheme} fontSize="sm">{turns.length} pendientes</Badge>
        </HStack>
      </CardHeader>
      <CardBody p={0} maxH="65vh" overflowY="auto">
        <Table size="sm" variant="simple">
          <Thead position="sticky" top={0} bg="gray.50" zIndex={1}>
            <Tr>
              <Th w="50px" textAlign="center">#</Th>
              <Th>Paciente</Th>
              <Th w="100px">OT</Th>
              <Th w="50px" isNumeric>🧪</Th>
            </Tr>
          </Thead>
          <Tbody>
            {/* Turno siendo llamado (si es de este tipo) */}
            {isCallingThisType && (
              <Tr bg="green.100" _hover={{ bg: 'green.200' }}>
                <Td textAlign="center">
                  <Text fontSize="lg">🔔</Text>
                </Td>
                <Td>
                  <Text fontWeight="bold" color="green.800" noOfLines={1}>
                    {callingTurn.patientName}
                  </Text>
                  <Text fontSize="xs" color="green.600">
                    Cubículo {callingTurn.cubicleName}
                  </Text>
                </Td>
                <Td>
                  <Text fontSize="xs" fontFamily="mono">
                    {callingTurn.workOrder?.slice(-10) || '-'}
                  </Text>
                </Td>
                <Td isNumeric fontWeight="bold" color="green.700">
                  {callingTurn.tubesRequired}
                </Td>
              </Tr>
            )}

            {/* Todos los turnos pendientes */}
            {turns.map((turn, idx) => (
              <Tr
                key={turn.id}
                bg={idx < 3 ? 'yellow.50' : idx % 2 === 0 ? 'white' : 'gray.50'}
                _hover={{ bg: idx < 3 ? 'yellow.100' : 'gray.100' }}
              >
                <Td textAlign="center">
                  {idx < 3 ? (
                    <HStack spacing={0} justify="center">
                      <Text fontSize="sm">⏳</Text>
                      <Text fontSize="sm" fontWeight="bold">{idx + 1}</Text>
                    </HStack>
                  ) : (
                    <Text fontSize="sm" color="gray.500">{idx + 1}</Text>
                  )}
                </Td>
                <Td>
                  <Text
                    noOfLines={1}
                    fontWeight={idx < 3 ? 'semibold' : 'normal'}
                    color={idx < 3 ? 'yellow.800' : 'gray.700'}
                  >
                    {turn.patientName}
                  </Text>
                </Td>
                <Td>
                  <Text fontSize="xs" fontFamily="mono" color="gray.600">
                    {turn.workOrder?.slice(-10) || '-'}
                  </Text>
                </Td>
                <Td isNumeric fontWeight={idx < 3 ? 'bold' : 'normal'}>
                  {turn.tubesRequired}
                </Td>
              </Tr>
            ))}

            {/* Mensaje si no hay turnos */}
            {turns.length === 0 && !isCallingThisType && (
              <Tr>
                <Td colSpan={4} textAlign="center" py={8}>
                  <Text color="gray.400">No hay turnos pendientes</Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

const DocumentPrep = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [data, setData] = useState({
    stats: {
      attendedToday: 0,
      pendingTotal: 0,
      pendingPriority: 0,
      pendingGeneral: 0,
      callingNow: 0
    },
    callingTurn: null,
    priorityTurns: [],
    generalTurns: []
  });

  // Cargar datos
  const loadData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/supervisor/document-prep', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh cada 3 segundos
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadData();
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRefresh, loadData]);

  return (
    <ProtectedRoute>
      <Box minH="100vh" bg="gray.100">
        <Container maxW="container.xl" py={4}>
          {/* Header */}
          <Card bg="white" shadow="sm" mb={4}>
            <CardBody py={3}>
              <Flex justify="space-between" align="center">
                <HStack spacing={4}>
                  <Button
                    leftIcon={<FiArrowLeft />}
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                  >
                    Volver
                  </Button>
                  <Box>
                    <Heading size="md" color="gray.700">
                      📋 Organización de Documentos
                    </Heading>
                    <Text fontSize="sm" color="gray.500">
                      Vista de colas para preparar etiquetas y papeletas
                    </Text>
                  </Box>
                </HStack>

                <HStack spacing={4}>
                  <HStack>
                    <Text fontSize="sm" color="gray.500">Auto-refresh</Text>
                    <Switch
                      isChecked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      colorScheme="green"
                    />
                  </HStack>
                  <Button
                    leftIcon={<FiRefreshCw />}
                    size="sm"
                    onClick={loadData}
                    isLoading={loading}
                  >
                    Actualizar
                  </Button>
                </HStack>
              </Flex>
            </CardBody>
          </Card>

          {/* Estadísticas */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={4}>
            <StatCard
              label="Atendidos Hoy"
              value={data.stats.attendedToday}
              color="green"
              icon={FiCheckCircle}
            />
            <StatCard
              label="Pendientes"
              value={data.stats.pendingTotal}
              color="orange"
              icon={FiClock}
            />
            <StatCard
              label="Prioritarios"
              value={data.stats.pendingPriority}
              color="red"
              icon={FiAlertCircle}
            />
            <StatCard
              label="Generales"
              value={data.stats.pendingGeneral}
              color="blue"
              icon={FiUsers}
            />
          </SimpleGrid>

          {/* Contenido principal */}
          {loading ? (
            <Flex justify="center" align="center" minH="400px">
              <VStack spacing={4}>
                <Spinner size="xl" color="blue.500" />
                <Text color="gray.500">Cargando turnos...</Text>
              </VStack>
            </Flex>
          ) : (
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
              <TurnTable
                title="PRIORITARIOS"
                turns={data.priorityTurns}
                callingTurn={data.callingTurn}
                colorScheme="red"
                tipoAtencion="Special"
              />
              <TurnTable
                title="GENERALES"
                turns={data.generalTurns}
                callingTurn={data.callingTurn}
                colorScheme="blue"
                tipoAtencion="General"
              />
            </SimpleGrid>
          )}

          {/* Leyenda */}
          <Card bg="white" shadow="sm" mt={4}>
            <CardBody py={2}>
              <HStack spacing={6} justify="center" flexWrap="wrap">
                <HStack>
                  <Text fontSize="lg">🔔</Text>
                  <Text fontSize="sm" color="gray.600">Paciente siendo llamado</Text>
                </HStack>
                <HStack>
                  <Text fontSize="lg">⏳</Text>
                  <Text fontSize="sm" color="gray.600">Próximos 3 en cola</Text>
                </HStack>
                <HStack>
                  <Box w={4} h={4} bg="yellow.50" borderRadius="sm" border="1px solid" borderColor="yellow.200" />
                  <Text fontSize="sm" color="gray.600">Preparar documentos</Text>
                </HStack>
                <HStack>
                  <Box w={4} h={4} bg="green.100" borderRadius="sm" border="1px solid" borderColor="green.200" />
                  <Text fontSize="sm" color="gray.600">Llamando ahora</Text>
                </HStack>
              </HStack>
            </CardBody>
          </Card>
        </Container>
      </Box>
    </ProtectedRoute>
  );
};

export default DocumentPrep;
