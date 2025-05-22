import { useState, useEffect } from 'react';
import { Box, Heading, VStack, Text, Button, FormControl, FormLabel, Input, Checkbox, useToast } from '@chakra-ui/react';
import Layout from '../../components/Layout';

export default function CubicleManagement() {
  const [cubicles, setCubicles] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [isSpecial, setIsSpecial] = useState(false);
  const [editingCubicleId, setEditingCubicleId] = useState(null);
  const toast = useToast();

  const fetchCubicles = async () => {
    try {
      const response = await fetch('/api/cubicles');
      const data = await response.json();
      setCubicles(data);
    } catch (error) {
      console.error("Error al obtener los cubículos:", error);
    }
  };

  useEffect(() => {
    fetchCubicles();
  }, []);

  const handleCreateCubicle = async () => {
    try {
      const response = await fetch('/api/cubicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, isSpecial }),
      });

      if (response.ok) {
        const newCubicle = await response.json();
        setCubicles([...cubicles, newCubicle]);
        setName('');
        setIsSpecial(false);
        setShowCreateForm(false);
        toast({
          title: 'Cubículo creado',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo crear el cubículo.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error al crear el cubículo:", error);
    }
  };

  const handleEditCubicle = async () => {
    try {
      const response = await fetch(`/api/cubicles/${editingCubicleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, isSpecial }),
      });

      if (response.ok) {
        const updatedCubicle = await response.json();
        setCubicles(cubicles.map(cubicle => (cubicle.id === editingCubicleId ? updatedCubicle : cubicle)));
        setName('');
        setIsSpecial(false);
        setEditingCubicleId(null);
        setShowCreateForm(false);
        toast({
          title: 'Cubículo actualizado',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo actualizar el cubículo.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error al actualizar el cubículo:", error);
    }
  };

  const handleDeleteCubicle = async (id) => {
    try {
      const response = await fetch(`/api/cubicles/${id}`, { method: 'DELETE' });

      if (response.ok) {
        setCubicles(cubicles.filter(cubicle => cubicle.id !== id));
        toast({
          title: 'Cubículo eliminado',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el cubículo.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error al eliminar el cubículo:", error);
    }
  };

  const openForm = (cubicle = null) => {
    if (cubicle) {
      setName(cubicle.name);
      setIsSpecial(cubicle.isSpecial);
      setEditingCubicleId(cubicle.id);
    } else {
      setName('');
      setIsSpecial(false);
      setEditingCubicleId(null);
    }
    setShowCreateForm(true);
  };

  return (
    <Layout>
      <Box maxW="800px" mx="auto" mt={5}>
        <Heading as="h2" size="lg" mb={4}>Gestión de Cubículos</Heading>

        {/* Lista de Cubículos */}
        <VStack spacing={4} align="stretch">
          {cubicles.map((cubicle) => (
            <Box key={cubicle.id} p={4} bg="gray.100" borderRadius="md" shadow="sm">
              <Text fontWeight="bold">Nombre: {cubicle.name}</Text>
              <Text>Especial: {cubicle.isSpecial ? 'Sí' : 'No'}</Text>
              <Button colorScheme="yellow" size="sm" mr={2} onClick={() => openForm(cubicle)}>
                Editar
              </Button>
              <Button colorScheme="red" size="sm" onClick={() => handleDeleteCubicle(cubicle.id)}>
                Eliminar
              </Button>
            </Box>
          ))}
        </VStack>

        {/* Botón para Mostrar Formulario de Creación */}
        <Button colorScheme="blue" mt={6} onClick={() => openForm()}>
          {showCreateForm ? 'Cancelar' : 'Crear Nuevo Cubículo'}
        </Button>

        {/* Formulario de Creación/Edición */}
        {showCreateForm && (
          <Box mt={4} p={4} bg="gray.50" borderRadius="md" shadow="sm">
            <FormControl mb={3}>
              <FormLabel>Nombre del Cubículo</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </FormControl>
            <FormControl mb={3}>
              <Checkbox isChecked={isSpecial} onChange={(e) => setIsSpecial(e.target.checked)}>
                Cubículo Especial
              </Checkbox>
            </FormControl>
            <Button colorScheme="green" onClick={editingCubicleId ? handleEditCubicle : handleCreateCubicle}>
              {editingCubicleId ? 'Actualizar' : 'Guardar'}
            </Button>
          </Box>
        )}
      </Box>
    </Layout>
  );
}
