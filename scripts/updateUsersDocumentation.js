/**
 * Script para actualizar la documentación del módulo de Usuarios
 * con contenido MUY detallado y organizado por fases
 */

const fs = require('fs');
const path = require('path');

const DOCS_FILE = path.join(__dirname, '../lib/docs/fullDocumentation.json');

// Leer el archivo actual
const fullDocs = JSON.parse(fs.readFileSync(DOCS_FILE, 'utf-8'));

// Encontrar el índice del módulo de usuarios
const usersIndex = fullDocs.findIndex(m => m.moduleId === 'users');

if (usersIndex === -1) {
  console.error('❌ Módulo de usuarios no encontrado');
  process.exit(1);
}

// Nuevo contenido MEGA detallado para el módulo de usuarios
const updatedUsersModule = {
  ...fullDocs[usersIndex],
  "content": {
    "overview": `# 👥 Gestión de Usuarios - Módulo Completo

El módulo de Gestión de Usuarios es el **centro de administración de acceso** del Sistema de Gestión de Turnos INER. Este módulo permite a los administradores controlar completamente quién puede acceder al sistema, qué permisos tienen y cómo se gestionan las cuentas de usuario.

## 🎯 Objetivo del Módulo

Proporcionar una interfaz completa y segura para:
- **Crear** nuevos usuarios del sistema
- **Editar** información de usuarios existentes
- **Activar, Desactivar o Bloquear** cuentas de usuario
- **Asignar roles** (Administrador o Flebotomista)
- **Gestionar permisos** de acceso a módulos
- **Buscar y filtrar** usuarios de forma eficiente
- **Ver historial** y detalles completos de cada usuario

## 🔐 Seguridad y Permisos

**Solo usuarios con rol de Administrador** pueden acceder a este módulo. Los Flebotomistas NO tienen permiso para gestionar usuarios.

Todas las operaciones quedan registradas en el **log de auditoría** del sistema para trazabilidad completa.`,

    "sections": [
      {
        "id": "phase1-login",
        "title": "Fase 1: Inicio de Sesión",
        "description": "Acceso seguro al sistema",
        "content": `## 🔐 Fase 1: Inicio de Sesión al Sistema

Antes de acceder al módulo de Gestión de Usuarios, debemos autenticarnos en el sistema.

### Paso 1: Página de Login

La página de inicio de sesión es el **punto de entrada único** al Sistema de Gestión de Turnos INER.

**Elementos de la Pantalla:**
- **Logo del sistema:** Identificación visual institucional
- **Campo "Usuario":** Nombre de usuario único asignado
- **Campo "Contraseña":** Contraseña personal (texto oculto)
- **Botón "Iniciar Sesión":** Envía credenciales para autenticación

**Seguridad Implementada:**
- 🔒 Contraseñas encriptadas con bcrypt
- 🚫 Bloqueo automático después de 5 intentos fallidos (30 minutos)
- ⏱️ Sesiones expiran después de 20 minutos de inactividad
- 📝 Todos los intentos de login se registran en auditoría

### Paso 2: Ingreso de Usuario

Se completa el campo "Usuario" con el nombre de usuario asignado.

**Formato de Usuario:**
- Único en el sistema (no puede haber duplicados)
- No distingue mayúsculas/minúsculas
- Puede contener letras, números y puntos
- Ejemplos válidos: \`admin\`, \`juan.perez\`, \`maria.gonzalez\`

**Validaciones:**
- ✅ El usuario debe existir en la base de datos
- ✅ El usuario debe estar en estado ACTIVE
- ✅ El campo no puede estar vacío

### Paso 3: Ingreso de Contraseña

Se completa el campo "Contraseña" con la contraseña personal.

**Requisitos de Contraseña:**
- **Longitud mínima:** 6 caracteres
- **Recomendado:** Combinar mayúsculas, minúsculas, números y símbolos
- **Ejemplos seguros:** \`Admin2024!\`, \`Maria@123\`, \`Pedro#456\`

**Por Seguridad:**
- Los caracteres se muestran ocultos (••••••)
- La contraseña nunca se almacena en texto plano
- Se recomienda cambiarla cada 90 días

### Paso 4: Dashboard Principal

Después de autenticación exitosa, el usuario es redirigido al **Dashboard Administrativo**.

**Elementos del Dashboard:**
- 📊 **Métricas en tiempo real:** Pacientes en cola, tiempos promedio, etc.
- 🔔 **Notificaciones:** Alertas del sistema
- 🧭 **Menú de navegación:** Acceso a todos los módulos
- 👤 **Perfil de usuario:** Nombre, rol y foto (esquina superior derecha)
- 🚪 **Cerrar sesión:** Botón para salir de forma segura

Desde aquí podemos navegar al **Módulo de Gestión de Usuarios**.`
      },
      {
        "id": "phase2-navigation",
        "title": "Fase 2: Navegación al Módulo de Usuarios",
        "description": "Acceso e interfaz del módulo",
        "content": `## 👥 Fase 2: Módulo de Gestión de Usuarios

### Paso 5: Vista Inicial del Módulo

Al acceder a \`/users\`, se presenta la interfaz completa de gestión de usuarios.

**Componentes Principales:**

#### 📊 Tarjetas de Estadísticas (Superior)

Cuatro cards informativos con métricas en tiempo real:

1. **Total de Usuarios**
   - Cuenta total de usuarios en el sistema
   - Incluye ACTIVE, INACTIVE y BLOCKED

2. **Usuarios Activos**
   - Usuarios con estado ACTIVE
   - Pueden iniciar sesión al sistema

3. **Administradores**
   - Usuarios con rol Admin
   - Tienen permisos completos

4. **Flebotomistas**
   - Usuarios con rol Flebotomista
   - Permisos limitados a atención de pacientes

#### 🔘 Botón "Crear Usuario"

- **Ubicación:** Esquina superior derecha
- **Color:** Azul primario del sistema
- **Ícono:** Símbolo de "+"
- **Función:** Abre modal para crear nuevo usuario

#### 🔍 Campo de Búsqueda

- **Ubicación:** Debajo de las estadísticas
- **Placeholder:** "Buscar por nombre o usuario..."
- **Función:** Filtrado en tiempo real
- **Búsqueda en:** Nombre completo y nombre de usuario
- **No distingue:** Mayúsculas/minúsculas

#### 📋 Tabla de Usuarios

Tabla completa con todas las columnas de información:

**Columnas:**

1. **Nombre Completo**
   - Apellidos y nombres del usuario
   - Ejemplo: "Juan Pérez González"

2. **Usuario**
   - Nombre de usuario para login
   - Ejemplo: "juan.perez"
   - Se muestra en monospace

3. **Rol**
   - Badge con código de color:
     - 🔵 **Admin** (azul): Permisos completos
     - 🟣 **Flebotomista** (morado): Permisos limitados

4. **Estado**
   - Badge con código de color:
     - 🟢 **ACTIVE** (verde): Usuario activo
     - 🟠 **INACTIVE** (naranja): Temporalmente deshabilitado
     - 🔴 **BLOCKED** (rojo): Bloqueado permanentemente

5. **Acciones**
   - Botones de acción rápida:
     - ✏️ **Editar:** Modificar información
     - ⋮ **Menú:** Opciones adicionales

### Paso 6: Tabla de Usuarios Completa

Vista detallada de la tabla después de hacer scroll.

**Funcionalidades de la Tabla:**

#### Ordenamiento Automático:
1. Usuarios **Administradores** primero
2. Luego usuarios **Flebotomistas**
3. Dentro de cada grupo:
   - **ACTIVE** primero
   - **INACTIVE** después
   - **BLOCKED** al final

#### Información Visible por Fila:
- Avatar o inicial del usuario
- Nombre completo destacado en negrita
- Usuario en texto gris y monospace
- Badges visuales de rol y estado
- Botones de acción siempre visibles

#### Interacciones Disponibles:
- **Click en fila:** Ver detalles completos
- **Hover:** Resaltar fila con color de fondo
- **Botón editar:** Abrir modal de edición
- **Menú opciones:** Cambiar estado, ver más opciones`
      },
      {
        "id": "phase3-create",
        "title": "Fase 3: Crear Nuevo Usuario",
        "description": "Proceso completo de creación paso a paso",
        "content": `## ➕ Fase 3: Crear Nuevo Usuario - Proceso Completo

La creación de un nuevo usuario es un proceso paso a paso con validación en cada campo.

### Paso 7: Botón "Crear Usuario"

**Ubicación y Características:**
- Botón ubicado en la esquina superior derecha del módulo
- Color azul primario (\`blue.500\`)
- Ícono de "+" (FaPlus) a la izquierda del texto
- Texto: "Crear Usuario"
- Siempre visible, no requiere scroll

**Permisos Necesarios:**
- Solo usuarios con rol **Admin** ven este botón
- Los Flebotomistas NO tienen acceso

### Paso 8: Modal de Creación Abierto

Al hacer click en "Crear Usuario", se abre un **Drawer lateral** (modal deslizante).

**Características del Modal:**
- **Posición:** Se desliza desde la derecha
- **Ancho:** Ocupa ~40% de la pantalla
- **Fondo oscuro:** Overlay semi-transparente detrás
- **Encabezado:** "Crear Nuevo Usuario" con botón X para cerrar
- **Cuerpo:** Formulario con todos los campos
- **Footer:** Botones "Cancelar" y "Guardar"

**Campos del Formulario:**

1. **Nombre Completo** (Requerido)
   - Label: "Nombre completo"
   - Tipo: Input de texto
   - Validación: Mínimo 3 caracteres

2. **Nombre de Usuario** (Requerido)
   - Label: "Nombre de usuario"
   - Tipo: Input de texto
   - Validación:
     - Único en el sistema
     - Sin espacios
     - Solo letras, números y puntos

3. **Contraseña** (Requerido)
   - Label: "Contraseña"
   - Tipo: Input password
   - Validación: Mínimo 6 caracteres
   - Incluye botón para mostrar/ocultar

4. **Rol** (Requerido)
   - Label: "Rol"
   - Tipo: Select/Dropdown
   - Opciones:
     - Admin
     - Flebotomista

5. **Estado** (Requerido)
   - Label: "Estado"
   - Tipo: Select/Dropdown
   - Opciones:
     - ACTIVE
     - INACTIVE
     - BLOCKED

### Paso 9-11: Llenado de Campos

**Paso 9 - Nombre Completo:**
- Se ingresa: "María González López"
- Validación en vivo: ✅ Verde si es válido
- Error: ❌ Rojo si es muy corto

**Paso 10 - Usuario:**
- Se ingresa: "maria.gonzalez"
- Sistema verifica unicidad en tiempo real
- Si existe: Muestra error "Usuario ya existe"
- Si es válido: ✅ Marca verde

**Paso 11 - Contraseña:**
- Se ingresa: "Maria2024!"
- Se muestra oculta: •••••••••
- Indicador de fuerza:
  - 🔴 Débil: Solo números o letras
  - 🟡 Media: Letras y números
  - 🟢 Fuerte: Mayúsculas, minúsculas, números y símbolos

### Paso 12: Formulario Completo

**Estado del Formulario:**
- ✅ Todos los campos llenados
- ✅ Todas las validaciones pasadas
- ✅ Botón "Guardar" habilitado (ya no está gris)
- ✅ Listo para enviar

**Vista Previa de Datos:**
- Nombre: María González López
- Usuario: maria.gonzalez
- Rol: Flebotomista (seleccionado)
- Estado: ACTIVE (seleccionado)

### Paso 13: Usuario Creado Exitosamente

**Acción del Sistema:**
1. Se envía petición POST a \`/api/users\`
2. Backend valida datos nuevamente
3. Se encripta la contraseña con bcrypt
4. Se guarda en base de datos
5. Se registra en log de auditoría

**Respuesta Visual:**
- ✅ **Toast de confirmación verde** (esquina superior derecha)
- Mensaje: "Usuario creado exitosamente"
- Modal se cierra automáticamente
- Tabla se recarga mostrando el nuevo usuario
- Usuario aparece en la lista con sus datos

**Nuevo Usuario en la Tabla:**
- Aparece con badge verde "ACTIVE"
- Badge morado "Flebotomista"
- Botones de acción disponibles
- Puede ser editado inmediatamente`
      },
      {
        "id": "phase4-search",
        "title": "Fase 4: Búsqueda y Filtros",
        "description": "Encontrar usuarios de forma eficiente",
        "content": `## 🔍 Fase 4: Búsqueda y Filtros - Sistema Inteligente

El sistema de búsqueda permite encontrar usuarios rápidamente sin necesidad de scroll infinito.

### Paso 14: Campo de Búsqueda

**Características:**
- **Ubicación:** Debajo de las estadísticas, encima de la tabla
- **Ícono:** Lupa (FaSearch) a la izquierda
- **Placeholder:** "Buscar por nombre o usuario..."
- **Ancho:** 100% en móvil, ~400px en desktop

**Funcionamiento:**
- 🔴 **Búsqueda en tiempo real:** No requiere presionar Enter
- 🔴 **Debounce de 300ms:** Espera a que termines de escribir
- 🔴 **Case insensitive:** No importa mayúsculas/minúsculas
- 🔴 **Búsqueda en:** Nombre completo Y nombre de usuario

### Paso 15: Búsqueda Activa - "Pedro"

**Acción:** Se escribe "Pedro" en el campo de búsqueda

**Proceso del Sistema:**
1. Detecta el cambio en el input
2. Espera 300ms (debounce)
3. Filtra la lista de usuarios
4. Muestra solo coincidencias

**Resultados:**
- Tabla se actualiza instantáneamente
- Muestra solo usuarios que contienen "Pedro" en:
  - Nombre completo: "**Pedro** Martínez"
  - Usuario: "**pedro**.martinez"
- Texto coincidente NO se resalta (opcional mejora futura)
- Si no hay resultados: Mensaje "No se encontraron usuarios"

**Contador:**
- Muestra: "Mostrando X de Y usuarios"
- Ejemplo: "Mostrando 2 de 15 usuarios"

### Paso 16: Búsqueda Limpiada

**Acción:** Se borra el contenido del campo de búsqueda

**Resultado:**
- Tabla vuelve a mostrar **todos** los usuarios
- Se restaura el ordenamiento original:
  - Admins primero
  - Flebotomistas después
  - ACTIVE antes que INACTIVE/BLOCKED
- Contador muestra total: "Mostrando 15 de 15 usuarios"

### Paso 17: Búsqueda por Palabra Clave - "admin"

**Acción:** Se escribe "admin" en el campo de búsqueda

**Resultados Típicos:**
- Usuario "admin" (usuario de sistema)
- "Admin User" (nombre contiene admin)
- "Maria Admin" (apellido Admin)
- "admin.support" (usuario contiene admin)

**Uso Práctico:**
- Buscar todos los administradores: "admin"
- Buscar todos los flebotomistas: "flebo"
- Buscar por apellido: "gonzalez"
- Buscar por nombre: "maria"

**Rendimiento:**
- Búsqueda optimizada con índices en BD
- Respuesta instantánea incluso con 1000+ usuarios
- No afecta el performance del sistema`
      },
      {
        "id": "phase5-statistics",
        "title": "Fase 5: Estadísticas y Vistas Finales",
        "description": "Métricas y resumen del módulo",
        "content": `## 📊 Fase 5: Estadísticas y Vistas Finales

### Paso 18: Estadísticas del Módulo

**Tarjetas de Métricas (Superior):**

#### 1. Total de Usuarios
- **Valor:** Cuenta total de usuarios
- **Incluye:** Todos los estados (ACTIVE + INACTIVE + BLOCKED)
- **Color:** Azul (\`blue.500\`)
- **Ícono:** FaUsers
- **Ejemplo:** "15 usuarios"

#### 2. Usuarios Activos
- **Valor:** Solo usuarios con estado ACTIVE
- **Cálculo:** \`COUNT WHERE status = 'ACTIVE'\`
- **Color:** Verde (\`green.500\`)
- **Ícono:** FaUserCheck
- **Ejemplo:** "12 activos"
- **Porcentaje:** Se muestra "80%" si 12 de 15 están activos

#### 3. Administradores
- **Valor:** Usuarios con rol Admin
- **Cálculo:** \`COUNT WHERE role = 'Admin'\`
- **Color:** Púrpura (\`purple.500\`)
- **Ícono:** FaUserShield
- **Ejemplo:** "3 admins"
- **Indicador:** Muestra "20%" del total

#### 4. Flebotomistas
- **Valor:** Usuarios con rol Flebotomista
- **Cálculo:** \`COUNT WHERE role = 'Flebotomista'\`
- **Color:** Cyan (\`cyan.500\`)
- **Ícono:** FaUser
- **Ejemplo:** "12 flebos"
- **Indicador:** Muestra "80%" del total

**Actualización:**
- Métricas se actualizan automáticamente al:
  - Crear usuario
  - Editar rol
  - Cambiar estado
  - Eliminar usuario

### Paso 19: Vista Final Completa

**Vista General del Módulo:**

Después de realizar todas las operaciones (crear, buscar, editar, cambiar estados), el módulo muestra:

1. **Estadísticas Actualizadas**
   - Reflejan los cambios realizados
   - Totales correctos y precisos

2. **Tabla Completa**
   - Todos los usuarios visibles
   - Ordenamiento correcto aplicado
   - Nuevos usuarios integrados

3. **Estado Consistente**
   - Sin errores en consola
   - Performance óptimo
   - UX fluida y responsiva

### Paso 20: Tabla Final Actualizada

**Vista de la Tabla con Todos los Cambios:**

- ✅ **Nuevos usuarios creados:** Visibles en su posición correcta
- ✅ **Usuarios editados:** Cambios reflejados
- ✅ **Estados actualizados:** Badges con colores correctos
- ✅ **Búsquedas funcionales:** Filtrado preciso
- ✅ **Acciones disponibles:** Todos los botones activos

**Datos Visualizados:**

Para cada usuario se muestra:
- Avatar o inicial
- Nombre completo en negrita
- Usuario en gris claro
- Badge de rol (Admin/Flebotomista)
- Badge de estado (ACTIVE/INACTIVE/BLOCKED)
- Fecha de último acceso (hover tooltip)
- Botones de acción (editar, menú)

**Información Adicional (Hover):**
- Fecha de creación del usuario
- Último inicio de sesión
- Número total de sesiones
- Fecha de última modificación

**Interacciones Disponibles:**
- Click en fila → Ver detalles completos
- Botón editar → Modificar usuario
- Menú opciones → Cambiar estado, más acciones
- Ordenar por columna (futuro)
- Exportar a Excel/PDF (futuro)`
      }
    ],
    "features": [
      "✅ Creación de usuarios con validación en tiempo real",
      "✅ Edición completa de información de usuarios",
      "✅ Asignación de roles (Admin, Flebotomista)",
      "✅ Control de estados (ACTIVE, INACTIVE, BLOCKED)",
      "✅ Búsqueda inteligente en tiempo real",
      "✅ Filtrado por nombre y usuario",
      "✅ Estadísticas en tiempo real",
      "✅ Auditoría completa de cambios",
      "✅ Interfaz intuitiva y responsiva",
      "✅ Validaciones de seguridad robustas"
    ],
    "screenshots": [
      {
        "filename": "01-login-page.png",
        "name": "login-page",
        "description": "Página de inicio de sesión del sistema con campos de usuario y contraseña",
        "tags": ["login", "seguridad", "acceso"],
        "path": "/docs/screenshots/users/01-login-page.png"
      },
      {
        "filename": "02-username-entered.png",
        "name": "username-entered",
        "description": "Campo de usuario completado con 'admin'",
        "tags": ["login", "usuario"],
        "path": "/docs/screenshots/users/02-username-entered.png"
      },
      {
        "filename": "03-password-entered.png",
        "name": "password-entered",
        "description": "Campo de contraseña completado (texto oculto por seguridad)",
        "tags": ["login", "contraseña", "seguridad"],
        "path": "/docs/screenshots/users/03-password-entered.png"
      },
      {
        "filename": "04-dashboard.png",
        "name": "dashboard",
        "description": "Dashboard principal después de autenticación exitosa",
        "tags": ["dashboard", "inicio"],
        "path": "/docs/screenshots/users/04-dashboard.png"
      },
      {
        "filename": "05-users-initial.png",
        "name": "users-initial",
        "description": "Vista inicial del módulo de Gestión de Usuarios con estadísticas y tabla",
        "tags": ["usuarios", "módulo", "vista-inicial"],
        "path": "/docs/screenshots/users/05-users-initial.png"
      },
      {
        "filename": "06-users-table.png",
        "name": "users-table",
        "description": "Tabla completa de usuarios mostrando nombre, usuario, rol, estado y acciones",
        "tags": ["usuarios", "tabla", "lista"],
        "path": "/docs/screenshots/users/06-users-table.png"
      },
      {
        "filename": "07-create-button-located.png",
        "name": "create-button",
        "description": "Botón 'Crear Usuario' ubicado en la esquina superior derecha",
        "tags": ["crear", "botón", "acción"],
        "path": "/docs/screenshots/users/07-create-button-located.png"
      },
      {
        "filename": "08-create-modal-opened.png",
        "name": "create-modal",
        "description": "Modal de creación de usuario con formulario completo",
        "tags": ["crear", "modal", "formulario"],
        "path": "/docs/screenshots/users/08-create-modal-opened.png"
      },
      {
        "filename": "09-name-field-filled.png",
        "name": "name-filled",
        "description": "Campo 'Nombre completo' llenado con 'María González López'",
        "tags": ["crear", "nombre", "formulario"],
        "path": "/docs/screenshots/users/09-name-field-filled.png"
      },
      {
        "filename": "10-username-field-filled.png",
        "name": "username-filled",
        "description": "Campo 'Usuario' llenado con 'maria.gonzalez'",
        "tags": ["crear", "usuario", "formulario"],
        "path": "/docs/screenshots/users/10-username-field-filled.png"
      },
      {
        "filename": "11-password-field-filled.png",
        "name": "password-filled",
        "description": "Campo 'Contraseña' llenado con contraseña segura",
        "tags": ["crear", "contraseña", "formulario"],
        "path": "/docs/screenshots/users/11-password-field-filled.png"
      },
      {
        "filename": "16-form-complete-ready.png",
        "name": "form-complete",
        "description": "Formulario completo con todos los campos validados, listo para guardar",
        "tags": ["crear", "formulario", "completo"],
        "path": "/docs/screenshots/users/16-form-complete-ready.png"
      },
      {
        "filename": "17-user-created-success.png",
        "name": "user-created",
        "description": "Confirmación de usuario creado exitosamente, visible en la tabla",
        "tags": ["crear", "éxito", "confirmación"],
        "path": "/docs/screenshots/users/17-user-created-success.png"
      },
      {
        "filename": "18-search-field.png",
        "name": "search-field",
        "description": "Campo de búsqueda para filtrar usuarios en tiempo real",
        "tags": ["buscar", "filtrar", "búsqueda"],
        "path": "/docs/screenshots/users/18-search-field.png"
      },
      {
        "filename": "19-search-pedro.png",
        "name": "search-pedro",
        "description": "Resultados de búsqueda mostrando solo usuarios que contienen 'Pedro'",
        "tags": ["buscar", "resultados", "filtro"],
        "path": "/docs/screenshots/users/19-search-pedro.png"
      },
      {
        "filename": "20-search-cleared.png",
        "name": "search-cleared",
        "description": "Búsqueda limpiada, tabla muestra nuevamente todos los usuarios",
        "tags": ["buscar", "limpiar"],
        "path": "/docs/screenshots/users/20-search-cleared.png"
      },
      {
        "filename": "21-search-admin.png",
        "name": "search-admin",
        "description": "Búsqueda de 'admin' mostrando usuarios administrativos",
        "tags": ["buscar", "admin", "filtro"],
        "path": "/docs/screenshots/users/21-search-admin.png"
      },
      {
        "filename": "41-statistics.png",
        "name": "statistics",
        "description": "Tarjetas de estadísticas mostrando totales por estado y rol",
        "tags": ["estadísticas", "métricas", "totales"],
        "path": "/docs/screenshots/users/41-statistics.png"
      },
      {
        "filename": "39-final-overview.png",
        "name": "final-overview",
        "description": "Vista final completa del módulo después de realizar todas las operaciones",
        "tags": ["vista-final", "completo"],
        "path": "/docs/screenshots/users/39-final-overview.png"
      },
      {
        "filename": "40-final-table.png",
        "name": "final-table",
        "description": "Tabla final actualizada con todos los usuarios y estados correctos",
        "tags": ["tabla", "final", "actualizada"],
        "path": "/docs/screenshots/users/40-final-table.png"
      }
    ],
    "tips": [
      "💡 Usa nombres de usuario descriptivos (ej: 'juan.perez' en lugar de 'user123')",
      "💡 La búsqueda funciona en tiempo real, no necesitas presionar Enter",
      "💡 Cambia el estado a INACTIVE para licencias temporales (vacaciones, permisos)",
      "💡 Usa BLOCKED solo para bajas definitivas o usuarios con problemas de seguridad",
      "💡 Revisa periódicamente usuarios INACTIVE para mantener la base de datos limpia",
      "💡 Los badges de colores te ayudan a identificar rápidamente el estado y rol",
      "💡 Puedes hacer click en cualquier fila para ver detalles completos del usuario",
      "💡 Todas las contraseñas deben tener al menos 6 caracteres",
      "💡 Las métricas se actualizan automáticamente al hacer cambios"
    ],
    "warnings": [
      "⚠️ Los cambios en permisos toman efecto INMEDIATAMENTE, el usuario deberá reiniciar sesión",
      "⚠️ Un usuario BLOCKED no puede ser activado sin permiso especial de administrador",
      "⚠️ Todos los cambios quedan registrados en el log de auditoría con tu usuario y timestamp",
      "⚠️ No elimines al último usuario Admin del sistema o perderás acceso administrativo",
      "⚠️ Las contraseñas no se pueden recuperar, solo resetear",
      "⚠️ Usuarios INACTIVE con más de 90 días podrían ser purgados automáticamente",
      "⚠️ Al cambiar el rol de un usuario de Admin a Flebotomista, perderá acceso a módulos administrativos inmediatamente"
    ]
  }
};

// Actualizar el módulo en el array
fullDocs[usersIndex] = updatedUsersModule;

// Guardar el archivo actualizado
fs.writeFileSync(DOCS_FILE, JSON.stringify(fullDocs, null, 2), 'utf-8');

console.log('✅ Módulo de Usuarios actualizado exitosamente');
console.log(`📊 Total de secciones: ${updatedUsersModule.content.sections.length}`);
console.log(`📸 Total de screenshots: ${updatedUsersModule.content.screenshots.length}`);
console.log(`💡 Total de tips: ${updatedUsersModule.content.tips.length}`);
console.log(`⚠️  Total de warnings: ${updatedUsersModule.content.warnings.length}`);
console.log(`\n📁 Archivo actualizado: ${DOCS_FILE}`);
