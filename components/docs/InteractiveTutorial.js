import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Code,
  Alert,
  AlertIcon,
  Progress,
  useToast,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  Flex
} from '@chakra-ui/react';
import { FaPlay, FaCheck, FaRedo, FaLightbulb, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

const InteractiveTutorial = ({ tutorial }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // Cargar código inicial si existe
    if (tutorial?.steps?.[currentStep]?.initialCode) {
      setUserCode(tutorial.steps[currentStep].initialCode);
    }
  }, [currentStep, tutorial]);

  // Simulador de API para ejecutar código
  const simulateAPICall = async (code) => {
    // Simulación básica de ejecución
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Evaluar código en un contexto seguro (en producción usar sandbox)
    try {
      // Aquí se evaluaría el código de forma segura
      return `✓ Código ejecutado exitosamente\n\nResultado: ${code.includes('console.log') ? 'Log enviado' : 'Operación completada'}`;
    } catch (error) {
      throw new Error(`Error de sintaxis: ${error.message}`);
    }
  };

  // Validar si el paso está correcto
  const validateStep = (step, code) => {
    const validation = tutorial?.steps?.[step]?.validation;
    if (!validation) return true;

    // Verificar palabras clave requeridas
    if (validation.required) {
      return validation.required.every(keyword => code.includes(keyword));
    }

    return true;
  };

  // Ejecutar código del usuario
  const runCode = async () => {
    setIsRunning(true);
    setOutput('');

    try {
      const result = await simulateAPICall(userCode);
      setOutput(result);

      // Validar si el código es correcto
      if (validateStep(currentStep, userCode)) {
        if (!completed.includes(currentStep)) {
          setCompleted([...completed, currentStep]);
        }

        toast({
          title: '¡Excelente!',
          description: 'Has completado este paso correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true
        });

        // Auto-avanzar al siguiente paso después de 2 segundos
        if (currentStep < tutorial.steps.length - 1) {
          setTimeout(() => {
            setCurrentStep(currentStep + 1);
            setShowHint(false);
            setOutput('');
          }, 2000);
        }
      } else {
        toast({
          title: 'Casi lo tienes',
          description: 'Revisa tu código e intenta nuevamente',
          status: 'warning',
          duration: 3000,
          isClosable: true
        });
      }
    } catch (error) {
      setOutput(`❌ Error: ${error.message}`);
      toast({
        title: 'Error en el código',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Reset del código actual
  const resetCode = () => {
    setUserCode(tutorial?.steps?.[currentStep]?.initialCode || '');
    setOutput('');
    setShowHint(false);
  };

  const currentStepData = tutorial?.steps?.[currentStep];
  const progressPercent = tutorial?.steps?.length ? ((completed.length / tutorial.steps.length) * 100) : 0;

  if (!tutorial || !currentStepData) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="warning">
          <AlertIcon />
          No se encontró el tutorial especificado
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header del Tutorial */}
        <Box
          bg="white"
          p={6}
          borderRadius="2xl"
          boxShadow="xl"
          border="1px solid"
          borderColor="blue.100"
        >
          <HStack justify="space-between" mb={4}>
            <VStack align="start" spacing={1}>
              <Heading size="lg" color="blue.700">{tutorial.title}</Heading>
              <Text color="gray.600">{tutorial.description}</Text>
            </VStack>
            <VStack align="end" spacing={1}>
              <Badge
                colorScheme="purple"
                fontSize="lg"
                px={4}
                py={2}
                borderRadius="full"
              >
                {completed.length}/{tutorial.steps.length} Completados
              </Badge>
              <Text fontSize="sm" color="gray.500">
                {Math.round(progressPercent)}% Completado
              </Text>
            </VStack>
          </HStack>

          <Progress
            value={progressPercent}
            colorScheme="green"
            size="sm"
            borderRadius="full"
            bg="gray.100"
            hasStripe
            isAnimated
          />
        </Box>

        {/* Contenido del Step Actual */}
        <Box
          bg="white"
          p={6}
          borderRadius="2xl"
          boxShadow="xl"
          border="2px solid"
          borderColor={completed.includes(currentStep) ? "green.200" : "blue.200"}
        >
          <VStack align="stretch" spacing={4}>
            {/* Título del paso */}
            <HStack justify="space-between">
              <HStack spacing={3}>
                <Badge
                  colorScheme={completed.includes(currentStep) ? "green" : "blue"}
                  fontSize="md"
                  px={3}
                  py={1}
                  borderRadius="full"
                >
                  Paso {currentStep + 1}
                </Badge>
                <Heading size="md" color="gray.800">
                  {currentStepData.title}
                </Heading>
                {completed.includes(currentStep) && (
                  <Badge colorScheme="green" variant="subtle">
                    <FaCheck style={{ marginRight: '4px' }} />
                    Completado
                  </Badge>
                )}
              </HStack>

              <HStack>
                <IconButton
                  icon={<FaChevronLeft />}
                  size="sm"
                  variant="ghost"
                  isDisabled={currentStep === 0}
                  onClick={() => {
                    setCurrentStep(currentStep - 1);
                    setShowHint(false);
                    setOutput('');
                  }}
                  aria-label="Paso anterior"
                />
                <Text fontSize="sm" color="gray.500">
                  {currentStep + 1} / {tutorial.steps.length}
                </Text>
                <IconButton
                  icon={<FaChevronRight />}
                  size="sm"
                  variant="ghost"
                  isDisabled={currentStep === tutorial.steps.length - 1}
                  onClick={() => {
                    setCurrentStep(currentStep + 1);
                    setShowHint(false);
                    setOutput('');
                  }}
                  aria-label="Siguiente paso"
                />
              </HStack>
            </HStack>

            {/* Instrucciones */}
            <Box
              p={4}
              bg="blue.50"
              borderRadius="lg"
              borderLeft="4px solid"
              borderLeftColor="blue.400"
            >
              <Text fontSize="lg" color="gray.700">
                {currentStepData.instruction}
              </Text>
            </Box>

            {/* Zona de Código Interactivo */}
            <Tabs variant="enclosed" colorScheme="blue">
              <TabList>
                <Tab _selected={{ bg: 'blue.500', color: 'white' }}>
                  📝 Tu Código
                </Tab>
                <Tab _selected={{ bg: 'green.500', color: 'white' }}>
                  👀 Ejemplo
                </Tab>
                <Tab _selected={{ bg: 'orange.500', color: 'white' }}>
                  💡 Pistas
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel p={0}>
                  <Box borderRadius="lg" overflow="hidden">
                    <CodeMirror
                      value={userCode}
                      height="350px"
                      theme={oneDark}
                      extensions={[javascript()]}
                      onChange={(value) => setUserCode(value)}
                      placeholder="// Escribe tu código aquí..."
                    />
                  </Box>
                </TabPanel>

                <TabPanel>
                  <Box
                    bg="gray.900"
                    color="green.400"
                    p={4}
                    borderRadius="lg"
                    fontFamily="mono"
                    fontSize="sm"
                    overflowX="auto"
                  >
                    <pre style={{ margin: 0 }}>
                      <code>{currentStepData.exampleCode}</code>
                    </pre>
                  </Box>
                </TabPanel>

                <TabPanel>
                  <VStack align="stretch" spacing={3}>
                    <Alert
                      status="info"
                      borderRadius="lg"
                      variant="left-accent"
                    >
                      <AlertIcon as={FaLightbulb} />
                      <Box>
                        <Text fontWeight="bold" mb={1}>Pista</Text>
                        <Text>{currentStepData.hint}</Text>
                      </Box>
                    </Alert>

                    {currentStepData.tips && (
                      <Box>
                        <Text fontWeight="bold" mb={2} color="gray.700">
                          Tips adicionales:
                        </Text>
                        <VStack align="start" spacing={1}>
                          {currentStepData.tips.map((tip, idx) => (
                            <Text key={idx} fontSize="sm" color="gray.600">
                              • {tip}
                            </Text>
                          ))}
                        </VStack>
                      </Box>
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>

            {/* Output */}
            {output && (
              <Box
                bg={output.includes('✓') ? 'green.900' : 'gray.900'}
                color={output.includes('✓') ? 'green.300' : output.includes('❌') ? 'red.400' : 'gray.300'}
                p={4}
                borderRadius="lg"
                fontFamily="mono"
                fontSize="sm"
                border="1px solid"
                borderColor={output.includes('✓') ? 'green.700' : 'gray.700'}
              >
                <Text fontWeight="bold" mb={2}>Output:</Text>
                <Text whiteSpace="pre-wrap">{output}</Text>
              </Box>
            )}

            {/* Botones de Acción */}
            <Flex justify="space-between" align="center" pt={2}>
              <HStack spacing={3}>
                <Button
                  leftIcon={<FaPlay />}
                  colorScheme="green"
                  size="lg"
                  onClick={runCode}
                  isLoading={isRunning}
                  loadingText="Ejecutando..."
                  isDisabled={!userCode.trim()}
                >
                  Ejecutar Código
                </Button>

                <Button
                  leftIcon={<FaRedo />}
                  variant="outline"
                  onClick={resetCode}
                  isDisabled={isRunning}
                >
                  Reiniciar
                </Button>

                {!showHint && (
                  <Button
                    leftIcon={<FaLightbulb />}
                    variant="ghost"
                    colorScheme="orange"
                    onClick={() => setShowHint(true)}
                  >
                    Necesito ayuda
                  </Button>
                )}
              </HStack>

              {currentStep === tutorial.steps.length - 1 && completed.length === tutorial.steps.length && (
                <Badge
                  colorScheme="green"
                  fontSize="lg"
                  px={4}
                  py={2}
                  borderRadius="full"
                >
                  🎉 ¡Tutorial Completado!
                </Badge>
              )}
            </Flex>

            {/* Ayuda contextual si se solicita */}
            {showHint && currentStepData.detailedHelp && (
              <Alert status="warning" borderRadius="lg" mt={4}>
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">Ayuda detallada:</Text>
                  <Text mt={1}>{currentStepData.detailedHelp}</Text>
                </Box>
              </Alert>
            )}
          </VStack>
        </Box>

        {/* Progreso de pasos */}
        <Box
          bg="white"
          p={4}
          borderRadius="xl"
          boxShadow="md"
        >
          <HStack spacing={2} overflowX="auto" pb={2}>
            {tutorial.steps.map((step, idx) => (
              <Button
                key={idx}
                size="sm"
                variant={idx === currentStep ? "solid" : "outline"}
                colorScheme={completed.includes(idx) ? "green" : idx === currentStep ? "blue" : "gray"}
                onClick={() => {
                  setCurrentStep(idx);
                  setShowHint(false);
                  setOutput('');
                }}
                minW="fit-content"
                rightIcon={completed.includes(idx) ? <FaCheck /> : null}
              >
                {idx + 1}. {step.shortTitle || step.title}
              </Button>
            ))}
          </HStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default InteractiveTutorial;