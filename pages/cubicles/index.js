import { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  VStack, 
  Text, 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  Checkbox, 
  useToast,
  ChakraProvider,
  extendTheme,
  Flex,
  Grid,
  HStack,
  IconButton,
  Badge,
  Switch,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { keyframes } from "@emotion/react";
import { 
  FaHospital, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSave, 
  FaTimes,
  FaArrowLeft,
  FaHome,
  FaCog,
  FaCheck,
  FaWheelchair
} from 'react-icons/fa';

// Tema personalizado (mismo que las otras pantallas)
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

export default function CubicleManagement() {
  const [cubicles, setCubicles] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [isSpecial, setIsSpecial] = useState(false);
  const [editingCubicleId, setEditingCubicleId] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

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

  const fetchCubicles = async () => {
    try {
      const response = await fetch('/api/cubicles');
      const data = await response.json();
      setCubicles(data);
    } catch (error) {
      console.error("Error al obtener los cubículos:", error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los cubículos.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchCubicles();
    }
  }, [mounted]);

  const handleCreateCubicle = async () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre del cubículo es requerido.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/cubicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), isSpecial }),
      });

      if (response.ok) {
        const newCubicle = await response.json();
        setCubicles([...cubicles, newCubicle]);
        setName('');
        setIsSpecial(false);
        setShowCreateForm(false);
        onClose();
        toast({
          title: 'Cubículo creado exitosamente',
          description: `El cubículo "${newCubicle.name}" ha sido creado.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo crear el cubículo.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      }
    } catch (error) {
      console.error("Error al crear el cubículo:", error);
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCubicle = async () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre del cubículo es requerido.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/cubicles/${editingCubicleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), isSpecial }),
      });

      if (response.ok) {
        const updatedCubicle = await response.json();
        setCubicles(cubicles.map(cubicle => (cubicle.id === editingCubicleId ? updatedCubicle : cubicle)));
        setName('');
        setIsSpecial(false);
        setEditingCubicleId(null);
        setShowCreateForm(false);
        onClose();
        toast({
          title: 'Cubículo actualizado',
          description: `El cubículo "${updatedCubicle.name}" ha sido actualizado.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo actualizar el cubículo.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      }
    } catch (error) {
      console.error("Error al actualizar el cubículo:", error);
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCubicle = async (id, name) => {
    if (!confirm(`¿Está seguro de eliminar el cubículo "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/cubicles/${id}`, { method: 'DELETE' });

      if (response.ok) {
        setCubicles(cubicles.filter(cubicle => cubicle.id !== id));
        toast({
          title: 'Cubículo eliminado',
          description: `El cubículo "${name}" ha sido eliminado.`,
          status: 'info',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el cubículo.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      }
    } catch (error) {
      console.error("Error al eliminar el cubículo:", error);
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  const openForm = (cubicle = null) => {
    if (cubicle) {
      setName(cubicle.name);
      setIsSpecial(cubicle.isSpecial);
      setEditingCubicleId(cubicle.id);
    } else {
      setName('');
      setIsSpecial(false);
      setEditingCubicleId(null);
    }
    setShowCreateForm(true);
    onOpen();
  };

  const closeForm = () => {
    setName('');
    setIsSpecial(false);
    setEditingCubicleId(null);
    setShowCreateForm(false);
    onClose();
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
              Cargando gestión de cubículos...
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
        {/* Header Principal */}
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
                Gestión de Cubículos
              </Heading>
              <Text
                fontSize="lg"
                color="secondary.600"
                fontWeight="medium"
                mt={1}
              >
                Administración de Espacios de Atención
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

        {/* Panel de Control */}
        <Box
          p={4}
          background="rgba(255, 255, 255, 0.25)"
          backdropFilter="blur(20px)"
          borderRadius="2xl"
          boxShadow="glass"
          border="1px solid rgba(255, 255, 255, 0.18)"
          mb={4}
          animation={`${slideInLeft} 1s ease-out`}
        >
          <Flex align="center" gap={4} justify="space-between">
            <Button
              leftIcon={<FaArrowLeft />}
              onClick={goBack}
              variant="outline"
              colorScheme="gray"
              size="sm"
            >
              Volver
            </Button>

            <HStack spacing={4}>
              <Box textAlign="center">
                <Text fontSize="xs" color="secondary.600">Total</Text>
                <Text fontSize="lg" fontWeight="bold" color="primary.600">{cubicles.length}</Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="xs" color="secondary.600">Especiales</Text>
                <Text fontSize="lg" fontWeight="bold" color="error">{cubicles.filter(c => c.isSpecial).length}</Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="xs" color="secondary.600">Generales</Text>
                <Text fontSize="lg" fontWeight="bold" color="success">{cubicles.filter(c => !c.isSpecial).length}</Text>
              </Box>
            </HStack>

            <Button
              leftIcon={<FaPlus />}
              onClick={() => openForm()}
              background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
              color="white"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'xl',
              }}
              size="sm"
            >
              Nuevo Cubículo
            </Button>
          </Flex>
        </Box>

        {/* Lista de Cubículos */}
        <Box
          flex="1"
          borderRadius="2xl"
          p={4}
          background="rgba(255, 255, 255, 0.25)"
          backdropFilter="blur(20px)"
          boxShadow="glass"
          border="1px solid rgba(255, 255, 255, 0.18)"
          overflowY="auto"
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
            background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
            borderTopRadius="2xl"
          />

          <Flex align="center" justify="space-between" mb={4}>
            <Heading 
              size="lg" 
              color="secondary.800" 
              fontWeight="bold"
              display="flex"
              alignItems="center"
              gap={2}
            >
              <Box as={FaHospital} color="primary.500" />
              Cubículos Registrados
            </Heading>
          </Flex>

          {cubicles.length === 0 ? (
            <Box
              textAlign="center"
              py={12}
              color="secondary.500"
            >
              <Box as={FaHome} fontSize="4xl" mb={4} />
              <Text fontSize="lg" mb={2}>No hay cubículos registrados</Text>
              <Text fontSize="md" color="secondary.400">
                Cree el primer cubículo para comenzar
              </Text>
            </Box>
          ) : (
            <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
              {cubicles.map((cubicle, index) => (
                <Box
                  key={cubicle.id}
                  p={4}
                  background="rgba(255, 255, 255, 0.7)"
                  backdropFilter="blur(10px)"
                  borderRadius="xl"
                  border="1px solid rgba(255, 255, 255, 0.3)"
                  borderLeft="6px solid"
                  borderLeftColor={cubicle.isSpecial ? "error" : "success"}
                  boxShadow="md"
                  transition="all 0.3s ease"
                  _hover={{ 
                    transform: 'translateY(-4px)', 
                    boxShadow: 'xl' 
                  }}
                  animation={`${fadeInUp} ${0.3 + index * 0.1}s ease-out`}
                >
                  <Flex align="center" justify="space-between" mb={3}>
                    <Box
                      w={12}
                      h={12}
                      borderRadius="xl"
                      background={cubicle.isSpecial 
                        ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                        : "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                      }
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="white"
                      fontWeight="bold"
                      fontSize="lg"
                    >
                      <Box as={cubicle.isSpecial ? FaWheelchair : FaHome} />
                    </Box>
                    
                    <Badge 
                      colorScheme={cubicle.isSpecial ? "red" : "green"}
                      fontSize="xs"
                      px={2}
                      py={1}
                      borderRadius="lg"
                    >
                      {cubicle.isSpecial ? "Especial" : "General"}
                    </Badge>
                  </Flex>

                  <Box mb={4}>
                    <Text 
                      fontWeight="bold" 
                      fontSize="xl" 
                      color="secondary.800"
                      mb={2}
                    >
                      {cubicle.name}
                    </Text>
                    <Text color="secondary.600" fontSize="sm">
                      <strong>Tipo:</strong> {cubicle.isSpecial ? "Atención Especializada" : "Atención General"}
                    </Text>
                    <Text color="secondary.600" fontSize="sm">
                      <strong>ID:</strong> #{cubicle.id}
                    </Text>
                  </Box>

                  <HStack spacing={2} justify="flex-end">
                    <IconButton
                      icon={<FaEdit />}
                      colorScheme="yellow"
                      size="sm"
                      aria-label="Editar"
                      onClick={() => openForm(cubicle)}
                      borderRadius="lg"
                      _hover={{
                        transform: 'scale(1.1)',
                      }}
                    />
                    <IconButton
                      icon={<FaTrash />}
                      colorScheme="red"
                      size="sm"
                      aria-label="Eliminar"
                      onClick={() => handleDeleteCubicle(cubicle.id, cubicle.name)}
                      borderRadius="lg"
                      _hover={{
                        transform: 'scale(1.1)',
                      }}
                    />
                  </HStack>
                </Box>
              ))}
            </Grid>
          )}
        </Box>

        {/* Modal de Creación/Edición */}
        <Modal isOpen={isOpen} onClose={closeForm} size="md">
          <ModalOverlay backdropFilter="blur(10px)" />
          <ModalContent 
            background="rgba(255, 255, 255, 0.95)"
            backdropFilter="blur(20px)"
            borderRadius="2xl"
            border="1px solid rgba(255, 255, 255, 0.3)"
          >
            <ModalHeader>
              <Flex align="center" gap={2}>
                <Box as={FaCog} color="primary.500" />
                {editingCubicleId ? 'Editar Cubículo' : 'Crear Nuevo Cubículo'}
              </Flex>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold" color="secondary.700">
                    <Flex align="center" gap={2}>
                      <Box as={FaHome} />
                      Nombre del Cubículo
                    </Flex>
                  </FormLabel>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Cubículo 1, Sala A, etc."
                    size="md"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold" color="secondary.700" mb={3}>
                    <Flex align="center" gap={2}>
                      <Box as={FaWheelchair} />
                      Tipo de Cubículo
                    </Flex>
                  </FormLabel>
                  <Flex 
                    align="center" 
                    justify="space-between"
                    p={3}
                    background={isSpecial ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)"}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor={isSpecial ? "red.200" : "green.200"}
                  >
                    <Box>
                      <Text fontWeight="semibold" color="secondary.800">
                        {isSpecial ? "Cubículo Especial" : "Cubículo General"}
                      </Text>
                      <Text fontSize="sm" color="secondary.600">
                        {isSpecial 
                          ? "Para pacientes prioritarios y atención especializada" 
                          : "Para atención médica general y rutinaria"
                        }
                      </Text>
                    </Box>
                    <Switch
                      colorScheme={isSpecial ? "red" : "green"}
                      isChecked={isSpecial}
                      onChange={(e) => setIsSpecial(e.target.checked)}
                      size="lg"
                    />
                  </Flex>
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <HStack spacing={3}>
                <Button 
                  variant="outline" 
                  onClick={closeForm}
                  leftIcon={<FaTimes />}
                >
                  Cancelar
                </Button>
                <Button
                  background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
                  color="white"
                  onClick={editingCubicleId ? handleEditCubicle : handleCreateCubicle}
                  leftIcon={<FaSave />}
                  isLoading={isSubmitting}
                  loadingText={editingCubicleId ? "Actualizando..." : "Creando..."}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'xl',
                  }}
                >
                  {editingCubicleId ? 'Actualizar' : 'Crear'}
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

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