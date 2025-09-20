import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Spinner,
  Text,
  ChakraProvider,
  Center,
  VStack
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { modernTheme, GlassCard, ModernContainer } from './theme/ModernTheme';

// Rutas que NO requieren autenticación
const PUBLIC_ROUTES = [
  '/login',
  '/turns/queue',
  '/turns/queue_video',
  '/turns/queue-tv',
  '/announce',
  '/satisfaction-survey'
];

// Rutas que requieren roles específicos
const ROLE_RESTRICTED_ROUTES = {
  '/users': ['admin', 'Admin', 'Administrador'],
  '/statistics': ['admin', 'Admin', 'Administrador', 'supervisor'],
  '/statistics/monthly': ['admin', 'Admin', 'Administrador', 'supervisor'],
  '/statistics/daily': ['admin', 'Admin', 'Administrador', 'supervisor'],
  '/statistics/average-time': ['admin', 'Admin', 'Administrador', 'supervisor'],
  '/statistics/phlebotomists': ['admin', 'Admin', 'Administrador', 'supervisor'],
  '/cubicles': ['admin', 'Admin', 'Administrador']
};

// Rutas para flebotomistas
const PHLEBOTOMIST_ROUTES = [
  '/select-cubicle',
  '/turns/attention',
  '/turns/manual'
];

const ProtectedRoute = ({ children }) => {
  const router = useRouter();
  const { user, loading, isAuthenticated, updateActivity, hasRole } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const currentPath = router.pathname;

      // Rutas públicas - permitir acceso sin autenticación
      if (PUBLIC_ROUTES.includes(currentPath)) {
        setIsAuthorized(true);
        return;
      }

      // Si está cargando, esperar
      if (loading) {
        return;
      }

      // Si no está autenticado, verificar si hay token en localStorage antes de redirigir
      if (!isAuthenticated && currentPath !== '/login') {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');

        // Solo redirigir si realmente no hay datos de sesión
        if (!token || !userData) {
          router.push('/login');
          return;
        }
        // Si hay token, dar tiempo a que se verifique
        return;
      }

      // Actualizar actividad cuando accede a una ruta protegida
      if (updateActivity) {
        updateActivity();
      }

      // Verificar permisos por rol
      if (ROLE_RESTRICTED_ROUTES[currentPath]) {
        const allowedRoles = ROLE_RESTRICTED_ROUTES[currentPath];
        const userRole = user?.role;

        // Verificar si el usuario tiene uno de los roles permitidos
        const hasPermission = allowedRoles.some(role =>
          userRole?.toLowerCase() === role.toLowerCase() ||
          userRole === 'admin' ||
          userRole === 'Admin' ||
          userRole === 'Administrador'
        );

        if (!hasPermission) {
          router.push('/');
          return;
        }
      }

      // Rutas específicas para flebotomistas
      if (PHLEBOTOMIST_ROUTES.includes(currentPath)) {
        const userRole = user?.role?.toLowerCase();
        if (userRole !== 'flebotomista' &&
            userRole !== 'admin' &&
            userRole !== 'administrador') {
          router.push('/');
          return;
        }
      }

      setIsAuthorized(true);
    };

    checkAuth();
  }, [router, user, loading, isAuthenticated, updateActivity, hasRole]);

  // Si es una ruta pública, mostrar directamente
  if (PUBLIC_ROUTES.includes(router.pathname)) {
    return <>{children}</>;
  }

  // Si está cargando, mostrar spinner
  if (loading) {
    return (
      <ChakraProvider theme={modernTheme}>
        <ModernContainer>
          <Center minH="100vh">
            <GlassCard p={8}>
              <VStack spacing={4}>
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="blue.500"
                  size="xl"
                />
                <Text fontSize="lg" color="gray.600">
                  Verificando sesión...
                </Text>
              </VStack>
            </GlassCard>
          </Center>
        </ModernContainer>
      </ChakraProvider>
    );
  }

  // Si no está autorizado, no mostrar nada (ya se habrá redirigido)
  if (!isAuthorized) {
    return (
      <ChakraProvider theme={modernTheme}>
        <ModernContainer>
          <Center minH="100vh">
            <GlassCard p={8}>
              <VStack spacing={4}>
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="blue.500"
                  size="xl"
                />
                <Text fontSize="lg" color="gray.600">
                  Redirigiendo...
                </Text>
              </VStack>
            </GlassCard>
          </Center>
        </ModernContainer>
      </ChakraProvider>
    );
  }

  // Si está autorizado, mostrar el contenido
  return <>{children}</>;
};

export default ProtectedRoute;