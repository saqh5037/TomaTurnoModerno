import { useState, useEffect, memo } from "react";
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
  ChakraProvider,
  Spinner,
  VStack,
  Badge,
  Flex,
  Tooltip,
  SimpleGrid
} from "@chakra-ui/react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend } from "chart.js";
import { FaFileExcel, FaFilePdf, FaArrowLeft, FaCalendarAlt, FaChartBar, FaDownload, FaCalendarDay } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import { modernTheme, fadeInUp, slideInFromLeft, slideInFromRight, GlassCard, ModernContainer, ModernHeader } from '../../components/theme/ModernTheme';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

const DailyStatistics = memo(function DailyStatistics() {
  const [filteredStats, setFilteredStats] = useState({ dailyData: [], total: 0 });
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

      setMonths(monthOrder);
    }
  }, [mounted]);

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

  const handleExportToExcel = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
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
    const warningColor = [245, 158, 11]; // warning
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
    doc.text('ESTADÍSTICAS DIARIAS', pageWidth / 2, 60, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'normal');
    doc.text('Reporte de Pacientes Atendidos por Día', pageWidth / 2, 75, { align: 'center' });
    
    // Información del período
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.roundedRect(40, 90, pageWidth - 80, 40, 5, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`PERÍODO: ${selectedMonth.toUpperCase()} ${selectedYear}`, pageWidth / 2, 105, { align: 'center' });
    doc.text(`TOTAL DE PACIENTES: ${filteredStats.total}`, pageWidth / 2, 118, { align: 'center' });
    
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
    const daysInMonth = new Date(selectedYear, monthOrder.indexOf(selectedMonth) + 1, 0).getDate();
    const maxDayData = filteredStats.dailyData.reduce((max, day) => day.count > max.count ? day : max, {count: 0, day: 0});
    const averagePerDay = (filteredStats.total / daysInMonth).toFixed(1);
    const daysWithActivity = filteredStats.dailyData.filter(d => d.count > 0).length;
    
    doc.text('RESUMEN EJECUTIVO', 20, 205);
    doc.text(`• Día con mayor actividad: ${maxDayData.day} (${maxDayData.count} pacientes)`, 20, 220);
    doc.text(`• Promedio diario: ${averagePerDay} pacientes`, 20, 230);
    doc.text(`• Días con actividad: ${daysWithActivity} de ${daysInMonth}`, 20, 240);
    doc.text(`• Días del mes analizados: ${daysInMonth}`, 20, 250);
    
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
    doc.text(`ESTADÍSTICAS DIARIAS - ${selectedMonth.toUpperCase()} ${selectedYear}`, pageWidth / 2, 10, { align: 'center' });
    
    // Crear tabla con todas las fechas del mes (incluso días sin datos)
    const tableColumn = ["Día", "Fecha", "Pacientes Atendidos", "% del Total"];
    const tableRows = [];
    
    // Generar todas las fechas del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = filteredStats.dailyData.find(d => d.day === day);
      const count = dayData ? dayData.count : 0;
      const percentage = filteredStats.total > 0 ? ((count / filteredStats.total) * 100).toFixed(1) : "0.0";
      const date = `${day.toString().padStart(2, '0')}/${(monthOrder.indexOf(selectedMonth) + 1).toString().padStart(2, '0')}/${selectedYear}`;
      
      // Destacar días con mayor actividad
      const rowStyle = count === maxDayData.count && count > 0 
        ? { fillColor: [255, 248, 220] } // Color dorado suave para día pico
        : count === 0 
        ? { fillColor: [248, 250, 252] } // Gris claro para días sin actividad
        : {};
      
      tableRows.push({
        content: [day.toString(), date, count.toString(), `${percentage}%`],
        styles: rowStyle
      });
    }
    
    // Fila de total
    tableRows.push({
      content: ["TOTAL", `${selectedMonth} ${selectedYear}`, filteredStats.total.toString(), "100.0%"],
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
        fontSize: 10,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center', fontStyle: 'bold' },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' }
      },
      margin: { left: 10, right: 10 },
      theme: 'plain',
      pageBreak: 'auto'
    });
    
    // ==== PÁGINA 3: ANÁLISIS SEMANAL ====
    doc.addPage();
    
    // Header de página de análisis
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('ANÁLISIS SEMANAL Y PATRONES', pageWidth / 2, 10, { align: 'center' });
    
    let currentY = 30;
    
    // Análisis por semanas
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('DISTRIBUCIÓN POR SEMANAS DEL MES', 15, currentY);
    
    currentY += 15;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    // Calcular estadísticas por semanas
    const weeks = [];
    let currentWeek = [];
    let weekNumber = 1;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = filteredStats.dailyData.find(d => d.day === day);
      const count = dayData ? dayData.count : 0;
      currentWeek.push({ day, count });
      
      // Si es domingo (día 0) o último día del mes, cerrar semana
      const date = new Date(selectedYear, monthOrder.indexOf(selectedMonth), day);
      if (date.getDay() === 0 || day === daysInMonth) {
        const weekTotal = currentWeek.reduce((sum, d) => sum + d.count, 0);
        weeks.push({
          number: weekNumber,
          days: [...currentWeek],
          total: weekTotal,
          average: (weekTotal / currentWeek.length).toFixed(1)
        });
        currentWeek = [];
        weekNumber++;
      }
    }
    
    weeks.forEach(week => {
      doc.text(`📅 Semana ${week.number}: ${week.total} pacientes (promedio: ${week.average}/día)`, 15, currentY);
      currentY += 8;
    });
    
    // Patrones de actividad
    currentY += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('PATRONES DE ACTIVIDAD', 15, currentY);
    
    currentY += 15;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    // Análisis de días de la semana
    const weekdayAnalysis = {};
    const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, monthOrder.indexOf(selectedMonth), day);
      const weekdayName = weekdays[date.getDay()];
      const dayData = filteredStats.dailyData.find(d => d.day === day);
      const count = dayData ? dayData.count : 0;
      
      if (!weekdayAnalysis[weekdayName]) {
        weekdayAnalysis[weekdayName] = { total: 0, days: 0 };
      }
      weekdayAnalysis[weekdayName].total += count;
      weekdayAnalysis[weekdayName].days += 1;
    }
    
    doc.text('📊 Actividad promedio por día de la semana:', 15, currentY);
    currentY += 10;
    
    Object.entries(weekdayAnalysis).forEach(([weekday, data]) => {
      const average = (data.total / data.days).toFixed(1);
      doc.text(`   • ${weekday}: ${average} pacientes/día (total: ${data.total})`, 15, currentY);
      currentY += 7;
    });
    
    // ==== PÁGINA 4: GRÁFICO ====
    doc.addPage();
    
    // Header de página de gráfico
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('ANÁLISIS GRÁFICO - TENDENCIAS DIARIAS', pageWidth / 2, 10, { align: 'center' });
    
    // Gráfico
    const chartCanvas = document.querySelector("canvas");
    if (chartCanvas) {
      const chartImage = chartCanvas.toDataURL("image/png", 1.0);
      const chartWidth = pageWidth - 30;
      const chartHeight = Math.min((chartCanvas.height / chartCanvas.width) * chartWidth, 150);
      
      // Marco para el gráfico
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(1);
      doc.rect(14, 24, chartWidth + 2, chartHeight + 2);
      
      doc.addImage(chartImage, "PNG", 15, 25, chartWidth, chartHeight);
      
      // Leyenda del gráfico
      const legendY = 25 + chartHeight + 20;
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setFontSize(10);
      doc.text('Interpretación del gráfico:', 15, legendY);
      doc.text('• Las barras más altas indican días de mayor actividad', 15, legendY + 10);
      doc.text('• Los colores diferenciados ayudan a identificar patrones', 15, legendY + 20);
      doc.text(`• El día pico fue el ${maxDayData.day} con ${maxDayData.count} pacientes`, 15, legendY + 30);
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
    const fileName = `INER_EstadisticasDiarias_${selectedMonth}${selectedYear}_${now.toISOString().split('T')[0]}.pdf`;
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
                Cargando Estadísticas Diarias...
              </Text>
            </GlassCard>
          </Box>
        </ModernContainer>
      </ChakraProvider>
    );
  }

  if (loading) {
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
                  Cargando estadísticas diarias
                </Text>
              </VStack>
            </GlassCard>
          </Box>
        </ModernContainer>
      </ChakraProvider>
    );
  }

  if (error) {
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
              <VStack spacing={4}>
                <Heading size="lg" color="error">
                  Error al cargar datos
                </Heading>
                <Text color="secondary.600" textAlign="center">
                  {error}
                </Text>
                <Button
                  variant="gradient"
                  onClick={() => window.location.reload()}
                >
                  Reintentar
                </Button>
              </VStack>
            </GlassCard>
          </Box>
        </ModernContainer>
      </ChakraProvider>
    );
  }

  const isAdmin = userRole === 'Administrador';
  const totalPatients = filteredStats.total;
  const hasData = filteredStats.dailyData.length > 0;
  const maxDayValue = hasData ? Math.max(...filteredStats.dailyData.map(d => d.count)) : 0;
  const averagePerDay = hasData ? (totalPatients / filteredStats.dailyData.length).toFixed(1) : 0;

  return (
    <ChakraProvider theme={modernTheme}>
      <ModernContainer>
        {/* Header Principal con Glassmorphism */}
        <ModernHeader
          title="Estadísticas Diarias"
          subtitle={isAdmin ? "Análisis Detallado por Día - Vista Completa" : "Estadísticas Diarias - Vista Operativa"}
        >
        </ModernHeader>
        
        {/* Botón de Volver */}
        <Flex align="center" gap={4} justify="flex-start" mb={6}>
          <Button
            leftIcon={<FaArrowLeft />}
            onClick={() => router.push("/statistics")}
            variant="outline"
            colorScheme="gray"
            size="sm"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'md'
            }}
          >
            Volver
          </Button>
        </Flex>

        {/* Controles y Filtros */}
        <GlassCard p={6} mb={8} animation={`${fadeInUp} 0.8s ease-out`}>
          <VStack align="start" spacing={6}>
            <Flex justify="space-between" align="center" w="full" wrap="wrap" gap={4}>
              <VStack align="start" spacing={1}>
                <Heading size="md" color="secondary.800" fontWeight="bold" display="flex" alignItems="center" gap={2}>
                  <Box as={FaCalendarDay} color="primary.500" />
                  Filtros de Período
                </Heading>
                <Text fontSize="sm" color="secondary.600">
                  Selecciona año y mes específicos para el análisis
                </Text>
              </VStack>

              {/* Métricas rápidas */}
              {hasData && (
                <HStack spacing={4} wrap="wrap">
                  <VStack spacing={1} align="center">
                    <Text fontSize="xs" color="secondary.500">Total</Text>
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
                  <VStack spacing={1} align="center">
                    <Text fontSize="xs" color="secondary.500">Promedio</Text>
                    <Badge 
                      bg="rgba(16, 185, 129, 0.1)" 
                      color="success" 
                      px={3} py={1} 
                      borderRadius="lg"
                      fontSize="sm"
                      fontWeight="semibold"
                    >
                      {averagePerDay}/día
                    </Badge>
                  </VStack>
                  <VStack spacing={1} align="center">
                    <Text fontSize="xs" color="secondary.500">Máximo</Text>
                    <Badge 
                      bg="rgba(245, 158, 11, 0.1)" 
                      color="warning" 
                      px={3} py={1} 
                      borderRadius="lg"
                      fontSize="sm"
                      fontWeight="semibold"
                    >
                      {maxDayValue}
                    </Badge>
                  </VStack>
                </HStack>
              )}
            </Flex>

            <Flex gap={4} align="end" wrap="wrap">
              <FormControl maxW="200px">
                <FormLabel fontSize="sm" fontWeight="semibold" color="secondary.700">
                  Año
                </FormLabel>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  placeholder="Seleccionar Año"
                  variant="modern"
                  size="md"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl maxW="200px">
                <FormLabel fontSize="sm" fontWeight="semibold" color="secondary.700">
                  Mes
                </FormLabel>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  placeholder="Seleccionar Mes"
                  variant="modern"
                  size="md"
                >
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <Button
                variant="gradient"
                onClick={applyFilters}
                size="md"
                leftIcon={<FaChartBar />}
                isDisabled={!selectedYear || !selectedMonth}
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

        {hasData ? (
          <>
            {/* Grid Principal */}
            <Flex direction={{ base: 'column', lg: 'row' }} gap={6} mb={8}>
              {/* Almanaque Visual */}
              <GlassCard flex="2" p={6} animation={`${slideInFromLeft} 1s ease-out`}>
                <VStack align="start" spacing={4}>
                  <Heading size="md" color="secondary.800" fontWeight="bold" display="flex" alignItems="center" gap={2}>
                    <Box as={FaCalendarDay} color="primary.500" />
                    Almanaque Visual - {selectedMonth} {selectedYear}
                  </Heading>
                  
                  <Text fontSize="sm" color="secondary.600" mb={2}>
                    Vista calendario con intensidad de colores según número de pacientes
                  </Text>

                  <Box w="full">
                    {/* Encabezados de días */}
                    <SimpleGrid columns={7} spacing={2} mb={2}>
                      {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((dayName, index) => (
                        <Box 
                          key={index} 
                          textAlign="center" 
                          fontWeight="bold" 
                          color="secondary.700"
                          fontSize="sm"
                          p={2}
                        >
                          {dayName}
                        </Box>
                      ))}
                    </SimpleGrid>
                    
                    {/* Días del mes */}
                    <SimpleGrid columns={7} spacing={2}>
                      {filteredStats.dailyData.map(({ day, count }) => {
                        const intensity = maxDayValue > 0 ? (count / maxDayValue) : 0;
                        const bgColor = count === 0 
                          ? 'rgba(148, 163, 184, 0.1)' 
                          : count === maxDayValue
                          ? 'rgba(245, 158, 11, 0.8)'
                          : intensity > 0.7 
                          ? 'rgba(79, 125, 243, 0.7)'
                          : intensity > 0.4 
                          ? 'rgba(79, 125, 243, 0.4)'
                          : 'rgba(16, 185, 129, 0.3)';
                        
                        return (
                          <Tooltip key={day} label={`Día ${day}: ${count} pacientes`} hasArrow>
                            <Box
                              p={3}
                              background={bgColor}
                              backdropFilter="blur(10px)"
                              borderRadius="lg"
                              textAlign="center"
                              cursor="pointer"
                              transition="all 0.3s ease"
                              _hover={{ 
                                transform: 'scale(1.05)', 
                                boxShadow: 'md' 
                              }}
                            >
                              <Text 
                                fontWeight="bold" 
                                fontSize="lg" 
                                color={count === 0 ? 'secondary.500' : 'white'}
                                mb={1}
                              >
                                {day}
                              </Text>
                              <Text 
                                fontSize="xs" 
                                color={count === 0 ? 'secondary.500' : 'whiteAlpha.900'}
                              >
                                {count}
                              </Text>
                            </Box>
                          </Tooltip>
                        );
                      })}
                    </SimpleGrid>
                  </Box>

                  {/* Leyenda */}
                  <Flex gap={4} align="center" wrap="wrap" mt={4}>
                    <Text fontSize="xs" color="secondary.600" fontWeight="semibold">Intensidad:</Text>
                    <HStack spacing={2}>
                      <Box w={3} h={3} bg="rgba(148, 163, 184, 0.1)" borderRadius="sm" />
                      <Text fontSize="xs" color="secondary.500">Sin pacientes</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Box w={3} h={3} bg="rgba(16, 185, 129, 0.3)" borderRadius="sm" />
                      <Text fontSize="xs" color="secondary.500">Baja</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Box w={3} h={3} bg="rgba(79, 125, 243, 0.4)" borderRadius="sm" />
                      <Text fontSize="xs" color="secondary.500">Media</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Box w={3} h={3} bg="rgba(79, 125, 243, 0.7)" borderRadius="sm" />
                      <Text fontSize="xs" color="secondary.500">Alta</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Box w={3} h={3} bg="rgba(245, 158, 11, 0.8)" borderRadius="sm" />
                      <Text fontSize="xs" color="secondary.500">Máxima</Text>
                    </HStack>
                  </Flex>
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
                        📊 Resumen del Período
                      </Text>
                      <VStack spacing={1} align="start" fontSize="xs" color="primary.600">
                        <Text>• Total de pacientes: {totalPatients}</Text>
                        <Text>• Promedio diario: {averagePerDay}</Text>
                        <Text>• Día pico: {maxDayValue} pacientes</Text>
                        <Text>• Período: {selectedMonth} {selectedYear}</Text>
                      </VStack>
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
                  Gráfica de Tendencias Diarias
                </Heading>
                
                <Box w="full" h="400px">
                  <Bar
                    data={{
                      labels: filteredStats.dailyData.map(({ day }) => `${day}`),
                      datasets: [
                        {
                          label: "Pacientes por Día",
                          data: filteredStats.dailyData.map(({ count }) => count),
                          backgroundColor: filteredStats.dailyData.map(({ count }) => 
                            count === 0 
                              ? 'rgba(148, 163, 184, 0.3)'
                              : count === maxDayValue
                              ? 'rgba(245, 158, 11, 0.8)'
                              : 'rgba(79, 125, 243, 0.6)'
                          ),
                          borderColor: filteredStats.dailyData.map(({ count }) => 
                            count === 0 
                              ? 'rgba(148, 163, 184, 0.5)'
                              : count === maxDayValue
                              ? 'rgba(245, 158, 11, 1)'
                              : 'rgba(79, 125, 243, 1)'
                          ),
                          borderWidth: 2,
                          borderRadius: 4,
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
                          callbacks: {
                            title: function(context) {
                              return `Día ${context[0].label} de ${selectedMonth}`;
                            },
                            label: function(context) {
                              return `Pacientes atendidos: ${context.parsed.y}`;
                            }
                          }
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
                          title: {
                            display: true,
                            text: `Días de ${selectedMonth} ${selectedYear}`,
                            color: '#475569'
                          }
                        },
                        y: {
                          grid: {
                            color: 'rgba(148, 163, 184, 0.1)',
                          },
                          ticks: {
                            color: '#64748b',
                          },
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Número de Pacientes',
                            color: '#475569'
                          }
                        },
                      },
                    }}
                  />
                </Box>
              </VStack>
            </GlassCard>
          </>
        ) : (
          /* Estado vacío - Sin datos */
          <GlassCard p={12} textAlign="center" mb={8}>
            <VStack spacing={6}>
              <Box fontSize="4xl" mb={4}>
                <FaCalendarDay color="rgba(148, 163, 184, 0.5)" />
              </Box>
              
              <VStack spacing={2}>
                <Heading size="lg" color="secondary.500">
                  No hay datos para mostrar
                </Heading>
                <Text color="secondary.400" textAlign="center" maxW="md">
                  Selecciona un año y mes específicos para ver las estadísticas diarias. Asegúrate de que existan datos para el período seleccionado.
                </Text>
              </VStack>

              <Text fontSize="sm" color="secondary.500">
                💡 Tip: Los datos se actualizan automáticamente conforme se registran nuevos pacientes
              </Text>
            </VStack>
          </GlassCard>
        )}

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

export default DailyStatistics;
