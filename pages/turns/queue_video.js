// pages/turns/queue_video.js
import { useEffect, useState, useRef, useCallback, useMemo, memo } from "react";
import { Box, Heading, Text, Grid, Flex, Image, VStack, Icon, Avatar } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { FaHome, FaUserMd, FaClock, FaCalendarAlt, FaChartBar, FaClipboardList } from 'react-icons/fa'; // Iconos de ejemplo de Font Awesome

// Animación para el texto superpuesto - Memoizada fuera del componente
const overlayAnimation = keyframes`
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
`;

// Constantes memoizadas
const CALL_VIDEO_URL = "/assets/llamado_flebotomista.mp4"; 
const INTRO_VIDEO_DURATION_MS = 2000;
const ANNOUNCEMENT_REPETITIONS = 2;

const QueueVideoScreen = memo(function QueueVideoScreen() {
  const [pendingTurns, setPendingTurns] = useState([]);
  const [inProgressTurns, setInProgressTurns] = useState([]);
  const [currentCallingTurn, setCurrentCallingTurn] = useState(null);
  const [displayAnnouncement, setDisplayAnnouncement] = useState(false);
  const [videoState, setVideoState] = useState('idle');
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(null); // MOVIMIENTO: currentTime al estado
  
  // Formateo de tiempo memoizado
  const formattedTime = useMemo(() => {
    if (!currentTime) return "Cargando...";
    return currentTime.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [currentTime]);

  // Función para obtener datos de la cola de turnos
  const fetchQueueData = useCallback(async () => {
    try {
      const response = await fetch("/api/queue_video/list");
      if (!response.ok) throw new Error("Error al obtener los turnos para video screen");
      const data = await response.json();

      const sortedPendingTurns = (data.pendingTurns || []).sort((a, b) => a.assignedTurn - b.assignedTurn);
      const sortedInProgressTurns = (data.inProgressTurns || []).sort((a, b) => a.assignedTurn - b.assignedTurn);

      setPendingTurns(sortedPendingTurns);
      setInProgressTurns(sortedInProgressTurns);

      const callingTurnFromAPI = data.inCallingTurns && data.inCallingTurns.length > 0 ? data.inCallingTurns[0] : null;

      if (callingTurnFromAPI) {
        if (!currentCallingTurn || currentCallingTurn.id !== callingTurnFromAPI.id) {
          setCurrentCallingTurn(callingTurnFromAPI);
          setVideoState('playing');
          setDisplayAnnouncement(true);
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(e => console.error("Error al reproducir el video al iniciar llamado:", e));
          }
        }
      } else {
        if (currentCallingTurn || videoState !== 'idle') {
          setCurrentCallingTurn(null);
          setVideoState('idle');
          setDisplayAnnouncement(false);
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            videoRef.current.muted = true;
          }
          if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
          }
        }
      }
    } catch (error) {
      console.error("Error al cargar los turnos para video screen:", error);
    }
  }, [currentCallingTurn, videoState]);

  // Polling inteligente similar al componente principal
  useEffect(() => {
    fetchQueueData();
    
    // Intervalo inteligente basado en actividad
    const pollInterval = currentCallingTurn || pendingTurns.length > 0 ? 3000 : 8000;
    const interval = setInterval(fetchQueueData, pollInterval);
    
    return () => clearInterval(interval);
  }, [fetchQueueData, currentCallingTurn, pendingTurns.length]);

  // Actualizar tiempo cada minuto
  useEffect(() => {
    setCurrentTime(new Date());
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Cada minuto en lugar de cada segundo
    
    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (videoState === 'playing') {
        videoElement.muted = false;
        videoElement.loop = false;
        
        const announcementTimeout = setTimeout(() => {
            setVideoState('announcing');
            speakAnnouncement(currentCallingTurn);
        }, INTRO_VIDEO_DURATION_MS);

        const handleVideoEndedDuringPlay = () => {
            if (videoState === 'playing') { 
              console.warn("Video de intro terminó. Asegurando que el anuncio de voz comience.");
              setVideoState('announcing');
              speakAnnouncement(currentCallingTurn);
            }
        };
        videoElement.addEventListener('ended', handleVideoEndedDuringPlay);

        return () => {
            clearTimeout(announcementTimeout);
            videoElement.removeEventListener('ended', handleVideoEndedDuringPlay);
            if (videoElement) {
                videoElement.pause();
                videoElement.currentTime = 0;
                videoElement.muted = true;
            }
        };

    } else if (videoState === 'idle') {
        videoElement.pause();
        videoElement.currentTime = 0;
        videoElement.muted = true; 
        videoElement.loop = false;
    }
  }, [videoState, currentCallingTurn, CALL_VIDEO_URL]);


  const speakAnnouncement = (turn) => {
    if (!turn || typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn("SpeechSynthesis no está disponible o no hay turno para anunciar. No se reproducirá audio.");
      setVideoState('idle'); 
      setDisplayAnnouncement(false);
      updateCallStatus(turn.id, false); 
      if (videoRef.current) { 
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        videoRef.current.muted = true;
      }
      return;
    }

    const messageText = `Paciente ${turn.patientName}, favor de pasar al cubículo ${turn.cubicle?.name || 'desconocido'}.`;
    const utterance = new SpeechSynthesisUtterance(messageText);

    const assignVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (voice) => voice.lang === 'es-ES' && voice.name.includes('Google')
      ) || voices.find(
        (voice) => voice.lang === 'es-MX' && voice.name.includes('Google')
      ) || voices.find(
        (voice) => voice.lang === 'es-US' && voice.name.includes('Google')
      ) || voices.find(
        (voice) => voice.lang.startsWith('es') && voice.name.includes('Google')
      ) || voices.find(
        (voice) => voice.lang.startsWith('es') && voice.default
      ) || voices.find(voice => voice.lang.startsWith('es')) || voices[0];
      
      utterance.voice = preferredVoice;
      utterance.lang = "es-ES";
      utterance.rate = 0.9; 
      utterance.pitch = 1;
    };

    let repeatCount = 0;
    const announceLoop = () => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        window.speechSynthesis.speak(utterance);
        utterance.onend = () => {
            repeatCount++;
            if (repeatCount < ANNOUNCEMENT_REPETITIONS) {
                setTimeout(announceLoop, 1500);
            } else {
                console.log("Anuncio de voz finalizado. Marcando turno como 'no llamado' y reseteando pantalla.");
                setVideoState('finished_announcement'); 
                setDisplayAnnouncement(false);
                
                updateCallStatus(turn.id, false); 

                if (videoRef.current) { 
                    videoRef.current.pause();
                    videoRef.current.currentTime = 0;
                    videoRef.current.muted = true;
                }
                setCurrentCallingTurn(null);
                setVideoState('idle'); 
            }
        };
    };
    
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null; 
        setVoice(); 
        announceLoop();
      };
    } else {
      setVoice(); 
      announceLoop();
    }
  };

  // Función para actualizar el estado de llamado del turno en la DB - Optimizada
  const updateCallStatus = useCallback(async (turnId, isCalledValue) => {
    if (!turnId) return;
    
    try {
      console.log(`Intentando actualizar turno ${turnId} a isCalled: ${isCalledValue}`);
      const response = await fetch(`/api/queue_video/updateCall`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: turnId, isCalled: isCalledValue }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.error || 'Desconocido'}`);
      }
      console.log(`Turno ${turnId} actualizado con éxito a isCalled: ${isCalledValue}.`);
    } catch (error) {
      console.error("Error al actualizar el estado de llamado del paciente:", error);
    }
  }, []);

  // Renderizado del componente - Memoizado
  const renderQueueList = useCallback((turns, title, icon, colorScheme, accentColor) => (
    <Box
      borderRadius="2xl"
      padding="8"
      backgroundColor="white"
      boxShadow="0 10px 30px rgba(0, 0, 0, 0.15)"
      overflowY="auto"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="center"
      minHeight="350px"
    >
      <Flex alignItems="center" gap="4" mb="6" width="100%" justifyContent="center">
        <Icon as={icon} boxSize="8" color={colorScheme} />
        <Heading size="3xl" textAlign="center" color="#4E6BF0" fontWeight="extrabold" textShadow="1px 1px 2px rgba(0,0,0,0.1)">
          {title}
        </Heading>
      </Flex>
      <VStack spacing="2" width="100%" flex="1" px="2">
        {turns.length > 0 ? (
          turns.map((turn, index) => (
            <Box
              key={turn.id}
              padding="4"
              borderWidth="0px"
              borderRadius="xl"
              marginBottom="2"
              backgroundColor="#F0F5FF"
              boxShadow="0 2px 8px rgba(0, 0, 0, 0.05)"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              width="100%"
            >
              <Text fontWeight="black" fontSize="3xl" color="#304080" noOfLines={1}>
                {turn.patientName}
              </Text>
              <Text fontSize="2xl" color="#4E6BF0">
                Turno: <Text as="span" fontWeight="bold">{turn.assignedTurn}</Text>
              </Text>
              {turn.cubicle?.name && (
                <Text fontSize="2xl" color="#4E6BF0">
                  Cubículo: <Text as="span" fontWeight="bold">{turn.cubicle.name}</Text>
                </Text>
              )}
            </Box>
          ))
        ) : (
          <Text fontSize="xl" color="gray.500" mt="4">No hay pacientes en {title.toLowerCase()} en este momento.</Text>
        )}
      </VStack>
    </Box>
  ), []);

  return (
    <Box
      height="100vh"
      width="100vw"
      position="relative"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      overflow="hidden"
      bg="#E0F2F7" // Fondo general muy claro, casi blanco-azulado
    >
      {/* Video de Flebotomista - Visible solo cuando displayAnnouncement es true */}
      <video
        ref={videoRef}
        src={CALL_VIDEO_URL}
        autoPlay={false} // Controlado por JS
        playsInline 
        muted={true} // Siempre muteado por defecto, control de mute en JS
        loop={false} // No loop por defecto
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: displayAnnouncement ? 1 : 0, // Controla la visibilidad
          transition: 'opacity 0.5s ease-in-out',
          zIndex: displayAnnouncement ? 1 : -1, // Z-index cambia para que solo sea visible cuando opaco
        }}
      />
      
      {/* Overlay azul (con logo INER y texto de anuncio) - Siempre al frente durante el anuncio */}
      <Flex
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        backgroundColor="rgba(60, 80, 200, 0.95)" // Azul más oscuro y vibrante del ejemplo
        zIndex="10" 
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        textAlign="center"
        padding="8"
        color="white"
        style={{
          opacity: displayAnnouncement ? 1 : 0,
          transform: displayAnnouncement ? 'scale(1)' : 'scale(0.8)',
          transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out',
          pointerEvents: displayAnnouncement ? 'auto' : 'none',
        }}
      >
        {displayAnnouncement && (
          <>
            <Image src="/logo-iner.png" alt="INER Logo" height="120px" mb="6" filter="drop-shadow(0px 0px 8px rgba(0,0,0,0.4))" />
            {currentCallingTurn && (
              <VStack spacing="6">
                <Heading 
                  fontSize={{ base: "6xl", lg: "8xl" }} 
                  animation={`${overlayAnimation} 0.8s ease-out`}
                  fontWeight="extrabold"
                  textShadow="2px 2px 4px rgba(0,0,0,0.3)"
                >
                  {currentCallingTurn.patientName}
                </Heading>
                <Heading 
                  fontSize={{ base: "5xl", lg: "7xl" }} 
                  animation={`${overlayAnimation} 1.2s ease-out`}
                  fontWeight="bold"
                  textShadow="1px 1px 3px rgba(0,0,0,0.2)"
                >
                  CUBÍCULO NÚMERO {currentCallingTurn.cubicle?.name}
                </Heading>
              </VStack>
            )}
          </>
        )}
      </Flex>


      {/* CONTENEDOR PRINCIPAL DEL DASHBOARD - visible solo cuando no hay llamado */}
      <Flex
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        flexDirection="column"
        justifyContent="flex-start" // Alinear al inicio para dejar espacio al título
        alignItems="center"
        padding={{ base: "4", md: "8" }} // Más padding general
        zIndex={displayAnnouncement ? 0 : 2}
        style={{
          opacity: displayAnnouncement ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out',
          pointerEvents: displayAnnouncement ? 'none' : 'auto',
        }}
      >
        {/* Header de Dashboard (Parte superior) */}
        <Flex
          width={{ base: "95%", md: "95%" }} // Ocupa casi todo el ancho
          backgroundColor="white"
          borderRadius="2xl" // Más redondeado
          boxShadow="0 10px 30px rgba(0, 0, 0, 0.1)"
          padding="6"
          mb="8" // Espacio debajo del header
          alignItems="center"
          justifyContent="space-between" // Espacio entre elementos
          color="#304080"
        >
          {/* Columna Izquierda del Header */}
          <Flex alignItems="center" gap={{ base: "2", md: "4" }}>
            <Box bg="#4E6BF0" borderRadius="lg" p="3">
              <Icon as={FaClipboardList} boxSize={{ base: 6, md: 8 }} color="white" />
            </Box>
            <Heading fontSize={{ base: "3xl", md: "5xl" }} fontWeight="extrabold" textShadow="1px 1px 2px rgba(0,0,0,0.05)">
              Dashboard de Turnos
            </Heading>
          </Flex>

          {/* Columna Derecha del Header (Calendar / Time) */}
          <Flex alignItems="center" gap="4">
            <Flex alignItems="center" gap="2" display={{ base: 'none', md: 'flex' }}>
              <Icon as={FaCalendarAlt} boxSize={{ base: 6, md: 8 }} color="#4E6BF0" />
              <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="semibold">
                {currentTime && currentTime.toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' })}
              </Text>
            </Flex>
            <Flex alignItems="center" gap="2">
              <Icon as={FaClock} boxSize={{ base: 6, md: 8 }} color="#4E6BF0" />
              <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="semibold">
                {currentTime && currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Flex>
          </Flex>
        </Flex>
        
        {/* Grid Principal de Contenido (2 Columnas Grandes) */}
        <Grid
          templateColumns={{ base: "1fr", md: "1.5fr 1fr" }}
          gap="8"
          width={{ base: "95%", md: "95%" }}
          flex="1"
          alignItems="stretch"
          justifyContent="center"
          overflow="hidden"
        >
          {/* Columna Izquierda: Pacientes en Atención (la más ancha) */}
          {renderQueueList(inProgressTurns.slice(0, 5), "Pacientes en Atención", FaUserMd, "#4E6BF0", "#304080")}
          
          {/* Columna Derecha: Pacientes en Espera */}
          {renderQueueList(pendingTurns.slice(0, 15), "Pacientes en Espera", FaClock, "#F59E0B", "#92400e")}
        </Grid>

      </Flex>
      
      {/* Footer - Posicionado abajo y con zIndex más bajo para no solapar */}
      <Flex
        as="footer"
        position="absolute"
        bottom="0"
        width="100%"
        padding="4"
        justifyContent="center"
        alignItems="center"
        backgroundColor="rgba(255, 255, 255, 0.9)"
        color="#304080"
        flexDirection="column"
        zIndex="0"
        boxShadow="0 -5px 15px rgba(0,0,0,0.1)"
      >
        <Text marginBottom="1" fontWeight="medium" textAlign="center" fontSize="md">
          Instituto Nacional de Enfermedades Respiratorias Ismael Cosío Villegas (INER)
        </Text>
        <Text textAlign="center" fontSize="sm">
          Desarrollado por DT Diagnósticos by Labsis | Todos los derechos reservados © {new Date().getFullYear()}
        </Text>
      </Flex>
    </Box>
  );
});

export default QueueVideoScreen;
