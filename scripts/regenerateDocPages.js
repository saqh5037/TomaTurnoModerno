/**
 * Script para regenerar páginas de documentación con getStaticProps
 * Esto evita problemas con importación de JSON en cliente
 */

const fs = require('fs');
const path = require('path');

const modules = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'users', name: 'Users' },
  { id: 'atencion', name: 'Atencion' },
  { id: 'cola', name: 'Cola' },
  { id: 'estadisticas', name: 'Estadisticas' },
  { id: 'cubiculos', name: 'Cubiculos' },
  { id: 'turnos', name: 'Turnos' }
];

const generatePageWithStaticProps = (moduleId, capitalizedName) => `import React from 'react';
import { useRouter } from 'next/router';
import {
  Box, Container, Heading, Text, VStack, HStack, Image, Badge, Button,
  List, ListItem, ListIcon, Alert, AlertIcon, AlertTitle, SimpleGrid,
  Icon, useColorModeValue, Accordion, AccordionItem, AccordionButton,
  AccordionPanel, AccordionIcon, Code, Grid, Breadcrumb, BreadcrumbItem, BreadcrumbLink
} from '@chakra-ui/react';
import {
  FaArrowLeft, FaCheckCircle, FaLightbulb, FaExclamationTriangle,
  FaClock, FaBook, FaImage, FaChevronRight, FaHome
} from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import ProtectedRoute from '../../components/ProtectedRoute';

const ${capitalizedName}Documentation = ({ moduleData }) => {
  const router = useRouter();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (!moduleData) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Módulo no encontrado</AlertTitle>
        </Alert>
      </Container>
    );
  }

  const { title, description, content, difficulty, estimatedTime, tags } = moduleData;

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'basic': return 'green';
      case 'intermediate': return 'yellow';
      case 'advanced': return 'red';
      default: return 'gray';
    }
  };

  const getDifficultyLabel = (diff) => {
    switch (diff) {
      case 'basic': return 'Básico';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      default: return diff;
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Breadcrumb spacing="8px" separator={<FaChevronRight color="gray.500" />} mb={6}>
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => router.push('/')}>
            <HStack spacing={1}><FaHome /><Text>Inicio</Text></HStack>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => router.push('/docs')}>Documentación</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage><Text>{title}</Text></BreadcrumbItem>
      </Breadcrumb>

      <Box bg={bgColor} p={8} borderRadius="lg" borderWidth="1px" borderColor={borderColor} mb={8}>
        <VStack align="start" spacing={4}>
          <HStack spacing={3} wrap="wrap">
            <Badge colorScheme={getDifficultyColor(difficulty)} fontSize="md" px={3} py={1}>
              {getDifficultyLabel(difficulty)}
            </Badge>
            <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
              <HStack spacing={1}><FaClock /><Text>{estimatedTime}</Text></HStack>
            </Badge>
          </HStack>
          <Heading size="2xl">{title}</Heading>
          <Text fontSize="xl" color="gray.600">{description}</Text>
          {tags && (
            <HStack spacing={2} wrap="wrap">
              {tags.map((tag, idx) => (
                <Badge key={idx} colorScheme="gray" variant="subtle">{tag}</Badge>
              ))}
            </HStack>
          )}
        </VStack>
      </Box>

      <Grid templateColumns={{ base: '1fr', lg: '3fr 1fr' }} gap={8}>
        <VStack align="stretch" spacing={8}>
          {content.overview && (
            <Box bg={bgColor} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <ReactMarkdown>{content.overview}</ReactMarkdown>
            </Box>
          )}

          {content.screenshots && content.screenshots.length > 0 && (
            <Box bg={bgColor} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <Heading size="lg" mb={6}><HStack><FaImage /><Text>Capturas de Pantalla</Text></HStack></Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {content.screenshots.map((screenshot, idx) => (
                  <Box key={idx} borderWidth="1px" borderRadius="lg" overflow="hidden" borderColor={borderColor}>
                    <Image src={screenshot.path} alt={screenshot.description} w="100%" h="auto" />
                    <Box p={4}>
                      <Text fontSize="sm" fontWeight="bold" mb={2}>
                        {screenshot.name.replace(/-/g, ' ').toUpperCase()}
                      </Text>
                      <Text fontSize="sm" color="gray.600">{screenshot.description}</Text>
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          )}

          {content.sections && content.sections.length > 0 && (
            <Box bg={bgColor} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <Heading size="lg" mb={6}><HStack><FaBook /><Text>Contenido Detallado</Text></HStack></Heading>
              <Accordion allowMultiple defaultIndex={[0]}>
                {content.sections.map((section, idx) => (
                  <AccordionItem key={idx} border="none" mb={4}>
                    <AccordionButton bg="blue.50" _hover={{ bg: 'blue.100' }} borderRadius="md" py={4}>
                      <Box flex="1" textAlign="left">
                        <Heading size="md">{section.title}</Heading>
                        {section.description && (
                          <Text fontSize="sm" color="gray.600" mt={1}>{section.description}</Text>
                        )}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel py={6} px={4}>
                      <ReactMarkdown>{section.content}</ReactMarkdown>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </Box>
          )}
        </VStack>

        <VStack align="stretch" spacing={6}>
          {content.features && content.features.length > 0 && (
            <Box bg={bgColor} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <Heading size="md" mb={4}>Características</Heading>
              <List spacing={2}>
                {content.features.map((feature, idx) => (
                  <ListItem key={idx} fontSize="sm">
                    <ListIcon as={FaCheckCircle} color="green.500" />{feature}
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {content.tips && content.tips.length > 0 && (
            <Alert status="info" borderRadius="lg" flexDirection="column" alignItems="flex-start">
              <HStack mb={2}><AlertIcon as={FaLightbulb} /><AlertTitle>Consejos</AlertTitle></HStack>
              <List spacing={2} fontSize="sm">
                {content.tips.map((tip, idx) => (<ListItem key={idx}>{tip}</ListItem>))}
              </List>
            </Alert>
          )}

          {content.warnings && content.warnings.length > 0 && (
            <Alert status="warning" borderRadius="lg" flexDirection="column" alignItems="flex-start">
              <HStack mb={2}><AlertIcon as={FaExclamationTriangle} /><AlertTitle>Advertencias</AlertTitle></HStack>
              <List spacing={2} fontSize="sm">
                {content.warnings.map((warning, idx) => (<ListItem key={idx}>{warning}</ListItem>))}
              </List>
            </Alert>
          )}

          <Button leftIcon={<FaArrowLeft />} onClick={() => router.push('/docs')} variant="outline" size="lg">
            Volver a Documentación
          </Button>
        </VStack>
      </Grid>
    </Container>
  );
};

export async function getStaticProps() {
  const fs = require('fs');
  const path = require('path');

  const filePath = path.join(process.cwd(), 'lib', 'docs', 'fullDocumentation.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const fullDocumentation = JSON.parse(fileContents);

  const moduleData = fullDocumentation.find(m => m.moduleId === '${moduleId}');

  return {
    props: {
      moduleData: moduleData || null
    }
  };
}

export default function Protected${capitalizedName}Documentation({ moduleData }) {
  return (
    <ProtectedRoute>
      <${capitalizedName}Documentation moduleData={moduleData} />
    </ProtectedRoute>
  );
}
`;

console.log('🚀 Regenerando páginas de documentación con getStaticProps...\n');

modules.forEach(({ id, name }) => {
  const filePath = path.join(__dirname, '..', 'pages', 'docs', `${id}.js`);
  const content = generatePageWithStaticProps(id, name);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Regenerada: pages/docs/${id}.js`);
});

console.log(`\n🎉 ${modules.length} páginas regeneradas con getStaticProps!`);
console.log('📝 Ahora las páginas cargan el JSON en tiempo de build, no en cliente.');
