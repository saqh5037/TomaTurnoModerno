import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Divider,
  Badge,
  Flex,
  Heading,
  Spinner,
  Center
} from '@chakra-ui/react';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaEdit,
  FaSave,
  FaTimes,
  FaKey,
  FaUserCircle,
  FaShieldAlt,
  FaArrowLeft
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { fadeInUp, slideInFromLeft, GlassCard, ModernContainer } from '../components/theme/ModernTheme';
import { useRouter } from 'next/router';

const ProfilePage = () => {
  const { user, updateActivity } = useAuth();
  const router = useRouter();
  const toast = useToast();

  // Estados del formulario principal
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    email: '',
    phone: ''
  });

  // Estados del cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Estados de UI
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Modal de cambio de contraseña
  const { isOpen: isPasswordModalOpen, onOpen: onPasswordModalOpen, onClose: onPasswordModalClose } = useDisclosure();

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || ''
      });
      setIsLoading(false);
      updateActivity?.();
    }
  }, [user, updateActivity]);

  // Manejar cambios en el formulario de perfil
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambios en el formulario de contraseña
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validar formulario de perfil
  const validateProfileForm = () => {
    if (!profileData.name.trim()) {
      toast({
        title: 'Error de validación',
        description: 'El nombre es obligatorio',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      toast({
        title: 'Error de validación',
        description: 'El formato del email no es válido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    return true;
  };

  // Validar formulario de contraseña
  const validatePasswordForm = () => {
    if (!passwordData.currentPassword) {
      toast({
        title: 'Error de validación',
        description: 'La contraseña actual es obligatoria',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (passwordData.newPassword.length < 3) {
      toast({
        title: 'Error de validación',
        description: 'La nueva contraseña debe tener al menos 3 caracteres',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error de validación',
        description: 'Las contraseñas no coinciden',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    return true;
  };

  // Guardar cambios del perfil
  const handleSaveProfile = async () => {
    if (!validateProfileForm()) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone
          // username NO se incluye porque no se puede editar
        })
      });

      const data = await response.json();

      if (data.success) {
        // Actualizar datos en localStorage
        const currentUserData = JSON.parse(localStorage.getItem('userData') || '{}');
        const updatedUserData = { ...currentUserData, ...data.user };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));

        toast({
          title: 'Perfil actualizado',
          description: 'Tus datos han sido actualizados correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        setIsEditingProfile(false);
      } else {
        throw new Error(data.error || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el perfil',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Cambiar contraseña
  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Contraseña actualizada',
          description: 'Tu contraseña ha sido cambiada correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Limpiar formulario y cerrar modal
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        onPasswordModalClose();
      } else {
        throw new Error(data.error || 'Error al cambiar la contraseña');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo cambiar la contraseña',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setProfileData({
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || ''
    });
    setIsEditingProfile(false);
  };

  if (isLoading) {
    return (
      <ModernContainer>
          <Center minH="100vh">
            <GlassCard p={8}>
              <VStack spacing={4}>
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="blue.500"
                  size="xl"
                />
                <Text fontSize="lg" color="gray.600">
                  Cargando perfil...
                </Text>
              </VStack>
            </GlassCard>
          </Center>
        </ModernContainer>
    );
  }

  if (!user) {
    return (
      <ModernContainer>
          <Center minH="100vh">
            <GlassCard p={8}>
              <VStack spacing={4}>
                <Text fontSize="xl" color="red.500">
                  No autorizado
                </Text>
                <Button onClick={() => router.push('/login')}>
                  Ir al Login
                </Button>
              </VStack>
            </GlassCard>
          </Center>
        </ModernContainer>
    );
  }

  return (
    <ModernContainer>
        <VStack spacing={8} align="stretch">
          {/* Header Principal */}
          <Box
            p={6}
            background="rgba(255, 255, 255, 0.25)"
            backdropFilter="blur(20px)"
            borderRadius="2xl"
            boxShadow="glass"
            border="1px solid rgba(255, 255, 255, 0.18)"
            animation={`${fadeInUp} 0.8s ease-out`}
          >
            <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
              <HStack spacing={4}>
                <Button
                  leftIcon={<FaArrowLeft />}
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/')}
                  _hover={{
                    transform: 'translateY(-1px)',
                    boxShadow: 'md'
                  }}
                >
                  Volver
                </Button>
                <Box
                  w={16}
                  h={16}
                  borderRadius="2xl"
                  background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  fontSize="2xl"
                >
                  <FaUserCircle />
                </Box>
                <VStack align="start" spacing={1}>
                  <Heading size="lg" color="secondary.800">
                    Mi Perfil
                  </Heading>
                  <Text color="secondary.600" fontSize="md">
                    Administra tu información personal
                  </Text>
                </VStack>
              </HStack>
              <HStack spacing={3}>
                <Badge
                  colorScheme={user.role === 'admin' ? 'purple' : 'blue'}
                  variant="subtle"
                  fontSize="sm"
                  px={3}
                  py={1}
                  borderRadius="full"
                >
                  <HStack spacing={1}>
                    <FaShieldAlt />
                    <Text>{user.role === 'admin' ? 'Administrador' : 'Flebotomista'}</Text>
                  </HStack>
                </Badge>
                <Button
                  leftIcon={<FaKey />}
                  colorScheme="orange"
                  variant="outline"
                  size="sm"
                  onClick={onPasswordModalOpen}
                >
                  Cambiar Contraseña
                </Button>
              </HStack>
            </Flex>
          </Box>

          {/* Información del Perfil */}
          <GlassCard p={8} animation={`${slideInFromLeft} 1s ease-out`}>
            <VStack spacing={6} align="stretch">
              <Flex justify="space-between" align="center">
                <Heading size="md" color="secondary.800">
                  Información Personal
                </Heading>
                {!isEditingProfile ? (
                  <Button
                    leftIcon={<FaEdit />}
                    colorScheme="blue"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    Editar
                  </Button>
                ) : (
                  <HStack spacing={2}>
                    <Button
                      leftIcon={<FaSave />}
                      colorScheme="green"
                      size="sm"
                      onClick={handleSaveProfile}
                      isLoading={isSaving}
                      loadingText="Guardando..."
                    >
                      Guardar
                    </Button>
                    <Button
                      leftIcon={<FaTimes />}
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      Cancelar
                    </Button>
                  </HStack>
                )}
              </Flex>

              <Divider />

              <VStack spacing={4} align="stretch">
                {/* Nombre completo */}
                <FormControl>
                  <FormLabel color="secondary.700" fontSize="sm" fontWeight="medium">
                    <HStack spacing={2}>
                      <FaUser />
                      <Text>Nombre Completo</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    isReadOnly={!isEditingProfile}
                    bg={isEditingProfile ? "white" : "gray.50"}
                    border="1px solid"
                    borderColor={isEditingProfile ? "blue.300" : "gray.300"}
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 1px rgba(79, 125, 243, 0.3)"
                    }}
                  />
                </FormControl>

                {/* Nombre de usuario */}
                <FormControl>
                  <FormLabel color="secondary.700" fontSize="sm" fontWeight="medium">
                    <HStack spacing={2}>
                      <FaUserCircle />
                      <Text>Nombre de Usuario</Text>
                      <Badge colorScheme="gray" fontSize="xs">Solo lectura</Badge>
                    </HStack>
                  </FormLabel>
                  <Input
                    name="username"
                    value={profileData.username}
                    isReadOnly={true}
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.300"
                    cursor="not-allowed"
                    opacity={0.7}
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    El nombre de usuario no puede ser modificado por razones de seguridad
                  </Text>
                </FormControl>

                {/* Email */}
                <FormControl>
                  <FormLabel color="secondary.700" fontSize="sm" fontWeight="medium">
                    <HStack spacing={2}>
                      <FaEnvelope />
                      <Text>Correo Electrónico</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    isReadOnly={!isEditingProfile}
                    bg={isEditingProfile ? "white" : "gray.50"}
                    border="1px solid"
                    borderColor={isEditingProfile ? "blue.300" : "gray.300"}
                    placeholder="correo@ejemplo.com"
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 1px rgba(79, 125, 243, 0.3)"
                    }}
                  />
                </FormControl>

                {/* Teléfono */}
                <FormControl>
                  <FormLabel color="secondary.700" fontSize="sm" fontWeight="medium">
                    <HStack spacing={2}>
                      <FaPhone />
                      <Text>Teléfono</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    name="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    isReadOnly={!isEditingProfile}
                    bg={isEditingProfile ? "white" : "gray.50"}
                    border="1px solid"
                    borderColor={isEditingProfile ? "blue.300" : "gray.300"}
                    placeholder="+52 55 1234 5678"
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 1px rgba(79, 125, 243, 0.3)"
                    }}
                  />
                </FormControl>
              </VStack>

              {isEditingProfile && (
                <Alert status="info" borderRadius="lg">
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontSize="sm">Información importante</AlertTitle>
                    <AlertDescription fontSize="xs">
                      Los cambios se aplicarán inmediatamente al guardar. Asegúrate de que toda la información sea correcta.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
            </VStack>
          </GlassCard>

          {/* Modal de Cambio de Contraseña */}
          <Modal isOpen={isPasswordModalOpen} onClose={onPasswordModalClose} size="md">
            <ModalOverlay backdropFilter="blur(10px)" />
            <ModalContent borderRadius="2xl" border="1px solid rgba(255, 255, 255, 0.18)">
              <ModalHeader>
                <HStack spacing={3}>
                  <Box
                    w={10}
                    h={10}
                    borderRadius="xl"
                    background="linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                  >
                    <FaLock />
                  </Box>
                  <Text>Cambiar Contraseña</Text>
                </HStack>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4}>
                  {/* Contraseña actual */}
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">
                      Contraseña Actual
                    </FormLabel>
                    <InputGroup>
                      <Input
                        name="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Ingresa tu contraseña actual"
                      />
                      <InputRightElement>
                        <IconButton
                          variant="ghost"
                          icon={showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          size="sm"
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  {/* Nueva contraseña */}
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">
                      Nueva Contraseña
                    </FormLabel>
                    <InputGroup>
                      <Input
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Ingresa tu nueva contraseña"
                      />
                      <InputRightElement>
                        <IconButton
                          variant="ghost"
                          icon={showNewPassword ? <FaEyeSlash /> : <FaEye />}
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          size="sm"
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  {/* Confirmar contraseña */}
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">
                      Confirmar Nueva Contraseña
                    </FormLabel>
                    <InputGroup>
                      <Input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirma tu nueva contraseña"
                      />
                      <InputRightElement>
                        <IconButton
                          variant="ghost"
                          icon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          size="sm"
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Alert status="warning" borderRadius="lg">
                    <AlertIcon />
                    <Box>
                      <AlertTitle fontSize="sm">Importante</AlertTitle>
                      <AlertDescription fontSize="xs">
                        Asegúrate de recordar tu nueva contraseña. No podrás recuperarla sin ayuda del administrador.
                      </AlertDescription>
                    </Box>
                  </Alert>
                </VStack>
              </ModalBody>

              <ModalFooter>
                <HStack spacing={3}>
                  <Button variant="outline" onClick={onPasswordModalClose}>
                    Cancelar
                  </Button>
                  <Button
                    colorScheme="orange"
                    onClick={handleChangePassword}
                    isLoading={isSaving}
                    loadingText="Cambiando..."
                  >
                    Cambiar Contraseña
                  </Button>
                </HStack>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </VStack>
      </ModernContainer>
  );
};

export default ProfilePage;