import { useState } from 'react';
import { Box, Input, Button, FormControl, FormLabel, useToast } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Guarda el token y el rol en `localStorage`
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.role);

        // Llama al contexto para establecer el rol
        login(data.role);

        toast({
          title: 'Login exitoso',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Redirige a la selección de cubículo si el rol es "Flebotomista"
        if (data.role === 'Flebotomista') {
          router.push('/select-cubicle'); // Página de selección de cubículo
        } else {
          router.push('/'); // Redirige a la página de atención o principal para otros roles
        }
      } else {
        toast({
          title: 'Error en el login',
          description: data.error,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al intentar iniciar sesión.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="400px" mx="auto" mt={5} p={4} boxShadow="md" borderRadius="md">
      <form onSubmit={handleLogin}>
        <FormControl mb={3}>
          <FormLabel>Nombre de Usuario</FormLabel>
          <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </FormControl>
        <FormControl mb={3}>
          <FormLabel>Contraseña</FormLabel>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </FormControl>
        <Button type="submit" colorScheme="blue" width="full">Iniciar Sesión</Button>
      </form>
    </Box>
  );
}
