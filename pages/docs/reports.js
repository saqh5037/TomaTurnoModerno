import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Badge,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  List,
  ListItem,
  ListIcon,
  Code,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  SimpleGrid,
  Flex,
  Icon,
  Circle,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useToast,
  Tooltip,
  Tag,
  TagLabel,
  TagLeftIcon,
  Avatar,
  AvatarGroup,
  FormControl,
  FormLabel,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Switch,
  Wrap,
  WrapItem,
  IconButton,
  Checkbox,
  CheckboxGroup,
  Stack,
  Radio,
  RadioGroup,
  Textarea,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaFilePdf, FaFileExcel, FaFileExport, FaDownload,
  FaPrint, FaEnvelope, FaCalendarAlt, FaClock,
  FaFilter, FaChartBar, FaChartPie, FaChartLine,
  FaTable, FaDatabase, FaCloudUploadAlt, FaCloudDownloadAlt,
  FaCog, FaCheckCircle, FaTimesCircle, FaExclamationTriangle,
  FaInfoCircle, FaBell, FaHistory, FaSync,
  FaPlay, FaPause, FaStop, FaForward,
  FaLock, FaUnlock, FaUserShield, FaKey,
  FaEdit, FaSave, FaTrash, FaPlus,
  FaPaperPlane, FaRocket, FaFlag, FaBookmark,
  FaTags, FaFolderOpen, FaArchive, FaCompressArrowsAlt,
  FaExpandArrowsAlt, FaQrcode, FaBarcode, FaImage,
  FaFileAlt, FaClipboardList, FaClipboardCheck,
  FaMagic, FaPalette, FaBrush, FaArrowRight, FaLightbulb,
  FaSearch, FaEye, FaArrowLeft
} from 'react-icons/fa';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { GlassCard, ModernContainer } from '../../components/theme/ModernTheme';
import ProtectedRoute from '../../components/ProtectedRoute';

