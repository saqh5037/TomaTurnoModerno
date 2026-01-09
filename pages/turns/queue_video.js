// pages/turns/queue_video.js - Rediseño completo basado en imagen de referencia
import { useEffect, useState, useRef, useCallback, useMemo, memo } from "react";
import { 
  Box, 
  Heading, 
  Text, 
  Flex, 
  VStack, 
  HStack,
  Icon,
  extendTheme,
  Badge,
  Circle
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { 
  FaClock,
  FaCalendarAlt,
  FaHeartbeat,
  FaStar,
  FaSmile,
  FaMeh,
  FaFrown
} from 'react-icons/fa';
import QRCode from 'react-qr-code';

// Tema moderno con gradientes suaves
const modernTheme = extendTheme({
  colors: {
    primary: {
      50: "#E6F7FF",
      100: "#BAE7FF",
      500: "#1890FF",
      600: "#096DD9",
      700: "#0050B3",
    },
    secondary: {
      500: "#8C8C8C",
      600: "#595959",
      700: "#434343",
    },
    orange: {
      500: "#FFA940",
      600: "#FA8C16",
    },
    purple: {
      500: "#B37FEB",
      600: "#9254DE",
    },
    pink: {
      500: "#EB2F96",
      600: "#C41D7F",
    }
  },
  fonts: {
    heading: "'Inter', 'Segoe UI', sans-serif",
    body: "'Inter', 'Segoe UI', sans-serif",
  }
});

// Animaciones suaves
const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const QueueVideoScreen = memo(function QueueVideoScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentCallingTurn, setCurrentCallingTurn] = useState(null);
  const [pendingTurns, setPendingTurns] = useState([]);
  const [inProgressTurns, setInProgressTurns] = useState([]);
  const [scrollPositions, setScrollPositions] = useState({ inProgress: 0, pending: 0 });
  const [displayAnnouncement, setDisplayAnnouncement] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const lastCalledTurnId = useRef(null);

  // Función para hablar con voz femenina
  const speakAnnouncement = useCallback((turn, cubiculoName) => {
    if (!('speechSynthesis' in window)) {
      console.log('Speech synthesis no soportado');
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    const messageText = `Atención, paciente ${turn.patientName}, favor de dirigirse al cubículo número ${cubiculoName}. Repito, paciente ${turn.patientName}, cubículo número ${cubiculoName}.`;
    
    const utterance = new SpeechSynthesisUtterance(messageText);
    utterance.lang = 'es-MX';
    utterance.rate = 0.9;
    utterance.pitch = 1.2;
    utterance.volume = 1.0;

    const selectFemaleVoice = () => {
      const voices = synth.getVoices();
      const femaleNames = [
        'Paulina', 'Mónica', 'Monica', 'Esperanza', 'Angelica', 'Maria', 'Carmen',
        'Isabel', 'Ana', 'Laura', 'Sofia', 'Sofía', 'Patricia', 'Elena', 'Rosa',
        'Lucia', 'Lucía', 'Valentina', 'Camila', 'Daniela', 'Mariana', 'Alejandra',
        'Gabriela', 'Fernanda', 'Sara', 'Samantha', 'Victoria', 'Andrea', 'Natalia',
        'Ximena', 'Jimena', 'Paola', 'Carla', 'Ivana', 'Silvia', 'Martha', 'Diana',
        'Claudia', 'Sandra', 'Adriana', 'Beatriz', 'Catalina', 'Cristina', 'Teresa',
        'Marta', 'Pilar', 'Julia', 'Alba', 'Raquel', 'Nuria', 'Miriam', 'Veronica',
        'Verónica', 'Alicia', 'Lidia', 'Susana', 'Yolanda', 'Montserrat', 'Rocio',
        'Rocío', 'Google español', 'Microsoft Spanish', 'Cortana', 'female', 'Female',
        'mujer', 'Mujer', 'femenino', 'Femenino', 'Zira', 'Helena', 'Sabina'
      ];

      const femaleVoice = voices.find(voice => 
        voice.lang.includes('es') && 
        femaleNames.some(name => voice.name.includes(name))
      ) || voices.find(voice => voice.lang.includes('es'));

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
    };

    if (synth.getVoices().length > 0) {
      selectFemaleVoice();
      synth.speak(utterance);
    } else {
      synth.addEventListener('voiceschanged', () => {
        selectFemaleVoice();
        synth.speak(utterance);
      }, { once: true });

      setTimeout(() => {
        const voices = synth.getVoices();
        if (voices.length > 0) {
          selectFemaleVoice();
          synth.speak(utterance);
        }
      }, 2000);
    }
  }, []);

  // Función para obtener datos de la cola
  const fetchQueueData = useCallback(async () => {
    try {
      const response = await fetch('/api/queue_video/list');
      if (!response.ok) {
        console.error('Error en respuesta:', response.status);
        return;
      }
      
      const data = await response.json();
      console.log('Datos recibidos:', data);
      
      setPendingTurns(data.pendingTurns || []);
      setInProgressTurns(data.inProgressTurns || []);

      // El API devuelve inCallingTurns que es un array, tomamos el primer elemento
      const callingTurn = data.inCallingTurns && data.inCallingTurns.length > 0 ? data.inCallingTurns[0] : null;
      
      if (callingTurn) {
        console.log('Paciente llamado detectado:', callingTurn);
        const isNewCall = !lastCalledTurnId.current || 
                         lastCalledTurnId.current !== callingTurn.id;
        
        if (isNewCall) {
          console.log('Nuevo llamado - mostrando pantalla de video');
          lastCalledTurnId.current = callingTurn.id;
          setCurrentCallingTurn(callingTurn);
          setDisplayAnnouncement(true);
          
          speakAnnouncement(callingTurn, callingTurn.cubicle?.name || 'Sin asignar');
          
          // El video se reproducirá automáticamente con autoPlay en el JSX
          
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(console.error);
          }
          
          setTimeout(async () => {
            console.log('Ocultando pantalla de llamado');
            try {
              await fetch('/api/queue_video/updateCall', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: callingTurn.id, isCalled: true })
              });
            } catch (error) {
              console.error('Error actualizando llamado:', error);
            }
            setDisplayAnnouncement(false);
            setCurrentCallingTurn(null);
          }, 15000);
        }
      }
    } catch (error) {
      console.error('Error obteniendo datos:', error);
    }
  }, [speakAnnouncement]);

  // Polling de datos
  useEffect(() => {
    fetchQueueData();
    const interval = setInterval(fetchQueueData, 3000);
    return () => clearInterval(interval);
  }, [fetchQueueData]);

  // Actualizar reloj
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timeInterval);
  }, []);

  // Auto-scroll para listas largas
  useEffect(() => {
    if (!displayAnnouncement) {
      const scrollInterval = setInterval(() => {
        setScrollPositions(prev => ({
          inProgress: inProgressTurns.length > 8 ? (prev.inProgress + 1) % Math.max(1, inProgressTurns.length - 7) : 0,
          pending: pendingTurns.length > 16 ? (prev.pending + 1) % Math.max(1, pendingTurns.length - 15) : 0,
        }));
      }, 8000);
      
      return () => clearInterval(scrollInterval);
    }
  }, [displayAnnouncement, inProgressTurns.length, pendingTurns.length]);

  // Formatear fecha
  const formatDate = (date) => {
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]}`;
  };

  return (
    <Box 
        minH="100vh" 
        background="linear-gradient(135deg, #E0F2FE 0%, #F0E6FF 50%, #FFE4E6 100%)"
        p={4}
        position="relative"
      >
        {/* Audio oculto */}
        <audio ref={audioRef} src="/assets/audio_llamado.mp3" style={{ display: 'none' }} />

        {/* Header principal */}
        <Box
          bg="white"
          borderRadius="2xl"
          p={6}
          mb={4}
          boxShadow="lg"
          border="2px solid"
          borderColor="blue.100"
        >
          <Flex justify="space-between" align="center">
            <HStack spacing={4}>
              <Box
                w={16}
                h={16}
                borderRadius="xl"
                background="linear-gradient(135deg, #667EEA 0%, #764BA2 100%)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontSize="2xl"
                boxShadow="lg"
              >
                <FaHeartbeat />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading fontSize="3xl" color="gray.800">
                  Dashboard de <Text as="span" color="purple.600">Turnos</Text>
                </Heading>
                <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
                  ✓ ACTUALIZANDO EN TIEMPO REAL
                </Badge>
              </VStack>
            </HStack>
            
            <HStack spacing={6}>
              <VStack spacing={0}>
                <HStack color="blue.600">
                  <Icon as={FaCalendarAlt} />
                  <Text fontSize="sm" fontWeight="medium">{formatDate(currentTime)}</Text>
                </HStack>
              </VStack>
              <VStack spacing={0}>
                <HStack color="pink.600">
                  <Icon as={FaClock} />
                  <Text fontSize="2xl" fontWeight="bold">
                    {currentTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </HStack>
              </VStack>
            </HStack>
          </Flex>
        </Box>

        {/* Contenido principal */}
        <Flex gap={4} h="calc(100vh - 200px)">
          {/* Panel izquierdo - Pacientes en Atención */}
          <Box
            flex="1"
            bg="white"
            borderRadius="2xl"
            p={6}
            boxShadow="lg"
            border="2px solid"
            borderColor="blue.100"
            position="relative"
          >
            <HStack mb={6} justify="space-between">
              <HStack>
                <Box
                  w={12}
                  h={12}
                  borderRadius="lg"
                  bg="blue.50"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="blue.600"
                  fontSize="xl"
                >
                  <FaHeartbeat />
                </Box>
                <VStack align="start" spacing={0}>
                  <Heading fontSize="2xl" color="blue.600">
                    Pacientes en Atención
                  </Heading>
                  <Badge colorScheme="blue" fontSize="md" px={3}>
                    {inProgressTurns.length} PACIENTES
                  </Badge>
                </VStack>
              </HStack>
            </HStack>

            <VStack spacing={3} align="stretch">
              {inProgressTurns.length === 0 ? (
                <Box
                  textAlign="center"
                  py={16}
                  color="gray.400"
                >
                  <Text fontSize="lg">No hay pacientes en atención</Text>
                </Box>
              ) : (
                (inProgressTurns.length > 8 
                  ? inProgressTurns.slice(scrollPositions.inProgress, scrollPositions.inProgress + 8)
                  : inProgressTurns
                ).map((turn) => (
                  <Box
                    key={turn.id}
                    p={4}
                    borderRadius="xl"
                    bg="blue.50"
                    borderLeft="4px solid"
                    borderLeftColor="blue.500"
                    animation={`${fadeIn} 0.5s ease-out`}
                  >
                    <Flex justify="space-between" align="center">
                      <HStack spacing={3}>
                        <Circle
                          size="40px"
                          bg="blue.500"
                          color="white"
                          fontSize="sm"
                          fontWeight="bold"
                        >
                          {turn.patientName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </Circle>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold" fontSize="lg" color="gray.800">
                            {turn.patientName}
                          </Text>
                          <HStack spacing={2}>
                            <Badge colorScheme="blue">Cubículo {turn.cubicle?.name || 'N/A'}</Badge>
                          </HStack>
                        </VStack>
                      </HStack>
                      {turn.workOrder && (
                        <Badge colorScheme="teal" fontSize="lg" px={3} py={1}>
                          {turn.workOrder}
                        </Badge>
                      )}
                    </Flex>
                  </Box>
                ))
              )}
            </VStack>
          </Box>

          {/* Panel derecho - Pacientes en Espera */}
          <Box
            flex="1.5"
            bg="white"
            borderRadius="2xl"
            p={6}
            boxShadow="lg"
            border="2px solid"
            borderColor="orange.100"
            position="relative"
          >
            <HStack mb={6} justify="space-between">
              <HStack>
                <Box
                  w={12}
                  h={12}
                  borderRadius="lg"
                  bg="orange.500"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  fontSize="xl"
                >
                  <FaClock />
                </Box>
                <VStack align="start" spacing={0}>
                  <Heading fontSize="2xl" color="orange.600">
                    Pacientes en Espera
                  </Heading>
                  <Badge colorScheme="orange" fontSize="md" px={3}>
                    {pendingTurns.length} PACIENTES
                  </Badge>
                </VStack>
              </HStack>
              {pendingTurns.length > 16 && (
                <Text fontSize="sm" color="gray.500">
                  Mostrando {scrollPositions.pending + 1}-{Math.min(scrollPositions.pending + 16, pendingTurns.length)} de {pendingTurns.length}
                </Text>
              )}
            </HStack>

            <VStack spacing={2} align="stretch">
              {pendingTurns.length === 0 ? (
                <Box
                  textAlign="center"
                  py={16}
                  color="gray.400"
                >
                  <Text fontSize="lg">No hay pacientes en espera</Text>
                </Box>
              ) : (
                (pendingTurns.length > 16 
                  ? pendingTurns.slice(scrollPositions.pending, scrollPositions.pending + 16)
                  : pendingTurns
                ).map((turn) => (
                  <Box
                    key={turn.id}
                    p={3}
                    borderRadius="lg"
                    bg="orange.50"
                    borderLeft="3px solid"
                    borderLeftColor="orange.400"
                    animation={`${fadeIn} 0.5s ease-out`}
                  >
                    <Flex justify="space-between" align="center">
                      <HStack spacing={3}>
                        <Circle
                          size="35px"
                          bg="orange.400"
                          color="white"
                          fontSize="xs"
                          fontWeight="bold"
                        >
                          {turn.patientName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </Circle>
                        <Text fontWeight="semibold" fontSize="md" color="gray.700">
                          {turn.patientName}
                        </Text>
                      </HStack>
                      {turn.workOrder && (
                        <Badge colorScheme="teal" fontSize="md" px={2}>
                          {turn.workOrder}
                        </Badge>
                      )}
                    </Flex>
                  </Box>
                ))
              )}
            </VStack>
          </Box>
        </Flex>

        {/* Footer con información institucional y QR */}
        <Flex
          position="absolute"
          bottom={4}
          left={4}
          right={4}
          bg="white"
          borderRadius="xl"
          p={3}
          boxShadow="md"
          justify="space-between"
          align="center"
        >
          <VStack align="start" spacing={0}>
            <Text fontSize="sm" fontWeight="bold" color="blue.600">
              Instituto Nacional de Enfermedades Respiratorias
            </Text>
            <Text fontSize="xs" color="gray.600">
              Ismael Cosío Villegas (INER)
            </Text>
            <Text fontSize="xs" color="gray.500">
              Desarrollado por DT Diagnósticos by Labsis © 2025
            </Text>
          </VStack>

          {/* QR con encuesta - posicionado estratégicamente */}
          <HStack spacing={4} align="center">
            <VStack spacing={1} align="center">
              <HStack spacing={2}>
                <Icon as={FaStar} color="pink.500" />
                <Text fontSize="sm" fontWeight="bold" color="pink.600">
                  ¡Califica nuestro servicio!
                </Text>
              </HStack>
              <Text fontSize="xs" color="gray.600">
                Escanea el código QR con tu celular
              </Text>
            </VStack>
            
            <Box
              p={2}
              bg="white"
              borderRadius="lg"
              border="2px solid"
              borderColor="pink.200"
              boxShadow="sm"
            >
              <QRCode
                size={60}
                value="https://redcap-iner.com.mx/surveys/?s=KXTEHHDT8C"
                viewBox="0 0 256 256"
              />
            </Box>
            
            <VStack spacing={0}>
              <HStack spacing={2}>
                <Text fontSize="lg">😊</Text>
                <Text fontSize="lg">😐</Text>
                <Text fontSize="lg">😞</Text>
              </HStack>
              <Text fontSize="xs" color="gray.600" fontWeight="medium">
                Tu opinión es importante
              </Text>
            </VStack>
          </HStack>
        </Flex>

        {/* Pantalla de llamado cuando hay un paciente siendo llamado */}
        {displayAnnouncement && currentCallingTurn && (
          console.log('Renderizando pantalla de llamado para:', currentCallingTurn.patientName) ||
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="black"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={9999}
          >
            {/* Video de fondo */}
            <video
              ref={videoRef}
              src="/assets/llamado_flebotomista.mp4"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 1
              }}
              autoPlay
              muted
              loop
              onLoadedData={() => setIsVideoLoaded(true)}
            />
            
            {/* Contenido superpuesto */}
            <Box
              position="relative"
              zIndex={2}
              textAlign="center"
            >
              <VStack spacing={8}>
                <Heading fontSize="6xl" color="white" textShadow="2px 2px 4px rgba(0,0,0,0.8)">
                  LLAMANDO AL PACIENTE
                </Heading>
                
                <Box
                  p={12}
                  bg="rgba(255, 255, 255, 0.95)"
                  borderRadius="3xl"
                  boxShadow="2xl"
                  animation={`${pulse} 1.5s infinite`}
                >
                  <VStack spacing={6}>
                    <Circle
                      size="100px"
                      bg="pink.500"
                      color="white"
                      fontSize="3xl"
                      fontWeight="bold"
                    >
                      {currentCallingTurn.patientName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </Circle>
                    
                    <Heading fontSize="4xl" color="gray.800" textAlign="center">
                      {currentCallingTurn.patientName}
                    </Heading>
                    
                    <Box
                      bg="pink.500"
                      color="white"
                      px={8}
                      py={4}
                      borderRadius="xl"
                      fontSize="3xl"
                      fontWeight="bold"
                    >
                      Cubículo: {currentCallingTurn.cubicle?.name}
                    </Box>
                  </VStack>
                </Box>
              </VStack>
            </Box>
          </Box>
        )}
      </Box>
  );
});

export default QueueVideoScreen;