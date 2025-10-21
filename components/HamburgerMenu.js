import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Box, Flex, Stack, Link, Icon, Text } from '@chakra-ui/react';
import { FaHome, FaUserPlus, FaClipboardList, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';
import NextLink from 'next/link';

export default function SidebarMenu() {
  const [isMounted, setIsMounted] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Flex h="100vh" w="250px" bg="blue.700" color="white" direction="column" position="fixed" left="0" top="0">
      <Box p={5} fontWeight="bold" fontSize="xl" textAlign="center" borderBottom="1px solid white">
        TomaTurno
      </Box>
      <Stack as="nav" spacing={6} mt={8} px={5}>
        {!user && (
          <>
            <NextLink href="/turns/queue" passHref>
              <Link display="flex" alignItems="center" py={2} _hover={{ bg: 'blue.600', borderRadius: 'md' }}>
                <Icon as={FaClipboardList} mr={3} />
                <Text>Queue</Text>
              </Link>
            </NextLink>
            <NextLink href="/login" passHref>
              <Link display="flex" alignItems="center" py={2} _hover={{ bg: 'blue.600', borderRadius: 'md' }}>
                <Icon as={FaSignInAlt} mr={3} />
                <Text>Login</Text>
              </Link>
            </NextLink>
          </>
        )}
        {user?.role === 'Flebotomista' && (
          <>
            <NextLink href="/turns/attention" passHref>
              <Link display="flex" alignItems="center" py={2} _hover={{ bg: 'blue.600', borderRadius: 'md' }}>
                <Icon as={FaClipboardList} mr={3} />
                <Text>Panel de Atención</Text>
              </Link>
            </NextLink>
            <NextLink href="/statistics" passHref>
              <Link display="flex" alignItems="center" py={2} _hover={{ bg: 'blue.600', borderRadius: 'md' }}>
                <Icon as={FaClipboardList} mr={3} />
                <Text>Estadísticas</Text>
              </Link>
            </NextLink>
            <Link display="flex" alignItems="center" py={2} _hover={{ bg: 'blue.600', borderRadius: 'md' }} onClick={logout}>
              <Icon as={FaSignOutAlt} mr={3} />
              <Text>Cerrar Sesión</Text>
            </Link>
          </>
        )}
        {user?.role === 'supervisor' && (
          <>
            <NextLink href="/turns/attention" passHref>
              <Link display="flex" alignItems="center" py={2} _hover={{ bg: 'blue.600', borderRadius: 'md' }}>
                <Icon as={FaClipboardList} mr={3} />
                <Text>Panel de Atención</Text>
              </Link>
            </NextLink>
            <NextLink href="/turns/queue" passHref>
              <Link display="flex" alignItems="center" py={2} _hover={{ bg: 'blue.600', borderRadius: 'md' }}>
                <Icon as={FaClipboardList} mr={3} />
                <Text>Cola de Turnos</Text>
              </Link>
            </NextLink>
            <NextLink href="/statistics" passHref>
              <Link display="flex" alignItems="center" py={2} _hover={{ bg: 'blue.600', borderRadius: 'md' }}>
                <Icon as={FaClipboardList} mr={3} />
                <Text>Estadísticas</Text>
              </Link>
            </NextLink>
            <Link display="flex" alignItems="center" py={2} _hover={{ bg: 'blue.600', borderRadius: 'md' }} onClick={logout}>
              <Icon as={FaSignOutAlt} mr={3} />
              <Text>Cerrar Sesión</Text>
            </Link>
          </>
        )}
        {user?.role === 'Administrador' && (
          <>
            <NextLink href="/turns/queue" passHref>
              <Link display="flex" alignItems="center" py={2} _hover={{ bg: 'blue.600', borderRadius: 'md' }}>
                <Icon as={FaClipboardList} mr={3} />
                <Text>Queue</Text>
              </Link>
            </NextLink>
            <NextLink href="/turns/manual" passHref>
              <Link display="flex" alignItems="center" py={2} _hover={{ bg: 'blue.600', borderRadius: 'md' }}>
                <Icon as={FaUserPlus} mr={3} />
                <Text>Crear Turno Manual</Text>
              </Link>
            </NextLink>
            <NextLink href="/turns/attention" passHref>
              <Link display="flex" alignItems="center" py={2} _hover={{ bg: 'blue.600', borderRadius: 'md' }}>
                <Icon as={FaClipboardList} mr={3} />
                <Text>Queue Attention</Text>
              </Link>
            </NextLink>
            <NextLink href="/cubicles" passHref>
              <Link display="flex" alignItems="center" py={2} _hover={{ bg: 'blue.600', borderRadius: 'md' }}>
                <Icon as={FaHome} mr={3} />
                <Text>Ver Cubículo</Text>
              </Link>
            </NextLink>
            <NextLink href="/users" passHref>
              <Link display="flex" alignItems="center" py={2} _hover={{ bg: 'blue.600', borderRadius: 'md' }}>
                <Icon as={FaUserPlus} mr={3} />
                <Text>Usuario</Text>
              </Link>
            </NextLink>
            <NextLink href="/statistics" passHref>
      <Link display="flex" alignItems="center" py={2} _hover={{ bg: 'blue.600', borderRadius: 'md' }}>
        <Icon as={FaClipboardList} mr={3} />
        <Text>Estadísticas</Text>
      </Link>
    </NextLink>
            <Link display="flex" alignItems="center" py={2} _hover={{ bg: 'blue.600', borderRadius: 'md' }} onClick={logout}>
              <Icon as={FaSignOutAlt} mr={3} />
              <Text>Cerrar Sesión</Text>
            </Link>
          </>
        )}
      </Stack>
    </Flex>
  );
}
