import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { useToast } from '@chakra-ui/react';

const AuthContext = createContext({});

// Rutas que NO requieren autenticación - no redirigir desde estas
const PUBLIC_ROUTES = [
  '/login',
  '/turns/queue',
  '/turns/queue_video',
  '/turns/queue-tv',
  '/announce',
  '/satisfaction-survey'
];

export const AuthProvider = ({ children }) => {
  console.log('[AuthContext] ========== PROVIDER RENDER ==========');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const toast = useToast();

  console.log('[AuthContext] State - user:', user?.name, 'loading:', loading);

  // Función de login
  const login = async (username, password) => {
    console.log('[AuthContext] login() called for username:', username);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Guardar datos en localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }

        // Actualizar estado
        setUser(data.user);

        return { success: true, role: data.user.role };
      } else {
        return { success: false, error: data.error || 'Error al iniciar sesión' };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: error.message };
    }
  };

  // Función de logout
  const logout = useCallback(async () => {
    const token = localStorage.getItem('token');

    // Llamar al endpoint de logout para limpiar sesión en BD
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('[AuthContext] Sesión cerrada en el servidor');
      } catch (error) {
        console.error('[AuthContext] Error al cerrar sesión en servidor:', error);
        // Continuar con logout local aunque falle el servidor
      }
    }

    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');

    // Limpiar estado
    setUser(null);

    // Redirigir al login solo si no estamos ya en login
    if (router.pathname !== '/login') {
      router.push('/login');
    }
  }, [router]);

  // Función para actualizar actividad
  const updateActivity = () => {
    // Por ahora solo registrar
    localStorage.setItem('lastActivity', String(Date.now()));
  };

  // Función para verificar rol
  const hasRole = (requiredRole) => {
    if (!user) return false;
    if (requiredRole === 'any') return true;

    // Admin tiene acceso a todo
    if (user.role === 'admin' || user.role === 'Admin' || user.role === 'Administrador') return true;

    // Verificar rol específico (case insensitive)
    return user.role?.toLowerCase() === requiredRole.toLowerCase();
  };

  // Función para verificar token almacenado
  const verifyStoredToken = useCallback(async () => {
    console.log('[AuthContext] verifyStoredToken() called');
    const token = localStorage.getItem('token');
    const storedUserData = localStorage.getItem('userData');

    console.log('[AuthContext] Token exists:', !!token, 'UserData exists:', !!storedUserData);

    if (!token) {
      console.log('[AuthContext] No token found, setting loading = false');
      setLoading(false);
      return false;
    }

    // Si hay datos de usuario almacenados, usarlos inmediatamente
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        console.log('[AuthContext] Setting user from localStorage:', userData.name);
        setUser(userData);
        setLoading(false);
        console.log('[AuthContext] User set, loading = false');

        // Verificar token en background sin bloquear
        console.log('[AuthContext] Verifying token in background...');
        fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        }).then(response => response.json())
          .then(data => {
            if (data.success && data.valid) {
              // Actualizar datos del usuario si cambió algo
              if (JSON.stringify(data.user) !== JSON.stringify(userData)) {
                setUser(data.user);
                localStorage.setItem('userData', JSON.stringify(data.user));
              }
            } else if (data.error === 'Token expirado' || data.error === 'Token inválido') {
              // Solo limpiar si el token realmente expiró o es inválido
              localStorage.removeItem('token');
              localStorage.removeItem('userData');
              localStorage.removeItem('refreshToken');
              setUser(null);
              // NO redirigir si estamos en una ruta pública
              if (!PUBLIC_ROUTES.includes(router.pathname)) {
                router.push('/login');
              }
            }
          }).catch(error => {
            // En caso de error de red, mantener la sesión local
            console.log('Error de red verificando token, manteniendo sesión local');
          });

        return true;
      } catch (error) {
        console.error('Error parsing userData:', error);
        setLoading(false);
        return false;
      }
    }

    // Si no hay datos locales, verificar token
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success && data.valid) {
        setUser(data.user);
        localStorage.setItem('userData', JSON.stringify(data.user));
        setLoading(false);
        return true;
      } else {
        // Token inválido
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Error verificando token:', error);
      setLoading(false);
      return false;
    }
  }, [router]);

  // Función para refrescar token
  const refreshToken = async () => {
    const token = localStorage.getItem('token');
    const refresh = localStorage.getItem('refreshToken');

    if (!token) return false;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          refreshToken: refresh
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        localStorage.setItem('userData', JSON.stringify(data.user));
        setUser(data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error renovando token:', error);
      return false;
    }
  };

  // Effect para inicialización
  useEffect(() => {
    console.log('[AuthContext] useEffect - Initial verification starting');
    verifyStoredToken();
  }, [verifyStoredToken]);

  // Effect para auto-renovación de token (cada 30 minutos)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshToken();
    }, 30 * 60 * 1000); // 30 minutos

    return () => clearInterval(interval);
  }, [user]);

  // Effect para detectar inactividad (20 minutos)
  useEffect(() => {
    if (!user) return;

    let inactivityTimer;
    let warningTimer;

    const resetTimers = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (warningTimer) clearTimeout(warningTimer);

      // Warning a los 15 minutos
      warningTimer = setTimeout(() => {
        toast({
          title: 'Sesión por expirar',
          description: 'Tu sesión se cerrará en 5 minutos por inactividad',
          status: 'warning',
          duration: 10000,
          isClosable: true,
        });
      }, 15 * 60 * 1000);

      // Logout a los 20 minutos
      inactivityTimer = setTimeout(async () => {
        toast({
          title: 'Sesión cerrada',
          description: 'Tu sesión ha sido cerrada por inactividad',
          status: 'info',
          duration: 5000,
        });

        const token = localStorage.getItem('token');

        // Llamar al endpoint de logout para liberar holdings Y cubículo
        if (token) {
          try {
            await fetch('/api/auth/logout', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            console.log('[AuthContext] Sesión cerrada en servidor por inactividad');
          } catch (e) {
            console.error('[AuthContext] Error cerrando sesión por inactividad:', e);
          }
        }

        // Limpiar localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');

        // Limpiar estado
        setUser(null);

        // Redirigir al login (solo si no estamos en ruta pública)
        if (!PUBLIC_ROUTES.includes(router.pathname)) {
          router.push('/login');
        }
      }, 20 * 60 * 1000);

      localStorage.setItem('lastActivity', String(Date.now()));
    };

    const handleActivity = () => {
      resetTimers();
    };

    // Eventos de actividad
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Iniciar timers
    resetTimers();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (warningTimer) clearTimeout(warningTimer);
    };
  }, [user, toast, router]);

  // Effect para sincronización entre pestañas
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        // Token eliminado en otra pestaña (logout)
        setUser(null);
        // NO redirigir si estamos en una ruta pública
        if (!PUBLIC_ROUTES.includes(router.pathname)) {
          router.push('/login');
        }
      } else if (e.key === 'userData' && e.newValue) {
        // Datos de usuario actualizados
        try {
          const newUserData = JSON.parse(e.newValue);
          setUser(newUserData);
        } catch (error) {
          console.error('Error parsing userData:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [router]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    updateActivity,
    hasRole,
    verifyStoredToken,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;