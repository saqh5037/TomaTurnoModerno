import { useState, useEffect, useCallback, memo, useMemo } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  IconButton,
  Input,
  Select,
  FormControl,
  FormLabel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  HStack,
  VStack,
  Flex,
  SimpleGrid,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
} from "@chakra-ui/react";
import {
  FaArrowLeft,
  FaSearch,
  FaUserMd,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaBroom,
  FaFileExcel,
  FaFilePdf,
  FaDownload,
} from "react-icons/fa";
import { useRouter } from "next/router";
import { useAuth } from "../../contexts/AuthContext";
import {
  fadeInUp,
  GlassCard,
  ModernContainer,
  ModernHeader,
} from "../../components/theme/ModernTheme";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PAGE_SIZE = 50;

// Devuelve YYYY-MM-DD del día de hoy en hora local
const getTodayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatTime = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "—";
  }
};

const PRIORITY_COLORS = {
  MuyEspecial: "red",
  Prioritario: "orange",
  PrioritarioRiesgo: "yellow",
  RiesgoCaida: "blue",
  General: "gray",
  Special: "orange", // legacy
};

const PRIORITY_LABELS = {
  MuyEspecial: "Muy Especial",
  Prioritario: "Prioritario",
  PrioritarioRiesgo: "Prio + Riesgo",
  RiesgoCaida: "Riesgo de Caída",
  General: "General",
  Special: "Especial",
};

