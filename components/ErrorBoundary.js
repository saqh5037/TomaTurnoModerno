import React from 'react';
import { Box, Heading, Text, Button, VStack, Alert, AlertIcon } from '@chakra-ui/react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error solo en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error capturado por ErrorBoundary:', error, errorInfo);
    }
    
    // En producción, podrías enviar el error a un servicio de logging
    // como Sentry, LogRocket, etc.
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          minH="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="gray.50"
          p={4}
        >
          <VStack spacing={6} maxW="md" textAlign="center">
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              Ha ocurrido un error inesperado
            </Alert>
            
            <Heading size="lg" color="gray.700">
              ¡Ups! Algo salió mal
            </Heading>
            
            <Text color="gray.600">
              Lo sentimos, ha ocurrido un error. Por favor, intenta recargar la página.
            </Text>
            
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <Box
                p={4}
                bg="red.50"
                borderRadius="md"
                fontSize="sm"
                color="red.700"
                maxW="full"
                overflowX="auto"
              >
                <pre>{this.state.error.toString()}</pre>
              </Box>
            )}
            
            <Button
              colorScheme="blue"
              size="lg"
              onClick={this.handleReset}
            >
              Recargar página
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;