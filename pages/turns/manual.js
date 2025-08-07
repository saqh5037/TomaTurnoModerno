import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  Textarea, 
  useToast, 
  ChakraProvider, 
  extendTheme,
  Heading,
  Text,
  Flex,
  Grid,
  Select,
  Switch,
  VStack,
  HStack,
  IconButton
} from '@chakra-ui/react';
import { keyframes } from "@emotion/react";
import { 
  FaUser, 
  FaIdCard, 
  FaPhone, 
  FaFlask, 
  FaClipboardList, 
  FaNotes,
  FaSave,
  FaArrowLeft,
  FaUserPlus,
  FaClock
} from 'react-icons/fa';

// Tema personalizado (mismo que la cola)
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
    Input: {
      variants: {
        modern: {
          field: {
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: 'lg',
            _focus: {
              borderColor: 'primary.500',
              boxShadow: '0 0 0 3px rgba(79, 125, 243, 0.1)',
              background: 'rgba(255, 255, 255, 0.9)',
            },
            _hover: {
              borderColor: 'primary.300',
            },
          },
        },
      },
      defaultProps: {
        variant: 'modern',
      },
    },
    Textarea: {
      variants: {
        modern: {
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: 'lg',
          _focus: {
            borderColor: 'primary.500',
            boxShadow: '0 0 0 3px rgba(79, 125, 243, 0.1)',
            background: 'rgba(255, 255, 255, 0.9)',
          },
          _hover: {
            borderColor: 'primary.300',
          },
        },
      },
      defaultProps: {
        variant: 'modern',
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

export default function ManualTurnAssignment() {
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: '',
    contactInfo: '',
    studies: '',
    tubesRequired: '',
    observations: '',
    clinicalInfo: '',
    tipoAtencion: 'General'
  });
  const [currentTime, setCurrentTime] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Efecto para manejar la hidratación
  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSpecialToggle = (isChecked) => {
    setFormData({ 
      ...formData, 
      tipoAtencion: isChecked ? 'Special' : 'General' 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/turns/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          studies: formData.studies.split(',').map(s => s.trim()).filter(s => s), // Limpiar estudios
          tubesRequired: parseInt(formData.tubesRequired, 10),
          age: parseInt(formData.age, 10),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: 'Turno asignado exitosamente',
          description: `Número de turno: #${data.assignedTurn}`,
          status: 'success',
          duration: 7000,
          isClosable: true,
          position: 'top',
        });
        
        // Resetear formulario
        setFormData({
          patientName: '',
          age: '',
          gender: '',
          contactInfo: '',
          studies: '',
          tubesRequired: '',
          observations: '',
          clinicalInfo: '',
          tipoAtencion: 'General'
        });
      } else {
        toast({
          title: 'Error al crear turno',
          description: data.error || 'No se pudo asignar el turno.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      }
    } catch (error) {
      console.error("Error en el envío del formulario:", error);
      toast({
        title: 'Error de conexión',
        description: 'Ocurrió un error al enviar el formulario.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsSubmitting(false);
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
              Cargando formulario...
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
        {/* Header Principal - Mismo estilo que la cola */}
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
                Crear Turno Manual
              </Heading>
              <Text
                fontSize="lg"
                color="secondary.600"
                fontWeight="medium"
                mt={1}
              >
                Registro de Nuevo Paciente
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

        {/* Contenido Principal */}
        <Flex gap={4} flex="1" height="calc(100vh - 200px)">
          {/* Formulario Principal */}
          <Box
            flex="2"
            borderRadius="2xl"
            p={6}
            background="rgba(255, 255, 255, 0.25)"
            backdropFilter="blur(20px)"
            boxShadow="glass"
            border="1px solid rgba(255, 255, 255, 0.18)"
            overflowY="auto"
            animation={`${slideInLeft} 1s ease-out`}
            position="relative"
          >
            {/* Gradient line */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              height="3px"
              background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
              borderTopRadius="2xl"
            />

            <form onSubmit={handleSubmit}>
              <Grid templateColumns="1fr 1fr" gap={4}>
                {/* Información Personal */}
                <Box>
                  <Heading size="md" color="secondary.800" mb={4} display="flex" alignItems="center" gap={2}>
                    <Box as={FaUser} color="primary.500" />
                    Información Personal
                  </Heading>
                  
                  <VStack spacing={3}>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="semibold" color="secondary.700">
                        <Flex align="center" gap={2}>
                          <Box as={FaIdCard} />
                          Nombre del Paciente
                        </Flex>
                      </FormLabel>
                      <Input 
                        name="patientName" 
                        value={formData.patientName} 
                        onChange={handleChange}
                        placeholder="Ingrese el nombre completo"
                        size="sm"
                      />
                    </FormControl>

                    <HStack spacing={3} width="100%">
                      <FormControl isRequired>
                        <FormLabel fontSize="sm" fontWeight="semibold" color="secondary.700">
                          Edad
                        </FormLabel>
                        <Input 
                          type="number" 
                          name="age" 
                          value={formData.age} 
                          onChange={handleChange}
                          placeholder="Años"
                          size="sm"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontSize="sm" fontWeight="semibold" color="secondary.700">
                          Género
                        </FormLabel>
                        <Select 
                          name="gender" 
                          value={formData.gender} 
                          onChange={handleChange}
                          placeholder="Seleccionar"
                          size="sm"
                          variant="modern"
                        >
                          <option value="Masculino">Masculino</option>
                          <option value="Femenino">Femenino</option>
                          <option value="Otro">Otro</option>
                        </Select>
                      </FormControl>
                    </HStack>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="semibold" color="secondary.700">
                        <Flex align="center" gap={2}>
                          <Box as={FaPhone} />
                          Información de Contacto
                        </Flex>
                      </FormLabel>
                      <Input 
                        name="contactInfo" 
                        value={formData.contactInfo} 
                        onChange={handleChange}
                        placeholder="Teléfono, email, etc."
                        size="sm"
                      />
                    </FormControl>
                  </VStack>
                </Box>

                {/* Información Médica */}
                <Box>
                  <Heading size="md" color="secondary.800" mb={4} display="flex" alignItems="center" gap={2}>
                    <Box as={FaFlask} color="success" />
                    Información Médica
                  </Heading>
                  
                  <VStack spacing={3}>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="semibold" color="secondary.700">
                        <Flex align="center" gap={2}>
                          <Box as={FaClipboardList} />
                          Estudios Solicitados
                        </Flex>
                      </FormLabel>
                      <Textarea 
                        name="studies" 
                        value={formData.studies} 
                        onChange={handleChange}
                        placeholder="Separe los estudios con comas (ej: Hemoglobina, Glucosa, Colesterol)"
                        size="sm"
                        rows={3}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="semibold" color="secondary.700">
                        Tubos Requeridos
                      </FormLabel>
                      <Input 
                        type="number" 
                        name="tubesRequired" 
                        value={formData.tubesRequired} 
                        onChange={handleChange}
                        placeholder="Número de tubos"
                        min="1"
                        size="sm"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="semibold" color="secondary.700">
                        Información Clínica
                      </FormLabel>
                      <Textarea 
                        name="clinicalInfo" 
                        value={formData.clinicalInfo} 
                        onChange={handleChange}
                        placeholder="Diagnóstico, medicamentos, condiciones especiales..."
                        size="sm"
                        rows={3}
                      />
                    </FormControl>
                  </VStack>
                </Box>
              </Grid>

              {/* Observaciones - Ancho completo */}
              <Box mt={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold" color="secondary.700">
                    <Flex align="center" gap={2}>
                      <Box as={FaNotes} />
                      Observaciones Adicionales
                    </Flex>
                  </FormLabel>
                  <Textarea 
                    name="observations" 
                    value={formData.observations} 
                    onChange={handleChange}
                    placeholder="Cualquier observación adicional relevante..."
                    size="sm"
                    rows={2}
                  />
                </FormControl>
              </Box>

              {/* Tipo de Atención */}
              <Box mt={4} p={3} background="rgba(255, 255, 255, 0.3)" borderRadius="lg">
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel fontSize="sm" fontWeight="semibold" color="secondary.700" mb={0}>
                    <Flex align="center" gap={2}>
                      <Box as={FaClock} color={formData.tipoAtencion === 'Special' ? 'error' : 'warning'} />
                      Atención Prioritaria (Pacientes especiales)
                    </Flex>
                  </FormLabel>
                  <Switch
                    colorScheme="red"
                    isChecked={formData.tipoAtencion === 'Special'}
                    onChange={(e) => handleSpecialToggle(e.target.checked)}
                  />
                </FormControl>
              </Box>

              {/* Botones de Acción */}
              <HStack spacing={3} mt={6} justify="center">
                <IconButton
                  icon={<FaArrowLeft />}
                  onClick={goBack}
                  variant="outline"
                  colorScheme="gray"
                  size="lg"
                  aria-label="Volver"
                />
                <Button
                  type="submit"
                  size="lg"
                  px={8}
                  background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
                  color="white"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'xl',
                  }}
                  isLoading={isSubmitting}
                  loadingText="Creando turno..."
                  leftIcon={<FaSave />}
                >
                  Asignar Turno
                </Button>
              </HStack>
            </form>
          </Box>

          {/* Panel de Información */}
          <Box
            flex="1"
            borderRadius="2xl"
            p={4}
            background="rgba(255, 255, 255, 0.25)"
            backdropFilter="blur(20px)"
            boxShadow="glass"
            border="1px solid rgba(255, 255, 255, 0.18)"
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

            <Heading size="md" color="secondary.800" mb={4} display="flex" alignItems="center" gap={2}>
              <Box as={FaUserPlus} color="success" />
              Información del Sistema
            </Heading>

            <VStack spacing={3} align="stretch">
              <Box p={3} background="rgba(255, 255, 255, 0.4)" borderRadius="lg">
                <Text fontSize="sm" color="secondary.600" mb={1}>Próximo turno disponible</Text>
                <Text fontSize="lg" fontWeight="bold" color="primary.600">#---</Text>
              </Box>

              <Box p={3} background="rgba(255, 255, 255, 0.4)" borderRadius="lg">
                <Text fontSize="sm" color="secondary.600" mb={1}>Turnos creados hoy</Text>
                <Text fontSize="lg" fontWeight="bold" color="success">--</Text>
              </Box>

              <Box p={3} background="rgba(255, 255, 255, 0.4)" borderRadius="lg">
                <Text fontSize="sm" color="secondary.600" mb={1}>Tiempo estimado</Text>
                <Text fontSize="lg" fontWeight="bold" color="warning">-- min</Text>
              </Box>

              <Box mt={4} p={3} background="rgba(79, 125, 243, 0.1)" borderRadius="lg" border="1px solid rgba(79, 125, 243, 0.2)">
                <Text fontSize="xs" color="primary.700" textAlign="center">
                  💡 <strong>Tip:</strong> Los pacientes prioritarios se atienden antes que los regulares
                </Text>
              </Box>
            </VStack>
          </Box>
        </Flex>

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