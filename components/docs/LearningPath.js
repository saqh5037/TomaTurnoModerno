import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Progress,
  Badge,
  Button,
  Icon,
  Circle,
  Divider,
  useToast,
  Flex,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Tooltip
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import {
  FaTrophy,
  FaStar,
  FaFire,
  FaLock,
  FaCheck,
  FaPlay,
  FaCrown,
  FaMedal,
  FaUserMd,
  FaBolt,
  FaGraduationCap,
  FaChartLine
} from 'react-icons/fa';
import { useRouter } from 'next/router';
import confetti from 'canvas-confetti';
import { GlassCard, ModernContainer } from '../theme/ModernTheme';
import { motion } from 'framer-motion';

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

const LearningPath = ({ userRole = 'flebotomista', userId }) => {
  const [userProgress, setUserProgress] = useState({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const router = useRouter();

  // Cargar progreso del usuario
  useEffect(() => {
    loadUserProgress();
  }, [userId]);

  const loadUserProgress = () => {
    const savedProgress = localStorage.getItem(`learning_progress_${userId}`);
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setUserProgress(progress.lessons || {});
      setTotalXP(progress.totalXP || 0);
      setCurrentStreak(progress.streak || 0);
      setUnlockedAchievements(progress.achievements || []);
    }
  };

  const saveProgress = (updates) => {
    const newProgress = {
      lessons: { ...userProgress, ...updates.lessons },
      totalXP: updates.totalXP || totalXP,
      streak: updates.streak || currentStreak,
      achievements: updates.achievements || unlockedAchievements,
      lastActivity: new Date().toISOString()
    };
    localStorage.setItem(`learning_progress_${userId}`, JSON.stringify(newProgress));
  };

  // Rutas de aprendizaje por rol
  const learningPaths = {
    flebotomista: {
      title: 'Ruta del Flebotomista Experto',
      icon: FaUserMd,
      color: 'green',
      modules: [
        {
          id: 'basics',
          title: 'Fundamentos',
          description: 'Conceptos básicos del sistema',
          icon: FaGraduationCap,
          color: 'blue',
          lessons: [
            {
              id: 'intro',
              title: 'Introducción al Sistema',
              xp: 100,
              duration: '5 min',
              type: 'video',
              completed: userProgress['intro'] || false,
              locked: false,
              description: 'Conoce TomaTurno y sus características principales'
            },
            {
              id: 'navigation',
              title: 'Navegación Básica',
              xp: 150,
              duration: '10 min',
              type: 'interactive',
              completed: userProgress['navigation'] || false,
              locked: false,
              description: 'Aprende a moverte por la interfaz'
            },
            {
              id: 'first-call',
              title: 'Tu Primer Llamado',
              xp: 200,
              duration: '15 min',
              type: 'practice',
              completed: userProgress['first-call'] || false,
              locked: !userProgress['navigation'],
              unlockCondition: 'Completa "Navegación Básica"',
              description: 'Práctica llamando a tu primer paciente'
            }
          ]
        },
        {
          id: 'intermediate',
          title: 'Nivel Intermedio',
          description: 'Funciones avanzadas',
          icon: FaChartLine,
          color: 'purple',
          locked: totalXP < 500,
          unlockAt: 500,
          lessons: [
            {
              id: 'special-patients',
              title: 'Pacientes Prioritarios',
              xp: 250,
              duration: '20 min',
              type: 'scenario',
              completed: userProgress['special-patients'] || false,
              locked: totalXP < 500,
              description: 'Manejo de casos especiales y urgencias'
            },
            {
              id: 'peak-hours',
              title: 'Manejo de Horas Pico',
              xp: 300,
              duration: '25 min',
              type: 'simulation',
              completed: userProgress['peak-hours'] || false,
              locked: !userProgress['special-patients'],
              description: 'Estrategias para momentos de alta demanda'
            },
            {
              id: 'team-coordination',
              title: 'Coordinación en Equipo',
              xp: 350,
              duration: '30 min',
              type: 'collaborative',
              completed: userProgress['team-coordination'] || false,
              locked: !userProgress['peak-hours'],
              description: 'Trabajo eficiente con otros flebotomistas'
            }
          ]
        },
        {
          id: 'expert',
          title: 'Nivel Experto',
          description: 'Dominio total del sistema',
          icon: FaCrown,
          color: 'gold',
          locked: totalXP < 1500,
          unlockAt: 1500,
          lessons: [
            {
              id: 'troubleshooting',
              title: 'Resolución de Problemas',
              xp: 400,
              duration: '30 min',
              type: 'case-study',
              completed: userProgress['troubleshooting'] || false,
              locked: totalXP < 1500,
              description: 'Soluciona problemas comunes del sistema'
            },
            {
              id: 'optimization',
              title: 'Optimización del Flujo',
              xp: 500,
              duration: '35 min',
              type: 'project',
              completed: userProgress['optimization'] || false,
              locked: !userProgress['troubleshooting'],
              description: 'Mejora la eficiencia de tu trabajo'
            },
            {
              id: 'mentorship',
              title: 'Mentoría y Liderazgo',
              xp: 600,
              duration: '40 min',
              type: 'leadership',
              completed: userProgress['mentorship'] || false,
              locked: !userProgress['optimization'],
              description: 'Aprende a entrenar a nuevos flebotomistas'
            }
          ]
        }
      ]
    },
    admin: {
      title: 'Ruta del Administrador Maestro',
      icon: FaCrown,
      color: 'purple',
      modules: [
        // Similar structure for admin path
      ]
    }
  };

  const achievements = [
    {
      id: 'first-steps',
      title: 'Primeros Pasos',
      description: 'Completa tu primera lección',
      icon: FaStar,
      xp: 50,
      color: 'yellow',
      unlocked: unlockedAchievements.includes('first-steps')
    },
    {
      id: 'week-streak',
      title: 'Semana de Fuego',
      description: '7 días de racha',
      icon: FaFire,
      xp: 200,
      color: 'orange',
      unlocked: unlockedAchievements.includes('week-streak')
    },
    {
      id: 'speed-demon',
      title: 'Velocidad Demoniaca',
      description: 'Completa una lección en < 3 min',
      icon: FaBolt,
      xp: 150,
      color: 'blue',
      unlocked: unlockedAchievements.includes('speed-demon')
    },
    {
      id: 'perfectionist',
      title: 'Perfeccionista',
      description: '100% en todos los ejercicios',
      icon: FaTrophy,
      xp: 300,
      color: 'gold',
      unlocked: unlockedAchievements.includes('perfectionist')
    },
    {
      id: 'knowledge-seeker',
      title: 'Buscador de Conocimiento',
      description: 'Completa 10 lecciones',
      icon: FaGraduationCap,
      xp: 250,
      color: 'purple',
      unlocked: unlockedAchievements.includes('knowledge-seeker')
    },
    {
      id: 'expert-level',
      title: 'Nivel Experto',
      description: 'Alcanza 2000 XP',
      icon: FaCrown,
      xp: 500,
      color: 'red',
      unlocked: unlockedAchievements.includes('expert-level')
    }
  ];

  const handleStartLesson = async (lesson, moduleId) => {
    setSelectedLesson({ ...lesson, moduleId });
    onOpen();
  };

  const handleCompleteLesson = () => {
    if (!selectedLesson) return;

    const lessonId = selectedLesson.id;
    const xpGained = selectedLesson.xp;

    // Actualizar progreso
    const newProgress = { ...userProgress, [lessonId]: true };
    const newTotalXP = totalXP + xpGained;

    setUserProgress(newProgress);
    setTotalXP(newTotalXP);

    // Verificar logros
    checkAchievements(newProgress, newTotalXP);

    // Guardar progreso
    saveProgress({
      lessons: newProgress,
      totalXP: newTotalXP,
      achievements: unlockedAchievements
    });

    // Celebración
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    toast({
      title: '¡Lección completada!',
      description: `Has ganado ${xpGained} XP`,
      status: 'success',
      duration: 3000,
      isClosable: true
    });

    onClose();

    // Navegar al tutorial real
    setTimeout(() => {
      router.push(`/docs/learn/${selectedLesson.moduleId}/${lessonId}`);
    }, 1000);
  };

  const checkAchievements = (progress, xp) => {
    const newAchievements = [...unlockedAchievements];

    // Primera lección
    if (Object.values(progress).filter(Boolean).length === 1 && !newAchievements.includes('first-steps')) {
      newAchievements.push('first-steps');
      showAchievementUnlocked('first-steps');
    }

    // 10 lecciones
    if (Object.values(progress).filter(Boolean).length >= 10 && !newAchievements.includes('knowledge-seeker')) {
      newAchievements.push('knowledge-seeker');
      showAchievementUnlocked('knowledge-seeker');
    }

    // 2000 XP
    if (xp >= 2000 && !newAchievements.includes('expert-level')) {
      newAchievements.push('expert-level');
      showAchievementUnlocked('expert-level');
    }

    setUnlockedAchievements(newAchievements);
  };

  const showAchievementUnlocked = (achievementId) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement) {
      toast({
        title: '🏆 ¡Logro Desbloqueado!',
        description: achievement.title,
        status: 'success',
        duration: 5000,
        isClosable: true
      });
    }
  };

  const currentPath = learningPaths[userRole] || learningPaths.flebotomista;
  const currentLevel = Math.floor(totalXP / 500) + 1;
  const xpForNextLevel = (currentLevel * 500) - totalXP;
  const progressToNextLevel = ((totalXP % 500) / 500) * 100;

  return (
    <ModernContainer>
      <VStack spacing={8} align="stretch">
        {/* Header con Stats */}
        <GlassCard
          p={6}
          animation={`${fadeInUp} 0.6s ease-out`}
        >
          <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={6}>
            <Stat>
              <StatLabel color="gray.600">XP Total</StatLabel>
              <StatNumber color="purple.600">{totalXP}</StatNumber>
              <StatHelpText>
                <Icon as={FaStar} color="yellow.500" mr={1} />
                Nivel {currentLevel}
              </StatHelpText>
              <Progress
                value={progressToNextLevel}
                size="xs"
                colorScheme="purple"
                borderRadius="full"
                mt={2}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                {xpForNextLevel} XP para nivel {currentLevel + 1}
              </Text>
            </Stat>

            <Stat>
              <StatLabel color="gray.600">Racha</StatLabel>
              <StatNumber color="orange.600">{currentStreak} días</StatNumber>
              <StatHelpText>
                <Icon as={FaFire} color="orange.500" mr={1} />
                {currentStreak >= 7 ? '¡En llamas!' : '¡Sigue así!'}
              </StatHelpText>
            </Stat>

            <Stat>
              <StatLabel color="gray.600">Lecciones</StatLabel>
              <StatNumber color="green.600">
                {Object.values(userProgress).filter(Boolean).length}/
                {currentPath.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)}
              </StatNumber>
              <StatHelpText>
                {Math.round(
                  (Object.values(userProgress).filter(Boolean).length /
                    currentPath.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)) *
                    100
                )}% completado
              </StatHelpText>
            </Stat>

            <Stat>
              <StatLabel color="gray.600">Logros</StatLabel>
              <StatNumber color="blue.600">
                {unlockedAchievements.length}/{achievements.length}
              </StatNumber>
              <StatHelpText>
                <Icon as={FaTrophy} color="gold" mr={1} />
                {unlockedAchievements.length >= achievements.length * 0.8 ? 'Maestro' : 'Coleccionista'}
              </StatHelpText>
            </Stat>
          </Grid>
        </GlassCard>

        {/* Learning Path */}
        <Box>
          <HStack mb={6} justify="space-between">
            <HStack>
              <Icon as={currentPath.icon} fontSize="2xl" color={`${currentPath.color}.500`} />
              <Heading size="lg">{currentPath.title}</Heading>
            </HStack>
            <Button
              size="sm"
              colorScheme="purple"
              variant="outline"
              leftIcon={<FaChartLine />}
              onClick={() => router.push('/docs/progress')}
            >
              Ver Progreso Detallado
            </Button>
          </HStack>

          <VStack spacing={8} align="stretch">
            {currentPath.modules.map((module, moduleIndex) => (
              <Box
                key={module.id}
                opacity={module.locked ? 0.6 : 1}
                position="relative"
              >
                {/* Línea conectora */}
                {moduleIndex < currentPath.modules.length - 1 && (
                  <Box
                    position="absolute"
                    left="35px"
                    top="80px"
                    bottom="-40px"
                    width="4px"
                    bg={module.locked ? "gray.300" : `${module.color || currentPath.color}.400`}
                    zIndex={0}
                  />
                )}

                {/* Módulo Card */}
                <HStack spacing={6} position="relative" zIndex={1}>
                  {/* Ícono del módulo */}
                  <Tooltip
                    label={module.locked ? `Desbloquea con ${module.unlockAt} XP` : module.title}
                    placement="top"
                  >
                    <Circle
                      size="70px"
                      bg={module.locked ? "gray.300" : `${module.color || currentPath.color}.500`}
                      color="white"
                      fontSize="2xl"
                      boxShadow="xl"
                      cursor="pointer"
                      transition="all 0.3s"
                      _hover={!module.locked && {
                        transform: 'scale(1.1)',
                        boxShadow: '2xl'
                      }}
                    >
                      {module.locked ? <FaLock /> : module.icon || <FaCrown />}
                    </Circle>
                  </Tooltip>

                  {/* Contenido del módulo */}
                  <GlassCard
                    flex={1}
                    p={6}
                    transition="all 0.3s"
                    opacity={module.locked ? 0.7 : 1}
                    _hover={!module.locked && {
                      transform: 'translateX(4px)',
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
                    }}
                    animation={`${slideIn} ${0.3 + moduleIndex * 0.1}s ease-out`}
                  >
                    <HStack justify="space-between" mb={4}>
                      <Box>
                        <Heading size="md" color={module.locked ? "gray.400" : "gray.800"}>
                          {module.title}
                        </Heading>
                        <Text color="gray.600" fontSize="sm">{module.description}</Text>
                      </Box>
                      {module.locked ? (
                        <Badge colorScheme="gray" fontSize="sm" px={3} py={1}>
                          <FaLock style={{ marginRight: '6px' }} />
                          {module.unlockAt} XP
                        </Badge>
                      ) : (
                        <Badge
                          colorScheme={module.color || currentPath.color}
                          fontSize="sm"
                          px={3}
                          py={1}
                        >
                          {module.lessons?.filter(l => userProgress[l.id]).length || 0}/
                          {module.lessons?.length || 0} Completadas
                        </Badge>
                      )}
                    </HStack>

                    {/* Progress bar del módulo */}
                    {!module.locked && module.lessons && (
                      <Progress
                        value={
                          (module.lessons.filter(l => userProgress[l.id]).length /
                            module.lessons.length) *
                          100
                        }
                        size="xs"
                        colorScheme={module.color || currentPath.color}
                        borderRadius="full"
                        mb={4}
                      />
                    )}

                    {/* Lecciones */}
                    <VStack spacing={3} align="stretch">
                      {module.lessons?.map((lesson) => (
                        <HStack
                          key={lesson.id}
                          p={3}
                          bg={lesson.completed ? `${module.color || 'green'}.50` : "gray.50"}
                          borderRadius="lg"
                          border="1px solid"
                          borderColor={lesson.completed ? `${module.color || 'green'}.200` : "gray.200"}
                          opacity={lesson.locked || module.locked ? 0.5 : 1}
                          _hover={!lesson.locked && !module.locked && {
                            transform: 'translateX(4px)',
                            boxShadow: 'md',
                            bg: lesson.completed ? `${module.color || 'green'}.100` : 'gray.100'
                          }}
                          transition="all 0.2s"
                          cursor={lesson.locked || module.locked ? "not-allowed" : "pointer"}
                          onClick={() => !lesson.locked && !module.locked && handleStartLesson(lesson, module.id)}
                        >
                          <Circle
                            size="40px"
                            bg={lesson.completed ? `${module.color || 'green'}.500` : "white"}
                            border="2px solid"
                            borderColor={lesson.completed ? `${module.color || 'green'}.500` : "gray.300"}
                          >
                            {lesson.completed ? (
                              <Icon as={FaCheck} color="white" />
                            ) : lesson.locked || module.locked ? (
                              <Icon as={FaLock} color="gray.400" />
                            ) : (
                              <Icon as={FaPlay} color={`${module.color || 'blue'}.500`} />
                            )}
                          </Circle>

                          <Box flex={1}>
                            <Text fontWeight="semibold" fontSize="sm">
                              {lesson.title}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              {lesson.description}
                            </Text>
                            <HStack spacing={3} fontSize="xs" color="gray.500" mt={1}>
                              <Text>{lesson.duration}</Text>
                              <Badge colorScheme="purple" variant="subtle">
                                +{lesson.xp} XP
                              </Badge>
                              <Badge
                                colorScheme={
                                  lesson.type === 'video' ? 'blue' :
                                  lesson.type === 'interactive' ? 'green' :
                                  lesson.type === 'practice' ? 'orange' :
                                  lesson.type === 'scenario' ? 'purple' :
                                  lesson.type === 'simulation' ? 'red' : 'gray'
                                }
                                variant="subtle"
                              >
                                {lesson.type}
                              </Badge>
                            </HStack>
                          </Box>

                          {lesson.locked && !module.locked && (
                            <Tooltip label={lesson.unlockCondition} placement="left">
                              <Box>
                                <Icon as={FaLock} color="gray.400" />
                              </Box>
                            </Tooltip>
                          )}
                        </HStack>
                      ))}
                    </VStack>
                  </GlassCard>
                </HStack>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Achievements Section */}
        <GlassCard p={6} animation={`${fadeInUp} 0.8s ease-out`}>
          <Heading size="md" mb={4}>🏆 Logros</Heading>
          <Grid templateColumns="repeat(auto-fill, minmax(180px, 1fr))" gap={4}>
            {achievements.map((achievement) => (
              <Tooltip
                key={achievement.id}
                label={achievement.description}
                placement="top"
              >
                <Box
                  p={4}
                  bg={achievement.unlocked ?
                    `linear-gradient(135deg, ${achievement.color}.400 0%, ${achievement.color}.600 100%)` :
                    "rgba(255, 255, 255, 0.1)"
                  }
                  backdropFilter={achievement.unlocked ? "blur(10px)" : "none"}
                  borderRadius="xl"
                  textAlign="center"
                  opacity={achievement.unlocked ? 1 : 0.5}
                  transform={achievement.unlocked ? "scale(1)" : "scale(0.95)"}
                  transition="all 0.3s"
                  _hover={achievement.unlocked && {
                    transform: "scale(1.05)",
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)"
                  }}
                  border="1px solid"
                  borderColor={achievement.unlocked ?
                    "rgba(255, 255, 255, 0.3)" :
                    "rgba(255, 255, 255, 0.1)"
                  }
                  cursor="pointer"
                >
                  <Icon
                    as={achievement.icon}
                    fontSize="3xl"
                    color={achievement.unlocked ? "white" : "gray.400"}
                    mb={2}
                  />
                  <Text
                    fontWeight="bold"
                    fontSize="sm"
                    color={achievement.unlocked ? "white" : "gray.600"}
                  >
                    {achievement.title}
                  </Text>
                  <Badge
                    mt={2}
                    colorScheme={achievement.unlocked ? "yellow" : "gray"}
                    variant={achievement.unlocked ? "solid" : "subtle"}
                  >
                    +{achievement.xp} XP
                  </Badge>
                </Box>
              </Tooltip>
            ))}
          </Grid>
        </GlassCard>

        {/* Daily Challenge */}
        <GlassCard
          p={6}
          borderLeft="4px solid"
          borderLeftColor="blue.400"
          animation={`${fadeInUp} 0.9s ease-out`}
        >
          <HStack spacing={4} align="center">
            <Circle size="50px" bg="blue.500" color="white">
              <Icon as={FaMedal} boxSize="30px" />
            </Circle>
            <Box flex={1}>
              <Text fontWeight="bold" fontSize="lg" color="blue.800">
                Desafío Diario
              </Text>
              <Text color="blue.700">
                Completa 3 lecciones hoy y gana 2X XP bonus
              </Text>
              <Progress
                value={33}
                mt={2}
                colorScheme="blue"
                size="sm"
                borderRadius="full"
                hasStripe
                isAnimated
              />
              <Text fontSize="xs" color="blue.600" mt={1}>
                1/3 lecciones completadas hoy
              </Text>
            </Box>
            <Button colorScheme="blue" size="sm">
              Ver Desafío
            </Button>
          </HStack>
        </GlassCard>
      </VStack>

      {/* Modal de Inicio de Lección */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedLesson?.title}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info" borderRadius="lg">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">Información de la lección</Text>
                  <Text fontSize="sm">{selectedLesson?.description}</Text>
                </Box>
              </Alert>

              <HStack justify="space-between" p={4} bg="gray.50" borderRadius="lg">
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" color="gray.600">Duración</Text>
                  <Text fontWeight="bold">{selectedLesson?.duration}</Text>
                </VStack>
                <VStack align="center" spacing={0}>
                  <Text fontSize="sm" color="gray.600">XP a ganar</Text>
                  <Text fontWeight="bold" color="purple.600">+{selectedLesson?.xp}</Text>
                </VStack>
                <VStack align="end" spacing={0}>
                  <Text fontSize="sm" color="gray.600">Tipo</Text>
                  <Badge colorScheme="blue">{selectedLesson?.type}</Badge>
                </VStack>
              </HStack>

              <Text fontSize="sm" color="gray.600">
                Al completar esta lección, desbloquearás nuevos contenidos y ganarás experiencia
                para subir de nivel. ¿Estás listo para comenzar?
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="green"
              leftIcon={<FaPlay />}
              onClick={handleCompleteLesson}
            >
              Comenzar Lección
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ModernContainer>
  );
};

export default LearningPath;