import { useState, useEffect, useCallback, memo } from "react";
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
  VStack,
  ChakraProvider,
  Spinner,
  Badge,
  Flex,
  Tooltip,
  SimpleGrid
} from "@chakra-ui/react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend } from "chart.js";
import { FaFileExcel, FaFilePdf, FaArrowLeft, FaClock, FaChartBar, FaDownload, FaCalendarAlt, FaStopwatch } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import { modernTheme, fadeInUp, slideInFromLeft, slideInFromRight, GlassCard, ModernContainer, ModernHeader } from '../../components/theme/ModernTheme';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

const AverageTimeStatistics = memo(function AverageTimeStatistics() {
  const [filteredStats, setFilteredStats] = useState({
    phlebotomists: [],
    dailySummary: {}, // Aunque no se usa en el PDF, se mantiene para el display en pantalla si es necesario
    overallAverage: 0,
    overallTotalPatients: 0,
  });
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const router = useRouter();
  const { userRole } = useAuth();

  const monthNames = [
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

      setMonths(monthNames);
    }
  }, [mounted]);

  const applyFilters = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const year = selectedYear ? parseInt(selectedYear) : null;
      const monthIndex = selectedMonth ? monthNames.indexOf(selectedMonth) + 1 : null;

      const queryParams = new URLSearchParams();
      if (year) queryParams.append("year", year);
      if (monthIndex) queryParams.append("month", monthIndex);

      const response = await fetch(`/api/statistics/average-time?${queryParams.toString()}`);

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
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleExportToExcel = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const workbook = XLSX.utils.book_new();

    // Hoja 1: Resumen de Tiempo Promedio
    const summaryData = [
      [`Tiempo Promedio por Flebotomista - Año ${selectedYear || 'Todos'} Mes ${selectedMonth || 'Todos'}`],
      [],
      ["Flebotomista", "Tiempo Promedio (minutos)", "Total Pacientes Atendidos"]
    ];
    filteredStats.phlebotomists.forEach(item => {
      summaryData.push([item.name, item.averageDuration, item.totalPatients]);
    });
    summaryData.push([]);
    summaryData.push(["Promedio General", filteredStats.overallAverage, filteredStats.overallTotalPatients]);

    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Resumen Tiempo Promedio");

    // Hoja 2: Detalle Diario por Flebotomista (si hay un mes seleccionado)
    // Se mantiene la exportación a Excel para el detalle diario si los datos están disponibles
    if (selectedYear && selectedMonth && Object.keys(filteredStats.dailySummary).length > 0) {
        const daysInMonth = new Date(parseInt(selectedYear), monthNames.indexOf(selectedMonth) + 1, 0).getDate();
        const headerRow = ["Día"].concat(filteredStats.phlebotomists.map(p => p.name));
        const dailyDetailData = [
            [`Detalle Diario de Tiempo Promedio - ${selectedMonth} ${selectedYear}`],
            [],
            headerRow
        ];

        for (let day = 1; day <= daysInMonth; day++) {
            const row = [day];
            filteredStats.phlebotomists.forEach(phlebotomist => {
                const avgTime = filteredStats.dailySummary[phlebotomist.name]?.[day];
                row.push(avgTime !== undefined ? avgTime : '');
            });
            dailyDetailData.push(row);
        }

        const dailyDetailWorksheet = XLSX.utils.aoa_to_sheet(dailyDetailData);
        XLSX.utils.book_append_sheet(workbook, dailyDetailWorksheet, "Detalle Diario");
    }

    XLSX.writeFile(workbook, `TiempoPromedio_Reporte_Año${selectedYear || 'Todos'}_Mes${selectedMonth || 'Todos'}.xlsx`);
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
    doc.text('TIEMPO PROMEDIO DE ATENCIÓN', pageWidth / 2, 60, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'normal');
    doc.text('Análisis de Eficiencia por Flebotomista', pageWidth / 2, 75, { align: 'center' });
    
    // Información del período
    doc.setFillColor(warningColor[0], warningColor[1], warningColor[2]);
    doc.roundedRect(40, 90, pageWidth - 80, 40, 5, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    const periodText = `${selectedYear || 'TODOS LOS AÑOS'} - ${selectedMonth || 'TODOS LOS MESES'}`;
    doc.text(`PERÍODO: ${periodText}`, pageWidth / 2, 105, { align: 'center' });
    doc.text(`PROMEDIO GENERAL: ${filteredStats.overallAverage || 0} MINUTOS`, pageWidth / 2, 118, { align: 'center' });
    
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
    const fastestPhlebotomist = filteredStats.phlebotomists.length > 0 
      ? filteredStats.phlebotomists.reduce((min, p) => p.averageDuration < min.averageDuration ? p : min)
      : null;
    const slowestPhlebotomist = filteredStats.phlebotomists.length > 0 
      ? filteredStats.phlebotomists.reduce((max, p) => p.averageDuration > max.averageDuration ? p : max)
      : null;
    const totalPatients = filteredStats.overallTotalPatients || 0;
    
    doc.text('RESUMEN EJECUTIVO', 20, 205);
    if (fastestPhlebotomist) {
      doc.text(`• Flebotomista más eficiente: ${fastestPhlebotomist.name} (${fastestPhlebotomist.averageDuration} min)`, 20, 220);
    }
    if (slowestPhlebotomist && fastestPhlebotomist && slowestPhlebotomist.name !== fastestPhlebotomist.name) {
      doc.text(`• Mayor tiempo promedio: ${slowestPhlebotomist.name} (${slowestPhlebotomist.averageDuration} min)`, 20, 230);
    }
    doc.text(`• Total de pacientes analizados: ${totalPatients}`, 20, 240);
    doc.text(`• Flebotomistas evaluados: ${filteredStats.phlebotomists.length}`, 20, 250);
    
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
    doc.text('TIEMPO PROMEDIO DE ATENCIÓN - DATOS DETALLADOS', pageWidth / 2, 10, { align: 'center' });
    
    // Tabla de datos mejorada
    const tableColumn = ["Flebotomista", "Tiempo Promedio (min)", "Total Pacientes", "Eficiencia"];
    const tableRows = filteredStats.phlebotomists.map((item) => {
      const efficiency = fastestPhlebotomist && fastestPhlebotomist.averageDuration > 0
        ? ((fastestPhlebotomist.averageDuration / item.averageDuration) * 100).toFixed(1) + '%'
        : '100%';
      
      return [
        item.name, 
        item.averageDuration.toString(), 
        item.totalPatients.toString(),
        efficiency
      ];
    });
    
    // Fila de promedio general
    tableRows.push({
      content: [
        "PROMEDIO GENERAL", 
        (filteredStats.overallAverage || 0).toString(), 
        (filteredStats.overallTotalPatients || 0).toString(),
        "100%"
      ],
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
        2: { halign: 'center' },
        3: { halign: 'center' }
      },
      margin: { left: 15, right: 15 },
      theme: 'striped'
    });
    
    // Análisis de rendimiento
    let finalY = doc.lastAutoTable.finalY + 20;
    
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('ANÁLISIS DE RENDIMIENTO', 15, finalY);
    
    finalY += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    // Clasificación por rangos de tiempo
    const timeRanges = {
      'Excelente (≤ 10 min)': filteredStats.phlebotomists.filter(p => p.averageDuration <= 10),
      'Bueno (11-15 min)': filteredStats.phlebotomists.filter(p => p.averageDuration > 10 && p.averageDuration <= 15),
      'Regular (16-20 min)': filteredStats.phlebotomists.filter(p => p.averageDuration > 15 && p.averageDuration <= 20),
      'Mejorar (> 20 min)': filteredStats.phlebotomists.filter(p => p.averageDuration > 20)
    };
    
    doc.text('📊 Distribución por rangos de tiempo:', 15, finalY);
    finalY += 10;
    
    Object.entries(timeRanges).forEach(([range, phlebotomists]) => {
      if (phlebotomists.length > 0) {
        doc.text(`   • ${range}: ${phlebotomists.length} flebotomista(s)`, 15, finalY);
        finalY += 6;
        phlebotomists.forEach(p => {
          doc.text(`     - ${p.name}: ${p.averageDuration} min (${p.totalPatients} pacientes)`, 15, finalY);
          finalY += 5;
        });
        finalY += 2;
      }
    });
    
    // ==== PÁGINA 3: GRÁFICO Y RECOMENDACIONES ====
    if (filteredStats.phlebotomists.length > 0) {
      doc.addPage();
      
      // Header de página de gráfico
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('ANÁLISIS GRÁFICO Y RECOMENDACIONES', pageWidth / 2, 10, { align: 'center' });
      
      // Gráfico
      const chartCanvas = document.querySelector("canvas");
      if (chartCanvas) {
        const chartImage = chartCanvas.toDataURL("image/png", 1.0);
        const chartWidth = pageWidth - 30;
        const chartHeight = Math.min((chartCanvas.height / chartCanvas.width) * chartWidth, 120);
        
        // Marco para el gráfico
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setLineWidth(1);
        doc.rect(14, 24, chartWidth + 2, chartHeight + 2);
        
        doc.addImage(chartImage, "PNG", 15, 25, chartWidth, chartHeight);
        
        let recommendationsY = 25 + chartHeight + 25;
        
        // Recomendaciones
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('RECOMENDACIONES OPERATIVAS', 15, recommendationsY);
        
        recommendationsY += 15;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        
        // Recomendaciones basadas en el análisis
        const recommendations = [];
        
        if (slowestPhlebotomist && fastestPhlebotomist) {
          const timeDifference = slowestPhlebotomist.averageDuration - fastestPhlebotomist.averageDuration;
          if (timeDifference > 5) {
            recommendations.push(`• Capacitación: Estandarizar procedimientos (diferencia máxima: ${timeDifference.toFixed(1)} min)`);
          }
        }
        
        const highVolumePhlebotomists = filteredStats.phlebotomists.filter(p => p.totalPatients > totalPatients / filteredStats.phlebotomists.length);
        if (highVolumePhlebotomists.length > 0) {
          recommendations.push('• Balancear carga de trabajo entre todo el personal');
        }
        
        const slowPhlebotomists = filteredStats.phlebotomists.filter(p => p.averageDuration > (filteredStats.overallAverage + 3));
        if (slowPhlebotomists.length > 0) {
          recommendations.push(`• Revisión de procesos para ${slowPhlebotomists.length} flebotomista(s) con tiempo superior al promedio`);
        }
        
        recommendations.push('• Implementar mejores prácticas del personal más eficiente');
        recommendations.push('• Monitoreo continuo de tiempos de atención');
        recommendations.push('• Considerar factores externos que afecten los tiempos');
        
        recommendations.forEach(rec => {
          doc.text(rec, 15, recommendationsY);
          recommendationsY += 8;
        });
      }
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
    const yearText = selectedYear || 'TodosLosAños';
    const monthText = selectedMonth || 'TodosLosMeses';
    const fileName = `INER_TiempoPromedio_${yearText}_${monthText}_${now.toISOString().split('T')[0]}.pdf`;
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
                Cargando Estadísticas de Tiempo Promedio...
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
                  Calculando tiempos promedio por flebotomista
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
  const hasData = filteredStats.phlebotomists.length > 0;
  const totalPhlebotomists = filteredStats.phlebotomists.length;
  const overallAverage = filteredStats.overallAverage || 0;
  const totalPatients = filteredStats.overallTotalPatients || 0;

  // La lógica de daysInMonthDisplay, firstDayOfMonthDisplay y calendarDays
  // se mantiene porque el frontend sí muestra el almanaque en pantalla.
  const daysInMonthDisplay = selectedYear && selectedMonth
    ? new Date(parseInt(selectedYear), monthNames.indexOf(selectedMonth) + 1, 0).getDate()
    : 0;

  const firstDayOfMonthDisplay = selectedYear && selectedMonth
    ? new Date(parseInt(selectedYear), monthNames.indexOf(selectedMonth), 1).getDay()
    : 0;

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonthDisplay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonthDisplay; day++) {
    calendarDays.push(day);
  }

  return (
    <ChakraProvider theme={modernTheme}>
      <ModernContainer>
        {/* Header Principal con Glassmorphism */}
        <ModernHeader
          title="Tiempo Promedio de Atención"
          subtitle={isAdmin ? "Análisis Detallado de Tiempos por Flebotomista - Vista Completa" : "Tiempos de Atención - Vista Operativa"}
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
                  <Box as={FaStopwatch} color="primary.500" />
                  Filtros de Período
                </Heading>
                <Text fontSize="sm" color="secondary.600">
                  Analiza los tiempos promedio de atención por período específico
                </Text>
              </VStack>

              {/* Métricas rápidas */}
              {hasData && (
                <HStack spacing={4} wrap="wrap">
                  <VStack spacing={1} align="center">
                    <Text fontSize="xs" color="secondary.500">Promedio General</Text>
                    <Badge 
                      bg="rgba(79, 125, 243, 0.1)" 
                      color="primary.600" 
                      px={3} py={1} 
                      borderRadius="lg"
                      fontSize="md"
                      fontWeight="bold"
                    >
                      {overallAverage}min
                    </Badge>
                  </VStack>
                  <VStack spacing={1} align="center">
                    <Text fontSize="xs" color="secondary.500">Total Pacientes</Text>
                    <Badge 
                      bg="rgba(16, 185, 129, 0.1)" 
                      color="success" 
                      px={3} py={1} 
                      borderRadius="lg"
                      fontSize="sm"
                      fontWeight="semibold"
                    >
                      {totalPatients}
                    </Badge>
                  </VStack>
                  <VStack spacing={1} align="center">
                    <Text fontSize="xs" color="secondary.500">Flebotomistas</Text>
                    <Badge 
                      bg="rgba(245, 158, 11, 0.1)" 
                      color="warning" 
                      px={3} py={1} 
                      borderRadius="lg"
                      fontSize="sm"
                      fontWeight="semibold"
                    >
                      {totalPhlebotomists}
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
              {/* Almanaque Visual Diario */}
              {selectedYear && selectedMonth && Object.keys(filteredStats.dailySummary).length > 0 ? (
                <GlassCard flex="2" p={6} animation={`${slideInFromLeft} 1s ease-out`}>
                  <VStack align="start" spacing={4}>
                    <Heading size="md" color="secondary.800" fontWeight="bold" display="flex" alignItems="center" gap={2}>
                      <Box as={FaCalendarAlt} color="primary.500" />
                      Almanaque de Tiempos - {selectedMonth} {selectedYear}
                    </Heading>
                    
                    <Text fontSize="sm" color="secondary.600" mb={2}>
                      Vista calendario con tiempos promedio por flebotomista y día
                    </Text>

                    <Box w="full">
                      {/* Encabezados de días */}
                      <SimpleGrid columns={7} spacing={2} mb={2}>
                        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((dayName, index) => (
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
                        {calendarDays.map((day, index) => (
                          <Box
                            key={index}
                            p={3}
                            background={day === null ? 'rgba(148, 163, 184, 0.05)' : 'rgba(255, 255, 255, 0.1)'}
                            backdropFilter="blur(10px)"
                            borderRadius="lg"
                            textAlign="center"
                            minH="120px"
                            overflow="hidden"
                            border="1px solid rgba(148, 163, 184, 0.1)"
                            transition="all 0.3s ease"
                            _hover={{ 
                              transform: day !== null ? 'scale(1.02)' : 'none', 
                              boxShadow: day !== null ? 'md' : 'none'
                            }}
                          >
                            {day !== null && (
                              <VStack spacing={1}>
                                <Text fontWeight="bold" fontSize="lg" mb={1} color="secondary.700">
                                  {day}
                                </Text>
                                {Object.keys(filteredStats.dailySummary).map((phlebotomistName) => {
                                  const avgTime = filteredStats.dailySummary[phlebotomistName]?.[day];
                                  return (
                                    avgTime !== undefined && (
                                      <Badge
                                        key={phlebotomistName}
                                        bg="rgba(79, 125, 243, 0.1)"
                                        color="primary.600"
                                        fontSize="xs"
                                        px={2}
                                        py={0.5}
                                        borderRadius="md"
                                        mb={0.5}
                                      >
                                        {phlebotomistName.split(' ')[0]}: {avgTime}min
                                      </Badge>
                                    )
                                  );
                                })}
                                {Object.keys(filteredStats.dailySummary).every(phlebotomistName => filteredStats.dailySummary[phlebotomistName]?.[day] === undefined) && (
                                  <Text fontSize="xs" color="secondary.400">Sin datos</Text>
                                )}
                              </VStack>
                            )}
                          </Box>
                        ))}
                      </SimpleGrid>
                    </Box>
                  </VStack>
                </GlassCard>
              ) : (
                <GlassCard flex="2" p={6} animation={`${slideInFromLeft} 1s ease-out`}>
                  <VStack align="center" spacing={4} py={8}>
                    <Box fontSize="4xl" mb={4}>
                      <FaCalendarAlt color="rgba(148, 163, 184, 0.5)" />
                    </Box>
                    <VStack spacing={2}>
                      <Heading size="md" color="secondary.500">
                        Vista de Calendario
                      </Heading>
                      <Text color="secondary.400" textAlign="center" maxW="md">
                        Selecciona un año y mes específicos para ver el almanaque diario de tiempos promedio por flebotomista.
                      </Text>
                    </VStack>
                  </VStack>
                </GlassCard>
              )}

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
                        ⏱️ Resumen de Tiempos
                      </Text>
                      <VStack spacing={1} align="start" fontSize="xs" color="primary.600">
                        <Text>• Promedio general: {overallAverage} minutos</Text>
                        <Text>• Total de pacientes: {totalPatients}</Text>
                        <Text>• Flebotomistas activos: {totalPhlebotomists}</Text>
                        {selectedMonth && selectedYear && (
                          <Text>• Período: {selectedMonth} {selectedYear}</Text>
                        )}
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
                  Comparativa de Tiempos por Flebotomista
                </Heading>
                
                <Box w="full" h="400px">
                  <Bar
                    data={{
                      labels: filteredStats.phlebotomists.map((item) => item.name),
                      datasets: [
                        {
                          label: "Tiempo Promedio (minutos)",
                          data: filteredStats.phlebotomists.map((item) => item.averageDuration),
                          backgroundColor: filteredStats.phlebotomists.map((item) => 
                            item.averageDuration === Math.max(...filteredStats.phlebotomists.map(p => p.averageDuration))
                              ? 'rgba(245, 158, 11, 0.8)'
                              : item.averageDuration === Math.min(...filteredStats.phlebotomists.map(p => p.averageDuration))
                              ? 'rgba(16, 185, 129, 0.8)'
                              : 'rgba(79, 125, 243, 0.6)'
                          ),
                          borderColor: filteredStats.phlebotomists.map((item) => 
                            item.averageDuration === Math.max(...filteredStats.phlebotomists.map(p => p.averageDuration))
                              ? 'rgba(245, 158, 11, 1)'
                              : item.averageDuration === Math.min(...filteredStats.phlebotomists.map(p => p.averageDuration))
                              ? 'rgba(16, 185, 129, 1)'
                              : 'rgba(79, 125, 243, 1)'
                          ),
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
                          callbacks: {
                            afterLabel: function(context) {
                              const phlebotomist = filteredStats.phlebotomists[context.dataIndex];
                              return `Pacientes atendidos: ${phlebotomist.totalPatients}`;
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
                            maxRotation: 45,
                          },
                          title: {
                            display: true,
                            text: 'Flebotomista',
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
                            text: 'Tiempo Promedio (minutos)',
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
                <FaClock color="rgba(148, 163, 184, 0.5)" />
              </Box>
              
              <VStack spacing={2}>
                <Heading size="lg" color="secondary.500">
                  No hay datos de tiempo promedio disponibles
                </Heading>
                <Text color="secondary.400" textAlign="center" maxW="md">
                  No se encontraron datos de tiempo promedio para los filtros seleccionados. Verifica que existan registros para el período especificado.
                </Text>
              </VStack>

              <Text fontSize="sm" color="secondary.500">
                💡 Tip: Los tiempos se calculan automáticamente cuando los flebotomistas finalizan la atención de pacientes
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

export default AverageTimeStatistics;