const PatientStatisticsPage = memo(function PatientStatisticsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const today = useMemo(() => getTodayStr(), []);

  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [phlebotomistId, setPhlebotomistId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [phlebotomists, setPhlebotomists] = useState([]);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounce del input de búsqueda (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Cargar datos cuando cambian filtros o página
  const loadData = useCallback(async () => {
    if (!mounted) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        dateFrom,
        dateTo,
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (phlebotomistId) params.set("phlebotomistId", phlebotomistId);
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(
        `/api/statistics/patient-stats?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Error al cargar estadísticas");
      }

      setRows(data.data.rows || []);
      setTotal(data.data.total || 0);
      setTotalPages(data.data.totalPages || 1);
      // Dropdown dinámico: solo flebos que atendieron turnos en el rango
      setPhlebotomists(data.data.filters?.phlebotomists || []);
    } catch (err) {
      console.error("[patient-stats] load error:", err);
      toast({
        title: "Error",
        description: err.message || "No se pudieron cargar los datos",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      setRows([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [mounted, dateFrom, dateTo, phlebotomistId, debouncedSearch, page, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleClearFilters = () => {
    setDateFrom(today);
    setDateTo(today);
    setPhlebotomistId("");
    setSearchInput("");
    setPage(1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  // Fetch de TODOS los turnos del rango actual (hasta 5000) para export
  const fetchAllForExport = useCallback(async () => {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({
      dateFrom,
      dateTo,
      page: "1",
      limit: "5000",
    });
    if (phlebotomistId) params.set("phlebotomistId", phlebotomistId);
    if (debouncedSearch) params.set("search", debouncedSearch);

    const res = await fetch(
      `/api/statistics/patient-stats?${params.toString()}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Error al obtener datos para exportar");
    }
    return data.data.rows || [];
  }, [dateFrom, dateTo, phlebotomistId, debouncedSearch]);

  // Nombre base del archivo exportado
  const buildExportFilename = () => {
    const safeFrom = dateFrom.replace(/-/g, "");
    const safeTo = dateTo.replace(/-/g, "");
    const phlebPart = phlebotomistId
      ? `_flebo${phlebotomistId}`
      : "";
    return `estadisticas_paciente_${safeFrom}-${safeTo}${phlebPart}`;
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const allRows = await fetchAllForExport();
      if (allRows.length === 0) {
        toast({
          title: "Sin datos",
          description: "No hay turnos para exportar en este rango.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const sheetRows = allRows.map((r) => ({
        "# Turno": r.turnNumber ?? "",
        "OT LABSIS": r.workOrder || "",
        Paciente: r.patientName,
        Prioridad: PRIORITY_LABELS[r.tipoAtencion] || r.tipoAtencion || "",
        "Hora inicio": r.startTime
          ? new Date(r.startTime).toLocaleString("es-MX")
          : "",
        "Hora fin": r.endTime
          ? new Date(r.endTime).toLocaleString("es-MX")
          : "",
        "Tiempo (min)": r.durationMinutes,
        Flebotomista: r.phlebotomistName,
      }));

      const worksheet = XLSX.utils.json_to_sheet(sheetRows);

      // Ajuste de anchos de columna
      worksheet["!cols"] = [
        { wch: 10 }, // # Turno
        { wch: 14 }, // OT LABSIS
        { wch: 36 }, // Paciente
        { wch: 16 }, // Prioridad
        { wch: 22 }, // Hora inicio
        { wch: 22 }, // Hora fin
        { wch: 12 }, // Tiempo
        { wch: 30 }, // Flebotomista
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Estadísticas por Paciente"
      );

      XLSX.writeFile(workbook, `${buildExportFilename()}.xlsx`);

      toast({
        title: "Excel generado",
        description: `${allRows.length} turnos exportados correctamente.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error("[export excel] error:", err);
      toast({
        title: "Error al exportar",
        description: err.message || "No se pudo generar el archivo Excel.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const allRows = await fetchAllForExport();
      if (allRows.length === 0) {
        toast({
          title: "Sin datos",
          description: "No hay turnos para exportar en este rango.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Header institucional
      const primaryColor = [79, 125, 243];
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 20, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("ESTADÍSTICAS POR PACIENTE", pageWidth / 2, 9, { align: "center" });
      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      doc.text(
        "TomaTurno INER · Instituto Nacional de Enfermedades Respiratorias",
        pageWidth / 2,
        15,
        { align: "center" }
      );

      // Metadata del reporte
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(10);
      let metaY = 28;
      doc.text(`Rango: ${dateFrom} a ${dateTo}`, 14, metaY);
      if (phlebotomistId) {
        const flebo = phlebotomists.find(
          (p) => String(p.id) === String(phlebotomistId)
        );
        doc.text(
          `Flebotomista: ${flebo?.name || phlebotomistId}`,
          14,
          metaY + 5
        );
        metaY += 5;
      }
      if (debouncedSearch) {
        doc.text(`Búsqueda: "${debouncedSearch}"`, 14, metaY + 5);
        metaY += 5;
      }
      doc.text(`Total de turnos: ${allRows.length}`, 14, metaY + 5);

      // Tabla
      const head = [
        [
          "# Turno",
          "OT LABSIS",
          "Paciente",
          "Prioridad",
          "Hora inicio",
          "Hora fin",
          "Tiempo (min)",
          "Flebotomista",
        ],
      ];
      const body = allRows.map((r) => [
        r.turnNumber ?? "—",
        r.workOrder || "—",
        r.patientName,
        PRIORITY_LABELS[r.tipoAtencion] || r.tipoAtencion || "—",
        r.startTime ? formatTime(r.startTime) : "—",
        r.endTime ? formatTime(r.endTime) : "—",
        r.durationMinutes.toFixed(1),
        r.phlebotomistName,
      ]);

      autoTable(doc, {
        head,
        body,
        startY: metaY + 12,
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 9,
          halign: "center",
        },
        bodyStyles: { fontSize: 8, cellPadding: 2 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        columnStyles: {
          0: { halign: "center", cellWidth: 18 },
          1: { halign: "center", cellWidth: 22 },
          2: { cellWidth: 60 },
          3: { halign: "center", cellWidth: 25 },
          4: { halign: "center", cellWidth: 22 },
          5: { halign: "center", cellWidth: 22 },
          6: { halign: "right", cellWidth: 20 },
          7: { cellWidth: 45 },
        },
        margin: { left: 10, right: 10 },
        theme: "striped",
        didDrawPage: (dataArg) => {
          // Footer en cada página
          const str = `Página ${doc.internal.getCurrentPageInfo().pageNumber} · Generado ${new Date().toLocaleString("es-MX")}`;
          doc.setFontSize(8);
          doc.setTextColor(130, 130, 130);
          doc.text(str, pageWidth / 2, pageHeight - 6, { align: "center" });
        },
      });

      doc.save(`${buildExportFilename()}.pdf`);

      toast({
        title: "PDF generado",
        description: `${allRows.length} turnos exportados correctamente.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error("[export pdf] error:", err);
      toast({
        title: "Error al exportar",
        description: err.message || "No se pudo generar el archivo PDF.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setExporting(false);
    }
  };

  // Reset page cuando cambian filtros que no son la página
  useEffect(() => {
    setPage(1);
  }, [dateFrom, dateTo, phlebotomistId]);

  if (!mounted) {
    return (
      <ModernContainer>
        <Flex justify="center" align="center" minH="100vh">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      </ModernContainer>
    );
  }

  return (
    <ModernContainer>
      {/* Header */}
      <Flex align="center" mb={6} gap={3}>
        <Tooltip label="Volver a Estadísticas" hasArrow>
          <IconButton
            aria-label="Volver"
            icon={<FaArrowLeft />}
            variant="ghost"
            colorScheme="blue"
            onClick={() => router.push("/statistics")}
          />
        </Tooltip>
        <Box flex="1">
          <ModernHeader
            title="Estadísticas por Paciente"
            subtitle="Detalle turno por turno con tiempos de atención"
            time={false}
            mb={0}
          />
        </Box>
      </Flex>

      {/* Filtros */}
      <GlassCard
        p={6}
        mb={6}
        animation={`${fadeInUp} 0.6s ease-out`}
      >
        <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4}>
          <FormControl>
            <FormLabel fontSize="sm" color="secondary.700" fontWeight="semibold">
              <HStack spacing={2}>
                <FaCalendarAlt />
                <Text>Desde</Text>
              </HStack>
            </FormLabel>
            <Input
              type="date"
              value={dateFrom}
              max={dateTo}
              onChange={(e) => setDateFrom(e.target.value)}
              bg="white"
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" color="secondary.700" fontWeight="semibold">
              <HStack spacing={2}>
                <FaCalendarAlt />
                <Text>Hasta</Text>
              </HStack>
            </FormLabel>
            <Input
              type="date"
              value={dateTo}
              min={dateFrom}
              max={today}
              onChange={(e) => setDateTo(e.target.value)}
              bg="white"
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" color="secondary.700" fontWeight="semibold">
              <HStack spacing={2}>
                <FaUserMd />
                <Text>Flebotomista</Text>
              </HStack>
            </FormLabel>
            <Select
              placeholder="Todos"
              value={phlebotomistId}
              onChange={(e) => setPhlebotomistId(e.target.value)}
              bg="white"
            >
              {phlebotomists.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl gridColumn={{ base: "auto", lg: "span 2" }}>
            <FormLabel fontSize="sm" color="secondary.700" fontWeight="semibold">
              <HStack spacing={2}>
                <FaSearch />
                <Text>Buscar (nombre, OT o # turno)</Text>
              </HStack>
            </FormLabel>
            <Input
              placeholder="Ej: García, 2603, 11873..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              bg="white"
            />
          </FormControl>
        </SimpleGrid>

        <Flex justify="flex-end" mt={4} gap={2} flexWrap="wrap">
          <Button
            leftIcon={<FaBroom />}
            size="sm"
            variant="outline"
            colorScheme="blue"
            onClick={handleClearFilters}
            isDisabled={exporting}
          >
            Limpiar filtros
          </Button>
          <Menu>
            <MenuButton
              as={Button}
              leftIcon={<FaDownload />}
              size="sm"
              colorScheme="teal"
              variant="solid"
              isLoading={exporting}
              loadingText="Exportando..."
              isDisabled={loading || total === 0}
            >
              Exportar
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FaFileExcel color="#16a34a" />} onClick={handleExportExcel}>
                Descargar Excel (.xlsx)
              </MenuItem>
              <MenuItem icon={<FaFilePdf color="#dc2626" />} onClick={handleExportPDF}>
                Descargar PDF
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </GlassCard>

      {/* Tabla */}
      <GlassCard p={6} animation={`${fadeInUp} 0.8s ease-out`}>
        {loading ? (
          <Flex justify="center" align="center" minH="200px">
            <VStack spacing={3}>
              <Spinner size="xl" color="blue.500" thickness="4px" />
              <Text color="secondary.600">Cargando turnos...</Text>
            </VStack>
          </Flex>
        ) : rows.length === 0 ? (
          <Flex justify="center" align="center" minH="200px">
            <VStack spacing={3}>
              <FaUser size={48} color="#A0AEC0" />
              <Text color="secondary.600" fontSize="lg" fontWeight="medium">
                No se encontraron turnos en este rango
              </Text>
              <Text color="secondary.500" fontSize="sm">
                Ajusta los filtros y vuelve a intentar
              </Text>
            </VStack>
          </Flex>
        ) : (
          <>
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>#&nbsp;Turno</Th>
                    <Th>OT&nbsp;LABSIS</Th>
                    <Th>Paciente</Th>
                    <Th>Hora inicio</Th>
                    <Th>Hora fin</Th>
                    <Th isNumeric>Tiempo&nbsp;(min)</Th>
                    <Th>Flebotomista</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {rows.map((row) => (
                    <Tr key={row.id} _hover={{ bg: "rgba(79, 125, 243, 0.05)" }}>
                      <Td fontWeight="bold" color="blue.700">
                        {row.turnNumber ?? "—"}
                      </Td>
                      <Td>
                        <Text fontSize="sm" fontFamily="mono">
                          {row.workOrder || "—"}
                        </Text>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">{row.patientName}</Text>
                          {row.tipoAtencion &&
                            row.tipoAtencion !== "General" && (
                              <Badge
                                colorScheme={
                                  PRIORITY_COLORS[row.tipoAtencion] || "gray"
                                }
                                fontSize="xs"
                              >
                                {PRIORITY_LABELS[row.tipoAtencion] ||
                                  row.tipoAtencion}
                              </Badge>
                            )}
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm" fontFamily="mono">
                          {formatTime(row.startTime)}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm" fontFamily="mono">
                          {formatTime(row.endTime)}
                        </Text>
                      </Td>
                      <Td isNumeric fontWeight="semibold">
                        {row.durationMinutes.toFixed(1)}
                      </Td>
                      <Td>
                        <Text fontSize="sm">{row.phlebotomistName}</Text>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>

            {/* Paginación */}
            <Flex
              justify="space-between"
              align="center"
              mt={4}
              pt={4}
              borderTop="1px solid"
              borderColor="gray.200"
              flexWrap="wrap"
              gap={3}
            >
              <Text color="secondary.600" fontSize="sm">
                Página <strong>{page}</strong> de <strong>{totalPages}</strong>
                {" · "}
                <strong>{total}</strong>{" "}
                {total === 1 ? "turno" : "turnos"}
              </Text>
              <HStack spacing={2}>
                <Button
                  leftIcon={<FaChevronLeft />}
                  size="sm"
                  variant="outline"
                  onClick={handlePrevPage}
                  isDisabled={page <= 1 || loading}
                >
                  Anterior
                </Button>
                <Button
                  rightIcon={<FaChevronRight />}
                  size="sm"
                  variant="outline"
                  onClick={handleNextPage}
                  isDisabled={page >= totalPages || loading}
                >
                  Siguiente
                </Button>
              </HStack>
            </Flex>
          </>
        )}
      </GlassCard>
    </ModernContainer>
  );
});

export default PatientStatisticsPage;
