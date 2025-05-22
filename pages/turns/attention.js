"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  Text,
  IconButton,
  useToast,
  Flex,
  Stack,
} from "@chakra-ui/react";
import { MdNotificationsActive, MdDone } from "react-icons/md"; // Campana y Check Verde
import { FaVolumeUp, FaWheelchair } from "react-icons/fa"; // Bocina y Silla de ruedas
import Layout from "@/components/Layout";

export default function Attention() {
  const [userId, setUserId] = useState(null);
  const [pendingTurns, setPendingTurns] = useState([]);
  const [inProgressTurns, setInProgressTurns] = useState([]);
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserId(payload.userId);
    }
  }, []);

  useEffect(() => {
    const fetchTurns = async () => {
      try {
        const response = await fetch("/api/attention/list");
        if (!response.ok) throw new Error("Error al cargar los turnos.");
        const data = await response.json();
        setPendingTurns(data.pendingTurns || []);
        setInProgressTurns(data.inProgressTurns || []);
      } catch (error) {
        console.error("Error al cargar los turnos:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los turnos.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchTurns();
    const intervalId = setInterval(fetchTurns, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleCallPatient = async (turnId) => {
    const cubicleId = localStorage.getItem("selectedCubicle");
    if (!cubicleId || !userId) {
      toast({
        title: "Error",
        description: "Faltan datos: cubículo o usuario no seleccionados.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch("/api/attention/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnId, userId, cubicleId }),
      });

      if (response.ok) {
        toast({
          title: "Paciente llamado",
          description: `El paciente con turno #${turnId} fue llamado.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error("Error al llamar al paciente.");
      }
    } catch (error) {
      console.error("Error al llamar al paciente:", error);
    }
  };

  const handleRepeatCall = async (turnId) => {
    try {
      const response = await fetch("/api/attention/repeatCall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnId }),
      });

      if (response.ok) {
        toast({
          title: "Llamado repetido",
          description: `El paciente con turno #${turnId} será llamado nuevamente.`,
          status: "info",
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error("Error al repetir el llamado.");
      }
    } catch (error) {
      console.error("Error al repetir el llamado:", error);
    }
  };

  const handleCompleteAttention = async (turnId) => {
    try {
      const response = await fetch("/api/attention/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnId }),
      });

      if (response.ok) {
        toast({
          title: "Atención finalizada",
          description: `El paciente con turno #${turnId} ha sido atendido.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error("Error al finalizar la atención.");
      }
    } catch (error) {
      console.error("Error al finalizar la atención:", error);
    }
  };

  return (
    <Layout>
      <Box maxW="800px" mx="auto" mt={4} p={4}>
        <Heading as="h2" mb={4}>
          Atención por Flebotomista
        </Heading>
        <Box>
          <Heading as="h3" size="md" mb={2}>
            Pacientes en Espera
          </Heading>
          <VStack align="stretch">
            {pendingTurns.map((turn) => (
              <Box
                key={turn.id}
                bg="gray.100"
                p={4}
                borderRadius="md"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Text fontSize="lg" fontWeight="bold">
                    {turn.patientName} - <strong>Turno:</strong> {turn.assignedTurn}{" "}
                    {turn.isSpecial && (
                      <FaWheelchair style={{ marginLeft: "5px", color: "red" }} />
                    )}
                  </Text>
                </Box>
                <IconButton
                  icon={<MdNotificationsActive />}
                  colorScheme="blue"
                  fontSize="2xl"
                  aria-label="Llamar Paciente"
                  onClick={() => handleCallPatient(turn.id)}
                />
              </Box>
            ))}
          </VStack>
        </Box>
        <Box mt={6}>
          <Heading as="h3" size="md" mb={2}>
            Pacientes en Atención
          </Heading>
          <Stack spacing={4}>
            {inProgressTurns.map((turn) => (
              <Flex
                key={turn.id}
                bg="yellow.100"
                p={4}
                borderRadius="md"
                align="center"
                justify="space-between"
                wrap="wrap"
              >
                <Box>
                  <Text fontSize="lg" fontWeight="bold">
                    {turn.patientName} - <strong>Turno:</strong> {turn.assignedTurn}{" "}
                    {turn.isSpecial && (
                      <FaWheelchair style={{ marginLeft: "5px", color: "red" }} />
                    )}
                  </Text>
                  <Text fontSize="sm"><strong>Cubículo:</strong> {turn.cubicleName}</Text>
                  <Text fontSize="sm"><strong>Flebotomista:</strong> {turn.flebotomistName}</Text>
                </Box>
                <Flex gap={4}>
                  <IconButton
                    icon={<FaVolumeUp />}
                    colorScheme="yellow"
                    fontSize="2xl"
                    aria-label="Repetir Llamado"
                    onClick={() => handleRepeatCall(turn.id)}
                  />
                  <IconButton
                    icon={<MdDone />}
                    colorScheme="green"
                    fontSize="2xl"
                    aria-label="Finalizar Atención"
                    onClick={() => handleCompleteAttention(turn.id)}
                  />
                </Flex>
              </Flex>
            ))}
          </Stack>
        </Box>
      </Box>
    </Layout>
  );
}
