import { useState, useEffect } from 'react';
import { Box, Heading, VStack, Text, Button, FormControl, FormLabel, Input, Select, useToast } from '@chakra-ui/react';
import Layout from '../../components/Layout';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const toast = useToast();

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, name, role }),
      });

      if (response.ok) {
        const newUser = await response.json();
        setUsers([...users, newUser]);
        setUsername('');
        setPassword('');
        setName('');
        setRole('');
        setShowCreateForm(false);
        toast({
          title: 'Usuario creado',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo crear el usuario.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error al crear el usuario:", error);
    }
  };

  const handleEditUser = async () => {
    try {
      const response = await fetch(`/api/users/${editingUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, name, role }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(user => (user.id === editingUserId ? updatedUser : user)));
        setUsername('');
        setPassword('');
        setName('');
        setRole('');
        setEditingUserId(null);
        setShowCreateForm(false);
        toast({
          title: 'Usuario actualizado',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo actualizar el usuario.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== id));
        toast({
          title: 'Usuario eliminado',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el usuario.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
    }
  };

  const openForm = (user = null) => {
    if (user) {
      setUsername(user.username);
      setPassword('');
      setName(user.name);
      setRole(user.role);
      setEditingUserId(user.id);
    } else {
      setUsername('');
      setPassword('');
      setName('');
      setRole('');
      setEditingUserId(null);
    }
    setShowCreateForm(true);
  };

  return (
    <Layout>
      <Box maxW="800px" mx="auto" mt={5}>
        <Heading as="h2" size="lg" mb={4}>Gestión de Usuarios</Heading>

        <VStack spacing={4} align="stretch">
          {users.map((user) => (
            <Box key={user.id} p={4} bg="gray.100" borderRadius="md" shadow="sm">
              <Text fontWeight="bold">Nombre de Usuario: {user.username}</Text>
              <Text>Nombre: {user.name}</Text>
              <Text>Rol: {user.role}</Text>
              <Button colorScheme="yellow" size="sm" mr={2} onClick={() => openForm(user)}>
                Editar
              </Button>
              <Button colorScheme="red" size="sm" onClick={() => handleDeleteUser(user.id)}>
                Eliminar
              </Button>
            </Box>
          ))}
        </VStack>

        <Button colorScheme="blue" mt={6} onClick={() => openForm()}>
          {showCreateForm ? 'Cancelar' : 'Crear Nuevo Usuario'}
        </Button>

        {showCreateForm && (
          <Box mt={4} p={4} bg="gray.50" borderRadius="md" shadow="sm">
            <FormControl mb={3}>
              <FormLabel>Nombre de Usuario</FormLabel>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Contraseña</FormLabel>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Nombre</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Rol</FormLabel>
              <Select value={role} onChange={(e) => setRole(e.target.value)} placeholder="Selecciona un rol" required>
                <option value="Flebotomista">Flebotomista</option>
                <option value="Administrador">Administrador</option>
              </Select>
            </FormControl>
            <Button colorScheme="green" onClick={editingUserId ? handleEditUser : handleCreateUser}>
              {editingUserId ? 'Actualizar' : 'Guardar'}
            </Button>
          </Box>
        )}
      </Box>
    </Layout>
  );
}
