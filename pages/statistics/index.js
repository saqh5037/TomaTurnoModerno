import { Box, Heading, VStack, Link, Icon, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { FaChartBar, FaCalendarAlt, FaUserMd, FaClock } from "react-icons/fa";
import Layout from "../../components/Layout";

export default function StatisticsIndex() {
  return (
    <Layout>
      <Box p={5}>
        <Heading mb={8} textAlign="center" fontSize="2xl" color="blue.700">
          Estadísticas
        </Heading>
        <VStack spacing={4}>
          <NextLink href="/statistics/monthly" passHref>
            <Link
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              p={4}
              w="100%"
              maxW="400px"
              bg="blue.600"
              color="white"
              borderRadius="md"
              _hover={{ bg: "blue.700", textDecoration: "none" }}
            >
              <Icon as={FaCalendarAlt} boxSize={6} />
              <Text fontWeight="bold" fontSize="lg">
                Pacientes por Mes
              </Text>
            </Link>
          </NextLink>
          <NextLink href="/statistics/daily" passHref>
            <Link
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              p={4}
              w="100%"
              maxW="400px"
              bg="green.600"
              color="white"
              borderRadius="md"
              _hover={{ bg: "green.700", textDecoration: "none" }}
            >
              <Icon as={FaChartBar} boxSize={6} />
              <Text fontWeight="bold" fontSize="lg">
                Pacientes Diarios
              </Text>
            </Link>
          </NextLink>
          <NextLink href="/statistics/phlebotomists" passHref>
            <Link
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              p={4}
              w="100%"
              maxW="400px"
              bg="purple.600"
              color="white"
              borderRadius="md"
              _hover={{ bg: "purple.700", textDecoration: "none" }}
            >
              <Icon as={FaUserMd} boxSize={6} />
              <Text fontWeight="bold" fontSize="lg">
                Por Flebotomista
              </Text>
            </Link>
          </NextLink>
          <NextLink href="/statistics/average-time" passHref>
            <Link
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              p={4}
              w="100%"
              maxW="400px"
              bg="orange.600"
              color="white"
              borderRadius="md"
              _hover={{ bg: "orange.700", textDecoration: "none" }}
            >
              <Icon as={FaClock} boxSize={6} />
              <Text fontWeight="bold" fontSize="lg">
                Tiempo Promedio
              </Text>
            </Link>
          </NextLink>
        </VStack>
      </Box>
    </Layout>
  );
}
