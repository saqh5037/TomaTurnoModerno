import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Spinner, 
  Text, 
  ChakraProvider 
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { modernTheme, GlassCard, ModernContainer } from './theme/ModernTheme';

// Rutas que NO requieren autenticación
const PUBLIC_ROUTES = [
  '/turns/queue',
  '/turns/queue_video',
  '/login'
];

// Rutas que requieren rol específico
const ADMIN_ONLY_ROUTES = [
  '/users',
  '/cubicles',
  '/statistics/dashboard', // Si hay rutas específicas de admin
];

const FLEBOTOMISTA_ROUTES = [
  '/turns/attention',
  '/turns/manual',
  '/statistics', // Estadísticas básicas
];

const ProtectedRoute = ({ children }) => {
  const { userRole } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAccess = () => {
      const currentPath = router.asPath;
      
      // Permitir acceso a rutas públicas sin autenticación
      if (PUBLIC_ROUTES.includes(currentPath)) {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      // Si no hay usuario y no es ruta pública, redirigir al login
      if (!userRole) {
        router.push('/login');
        return;
      }

      // Verificar permisos por rol
      const isAdmin = userRole === 'Administrador';
      const isFlebotomista = userRole === 'Flebotomista';

      // Administradores tienen acceso completo
      if (isAdmin) {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      // Verificar rutas específicas de admin
      if (ADMIN_ONLY_ROUTES.some(route => currentPath.startsWith(route))) {
        // No autorizado - redirigir al inicio
        router.push('/');
        return;
      }

      // Flebotomistas pueden acceder a sus rutas específicas
      if (isFlebotomista) {
        const hasAccess = FLEBOTOMISTA_ROUTES.some(route => 
          currentPath.startsWith(route)
        ) || currentPath === '/'; // También puede acceder al inicio

        if (hasAccess) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        } else {
          // No autorizado - redirigir al inicio
          router.push('/');
          return;
        }
      }

      // Por defecto, no autorizado
      router.push('/login');
    };

    // Solo verificar cuando el router esté listo
    if (router.isReady) {
      checkAccess();
    }
  }, [userRole, router, router.asPath, router.isReady]);

  // Pantalla de carga
  if (isLoading || !router.isReady) {
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
                Verificando permisos...
              </Text>
            </GlassCard>
          </Box>
        </ModernContainer>
      </ChakraProvider>
    );
  }

  // Si está autorizado, mostrar el contenido
  if (isAuthorized) {
    return children;
  }

  // No autorizado - mostrar pantalla de carga mientras redirige
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
              Redirigiendo...
            </Text>
          </GlassCard>
        </Box>
      </ModernContainer>
    </ChakraProvider>
  );
};

export default ProtectedRoute;