const fs = require('fs');
const path = require('path');

const fullDoc = require('../lib/docs/fullDocumentation.json');

const template = (moduleId, capitalizedId) => `import React from 'react';
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
import fullDocumentation from '../../lib/docs/fullDocumentation.json';

const ${capitalizedId}Documentation = () => {
  const router = useRouter();
  const moduleData = fullDocumentation.find(m => m.moduleId === '${moduleId}');

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

export default function Protected${capitalizedId}Documentation() {
  return (
    <ProtectedRoute>
      <${capitalizedId}Documentation />
    </ProtectedRoute>
  );
}
`;

console.log('🚀 Generando páginas de documentación...\n');

fullDoc.forEach(module => {
  const moduleId = module.moduleId;
  const capitalizedId = moduleId.charAt(0).toUpperCase() + moduleId.slice(1);
  
  const filePath = path.join(__dirname, `../pages/docs/${moduleId}.js`);
  const content = template(moduleId, capitalizedId);
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Generada: pages/docs/${moduleId}.js`);
});

console.log(`\n🎉 ${fullDoc.length} páginas de documentación generadas exitosamente!`);
