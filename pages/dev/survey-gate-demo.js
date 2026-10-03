import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Badge, Box, Button, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { FaClipboardList } from 'react-icons/fa';
import SurveyGateModal from '../../components/survey/SurveyGateModal';

// Dev-only harness: renders the survey badge and modal with mock data and a stubbed fetch.
// ?mode=iframe|qr   survey mode (default iframe)
// ?open=1           open the modal on load
// ?frame=1|2        internal: fake survey page used as iframe content (2 = "submitted")
export async function getServerSideProps() {
  if (process.env.NODE_ENV === 'production') return { notFound: true };
  return { props: {} };
}

const TURN = { id: 9001, patientName: 'María Fernanda López García', assignedTurn: 42 };

function FakeSurveyFrame({ step }) {
  return (
    <Box p={8} bg="gray.50" minH="100vh">
      {step === '2' ? (
        <Heading size="md">Gracias, tu respuesta fue registrada.</Heading>
      ) : (
        <VStack align="start" spacing={4}>
          <Heading size="md">Encuesta de satisfacción (simulada)</Heading>
          <Text>¿Cómo calificas la atención recibida?</Text>
          <Button as="a" href="/dev/survey-gate-demo?frame=2" colorScheme="blue">Enviar</Button>
        </VStack>
      )}
    </Box>
  );
}

export default function SurveyGateDemo() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [log, setLog] = useState([]);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.open === '1') setIsOpen(true);
    // Stub the resolve endpoint so no backend is needed
    const realFetch = window.fetch;
    window.fetch = (url, opts) => {
      if (String(url).includes('/api/surveys/resolve')) {
        setLog(prev => [...prev, opts?.body]);
        return Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 }));
      }
      return realFetch(url, opts);
    };
    return () => { window.fetch = realFetch; };
  }, [router.isReady, router.query.open]);

  if (!router.isReady) return null;
  if (router.query.frame) return <FakeSurveyFrame step={router.query.frame} />;

  const mode = router.query.mode === 'qr' ? 'qr' : 'iframe';
  const config = {
    mode,
    url: mode === 'qr' ? 'https://redcap.example.org/surveys/?s=DEMO1234' : '/dev/survey-gate-demo?frame=1',
  };

  return (
    <Box p={8}>
      <Heading size="md" mb={4}>Survey gate demo ({mode})</Heading>
      <Box textAlign="center" p={6} borderWidth="1px" borderRadius="lg" maxW="lg">
        <Text fontSize="3xl" fontWeight="semibold">{TURN.patientName}</Text>
        <Badge bg="yellow.300" color="gray.900" fontSize="sm" px={3} py={1} mt={2} borderRadius="md">
          <HStack spacing={1}>
            <FaClipboardList aria-hidden="true" />
            <span>Encuesta requerida</span>
          </HStack>
        </Badge>
      </Box>
      <HStack mt={4}>
        <Button onClick={() => setIsOpen(true)}>Abrir modal</Button>
      </HStack>
      {log.length > 0 && <Text mt={4} fontFamily="mono" fontSize="sm">resolve: {log.join(' | ')}</Text>}
      <SurveyGateModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        turn={TURN}
        config={config}
        onResolved={() => setIsOpen(false)}
      />
    </Box>
  );
}
