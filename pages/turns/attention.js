import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Heading,
  VStack,
  Text,
  IconButton,
  useToast,
  Flex,
  Stack,
  ChakraProvider,
  Grid,
  Badge,
  HStack,
  Button,
  Select,
  FormControl,
  FormLabel,
  Container,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Tooltip,
  Divider,
  useBreakpointValue,
  Spinner,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import {
  MdNotificationsActive,
  MdDone,
  MdPause,
  MdPlayArrow,
  MdSkipNext,
  MdWarning,
  MdTimer,
  MdTrendingUp,
  MdMenu
} from "react-icons/md";
import {
  FaVolumeUp,
  FaWheelchair,
  FaUserMd,
  FaClock,
  FaHospital,
  FaBell,
  FaCheckCircle,
  FaUser,
  FaArrowLeft,
  FaForward,
  FaExclamationTriangle,
  FaBars,
  FaChartLine
} from "react-icons/fa";
import { useRouter } from 'next/router';
import { modernTheme, fadeInUp, slideInFromLeft, slideInFromRight, GlassCard, ModernContainer, pulseGlow } from '../../components/theme/ModernTheme';

// Animaciones adicionales específicas de esta página - más suaves
const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 149, 0, 0.4);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 20px 10px rgba(255, 149, 0, 0);
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// Componente Principal - Panel de Atención con Quick Actions
export default function Attention() {
  const router = useRouter();

  // Estados existentes
  const [userId, setUserId] = useState(null);
  const [pendingTurns, setPendingTurns] = useState([]);
  const [inProgressTurns, setInProgressTurns] = useState([]);
  const [currentTime, setCurrentTime] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [selectedCubicle, setSelectedCubicle] = useState("");
  const [cubicles, setCubicles] = useState([]);
  const [processingTurns, setProcessingTurns] = useState(new Set());
  const [hidingTurns, setHidingTurns] = useState(new Set());
  const [skippedTurns, setSkippedTurns] = useState(new Set()); // Turnos saltados por este flebotomista

  // Nuevos estados para Quick Actions
  const [dailyStats, setDailyStats] = useState({
    totalAttended: 0,
    averageAttentionTime: 0,
    efficiencyPercentage: 0,
    totalPending: 0,
    totalInProgress: 0,
  });
  const [viewMode, setViewMode] = useState('single');
  const [isTablet, setIsTablet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidePanelTabIndex, setSidePanelTabIndex] = useState(0);
  const [activePatient, setActivePatient] = useState(null); // Paciente actualmente en atención

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Responsive values
  const isSidebarCollapsed = useBreakpointValue({ base: true, lg: false });
  const showMobileDrawer = useBreakpointValue({ base: true, md: false });

  // Detectar dispositivo
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Calcular estadísticas diarias del flebotomista
  useEffect(() => {
    const fetchDailyStats = async () => {
      try {
        // Solo hacer fetch si tenemos el userId
        if (!userId) return;

        const response = await fetch(`/api/statistics/phlebotomist-daily?userId=${userId}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setDailyStats(result.data);
          }
        }
      } catch (error) {
        console.error('Error fetching daily stats:', error);
      }
    };

    if (mounted && userId) {
      fetchDailyStats();
      const interval = setInterval(fetchDailyStats, 30000);
      return () => clearInterval(interval);
    }
  }, [mounted, userId]);

  // Efecto para manejar la hidratación
  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    
    // Obtener usuario del token
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserId(payload.userId);
      } catch (error) {
        console.error("Error al decodificar token:", error);
      }
    }

    // Obtener cubículo seleccionado
    const savedCubicle = localStorage.getItem("selectedCubicle");
    if (savedCubicle) {
      setSelectedCubicle(savedCubicle);
    }
  }, []);

  // Actualizar hora cada segundo
  useEffect(() => {
    if (mounted) {
      const timeInterval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(timeInterval);
    }
  }, [mounted]);

  // Cargar cubículos
  useEffect(() => {
    const fetchCubicles = async () => {
      try {
        const response = await fetch("/api/cubicles");
        if (response.ok) {
          const data = await response.json();
          setCubicles(data);
        }
      } catch (error) {
        console.error("Error al cargar cubículos:", error);
      }
    };
    
    if (mounted) {
      fetchCubicles();
    }
  }, [mounted]);

  // Función refactorizada para cargar turnos
  const fetchTurns = useCallback(async () => {
    try {
      const response = await fetch("/api/attention/list");
      if (!response.ok) throw new Error("Error al cargar los turnos.");
      const data = await response.json();
      setPendingTurns(data.pendingTurns || []);
      setInProgressTurns(data.inProgressTurns || []);
    } catch (error) {
      console.error("Error al cargar los turnos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los turnos.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  }, [toast]);

  // Cargar turnos con polling
  useEffect(() => {
    if (mounted) {
      fetchTurns();
      const intervalId = setInterval(fetchTurns, 10000);
      return () => clearInterval(intervalId);
    }
  }, [mounted, fetchTurns]);

  const formatTime = (date) => {
    if (!date || !mounted) return "--:--:--";
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    if (!date || !mounted) return "";
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleCubicleChange = (value) => {
    setSelectedCubicle(value);
    localStorage.setItem("selectedCubicle", value);
  };

  // Nueva función para saltar turno (sin modificar orden en BD)
  const handleSkipPatient = async (turnId) => {
    if (!turnId) return;

    // Agregar el turno a la lista de saltados para este flebotomista
    setSkippedTurns(prev => new Set(prev).add(turnId));

    // Limpiar paciente activo si estaba activo
    if (activePatient && activePatient.id === turnId) {
      setActivePatient(null);
    }

    toast({
      title: "Turno saltado",
      description: "Mostrando siguiente paciente disponible",
      status: "info",
      duration: 2000,
      position: "top",
    });
  };

  // Nueva función para modo emergencia
  const handleEmergency = () => {
    toast({
      title: "🚨 Modo Emergencia Activado",
      description: "Se ha notificado al supervisor",
      status: "warning",
      duration: 5000,
      position: "top",
      isClosable: false,
    });
  };

  const handleCallPatient = async (turnId) => {

    if (!selectedCubicle || !userId) {
      toast({
        title: "Error",
        description: "Debe seleccionar un cubículo antes de llamar al paciente.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    // Verificar que el turno existe
    const turnToCall = pendingTurns.find(t => t.id === turnId);
    if (!turnToCall) {
      toast({
        title: "Error",
        description: "El turno no fue encontrado.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }


    // Prevenir clicks duplicados
    if (processingTurns.has(turnId)) return;
    
    // Marcar como en proceso
    setProcessingTurns(prev => new Set(prev).add(turnId));
    
    // Iniciar animación de ocultamiento para sacar de pendientes
    setHidingTurns(prev => new Set(prev).add(turnId));
    
    // Mover inmediatamente a en proceso (optimista)
    const turnToMove = pendingTurns.find(t => t.id === turnId);
    if (turnToMove) {
      setTimeout(() => {
        setPendingTurns(prev => prev.filter(turn => turn.id !== turnId));
        setHidingTurns(prev => {
          const newSet = new Set(prev);
          newSet.delete(turnId);
          return newSet;
        });
      }, 300);
    }
    
    try {
      const response = await fetch("/api/attention/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnId, userId, cubicleId: selectedCubicle }),
      });

      if (response.ok) {
        // Mostrar solo un mensaje de éxito
        toast({
          title: "✓ Paciente llamado",
          description: `${turnToCall.patientName} (Turno #${turnToCall.assignedTurn}) fue llamado al ${cubicles.find(c => c.id === parseInt(selectedCubicle))?.name || 'cubículo'}.`,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });

        // Establecer el paciente como activo con información del cubículo
        const calledPatient = {
          ...turnToCall,
          cubicleId: selectedCubicle,
          cubicle: cubicles.find(c => c.id === parseInt(selectedCubicle))
        };
        setActivePatient(calledPatient);

        // Si este turno estaba saltado, quitarlo de la lista de saltados
        setSkippedTurns(prev => {
          const newSet = new Set(prev);
          newSet.delete(turnId);
          return newSet;
        });

        // Actualizar las listas después del éxito
        const updatedTurns = await fetch("/api/attention/list");
        if (updatedTurns.ok) {
          const data = await updatedTurns.json();
          setPendingTurns(data.pendingTurns || []);
          setInProgressTurns(data.inProgressTurns || []);
        }
      } else {
        // Si falla, restaurar el paciente en pendientes
        setHidingTurns(prev => {
          const newSet = new Set(prev);
          newSet.delete(turnId);
          return newSet;
        });
        
        const restoredTurns = await fetch("/api/attention/list");
        if (restoredTurns.ok) {
          const data = await restoredTurns.json();
          setPendingTurns(data.pendingTurns || []);
        }
        
        throw new Error("Error al llamar al paciente.");
      }
    } catch (error) {
      console.error("Error al llamar al paciente:", error);
      
      // Restaurar si hay error
      setHidingTurns(prev => {
        const newSet = new Set(prev);
        newSet.delete(turnId);
        return newSet;
      });
      
      const restoredTurns = await fetch("/api/attention/list");
      if (restoredTurns.ok) {
        const data = await restoredTurns.json();
        setPendingTurns(data.pendingTurns || []);
      }
      
      toast({
        title: "Error",
        description: "No se pudo llamar al paciente.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } finally {
      // Limpiar el estado de procesamiento
      setProcessingTurns(prev => {
        const newSet = new Set(prev);
        newSet.delete(turnId);
        return newSet;
      });
    }
  };

  const handleRepeatCall = async (turnId) => {
    // Prevenir clicks duplicados
    if (processingTurns.has(`repeat-${turnId}`)) return;
    
    // Marcar como en proceso
    setProcessingTurns(prev => new Set(prev).add(`repeat-${turnId}`));
    
    try {
      const response = await fetch("/api/attention/repeatCall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnId }),
      });

      if (response.ok) {
        // Mostrar solo un mensaje de éxito
        toast({
          title: "🔊 Llamado repetido",
          description: `El paciente será llamado nuevamente.`,
          status: "info",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      } else {
        throw new Error("Error al repetir el llamado.");
      }
    } catch (error) {
      console.error("Error al repetir el llamado:", error);
      toast({
        title: "Error",
        description: "No se pudo repetir el llamado.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } finally {
      // Limpiar el estado de procesamiento
      setProcessingTurns(prev => {
        const newSet = new Set(prev);
        newSet.delete(`repeat-${turnId}`);
        return newSet;
      });
    }
  };

  const handleCompleteAttention = async (turnId) => {
    // Prevenir clicks duplicados
    if (processingTurns.has(turnId)) return;
    
    // Marcar como en proceso
    setProcessingTurns(prev => new Set(prev).add(turnId));
    
    // Iniciar animación de ocultamiento
    setHidingTurns(prev => new Set(prev).add(turnId));
    
    // Esperar un momento para la animación antes de remover
    setTimeout(() => {
      setInProgressTurns(prev => prev.filter(turn => turn.id !== turnId));
      setHidingTurns(prev => {
        const newSet = new Set(prev);
        newSet.delete(turnId);
        return newSet;
      });
    }, 300);

    try {
      const response = await fetch("/api/attention/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnId }),
      });

      if (response.ok) {
        // Mostrar solo un mensaje de éxito
        toast({
          title: "✓ Atención finalizada",
          description: "El paciente ha sido atendido exitosamente.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });

        // Limpiar paciente activo después de completar
        setActivePatient(null);

        // También quitar de saltados si estaba ahí
        setSkippedTurns(prev => {
          const newSet = new Set(prev);
          newSet.delete(turnId);
          return newSet;
        });
      } else {
        // Si falla, restaurar el paciente en la lista
        throw new Error("Error al finalizar la atención.");
      }
    } catch (error) {
      console.error("Error al finalizar la atención:", error);
      // Restaurar si hay error
      setHidingTurns(prev => {
        const newSet = new Set(prev);
        newSet.delete(turnId);
        return newSet;
      });
      
      const restoredTurns = await fetch("/api/attention/list");
      if (restoredTurns.ok) {
        const data = await restoredTurns.json();
        setInProgressTurns(data.inProgressTurns || []);
      }
      
      toast({
        title: "Error",
        description: "No se pudo finalizar la atención. Intente nuevamente.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } finally {
      // Limpiar el estado de procesamiento
      setProcessingTurns(prev => {
        const newSet = new Set(prev);
        newSet.delete(turnId);
        return newSet;
      });
    }
  };

  // Atajos de teclado
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Solo si no hay input activo
      if (document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'SELECT' ||
          document.activeElement.tagName === 'TEXTAREA') return;

      const nextPatientForKey = pendingTurns[0];
      const currentPatientForKey = inProgressTurns[0];

      switch(e.key) {
        case ' ':
        case 'Enter':
          if (nextPatientForKey && !e.shiftKey) {
            e.preventDefault();
            handleCallPatient(nextPatientForKey.id);
          }
          break;
        case 'f':
        case 'F':
          if (currentPatientForKey) {
            e.preventDefault();
            handleCompleteAttention(currentPatientForKey.id);
          }
          break;
        case 'r':
        case 'R':
          if (currentPatientForKey) {
            e.preventDefault();
            handleRepeatCall(currentPatientForKey.id);
          }
          break;
        case 's':
        case 'Tab':
          if (nextPatientForKey && e.shiftKey) {
            e.preventDefault();
            handleSkipPatient(nextPatientForKey.id);
          }
          break;
        case 'e':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleEmergency();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [pendingTurns, inProgressTurns]);

  const goBack = () => {
    window.history.back();
  };

  // Componente CurrentPatientCard con Glassmorphism
  const CurrentPatientCard = ({ patient, onCall, onComplete, onRepeat, isProcessing, selectedCubicle, isActive }) => {
    if (!patient) {
      return (
        <GlassCard
          p={{ base: 4, md: 6, lg: 8 }}
          minH={{ base: "250px", md: "400px", lg: "500px" }}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <FaUser fontSize="48px" color="#94a3b8" mb={4} />
          <Text fontSize="2xl" color="secondary.500" fontWeight="semibold">
            No hay pacientes en espera
          </Text>
          <Text fontSize="md" color="secondary.400" mt={2}>
            Los nuevos turnos aparecerán aquí
          </Text>
        </GlassCard>
      );
    }

    return (
      <GlassCard
        p={{ base: 4, sm: 6, md: 8 }}
        minH={{ base: "320px", md: "500px" }}
        border={patient.isSpecial ? "2px solid" : "1px solid"}
        borderColor={patient.isSpecial ? "orange.400" : "rgba(255, 255, 255, 0.18)"}
        position="relative"
        animation={patient.isSpecial ? `${pulse} 3s ease-in-out infinite` : undefined}
      >
        {patient.isSpecial && (
          <Badge
            position="absolute"
            top={4}
            right={4}
            colorScheme="orange"
            fontSize="sm"
            px={3}
            py={1}
          >
            <FaWheelchair style={{ marginRight: '4px', display: 'inline' }} />
            Prioritario
          </Badge>
        )}

        <VStack spacing={{ base: 4, md: 6 }} align="center" h="full" justify="center">
          <Text fontSize={{ base: "4xl", sm: "5xl", md: "6xl" }} fontWeight="bold" color="primary.500">
            #{patient.assignedTurn}
          </Text>

          <Box textAlign="center">
            <Text fontSize={{ base: "xl", sm: "2xl", md: "3xl" }} fontWeight="semibold" color="gray.800">
              {patient.patientName}
            </Text>
            {patient.waitTime && (
              <Text fontSize="md" color="secondary.500" mt={2}>
                <FaClock style={{ display: 'inline', marginRight: '4px' }} />
                Esperando: {patient.waitTime} min
              </Text>
            )}
          </Box>

          {/* Botones según el estado del paciente */}
          {isActive ? (
            // Paciente activo - mostrar botones de repetir y finalizar
            <VStack spacing={4} w="full" align="center">
              <HStack spacing={4}>
                <Button
                  size="lg"
                  h={{ base: "60px", md: "70px" }}
                  minW={{ base: "150px", md: "180px" }}
                  variant="warning"
                  background="linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
                  color="white"
                  leftIcon={<FaBell size="24" />}
                  onClick={() => onRepeat(patient.id)}
                  isLoading={isProcessing}
                  fontSize={{ base: "lg", md: "xl" }}
                  fontWeight="bold"
                  borderRadius="xl"
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
                  _active={{ transform: 'scale(0.98)' }}
                >
                  Repetir Llamado
                </Button>
                <Button
                  size="lg"
                  h={{ base: "60px", md: "70px" }}
                  minW={{ base: "150px", md: "180px" }}
                  variant="success"
                  background="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                  color="white"
                  leftIcon={<FaCheckCircle size="24" />}
                  onClick={() => onComplete(patient.id)}
                  isLoading={isProcessing}
                  fontSize={{ base: "lg", md: "xl" }}
                  fontWeight="bold"
                  borderRadius="xl"
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
                  _active={{ transform: 'scale(0.98)' }}
                >
                  Toma Finalizada
                </Button>
              </HStack>
              {patient.cubicle && (
                <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                  En atención en {patient.cubicle.name}
                </Badge>
              )}
            </VStack>
          ) : (
            // Paciente en espera - mostrar botón de llamar
            <>
              <Button
                size="lg"
                h={{ base: "60px", md: "70px" }}
                w="full"
                maxW={{ base: "320px", md: "400px" }}
                variant="gradient"
                background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
                color="white"
                leftIcon={<FaBell size="24" />}
                onClick={() => {
                  onCall(patient.id);
                }}
                isLoading={isProcessing}
                isDisabled={!selectedCubicle}
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight="bold"
                borderRadius="xl"
                boxShadow="lg"
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
                _active={{ transform: 'scale(0.98)' }}
              >
                LLAMAR PACIENTE
              </Button>
              <Text fontSize={{ base: "xs", md: "sm" }} color="secondary.400" textAlign="center" display={{ base: "none", md: "block" }}>
                Presione <kbd>Espacio</kbd> o <kbd>Enter</kbd> para llamar
              </Text>
            </>
          )}
        </VStack>
      </GlassCard>
    );
  };

  // Componente QuickActionsBar
  const QuickActionsBar = ({ patient, onSkip, onComplete, onEmergency, isProcessing }) => {
    if (!patient) return null;

    return (
      <Stack
        direction={{ base: "column", sm: "row" }}
        spacing={{ base: 3, md: 4 }}
        justify="center"
        mt={{ base: 4, md: 6 }}
        w="full"
      >
        <Tooltip label="Saltar al siguiente paciente (mantiene orden original)" placement="top">
          <Button
            variant="outline"
            colorScheme="gray"
            leftIcon={<MdSkipNext size="20" />}
            onClick={() => onSkip(patient.id)}
            isDisabled={isProcessing}
            size="lg"
            h={{ base: "50px", md: "60px" }}
            w={{ base: "full", sm: "auto" }}
            fontSize={{ base: "md", md: "lg" }}
          >
            Saltar al siguiente
          </Button>
        </Tooltip>

        <Tooltip label="Toma Finalizada (F)" placement="top">
          <Button
            colorScheme="green"
            leftIcon={<FaCheckCircle size="20" />}
            onClick={() => onComplete(patient.id)}
            isDisabled={isProcessing}
            size="lg"
            h={{ base: "50px", md: "60px" }}
            w={{ base: "full", sm: "auto" }}
            fontSize={{ base: "md", md: "lg" }}
          >
            Paciente atendido
          </Button>
        </Tooltip>

        <Tooltip label="Modo emergencia (Ctrl+E)" placement="top">
          <Button
            variant="solid"
            colorScheme="orange"
            leftIcon={<FaExclamationTriangle size="20" />}
            onClick={onEmergency}
            size="lg"
            h={{ base: "50px", md: "60px" }}
            w={{ base: "full", sm: "auto" }}
            fontSize={{ base: "md", md: "lg" }}
          >
            Emergencia
          </Button>
        </Tooltip>
      </Stack>
    );
  };

  // Componente SidePanel
  const SidePanel = ({ pendingTurns, inProgressTurns, onCall, onComplete, onRepeat, processingTurns, tabIndex, onTabChange }) => {
    return (
      <Tabs
        colorScheme="blue"
        size="md"
        index={tabIndex}
        onChange={onTabChange}
      >
        <TabList>
          <Tab fontWeight="semibold" fontSize="md">
            En Espera ({pendingTurns.length})
          </Tab>
          <Tab fontWeight="semibold" fontSize="md">
            En Atención ({inProgressTurns.length})
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0} maxH="400px" overflowY="auto">
            <VStack spacing={2} align="stretch">
              {pendingTurns.map((turn, index) => (
                <HStack
                  key={turn.id}
                  p={4}
                  bg={index === 0 ? "blue.50" : "gray.50"}
                  borderRadius="lg"
                  justify="space-between"
                  borderLeft="4px solid"
                  borderLeftColor={turn.isSpecial ? "orange.400" : "blue.400"}
                  minH="60px"
                >
                  <HStack spacing={3}>
                    <Badge colorScheme="blue" fontSize="lg" px={2} py={1}>#{turn.assignedTurn}</Badge>
                    <Text fontWeight="medium" fontSize="md">{turn.patientName}</Text>
                    {turn.isSpecial && <FaWheelchair color="#FF9500" />}
                  </HStack>
                  {index === 0 && (
                    <IconButton
                      size="md"
                      icon={<FaBell />}
                      colorScheme="blue"
                      variant="solid"
                      onClick={() => onCall(turn.id)}
                      isDisabled={processingTurns.has(turn.id)}
                      aria-label="Llamar paciente"
                    />
                  )}
                </HStack>
              ))}
              {pendingTurns.length === 0 && (
                <Text textAlign="center" color="gray.500" py={4}>
                  No hay pacientes esperando
                </Text>
              )}
            </VStack>
          </TabPanel>

          <TabPanel px={0} maxH="400px" overflowY="auto">
            <VStack spacing={2} align="stretch">
              {inProgressTurns.map((turn) => (
                <Box
                  key={turn.id}
                  p={4}
                  bg="green.50"
                  borderRadius="lg"
                  borderLeft="4px solid"
                  borderLeftColor="green.400"
                  minH="80px"
                >
                  <HStack justify="space-between" mb={2}>
                    <Badge colorScheme="green" fontSize="lg" px={2} py={1}>#{turn.assignedTurn}</Badge>
                    <HStack spacing={2}>
                      <IconButton
                        size="md"
                        icon={<FaVolumeUp />}
                        colorScheme="orange"
                        variant="solid"
                        onClick={() => onRepeat(turn.id)}
                        isDisabled={processingTurns.has(`repeat-${turn.id}`)}
                        aria-label="Repetir llamado"
                      />
                      <IconButton
                        size="md"
                        icon={<FaCheckCircle />}
                        colorScheme="green"
                        variant="solid"
                        onClick={() => onComplete(turn.id)}
                        isDisabled={processingTurns.has(turn.id)}
                        aria-label="Toma Finalizada"
                      />
                    </HStack>
                  </HStack>
                  <Text fontWeight="medium" fontSize="md">{turn.patientName}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {turn.cubicleName} - {turn.flebotomistName}
                  </Text>
                </Box>
              ))}
              {inProgressTurns.length === 0 && (
                <Text textAlign="center" color="gray.500" py={4}>
                  No hay pacientes en atención
                </Text>
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    );
  };

  // Componente StatsFooter con Glassmorphism
  const StatsFooter = ({ stats }) => {
    return (
      <GlassCard p={4}>
        <SimpleGrid columns={{ base: 2, sm: 2, md: 4 }} spacing={{ base: 3, md: 4 }}>
        <Stat>
          <StatLabel fontSize="xs" color="gray.600">Mis Atendidos Hoy</StatLabel>
          <StatNumber fontSize={{ base: "xl", md: "2xl" }} color="green.500">{stats.totalAttended}</StatNumber>
          <StatHelpText fontSize="xs">
            <StatArrow type="increase" />
            {stats.efficiencyPercentage}%
          </StatHelpText>
        </Stat>

        <Stat>
          <StatLabel fontSize="xs" color="gray.600">Tiempo Promedio</StatLabel>
          <StatNumber fontSize="2xl" color="blue.500">{stats.averageAttentionTime} min</StatNumber>
          <StatHelpText>
            <MdTimer style={{ display: 'inline' }} /> Por paciente
          </StatHelpText>
        </Stat>

        <Stat>
          <StatLabel fontSize="xs" color="gray.600">En Espera</StatLabel>
          <StatNumber fontSize="2xl" color="orange.500">{stats.totalPending}</StatNumber>
          <StatHelpText>Pacientes</StatHelpText>
        </Stat>

        <Stat>
          <StatLabel fontSize="xs" color="gray.600">En Atención</StatLabel>
          <StatNumber fontSize="2xl" color="purple.500">{stats.totalInProgress}</StatNumber>
          <StatHelpText>Actualmente</StatHelpText>
        </Stat>
        </SimpleGrid>
      </GlassCard>
    );
  };

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
                Cargando panel de atención...
              </Text>
            </GlassCard>
          </Box>
        </ModernContainer>
      </ChakraProvider>
    );
  }

  // Obtener el próximo paciente y el actual
  // Filtrar turnos saltados para este flebotomista
  const availablePendingTurns = pendingTurns.filter(turn => !skippedTurns.has(turn.id));

  // Determinar qué paciente mostrar en la tarjeta principal
  const nextPatient = availablePendingTurns[0] || null;
  const displayPatient = activePatient || nextPatient;
  const currentPatient = inProgressTurns[0] || null;

  return (
    <ChakraProvider theme={modernTheme}>
      <ModernContainer pb={{ base: isMobile ? "80px" : 0, md: 0 }}>
        {/* Header con Glassmorphism */}
        <GlassCard
          h={{ base: "auto", md: "60px" }}
          borderRadius="2xl"
          px={{ base: 3, md: 6 }}
          py={{ base: 2, md: 0 }}
          mb={4}
          position="sticky"
          top={4}
          zIndex={100}
        >
          <Flex
            h="full"
            align="center"
            justify="space-between"
            direction={{ base: "column", sm: "row" }}
            gap={{ base: 2, sm: 0 }}
          >
            {/* Logo y Título */}
            <HStack spacing={2} w={{ base: "full", sm: "auto" }} justify={{ base: "space-between", sm: "flex-start" }}>
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
              {isMobile && (
                <IconButton
                  icon={<FaBars size="22" />}
                  variant="solid"
                  onClick={onOpen}
                  aria-label="Menu"
                  size="md"
                  colorScheme="gray"
                />
              )}
              <Heading
                size={{ base: "md", md: "lg" }}
                fontWeight="bold"
                background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
                backgroundClip="text"
                color="transparent"
              >
                Panel de Atención
              </Heading>

              {/* Reloj Digital para móvil */}
              {isMobile && (
                <Text fontSize="sm" fontWeight="medium" color="gray.600">
                  {currentTime ? formatTime(currentTime) : "--:--:--"}
                </Text>
              )}
            </HStack>

            {/* Selector de Cubículo */}
            <HStack spacing={4} w={{ base: "full", sm: "auto" }}>
              <Select
                value={selectedCubicle}
                onChange={(e) => handleCubicleChange(e.target.value)}
                placeholder="Seleccionar cubículo"
                size="md"
                w={{ base: "full", sm: "250px" }}
                maxW={{ base: "none", sm: "250px" }}
                bg="white"
                borderColor="gray.300"
                _focus={{ borderColor: "primary.500" }}
                fontSize={{ base: "md", md: "lg" }}
              >
                {cubicles.map((cubicle) => (
                  <option key={cubicle.id} value={cubicle.id}>
                    {cubicle.name} {cubicle.isSpecial && "(★)"}
                  </option>
                ))}
              </Select>

              {/* Reloj Digital Desktop */}
              <Box display={{ base: "none", md: "block" }}>
                <Text fontSize="lg" fontWeight="bold" color="gray.700">
                  {currentTime ? formatTime(currentTime) : "--:--:--"}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {currentTime ? formatDate(currentTime) : ""}
                </Text>
              </Box>
            </HStack>
          </Flex>
        </GlassCard>

        {/* Main Content */}
        <Container maxW="container.xl" py={{ base: 3, md: 6 }} px={{ base: 3, sm: 4, md: 6 }}>
          <Grid
            templateColumns={{ base: "1fr", lg: "7fr 3fr" }}
            gap={{ base: 4, md: 6 }}
            alignItems="start"
          >
            {/* Panel Principal */}
            <VStack spacing={{ base: 3, md: 4 }} align="stretch">
              {/* Paciente Actual / Próximo */}
              <CurrentPatientCard
                patient={displayPatient}
                onCall={handleCallPatient}
                onComplete={handleCompleteAttention}
                onRepeat={handleRepeatCall}
                isProcessing={processingTurns.has(displayPatient?.id)}
                selectedCubicle={selectedCubicle}
                isActive={!!activePatient && displayPatient?.id === activePatient?.id}
              />

              {/* Indicador de turnos saltados */}
              {skippedTurns.size > 0 && (
                <Box
                  bg="yellow.50"
                  border="1px solid"
                  borderColor="yellow.300"
                  borderRadius="md"
                  p={3}
                  mt={2}
                >
                  <HStack spacing={2}>
                    <MdWarning color="orange" size="20" />
                    <Text fontSize="sm" color="gray.700">
                      {skippedTurns.size} {skippedTurns.size === 1 ? 'turno saltado' : 'turnos saltados'}.
                      Otros flebotomistas pueden atenderlos.
                    </Text>
                  </HStack>
                </Box>
              )}

              {/* Quick Actions - Solo mostrar cuando no hay paciente activo */}
              {!activePatient && (nextPatient || currentPatient) && (
                <QuickActionsBar
                  patient={currentPatient || nextPatient}
                  onSkip={handleSkipPatient}
                  onComplete={handleCompleteAttention}
                  onEmergency={handleEmergency}
                  isProcessing={processingTurns.has(currentPatient?.id || nextPatient?.id)}
                />
              )}
            </VStack>

            {/* Panel Lateral - Desktop */}
            {!isMobile && (
              <GlassCard
                p={4}
                position="sticky"
                top="80px"
              >
                <SidePanel
                  pendingTurns={pendingTurns}
                  inProgressTurns={inProgressTurns}
                  onCall={handleCallPatient}
                  onComplete={handleCompleteAttention}
                  onRepeat={handleRepeatCall}
                  processingTurns={processingTurns}
                  tabIndex={sidePanelTabIndex}
                  onTabChange={setSidePanelTabIndex}
                />

                <Divider my={4} />

                {/* Mini Stats */}
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Total Espera:</Text>
                    <Badge colorScheme="orange" fontSize="md">{pendingTurns.length}</Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">En Atención:</Text>
                    <Badge colorScheme="green" fontSize="md">{inProgressTurns.length}</Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Mis Atendidos:</Text>
                    <Badge colorScheme="blue" fontSize="md">{dailyStats.totalAttended}</Badge>
                  </HStack>
                </VStack>
              </GlassCard>
            )}
          </Grid>

          {/* Footer Stats - Hidden on Mobile */}
          <Box mt={6} display={{ base: "none", md: "block" }}>
            <StatsFooter
              stats={{
                ...dailyStats,
                totalPending: pendingTurns.length,
                totalInProgress: inProgressTurns.length,
              }}
            />
          </Box>
        </Container>

        {/* Mobile Drawer */}
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size={{ base: "full", sm: "md" }}>
          <DrawerOverlay />
          <DrawerContent maxW={{ base: "100%", sm: "md" }}>
            <DrawerCloseButton />
            <DrawerHeader>Pacientes</DrawerHeader>
            <DrawerBody>
              <SidePanel
                pendingTurns={pendingTurns}
                inProgressTurns={inProgressTurns}
                onCall={handleCallPatient}
                onComplete={handleCompleteAttention}
                onRepeat={handleRepeatCall}
                processingTurns={processingTurns}
                tabIndex={sidePanelTabIndex}
                onTabChange={setSidePanelTabIndex}
              />
            </DrawerBody>
            <DrawerFooter>
              <VStack w="full" align="stretch" spacing={2}>
                <HStack justify="space-between">
                  <Text fontSize="sm">En Espera:</Text>
                  <Badge colorScheme="orange">{pendingTurns.length}</Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm">Mis Atendidos:</Text>
                  <Badge colorScheme="green">{dailyStats.totalAttended}</Badge>
                </HStack>
              </VStack>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Bottom Navigation - Mobile Only */}
        {isMobile && (
          <Box
            position="fixed"
            bottom={0}
            left={0}
            right={0}
            bg="white"
            borderTop="1px solid"
            borderColor="gray.200"
            p={2}
            boxShadow="lg"
            zIndex={99}
          >
            <HStack justify="space-around">
              <VStack spacing={1}>
                <IconButton
                  icon={<FaArrowLeft size="20" />}
                  onClick={goBack}
                  variant="solid"
                  size="md"
                  aria-label="Volver"
                  colorScheme="gray"
                />
                <Text fontSize="xs" color="gray.600">Volver</Text>
              </VStack>
              <VStack spacing={1}>
                <IconButton
                  icon={<FaBars size="20" />}
                  onClick={onOpen}
                  variant="solid"
                  size="md"
                  aria-label="Lista"
                  colorScheme={isOpen ? "blue" : "gray"}
                />
                <Text fontSize="xs" color="gray.600">Pacientes</Text>
              </VStack>
              <VStack spacing={1}>
                <Badge colorScheme="orange" fontSize="lg" px={3} py={1}>
                  {pendingTurns.length}
                </Badge>
                <Text fontSize="xs" color="gray.600">En Espera</Text>
              </VStack>
            </HStack>
          </Box>
        )}
      </ModernContainer>
    </ChakraProvider>
  );
}