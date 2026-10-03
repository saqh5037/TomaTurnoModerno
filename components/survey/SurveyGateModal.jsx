import { useState, useEffect, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Box,
  Button,
  Checkbox,
  Alert,
  AlertIcon,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Textarea,
  Text,
  HStack,
  VStack,
  Link,
  useToast,
} from '@chakra-ui/react';
import QRCode from 'react-qr-code';
import { canConfirmSurvey, isValidRefusalReason } from '../../lib/surveyUi';

const INSTRUCTIONS = {
  iframe: 'Gira la pantalla hacia el paciente para que conteste la encuesta. Al terminar, presiona "Encuesta terminada".',
  qr: 'Pide al paciente escanear el código con su teléfono y contestar la encuesta. Después confirma que la contestó.',
};

export default function SurveyGateModal({ isOpen, onClose, turn, config, onResolved }) {
  const toast = useToast();
  const [mode, setMode] = useState(config?.mode === 'qr' ? 'qr' : 'iframe');
  const [loads, setLoads] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [refusing, setRefusing] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const loadsRef = useRef(0);

  // Reset local state each time the modal opens for a (possibly different) turn
  useEffect(() => {
    if (isOpen) {
      setMode(config?.mode === 'qr' ? 'qr' : 'iframe');
      setLoads(0);
      loadsRef.current = 0;
      setConfirmed(false);
      setRefusing(false);
      setReason('');
      setError('');
      setSubmitting(false);
    }
  }, [isOpen, turn?.id, config?.mode]);

  const url = config?.url || '';
  const canFinish = canConfirmSurvey({ mode, loads, confirmed });
  const reasonValid = isValidRefusalReason(reason);

  const handleIframeLoad = () => {
    loadsRef.current += 1;
    setLoads(loadsRef.current);
  };

  const resolve = async (outcome) => {
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const body = { turnId: turn.id, outcome };
      if (outcome === 'REFUSED') body.reason = reason.trim();
      else if (mode === 'iframe') body.iframeLoads = loads;

      const response = await fetch('/api/surveys/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok || data.code === 'SURVEY_NOT_PENDING') {
        toast({
          title: outcome === 'COMPLETED' ? 'Encuesta registrada' : 'Negativa registrada',
          status: 'success',
          duration: 2500,
          position: 'top',
        });
        onResolved(outcome);
        return;
      }
      setError(data.error || 'No se pudo registrar la encuesta. Intenta nuevamente.');
    } catch (e) {
      setError('No se pudo conectar con el servidor. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="6xl"
      scrollBehavior="inside"
      closeOnOverlayClick={false}
      closeOnEsc={!submitting}
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader borderTopRadius="md" borderTop="4px solid" borderColor="yellow.400">
          <Text fontSize="xl">Encuesta de satisfacción</Text>
          <Text fontSize="md" fontWeight="normal" color="gray.600">
            {turn?.patientName}
            {turn?.assignedTurn != null && ` · Turno #${turn.assignedTurn}`}
          </Text>
          <Text fontSize="sm" fontWeight="normal" color="gray.500" mt={1}>
            {INSTRUCTIONS[mode]}
          </Text>
        </ModalHeader>
        <ModalCloseButton isDisabled={submitting} aria-label="Cerrar y mantener al paciente en atención" />

        <ModalBody>
          {error && (
            <Alert status="error" mb={3} borderRadius="md" role="alert">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {/* Kept mounted (hidden) while refusing so going back does not reload the iframe and fake a load */}
          {mode === 'iframe' && (
            <VStack align="stretch" spacing={2} display={refusing ? 'none' : 'flex'}>
              <Box h="62vh" borderWidth="1px" borderRadius="md" overflow="hidden">
                <iframe
                  src={url}
                  title="Encuesta de satisfacción del paciente"
                  onLoad={handleIframeLoad}
                  style={{ width: '100%', height: '100%', border: 0 }}
                />
              </Box>
              <Link
                as="button"
                type="button"
                fontSize="sm"
                color="blue.600"
                alignSelf="flex-start"
                onClick={() => setMode('qr')}
              >
                ¿No carga? Usar código QR
              </Link>
            </VStack>
          )}

          {!refusing && mode === 'qr' && (
            <VStack spacing={5} py={4}>
              <Box p={4} bg="white" borderWidth="1px" borderRadius="md" role="img" aria-label="Código QR de la encuesta">
                <QRCode value={url || ' '} size={280} />
              </Box>
              <Checkbox
                size="lg"
                isChecked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              >
                Confirmo que el paciente contestó la encuesta
              </Checkbox>
            </VStack>
          )}

          {refusing && (
            <FormControl isRequired isInvalid={reason.length > 0 && !reasonValid} py={2}>
              <FormLabel>Motivo por el que el paciente no quiso contestar</FormLabel>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej. Paciente con prisa, indispuesto, no desea participar"
                rows={4}
                autoFocus
              />
              <FormErrorMessage>Escribe al menos 3 caracteres.</FormErrorMessage>
            </FormControl>
          )}
        </ModalBody>

        <ModalFooter flexDirection="column" alignItems="stretch" gap={2}>
          {!refusing ? (
            <HStack justify="space-between" flexWrap="wrap" gap={2}>
              <Button
                variant="outline"
                colorScheme="red"
                onClick={() => setRefusing(true)}
                isDisabled={submitting}
              >
                El paciente no quiso contestar
              </Button>
              <HStack spacing={3}>
                <Button variant="ghost" onClick={onClose} isDisabled={submitting}>
                  Cancelar
                </Button>
                <Button
                  colorScheme="green"
                  onClick={() => resolve('COMPLETED')}
                  isDisabled={!canFinish}
                  isLoading={submitting}
                >
                  Encuesta terminada
                </Button>
              </HStack>
            </HStack>
          ) : (
            <HStack justify="flex-end" spacing={3}>
              <Button variant="ghost" onClick={() => setRefusing(false)} isDisabled={submitting}>
                Volver a la encuesta
              </Button>
              <Button
                colorScheme="red"
                onClick={() => resolve('REFUSED')}
                isDisabled={!reasonValid}
                isLoading={submitting}
              >
                Confirmar negativa
              </Button>
            </HStack>
          )}
          {!refusing && mode === 'iframe' && !canFinish && (
            <Text fontSize="xs" color="gray.500" textAlign="right">
              Se habilita cuando el paciente envía la encuesta.
            </Text>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
