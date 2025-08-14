// pages/satisfaction-survey.js
import { useState } from "react";
import { 
  Box, 
  VStack, 
  HStack, 
  Heading, 
  Text, 
  Button,
  Textarea,
  useToast,
  ChakraProvider,
  extendTheme,
  Container,
  Divider,
  Icon,
  Badge,
  Center
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { FaHeart, FaThumbsUp, FaComments } from 'react-icons/fa';

// Tema similar al de queue_video para consistencia
const satisfactionTheme = extendTheme({
  colors: {
    brand: {
      500: "#1890FF",
      600: "#096DD9",
    },
    accent: {
      500: "#EB2F96",
    },
    success: "#52C41A",
    warning: "#FAAD14", 
    error: "#FF4D4F",
  },
  fonts: {
    heading: "'Poppins', 'Inter', sans-serif",
    body: "'Inter', sans-serif",
  }
});

// Animaciones
const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const bounceIn = keyframes`
  0% { opacity: 0; transform: scale(0.3); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
`;

const SatisfactionSurvey = () => {
  const [selectedRating, setSelectedRating] = useState(null);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const toast = useToast();

  const ratings = [
    {
      id: 'HAPPY',
      emoji: '😊',
      title: 'Excelente',
      description: 'Muy satisfecho con el servicio',
      color: 'success',
      bgColor: 'green.50',
      borderColor: 'green.200'
    },
    {
      id: 'NEUTRAL',
      emoji: '😐',
      title: 'Bueno',
      description: 'El servicio estuvo bien',
      color: 'warning',
      bgColor: 'orange.50',
      borderColor: 'orange.200'
    },
    {
      id: 'SAD',
      emoji: '😞',
      title: 'Regular',
      description: 'Podría mejorar',
      color: 'error',
      bgColor: 'red.50',
      borderColor: 'red.200'
    }
  ];

  const handleSubmit = async () => {
    if (!selectedRating) {
      toast({
        title: "Selecciona una calificación",
        description: "Por favor elige una opción antes de enviar",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/satisfaction-survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: selectedRating,
          comments: comments.trim() || null
        })
      });

      const result = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        toast({
          title: "¡Gracias por tu feedback! 🎉",
          description: result.message,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error(result.error || 'Error al enviar la encuesta');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error al enviar",
        description: "Hubo un problema al enviar tu calificación. Intenta de nuevo.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <ChakraProvider theme={satisfactionTheme}>
        <Box
          minH="100vh"
          background="linear-gradient(135deg, #E6F7FF 0%, #F0F9FF 50%, #FFF0F6 100%)"
          py={8}
        >
          <Container maxW="md" centerContent>
            <VStack spacing={8} animation={`${bounceIn} 0.6s ease-out`}>
              <Box textAlign="center" p={8}>
                <Text fontSize="6xl" mb={4}>🎉</Text>
                <Heading size="xl" color="brand.600" mb={4}>
                  ¡Gracias por tu opinión!
                </Heading>
                <Text fontSize="lg" color="gray.600" mb={6}>
                  Tu feedback es muy valioso para nosotros y nos ayuda a mejorar nuestros servicios.
                </Text>
                <Badge colorScheme="green" fontSize="md" px={4} py={2} borderRadius="full">
                  <Icon as={FaHeart} mr={2} />
                  Encuesta enviada con éxito
                </Badge>
              </Box>
              
              <Box p={6} bg="white" borderRadius="xl" boxShadow="lg" textAlign="center">
                <Text fontSize="sm" color="gray.500">
                  Instituto Nacional de Enfermedades Respiratorias<br />
                  Ismael Cosío Villegas (INER)
                </Text>
              </Box>
            </VStack>
          </Container>
        </Box>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider theme={satisfactionTheme}>
      <Box
        minH="100vh"
        background="linear-gradient(135deg, #E6F7FF 0%, #F0F9FF 50%, #FFF0F6 100%)"
        py={8}
      >
        <Container maxW="md" centerContent>
          <VStack spacing={8}>
            {/* Header */}
            <Box textAlign="center" p={6}>
              <Icon as={FaComments} boxSize={12} color="brand.500" mb={4} />
              <Heading size="xl" color="brand.600" mb={2}>
                ¿Cómo fue tu experiencia?
              </Heading>
              <Text fontSize="lg" color="gray.600">
                Tu opinión nos ayuda a brindarte un mejor servicio
              </Text>
            </Box>

            {/* Rating Cards */}
            <VStack spacing={4} w="100%">
              {ratings.map((rating) => (
                <Box
                  key={rating.id}
                  w="100%"
                  p={6}
                  bg={selectedRating === rating.id ? rating.bgColor : "white"}
                  borderRadius="xl"
                  border="2px solid"
                  borderColor={selectedRating === rating.id ? `${rating.color}.400` : "gray.200"}
                  cursor="pointer"
                  onClick={() => setSelectedRating(rating.id)}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                    borderColor: `${rating.color}.300`
                  }}
                  transition="all 0.2s"
                  animation={selectedRating === rating.id ? `${pulseAnimation} 0.6s ease-in-out` : "none"}
                >
                  <HStack spacing={4}>
                    <Center
                      w="60px"
                      h="60px"
                      fontSize="2xl"
                      bg={`${rating.color}.100`}
                      borderRadius="full"
                    >
                      {rating.emoji}
                    </Center>
                    <VStack align="start" flex={1} spacing={1}>
                      <Heading size="md" color={`${rating.color}.600`}>
                        {rating.title}
                      </Heading>
                      <Text color="gray.600" fontSize="sm">
                        {rating.description}
                      </Text>
                    </VStack>
                    {selectedRating === rating.id && (
                      <Icon 
                        as={FaThumbsUp} 
                        color={`${rating.color}.500`} 
                        boxSize={5}
                      />
                    )}
                  </HStack>
                </Box>
              ))}
            </VStack>

            {/* Comments Section */}
            <Box w="100%" p={6} bg="white" borderRadius="xl" boxShadow="md">
              <VStack spacing={4} align="start">
                <Heading size="md" color="gray.700">
                  Comentarios (Opcional)
                </Heading>
                <Textarea
                  placeholder="¿Algo más que te gustaría comentarnos?"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  resize="vertical"
                  minH="100px"
                  focusBorderColor="brand.400"
                />
              </VStack>
            </Box>

            {/* Submit Button */}
            <Button
              size="lg"
              colorScheme="blue"
              width="100%"
              isLoading={isSubmitting}
              loadingText="Enviando..."
              onClick={handleSubmit}
              isDisabled={!selectedRating}
              _disabled={{
                opacity: 0.4,
                cursor: "not-allowed"
              }}
            >
              Enviar mi opinión
            </Button>

            <Divider />

            {/* Footer */}
            <Box textAlign="center" p={4}>
              <Text fontSize="sm" color="gray.500">
                Instituto Nacional de Enfermedades Respiratorias<br />
                Ismael Cosío Villegas (INER)
              </Text>
            </Box>
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
};

export default SatisfactionSurvey;