import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { Box, Heading, Text, Grid, Flex, ChakraProvider, extendTheme } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { FaHeartbeat, FaClock, FaUserMd, FaUser, FaWheelchair, FaMicrophone } from 'react-icons/fa';

// Tema personalizado inspirado en el diseño moderno HTML - Memoizado fuera del componente
const theme = extendTheme({
    colors: {
        primary: {
            50: "#f0f9ff",
            100: "#e0f2fe",
            200: "#bae6fd",
            300: "#7dd3fc",
            400: "#38bdf8",
            500: "#4F7DF3", // Azul moderno del diseño
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
            500: "#6B73FF", // Púrpura moderno
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
                // Gradiente de fondo moderno
                background: 'linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 50%, #EDE9FE 100%)',
                color: 'secondary.700',
                fontFamily: "'Inter', sans-serif",
                minHeight: '100vh',
                fontFeatureSettings: '"cv11", "ss01"',
                fontVariationSettings: '"opsz" 32',
            },
        },
    },
    components: {
        Button: {
            baseStyle: {
                fontWeight: 'semibold',
                borderRadius: 'lg',
                transition: 'all 0.3s ease',
            },
            variants: {
                gradient: {
                    background: 'linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)',
                    color: 'white',
                    _hover: {
                        transform: 'translateY(-2px)',
                        boxShadow: 'xl',
                    },
                },
            },
        },
    },
});

// Animaciones con keyframes
const blinkAnimation = keyframes`
    0% { 
        background: rgba(255, 255, 255, 0.9);
        transform: scale(1);
    }
    50% { 
        background: rgba(255, 255, 255, 0.95);
        transform: scale(1.02);
    }
    100% { 
        background: rgba(255, 255, 255, 0.9);
        transform: scale(1);
    }
`;

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

const pulseGlow = keyframes`
    0%, 100% {
        box-shadow: 0 0 20px rgba(79, 125, 243, 0.3);
    }
    50% {
        box-shadow: 0 0 40px rgba(79, 125, 243, 0.6);
    }
`;

