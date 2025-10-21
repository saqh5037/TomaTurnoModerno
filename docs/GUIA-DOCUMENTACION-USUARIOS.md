# 📘 GUÍA COMPLETA DE DOCUMENTACIÓN - MÓDULO DE GESTIÓN DE USUARIOS

## 🎯 Objetivo
Documentar TODAS las funcionalidades del módulo de Gestión de Usuarios mediante capturas de pantalla paso a paso.

## ✅ Capturas ya completadas (8/35)
- ✅ step01-login-page.png
- ✅ step02-username-entered.png
- ✅ step03-password-entered.png
- ✅ step04-dashboard-after-login.png
- ✅ step05-users-list-initial.png
- ✅ step06-users-list-scrolled.png
- ✅ step07-error-create-user.png (error)
- ✅ step35-final-users-overview.png

---

## 📋 OPERACIONES PENDIENTES A DOCUMENTAR

### 🔷 PARTE 1: CREAR NUEVO USUARIO (Pasos 7-16)

**URL**: http://localhost:3005/users

#### Paso 7: Ubicar botón "Crear Usuario"
- **Acción**: Toma screenshot mostrando el botón "Crear Usuario" en la parte superior
- **Archivo**: `step07-create-button.png`
- **Descripción**: "Botón 'Crear Usuario' ubicado en la parte superior derecha del módulo"

#### Paso 8: Click en "Crear Usuario" - Modal abierto
- **Acción**: Haz click en "Crear Usuario", espera que se abra el modal
- **Archivo**: `step08-create-modal-empty.png`
- **Descripción**: "Modal de creación de usuario con formulario vacío mostrando todos los campos: Nombre completo, Usuario, Contraseña, Rol y Estado"

#### Paso 9: Llenar campo "Nombre completo"
- **Acción**: Escribe "María González López" en el campo Nombre
- **Archivo**: `step09-name-filled.png`
- **Descripción**: "Campo 'Nombre completo' llenado con 'María González López'"

#### Paso 10: Llenar campo "Nombre de usuario"
- **Acción**: Escribe "maria.gonzalez" en el campo Usuario
- **Archivo**: `step10-username-filled.png`
- **Descripción**: "Campo 'Nombre de usuario' llenado con 'maria.gonzalez' (este será el usuario para login)"

#### Paso 11: Llenar campo "Contraseña"
- **Acción**: Escribe "Maria2024!" en el campo Contraseña
- **Archivo**: `step11-password-filled.png`
- **Descripción**: "Campo 'Contraseña' llenado (se muestra oculta por seguridad)"

#### Paso 12: Seleccionar Rol
- **Acción**: Click en selector de Rol, se despliega menú
- **Archivo**: `step12-role-dropdown.png`
- **Descripción**: "Selector de Rol desplegado mostrando opciones: Admin y Flebotomista"

#### Paso 13: Rol seleccionado
- **Acción**: Selecciona "Flebotomista"
- **Archivo**: `step13-role-selected.png`
- **Descripción**: "Rol 'Flebotomista' seleccionado para el nuevo usuario"

#### Paso 14: Seleccionar Estado
- **Acción**: Click en selector de Estado, se despliega menú
- **Archivo**: `step14-status-dropdown.png`
- **Descripción**: "Selector de Estado desplegado mostrando opciones: ACTIVE, INACTIVE, BLOCKED"

#### Paso 15: Estado seleccionado
- **Acción**: Selecciona "ACTIVE"
- **Archivo**: `step15-status-selected.png`
- **Descripción**: "Estado 'ACTIVE' seleccionado, permitiendo que el usuario pueda iniciar sesión inmediatamente"

#### Paso 16: Formulario completo antes de guardar
- **Acción**: Screenshot del formulario completo listo para guardar
- **Archivo**: `step16-form-complete.png`
- **Descripción**: "Formulario completo con todos los campos validados, listo para crear el usuario"

#### Paso 17: Click en Guardar
- **Acción**: Click en botón "Guardar"
- **Archivo**: `step17-saving.png`
- **Descripción**: "Click en botón Guardar para crear el nuevo usuario"

#### Paso 18: Usuario creado - Toast de confirmación
- **Acción**: Screenshot del toast de éxito y usuario en la tabla
- **Archivo**: `step18-user-created-success.png`
- **Descripción**: "Usuario creado exitosamente, mensaje de confirmación mostrado y usuario aparece en la tabla"

---

### 🔷 PARTE 2: BUSCAR Y FILTRAR USUARIOS (Pasos 19-22)

