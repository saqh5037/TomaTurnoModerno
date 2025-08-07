import { useState, useEffect, memo } from "react";
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
  ChakraProvider,
  Spinner,
  Text,
  VStack,
  Badge,
  Flex,
  Tooltip
} from "@chakra-ui/react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend } from "chart.js";
import { FaFileExcel, FaFilePdf, FaArrowLeft, FaCalendarAlt, FaChartBar, FaDownload } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import { modernTheme, fadeInUp, slideInFromLeft, slideInFromRight, GlassCard, ModernContainer, ModernHeader } from '../../components/theme/ModernTheme';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

const MonthlyStatistics = memo(function MonthlyStatistics() {
  const [filteredStats, setFilteredStats] = useState(null);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [mounted, setMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();
  const { userRole } = useAuth();

  const monthOrder = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetch("/api/statistics/filters/years")
        .then((res) => res.json())
        .then(setYears)
        .catch((err) => console.error("Error fetching years:", err));

      applyFilters();
    }
  }, [mounted]);

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

  const handleExportToExcel = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay
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
    
    setIsExporting(false);
  };

  const handleExportToPDF = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Colores del tema (basados en el glassmorphism theme)
    const primaryColor = [79, 125, 243]; // primary.500
    const secondaryColor = [71, 85, 105]; // secondary.700
    const successColor = [16, 185, 129]; // success
    const lightGray = [248, 250, 252]; // gray.50
    
    // ==== PÁGINA 1: PORTADA ====
    // Fondo degradado sutil
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Header con línea decorativa
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    // Logo/Título principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('INSTITUTO NACIONAL DE ENFERMEDADES RESPIRATORIAS', pageWidth / 2, 12, { align: 'center' });
    doc.setFontSize(14);
    doc.text('ISMAEL COSÍO VILLEGAS (INER)', pageWidth / 2, 20, { align: 'center' });
    
    // Título del reporte
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('ESTADÍSTICAS MENSUALES', pageWidth / 2, 60, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'normal');
    doc.text('Reporte de Pacientes Atendidos por Mes', pageWidth / 2, 75, { align: 'center' });
    
    // Información del período
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.roundedRect(40, 90, pageWidth - 80, 30, 5, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`PERÍODO: AÑO ${selectedYear}`, pageWidth / 2, 102, { align: 'center' });
    doc.text(`TOTAL DE PACIENTES: ${filteredStats.total}`, pageWidth / 2, 112, { align: 'center' });
    
    // Información del reporte
    const now = new Date();
    const reportDate = now.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('INFORMACIÓN DEL REPORTE', 20, 150);
    
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${reportDate}`, 20, 165);
    doc.text(`Generado por: ${userRole} - Sistema INER`, 20, 175);
    doc.text('Sistema de Gestión de Turnos - Flebotomía', 20, 185);
    
    // Resumen estadístico
    const maxMonth = Object.entries(filteredStats.monthlyData).find(([_, count]) => count === Math.max(...Object.values(filteredStats.monthlyData)));
    const averagePerMonth = (filteredStats.total / Object.keys(filteredStats.monthlyData).length).toFixed(1);
    
    doc.text('RESUMEN EJECUTIVO', 20, 205);
    doc.text(`• Mes con mayor actividad: ${maxMonth[0]} (${maxMonth[1]} pacientes)`, 20, 220);
    doc.text(`• Promedio mensual: ${averagePerMonth} pacientes`, 20, 230);
    doc.text(`• Meses con datos: ${Object.keys(filteredStats.monthlyData).length}`, 20, 240);
    
    // Footer de portada
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(0, pageHeight - 25, pageWidth, 25, 'F');
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(8);
    doc.text('Desarrollado por DT Diagnósticos by Labsis © 2025', pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // ==== PÁGINA 2: DATOS DETALLADOS ====
    doc.addPage();
    
    // Header de página interna
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('ESTADÍSTICAS MENSUALES - DATOS DETALLADOS', pageWidth / 2, 10, { align: 'center' });
    
    // Tabla de datos mejorada
    const tableColumn = ["Mes", "Pacientes Atendidos", "% del Total"];
    const tableRows = Object.entries(filteredStats.monthlyData).map(([month, count]) => {
      const percentage = ((count / filteredStats.total) * 100).toFixed(1);
      return [month, count.toString(), `${percentage}%`];
    });
    
    // Fila de total
    tableRows.push({
      content: ["TOTAL GENERAL", filteredStats.total.toString(), "100.0%"],
      styles: { fillColor: [lightGray[0], lightGray[1], lightGray[2]], fontStyle: 'bold' }
    });
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      headStyles: { 
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 11,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 10,
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold' },
        1: { halign: 'center' },
        2: { halign: 'center' }
      },
      margin: { left: 15, right: 15 },
      theme: 'striped'
    });
    
    // Información adicional después de la tabla
    let finalY = doc.lastAutoTable.finalY + 20;
    
    // Análisis estadístico
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('ANÁLISIS ESTADÍSTICO', 15, finalY);
    
    finalY += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    const monthsWithData = Object.entries(filteredStats.monthlyData);
    const sortedMonths = monthsWithData.sort((a, b) => b[1] - a[1]);
    
    doc.text(`📊 Distribución por trimestres:`, 15, finalY);
    finalY += 8;
    
    // Análisis por trimestres
    const quarters = {
      'Q1': ['Enero', 'Febrero', 'Marzo'],
      'Q2': ['Abril', 'Mayo', 'Junio'], 
      'Q3': ['Julio', 'Agosto', 'Septiembre'],
      'Q4': ['Octubre', 'Noviembre', 'Diciembre']
    };
    
    Object.entries(quarters).forEach(([quarter, months]) => {
      const quarterTotal = months.reduce((sum, month) => {
        return sum + (filteredStats.monthlyData[month] || 0);
      }, 0);
      
      if (quarterTotal > 0) {
        doc.text(`   • ${quarter}: ${quarterTotal} pacientes`, 15, finalY);
        finalY += 6;
      }
    });
    
    // ==== PÁGINA 3: GRÁFICO ====
    if (finalY > pageHeight - 100) {
      doc.addPage();
      finalY = 25;
      
      // Header de página de gráfico
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('ESTADÍSTICAS MENSUALES - ANÁLISIS GRÁFICO', pageWidth / 2, 10, { align: 'center' });
      finalY = 25;
    }
    
    // Gráfico
    const chartCanvas = document.querySelector("canvas");
    if (chartCanvas) {
      const chartImage = chartCanvas.toDataURL("image/png", 1.0);
      const chartWidth = pageWidth - 30;
      const chartHeight = Math.min((chartCanvas.height / chartCanvas.width) * chartWidth, 120);
      
      // Marco para el gráfico
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(1);
      doc.rect(14, finalY - 1, chartWidth + 2, chartHeight + 2);
      
      doc.addImage(chartImage, "PNG", 15, finalY, chartWidth, chartHeight);
      finalY += chartHeight + 10;
    }
    
    // Footer en todas las páginas
    const addFooter = () => {
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setFontSize(8);
      doc.text(`Reporte generado el ${reportDate}`, 15, pageHeight - 10);
      doc.text(`Página ${doc.internal.getCurrentPageInfo().pageNumber}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
    };
    
    // Aplicar footer a todas las páginas
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      addFooter();
    }
    
    // Guardar con nombre descriptivo
    const fileName = `INER_EstadisticasMensuales_${selectedYear}_${now.toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    setIsExporting(false);
  };

  // No renderizar hasta que esté montado para evitar errores de hidratación
  if (!mounted) {
    return (
      <ChakraProvider theme={modernTheme}>
        <ModernContainer>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
          >
            <GlassCard p={8} textAlign="center">
              <Spinner size="xl" color="primary.500" thickness="4px" mb={4} />
              <Text fontSize="xl" color="secondary.600">
                Cargando Estadísticas Mensuales...
              </Text>
            </GlassCard>
          </Box>
        </ModernContainer>
      </ChakraProvider>
    );
  }

  if (!filteredStats) {
    return (
      <ChakraProvider theme={modernTheme}>
        <ModernContainer>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
          >
            <GlassCard p={8} textAlign="center">
              <Spinner size="xl" color="primary.500" thickness="4px" mb={4} />
              <VStack spacing={3}>
                <Heading size="lg" color="secondary.700">
                  Procesando datos...
                </Heading>
                <Text color="secondary.500">
                  Cargando estadísticas mensuales
                </Text>
              </VStack>
            </GlassCard>
          </Box>
        </ModernContainer>
      </ChakraProvider>
    );
  }

  const isAdmin = userRole === 'Administrador';
  const totalPatients = filteredStats.total;
  const maxMonthValue = Math.max(...Object.values(filteredStats.monthlyData));
  const monthWithMostPatients = Object.entries(filteredStats.monthlyData).find(([_, count]) => count === maxMonthValue);

  return (
    <ChakraProvider theme={modernTheme}>
      <ModernContainer>
        {/* Header Principal con Glassmorphism */}
        <ModernHeader
          title="Estadísticas Mensuales"
          subtitle={isAdmin ? "Análisis Detallado por Mes - Vista Completa" : "Estadísticas Mensuales - Vista Operativa"}
        >
          <Button
            leftIcon={<FaArrowLeft />}
            variant="outline"
            onClick={() => router.push("/statistics")}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'md'
            }}
          >
            Regresar
          </Button>
        </ModernHeader>

        {/* Controles y Filtros */}
        <GlassCard p={6} mb={8} animation={`${fadeInUp} 0.8s ease-out`}>
          <VStack align="start" spacing={6}>
            <Flex justify="space-between" align="center" w="full" wrap="wrap" gap={4}>
              <VStack align="start" spacing={1}>
                <Heading size="md" color="secondary.800" fontWeight="bold" display="flex" alignItems="center" gap={2}>
                  <Box as={FaCalendarAlt} color="primary.500" />
                  Filtros de Período
                </Heading>
                <Text fontSize="sm" color="secondary.600">
                  Selecciona el año para visualizar las estadísticas
                </Text>
              </VStack>

              {/* Métricas rápidas */}
              <HStack spacing={4} wrap="wrap">
                <VStack spacing={1} align="center">
                  <Text fontSize="xs" color="secondary.500">Total Pacientes</Text>
                  <Badge 
                    bg="rgba(79, 125, 243, 0.1)" 
                    color="primary.600" 
                    px={3} py={1} 
                    borderRadius="lg"
                    fontSize="md"
                    fontWeight="bold"
                  >
                    {totalPatients}
                  </Badge>
                </VStack>
                {monthWithMostPatients && (
                  <VStack spacing={1} align="center">
                    <Text fontSize="xs" color="secondary.500">Mes Pico</Text>
                    <Badge 
                      bg="rgba(16, 185, 129, 0.1)" 
                      color="success" 
                      px={3} py={1} 
                      borderRadius="lg"
                      fontSize="sm"
                      fontWeight="semibold"
                    >
                      {monthWithMostPatients[0]}
                    </Badge>
                  </VStack>
                )}
              </HStack>
            </Flex>

            <Flex gap={4} align="end" wrap="wrap">
              <FormControl maxW="250px">
                <FormLabel fontSize="sm" fontWeight="semibold" color="secondary.700">
                  Año a analizar
                </FormLabel>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  placeholder="Seleccionar Año"
                  variant="modern"
                  size="md"
                >
                  <option value="all">Todos los años</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="gradient"
                onClick={applyFilters}
                size="md"
                leftIcon={<FaChartBar />}
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'xl'
                }}
              >
                Aplicar Filtros
              </Button>
            </Flex>
          </VStack>
        </GlassCard>

        {/* Grid Principal */}
        <Flex direction={{ base: 'column', lg: 'row' }} gap={6} mb={8}>
          {/* Tabla de Datos */}
          <GlassCard flex="1" p={6} animation={`${slideInFromLeft} 1s ease-out`}>
            <VStack align="start" spacing={4}>
              <Heading size="md" color="secondary.800" fontWeight="bold" display="flex" alignItems="center" gap={2}>
                <Box as={FaCalendarAlt} color="primary.500" />
                Datos Mensuales {selectedYear !== 'all' && `- ${selectedYear}`}
              </Heading>
              
              <Box w="full" overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th 
                        bg="rgba(79, 125, 243, 0.1)" 
                        color="primary.700" 
                        fontWeight="bold"
                        borderColor="rgba(79, 125, 243, 0.2)"
                      >
                        Mes
                      </Th>
                      <Th 
                        isNumeric 
                        bg="rgba(79, 125, 243, 0.1)" 
                        color="primary.700" 
                        fontWeight="bold"
                        borderColor="rgba(79, 125, 243, 0.2)"
                      >
                        Pacientes
                      </Th>
                      <Th 
                        bg="rgba(79, 125, 243, 0.1)" 
                        color="primary.700" 
                        fontWeight="bold"
                        borderColor="rgba(79, 125, 243, 0.2)"
                      >
                        % del Total
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Object.entries(filteredStats.monthlyData).map(([month, count]) => {
                      const percentage = ((count / totalPatients) * 100).toFixed(1);
                      const isHighest = count === maxMonthValue;
                      return (
                        <Tr key={month} bg={isHighest ? 'rgba(16, 185, 129, 0.05)' : 'transparent'}>
                          <Td 
                            fontWeight={isHighest ? 'bold' : 'normal'}
                            color={isHighest ? 'success' : 'secondary.700'}
                          >
                            {month}
                          </Td>
                          <Td 
                            isNumeric 
                            fontWeight={isHighest ? 'bold' : 'normal'}
                            color={isHighest ? 'success' : 'secondary.700'}
                          >
                            {count}
                          </Td>
                          <Td>
                            <Badge
                              bg={isHighest ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)'}
                              color={isHighest ? 'success' : 'secondary.600'}
                              px={2}
                              py={1}
                              borderRadius="md"
                              fontSize="xs"
                            >
                              {percentage}%
                            </Badge>
                          </Td>
                        </Tr>
                      )
                    })}
                    <Tr 
                      bg="rgba(79, 125, 243, 0.1)" 
                      fontWeight="bold"
                      borderTop="2px solid rgba(79, 125, 243, 0.2)"
                    >
                      <Td fontWeight="bold" color="primary.700">Total</Td>
                      <Td isNumeric fontWeight="bold" color="primary.700">{totalPatients}</Td>
                      <Td>
                        <Badge
                          bg="rgba(79, 125, 243, 0.2)"
                          color="primary.700"
                          px={2}
                          py={1}
                          borderRadius="md"
                          fontSize="xs"
                          fontWeight="bold"
                        >
                          100%
                        </Badge>
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>
              </Box>
            </VStack>
          </GlassCard>

          {/* Panel de Acciones */}
          <GlassCard maxW={{ base: 'full', lg: '350px' }} p={6} animation={`${slideInFromRight} 1s ease-out`}>
            <VStack align="start" spacing={6}>
              <VStack align="start" spacing={2}>
                <Heading size="md" color="secondary.800" fontWeight="bold" display="flex" alignItems="center" gap={2}>
                  <Box as={FaDownload} color="secondary.500" />
                  Exportar Datos
                </Heading>
                <Text fontSize="sm" color="secondary.600">
                  Descarga los datos en diferentes formatos
                </Text>
              </VStack>

              <VStack spacing={3} w="full">
                <Tooltip label="Descargar en formato Excel" hasArrow>
                  <Button
                    leftIcon={<FaFileExcel />}
                    colorScheme="green"
                    variant="outline"
                    size="md"
                    w="full"
                    onClick={handleExportToExcel}
                    isLoading={isExporting}
                    loadingText="Generando..."
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'md'
                    }}
                  >
                    Exportar Excel
                  </Button>
                </Tooltip>
                
                <Tooltip label="Descargar en formato PDF" hasArrow>
                  <Button
                    leftIcon={<FaFilePdf />}
                    colorScheme="red"
                    variant="outline"
                    size="md"
                    w="full"
                    onClick={handleExportToPDF}
                    isLoading={isExporting}
                    loadingText="Generando..."
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'md'
                    }}
                  >
                    Exportar PDF
                  </Button>
                </Tooltip>
              </VStack>

              {/* Información adicional */}
              <Box
                p={4}
                background="rgba(79, 125, 243, 0.1)"
                borderRadius="lg"
                border="1px solid rgba(79, 125, 243, 0.2)"
                w="full"
              >
                <VStack spacing={2} align="start">
                  <Text fontSize="sm" color="primary.700" fontWeight="semibold">
                    💡 Información
                  </Text>
                  <Text fontSize="xs" color="primary.600">
                    Los datos se actualizan automáticamente. El gráfico incluye tendencias visuales para mejor análisis.
                  </Text>
                </VStack>
              </Box>
            </VStack>
          </GlassCard>
        </Flex>

        {/* Gráfica */}
        <GlassCard p={6} mb={8} animation={`${fadeInUp} 1.2s ease-out`}>
          <VStack align="start" spacing={4}>
            <Heading size="md" color="secondary.800" fontWeight="bold" display="flex" alignItems="center" gap={2}>
              <Box as={FaChartBar} color="warning" />
              Gráfica de Tendencias Mensuales
            </Heading>
            
            <Box w="full" h="400px">
              <Bar
                data={{
                  labels: Object.keys(filteredStats.monthlyData),
                  datasets: [
                    {
                      label: "Pacientes Atendidos",
                      data: Object.values(filteredStats.monthlyData),
                      backgroundColor: "rgba(79, 125, 243, 0.6)",
                      borderColor: "rgba(79, 125, 243, 1)",
                      borderWidth: 2,
                      borderRadius: 8,
                      borderSkipped: false,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'top',
                    },
                    tooltip: {
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      titleColor: '#1e293b',
                      bodyColor: '#475569',
                      borderColor: 'rgba(79, 125, 243, 0.3)',
                      borderWidth: 1,
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        color: 'rgba(148, 163, 184, 0.1)',
                      },
                      ticks: {
                        color: '#64748b',
                      },
                    },
                    y: {
                      grid: {
                        color: 'rgba(148, 163, 184, 0.1)',
                      },
                      ticks: {
                        color: '#64748b',
                      },
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </Box>
          </VStack>
        </GlassCard>

        {/* Footer */}
        <Box
          as="footer"
          p={4}
          textAlign="center"
          background="rgba(255, 255, 255, 0.25)"
          backdropFilter="blur(20px)"
          color="secondary.600"
          borderRadius="lg"
          fontSize="sm"
          animation={`${fadeInUp} 1.5s ease-out`}
        >
          <Text>
            Instituto Nacional de Enfermedades Respiratorias Ismael Cosío Villegas (INER) | 
            Desarrollado por DT Diagnósticos by Labsis © {new Date().getFullYear()}
          </Text>
        </Box>
      </ModernContainer>
    </ChakraProvider>
  );
});

export default MonthlyStatistics;
