// Función helper para verificar si un usuario es administrador
// Acepta tanto 'admin' como 'Administrador' para compatibilidad

export function isUserAdmin(user) {
  if (!user) return false;

  const adminRoles = ['admin', 'Administrador'];

  return adminRoles.includes(user.role) ||
         user.role?.toLowerCase() === 'admin';
}

export function checkAdminPermission(requestingUser) {
  const isAdmin = isUserAdmin(requestingUser);

  if (!isAdmin) {
    return {
      success: false,
      error: "Acceso denegado. Se requieren permisos de administrador.",
      status: 403
    };
  }

  return { success: true };
}