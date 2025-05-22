import { useRouter } from 'next/router';
import { Box, Flex } from '@chakra-ui/react';
import SidebarMenu from './HamburgerMenu';

export default function Layout({ children }) {
  const router = useRouter();
  const showMenu = router.pathname !== '/turns/queue'; // Ocultar el menú solo en la página de queue

  return (
    <Flex>
      {showMenu && <SidebarMenu />} {/* Mostrar el menú solo si no está en la página de queue */}
      <Box flex="1" ml={showMenu ? '250px' : '0'} p={8} background="gray.50" minH="100vh">
        {children}
      </Box>
    </Flex>
  );
}
