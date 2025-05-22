import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Textarea, useToast } from '@chakra-ui/react';

export default function ManualTurnAssignment() {
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: '',
    contactInfo: '',
    studies: '',
    tubesRequired: '',
    observations: '',
    clinicalInfo: '',
  });
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/turns/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          studies: formData.studies.split(','), // Convertir estudios a array
          tubesRequired: parseInt(formData.tubesRequired, 10),
          age: parseInt(formData.age, 10),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: 'Turno asignado',
          description: `Número de turno asignado: ${data.assignedTurn}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        setFormData({
          patientName: '',
          age: '',
          gender: '',
          contactInfo: '',
          studies: '',
          tubesRequired: '',
          observations: '',
          clinicalInfo: '',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'No se pudo asignar el turno.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error en el envío del formulario:", error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al enviar el formulario.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="500px" mx="auto" mt={5}>
      <form onSubmit={handleSubmit}>
        <FormControl mb={3}>
          <FormLabel>Nombre del Paciente</FormLabel>
          <Input name="patientName" value={formData.patientName} onChange={handleChange} required />
        </FormControl>
        <FormControl mb={3}>
          <FormLabel>Edad</FormLabel>
          <Input type="number" name="age" value={formData.age} onChange={handleChange} required />
        </FormControl>
        <FormControl mb={3}>
          <FormLabel>Género</FormLabel>
          <Input name="gender" value={formData.gender} onChange={handleChange} required />
        </FormControl>
        <FormControl mb={3}>
          <FormLabel>Información de Contacto</FormLabel>
          <Input name="contactInfo" value={formData.contactInfo} onChange={handleChange} />
        </FormControl>
        <FormControl mb={3}>
          <FormLabel>Estudios (separados por comas)</FormLabel>
          <Textarea name="studies" value={formData.studies} onChange={handleChange} />
        </FormControl>
        <FormControl mb={3}>
          <FormLabel>Tubos Requeridos</FormLabel>
          <Input type="number" name="tubesRequired" value={formData.tubesRequired} onChange={handleChange} required />
        </FormControl>
        <FormControl mb={3}>
          <FormLabel>Observaciones</FormLabel>
          <Textarea name="observations" value={formData.observations} onChange={handleChange} />
        </FormControl>
        <FormControl mb={3}>
          <FormLabel>Información Clínica</FormLabel>
          <Textarea name="clinicalInfo" value={formData.clinicalInfo} onChange={handleChange} />
        </FormControl>
        <Button type="submit" colorScheme="blue" width="full">Asignar Turno</Button>
      </form>
    </Box>
  );
}
