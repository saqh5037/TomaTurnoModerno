import { useState, useEffect, memo } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  VStack, 
  HStack,
  Button,
  ChakraProvider,
  Spinner,
  Flex
} from '@chakra-ui/react';
import { 
  FaHeart,
  FaHome,
  FaStethoscope,
  FaMedal,
  FaHandsHelping,
  FaClock,
  FaUsers,
  FaSignOutAlt,
  FaUserMd,
  FaChartBar
} from 'react-icons/fa';
import { modernTheme, fadeInUp, slideInFromLeft, slideInFromRight, GlassCard, ModernContainer } from '../components/theme/ModernTheme';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

const HomePage = memo(function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(null);
  const router = useRouter();
  const { userRole, logout } = useAuth();

  // Effect para marcar el componente como montado
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

  // Redirigir al login si no está autenticado
  useEffect(() => {
    if (mounted && !userRole) {
      router.push('/login');
    }
  }, [mounted, userRole, router]);

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

  const handleNavigation = (path) => {
    router.push(path);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // No renderizar hasta que esté montado para evitar errores de hidratación
  if (!mounted || !userRole) {
    return (
      <ChakraProvider theme={modernTheme}>
        <ModernContainer>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
          >
            <GlassCard p={8} textAlign="center">
              <Spinner size="xl" color="primary.500" thickness="4px" mb={4} />
              <Text fontSize="xl" color="secondary.600">
                Verificando autenticación...
              </Text>
            </GlassCard>
          </Box>
        </ModernContainer>
      </ChakraProvider>
    );
  }

  // Configurar módulos según el rol
  const isAdmin = userRole === 'Administrador';
  const isFlebotomista = userRole === 'Flebotomista';

  return (
    <ChakraProvider theme={modernTheme}>
      <ModernContainer>
        {/* Header Principal con Glassmorphism */}
        <Box
          p={6}
          background="rgba(255, 255, 255, 0.25)"
          backdropFilter="blur(20px)"
          borderRadius="2xl"
          boxShadow="glass"
          border="1px solid rgba(255, 255, 255, 0.18)"
          mb={8}
          width="100%"
          animation={`${fadeInUp} 0.8s ease-out`}
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Box flex="1" textAlign="center">
              <Heading 
                fontSize={{ base: "3xl", md: "5xl" }}
                fontWeight="extrabold"
                background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
                backgroundClip="text"
                color="transparent"
                letterSpacing="-0.02em"
                lineHeight="1"
                mb={2}
              >
                ¡Bienvenido al Sistema!
              </Heading>
              <Text
                fontSize={{ base: "lg", md: "xl" }}
                color="secondary.600"
                fontWeight="medium"
              >
                TomaTurno - INER | {isAdmin ? '👨‍💼 Administrador' : '👩‍⚕️ Flebotomista'}
              </Text>
            </Box>
            <VStack spacing={2} align="stretch">
              <Box
                p={3}
                background="rgba(255, 255, 255, 0.4)"
                borderRadius="lg"
                border="1px solid rgba(255, 255, 255, 0.3)"
                minW="250px"
              >
                <Text
                  fontSize="sm"
                  color="secondary.800"
                  fontWeight="bold"
                  textAlign="center"
                >
                  {currentTime ? formatTime(currentTime) : "Cargando hora..."}
                </Text>
              </Box>
              <Button
                leftIcon={<FaSignOutAlt />}
                size="sm"
                variant="outline"
                onClick={handleLogout}
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: 'md'
                }}
              >
                Cerrar Sesión
              </Button>
            </VStack>
          </Flex>
        </Box>

        {/* Contenido Principal */}
        <VStack spacing={8} align="stretch">
          {/* Mensaje de Bienvenida Compacto */}
          <GlassCard p={6} textAlign="center" animation={`${slideInFromLeft} 1s ease-out`}>
            <Heading 
              size="lg" 
              color="secondary.800" 
              mb={2}
              fontWeight="bold"
            >
              Sistema de Gestión de Turnos - INER
            </Heading>
            
            <Text 
              fontSize="md" 
              color="secondary.600" 
              maxW="400px"
              mx="auto"
            >
              Selecciona la opción que necesitas para continuar
            </Text>
          </GlassCard>

          {/* Cards de Navegación - Opciones Principales */}
          <Flex 
            wrap="wrap" 
            gap={8} 
            justify="center"
            align="stretch"
          >
            {/* Cola de Turnos - Solo para Administrador */}
            {isAdmin && (
              <GlassCard 
                p={8}
                minW="280px"
                maxW="340px"
                flex="1"
                cursor="pointer"
                onClick={() => handleNavigation('/turns/queue')}
                _hover={{
                  transform: 'translateY(-10px)',
                  boxShadow: '2xl',
                  background: "rgba(255, 255, 255, 0.4)"
                }}
                transition="all 0.3s ease"
                animation={`${fadeInUp} 1.2s ease-out`}
                position="relative"
                overflow="hidden"
                border="2px solid rgba(79, 125, 243, 0.2)"
              >
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  height="5px"
                  background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
                  borderTopRadius="2xl"
                />
                
                <VStack spacing={6} align="center">
                  <Box
                    w={16}
                    h={16}
                    borderRadius="2xl"
                    background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontSize="3xl"
                    boxShadow="xl"
                  >
                    <FaClock />
                  </Box>
                  
                  <VStack spacing={3} textAlign="center">
                    <Text fontWeight="bold" fontSize="xl" color="secondary.800">
                      Cola de Turnos
                    </Text>
                    <Text fontSize="md" color="secondary.600">
                      Visualiza la cola de pacientes en tiempo real
                    </Text>
                  </VStack>
                </VStack>
              </GlassCard>
            )}

            {/* Panel de Atención - Solo para Flebotomistas y Admins */}
            {(isFlebotomista || isAdmin) && (
              <GlassCard 
                p={8}
                minW="280px"
                maxW="340px"
                flex="1"
                cursor="pointer"
                onClick={() => handleNavigation('/turns/attention')}
                _hover={{
                  transform: 'translateY(-10px)',
                  boxShadow: '2xl',
                  background: "rgba(255, 255, 255, 0.4)"
                }}
                transition="all 0.3s ease"
                animation={`${fadeInUp} 1.4s ease-out`}
                position="relative"
                overflow="hidden"
                border="2px solid rgba(16, 185, 129, 0.2)"
              >
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  height="5px"
                  background="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                  borderTopRadius="2xl"
                />
                
                <VStack spacing={6} align="center">
                  <Box
                    w={16}
                    h={16}
                    borderRadius="2xl"
                    background="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontSize="3xl"
                    boxShadow="xl"
                  >
                    <FaStethoscope />
                  </Box>
                  
                  <VStack spacing={3} textAlign="center">
                    <Text fontWeight="bold" fontSize="xl" color="secondary.800">
                      Panel de Atención
                    </Text>
                    <Text fontSize="md" color="secondary.600">
                      Herramientas para atender pacientes
                    </Text>
                  </VStack>
                </VStack>
              </GlassCard>
            )}

            {/* Estadísticas - Disponible para todos */}
            <GlassCard 
              p={8}
              minW="280px"
              maxW="340px"
              flex="1"
              cursor="pointer"
              onClick={() => handleNavigation('/statistics')}
              _hover={{
                transform: 'translateY(-10px)',
                boxShadow: '2xl',
                background: "rgba(255, 255, 255, 0.4)"
              }}
              transition="all 0.3s ease"
              animation={`${fadeInUp} 1.6s ease-out`}
              position="relative"
              overflow="hidden"
              border="2px solid rgba(245, 158, 11, 0.2)"
            >
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                height="5px"
                background="linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
                borderTopRadius="2xl"
              />
              
              <VStack spacing={6} align="center">
                <Box
                  w={16}
                  h={16}
                  borderRadius="2xl"
                  background="linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  fontSize="3xl"
                  boxShadow="xl"
                >
                  <FaChartBar />
                </Box>
                
                <VStack spacing={3} textAlign="center">
                  <Text fontWeight="bold" fontSize="xl" color="secondary.800">
                    Estadísticas
                  </Text>
                  <Text fontSize="md" color="secondary.600">
                    {isAdmin ? 'Métricas completas del sistema' : 'Análisis de rendimiento y tiempos'}
                  </Text>
                </VStack>
              </VStack>
            </GlassCard>

          </Flex>

          {/* Acciones Secundarias - Solo para Administradores */}
          {isAdmin && (
            <GlassCard p={6} animation={`${fadeInUp} 1.8s ease-out`}>
              <VStack spacing={4}>
                <Text fontWeight="bold" fontSize="lg" color="secondary.800" textAlign="center">
                  Administración
                </Text>
                <Flex gap={4} justify="center" wrap="wrap">
                  <Button
                    leftIcon={<FaUserMd />}
                    variant="outline"
                    size="md"
                    onClick={() => handleNavigation('/turns/manual')}
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'md'
                    }}
                  >
                    Crear Turno
                  </Button>
                  <Button
                    leftIcon={<FaUsers />}
                    variant="outline"
                    size="md"
                    onClick={() => handleNavigation('/users')}
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'md'
                    }}
                  >
                    Usuarios
                  </Button>
                  <Button
                    leftIcon={<FaHome />}
                    variant="outline"
                    size="md"
                    onClick={() => handleNavigation('/cubicles')}
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'md'
                    }}
                  >
                    Cubículos
                  </Button>
                </Flex>
              </VStack>
            </GlassCard>
          )}

        </VStack>

        {/* Footer */}
        <Box
          as="footer"
          p={4}
          textAlign="center"
          background="rgba(255, 255, 255, 0.25)"
          backdropFilter="blur(20px)"
          color="secondary.600"
          borderRadius="lg"
          fontSize="sm"
          mt={8}
          animation={`${fadeInUp} 2s ease-out`}
        >
          <Text>
            Instituto Nacional de Enfermedades Respiratorias Ismael Cosío Villegas (INER) | 
            Desarrollado por DT Diagnósticos by Labsis © {new Date().getFullYear()}
          </Text>
        </Box>
      </ModernContainer>
    </ChakraProvider>
  );
});

export default HomePage;
