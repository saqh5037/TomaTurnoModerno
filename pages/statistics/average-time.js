import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Box, Heading, Button, Stack } from "@chakra-ui/react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";

export default function AverageTimeStatistics() {
  const [averageTimeStats, setAverageTimeStats] = useState([]);

  useEffect(() => {
    fetch("/api/statistics/average-time")
      .then((res) => res.json())
      .then(setAverageTimeStats);
  }, []);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(averageTimeStats);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tiempo Promedio");
    XLSX.writeFile(workbook, "TiempoPromedio.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Tiempo Promedio por Flebotomista", 10, 10);
    averageTimeStats.forEach((item, index) => {
      doc.text(`${index + 1}. ${JSON.stringify(item)}`, 10, 20 + index * 10);
    });
    doc.save("TiempoPromedio.pdf");
  };

  return (
    <Box p={5}>
      <Heading mb={5} size="lg" textAlign="center" color="orange.700">
        Tiempo Promedio por Flebotomista
      </Heading>
      <Stack spacing={4} mb={5}>
        <Button colorScheme="blue" onClick={exportToExcel}>
          Exportar a Excel
        </Button>
        <Button colorScheme="red" onClick={exportToPDF}>
          Exportar a PDF
        </Button>
      </Stack>
      <Bar
        data={{
          labels: averageTimeStats.map((item) => item.phlebotomistId),
          datasets: [
            {
              label: "Tiempo Promedio (minutos)",
              data: averageTimeStats.map((item) => item._avg.duration),
              backgroundColor: "#fd7e14",
            },
          ],
        }}
      />
    </Box>
  );
}
