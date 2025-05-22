import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  HStack,
  Button,
  Select,
  FormControl,
  FormLabel,
  Text,
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

export default function DailyStatistics() {
  const [filteredStats, setFilteredStats] = useState({ dailyData: [], total: 0 });
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

    setMonths(monthOrder);
  }, []);

  const applyFilters = async () => {
    setLoading(true);
    setError(null);

    try {
      const body = {
        year: selectedYear ? parseInt(selectedYear) : null,
        month: selectedMonth ? monthOrder.indexOf(selectedMonth) + 1 : null,
      };

      const response = await fetch("/api/statistics/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      const daysInMonth = new Date(body.year, body.month, 0).getDate();
      const completeData = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        return {
          day,
          count: data.dailyData?.[day] || 0,
        };
      });

      setFilteredStats({ dailyData: completeData, total: data.total || 0 });
    } catch (err) {
      setError("Error al cargar los datos. Por favor, inténtalo de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportToExcel = () => {
    const flatData = filteredStats.dailyData.map(({ day, count }) => ({
      Día: day,
      Pacientes: count,
    }));
    flatData.push({ Día: "Total", Pacientes: filteredStats.total });

    const worksheet = XLSX.utils.json_to_sheet(flatData);
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [["Pacientes por Día - Año " + selectedYear + " Mes " + selectedMonth]],
      { origin: "A1" }
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pacientes por Día");
    XLSX.writeFile(workbook, `PacientesPorDia_Año${selectedYear}_Mes${selectedMonth}.xlsx`);
  };

  const handleExportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Título en la primera página
    doc.setFontSize(18);
    doc.text(`Pacientes Atendidos por Día - Año ${selectedYear} Mes ${selectedMonth}`, pageWidth / 2, 10, {
      align: "center",
    });

    // Tabla en la primera página
    const tableColumn = ["Día", "Pacientes"];
    const tableRows = filteredStats.dailyData.map(({ day, count }) => [day, count]);
    tableRows.push(["Total", filteredStats.total]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 10, right: 10 },
    });

    // Gráfica en la segunda página
    doc.addPage();
    const chartCanvas = document.querySelector("canvas");
    if (chartCanvas) {
      const chartImage = chartCanvas.toDataURL("image/png");
      const chartWidth = pageWidth - 20;
      const chartHeight = (chartCanvas.height / chartCanvas.width) * chartWidth;

      doc.addImage(chartImage, "PNG", 10, 20, chartWidth, chartHeight);
    }

    doc.save(`PacientesPorDia_Año${selectedYear}_Mes${selectedMonth}.pdf`);
  };

  if (loading) {
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

  if (error) {
    return (
      <Layout>
        <Box p={5}>
          <Heading size="md" textAlign="center" color="red.500">
            {error}
          </Heading>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box p={5}>
        <Heading size="lg" mb={5} textAlign="center" color="blue.700">
          Pacientes Atendidos por Día
        </Heading>
        <HStack spacing={4} mb={5}>
          <FormControl maxW="200px">
            <FormLabel>Año</FormLabel>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              placeholder="Seleccionar Año"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl maxW="200px">
            <FormLabel>Mes</FormLabel>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              placeholder="Seleccionar Mes"
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </Select>
          </FormControl>
          <Button colorScheme="blue" onClick={applyFilters}>
            Filtrar
          </Button>
        </HStack>

        {filteredStats.dailyData.length > 0 && (
          <>
            <Box mb={5}>
              <Heading size="md" mb={3} color="blue.600">
                Almanaque de Pacientes
              </Heading>
              <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap={4}>
                {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((dayName, index) => (
                  <Box key={index} textAlign="center" fontWeight="bold" color="blue.700">
                    {dayName}
                  </Box>
                ))}
                {filteredStats.dailyData.map(({ day, count }) => (
                  <Box
                    key={day}
                    p={3}
                    border="1px solid"
                    borderColor="gray.300"
                    borderRadius="md"
                    textAlign="center"
                    bg={count > 0 ? "green.100" : "gray.100"}
                  >
                    <Text fontWeight="bold" fontSize="lg">
                      {day}
                    </Text>
                    <Text fontSize="sm">{count} pacientes</Text>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box mb={5}>
              <Bar
                data={{
                  labels: filteredStats.dailyData.map(({ day }) => `Día ${day}`),
                  datasets: [
                    {
                      label: "Pacientes por Día",
                      data: filteredStats.dailyData.map(({ count }) => count),
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
          </>
        )}
      </Box>
    </Layout>
  );
}