#### Paso 19: Campo de búsqueda
- **Acción**: Localiza el campo de búsqueda en la parte superior
- **Archivo**: `step19-search-field.png`
- **Descripción**: "Campo de búsqueda para filtrar usuarios por nombre o usuario"

#### Paso 20: Buscar "María"
- **Acción**: Escribe "María" en el campo de búsqueda
- **Archivo**: `step20-search-maria.png`
- **Descripción**: "Búsqueda activa: tabla filtrada mostrando solo usuarios que contienen 'María'"

#### Paso 21: Limpiar búsqueda
- **Acción**: Borra el texto del campo de búsqueda
- **Archivo**: `step21-search-cleared.png`
- **Descripción**: "Búsqueda limpiada, tabla muestra todos los usuarios nuevamente"

#### Paso 22: Filtro por Rol
- **Acción**: Si existe filtro por rol, selecciona "Flebotomista"
- **Archivo**: `step22-filter-by-role.png`
- **Descripción**: "Tabla filtrada mostrando solo usuarios con rol Flebotomista"

---

### 🔷 PARTE 3: EDITAR USUARIO (Pasos 23-28)

#### Paso 23: Localizar botón Editar
- **Acción**: Ubica el botón de editar del usuario María (ícono de lápiz)
- **Archivo**: `step23-edit-button.png`
- **Descripción**: "Botón de editar (ícono de lápiz) para modificar información del usuario"

#### Paso 24: Modal de edición abierto
- **Acción**: Click en editar, se abre modal con datos precargados
- **Archivo**: `step24-edit-modal-open.png`
- **Descripción**: "Modal de edición con datos actuales del usuario precargados"

#### Paso 25: Modificar nombre
- **Acción**: Cambia el nombre a "María González López - Supervisora"
- **Archivo**: `step25-name-modified.png`
- **Descripción**: "Nombre modificado para reflejar nuevo rol de supervisora"

#### Paso 26: Cambiar rol a Admin
- **Acción**: Cambia el rol de Flebotomista a Admin
- **Archivo**: `step26-role-changed-admin.png`
- **Descripción**: "Rol cambiado a 'Admin', otorgando permisos completos al usuario"

#### Paso 27: Guardar cambios
- **Acción**: Click en Guardar en el modal de edición
- **Archivo**: `step27-save-edit.png`
- **Descripción**: "Guardando cambios de edición"

#### Paso 28: Usuario editado
- **Acción**: Screenshot con toast de éxito y cambios reflejados en tabla
- **Archivo**: `step28-user-edited-success.png`
- **Descripción**: "Usuario editado exitosamente, cambios visibles en la tabla"

---

### 🔷 PARTE 4: VER DETALLES DE USUARIO (Pasos 29-30)

#### Paso 29: Click en fila de usuario
- **Acción**: Click en cualquier fila de usuario para ver detalles
- **Archivo**: `step29-click-user-row.png`
- **Descripción**: "Las filas de usuario son clickeables para ver información detallada"

#### Paso 30: Modal de detalles
- **Acción**: Se abre modal mostrando todos los detalles del usuario
- **Archivo**: `step30-user-details-modal.png`
- **Descripción**: "Modal de detalles mostrando: información completa, rol, permisos, estado, fecha de creación y último acceso"

---

### 🔷 PARTE 5: CAMBIAR ESTADO A INACTIVE (Pasos 31-34)

#### Paso 31: Menú de opciones
- **Acción**: Click en menú de opciones del usuario María (3 puntos)
- **Archivo**: `step31-options-menu.png`
- **Descripción**: "Menú de opciones desplegado mostrando acciones disponibles"

#### Paso 32: Seleccionar INACTIVE
- **Acción**: Click en opción "Cambiar a INACTIVE"
- **Archivo**: `step32-select-inactive.png`
- **Descripción**: "Opción 'Cambiar a INACTIVE' para desactivar temporalmente el usuario"

#### Paso 33: Confirmar cambio a INACTIVE
- **Acción**: Aparece diálogo de confirmación
- **Archivo**: `step33-confirm-inactive.png`
- **Descripción**: "Diálogo de confirmación para cambiar estado a INACTIVE"

#### Paso 34: Usuario INACTIVE
- **Acción**: Click en Confirmar, estado cambia
- **Archivo**: `step34-user-inactive.png`
- **Descripción**: "Usuario ahora en estado INACTIVE (badge naranja), no puede iniciar sesión hasta ser reactivado"

---

### 🔷 PARTE 6: BLOQUEAR USUARIO (Pasos 35-38)

