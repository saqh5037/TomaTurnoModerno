import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  extendTheme,
  Heading,
  Text,
  Flex,
  Grid,
  Select,
  Switch,
  VStack,
  HStack,
  IconButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Badge,
  Divider
} from '@chakra-ui/react';
import { keyframes } from "@emotion/react";
import {
  FaUser,
  FaIdCard,
  FaPhone,
  FaFlask,
  FaClipboardList,
  FaSave,
  FaArrowLeft,
  FaUserPlus,
  FaClock,
  FaPlus,
  FaTrash,
  FaVial
} from 'react-icons/fa';
import { TUBE_TYPES } from '../../lib/tubesCatalog';

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
  console.log('[ManualTurn] ========== COMPONENT RENDER ==========');
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: '',
    contactInfo: '',
    studies: '',
    observations: '',
    clinicalInfo: '',
    tipoAtencion: 'General'
  });

  // Estado separado para tubos
  const [tubesDetails, setTubesDetails] = useState([]);

  const [currentTime, setCurrentTime] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  console.log('[ManualTurn] State - mounted:', mounted, 'isSubmitting:', isSubmitting);
  console.log('[ManualTurn] TUBE_TYPES available:', typeof TUBE_TYPES, 'length:', TUBE_TYPES?.length);

  // Efecto para marcar el componente como montado
  useEffect(() => {
    console.log('[ManualTurn] Component mounting...');
    setMounted(true);
    setCurrentTime(new Date());
    console.log('[ManualTurn] Component mounted successfully');
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

  // Agregar un nuevo tubo
  const addTube = () => {
    setTubesDetails([...tubesDetails, { type: 'sst', quantity: 1 }]);
  };

  // Eliminar un tubo
  const removeTube = (index) => {
    setTubesDetails(tubesDetails.filter((_, i) => i !== index));
  };

  // Actualizar tipo de tubo
  const updateTubeType = (index, type) => {
    const newTubes = [...tubesDetails];
    newTubes[index].type = type;
    setTubesDetails(newTubes);
  };

  // Actualizar cantidad de tubo
  const updateTubeQuantity = (index, quantity) => {
    const newTubes = [...tubesDetails];
    newTubes[index].quantity = parseInt(quantity) || 1;
    setTubesDetails(newTubes);
  };

  // Calcular total de tubos
  const getTotalTubes = () => {
    return tubesDetails.reduce((sum, tube) => sum + tube.quantity, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validar que haya al menos un tubo
      if (tubesDetails.length === 0) {
        toast({
          title: 'Error de validación',
          description: 'Debe agregar al menos un tipo de tubo',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/turns/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          studies: formData.studies.split(',').map(s => s.trim()).filter(s => s),
          age: parseInt(formData.age, 10),
          tubesDetails: tubesDetails, // Enviar el array de tubos detallado
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
          observations: '',
          clinicalInfo: '',
          tipoAtencion: 'General'
        });
        setTubesDetails([]);
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
    console.log('[ManualTurn] Waiting for mount...');
    return (
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
    );
  }

  console.log('[ManualTurn] Rendering main form. TUBE_TYPES length:', TUBE_TYPES?.length);

  return (
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
                          <option value="M">Masculino</option>
                          <option value="F">Femenino</option>
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

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="semibold" color="secondary.700">
                        Observaciones Adicionales
                      </FormLabel>
                      <Textarea
                        name="observations"
                        value={formData.observations}
                        onChange={handleChange}
                        placeholder="Paciente en ayunas, alergias, etc..."
                        size="sm"
                        rows={2}
                      />
                    </FormControl>
                  </VStack>
                </Box>
              </Grid>

              {/* Sección de Tubos - Ancho completo */}
              <Box mt={4}>
                <Divider my={4} />
                <Heading size="md" color="secondary.800" mb={4} display="flex" alignItems="center" gap={2}>
                  <Box as={FaVial} color="purple.500" />
                  Tubos Requeridos
                  <Badge colorScheme="purple" fontSize="md" ml={2}>
                    Total: {getTotalTubes()} tubos
                  </Badge>
                </Heading>

                <VStack spacing={3} align="stretch">
                  {tubesDetails.map((tube, index) => {
                    const tubeInfo = TUBE_TYPES.find(t => t.id === tube.type);
                    return (
                      <Flex key={index} gap={3} align="center" p={3} background="rgba(255, 255, 255, 0.4)" borderRadius="lg">
                        <Box
                          w="20px"
                          h="20px"
                          borderRadius="full"
                          bg={tubeInfo?.colorHex}
                          border="2px solid white"
                          boxShadow="md"
                        />
                        <FormControl flex="2">
                          <Select
                            value={tube.type}
                            onChange={(e) => updateTubeType(index, e.target.value)}
                            size="sm"
                            variant="modern"
                          >
                            {TUBE_TYPES.map(t => (
                              <option key={t.id} value={t.id}>
                                {t.color} - {t.name}
                              </option>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl flex="1">
                          <NumberInput
                            value={tube.quantity}
                            onChange={(value) => updateTubeQuantity(index, value)}
                            min={1}
                            max={10}
                            size="sm"
                          >
                            <NumberInputField placeholder="Cantidad" />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                        <IconButton
                          icon={<FaTrash />}
                          onClick={() => removeTube(index)}
                          colorScheme="red"
                          variant="ghost"
                          size="sm"
                          aria-label="Eliminar tubo"
                        />
                      </Flex>
                    );
                  })}

                  <Button
                    leftIcon={<FaPlus />}
                    onClick={addTube}
                    variant="outline"
                    colorScheme="purple"
                    size="sm"
                  >
                    Agregar Tubo
                  </Button>
                </VStack>
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
  );
}
