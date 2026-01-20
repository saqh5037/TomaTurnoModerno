import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Spinner,
  Text,
  Center,
  VStack,
  useToast
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { GlassCard, ModernContainer } from './theme/ModernTheme';

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
  '/cubicles': ['admin', 'Admin', 'Administrador'],
  '/admin/control-panel': ['admin', 'Admin', 'Administrador', 'supervisor'],
  '/document-prep': ['admin', 'Admin', 'Administrador', 'supervisor', 'Flebotomista', 'flebotomista']
};

// Rutas para flebotomistas (removimos /turns/manual de aquí)
const PHLEBOTOMIST_ROUTES = [
  '/select-cubicle',
  '/turns/attention'
];

// Función helper para verificar si un usuario es administrador
const isAdminRole = (role) => {
  if (!role) return false;
  const normalizedRole = role.toString().trim().toLowerCase();
  return normalizedRole === 'admin' ||
         normalizedRole === 'administrador';
};

const ProtectedRoute = ({ children }) => {
  console.log('[ProtectedRoute] ========== COMPONENT RENDER ==========');
  const router = useRouter();
  const { user, loading, isAuthenticated, updateActivity, hasRole } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const toast = useToast();

  console.log('[ProtectedRoute] Current path:', router.pathname);
  console.log('[ProtectedRoute] isAuthorized state:', isAuthorized);
  console.log('[ProtectedRoute] loading:', loading, 'isAuthenticated:', isAuthenticated);
  console.log('[ProtectedRoute] user:', user?.name, 'role:', user?.role);

  useEffect(() => {
    console.log(`[ProtectedRoute] useEffect TRIGGERED for path: ${router.pathname}`);
    const checkAuth = async () => {
      const currentPath = router.pathname;

      console.log(`[ProtectedRoute] ========== INICIO VERIFICACIÓN ==========`);
      console.log(`[ProtectedRoute] Verificando acceso a: ${currentPath}`);
      console.log(`[ProtectedRoute] Estado - Loading: ${loading}, Authenticated: ${isAuthenticated}`);
      console.log(`[ProtectedRoute] User completo:`, user);
      console.log(`[ProtectedRoute] User.role:`, user?.role);

      // Rutas públicas - permitir acceso sin autenticación
      if (PUBLIC_ROUTES.includes(currentPath)) {
        console.log(`[ProtectedRoute] ✅ Ruta pública, acceso permitido`);
        setIsAuthorized(true);
        return;
      }

      // Si está cargando, esperar
      if (loading) {
        console.log(`[ProtectedRoute] ⏳ Esperando carga de autenticación...`);
        return;
      }

      // Si no está autenticado, verificar si hay token en localStorage antes de redirigir
      if (!isAuthenticated && currentPath !== '/login') {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');

        console.log(`[ProtectedRoute] No autenticado. Token: ${!!token}, UserData: ${!!userData}`);

        // Solo redirigir si realmente no hay datos de sesión
        if (!token || !userData) {
          console.warn(`[ProtectedRoute] ❌ Sin datos de sesión, redirigiendo a /login`);
          router.push('/login');
          return;
        }
        // Si hay token, dar tiempo a que se verifique
        console.log(`[ProtectedRoute] ⏳ Hay token, esperando verificación...`);
        return;
      }

      // PROTECCIÓN RACE CONDITION: Verificar que user esté cargado
      if (!user || !user.role) {
        console.warn(`[ProtectedRoute] ⚠️ Usuario sin cargar completamente. User:`, user);
        // Dar más tiempo para que se cargue
        return;
      }

      console.log(`[ProtectedRoute] Usuario cargado: ${user.name}, Rol: ${user.role}`);

      // Actualizar actividad cuando accede a una ruta protegida
      if (updateActivity) {
        updateActivity();
      }

      // Verificar permisos por rol
      if (ROLE_RESTRICTED_ROUTES[currentPath]) {
        const allowedRoles = ROLE_RESTRICTED_ROUTES[currentPath];
        const userRole = user.role;

        console.log(`[ProtectedRoute] Verificando roles restringidos. Permitidos:`, allowedRoles, `Usuario: ${userRole}`);

        // Verificar si el usuario tiene uno de los roles permitidos
        const hasPermission = allowedRoles.some(role =>
          userRole?.toLowerCase() === role.toLowerCase()
        ) || isAdminRole(userRole);

        if (!hasPermission) {
          console.error(`[ProtectedRoute] ❌ Acceso denegado a ${currentPath} para rol "${userRole}"`);
          toast({
            title: 'Acceso Denegado',
            description: `No tienes permisos para acceder a esta sección. Tu rol: ${userRole}`,
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top'
          });
          router.push('/');
          return;
        }
      }

      // Rutas específicas para flebotomistas, supervisores y administradores
      if (PHLEBOTOMIST_ROUTES.includes(currentPath)) {
        const userRole = user.role?.toLowerCase();

        console.log(`[ProtectedRoute] Verificando ruta de flebotomista/admin. Rol original: "${user.role}", Rol normalizado: "${userRole}"`);

        // PRIMERO verificar si es admin (tiene acceso total)
        if (isAdminRole(user.role)) {
          console.log(`[ProtectedRoute] ✅ Usuario es administrador, acceso permitido`);
          setIsAuthorized(true);
          return;
        }

        // Si no es admin, verificar otros roles
        const isAllowed = userRole === 'flebotomista' || userRole === 'supervisor';

        if (!isAllowed) {
          console.error(`[ProtectedRoute] ❌ Acceso denegado a ${currentPath}. Rol "${user.role}" (normalizado: "${userRole}") no permitido`);
          console.error(`[ProtectedRoute] Roles permitidos: admin, administrador, flebotomista, supervisor`);
          toast({
            title: 'Acceso Denegado',
            description: `Esta sección es solo para Flebotomistas, Supervisores y Administradores. Tu rol: ${user.role}`,
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top'
          });
          router.push('/');
          return;
        }
      }

      // Autorización exitosa
      console.log(`[ProtectedRoute] ✅ Autorización exitosa para ${currentPath}`);
      console.log(`[ProtectedRoute] Calling setIsAuthorized(true)`);
      setIsAuthorized(true);
      console.log(`[ProtectedRoute] ========== FIN VERIFICACIÓN (AUTORIZADO) ==========`);
    };

    checkAuth();
    console.log(`[ProtectedRoute] checkAuth() completed for ${router.pathname}`);
  }, [router.pathname, user, loading, isAuthenticated, updateActivity, toast]);

  // Si es una ruta pública, mostrar directamente
  if (PUBLIC_ROUTES.includes(router.pathname)) {
    console.log(`[ProtectedRoute] 🔓 Ruta pública detectada en render: ${router.pathname}`);
    console.log(`[ProtectedRoute] Renderizando children directamente (ruta pública)`);
    return <>{children}</>;
  }

  // Si está cargando, mostrar spinner
  if (loading) {
    console.log(`[ProtectedRoute] ⏳ Loading state = true, mostrando spinner`);
    return (
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
    );
  }

  // Si no está autorizado, no mostrar nada (ya se habrá redirigido)
  if (!isAuthorized) {
    console.log(`[ProtectedRoute] ⛔ isAuthorized = false, mostrando spinner de redirección`);
    return (
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
    );
  }

  // Si está autorizado, mostrar el contenido
  console.log(`[ProtectedRoute] ✅ isAuthorized = true, RENDERIZANDO CHILDREN para: ${router.pathname}`);
  console.log(`[ProtectedRoute] Children type:`, typeof children);
  return <>{children}</>;
};

export default ProtectedRoute;