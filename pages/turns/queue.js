import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { Box, Heading, Text, Grid, Flex, ChakraProvider, extendTheme, VStack, HStack, Icon, Circle, Button } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { FaHeartbeat, FaClock, FaUserMd, FaUser, FaWheelchair, FaMicrophone, FaStar, FaQrcode, FaVolumeUp } from 'react-icons/fa';
import QRCode from 'react-qr-code';

// Tema personalizado optimizado para TV - Tamaños aumentados significativamente
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
const blinkAnimation = keyframes`
    0% { 
        background: rgba(255, 255, 255, 0.95);
        transform: scale(1);
    }
    50% { 
        background: rgba(255, 255, 255, 0.98);
        transform: scale(1.05);
    }
    100% { 
        background: rgba(255, 255, 255, 0.95);
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
        box-shadow: 0 0 30px rgba(79, 125, 243, 0.4);
    }
    50% {
        box-shadow: 0 0 60px rgba(79, 125, 243, 0.8);
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
    const [scrollPositions, setScrollPositions] = useState({ inProgress: 0, pending: 0 });
    const [audioEnabled, setAudioEnabled] = useState(true); // Audio siempre activo

    // Effect para marcar el componente como montado y activar audio silenciosamente
    useEffect(() => {
        setMounted(true);
        setCurrentTime(new Date());
        
        // Activar audio de forma silenciosa automáticamente
        // Esto funciona porque el usuario ya interactuó al navegar a esta página
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            // Inicializar speech synthesis con un mensaje vacío
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


            const sortedPendingTurns = (data.pendingTurns || []).sort((a, b) => a.assignedTurn - b.assignedTurn);
            const sortedInProgressTurns = (data.inProgressTurns || []).sort((a, b) => a.assignedTurn - b.assignedTurn);

            setPendingTurns(sortedPendingTurns);
            setInProgressTurns(sortedInProgressTurns);

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

    // Efecto para scroll automático - Rotación cada 5 pacientes
    useEffect(() => {
        if (!isCalling && mounted) {
            const scrollInterval = setInterval(() => {
                setScrollPositions(prev => ({
                    inProgress: inProgressTurns.length > 5 ? (prev.inProgress + 1) % inProgressTurns.length : 0,
                    pending: pendingTurns.length > 5 ? (prev.pending + 1) % pendingTurns.length : 0,
                }));
            }, 8000); // Rotación cada 8 segundos

            return () => clearInterval(scrollInterval);
        }
    }, [inProgressTurns.length, pendingTurns.length, isCalling, mounted]);

    // Effect para actualizar la hora
    useEffect(() => {
        if (mounted) {
            const timeInterval = setInterval(() => {
                setCurrentTime(new Date());
            }, 1000);
            return () => clearInterval(timeInterval);
        }
    }, [mounted]);

    // Función para activar audio (requerido por navegadores modernos)
    const enableAudio = useCallback(() => {
        
        // Crear un audio silencioso para activar el contexto de audio
        const silentAudio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLaizsIGWm78OScTgwOUKjj8LZiHQU5ktXyzHksBSR3x/DdkEAKFFiz6OuoVRAMRp/g8r5tIAUrgM7y2oo7CBlpufDknE0MDlCn4/G2Yh0EOJHW8sx5LAYkd8bx3ZBAChVYs+jrqVYRDEWf4PK+bSEFK4DN8tiIOQgZabvx5Z1ODAVQ");
        silentAudio.play().then(() => {
            setAudioEnabled(true);
        }).catch(e => {
            console.error("❌ Error al activar audio:", e);
        });

        // También intentar activar speech synthesis
        if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance("");
            utterance.volume = 0;
            window.speechSynthesis.speak(utterance);
            window.speechSynthesis.cancel();
        }
    }, []);

    // 🔊 FUNCIÓN DE VOZ ORIGINAL RESTAURADA - Con voz femenina mexicana
    const speakAnnouncement = useCallback((patient) => {
        
        if (!patient || typeof window === 'undefined' || !window.speechSynthesis) {
            console.warn("SpeechSynthesis no está disponible o no hay turno para anunciar.");
            return Promise.resolve();
        }

        // Audio siempre activo, no necesita verificación

        // Mensaje del anuncio - Directo y profesional
        const cubiculoName = patient.cubicle?.name || 'uno';
        const messageText = `Atención, paciente ${patient.patientName}, favor de dirigirse al cubículo número ${cubiculoName}. Repito, paciente ${patient.patientName}, cubículo número ${cubiculoName}.`;

        // Función para configurar y reproducir el anuncio
        const playAnnouncement = () => {
            return new Promise((resolve) => {
                const utterance = new SpeechSynthesisUtterance(messageText);
                
                // Configurar voz - Priorizar voces femeninas en español mexicano/neutro
                const voices = window.speechSynthesis.getVoices();
                
                let selectedVoice = null;
                
                if (voices.length > 0) {
                    // Lista ampliada de nombres femeninos para mejor detección
                    const femaleNames = [
                        'Paulina', 'Mónica', 'Monica', 'Esperanza', 'Angelica', 'Maria', 'Carmen', 
                        'Helena', 'Sabina', 'Paloma', 'Lucia', 'Sofia', 'Valentina', 'Isabella',
                        'Camila', 'Valeria', 'Natalia', 'Mariana', 'Paola', 'Daniela', 'Gabriela',
                        'Victoria', 'Andrea', 'Raquel', 'Beatriz', 'Cristina',
                        'Kendra', 'Aria', 'Jenny', 'Neural', 'WaveNet',
                        'Female', 'Woman', 'Mujer', 'Femenina'
                    ];

                    // Función para verificar si una voz es probablemente femenina
                    const isFemaleVoice = (voice) => {
                        const voiceName = voice.name.toLowerCase();
                        const localName = voice.localName?.toLowerCase() || '';
                        
                        return femaleNames.some(name => 
                            voiceName.includes(name.toLowerCase()) || 
                            localName.includes(name.toLowerCase())
                        );
                    };

                    // Función para detectar voces masculinas
                    const isMaleVoice = (voice) => {
                        const voiceName = voice.name.toLowerCase();
                        const maleNames = [
                            'diego', 'jorge', 'carlos', 'miguel', 'antonio', 'juan', 'pablo',
                            'male', 'masculino', 'hombre', 'man', 'masculine'
                        ];
                        return maleNames.some(name => voiceName.includes(name));
                    };


                    // Sistema de selección mejorado con prioridades
                    selectedVoice = 
                    // Prioridad 1: Voces mexicanas femeninas
                    voices.find(voice => 
                        voice.lang === 'es-MX' && 
                        isFemaleVoice(voice) && 
                        !isMaleVoice(voice)
                    ) ||
                    
                    // Prioridad 2: Microsoft Sabina/Helena en español
                    voices.find(voice => 
                        voice.name.includes('Microsoft') &&
                        voice.lang.startsWith('es') &&
                        (voice.name.includes('Sabina') || voice.name.includes('Helena'))
                    ) ||
                    
                    // Prioridad 3: Google Neural/WaveNet en español mexicano
                    voices.find(voice => 
                        voice.name.includes('Google') &&
                        voice.lang === 'es-MX' &&
                        (voice.name.includes('Neural') || voice.name.includes('WaveNet'))
                    ) ||
                    
                    // Prioridad 4: Cualquier voz mexicana NO masculina
                    voices.find(voice => 
                        voice.lang === 'es-MX' && 
                        !isMaleVoice(voice)
                    ) ||
                    
                    // Prioridad 5: Voces españolas femeninas
                    voices.find(voice => 
                        voice.lang.startsWith('es') && 
                        isFemaleVoice(voice) &&
                        !isMaleVoice(voice)
                    ) ||
                    
                    // Prioridad 6: Cualquier voz en español NO masculina
                    voices.find(voice => 
                        voice.lang.startsWith('es') &&
                        !isMaleVoice(voice)
                    ) ||
                    
                    // Última opción
                    voices[0];
                    
                    utterance.voice = selectedVoice;
                    utterance.lang = selectedVoice?.lang || "es-MX";
                } else {
                    utterance.lang = "es-MX";
                }
                
                // Configuración para voz más natural y fluida
                utterance.rate = 0.9;      // Velocidad natural pero clara
                utterance.pitch = 1.15;    // Tono femenino y profesional
                utterance.volume = 0.95;   // Ligeramente más suave para sonar profesional

                // Eventos del anuncio
                utterance.onstart = () => {
                };
                
                utterance.onend = () => {
                    resolve();
                };
                
                utterance.onerror = (event) => {
                    console.error("❌ Error en el anuncio:", event.error);
                    resolve();
                };

                // Cancelar cualquier anuncio previo
                if (window.speechSynthesis.speaking) {
                    window.speechSynthesis.cancel();
                }
                
                // Reproducir el anuncio
                setTimeout(() => {
                    try {
                        window.speechSynthesis.speak(utterance);
                    } catch (error) {
                        console.error("❌ Error al intentar reproducir:", error);
                        resolve();
                    }
                }, 500);
            });
        };

        // Compatibilidad cross-browser mejorada (Firefox/Chrome/Safari)
        if (window.speechSynthesis.getVoices().length === 0) {
            return new Promise((resolve) => {
                // Timeout de seguridad para navegadores que no cargan voces
                const voicesTimeout = setTimeout(() => {
                    playAnnouncement().then(resolve);
                }, 2000);
                
                window.speechSynthesis.onvoiceschanged = () => {
                    clearTimeout(voicesTimeout);
                    window.speechSynthesis.onvoiceschanged = null; // Limpiar el evento
                    playAnnouncement().then(resolve);
                };
                
                // Forzar carga de voces en algunos navegadores
                if (window.speechSynthesis.getVoices().length === 0) {
                    window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
                    window.speechSynthesis.cancel();
                }
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
                audio = new Audio("/airport-sound.mp3");
                audio.volume = 0.7;
                
                await audio.play().catch(err => {
                    console.warn("⚠️ No se pudo reproducir el sonido:", err);
                });
                
                if (!isActive) return;
                
                // Esperar un poco después del sonido
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Hacer el anuncio 2 veces
                for (let i = 0; i < 2 && isActive; i++) {
                    await speakAnnouncement(callingPatient);
                    if (i < 1 && isActive) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
                
                // Esperar un poco más antes de actualizar
                if (isActive) {
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    updateCallStatus();
                }
            } catch (error) {
                console.error("❌ Error en el proceso de llamado:", error);
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

    // Función para formatear la hora
    const formatTime = useCallback((date) => {
        if (!date || !mounted) return "";
        return date.toLocaleString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }, [mounted]);

    // Función para obtener iniciales
    const getInitials = useCallback((name) => {
        if (!name) return "??";
        return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
    }, []);

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
                    <Text fontSize="3xl" color="secondary.600">
                        Cargando sistema...
                    </Text>
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
                >
                    <Text fontSize="2xl" fontWeight="bold" color="red.700">{error}</Text>
                </Box>
            </ChakraProvider>
        );
    }

    return (
        <ChakraProvider theme={theme}>
            <Box
                minHeight="100vh"
                p={4}
                display="flex"
                flexDirection="column"
                position="relative"
                overflow="hidden"
            >
                {/* Header Principal GRANDE para TV con QR */}
                <Box
                    p={6}
                    background="rgba(255, 255, 255, 0.3)"
                    backdropFilter="blur(20px)"
                    borderRadius="3xl"
                    boxShadow="glass"
                    border="2px solid rgba(255, 255, 255, 0.25)"
                    mb={6}
                    width="100%"
                    animation={`${fadeInUp} 0.8s ease-out`}
                >
                    <Flex justify="space-between" align="center" gap={6}>
                        {/* QR Code en la izquierda */}
                        <Flex align="center" gap={4}>
                            <Box 
                                p="3" 
                                bg="white" 
                                borderRadius="xl" 
                                boxShadow="xl"
                                border="3px solid"
                                borderColor="primary.400"
                            >
                                <QRCode
                                    size={100}
                                    value="https://redcap-iner.com.mx/surveys/?s=KXTEHHDT8C"
                                    viewBox="0 0 256 256"
                                    style={{
                                        height: "auto",
                                        maxWidth: "100%",
                                        width: "100%",
                                    }}
                                />
                            </Box>
                            <VStack spacing="1" align="center">
                                <Text fontSize="md" fontWeight="bold" color="primary.700">
                                    Califica el servicio
                                </Text>
                                <HStack spacing="2">
                                    <Text fontSize="lg">😊</Text>
                                    <Text fontSize="lg">😐</Text>
                                    <Text fontSize="lg">😞</Text>
                                </HStack>
                            </VStack>
                        </Flex>

                        {/* Título central */}
                        <Box flex="1" textAlign="center">
                            <Heading 
                                fontSize="6xl"
                                fontWeight="extrabold"
                                background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
                                backgroundClip="text"
                                color="transparent"
                                letterSpacing="-0.02em"
                                lineHeight="1"
                            >
                                GESTIÓN DE TURNOS
                            </Heading>
                            <Text
                                fontSize="2xl"
                                color="secondary.700"
                                fontWeight="bold"
                                mt={2}
                            >
                                Instituto Nacional de Enfermedades Respiratorias
                            </Text>
                        </Box>

                        {/* Reloj en la derecha */}
                        <Box
                            p={4}
                            background="rgba(255, 255, 255, 0.5)"
                            borderRadius="xl"
                            border="2px solid rgba(79, 125, 243, 0.3)"
                        >
                            <Text
                                fontSize="2xl"
                                color="secondary.900"
                                fontWeight="bold"
                                textAlign="center"
                            >
                                {currentTime ? formatTime(currentTime) : ""}
                            </Text>
                        </Box>
                    </Flex>
                </Box>

                {/* Grid Principal - Optimizado para TV */}
                <Grid 
                    templateColumns="1.5fr 1fr" 
                    gap={6} 
                    flex="1" 
                    width="100%"
                    height="calc(100vh - 280px)"
                >
                    {/* Pacientes en Atención - GRANDE */}
                    <Box
                        borderRadius="3xl"
                        p={6}
                        background="rgba(255, 255, 255, 0.3)"
                        backdropFilter="blur(20px)"
                        boxShadow="glass"
                        border="2px solid rgba(16, 185, 129, 0.3)"
                        overflowY="auto"
                        height="100%"
                        animation={`${fadeInUp} 1s ease-out`}
                        position="relative"
                    >
                        <Box
                            position="absolute"
                            top={0}
                            left={0}
                            right={0}
                            height="6px"
                            background="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                            borderTopRadius="3xl"
                        />
                        
                        <Flex align="center" justify="space-between" mb={6}>
                            <Heading 
                                size="xl" 
                                color="secondary.900" 
                                fontWeight="bold"
                                display="flex"
                                alignItems="center"
                                gap={4}
                            >
                                <Box as={FaHeartbeat} color="success" fontSize="3xl" />
                                EN ATENCIÓN
                            </Heading>
                            <Box
                                bg="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                                color="white"
                                px={6}
                                py={3}
                                borderRadius="xl"
                                fontSize="xl"
                                fontWeight="bold"
                            >
                                {inProgressTurns.length}
                            </Box>
                        </Flex>

                        {inProgressTurns.length === 0 ? (
                            <Box
                                textAlign="center"
                                py={16}
                                color="secondary.600"
                            >
                                <Box as={FaUserMd} fontSize="5xl" mb={3} />
                                <Text fontSize="2xl" fontWeight="semibold">No hay pacientes en atención</Text>
                            </Box>
                        ) : (
                            (() => {
                                // Lógica de rotación circular para mostrar exactamente 5 pacientes
                                const totalPatients = inProgressTurns.length;
                                let patientsToShow = [];
                                
                                if (totalPatients <= 5) {
                                    patientsToShow = inProgressTurns;
                                } else {
                                    // Rotación circular
                                    for (let i = 0; i < 5; i++) {
                                        const index = (scrollPositions.inProgress + i) % totalPatients;
                                        patientsToShow.push(inProgressTurns[index]);
                                    }
                                }
                                
                                return patientsToShow.map((turn, index) => (
                                    <Box
                                        key={turn.id}
                                        p={8}
                                        borderRadius="3xl"
                                        mb={6}
                                        background="rgba(255, 255, 255, 0.9)"
                                        backdropFilter="blur(10px)"
                                        border="3px solid rgba(16, 185, 129, 0.5)"
                                        borderLeft="12px solid"
                                        borderLeftColor="success"
                                        boxShadow="xl"
                                        transition="all 0.3s ease"
                                        _hover={{ 
                                            transform: 'translateY(-2px)', 
                                            boxShadow: '2xl',
                                            background: "rgba(255, 255, 255, 0.95)"
                                        }}
                                        animation={`${fadeInUp} ${0.3 + index * 0.05}s ease-out`}
                                    >
                                        <Flex align="center" justify="space-between">
                                            <Box>
                                                <Text 
                                                    fontWeight="extrabold" 
                                                    fontSize="4xl" 
                                                    color="secondary.900"
                                                    lineHeight="1.1"
                                                >
                                                    {turn.patientName}
                                                </Text>
                                                <Flex align="center" gap={10} mt={3}>
                                                    <Text color="secondary.800" fontSize="3xl" fontWeight="bold">
                                                        Turno: <strong style={{color: '#10b981'}}>#{turn.assignedTurn}</strong>
                                                    </Text>
                                                    <Text color="secondary.800" fontSize="3xl" fontWeight="bold">
                                                        Cubículo: <strong style={{color: '#10b981'}}>{turn.cubicle?.name}</strong>
                                                    </Text>
                                                </Flex>
                                            </Box>
                                            
                                            <Box
                                                bg="rgba(16, 185, 129, 0.2)"
                                                color="success"
                                                px={8}
                                                py={5}
                                                borderRadius="2xl"
                                                fontSize="2xl"
                                                fontWeight="extrabold"
                                                display="flex"
                                                alignItems="center"
                                                gap={4}
                                            >
                                                <Box as={FaHeartbeat} fontSize="3xl" />
                                                ATENDIENDO
                                            </Box>
                                        </Flex>
                                    </Box>
                                ));
                            })()
                        )}
                    </Box>

                    {/* Pacientes en Espera - GRANDE */}
                    <Box
                        borderRadius="3xl"
                        p={6}
                        background="rgba(255, 255, 255, 0.3)"
                        backdropFilter="blur(20px)"
                        boxShadow="glass"
                        border="2px solid rgba(245, 158, 11, 0.3)"
                        overflowY="auto"
                        height="100%"
                        animation={`${fadeInUp} 1.2s ease-out`}
                        position="relative"
                    >
                        <Box
                            position="absolute"
                            top={0}
                            left={0}
                            right={0}
                            height="6px"
                            background="linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
                            borderTopRadius="3xl"
                        />
                        
                        <Flex align="center" justify="space-between" mb={6}>
                            <Heading 
                                size="xl" 
                                color="secondary.900" 
                                fontWeight="bold"
                                display="flex"
                                alignItems="center"
                                gap={4}
                            >
                                <Box as={FaClock} color="warning" fontSize="3xl" />
                                EN ESPERA
                            </Heading>
                            <Box
                                bg="linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
                                color="white"
                                px={6}
                                py={3}
                                borderRadius="xl"
                                fontSize="xl"
                                fontWeight="bold"
                            >
                                {pendingTurns.length}
                            </Box>
                        </Flex>

                        {pendingTurns.length === 0 ? (
                            <Box
                                textAlign="center"
                                py={16}
                                color="secondary.600"
                            >
                                <Box as={FaClock} fontSize="5xl" mb={3} />
                                <Text fontSize="2xl" fontWeight="semibold">No hay pacientes en espera</Text>
                            </Box>
                        ) : (
                            (() => {
                                // Lógica de rotación circular para mostrar exactamente 5 pacientes
                                const totalPatients = pendingTurns.length;
                                let patientsToShow = [];
                                
                                if (totalPatients <= 5) {
                                    patientsToShow = pendingTurns;
                                } else {
                                    // Rotación circular
                                    for (let i = 0; i < 5; i++) {
                                        const index = (scrollPositions.pending + i) % totalPatients;
                                        patientsToShow.push(pendingTurns[index]);
                                    }
                                }
                                
                                return patientsToShow.map((turn, index) => (
                                    <Box
                                        key={turn.id}
                                        p={6}
                                        borderRadius="3xl"
                                        mb={5}
                                        background="rgba(255, 255, 255, 0.9)"
                                        backdropFilter="blur(10px)"
                                        border="3px solid rgba(245, 158, 11, 0.5)"
                                        borderLeft="10px solid"
                                        borderLeftColor={turn.tipoAtencion === "Special" ? "error" : "warning"}
                                        boxShadow="xl"
                                        transition="all 0.3s ease"
                                        _hover={{ 
                                            transform: 'translateY(-2px)', 
                                            boxShadow: '2xl',
                                            background: "rgba(255, 255, 255, 0.95)"
                                        }}
                                        animation={`${fadeInUp} ${0.2 + index * 0.03}s ease-out`}
                                    >
                                        <Flex align="center" justify="space-between">
                                            <Box>
                                                <Text 
                                                    fontWeight="extrabold" 
                                                    fontSize="3xl" 
                                                    color="secondary.900"
                                                    lineHeight="1.1"
                                                >
                                                    {turn.patientName}
                                                </Text>
                                                <Text color="secondary.800" fontSize="2xl" fontWeight="bold" mt={2}>
                                                    Turno: <strong style={{color: '#f59e0b'}}>#{turn.assignedTurn}</strong>
                                                </Text>
                                            </Box>
                                            
                                            <Flex align="center" gap={4}>
                                                {turn.tipoAtencion === "Special" && (
                                                    <Box as={FaWheelchair} color="error" fontSize="3xl" />
                                                )}
                                                <Box
                                                    bg={turn.tipoAtencion === "Special" 
                                                        ? "rgba(239, 68, 68, 0.2)" 
                                                        : "rgba(245, 158, 11, 0.2)"
                                                    }
                                                    color={turn.tipoAtencion === "Special" ? "error" : "warning"}
                                                    px={6}
                                                    py={3}
                                                    borderRadius="2xl"
                                                    fontSize="xl"
                                                    fontWeight="extrabold"
                                                >
                                                    {turn.tipoAtencion === "Special" ? "PRIORITARIO" : "EN ESPERA"}
                                                </Box>
                                            </Flex>
                                        </Flex>
                                    </Box>
                                ));
                            })()
                        )}
                    </Box>
                </Grid>

                {/* Modal de Llamado - GIGANTE para TV */}
                {callingPatient && (
                    <Box
                        position="fixed"
                        top="0"
                        left="0"
                        right="0"
                        bottom="0"
                        background="rgba(0, 0, 0, 0.7)"
                        backdropFilter="blur(15px)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        zIndex="modal"
                    >
                        <Box
                            p={16}
                            borderRadius="3xl"
                            background="rgba(255, 255, 255, 0.98)"
                            backdropFilter="blur(20px)"
                            boxShadow="glass"
                            border="4px solid rgba(79, 125, 243, 0.4)"
                            textAlign="center"
                            minWidth="80%"
                            animation={`${blinkAnimation} 2s infinite, ${pulseGlow} 2s infinite`}
                        >
                            <Box
                                w={48}
                                h={48}
                                borderRadius="full"
                                background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                mx="auto"
                                mb={12}
                                boxShadow="2xl"
                            >
                                <Box as={FaMicrophone} color="white" fontSize="7xl" />
                            </Box>
                            
                            <Text 
                                fontSize="6xl" 
                                fontWeight="bold" 
                                color="secondary.900"
                                mb={6}
                                lineHeight="shorter"
                            >
                                LLAMANDO A
                            </Text>
                            <Text 
                                fontSize="8xl" 
                                fontWeight="extrabold" 
                                background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
                                backgroundClip="text"
                                color="transparent"
                                mb={12}
                                lineHeight="shorter"
                            >
                                {callingPatient.patientName}
                            </Text>
                            <Box
                                bg="rgba(79, 125, 243, 0.15)"
                                color="primary.600"
                                px={10}
                                py={6}
                                borderRadius="2xl"
                                display="inline-block"
                                fontSize="5xl"
                                fontWeight="bold"
                            >
                                CUBÍCULO: {callingPatient.cubicle?.name}
                            </Box>
                        </Box>
                    </Box>
                )}

            </Box>
        </ChakraProvider>
    );
});

export default Queue;