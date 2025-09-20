import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Badge,
  Progress,
  Card,
  CardBody,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListIcon,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  Tooltip,
  Flex,
  Image,
  AspectRatio,
  ChakraProvider
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import {
  FaArrowLeft,
  FaBookmark,
  FaRegBookmark,
  FaDownload,
  FaPrint,
  FaShare,
  FaCheckCircle,
  FaLightbulb,
  FaExclamationTriangle,
  FaCode,
  FaVideo,
  FaFileAlt,
  FaQuestionCircle,
  FaClock,
  FaEye,
  FaStar,
  FaChevronUp,
  FaChevronDown,
  FaPlay,
  FaUserGraduate
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useAuth } from '../../contexts/AuthContext';
import { getModule, getContentByRole } from '../../lib/docs/content';
import VideoPlayer from '../../components/docs/VideoPlayer';
import { useInView } from 'react-intersection-observer';
import { GlassCard, ModernContainer, modernTheme } from '../../components/theme/ModernTheme';
import ProtectedRoute from '../../components/ProtectedRoute';

// Animations
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

const MotionBox = motion(Box);

const ModuleDetailPage = () => {
  const router = useRouter();
  const { moduleId } = router.query;
  const { user } = useAuth();
  const toast = useToast();

  // State
  const [module, setModule] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [exerciseStates, setExerciseStates] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [startTime] = useState(Date.now());

  // Modal states
  const { isOpen: isVideoOpen, onOpen: onVideoOpen, onClose: onVideoClose } = useDisclosure();
  const { isOpen: isShareOpen, onOpen: onShareOpen, onClose: onShareClose } = useDisclosure();

  // Color mode values
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');

  // Intersection observer for reading progress
  const { ref: contentRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  // Load module data
  useEffect(() => {
    if (moduleId && user) {
      const moduleData = getModule(moduleId, user.role);
      if (moduleData) {
        setModule(moduleData);
        trackPageView();
      } else {
        router.push('/docs'); // Redirect if module not found
      }
    }
  }, [moduleId, user, router]);

  // Load user preferences
  useEffect(() => {
    if (moduleId) {
      const bookmarks = JSON.parse(localStorage.getItem('docs-bookmarks') || '[]');
      setIsBookmarked(bookmarks.includes(moduleId));

      const progress = localStorage.getItem(`docs-progress-${moduleId}`);
      if (progress) {
        setReadingProgress(parseFloat(progress));
      }

      const exercises = localStorage.getItem(`docs-exercises-${moduleId}`);
      if (exercises) {
        setExerciseStates(JSON.parse(exercises));
      }
    }
  }, [moduleId]);

  // Track reading progress
  useEffect(() => {
    if (inView && module) {
      const progressInterval = setInterval(() => {
        const timeSpent = (Date.now() - startTime) / 1000; // seconds
        const estimatedReadTime = (module.estimatedTime || '5 min')
          .replace(' min', '') * 60; // convert to seconds

        const newProgress = Math.min(100, (timeSpent / estimatedReadTime) * 100);
        setReadingProgress(newProgress);

        localStorage.setItem(`docs-progress-${moduleId}`, newProgress.toString());

        // Track progress milestones
        if (newProgress >= 25 && newProgress < 50) {
          trackEvent('reading_progress_25');
        } else if (newProgress >= 50 && newProgress < 75) {
          trackEvent('reading_progress_50');
        } else if (newProgress >= 75 && newProgress < 100) {
          trackEvent('reading_progress_75');
        } else if (newProgress >= 100) {
          trackEvent('reading_progress_complete');
        }
      }, 5000); // Update every 5 seconds

      return () => clearInterval(progressInterval);
    }
  }, [inView, module, moduleId, startTime]);

  // Track analytics events
  const trackEvent = async (eventType, metadata = {}) => {
    try {
      await fetch('/api/docs/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          moduleId,
          userId: user?.id,
          userRole: user?.role,
          metadata: {
            sectionIndex: currentSection,
            readingProgress,
            tabIndex: activeTab,
            ...metadata
          }
        })
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  };

  const trackPageView = () => {
    trackEvent('page_view', {
      moduleTitle: module?.title,
      estimatedTime: module?.estimatedTime
    });
  };

  // Handle bookmark toggle
  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('docs-bookmarks') || '[]');

    if (isBookmarked) {
      const newBookmarks = bookmarks.filter(id => id !== moduleId);
      localStorage.setItem('docs-bookmarks', JSON.stringify(newBookmarks));
      setIsBookmarked(false);
      trackEvent('bookmark_remove');
      toast({
        title: 'Marcador removido',
        status: 'info',
        duration: 2000
      });
    } else {
      bookmarks.push(moduleId);
      localStorage.setItem('docs-bookmarks', JSON.stringify(bookmarks));
      setIsBookmarked(true);
      trackEvent('bookmark_add');
      toast({
        title: 'Módulo guardado en marcadores',
        status: 'success',
        duration: 2000
      });
    }
  };

  // Handle PDF download
  const downloadPDF = async () => {
    try {
      trackEvent('pdf_download_start');

      const response = await fetch('/api/docs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userRole: user.role,
          userName: user.name,
          moduleIds: [moduleId]
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${module.title}-${user.role}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        trackEvent('pdf_download_complete');
        toast({
          title: 'PDF descargado',
          description: 'El manual se ha descargado exitosamente',
          status: 'success',
          duration: 3000
        });
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      trackEvent('pdf_download_error', { error: error.message });
      toast({
        title: 'Error al descargar PDF',
        description: 'No se pudo generar el documento',
        status: 'error',
        duration: 3000
      });
    }
  };

  // Handle exercise completion
  const completeExercise = (exerciseId) => {
    const newStates = {
      ...exerciseStates,
      [exerciseId]: {
        completed: true,
        completedAt: new Date().toISOString()
      }
    };

    setExerciseStates(newStates);
    localStorage.setItem(`docs-exercises-${moduleId}`, JSON.stringify(newStates));

    trackEvent('exercise_complete', { exerciseId });

    toast({
      title: '¡Ejercicio completado!',
      description: 'Has completado exitosamente este ejercicio',
      status: 'success',
      duration: 3000
    });
  };

  // Share functionality
  const shareModule = () => {
    if (navigator.share) {
      navigator.share({
        title: module.title,
        text: module.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Enlace copiado',
        description: 'El enlace se ha copiado al portapapeles',
        status: 'success',
        duration: 2000
      });
    }
    trackEvent('module_share');
  };

  if (!module) {
    return (
      <ChakraProvider theme={modernTheme}>
        <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
          <Text>Cargando módulo...</Text>
        </Box>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider theme={modernTheme}>
      <ProtectedRoute>
        <ModernContainer>
          {/* Header */}
          <VStack spacing={6} align="stretch">
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => router.push('/')}>Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => router.push('/docs')}>Documentación</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>{module.title}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          {/* Module header */}
          <GlassCard
            p={6}
            animation={`${fadeInUp} 0.6s ease-out`}
          >
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between" align="start">
                  <VStack align="start" spacing={2}>
                    <HStack>
                      <Button
                        leftIcon={<FaArrowLeft />}
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/docs')}
                      >
                        Volver
                      </Button>
                    </HStack>

                    <Heading size="xl" color={textColor}>
                      {module.title}
                    </Heading>

                    <Text color={mutedTextColor} fontSize="lg">
                      {module.description}
                    </Text>

                    <HStack wrap="wrap" spacing={2}>
                      <Badge colorScheme="blue">{module.difficulty}</Badge>
                      <Badge colorScheme="green">{module.estimatedTime}</Badge>
                      <Badge colorScheme="purple">
                        <FaEye /> {module.views || 0} vistas
                      </Badge>
                      {module.tags?.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </HStack>
                  </VStack>

                  <VStack spacing={2}>
                    <HStack>
                      <Tooltip label={isBookmarked ? 'Quitar marcador' : 'Agregar marcador'}>
                        <IconButton
                          icon={isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
                          onClick={toggleBookmark}
                          colorScheme={isBookmarked ? 'yellow' : 'gray'}
                          variant="outline"
                          size="sm"
                        />
                      </Tooltip>

                      <Tooltip label="Descargar PDF">
                        <IconButton
                          icon={<FaDownload />}
                          onClick={downloadPDF}
                          colorScheme="blue"
                          variant="outline"
                          size="sm"
                        />
                      </Tooltip>

                      <Tooltip label="Compartir">
                        <IconButton
                          icon={<FaShare />}
                          onClick={shareModule}
                          colorScheme="green"
                          variant="outline"
                          size="sm"
                        />
                      </Tooltip>
                    </HStack>

                    <Text fontSize="sm" color={mutedTextColor}>
                      Progreso: {Math.round(readingProgress)}%
                    </Text>
                    <Progress
                      value={readingProgress}
                      size="sm"
                      colorScheme="blue"
                      w="200px"
                    />
                  </VStack>
                </HStack>
              </VStack>
          </GlassCard>

          {/* Module content */}
          <Tabs index={activeTab} onChange={setActiveTab}>
            <TabList>
              <Tab>
                <HStack>
                  <FaFileAlt />
                  <Text>Contenido</Text>
                </HStack>
              </Tab>
              {module.faqs && module.faqs.length > 0 && (
                <Tab>
                  <HStack>
                    <FaQuestionCircle />
                    <Text>FAQ ({module.faqs.length})</Text>
                  </HStack>
                </Tab>
              )}
              {module.exercises && module.exercises.length > 0 && (
                <Tab>
                  <HStack>
                    <FaUserGraduate />
                    <Text>Ejercicios ({module.exercises.length})</Text>
                  </HStack>
                </Tab>
              )}
            </TabList>

            <TabPanels>
              {/* Content tab */}
              <TabPanel px={0}>
                <VStack spacing={6} align="stretch" ref={contentRef}>
                  {module.sections?.map((section, index) => (
                    <MotionBox
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <GlassCard
                        p={6}
                        animation={`${slideIn} ${0.6 + index * 0.1}s ease-out`}
                      >
                        <Heading size="lg" color={textColor} mb={4}>
                          {section.title}
                        </Heading>
                          <VStack align="stretch" spacing={6}>
                            {/* Main content */}
                            <Box>
                              <ReactMarkdown
                                components={{
                                  h1: ({ children }) => <Heading size="xl" mb={4}>{children}</Heading>,
                                  h2: ({ children }) => <Heading size="lg" mb={3}>{children}</Heading>,
                                  h3: ({ children }) => <Heading size="md" mb={2}>{children}</Heading>,
                                  p: ({ children }) => <Text mb={3} lineHeight="tall">{children}</Text>,
                                  ul: ({ children }) => <List spacing={2} mb={3}>{children}</List>,
                                  ol: ({ children }) => <List as="ol" spacing={2} mb={3}>{children}</List>,
                                  li: ({ children }) => (
                                    <ListItem>
                                      <ListIcon as={FaCheckCircle} color="green.500" />
                                      {children}
                                    </ListItem>
                                  ),
                                  code: ({ inline, className, children }) => {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return !inline && match ? (
                                      <SyntaxHighlighter
                                        style={tomorrow}
                                        language={match[1]}
                                        PreTag="div"
                                      >
                                        {String(children).replace(/\n$/, '')}
                                      </SyntaxHighlighter>
                                    ) : (
                                      <Code colorScheme="blue">{children}</Code>
                                    );
                                  }
                                }}
                              >
                                {section.content.text}
                              </ReactMarkdown>
                            </Box>

                            {/* Images */}
                            {section.content.images?.map((image, imgIndex) => (
                              <Box key={imgIndex}>
                                <AspectRatio ratio={16 / 9} maxW="800px">
                                  <Image
                                    src={image.src}
                                    alt={image.alt}
                                    borderRadius="md"
                                    objectFit="cover"
                                    fallback={
                                      <Box
                                        bg="gray.100"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                      >
                                        <Text color="gray.500">Imagen no disponible</Text>
                                      </Box>
                                    }
                                  />
                                </AspectRatio>
                                {image.caption && (
                                  <Text fontSize="sm" color={mutedTextColor} mt={2} textAlign="center">
                                    {image.caption}
                                  </Text>
                                )}
                              </Box>
                            ))}

                            {/* Videos */}
                            {section.content.videos?.map((video, vidIndex) => (
                              <VideoPlayer
                                key={vidIndex}
                                src={video.url}
                                title={video.title}
                                description={video.transcript}
                                poster={video.thumbnail}
                                onProgress={(progress) => {
                                  trackEvent('video_progress', {
                                    videoId: video.id,
                                    progress
                                  });
                                }}
                                onComplete={() => {
                                  trackEvent('video_complete', {
                                    videoId: video.id
                                  });
                                }}
                              />
                            ))}

                            {/* Code examples */}
                            {section.content.codeExamples?.map((example, codeIndex) => (
                              <Card key={codeIndex} bg={useColorModeValue('gray.50', 'gray.700')}>
                                <CardHeader>
                                  <HStack>
                                    <FaCode />
                                    <Heading size="sm">{example.title}</Heading>
                                  </HStack>
                                </CardHeader>
                                <CardBody pt={0}>
                                  <SyntaxHighlighter
                                    language={example.language}
                                    style={tomorrow}
                                  >
                                    {example.code}
                                  </SyntaxHighlighter>
                                </CardBody>
                              </Card>
                            ))}

                            {/* Tips */}
                            {section.content.tips && section.content.tips.length > 0 && (
                              <Alert status="info" borderRadius="md">
                                <AlertIcon as={FaLightbulb} />
                                <Box>
                                  <AlertTitle>Consejos útiles:</AlertTitle>
                                  <AlertDescription>
                                    <List spacing={2} mt={2}>
                                      {section.content.tips.map((tip, tipIndex) => (
                                        <ListItem key={tipIndex}>• {tip}</ListItem>
                                      ))}
                                    </List>
                                  </AlertDescription>
                                </Box>
                              </Alert>
                            )}

                            {/* Warnings */}
                            {section.content.warnings && section.content.warnings.length > 0 && (
                              <Alert status="warning" borderRadius="md">
                                <AlertIcon as={FaExclamationTriangle} />
                                <Box>
                                  <AlertTitle>Advertencias importantes:</AlertTitle>
                                  <AlertDescription>
                                    <List spacing={2} mt={2}>
                                      {section.content.warnings.map((warning, warnIndex) => (
                                        <ListItem key={warnIndex}>• {warning}</ListItem>
                                      ))}
                                    </List>
                                  </AlertDescription>
                                </Box>
                              </Alert>
                            )}
                          </VStack>
                      </GlassCard>
                    </MotionBox>
                  ))}
                </VStack>
              </TabPanel>

              {/* FAQ tab */}
              {module.faqs && module.faqs.length > 0 && (
                <TabPanel px={0}>
                  <GlassCard
                    p={6}
                    animation={`${fadeInUp} 0.7s ease-out`}
                  >
                    <Heading size="lg" mb={4}>Preguntas Frecuentes</Heading>
                    <Accordion allowMultiple>
                        {module.faqs.map((faq, index) => (
                          <AccordionItem key={faq.id}>
                            <AccordionButton>
                              <Box flex="1" textAlign="left">
                                <Text fontWeight="bold">{faq.question}</Text>
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel pb={4}>
                              <ReactMarkdown>{faq.answer}</ReactMarkdown>
                              <HStack mt={3} spacing={2}>
                                <Badge colorScheme="blue">{faq.category}</Badge>
                                {faq.votes && (
                                  <Badge colorScheme="green">
                                    👍 {faq.votes} útiles
                                  </Badge>
                                )}
                              </HStack>
                            </AccordionPanel>
                          </AccordionItem>
                        ))}
                      </Accordion>
                  </GlassCard>
                </TabPanel>
              )}

              {/* Exercises tab */}
              {module.exercises && module.exercises.length > 0 && (
                <TabPanel px={0}>
                  <VStack spacing={4} align="stretch">
                    {module.exercises.map((exercise, index) => (
                      <GlassCard
                        key={exercise.id}
                        p={6}
                        animation={`${slideIn} ${0.7 + index * 0.1}s ease-out`}
                      >
                          <HStack justify="space-between">
                            <VStack align="start" spacing={2}>
                              <Heading size="md">{exercise.title}</Heading>
                              <HStack>
                                <Badge colorScheme="orange">{exercise.difficulty}</Badge>
                                <Badge colorScheme="blue">
                                  <FaClock /> {exercise.estimatedTime}
                                </Badge>
                              </HStack>
                            </VStack>

                            {exerciseStates[exercise.id]?.completed && (
                              <Badge colorScheme="green" p={2}>
                                <FaCheckCircle /> Completado
                              </Badge>
                            )}
                          </HStack>
                        <VStack align="stretch" spacing={4} mt={4}>
                            {exercise.objective && (
                              <Box>
                                <Text fontWeight="bold" mb={2}>Objetivo:</Text>
                                <Text>{exercise.objective}</Text>
                              </Box>
                            )}

                            {exercise.steps && (
                              <Box>
                                <Text fontWeight="bold" mb={2}>Pasos a seguir:</Text>
                                <List spacing={2}>
                                  {exercise.steps.map((step, stepIndex) => (
                                    <ListItem key={stepIndex}>
                                      <ListIcon as={FaCheckCircle} color="blue.500" />
                                      {step}
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>
                            )}

                            {exercise.hints && (
                              <Alert status="info">
                                <AlertIcon as={FaLightbulb} />
                                <Box>
                                  <AlertTitle>Pistas:</AlertTitle>
                                  <AlertDescription>
                                    <List spacing={1} mt={2}>
                                      {exercise.hints.map((hint, hintIndex) => (
                                        <ListItem key={hintIndex} fontSize="sm">
                                          • {hint}
                                        </ListItem>
                                      ))}
                                    </List>
                                  </AlertDescription>
                                </Box>
                              </Alert>
                            )}

                            <HStack>
                              {!exerciseStates[exercise.id]?.completed && (
                                <Button
                                  colorScheme="green"
                                  onClick={() => completeExercise(exercise.id)}
                                  leftIcon={<FaCheckCircle />}
                                >
                                  Marcar como Completado
                                </Button>
                              )}

                              <Button
                                variant="outline"
                                leftIcon={<FaPlay />}
                                onClick={() => {
                                  trackEvent('exercise_start', { exerciseId: exercise.id });
                                }}
                              >
                                Comenzar Práctica
                              </Button>
                            </HStack>
                          </VStack>
                      </GlassCard>
                    ))}
                  </VStack>
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        </VStack>
        </ModernContainer>
      </ProtectedRoute>
    </ChakraProvider>
  );
};

export default ModuleDetailPage;