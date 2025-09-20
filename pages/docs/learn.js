import { useState, useEffect } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { modernTheme } from '../../components/theme/ModernTheme';
import LearningPath from '../../components/docs/LearningPath';
import ProtectedRoute from '../../components/ProtectedRoute';

const LearnPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <ChakraProvider theme={modernTheme}>
      <ProtectedRoute>
        <LearningPath
          userRole={user.role || 'flebotomista'}
          userId={user.id}
        />
      </ProtectedRoute>
    </ChakraProvider>
  );
};

export default LearnPage;