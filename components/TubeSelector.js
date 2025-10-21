import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Select,
  Input,
  Button,
  Badge,
  IconButton,
  Text,
  Flex,
  useToast
} from '@chakra-ui/react';
import { FaPlus, FaTimes, FaVial } from 'react-icons/fa';
import { TUBE_TYPES } from '../lib/tubesCatalog';

/**
 * Componente TubeSelector
 *
 * Selector interactivo de tubos de laboratorio con tipos, colores y cantidades
 *
 * @param {Array} value - Array de objetos { type, quantity }
 * @param {Function} onChange - Callback cuando cambia la selección
 * @param {Boolean} isRequired - Si el campo es requerido
 */
export default function TubeSelector({ value = [], onChange, isRequired = false }) {
  const [selectedType, setSelectedType] = useState('sst');
  const [quantity, setQuantity] = useState(1);
  const toast = useToast();

  // Función para agregar un tubo
  const handleAddTube = () => {
    if (!selectedType) {
      toast({
        title: 'Selecciona un tipo de tubo',
        status: 'warning',
        duration: 2000,
        position: 'top'
      });
      return;
    }

    if (quantity < 1 || quantity > 10) {
      toast({
        title: 'La cantidad debe estar entre 1 y 10',
        status: 'warning',
        duration: 2000,
        position: 'top'
      });
      return;
    }

    // Verificar si ya existe este tipo de tubo
    const existingIndex = value.findIndex(tube => tube.type === selectedType);

    if (existingIndex >= 0) {
      // Si ya existe, sumar a la cantidad existente
      const newValue = [...value];
      newValue[existingIndex] = {
        ...newValue[existingIndex],
        quantity: newValue[existingIndex].quantity + quantity
      };
      onChange(newValue);

      toast({
        title: 'Cantidad actualizada',
        description: `Se agregaron ${quantity} tubos más`,
        status: 'info',
        duration: 2000,
        position: 'top'
      });
    } else {
      // Si no existe, agregar nuevo
      onChange([...value, { type: selectedType, quantity }]);

      toast({
        title: 'Tubo agregado',
        status: 'success',
        duration: 2000,
        position: 'top'
      });
    }

    // Resetear selección
    setQuantity(1);
  };

  // Función para eliminar un tubo
  const handleRemoveTube = (index) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);

    toast({
      title: 'Tubo eliminado',
      status: 'info',
      duration: 2000,
      position: 'top'
    });
  };

  // Calcular total de tubos
  const totalTubes = value.reduce((sum, tube) => sum + tube.quantity, 0);

  // Obtener información del tipo de tubo
  const getTubeInfo = (typeId) => {
    return TUBE_TYPES.find(t => t.id === typeId);
  };

  return (
    <Box>
      <FormControl isRequired={isRequired}>
        <FormLabel fontSize="sm" fontWeight="semibold" color="secondary.700">
          <Flex align="center" gap={2}>
            <Box as={FaVial} />
            Tubos Requeridos
            {isRequired && <Text as="span" color="red.500">*</Text>}
          </Flex>
        </FormLabel>

        {/* Selector de tubos */}
        <VStack spacing={3} align="stretch">
          {/* Input para agregar tubos */}
          <HStack spacing={2}>
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              size="sm"
              flex={2}
            >
              {TUBE_TYPES.map(tube => (
                <option key={tube.id} value={tube.id}>
                  {tube.color} - {tube.name}
                </option>
              ))}
            </Select>

            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              min="1"
              max="10"
              size="sm"
              width="80px"
              placeholder="Cant."
            />

            <Button
              onClick={handleAddTube}
              colorScheme="blue"
              size="sm"
              leftIcon={<FaPlus />}
              px={4}
            >
              Agregar
            </Button>
          </HStack>

          {/* Lista de tubos agregados */}
          {value.length > 0 && (
            <Box
              p={3}
              borderRadius="md"
              bg="gray.50"
              border="1px solid"
              borderColor="gray.200"
            >
              <Text fontSize="xs" fontWeight="bold" color="gray.600" mb={2}>
                Tubos agregados:
              </Text>

              <VStack spacing={2} align="stretch">
                {value.map((tube, index) => {
                  const tubeInfo = getTubeInfo(tube.type);
                  if (!tubeInfo) return null;

                  return (
                    <Flex
                      key={index}
                      align="center"
                      justify="space-between"
                      p={2}
                      bg="white"
                      borderRadius="md"
                      border="2px solid"
                      borderColor="gray.200"
                      borderLeftColor={tubeInfo.colorHex}
                      borderLeftWidth="4px"
                    >
                      <HStack spacing={2} flex={1}>
                        <Box
                          w="12px"
                          h="12px"
                          borderRadius="full"
                          bg={tubeInfo.colorHex}
                        />
                        <Text fontSize="sm" fontWeight="medium">
                          {tubeInfo.color}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {tubeInfo.name}
                        </Text>
                      </HStack>

                      <HStack spacing={2}>
                        <Badge colorScheme="blue" fontSize="sm" px={2}>
                          × {tube.quantity}
                        </Badge>

                        <IconButton
                          icon={<FaTimes />}
                          size="xs"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleRemoveTube(index)}
                          aria-label="Eliminar tubo"
                        />
                      </HStack>
                    </Flex>
                  );
                })}
              </VStack>

              {/* Total */}
              <Flex justify="space-between" align="center" mt={3} pt={2} borderTop="1px solid" borderColor="gray.300">
                <Text fontSize="sm" fontWeight="bold" color="gray.700">
                  Total de tubos:
                </Text>
                <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                  {totalTubes} {totalTubes === 1 ? 'tubo' : 'tubos'}
                </Badge>
              </Flex>
            </Box>
          )}

          {/* Mensaje si no hay tubos */}
          {value.length === 0 && (
            <Box
              p={4}
              borderRadius="md"
              bg="yellow.50"
              border="1px dashed"
              borderColor="yellow.300"
              textAlign="center"
            >
              <Text fontSize="sm" color="yellow.800">
                No se han agregado tubos. Selecciona un tipo y cantidad, luego haz clic en &quot;Agregar&quot;.
              </Text>
            </Box>
          )}
        </VStack>
      </FormControl>
    </Box>
  );
}
