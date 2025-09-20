import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Grid,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Progress,
  Tooltip,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  ChakraProvider,
  Container,
  Circle,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Center,
  Spinner
} from '@chakra-ui/react';
import {
  FaBook,
  FaSearch,
  FaBookmark,
  FaDownload,
  FaVideo,
  FaFileAlt,
  FaQuestionCircle,
  FaStar,
  FaGraduationCap,
  FaUserShield,
  FaUserMd,
  FaEye,
  FaPlay,
  FaChartBar,
  FaClock,
  FaArrowLeft,
  FaLightbulb,
  FaRocket,
  FaTrophy,
  FaUsers,
  FaHome
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { getContentByRole } from '../../lib/docs/content';
import SearchBar from '../../components/docs/SearchBar';
import OnboardingTour from '../../components/docs/OnboardingTour';
import { modernTheme, fadeInUp, slideInFromLeft, slideInFromRight, GlassCard, ModernContainer } from '../../components/theme/ModernTheme';
import ProtectedRoute from '../../components/ProtectedRoute';

const MotionBox = motion(Box);

const DocumentationHub = () => {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookmarks, setBookmarks] = useState([]);
  const [readingProgress, setReadingProgress] = useState({});
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  // Modal states
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const [previewModule, setPreviewModule] = useState(null);

  // Get role-specific content
  const roleContent = useMemo(() => {
    if (!user) return null;
    return getContentByRole(user.role || 'usuario');
  }, [user]);

  // Load saved data
  useEffect(() => {
    if (user) {
      const savedBookmarks = localStorage.getItem(`bookmarks_${user.id}`);
      const savedProgress = localStorage.getItem(`reading_progress_${user.id}`);

      if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
      if (savedProgress) setReadingProgress(JSON.parse(savedProgress));

      // Check if first visit
      const hasSeenOnboarding = localStorage.getItem(`onboarding_docs_${user.id}`);
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  // Filter modules
  const filteredModules = useMemo(() => {
    if (!roleContent) return [];

    let modules = [...roleContent.modules];

    // Filter by search
    if (searchTerm) {
      modules = modules.filter(module =>
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      modules = modules.filter(module =>
        module.tags?.includes(selectedCategory) ||
        module.difficulty === selectedCategory
      );
    }

    return modules;
  }, [roleContent, searchTerm, selectedCategory]);

  // Categories
  const categories = [
    { id: 'all', name: 'Todos', icon: FaBook, color: 'blue' },
    { id: 'basic', name: 'Básico', icon: FaGraduationCap, color: 'green' },
    { id: 'intermediate', name: 'Intermedio', icon: FaUserMd, color: 'orange' },
    { id: 'advanced', name: 'Avanzado', icon: FaTrophy, color: 'red' },
    { id: 'video', name: 'Videos', icon: FaVideo, color: 'purple' }
  ];

  // Handle module click
  const handleModuleClick = (moduleId) => {
    router.push(`/docs/${moduleId}`);
  };

  // Handle bookmark
  const toggleBookmark = (moduleId, e) => {
    e.stopPropagation();
    const newBookmarks = bookmarks.includes(moduleId)
      ? bookmarks.filter(id => id !== moduleId)
      : [...bookmarks, moduleId];

    setBookmarks(newBookmarks);
    localStorage.setItem(`bookmarks_${user.id}`, JSON.stringify(newBookmarks));

    toast({
      title: bookmarks.includes(moduleId) ? 'Marcador eliminado' : 'Marcador agregado',
      status: 'success',
      duration: 2000,
      isClosable: true
    });
  };

  // Handle preview
  const handlePreview = (module, e) => {
    e.stopPropagation();
    setPreviewModule(module);
    onPreviewOpen();
  };

  // Calculate stats
  const stats = {
    totalModules: roleContent?.modules.length || 0,
    completedModules: Object.keys(readingProgress).filter(k => readingProgress[k] === 100).length,
    bookmarkedModules: bookmarks.length,
    totalTime: roleContent?.modules.reduce((acc, m) => {
      const time = parseInt(m.estimatedTime) || 0;
      return acc + time;
    }, 0) || 0
  };

  // Get icon component
  const getIcon = (iconName) => {
    const icons = {
      FaUserShield,
      FaUserMd,
      FaEye,
      FaPlay,
      FaBook,
      FaChartBar,
      FaQuestionCircle,
      FaFileAlt,
      FaVideo,
      FaLightbulb,
      FaRocket,
      FaUsers
    };
    return icons[iconName] || FaBook;
  };

  if (!user || !roleContent) {
    return (
      <ChakraProvider theme={modernTheme}>
        <ModernContainer>
          <Center h="100vh">
            <VStack spacing={4}>
              <Spinner size="xl" color="blue.500" thickness="4px" />
              <Text fontSize="lg" color="gray.600">Cargando documentación...</Text>
            </VStack>
          </Center>
        </ModernContainer>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider theme={modernTheme}>
      <ProtectedRoute>
        <ModernContainer>
          <VStack spacing={8} align="stretch" py={8}>
            {/* Header con Glassmorphism */}
            <Box
              p={6}
              background="rgba(255, 255, 255, 0.25)"
              backdropFilter="blur(20px)"
              borderRadius="2xl"
              boxShadow="glass"
              border="1px solid rgba(255, 255, 255, 0.18)"
              animation={`${fadeInUp} 0.6s ease-out`}
            >
              <Flex justify="space-between" align="center" mb={6}>
                <HStack spacing={4}>
                  <IconButton
                    icon={<FaArrowLeft />}
                    onClick={() => router.push('/')}
                    variant="ghost"
                    aria-label="Volver"
                    _hover={{
                      transform: 'translateX(-2px)',
                      bg: 'rgba(79, 125, 243, 0.1)'
                    }}
                  />
                  <Box>
                    <Heading
                      fontSize={{ base: '2xl', md: '3xl' }}
                      fontWeight="extrabold"
                      background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
                      backgroundClip="text"
                      color="transparent"
                    >
                      Centro de Documentación
                    </Heading>
                    <Text color="gray.600" fontSize="sm">
                      {roleContent.title} - {roleContent.description}
                    </Text>
                  </Box>
                </HStack>

                <HStack spacing={3}>
                  <Button
                    leftIcon={<FaRocket />}
                    colorScheme="purple"
                    variant="outline"
                    onClick={() => router.push('/docs/learn')}
                    size="sm"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'md'
                    }}
                  >
                    Learning Path
                  </Button>
                  <Button
                    leftIcon={<FaPlay />}
                    colorScheme="green"
                    variant="outline"
                    onClick={() => router.push('/docs/tutorials')}
                    size="sm"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'md'
                    }}
                  >
                    Tutoriales
                  </Button>
                  <Button
                    leftIcon={<FaLightbulb />}
                    colorScheme="orange"
                    onClick={() => setShowOnboarding(true)}
                    size="sm"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'md'
                    }}
                  >
                    Tour
                  </Button>
                </HStack>
              </Flex>

              {/* Search Bar */}
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar en la documentación..."
                modules={roleContent.modules}
                onResultClick={handleModuleClick}
              />
            </Box>

            {/* Stats Cards con Glassmorphism */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <GlassCard p={4} animation={`${slideInFromLeft} 0.8s ease-out`}>
                <Stat>
                  <StatLabel color="gray.600">Total Módulos</StatLabel>
                  <StatNumber color="blue.600">{stats.totalModules}</StatNumber>
                  <StatHelpText>
                    <Icon as={FaBook} mr={1} />
                    Disponibles
                  </StatHelpText>
                </Stat>
              </GlassCard>

              <GlassCard p={4} animation={`${slideInFromLeft} 0.9s ease-out`}>
                <Stat>
                  <StatLabel color="gray.600">Completados</StatLabel>
                  <StatNumber color="green.600">{stats.completedModules}</StatNumber>
                  <StatHelpText>
                    <Progress
                      value={(stats.completedModules / stats.totalModules) * 100}
                      size="xs"
                      colorScheme="green"
                      borderRadius="full"
                    />
                  </StatHelpText>
                </Stat>
              </GlassCard>

              <GlassCard p={4} animation={`${slideInFromRight} 0.8s ease-out`}>
                <Stat>
                  <StatLabel color="gray.600">Marcadores</StatLabel>
                  <StatNumber color="purple.600">{stats.bookmarkedModules}</StatNumber>
                  <StatHelpText>
                    <Icon as={FaBookmark} mr={1} />
                    Guardados
                  </StatHelpText>
                </Stat>
              </GlassCard>

              <GlassCard p={4} animation={`${slideInFromRight} 0.9s ease-out`}>
                <Stat>
                  <StatLabel color="gray.600">Tiempo Total</StatLabel>
                  <StatNumber color="orange.600">{stats.totalTime}</StatNumber>
                  <StatHelpText>
                    <Icon as={FaClock} mr={1} />
                    minutos
                  </StatHelpText>
                </Stat>
              </GlassCard>
            </SimpleGrid>

            {/* Main Content Area */}
            <GlassCard p={6}>
              <Tabs variant="soft-rounded" colorScheme="blue">
                <TabList mb={6}>
                  {categories.map((cat) => (
                    <Tab
                      key={cat.id}
                      _selected={{
                        bg: `${cat.color}.500`,
                        color: 'white',
                        transform: 'scale(1.05)'
                      }}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      <Icon as={cat.icon} mr={2} />
                      {cat.name}
                    </Tab>
                  ))}
                </TabList>

                <TabPanels>
                  <TabPanel p={0}>
                    {/* Modules Grid */}
                    <Grid
                      templateColumns={{
                        base: 'repeat(1, 1fr)',
                        md: 'repeat(2, 1fr)',
                        lg: 'repeat(3, 1fr)'
                      }}
                      gap={6}
                    >
                      <AnimatePresence mode="wait">
                        {filteredModules.map((module, index) => {
                          const IconComponent = getIcon(module.icon);
                          const progress = readingProgress[module.id] || 0;
                          const isBookmarked = bookmarks.includes(module.id);

                          return (
                            <MotionBox
                              key={module.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <GlassCard
                                p={6}
                                cursor="pointer"
                                onClick={() => handleModuleClick(module.id)}
                                _hover={{
                                  transform: 'translateY(-8px)',
                                  boxShadow: '2xl',
                                  background: 'rgba(255, 255, 255, 0.35)'
                                }}
                                transition="all 0.3s ease"
                                position="relative"
                                overflow="hidden"
                                border="2px solid"
                                borderColor={
                                  progress === 100 ? 'green.300' :
                                  progress > 0 ? 'blue.300' : 'gray.200'
                                }
                              >
                                {/* Progress Bar at Top */}
                                <Box
                                  position="absolute"
                                  top={0}
                                  left={0}
                                  right={0}
                                  height="4px"
                                  bg="gray.200"
                                >
                                  <Box
                                    height="100%"
                                    width={`${progress}%`}
                                    bg={progress === 100 ? 'green.500' : 'blue.500'}
                                    transition="width 0.3s ease"
                                  />
                                </Box>

                                {/* Bookmark Icon */}
                                <IconButton
                                  icon={<FaBookmark />}
                                  position="absolute"
                                  top={2}
                                  right={2}
                                  size="sm"
                                  variant="ghost"
                                  color={isBookmarked ? 'yellow.500' : 'gray.400'}
                                  onClick={(e) => toggleBookmark(module.id, e)}
                                  aria-label="Bookmark"
                                  _hover={{
                                    transform: 'scale(1.2)'
                                  }}
                                />

                                <VStack align="stretch" spacing={4}>
                                  {/* Icon and Title */}
                                  <HStack spacing={3}>
                                    <Circle
                                      size="50px"
                                      bg={`${module.difficulty === 'basic' ? 'green' :
                                           module.difficulty === 'intermediate' ? 'orange' : 'red'}.100`}
                                      color={`${module.difficulty === 'basic' ? 'green' :
                                             module.difficulty === 'intermediate' ? 'orange' : 'red'}.600`}
                                    >
                                      <Icon as={IconComponent} fontSize="24px" />
                                    </Circle>
                                    <Box flex={1}>
                                      <Heading size="md" color="gray.800">
                                        {module.title}
                                      </Heading>
                                      <HStack spacing={2} mt={1}>
                                        <Badge
                                          colorScheme={
                                            module.difficulty === 'basic' ? 'green' :
                                            module.difficulty === 'intermediate' ? 'orange' : 'red'
                                          }
                                        >
                                          {module.difficulty}
                                        </Badge>
                                        <Badge colorScheme="purple">
                                          {module.estimatedTime}
                                        </Badge>
                                      </HStack>
                                    </Box>
                                  </HStack>

                                  {/* Description */}
                                  <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                    {module.description}
                                  </Text>

                                  {/* Tags */}
                                  {module.tags && (
                                    <HStack spacing={1} flexWrap="wrap">
                                      {module.tags.slice(0, 3).map((tag) => (
                                        <Badge
                                          key={tag}
                                          size="sm"
                                          variant="subtle"
                                          colorScheme="blue"
                                        >
                                          {tag}
                                        </Badge>
                                      ))}
                                    </HStack>
                                  )}

                                  {/* Actions */}
                                  <HStack justify="space-between" pt={2}>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      leftIcon={<FaEye />}
                                      onClick={(e) => handlePreview(module, e)}
                                      _hover={{
                                        bg: 'rgba(79, 125, 243, 0.1)'
                                      }}
                                    >
                                      Vista previa
                                    </Button>
                                    <Button
                                      size="sm"
                                      colorScheme="blue"
                                      variant="solid"
                                      rightIcon={<FaPlay />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleModuleClick(module.id);
                                      }}
                                      _hover={{
                                        transform: 'translateX(2px)'
                                      }}
                                    >
                                      {progress > 0 ? 'Continuar' : 'Comenzar'}
                                    </Button>
                                  </HStack>

                                  {/* Progress Indicator */}
                                  {progress > 0 && (
                                    <Box pt={2}>
                                      <HStack justify="space-between" mb={1}>
                                        <Text fontSize="xs" color="gray.500">
                                          Progreso
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">
                                          {progress}%
                                        </Text>
                                      </HStack>
                                      <Progress
                                        value={progress}
                                        size="sm"
                                        colorScheme={progress === 100 ? 'green' : 'blue'}
                                        borderRadius="full"
                                      />
                                    </Box>
                                  )}
                                </VStack>
                              </GlassCard>
                            </MotionBox>
                          );
                        })}
                      </AnimatePresence>
                    </Grid>

                    {/* Empty State */}
                    {filteredModules.length === 0 && (
                      <Center py={16}>
                        <VStack spacing={4}>
                          <Icon as={FaSearch} fontSize="48px" color="gray.400" />
                          <Text fontSize="lg" color="gray.600">
                            No se encontraron módulos
                          </Text>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSearchTerm('');
                              setSelectedCategory('all');
                            }}
                          >
                            Limpiar filtros
                          </Button>
                        </VStack>
                      </Center>
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </GlassCard>

            {/* Quick Access Section */}
            <GlassCard p={6}>
              <Heading size="md" mb={4}>Acceso Rápido</Heading>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <Button
                  leftIcon={<FaQuestionCircle />}
                  variant="outline"
                  onClick={() => router.push('/docs/faq')}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'md',
                    bg: 'rgba(79, 125, 243, 0.05)'
                  }}
                >
                  Preguntas Frecuentes
                </Button>
                <Button
                  leftIcon={<FaVideo />}
                  variant="outline"
                  onClick={() => router.push('/docs/videos')}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'md',
                    bg: 'rgba(107, 115, 255, 0.05)'
                  }}
                >
                  Video Tutoriales
                </Button>
                <Button
                  leftIcon={<FaDownload />}
                  variant="outline"
                  onClick={() => router.push('/docs/downloads')}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'md',
                    bg: 'rgba(16, 185, 129, 0.05)'
                  }}
                >
                  Descargas
                </Button>
                <Button
                  leftIcon={<FaChartBar />}
                  variant="outline"
                  onClick={() => router.push('/docs/metrics')}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'md',
                    bg: 'rgba(245, 158, 11, 0.05)'
                  }}
                >
                  Métricas
                </Button>
              </SimpleGrid>
            </GlassCard>
          </VStack>

          {/* Preview Modal */}
          <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                {previewModule?.title}
                <Badge ml={2} colorScheme="blue">Vista previa</Badge>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                {previewModule && (
                  <VStack align="stretch" spacing={4}>
                    <Text>{previewModule.description}</Text>
                    <Box>
                      <Text fontWeight="bold" mb={2}>Contenido:</Text>
                      {previewModule.sections?.map((section) => (
                        <HStack key={section.id} pl={4} py={1}>
                          <Icon as={FaChartBar} color="blue.500" />
                          <Text>{section.title}</Text>
                        </HStack>
                      ))}
                    </Box>
                    <HStack>
                      <Badge colorScheme="green">
                        {previewModule.estimatedTime}
                      </Badge>
                      <Badge colorScheme="orange">
                        {previewModule.difficulty}
                      </Badge>
                    </HStack>
                    <Button
                      colorScheme="blue"
                      onClick={() => {
                        onPreviewClose();
                        handleModuleClick(previewModule.id);
                      }}
                    >
                      Comenzar módulo
                    </Button>
                  </VStack>
                )}
              </ModalBody>
            </ModalContent>
          </Modal>

          {/* Onboarding Tour */}
          {showOnboarding && (
            <OnboardingTour
              onComplete={() => {
                setShowOnboarding(false);
                localStorage.setItem(`onboarding_docs_${user.id}`, 'completed');
              }}
              userRole={user.role}
            />
          )}
        </ModernContainer>
      </ProtectedRoute>
    </ChakraProvider>
  );
};

export default DocumentationHub;