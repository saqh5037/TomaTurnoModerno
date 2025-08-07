import { useState, useEffect, memo } from "react";
import {
  Box,
  Heading,
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
  Tooltip,
  SimpleGrid
} from "@chakra-ui/react";
import { Bar } from "react-chartjs-2";
import { FaFileExcel, FaFilePdf, FaArrowLeft, FaUserMd, FaChartBar, FaDownload, FaCalendarAlt, FaUsers } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import { modernTheme, fadeInUp, slideInFromLeft, slideInFromRight, GlassCard, ModernContainer, ModernHeader } from '../../components/theme/ModernTheme';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";

// Registrar módulos requeridos
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

const PhlebotomistsStatistics = memo(function PhlebotomistsStatistics() {
  const [filteredStats, setFilteredStats] = useState(null);
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [phlebotomists, setPhlebotomists] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedPhlebotomist, setSelectedPhlebotomist] = useState("");
  const [loading, setLoading] = useState(true);
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
    }
  }, [mounted]);

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

  const handleExportToExcel = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
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
    setIsExporting(false);
  };
  const handleExportToPDF = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    if (!filteredStats) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Colores del tema (basados en el glassmorphism theme)
    const primaryColor = [79, 125, 243]; // primary.500
    const secondaryColor = [71, 85, 105]; // secondary.700
    const successColor = [16, 185, 129]; // success
    const warningColor = [245, 158, 11]; // warning
    const lightGray = [248, 250, 252]; // gray.50
    
    // Datos del flebotomista seleccionado
    const selectedPhlebotomistData = phlebotomists.find(p => p.id == selectedPhlebotomist);
    const phlebotomistName = selectedPhlebotomistData?.name || "Flebotomista No Identificado";
    
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
    doc.text('ESTADÍSTICAS POR FLEBOTOMISTA', pageWidth / 2, 60, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'normal');
    doc.text('Reporte Individual de Rendimiento', pageWidth / 2, 75, { align: 'center' });
    
    // Información del flebotomista
    doc.setFillColor(successColor[0], successColor[1], successColor[2]);
    doc.roundedRect(40, 90, pageWidth - 80, 50, 5, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`FLEBOTOMISTA: ${phlebotomistName.toUpperCase()}`, pageWidth / 2, 105, { align: 'center' });
    const periodText = `${selectedMonth || 'TODOS LOS MESES'} ${selectedYear || 'TODOS LOS AÑOS'}`;
    doc.text(`PERÍODO: ${periodText}`, pageWidth / 2, 118, { align: 'center' });
    doc.text(`TOTAL DE PACIENTES: ${filteredStats.total}`, pageWidth / 2, 131, { align: 'center' });
    
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
    doc.text('INFORMACIÓN DEL REPORTE', 20, 160);
    
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${reportDate}`, 20, 175);
    doc.text(`Generado por: ${userRole} - Sistema INER`, 20, 185);
    doc.text('Sistema de Gestión de Turnos - Flebotomía', 20, 195);
    
    // Resumen estadístico
    const maxDayData = filteredStats.dailyData && filteredStats.dailyData.length > 0 
      ? filteredStats.dailyData.reduce((max, day) => day.count > max.count ? day : max, {count: 0, day: 0})
      : {count: 0, day: 0};
    
    const daysInPeriod = selectedYear && selectedMonth 
      ? new Date(selectedYear, monthOrder.indexOf(selectedMonth) + 1, 0).getDate()
      : 30; // Valor por defecto
    
    const averagePerDay = daysInPeriod > 0 ? (filteredStats.total / daysInPeriod).toFixed(1) : '0';
    const daysWithActivity = filteredStats.dailyData ? filteredStats.dailyData.filter(d => d.count > 0).length : 0;
    
    doc.text('RESUMEN EJECUTIVO', 20, 215);
    doc.text(`• Día de mayor actividad: ${maxDayData.day} (${maxDayData.count} pacientes)`, 20, 230);
    doc.text(`• Promedio diario: ${averagePerDay} pacientes`, 20, 240);
    doc.text(`• Días con actividad: ${daysWithActivity} de ${daysInPeriod}`, 20, 250);
    doc.text(`• Días del período: ${daysInPeriod}`, 20, 260);
    
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
    doc.text(`ESTADÍSTICAS DETALLADAS - ${phlebotomistName.toUpperCase()}`, pageWidth / 2, 10, { align: 'center' });
    
    // Tabla de datos diarios mejorada
    const tableColumn = ["Día", "Fecha", "Pacientes Atendidos", "% del Total"];
    const tableRows = [];
    
    // Si hay datos específicos por días, mostrarlos
    if (filteredStats.dailyData && filteredStats.dailyData.length > 0) {
      filteredStats.dailyData.forEach(({ day, count }) => {
        const percentage = filteredStats.total > 0 ? ((count / filteredStats.total) * 100).toFixed(1) : "0.0";
        
        // Calcular fecha completa si tenemos año y mes
        let dateString = `Día ${day}`;
        if (selectedYear && selectedMonth) {
          const monthIndex = monthOrder.indexOf(selectedMonth) + 1;
          dateString = `${day.toString().padStart(2, '0')}/${monthIndex.toString().padStart(2, '0')}/${selectedYear}`;
        }
        
        // Destacar día con mayor actividad
        const rowStyle = count === maxDayData.count && count > 0 
          ? { fillColor: [255, 248, 220] } // Color dorado suave para día pico
          : count === 0 
          ? { fillColor: [248, 250, 252] } // Gris claro para días sin actividad
          : {};
        
        tableRows.push({
          content: [day.toString(), dateString, count.toString(), `${percentage}%`],
          styles: rowStyle
        });
      });
    }
    
    // Fila de total
    tableRows.push({
      content: ["TOTAL", `${selectedMonth || 'Período'} ${selectedYear || ''}`, filteredStats.total.toString(), "100.0%"],
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
    
    // Análisis de rendimiento individual
    let finalY = doc.lastAutoTable.finalY + 20;
    
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('ANÁLISIS DE RENDIMIENTO INDIVIDUAL', 15, finalY);
    
    finalY += 15;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    // Métricas de rendimiento
    doc.text('📊 Indicadores clave de rendimiento:', 15, finalY);
    finalY += 10;
    
    const metrics = [
      `• Promedio de pacientes por día activo: ${daysWithActivity > 0 ? (filteredStats.total / daysWithActivity).toFixed(1) : '0'} pacientes`,
      `• Consistencia: ${daysWithActivity} de ${daysInPeriod} días con actividad (${((daysWithActivity / daysInPeriod) * 100).toFixed(1)}%)`,
      `• Día pico: Día ${maxDayData.day} con ${maxDayData.count} pacientes`,
      `• Total acumulado en el período: ${filteredStats.total} pacientes`
    ];
    
    metrics.forEach(metric => {
      doc.text(metric, 15, finalY);
      finalY += 7;
    });
    
    // Clasificación de días por actividad
    if (filteredStats.dailyData && filteredStats.dailyData.length > 0) {
      finalY += 10;
      doc.text('📈 Distribución de actividad diaria:', 15, finalY);
      finalY += 8;
      
      const activityRanges = {
        'Alto (≥ 15 pacientes)': filteredStats.dailyData.filter(d => d.count >= 15).length,
        'Medio (5-14 pacientes)': filteredStats.dailyData.filter(d => d.count >= 5 && d.count < 15).length,
        'Bajo (1-4 pacientes)': filteredStats.dailyData.filter(d => d.count >= 1 && d.count < 5).length,
        'Sin actividad (0 pacientes)': filteredStats.dailyData.filter(d => d.count === 0).length
      };
      
      Object.entries(activityRanges).forEach(([range, count]) => {
        if (count > 0) {
          doc.text(`   • ${range}: ${count} día(s)`, 15, finalY);
          finalY += 6;
        }
      });
    }
    
    // ==== PÁGINA 3: GRÁFICO Y RECOMENDACIONES ====
    doc.addPage();
    
    // Header de página de gráfico
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`ANÁLISIS GRÁFICO - ${phlebotomistName.toUpperCase()}`, pageWidth / 2, 10, { align: 'center' });
    
    // Gráfico
    const chartCanvas = document.querySelector("canvas");
    if (chartCanvas) {
      const chartImage = chartCanvas.toDataURL("image/png", 1.0);
      const chartWidth = pageWidth - 30;
      const chartHeight = Math.min((chartCanvas.height / chartCanvas.width) * chartWidth, 140);
      
      // Marco para el gráfico
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(1);
      doc.rect(14, 24, chartWidth + 2, chartHeight + 2);
      
      doc.addImage(chartImage, "PNG", 15, 25, chartWidth, chartHeight);
      
      let recommendationsY = 25 + chartHeight + 25;
      
      // Recomendaciones personalizadas
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('OBSERVACIONES Y RECOMENDACIONES', 15, recommendationsY);
      
      recommendationsY += 15;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      
      // Generar recomendaciones basadas en el rendimiento
      const recommendations = [];
      
      // Análisis de consistencia
      const consistencyRate = (daysWithActivity / daysInPeriod) * 100;
      if (consistencyRate < 60) {
        recommendations.push(`• Mejorar consistencia: Solo ${consistencyRate.toFixed(1)}% de días con actividad`);
      } else if (consistencyRate > 85) {
        recommendations.push(`• Excelente consistencia: ${consistencyRate.toFixed(1)}% de días con actividad`);
      }
      
      // Análisis de carga de trabajo
      const dailyAverage = parseFloat(averagePerDay);
      if (dailyAverage > 20) {
        recommendations.push('• Considerar balancear carga - Alto volumen de pacientes por día');
      } else if (dailyAverage < 5) {
        recommendations.push('• Evaluar asignación de turnos - Bajo promedio de pacientes por día');
      }
      
      // Análisis de picos de trabajo
      if (maxDayData.count > dailyAverage * 2) {
        recommendations.push(`• Revisar distribución - Día pico (${maxDayData.count}) muy superior al promedio`);
      }
      
      // Recomendaciones generales
      recommendations.push('• Mantener registro detallado para análisis futuro');
      recommendations.push('• Continuar monitoreo para identificar patrones estacionales');
      
      if (filteredStats.total > 100) {
        recommendations.push('• Buen volumen de atención - Mantener estándares de calidad');
      }
      
      recommendations.forEach(rec => {
        doc.text(rec, 15, recommendationsY);
        recommendationsY += 8;
      });
      
      // Información adicional
      recommendationsY += 10;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('* Las recomendaciones se basan en el análisis estadístico del período seleccionado', 15, recommendationsY);
      doc.text('* Para análisis más detallado, considere períodos más amplios de datos', 15, recommendationsY + 8);
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
    const phlebotomistFileName = phlebotomistName.replace(/\s+/g, '_');
    const yearText = selectedYear || 'TodosLosAños';
    const monthText = selectedMonth || 'TodosLosMeses';
    const fileName = `INER_Flebotomista_${phlebotomistFileName}_${monthText}${yearText}_${now.toISOString().split('T')[0]}.pdf`;
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
                Cargando Estadísticas por Flebotomista...
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
                  Cargando información de flebotomistas
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
  const hasData = filteredStats && filteredStats.dailyData && filteredStats.dailyData.length > 0;
  const totalPatients = filteredStats?.total || 0;
  const selectedPhlebotomistName = phlebotomists.find(p => p.id == selectedPhlebotomist)?.name || '';

  return (
    <ChakraProvider theme={modernTheme}>
      <ModernContainer>
        {/* Header Principal con Glassmorphism */}
        <ModernHeader
          title="Estadísticas por Flebotomista"
          subtitle={isAdmin ? "Análisis Individual de Rendimiento - Vista Completa" : "Seguimiento de Actividad - Vista Operativa"}
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
                  <Box as={FaUserMd} color="primary.500" />
                  Filtros de Búsqueda
                </Heading>
                <Text fontSize="sm" color="secondary.600">
                  Selecciona el flebotomista y período para análisis detallado
                </Text>
              </VStack>

              {/* Métricas rápidas */}
              {hasData && (
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
                  <VStack spacing={1} align="center">
                    <Text fontSize="xs" color="secondary.500">Flebotomista</Text>
                    <Badge 
                      bg="rgba(16, 185, 129, 0.1)" 
                      color="success" 
                      px={3} py={1} 
                      borderRadius="lg"
                      fontSize="sm"
                      fontWeight="semibold"
                    >
                      {selectedPhlebotomistName.split(' ')[0]}
                    </Badge>
                  </VStack>
                  <VStack spacing={1} align="center">
                    <Text fontSize="xs" color="secondary.500">Período</Text>
                    <Badge 
                      bg="rgba(245, 158, 11, 0.1)" 
                      color="warning" 
                      px={3} py={1} 
                      borderRadius="lg"
                      fontSize="sm"
                      fontWeight="semibold"
                    >
                      {selectedMonth || 'Todos'} {selectedYear || 'Años'}
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

              <FormControl maxW="250px">
                <FormLabel fontSize="sm" fontWeight="semibold" color="secondary.700">
                  Flebotomista
                </FormLabel>
                <Select
                  value={selectedPhlebotomist}
                  onChange={(e) => setSelectedPhlebotomist(e.target.value)}
                  placeholder="Seleccionar Flebotomista"
                  variant="modern"
                  size="md"
                >
                  {phlebotomists.map(({ id, name }) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <Button
                variant="gradient"
                onClick={applyFilters}
                size="md"
                leftIcon={<FaChartBar />}
                isDisabled={!selectedPhlebotomist}
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
                    <Box as={FaCalendarAlt} color="primary.500" />
                    Almanaque de Atención - {selectedPhlebotomistName}
                  </Heading>
                  
                  <Text fontSize="sm" color="secondary.600" mb={2}>
                    Vista calendario con número de pacientes atendidos por día
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
                    
                    {/* Días del mes con datos */}
                    <SimpleGrid columns={7} spacing={2}>
                      {selectedYear && selectedMonth ? (
                        Array.from(
                          { length: new Date(selectedYear, months.indexOf(selectedMonth) + 1, 0).getDate() },
                          (_, i) => {
                            const day = i + 1;
                            const count = filteredStats.dailyData.find(d => d.day === day)?.count || 0;
                            const maxCount = Math.max(...filteredStats.dailyData.map(d => d.count));
                            const intensity = maxCount > 0 ? (count / maxCount) : 0;
                            
                            const bgColor = count === 0 
                              ? 'rgba(148, 163, 184, 0.1)' 
                              : count === maxCount
                              ? 'rgba(245, 158, 11, 0.8)'
                              : intensity > 0.7 
                              ? 'rgba(79, 125, 243, 0.7)'
                              : 'rgba(16, 185, 129, 0.4)';
                            
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
                                    {count} pac.
                                  </Text>
                                </Box>
                              </Tooltip>
                            );
                          }
                        )
                      ) : (
                        <Box gridColumn="1 / -1" textAlign="center" p={8}>
                          <Text color="secondary.500">
                            Selecciona año y mes para ver el almanaque
                          </Text>
                        </Box>
                      )}
                    </SimpleGrid>
                  </Box>

                  {/* Leyenda */}
                  {selectedYear && selectedMonth && (
                    <Flex gap={4} align="center" wrap="wrap" mt={4}>
                      <Text fontSize="xs" color="secondary.600" fontWeight="semibold">Actividad:</Text>
                      <HStack spacing={2}>
                        <Box w={3} h={3} bg="rgba(148, 163, 184, 0.1)" borderRadius="sm" />
                        <Text fontSize="xs" color="secondary.500">Sin actividad</Text>
                      </HStack>
                      <HStack spacing={2}>
                        <Box w={3} h={3} bg="rgba(16, 185, 129, 0.4)" borderRadius="sm" />
                        <Text fontSize="xs" color="secondary.500">Baja</Text>
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
                  )}
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
                        👨‍⚕️ Información del Flebotomista
                      </Text>
                      <VStack spacing={1} align="start" fontSize="xs" color="primary.600">
                        <Text>• Nombre: {selectedPhlebotomistName}</Text>
                        <Text>• Total pacientes atendidos: {totalPatients}</Text>
                        {selectedMonth && selectedYear && (
                          <Text>• Período: {selectedMonth} {selectedYear}</Text>
                        )}
                        <Text>• Promedio diario: {selectedYear && selectedMonth ? (totalPatients / new Date(selectedYear, months.indexOf(selectedMonth) + 1, 0).getDate()).toFixed(1) : '-'}</Text>
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
                  Tendencia de Atención - {selectedPhlebotomistName}
                </Heading>
                
                <Box w="full" h="400px">
                  <Bar
                    data={{
                      labels: filteredStats.dailyData.map(({ day }) => `Día ${day}`),
                      datasets: [
                        {
                          label: "Pacientes Atendidos",
                          data: filteredStats.dailyData.map(({ count }) => count),
                          backgroundColor: filteredStats.dailyData.map(({ count }) => {
                            const maxCount = Math.max(...filteredStats.dailyData.map(d => d.count));
                            return count === 0 
                              ? 'rgba(148, 163, 184, 0.3)'
                              : count === maxCount
                              ? 'rgba(245, 158, 11, 0.8)'
                              : 'rgba(79, 125, 243, 0.6)';
                          }),
                          borderColor: filteredStats.dailyData.map(({ count }) => {
                            const maxCount = Math.max(...filteredStats.dailyData.map(d => d.count));
                            return count === 0 
                              ? 'rgba(148, 163, 184, 0.5)'
                              : count === maxCount
                              ? 'rgba(245, 158, 11, 1)'
                              : 'rgba(79, 125, 243, 1)';
                          }),
                          borderWidth: 2,
                          borderRadius: 6,
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
                              return `${context[0].label} - ${selectedPhlebotomistName}`;
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
          /* Estado vacío - Sin datos o sin filtro seleccionado */
          <GlassCard p={12} textAlign="center" mb={8}>
            <VStack spacing={6}>
              <Box fontSize="4xl" mb={4}>
                <FaUsers color="rgba(148, 163, 184, 0.5)" />
              </Box>
              
              <VStack spacing={2}>
                <Heading size="lg" color="secondary.500">
                  {!selectedPhlebotomist ? 'Selecciona un Flebotomista' : 'No hay datos disponibles'}
                </Heading>
                <Text color="secondary.400" textAlign="center" maxW="md">
                  {!selectedPhlebotomist 
                    ? 'Para comenzar, selecciona un flebotomista de la lista desplegable y aplica los filtros para ver sus estadísticas de atención.'
                    : 'No se encontraron datos para el flebotomista y período seleccionados. Verifica que existan registros para estos filtros.'
                  }
                </Text>
              </VStack>

              <Text fontSize="sm" color="secondary.500">
                💡 Tip: Los datos se actualizan automáticamente conforme se registran nuevas atenciones
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

export default PhlebotomistsStatistics;
