import { useEffect, useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  Select,
  SimpleGrid,
  Spinner,
  Switch,
  Text,
  VStack,
  useToast
} from '@chakra-ui/react';
import { buildSettingsPayload } from '../../lib/surveyReportUi';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

const toForm = (cfg) => ({
  enabled: cfg.enabled === true,
  mode: cfg.mode || 'iframe',
  windowMax: String(cfg.windowMax ?? 5),
  maxRefusalsPerDay: String(cfg.maxRefusalsPerDay ?? 3),
  url: cfg.url || ''
});

/**
 * "Encuesta obligatoria" settings. Supervisors can view; only admins can save
 * (the API enforces it too).
 */
export default function SurveySettingsModal({ isOpen, onClose, canEdit }) {
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setFormError(null);
    fetch('/api/admin/survey-config', { headers: authHeaders() })
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) throw new Error(json?.error || `Error ${res.status}`);
        if (!cancelled) setForm(toForm(json.data));
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || 'No se pudo cargar la configuración.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const handleSave = async () => {
    const { error, payload } = buildSettingsPayload(form);
    setFormError(error);
    if (error) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/survey-config', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(json?.error || `Error ${res.status}`);
      setForm(toForm(json.data));
      toast({
        title: 'Configuración guardada',
        description: json.data.enabled ? 'La encuesta obligatoria está activa.' : 'La encuesta obligatoria está desactivada.',
        status: 'success',
        duration: 4000,
        isClosable: true
      });
      onClose();
    } catch (err) {
      toast({
        title: 'No se pudo guardar',
        description: err.message,
        status: 'error',
        duration: 6000,
        isClosable: true
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Encuesta obligatoria</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading && (
            <HStack justify="center" py={8}>
              <Spinner />
              <Text color="gray.600">Cargando configuración...</Text>
            </HStack>
          )}
          {loadError && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <AlertDescription>{loadError}</AlertDescription>
            </Alert>
          )}
          {form && !loading && (
            <VStack align="stretch" spacing={4}>
              <Alert status="warning" borderRadius="md" alignItems="flex-start">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  Activa la encuesta solo después de validar que REDCap carga dentro de Toma-Turno en el INER (Fase 0).
                </AlertDescription>
              </Alert>
              {!canEdit && (
                <Text fontSize="sm" color="gray.600">
                  Solo un administrador puede modificar esta configuración.
                </Text>
              )}

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel htmlFor="survey-enabled" mb={0} fontWeight="semibold">
                  Encuesta obligatoria activa
                </FormLabel>
                <Switch
                  id="survey-enabled"
                  colorScheme="green"
                  isChecked={form.enabled}
                  onChange={(e) => set({ enabled: e.target.checked })}
                  isDisabled={!canEdit}
                />
              </FormControl>

              <FormControl isDisabled={!canEdit}>
                <FormLabel>Modo</FormLabel>
                <Select value={form.mode} onChange={(e) => set({ mode: e.target.value })}>
                  <option value="iframe">Dentro de Toma-Turno (iframe)</option>
                  <option value="qr">Código QR en el dispositivo del paciente</option>
                </Select>
              </FormControl>

              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                <FormControl isDisabled={!canEdit}>
                  <FormLabel>Ventana de llamados (1 a 20)</FormLabel>
                  <NumberInput min={1} max={20} value={form.windowMax} onChange={(v) => set({ windowMax: v })}>
                    <NumberInputField />
                  </NumberInput>
                  <FormHelperText>La encuesta cae en uno de los primeros N llamados del día.</FormHelperText>
                </FormControl>
                <FormControl isDisabled={!canEdit}>
                  <FormLabel>Negativas máximas por día (0 a 10)</FormLabel>
                  <NumberInput
                    min={0}
                    max={10}
                    value={form.maxRefusalsPerDay}
                    onChange={(v) => set({ maxRefusalsPerDay: v })}
                  >
                    <NumberInputField />
                  </NumberInput>
                  <FormHelperText>Después de este número ya no se vuelve a solicitar ese día.</FormHelperText>
                </FormControl>
              </SimpleGrid>

              <FormControl isDisabled={!canEdit}>
                <FormLabel>URL de la encuesta (https)</FormLabel>
                <Input value={form.url} onChange={(e) => set({ url: e.target.value })} placeholder="https://" />
              </FormControl>

              {formError && (
                <Text fontSize="sm" color="red.600" role="alert">
                  {formError}
                </Text>
              )}
            </VStack>
          )}
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose}>
            {canEdit ? 'Cancelar' : 'Cerrar'}
          </Button>
          {canEdit && (
            <Button colorScheme="blue" onClick={handleSave} isLoading={saving} isDisabled={!form || loading}>
              Guardar
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
