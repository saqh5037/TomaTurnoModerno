import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
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
  Spinner,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Switch,
  Tooltip,
  ChakraProvider,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Divider,
  Container,
  Card,
  CardHeader,
  CardBody,
  InputRightAddon,
  FormErrorMessage,
  FormHelperText,
  ButtonGroup,
  useColorModeValue,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Center,
  extendTheme
} from '@chakra-ui/react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaPhone,
  FaUser,
  FaClock,
  FaKey,
  FaFilter,
  FaDownload,
  FaSync,
  FaUserShield,
  FaUserCheck,
  FaUserTimes,
  FaLock,
  FaUnlock,
  FaCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaChevronDown,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaArrowLeft
} from 'react-icons/fa';
import { MdMoreVert, MdRefresh, MdSecurity, MdVerifiedUser } from 'react-icons/md';
import { BsThreeDotsVertical } from 'react-icons/bs';
import ProtectedRoute from '../../components/ProtectedRoute';
// import Navbar from '../../components/Navbar'; // Comentado temporalmente
import { modernTheme, fadeInUp, slideInFromLeft, slideInFromRight, GlassCard, ModernContainer, ModernHeader } from '../../components/theme/ModernTheme';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

// Componente de indicador de fortaleza de contraseña
const PasswordStrengthIndicator = ({ password }) => {
  const calculateStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const strength = calculateStrength();
  const colors = ['red', 'orange', 'yellow', 'blue', 'green'];
  const labels = ['Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'];

  return (
    <Box mt={2}>
      <Progress value={strength * 20} colorScheme={colors[strength - 1]} size="sm" />
      <Text fontSize="xs" color={`${colors[strength - 1]}.500`} mt={1}>
        {labels[strength - 1] || 'Sin contraseña'}
      </Text>
    </Box>
  );
};

// Componente de Badge de Estado de Usuario
const UserStatusBadge = ({ isActive, isLocked }) => {
  if (isLocked) {
    return (
      <Badge colorScheme="red" variant="solid">
        <FaLock style={{ marginRight: '4px' }} />
        Bloqueado
      </Badge>
    );
  }
  return (
    <Badge colorScheme={isActive ? 'green' : 'gray'} variant="solid">
      {isActive ? (
        <>
          <FaCheckCircle style={{ marginRight: '4px' }} />
          Activo
        </>
      ) : (
        <>
          <FaUserTimes style={{ marginRight: '4px' }} />
          Inactivo
        </>
      )}
    </Badge>
  );
};

// Componente de Badge de Rol
const UserRoleBadge = ({ role }) => {
  const roleConfig = {
    admin: { color: 'purple', icon: FaUserShield, label: 'Admin' },
    supervisor: { color: 'blue', icon: MdVerifiedUser, label: 'Supervisor' },
    flebotomista: { color: 'teal', icon: FaUser, label: 'Flebotomista' },
    Flebotomista: { color: 'teal', icon: FaUser, label: 'Flebotomista' },
    recepcion: { color: 'orange', icon: FaUser, label: 'Recepción' },
    laboratorio: { color: 'cyan', icon: FaUser, label: 'Laboratorio' },
    Administrador: { color: 'purple', icon: FaUserShield, label: 'Admin' }
  };

  const config = roleConfig[role] || { color: 'gray', icon: FaUser, label: role };
  const Icon = config.icon;

  return (
    <Badge colorScheme={config.color} variant="subtle" px={2} py={1}>
      <Icon style={{ marginRight: '4px' }} />
      {config.label}
    </Badge>
  );
};

// Componente de indicador de última actividad
const LastActivityIndicator = ({ lastLogin, color }) => {
  const colorScheme = {
    green: { bg: 'green.100', color: 'green.800' },
    blue: { bg: 'blue.100', color: 'blue.800' },
    orange: { bg: 'orange.100', color: 'orange.800' },
    red: { bg: 'red.100', color: 'red.800' },
    gray: { bg: 'gray.100', color: 'gray.600' }
  };

  const scheme = colorScheme[color] || colorScheme.gray;

  return (
    <HStack spacing={2}>
      <FaCircle size="8px" color={color === 'green' ? '#48BB78' : '#CBD5E0'} />
      <Text fontSize="sm" color={scheme.color}>
        {lastLogin || 'Nunca'}
      </Text>
    </HStack>
  );
};

