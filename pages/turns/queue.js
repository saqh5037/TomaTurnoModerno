import { useEffect, useState } from "react";
import { Box, Heading, Text, Grid, Flex } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

export default function Queue() {
  const [pendingTurns, setPendingTurns] = useState([]);
  const [inProgressTurns, setInProgressTurns] = useState([]);
  const [callingPatient, setCallingPatient] = useState(null);
  const [isCalling, setIsCalling] = useState(false);

  const fetchQueueData = async () => {
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
    } catch (error) {
      console.error("Error al cargar los turnos:", error);
    }
  };

  useEffect(() => {
    fetchQueueData();
    const interval = setInterval(() => fetchQueueData(), 5000);
    return () => clearInterval(interval);
  }, [isCalling]);

  const updateCallStatus = async () => {
    try {
      const response = await fetch(`/api/queue/updateCall`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: callingPatient.id, isCalled: true }),
      });
      if (!response.ok) throw new Error("Error al actualizar el estado del paciente.");

      setCallingPatient(null);
      setIsCalling(false);
    } catch (error) {
      console.error("Error al actualizar el estado del paciente:", error);
      setIsCalling(false);
    }
  };

  useEffect(() => {
    if (callingPatient && isCalling) {
      const playAnnouncement = async () => {
        if (!callingPatient) return;
        const audio = new Audio("/airport-sound.mp3");
        let repeatCount = 0;

        const playSoundAndSpeak = () => {
          audio.play();
          audio.onended = () => {
            const voices = window.speechSynthesis.getVoices();
            const selectedVoice = voices.find(voice => voice.lang === 'es-ES');  // Selecciona la voz en español

            const message = new SpeechSynthesisUtterance(
              `Paciente ${callingPatient.patientName}, favor de pasar al cubículo ${callingPatient.cubicle.name}`
            );
            message.lang = "es-ES";
            message.voice = selectedVoice; // Selecciona una voz explícita
            message.rate = 0.8;             // Ajusta la velocidad (valor normal)
            message.pitch = 1;              // Ajusta el tono
            window.speechSynthesis.speak(message);
            repeatCount++;

            if (repeatCount < 2) {
              setTimeout(playSoundAndSpeak, 1000);
            } else {
              updateCallStatus();
            }
          };
        };

        playSoundAndSpeak();
      };

      playAnnouncement();
    }
  }, [callingPatient, isCalling]);

  const blinkAnimation = keyframes`
    0% { background-color: #E0F7FA; }
    50% { background-color: #B2EBF2; }
    100% { background-color: #E0F7FA; }
  `;

  return (
    <Box
      height="100vh"
      backgroundImage="url('/backgrounds/queue-background.png')"
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      padding="6"
      display="flex"
      flexDirection="column"
    >
      {/* Título Principal */}
      <Box
        padding="5"
        backgroundColor="rgba(255, 255, 255, 0.9)"
        borderRadius="lg"
        boxShadow="0 4px 8px rgba(0, 0, 0, 0.1)"
        marginBottom="8"
        alignSelf="center"
        width={{ base: "90%", md: "60%" }}
      >
        <Heading textAlign="center" fontSize="5xl" color="#000000" fontWeight="bold">
          Gestión de Turnos
        </Heading>
      </Box>

      <Grid templateColumns={{ base: "1fr", md: "3fr 2fr" }} gap="8" flex="1" marginX="auto" maxWidth="1400px">
        {/* Pacientes en Atención!!! */}
        <Box
          borderRadius="xl"
          padding="6"
          backgroundColor="rgba(227, 242, 253, 0.9)"
          boxShadow="0 4px 8px rgba(0, 0, 0, 0.1)"
          overflowY="auto"
        >
          <Heading size="2xl" marginBottom="5" textAlign="center" color="#000000">
            Pacientes en Atención!!! 
          </Heading>
          {inProgressTurns.map((turn) => (
            <Box
              key={turn.id}
              padding="5"
              borderWidth="2px"
              borderRadius="md"
              marginBottom="5"
              backgroundColor="#FFFFFF"
              borderColor="#90CAF9"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
              fontSize="2xl"
            >
              <Text fontWeight="bold" flex="2" noOfLines={1}>
                {turn.patientName}
              </Text>
              <Text flex="1" textAlign="center">
                Turno: <strong>{turn.assignedTurn}</strong>
              </Text>
              <Text flex="1" textAlign="center">
                Cubículo: <strong>{turn.cubicle?.name}</strong>
              </Text>
            </Box>
          ))}
        </Box>

        {/* Pacientes en Espera */}
        <Box
          borderRadius="xl"
          padding="6"
          backgroundColor="rgba(249, 249, 249, 0.9)"
          boxShadow="0 4px 8px rgba(0, 0, 0, 0.1)"
          overflowY="auto"
        >
          <Heading size="2xl" marginBottom="5" textAlign="center" color="#000000">
            Pacientes en Espera
          </Heading>
          {pendingTurns.map((turn) => (
            <Box
              key={turn.id}
              padding="5"
              borderWidth="2px"
              borderRadius="md"
              marginBottom="5"
              backgroundColor="#FFFFFF"
              borderColor="#E0E0E0"
              display="flex"
              alignItems="center"
              width="100%"
              fontSize="2xl"
            >
              <Text fontWeight="bold" noOfLines={1} flex="3">
                {turn.patientName} Turno: {turn.assignedTurn}
              </Text>
            </Box>
          ))}
        </Box>
      </Grid>

      {/* Ventana Emergente para Llamado */}
      {callingPatient && (
        <Box
          position="fixed"
          top="10%"
          left="50%"
          transform="translate(-50%, -10%)"
          padding="8"
          borderRadius="lg"
          boxShadow="xl"
          backgroundColor="rgba(255, 255, 255, 0.9)"
          animation={`${blinkAnimation} 1s infinite`}
          color="#000000"
          textAlign="center"
          zIndex="1000"
          width="75%"
        >
          <Text fontSize="4xl" fontWeight="bold">
            Llamando a {callingPatient.patientName}
          </Text>
          <Text fontSize="3xl">Cubículo: {callingPatient.cubicle?.name}</Text>
        </Box>
      )}

      {/* Footer */}
      <Flex
        as="footer"
        padding="5"
        justifyContent="center"
        alignItems="center"
        backgroundColor="rgba(255, 255, 255, 0.9)"
        color="#424242"
        flexDirection="column"
        borderRadius="lg"
        boxShadow="0 4px 8px rgba(0, 0, 0, 0.1)"
        margin="0 auto"
        width={{ base: "90%", md: "60%" }}
        fontSize="md"
        marginTop="8"
      >
        <Text marginBottom="2" fontWeight="medium" textAlign="center">
          Instituto Nacional de Enfermedades Respiratorias Ismael Cosío Villegas (INER)
        </Text>
        <Text textAlign="center">
          Desarrollado por DT Diagnósticos by Labsis | Todos los derechos reservados © {new Date().getFullYear()}
        </Text>
      </Flex>
    </Box>
  );
}
