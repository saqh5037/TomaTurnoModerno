import { useState, useEffect, useCallback, memo } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  Flex,
  useToast,
  Spinner
} from '@chakra-ui/react';
import {
  FaClock,
  FaUsers,
  FaSignOutAlt,
  FaUserMd,
  FaChartBar,
  FaUserCircle,
  FaBook,
  FaHome,
  FaStethoscope,
  FaCog,
  FaClipboardList
} from 'react-icons/fa';
import { fadeInUp, slideInFromLeft, GlassCard, ModernContainer } from '../components/theme/ModernTheme';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

const HomePage = memo(function HomePage() {
  console.log('[HomePage] ========== COMPONENT RENDER ==========');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();
  const toast = useToast();
  const userRole = user?.role;

  console.log('[HomePage] User:', user?.name, 'Role:', userRole, 'isNavigating:', isNavigating);

  // Actualizar hora cada segundo
  useEffect(() => {
    console.log('[HomePage] useEffect - Setting up time interval');
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => {
      console.log('[HomePage] useEffect - Cleaning up time interval');
      clearInterval(timeInterval);
    };
  }, []);

  // Reset isNavigating when route changes (Next.js 15 navigation detection)
  useEffect(() => {
    console.log(`[HomePage] useEffect - Route changed to: ${router.pathname}`);

    // If we navigated away from home page, reset loading state
    if (isNavigating) {
      console.log(`[HomePage] Detected route change away from /, resetting isNavigating`);
      setIsNavigating(false);
    }
  }, [router.pathname, isNavigating]);

  const formatTime = (date) => {
    if (!date) return "Cargando...";
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

  const handleNavigation = useCallback((path) => {
    console.log(`[HomePage] ========== NAVIGATION START ==========`);
    console.log(`[HomePage] handleNavigation called with path: "${path}"`);
    console.log(`[HomePage] Current isNavigating state: ${isNavigating}`);

    // Validate path
    if (!path || typeof path !== 'string') {
      console.error('[HomePage] ❌ Invalid path:', path);
      toast({
        title: 'Error de navegación',
        description: 'Ruta inválida',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
      return;
    }

    // Prevent duplicate navigation
    if (isNavigating) {
      console.log('[HomePage] ⚠️ Navigation already in progress, aborting');
      return;
    }

    console.log(`[HomePage] Setting isNavigating = true`);
    setIsNavigating(true);
    console.log(`[HomePage] 🚀 Iniciando navegación a: ${path}`);
    console.log(`[HomePage] Using window.location.href for reliable navigation`);

    // Use window.location.href for full page navigation
    // This avoids issues with Fast Refresh and runtime errors
    window.location.href = path;
    console.log(`[HomePage] ========== NAVIGATION END ==========`);
  }, [toast, isNavigating]);

  const handleLogout = () => {
    console.log('[HomePage] handleLogout called');
    logout();
    router.push('/login');
  };

  // Configurar módulos según el rol
  const isAdmin = userRole === 'admin' || userRole === 'Admin' || userRole === 'Administrador';
  const isFlebotomista = userRole === 'Flebotomista' || userRole === 'flebotomista';
  const isSupervisor = userRole === 'supervisor';

  return (
    <ModernContainer>
        {/* Loading Overlay cuando está navegando */}
        {isNavigating && (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0, 0, 0, 0.5)"
            backdropFilter="blur(5px)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={9999}
          >
            <VStack spacing={4}>
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
              />
              <Text color="white" fontSize="lg" fontWeight="bold">
                Cargando...
              </Text>
            </VStack>
          </Box>
        )}

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
                TomaTurno - INER | {isAdmin ? '👨‍💼 Administrador' : isSupervisor ? '👨‍💼 Supervisor' : '👩‍⚕️ Flebotomista'}
                {user?.name && ` - ${user.name}`}
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
                leftIcon={<FaUserCircle />}
                size="sm"
                colorScheme="blue"
                variant="outline"
                onClick={() => handleNavigation('/profile')}
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: 'md'
                }}
              >
                Mi Perfil
              </Button>
              <Button
                leftIcon={<FaBook />}
                size="sm"
                colorScheme="purple"
                variant="outline"
                onClick={() => handleNavigation('/docs')}
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: 'md'
                }}
              >
                Documentación
              </Button>
              <Button
                leftIcon={<FaSignOutAlt />}
                size="sm"
                colorScheme="red"
                variant="solid"
                onClick={handleLogout}
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: 'md',
                  bg: 'red.600'
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

            {/* Panel de Atención - Solo para Flebotomistas, Supervisores y Admins */}
            {(isFlebotomista || isSupervisor || isAdmin) && (
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

            {/* Organización de Documentos - Admin y Supervisor */}
            {(isAdmin || isSupervisor) && (
              <GlassCard
                p={8}
                minW="280px"
                maxW="340px"
                flex="1"
                cursor="pointer"
                onClick={() => handleNavigation('/supervisor/document-prep')}
                _hover={{
                  transform: 'translateY(-10px)',
                  boxShadow: '2xl',
                  background: "rgba(255, 255, 255, 0.4)"
                }}
                transition="all 0.3s ease"
                animation={`${fadeInUp} 1.7s ease-out`}
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
                    <FaClipboardList />
                  </Box>

                  <VStack spacing={3} textAlign="center">
                    <Text fontWeight="bold" fontSize="xl" color="secondary.800">
                      Organización
                    </Text>
                    <Text fontSize="md" color="secondary.600">
                      Preparar etiquetas y papeletas
                    </Text>
                  </VStack>
                </VStack>
              </GlassCard>
            )}

            {/* Panel de Control - Solo Admin */}
            {isAdmin && (
              <GlassCard
                p={8}
                minW="280px"
                maxW="340px"
                flex="1"
                cursor="pointer"
                onClick={() => handleNavigation('/admin/control-panel')}
                _hover={{
                  transform: 'translateY(-10px)',
                  boxShadow: '2xl',
                  background: "rgba(255, 255, 255, 0.4)"
                }}
                transition="all 0.3s ease"
                animation={`${fadeInUp} 1.8s ease-out`}
                position="relative"
                overflow="hidden"
                border="2px solid rgba(139, 92, 246, 0.2)"
              >
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  height="5px"
                  background="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
                  borderTopRadius="2xl"
                />

                <VStack spacing={6} align="center">
                  <Box
                    w={16}
                    h={16}
                    borderRadius="2xl"
                    background="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontSize="3xl"
                    boxShadow="xl"
                  >
                    <FaCog />
                  </Box>

                  <VStack spacing={3} textAlign="center">
                    <Text fontWeight="bold" fontSize="xl" color="secondary.800">
                      Panel de Control
                    </Text>
                    <Text fontSize="md" color="secondary.600">
                      Monitoreo y control del sistema
                    </Text>
                  </VStack>
                </VStack>
              </GlassCard>
            )}

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
  );
});

export default HomePage;
