import { useState, useEffect } from "react";
import { Box, FormControl, FormLabel, Select, Button, useToast, Heading, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/router";

export default function SelectCubicle() {
  const [cubicle, setCubicle] = useState("");
  const [cubicles, setCubicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const toast = useToast();

  // Obtén la lista de cubículos desde la API
  useEffect(() => {
    const fetchCubicles = async () => {
      try {
        const response = await fetch('/api/cubicles');
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
  }, []);

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

    // Almacena el cubículo en localStorage
    localStorage.setItem("selectedCubicle", cubicle);
    toast({
      title: "Cubículo seleccionado",
      description: `Has seleccionado el cubículo ${cubicle}.`,
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
                style={{
                  fontWeight: cubicle.isSpecial ? "bold" : "normal",
                  color: cubicle.isSpecial ? "red" : "black",
                }}
              >
                {cubicle.name} {cubicle.isSpecial ? "(Especial)" : ""}
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
        disabled={loading}
      >
        Confirmar Cubículo
      </Button>
    </Box>
  );
}
