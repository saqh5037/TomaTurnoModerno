import { AuthProvider } from '../context/AuthContext';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../theme';
import ProtectedRoute from '../components/ProtectedRoute';
import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ChakraProvider theme={theme}>
          <ProtectedRoute>
            <Component {...pageProps} />
          </ProtectedRoute>
        </ChakraProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default MyApp;