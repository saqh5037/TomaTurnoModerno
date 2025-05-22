import { Box, Heading, Text, VStack, Flex, Image, Divider } from '@chakra-ui/react';
import SidebarMenu from '../components/HamburgerMenu';

export default function HomePage() {
  return (
    <Flex>
      {/* Menú Lateral */}
      <SidebarMenu />

      {/* Contenido Principal */}
      <Box flex="1" ml="250px" p={8} background="gray.50" minH="100vh">
        <VStack spacing={8} align="center">

          {/* Título Principal */}
          <Box textAlign="center" p={4} bg="blue.700" color="white" borderRadius="md" shadow="md" w="full" maxW="800px">
            <Heading as="h1" size="xl" mb={2}>Bienvenido a TomaTurno</Heading>
            <Text fontSize="md">
              Optimiza la gestión de turnos en el laboratorio y mejora la experiencia de cada paciente.
            </Text>
          </Box>

          {/* Descripción del Sistema de Turnos */}
          <Box bg="white" p={6} borderRadius="md" shadow="md" w="full" maxW="800px" textAlign="center">
            <Heading as="h2" size="md" color="blue.600" mb={3}>
              Gestión Eficiente de Turnos
            </Heading>
            <Text fontSize="sm" color="gray.700">
              Nuestro sistema de turnos facilita el flujo de pacientes en el laboratorio, reduciendo tiempos de espera y mejorando la calidad de atención en cada etapa del proceso.
            </Text>
          </Box>

          {/* Sección: Importancia de la Salud */}
          <Box bg="blue.600" p={6} borderRadius="md" shadow="md" w="full" maxW="800px" textAlign="center" color="white">
            <Heading as="h2" size="md" mb={3}>La Importancia de la Salud</Heading>
            <Text fontSize="sm">
              Un sistema de salud efectivo es esencial para el bienestar de todos. En TomaTurno, apoyamos la misión de brindar una atención de calidad, ayudando a reducir tiempos y asegurar que cada minuto cuente.
            </Text>
          </Box>

          {/* Sección: Labor del INER */}
          <Box bg="white" p={6} borderRadius="md" shadow="md" w="full" maxW="800px" textAlign="center">
            <Heading as="h2" size="md" color="blue.600" mb={3}>
              La Labor del INER para los Mexicanos
            </Heading>
            <Text fontSize="sm" color="gray.700">
              El Instituto Nacional de Enfermedades Respiratorias (INER) desempeña un rol clave en la prevención y tratamiento de enfermedades respiratorias, brindando atención especializada y comprometida a miles de mexicanos.
            </Text>
          </Box>

         
          {/* Footer */}
          <Divider my={6} />
          <Text fontSize="xs" color="gray.500" textAlign="center">
            © Todos los derechos reservados a Dynamtek.com | by Labsis
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
}
