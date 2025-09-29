import { useState, useEffect } from "react";
import { Box, FormControl, FormLabel, Select, Button, useToast, Heading, Spinner, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";

export default function SelectCubicle() {
  const [cubicle, setCubicle] = useState("");
  const [cubicles, setCubicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const toast = useToast();

  // Obtén la lista de cubículos activos desde la API
  useEffect(() => {
    const fetchCubicles = async () => {
      try {
        const response = await fetch('/api/cubicles?activeOnly=true');
        const data = await response.json();
        setCubicles(data);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener cubículos:", error);
        toast({
          title: "Error",
          description: "Error al cargar los cubículos.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
      }
    };

    fetchCubicles();
  }, [toast]);

  const handleCubicleSelection = () => {
    if (!cubicle) {
      toast({
        title: "Selección incompleta",
        description: "Por favor, selecciona un cubículo para continuar.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validar que el cubículo seleccionado esté activo
    const selectedCubicle = cubicles.find(c => c.id === parseInt(cubicle));
    if (selectedCubicle && !selectedCubicle.isActive) {
      toast({
        title: "Cubículo inactivo",
        description: "No puedes seleccionar un cubículo inactivo.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Almacena el cubículo en localStorage
    localStorage.setItem("selectedCubicle", cubicle);
    toast({
      title: "Cubículo seleccionado",
      description: `Has seleccionado el cubículo ${selectedCubicle?.name || cubicle}.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    // Redirige a la página de atención de turnos
    router.push("/turns/attention");
  };

  return (
    <Box maxW="md" mx="auto" mt={10} p={6} borderRadius="md" boxShadow="lg" bg="white">
      <Heading as="h2" size="lg" textAlign="center" mb={6} color="blue.600">
        Selección de Cubículo
      </Heading>
      {loading ? (
        <Spinner size="xl" color="blue.500" />
      ) : cubicles.length === 0 ? (
        <Text color="red.500" textAlign="center" fontSize="lg">
          No hay cubículos activos disponibles en este momento.
        </Text>
      ) : (
        <FormControl id="cubicle" isRequired>
          <FormLabel color="blue.600">Selecciona tu cubículo de trabajo</FormLabel>
          <Select
            placeholder="Selecciona un cubículo"
            value={cubicle}
            onChange={(e) => setCubicle(e.target.value)}
            focusBorderColor="blue.500"
          >
            {cubicles.map((cubicle) => (
              <option
                key={cubicle.id}
                value={cubicle.id}
                disabled={!cubicle.isActive}
                style={{
                  fontWeight: cubicle.isSpecial ? "bold" : "normal",
                  color: !cubicle.isActive ? "gray" : cubicle.isSpecial ? "red" : "black",
                }}
              >
                {cubicle.name} {cubicle.isSpecial ? "(Especial)" : ""} {!cubicle.isActive ? "(Inactivo)" : ""}
              </option>
            ))}
          </Select>
        </FormControl>
      )}
      <Button
        colorScheme="blue"
        width="full"
        mt={4}
        onClick={handleCubicleSelection}
        disabled={loading || cubicles.length === 0}
      >
        Confirmar Cubículo
      </Button>
    </Box>
  );
}
