import { AuthProvider } from '../context/AuthContext';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../theme';
import ProtectedRoute from '../components/ProtectedRoute';
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <ChakraProvider theme={theme}>
        <ProtectedRoute>
          <Component {...pageProps} />
        </ProtectedRoute>
      </ChakraProvider>
    </AuthProvider>
  );
}

export default MyApp;