import { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  SimpleGrid,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack
} from "@chakra-ui/react";
import { FaArrowLeft, FaChevronDown, FaChevronRight, FaClipboardCheck, FaSyncAlt } from "react-icons/fa";
import { useRouter } from "next/router";
import { GlassCard, ModernContainer, ModernHeader } from "../../components/theme/ModernTheme";
import { workDateFor, SURVEY_TIME_ZONE } from "../../lib/surveyGate";
import {
  ROW_STATUS,
  ROW_STATUS_META,
  classifyRow,
  computeCompliance,
  formatWorkDate,
  matchPreset,
  presetRange,
  validateRange
} from "../../lib/surveyReportUi";

const PRESETS = [
  { key: "today", label: "Hoy" },
  { key: "last7", label: "Últimos 7 días" },
  { key: "month", label: "Este mes" }
];

const formatTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("es-MX", {
    timeZone: SURVEY_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

function Kpi({ label, value, hint, color = "secondary.800" }) {
  return (
    <GlassCard p={4}>
      <Text fontSize="sm" color="secondary.600" fontWeight="medium">
        {label}
      </Text>
      <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="extrabold" color={color} lineHeight="1.1">
        {value}
      </Text>
      {hint && (
        <Text fontSize="xs" color="secondary.500" mt={1}>
          {hint}
        </Text>
      )}
    </GlassCard>
  );
}

export default function SurveysReport() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});

  const rangeError = from && to ? validateRange(from, to) : null;

  const load = useCallback(async (rangeFrom, rangeTo) => {
    const invalid = validateRange(rangeFrom, rangeTo);
    if (invalid) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/surveys/report?from=${rangeFrom}&to=${rangeTo}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || `Error ${res.status}`);
      }
      setReport(json.data);
      setExpanded({});
    } catch (err) {
      setReport(null);
      setError(err.message || "No se pudo cargar el reporte.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = workDateFor(new Date());
    setToday(t);
    setFrom(t);
    setTo(t);
    setMounted(true);
    load(t, t);
  }, [load]);

  const applyPreset = (key) => {
    const r = presetRange(key, today);
    setFrom(r.from);
    setTo(r.to);
    load(r.from, r.to);
  };

  const activePreset = today ? matchPreset(from, to, today) : null;
  const rows = useMemo(() => report?.rows || [], [report]);
  const totals = report?.totals;
  const compliance = useMemo(() => computeCompliance(rows), [rows]);

  const toggle = (key) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <ModernContainer>
      <ModernHeader
        title="Encuestas de satisfacción"
        subtitle="Cumplimiento de la encuesta obligatoria por flebotomista y día"
      />

      <Flex align="center" gap={4} justify="flex-start" mb={6}>
        <Button
          leftIcon={<FaArrowLeft />}
          onClick={() => router.push("/statistics")}
          variant="outline"
          colorScheme="gray"
          size="sm"
        >
          Volver
        </Button>
      </Flex>

      {/* Filters */}
      <GlassCard p={{ base: 4, md: 6 }} mb={6}>
        <VStack align="stretch" spacing={4}>
          <Heading size="md" color="secondary.800" display="flex" alignItems="center" gap={2}>
            <Box as={FaClipboardCheck} color="primary.500" />
            Periodo
          </Heading>
          <ButtonGroup size="sm" isAttached={false} flexWrap="wrap" gap={2}>
            {PRESETS.map((p) => (
              <Button
                key={p.key}
                variant={activePreset === p.key ? "solid" : "outline"}
                colorScheme={activePreset === p.key ? "blue" : "gray"}
                onClick={() => applyPreset(p.key)}
                isDisabled={!mounted || loading}
                aria-pressed={activePreset === p.key}
              >
                {p.label}
              </Button>
            ))}
          </ButtonGroup>
          <Flex gap={4} align="end" wrap="wrap">
            <FormControl maxW="200px" isInvalid={Boolean(rangeError)}>
              <FormLabel fontSize="sm" fontWeight="semibold" color="secondary.700">
                Desde
              </FormLabel>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} bg="white" />
            </FormControl>
            <FormControl maxW="200px" isInvalid={Boolean(rangeError)}>
              <FormLabel fontSize="sm" fontWeight="semibold" color="secondary.700">
                Hasta
              </FormLabel>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} bg="white" />
            </FormControl>
            <Button
              variant="gradient"
              leftIcon={<FaSyncAlt />}
              onClick={() => load(from, to)}
              isDisabled={!mounted || Boolean(rangeError) || !from || !to}
              isLoading={loading}
              loadingText="Consultando"
            >
              Consultar
            </Button>
          </Flex>
          {rangeError && (
            <Text fontSize="sm" color="red.600" role="alert">
              {rangeError}
            </Text>
          )}
        </VStack>
      </GlassCard>

      {error && (
        <Alert status="error" borderRadius="md" mb={6}>
          <AlertIcon />
          <AlertDescription flex="1">{error}</AlertDescription>
          <Button size="sm" onClick={() => load(from, to)}>
            Reintentar
          </Button>
        </Alert>
      )}

      {/* KPIs */}
      {totals && !error && (
        <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={{ base: 3, md: 4 }} mb={6}>
          <Kpi label="Asignadas" value={totals.assigned} />
          <Kpi label="Contestadas" value={totals.completed} color="green.600" />
          <Kpi label="Negativas" value={totals.refused} color="orange.600" />
          <Kpi label="Pendientes" value={totals.pending} color="blue.600" />
          <Kpi
            label="% cumplimiento"
            value={compliance.percent === null ? "-" : `${compliance.percent}%`}
            hint={
              compliance.total === 0
                ? "Sin días con asignación"
                : `${compliance.compliant} de ${compliance.total} días-flebotomista`
            }
          />
        </SimpleGrid>
      )}

      {/* Table */}
      <GlassCard p={{ base: 3, md: 6 }} mb={6}>
        <Heading size="md" color="secondary.800" mb={4}>
          Detalle por flebotomista y día
        </Heading>

        {(loading || !mounted) && (
          <Flex justify="center" align="center" py={12} gap={3} role="status">
            <Spinner color="primary.500" />
            <Text color="secondary.600">Cargando reporte...</Text>
          </Flex>
        )}

        {mounted && !loading && !error && report && rows.length === 0 && (
          <VStack py={10} spacing={2}>
            <Text fontWeight="semibold" color="secondary.600">
              No hay encuestas asignadas en este periodo
            </Text>
            <Text fontSize="sm" color="secondary.500" textAlign="center">
              Si la encuesta obligatoria está desactivada o aún no se atendieron pacientes, no habrá registros.
            </Text>
          </VStack>
        )}

        {mounted && !loading && rows.length > 0 && (
          <Box overflowX="auto" maxW="100%" borderWidth="1px" borderColor="gray.200" borderRadius="md" bg="white">
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th w="40px" aria-label="Detalle" />
                  <Th>Fecha</Th>
                  <Th>Flebotomista</Th>
                  <Th isNumeric>Asignadas</Th>
                  <Th isNumeric>Contestadas</Th>
                  <Th isNumeric>Negativas</Th>
                  <Th isNumeric>Pendientes</Th>
                  <Th>Estado</Th>
                </Tr>
              </Thead>
              <Tbody>
                {rows.map((r) => {
                  const key = `${r.userId}|${r.workDate}`;
                  const status = classifyRow(r);
                  const meta = ROW_STATUS_META[status];
                  const hasRefusals = r.refusals?.length > 0;
                  const isOpen = Boolean(expanded[key]);
                  return (
                    <Fragment key={key}>
                      <Tr _hover={{ bg: "gray.50" }}>
                        <Td px={2}>
                          {hasRefusals && (
                            <IconButton
                              size="xs"
                              variant="ghost"
                              icon={isOpen ? <FaChevronDown /> : <FaChevronRight />}
                              aria-label={isOpen ? "Ocultar negativas" : "Ver negativas"}
                              aria-expanded={isOpen}
                              onClick={() => toggle(key)}
                            />
                          )}
                        </Td>
                        <Td whiteSpace="nowrap">{formatWorkDate(r.workDate)}</Td>
                        <Td fontWeight="medium">{r.name}</Td>
                        <Td isNumeric>{r.assigned}</Td>
                        <Td isNumeric>{r.completed}</Td>
                        <Td isNumeric>{r.refused}</Td>
                        <Td isNumeric>{r.pending}</Td>
                        <Td>
                          <Badge colorScheme={meta.colorScheme} px={2} py={1} borderRadius="md">
                            {meta.label}
                          </Badge>
                          {status === ROW_STATUS.NONE && (r.released > 0 || r.adminBypass > 0) && (
                            <Text fontSize="xs" color="secondary.500" mt={1}>
                              {r.released > 0 && `${r.released} liberada(s)`}
                              {r.released > 0 && r.adminBypass > 0 && " · "}
                              {r.adminBypass > 0 && `${r.adminBypass} omitida(s) por admin`}
                            </Text>
                          )}
                        </Td>
                      </Tr>
                      {hasRefusals && isOpen && (
                        <Tr bg="orange.50">
                          <Td colSpan={8}>
                            <Text fontSize="xs" fontWeight="bold" color="orange.800" mb={2}>
                              Negativas de {r.name} ({formatWorkDate(r.workDate)})
                            </Text>
                            <VStack align="stretch" spacing={2}>
                              {r.refusals.map((f) => (
                                <Box key={`${f.turnId}-${f.at}`} bg="white" borderRadius="md" p={2} fontSize="sm">
                                  <Flex gap={4} wrap="wrap">
                                    <Text>
                                      <b>Paciente:</b> {f.patientName || "-"}
                                    </Text>
                                    <Text>
                                      <b>Turno:</b> #{f.turnId}
                                    </Text>
                                    <Text>
                                      <b>Hora:</b> {formatTime(f.at)}
                                    </Text>
                                  </Flex>
                                  <Text>
                                    <b>Motivo:</b> {f.reason || "Sin motivo registrado"}
                                  </Text>
                                </Box>
                              ))}
                            </VStack>
                          </Td>
                        </Tr>
                      )}
                    </Fragment>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        )}

        <Text fontSize="xs" color="secondary.600" mt={4}>
          Toma-Turno no recibe las respuestas de REDCap; &quot;contestada&quot; significa que el flebotomista confirmó
          el envío (modo iframe: se detectó navegación en la encuesta; modo QR: confirmación manual). Cruza el total
          con el reporte de REDCap.
        </Text>
      </GlassCard>
    </ModernContainer>
  );
}
