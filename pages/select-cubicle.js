import { useState, useEffect } from "react";
import { Box, FormControl, FormLabel, Select, Button, useToast, Heading, Spinner, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";

export default function SelectCubicle() {
  const [cubicle, setCubicle] = useState("");
  const [cubicles, setCubicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const router = useRouter();
  const toast = useToast();

  // Obtener userId del token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserId(payload.userId);
      } catch (error) {
        console.error("Error al decodificar token:", error);
      }
    }
  }, []);

  // Función para obtener cubículos (reutilizable)
  const fetchCubicles = async () => {
    try {
      const response = await fetch('/api/cubicles/status');
      const result = await response.json();
      if (result.success) {
        setCubicles(result.data);
      } else {
        throw new Error(result.error);
      }
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

  // Obtén la lista de cubículos con estado de ocupación desde la API
  useEffect(() => {
    fetchCubicles();
    // Refrescar cada 5 segundos
    const interval = setInterval(fetchCubicles, 5000);
    return () => clearInterval(interval);
  }, [toast]);

  const handleCubicleSelection = async () => {
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

    // Validar que el cubículo seleccionado esté activo y no ocupado
    const selectedCubicle = cubicles.find(c => c.id === parseInt(cubicle));

    if (!selectedCubicle) {
      toast({
        title: "Cubículo no encontrado",
        description: "El cubículo seleccionado no existe.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!selectedCubicle.isActive) {
      toast({
        title: "Cubículo inactivo",
        description: "No puedes seleccionar un cubículo inactivo.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Verificar si el cubículo está ocupado por otro usuario
    if (selectedCubicle.isOccupied && selectedCubicle.occupiedBy?.userId !== userId) {
      toast({
        title: "Cubículo ocupado",
        description: `Este cubículo está siendo usado por ${selectedCubicle.occupiedBy.userName}.`,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    // Actualizar el cubículo en la sesión del backend
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/session/update-cubicle", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ cubicleId: parseInt(cubicle) })
      });

      const result = await response.json();

      // Manejar error 409 - Cubículo ya tomado por otro usuario (race condition)
      if (response.status === 409 || result.code === "CUBICLE_ALREADY_TAKEN") {
        // Refrescar la lista de cubículos para mostrar el estado actualizado
        await fetchCubicles();
        // Limpiar selección actual
        setCubicle("");
        toast({
          title: "Cubículo no disponible",
          description: result.error || "El cubículo fue tomado por otro usuario. Por favor selecciona otro.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Error al actualizar cubículo");
      }

      // Almacena el cubículo en localStorage
      localStorage.setItem("selectedCubicle", cubicle);

      toast({
        title: "Cubículo seleccionado",
        description: `Has seleccionado el cubículo ${selectedCubicle.name}.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Redirige a la página de atención de turnos
      router.push("/turns/attention");

    } catch (error) {
      console.error("Error al actualizar cubículo:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la selección del cubículo. Intenta de nuevo.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
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
            {cubicles.map((cub) => {
              // Solo está ocupado por otro si: está marcado como ocupado Y el usuario ocupante es diferente al actual
              const isOccupiedByOther = cub.isOccupied && cub.occupiedBy && cub.occupiedBy.userId !== userId;

              console.log(`Cubicle ${cub.id} (${cub.name}):`, {
                isOccupied: cub.isOccupied,
                occupiedBy: cub.occupiedBy,
                currentUserId: userId,
                isOccupiedByOther,
                willBeDisabled: !cub.isActive || isOccupiedByOther
              });

              return (
                <option
                  key={cub.id}
                  value={cub.id}
                  disabled={!cub.isActive || isOccupiedByOther}
                  style={{
                    fontWeight: cub.isSpecial ? "bold" : "normal",
                    color: !cub.isActive ? "#A0AEC0" : isOccupiedByOther ? "#FC8181" : cub.isSpecial ? "#E53E3E" : "black",
                    fontStyle: isOccupiedByOther ? "italic" : "normal"
                  }}
                >
                  {cub.name}
                  {cub.isSpecial ? " ★" : ""}
                  {!cub.isActive ? " (Inactivo)" : ""}
                  {isOccupiedByOther ? ` (Ocupado por ${cub.occupiedBy.userName})` : ""}
                </option>
              );
            })}
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
