import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  HStack,
  Button,
  Select,
  FormControl,
  FormLabel,
  IconButton,
} from "@chakra-ui/react";
import { Bar } from "react-chartjs-2";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Layout from "../../components/Layout";
import { useRouter } from "next/router";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registrar módulos requeridos
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function PhlebotomistsStatistics() {
  const [filteredStats, setFilteredStats] = useState(null);
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [phlebotomists, setPhlebotomists] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedPhlebotomist, setSelectedPhlebotomist] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const monthOrder = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const yearsResponse = await fetch("/api/statistics/filters/years");
        if (!yearsResponse.ok) throw new Error("Error al cargar los años");
        const yearsData = await yearsResponse.json();
        setYears(yearsData);

        const phlebotomistsResponse = await fetch(
          "/api/statistics/filters/phlebotomists"
        );
        if (!phlebotomistsResponse.ok)
          throw new Error("Error al cargar los flebotomistas");
        const phlebotomistsData = await phlebotomistsResponse.json();
        setPhlebotomists(phlebotomistsData);
      } catch (err) {
        console.error(err);
        setError("Error al cargar los filtros");
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
    setMonths(monthOrder);
  }, []);

  const applyFilters = async () => {
    if (!selectedPhlebotomist) return;

    setLoading(true);
    setError(null);

    try {
      const body = {
        year: selectedYear ? parseInt(selectedYear) : null,
        month: selectedMonth ? monthOrder.indexOf(selectedMonth) + 1 : null,
        phlebotomistId: selectedPhlebotomist || null,
      };

      const response = await fetch("/api/statistics/phlebotomists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setFilteredStats(data);
    } catch (err) {
      setError("Error al cargar los datos. Por favor, inténtalo de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportToExcel = () => {
    if (!filteredStats) return;

    const flatData = filteredStats.dailyData.map(({ day, count }) => ({
      Día: day,
      Pacientes: count,
    }));
    flatData.push({ Día: "Total", Pacientes: filteredStats.total });

    const worksheet = XLSX.utils.json_to_sheet(flatData);
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [[`Pacientes por Día - Flebotomista (${selectedYear}, ${selectedMonth})`]],
      { origin: "A1" }
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pacientes por Día");
    XLSX.writeFile(workbook, `PacientesPorDia_Flebotomista.xlsx`);
  };
  const handleExportToPDF = () => {
    if (!filteredStats) return;
  
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
  
    // Título
    doc.setFontSize(18);
    doc.text(
      `Pacientes Atendidos por Día - Flebotomista`,
      pageWidth / 2,
      10,
      { align: "center" }
    );
  
    // Filtros aplicados
    doc.setFontSize(12);
    doc.text(`Año: ${selectedYear}`, 10, 20);
    doc.text(`Mes: ${selectedMonth}`, 10, 30);
    doc.text(
      `Flebotomista: ${
        phlebotomists.find((p) => p.id == selectedPhlebotomist)?.name || ""
      }`,
      10,
      40
    );
  
    // Tabla de resultados
    const tableColumn = ["Día", "Pacientes"];
    const tableRows = filteredStats.dailyData.map(({ day, count }) => [day, count]);
    tableRows.push(["Total", filteredStats.total]);
  
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 10, right: 10 },
    });
  
    // Agregar una nueva página para la gráfica
    doc.addPage();
    doc.setFontSize(16);
    doc.text("Gráfica de Pacientes por Día", pageWidth / 2, 20, { align: "center" });
  
    // Renderizar gráfica como imagen y agregar al PDF
    const canvas = document.querySelector("canvas"); // Seleccionar el canvas de la gráfica
    const imageData = canvas.toDataURL("image/png"); // Convertir la gráfica a base64
  
    doc.addImage(imageData, "PNG", 10, 30, pageWidth - 20, 80); // Ajustar tamaño y posición
  
    doc.save(`PacientesPorDia_Flebotomista.pdf`);
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
          Pacientes Atendidos por Flebotomista
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
          <FormControl maxW="200px">
            <FormLabel>Flebotomista</FormLabel>
            <Select
              value={selectedPhlebotomist}
              onChange={(e) => setSelectedPhlebotomist(e.target.value)}
              placeholder="Seleccionar Flebotomista"
            >
              {phlebotomists.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </Select>
          </FormControl>
          <Button
            colorScheme="blue"
            onClick={applyFilters}
            isDisabled={!selectedPhlebotomist}
          >
            Filtrar
          </Button>
        </HStack>

        {filteredStats && (
          <>
            {/* Almanaque */}
            <Box mb={5}>
              <Heading size="md" mb={3} color="blue.600">
                Almanaque de Pacientes Atendidos
              </Heading>
              <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap={2}>
                {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                  <Box
                    key={day}
                    textAlign="center"
                    fontWeight="bold"
                    color="blue.600"
                    bg="gray.100"
                    p={2}
                    borderRadius="md"
                  >
                    {day}
                  </Box>
                ))}
                {Array.from(
                  { length: new Date(selectedYear, months.indexOf(selectedMonth) + 1, 0).getDate() },
                  (_, i) => (
                    <Box
                      key={i + 1}
                      textAlign="center"
                      bg="blue.50"
                      p={3}
                      borderRadius="md"
                      border="1px solid"
                      borderColor="blue.100"
                    >
                      <Heading size="sm">{i + 1}</Heading>
                      <Box mt={2}>{filteredStats.dailyData[i]?.count || 0} pacientes</Box>
                    </Box>
                  )
                )}
              </Box>
            </Box>

            {/* Gráfica */}
            <Box mb={5}>
              <Heading size="md" mb={3} color="blue.600">
                Gráfica de Pacientes por Día
              </Heading>
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

            {/* Botones de Descarga */}
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

            {/* Botón de Regresar */}
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
