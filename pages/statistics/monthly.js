import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Button,
  Select,
  FormControl,
  FormLabel,
  IconButton,
} from "@chakra-ui/react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import { ArrowBackIcon } from "@chakra-ui/icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Layout from "../../components/Layout";
import { useRouter } from "next/router";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function MonthlyStatistics() {
  const [filteredStats, setFilteredStats] = useState(null);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const router = useRouter();

  const monthOrder = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  useEffect(() => {
    fetch("/api/statistics/filters/years")
      .then((res) => res.json())
      .then(setYears)
      .catch((err) => console.error("Error fetching years:", err));

    applyFilters();
  }, []);

  const applyFilters = async () => {
    try {
      const body = { year: selectedYear !== "all" ? parseInt(selectedYear) : null };
      const response = await fetch("/api/statistics/monthly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      const orderedData = Object.entries(data.monthlyData)
        .sort((a, b) => monthOrder.indexOf(a[0]) - monthOrder.indexOf(b[0]))
        .reduce((acc, [month, count]) => {
          acc[month] = count;
          return acc;
        }, {});

      setFilteredStats({ ...data, monthlyData: orderedData });
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  const handleExportToExcel = () => {
    const flatData = Object.entries(filteredStats.monthlyData).map(([month, count]) => ({
      Mes: month,
      Pacientes: count,
    }));
    flatData.push({ Mes: "Total", Pacientes: filteredStats.total });

    const worksheet = XLSX.utils.json_to_sheet(flatData);
    XLSX.utils.sheet_add_aoa(worksheet, [["Pacientes por Mes - Año " + selectedYear]], { origin: "A1" });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pacientes por Mes");
    XLSX.writeFile(workbook, `PacientesPorMes_Año${selectedYear}.xlsx`);
  };

  const handleExportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    doc.setFontSize(18);
    doc.text(`Pacientes Atendidos por Mes - Año ${selectedYear}`, pageWidth / 2, 10, { align: "center" });

    const tableColumn = ["Mes", "Pacientes"];
    const tableRows = Object.entries(filteredStats.monthlyData).map(([month, count]) => [month, count]);
    tableRows.push(["Total", filteredStats.total]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 10, right: 10 },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    const chartCanvas = document.querySelector("canvas");
    if (chartCanvas) {
      const chartImage = chartCanvas.toDataURL("image/png");
      const chartWidth = pageWidth - 20;
      const chartHeight = (chartCanvas.height / chartCanvas.width) * chartWidth;

      doc.addImage(chartImage, "PNG", 10, finalY, chartWidth, chartHeight);
    }

    doc.save(`PacientesPorMes_Año${selectedYear}.pdf`);
  };

  if (!filteredStats) {
    return (
      <Layout>
        <Box p={5}>
          <Heading size="md" textAlign="center">
            Cargando datos...
          </Heading>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box p={5}>
        <Heading size="lg" mb={5} textAlign="center" color="blue.700">
          Pacientes Atendidos por Mes
        </Heading>
        <HStack spacing={4} mb={5}>
          <FormControl maxW="200px">
            <FormLabel>Año</FormLabel>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              placeholder="Seleccionar Año"
            >
              <option value="all">Todos</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
          </FormControl>
          <Button colorScheme="blue" onClick={applyFilters}>
            Filtrar
          </Button>
        </HStack>

        <Table variant="simple" size="sm" mb={5}>
          <Thead>
            <Tr>
              <Th>Mes</Th>
              <Th isNumeric>Pacientes</Th>
            </Tr>
          </Thead>
          <Tbody>
            {Object.entries(filteredStats.monthlyData).map(([month, count]) => (
              <Tr key={month}>
                <Td>{month}</Td>
                <Td isNumeric>{count}</Td>
              </Tr>
            ))}
            <Tr fontWeight="bold">
              <Td>Total</Td>
              <Td isNumeric>{filteredStats.total}</Td>
            </Tr>
          </Tbody>
        </Table>

        <Box mb={5}>
          <Bar
            data={{
              labels: Object.keys(filteredStats.monthlyData),
              datasets: [
                {
                  label: "Pacientes por Mes",
                  data: Object.values(filteredStats.monthlyData),
                  backgroundColor: "rgba(54, 162, 235, 0.5)",
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: true,
            }}
          />
        </Box>

        <HStack spacing={4} mb={5}>
          <IconButton
            icon={<FaFileExcel />}
            colorScheme="green"
            onClick={handleExportToExcel}
            aria-label="Exportar a Excel"
          />
          <IconButton
            icon={<FaFilePdf />}
            colorScheme="red"
            onClick={handleExportToPDF}
            aria-label="Exportar a PDF"
          />
        </HStack>

        <Button
          leftIcon={<ArrowBackIcon />}
          colorScheme="blue"
          onClick={() => router.push("/statistics")}
        >
          Regresar
        </Button>
      </Box>
    </Layout>
  );
}
