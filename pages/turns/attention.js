import { useState, useEffect, useCallback, useRef, memo, useMemo, useLayoutEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  Text,
  IconButton,
  useToast,
  Flex,
  Stack,
  Grid,
  Badge,
  HStack,
  Button,
  Select,
  FormControl,
  FormLabel,
  Container,
  Tabs,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
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
  FaHourglass,
  FaHospital,
  FaBell,
  FaCheckCircle,
  FaUser,
  FaArrowLeft,
  FaForward,
  FaExclamationTriangle,
  FaBars,
  FaChartLine,
  FaExchangeAlt,
  FaVial,
  FaSignOutAlt
} from "react-icons/fa";
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { fadeInUp, slideInFromLeft, slideInFromRight, GlassCard, ModernContainer, pulseGlow } from '../../components/theme/ModernTheme';
import { TUBE_TYPES, getTubeById, enrichTubesDetails } from '../../lib/tubesCatalog';

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
  console.log('[Attention] ========== COMPONENT RENDER ==========');
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    console.log('[Attention] handleLogout called');

    // NUEVO: Verificar si tiene paciente en atención y pedir confirmación
    if (activePatient) {
      const confirmed = window.confirm(
        `¿Estás seguro que deseas finalizar sesión?\n\n` +
        `Tienes un paciente en atención: ${activePatient.patientName}\n\n` +
        `Al cerrar sesión, el paciente quedará asignado a ti y podrás continuar cuando vuelvas a entrar.`
      );
      if (!confirmed) {
        console.log('[Attention] Logout cancelado por el usuario');
        return;
      }
    }

    // Liberar holdings antes del logout (NO libera pacientes "In Progress")
    if (userId) {
      try {
        await fetch('/api/queue/releaseHolding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
        console.log('[Attention] Holdings liberados antes de logout');
      } catch (e) {
        console.error('[Attention] Error liberando holding:', e);
      }
    }
    logout();
    router.push('/login');
  };

  // Estados existentes
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [pendingTurns, setPendingTurns] = useState([]);
  const [inProgressTurns, setInProgressTurns] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [selectedCubicle, setSelectedCubicle] = useState("");
  const [cubicles, setCubicles] = useState([]);
  const [processingTurns, setProcessingTurns] = useState(new Set());
  const [hidingTurns, setHidingTurns] = useState(new Set());
  const [skippedTurns, setSkippedTurns] = useState(new Set()); // Turnos saltados por este flebotomista
  const [heldTurn, setHeldTurn] = useState(null); // Turno en holding asignado automáticamente
  const [isLoadingHolding, setIsLoadingHolding] = useState(true); // Estado de carga del holding
  const holdingAssignedRef = useRef(false); // Ref para evitar múltiples asignaciones de holding
  const [initialFetchDone, setInitialFetchDone] = useState(false); // NUEVO: Para esperar la primera carga antes de asignar holding

  console.log('[Attention] State - mounted:', mounted, 'userId:', userId, 'selectedCubicle:', selectedCubicle);
  console.log('[Attention] pendingTurns:', pendingTurns.length, 'inProgressTurns:', inProgressTurns.length);

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

  // Estado para modal de confirmación de toma diferida
  const { isOpen: isConfirmDeferOpen, onOpen: onConfirmDeferOpen, onClose: onConfirmDeferClose } = useDisclosure();
  const [patientToDefer, setPatientToDefer] = useState(null);

  // Estado para modal de cambio de prioridad
  const { isOpen: isChangePriorityOpen, onOpen: onChangePriorityOpen, onClose: onChangePriorityClose } = useDisclosure();
  const [patientToChangePriority, setPatientToChangePriority] = useState(null);

  // Estado para modal de detalles del paciente
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const [selectedPatientDetails, setSelectedPatientDetails] = useState(null);

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
    console.log('[Attention] useEffect - Component mounting...');
    setMounted(true);
    console.log('[Attention] useEffect - Mounted state set to true');

    // Obtener usuario del token
    const token = localStorage.getItem("token");
    console.log('[Attention] useEffect - Token exists:', !!token);
    let decodedRole = null;
    if (token) {
      try {
        console.log('[Attention] useEffect - Decoding token...');
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserId(payload.userId);
        setUserRole(payload.role);
        decodedRole = payload.role;
      } catch (error) {
        console.error("Error al decodificar token:", error);
      }
    }

    // Verificar si es supervisor o admin (para NO cargar cubículo automáticamente)
    const isSupervisorOrAdminRole = decodedRole &&
      ['supervisor', 'admin', 'administrador'].includes(decodedRole.toLowerCase());

    // Obtener cubículo seleccionado y sincronizar con backend
    // Para supervisores/admins: NO cargar cubículo automáticamente, dejar que seleccionen manualmente
    const savedCubicle = localStorage.getItem("selectedCubicle");
    if (savedCubicle && token && !isSupervisorOrAdminRole) {
      setSelectedCubicle(parseInt(savedCubicle)); // Convert to number for Select

      // Sincronizar con backend
      fetch("/api/session/update-cubicle", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ cubicleId: parseInt(savedCubicle) })
      }).catch(error => {
        console.error("Error al sincronizar cubículo:", error);
      });
    }
  }, []);

  // El reloj ahora está en un componente separado (Clock) para evitar re-renders

  // Cargar cubículos con estado de ocupación
  useEffect(() => {
    const fetchCubicles = async () => {
      try {
        const response = await fetch("/api/cubicles/status");
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setCubicles(result.data);
          }
        }
      } catch (error) {
        console.error("Error al cargar cubículos:", error);
      }
    };

    if (mounted) {
      fetchCubicles();
      // Actualizar estado de cubículos cada 5 segundos para detectar ocupación rápidamente
      const intervalId = setInterval(fetchCubicles, 5000);
      return () => clearInterval(intervalId);
    }
  }, [mounted]);

  // Función refactorizada para cargar turnos
  const fetchTurns = useCallback(async () => {
    try {
      // Incluir userId en la petición para obtener sugerencias personalizadas
      const url = userId ? `/api/attention/list?userId=${userId}` : "/api/attention/list";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Error al cargar los turnos.");
      const data = await response.json();
      setPendingTurns(data.pendingTurns || []);
      setInProgressTurns(data.inProgressTurns || []);

      // Si el usuario tiene un paciente en "In Progress", establecerlo como activePatient
      // Esto es importante para recuperar el estado después de recargar la página o re-login
      if (userId && data.inProgressTurns) {
        const myInProgressTurn = data.inProgressTurns.find(t => t.attendedBy === userId);
        if (myInProgressTurn) {
          // Siempre recuperar si hay un paciente "In Progress" del usuario
          if (!activePatient || activePatient.id !== myInProgressTurn.id) {
            console.log("[Attention] Recuperando paciente en atención:", myInProgressTurn.id, myInProgressTurn.patientName);
            setActivePatient(myInProgressTurn);
          }
          // Marcar que ya tenemos paciente activo, no necesitamos holding
          holdingAssignedRef.current = true;
          setIsLoadingHolding(false);
        } else if (activePatient) {
          // Paciente ya no está en "In Progress" — un admin lo completó, devolvió a cola, o liberó
          console.log("[Attention] Paciente activo ya no está en atención (acción externa detectada), limpiando...", activePatient.id, activePatient.patientName);
          setActivePatient(null);
          holdingAssignedRef.current = false; // Permitir asignar nuevo holding
          // Asignar siguiente paciente automáticamente
          assignHolding(true);
        }
      }

      // Verificar si el turno en holding sigue existiendo (admin pudo liberarlo)
      if (heldTurn && data.pendingTurns) {
        const myHeldTurn = data.pendingTurns.find(t => t.id === heldTurn.id);
        if (!myHeldTurn) {
          console.log("[Attention] Turno en holding ya no existe o fue liberado externamente:", heldTurn.id);
          setHeldTurn(null);
          holdingAssignedRef.current = false;
        }
      }

      // NUEVO: Marcar que la carga inicial terminó (para que assignHolding pueda ejecutarse)
      if (!initialFetchDone) {
        console.log("[Attention] Primera carga de turnos completada");
        setInitialFetchDone(true);
      }
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
      // NUEVO: Aún marcar como completado para no bloquear assignHolding
      if (!initialFetchDone) {
        setInitialFetchDone(true);
      }
    }
  }, [toast, userId, activePatient, heldTurn, initialFetchDone, assignHolding]);

  // Función para asignar holding automáticamente
  const assignHolding = useCallback(async (forceAssign = false) => {
    if (!userId) return null;

    // Evitar múltiples asignaciones simultáneas
    if (!forceAssign && holdingAssignedRef.current) {
      console.log("[Attention] Holding ya asignado, saltando...");
      return heldTurn;
    }

    setIsLoadingHolding(true);
    holdingAssignedRef.current = true;

    try {
      const response = await fetch("/api/queue/assignHolding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.turn) {
          setHeldTurn(data.turn);
          console.log("[Attention] Turno asignado en holding:", data.turn.id, data.turn.patientName);
          return data.turn;
        } else {
          // No hay turnos disponibles
          setHeldTurn(null);
          console.log("[Attention] No hay turnos disponibles para holding");
        }
      }
      return null;
    } catch (error) {
      console.error("Error al asignar holding:", error);
      return null;
    } finally {
      setIsLoadingHolding(false);
    }
  }, [userId, heldTurn]);

  // Función para liberar holding
  const releaseHolding = useCallback(() => {
    if (!userId) return;

    // Usar sendBeacon para envío confiable al cerrar la página
    const data = JSON.stringify({ userId });
    navigator.sendBeacon("/api/queue/releaseHolding", data);
    console.log("[Attention] Holding liberado para usuario:", userId);
  }, [userId]);

  // Cargar turnos con polling
  useEffect(() => {
    if (mounted) {
      fetchTurns();
      const intervalId = setInterval(fetchTurns, 10000);
      return () => clearInterval(intervalId);
    }
  }, [mounted, fetchTurns]);

  // Asignar holding automáticamente al montar (solo una vez)
  // IMPORTANTE: Esperar a que fetchTurns complete (initialFetchDone) antes de asignar holding
  // Esto previene race condition donde se asigna un nuevo paciente antes de recuperar el existente
  // FIX: Requiere cubículo seleccionado para evitar que admins/supervisores bloqueen pacientes en holding
  useEffect(() => {
    if (mounted && userId && initialFetchDone && selectedCubicle && !activePatient && !holdingAssignedRef.current) {
      // Asignar holding inicial solo después de verificar que no hay paciente "In Progress" Y hay cubículo
      console.log("[Attention] initialFetchDone=true, no activePatient, cubículo seleccionado, asignando holding...");
      assignHolding();
    }
  }, [mounted, userId, activePatient, initialFetchDone, selectedCubicle]); // NO incluir assignHolding en dependencias

  // Liberar holding cuando el usuario sale de la página o cierra la pestaña
  useEffect(() => {
    if (!userId) return;

    const handleBeforeUnload = () => {
      // Usar sendBeacon para envío confiable al cerrar
      const data = JSON.stringify({ userId });
      navigator.sendBeacon("/api/queue/releaseHolding", data);
      console.log("[Attention] Holding liberado via beforeunload");
    };

    const handleVisibilityChange = () => {
      // Liberar holding cuando el usuario cambia de pestaña o minimiza
      if (document.visibilityState === 'hidden') {
        const data = JSON.stringify({ userId });
        navigator.sendBeacon("/api/queue/releaseHolding", data);
        holdingAssignedRef.current = false; // Permitir reasignación al volver
        setHeldTurn(null);
        console.log("[Attention] Holding liberado via visibilitychange (hidden)");
      } else if (document.visibilityState === 'visible') {
        // Cuando vuelve a ser visible, reasignar holding (solo si hay cubículo seleccionado)
        if (selectedCubicle) {
          console.log("[Attention] Pestaña visible, cubículo seleccionado, reasignando holding...");
          assignHolding(true); // Forzar reasignación
        } else {
          console.log("[Attention] Pestaña visible pero sin cubículo, NO reasignando holding");
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // NO liberar aquí - solo en beforeunload/visibilitychange
    };
  }, [userId, selectedCubicle]); // NO incluir releaseHolding ni assignHolding para evitar re-ejecuciones

  const formatTime = (date) => {
    if (!date || !mounted) return "--:--";
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
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

  const handleCubicleChange = async (value) => {
    // Si ya hay un cubículo seleccionado y el usuario NO es admin/supervisor, no permitir el cambio
    if (selectedCubicle && !isSupervisorOrAdmin()) {
      toast({
        title: "Cubículo bloqueado",
        description: "Para cambiar de cubículo debes cerrar sesión y volver a ingresar. Esto garantiza la integridad de las estadísticas.",
        status: "warning",
        duration: 6000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    // Verificar si el cubículo está ocupado por otro usuario
    const cubicle = cubicles.find(c => c.id === parseInt(value));
    if (cubicle && cubicle.isOccupied) {
      // Si el cubículo está ocupado por el usuario actual, permitir selección
      if (cubicle.occupiedBy && cubicle.occupiedBy.userId === userId) {
        // Es el mismo usuario, permitir
      } else {
        // Es otro usuario, no permitir
        toast({
          title: "Cubículo ocupado",
          description: `${cubicle.name} está siendo utilizado por ${cubicle.occupiedBy?.userName || 'otro usuario'}.`,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
        return;
      }
    }

    // Actualizar el cubículo en la sesión del backend
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/session/update-cubicle", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ cubicleId: parseInt(value) })
      });

      if (!response.ok) {
        throw new Error("Error al actualizar cubículo en sesión");
      }
    } catch (error) {
      console.error("Error al actualizar cubículo:", error);
      // Continuar aunque falle, se guardará en localStorage
    }

    const cubicleId = parseInt(value);
    setSelectedCubicle(cubicleId); // Store as number for Select
    localStorage.setItem("selectedCubicle", value);

    toast({
      title: "Cubículo seleccionado",
      description: `Ahora estás trabajando en ${cubicle?.name || 'el cubículo seleccionado'}.`,
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top",
    });
  };

  // Función para verificar si el usuario es supervisor o administrador
  const isSupervisorOrAdmin = () => {
    if (!userRole) return false;
    const role = userRole.toLowerCase();
    return role === 'supervisor' || role === 'admin' || role === 'administrador';
  };

  // Función para saltar turno actual y obtener el siguiente
  const handleSkipPatient = async (turnId) => {
    if (!turnId || !userId) return;

    // Prevenir clicks duplicados
    if (processingTurns.has(`skip-${turnId}`)) return;
    setProcessingTurns(prev => new Set(prev).add(`skip-${turnId}`));

    try {
      const response = await fetch("/api/queue/skipHolding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          currentTurnId: turnId,
          skippedTurnIds: Array.from(skippedTurns) // Enviar lista de turnos previamente saltados
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.nextTurn) {
          // Agregar el turno actual a la lista de saltados (para excluirlo en futuros skips)
          setSkippedTurns(prev => new Set(prev).add(turnId));

          // Actualizar el turno en holding con el nuevo
          setHeldTurn(data.nextTurn);

          if (data.cycleCompleted) {
            // Ciclo completado - limpiar la lista de saltados para permitir volver a empezar
            setSkippedTurns(new Set());
            toast({
              title: "Ciclo completado",
              description: "No hay más pacientes, volviendo al anterior",
              status: "info",
              duration: 2000,
              position: "top",
            });
          } else {
            toast({
              title: "Paciente saltado",
              description: `Ahora tienes a ${data.nextTurn.patientName}`,
              status: "success",
              duration: 2000,
              position: "top",
            });
          }
        } else {
          // No hay más turnos disponibles - limpiar saltados para permitir reintentar
          setSkippedTurns(new Set());
          toast({
            title: "Sin más pacientes",
            description: "No hay más pacientes disponibles para saltar",
            status: "warning",
            duration: 2000,
            position: "top",
          });
        }

        // Actualizar la lista de turnos
        await fetchTurns();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al saltar paciente");
      }
    } catch (error) {
      console.error("Error al saltar paciente:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo saltar al siguiente paciente",
        status: "error",
        duration: 3000,
        position: "top",
      });
    } finally {
      setProcessingTurns(prev => {
        const newSet = new Set(prev);
        newSet.delete(`skip-${turnId}`);
        return newSet;
      });
    }
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

    // Verificar que el turno existe (puede estar en pendingTurns o en heldTurn)
    const turnToCall = pendingTurns.find(t => t.id === turnId) || (heldTurn?.id === turnId ? heldTurn : null);
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

        // Limpiar el turno en holding ya que ahora está en atención
        if (heldTurn && heldTurn.id === turnId) {
          setHeldTurn(null);
        }

        // Limpiar TODA la lista de saltados ya que el flebotomista está atendiendo
        // Esto permite que al terminar, pueda ver nuevamente todos los pacientes
        setSkippedTurns(new Set());

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

        // Leer el mensaje de error del API
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || "Error al llamar al paciente.";
        throw new Error(errorMessage);
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
        description: error.message || "No se pudo llamar al paciente.",
        status: "error",
        duration: 4000,
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
    // Validar que hay un turno válido
    if (!turnId) {
      toast({
        title: "Atención",
        description: "Por favor seleccione un paciente antes de marcarlo como atendido.",
        status: "warning",
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
        body: JSON.stringify({ turnId, userId }),
      });

      if (response.ok) {
        const data = await response.json();

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

        // Actualizar el turno en holding con el siguiente asignado por el backend
        if (data.nextHoldingTurn) {
          setHeldTurn(data.nextHoldingTurn);
          console.log("[Attention] Nuevo turno en holding:", data.nextHoldingTurn.id, data.nextHoldingTurn.patientName);
        } else {
          setHeldTurn(null);
        }

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

  // Función para abrir modal de confirmación
  const handleDeferTurn = (turnId) => {
    if (!turnId) {
      toast({
        title: "Atención",
        description: "Por favor seleccione un paciente.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    setPatientToDefer(turnId);
    onConfirmDeferOpen();
  };

  // Función para ejecutar la toma diferida después de confirmación
  const confirmDeferTurn = async () => {
    const turnId = patientToDefer;

    if (!turnId) return;

    // Cerrar modal
    onConfirmDeferClose();

    // Prevenir clicks duplicados
    if (processingTurns.has(turnId)) return;

    // Marcar como en proceso
    setProcessingTurns(prev => new Set(prev).add(turnId));

    try {
      const response = await fetch("/api/queue/defer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "✓ Toma diferida",
          description: "El paciente ha sido regresado a la cola de espera.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });

        // Limpiar paciente activo
        setActivePatient(null);
        setPatientToDefer(null);

        // Resetear el ref para permitir nueva asignación de holding
        holdingAssignedRef.current = false;

        // Asignar el siguiente turno en holding automáticamente
        await assignHolding(true);

        // Refrescar listas
        fetchTurns();
      } else {
        throw new Error(data.error || "Error al diferir la toma.");
      }
    } catch (error) {
      console.error("Error al diferir toma:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo regresar el paciente a la cola.",
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

  // Función para seleccionar y cargar paciente en atención al panel principal
  const handleSelectInProgressPatient = useCallback((turn) => {
    // Validar que el usuario haya seleccionado un cubículo
    const myCubicle = cubicles.find(c => c.id === parseInt(selectedCubicle));

    if (!myCubicle) {
      toast({
        title: "Error",
        description: "Debes seleccionar un cubículo primero",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
      return;
    }

    // Validar que el paciente esté en el cubículo del usuario
    if (turn.cubicleName !== myCubicle.name) {
      toast({
        title: "Acceso denegado",
        description: `Este paciente está en ${turn.cubicleName}, no en tu cubículo (${myCubicle.name})`,
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
      return;
    }

    // Si pasa todas las validaciones, cargar el paciente en el panel principal
    setActivePatient(turn);

    toast({
      title: "Paciente cargado",
      description: `${turn.patientName} ahora está en el panel principal`,
      status: "success",
      duration: 2000,
      isClosable: true,
      position: "top"
    });
  }, [selectedCubicle, cubicles, toast]);

  // Función para abrir modal de cambio de prioridad
  const handleChangePriority = (patient) => {
    if (!patient) {
      toast({
        title: "Error",
        description: "No se pudo identificar el paciente",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setPatientToChangePriority(patient);
    onChangePriorityOpen();
  };

  // Función para confirmar cambio de prioridad
  const confirmChangePriority = async () => {
    const patient = patientToChangePriority;
    if (!patient) return;

    // Determinar la nueva prioridad (toggle)
    // patient.isSpecial es booleano: true = Special, false = General
    const newPriority = patient.isSpecial ? "General" : "Special";

    onChangePriorityClose();

    try {
      const response = await fetch("/api/turns/changePriority", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turnId: patient.id,
          newPriority: newPriority
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cambiar prioridad");
      }

      toast({
        title: "Prioridad cambiada",
        description: `Paciente ${patient.patientName} ahora es ${newPriority === "Special" ? "ESPECIAL" : "GENERAL"}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Actualizar los datos
      await fetchTurns();

      // Actualizar heldTurn si es el mismo paciente para reflejar el cambio de prioridad inmediatamente
      if (heldTurn && heldTurn.id === patient.id) {
        setHeldTurn(prev => ({
          ...prev,
          isSpecial: newPriority === "Special",
          tipoAtencion: newPriority
        }));
      }

    } catch (error) {
      console.error("Error al cambiar prioridad:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar la prioridad",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setPatientToChangePriority(null);
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
  const CurrentPatientCard = ({ patient, onCall, onComplete, onRepeat, onDefer, isProcessing, selectedCubicle, isActive, isSupervisor, isLoading }) => {
    // Mostrar spinner mientras se carga el holding
    if (isLoading) {
      return (
        <GlassCard
          p={{ base: 4, md: 6, lg: 8 }}
          minH={{ base: "250px", md: "400px", lg: "500px" }}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Spinner size="xl" color="primary.500" thickness="4px" mb={4} />
          <Text fontSize="2xl" color="secondary.500" fontWeight="semibold">
            Obteniendo siguiente paciente...
          </Text>
          <Text fontSize="md" color="secondary.400" mt={2}>
            Por favor espere
          </Text>
        </GlassCard>
      );
    }

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
        {/* Número de turno - superior izquierda */}
        <Text
          position="absolute"
          top={4}
          left={4}
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight="bold"
          color="primary.500"
        >
          #{patient.assignedTurn}
        </Text>

        {/* Badge "En atención" - centro superior */}
        {patient.cubicle && (
          <Badge
            position="absolute"
            top={4}
            left="50%"
            transform="translateX(-50%)"
            colorScheme="blue"
            fontSize="md"
            px={3}
            py={1}
          >
            EN ATENCIÓN EN {patient.cubicle.name}
          </Badge>
        )}

        {/* Badge Prioritario - superior derecha con código de atención */}
        {patient.isSpecial && (
          <VStack
            position="absolute"
            top={4}
            right={4}
            spacing={1}
            align="flex-end"
          >
            <Badge
              colorScheme="orange"
              fontSize="sm"
              px={3}
              py={1}
            >
              <FaWheelchair style={{ marginRight: '4px', display: 'inline' }} />
              PRIORITARIO
            </Badge>
            {/* KAB-7378: Mostrar código de atención debajo de PRIORITARIO */}
            {patient.codigoAtencion && (
              <Badge colorScheme="red" fontSize="xs" px={2} py={0.5}>
                {patient.codigoAtencion}
              </Badge>
            )}
          </VStack>
        )}

        <VStack spacing={{ base: 4, md: 6 }} align="center" h="full" justify="center">
          {/* Nombre del paciente - aumentado tamaño */}
          <Box textAlign="center" mt={{ base: 8, md: 10 }}>
            <Text fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }} fontWeight="semibold" color="gray.800">
              {patient.patientName}
            </Text>
            {/* Información de expediente y orden de trabajo */}
            {(patient.patientID || patient.workOrder) && (
              <HStack justify="center" spacing={4} mt={2} flexWrap="wrap">
                {patient.patientID && (
                  <Badge colorScheme="purple" fontSize="sm" px={2} py={1}>
                    ID: {patient.patientID}
                  </Badge>
                )}
                {patient.workOrder && (
                  <Badge colorScheme="teal" fontSize="sm" px={2} py={1}>
                    OT: {patient.workOrder}
                  </Badge>
                )}
              </HStack>
            )}
            {patient.waitTime && (
              <Text fontSize="md" color="secondary.500" mt={2}>
                <FaClock style={{ display: 'inline', marginRight: '4px' }} />
                Esperando: {patient.waitTime} min
              </Text>
            )}
          </Box>

          {/* Vista Compacta de Tubos */}
          {(patient.tubesDetails || patient.tubesRequired) && (
            <Flex
              align="center"
              justify="center"
              gap={2}
              mt={3}
              p={3}
              borderRadius="lg"
              bg="gray.50"
              border="1px solid"
              borderColor="gray.200"
              flexWrap="wrap"
            >
              {/* Círculos de colores de tubos */}
              {patient.tubesDetails && Array.isArray(patient.tubesDetails) && patient.tubesDetails.length > 0 ? (
                enrichTubesDetails(patient.tubesDetails).map((tube, index) => (
                  <Tooltip key={index} label={`${tube.color} - ${tube.name}`} placement="top">
                    <Flex direction="column" align="center" gap={1}>
                      <Box
                        w="32px"
                        h="32px"
                        borderRadius="full"
                        bg={tube.colorHex}
                        border="3px solid white"
                        boxShadow="md"
                        position="relative"
                      />
                      <Text fontSize="xs" fontWeight="bold" color="gray.600">
                        x{tube.quantity}
                      </Text>
                    </Flex>
                  </Tooltip>
                ))
              ) : null}

              {/* Separador */}
              <Divider orientation="vertical" h="40px" mx={2} />

              {/* Total y botón */}
              <VStack spacing={0} align="center">
                <Text fontSize="sm" fontWeight="bold" color="gray.700">
                  Total: {patient.tubesRequired || 0} tubos
                </Text>
                <Button
                  size="xs"
                  variant="link"
                  colorScheme="blue"
                  onClick={() => {
                    setSelectedPatientDetails(patient);
                    onDetailsOpen();
                  }}
                  rightIcon={<FaArrowLeft style={{ transform: 'rotate(180deg)' }} />}
                >
                  Ver más detalles
                </Button>
              </VStack>
            </Flex>
          )}

          {/* Botones según el estado del paciente */}
          {isActive ? (
            // Paciente activo - mostrar botones de repetir y finalizar
            <VStack spacing={4} w="full" align="center">
              <HStack spacing={4} flexWrap="wrap" justify="center">
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

              {/* ✅ Botón Regresar a cola - aparece siempre que hay "Repetir Llamado" */}
              {onDefer && (
                <Button
                  size="lg"
                  h={{ base: "60px", md: "70px" }}
                  w={{ base: "280px", md: "320px" }}
                  variant="solid"
                  background="linear-gradient(135deg, #2ccbd2 0%, #26a8ad 100%)"
                  color="white"
                  border="3px solid"
                  borderColor="cyan.600"
                  leftIcon={<FaHourglass size="24" />}
                  onClick={() => onDefer(patient.id)}
                  isLoading={isProcessing}
                  fontSize={{ base: "lg", md: "xl" }}
                  fontWeight="bold"
                  borderRadius="xl"
                  boxShadow="0 4px 14px 0 rgba(44, 203, 210, 0.5)"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px 0 rgba(44, 203, 210, 0.6)',
                    bg: 'linear-gradient(135deg, #26a8ad 0%, #1f8b8f 100%)'
                  }}
                  _active={{ transform: 'scale(0.98)' }}
                >
                  Regresar a Cola
                </Button>
              )}

              {/* ✅ Indicador de llamados realizados */}
              {patient.callCount > 0 && (
                <Text fontSize="sm" color="gray.600">
                  Llamados realizados: {patient.callCount}
                </Text>
              )}
            </VStack>
          ) : (
            // Paciente en espera - mostrar botones antes de llamar
            <VStack spacing={4} w="full" align="center">
              {/* ✅ Botón Cambiar Prioridad - solo para Admin/Supervisor, ANTES de llamar */}
              {isSupervisor && (
                <Button
                  size="lg"
                  h={{ base: "60px", md: "70px" }}
                  w={{ base: "280px", md: "320px" }}
                  variant="solid"
                  background={patient.isSpecial
                    ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                    : "linear-gradient(135deg, #b45ad9 0%, #9333ea 100%)"
                  }
                  color="white"
                  border="3px solid"
                  borderColor={patient.isSpecial ? "indigo.600" : "purple.600"}
                  leftIcon={patient.isSpecial ? <FaUser size="16" /> : <FaWheelchair size="16" />}
                  rightIcon={<FaExchangeAlt size="14" />}
                  onClick={() => handleChangePriority(patient)}
                  fontSize={{ base: "lg", md: "xl" }}
                  fontWeight="bold"
                  borderRadius="xl"
                  boxShadow={patient.isSpecial
                    ? "0 4px 14px 0 rgba(99, 102, 241, 0.5)"
                    : "0 4px 14px 0 rgba(180, 90, 217, 0.5)"
                  }
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: patient.isSpecial
                      ? '0 6px 20px 0 rgba(99, 102, 241, 0.6)'
                      : '0 6px 20px 0 rgba(180, 90, 217, 0.6)',
                  }}
                  _active={{ transform: 'scale(0.98)' }}
                >
                  {patient.isSpecial ? "Cambiar a General" : "Cambiar a Especial"}
                </Button>
              )}

              {/* Botón Llamar Paciente */}
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
            </VStack>
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
            borderWidth="3px"
            borderColor="gray.400"
            bg="gray.50"
            color="gray.700"
            _hover={{
              bg: "gray.100",
              borderColor: "gray.500",
              transform: "translateY(-1px)",
              boxShadow: "sm"
            }}
            leftIcon={<MdSkipNext size="20" />}
            onClick={() => onSkip(patient.id)}
            isDisabled={isProcessing}
            size="lg"
            h={{ base: "50px", md: "60px" }}
            w={{ base: "full", sm: "auto" }}
            fontSize={{ base: "md", md: "lg" }}
            fontWeight="500"
          >
            Saltar al siguiente
          </Button>
        </Tooltip>
      </Stack>
    );
  };

  // Componente SidePanel simplificado - Solo muestra stats (sin listas de pacientes)
  const SidePanel = memo(({ pendingCount, inProgressCount, myAttended }) => {
    return (
      <VStack spacing={4} align="stretch">
        <Heading size="md" color="gray.700" textAlign="center">
          Resumen
        </Heading>

        <Box p={4} bg="orange.50" borderRadius="lg" borderLeft="4px solid" borderLeftColor="orange.400">
          <HStack justify="space-between">
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color="gray.600">Total en Espera</Text>
              <Text fontSize="xs" color="gray.500">Pacientes pendientes</Text>
            </VStack>
            <Badge colorScheme="orange" fontSize="2xl" px={4} py={2} borderRadius="lg">
              {pendingCount}
            </Badge>
          </HStack>
        </Box>

        <Box p={4} bg="green.50" borderRadius="lg" borderLeft="4px solid" borderLeftColor="green.400">
          <HStack justify="space-between">
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color="gray.600">En Atención</Text>
              <Text fontSize="xs" color="gray.500">Siendo atendidos</Text>
            </VStack>
            <Badge colorScheme="green" fontSize="2xl" px={4} py={2} borderRadius="lg">
              {inProgressCount}
            </Badge>
          </HStack>
        </Box>

        <Box p={4} bg="blue.50" borderRadius="lg" borderLeft="4px solid" borderLeftColor="blue.400">
          <HStack justify="space-between">
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color="gray.600">Mis Atendidos</Text>
              <Text fontSize="xs" color="gray.500">Hoy</Text>
            </VStack>
            <Badge colorScheme="blue" fontSize="2xl" px={4} py={2} borderRadius="lg">
              {myAttended}
            </Badge>
          </HStack>
        </Box>
      </VStack>
    );
  });
  SidePanel.displayName = 'SidePanel';

  // Componente Clock separado para evitar re-renders
  const Clock = memo(() => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
      const interval = setInterval(() => {
        setTime(new Date());
      }, 5000);
      return () => clearInterval(interval);
    }, []);

    return (
      <>
        <Text fontSize="lg" fontWeight="bold" color="gray.700">
          {formatTime(time)}
        </Text>
        <Text fontSize="xs" color="gray.500">
          {formatDate(time)}
        </Text>
      </>
    );
  });
  Clock.displayName = 'Clock';

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
    );
  }

  // Obtener el próximo paciente y el actual
  // IMPORTANTE: Solo usar heldTurn, NO fallback a pendingTurns[0] para evitar colisiones
  // El turno en holding es el único que este usuario puede atender
  const nextPatient = heldTurn;
  const displayPatient = activePatient || nextPatient;
  const currentPatient = inProgressTurns[0] || null;

  // Flag para mostrar estado de carga o "sin pacientes"
  const showLoadingHolding = isLoadingHolding && !heldTurn && !activePatient;

  return (
    <ModernContainer
        pb={{ base: isMobile ? "80px" : 0, md: 0 }}
        sx={{
          overscrollBehavior: 'none',
          overscrollBehaviorY: 'none',
        }}
      >
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
                <Box fontSize="sm">
                  <Clock />
                </Box>
              )}
            </HStack>

            {/* Selector de Cubículo */}
            <HStack spacing={4} w={{ base: "full", sm: "auto" }}>
              <Select
                value={selectedCubicle || ""}
                onChange={(e) => handleCubicleChange(e.target.value)}
                placeholder="Seleccionar cubículo"
                size="md"
                w={{ base: "full", sm: "250px" }}
                maxW={{ base: "none", sm: "250px" }}
                bg="white"
                borderColor="gray.300"
                _focus={{ borderColor: "primary.500" }}
                fontSize={{ base: "md", md: "lg" }}
                isDisabled={selectedCubicle && !isSupervisorOrAdmin()}
                opacity={selectedCubicle && !isSupervisorOrAdmin() ? 0.7 : 1}
                cursor={selectedCubicle && !isSupervisorOrAdmin() ? "not-allowed" : "pointer"}
              >
                {cubicles.map((cubicle) => {
                  const isOccupiedByOther = cubicle.isOccupied && cubicle.occupiedBy?.userId !== userId;
                  return (
                    <option
                      key={cubicle.id}
                      value={cubicle.id}
                      disabled={isOccupiedByOther}
                      style={{
                        color: isOccupiedByOther ? '#cbd5e0' : 'inherit',
                        fontStyle: isOccupiedByOther ? 'italic' : 'normal'
                      }}
                    >
                      {cubicle.name} {cubicle.isSpecial && "(★)"} {isOccupiedByOther && `(Ocupado por ${cubicle.occupiedBy.userName})`}
                    </option>
                  );
                })}
              </Select>
              {/* Indicador visual para flebotomistas cuando el cubículo está bloqueado */}
              {selectedCubicle && !isSupervisorOrAdmin() && (
                <Tooltip label="Cubículo bloqueado. Cierra sesión para cambiar." placement="bottom">
                  <Box>
                    <FaHospital color="#718096" size={20} />
                  </Box>
                </Tooltip>
              )}

              {/* Reloj Digital Desktop */}
              <Box display={{ base: "none", md: "block" }}>
                <Clock />
              </Box>

              {/* Botón de Cerrar Sesión */}
              <Tooltip label="Cerrar sesión" placement="bottom">
                <Button
                  leftIcon={<FaSignOutAlt />}
                  size="sm"
                  colorScheme="red"
                  variant="solid"
                  onClick={handleLogout}
                  _hover={{
                    transform: 'translateY(-1px)',
                    boxShadow: 'md',
                    bg: 'red.600'
                  }}
                >
                  Salir
                </Button>
              </Tooltip>
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
              {/* Paciente Actual / Próximo - Requiere cubículo seleccionado */}
              {!selectedCubicle ? (
                <GlassCard
                  p={{ base: 4, md: 6, lg: 8 }}
                  minH={{ base: "250px", md: "400px", lg: "500px" }}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  border="2px dashed"
                  borderColor="orange.300"
                >
                  <FaHospital size={48} color="#ED8936" />
                  <Text fontSize={{ base: "xl", md: "2xl" }} color="gray.600" fontWeight="bold" mt={4}>
                    Selecciona un cubículo
                  </Text>
                  <Text fontSize={{ base: "sm", md: "md" }} color="gray.400" mt={2} textAlign="center">
                    Debes seleccionar un cubículo en el menú superior antes de atender pacientes
                  </Text>
                </GlassCard>
              ) : (
                <CurrentPatientCard
                  patient={displayPatient}
                  onCall={handleCallPatient}
                  onComplete={handleCompleteAttention}
                  onRepeat={handleRepeatCall}
                  onDefer={handleDeferTurn}
                  isProcessing={processingTurns.has(displayPatient?.id)}
                  selectedCubicle={selectedCubicle}
                  isActive={!!activePatient && displayPatient?.id === activePatient?.id}
                  isSupervisor={isSupervisorOrAdmin()}
                  isLoading={showLoadingHolding}
                />
              )}

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

              {/* Quick Actions - Solo mostrar cuando no hay paciente activo y hay próximo paciente */}
              {!activePatient && nextPatient && (
                <QuickActionsBar
                  patient={nextPatient}
                  onSkip={handleSkipPatient}
                  onComplete={handleCompleteAttention}
                  onEmergency={handleEmergency}
                  isProcessing={processingTurns.has(nextPatient?.id)}
                />
              )}
            </VStack>

            {/* Panel Lateral - Desktop */}
            {!isMobile && (
              <GlassCard
                p={4}
                position="sticky"
                top="80px"
                maxH="calc(100vh - 100px)"
                display="flex"
                flexDirection="column"
              >
                <SidePanel
                  pendingCount={pendingTurns.length}
                  inProgressCount={inProgressTurns.length}
                  myAttended={dailyStats.totalAttended}
                />
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
            <DrawerHeader>Resumen</DrawerHeader>
            <DrawerBody>
              <SidePanel
                pendingCount={pendingTurns.length}
                inProgressCount={inProgressTurns.length}
                myAttended={dailyStats.totalAttended}
              />
            </DrawerBody>
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

        {/* Modal de confirmación para toma diferida */}
        <Modal isOpen={isConfirmDeferOpen} onClose={onConfirmDeferClose} isCentered>
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
          <ModalContent mx={4}>
            <ModalHeader>
              <HStack spacing={3}>
                <FaExclamationTriangle color="#ef4444" size={24} />
                <Text>Confirmar toma diferida</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Text fontSize="lg" mb={2}>
                ¿Estás seguro que deseas regresar este paciente a la cola?
              </Text>
              <Text fontSize="md" color="gray.600">
                El paciente será marcado como toma diferida y regresará al inicio de la cola de espera.
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                mr={3}
                onClick={onConfirmDeferClose}
                size="lg"
              >
                Cancelar
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDeferTurn}
                leftIcon={<FaHourglass />}
                size="lg"
                fontWeight="bold"
              >
                Aceptar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal isOpen={isChangePriorityOpen} onClose={onChangePriorityClose} isCentered>
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
          <ModalContent mx={4}>
            <ModalHeader>
              <HStack spacing={3}>
                <FaExchangeAlt color="#6366f1" size={24} />
                <Text>Cambiar Prioridad de Atención</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {patientToChangePriority && (
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontSize="lg" fontWeight="bold" mb={2}>
                      Paciente: {patientToChangePriority.patientName}
                    </Text>
                    <Text fontSize="md" color="gray.600">
                      Turno #{patientToChangePriority.assignedTurn}
                    </Text>
                  </Box>
                  <Divider />
                  <Box>
                    <Text fontSize="md" mb={2}>
                      <strong>Prioridad actual:</strong>{" "}
                      {patientToChangePriority.isSpecial ? (
                        <Badge colorScheme="orange" fontSize="md" ml={2}>
                          <HStack spacing={1}>
                            <FaWheelchair />
                            <Text>ESPECIAL</Text>
                          </HStack>
                        </Badge>
                      ) : (
                        <Badge colorScheme="blue" fontSize="md" ml={2}>
                          <HStack spacing={1}>
                            <FaUser />
                            <Text>GENERAL</Text>
                          </HStack>
                        </Badge>
                      )}
                    </Text>
                    <Text fontSize="md">
                      <strong>Nueva prioridad:</strong>{" "}
                      {patientToChangePriority.isSpecial ? (
                        <Badge colorScheme="blue" fontSize="md" ml={2}>
                          <HStack spacing={1}>
                            <FaUser />
                            <Text>GENERAL</Text>
                          </HStack>
                        </Badge>
                      ) : (
                        <Badge colorScheme="orange" fontSize="md" ml={2}>
                          <HStack spacing={1}>
                            <FaWheelchair />
                            <Text>ESPECIAL</Text>
                          </HStack>
                        </Badge>
                      )}
                    </Text>
                  </Box>
                  <Text fontSize="sm" color="gray.600">
                    ¿Estás seguro que deseas cambiar la prioridad de este paciente?
                  </Text>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                mr={3}
                onClick={onChangePriorityClose}
                size="lg"
              >
                Cancelar
              </Button>
              <Button
                colorScheme={patientToChangePriority?.tipoAtencion === "Special" ? "blue" : "orange"}
                onClick={confirmChangePriority}
                leftIcon={<FaExchangeAlt />}
                size="lg"
                fontWeight="bold"
              >
                Confirmar Cambio
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal de Detalles del Paciente */}
        <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="xl" isCentered scrollBehavior="inside">
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
          <ModalContent mx={4} maxH="90vh">
            <ModalHeader bg="blue.500" color="white" borderTopRadius="md">
              <HStack spacing={3}>
                <FaUser size={20} />
                <Text>Detalles del Paciente</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody py={6}>
              {selectedPatientDetails && (
                <VStack spacing={6} align="stretch">
                  {/* Información del Paciente */}
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={3} textTransform="uppercase">
                      Información del Paciente
                    </Text>
                    <VStack align="stretch" spacing={2} p={4} bg="gray.50" borderRadius="md">
                      <Flex justify="space-between">
                        <Text fontWeight="semibold">Nombre:</Text>
                        <Text>{selectedPatientDetails.patientName}</Text>
                      </Flex>
                      <Divider />
                      <Flex justify="space-between">
                        <Text fontWeight="semibold">Turno:</Text>
                        <Badge colorScheme="purple" fontSize="md">#{selectedPatientDetails.assignedTurn}</Badge>
                      </Flex>
                      {selectedPatientDetails.age && (
                        <>
                          <Divider />
                          <Flex justify="space-between">
                            <Text fontWeight="semibold">Edad:</Text>
                            <Text>{selectedPatientDetails.age} años</Text>
                          </Flex>
                        </>
                      )}
                      {selectedPatientDetails.gender && (
                        <>
                          <Divider />
                          <Flex justify="space-between">
                            <Text fontWeight="semibold">Género:</Text>
                            <Text>{selectedPatientDetails.gender === 'M' || selectedPatientDetails.gender === 'Masculino' ? 'Masculino' : 'Femenino'}</Text>
                          </Flex>
                        </>
                      )}
                      {selectedPatientDetails.contactInfo && (
                        <>
                          <Divider />
                          <Flex justify="space-between">
                            <Text fontWeight="semibold">Contacto:</Text>
                            <Text>{selectedPatientDetails.contactInfo}</Text>
                          </Flex>
                        </>
                      )}
                      {/* KAB-7378: Mostrar Prioritario si es Special */}
                      {selectedPatientDetails.isSpecial && (
                        <>
                          <Divider />
                          <Flex justify="space-between" align="center">
                            <Text fontWeight="semibold">Atención:</Text>
                            <Badge colorScheme="orange" fontSize="sm">
                              PRIORITARIO
                            </Badge>
                          </Flex>
                        </>
                      )}
                      {/* KAB-7378: Código de Atención (solo si es prioritario) */}
                      {selectedPatientDetails.isSpecial && selectedPatientDetails.codigoAtencion && (
                        <>
                          <Divider />
                          <Flex justify="space-between" align="center">
                            <Text fontWeight="semibold">Código:</Text>
                            <Badge colorScheme="red" fontSize="sm">
                              {selectedPatientDetails.codigoAtencion}
                            </Badge>
                          </Flex>
                        </>
                      )}
                    </VStack>
                  </Box>

                  {/* Estudios Solicitados */}
                  {selectedPatientDetails.studies && (
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={3} textTransform="uppercase">
                        Estudios Solicitados
                      </Text>
                      <Box p={4} bg="blue.50" borderRadius="md" borderLeft="4px solid" borderColor="blue.500">
                        <VStack align="stretch" spacing={2}>
                          {(() => {
                            try {
                              const studies = typeof selectedPatientDetails.studies === 'string'
                                ? JSON.parse(selectedPatientDetails.studies)
                                : selectedPatientDetails.studies;
                              return Array.isArray(studies) && studies.length > 0 ? (
                                studies.map((study, idx) => {
                                  // Manejar tanto objetos como strings
                                  const studyName = typeof study === 'object' ? study.name : study;
                                  const container = typeof study === 'object' && study.container ? study.container : null;
                                  const sample = typeof study === 'object' && study.sample ? study.sample : null;

                                  return (
                                    <VStack key={idx} align="stretch" spacing={1} p={2} bg="white" borderRadius="md">
                                      <HStack spacing={2}>
                                        <Box w="6px" h="6px" borderRadius="full" bg="blue.500" />
                                        <Text fontSize="sm" fontWeight="medium">{studyName}</Text>
                                      </HStack>
                                      {(container || sample) && (
                                        <HStack spacing={3} pl={4} fontSize="xs" color="gray.600">
                                          {container && (
                                            <HStack spacing={1}>
                                              <FaVial size={10} />
                                              <Text>Tubo: {typeof container === 'object' ? container.type : container}</Text>
                                            </HStack>
                                          )}
                                          {sample && (
                                            <HStack spacing={1}>
                                              <Text>•</Text>
                                              <Text>Muestra: {typeof sample === 'object' ? sample.type : sample}</Text>
                                            </HStack>
                                          )}
                                        </HStack>
                                      )}
                                    </VStack>
                                  );
                                })
                              ) : (
                                <Text fontSize="sm" color="gray.600">No se especificaron estudios</Text>
                              );
                            } catch (e) {
                              console.error('Error parsing studies:', e);
                              return <Text fontSize="sm" color="gray.600">No se especificaron estudios</Text>;
                            }
                          })()}
                        </VStack>
                      </Box>
                    </Box>
                  )}

                  {/* Tubos Detallados */}
                  {(selectedPatientDetails.tubesDetails || selectedPatientDetails.tubesRequired) && (
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={3} textTransform="uppercase">
                        Tubos Requeridos
                      </Text>
                      {selectedPatientDetails.tubesDetails && Array.isArray(selectedPatientDetails.tubesDetails) && selectedPatientDetails.tubesDetails.length > 0 ? (
                        <VStack spacing={2} align="stretch">
                          {enrichTubesDetails(selectedPatientDetails.tubesDetails).map((tube, index) => (
                            <Flex
                              key={index}
                              align="center"
                              justify="space-between"
                              p={3}
                              bg="white"
                              borderRadius="md"
                              border="2px solid"
                              borderColor="gray.200"
                              borderLeftColor={tube.colorHex}
                              borderLeftWidth="5px"
                            >
                              <HStack spacing={3} flex={1}>
                                <Box
                                  w="20px"
                                  h="20px"
                                  borderRadius="full"
                                  bg={tube.colorHex}
                                  border="2px solid white"
                                  boxShadow="md"
                                />
                                <VStack align="start" spacing={0}>
                                  {/* KAB-7378: Solo mostrar containerType (tube.name), quitar color */}
                                  <Text fontSize="sm" fontWeight="bold" color="gray.800">
                                    {tube.name}
                                  </Text>
                                  {tube.sampleType && (
                                    <Text fontSize="xs" color="blue.600" fontWeight="medium" mt={1}>
                                      Muestra: {tube.sampleType}
                                    </Text>
                                  )}
                                </VStack>
                              </HStack>
                              <Badge colorScheme="blue" fontSize="md" px={3} py={1} borderRadius="md">
                                × {tube.quantity}
                              </Badge>
                            </Flex>
                          ))}
                          <Divider my={2} />
                          <Flex justify="space-between" align="center" p={2} bg="purple.50" borderRadius="md">
                            <Text fontSize="md" fontWeight="bold" color="purple.700">
                              Total de tubos:
                            </Text>
                            <Badge colorScheme="purple" fontSize="lg" px={4} py={2} borderRadius="md">
                              {selectedPatientDetails.tubesDetails.reduce((sum, t) => sum + t.quantity, 0)} tubos
                            </Badge>
                          </Flex>
                        </VStack>
                      ) : selectedPatientDetails.tubesRequired ? (
                        <Flex justify="space-between" align="center" p={4} bg="purple.50" borderRadius="md">
                          <Text fontSize="md" fontWeight="bold" color="purple.700">
                            Total de tubos:
                          </Text>
                          <Badge colorScheme="purple" fontSize="lg" px={4} py={2} borderRadius="md">
                            {selectedPatientDetails.tubesRequired} tubos
                          </Badge>
                        </Flex>
                      ) : null}
                    </Box>
                  )}

                  {/* Observaciones */}
                  {selectedPatientDetails.observations && (
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={3} textTransform="uppercase">
                        Observaciones
                      </Text>
                      <Box p={4} bg="yellow.50" borderRadius="md" borderLeft="4px solid" borderColor="yellow.400">
                        <Text fontSize="sm" color="gray.700">
                          {selectedPatientDetails.observations}
                        </Text>
                      </Box>
                    </Box>
                  )}

                  {/* Información Clínica */}
                  {selectedPatientDetails.clinicalInfo && (
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={3} textTransform="uppercase">
                        Información Clínica Relevante
                      </Text>
                      <Box p={4} bg="red.50" borderRadius="md" borderLeft="4px solid" borderColor="red.400">
                        <Text fontSize="sm" color="gray.700">
                          {selectedPatientDetails.clinicalInfo}
                        </Text>
                      </Box>
                    </Box>
                  )}
                </VStack>
              )}
            </ModalBody>
            <ModalFooter borderTop="1px solid" borderColor="gray.200">
              <Button colorScheme="blue" onClick={onDetailsClose} size="lg">
                Cerrar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </ModernContainer>
  );
}