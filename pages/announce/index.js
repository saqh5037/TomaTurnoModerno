import { useState } from "react";
import { Box, Heading, FormControl, FormLabel, Input, Button, VStack, useToast } from "@chakra-ui/react";

export default function AnnouncePage() {
  const [patientName, setPatientName] = useState("");
  const [cubicle, setCubicle] = useState("");
  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "patientName") setPatientName(value);
    if (name === "cubicle") setCubicle(value);
  };

  const playAirportSound = () => {
    const audio = new Audio('/airport-sound.mp3');
    audio.play();
    audio.onended = speakAnnouncement;
  };

  const speakAnnouncement = () => {
    if (!patientName || !cubicle) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, ingresa el nombre del paciente y el número de cubículo.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const message = new SpeechSynthesisUtterance(`Paciente ${patientName}, favor de pasar al cubículo ${cubicle}`);
    message.lang = 'es-ES';
    message.rate = 0.9;
    window.speechSynthesis.speak(message);

    toast({
      title: "Paciente llamado",
      description: `Se ha llamado a ${patientName} para el cubículo ${cubicle}.`,
      status: "success",
      duration: 5000,
      isClosable: true,
    });

    setPatientName("");
    setCubicle("");
  };

  return (
    <Box maxW="md" mx="auto" mt={10} p={6} borderRadius="md" boxShadow="lg" bg="white">
      <Heading as="h2" size="lg" textAlign="center" mb={6} color="teal.600">
        Prueba de Anuncio de Paciente
      </Heading>
      <VStack spacing={4}>
        <FormControl id="patientName" isRequired>
          <FormLabel>Nombre del Paciente</FormLabel>
          <Input
            type="text"
            name="patientName"
            value={patientName}
            onChange={handleInputChange}
            placeholder="Ej. Samuel Quiroz"
            focusBorderColor="teal.500"
          />
        </FormControl>
        <FormControl id="cubicle" isRequired>
          <FormLabel>Número de Cubículo</FormLabel>
          <Input
            type="number"
            name="cubicle"
            value={cubicle}
            onChange={handleInputChange}
            placeholder="Ej. 2"
            focusBorderColor="teal.500"
          />
        </FormControl>
        <Button
          colorScheme="teal"
          width="full"
          onClick={playAirportSound} // Llama primero al sonido y luego a la voz
          _hover={{ bg: "teal.600" }}
        >
          Llamar Paciente
        </Button>
      </VStack>
    </Box>
  );
}