// Animaciones
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
`;

const MotionBox = motion(Box);

const ReportsDocumentation = () => {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [activeTab, setActiveTab] = useState(0);
  const [selectedReportType, setSelectedReportType] = useState('daily');
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportProgress, setReportProgress] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  const [scheduledReports, setScheduledReports] = useState([]);

  // Tipos de reportes
  const reportTypes = [
    {
      id: 'daily',
      name: 'Reporte Diario',
      icon: FaCalendarAlt,
      description: 'Resumen operativo del día',
      color: 'blue',
      sections: ['Resumen ejecutivo', 'KPIs del día', 'Detalle por hora', 'Incidencias'],
      estimatedTime: '30 segundos',
      size: '~2 MB'
    },
    {
      id: 'weekly',
      name: 'Reporte Semanal',
      icon: FaClock,
      description: 'Análisis de 7 días',
      color: 'green',
      sections: ['Comparativa diaria', 'Tendencias', 'Top performers', 'Recomendaciones'],
      estimatedTime: '45 segundos',
      size: '~5 MB'
    },
    {
      id: 'monthly',
      name: 'Reporte Mensual',
      icon: FaChartBar,
      description: 'Análisis completo del mes',
      color: 'purple',
      sections: ['Dashboard ejecutivo', 'Análisis detallado', 'Comparativas', 'Proyecciones'],
      estimatedTime: '1 minuto',
      size: '~10 MB'
    },
    {
      id: 'custom',
      name: 'Reporte Personalizado',
      icon: FaCog,
      description: 'Configuración flexible',
      color: 'orange',
      sections: ['Personalizable según necesidades'],
      estimatedTime: 'Variable',
      size: 'Variable'
    }
  ];

  // Formatos de exportación
  const exportFormats = [
    {
      id: 'pdf',
      name: 'PDF',
      icon: FaFilePdf,
      color: 'red',
      features: ['Gráficos incluidos', 'Listo para imprimir', 'Marca de agua', 'Índice interactivo'],
      recommended: true
    },
    {
      id: 'excel',
      name: 'Excel',
      icon: FaFileExcel,
      color: 'green',
      features: ['Datos editables', 'Múltiples hojas', 'Fórmulas activas', 'Gráficos dinámicos'],
      recommended: false
    },
    {
      id: 'csv',
      name: 'CSV',
      icon: FaTable,
      color: 'blue',
      features: ['Formato universal', 'Importación fácil', 'Tamaño reducido', 'Compatible con todo'],
      recommended: false
    },
    {
      id: 'json',
      name: 'JSON',
      icon: FaDatabase,
      color: 'purple',
      features: ['Estructura de datos', 'Para desarrolladores', 'API friendly', 'Procesamiento automático'],
      recommended: false
    }
  ];

  // Plantillas de diseño
  const reportTemplates = [
    {
      id: 'standard',
      name: 'Estándar',
      preview: '📊',
      description: 'Diseño clásico profesional',
      features: ['Logo institucional', 'Colores corporativos', 'Formato A4']
    },
    {
      id: 'executive',
      name: 'Ejecutivo',
      preview: '💼',
      description: 'Para alta gerencia',
      features: ['Resumen en primera página', 'Gráficos destacados', 'Conclusiones']
    },
    {
      id: 'detailed',
      name: 'Detallado',
      preview: '📋',
      description: 'Información completa',
      features: ['Todos los datos', 'Tablas extensas', 'Anexos incluidos']
    },
    {
      id: 'minimal',
      name: 'Minimalista',
      preview: '📄',
      description: 'Simple y directo',
      features: ['Solo lo esencial', 'Una página', 'Infografía']
    }
  ];

  // Opciones de programación
  const scheduleOptions = [
    { value: 'none', label: 'Sin programación' },
    { value: 'daily', label: 'Diario' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' },
    { value: 'custom', label: 'Personalizado' }
  ];

  // Simulación de generación de reporte
  const generateReport = () => {
    setIsGenerating(true);
    setReportProgress(0);

    const interval = setInterval(() => {
      setReportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          toast({
            title: 'Reporte generado exitosamente',
            description: `${selectedReportType.toUpperCase()}.${selectedFormat} descargado`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          return 100;
        }
        return prev + 20;
      });
    }, 500);
  };

  // Secciones del reporte
  const reportSections = [
    {
      id: 'header',
      name: 'Encabezado',
      configurable: true,
      options: ['Logo', 'Título', 'Fecha', 'Autor']
    },
    {
      id: 'summary',
      name: 'Resumen Ejecutivo',
      configurable: true,
      options: ['KPIs principales', 'Alertas', 'Highlights']
    },
    {
      id: 'charts',
      name: 'Visualizaciones',
      configurable: true,
      options: ['Barras', 'Líneas', 'Pastel', 'Áreas']
    },
    {
      id: 'tables',
      name: 'Tablas de Datos',
      configurable: true,
      options: ['Detalle completo', 'Agregados', 'Comparativas']
    },
    {
      id: 'footer',
      name: 'Pie de Página',
      configurable: true,
      options: ['Página', 'Confidencialidad', 'Versión']
    }
  ];

  // Estados de proceso
  const processSteps = [
    { step: 1, name: 'Recopilación', icon: FaDatabase, status: 'completed' },
    { step: 2, name: 'Procesamiento', icon: FaCog, status: 'completed' },
    { step: 3, name: 'Generación', icon: FaMagic, status: 'active' },
    { step: 4, name: 'Formato', icon: FaPalette, status: 'pending' },
    { step: 5, name: 'Descarga', icon: FaDownload, status: 'pending' }
  ];

  return (
    <ProtectedRoute allowedRoles={['admin', 'flebotomista', 'usuario']}>
      <ModernContainer maxW="container.xl">
          <VStack spacing={0} align="center" width="100%">
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              width="100%"
              maxW="1200px"
            >
            {/* Header */}
            <GlassCard mb={8} width="100%">
              <VStack spacing={6} align="center">
                <HStack width="100%" justify="space-between">
                  <Button
                    leftIcon={<FaArrowLeft />}
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/docs')}
                  >
                    Volver
                  </Button>
                  <HStack spacing={2}>
                    <Button
                      leftIcon={<FaHistory />}
                      size="sm"
                      variant="outline"
                      onClick={onOpen}
                    >
                      Historial
                    </Button>
                    <Button
                      leftIcon={<FaRocket />}
                      size="sm"
                      colorScheme="purple"
                      onClick={generateReport}
                      isLoading={isGenerating}
                    >
                      Generar
                    </Button>
                  </HStack>
                </HStack>

                <VStack spacing={4} align="center" width="100%">
                  <Icon as={FaFileExport} boxSize={16} color="purple.500" />
                  <Heading size="xl" textAlign="center">
                    Módulo de Reportes
                  </Heading>
                  <Text fontSize="lg" color="gray.600" textAlign="center" maxW="600px" mx="auto">
                    Generación y exportación de reportes del sistema
                  </Text>
                </VStack>

                {/* Quick Actions */}
                <HStack spacing={4} wrap="wrap" justify="center">
                  {reportTypes.map((type) => (
                    <Tag
                      key={type.id}
                      size="lg"
                      borderRadius="full"
                      variant="subtle"
                      colorScheme={type.id === selectedReportType ? 'purple' : 'gray'}
                      cursor="pointer"
                      onClick={() => setSelectedReportType(type.id)}
                    >
                      <TagLeftIcon as={type.icon} />
                      <TagLabel>{type.name}</TagLabel>
                    </Tag>
                  ))}
                </HStack>

                {/* Progress Bar */}
                {isGenerating && (
                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" color="gray.600">
                        Generando reporte...
                      </Text>
                      <Text fontSize="sm" fontWeight="bold">
                        {reportProgress}%
                      </Text>
                    </HStack>
                    <Progress
                      value={reportProgress}
                      colorScheme="purple"
                      size="sm"
                      borderRadius="full"
                      hasStripe
                      isAnimated
                    />
                  </Box>
                )}
              </VStack>
            </GlassCard>

            {/* Main Content Tabs */}
            <Tabs variant="soft-rounded" colorScheme="purple" onChange={setActiveTab}>
              <TabList mb={6}>
                <Tab>📊 Tipos de Reportes</Tab>
                <Tab>🎨 Diseño y Formato</Tab>
                <Tab>⚙️ Configuración</Tab>
                <Tab>📅 Programación</Tab>
                <Tab>🔐 Seguridad</Tab>
              </TabList>

              <TabPanels>
                {/* Tipos de Reportes */}
                <TabPanel>
                  <VStack spacing={8}>
                    <GlassCard>
                      <VStack align="stretch" spacing={6}>
                        <Heading size="md">Seleccionar Tipo de Reporte</Heading>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          {reportTypes.map((report) => (
                            <Box
                              key={report.id}
                              p={6}
                              borderRadius="xl"
                              bg="white"
                              boxShadow="md"
                              borderLeft="4px solid"
                              borderColor={`${report.color}.500`}
                              cursor="pointer"
                              transition="all 0.3s"
                              _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
                              onClick={() => setSelectedReportType(report.id)}
                            >
                              <HStack mb={4}>
                                <Icon as={report.icon} boxSize={8} color={`${report.color}.500`} />
                                <VStack align="start" flex={1}>
                                  <Heading size="sm">{report.name}</Heading>
                                  <Text fontSize="sm" color="gray.600">{report.description}</Text>
                                </VStack>
                                {selectedReportType === report.id && (
                                  <Icon as={FaCheckCircle} color="green.500" boxSize={6} />
                                )}
                              </HStack>

                              <VStack align="stretch" spacing={3}>
                                <Text fontSize="sm" fontWeight="bold">Incluye:</Text>
                                <List spacing={1}>
                                  {report.sections.map((section, idx) => (
                                    <ListItem key={idx} fontSize="sm">
                                      <ListIcon as={FaCheckCircle} color="green.500" />
                                      {section}
                                    </ListItem>
                                  ))}
                                </List>

                                <HStack justify="space-between" pt={2}>
                                  <Badge colorScheme="blue">{report.estimatedTime}</Badge>
                                  <Badge colorScheme="purple">{report.size}</Badge>
                                </HStack>
                              </VStack>
                            </Box>
                          ))}
                        </SimpleGrid>
                      </VStack>
                    </GlassCard>

                    {/* Configuración de Contenido */}
                    <GlassCard>
                      <VStack align="stretch" spacing={6}>
                        <Heading size="md">Configuración de Contenido</Heading>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <FormControl>
                            <FormLabel>Período de Datos</FormLabel>
                            <Select defaultValue="current">
                              <option value="today">Hoy</option>
                              <option value="yesterday">Ayer</option>
                              <option value="week">Esta Semana</option>
                              <option value="month">Este Mes</option>
                              <option value="quarter">Trimestre</option>
                              <option value="year">Año</option>
                              <option value="custom">Personalizado</option>
                            </Select>
                          </FormControl>

                          <FormControl>
                            <FormLabel>Nivel de Detalle</FormLabel>
                            <Select defaultValue="standard">
                              <option value="summary">Resumen</option>
                              <option value="standard">Estándar</option>
                              <option value="detailed">Detallado</option>
                              <option value="complete">Completo</option>
                            </Select>
                          </FormControl>

                          <FormControl>
                            <FormLabel>Incluir Gráficos</FormLabel>
                            <Switch colorScheme="purple" defaultChecked />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Incluir Tablas</FormLabel>
                            <Switch colorScheme="purple" defaultChecked />
                          </FormControl>
                        </SimpleGrid>

                        <VStack align="stretch" spacing={3}>
                          <Text fontWeight="bold">Secciones a Incluir:</Text>
                          <CheckboxGroup defaultValue={['header', 'summary', 'charts', 'tables']}>
                            <Stack spacing={2}>
                              {reportSections.map((section) => (
                                <Checkbox key={section.id} value={section.id}>
                                  {section.name}
                                </Checkbox>
                              ))}
                            </Stack>
                          </CheckboxGroup>
                        </VStack>
                      </VStack>
                    </GlassCard>
                  </VStack>
                </TabPanel>

                {/* Diseño y Formato */}
                <TabPanel>
                  <VStack spacing={8}>
                    <GlassCard>
                      <VStack align="stretch" spacing={6}>
                        <Heading size="md">Formato de Exportación</Heading>

                        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                          {exportFormats.map((format) => (
                            <Box
                              key={format.id}
                              p={4}
                              borderRadius="lg"
                              bg={selectedFormat === format.id ? `${format.color}.50` : 'white'}
                              border="2px solid"
                              borderColor={selectedFormat === format.id ? `${format.color}.500` : 'gray.200'}
                              cursor="pointer"
                              onClick={() => setSelectedFormat(format.id)}
                              position="relative"
                            >
                              {format.recommended && (
                                <Badge
                                  position="absolute"
                                  top={2}
                                  right={2}
                                  colorScheme="green"
                                >
                                  Recomendado
                                </Badge>
                              )}

                              <VStack spacing={3}>
                                <Icon as={format.icon} boxSize={10} color={`${format.color}.500`} />
                                <Text fontWeight="bold">{format.name}</Text>
                                <List spacing={1}>
                                  {format.features.map((feature, idx) => (
                                    <ListItem key={idx} fontSize="xs">
                                      <ListIcon as={FaCheckCircle} color="green.500" />
                                      {feature}
                                    </ListItem>
                                  ))}
                                </List>
                              </VStack>
                            </Box>
                          ))}
                        </SimpleGrid>
                      </VStack>
                    </GlassCard>

                    <GlassCard>
                      <VStack align="stretch" spacing={6}>
                        <Heading size="md">Plantilla de Diseño</Heading>

                        <RadioGroup value={selectedTemplate} onChange={setSelectedTemplate}>
                          <Stack spacing={4}>
                            {reportTemplates.map((template) => (
                              <Box
                                key={template.id}
                                p={4}
                                borderRadius="lg"
                                bg={selectedTemplate === template.id ? 'purple.50' : 'gray.50'}
                                border="2px solid"
                                borderColor={selectedTemplate === template.id ? 'purple.500' : 'transparent'}
                              >
                                <Radio value={template.id}>
                                  <HStack spacing={4}>
                                    <Text fontSize="2xl">{template.preview}</Text>
                                    <VStack align="start" spacing={1}>
                                      <Text fontWeight="bold">{template.name}</Text>
                                      <Text fontSize="sm" color="gray.600">
                                        {template.description}
                                      </Text>
                                      <HStack spacing={2}>
                                        {template.features.map((feature, idx) => (
                                          <Badge key={idx} size="sm">{feature}</Badge>
                                        ))}
                                      </HStack>
                                    </VStack>
                                  </HStack>
                                </Radio>
                              </Box>
                            ))}
                          </Stack>
                        </RadioGroup>

                        <Divider />

                        <VStack align="stretch" spacing={4}>
                          <Text fontWeight="bold">Personalización Visual</Text>

                          <FormControl>
                            <FormLabel>Color Principal</FormLabel>
                            <HStack spacing={2}>
                              {['purple', 'blue', 'green', 'red', 'orange'].map((color) => (
                                <Circle
                                  key={color}
                                  size="40px"
                                  bg={`${color}.500`}
                                  cursor="pointer"
                                  border="3px solid"
                                  borderColor="white"
                                  boxShadow="md"
                                />
                              ))}
                            </HStack>
                          </FormControl>

                          <FormControl>
                            <FormLabel>Tamaño de Fuente</FormLabel>
                            <Slider defaultValue={12} min={10} max={16} step={1}>
                              <SliderTrack>
                                <SliderFilledTrack bg="purple.500" />
                              </SliderTrack>
                              <SliderThumb />
                            </Slider>
                          </FormControl>

                          <FormControl>
                            <FormLabel>Orientación</FormLabel>
                            <RadioGroup defaultValue="portrait">
                              <HStack spacing={4}>
                                <Radio value="portrait">Vertical</Radio>
                                <Radio value="landscape">Horizontal</Radio>
                              </HStack>
                            </RadioGroup>
                          </FormControl>
                        </VStack>
                      </VStack>
                    </GlassCard>
                  </VStack>
                </TabPanel>

                {/* Configuración */}
                <TabPanel>
                  <VStack spacing={8}>
                    <GlassCard>
                      <VStack align="stretch" spacing={6}>
                        <Heading size="md">Configuración General</Heading>

                        <Alert status="info" borderRadius="lg">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Configuración Global</AlertTitle>
                            <AlertDescription>
                              Estos ajustes afectan a todos los reportes generados en el sistema
                            </AlertDescription>
                          </Box>
                        </Alert>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <FormControl>
                            <FormLabel>Idioma del Reporte</FormLabel>
                            <Select defaultValue="es">
                              <option value="es">Español</option>
                              <option value="en">Inglés</option>
                              <option value="pt">Portugués</option>
                            </Select>
                          </FormControl>

                          <FormControl>
                            <FormLabel>Zona Horaria</FormLabel>
                            <Select defaultValue="america/mexico">
                              <option value="america/mexico">Ciudad de México</option>
                              <option value="america/new_york">Nueva York</option>
                              <option value="utc">UTC</option>
                            </Select>
                          </FormControl>

                          <FormControl>
                            <FormLabel>Formato de Fecha</FormLabel>
                            <Select defaultValue="dd/mm/yyyy">
                              <option value="dd/mm/yyyy">DD/MM/AAAA</option>
                              <option value="mm/dd/yyyy">MM/DD/AAAA</option>
                              <option value="yyyy-mm-dd">AAAA-MM-DD</option>
                            </Select>
                          </FormControl>

                          <FormControl>
                            <FormLabel>Decimales en Números</FormLabel>
                            <Select defaultValue="2">
                              <option value="0">Sin decimales</option>
                              <option value="1">1 decimal</option>
                              <option value="2">2 decimales</option>
                              <option value="3">3 decimales</option>
                            </Select>
                          </FormControl>
                        </SimpleGrid>

                        <Divider />

                        <VStack align="stretch" spacing={4}>
                          <Text fontWeight="bold">Límites y Restricciones</Text>

                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl>
                              <FormLabel>Máximo de Registros</FormLabel>
                              <Input type="number" defaultValue="10000" />
                            </FormControl>

                            <FormControl>
                              <FormLabel>Tamaño Máximo (MB)</FormLabel>
                              <Input type="number" defaultValue="50" />
                            </FormControl>

                            <FormControl>
                              <FormLabel>Timeout (segundos)</FormLabel>
                              <Input type="number" defaultValue="300" />
                            </FormControl>

                            <FormControl>
                              <FormLabel>Caché (minutos)</FormLabel>
                              <Input type="number" defaultValue="15" />
                            </FormControl>
                          </SimpleGrid>
                        </VStack>

                        <Divider />

                        <VStack align="stretch" spacing={4}>
                          <Text fontWeight="bold">Información del Sistema</Text>

                          <FormControl>
                            <FormLabel>Nombre de la Institución</FormLabel>
                            <Input defaultValue="Hospital General" />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Logo URL</FormLabel>
                            <Input type="url" placeholder="https://ejemplo.com/logo.png" />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Pie de Página</FormLabel>
                            <Textarea
                              placeholder="Texto que aparecerá en el pie de todos los reportes"
                              rows={3}
                            />
                          </FormControl>
                        </VStack>
                      </VStack>
                    </GlassCard>
                  </VStack>
                </TabPanel>

                {/* Programación */}
                <TabPanel>
                  <VStack spacing={8}>
                    <GlassCard>
                      <VStack align="stretch" spacing={6}>
                        <HStack justify="space-between">
                          <Heading size="md">Reportes Programados</Heading>
                          <Button
                            size="sm"
                            leftIcon={<FaPlus />}
                            colorScheme="purple"
                          >
                            Nueva Programación
                          </Button>
                        </HStack>

                        <TableContainer>
                          <Table variant="simple" size="sm">
                            <Thead>
                              <Tr>
                                <Th>Nombre</Th>
                                <Th>Tipo</Th>
                                <Th>Frecuencia</Th>
                                <Th>Próxima Ejecución</Th>
                                <Th>Estado</Th>
                                <Th>Acciones</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              <Tr>
                                <Td>Reporte Diario Operativo</Td>
                                <Td>Diario</Td>
                                <Td>Todos los días 23:59</Td>
                                <Td>Hoy 23:59</Td>
                                <Td>
                                  <Badge colorScheme="green">Activo</Badge>
                                </Td>
                                <Td>
                                  <HStack spacing={1}>
                                    <IconButton
                                      size="xs"
                                      icon={<FaEdit />}
                                      aria-label="Editar"
                                    />
                                    <IconButton
                                      size="xs"
                                      icon={<FaPause />}
                                      aria-label="Pausar"
                                    />
                                    <IconButton
                                      size="xs"
                                      icon={<FaTrash />}
                                      colorScheme="red"
                                      aria-label="Eliminar"
                                    />
                                  </HStack>
                                </Td>
                              </Tr>
                              <Tr>
                                <Td>Resumen Semanal</Td>
                                <Td>Semanal</Td>
                                <Td>Domingos 23:59</Td>
                                <Td>Domingo 23:59</Td>
                                <Td>
                                  <Badge colorScheme="green">Activo</Badge>
                                </Td>
                                <Td>
                                  <HStack spacing={1}>
                                    <IconButton
                                      size="xs"
                                      icon={<FaEdit />}
                                      aria-label="Editar"
                                    />
                                    <IconButton
                                      size="xs"
                                      icon={<FaPause />}
                                      aria-label="Pausar"
                                    />
                                    <IconButton
                                      size="xs"
                                      icon={<FaTrash />}
                                      colorScheme="red"
                                      aria-label="Eliminar"
                                    />
                                  </HStack>
                                </Td>
                              </Tr>
                              <Tr>
                                <Td>Análisis Mensual</Td>
                                <Td>Mensual</Td>
                                <Td>Último día del mes</Td>
                                <Td>31 de enero</Td>
                                <Td>
                                  <Badge colorScheme="yellow">Pausado</Badge>
                                </Td>
                                <Td>
                                  <HStack spacing={1}>
                                    <IconButton
                                      size="xs"
                                      icon={<FaEdit />}
                                      aria-label="Editar"
                                    />
                                    <IconButton
                                      size="xs"
                                      icon={<FaPlay />}
                                      aria-label="Activar"
                                    />
                                    <IconButton
                                      size="xs"
                                      icon={<FaTrash />}
                                      colorScheme="red"
                                      aria-label="Eliminar"
                                    />
                                  </HStack>
                                </Td>
                              </Tr>
                            </Tbody>
                          </Table>
                        </TableContainer>
                      </VStack>
                    </GlassCard>

                    <GlassCard>
                      <VStack align="stretch" spacing={6}>
                        <Heading size="md">Nueva Programación</Heading>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <FormControl>
                            <FormLabel>Nombre del Reporte</FormLabel>
                            <Input placeholder="Ej: Reporte Semanal de Eficiencia" />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Tipo de Reporte</FormLabel>
                            <Select>
                              {reportTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                  {type.name}
                                </option>
                              ))}
                            </Select>
                          </FormControl>

                          <FormControl>
                            <FormLabel>Frecuencia</FormLabel>
                            <Select>
                              {scheduleOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Select>
                          </FormControl>

                          <FormControl>
                            <FormLabel>Hora de Ejecución</FormLabel>
                            <Input type="time" defaultValue="23:59" />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Formato de Salida</FormLabel>
                            <Select>
                              {exportFormats.map((format) => (
                                <option key={format.id} value={format.id}>
                                  {format.name}
                                </option>
                              ))}
                            </Select>
                          </FormControl>

                          <FormControl>
                            <FormLabel>Destinatarios (Email)</FormLabel>
                            <Input placeholder="admin@hospital.com, gerencia@hospital.com" />
                          </FormControl>
                        </SimpleGrid>

                        <VStack align="stretch" spacing={3}>
                          <Text fontWeight="bold">Opciones Adicionales</Text>
                          <CheckboxGroup>
                            <Stack spacing={2}>
                              <Checkbox>Enviar por email</Checkbox>
                              <Checkbox>Guardar en servidor</Checkbox>
                              <Checkbox>Subir a la nube</Checkbox>
                              <Checkbox>Notificar al completar</Checkbox>
                              <Checkbox>Comprimir archivo</Checkbox>
                            </Stack>
                          </CheckboxGroup>
                        </VStack>

                        <HStack justify="flex-end" spacing={4}>
                          <Button variant="outline">Cancelar</Button>
                          <Button colorScheme="purple" leftIcon={<FaSave />}>
                            Guardar Programación
                          </Button>
                        </HStack>
                      </VStack>
                    </GlassCard>
                  </VStack>
                </TabPanel>

                {/* Seguridad */}
                <TabPanel>
                  <VStack spacing={8}>
                    <GlassCard>
                      <VStack align="stretch" spacing={6}>
                        <Heading size="md">Configuración de Seguridad</Heading>

                        <Alert status="warning" borderRadius="lg">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>Información Sensible</AlertTitle>
                            <AlertDescription>
                              Los reportes pueden contener información confidencial.
                              Configure adecuadamente los permisos y encriptación.
                            </AlertDescription>
                          </Box>
                        </Alert>

                        <VStack align="stretch" spacing={4}>
                          <Text fontWeight="bold">Permisos por Rol</Text>

                          <Box p={4} bg="gray.50" borderRadius="lg">
                            <VStack align="stretch" spacing={3}>
                              <HStack justify="space-between">
                                <Text>Administrador</Text>
                                <HStack>
                                  <Badge colorScheme="green">Ver</Badge>
                                  <Badge colorScheme="green">Crear</Badge>
                                  <Badge colorScheme="green">Exportar</Badge>
                                  <Badge colorScheme="green">Programar</Badge>
                                </HStack>
                              </HStack>

                              <HStack justify="space-between">
                                <Text>Flebotomista</Text>
                                <HStack>
                                  <Badge colorScheme="green">Ver (propios)</Badge>
                                  <Badge colorScheme="gray">Crear</Badge>
                                  <Badge colorScheme="green">Exportar (limitado)</Badge>
                                  <Badge colorScheme="gray">Programar</Badge>
                                </HStack>
                              </HStack>

                              <HStack justify="space-between">
                                <Text>Usuario</Text>
                                <HStack>
                                  <Badge colorScheme="green">Ver (público)</Badge>
                                  <Badge colorScheme="gray">Crear</Badge>
                                  <Badge colorScheme="gray">Exportar</Badge>
                                  <Badge colorScheme="gray">Programar</Badge>
                                </HStack>
                              </HStack>
                            </VStack>
                          </Box>
                        </VStack>

                        <Divider />

                        <VStack align="stretch" spacing={4}>
                          <Text fontWeight="bold">Opciones de Seguridad</Text>

                          <Stack spacing={3}>
                            <HStack justify="space-between">
                              <VStack align="start">
                                <Text>Encriptar reportes PDF</Text>
                                <Text fontSize="sm" color="gray.600">
                                  Requiere contraseña para abrir
                                </Text>
                              </VStack>
                              <Switch colorScheme="purple" />
                            </HStack>

                            <HStack justify="space-between">
                              <VStack align="start">
                                <Text>Marca de agua</Text>
                                <Text fontSize="sm" color="gray.600">
                                  Añade marca de agua de seguridad
                                </Text>
                              </VStack>
                              <Switch colorScheme="purple" defaultChecked />
                            </HStack>

                            <HStack justify="space-between">
                              <VStack align="start">
                                <Text>Auditoría de accesos</Text>
                                <Text fontSize="sm" color="gray.600">
                                  Registra quién genera cada reporte
                                </Text>
                              </VStack>
                              <Switch colorScheme="purple" defaultChecked />
                            </HStack>

                            <HStack justify="space-between">
                              <VStack align="start">
                                <Text>Expiración de reportes</Text>
                                <Text fontSize="sm" color="gray.600">
                                  Elimina reportes antiguos automáticamente
                                </Text>
                              </VStack>
                              <Switch colorScheme="purple" />
                            </HStack>

                            <HStack justify="space-between">
                              <VStack align="start">
                                <Text>Anonimización de datos</Text>
                                <Text fontSize="sm" color="gray.600">
                                  Oculta información personal sensible
                                </Text>
                              </VStack>
                              <Switch colorScheme="purple" />
                            </HStack>
                          </Stack>
                        </VStack>

                        <Divider />

                        <VStack align="stretch" spacing={4}>
                          <Text fontWeight="bold">Registro de Actividad</Text>

                          <TableContainer>
                            <Table variant="simple" size="sm">
                              <Thead>
                                <Tr>
                                  <Th>Usuario</Th>
                                  <Th>Reporte</Th>
                                  <Th>Fecha</Th>
                                  <Th>IP</Th>
                                  <Th>Estado</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                <Tr>
                                  <Td>admin@hospital.com</Td>
                                  <Td>Mensual_Enero.pdf</Td>
                                  <Td>31/01/2024 23:59</Td>
                                  <Td>192.168.1.100</Td>
                                  <Td>
                                    <Badge colorScheme="green">Exitoso</Badge>
                                  </Td>
                                </Tr>
                                <Tr>
                                  <Td>supervisor@hospital.com</Td>
                                  <Td>Semanal_S4.xlsx</Td>
                                  <Td>28/01/2024 18:30</Td>
                                  <Td>192.168.1.105</Td>
                                  <Td>
                                    <Badge colorScheme="green">Exitoso</Badge>
                                  </Td>
                                </Tr>
                                <Tr>
                                  <Td>flebo1@hospital.com</Td>
                                  <Td>Personal_Enero.pdf</Td>
                                  <Td>25/01/2024 14:22</Td>
                                  <Td>192.168.1.110</Td>
                                  <Td>
                                    <Badge colorScheme="red">Denegado</Badge>
                                  </Td>
                                </Tr>
                              </Tbody>
                            </Table>
                          </TableContainer>
                        </VStack>
                      </VStack>
                    </GlassCard>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>

            {/* Process Steps */}
            {isGenerating && (
              <GlassCard mt={8}>
                <VStack align="stretch" spacing={6}>
                  <Heading size="md">Proceso de Generación</Heading>

                  <HStack spacing={0} position="relative">
                    {processSteps.map((step, index) => (
                      <React.Fragment key={step.step}>
                        <VStack spacing={2} flex={1}>
                          <Circle
                            size="60px"
                            bg={
                              step.status === 'completed' ? 'green.500' :
                              step.status === 'active' ? 'purple.500' :
                              'gray.200'
                            }
                            color="white"
                          >
                            <Icon as={step.icon} boxSize={6} />
                          </Circle>
                          <Text
                            fontSize="sm"
                            fontWeight={step.status === 'active' ? 'bold' : 'normal'}
                            color={step.status === 'pending' ? 'gray.500' : 'black'}
                          >
                            {step.name}
                          </Text>
                        </VStack>
                        {index < processSteps.length - 1 && (
                          <Box
                            flex={1}
                            height="2px"
                            bg={step.status === 'completed' ? 'green.500' : 'gray.200'}
                            mx={-4}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </HStack>
                </VStack>
              </GlassCard>
            )}

            {/* Best Practices */}
            <GlassCard mt={8}>
              <VStack align="stretch" spacing={6}>
                <Heading size="md">
                  <Icon as={FaLightbulb} color="yellow.500" mr={2} />
                  Mejores Prácticas
                </Heading>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box p={4} bg="blue.50" borderRadius="lg">
                    <HStack mb={2}>
                      <Icon as={FaCalendarAlt} color="blue.500" />
                      <Text fontWeight="bold">Programación Regular</Text>
                    </HStack>
                    <Text fontSize="sm">
                      Programa reportes automáticos para mantener a todos informados
                      sin necesidad de solicitarlos manualmente.
                    </Text>
                  </Box>

                  <Box p={4} bg="green.50" borderRadius="lg">
                    <HStack mb={2}>
                      <Icon as={FaLock} color="green.500" />
                      <Text fontWeight="bold">Seguridad Primero</Text>
                    </HStack>
                    <Text fontSize="sm">
                      Siempre encripta reportes con información sensible y
                      verifica los permisos antes de compartir.
                    </Text>
                  </Box>

                  <Box p={4} bg="purple.50" borderRadius="lg">
                    <HStack mb={2}>
                      <Icon as={FaFilter} color="purple.500" />
                      <Text fontWeight="bold">Filtros Apropiados</Text>
                    </HStack>
                    <Text fontSize="sm">
                      Usa filtros para generar reportes específicos y relevantes,
                      evitando información innecesaria.
                    </Text>
                  </Box>

                  <Box p={4} bg="orange.50" borderRadius="lg">
                    <HStack mb={2}>
                      <Icon as={FaArchive} color="orange.500" />
                      <Text fontWeight="bold">Archivo Organizado</Text>
                    </HStack>
                    <Text fontSize="sm">
                      Mantén un sistema de nomenclatura consistente y archiva
                      reportes antiguos regularmente.
                    </Text>
                  </Box>
                </SimpleGrid>
              </VStack>
            </GlassCard>
          </MotionBox>

          {/* Modal Historial */}
          <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Historial de Reportes</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack align="stretch" spacing={4}>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FaSearch color="gray.300" />
                    </InputLeftElement>
                    <Input placeholder="Buscar reportes..." />
                  </InputGroup>

                  <TableContainer>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Nombre</Th>
                          <Th>Fecha</Th>
                          <Th>Tamaño</Th>
                          <Th>Acciones</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <Tr>
                          <Td>Reporte_Mensual_Enero.pdf</Td>
                          <Td>31/01/2024</Td>
                          <Td>2.5 MB</Td>
                          <Td>
                            <HStack spacing={1}>
                              <IconButton
                                size="xs"
                                icon={<FaDownload />}
                                aria-label="Descargar"
                              />
                              <IconButton
                                size="xs"
                                icon={<FaEye />}
                                aria-label="Ver"
                              />
                              <IconButton
                                size="xs"
                                icon={<FaTrash />}
                                colorScheme="red"
                                aria-label="Eliminar"
                              />
                            </HStack>
                          </Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </TableContainer>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button onClick={onClose}>Cerrar</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          </VStack>
        </ModernContainer>
    </ProtectedRoute>
  );
};

export default ReportsDocumentation;