#### Paso 35: Menú de opciones nuevamente
- **Acción**: Abrir menú de opciones del mismo usuario
- **Archivo**: `step35-menu-for-block.png`
- **Descripción**: "Menú de opciones para seleccionar bloqueo permanente"

#### Paso 36: Seleccionar BLOCKED
- **Acción**: Click en "Cambiar a BLOCKED"
- **Archivo**: `step36-select-blocked.png`
- **Descripción**: "Opción 'Cambiar a BLOCKED' para bloqueo permanente del usuario"

#### Paso 37: Confirmar bloqueo
- **Acción**: Diálogo de confirmación con advertencia
- **Archivo**: `step37-confirm-blocked.png`
- **Descripción**: "Confirmación de bloqueo con advertencia: BLOCKED es un estado permanente que requiere intervención de administrador"

#### Paso 38: Usuario BLOCKED
- **Acción**: Usuario bloqueado, badge rojo
- **Archivo**: `step38-user-blocked.png`
- **Descripción**: "Usuario en estado BLOCKED (badge rojo), completamente bloqueado del sistema"

---

### 🔷 PARTE 7: REACTIVAR USUARIO (Pasos 39-41)

#### Paso 39: Menú de opciones de usuario bloqueado
- **Acción**: Abrir menú del usuario bloqueado
- **Archivo**: `step39-menu-blocked-user.png`
- **Descripción**: "Menú de opciones mostrando opción para reactivar usuario bloqueado"

#### Paso 40: Seleccionar ACTIVE
- **Acción**: Click en "Cambiar a ACTIVE"
- **Archivo**: `step40-select-active.png`
- **Descripción**: "Opción 'Cambiar a ACTIVE' para reactivar usuario"

#### Paso 41: Usuario reactivado
- **Acción**: Usuario vuelve a estado ACTIVE
- **Archivo**: `step41-user-reactivated.png`
- **Descripción**: "Usuario reactivado exitosamente, puede iniciar sesión nuevamente"

---

### 🔷 PARTE 8: ESTADÍSTICAS Y VISTA GENERAL (Pasos 42-45)

#### Paso 42: Estadísticas superiores
- **Acción**: Scroll arriba para ver cards de estadísticas
- **Archivo**: `step42-statistics-cards.png`
- **Descripción**: "Cards de estadísticas mostrando: Total de usuarios, Usuarios activos, Admins y Flebotomistas"

#### Paso 43: Tabla completa con todos los usuarios
- **Acción**: Vista completa de la tabla
- **Archivo**: `step43-full-table.png`
- **Descripción**: "Tabla completa mostrando todos los usuarios con sus estados y roles"

#### Paso 44: Botón de actualizar
- **Acción**: Ubicar botón de actualizar/refrescar
- **Archivo**: `step44-refresh-button.png`
- **Descripción**: "Botón de actualizar para recargar la lista de usuarios"

#### Paso 45: Vista final del módulo
- **Acción**: Screenshot final del módulo completo
- **Archivo**: `step45-final-overview.png`
- **Descripción**: "Vista final completa del módulo de Gestión de Usuarios después de realizar todas las operaciones"

---

## 📊 RESUMEN DE CAPTURAS
- **Total esperado**: 45 screenshots
- **Completadas**: 8
- **Pendientes**: 37
- **Directorio**: `/public/docs/screenshots/users/`

---

## 🎬 INSTRUCCIONES PARA EL USUARIO

1. Abre http://localhost:3005/users en tu navegador
2. Sigue los pasos en orden
3. Para cada paso:
   - Realiza la acción indicada
   - Toma screenshot (Cmd+Shift+4 en Mac, Win+Shift+S en Windows)
   - Guarda con el nombre de archivo indicado
   - Guarda en: `/Users/samuelquiroz/Documents/proyectos/toma-turno/public/docs/screenshots/users/`

4. Cuando termines, me avisas y yo generaré la documentación completa con todas las imágenes

---

## 📝 NOTAS IMPORTANTES
- **CUIDADO**: No elimines usuarios reales del sistema
- Usa el usuario de prueba "María González" para las operaciones
- Si algo falla, toma screenshot del error también
- Cada screenshot debe mostrar claramente la acción que se está documentando

---

## ✨ VALOR DE ESTA DOCUMENTACIÓN
Esta documentación servirá para:
- 📚 Capacitación de nuevos usuarios
- 🔧 Soporte técnico
- 📖 Manual de usuario
- 🎓 Material de entrenamiento
- 📋 Referencia rápida

¡Excelente trabajo documentando el sistema! 🎉
