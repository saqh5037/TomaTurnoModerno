import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { 
  Box, 
  Heading, 
  VStack, 
  HStack,
  Text, 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  Select, 
  useToast,
  SimpleGrid,
  Badge,
  Avatar,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  IconButton,
  Flex,
  Spacer,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Skeleton,
  InputGroup,
  InputLeftElement,
  Spinner,
  Divider,
  Tooltip,
  ChakraProvider,
  Progress
} from '@chakra-ui/react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaEye,
  FaEnvelope,
  FaPhone,
  FaArrowLeft,
  FaUsers,
  FaUserMd,
  FaUserTie,
  FaUserCheck,
  FaUserTimes
} from 'react-icons/fa';
import { ArrowBackIcon, AddIcon, EditIcon, EmailIcon, PhoneIcon } from '@chakra-ui/icons';
import { modernTheme, fadeInUp, slideInFromLeft, slideInFromRight, GlassCard, ModernContainer, ModernHeader } from '../../components/theme/ModernTheme';

const UserManagement = memo(function UserManagement() {
  // Estados principales
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('active'); // Por defecto mostrar solo activos
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: '',
    email: '',
    phone: ''
  });
  const [editingUserId, setEditingUserId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Estados de UI
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const [userToDelete, setUserToDelete] = useState(null);
  const cancelRef = React.useRef();
  
  const toast = useToast();

  // Effect para marcar el componente como montado
  useEffect(() => {
    setMounted(true);
  }, []);

  // Simulación de datos para el prototipo - Optimizada con useCallback
  const loadInitialData = useCallback(() => {
    setTimeout(() => {
      setUsers([
        {
          id: 1,
          username: 'maria.garcia',
          name: 'María García López',
          role: 'Flebotomista',
          email: 'maria.garcia@tomaturno.com',
          phone: '+52 999 123 4567',
          status: 'active',
          lastLogin: '2024-08-06T10:30:00Z',
          createdAt: '2024-01-15T08:00:00Z'
        },
        {
          id: 2,
          username: 'carlos.admin',
          name: 'Carlos Rodríguez Hernández',
          role: 'Administrador',
          email: 'carlos.rodriguez@tomaturno.com',
          phone: '+52 999 987 6543',
          status: 'active',
          lastLogin: '2024-08-06T09:15:00Z',
          createdAt: '2024-01-10T08:00:00Z'
        },
        {
          id: 3,
          username: 'ana.lopez',
          name: 'Ana López Martínez',
          role: 'Flebotomista',
          email: 'ana.lopez@tomaturno.com',
          phone: '+52 999 456 7890',
          status: 'inactive',
          lastLogin: '2024-08-05T16:45:00Z',
          createdAt: '2024-02-01T08:00:00Z'
        },
        {
          id: 4,
          username: 'luis.martinez',
          name: 'Luis Martínez González',
          role: 'Flebotomista',
          email: 'luis.martinez@tomaturno.com',
          phone: '+52 999 321 6547',
          status: 'active',
          lastLogin: '2024-08-06T08:45:00Z',
          createdAt: '2024-03-10T08:00:00Z'
        },
        {
          id: 5,
          username: 'sofia.hernandez',
          name: 'Sofía Hernández Pérez',
          role: 'Administrador',
          email: 'sofia.hernandez@tomaturno.com',
          phone: '+52 999 654 9873',
          status: 'inactive',
          lastLogin: '2024-08-01T14:20:00Z',
          createdAt: '2024-02-20T08:00:00Z'
        },
        {
          id: 6,
          username: 'ricardo.flores',
          name: 'Ricardo Flores Jiménez',
          role: 'Flebotomista',
          email: 'ricardo.flores@tomaturno.com',
          phone: '+52 999 147 2583',
          status: 'active',
          lastLogin: '2024-08-06T11:15:00Z',
          createdAt: '2024-04-05T08:00:00Z'
        },
        {
          id: 7,
          username: 'patricia.morales',
          name: 'Patricia Morales Vega',
          role: 'Flebotomista',
          email: 'patricia.morales@tomaturno.com',
          phone: '+52 999 963 7410',
          status: 'inactive',
          lastLogin: '2024-07-28T16:30:00Z',
          createdAt: '2024-01-25T08:00:00Z'
        },
        {
          id: 8,
          username: 'alejandro.ruiz',
          name: 'Alejandro Ruiz Castro',
          role: 'Administrador',
          email: 'alejandro.ruiz@tomaturno.com',
          phone: '+52 999 852 3697',
          status: 'active',
          lastLogin: '2024-08-06T09:50:00Z',
          createdAt: '2024-03-15T08:00:00Z'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadInitialData();
    }
  }, [mounted, loadInitialData]);

  // Función para obtener usuarios
  const fetchUsers = async () => {
    try {
      setLoading(true);
      // En producción, reemplazar con la llamada real a la API
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
      toast({
        title: 'Error de conexión',
        description: 'No se pudieron cargar los usuarios. Intenta nuevamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para crear/actualizar usuario
  const handleSubmitUser = async () => {
    // Validaciones
    if (!formData.username || !formData.name || !formData.role) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa todos los campos obligatorios.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    if (!editingUserId && !formData.password) {
      toast({
        title: 'Contraseña requerida',
        description: 'La contraseña es obligatoria para nuevos usuarios.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    setFormLoading(true);

    try {
      const method = editingUserId ? 'PUT' : 'POST';
      const url = editingUserId ? `/api/users/${editingUserId}` : '/api/users';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const userData = await response.json();
        
        if (editingUserId) {
          setUsers(users.map(user => 
            user.id === editingUserId ? { ...user, ...userData } : user
          ));
          toast({
            title: 'Usuario actualizado',
            description: `${formData.name} ha sido actualizado correctamente.`,
            status: 'success',
            duration: 4000,
            isClosable: true,
            position: 'top-right'
          });
        } else {
          // Para el prototipo, simulamos la creación
          const newUser = {
            id: Date.now(),
            ...formData,
            status: 'active',
            createdAt: new Date().toISOString(),
            lastLogin: null
          };
          setUsers([...users, newUser]);
          toast({
            title: 'Usuario creado',
            description: `${formData.name} ha sido agregado al sistema.`,
            status: 'success',
            duration: 4000,
            isClosable: true,
            position: 'top-right'
          });
        }
        
        handleCloseForm();
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
      toast({
        title: 'Error al guardar',
        description: 'No se pudo guardar el usuario. Intenta nuevamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Función para eliminar usuario
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, { 
        method: 'DELETE' 
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userToDelete.id));
        toast({
          title: 'Usuario eliminado',
          description: `${userToDelete.name} ha sido eliminado del sistema.`,
          status: 'info',
          duration: 4000,
          isClosable: true,
          position: 'top-right'
        });
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      toast({
        title: 'Error al eliminar',
        description: 'No se pudo eliminar el usuario. Intenta nuevamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setUserToDelete(null);
      onAlertClose();
    }
  };

  // Funciones auxiliares - Optimizadas con useCallback
  const openForm = useCallback((user = null) => {
    if (user) {
      setFormData({
        username: user.username,
        password: '',
        name: user.name,
        role: user.role,
        email: user.email || '',
        phone: user.phone || ''
      });
      setEditingUserId(user.id);
    } else {
      setFormData({
        username: '',
        password: '',
        name: '',
        role: '',
        email: '',
        phone: ''
      });
      setEditingUserId(null);
    }
    onDrawerOpen();
  }, [onDrawerOpen]);

  const handleCloseForm = useCallback(() => {
    setFormData({
      username: '',
      password: '',
      name: '',
      role: '',
      email: '',
      phone: ''
    });
    setEditingUserId(null);
    onDrawerClose();
  }, [onDrawerClose]);

  const confirmDelete = useCallback((user) => {
    setUserToDelete(user);
    onAlertOpen();
  }, [onAlertOpen]);

  // Filtros - Optimizados con useMemo
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.username.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === '' || user.role === selectedRole;
      const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, selectedRole, selectedStatus]);

  // Funciones de utilidad - Memoizadas
  const getRoleBadgeColor = useCallback((role) => {
    switch (role) {
      case 'Administrador':
        return 'purple';
      case 'Flebotomista':
        return 'blue';
      default:
        return 'gray';
    }
  }, []);

  const getStatusBadgeColor = useCallback((status) => {
    return status === 'active' ? 'green' : 'red';
  }, []);

  const getInitials = useCallback((name) => {
    if (!name) return "??";
    return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // No renderizar hasta que esté montado para evitar errores de hidratación
  if (!mounted) {
    return (
      <ChakraProvider theme={modernTheme}>
        <ModernContainer>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
          >
            <GlassCard p={8} textAlign="center">
              <Spinner size="xl" color="primary.500" thickness="4px" mb={4} />
              <Text fontSize="xl" color="secondary.600">
                Cargando Gestión de Usuarios...
              </Text>
            </GlassCard>
          </Box>
        </ModernContainer>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider theme={modernTheme}>
      <ModernContainer>
        {/* Header Principal con Glassmorphism */}
        <ModernHeader
          title="Gestión de Usuarios"
          subtitle="Administra el equipo médico y permisos de acceso"
        >
          <Button
            leftIcon={<FaPlus />}
            variant="gradient"
            size="lg"
            onClick={() => openForm()}
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
            transition="all 0.3s ease"
          >
            Nuevo Usuario
          </Button>
        </ModernHeader>

        {/* Panel de Filtros con Glassmorphism */}
        <GlassCard p={6} mb={8} animation={`${fadeInUp} 0.8s ease-out`}>
          <VStack align="start" spacing={4}>
            <Heading size="md" color="secondary.800" fontWeight="bold" display="flex" alignItems="center" gap={2}>
              <Box as={FaSearch} color="primary.500" />
              Filtros de Búsqueda
            </Heading>
            
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} w="full">
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="secondary.700">
                  Buscar usuarios
                </FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <FaSearch color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Nombre o usuario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    variant="modern"
                  />
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="secondary.700">
                  Filtrar por rol
                </FormLabel>
                <Select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  variant="modern"
                >
                  <option value="">Todos los roles</option>
                  <option value="Administrador">👨‍💼 Administrador</option>
                  <option value="Flebotomista">👩‍⚕️ Flebotomista</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="secondary.700">
                  Estado del usuario
                </FormLabel>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  variant="modern"
                >
                  <option value="active">🟢 Solo Activos</option>
                  <option value="inactive">🔴 Solo Inactivos</option>
                  <option value="all">📋 Todos los Estados</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="secondary.700">
                  Estadísticas
                </FormLabel>
                <VStack align="start" spacing={2}>
                  <HStack spacing={3}>
                    <Badge 
                      bg="rgba(79, 125, 243, 0.1)" 
                      color="primary.500" 
                      px={3} py={1} 
                      borderRadius="lg"
                      fontWeight="semibold"
                    >
                      Total: {filteredUsers.length}
                    </Badge>
                    <Badge 
                      bg="rgba(16, 185, 129, 0.1)" 
                      color="success" 
                      px={3} py={1} 
                      borderRadius="lg"
                      fontWeight="semibold"
                    >
                      Activos: {filteredUsers.filter(u => u.status === 'active').length}
                    </Badge>
                  </HStack>
                  <HStack spacing={3}>
                    <Badge 
                      bg="rgba(239, 68, 68, 0.1)" 
                      color="error" 
                      px={3} py={1} 
                      borderRadius="lg"
                      fontWeight="semibold"
                    >
                      Inactivos: {filteredUsers.filter(u => u.status === 'inactive').length}
                    </Badge>
                    <Badge 
                      bg="rgba(107, 115, 255, 0.1)" 
                      color="purple.500" 
                      px={3} py={1} 
                      borderRadius="lg"
                      fontWeight="semibold"
                    >
                      Admins: {filteredUsers.filter(u => u.role === 'Administrador').length}
                    </Badge>
                  </HStack>
                </VStack>
              </FormControl>
            </SimpleGrid>

            {/* Información adicional de filtros activos */}
            {(selectedRole || selectedStatus !== 'active' || searchTerm) && (
              <Box 
                w="full"
                mt={4} 
                p={4} 
                background="rgba(79, 125, 243, 0.1)" 
                borderRadius="lg" 
                border="1px solid rgba(79, 125, 243, 0.2)"
              >
                <HStack spacing={2} wrap="wrap">
                  <Text fontSize="sm" fontWeight="semibold" color="primary.700">
                    Filtros activos:
                  </Text>
                  {searchTerm && (
                    <Badge 
                      bg="rgba(79, 125, 243, 0.2)" 
                      color="primary.600" 
                      px={2} py={1} 
                      borderRadius="md"
                    >
                      Búsqueda: &quot;{searchTerm}&quot;
                    </Badge>
                  )}
                  {selectedRole && (
                    <Badge 
                      bg="rgba(107, 115, 255, 0.2)" 
                      color="purple.600" 
                      px={2} py={1} 
                      borderRadius="md"
                    >
                      Rol: {selectedRole}
                    </Badge>
                  )}
                  {selectedStatus !== 'active' && (
                    <Badge 
                      bg={selectedStatus === 'inactive' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(148, 163, 184, 0.2)'} 
                      color={selectedStatus === 'inactive' ? 'error' : 'secondary.600'} 
                      px={2} py={1} 
                      borderRadius="md"
                    >
                      Estado: {selectedStatus === 'inactive' ? 'Inactivos' : 'Todos'}
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    color="primary.600"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedRole('');
                      setSelectedStatus('active');
                    }}
                    _hover={{ bg: 'rgba(79, 125, 243, 0.1)' }}
                  >
                    Limpiar filtros
                  </Button>
                </HStack>
              </Box>
            )}
          </VStack>
        </GlassCard>

        {/* Lista de usuarios con diseño moderno */}
        {loading ? (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6} mb={8}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <GlassCard key={i} p={6}>
                <HStack spacing={4}>
                  <Skeleton w="12" h="12" borderRadius="full" />
                  <VStack align="start" flex={1} spacing={2}>
                    <Skeleton h="4" w="full" />
                    <Skeleton h="3" w="20" />
                    <Skeleton h="3" w="16" />
                  </VStack>
                </HStack>
              </GlassCard>
            ))}
          </SimpleGrid>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6} mb={8}>
            {filteredUsers.map((user, index) => (
              <GlassCard
                key={user.id}
                p={6}
                cursor="pointer"
                _hover={{
                  transform: 'translateY(-4px)',
                  boxShadow: 'xl',
                  background: "rgba(255, 255, 255, 0.35)"
                }}
                transition="all 0.3s ease"
                animation={`${fadeInUp} ${0.4 + index * 0.1}s ease-out`}
                position="relative"
                overflow="hidden"
              >
                {/* Barra de color superior con gradiente */}
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  height="3px"
                  background={user.role === 'Administrador' 
                    ? "linear-gradient(135deg, #6B73FF 0%, #9333EA 100%)" 
                    : "linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
                  }
                  borderTopRadius="2xl"
                />

                <HStack spacing={4} mb={4}>
                  <Box
                    w={12}
                    h={12}
                    borderRadius="xl"
                    background={user.role === 'Administrador' 
                      ? "linear-gradient(135deg, #6B73FF 0%, #9333EA 100%)" 
                      : "linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
                    }
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontWeight="bold"
                    fontSize="lg"
                    boxShadow="lg"
                  >
                    {getInitials(user.name)}
                  </Box>
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="bold" fontSize="lg" color="secondary.800" noOfLines={1}>
                      {user.name}
                    </Text>
                    <Text fontSize="sm" color="secondary.600" noOfLines={1}>
                      @{user.username}
                    </Text>
                    <HStack spacing={2}>
                      <Badge
                        bg={user.role === 'Administrador' 
                          ? "rgba(107, 115, 255, 0.1)" 
                          : "rgba(79, 125, 243, 0.1)"
                        }
                        color={user.role === 'Administrador' ? "purple.600" : "primary.600"}
                        px={3}
                        py={1}
                        borderRadius="lg"
                        fontSize="xs"
                        fontWeight="semibold"
                      >
                        {user.role === 'Administrador' ? '👨‍💼 Admin' : '👩‍⚕️ Flebotomista'}
                      </Badge>
                      <Badge
                        bg={user.status === 'active' 
                          ? "rgba(16, 185, 129, 0.1)" 
                          : "rgba(239, 68, 68, 0.1)"
                        }
                        color={user.status === 'active' ? "success" : "error"}
                        px={3}
                        py={1}
                        borderRadius="lg"
                        fontSize="xs"
                        fontWeight="semibold"
                      >
                        {user.status === 'active' ? '🟢 Activo' : '🔴 Inactivo'}
                      </Badge>
                    </HStack>
                  </VStack>
                </HStack>

                <VStack align="start" spacing={3} mb={4}>
                  {user.email && (
                    <HStack spacing={3} fontSize="sm">
                      <Box as={FaEnvelope} color="secondary.400" />
                      <Text color="secondary.600" noOfLines={1}>{user.email}</Text>
                    </HStack>
                  )}
                  {user.phone && (
                    <HStack spacing={3} fontSize="sm">
                      <Box as={FaPhone} color="secondary.400" />
                      <Text color="secondary.600">{user.phone}</Text>
                    </HStack>
                  )}
                  <HStack spacing={3} fontSize="sm">
                    <Box as={FaUsers} color="secondary.400" />
                    <Text color="secondary.500">
                      Último acceso: {formatDate(user.lastLogin)}
                    </Text>
                  </HStack>
                </VStack>

                <Box
                  h="1px" 
                  bg="rgba(255, 255, 255, 0.3)" 
                  mb={4}
                />

                <HStack spacing={2} justify="flex-end">
                  <Tooltip label="Ver detalles" hasArrow>
                    <IconButton
                      icon={<FaEye />}
                      size="sm"
                      variant="ghost"
                      color="primary.500"
                      aria-label="Ver usuario"
                      _hover={{ 
                        bg: 'rgba(79, 125, 243, 0.1)',
                        transform: 'scale(1.1)'
                      }}
                      borderRadius="lg"
                    />
                  </Tooltip>
                  <Tooltip label="Editar usuario" hasArrow>
                    <IconButton
                      icon={<FaEdit />}
                      size="sm"
                      variant="ghost"
                      color="warning"
                      onClick={() => openForm(user)}
                      aria-label="Editar usuario"
                      _hover={{ 
                        bg: 'rgba(245, 158, 11, 0.1)',
                        transform: 'scale(1.1)'
                      }}
                      borderRadius="lg"
                    />
                  </Tooltip>
                  <Tooltip label="Eliminar usuario" hasArrow>
                    <IconButton
                      icon={<FaTrash />}
                      size="sm"
                      variant="ghost"
                      color="error"
                      onClick={() => confirmDelete(user)}
                      aria-label="Eliminar usuario"
                      _hover={{ 
                        bg: 'rgba(239, 68, 68, 0.1)',
                        transform: 'scale(1.1)'
                      }}
                      borderRadius="lg"
                    />
                  </Tooltip>
                </HStack>
              </GlassCard>
              ))}
            </SimpleGrid>
          )}

        {/* Estado vacío */}
        {!loading && filteredUsers.length === 0 && (
          <GlassCard p={12} textAlign="center" mb={8}>
            <VStack spacing={6}>
              <Box fontSize="4xl" mb={4}>
                {searchTerm || selectedRole || selectedStatus !== 'active' ? (
                  <FaSearch color="rgba(148, 163, 184, 0.5)" />
                ) : (
                  <FaUsers color="rgba(148, 163, 184, 0.5)" />
                )}
              </Box>
              
              <VStack spacing={2}>
                <Heading size="lg" color="secondary.500">
                  {searchTerm || selectedRole || selectedStatus !== 'active' 
                    ? 'No se encontraron usuarios'
                    : 'No hay usuarios en el sistema'
                  }
                </Heading>
                <Text color="secondary.400" textAlign="center" maxW="md">
                  {searchTerm || selectedRole || selectedStatus !== 'active' 
                    ? 'Los filtros aplicados no coinciden con ningún usuario. Intenta ajustar los criterios de búsqueda.'
                    : 'Comienza agregando el primer usuario al sistema para gestionar el acceso del equipo médico.'
                  }
                </Text>
              </VStack>

              {searchTerm || selectedRole || selectedStatus !== 'active' ? (
                <VStack spacing={3}>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedRole('');
                      setSelectedStatus('active');
                    }}
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'md'
                    }}
                  >
                    Limpiar Filtros
                  </Button>
                  <Text fontSize="sm" color="secondary.500">
                    o intenta con otros criterios de búsqueda
                  </Text>
                </VStack>
              ) : (
                <Button
                  leftIcon={<FaPlus />}
                  variant="gradient"
                  size="lg"
                  onClick={() => openForm()}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'xl'
                  }}
                >
                  Crear Primer Usuario
                </Button>
              )}
            </VStack>
          </GlassCard>
        )}

        {/* Drawer para formulario */}
        <Drawer
          isOpen={isDrawerOpen}
          placement="right"
          onClose={handleCloseForm}
          size="lg"
        >
          <DrawerOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
          <DrawerContent
            background="rgba(255, 255, 255, 0.95)"
            backdropFilter="blur(20px)"
            shadow="2xl"
            borderLeft="1px solid rgba(255, 255, 255, 0.3)"
          >
            <DrawerCloseButton 
              size="lg" 
              top={4} 
              right={4}
              _hover={{ bg: 'gray.100', transform: 'scale(1.1)' }}
              transition="all 0.2s"
            />
            
            {/* Header mejorado con gradiente */}
            <DrawerHeader 
              borderBottomWidth="1px" 
              borderColor="rgba(255, 255, 255, 0.3)"
              background="linear-gradient(135deg, rgba(79, 125, 243, 0.05) 0%, rgba(107, 115, 255, 0.05) 100%)"
              pt={8}
              pb={6}
            >
              <VStack align="start" spacing={3}>
                <HStack spacing={3}>
                  <Button
                    leftIcon={<ArrowBackIcon />}
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseForm}
                    colorScheme="gray"
                    _hover={{ bg: 'white', shadow: 'sm' }}
                  >
                    Regresar
                  </Button>
                  <Spacer />
                  <Badge 
                    colorScheme={editingUserId ? 'orange' : 'green'} 
                    px={3} 
                    py={1}
                    borderRadius="full"
                  >
                    {editingUserId ? 'Editando' : 'Nuevo'}
                  </Badge>
                </HStack>
                
                <Box>
                  <Heading 
                    size="lg" 
                    bgGradient="linear(to-r, blue.600, purple.600)"
                    bgClip="text"
                    mb={1}
                  >
                    {editingUserId ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                  </Heading>
                  <Text fontSize="md" color="gray.600">
                    {editingUserId 
                      ? `Modificando información de: ${formData.name || 'Usuario'}` 
                      : 'Completa toda la información requerida para crear el usuario'
                    }
                  </Text>
                </Box>
                
                {/* Progress indicator */}
                <Box w="full">
                  <Text fontSize="xs" color="gray.500" mb={1}>
                    Progreso del formulario
                  </Text>
                  <Box bg="gray.200" h="2" borderRadius="full" overflow="hidden">
                    <Box
                      bg="linear-gradient(to-r, blue.400, purple.400)"
                      h="full"
                      borderRadius="full"
                      transition="all 0.3s ease"
                      w={`${(
                        (formData.name ? 20 : 0) +
                        (formData.username ? 20 : 0) +
                        (formData.role ? 20 : 0) +
                        (formData.email ? 20 : 0) +
                        (formData.phone ? 20 : 0)
                      )}%`}
                    />
                  </Box>
                </Box>
              </VStack>
            </DrawerHeader>

            <DrawerBody py={6}>
              <VStack spacing={6} align="stretch">
                {/* Información Personal */}
                <GlassCard p={4}>
                  <Box mb={4}>
                    <HStack>
                      <Box 
                        p={2} 
                        bg="blue.50" 
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="blue.200"
                      >
                        <Box w={4} h={4} bg="blue.400" borderRadius="sm" />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" fontSize="md" color="gray.800">
                          Información Personal
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          Datos básicos del usuario
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                  <Box>
                    <VStack spacing={4} align="stretch">
                      <FormControl isRequired>
                        <FormLabel 
                          fontSize="sm" 
                          fontWeight="semibold" 
                          color="gray.700"
                          display="flex"
                          alignItems="center"
                          gap={2}
                        >
                          <Box w={2} h={2} bg="red.400" borderRadius="full" />
                          Nombre Completo
                        </FormLabel>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Ej: María García López"
                          focusBorderColor="blue.400"
                          size="lg"
                          variant="modern"
                          _hover={{ borderColor: 'blue.200' }}
                          _focus={{ 
                            borderColor: 'blue.400',
                            shadow: '0 0 0 3px rgba(66, 153, 225, 0.1)',
                            bg: 'blue.50'
                          }}
                          transition="all 0.2s"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel 
                          fontSize="sm" 
                          fontWeight="semibold" 
                          color="gray.700"
                          display="flex"
                          alignItems="center"
                          gap={2}
                        >
                          <Box w={2} h={2} bg="red.400" borderRadius="full" />
                          Nombre de Usuario
                        </FormLabel>
                        <Input
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '.') })}
                          placeholder="Ej: maria.garcia"
                          focusBorderColor="blue.400"
                          size="lg"
                          variant="modern"
                          _hover={{ borderColor: 'blue.200' }}
                          _focus={{ 
                            borderColor: 'blue.400',
                            shadow: '0 0 0 3px rgba(66, 153, 225, 0.1)',
                            bg: 'blue.50'
                          }}
                          transition="all 0.2s"
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Se convertirá automáticamente a minúsculas
                        </Text>
                      </FormControl>
                    </VStack>
                  </Box>
                </GlassCard>

                {/* Seguridad */}
                <GlassCard p={4}>
                  <Box mb={4}>
                    <HStack>
                      <Box 
                        p={2} 
                        bg="purple.50" 
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="purple.200"
                      >
                        <Box w={4} h={4} bg="purple.400" borderRadius="sm" />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" fontSize="md" color="gray.800">
                          Seguridad y Acceso
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          Credenciales y permisos
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                  <Box>
                    <VStack spacing={4} align="stretch">
                      <FormControl isRequired={!editingUserId}>
                        <FormLabel 
                          fontSize="sm" 
                          fontWeight="semibold" 
                          color="gray.700"
                          display="flex"
                          alignItems="center"
                          gap={2}
                        >
                          {!editingUserId && <Box w={2} h={2} bg="red.400" borderRadius="full" />}
                          Contraseña
                          {editingUserId && (
                            <Badge colorScheme="orange" size="sm" ml={2}>
                              Opcional
                            </Badge>
                          )}
                        </FormLabel>
                        <Input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder={editingUserId ? "Dejar vacío para mantener actual" : "Mínimo 8 caracteres"}
                          focusBorderColor="purple.400"
                          size="lg"
                          variant="modern"
                          _hover={{ borderColor: 'purple.200' }}
                          _focus={{ 
                            borderColor: 'purple.400',
                            shadow: '0 0 0 3px rgba(159, 122, 234, 0.1)',
                            bg: 'purple.50'
                          }}
                          transition="all 0.2s"
                        />
                        {!editingUserId && (
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            La contraseña debe tener al menos 8 caracteres
                          </Text>
                        )}
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel 
                          fontSize="sm" 
                          fontWeight="semibold" 
                          color="gray.700"
                          display="flex"
                          alignItems="center"
                          gap={2}
                        >
                          <Box w={2} h={2} bg="red.400" borderRadius="full" />
                          Rol del Usuario
                        </FormLabel>
                        <Select
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          placeholder="Selecciona un rol"
                          focusBorderColor="purple.400"
                          size="lg"
                          variant="modern"
                          _hover={{ borderColor: 'purple.200' }}
                          _focus={{ 
                            borderColor: 'purple.400',
                            shadow: '0 0 0 3px rgba(159, 122, 234, 0.1)',
                            bg: 'purple.50'
                          }}
                          transition="all 0.2s"
                        >
                          <option value="Flebotomista">👩‍⚕️ Flebotomista</option>
                          <option value="Administrador">👨‍💼 Administrador</option>
                        </Select>
                        <HStack mt={2} spacing={4}>
                          <HStack>
                            <Box w={2} h={2} bg="blue.400" borderRadius="full" />
                            <Text fontSize="xs" color="gray.600">Flebotomista: Acceso básico</Text>
                          </HStack>
                          <HStack>
                            <Box w={2} h={2} bg="purple.400" borderRadius="full" />
                            <Text fontSize="xs" color="gray.600">Admin: Acceso completo</Text>
                          </HStack>
                        </HStack>
                      </FormControl>
                    </VStack>
                  </Box>
                </GlassCard>

                {/* Información de Contacto */}
                <GlassCard p={4}>
                  <Box mb={4}>
                    <HStack>
                      <Box 
                        p={2} 
                        bg="green.50" 
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="green.200"
                      >
                        <Box w={4} h={4} bg="green.400" borderRadius="sm" />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" fontSize="md" color="gray.800">
                          Información de Contacto
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          Datos opcionales para comunicación
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                  <Box>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel 
                          fontSize="sm" 
                          fontWeight="semibold" 
                          color="gray.700"
                          display="flex"
                          alignItems="center"
                          gap={2}
                        >
                          <EmailIcon w={3} h={3} color="gray.400" />
                          Correo Electrónico
                          <Badge colorScheme="green" size="sm" ml={2}>Opcional</Badge>
                        </FormLabel>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="usuario@tomaturno.com"
                          focusBorderColor="green.400"
                          size="lg"
                          variant="modern"
                          _hover={{ borderColor: 'green.200' }}
                          _focus={{ 
                            borderColor: 'green.400',
                            shadow: '0 0 0 3px rgba(72, 187, 120, 0.1)',
                            bg: 'green.50'
                          }}
                          transition="all 0.2s"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel 
                          fontSize="sm" 
                          fontWeight="semibold" 
                          color="gray.700"
                          display="flex"
                          alignItems="center"
                          gap={2}
                        >
                          <PhoneIcon w={3} h={3} color="gray.400" />
                          Teléfono
                          <Badge colorScheme="green" size="sm" ml={2}>Opcional</Badge>
                        </FormLabel>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+52 999 123 4567"
                          focusBorderColor="green.400"
                          size="lg"
                          variant="modern"
                          _hover={{ borderColor: 'green.200' }}
                          _focus={{ 
                            borderColor: 'green.400',
                            shadow: '0 0 0 3px rgba(72, 187, 120, 0.1)',
                            bg: 'green.50'
                          }}
                          transition="all 0.2s"
                        />
                      </FormControl>
                    </VStack>
                  </Box>
                </GlassCard>
              </VStack>
            </DrawerBody>

            {/* Footer mejorado con acciones */}
            <DrawerFooter 
              borderTopWidth="2px" 
              borderColor="rgba(255, 255, 255, 0.3)"
              bg="gray.50"
              p={6}
            >
              <VStack w="full" spacing={4}>
                {/* Resumen antes de guardar */}
                <Box 
                  w="full" 
                  background="rgba(79, 125, 243, 0.1)" 
                  backdropFilter="blur(10px)"
                  borderRadius="lg" 
                  border="1px solid rgba(79, 125, 243, 0.2)"
                  p={4}
                >
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" fontSize="sm" color="blue.800">
                          {editingUserId ? 'Actualizando usuario existente' : 'Creando nuevo usuario'}
                        </Text>
                        <Text fontSize="xs" color="blue.600">
                          {formData.name && formData.username 
                            ? `${formData.name} (@${formData.username})` 
                            : 'Completa los campos requeridos'
                          }
                        </Text>
                      </VStack>
                      <Badge 
                        colorScheme={formData.role === 'Administrador' ? 'purple' : 'blue'}
                        px={3}
                        py={1}
                      >
                        {formData.role || 'Sin rol'}
                      </Badge>
                    </HStack>
                  </Box>

                  {/* Botones de acción */}
                <HStack w="full" spacing={3}>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={handleCloseForm}
                    flex={1}
                    leftIcon={<ArrowBackIcon />}
                    _hover={{ bg: 'gray.100', transform: 'translateY(-1px)' }}
                    transition="all 0.2s"
                  >
                    Cancelar
                  </Button>
                  <Button
                    colorScheme="blue"
                    size="lg"
                    onClick={handleSubmitUser}
                    isLoading={formLoading}
                    loadingText={editingUserId ? 'Actualizando...' : 'Creando...'}
                    flex={2}
                    leftIcon={editingUserId ? <EditIcon /> : <AddIcon />}
                    isDisabled={!formData.name || !formData.username || !formData.role || (!editingUserId && !formData.password)}
                    _hover={{ 
                      transform: 'translateY(-2px)', 
                      shadow: 'lg',
                      bg: 'blue.600'
                    }}
                    _disabled={{
                      opacity: 0.6,
                      cursor: 'not-allowed',
                      transform: 'none'
                    }}
                    transition="all 0.2s"
                    shadow="md"
                    bgGradient="linear(to-r, blue.500, blue.600)"
                    _active={{ bgGradient: "linear(to-r, blue.600, blue.700)" }}
                  >
                    {editingUserId ? 'Guardar Cambios' : 'Crear Usuario'}
                  </Button>
                </HStack>
              </VStack>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Diálogo de confirmación para eliminar */}
        <AlertDialog
          isOpen={isAlertOpen}
          leastDestructiveRef={cancelRef}
          onClose={onAlertClose}
          isCentered
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Eliminar Usuario
              </AlertDialogHeader>

              <AlertDialogBody>
                ¿Estás seguro de que deseas eliminar a{' '}
                <strong>{userToDelete?.name}</strong>? Esta acción no se puede deshacer.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onAlertClose}>
                  Cancelar
                </Button>
                <Button colorScheme="red" onClick={handleDeleteUser} ml={3}>
                  Eliminar
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

        {/* Footer */}
        <Box
          as="footer"
          p={4}
          textAlign="center"
          background="rgba(255, 255, 255, 0.25)"
          backdropFilter="blur(20px)"
          color="secondary.600"
          borderRadius="lg"
          fontSize="sm"
          animation={`${fadeInUp} 1.5s ease-out`}
        >
          <Text>
            Instituto Nacional de Enfermedades Respiratorias Ismael Cosío Villegas (INER) | 
            Desarrollado por DT Diagnósticos by Labsis © {new Date().getFullYear()}
          </Text>
        </Box>
      </ModernContainer>
    </ChakraProvider>
  );
});

export default UserManagement;