const Queue = memo(function Queue() {
    const [pendingTurns, setPendingTurns] = useState([]);
    const [inProgressTurns, setInProgressTurns] = useState([]);
    const [callingPatient, setCallingPatient] = useState(null);
    const [isCalling, setIsCalling] = useState(false);
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState(null);
    const [mounted, setMounted] = useState(false);

    // Effect para marcar el componente como montado
    useEffect(() => {
        setMounted(true);
        setCurrentTime(new Date());
    }, []);

    // Función para obtener datos de la cola - Optimizada con useCallback
    const fetchQueueData = useCallback(async () => {
        try {
            const response = await fetch("/api/queue/list");
            if (!response.ok) throw new Error("Error al obtener los turnos");
            const data = await response.json();

            const sortedPendingTurns = (data.pendingTurns || []).sort((a, b) => a.assignedTurn - b.assignedTurn);
            const sortedInProgressTurns = (data.inProgressTurns || []).sort((a, b) => a.assignedTurn - b.assignedTurn);

            setPendingTurns(sortedPendingTurns);
            setInProgressTurns(sortedInProgressTurns);

            if (!isCalling && data.inCallingTurns && data.inCallingTurns.length > 0) {
                setCallingPatient(data.inCallingTurns[0]);
                setIsCalling(true);
            }
        } catch (err) {
            console.error("Error al cargar los turnos:", err);
            setError("Error al cargar los turnos. Por favor, intente de nuevo.");
        }
    }, [isCalling]);

    // Función para actualizar estado de llamado - Optimizada con useCallback
    const updateCallStatus = useCallback(async () => {
        if (!callingPatient) return;
        
        try {
            const response = await fetch(`/api/queue/updateCall`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: callingPatient.id, isCalled: true }),
            });
            if (!response.ok) throw new Error("Error al actualizar el estado del paciente.");
            
            setCallingPatient(null);
            setIsCalling(false);
        } catch (err) {
            console.error("Error al actualizar el estado del paciente:", err);
            setError("Error al actualizar el estado del paciente.");
            setIsCalling(false);
        }
    }, [callingPatient]);

    // Effect para obtener datos - Optimizado para evitar polling innecesario
    useEffect(() => {
        if (!mounted) return;

        fetchQueueData();

        // Intervalo inteligente: más frecuente cuando hay pacientes esperando
        const pollInterval = pendingTurns.length > 0 || isCalling ? 3000 : 8000;
        const interval = setInterval(fetchQueueData, pollInterval);

        return () => clearInterval(interval);
    }, [mounted, fetchQueueData, pendingTurns.length, isCalling]);

    // Effect para actualizar la hora cada segundo
    useEffect(() => {
        if (mounted) {
            const timeInterval = setInterval(() => {
                setCurrentTime(new Date());
            }, 1000);
            return () => clearInterval(timeInterval);
        }
    }, [mounted]);

    // Memoizar la función de anuncio por voz para evitar recreaciones
    const speakAnnouncement = useCallback((patient) => {
        if (!patient) return;
        
        const message = `Paciente ${patient.patientName}, favor de pasar al cubículo ${patient.cubicle?.name}`;
        
        if ('speechSynthesis' in window) {
            const voices = window.speechSynthesis.getVoices();
            const selectedVoice = voices.find(voice => voice.lang === 'es-ES');
            const utterance = new SpeechSynthesisUtterance(message);
            
            utterance.lang = "es-ES";
            if (selectedVoice) utterance.voice = selectedVoice;
            utterance.rate = 0.8;
            utterance.pitch = 1;
            
            return new Promise((resolve) => {
                utterance.onend = resolve;
                utterance.onerror = resolve;
                window.speechSynthesis.speak(utterance);
            });
        }
        return Promise.resolve();
    }, []);

    // Effect para manejo de anuncios por voz - Optimizado
    useEffect(() => {
        if (!mounted || !callingPatient || !isCalling) return;

        let isActive = true;
        let audio = null;

        const playAnnouncement = async () => {
            try {
                // Crear y reproducir audio
                audio = new Audio("/airport-sound.mp3");
                await audio.play();
                
                if (!isActive) return;
                
                // Hacer anuncio 2 veces
                for (let i = 0; i < 2 && isActive; i++) {
                    await speakAnnouncement(callingPatient);
                    if (i < 1 && isActive) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
                
                if (isActive) {
                    updateCallStatus();
                }
            } catch (error) {
                console.error("Error en el anuncio:", error);
                if (isActive) {
                    updateCallStatus();
                }
            }
        };

        playAnnouncement();

        return () => {
            isActive = false;
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, [mounted, callingPatient, isCalling, speakAnnouncement, updateCallStatus]);

    // Función para formatear la hora - Memoizada
    const formatTime = useCallback((date) => {
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
    }, [mounted]);

    // Función para obtener iniciales del nombre - Memoizada
    const getInitials = useCallback((name) => {
        if (!name) return "??";
        return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
    }, []);

    // No renderizar hasta que esté montado para evitar errores de hidratación
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
                            Cargando sistema de turnos...
                        </Text>
                    </Box>
                </Box>
            </ChakraProvider>
        );
    }

    if (error) {
        return (
            <ChakraProvider theme={theme}>
                <Box
                    height="100vh"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    p={6}
                >
                    <Box
                        bg="white"
                        p={8}
                        borderRadius="2xl"
                        boxShadow="xl"
                        textAlign="center"
                        border="1px solid"
                        borderColor="red.200"
                    >
                        <Box as={FaHeartbeat} color="red.500" fontSize="3xl" mb={4} />
                        <Text fontSize="xl" fontWeight="semibold" color="red.700">{error}</Text>
                        <Text fontSize="sm" color="red.500" mt={2}>
                            Reintentando automáticamente...
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
                {/* Header Principal con Glassmorphism - Optimizado para TV */}
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
            Gestión de Turnos
        </Heading>
        <Text
            fontSize="lg"
            color="secondary.600"
            fontWeight="medium"
            mt={1}
        >
            Sistema Inteligente de Atención Médica
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

                {/* Grid Principal - Optimizado para TV */}
                <Grid 
                    templateColumns="1.5fr 1fr" 
                    gap={4} 
                    flex="1" 
                    width="100%"
                    height="calc(100vh - 200px)"
                >
                    {/* Pacientes en Atención - Compacto */}
                    <Box
                        borderRadius="2xl"
                        p={4}
                        background="rgba(255, 255, 255, 0.25)"
                        backdropFilter="blur(20px)"
                        boxShadow="glass"
                        border="1px solid rgba(255, 255, 255, 0.18)"
                        overflowY="auto"
                        height="100%"
                        animation={`${fadeInUp} 1s ease-out`}
                        position="relative"
                    >
                        {/* Decorative gradient line */}
                        <Box
                            position="absolute"
                            top={0}
                            left={0}
                            right={0}
                            height="3px"
                            background="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                            borderTopRadius="2xl"
                        />
                        
                        <Flex align="center" justify="space-between" mb={3}>
                            <Heading 
                                size="lg" 
                                color="secondary.800" 
                                fontWeight="bold"
                                display="flex"
                                alignItems="center"
                                gap={2}
                            >
                                <Box as={FaHeartbeat} color="success" fontSize="xl" />
                                Pacientes en Atención
                            </Heading>
                            <Box
                                bg="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                                color="white"
                                px={3}
                                py={1}
                                borderRadius="lg"
                                fontSize="sm"
                                fontWeight="semibold"
                            >
                                {inProgressTurns.length}
                            </Box>
                        </Flex>

                        {inProgressTurns.length === 0 ? (
                            <Box
                                textAlign="center"
                                py={8}
                                color="secondary.500"
                            >
                                <Box as={FaUserMd} fontSize="2xl" mb={2} />
                                <Text fontSize="md">No hay pacientes en atención</Text>
                            </Box>
                        ) : (
                            inProgressTurns.map((turn, index) => (
                                <Box
                                    key={turn.id}
                                    p={3}
                                    borderRadius="lg"
                                    mb={2}
                                    background="rgba(255, 255, 255, 0.7)"
                                    backdropFilter="blur(10px)"
                                    border="1px solid rgba(255, 255, 255, 0.3)"
                                    borderLeft="4px solid"
                                    borderLeftColor="success"
                                    boxShadow="sm"
                                    transition="all 0.3s ease"
                                    _hover={{ 
                                        transform: 'translateY(-1px)', 
                                        boxShadow: 'md',
                                        background: "rgba(255, 255, 255, 0.8)"
                                    }}
                                    animation={`${fadeInUp} ${0.3 + index * 0.05}s ease-out`}
                                >
                                    <Flex align="center" justify="space-between">
                                        <Flex align="center" gap={3}>
                                            <Box
                                                w={8}
                                                h={8}
                                                borderRadius="lg"
                                                background="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                color="white"
                                                fontWeight="bold"
                                                fontSize="xs"
                                            >
                                                {getInitials(turn.patientName)}
                                            </Box>
                                            <Box>
                                                <Text 
                                                    fontWeight="bold" 
                                                    fontSize="md" 
                                                    color="secondary.800"
                                                    lineHeight="1.1"
                                                >
                                                    {turn.patientName}
                                                </Text>
                                                <Flex align="center" gap={3} mt={1}>
                                                    <Text color="secondary.600" fontSize="xs">
                                                        Turno: <strong>#{turn.assignedTurn}</strong>
                                                    </Text>
                                                    <Text color="secondary.600" fontSize="xs">
                                                        Cubículo: <strong>{turn.cubicle?.name}</strong>
                                                    </Text>
                                                </Flex>
                                            </Box>
                                        </Flex>
                                        
                                        <Box
                                            bg="rgba(16, 185, 129, 0.1)"
                                            color="success"
                                            px={2}
                                            py={1}
                                            borderRadius="md"
                                            fontSize="xs"
                                            fontWeight="semibold"
                                            display="flex"
                                            alignItems="center"
                                            gap={1}
                                        >
                                            <Box as={FaHeartbeat} />
                                            Atendiendo
                                        </Box>
                                    </Flex>
                                </Box>
                            ))
                        )}
                    </Box>

                    {/* Pacientes en Espera - Compacto */}
                    <Box
                        borderRadius="2xl"
                        p={4}
                        background="rgba(255, 255, 255, 0.25)"
                        backdropFilter="blur(20px)"
                        boxShadow="glass"
                        border="1px solid rgba(255, 255, 255, 0.18)"
                        overflowY="auto"
                        height="100%"
                        animation={`${fadeInUp} 1.2s ease-out`}
                        position="relative"
                    >
                        {/* Decorative gradient line */}
                        <Box
                            position="absolute"
                            top={0}
                            left={0}
                            right={0}
                            height="3px"
                            background="linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
                            borderTopRadius="2xl"
                        />
                        
                        <Flex align="center" justify="space-between" mb={3}>
                            <Heading 
                                size="lg" 
                                color="secondary.800" 
                                fontWeight="bold"
                                display="flex"
                                alignItems="center"
                                gap={2}
                            >
                                <Box as={FaClock} color="warning" fontSize="xl" />
                                En Espera
                            </Heading>
                            <Box
                                bg="linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
                                color="white"
                                px={3}
                                py={1}
                                borderRadius="lg"
                                fontSize="sm"
                                fontWeight="semibold"
                            >
                                {pendingTurns.length}
                            </Box>
                        </Flex>

                        {pendingTurns.length === 0 ? (
                            <Box
                                textAlign="center"
                                py={8}
                                color="secondary.500"
                            >
                                <Box as={FaClock} fontSize="2xl" mb={2} />
                                <Text fontSize="md">No hay pacientes en espera</Text>
                            </Box>
                        ) : (
                            pendingTurns.map((turn, index) => (
                                <Box
                                    key={turn.id}
                                    p={2.5}
                                    borderRadius="lg"
                                    mb={1.5}
                                    background="rgba(255, 255, 255, 0.7)"
                                    backdropFilter="blur(10px)"
                                    border="1px solid rgba(255, 255, 255, 0.3)"
                                    borderLeft="4px solid"
                                    borderLeftColor={turn.tipoAtencion === "Special" ? "error" : "warning"}
                                    boxShadow="sm"
                                    transition="all 0.3s ease"
                                    _hover={{ 
                                        transform: 'translateY(-1px)', 
                                        boxShadow: 'md',
                                        background: "rgba(255, 255, 255, 0.8)"
                                    }}
                                    animation={`${fadeInUp} ${0.2 + index * 0.03}s ease-out`}
                                >
                                    <Flex align="center" justify="space-between">
                                        <Flex align="center" gap={2}>
                                            <Box
                                                w={7}
                                                h={7}
                                                borderRadius="md"
                                                background={turn.tipoAtencion === "Special" 
                                                    ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                                                    : "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
                                                }
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                color="white"
                                                fontWeight="bold"
                                                fontSize="xs"
                                            >
                                                {getInitials(turn.patientName)}
                                            </Box>
                                            <Box>
                                                <Text 
                                                    fontWeight="semibold" 
                                                    fontSize="sm" 
                                                    color="secondary.800"
                                                    lineHeight="1.1"
                                                >
                                                    {turn.patientName}
                                                </Text>
                                                <Text color="secondary.600" fontSize="xs" mt={0.5}>
                                                    Turno: <strong>#{turn.assignedTurn}</strong>
                                                </Text>
                                            </Box>
                                        </Flex>
                                        
                                        <Flex align="center" gap={1}>
                                            {turn.tipoAtencion === "Special" && (
                                                <Box as={FaWheelchair} color="error" fontSize="sm" />
                                            )}
                                            <Box
                                                bg={turn.tipoAtencion === "Special" 
                                                    ? "rgba(239, 68, 68, 0.1)" 
                                                    : "rgba(245, 158, 11, 0.1)"
                                                }
                                                color={turn.tipoAtencion === "Special" ? "error" : "warning"}
                                                px={1.5}
                                                py={0.5}
                                                borderRadius="sm"
                                                fontSize="xs"
                                                fontWeight="semibold"
                                            >
                                                {turn.tipoAtencion === "Special" ? "Priority" : "Espera"}
                                            </Box>
                                        </Flex>
                                    </Flex>
                                </Box>
                            ))
                        )}
                    </Box>
                </Grid>

                {/* Modal de Llamado */}
                {callingPatient && (
                    <Box
                        position="fixed"
                        top="0"
                        left="0"
                        right="0"
                        bottom="0"
                        background="rgba(0, 0, 0, 0.5)"
                        backdropFilter="blur(10px)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        zIndex="modal"
                    >
                        <Box
                            p={10}
                            borderRadius="3xl"
                            background="rgba(255, 255, 255, 0.95)"
                            backdropFilter="blur(20px)"
                            boxShadow="glass"
                            border="1px solid rgba(255, 255, 255, 0.3)"
                            textAlign="center"
                            minWidth={{ base: "90%", md: "500px" }}
                            animation={`${blinkAnimation} 2s infinite, ${pulseGlow} 2s infinite`}
                        >
                            <Box
                                w={24}
                                h={24}
                                borderRadius="full"
                                background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                mx="auto"
                                mb={6}
                                boxShadow="xl"
                            >
                                <Box as={FaMicrophone} color="white" fontSize="3xl" />
                            </Box>
                            
                            <Text 
                                fontSize="4xl" 
                                fontWeight="bold" 
                                color="secondary.800"
                                mb={4}
                                lineHeight="shorter"
                            >
                                Llamando a
                            </Text>
                            <Text 
                                fontSize="5xl" 
                                fontWeight="extrabold" 
                                background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
                                backgroundClip="text"
                                color="transparent"
                                mb={6}
                                lineHeight="shorter"
                            >
                                {callingPatient.patientName}
                            </Text>
                            <Box
                                bg="rgba(79, 125, 243, 0.1)"
                                color="primary.500"
                                px={6}
                                py={3}
                                borderRadius="xl"
                                display="inline-block"
                                fontSize="2xl"
                                fontWeight="semibold"
                            >
                                Cubículo: {callingPatient.cubicle?.name}
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* Footer - Compacto */}
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
                    animation={`${fadeInUp} 1.5s ease-out`}
                >
                    <Text>
                        Instituto Nacional de Enfermedades Respiratorias Ismael Cosío Villegas (INER) | 
                        Desarrollado por DT Diagnósticos by Labsis © {new Date().getFullYear()}
                    </Text>
                </Box>
            </Box>
        </ChakraProvider>
    );
});

export default Queue;