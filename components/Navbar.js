import React from 'react';
import { Box, Flex, Heading, Button, HStack, Avatar, Menu, MenuButton, MenuList, MenuItem, MenuDivider, Text, useColorModeValue } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { FaSignOutAlt, FaUser, FaCog } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <Box
      bg={bgColor}
      px={4}
      borderBottom="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Heading size="md" color="blue.600">
          Sistema TomaTurno
        </Heading>

        <HStack spacing={4}>
          {user && (
            <Menu>
              <MenuButton>
                <HStack spacing={3} cursor="pointer">
                  <Avatar size="sm" name={user.name || user.username} />
                  <Box display={{ base: 'none', md: 'block' }}>
                    <Text fontSize="sm" fontWeight="medium">
                      {user.name || user.username}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {user.role}
                    </Text>
                  </Box>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem icon={<FaUser />} onClick={() => router.push('/profile')}>
                  Mi Perfil
                </MenuItem>
                <MenuItem icon={<FaCog />} onClick={() => router.push('/settings')}>
                  Configuración
                </MenuItem>
                <MenuDivider />
                <MenuItem icon={<FaSignOutAlt />} onClick={handleLogout} color="red.500">
                  Cerrar Sesión
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;