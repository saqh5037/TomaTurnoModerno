import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  IconButton,
  HStack,
  VStack,
  Input,
  Select,
  Flex,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tooltip,
  Switch,
  Spinner,
  Divider,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Grid,
  GridItem,
  Progress
} from '@chakra-ui/react';
import {
  FiRefreshCw,
  FiAlertTriangle,
  FiClock,
  FiUser,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiArrowLeft,
  FiUnlock,
  FiEdit,
  FiTrash2,
  FiPlay,
  FiPause,
  FiPhoneCall,
  FiSquare,
  FiActivity,
  FiStar
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute';

// Componente de tarjeta de estadística
const StatCard = ({ label, value, helpText, color, icon }) => (
  <Card bg="white" shadow="sm" borderRadius="lg">
    <CardBody>
      <Stat>
        <HStack justify="space-between">
          <Box>
            <StatLabel color="gray.500" fontSize="sm">{label}</StatLabel>
            <StatNumber fontSize="2xl" color={color || 'gray.800'}>{value}</StatNumber>
            {helpText && <StatHelpText mb={0}>{helpText}</StatHelpText>}
          </Box>
          {icon && <Icon as={icon} boxSize={8} color={color || 'gray.400'} />}
        </HStack>
      </Stat>
    </CardBody>
  </Card>
);

// Colores de estado
const STATUS_COLORS = {
  Pending: 'yellow',
  Holding: 'orange',
  Calling: 'blue',
  'In Progress': 'green',
  Attended: 'gray',
  Cancelled: 'red'
};

// Etiquetas de estado en español
const STATUS_LABELS = {
  Pending: 'En Espera',
  Holding: 'En Holding',
  Calling: 'Llamando',
  'In Progress': 'En Atención',
  Attended: 'Finalizado',
  Cancelled: 'Cancelado'
};

function AdminControlPanel() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  // Estado del dashboard
  const [dashboard, setDashboard] = useState(null);
  const [turns, setTurns] = useState([]);
  const [filters, setFilters] = useState({ phlebotomists: [], cubicles: [] });
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Filtros activos
  const [statusFilter, setStatusFilter] = useState('');
  const [phlebotomistFilter, setPhlebotomistFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal de acción
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTurn, setSelectedTurn] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Modal de reasignación
  const { isOpen: isReassignOpen, onOpen: onReassignOpen, onClose: onReassignClose } = useDisclosure();
  const [reassignType, setReassignType] = useState(null); // 'cubicle' o 'phlebotomist'
  const [reassignValue, setReassignValue] = useState('');

  // Obtener token
  const getToken = () => localStorage.getItem('token');

  // Cargar datos del dashboard
  const loadDashboard = useCallback(async () => {
    try {
      const token = getToken();
      const response = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setDashboard(data.data);
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    }
  }, []);

  // Cargar lista de turnos
  const loadTurns = useCallback(async () => {
    try {
      const token = getToken();
      const params = new URLSearchParams();
      // Por defecto mostrar solo turnos activos (sin filtro de fecha)
      params.append('activeOnly', 'true');
      if (statusFilter) params.append('status', statusFilter);
      if (phlebotomistFilter) params.append('phlebotomistId', phlebotomistFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/admin/turns?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTurns(data.data.turns);
        setFilters(data.data.filters);
      }
    } catch (error) {
      console.error('Error cargando turnos:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, phlebotomistFilter, searchTerm]);

  // Cargar datos iniciales
  useEffect(() => {
    loadDashboard();
    loadTurns();
  }, [loadDashboard, loadTurns]);

  // Auto-refresh cada 3 segundos (igual que monitoreo)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadDashboard();
      loadTurns();
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRefresh, loadDashboard, loadTurns]);

  // Ejecutar acción administrativa
  const executeAction = async () => {
    if (!selectedTurn || !actionType) return;

    // Validar razón para acciones que la requieren
    if (['force-complete', 'cancel-turn', 'return-to-queue'].includes(actionType)) {
      if (!actionReason || actionReason.trim().length < 5) {
        toast({
          title: 'Razón requerida',
          description: 'Ingresa una razón de al menos 5 caracteres',
          status: 'warning',
          duration: 3000
        });
        return;
      }
    }

    setActionLoading(true);
    try {
      const token = getToken();

      // Determinar endpoint y body según el tipo de acción
      let endpoint = `/api/admin/${actionType}`;
      let body = { turnId: selectedTurn.id };

      // Acciones especiales que usan APIs diferentes
      if (actionType === 'defer-turn') {
        endpoint = '/api/queue/defer';
        body = { id: selectedTurn.id };
      } else if (actionType === 'change-priority') {
        body.newPriority = selectedTurn.isSpecial ? 'General' : 'Special';
      }

      if (actionReason) body.reason = actionReason.trim();

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Acción completada',
          description: data.message,
          status: 'success',
          duration: 3000
        });
        onClose();
        setActionReason('');
        loadDashboard();
        loadTurns();
      } else {
        toast({
          title: 'Error',
          description: data.error,
          status: 'error',
          duration: 5000
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al ejecutar acción',
        status: 'error',
        duration: 5000
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Ejecutar reasignación
  const executeReassign = async () => {
    if (!selectedTurn || !reassignType || !reassignValue) return;

    setActionLoading(true);
    try {
      const token = getToken();
      const endpoint = reassignType === 'cubicle' ? 'reassign-cubicle' : 'reassign-phlebotomist';
      const body = {
        turnId: selectedTurn.id,
        [reassignType === 'cubicle' ? 'cubicleId' : 'phlebotomistId']: parseInt(reassignValue)
      };

      const response = await fetch(`/api/admin/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Reasignación completada',
          description: data.message,
          status: 'success',
          duration: 3000
        });
        onReassignClose();
        setReassignValue('');
        loadTurns();
      } else {
        toast({
          title: 'Error',
          description: data.error,
          status: 'error',
          duration: 5000
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al reasignar',
        status: 'error',
        duration: 5000
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Abrir modal de acción
  const openActionModal = (turn, action) => {
    setSelectedTurn(turn);
    setActionType(action);
    setActionReason('');
    onOpen();
  };

  // Abrir modal de reasignación
  const openReassignModal = (turn, type) => {
    setSelectedTurn(turn);
    setReassignType(type);
    setReassignValue('');
    onReassignOpen();
  };

  // Títulos de acciones
  const ACTION_TITLES = {
    'release-holding': 'Liberar Holding',
    'force-complete': 'Forzar Finalización',
    'cancel-turn': 'Cancelar Turno',
    'return-to-queue': 'Regresar a Cola',
    'change-priority': 'Cambiar Prioridad',
    'defer-turn': 'Diferir Turno'
  };

  // Formatear tiempo
  const formatTime = (minutes) => {
    if (minutes === null || minutes === undefined) return '-';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <Box minH="100vh" bg="gray.50">
        <Container maxW="container.xl" py={6}>
          {/* Header */}
          <Flex justify="space-between" align="center" mb={6}>
            <HStack spacing={4}>
              <IconButton
                icon={<FiArrowLeft />}
                aria-label="Volver"
                variant="ghost"
                size="lg"
                onClick={() => router.push('/')}
                _hover={{ bg: 'gray.100' }}
              />
              <Box>
                <Heading size="lg" color="gray.800">Panel de Control</Heading>
                <Text color="gray.500">Gestión de turnos en tiempo real</Text>
              </Box>
            </HStack>
            <HStack>
              <HStack>
                <Text fontSize="sm" color="gray.500">Auto-refresh</Text>
                <Switch
                  isChecked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  colorScheme="blue"
                />
              </HStack>
              <IconButton
                icon={<FiRefreshCw />}
                onClick={() => { loadDashboard(); loadTurns(); }}
                isLoading={loading}
                aria-label="Refrescar"
              />
            </HStack>
          </Flex>

          {/* Alertas */}
          {dashboard?.alerts?.length > 0 && (
            <Alert status="warning" mb={6} borderRadius="md">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>Alertas activas ({dashboard.alertsCount})</AlertTitle>
                <AlertDescription>
                  {dashboard.alerts.slice(0, 3).map((alert, i) => (
                    <Text key={i} fontSize="sm">{alert.message}</Text>
                  ))}
                  {dashboard.alerts.length > 3 && (
                    <Text fontSize="sm" fontWeight="bold">
                      + {dashboard.alerts.length - 3} más...
                    </Text>
                  )}
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Tarjetas de estadísticas EN TIEMPO REAL */}
          {dashboard && (
            <>
              <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>
                Estado Actual (Tiempo Real)
              </Text>
              <SimpleGrid columns={{ base: 2, md: 4, lg: 7 }} spacing={3} mb={4}>
                <StatCard
                  label="En Espera"
                  value={dashboard.realtime?.pendingCount ?? dashboard.summary.pending}
                  color="yellow.500"
                  icon={FiClock}
                />
                <StatCard
                  label="En Holding"
                  value={dashboard.realtime?.holdingCount ?? dashboard.summary.holding}
                  color="orange.500"
                  icon={FiPause}
                />
                <StatCard
                  label="Llamando"
                  value={dashboard.realtime?.inCallingCount ?? dashboard.summary.inCalling ?? 0}
                  color="blue.500"
                  icon={FiPhoneCall}
                />
                <StatCard
                  label="En Atención"
                  value={dashboard.realtime?.inProgressCount ?? dashboard.summary.inAttention ?? 0}
                  color="green.500"
                  icon={FiPlay}
                />
                <StatCard
                  label="Total Activos"
                  value={dashboard.realtime?.totalActive ?? (dashboard.summary.pending + dashboard.summary.holding + dashboard.summary.inProgress)}
                  color="purple.500"
                  icon={FiActivity}
                />
                <StatCard
                  label="Finalizados Hoy"
                  value={dashboard.summary.attended}
                  color="gray.500"
                  icon={FiCheckCircle}
                />
                <StatCard
                  label="Cancelados"
                  value={dashboard.summary.cancelled}
                  color="red.500"
                  icon={FiXCircle}
                />
              </SimpleGrid>
            </>
          )}

          {/* Tiempos promedio + Flebotomistas + Cubículos */}
          {dashboard && (
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4} mb={6}>
              {/* Tiempos promedio */}
              <Card bg="white" shadow="sm">
                <CardHeader pb={2}>
                  <Text fontWeight="bold" fontSize="sm" color="gray.600">Tiempos Promedio Hoy</Text>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500">Espera</Text>
                      <Text fontSize="lg" fontWeight="bold" color="blue.600">
                        {dashboard.summary.avgWaitTime} min
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.500">Atención</Text>
                      <Text fontSize="lg" fontWeight="bold" color="green.600">
                        {dashboard.summary.avgAttentionTime} min
                      </Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Flebotomistas Activos */}
              <Card bg="white" shadow="sm">
                <CardHeader pb={2}>
                  <HStack justify="space-between">
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">
                      Flebotomistas en Servicio
                    </Text>
                    <Badge colorScheme="green">{dashboard.phlebotomistsCount || 0}</Badge>
                  </HStack>
                </CardHeader>
                <CardBody pt={0} maxH="200px" overflowY="auto">
                  {dashboard.phlebotomists?.length > 0 ? (
                    <VStack spacing={2} align="stretch">
                      {dashboard.phlebotomists.map(p => (
                        <HStack key={p.id} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="medium">{p.name}</Text>
                            <Text fontSize="xs" color="gray.500">{p.cubicleName}</Text>
                          </VStack>
                          <VStack align="end" spacing={0}>
                            <Badge
                              colorScheme={
                                p.status === 'atendiendo' ? 'green' :
                                p.status === 'llamando' ? 'blue' :
                                p.status === 'con_holding' ? 'orange' : 'gray'
                              }
                              fontSize="xs"
                            >
                              {p.status === 'atendiendo' ? 'Atendiendo' :
                               p.status === 'llamando' ? 'Llamando' :
                               p.status === 'con_holding' ? 'Con Holding' : 'Disponible'}
                            </Badge>
                            {p.currentPatient && (
                              <Text fontSize="xs" color="gray.600">#{p.currentTurnNumber}</Text>
                            )}
                          </VStack>
                        </HStack>
                      ))}
                    </VStack>
                  ) : (
                    <Text fontSize="sm" color="gray.400" textAlign="center">
                      No hay flebotomistas activos
                    </Text>
                  )}
                </CardBody>
              </Card>

              {/* Estado de Cubículos */}
              <Card bg="white" shadow="sm">
                <CardHeader pb={2}>
                  <HStack justify="space-between">
                    <Text fontWeight="bold" fontSize="sm" color="gray.600">
                      Cubículos
                    </Text>
                    <HStack spacing={2}>
                      <Badge colorScheme="green">{dashboard.cubicles?.occupiedCount || 0} ocupados</Badge>
                      <Badge colorScheme="gray">{dashboard.cubicles?.freeCount || 0} libres</Badge>
                    </HStack>
                  </HStack>
                </CardHeader>
                <CardBody pt={0}>
                  <SimpleGrid columns={3} spacing={2}>
                    {dashboard.cubicles?.all?.map(c => (
                      <Box
                        key={c.id}
                        p={2}
                        borderRadius="md"
                        bg={c.status === 'atendiendo' ? 'green.100' :
                            c.status === 'llamando' ? 'blue.100' :
                            c.status === 'disponible' ? 'yellow.100' : 'gray.100'}
                        borderWidth="1px"
                        borderColor={c.status === 'atendiendo' ? 'green.300' :
                                    c.status === 'llamando' ? 'blue.300' :
                                    c.status === 'disponible' ? 'yellow.300' : 'gray.300'}
                      >
                        <Text fontSize="xs" fontWeight="bold">{c.name}</Text>
                        <Text fontSize="xs" color="gray.600" noOfLines={1}>
                          {c.phlebotomistName || '-'}
                        </Text>
                        {c.currentTurnNumber && (
                          <Badge size="sm" colorScheme={c.status === 'atendiendo' ? 'green' : 'blue'}>
                            #{c.currentTurnNumber}
                          </Badge>
                        )}
                      </Box>
                    ))}
                  </SimpleGrid>
                </CardBody>
              </Card>
            </SimpleGrid>
          )}

          {/* Filtros */}
          <Card bg="white" shadow="sm" mb={6}>
            <CardBody>
              <HStack spacing={4} wrap="wrap">
                <FormControl maxW="200px">
                  <FormLabel fontSize="sm">Estado</FormLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    placeholder="Todos"
                    size="sm"
                  >
                    <option value="Pending">En Espera</option>
                    <option value="Holding">En Holding</option>
                    <option value="Calling">Llamando</option>
                    <option value="In Progress">En Atención</option>
                    <option value="Attended">Finalizados</option>
                    <option value="Cancelled">Cancelados</option>
                  </Select>
                </FormControl>

                <FormControl maxW="200px">
                  <FormLabel fontSize="sm">Flebotomista</FormLabel>
                  <Select
                    value={phlebotomistFilter}
                    onChange={(e) => setPhlebotomistFilter(e.target.value)}
                    placeholder="Todos"
                    size="sm"
                  >
                    {filters.phlebotomists.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl maxW="250px">
                  <FormLabel fontSize="sm">Buscar</FormLabel>
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nombre o # turno"
                    size="sm"
                  />
                </FormControl>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setStatusFilter('');
                    setPhlebotomistFilter('');
                    setSearchTerm('');
                  }}
                  mt={6}
                >
                  Limpiar filtros
                </Button>
              </HStack>
            </CardBody>
          </Card>

          {/* Tabla de turnos */}
          <Card bg="white" shadow="sm">
            <CardBody p={0}>
              {loading ? (
                <Flex justify="center" align="center" py={10}>
                  <Spinner size="lg" />
                </Flex>
              ) : (
                <Box overflowX="auto">
                  <Table size="sm">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>#</Th>
                        <Th>Paciente</Th>
                        <Th>Estado</Th>
                        <Th>Prioridad</Th>
                        <Th>Cubículo</Th>
                        <Th>Flebotomista</Th>
                        <Th>T. Espera</Th>
                        <Th>T. Atención</Th>
                        <Th>Acciones</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {turns.map(turn => (
                        <Tr
                          key={turn.id}
                          bg={turn.hasAlert ? 'red.50' : 'white'}
                          _hover={{ bg: turn.hasAlert ? 'red.100' : 'gray.50' }}
                        >
                          <Td fontWeight="bold">{turn.assignedTurn}</Td>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium">{turn.patientName}</Text>
                              {turn.isDeferred && (
                                <Badge colorScheme="purple" size="sm">Diferido</Badge>
                              )}
                            </VStack>
                          </Td>
                          <Td>
                            <Badge colorScheme={STATUS_COLORS[turn.visualStatus]}>
                              {STATUS_LABELS[turn.visualStatus]}
                            </Badge>
                            {turn.hasAlert && (
                              <Tooltip label={turn.alertType}>
                                <Badge colorScheme="red" ml={1}>!</Badge>
                              </Tooltip>
                            )}
                          </Td>
                          <Td>
                            <Badge colorScheme={turn.isSpecial ? 'purple' : 'gray'}>
                              {turn.tipoAtencion}
                            </Badge>
                          </Td>
                          <Td>{turn.cubicle?.name || '-'}</Td>
                          <Td>
                            {turn.holdingBy?.name || turn.attendedBy?.name || '-'}
                          </Td>
                          <Td>{formatTime(turn.waitTime)}</Td>
                          <Td>{formatTime(turn.attentionTime)}</Td>
                          <Td>
                            <HStack spacing={2} flexWrap="wrap">
                              {/* Liberar Holding */}
                              {turn.visualStatus === 'Holding' && (
                                <Tooltip label="Liberar Holding">
                                  <IconButton
                                    icon={<FiUnlock />}
                                    size="sm"
                                    colorScheme="orange"
                                    variant="solid"
                                    onClick={() => openActionModal(turn, 'release-holding')}
                                    aria-label="Liberar Holding"
                                  />
                                </Tooltip>
                              )}

                              {/* Regresar a cola (solo In Progress) */}
                              {turn.status === 'In Progress' && (
                                <Tooltip label="Regresar a Cola">
                                  <IconButton
                                    icon={<FiArrowLeft />}
                                    size="sm"
                                    colorScheme="blue"
                                    variant="solid"
                                    onClick={() => openActionModal(turn, 'return-to-queue')}
                                    aria-label="Regresar a Cola"
                                  />
                                </Tooltip>
                              )}

                              {/* Cambiar Prioridad (Pending o In Progress) */}
                              {['Pending', 'In Progress'].includes(turn.status) && (
                                <Tooltip label={turn.isSpecial ? "Quitar Prioridad" : "Hacer Prioritario"}>
                                  <IconButton
                                    icon={<FiStar />}
                                    size="sm"
                                    colorScheme="yellow"
                                    variant={turn.isSpecial ? "solid" : "outline"}
                                    onClick={() => openActionModal(turn, 'change-priority')}
                                    aria-label="Cambiar Prioridad"
                                  />
                                </Tooltip>
                              )}

                              {/* Diferir turno (solo Pending sin holding) */}
                              {turn.status === 'Pending' && !turn.holdingBy && (
                                <Tooltip label="Diferir (enviar al final)">
                                  <IconButton
                                    icon={<FiClock />}
                                    size="sm"
                                    colorScheme="yellow"
                                    variant="solid"
                                    onClick={() => openActionModal(turn, 'defer-turn')}
                                    aria-label="Diferir Turno"
                                  />
                                </Tooltip>
                              )}

                              {/* Forzar finalización (Pending o In Progress) */}
                              {['Pending', 'In Progress'].includes(turn.status) && (
                                <Tooltip label="Forzar Finalización">
                                  <IconButton
                                    icon={<FiCheckCircle />}
                                    size="sm"
                                    colorScheme="green"
                                    variant="solid"
                                    onClick={() => openActionModal(turn, 'force-complete')}
                                    aria-label="Forzar Finalización"
                                  />
                                </Tooltip>
                              )}

                              {/* Reasignar (solo In Progress) */}
                              {turn.status === 'In Progress' && (
                                <>
                                  <Tooltip label="Reasignar Cubículo">
                                    <IconButton
                                      icon={<FiEdit />}
                                      size="sm"
                                      colorScheme="purple"
                                      variant="outline"
                                      onClick={() => openReassignModal(turn, 'cubicle')}
                                      aria-label="Reasignar Cubículo"
                                    />
                                  </Tooltip>
                                  <Tooltip label="Reasignar Flebotomista">
                                    <IconButton
                                      icon={<FiUser />}
                                      size="sm"
                                      colorScheme="teal"
                                      variant="outline"
                                      onClick={() => openReassignModal(turn, 'phlebotomist')}
                                      aria-label="Reasignar Flebotomista"
                                    />
                                  </Tooltip>
                                </>
                              )}

                              {/* Cancelar (Pending o In Progress) */}
                              {['Pending', 'In Progress'].includes(turn.status) && (
                                <Tooltip label="Cancelar Turno">
                                  <IconButton
                                    icon={<FiXCircle />}
                                    size="sm"
                                    colorScheme="red"
                                    variant="solid"
                                    onClick={() => openActionModal(turn, 'cancel-turn')}
                                    aria-label="Cancelar Turno"
                                  />
                                </Tooltip>
                              )}
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                      {turns.length === 0 && (
                        <Tr>
                          <Td colSpan={9} textAlign="center" py={10}>
                            <Text color="gray.500">No hay turnos que mostrar</Text>
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </CardBody>
          </Card>

          <Text fontSize="xs" color="gray.400" mt={4} textAlign="center">
            Última actualización: {dashboard?.timestamp ? new Date(dashboard.timestamp).toLocaleTimeString() : '-'}
          </Text>
        </Container>

        {/* Modal de Acción */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{ACTION_TITLES[actionType]}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedTurn && (
                <VStack align="start" spacing={3}>
                  <Box>
                    <Text fontWeight="bold">Turno #{selectedTurn.assignedTurn}</Text>
                    <Text>{selectedTurn.patientName}</Text>
                    <Badge colorScheme={STATUS_COLORS[selectedTurn.visualStatus]}>
                      {STATUS_LABELS[selectedTurn.visualStatus]}
                    </Badge>
                  </Box>

                  {['force-complete', 'cancel-turn', 'return-to-queue'].includes(actionType) && (
                    <FormControl isRequired>
                      <FormLabel>Razón</FormLabel>
                      <Textarea
                        value={actionReason}
                        onChange={(e) => setActionReason(e.target.value)}
                        placeholder="Ingresa el motivo de esta acción..."
                        rows={3}
                      />
                    </FormControl>
                  )}

                  {actionType === 'release-holding' && (
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Text fontSize="sm">
                        Se liberará el holding y el turno volverá a estar disponible para cualquier flebotomista.
                      </Text>
                    </Alert>
                  )}

                  {actionType === 'cancel-turn' && (
                    <Alert status="warning" borderRadius="md">
                      <AlertIcon />
                      <Text fontSize="sm">
                        El turno será marcado como cancelado y no podrá ser atendido.
                      </Text>
                    </Alert>
                  )}
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancelar
              </Button>
              <Button
                colorScheme={actionType === 'cancel-turn' ? 'red' : 'blue'}
                onClick={executeAction}
                isLoading={actionLoading}
              >
                Confirmar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal de Reasignación */}
        <Modal isOpen={isReassignOpen} onClose={onReassignClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              Reasignar {reassignType === 'cubicle' ? 'Cubículo' : 'Flebotomista'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedTurn && (
                <VStack align="start" spacing={3}>
                  <Box>
                    <Text fontWeight="bold">Turno #{selectedTurn.assignedTurn}</Text>
                    <Text>{selectedTurn.patientName}</Text>
                  </Box>

                  <FormControl isRequired>
                    <FormLabel>
                      {reassignType === 'cubicle' ? 'Nuevo Cubículo' : 'Nuevo Flebotomista'}
                    </FormLabel>
                    <Select
                      value={reassignValue}
                      onChange={(e) => setReassignValue(e.target.value)}
                      placeholder="Seleccionar..."
                    >
                      {reassignType === 'cubicle'
                        ? filters.cubicles.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))
                        : filters.phlebotomists.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))
                      }
                    </Select>
                  </FormControl>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onReassignClose}>
                Cancelar
              </Button>
              <Button
                colorScheme="blue"
                onClick={executeReassign}
                isLoading={actionLoading}
                isDisabled={!reassignValue}
              >
                Reasignar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </ProtectedRoute>
  );
}

export default AdminControlPanel;
