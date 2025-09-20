import { AuthProvider } from '../contexts/AuthContext';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../theme';
import ProtectedRoute from '../components/ProtectedRoute';
import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <ChakraProvider theme={theme}>
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