// Componente principal de gestión de usuarios
function UsersManagement() {
  const router = useRouter();

  // Estados principales
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 segundos

  // Estados para formularios
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'flebotomista',
    email: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para modales
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);

  // Referencias
  const cancelRef = useRef();
  const intervalRef = useRef();

  // Hooks de Chakra UI
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isResetOpen, onOpen: onResetOpen, onClose: onResetClose } = useDisclosure();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  // Función para obtener usuarios desde el backend
  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Error de autenticación',
          description: 'Por favor, inicia sesión nuevamente',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: 'Sesión expirada',
            description: 'Por favor, inicia sesión nuevamente',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          // Redirigir a login
          window.location.href = '/login';
          return;
        }
        if (response.status === 403) {
          toast({
            title: 'Acceso denegado',
            description: 'No tienes permisos para ver esta página',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          return;
        }
        // Para otros errores, intentar obtener el mensaje del servidor
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error del servidor: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
        setStats(data.stats);
        setFilteredUsers(data.data); // Inicialmente mostrar todos
      } else {
        throw new Error(data.error || 'Error al obtener usuarios');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Efecto para cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Efecto para auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchUsers();
      }, refreshInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, fetchUsers]);

  // Efecto para filtrar usuarios
  useEffect(() => {
    let filtered = [...users];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
      );
    }

    // Filtrar por rol
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user =>
        user.role.toLowerCase() === roleFilter.toLowerCase() ||
        (roleFilter === 'flebotomista' && user.role === 'Flebotomista')
      );
    }

    // Filtrar por estado
    if (statusFilter === 'active') {
      filtered = filtered.filter(user => user.isActive && !user.isLocked);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(user => !user.isActive);
    } else if (statusFilter === 'locked') {
      filtered = filtered.filter(user => user.isLocked);
    } else if (statusFilter === 'needPasswordChange') {
      filtered = filtered.filter(user => user.passwordNeedsChange);
    }

    // Ordenar
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter, sortConfig]);

  // Función para manejar el ordenamiento
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Función para obtener el icono de ordenamiento
  const getSortIcon = (column) => {
    if (sortConfig.key !== column) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  // Función para validar el formulario
  const validateForm = () => {
    const errors = {};

    if (!formData.username || formData.username.length < 3) {
      errors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }

    if (!editingUser && !formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password && formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (!formData.name) {
      errors.name = 'El nombre completo es requerido';
    }

    if (!formData.role) {
      errors.role = 'El rol es requerido';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Función para crear/editar usuario
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingUser
        ? `/api/users/${editingUser.id}`
        : '/api/users';

      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: editingUser ? 'Usuario actualizado' : 'Usuario creado',
          description: data.message,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        onClose();
        fetchUsers();
        resetForm();
      } else {
        throw new Error(data.error || 'Error al guardar usuario');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para cambiar estado de usuario
  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Estado actualizado',
          description: data.message,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchUsers();
      } else {
        // Manejar casos específicos de error sin lanzar excepción
        if (data.error === "No puedes desactivar tu propia cuenta") {
          toast({
            title: 'Operación no permitida',
            description: 'No puedes desactivar tu propia cuenta por razones de seguridad.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
        } else {
          toast({
            title: 'Error al cambiar estado',
            description: data.error || 'No se pudo actualizar el estado del usuario',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
        // No lanzar error, ya se mostró el toast
        return;
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Función para eliminar usuario (soft delete)
  const handleDelete = async () => {
    if (!deletingUser) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${deletingUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Usuario desactivado',
          description: data.message,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        onDeleteClose();
        fetchUsers();
        setDeletingUser(null);
      } else {
        throw new Error(data.error || 'Error al eliminar usuario');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Función para resetear contraseña
  const handleResetPassword = async () => {
    if (!resetPasswordUser) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${resetPasswordUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Contraseña temporal generada',
          description: `Nueva contraseña para ${data.data.username}: ${data.data.temporaryPassword}`,
          status: 'success',
          duration: 10000,
          isClosable: true,
        });
        onResetClose();
        setResetPasswordUser(null);
      } else {
        throw new Error(data.error || 'Error al resetear contraseña');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Función para manejar acciones masivas
  const handleBulkAction = async (action) => {
    if (selectedUsers.size === 0) {
      toast({
        title: 'Sin selección',
        description: 'Por favor selecciona al menos un usuario',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const token = localStorage.getItem('token');
    const promises = Array.from(selectedUsers).map(userId => {
      if (action === 'activate' || action === 'deactivate') {
        return fetch(`/api/users/${userId}/status`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ isActive: action === 'activate' })
        });
      }
    });

    try {
      await Promise.all(promises);
      toast({
        title: 'Acción completada',
        description: `${selectedUsers.size} usuarios ${action === 'activate' ? 'activados' : 'desactivados'}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setSelectedUsers(new Set());
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Algunos usuarios no pudieron ser actualizados',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Función para exportar a CSV
  const exportToCSV = () => {
    const csvData = filteredUsers.map(user => ({
      'Nombre de Usuario': user.username,
      'Nombre Completo': user.name,
      'Rol': user.role,
      'Email': user.email || 'N/A',
      'Teléfono': user.phone || 'N/A',
      'Estado': user.isActive ? 'Activo' : 'Inactivo',
      'Último Acceso': user.lastLoginStatus,
      'Turnos Atendidos': user.turnsAttended || 0,
      'Creado': new Date(user.createdAt).toLocaleDateString('es-MX')
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      role: 'flebotomista',
      email: '',
      phone: ''
    });
    setFormErrors({});
    setEditingUser(null);
  };

  // Función para manejar selección de checkbox
  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const handleSelectUser = (userId) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  // Función para abrir modal de edición
  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      name: user.name,
      role: user.role,
      email: user.email || '',
      phone: user.phone || ''
    });
    onOpen();
  };

  if (loading) {
    return (
      <ChakraProvider theme={modernTheme}>
        <ProtectedRoute requiredRole="admin">
          {/* <Navbar /> */}
          <ModernContainer>
            <Center h="50vh">
              <VStack spacing={4}>
                <Spinner size="xl" color="brand.500" thickness="4px" />
                <Text>Cargando usuarios...</Text>
              </VStack>
            </Center>
          </ModernContainer>
        </ProtectedRoute>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider theme={modernTheme}>
      <ProtectedRoute requiredRole="admin">
        {/* <Navbar /> */}
        <ModernContainer>
          <VStack spacing={8} align="stretch">
            {/* Header Principal con Glassmorphism */}
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
                  <Box>
                    <Heading
                    fontSize="4xl"
                    fontWeight="extrabold"
                    background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
                    backgroundClip="text"
                    color="transparent"
                    letterSpacing="-0.02em"
                  >
                    Gestión de Usuarios
                  </Heading>
                  <Text fontSize="lg" color="secondary.600" mt={2}>
                    Administra usuarios y permisos del sistema
                  </Text>
                  </Box>
                </HStack>
              <HStack spacing={2}>
                <Badge colorScheme="green" fontSize="lg" px={3} py={1}>
                  {stats?.withActiveSessions || 0} en línea
                </Badge>
                <Tooltip label={`Auto-refresh ${autoRefresh ? 'activo' : 'desactivado'}`}>
                  <IconButton
                    icon={<FaSync />}
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    colorScheme={autoRefresh ? 'green' : 'gray'}
                    variant="ghost"
                    aria-label="Toggle auto-refresh"
                  />
                </Tooltip>
                <Button
                  leftIcon={<FaPlus />}
                  onClick={onOpen}
                  background="linear-gradient(135deg, #4F7DF3 0%, #6B73FF 100%)"
                  color="white"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'xl'
                  }}
                >
                  Nuevo Usuario
                </Button>
              </HStack>
              </Flex>
            </Box>

            {/* Estadísticas con Glassmorphism */}
            {stats && (
              <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={4}>
                <GlassCard p={4} animation={`${slideInFromLeft} 0.8s ease-out`}>
                    <Stat>
                      <StatLabel>Total</StatLabel>
                      <StatNumber>{stats.total}</StatNumber>
                    </Stat>
                </GlassCard>
                <GlassCard p={4} animation={`${slideInFromLeft} 0.9s ease-out`}>
                    <Stat>
                      <StatLabel>Activos</StatLabel>
                      <StatNumber color="green.500">{stats.active}</StatNumber>
                    </Stat>
                </GlassCard>
                <GlassCard p={4} animation={`${slideInFromLeft} 0.9s ease-out`}>
                    <Stat>
                      <StatLabel>Inactivos</StatLabel>
                      <StatNumber color="gray.500">{stats.inactive}</StatNumber>
                    </Stat>
                </GlassCard>
                <GlassCard p={4} animation={`${slideInFromLeft} 0.9s ease-out`}>
                    <Stat>
                      <StatLabel>Administradores</StatLabel>
                      <StatNumber color="purple.500">{stats.byRole?.admin || 0}</StatNumber>
                    </Stat>
                </GlassCard>
                <GlassCard p={4} animation={`${slideInFromLeft} 0.9s ease-out`}>
                    <Stat>
                      <StatLabel>Flebotomistas</StatLabel>
                      <StatNumber color="teal.500">{stats.byRole?.flebotomista || 0}</StatNumber>
                    </Stat>
                </GlassCard>
                <GlassCard p={4} animation={`${slideInFromLeft} 0.9s ease-out`}>
                    <Stat>
                      <StatLabel>Cambio Contraseña</StatLabel>
                      <StatNumber color="orange.500">{stats.needPasswordChange || 0}</StatNumber>
                    </Stat>
                </GlassCard>
              </SimpleGrid>
            )}

            {/* Barra de herramientas con Glassmorphism */}
            <GlassCard p={6} animation={`${fadeInUp} 1s ease-out`}>
                <Flex gap={4} wrap="wrap" align="center">
                  <InputGroup maxW="300px">
                    <InputLeftElement>
                      <FaSearch />
                    </InputLeftElement>
                    <Input
                      placeholder="Buscar usuarios..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>

                  <Select
                    maxW="200px"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">Todos los roles</option>
                    <option value="admin">Administrador</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="flebotomista">Flebotomista</option>
                    <option value="recepcion">Recepción</option>
                    <option value="laboratorio">Laboratorio</option>
                  </Select>

                  <Select
                    maxW="200px"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                    <option value="locked">Bloqueados</option>
                    <option value="needPasswordChange">Requieren cambio contraseña</option>
                  </Select>

                  <Spacer />

                  {selectedUsers.size > 0 && (
                    <ButtonGroup>
                      <Button
                        size="sm"
                        colorScheme="green"
                        onClick={() => handleBulkAction('activate')}
                      >
                        Activar ({selectedUsers.size})
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleBulkAction('deactivate')}
                      >
                        Desactivar ({selectedUsers.size})
                      </Button>
                    </ButtonGroup>
                  )}

                  <Button
                    leftIcon={<FaDownload />}
                    variant="outline"
                    onClick={exportToCSV}
                  >
                    Exportar CSV
                  </Button>
                </Flex>
            </GlassCard>

            {/* Tabla de usuarios con Glassmorphism */}
            <GlassCard p={0} animation={`${fadeInUp} 1.2s ease-out`}>
                <Box overflowX="auto" p={4}>
                  <Table variant="simple" size="md">
                    <Thead bg={bgColor}>
                      <Tr>
                        <Th>
                          <Checkbox
                            isChecked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                            isIndeterminate={selectedUsers.size > 0 && selectedUsers.size < filteredUsers.length}
                            onChange={handleSelectAll}
                          />
                        </Th>
                        <Th cursor="pointer" onClick={() => handleSort('name')}>
                          <HStack spacing={1}>
                            <Text>Usuario</Text>
                            {getSortIcon('name')}
                          </HStack>
                        </Th>
                        <Th cursor="pointer" onClick={() => handleSort('role')}>
                          <HStack spacing={1}>
                            <Text>Rol</Text>
                            {getSortIcon('role')}
                          </HStack>
                        </Th>
                        <Th>Estado</Th>
                        <Th cursor="pointer" onClick={() => handleSort('lastLogin')}>
                          <HStack spacing={1}>
                            <Text>Último Acceso</Text>
                            {getSortIcon('lastLogin')}
                          </HStack>
                        </Th>
                        <Th isNumeric>Sesiones</Th>
                        <Th isNumeric>Turnos</Th>
                        <Th cursor="pointer" onClick={() => handleSort('createdAt')}>
                          <HStack spacing={1}>
                            <Text>Creado</Text>
                            {getSortIcon('createdAt')}
                          </HStack>
                        </Th>
                        <Th>Acciones</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredUsers.map((user) => (
                        <Tr key={user.id} _hover={{ bg: hoverBg }}>
                          <Td>
                            <Checkbox
                              isChecked={selectedUsers.has(user.id)}
                              onChange={() => handleSelectUser(user.id)}
                            />
                          </Td>
                          <Td>
                            <HStack spacing={3}>
                              <Avatar size="sm" name={user.name} />
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="medium">{user.name}</Text>
                                <Text fontSize="sm" color="gray.500">@{user.username}</Text>
                                {user.email && (
                                  <Text fontSize="xs" color="gray.400">{user.email}</Text>
                                )}
                              </VStack>
                            </HStack>
                          </Td>
                          <Td>
                            <UserRoleBadge role={user.role} />
                          </Td>
                          <Td>
                            <Switch
                              isChecked={user.isActive}
                              onChange={() => handleToggleStatus(user.id, user.isActive)}
                              colorScheme="green"
                              size="md"
                            />
                          </Td>
                          <Td>
                            <LastActivityIndicator
                              lastLogin={user.lastLoginStatus}
                              color={user.lastLoginColor}
                            />
                          </Td>
                          <Td isNumeric>
                            {user.activeSessions > 0 ? (
                              <Badge colorScheme="green">{user.activeSessions}</Badge>
                            ) : (
                              <Text color="gray.400">0</Text>
                            )}
                          </Td>
                          <Td isNumeric>
                            <Text>{user.turnsAttended || 0}</Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm">
                              {new Date(user.createdAt).toLocaleDateString('es-MX')}
                            </Text>
                          </Td>
                          <Td>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<BsThreeDotsVertical />}
                                variant="ghost"
                                size="sm"
                              />
                              <MenuList>
                                <MenuItem icon={<FaEye />} onClick={() => {
                                  setViewingUser(user);
                                  onViewOpen();
                                }}>
                                  Ver detalles
                                </MenuItem>
                                <MenuItem icon={<FaEdit />} onClick={() => openEditModal(user)}>
                                  Editar
                                </MenuItem>
                                <MenuItem icon={<FaKey />} onClick={() => {
                                  setResetPasswordUser(user);
                                  onResetOpen();
                                }}>
                                  Resetear contraseña
                                </MenuItem>
                                <MenuDivider />
                                <MenuItem icon={<FaTrash />} color="red.500" onClick={() => {
                                  setDeletingUser(user);
                                  onDeleteOpen();
                                }}>
                                  Eliminar
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>

                  {filteredUsers.length === 0 && (
                    <Center py={8}>
                      <VStack spacing={4}>
                        <FaUser size="48px" color="#CBD5E0" />
                        <Text color="gray.500">No se encontraron usuarios</Text>
                      </VStack>
                    </Center>
                  )}
                </Box>
            </GlassCard>
          </VStack>

          {/* Modal de Crear/Editar Usuario */}
          <Drawer
            isOpen={isOpen}
            placement="right"
            onClose={() => {
              onClose();
              resetForm();
            }}
            size="md"
          >
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader>
                {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </DrawerHeader>

              <DrawerBody>
                <VStack spacing={4}>
                  <FormControl isInvalid={formErrors.username} isRequired>
                    <FormLabel>Nombre de usuario</FormLabel>
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="usuario123"
                    />
                    <FormErrorMessage>{formErrors.username}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={formErrors.password} isRequired={!editingUser}>
                    <FormLabel>Contraseña</FormLabel>
                    <InputGroup>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder={editingUser ? 'Dejar en blanco para no cambiar' : 'Min. 8 caracteres'}
                      />
                      <InputRightElement>
                        <IconButton
                          icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                          onClick={() => setShowPassword(!showPassword)}
                          variant="ghost"
                          size="sm"
                          aria-label="Toggle password visibility"
                        />
                      </InputRightElement>
                    </InputGroup>
                    {formData.password && <PasswordStrengthIndicator password={formData.password} />}
                    <FormErrorMessage>{formErrors.password}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={formErrors.name} isRequired>
                    <FormLabel>Nombre completo</FormLabel>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Juan Pérez"
                    />
                    <FormErrorMessage>{formErrors.name}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={formErrors.role} isRequired>
                    <FormLabel>Rol</FormLabel>
                    <Select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="flebotomista">Flebotomista</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="recepcion">Recepción</option>
                      <option value="laboratorio">Laboratorio</option>
                      <option value="admin">Administrador</option>
                    </Select>
                    <FormErrorMessage>{formErrors.role}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={formErrors.email}>
                    <FormLabel>Email</FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <FaEnvelope />
                      </InputLeftElement>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="usuario@hospital.com"
                      />
                    </InputGroup>
                    <FormErrorMessage>{formErrors.email}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Teléfono</FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <FaPhone />
                      </InputLeftElement>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="555-0000"
                      />
                    </InputGroup>
                  </FormControl>
                </VStack>
              </DrawerBody>

              <DrawerFooter borderTopWidth="1px">
                <Button variant="outline" mr={3} onClick={() => {
                  onClose();
                  resetForm();
                }}>
                  Cancelar
                </Button>
                <Button
                  bg="blue.500"
                  color="white"
                  _hover={{
                    bg: "blue.600",
                    transform: "translateY(-1px)",
                    boxShadow: "lg"
                  }}
                  _active={{
                    bg: "blue.700",
                    transform: "translateY(0)"
                  }}
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  loadingText="Guardando..."
                  size="md"
                  fontWeight="600"
                  px={6}
                  boxShadow="md"
                >
                  {editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {/* Modal de confirmación de eliminación */}
          <AlertDialog
            isOpen={isDeleteOpen}
            leastDestructiveRef={cancelRef}
            onClose={onDeleteClose}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Desactivar Usuario
                </AlertDialogHeader>

                <AlertDialogBody>
                  ¿Estás seguro de que deseas desactivar al usuario <strong>{deletingUser?.name}</strong>?
                  <br /><br />
                  Esta acción desactivará la cuenta y cerrará todas las sesiones activas del usuario.
                </AlertDialogBody>

                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={onDeleteClose}>
                    Cancelar
                  </Button>
                  <Button colorScheme="red" onClick={handleDelete} ml={3}>
                    Desactivar
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>

          {/* Modal de reset de contraseña */}
          <AlertDialog
            isOpen={isResetOpen}
            leastDestructiveRef={cancelRef}
            onClose={onResetClose}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Resetear Contraseña
                </AlertDialogHeader>

                <AlertDialogBody>
                  ¿Deseas generar una nueva contraseña temporal para <strong>{resetPasswordUser?.name}</strong>?
                  <br /><br />
                  Se generará una contraseña temporal que deberás proporcionar al usuario.
                </AlertDialogBody>

                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={onResetClose}>
                    Cancelar
                  </Button>
                  <Button colorScheme="orange" onClick={handleResetPassword} ml={3}>
                    Generar Contraseña
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </ModernContainer>
      </ProtectedRoute>
    </ChakraProvider>
  );
}

export default UsersManagement;