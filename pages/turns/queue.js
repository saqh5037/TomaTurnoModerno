import { useEffect, useState, useCallback, memo } from "react";
import { Box, Heading, Text, Flex, extendTheme, VStack, HStack, Grid } from "@chakra-ui/react";
import { FaHeartbeat, FaClock, FaMicrophone, FaWheelchair, FaHourglass } from 'react-icons/fa';
import QRCode from 'react-qr-code';

// Tema ultra-minimalista optimizado para máxima densidad de información
const theme = extendTheme({
    colors: {
        primary: {
            500: "#4F7DF3",
            600: "#6B73FF",
        },
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
    },
    fonts: {
        body: "'Inter', -apple-system, 'Segoe UI', sans-serif",
        heading: "'Inter', -apple-system, 'Segoe UI', sans-serif",
    },
    styles: {
        global: {
            body: {
                bg: '#ffffff',
                color: '#1E293B',
                fontFamily: "'Inter', sans-serif",
                overflow: 'hidden',
            },
        },
    },
});

const Queue = memo(function Queue() {
    const [pendingTurns, setPendingTurns] = useState([]);
    const [inProgressTurns, setInProgressTurns] = useState([]);
    const [callingPatient, setCallingPatient] = useState(null);
    const [isCalling, setIsCalling] = useState(false);
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState(null);
    const [mounted, setMounted] = useState(false);
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

    // Frases motivacionales que rotan
    const phrases = [
        "💙 Cuidamos de ti con tecnología y calidad humana",
        "🏥 El Instituto Nacional de Enfermedades Respiratorias trabaja para ti",
        "✨ Tu bienestar es nuestra prioridad",
        "🫁 Respirar bien es vivir mejor",
        "👨‍⚕️ Excelencia médica al servicio de México",
        "🌟 Juntos por una mejor calidad de vida",
        "💪 Comprometidos con tu recuperación y bienestar",
        "🔬 Innovación y cuidado en cada atención",
        "❤️ Tu salud respiratoria en las mejores manos",
        "🌱 Prevenir es la mejor medicina"
    ];

    // Effect para marcar el componente como montado
    useEffect(() => {
        setMounted(true);
        setCurrentTime(new Date());

        // Activar audio de forma silenciosa
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            const initUtterance = new SpeechSynthesisUtterance('');
            initUtterance.volume = 0;
            window.speechSynthesis.speak(initUtterance);
            window.speechSynthesis.cancel();
        }
    }, []);

    // Función para obtener datos de la cola
    const fetchQueueData = useCallback(async () => {
        try {
            const response = await fetch("/api/queue/list");
            if (!response.ok) throw new Error("Error al obtener los turnos");
            const data = await response.json();

            // El API ya devuelve los datos ordenados correctamente (FIFO estricto por updatedAt)
            // No necesitamos re-ordenar en el cliente
            setPendingTurns(data.pendingTurns || []);
            setInProgressTurns(data.inProgressTurns || []);

            // Detectar pacientes siendo llamados
            if (data.inCallingTurns && data.inCallingTurns.length > 0) {
                if (!isCalling) {
                    setCallingPatient(data.inCallingTurns[0]);
                    setIsCalling(true);
                }
            }
        } catch (err) {
            console.error("Error al cargar los turnos:", err);
            setError("Error al cargar los turnos. Por favor, intente de nuevo.");
        }
    }, [isCalling]);

    // Función para actualizar estado de llamado
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

    // Effect para obtener datos
    useEffect(() => {
        if (!mounted) return;

        fetchQueueData();

        const pollInterval = pendingTurns.length > 0 || isCalling ? 3000 : 8000;
        const interval = setInterval(fetchQueueData, pollInterval);

        return () => clearInterval(interval);
    }, [mounted, fetchQueueData, pendingTurns.length, isCalling]);

    // Effect para actualizar la hora
    useEffect(() => {
        if (mounted) {
            const timeInterval = setInterval(() => {
                setCurrentTime(new Date());
            }, 1000);
            return () => clearInterval(timeInterval);
        }
    }, [mounted]);

    // Effect para rotar las frases motivacionales
    useEffect(() => {
        if (mounted) {
            const phraseInterval = setInterval(() => {
                setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
            }, 8000); // Cambia cada 8 segundos
            return () => clearInterval(phraseInterval);
        }
    }, [mounted, phrases.length]);

    // Función de voz
    const speakAnnouncement = useCallback((patient) => {
        if (!patient || typeof window === 'undefined' || !window.speechSynthesis) {
            return Promise.resolve();
        }

        const cubiculoName = patient.cubicleName || 'uno';
        // Agregar pausa natural con puntos para que la voz haga pausas
        const messageText = `Atención, paciente ${patient.patientName}, favor de dirigirse al cubículo número ${cubiculoName}... Repito... paciente ${patient.patientName}, cubículo número ${cubiculoName}.`;

        const playAnnouncement = () => {
            return new Promise((resolve) => {
                const utterance = new SpeechSynthesisUtterance(messageText);

                const voices = window.speechSynthesis.getVoices();

                if (voices.length > 0) {
                    const femaleNames = ['Paulina', 'Mónica', 'Monica', 'Esperanza', 'Angelica', 'Maria', 'Carmen',
                        'Helena', 'Sabina', 'Paloma', 'Lucia', 'Sofia', 'Valentina', 'Isabella'];

                    const isFemaleVoice = (voice) => {
                        const voiceName = voice.name.toLowerCase();
                        return femaleNames.some(name => voiceName.includes(name.toLowerCase()));
                    };

                    const selectedVoice =
                        voices.find(voice => voice.lang === 'es-MX' && isFemaleVoice(voice)) ||
                        voices.find(voice => voice.lang === 'es-MX') ||
                        voices.find(voice => voice.lang.startsWith('es')) ||
                        voices[0];

                    utterance.voice = selectedVoice;
                    utterance.lang = selectedVoice?.lang || "es-MX";
                } else {
                    utterance.lang = "es-MX";
                }

                // Configurar voz más lenta y clara para que se escuche completo
                utterance.rate = 0.85;  // Más lento para mayor claridad
                utterance.pitch = 1.15; // Tono ligeramente más alto (femenino)
                utterance.volume = 1.0;  // Volumen al máximo

                // Configurar eventos para saber cuándo termina realmente el audio
                let speechCompleted = false;

                utterance.onend = () => {
                    speechCompleted = true;
                    resolve();
                };

                utterance.onerror = (event) => {
                    console.warn('Error en síntesis de voz:', event);
                    speechCompleted = true;
                    resolve();
                };

                // Cancelar cualquier voz anterior
                if (window.speechSynthesis.speaking) {
                    window.speechSynthesis.cancel();
                }

                // Pequeña pausa antes de hablar para asegurar que el sistema está listo
                setTimeout(() => {
                    try {
                        window.speechSynthesis.speak(utterance);

                        // Timeout de seguridad por si onend no se dispara (máximo 15 segundos)
                        setTimeout(() => {
                            if (!speechCompleted) {
                                console.warn('Timeout de voz alcanzado, resolviendo...');
                                window.speechSynthesis.cancel();
                                resolve();
                            }
                        }, 15000);
                    } catch (error) {
                        console.error('Error al iniciar síntesis de voz:', error);
                        resolve();
                    }
                }, 500);
            });
        };

        if (window.speechSynthesis.getVoices().length === 0) {
            return new Promise((resolve) => {
                const voicesTimeout = setTimeout(() => {
                    playAnnouncement().then(resolve);
                }, 2000);

                window.speechSynthesis.onvoiceschanged = () => {
                    clearTimeout(voicesTimeout);
                    window.speechSynthesis.onvoiceschanged = null;
                    playAnnouncement().then(resolve);
                };
            });
        } else {
            return playAnnouncement();
        }
    }, []);

    // Effect para manejo de anuncios
    useEffect(() => {
        if (!mounted || !callingPatient || !isCalling) return;

        let isActive = true;
        let audio = null;

        const playAnnouncement = async () => {
            try {
                // Crear audio con compatibilidad mejorada
                audio = new Audio("/airport-sound.mp3");
                audio.volume = 0.7;
                audio.preload = "auto";

                // Detectar navegador y aplicar configuraciones específicas
                const userAgent = navigator.userAgent.toLowerCase();
                if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
                    // Safari requiere interacción previa del usuario
                    audio.muted = false;
                    audio.autoplay = false;
                }

                // Intentar reproducir con manejo de errores mejorado
                const playPromise = audio.play();

                if (playPromise !== undefined) {
                    await playPromise.catch(err => {
                        console.warn("Audio no soportado o bloqueado:", err);
                        // Fallback: mostrar notificación visual si el audio falla
                        if (err.name === 'NotAllowedError') {
                            console.log("Reproducción bloqueada. Requiere interacción del usuario.");
                        }
                    });
                }

                if (!isActive) return;

                // GARANTIZAR CIERRE DEL MODAL
                let modalClosed = false;
                // Aumentar timeout para permitir ciclo completo:
                // - Música inicial: ~3 segundos
                // - Primer llamado: ~4-5 segundos
                // - "Repito" + Segundo llamado: ~4-5 segundos
                // - Buffer adicional: ~2 segundos
                const MODAL_TIMEOUT = 18000; // 18 segundos para ciclo completo

                // Timer de seguridad absoluto
                const safetyTimer = setTimeout(() => {
                    if (!modalClosed && isActive) {
                        console.log("Modal cerrado por timeout de seguridad");
                        modalClosed = true;
                        updateCallStatus();
                    }
                }, MODAL_TIMEOUT);

                // Esperar a que termine la música inicial (airport-sound.mp3 dura ~3 segundos)
                await new Promise(resolve => setTimeout(resolve, 3000));

                // Intentar reproducir voz
                if (isActive) {
                    try {
                        // Esperar a que termine completamente el anuncio de voz
                        await speakAnnouncement(callingPatient);

                        // Esperar un poco más después de que termine la voz para asegurar
                        // que el usuario escuchó todo el mensaje antes de cerrar el modal
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    } catch (voiceErr) {
                        console.error("Error en síntesis de voz:", voiceErr);
                        // Si hay error, esperar menos tiempo
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }

                // Cerrar modal si no se ha cerrado
                if (!modalClosed && isActive) {
                    clearTimeout(safetyTimer);
                    modalClosed = true;
                    updateCallStatus();
                }
            } catch (error) {
                console.error("Error en el proceso de llamado:", error);
                // NO actualizar el estado en caso de error
                // if (isActive) {
                //     updateCallStatus();
                // }
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

    // Función para formatear la hora
    const formatTime = useCallback((date) => {
        if (!date || !mounted) return "";
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }, [mounted]);

    // Función para formatear la fecha
    const formatDate = useCallback((date) => {
        if (!date || !mounted) return "";
        const day = date.getDate().toString().padStart(2, '0');
        const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    }, [mounted]);

    if (!mounted) {
        return (
            <Box h="100vh" display="flex" alignItems="center" justifyContent="center">
                    <Text fontSize="lg" color="gray.600">Cargando sistema...</Text>
                </Box>
        );
    }

    if (error) {
        return (
            <Box h="100vh" display="flex" alignItems="center" justifyContent="center">
                    <Text fontSize="lg" fontWeight="bold" color="red.600">{error}</Text>
                </Box>
        );
    }

    return (
        <Box h="100vh" display="flex" flexDirection="column" bg="white" position="relative">

                {/* Header Superior - Ultra compacto */}
                <Box
                    bgGradient="linear(135deg, #4F7DF3 0%, #6B73FF 100%)"
                    color="white"
                    px={4}
                    py={3}
                    h="70px"
                    display="flex"
                    alignItems="center"
                >
                    <Flex w="100%" justify="space-between" align="center">
                        <Text fontSize="xl" fontWeight="bold" letterSpacing="wide">
                            GESTIÓN DE TURNOS
                        </Text>
                        <Text fontSize="xl" fontWeight="bold">
                            Instituto Nacional de Enfermedades Respiratorias
                        </Text>
                        <Box
                            bg="white"
                            color="#1E293B"
                            px={3}
                            py={1}
                            borderRadius="md"
                            textAlign="center"
                            minW="140px"
                        >
                            <Text fontSize="md" fontWeight="bold">
                                {currentTime ? formatTime(currentTime) : ""}
                            </Text>
                            <Text fontSize="xs" fontWeight="medium">
                                {currentTime ? formatDate(currentTime) : ""}
                            </Text>
                        </Box>
                    </Flex>
                </Box>

                {/* Contenido Principal - DOS COLUMNAS */}
                <Flex flex="1" overflow="hidden" p={3} gap={3}>

                    {/* COLUMNA IZQUIERDA - Pacientes en Atención */}
                    <Box
                        w="40%"
                        bg="white"
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="gray.200"
                        display="flex"
                        flexDirection="column"
                        overflow="hidden"
                    >
                        {/* Header de columna */}
                        <Flex
                            align="center"
                            px={3}
                            py={2}
                            borderBottom="2px solid"
                            borderColor="green.200"
                            bg="#F0FDF4"
                        >
                            <Box as={FaHeartbeat} color="#10B981" fontSize="2xl" mr={2} />
                            <Text fontSize="2xl" fontWeight="bold" color="#064E3B" flex="1">
                                PACIENTES EN ATENCIÓN
                            </Text>
                            <Box
                                bg="#10B981"
                                color="white"
                                px={4}
                                py={2}
                                borderRadius="full"
                                fontSize="2xl"
                                fontWeight="bold"
                                minW="45px"
                                textAlign="center"
                            >
                                {inProgressTurns.length}
                            </Box>
                        </Flex>

                        {/* Lista de pacientes en atención */}
                        <Box flex="1" overflowY="auto" px={2} py={2} bg="#F0FDF4">
                            {inProgressTurns.length === 0 ? (
                                <Text textAlign="center" color="gray.500" fontSize="sm" py={4}>
                                    No hay pacientes en atención
                                </Text>
                            ) : (
                                <VStack spacing={1} align="stretch">
                                    {inProgressTurns.slice(0, 12).map((turn, index) => (
                                        <Flex
                                            key={turn.id}
                                            align="center"
                                            px={2}
                                            py={1.5}
                                            bg="white"
                                            borderRadius="sm"
                                            borderLeft="3px solid"
                                            borderLeftColor="#10B981"
                                            fontSize="xs"
                                        >
                                            <Text fontWeight="bold" color="#64748B" w="25px" fontSize="sm">
                                                {index + 1}.
                                            </Text>
                                            <Box
                                                bg="#10B981"
                                                color="white"
                                                px={2}
                                                py={1}
                                                borderRadius="sm"
                                                fontSize="sm"
                                                fontWeight="bold"
                                                mr={2}
                                            >
                                                Cubículo {turn.cubicleName || '-'}
                                            </Box>
                                            <Text color="#1E293B" flex="1" fontWeight="bold" fontSize="md" isTruncated>
                                                {turn.patientName}
                                            </Text>
                                            {/* OT (Orden de Trabajo) */}
                                            {turn.workOrder && (
                                                <Box
                                                    bg="teal.100"
                                                    color="teal.700"
                                                    px={2}
                                                    py={0.5}
                                                    borderRadius="sm"
                                                    fontSize="xs"
                                                    fontWeight="bold"
                                                >
                                                    {turn.workOrder}
                                                </Box>
                                            )}
                                        </Flex>
                                    ))}
                                </VStack>
                            )}
                        </Box>
                    </Box>

                    {/* COLUMNA DERECHA - Pacientes en Espera */}
                    <Box
                        flex="1"
                        bg="white"
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="gray.200"
                        display="flex"
                        flexDirection="column"
                        overflow="hidden"
                    >
                        {/* Header de columna */}
                        <Flex
                            align="center"
                            px={3}
                            py={2}
                            borderBottom="2px solid"
                            borderColor="orange.200"
                            bg="#FFF7ED"
                        >
                            <Box as={FaClock} color="#F59E0B" fontSize="2xl" mr={2} />
                            <Text fontSize="2xl" fontWeight="bold" color="#78350F" flex="1">
                                PACIENTES EN ESPERA
                            </Text>
                            <Box
                                bg="#F59E0B"
                                color="white"
                                px={4}
                                py={2}
                                borderRadius="full"
                                fontSize="2xl"
                                fontWeight="bold"
                                minW="45px"
                                textAlign="center"
                            >
                                {pendingTurns.length}
                            </Box>
                        </Flex>

                        {/* Grid de pacientes en espera - 2 columnas */}
                        <Box flex="1" overflowY="auto" px={2} py={2} bg="#FFF7ED">
                            {pendingTurns.length === 0 ? (
                                <Text textAlign="center" color="gray.500" fontSize="sm" py={4}>
                                    No hay pacientes en espera
                                </Text>
                            ) : (
                                <Flex gap={2}>
                                    {/* Columna Izquierda - Primeros 10 pacientes */}
                                    <VStack flex="1" spacing={1} align="stretch">
                                        {pendingTurns.slice(0, 10).map((turn, index) => (
                                            <Flex
                                                key={turn.id}
                                                align="center"
                                                px={2}
                                                py={1}
                                                bg={turn.isDeferred ? "#FEF3C7" : "white"}
                                                borderRadius="sm"
                                                borderLeft="2px solid"
                                                borderLeftColor={
                                                    turn.isDeferred ? "#F59E0B" :
                                                    turn.tipoAtencion === "Special" ? "#EF4444" : "#F59E0B"
                                                }
                                                fontSize="xs"
                                            >
                                                {/* Ícono de reloj de arena para pacientes diferidos */}
                                                {turn.isDeferred && (
                                                    <Box as={FaHourglass} color="#f59e0b" fontSize="md" mr={1} />
                                                )}
                                                {/* Ícono de silla de ruedas para pacientes especiales */}
                                                {turn.tipoAtencion === "Special" && (
                                                    <Box as={FaWheelchair} color="#EF4444" fontSize="md" mr={1} />
                                                )}
                                                <Text color="#1E293B" flex="1" fontWeight="medium" fontSize="sm" isTruncated>
                                                    {turn.patientName}
                                                </Text>
                                                {/* OT (Orden de Trabajo) */}
                                                {turn.workOrder && (
                                                    <Box
                                                        bg="teal.100"
                                                        color="teal.700"
                                                        px={1.5}
                                                        py={0.5}
                                                        borderRadius="sm"
                                                        fontSize="xs"
                                                        fontWeight="bold"
                                                    >
                                                        {turn.workOrder}
                                                    </Box>
                                                )}
                                            </Flex>
                                        ))}
                                    </VStack>

                                    {/* Columna Derecha - Siguientes 10 pacientes (11-20) */}
                                    <VStack flex="1" spacing={1} align="stretch">
                                        {pendingTurns.slice(10, 20).map((turn, index) => (
                                            <Flex
                                                key={turn.id}
                                                align="center"
                                                px={2}
                                                py={1}
                                                bg={turn.isDeferred ? "#FEF3C7" : "white"}
                                                borderRadius="sm"
                                                borderLeft="2px solid"
                                                borderLeftColor={
                                                    turn.isDeferred ? "#F59E0B" :
                                                    turn.tipoAtencion === "Special" ? "#EF4444" : "#F59E0B"
                                                }
                                                fontSize="xs"
                                            >
                                                {/* Ícono de reloj de arena para pacientes diferidos */}
                                                {turn.isDeferred && (
                                                    <Box as={FaHourglass} color="#f59e0b" fontSize="md" mr={1} />
                                                )}
                                                {/* Ícono de silla de ruedas para pacientes especiales */}
                                                {turn.tipoAtencion === "Special" && (
                                                    <Box as={FaWheelchair} color="#EF4444" fontSize="md" mr={1} />
                                                )}
                                                <Text color="#1E293B" flex="1" fontWeight="medium" fontSize="sm" isTruncated>
                                                    {turn.patientName}
                                                </Text>
                                                {/* OT */}
                                                {turn.workOrder && (
                                                    <Box
                                                        bg="teal.100"
                                                        color="teal.700"
                                                        px={1.5}
                                                        py={0.5}
                                                        borderRadius="sm"
                                                        fontSize="xs"
                                                        fontWeight="bold"
                                                    >
                                                        {turn.workOrder}
                                                    </Box>
                                                )}
                                            </Flex>
                                        ))}
                                    </VStack>
                                </Flex>
                            )}

                            {/* Indicador de más pacientes */}
                            {pendingTurns.length > 20 && (
                                <Box
                                    mt={2}
                                    p={2}
                                    bg="orange.100"
                                    borderRadius="sm"
                                    textAlign="center"
                                >
                                    <Text fontSize="xs" fontWeight="bold" color="orange.700">
                                        +{pendingTurns.length - 20} pacientes más en espera
                                    </Text>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Flex>

                {/* Footer Inferior - Prominente */}
                <Box
                    bgGradient="linear(135deg, #E0F2FE 0%, #DBEAFE 100%)"
                    borderTop="3px solid"
                    borderColor="#3B82F6"
                    px={4}
                    py={4}
                    h="98px"
                >
                    <Flex align="center" justify="space-between" h="100%">
                        {/* QR con mejor diseño */}
                        <HStack spacing={3}>
                            <Box
                                p={2}
                                bg="white"
                                border="2px solid"
                                borderColor="#3B82F6"
                                borderRadius="md"
                                boxShadow="sm"
                            >
                                <QRCode
                                    size={63}
                                    value="https://redcap-iner.com.mx/surveys/?s=KXTEHHDT8C"
                                    viewBox="0 0 256 256"
                                />
                            </Box>
                            <VStack spacing={0} align="flex-start">
                                <Text fontSize="md" color="#1E40AF" fontWeight="bold" textTransform="uppercase">
                                    Califica el servicio
                                </Text>
                                <Text fontSize="md" color="#64748B">
                                    Escanea el código
                                </Text>
                            </VStack>
                        </HStack>

                        {/* Mensaje motivacional PROMINENTE */}
                        <Box
                            flex="1"
                            mx={6}
                            textAlign="center"
                        >
                            <Text
                                fontSize="xl"
                                fontWeight="extrabold"
                                color="#1E40AF"
                                letterSpacing="wide"
                                textShadow="0 1px 2px rgba(0,0,0,0.1)"
                            >
                                {phrases[currentPhraseIndex]}
                            </Text>
                        </Box>

                        {/* Contador adicional mejorado */}
                        {pendingTurns.length > 20 && (
                            <Box
                                bg="#FEF3C7"
                                color="#D97706"
                                px={4}
                                py={2}
                                borderRadius="md"
                                border="2px solid"
                                borderColor="#F59E0B"
                                boxShadow="sm"
                            >
                                <Text fontSize="sm" fontWeight="extrabold">
                                    +{pendingTurns.length - 20} en espera
                                </Text>
                            </Box>
                        )}
                    </Flex>
                </Box>

                {/* Modal de Llamado - Se mantiene igual pero con animación simple */}
                {callingPatient && (
                    <Box
                        position="fixed"
                        top="0"
                        left="0"
                        right="0"
                        bottom="0"
                        bg="rgba(0, 0, 0, 0.85)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        zIndex="9999"
                    >
                        <Box
                            p={8}
                            borderRadius="xl"
                            bg="white"
                            boxShadow="2xl"
                            textAlign="center"
                            w="60%"
                            maxW="600px"
                        >
                            <Box
                                w={20}
                                h={20}
                                borderRadius="full"
                                bgGradient="linear(135deg, #4F7DF3 0%, #6B73FF 100%)"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                mx="auto"
                                mb={6}
                            >
                                <Box as={FaMicrophone} color="white" fontSize="3xl" />
                            </Box>

                            <Text fontSize="2xl" fontWeight="bold" color="gray.700" mb={3}>
                                LLAMANDO A
                            </Text>
                            <Text fontSize="4xl" fontWeight="extrabold" color="#4F7DF3" mb={6}>
                                {callingPatient.patientName}
                            </Text>
                            <Box
                                bg="#E0F7FF"
                                color="#0369A1"
                                px={6}
                                py={3}
                                borderRadius="lg"
                                display="inline-block"
                                fontSize="2xl"
                                fontWeight="bold"
                                border="2px solid"
                                borderColor="#0EA5E9"
                            >
                                CUBÍCULO {callingPatient.cubicleName || '-'}
                            </Box>
                        </Box>
                    </Box>
                )}

            </Box>
    );
});

export default Queue;