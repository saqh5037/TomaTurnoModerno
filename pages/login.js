import { useState, useEffect, useCallback, memo } from 'react';
import { 
  Box, 
  Input, 
  Button, 
  FormControl, 
  FormLabel, 
  useToast,
  ChakraProvider,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaHospital } from 'react-icons/fa';
import { modernTheme, fadeInUp, slideInFromLeft, GlassCard, ModernContainer } from '../components/theme/ModernTheme';

const LoginPage = memo(function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const { login } = useAuth();

  // Effect para marcar el componente como montado
  useEffect(() => {
    setMounted(true);
  }, []);

  // Función optimizada para el login
  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor ingresa tu usuario y contraseña.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Guarda el token y el rol en localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.role);

        // Llama al contexto para establecer el rol
        login(data.role);

        toast({
          title: 'Acceso autorizado',
          description: `Bienvenido/a ${data.name || username}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });

        // Redirige según el rol
        if (data.role === 'Flebotomista') {
          router.push('/select-cubicle');
        } else {
          router.push('/');
        }
      } else {
        toast({
          title: 'Acceso denegado',
          description: data.error || 'Credenciales incorrectas',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
      }
    } catch (error) {
      console.error('Error en login:', error);
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor. Intenta nuevamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setIsLoading(false);
    }
  }, [username, password, login, router, toast]);

  // Función para alternar visibilidad de contraseña
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // No renderizar hasta que esté montado para evitar errores de hidratación
  if (!mounted) {
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
                Iniciando sesión...
              </Text>
            </GlassCard>
          </Box>
        </ModernContainer>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider theme={modernTheme}>
      <ModernContainer>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          p={4}
        >
          {/* Panel de Login Principal */}
          <GlassCard
            maxW="450px"
            w="full"
            p={8}
            animation={`${fadeInUp} 0.8s ease-out`}
            position="relative"
            overflow="hidden"
          >
            {/* Decorative gradient line */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              height="4px"
              background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
              borderTopRadius="2xl"
            />

            {/* Header del login */}
            <VStack spacing={6} align="stretch">
              <Box textAlign="center">
                <Box
                  w={16}
                  h={16}
                  borderRadius="2xl"
                  background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  fontSize="2xl"
                  mb={4}
                  mx="auto"
                  boxShadow="xl"
                >
                  <FaHospital />
                </Box>
                <Heading 
                  fontSize="2xl"
                  fontWeight="extrabold"
                  background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
                  backgroundClip="text"
                  color="transparent"
                  letterSpacing="-0.02em"
                  mb={2}
                >
                  TomaTurno INER
                </Heading>
                <Text color="secondary.600" fontWeight="medium">
                  Sistema de Gestión de Turnos
                </Text>
                <Text fontSize="sm" color="secondary.500" mt={1}>
                  Ingresa tus credenciales para continuar
                </Text>
              </Box>

              {/* Formulario */}
              <Box as="form" onSubmit={handleLogin}>
                <VStack spacing={5}>
                  <FormControl isRequired>
                    <FormLabel 
                      fontSize="sm" 
                      fontWeight="semibold" 
                      color="secondary.700"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <FaUser />
                      Usuario
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <FaUser color="gray.400" />
                      </InputLeftElement>
                      <Input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Ingresa tu nombre de usuario"
                        variant="modern"
                        size="lg"
                        isDisabled={isLoading}
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel 
                      fontSize="sm" 
                      fontWeight="semibold" 
                      color="secondary.700"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <FaLock />
                      Contraseña
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <FaLock color="gray.400" />
                      </InputLeftElement>
                      <Input 
                        type={showPassword ? "text" : "password"}
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Ingresa tu contraseña"
                        variant="modern"
                        size="lg"
                        isDisabled={isLoading}
                      />
                      <InputRightElement>
                        <IconButton
                          icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                          size="sm"
                          variant="ghost"
                          onClick={togglePasswordVisibility}
                          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                          isDisabled={isLoading}
                          _hover={{ bg: 'rgba(79, 125, 243, 0.1)' }}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Button 
                    type="submit"
                    size="lg"
                    w="full"
                    variant="gradient"
                    leftIcon={<FaSignInAlt />}
                    isLoading={isLoading}
                    loadingText="Iniciando sesión..."
                    isDisabled={!username.trim() || !password.trim()}
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'xl'
                    }}
                    _disabled={{
                      opacity: 0.6,
                      cursor: 'not-allowed',
                      transform: 'none'
                    }}
                  >
                    Iniciar Sesión
                  </Button>
                </VStack>
              </Box>

              {/* Información adicional */}
              <Box
                p={4}
                background="rgba(79, 125, 243, 0.1)"
                borderRadius="lg"
                border="1px solid rgba(79, 125, 243, 0.2)"
                textAlign="center"
              >
                <Text fontSize="sm" color="primary.700" fontWeight="semibold" mb={1}>
                  💡 Información del Sistema
                </Text>
                <Text fontSize="xs" color="secondary.600">
                  Usa las credenciales proporcionadas por el administrador del sistema.
                  En caso de problemas, contacta al departamento de TI.
                </Text>
              </Box>
            </VStack>
          </GlassCard>
        </Box>

        {/* Footer */}
        <Box
          as="footer"
          position="fixed"
          bottom={4}
          left={4}
          right={4}
          textAlign="center"
          background="rgba(255, 255, 255, 0.25)"
          backdropFilter="blur(20px)"
          color="secondary.600"
          borderRadius="lg"
          fontSize="sm"
          p={3}
          animation={`${slideInFromLeft} 1.2s ease-out`}
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

export default LoginPage;
