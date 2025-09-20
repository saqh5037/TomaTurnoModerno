import { useState } from 'react';
import {
  ChakraProvider,
  Container,
  Heading,
  Text,
  VStack,
  Grid,
  Box,
  Badge,
  Button
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { modernTheme, GlassCard, ModernContainer } from '../../components/theme/ModernTheme';
import InteractiveTutorial from '../../components/docs/InteractiveTutorial';
import ProtectedRoute from '../../components/ProtectedRoute';
import { FaPlay, FaClock, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';

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

// Tutoriales de ejemplo
const tutorials = {
  'primer-llamado': {
    id: 'primer-llamado',
    title: 'Tu Primer Llamado de Paciente',
    description: 'Aprende paso a paso cómo llamar a tu primer paciente',
    difficulty: 'Básico',
    duration: '10 minutos',
    steps: [
      {
        title: 'Seleccionar Cubículo',
        shortTitle: 'Cubículo',
        instruction: 'Primero, debes seleccionar el cubículo donde atenderás. Escribe el código para seleccionar el cubículo 1.',
        initialCode: '// Selecciona el cubículo 1\nconst cubiculoId = ',
        exampleCode: 'const cubiculoId = 1;\nseleccionarCubiculo(cubiculoId);',
        hint: 'Asigna el número 1 a la variable cubiculoId',
        detailedHelp: 'En JavaScript, asignamos valores a variables usando el símbolo =. Por ejemplo: const miVariable = valor;',
        tips: ['Recuerda que el cubículo debe estar disponible', 'Puedes cambiar de cubículo en cualquier momento'],
        validation: {
          required: ['cubiculoId = 1', 'seleccionarCubiculo']
        }
      },
      {
        title: 'Obtener Lista de Espera',
        shortTitle: 'Lista',
        instruction: 'Ahora vamos a obtener la lista de pacientes en espera. Completa el código para hacer la petición.',
        initialCode: '// Obtener lista de pacientes\nconst pacientes = await ',
        exampleCode: 'const pacientes = await obtenerPacientesEnEspera();\nconsole.log(`Hay ${pacientes.length} pacientes esperando`);',
        hint: 'Usa await obtenerPacientesEnEspera() para obtener la lista',
        tips: ['La función es asíncrona, por eso usamos await', 'La lista se actualiza cada 5 segundos'],
        validation: {
          required: ['obtenerPacientesEnEspera', 'await']
        }
      },
      {
        title: 'Llamar al Paciente',
        shortTitle: 'Llamar',
        instruction: 'Finalmente, vamos a llamar al primer paciente de la lista.',
        initialCode: '// Llamar al primer paciente\nif (pacientes.length > 0) {\n  const primerPaciente = pacientes[0];\n  // Completa aquí\n}',
        exampleCode: `if (pacientes.length > 0) {
  const primerPaciente = pacientes[0];
  await llamarPaciente(primerPaciente.id);
  console.log(\`Llamando a \${primerPaciente.nombre}\`);
}`,
        hint: 'Usa llamarPaciente() con el ID del paciente',
        tips: ['Siempre verifica que haya pacientes antes de llamar', 'El sistema anunciará por altavoz automáticamente'],
        validation: {
          required: ['llamarPaciente', 'primerPaciente.id']
        }
      }
    ]
  },
  'manejo-prioridades': {
    id: 'manejo-prioridades',
    title: 'Manejo de Pacientes Prioritarios',
    description: 'Aprende a identificar y atender pacientes con prioridad',
    difficulty: 'Intermedio',
    duration: '15 minutos',
    steps: [
      {
        title: 'Identificar Prioridades',
        instruction: 'Aprende a filtrar pacientes por prioridad',
        initialCode: '// Filtrar pacientes prioritarios\nconst prioritarios = pacientes.filter(p => ',
        exampleCode: 'const prioritarios = pacientes.filter(p => p.prioridad === "alta");',
        hint: 'Filtra los pacientes donde prioridad sea "alta"',
        validation: {
          required: ['filter', 'prioridad']
        }
      }
    ]
  }
};

const TutorialsPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedTutorial, setSelectedTutorial] = useState(null);

  const handleStartTutorial = (tutorialId) => {
    setSelectedTutorial(tutorials[tutorialId]);
  };

  if (selectedTutorial) {
    return (
      <ChakraProvider theme={modernTheme}>
        <ProtectedRoute>
          <ModernContainer>
            <Button
              onClick={() => setSelectedTutorial(null)}
              mb={4}
              variant="ghost"
              _hover={{
                bg: 'rgba(255, 255, 255, 0.1)',
                transform: 'translateX(-4px)'
              }}
              transition="all 0.3s"
            >
              ← Volver a tutoriales
            </Button>
            <InteractiveTutorial tutorial={selectedTutorial} />
          </ModernContainer>
        </ProtectedRoute>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider theme={modernTheme}>
      <ProtectedRoute>
        <ModernContainer>
          <VStack spacing={8} align="stretch">
            <GlassCard
              p={8}
              textAlign="center"
              animation={`${fadeInUp} 0.6s ease-out`}
            >
              <Heading
                size="2xl"
                mb={4}
                bgGradient="linear(to-r, blue.400, purple.600)"
                bgClip="text"
              >
                Tutoriales Interactivos
              </Heading>
              <Text fontSize="lg" color="gray.600">
                Aprende haciendo con nuestros tutoriales paso a paso
              </Text>
            </GlassCard>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
              {Object.values(tutorials).map((tutorial, index) => (
                <GlassCard
                  key={tutorial.id}
                  p={6}
                  cursor="pointer"
                  onClick={() => handleStartTutorial(tutorial.id)}
                  _hover={{
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
                  }}
                  transition="all 0.3s"
                  animation={`${slideIn} ${0.4 + index * 0.1}s ease-out`}
                >
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <Heading size="md" mb={2}>
                        {tutorial.title}
                      </Heading>
                      <Text color="gray.600" fontSize="sm">
                        {tutorial.description}
                      </Text>
                    </Box>

                    <Box>
                      <Badge
                        colorScheme={
                          tutorial.difficulty === 'Básico' ? 'green' :
                          tutorial.difficulty === 'Intermedio' ? 'orange' : 'red'
                        }
                        mb={2}
                      >
                        {tutorial.difficulty}
                      </Badge>

                      <VStack align="start" spacing={1} fontSize="sm" color="gray.500">
                        <Text>
                          <FaClock style={{ display: 'inline', marginRight: '4px' }} />
                          {tutorial.duration}
                        </Text>
                        <Text>
                          <FaStar style={{ display: 'inline', marginRight: '4px' }} />
                          {tutorial.steps.length} pasos
                        </Text>
                      </VStack>
                    </Box>

                    <Button
                      colorScheme="blue"
                      size="sm"
                      leftIcon={<FaPlay />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartTutorial(tutorial.id);
                      }}
                    >
                      Comenzar Tutorial
                    </Button>
                  </VStack>
                </GlassCard>
              ))}
            </Grid>
          </VStack>
        </ModernContainer>
      </ProtectedRoute>
    </ChakraProvider>
  );
};

export default TutorialsPage;