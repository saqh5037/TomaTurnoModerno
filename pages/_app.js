import { AuthProvider } from '../contexts/AuthContext';
import { ChakraProvider } from '@chakra-ui/react';
import { modernTheme } from '../components/theme/ModernTheme';
import ProtectedRoute from '../components/ProtectedRoute';
import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/globals.css';
// Import centralized Chart.js configuration (registers all Chart.js components once)
import '../lib/chartConfig';

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <ChakraProvider theme={modernTheme}>
        <AuthProvider>
          <ProtectedRoute>
            <Component {...pageProps} />
          </ProtectedRoute>
        </AuthProvider>
      </ChakraProvider>
    </ErrorBoundary>
  );
}

export default MyApp;