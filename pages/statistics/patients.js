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
} from "react-icons/fa";
import { useRouter } from "next/router";
import { useAuth } from "../../contexts/AuthContext";
import {
  fadeInUp,
  GlassCard,
  ModernContainer,
  ModernHeader,
} from "../../components/theme/ModernTheme";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cargar lista de flebotomistas para el selector
  useEffect(() => {
    if (!mounted) return;
    fetch("/api/statistics/filters/phlebotomists")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPhlebotomists(data);
      })
      .catch((err) => {
        console.error("Error cargando flebotomistas:", err);
      });
  }, [mounted]);

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

        <Flex justify="flex-end" mt={4}>
          <Button
            leftIcon={<FaBroom />}
            size="sm"
            variant="outline"
            colorScheme="blue"
            onClick={handleClearFilters}
          >
            Limpiar filtros
          </Button>
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
