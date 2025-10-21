import React from 'react';
import { useRouter } from 'next/router';
import {
  Box, Container, Heading, Text, VStack, HStack, Image, Badge, Button,
  List, ListItem, ListIcon, Alert, AlertIcon, AlertTitle, SimpleGrid,
  Icon, useColorModeValue, Accordion, AccordionItem, AccordionButton,
  AccordionPanel, AccordionIcon, Code, Grid, Breadcrumb, BreadcrumbItem,
  BreadcrumbLink, Divider, Table, Tbody, Tr, Td, Th, Thead, Flex, Circle
} from '@chakra-ui/react';
import {
  FaArrowLeft, FaCheckCircle, FaLightbulb, FaExclamationTriangle,
  FaClock, FaBook, FaImage, FaChevronRight, FaHome, FaInfoCircle, FaStethoscope
} from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import ProtectedRoute from '../../components/ProtectedRoute';
import { GlassCard, ModernHeader, fadeInUp, slideInFromLeft } from '../../components/theme/ModernTheme';

const AtencionDocumentation = ({ moduleData }) => {
  const router = useRouter();
  // Colores con glassmorphism style
  const glassCardBg = 'rgba(255, 255, 255, 0.25)';
  const glassBorder = 'rgba(255, 255, 255, 0.18)';
  const codeBlockBg = 'rgba(255, 255, 255, 0.5)';
  const infoBg = 'rgba(191, 219, 254, 0.3)'; // blue.200 con transparencia
  const warningBg = 'rgba(254, 243, 199, 0.3)'; // yellow.200 con transparencia
  const successBg = 'rgba(209, 250, 229, 0.3)'; // green.200 con transparencia

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

  // Custom markdown theme for better spacing and formatting (Anthropic-style)
  const markdownTheme = {
    h1: (props) => <Heading as="h1" size="2xl" mt={10} mb={6} fontWeight="bold" {...props} />,
    h2: (props) => <Heading as="h2" size="xl" mt={8} mb={5} fontWeight="bold" {...props} />,
    h3: (props) => <Heading as="h3" size="lg" mt={6} mb={4} fontWeight="semibold" {...props} />,
    h4: (props) => <Heading as="h4" size="md" mt={5} mb={3} fontWeight="semibold" {...props} />,
    p: (props) => <Text fontSize="md" lineHeight="1.8" mb={5} {...props} />,
    ul: (props) => <List spacing={3} mb={6} pl={4} {...props} />,
    ol: (props) => <List as="ol" spacing={3} mb={6} pl={4} styleType="decimal" {...props} />,
    li: (props) => <ListItem fontSize="md" lineHeight="1.8" {...props} />,
    code: (props) => {
      const { inline, children } = props;
      if (inline) {
        return (
          <Code
            px={2}
            py={1}
            bg={codeBlockBg}
            color="purple.600"
            fontSize="0.9em"
            borderRadius="md"
            fontWeight="semibold"
            {...props}
          >
            {children}
          </Code>
        );
      }
      return (
        <Box
          as="pre"
          bg={codeBlockBg}
          p={5}
          borderRadius="xl"
          overflowX="auto"
          mb={6}
          fontSize="sm"
          lineHeight="1.6"
          border="1px solid"
          borderColor={glassBorder}
          backdropFilter="blur(10px)"
        >
          <Code bg="transparent" color="inherit" p={0} {...props}>
            {children}
          </Code>
        </Box>
      );
    },
    blockquote: (props) => {
      const text = String(props.children);
      let status = 'info';
      let icon = FaInfoCircle;
      let bg = infoBg;

      if (text.includes('💡') || text.includes('Tip')) {
        status = 'info';
        icon = FaLightbulb;
      } else if (text.includes('⚠️') || text.includes('Importante') || text.includes('Advertencia')) {
        status = 'warning';
        icon = FaExclamationTriangle;
        bg = warningBg;
      } else if (text.includes('✅') || text.includes('Nota')) {
        status = 'success';
        icon = FaCheckCircle;
        bg = successBg;
      }

      return (
        <Alert
          status={status}
          variant="left-accent"
          borderRadius="md"
          mb={6}
          py={4}
          px={5}
          bg={bg}
        >
          <AlertIcon as={icon} />
          <Box fontSize="md" lineHeight="1.7">
            {props.children}
          </Box>
        </Alert>
      );
    },
    strong: (props) => <Text as="strong" fontWeight="bold" color="#4F7DF3" {...props} />,
    em: (props) => <Text as="em" fontStyle="italic" color="gray.700" {...props} />,
    hr: (props) => <Divider my={8} borderColor={glassBorder} {...props} />,
    table: (props) => (
      <Box overflowX="auto" mb={6}>
        <Table variant="simple" size="sm" {...props} />
      </Box>
    ),
    thead: (props) => <Thead bg={codeBlockBg} {...props} />,
    tbody: (props) => <Tbody {...props} />,
    tr: (props) => <Tr {...props} />,
    td: (props) => <Td py={3} px={4} fontSize="md" lineHeight="1.7" {...props} />,
    th: (props) => <Th py={3} px={4} fontSize="sm" fontWeight="bold" textTransform="none" {...props} />,
    img: (props) => (
      <Box mb={6} borderRadius="xl" overflow="hidden" border="1px solid" borderColor={glassBorder} boxShadow="glass">
        <Image {...props} w="100%" h="auto" />
      </Box>
    ),
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'basic': return 'green';
      case 'intermediate': return 'orange';
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
    <Box
      minH="100vh"
      p={{ base: 4, md: 8 }}
      background="linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 50%, #EDE9FE 100%)"
    >
      <Container maxW="container.xl">
        {/* Breadcrumb con glassmorphism */}
        <GlassCard p={4} mb={6} animation={`${fadeInUp} 0.6s ease-out`}>
          <Breadcrumb spacing="8px" separator={<FaChevronRight color="#4F7DF3" />}>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => router.push('/')} color="gray.700" fontWeight="medium">
                <HStack spacing={1}><FaHome /><Text>Inicio</Text></HStack>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => router.push('/docs')} color="gray.700" fontWeight="medium">Documentación</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <Text color="#4F7DF3" fontWeight="bold">{title}</Text>
            </BreadcrumbItem>
          </Breadcrumb>
        </GlassCard>

        {/* Header Card - Estilo docs index */}
        <GlassCard
          p={8}
          mb={8}
          animation={`${fadeInUp} 0.7s ease-out`}
          border="2px solid"
          borderColor="orange.300"
          position="relative"
          overflow="hidden"
        >
          {/* Progress Bar visual */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            height="4px"
            bg="orange.200"
          >
            <Box height="100%" width="0%" bg="orange.500" />
          </Box>

          <HStack spacing={6} align="start" mb={6}>
            {/* Icon Circle */}
            <Circle
              size="80px"
              bg="orange.100"
              color="orange.600"
              flexShrink={0}
            >
              <Icon as={FaStethoscope} fontSize="36px" />
            </Circle>

            {/* Content */}
            <VStack align="start" spacing={3} flex={1}>
              <Heading
                size="2xl"
                fontWeight="extrabold"
                color="gray.800"
              >
                {title}
              </Heading>

              <HStack spacing={2} wrap="wrap">
                <Badge
                  colorScheme={getDifficultyColor(difficulty)}
                  fontSize="sm"
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontWeight="bold"
                  textTransform="uppercase"
                >
                  {getDifficultyLabel(difficulty)}
                </Badge>
                <Badge
                  colorScheme="purple"
                  fontSize="sm"
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontWeight="bold"
                >
                  <HStack spacing={1}>
                    <FaClock />
                    <Text>{estimatedTime}</Text>
                  </HStack>
                </Badge>
              </HStack>

              <Text fontSize="lg" color="gray.700" fontWeight="medium" lineHeight="1.6">
                {description}
              </Text>

              {tags && (
                <HStack spacing={2} flexWrap="wrap">
                  {tags.map((tag, idx) => (
                    <Badge
                      key={idx}
                      size="sm"
                      variant="subtle"
                      colorScheme="blue"
                      fontSize="xs"
                      px={2}
                      py={1}
                    >
                      {tag}
                    </Badge>
                  ))}
                </HStack>
              )}
            </VStack>
          </HStack>

          {/* Action Buttons */}
          <HStack spacing={3} justify="flex-end">
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<FaArrowLeft />}
              onClick={() => router.push('/docs')}
              _hover={{
                bg: 'rgba(79, 125, 243, 0.1)',
                transform: 'translateX(-2px)'
              }}
            >
              Volver
            </Button>
            <Button
              size="sm"
              background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
              color="white"
              rightIcon={<FaBook />}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg'
              }}
              onClick={() => {
                const firstSection = document.getElementById('content-detallado');
                if (firstSection) firstSection.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Comenzar Tutorial
            </Button>
          </HStack>
        </GlassCard>

        <Grid templateColumns={{ base: '1fr', lg: '3fr 1fr' }} gap={8}>
          <VStack align="stretch" spacing={8}>
            {content.overview && (
              <GlassCard p={8} animation={`${fadeInUp} 0.8s ease-out`}>
                <ReactMarkdown components={markdownTheme}>{content.overview}</ReactMarkdown>
              </GlassCard>
            )}

            {content.screenshots && content.screenshots.length > 0 && (
              <GlassCard p={6} animation={`${fadeInUp} 0.9s ease-out`}>
                <Heading size="lg" mb={6} fontWeight="bold" color="gray.800">
                  <HStack><FaImage color="#4F7DF3" /><Text>Capturas de Pantalla</Text></HStack>
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {content.screenshots.map((screenshot, idx) => (
                    <GlassCard key={idx} overflow="hidden" p={0}>
                      <Image src={screenshot.path} alt={screenshot.description} w="100%" h="auto" />
                      <Box p={4}>
                        <Text fontSize="sm" fontWeight="bold" mb={2} color="gray.800">
                          {screenshot.title || screenshot.filename || 'Sin título'}
                        </Text>
                        <Text fontSize="sm" color="gray.600">{screenshot.description}</Text>
                      </Box>
                    </GlassCard>
                  ))}
                </SimpleGrid>
              </GlassCard>
            )}

            {content.sections && content.sections.length > 0 && (
              <GlassCard p={8} animation={`${fadeInUp} 1s ease-out`} id="content-detallado">
                <Heading size="lg" mb={8} fontWeight="bold" color="gray.800">
                  <HStack><FaBook color="#4F7DF3" /><Text>Contenido Detallado</Text></HStack>
                </Heading>
                <Accordion allowMultiple defaultIndex={[0]}>
                  {content.sections.map((section, idx) => (
                    <AccordionItem key={idx} border="none" mb={6}>
                      <AccordionButton
                        bg={infoBg}
                        backdropFilter="blur(10px)"
                        _hover={{ bg: 'rgba(191, 219, 254, 0.5)', transform: 'scale(1.01)' }}
                        borderRadius="xl"
                        py={5}
                        px={6}
                        transition="all 0.3s ease"
                      >
                        <Box flex="1" textAlign="left">
                          <Heading size="md" fontWeight="bold" color="gray.800">{section.title}</Heading>
                          {section.description && (
                            <Text fontSize="sm" color="gray.600" mt={2}>{section.description}</Text>
                          )}
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel py={8} px={6}>
                        <ReactMarkdown components={markdownTheme}>{section.content}</ReactMarkdown>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </GlassCard>
            )}
          </VStack>

          <VStack align="stretch" spacing={6}>
            {content.features && content.features.length > 0 && (
              <GlassCard p={6} animation={`${slideInFromLeft} 0.8s ease-out`}>
                <Heading size="md" mb={6} fontWeight="bold" color="gray.800">✨ Características</Heading>
                <VStack align="stretch" spacing={4}>
                  {content.features.map((feature, idx) => (
                    <Box
                      key={idx}
                      p={4}
                      bg={successBg}
                      backdropFilter="blur(10px)"
                      borderRadius="xl"
                      borderLeft="4px solid"
                      borderLeftColor="green.400"
                      transition="all 0.3s ease"
                      _hover={{ transform: 'translateX(5px)', boxShadow: 'md' }}
                    >
                      <HStack align="start" spacing={3}>
                        <Text fontSize="xl" mt={1}>{feature.icon || '✓'}</Text>
                        <Box>
                          <Text fontWeight="bold" fontSize="sm" mb={1} color="gray.800">{feature.title}</Text>
                          <Text color="gray.700" fontSize="xs" lineHeight="1.6">{feature.description}</Text>
                        </Box>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </GlassCard>
            )}

            {content.tips && content.tips.length > 0 && (
              <GlassCard p={6} animation={`${slideInFromLeft} 0.9s ease-out`}>
                <Heading size="md" mb={6} fontWeight="bold" color="gray.800">
                  <HStack><FaLightbulb color="#3182CE" /><Text>💡 Consejos</Text></HStack>
                </Heading>
                <VStack align="stretch" spacing={4}>
                  {content.tips.map((tip, idx) => (
                    <Box
                      key={idx}
                      p={4}
                      bg={infoBg}
                      backdropFilter="blur(10px)"
                      borderRadius="xl"
                      borderLeft="4px solid"
                      borderLeftColor="blue.400"
                      transition="all 0.3s ease"
                      _hover={{ transform: 'translateX(5px)', boxShadow: 'md' }}
                    >
                      <HStack align="start" spacing={3}>
                        <Text fontSize="xl" mt={1}>{tip.icon || '💡'}</Text>
                        <Box>
                          <Text fontWeight="bold" fontSize="sm" mb={1} color="gray.800">{tip.title}</Text>
                          <Text color="gray.700" fontSize="xs" lineHeight="1.6">{tip.description}</Text>
                        </Box>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </GlassCard>
            )}

            {content.warnings && content.warnings.length > 0 && (
              <GlassCard p={6} animation={`${slideInFromLeft} 1s ease-out`}>
                <Heading size="md" mb={6} fontWeight="bold" color="gray.800">
                  <HStack><FaExclamationTriangle color="#D69E2E" /><Text>⚠️ Advertencias</Text></HStack>
                </Heading>
                <VStack align="stretch" spacing={4}>
                  {content.warnings.map((warning, idx) => (
                    <Box
                      key={idx}
                      p={4}
                      bg={warningBg}
                      backdropFilter="blur(10px)"
                      borderRadius="xl"
                      borderLeft="4px solid"
                      borderLeftColor="yellow.500"
                      transition="all 0.3s ease"
                      _hover={{ transform: 'translateX(5px)', boxShadow: 'md' }}
                    >
                      <HStack align="start" spacing={3}>
                        <Text fontSize="xl" mt={1}>{warning.icon || '⚠️'}</Text>
                        <Box>
                          <Text fontWeight="bold" fontSize="sm" mb={1} color="gray.800">{warning.title}</Text>
                          <Text color="gray.700" fontSize="xs" lineHeight="1.6">{warning.description}</Text>
                        </Box>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </GlassCard>
            )}

            <Button
              leftIcon={<FaArrowLeft />}
              onClick={() => router.push('/docs')}
              background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
              color="white"
              size="lg"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'xl'
              }}
              transition="all 0.3s ease"
            >
              Volver a Documentación
            </Button>
          </VStack>
        </Grid>
      </Container>
    </Box>
  );
};

export async function getStaticProps() {
  const fs = require('fs');
  const path = require('path');

  const filePath = path.join(process.cwd(), 'lib', 'docs', 'fullDocumentation.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const fullDocumentation = JSON.parse(fileContents);

  const moduleData = fullDocumentation.find(m => m.moduleId === 'atencion');

  return {
    props: {
      moduleData: moduleData || null
    }
  };
}

export default function ProtectedAtencionDocumentation({ moduleData }) {
  return (
    <ProtectedRoute>
      <AtencionDocumentation moduleData={moduleData} />
    </ProtectedRoute>
  );
}
