import { useState, useEffect } from "react";
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
  extendTheme,
  Grid,
  Badge,
  HStack,
  Button,
  Select,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { 
  MdNotificationsActive, 
  MdDone, 
  MdPause,
  MdPlayArrow 
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
  FaArrowLeft
} from "react-icons/fa";

// Tema personalizado (mismo que las otras pantallas)
const theme = extendTheme({
  colors: {
    primary: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#4F7DF3",
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
    },
    secondary: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },
    purple: {
      500: "#6B73FF",
      600: "#764ba2",
    },
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },
  fonts: {
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
  },
  radii: {
    lg: "16px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "32px",
  },
  styles: {
    global: {
      body: {
        background: 'linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 50%, #EDE9FE 100%)',
        color: 'secondary.700',
        fontFamily: "'Inter', sans-serif",
        minHeight: '100vh',
        fontFeatureSettings: '"cv11", "ss01"',
        fontVariationSettings: '"opsz" 32',
      },
    },
  },
});

// Animaciones
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulseNotification = keyframes`
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(79, 125, 243, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(79, 125, 243, 0.6);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export default function Attention() {
  const [userId, setUserId] = useState(null);
  const [pendingTurns, setPendingTurns] = useState([]);
  const [inProgressTurns, setInProgressTurns] = useState([]);
  const [currentTime, setCurrentTime] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [selectedCubicle, setSelectedCubicle] = useState("");
  const [cubicles, setCubicles] = useState([]);
  const toast = useToast();

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

  // Cargar turnos
  useEffect(() => {
    const fetchTurns = async () => {
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
    };

    if (mounted) {
      fetchTurns();
      const intervalId = setInterval(fetchTurns, 5000);
      return () => clearInterval(intervalId);
    }
  }, [mounted, toast]);

  const formatTime = (date) => {
    if (!date || !mounted) return "Cargando...";
    return date.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
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

    try {
      const response = await fetch("/api/attention/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnId, userId, cubicleId: selectedCubicle }),
      });

      if (response.ok) {
        toast({
          title: "Paciente llamado",
          description: `El paciente fue llamado exitosamente.`,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      } else {
        throw new Error("Error al llamar al paciente.");
      }
    } catch (error) {
      console.error("Error al llamar al paciente:", error);
      toast({
        title: "Error",
        description: "No se pudo llamar al paciente.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleRepeatCall = async (turnId) => {
    try {
      const response = await fetch("/api/attention/repeatCall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnId }),
      });

      if (response.ok) {
        toast({
          title: "Llamado repetido",
          description: `El paciente será llamado nuevamente.`,
          status: "info",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      } else {
        throw new Error("Error al repetir el llamado.");
      }
    } catch (error) {
      console.error("Error al repetir el llamado:", error);
    }
  };

  const handleCompleteAttention = async (turnId) => {
    try {
      const response = await fetch("/api/attention/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnId }),
      });

      if (response.ok) {
        toast({
          title: "Atención finalizada",
          description: `El paciente ha sido atendido exitosamente.`,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      } else {
        throw new Error("Error al finalizar la atención.");
      }
    } catch (error) {
      console.error("Error al finalizar la atención:", error);
    }
  };

  const goBack = () => {
    window.history.back();
  };

  if (!mounted) {
    return (
      <ChakraProvider theme={theme}>
        <Box
          minHeight="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={6}
        >
          <Box
            p={8}
            background="rgba(255, 255, 255, 0.25)"
            backdropFilter="blur(20px)"
            borderRadius="3xl"
            textAlign="center"
          >
            <Text fontSize="xl" color="secondary.600">
              Cargando panel de atención...
            </Text>
          </Box>
        </Box>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider theme={theme}>
      <Box
        minHeight="100vh"
        p={3}
        display="flex"
        flexDirection="column"
        position="relative"
        overflow="hidden"
      >
        {/* Header Principal */}
        <Box
          p={4}
          background="rgba(255, 255, 255, 0.25)"
          backdropFilter="blur(20px)"
          borderRadius="2xl"
          boxShadow="glass"
          border="1px solid rgba(255, 255, 255, 0.18)"
          mb={4}
          width="100%"
          animation={`${fadeInUp} 0.8s ease-out`}
        >
          <Flex justify="space-between" align="center">
            <Box flex="1" textAlign="center">
              <Heading 
                fontSize="4xl"
                fontWeight="extrabold"
                background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
                backgroundClip="text"
                color="transparent"
                letterSpacing="-0.02em"
                lineHeight="1"
              >
                Atención por Flebotomista
              </Heading>
              <Text
                fontSize="lg"
                color="secondary.600"
                fontWeight="medium"
                mt={1}
              >
                Panel de Control de Turnos
              </Text>
            </Box>
            <Box
              p={2}
              background="rgba(255, 255, 255, 0.4)"
              borderRadius="lg"
              border="1px solid rgba(255, 255, 255, 0.3)"
            >
              <Text
                fontSize="md"
                color="secondary.800"
                fontWeight="bold"
                textAlign="center"
              >
                {currentTime ? formatTime(currentTime) : "Cargando hora..."}
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Panel de Control Superior */}
        <Box
          p={4}
          background="rgba(255, 255, 255, 0.25)"
          backdropFilter="blur(20px)"
          borderRadius="2xl"
          boxShadow="glass"
          border="1px solid rgba(255, 255, 255, 0.18)"
          mb={4}
          animation={`${slideInLeft} 1s ease-out`}
        >
          <Flex align="center" gap={4} justify="space-between">
            <Button
              leftIcon={<FaArrowLeft />}
              onClick={goBack}
              variant="outline"
              colorScheme="gray"
              size="sm"
            >
              Volver
            </Button>

            <FormControl maxW="300px">
              <FormLabel fontSize="sm" fontWeight="semibold" color="secondary.700" mb={1}>
                <Flex align="center" gap={2}>
                  <Box as={FaHospital} />
                  Cubículo Asignado
                </Flex>
              </FormLabel>
              <Select
                value={selectedCubicle}
                onChange={(e) => handleCubicleChange(e.target.value)}
                placeholder="Seleccionar cubículo"
                size="sm"
                background="rgba(255, 255, 255, 0.8)"
                borderColor="rgba(255, 255, 255, 0.3)"
              >
                {cubicles.map((cubicle) => (
                  <option key={cubicle.id} value={cubicle.id}>
                    {cubicle.name} {cubicle.isSpecial && "(Especial)"}
                  </option>
                ))}
              </Select>
            </FormControl>

            <HStack spacing={3}>
              <Box textAlign="center">
                <Text fontSize="xs" color="secondary.600">En Espera</Text>
                <Text fontSize="lg" fontWeight="bold" color="warning">{pendingTurns.length}</Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="xs" color="secondary.600">En Atención</Text>
                <Text fontSize="lg" fontWeight="bold" color="success">{inProgressTurns.length}</Text>
              </Box>
            </HStack>
          </Flex>
        </Box>

        {/* Contenido Principal - Optimizado para Mobile/Tablet */}
        <VStack spacing={4} flex="1" align="stretch">
          {/* Pacientes en Espera */}
          <Box
            borderRadius="2xl"
            p={4}
            background="rgba(255, 255, 255, 0.25)"
            backdropFilter="blur(20px)"
            boxShadow="glass"
            border="1px solid rgba(255, 255, 255, 0.18)"
            maxHeight="45vh"
            overflowY="auto"
            animation={`${fadeInUp} 1s ease-out`}
            position="relative"
          >
            {/* Gradient line */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              height="3px"
              background="linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
              borderTopRadius="2xl"
            />

            <Flex align="center" justify="space-between" mb={4}>
              <Heading 
                size="lg" 
                color="secondary.800" 
                fontWeight="bold"
                display="flex"
                alignItems="center"
                gap={2}
              >
                <Box as={FaClock} color="warning" />
                Pacientes en Espera
              </Heading>
              <Badge colorScheme="orange" fontSize="md" px={3} py={1} borderRadius="lg">
                {pendingTurns.length}
              </Badge>
            </Flex>

            {pendingTurns.length === 0 ? (
              <Box
                textAlign="center"
                py={8}
                color="secondary.500"
              >
                <Box as={FaUser} fontSize="3xl" mb={3} />
                <Text fontSize="lg">No hay pacientes en espera</Text>
              </Box>
            ) : (
              <VStack spacing={3} align="stretch">
                {pendingTurns.map((turn, index) => (
                  <Box
                    key={turn.id}
                    p={4}
                    background="rgba(255, 255, 255, 0.7)"
                    backdropFilter="blur(10px)"
                    borderRadius="xl"
                    border="1px solid rgba(255, 255, 255, 0.3)"
                    borderLeft="6px solid"
                    borderLeftColor={turn.isSpecial ? "error" : "warning"}
                    boxShadow="md"
                    transition="all 0.3s ease"
                    _hover={{ 
                      transform: 'translateY(-2px)', 
                      boxShadow: 'lg' 
                    }}
                    animation={`${fadeInUp} ${0.3 + index * 0.1}s ease-out`}
                  >
                    <Flex align="center" justify="space-between">
                      <Flex align="center" gap={3} flex="1">
                        <Box
                          w={12}
                          h={12}
                          borderRadius="xl"
                          background={turn.isSpecial 
                            ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                            : "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
                          }
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          color="white"
                          fontWeight="bold"
                          fontSize="sm"
                        >
                          {getInitials(turn.patientName)}
                        </Box>
                        <Box flex="1">
                          <Text 
                            fontWeight="bold" 
                            fontSize="lg" 
                            color="secondary.800"
                            display="flex"
                            alignItems="center"
                            gap={2}
                            mb={1}
                          >
                            {turn.patientName}
                            {turn.isSpecial && (
                              <Box as={FaWheelchair} color="error" fontSize="lg" />
                            )}
                          </Text>
                          <Text color="secondary.600" fontSize="md">
                            Turno: <strong>#{turn.assignedTurn}</strong>
                          </Text>
                        </Box>
                      </Flex>
                      
                      <IconButton
                        icon={<FaBell />}
                        colorScheme="blue"
                        size="lg"
                        fontSize="2xl"
                        aria-label="Llamar Paciente"
                        onClick={() => handleCallPatient(turn.id)}
                        animation={turn.isSpecial ? `${pulseNotification} 2s infinite` : "none"}
                        isDisabled={!selectedCubicle}
                        borderRadius="xl"
                        _hover={{
                          transform: 'scale(1.1)',
                          boxShadow: 'xl'
                        }}
                        ml={2}
                      />
                    </Flex>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>

          {/* Pacientes en Atención */}
          <Box
            borderRadius="2xl"
            p={4}
            background="rgba(255, 255, 255, 0.25)"
            backdropFilter="blur(20px)"
            boxShadow="glass"
            border="1px solid rgba(255, 255, 255, 0.18)"
            maxHeight="45vh"
            overflowY="auto"
            animation={`${fadeInUp} 1.2s ease-out`}
            position="relative"
          >
            {/* Gradient line */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              height="3px"
              background="linear-gradient(135deg, #10b981 0%, #059669 100%)"
              borderTopRadius="2xl"
            />

            <Flex align="center" justify="space-between" mb={4}>
              <Heading 
                size="lg" 
                color="secondary.800" 
                fontWeight="bold"
                display="flex"
                alignItems="center"
                gap={2}
              >
                <Box as={FaUserMd} color="success" />
                Pacientes en Atención
              </Heading>
              <Badge colorScheme="green" fontSize="md" px={3} py={1} borderRadius="lg">
                {inProgressTurns.length}
              </Badge>
            </Flex>

            {inProgressTurns.length === 0 ? (
              <Box
                textAlign="center"
                py={8}
                color="secondary.500"
              >
                <Box as={FaUserMd} fontSize="3xl" mb={3} />
                <Text fontSize="lg">No hay pacientes en atención</Text>
              </Box>
            ) : (
              <VStack spacing={4} align="stretch">
                {inProgressTurns.map((turn, index) => (
                  <Box
                    key={turn.id}
                    p={4}
                    background="rgba(255, 255, 255, 0.7)"
                    backdropFilter="blur(10px)"
                    borderRadius="xl"
                    border="1px solid rgba(255, 255, 255, 0.3)"
                    borderLeft="6px solid"
                    borderLeftColor="success"
                    boxShadow="md"
                    transition="all 0.3s ease"
                    _hover={{ 
                      transform: 'translateY(-2px)', 
                      boxShadow: 'lg' 
                    }}
                    animation={`${fadeInUp} ${0.5 + index * 0.1}s ease-out`}
                  >
                    <Flex align="center" justify="space-between" wrap="wrap" gap={3}>
                      <Flex align="center" gap={3} flex="1">
                        <Box
                          w={12}
                          h={12}
                          borderRadius="xl"
                          background="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          color="white"
                          fontWeight="bold"
                          fontSize="sm"
                        >
                          {getInitials(turn.patientName)}
                        </Box>
                        <Box flex="1">
                          <Text 
                            fontWeight="bold" 
                            fontSize="lg" 
                            color="secondary.800"
                            display="flex"
                            alignItems="center"
                            gap={2}
                            mb={1}
                          >
                            {turn.patientName}
                            {turn.isSpecial && (
                              <Box as={FaWheelchair} color="error" fontSize="lg" />
                            )}
                          </Text>
                          <Text color="secondary.600" fontSize="sm" mb={1}>
                            <strong>Turno:</strong> #{turn.assignedTurn}
                          </Text>
                          <Text color="secondary.600" fontSize="sm" mb={1}>
                            <strong>Cubículo:</strong> {turn.cubicleName}
                          </Text>
                          <Text color="secondary.600" fontSize="sm">
                            <strong>Flebotomista:</strong> {turn.flebotomistName}
                          </Text>
                        </Box>
                      </Flex>
                      
                      <HStack spacing={2}>
                        <IconButton
                          icon={<FaVolumeUp />}
                          colorScheme="orange"
                          size="lg"
                          fontSize="2xl"
                          aria-label="Repetir Llamado"
                          onClick={() => handleRepeatCall(turn.id)}
                          borderRadius="xl"
                          _hover={{
                            transform: 'scale(1.1)',
                            boxShadow: 'xl'
                          }}
                        />
                        <IconButton
                          icon={<FaCheckCircle />}
                          colorScheme="green"
                          size="lg"
                          fontSize="2xl"
                          aria-label="Finalizar Atención"
                          onClick={() => handleCompleteAttention(turn.id)}
                          borderRadius="xl"
                          _hover={{
                            transform: 'scale(1.1)',
                            boxShadow: 'xl'
                          }}
                        />
                      </HStack>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        </VStack>

        {/* Footer */}
        <Box
          as="footer"
          p={2}
          textAlign="center"
          background="rgba(255, 255, 255, 0.25)"
          backdropFilter="blur(20px)"
          color="secondary.600"
          borderRadius="lg"
          fontSize="xs"
          mt={2}
        >
          <Text>
            Instituto Nacional de Enfermedades Respiratorias Ismael Cosío Villegas (INER) | 
            Desarrollado por DT Diagnósticos by Labsis © {new Date().getFullYear()}
          </Text>
        </Box>
      </Box>
    </ChakraProvider>
  );
}