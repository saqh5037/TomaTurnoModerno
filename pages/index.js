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
          {/* Mensaje de Bienvenida */}
          <GlassCard p={8} textAlign="center" animation={`${slideInFromLeft} 1s ease-out`}>
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
              mb={6}
              mx="auto"
              boxShadow="xl"
            >
              <FaHeart />
            </Box>
            
            <Heading 
              size="xl" 
              color="secondary.800" 
              mb={4}
              fontWeight="bold"
            >
              Sistema de Gestión de Turnos
            </Heading>
            
            <Text 
              fontSize="lg" 
              color="secondary.600" 
              lineHeight="1.8"
              maxW="600px"
              mx="auto"
            >
              Bienvenido al sistema moderno de gestión de turnos del Instituto Nacional 
              de Enfermedades Respiratorias. Aquí podrás acceder a todas las herramientas 
              necesarias para una atención médica eficiente y organizada.
            </Text>
          </GlassCard>

          {/* Cards de Navegación */}
          <VStack spacing={6} align="stretch">
            <Heading 
              size="lg" 
              color="secondary.800" 
              textAlign="center"
              fontWeight="bold"
            >
              Acceso Rápido - Módulos Disponibles
            </Heading>
            
            <Flex 
              wrap="wrap" 
              gap={6} 
              justify="center"
            >
              {/* Cola de Turnos - Disponible para todos */}
              <GlassCard 
                p={6}
                maxW="300px"
                flex="1"
                cursor="pointer"
                onClick={() => handleNavigation('/turns/queue')}
                _hover={{
                  transform: 'translateY(-8px)',
                  boxShadow: 'xl',
                  background: "rgba(255, 255, 255, 0.35)"
                }}
                transition="all 0.3s ease"
                animation={`${fadeInUp} 1.2s ease-out`}
                position="relative"
                overflow="hidden"
              >
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  height="3px"
                  background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
                  borderTopRadius="2xl"
                />
                
                <VStack spacing={4} align="center">
                  <Box
                    w={12}
                    h={12}
                    borderRadius="xl"
                    background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontSize="2xl"
                    boxShadow="lg"
                  >
                    <FaClock />
                  </Box>
                  
                  <VStack spacing={2} textAlign="center">
                    <Text fontWeight="bold" fontSize="lg" color="secondary.800">
                      Cola de Turnos
                    </Text>
                    <Text fontSize="sm" color="secondary.600">
                      Visualiza y gestiona la cola de pacientes en tiempo real
                    </Text>
                  </VStack>
                </VStack>
              </GlassCard>

              {/* Panel de Atención - Solo para Flebotomistas y Admins */}
              {(isFlebotomista || isAdmin) && (
                <GlassCard 
                  p={6}
                  maxW="300px"
                  flex="1"
                  cursor="pointer"
                  onClick={() => handleNavigation('/turns/attention')}
                  _hover={{
                    transform: 'translateY(-8px)',
                    boxShadow: 'xl',
                    background: "rgba(255, 255, 255, 0.35)"
                  }}
                  transition="all 0.3s ease"
                  animation={`${fadeInUp} 1.4s ease-out`}
                  position="relative"
                  overflow="hidden"
                >
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    height="3px"
                    background="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    borderTopRadius="2xl"
                  />
                  
                  <VStack spacing={4} align="center">
                    <Box
                      w={12}
                      h={12}
                      borderRadius="xl"
                      background="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="white"
                      fontSize="2xl"
                      boxShadow="lg"
                    >
                      <FaStethoscope />
                    </Box>
                    
                    <VStack spacing={2} textAlign="center">
                      <Text fontWeight="bold" fontSize="lg" color="secondary.800">
                        Panel de Atención
                      </Text>
                      <Text fontSize="sm" color="secondary.600">
                        Herramientas para flebotomistas y personal médico
                      </Text>
                    </VStack>
                  </VStack>
                </GlassCard>
              )}

              {/* Crear Turno Manual - Solo para Flebotomistas y Admins */}
              {(isFlebotomista || isAdmin) && (
                <GlassCard 
                  p={6}
                  maxW="300px"
                  flex="1"
                  cursor="pointer"
                  onClick={() => handleNavigation('/turns/manual')}
                  _hover={{
                    transform: 'translateY(-8px)',
                    boxShadow: 'xl',
                    background: "rgba(255, 255, 255, 0.35)"
                  }}
                  transition="all 0.3s ease"
                  animation={`${fadeInUp} 1.5s ease-out`}
                  position="relative"
                  overflow="hidden"
                >
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    height="3px"
                    background="linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)"
                    borderTopRadius="2xl"
                  />
                  
                  <VStack spacing={4} align="center">
                    <Box
                      w={12}
                      h={12}
                      borderRadius="xl"
                      background="linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="white"
                      fontSize="2xl"
                      boxShadow="lg"
                    >
                      <FaUserMd />
                    </Box>
                    
                    <VStack spacing={2} textAlign="center">
                      <Text fontWeight="bold" fontSize="lg" color="secondary.800">
                        Crear Turno
                      </Text>
                      <Text fontSize="sm" color="secondary.600">
                        Registro manual de nuevos pacientes
                      </Text>
                    </VStack>
                  </VStack>
                </GlassCard>
              )}

              {/* Estadísticas - Disponible para todos con diferentes niveles */}
              <GlassCard 
                p={6}
                maxW="300px"
                flex="1"
                cursor="pointer"
                onClick={() => handleNavigation('/statistics')}
                _hover={{
                  transform: 'translateY(-8px)',
                  boxShadow: 'xl',
                  background: "rgba(255, 255, 255, 0.35)"
                }}
                transition="all 0.3s ease"
                animation={`${fadeInUp} 1.6s ease-out`}
                position="relative"
                overflow="hidden"
              >
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  height="3px"
                  background="linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
                  borderTopRadius="2xl"
                />
                
                <VStack spacing={4} align="center">
                  <Box
                    w={12}
                    h={12}
                    borderRadius="xl"
                    background="linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontSize="2xl"
                    boxShadow="lg"
                  >
                    <FaChartBar />
                  </Box>
                  
                  <VStack spacing={2} textAlign="center">
                    <Text fontWeight="bold" fontSize="lg" color="secondary.800">
                      Estadísticas
                    </Text>
                    <Text fontSize="sm" color="secondary.600">
                      {isAdmin ? 'Métricas completas del sistema' : 'Estadísticas operativas básicas'}
                    </Text>
                  </VStack>
                </VStack>
              </GlassCard>

              {/* Gestión de Usuarios - Solo para Administradores */}
              {isAdmin && (
                <GlassCard 
                  p={6}
                  maxW="300px"
                  flex="1"
                  cursor="pointer"
                  onClick={() => handleNavigation('/users')}
                  _hover={{
                    transform: 'translateY(-8px)',
                    boxShadow: 'xl',
                    background: "rgba(255, 255, 255, 0.35)"
                  }}
                  transition="all 0.3s ease"
                  animation={`${fadeInUp} 1.8s ease-out`}
                  position="relative"
                  overflow="hidden"
                >
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    height="3px"
                    background="linear-gradient(135deg, #6B73FF 0%, #9333EA 100%)"
                    borderTopRadius="2xl"
                  />
                  
                  <VStack spacing={4} align="center">
                    <Box
                      w={12}
                      h={12}
                      borderRadius="xl"
                      background="linear-gradient(135deg, #6B73FF 0%, #9333EA 100%)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="white"
                      fontSize="2xl"
                      boxShadow="lg"
                    >
                      <FaUsers />
                    </Box>
                    
                    <VStack spacing={2} textAlign="center">
                      <Text fontWeight="bold" fontSize="lg" color="secondary.800">
                        Usuarios
                      </Text>
                      <Text fontSize="sm" color="secondary.600">
                        Administra el personal y permisos del sistema
                      </Text>
                    </VStack>
                  </VStack>
                </GlassCard>
              )}

              {/* Gestión de Cubículos - Solo para Administradores */}
              {isAdmin && (
                <GlassCard 
                  p={6}
                  maxW="300px"
                  flex="1"
                  cursor="pointer"
                  onClick={() => handleNavigation('/cubicles')}
                  _hover={{
                    transform: 'translateY(-8px)',
                    boxShadow: 'xl',
                    background: "rgba(255, 255, 255, 0.35)"
                  }}
                  transition="all 0.3s ease"
                  animation={`${fadeInUp} 1.9s ease-out`}
                  position="relative"
                  overflow="hidden"
                >
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    height="3px"
                    background="linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
                    borderTopRadius="2xl"
                  />
                  
                  <VStack spacing={4} align="center">
                    <Box
                      w={12}
                      h={12}
                      borderRadius="xl"
                      background="linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="white"
                      fontSize="2xl"
                      boxShadow="lg"
                    >
                      <FaHome />
                    </Box>
                    
                    <VStack spacing={2} textAlign="center">
                      <Text fontWeight="bold" fontSize="lg" color="secondary.800">
                        Cubículos
                      </Text>
                      <Text fontSize="sm" color="secondary.600">
                        Gestiona espacios de atención médica
                      </Text>
                    </VStack>
                  </VStack>
                </GlassCard>
              )}
            </Flex>
          </VStack>

          {/* Información Institucional */}
          <GlassCard 
            p={8} 
            textAlign="center"
            animation={`${slideInFromRight} 1.5s ease-out`}
          >
            <HStack justify="center" spacing={4} mb={6}>
              <Box
                w={12}
                h={12}
                borderRadius="xl"
                background="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontSize="2xl"
                boxShadow="lg"
              >
                <FaHandsHelping />
              </Box>
              <Heading 
                size="lg" 
                color="secondary.800"
                fontWeight="bold"
              >
                Instituto Nacional de Enfermedades Respiratorias
              </Heading>
            </HStack>
            
            <Text 
              fontSize="md" 
              color="secondary.600" 
              lineHeight="1.8"
              maxW="800px"
              mx="auto"
              mb={6}
            >
              Ismael Cosío Villegas (INER) se dedica a la prevención, diagnóstico y tratamiento 
              de enfermedades respiratorias, brindando atención médica especializada de alta calidad 
              a la población mexicana con tecnología de vanguardia y un equipo multidisciplinario 
              comprometido con la excelencia.
            </Text>
            
            <HStack justify="center" spacing={6} wrap="wrap">
              <Button
                leftIcon={<FaClock />}
                variant="gradient"
                size="lg"
                onClick={() => handleNavigation('/turns/queue')}
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'xl'
                }}
                transition="all 0.3s ease"
              >
                Ver Cola de Turnos
              </Button>
              {(isFlebotomista || isAdmin) && (
                <Button
                  leftIcon={<FaStethoscope />}
                  variant="outline"
                  size="lg"
                  onClick={() => handleNavigation('/turns/attention')}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'md'
                  }}
                  transition="all 0.3s ease"
                >
                  Panel de Atención
                </Button>
              )}
            </HStack>
          </GlassCard>
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
