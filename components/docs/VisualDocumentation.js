import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Image,
  Text,
  VStack,
  HStack,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Tooltip,
  Circle,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Flex,
  Grid,
  useToast,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  Textarea,
  FormControl,
  FormLabel,
  Input,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import {
  FaExpand,
  FaInfo,
  FaPlay,
  FaComments,
  FaPause,
  FaRedo,
  FaChevronLeft,
  FaChevronRight,
  FaBookmark,
  FaShare,
  FaDownload,
  FaEye,
  FaEdit
} from 'react-icons/fa';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import dynamic from 'next/dynamic';

// Dynamic imports para componentes pesados
const Mermaid = dynamic(() => import('./MermaidDiagram'), { ssr: false });

const VisualDocumentation = ({ content, onCommentAdd }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeAnnotation, setActiveAnnotation] = useState(null);
  const [comments, setComments] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  const { isOpen: isImageOpen, onOpen: onImageOpen, onClose: onImageClose } = useDisclosure();
  const { isOpen: isCommentOpen, onOpen: onCommentOpen, onClose: onCommentClose } = useDisclosure();
  const { isOpen: isVideoOpen, onOpen: onVideoOpen, onClose: onVideoClose } = useDisclosure();

  const toast = useToast();
  const videoRef = useRef(null);

  // Cargar comentarios guardados
  useEffect(() => {
    const savedComments = localStorage.getItem('doc_comments');
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    }
  }, []);

  const handleImageClick = (section) => {
    setSelectedImage(section);
    onImageOpen();
  };

  const handleAnnotationClick = (annotation) => {
    setActiveAnnotation(annotation);
    toast({
      title: `Anotación ${annotation.index + 1}`,
      description: annotation.text,
      status: 'info',
      duration: 5000,
      isClosable: true,
      position: 'top'
    });
  };

  const handleCommentSubmit = (sectionId, comment) => {
    const newComments = {
      ...comments,
      [sectionId]: [...(comments[sectionId] || []), {
        id: Date.now(),
        text: comment,
        timestamp: new Date().toISOString(),
        user: 'Usuario Actual' // En producción, usar el usuario real
      }]
    };
    setComments(newComments);
    localStorage.setItem('doc_comments', JSON.stringify(newComments));

    if (onCommentAdd) {
      onCommentAdd(sectionId, comment);
    }

    toast({
      title: 'Comentario agregado',
      status: 'success',
      duration: 2000
    });
  };

  const handleDownloadImage = (imageUrl, title) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${title || 'imagen'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareContent = (section) => {
    const shareUrl = `${window.location.origin}/docs/visual/${section.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Enlace copiado',
      description: 'El enlace ha sido copiado al portapapeles',
      status: 'success',
      duration: 2000
    });
  };

  const AnimatedGif = ({ src, controls, loop, speed = 1 }) => {
    const [isPaused, setIsPaused] = useState(false);
    const gifRef = useRef(null);

    const togglePlayPause = () => {
      setIsPaused(!isPaused);
      // En una implementación real, usaríamos una librería para controlar GIFs
    };

    return (
      <Box position="relative" display="inline-block">
        <Image
          ref={gifRef}
          src={src}
          alt="Animated demonstration"
          borderRadius="lg"
          boxShadow="xl"
        />
        {controls && (
          <HStack
            position="absolute"
            bottom={4}
            left="50%"
            transform="translateX(-50%)"
            bg="blackAlpha.700"
            borderRadius="full"
            p={2}
            spacing={2}
          >
            <IconButton
              icon={isPaused ? <FaPlay /> : <FaPause />}
              size="sm"
              colorScheme="whiteAlpha"
              onClick={togglePlayPause}
              aria-label={isPaused ? "Play" : "Pause"}
            />
            <IconButton
              icon={<FaRedo />}
              size="sm"
              colorScheme="whiteAlpha"
              onClick={() => {
                // Reiniciar GIF
                if (gifRef.current) {
                  const currentSrc = gifRef.current.src;
                  gifRef.current.src = '';
                  gifRef.current.src = currentSrc;
                }
              }}
              aria-label="Restart"
            />
          </HStack>
        )}
      </Box>
    );
  };

  const InteractiveDiagram = ({ data, onNodeClick }) => {
    if (!data) return null;

    return (
      <Box
        p={4}
        bg="white"
        borderRadius="xl"
        boxShadow="lg"
        border="1px solid"
        borderColor="gray.200"
      >
        {data.type === 'mermaid' ? (
          <Mermaid chart={data.content} />
        ) : (
          <Box position="relative">
            {/* Renderizar diagrama personalizado */}
            <svg viewBox="0 0 800 400" style={{ width: '100%', height: 'auto' }}>
              {data.nodes?.map((node, idx) => (
                <g key={idx} onClick={() => onNodeClick(node)}>
                  <rect
                    x={node.x}
                    y={node.y}
                    width={node.width || 120}
                    height={node.height || 60}
                    fill={node.color || '#4F7DF3'}
                    rx="8"
                    stroke="#fff"
                    strokeWidth="2"
                    cursor="pointer"
                    style={{
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.fill = '#6B73FF';
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.fill = node.color || '#4F7DF3';
                      e.target.style.transform = 'scale(1)';
                    }}
                  />
                  <text
                    x={node.x + (node.width || 120) / 2}
                    y={node.y + (node.height || 60) / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="600"
                    pointerEvents="none"
                  >
                    {node.label}
                  </text>
                </g>
              ))}

              {data.connections?.map((conn, idx) => (
                <line
                  key={idx}
                  x1={conn.from.x}
                  y1={conn.from.y}
                  x2={conn.to.x}
                  y2={conn.to.y}
                  stroke="#CBD5E0"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
              ))}

              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3, 0 6"
                    fill="#CBD5E0"
                  />
                </marker>
              </defs>
            </svg>
          </Box>
        )}
      </Box>
    );
  };

  const ImageCarousel = ({ images }) => {
    return (
      <Box position="relative">
        <Image
          src={images[currentSlide]}
          alt={`Slide ${currentSlide + 1}`}
          borderRadius="lg"
          boxShadow="xl"
          maxH="500px"
          objectFit="contain"
          w="100%"
        />

        <HStack
          position="absolute"
          bottom={4}
          left="50%"
          transform="translateX(-50%)"
          bg="blackAlpha.700"
          borderRadius="full"
          p={2}
          spacing={2}
        >
          <IconButton
            icon={<FaChevronLeft />}
            size="sm"
            colorScheme="whiteAlpha"
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            isDisabled={currentSlide === 0}
            aria-label="Previous"
          />
          <Text color="white" fontSize="sm" px={2}>
            {currentSlide + 1} / {images.length}
          </Text>
          <IconButton
            icon={<FaChevronRight />}
            size="sm"
            colorScheme="whiteAlpha"
            onClick={() => setCurrentSlide(Math.min(images.length - 1, currentSlide + 1))}
            isDisabled={currentSlide === images.length - 1}
            aria-label="Next"
          />
        </HStack>

        {/* Thumbnails */}
        <HStack mt={4} spacing={2} overflowX="auto" pb={2}>
          {images.map((img, idx) => (
            <Box
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              cursor="pointer"
              border="2px solid"
              borderColor={idx === currentSlide ? "blue.500" : "gray.300"}
              borderRadius="md"
              overflow="hidden"
              flexShrink={0}
            >
              <Image
                src={img}
                alt={`Thumb ${idx + 1}`}
                w="80px"
                h="60px"
                objectFit="cover"
              />
            </Box>
          ))}
        </HStack>
      </Box>
    );
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Controles globales */}
        <HStack justify="space-between" p={4} bg="gray.50" borderRadius="lg">
          <HStack spacing={2}>
            <Button
              size="sm"
              leftIcon={<FaEye />}
              variant={showAnnotations ? "solid" : "outline"}
              colorScheme="blue"
              onClick={() => setShowAnnotations(!showAnnotations)}
            >
              Anotaciones
            </Button>
            <Button
              size="sm"
              leftIcon={<FaComments />}
              variant="outline"
              onClick={onCommentOpen}
            >
              Comentarios ({Object.values(comments).flat().length})
            </Button>
          </HStack>
          <HStack spacing={2}>
            <IconButton
              icon={<FaBookmark />}
              size="sm"
              variant="outline"
              aria-label="Bookmark"
            />
            <IconButton
              icon={<FaShare />}
              size="sm"
              variant="outline"
              aria-label="Share"
            />
          </HStack>
        </HStack>

        {/* Contenido Visual */}
        {content?.sections?.map((section, sectionIdx) => (
          <Box key={section.id || sectionIdx}>
            {/* Screenshot con Anotaciones */}
            {section.type === 'screenshot' && (
              <Box>
                <HStack mb={2} justify="space-between">
                  <Text fontWeight="bold">{section.title}</Text>
                  <Badge colorScheme="purple">Interactivo</Badge>
                </HStack>

                <Box
                  position="relative"
                  cursor="zoom-in"
                  onClick={() => handleImageClick(section)}
                  borderRadius="lg"
                  overflow="hidden"
                  boxShadow="lg"
                  _hover={{ boxShadow: 'xl' }}
                  transition="all 0.3s"
                >
                  <Image
                    src={section.image || '/api/placeholder/800/400'}
                    alt={section.title}
                    w="100%"
                    maxH="500px"
                    objectFit="cover"
                  />

                  {/* Anotaciones Flotantes */}
                  {showAnnotations && section.annotations?.map((annotation, idx) => (
                    <Tooltip
                      key={idx}
                      label={annotation.text}
                      placement="top"
                      hasArrow
                      bg="blue.600"
                      color="white"
                    >
                      <Circle
                        position="absolute"
                        top={`${annotation.y}%`}
                        left={`${annotation.x}%`}
                        size="32px"
                        bg="red.500"
                        color="white"
                        fontSize="sm"
                        fontWeight="bold"
                        cursor="pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnnotationClick({ ...annotation, index: idx });
                        }}
                        animation="pulse 2s infinite"
                        _hover={{
                          transform: 'scale(1.2)',
                          bg: 'red.600'
                        }}
                        transition="all 0.2s"
                        boxShadow="lg"
                      >
                        {idx + 1}
                      </Circle>
                    </Tooltip>
                  ))}

                  {/* Toolbar de Imagen */}
                  <HStack
                    position="absolute"
                    bottom={4}
                    right={4}
                    bg="blackAlpha.800"
                    borderRadius="lg"
                    p={2}
                    spacing={1}
                  >
                    <IconButton
                      icon={<FaExpand />}
                      size="sm"
                      colorScheme="whiteAlpha"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageClick(section);
                      }}
                      aria-label="Expand"
                    />
                    {section.hasVideo && (
                      <IconButton
                        icon={<FaPlay />}
                        size="sm"
                        colorScheme="whiteAlpha"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Abrir video
                          onVideoOpen();
                        }}
                        aria-label="Play video"
                      />
                    )}
                    <IconButton
                      icon={<FaDownload />}
                      size="sm"
                      colorScheme="whiteAlpha"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadImage(section.image, section.title);
                      }}
                      aria-label="Download"
                    />
                    <IconButton
                      icon={<FaComments />}
                      size="sm"
                      colorScheme="whiteAlpha"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCommentOpen();
                      }}
                      aria-label="Comments"
                    />
                  </HStack>

                  {/* Badge de comentarios */}
                  {comments[section.id]?.length > 0 && (
                    <Badge
                      position="absolute"
                      top={4}
                      right={4}
                      colorScheme="green"
                      fontSize="sm"
                    >
                      {comments[section.id].length} comentarios
                    </Badge>
                  )}
                </Box>

                {/* Descripción de la imagen */}
                {section.description && (
                  <Text mt={2} fontSize="sm" color="gray.600">
                    {section.description}
                  </Text>
                )}
              </Box>
            )}

            {/* GIF Animado con Controles */}
            {section.type === 'animation' && (
              <Box>
                <HStack mb={2} justify="space-between">
                  <Text fontWeight="bold">{section.title}</Text>
                  <Badge colorScheme="orange">Animación</Badge>
                </HStack>
                <AnimatedGif
                  src={section.gif || '/api/placeholder/800/400'}
                  controls={true}
                  loop={true}
                  speed={section.speed || 1}
                />
                {section.description && (
                  <Text mt={2} fontSize="sm" color="gray.600">
                    {section.description}
                  </Text>
                )}
              </Box>
            )}

            {/* Diagrama Interactivo */}
            {section.type === 'diagram' && (
              <Box>
                <HStack mb={2} justify="space-between">
                  <Text fontWeight="bold">{section.title}</Text>
                  <Badge colorScheme="green">Diagrama</Badge>
                </HStack>
                <InteractiveDiagram
                  data={section.diagramData}
                  onNodeClick={(node) => {
                    toast({
                      title: node.label,
                      description: node.description || 'Click para más información',
                      status: 'info',
                      duration: 3000
                    });
                  }}
                />
                {section.description && (
                  <Text mt={2} fontSize="sm" color="gray.600">
                    {section.description}
                  </Text>
                )}
              </Box>
            )}

            {/* Carrusel de imágenes */}
            {section.type === 'carousel' && section.images && (
              <Box>
                <HStack mb={2} justify="space-between">
                  <Text fontWeight="bold">{section.title}</Text>
                  <Badge colorScheme="purple">Galería</Badge>
                </HStack>
                <ImageCarousel images={section.images} />
              </Box>
            )}

            {/* Video con controles personalizados */}
            {section.type === 'video' && (
              <Box>
                <HStack mb={2} justify="space-between">
                  <Text fontWeight="bold">{section.title}</Text>
                  <Badge colorScheme="red">Video</Badge>
                </HStack>
                <Box borderRadius="lg" overflow="hidden" boxShadow="lg">
                  <video
                    ref={videoRef}
                    controls
                    style={{ width: '100%', maxHeight: '500px' }}
                  >
                    <source src={section.videoUrl} type="video/mp4" />
                    Tu navegador no soporta videos.
                  </video>
                </Box>
              </Box>
            )}

            {/* Comparación antes/después */}
            {section.type === 'comparison' && (
              <Box>
                <HStack mb={2} justify="space-between">
                  <Text fontWeight="bold">{section.title}</Text>
                  <Badge colorScheme="teal">Comparación</Badge>
                </HStack>
                <Grid templateColumns="1fr 1fr" gap={4}>
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" mb={2}>Antes</Text>
                    <Image
                      src={section.before || '/api/placeholder/400/300'}
                      alt="Before"
                      borderRadius="lg"
                      boxShadow="md"
                    />
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" mb={2}>Después</Text>
                    <Image
                      src={section.after || '/api/placeholder/400/300'}
                      alt="After"
                      borderRadius="lg"
                      boxShadow="md"
                    />
                  </Box>
                </Grid>
              </Box>
            )}
          </Box>
        ))}

        {/* Tabs con contenido adicional */}
        {content?.tabs && (
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList>
              {content.tabs.map((tab, idx) => (
                <Tab key={idx}>{tab.title}</Tab>
              ))}
            </TabList>
            <TabPanels>
              {content.tabs.map((tab, idx) => (
                <TabPanel key={idx}>
                  {tab.content}
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        )}
      </VStack>

      {/* Modal de Imagen Ampliada con Zoom */}
      <Modal isOpen={isImageOpen} onClose={onImageClose} size="6xl">
        <ModalOverlay bg="blackAlpha.900" />
        <ModalContent bg="transparent" boxShadow="none">
          <ModalCloseButton color="white" size="lg" />
          <ModalBody p={0}>
            {selectedImage && (
              <Box position="relative">
                <TransformWrapper
                  initialScale={1}
                  initialPositionX={0}
                  initialPositionY={0}
                >
                  {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                    <>
                      <HStack
                        position="absolute"
                        top={4}
                        left="50%"
                        transform="translateX(-50%)"
                        zIndex={10}
                        bg="blackAlpha.700"
                        borderRadius="full"
                        p={2}
                      >
                        <Button size="sm" onClick={() => zoomIn()}>+</Button>
                        <Button size="sm" onClick={() => zoomOut()}>-</Button>
                        <Button size="sm" onClick={() => resetTransform()}>Reset</Button>
                      </HStack>
                      <TransformComponent>
                        <Image
                          src={selectedImage.image || '/api/placeholder/1200/800'}
                          alt={selectedImage.title}
                          maxH="90vh"
                          mx="auto"
                        />
                      </TransformComponent>
                    </>
                  )}
                </TransformWrapper>

                {/* Anotaciones en modal */}
                {showAnnotations && selectedImage.annotations?.map((annotation, idx) => (
                  <Circle
                    key={idx}
                    position="absolute"
                    top={`${annotation.y}%`}
                    left={`${annotation.x}%`}
                    size="40px"
                    bg="red.500"
                    color="white"
                    fontSize="md"
                    fontWeight="bold"
                    cursor="pointer"
                    zIndex={5}
                  >
                    {idx + 1}
                  </Circle>
                ))}
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Drawer de Comentarios */}
      <Drawer isOpen={isCommentOpen} onClose={onCommentClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Comentarios del Documento</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              {Object.entries(comments).map(([sectionId, sectionComments]) => (
                <Box key={sectionId}>
                  <Text fontWeight="bold" mb={2}>Sección: {sectionId}</Text>
                  {sectionComments.map((comment) => (
                    <Box
                      key={comment.id}
                      p={3}
                      bg="gray.50"
                      borderRadius="md"
                      mb={2}
                    >
                      <HStack justify="space-between" mb={1}>
                        <Text fontWeight="semibold" fontSize="sm">
                          {comment.user}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </Text>
                      </HStack>
                      <Text fontSize="sm">{comment.text}</Text>
                    </Box>
                  ))}
                </Box>
              ))}

              {/* Formulario para nuevo comentario */}
              <Box pt={4} borderTop="1px solid" borderColor="gray.200">
                <FormControl>
                  <FormLabel>Agregar comentario</FormLabel>
                  <Textarea
                    placeholder="Escribe tu comentario..."
                    size="sm"
                    resize="vertical"
                  />
                  <Button mt={2} colorScheme="blue" size="sm">
                    Enviar
                  </Button>
                </FormControl>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Container>
  );
};

export default VisualDocumentation;