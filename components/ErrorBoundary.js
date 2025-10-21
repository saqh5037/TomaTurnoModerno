import React from 'react';
import { Box, Heading, Text, Button, VStack, Code } from '@chakra-ui/react';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Error caught:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);

    // En producción, enviar a servicio de logging (Sentry, LogRocket, etc.)

    this.setState(prevState => ({
      error: error,
      errorInfo: errorInfo,
      errorCount: prevState.errorCount + 1
    }));
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <Box
          minH="100vh"
          bg="linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 50%, #EDE9FE 100%)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
        >
          <Box
            maxW="600px"
            w="100%"
            bg="white"
            borderRadius="2xl"
            boxShadow="2xl"
            p={8}
          >
            <VStack spacing={6} align="stretch">
              {/* Error Icon */}
              <Box textAlign="center">
                <Box
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  w={20}
                  h={20}
                  borderRadius="full"
                  bg="red.100"
                  color="red.600"
                  fontSize="4xl"
                >
                  <FaExclamationTriangle />
                </Box>
              </Box>

              {/* Error Title */}
              <VStack spacing={2}>
                <Heading size="lg" color="gray.800" textAlign="center">
                  ¡Ups! Algo salió mal
                </Heading>
                <Text color="gray.600" textAlign="center">
                  Ha ocurrido un error inesperado en la aplicación
                </Text>
              </VStack>

              {/* Error Count Badge */}
              {this.state.errorCount > 1 && (
                <Box
                  bg="orange.100"
                  border="1px solid"
                  borderColor="orange.300"
                  borderRadius="md"
                  p={3}
                  textAlign="center"
                >
                  <Text color="orange.800" fontSize="sm" fontWeight="medium">
                    Se han detectado {this.state.errorCount} errores consecutivos
                  </Text>
                </Box>
              )}

              {/* Error Details (Development Only) */}
              {isDevelopment && this.state.error && (
                <Box
                  bg="gray.50"
                  borderRadius="md"
                  p={4}
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>
                    Detalles del error:
                  </Text>
                  <Code
                    display="block"
                    whiteSpace="pre-wrap"
                    p={3}
                    fontSize="xs"
                    bg="red.50"
                    color="red.900"
                    borderRadius="md"
                    maxH="200px"
                    overflowY="auto"
                  >
                    {this.state.error.toString()}
                    {this.state.errorInfo && (
                      <>
                        {'\n\n'}
                        {this.state.errorInfo.componentStack}
                      </>
                    )}
                  </Code>
                </Box>
              )}

              {/* User Actions */}
              <VStack spacing={3}>
                <Button
                  colorScheme="blue"
                  size="lg"
                  width="100%"
                  onClick={this.handleReset}
                >
                  Intentar de nuevo
                </Button>
                <Button
                  leftIcon={<FaHome />}
                  variant="outline"
                  size="lg"
                  width="100%"
                  onClick={this.handleGoHome}
                >
                  Ir al inicio
                </Button>
              </VStack>

              {/* Help Text */}
              <Box
                bg="blue.50"
                borderRadius="md"
                p={4}
                border="1px solid"
                borderColor="blue.200"
              >
                <Text fontSize="sm" color="blue.800">
                  <strong>Qué puedes hacer:</strong>
                </Text>
                <Box as="ul" pl={5} mt={2} fontSize="sm" color="blue.700">
                  <li>Recargar la página (F5)</li>
                  <li>Regresar al inicio y volver a intentar</li>
                  <li>Si el problema persiste, contacta al soporte técnico</li>
                </Box>
              </Box>
            </VStack>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;