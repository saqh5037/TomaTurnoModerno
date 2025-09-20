import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Portal,
  useColorModeValue,
  useOutsideClick,
  Kbd,
  Spinner,
  Card,
  CardBody,
  Avatar,
  Divider,
  Tag,
  TagLabel,
  TagCloseButton,
  useToast
} from '@chakra-ui/react';
import {
  FaSearch,
  FaTimes,
  FaMicrophone,
  FaMicrophoneSlash,
  FaClock,
  FaBook,
  FaVideo,
  FaFileAlt,
  FaQuestionCircle,
  FaCode,
  FaArrowUp,
  FaArrowDown,
  FaCornerDownLeft
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import { searchContent } from '../../lib/docs/content';
import { useAuth } from '../../contexts/AuthContext';

const MotionBox = motion(Box);

const SearchBar = ({
  value = '',
  onChange,
  onSearch,
  placeholder = 'Buscar...',
  size = 'md',
  width = 'full',
  showResults = true,
  maxResults = 8
}) => {
  const { user } = useAuth();
  const toast = useToast();

  // Refs
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const resultsRef = useRef(null);

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isListening, setIsListening] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [popularTags, setPopularTags] = useState([
    'dashboard', 'usuarios', 'estadísticas', 'turnos', 'reportes',
    'cubículo', 'pacientes', 'flebotomista', 'admin'
  ]);

  // Color mode values
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  // Voice recognition setup
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const speechRecognition = new window.webkitSpeechRecognition();
      speechRecognition.continuous = false;
      speechRecognition.interimResults = false;
      speechRecognition.lang = 'es-ES';

      speechRecognition.onstart = () => setIsListening(true);
      speechRecognition.onend = () => setIsListening(false);
      speechRecognition.onerror = () => {
        setIsListening(false);
        toast({
          title: 'Error de reconocimiento de voz',
          description: 'No se pudo procesar el audio',
          status: 'error',
          duration: 3000
        });
      };
      speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleSearch(transcript);
      };

      setRecognition(speechRecognition);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        performSearch(searchTerm);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, user?.role]);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('docs-search-history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }

    const recent = localStorage.getItem('docs-recent-searches');
    if (recent) {
      setRecentSearches(JSON.parse(recent));
    }
  }, []);

  // Save search to history
  const saveSearchToHistory = (query) => {
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('docs-search-history', JSON.stringify(newHistory));

    const newRecent = [query, ...recentSearches.filter(r => r !== query)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('docs-recent-searches', JSON.stringify(newRecent));
  };

  // Perform search
  const performSearch = async (query) => {
    setIsLoading(true);

    try {
      // Use the content search function
      const searchResults = searchContent(query, user?.role);

      // Enhanced search with Fuse.js for better fuzzy matching
      const fuse = new Fuse(searchResults, {
        keys: ['title', 'excerpt', 'tags'],
        threshold: 0.3,
        includeScore: true
      });

      const fuseResults = fuse.search(query).map(result => ({
        ...result.item,
        score: result.score
      }));

      setResults(fuseResults.slice(0, maxResults));
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange?.(newValue);
    setSelectedIndex(-1);

    if (newValue.trim()) {
      setIsOpen(true);
    }
  };

  // Handle search
  const handleSearch = (query = searchTerm) => {
    if (query.trim()) {
      saveSearchToHistory(query);
      onSearch?.(query);
      setSearchTerm(query);
      setIsOpen(false);
      inputRef.current?.blur();

      // Track search event
      trackSearchEvent(query);
    }
  };

  // Track search analytics
  const trackSearchEvent = async (query) => {
    try {
      await fetch('/api/docs/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'search',
          userId: user?.id,
          userRole: user?.role,
          metadata: {
            query,
            resultsCount: results.length,
            timestamp: new Date().toISOString()
          }
        })
      });
    } catch (error) {
      console.error('Failed to track search:', error);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle result click
  const handleResultClick = (result) => {
    // Track click event
    trackResultClick(result);

    // Navigate to result
    if (result.type === 'module') {
      window.location.href = `/docs/${result.id}`;
    } else if (result.moduleId) {
      window.location.href = `/docs/${result.moduleId}#${result.id}`;
    }

    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Track result click
  const trackResultClick = async (result) => {
    try {
      await fetch('/api/docs/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'search_result_click',
          userId: user?.id,
          userRole: user?.role,
          metadata: {
            query: searchTerm,
            resultId: result.id,
            resultType: result.type,
            position: results.indexOf(result)
          }
        })
      });
    } catch (error) {
      console.error('Failed to track result click:', error);
    }
  };

  // Handle voice search
  const handleVoiceSearch = () => {
    if (!recognition) {
      toast({
        title: 'Búsqueda por voz no disponible',
        description: 'Tu navegador no soporta reconocimiento de voz',
        status: 'warning',
        duration: 3000
      });
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  // Handle tag click
  const handleTagClick = (tag) => {
    setSearchTerm(tag);
    handleSearch(tag);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    onChange?.('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Get result icon
  const getResultIcon = (type) => {
    switch (type) {
      case 'module': return FaBook;
      case 'video': return FaVideo;
      case 'faq': return FaQuestionCircle;
      case 'code': return FaCode;
      default: return FaFileAlt;
    }
  };

  // Close dropdown when clicking outside
  useOutsideClick({
    ref: containerRef,
    handler: () => setIsOpen(false)
  });

  return (
    <Box position="relative" width={width} ref={containerRef}>
      {/* Search Input */}
      <InputGroup size={size}>
        <InputLeftElement pointerEvents="none">
          {isLoading ? (
            <Spinner size="sm" color="gray.400" />
          ) : (
            <FaSearch color="gray.400" />
          )}
        </InputLeftElement>

        <Input
          ref={inputRef}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          pr={recognition ? '80px' : '40px'}
          _focus={{
            borderColor: 'blue.400',
            boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)'
          }}
        />

        <InputRightElement width={recognition ? '80px' : '40px'}>
          <HStack spacing={1}>
            {/* Voice search button */}
            {recognition && (
              <IconButton
                size="sm"
                variant="ghost"
                icon={isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
                onClick={handleVoiceSearch}
                colorScheme={isListening ? 'red' : 'gray'}
                aria-label="Búsqueda por voz"
              />
            )}

            {/* Clear button */}
            {searchTerm && (
              <IconButton
                size="sm"
                variant="ghost"
                icon={<FaTimes />}
                onClick={clearSearch}
                aria-label="Limpiar búsqueda"
              />
            )}
          </HStack>
        </InputRightElement>
      </InputGroup>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && showResults && (
          <Portal>
            <MotionBox
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              position="fixed"
              top={`${containerRef.current?.getBoundingClientRect().bottom + 5}px`}
              left={`${containerRef.current?.getBoundingClientRect().left}px`}
              width={`${containerRef.current?.getBoundingClientRect().width}px`}
              zIndex={1500}
              maxH="400px"
              overflowY="auto"
            >
              <Card bg={bg} border="1px" borderColor={borderColor} shadow="xl">
                <CardBody p={0}>
                  <VStack align="stretch" spacing={0}>
                    {/* Search Results */}
                    {results.length > 0 && (
                      <>
                        <Box p={3}>
                          <Text fontSize="sm" fontWeight="bold" color={mutedColor}>
                            Resultados ({results.length})
                          </Text>
                        </Box>

                        {results.map((result, index) => {
                          const Icon = getResultIcon(result.type);
                          return (
                            <Box
                              key={`${result.type}-${result.id}`}
                              p={3}
                              cursor="pointer"
                              bg={selectedIndex === index ? selectedBg : 'transparent'}
                              _hover={{ bg: hoverBg }}
                              onClick={() => handleResultClick(result)}
                            >
                              <HStack spacing={3}>
                                <Avatar size="sm" icon={<Icon />} bg="blue.500" />
                                <VStack align="start" spacing={1} flex={1}>
                                  <HStack>
                                    <Badge size="sm" colorScheme="blue">
                                      {result.type}
                                    </Badge>
                                    <Text fontWeight="bold" fontSize="sm">
                                      {result.title}
                                    </Text>
                                  </HStack>
                                  {result.excerpt && (
                                    <Text fontSize="xs" color={mutedColor} noOfLines={1}>
                                      {result.excerpt}
                                    </Text>
                                  )}
                                </VStack>
                                <Text fontSize="xs" color={mutedColor}>
                                  {Math.round((1 - (result.score || 0)) * 100)}% relevante
                                </Text>
                              </HStack>
                            </Box>
                          );
                        })}
                      </>
                    )}

                    {/* No results */}
                    {searchTerm && results.length === 0 && !isLoading && (
                      <Box p={4} textAlign="center">
                        <Text color={mutedColor}>
                          No se encontraron resultados para &quot;{searchTerm}&quot;
                        </Text>
                      </Box>
                    )}

                    {/* Recent searches */}
                    {!searchTerm && recentSearches.length > 0 && (
                      <>
                        <Box p={3}>
                          <HStack justify="space-between">
                            <Text fontSize="sm" fontWeight="bold" color={mutedColor}>
                              Búsquedas recientes
                            </Text>
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => {
                                setRecentSearches([]);
                                localStorage.removeItem('docs-recent-searches');
                              }}
                            >
                              Limpiar
                            </Button>
                          </HStack>
                        </Box>

                        {recentSearches.map((search, index) => (
                          <Box
                            key={index}
                            p={3}
                            cursor="pointer"
                            _hover={{ bg: hoverBg }}
                            onClick={() => handleSearch(search)}
                          >
                            <HStack>
                              <FaClock color="gray.400" />
                              <Text fontSize="sm">{search}</Text>
                            </HStack>
                          </Box>
                        ))}

                        <Divider />
                      </>
                    )}

                    {/* Popular tags */}
                    {!searchTerm && popularTags.length > 0 && (
                      <Box p={3}>
                        <Text fontSize="sm" fontWeight="bold" color={mutedColor} mb={2}>
                          Etiquetas populares
                        </Text>
                        <HStack wrap="wrap" spacing={1}>
                          {popularTags.map(tag => (
                            <Tag
                              key={tag}
                              size="sm"
                              cursor="pointer"
                              _hover={{ bg: 'blue.100' }}
                              onClick={() => handleTagClick(tag)}
                            >
                              <TagLabel>{tag}</TagLabel>
                            </Tag>
                          ))}
                        </HStack>
                      </Box>
                    )}

                    {/* Keyboard shortcuts hint */}
                    <Box p={3} borderTop="1px" borderColor={borderColor}>
                      <HStack justify="space-between" fontSize="xs" color={mutedColor}>
                        <HStack>
                          <Kbd>↑</Kbd>
                          <Kbd>↓</Kbd>
                          <Text>navegar</Text>
                        </HStack>
                        <HStack>
                          <Kbd>↵</Kbd>
                          <Text>seleccionar</Text>
                        </HStack>
                        <HStack>
                          <Kbd>esc</Kbd>
                          <Text>cerrar</Text>
                        </HStack>
                      </HStack>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </MotionBox>
          </Portal>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default SearchBar;