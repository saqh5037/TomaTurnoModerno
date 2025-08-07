import { Box, Heading, Text } from "@chakra-ui/react";
import Layout from "../../components/Layout";

export default function StatisticsDashboard() {
  return (
    <Layout>
      <Box p={8}>
        <Heading size="lg" mb={4}>
          Dashboard Avanzado
        </Heading>
        <Text color="gray.600">
          Esta página está en construcción. Próximamente disponible con métricas avanzadas.
        </Text>
      </Box>
    </Layout>
  );
}