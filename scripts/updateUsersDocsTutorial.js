const fs = require('fs');
const path = require('path');

const fullDocPath = path.join(__dirname, '../lib/docs/fullDocumentation.json');
const fullDocumentation = JSON.parse(fs.readFileSync(fullDocPath, 'utf8'));

// Encontrar el módulo de usuarios
const usersModuleIndex = fullDocumentation.findIndex(m => m.moduleId === 'users');

if (usersModuleIndex === -1) {
  console.error('❌ Módulo de usuarios no encontrado');
  process.exit(1);
}

// Crear documentación estilo Claude Docs - Tutorial autoexplicativo
const updatedUsersModule = {
  ...fullDocumentation[usersModuleIndex],
  content: {
    overview: `# Gestión de Usuarios

El módulo de **Gestión de Usuarios** te permite administrar el personal del sistema de manera completa y segura. Con este módulo podrás crear, editar, desactivar y controlar el acceso de todos los usuarios del sistema.

## ¿Qué aprenderás en esta guía?

En este tutorial aprenderás a:
- ✅ Acceder al módulo de gestión de usuarios
- ✅ Crear nuevos usuarios con diferentes roles
- ✅ Buscar y filtrar usuarios en el sistema
- ✅ Editar información de usuarios existentes
- ✅ Gestionar estados de usuarios (Activo, Inactivo, Bloqueado)
- ✅ Interpretar las estadísticas del módulo

## Antes de comenzar

### Requisitos previos

Para seguir este tutorial necesitas:
- ✓ Tener credenciales de acceso al sistema
- ✓ Contar con rol de **Administrador**
- ✓ Acceso al sistema en \`http://localhost:3005\`

### Conceptos clave

**Usuario**: Persona con acceso al sistema. Puede ser Administrador o Flebotomista.

**Rol**: Define los permisos y funcionalidades disponibles:
- **Admin**: Acceso completo al sistema
- **Flebotomista**: Acceso a gestión de turnos y atención de pacientes

**Estado**: Indica el nivel de acceso actual:
- **ACTIVE**: Usuario con acceso completo
- **INACTIVE**: Usuario temporalmente deshabilitado
- **BLOCKED**: Usuario permanentemente bloqueado

---

## Tutorial completo paso a paso`,

    sections: [
      {
        id: "step-1-login",
        title: "Paso 1: Inicia sesión en el sistema",
        description: "Accede al sistema con tus credenciales de administrador",
        content: `## Paso 1: Inicia sesión en el sistema

Para comenzar a gestionar usuarios, primero debes iniciar sesión con una cuenta de administrador.

### 1.1 Accede a la página de login

Abre tu navegador y dirígete a:

\`\`\`
http://localhost:3005/login
\`\`\`

Verás la pantalla de inicio de sesión del sistema.

![Página de login](/docs/screenshots/users/01-login-page.png)

### 1.2 Ingresa tu nombre de usuario

En el campo **"Usuario"**, escribe tu nombre de usuario. Para este tutorial usaremos:

\`\`\`
admin
\`\`\`

![Usuario ingresado](/docs/screenshots/users/02-username-entered.png)

> **💡 Tip**: El campo de usuario no distingue entre mayúsculas y minúsculas.

### 1.3 Ingresa tu contraseña

En el campo **"Contraseña"**, escribe tu contraseña. Para el usuario de prueba:

\`\`\`
123
\`\`\`

![Contraseña ingresada](/docs/screenshots/users/03-password-entered.png)

> **⚠️ Importante**: En producción, usa contraseñas seguras con al menos 8 caracteres, mayúsculas, minúsculas y números.

### 1.4 Haz clic en "Iniciar Sesión"

Presiona el botón **"Iniciar Sesión"** para acceder al sistema.

Si las credenciales son correctas, serás redirigido al **Dashboard Principal**.

![Dashboard principal](/docs/screenshots/users/04-dashboard.png)

### ¿Qué sucede al iniciar sesión?

Cuando inicias sesión correctamente:

1. ✅ El sistema valida tus credenciales en la base de datos
2. ✅ Genera un **token JWT** con vigencia de 8 horas
3. ✅ Crea una sesión en el servidor
4. ✅ Te redirige al Dashboard según tu rol
5. ✅ Registra el evento en los logs de auditoría

> **📌 Nota**: Si ingresas credenciales incorrectas 5 veces, tu cuenta será bloqueada por 30 minutos por seguridad.

---`
      },
      {
        id: "step-2-navigate",
        title: "Paso 2: Navega al módulo de usuarios",
        description: "Accede al módulo de gestión de usuarios desde el dashboard",
        content: `## Paso 2: Navega al módulo de usuarios

Una vez en el Dashboard, ubicarás y accederás al módulo de Gestión de Usuarios.

### 2.1 Localiza la tarjeta "Gestión de Usuarios"

En el Dashboard Principal, busca la tarjeta con el ícono **👥** y el título **"Gestión de Usuarios"**.

Esta tarjeta muestra:
- **Icono**: 👥 (representa usuarios)
- **Título**: Gestión de Usuarios
- **Descripción**: "Administra los usuarios del sistema"
- **Botón**: "Ver Documentación" o "Acceder"

### 2.2 Haz clic en la tarjeta

Haz clic en cualquier parte de la tarjeta o en el botón **"Acceder"** para entrar al módulo.

### 2.3 Vista inicial del módulo

Serás redirigido a \`/users\` y verás la interfaz completa del módulo:

![Vista inicial del módulo](/docs/screenshots/users/05-users-initial.png)

### Componentes de la interfaz

La pantalla del módulo de usuarios contiene:

#### 📊 Panel de estadísticas (parte superior)

Muestra cards con métricas clave:
- **Total de usuarios**: Contador de usuarios en el sistema
- **Usuarios activos**: Usuarios con estado ACTIVE
- **Usuarios inactivos**: Usuarios con estado INACTIVE
- **Administradores**: Usuarios con rol Admin
- **Flebotomistas**: Usuarios con rol Flebotomista

#### 🔍 Barra de búsqueda

Campo de texto para filtrar usuarios por nombre o username en tiempo real.

#### ➕ Botón "Crear Usuario"

Botón prominente para agregar nuevos usuarios al sistema.

#### 📋 Tabla de usuarios

Tabla con columnas:
- **Nombre**: Nombre completo del usuario
- **Usuario**: Username para login
- **Rol**: Admin o Flebotomista
- **Estado**: Badge con color según estado (verde=ACTIVE, gris=INACTIVE, rojo=BLOCKED)
- **Acciones**: Botones para Ver, Editar, Cambiar Estado

![Tabla de usuarios](/docs/screenshots/users/06-users-table.png)

> **💡 Tip**: Las estadísticas se actualizan automáticamente cada vez que creas, editas o cambias el estado de un usuario.

---`
      },
      {
        id: "step-3-create-user",
        title: "Paso 3: Crea un nuevo usuario",
        description: "Aprende a crear usuarios con diferentes roles y configuraciones",
        content: `## Paso 3: Crea un nuevo usuario

Ahora aprenderás a crear un nuevo usuario en el sistema paso a paso.

### 3.1 Abre el modal de creación

Haz clic en el botón **"Crear Usuario"** (botón verde con ícono ➕) ubicado en la parte superior derecha de la tabla.

### 3.2 Completa el formulario

Se abrirá un modal con el formulario de creación. Completa los siguientes campos:

#### Campo: Nombre completo

Ingresa el nombre completo del usuario:

\`\`\`
Ejemplo: Pedro García López
\`\`\`

**Validaciones**:
- ✓ Mínimo 3 caracteres
- ✓ Solo letras y espacios
- ✓ No debe estar vacío

#### Campo: Nombre de usuario

Ingresa un username único para el login:

\`\`\`
Ejemplo: pgarcia
\`\`\`

**Validaciones**:
- ✓ Mínimo 3 caracteres
- ✓ Solo letras, números y guiones bajos
- ✓ Debe ser único en el sistema
- ✓ No distingue mayúsculas/minúsculas

#### Campo: Contraseña

Define la contraseña inicial del usuario:

\`\`\`
Ejemplo: Medicina2025!
\`\`\`

**Validaciones**:
- ✓ Mínimo 8 caracteres
- ✓ Al menos una mayúscula
- ✓ Al menos una minúscula
- ✓ Al menos un número
- ✓ Puede incluir caracteres especiales

> **🔐 Seguridad**: Las contraseñas se almacenan encriptadas con bcrypt. El usuario podrá cambiarla después del primer login.

#### Campo: Rol

Selecciona el rol del usuario en el menú desplegable:

**Opciones**:
- **Admin**: Acceso completo al sistema (gestión de usuarios, estadísticas, configuración)
- **Flebotomista**: Acceso a módulos de turnos y atención de pacientes

\`\`\`
Para este ejemplo, selecciona: Flebotomista
\`\`\`

> **💡 Tip**: El rol determina qué módulos y funcionalidades verá el usuario en su Dashboard.

### 3.3 Revisa la información

Antes de crear el usuario, verifica que toda la información sea correcta:

- ✅ Nombre completo sin errores ortográficos
- ✅ Username único y fácil de recordar
- ✅ Contraseña que cumpla los requisitos de seguridad
- ✅ Rol apropiado para las funciones del usuario

### 3.4 Haz clic en "Crear"

Presiona el botón **"Crear"** (botón verde) en la parte inferior del modal.

### 3.5 Confirmación exitosa

Si todo es correcto, verás:

1. ✅ **Mensaje de éxito**: Toast notification verde indicando "Usuario creado exitosamente"
2. ✅ **Modal se cierra**: El formulario desaparece automáticamente
3. ✅ **Tabla actualizada**: El nuevo usuario aparece en la tabla
4. ✅ **Estadísticas actualizadas**: Los contadores reflejan el nuevo usuario

> **📝 Registro de auditoría**: Cada creación de usuario queda registrada en el sistema con tu ID de usuario, fecha/hora y datos del usuario creado.

### Ejemplo completo

Aquí está un ejemplo completo de creación de usuario:

| Campo | Valor |
|-------|-------|
| Nombre completo | Pedro García López |
| Username | pgarcia |
| Contraseña | Medicina2025! |
| Rol | Flebotomista |
| Estado inicial | ACTIVE (asignado automáticamente) |

### ¿Qué sucede internamente?

Cuando creas un usuario:

1. 📝 Se validan todos los campos en el cliente y servidor
2. 🔒 La contraseña se encripta con bcrypt (10 rounds)
3. 💾 Se crea el registro en la base de datos
4. 📊 Se actualiza el contador de usuarios
5. 📋 Se registra la acción en AuditLog
6. 🔔 Se envía notificación de éxito al cliente

---`
      },
      {
        id: "step-4-search",
        title: "Paso 4: Busca y filtra usuarios",
        description: "Usa la búsqueda en tiempo real para encontrar usuarios específicos",
        content: `## Paso 4: Busca y filtra usuarios

El módulo incluye una potente función de búsqueda en tiempo real que te permite encontrar usuarios rápidamente.

### 4.1 Localiza el campo de búsqueda

En la parte superior de la tabla, encontrarás un campo de texto con placeholder:

\`\`\`
🔍 Buscar por nombre o usuario...
\`\`\`

![Campo de búsqueda](/docs/screenshots/users/18-search-field.png)

### 4.2 Realiza una búsqueda

Escribe el nombre o username que deseas buscar. La búsqueda funciona en **tiempo real** (mientras escribes).

#### Ejemplo 1: Buscar por nombre

Escribe en el campo:

\`\`\`
Pedro
\`\`\`

La tabla se filtrará automáticamente mostrando solo los usuarios que contengan "Pedro" en su nombre.

![Búsqueda: Pedro](/docs/screenshots/users/19-search-pedro.png)

#### Ejemplo 2: Buscar por username

Escribe en el campo:

\`\`\`
admin
\`\`\`

La tabla mostrará solo los usuarios cuyo username contenga "admin".

![Búsqueda: admin](/docs/screenshots/users/21-search-admin.png)

### 4.3 Limpia la búsqueda

Para ver todos los usuarios nuevamente:

1. Haz clic en el ícono **✖** dentro del campo de búsqueda
2. O borra el texto manualmente

La tabla volverá a mostrar todos los usuarios.

![Búsqueda limpiada](/docs/screenshots/users/20-search-cleared.png)

### Características de la búsqueda

La búsqueda del módulo tiene estas características:

#### 🚀 Búsqueda en tiempo real

- Sin necesidad de presionar "Enter" o botón de búsqueda
- Filtra mientras escribes
- Respuesta instantánea

#### 🔤 No distingue mayúsculas/minúsculas

\`\`\`
"pedro" = "Pedro" = "PEDRO"
\`\`\`

#### 📝 Busca en múltiples campos

La búsqueda funciona en:
- ✓ Nombre completo del usuario
- ✓ Username de login

#### 🎯 Coincidencia parcial

No necesitas escribir el texto completo:

\`\`\`
"ped" encontrará "Pedro García"
"gar" encontrará "Pedro García"
"pgarc" encontrará username "pgarcia"
\`\`\`

### Casos de uso comunes

#### Encontrar un usuario específico por nombre

\`\`\`
Buscar: "María"
Resultado: Muestra todos los usuarios llamados María
\`\`\`

#### Filtrar por rol usando username

\`\`\`
Buscar: "admin"
Resultado: Muestra usuarios con "admin" en su username
\`\`\`

#### Verificar si existe un usuario

\`\`\`
Buscar: username exacto
Resultado: Si aparece = ya existe, si no aparece = disponible
\`\`\`

> **💡 Tip**: La búsqueda es muy útil en sistemas con muchos usuarios. Si tienes más de 50 usuarios, úsala para encontrar rápidamente quien necesitas.

### Rendimiento

La búsqueda está optimizada para:
- ⚡ Responder en menos de 50ms
- 📊 Manejar bases de datos con 1000+ usuarios
- 🔄 No afectar el rendimiento del navegador

---`
      },
      {
        id: "step-5-edit-user",
        title: "Paso 5: Edita información de usuarios",
        description: "Modifica datos de usuarios existentes",
        content: `## Paso 5: Edita información de usuarios

Aprende a modificar la información de usuarios existentes en el sistema.

### 5.1 Localiza el usuario a editar

Usa la búsqueda o navega por la tabla hasta encontrar el usuario que deseas editar.

### 5.2 Haz clic en el botón "Editar"

En la columna **"Acciones"** de la tabla, haz clic en el botón con ícono de lápiz (✏️).

### 5.3 Modifica los campos necesarios

Se abrirá un modal con el formulario de edición precargado con los datos actuales del usuario.

#### Campos editables

**Puedes modificar**:
- ✓ Nombre completo
- ✓ Username
- ✓ Rol (Admin ↔ Flebotomista)
- ✓ Contraseña (opcional)

**No puedes modificar**:
- ✗ Fecha de creación
- ✗ Historial de acciones

### 5.4 Actualiza la contraseña (opcional)

Si necesitas cambiar la contraseña:

1. Marca el checkbox **"Cambiar contraseña"**
2. Ingresa la nueva contraseña en el campo que aparece
3. La nueva contraseña debe cumplir los requisitos de seguridad

> **🔐 Seguridad**: Si no marcas el checkbox, la contraseña actual del usuario no se modificará.

### 5.5 Cambia el rol (si es necesario)

Si necesitas cambiar el rol del usuario:

- De **Flebotomista** → **Admin**: El usuario ganará acceso a gestión de usuarios y estadísticas
- De **Admin** → **Flebotomista**: El usuario perderá acceso a módulos administrativos

> **⚠️ Importante**: Cambiar el rol afecta inmediatamente los permisos del usuario. Si tiene sesión activa, verá los cambios al recargar la página.

### 5.6 Guarda los cambios

Haz clic en el botón **"Guardar"** (botón azul) para aplicar los cambios.

### 5.7 Confirmación

Verás una notificación de éxito y la tabla se actualizará con la nueva información.

### Consideraciones importantes

#### Unicidad del username

Si intentas cambiar el username a uno que ya existe:
- ❌ El sistema rechazará el cambio
- 🔔 Verás un mensaje: "El nombre de usuario ya está en uso"
- 💡 Deberás elegir un username diferente

#### Validaciones en tiempo real

El formulario valida mientras escribes:
- ✅ Campos válidos: borde verde
- ❌ Campos inválidos: borde rojo con mensaje de error
- ⏳ Validando: borde amarillo

#### Auditoría de cambios

Cada edición queda registrada con:
- 👤 Usuario que realizó el cambio
- 📅 Fecha y hora exacta
- 📝 Valores anteriores y nuevos (old_value / new_value)
- 🌐 Dirección IP desde donde se hizo el cambio

> **📊 Seguimiento**: Los administradores pueden ver el historial completo de cambios en los logs de auditoría del sistema.

---`
      },
      {
        id: "step-6-manage-status",
        title: "Paso 6: Gestiona estados de usuarios",
        description: "Activa, desactiva o bloquea usuarios según sea necesario",
        content: `## Paso 6: Gestiona estados de usuarios

Los usuarios pueden tener tres estados diferentes. Aprende a gestionarlos correctamente.

### Estados disponibles

#### 🟢 ACTIVE (Activo)

**Características**:
- ✅ Puede iniciar sesión normalmente
- ✅ Tiene acceso completo a sus módulos
- ✅ Aparece en todas las búsquedas
- ✅ Puede realizar todas las operaciones según su rol

**Cuándo usar**: Estado normal para usuarios que trabajan activamente.

#### ⚪ INACTIVE (Inactivo)

**Características**:
- ⏸️ No puede iniciar sesión
- 📊 Aún aparece en reportes históricos
- 🔄 Puede ser reactivado fácilmente
- 💾 Mantiene todo su historial

**Cuándo usar**:
- Usuario de vacaciones
- Personal temporal fuera de temporada
- Desactivación temporal por cualquier razón

#### 🔴 BLOCKED (Bloqueado)

**Características**:
- 🚫 No puede iniciar sesión
- ⚠️ Indica bloqueo permanente o sanción
- 🔒 Requiere aprobación de administrador para reactivar
- 📝 Queda registro explícito del bloqueo

**Cuándo usar**:
- Violación de políticas de seguridad
- Usuario que ya no trabaja en la institución
- Múltiples intentos fallidos de login (bloqueo automático)

### Cómo cambiar el estado de un usuario

#### 6.1 Localiza el usuario

Encuentra el usuario en la tabla o usa la búsqueda.

#### 6.2 Haz clic en el menú de estado

En la columna **"Acciones"**, haz clic en el menú desplegable de estados (ícono ⚙️).

#### 6.3 Selecciona el nuevo estado

Aparecerá un menú con las opciones:
- 🟢 Activar
- ⚪ Desactivar
- 🔴 Bloquear

#### 6.4 Confirma el cambio

Se mostrará un diálogo de confirmación:

**Para INACTIVE**:
\`\`\`
"¿Estás seguro de desactivar este usuario?
El usuario no podrá iniciar sesión hasta que sea reactivado."
\`\`\`

**Para BLOCKED**:
\`\`\`
"¿Estás seguro de bloquear este usuario?
Esta acción indica un bloqueo permanente. ¿Deseas continuar?"
\`\`\`

Haz clic en **"Confirmar"** para proceder.

#### 6.5 Verificación del cambio

Después de confirmar:
- ✅ El badge en la tabla cambia de color inmediatamente
- 📊 Las estadísticas se actualizan
- 📋 Se registra el cambio en auditoría
- 🔔 Aparece notificación de éxito

### Flujos comunes de gestión de estado

#### Desactivar temporalmente

\`\`\`
ACTIVE → INACTIVE
\`\`\`

Uso: Vacaciones, permisos, ausencias temporales

#### Reactivar usuario

\`\`\`
INACTIVE → ACTIVE
\`\`\`

Uso: Usuario regresa de vacaciones o permiso

#### Bloquear permanentemente

\`\`\`
ACTIVE → BLOCKED
\`\`\`

Uso: Usuario sale de la institución o violación de políticas

#### Desbloquear (requiere justificación)

\`\`\`
BLOCKED → ACTIVE
\`\`\`

Uso: Después de resolver el motivo del bloqueo

### Efectos inmediatos del cambio de estado

| Acción | Efecto inmediato |
|--------|------------------|
| Usuario a INACTIVE | Sus sesiones activas se invalidan en el próximo request |
| Usuario a BLOCKED | Sesiones actuales continúan hasta expirar (8h max) |
| Usuario a ACTIVE | Puede iniciar sesión de inmediato |

### Mejores prácticas

#### ✅ Hacer

- Usar INACTIVE para ausencias temporales
- Usar BLOCKED para situaciones permanentes o graves
- Documentar el motivo del bloqueo en el sistema
- Informar al usuario antes de cambiar su estado
- Verificar que no tenga turnos asignados antes de desactivar

#### ❌ Evitar

- Bloquear usuarios sin motivo justificado
- Cambiar estados sin notificar al usuario
- Usar BLOCKED para ausencias temporales
- Reactivar usuarios bloqueados sin investigar el motivo

> **📌 Recordatorio**: Cada cambio de estado queda permanentemente registrado en la auditoría con tu usuario, fecha/hora y motivo.

---`
      },
      {
        id: "step-7-view-details",
        title: "Paso 7: Visualiza detalles y estadísticas",
        description: "Consulta información detallada y métricas del módulo",
        content: `## Paso 7: Visualiza detalles y estadísticas

Aprende a interpretar la información y métricas del módulo de usuarios.

### 7.1 Panel de estadísticas

En la parte superior del módulo, verás cards informativos con métricas clave.

#### Card: Total de Usuarios

Muestra el número total de usuarios registrados en el sistema, sin importar su estado.

\`\`\`
Ejemplo: 15 usuarios
\`\`\`

**Incluye**: ACTIVE + INACTIVE + BLOCKED

#### Card: Usuarios Activos

Muestra solo usuarios con estado **ACTIVE** que pueden iniciar sesión.

\`\`\`
Ejemplo: 12 usuarios activos
\`\`\`

**Color**: 🟢 Verde

#### Card: Usuarios Inactivos

Muestra usuarios con estado **INACTIVE** temporalmente deshabilitados.

\`\`\`
Ejemplo: 2 usuarios inactivos
\`\`\`

**Color**: ⚪ Gris

#### Card: Administradores

Muestra el número de usuarios con rol **Admin**.

\`\`\`
Ejemplo: 3 administradores
\`\`\`

**Color**: 🔵 Azul

#### Card: Flebotomistas

Muestra el número de usuarios con rol **Flebotomista**.

\`\`\`
Ejemplo: 12 flebotomistas
\`\`\`

**Color**: 🟣 Púrpura

![Estadísticas del módulo](/docs/screenshots/users/41-statistics.png)

### 7.2 Ver detalles de un usuario

Para ver información completa de un usuario:

1. Localiza el usuario en la tabla
2. Haz clic en el botón **"Ver"** (ícono de ojo 👁️)
3. Se abrirá un modal con toda la información

#### Información mostrada

**Datos básicos**:
- Nombre completo
- Nombre de usuario (username)
- Rol actual
- Estado actual

**Datos del sistema**:
- Fecha de creación
- Última modificación
- Creado por (usuario que lo registró)
- Última sesión activa

**Estadísticas de actividad**:
- Número de logins totales
- Fecha del último login
- Número de turnos atendidos (solo Flebotomistas)

> **💡 Tip**: Esta vista es útil para auditorías o verificación de actividad de usuarios.

### 7.3 Interpretación de las métricas

#### Proporción saludable

Un sistema balanceado debería tener:

\`\`\`
Usuarios Activos: 80-90% del total
Usuarios Inactivos: 5-15% del total
Usuarios Bloqueados: <5% del total
\`\`\`

#### Ratio Admin/Flebotomista

Recomendación según tamaño del sistema:

\`\`\`
Pequeño (1-10 usuarios): 1-2 admins
Mediano (11-50 usuarios): 2-3 admins
Grande (50+ usuarios): 3-5 admins
\`\`\`

#### Alertas de atención

🚨 **Demasiados usuarios inactivos** (>20%):
- Revisar si son necesarios en el sistema
- Considerar eliminar cuentas obsoletas

🚨 **Muchos usuarios bloqueados** (>10%):
- Investigar causas de bloqueos
- Revisar políticas de seguridad

🚨 **Muy pocos administradores** (<2):
- Riesgo si el único admin no está disponible
- Asignar al menos 2 admins de respaldo

### 7.4 Vista final del módulo

Después de realizar operaciones, puedes revisar el estado completo del módulo:

![Vista final completa](/docs/screenshots/users/39-final-overview.png)

![Tabla final](/docs/screenshots/users/40-final-table.png)

Esta vista te permite:
- ✅ Verificar que todos los cambios se aplicaron
- ✅ Revisar el estado general de usuarios
- ✅ Confirmar que las estadísticas son correctas
- ✅ Detectar inconsistencias o problemas

---`
      },
      {
        id: "next-steps",
        title: "Próximos pasos",
        description: "Recursos adicionales y acciones recomendadas",
        content: `## ✅ ¡Felicidades! Has completado el tutorial

Has aprendido a usar todas las funcionalidades del módulo de Gestión de Usuarios.

### Resumen de lo que aprendiste

En este tutorial cubriste:

- ✅ **Paso 1**: Iniciar sesión en el sistema con credenciales de administrador
- ✅ **Paso 2**: Navegar al módulo de usuarios desde el Dashboard
- ✅ **Paso 3**: Crear nuevos usuarios con diferentes roles y configuraciones
- ✅ **Paso 4**: Buscar y filtrar usuarios en tiempo real
- ✅ **Paso 5**: Editar información de usuarios existentes
- ✅ **Paso 6**: Gestionar estados (ACTIVE, INACTIVE, BLOCKED)
- ✅ **Paso 7**: Visualizar detalles y estadísticas del módulo

### Próximos pasos recomendados

Ahora que dominas el módulo de usuarios, te sugerimos:

#### 1. Explora otros módulos

- **📊 Estadísticas**: Genera reportes de actividad del sistema
- **🎫 Gestión de Turnos**: Aprende a administrar los turnos de pacientes
- **🏥 Cubículos**: Configura espacios de atención

#### 2. Practica escenarios comunes

- Crear usuarios para un nuevo equipo de trabajo
- Gestionar cambios de roles masivos
- Realizar auditorías de usuarios inactivos
- Implementar políticas de contraseñas

#### 3. Consulta documentación adicional

- **Guía de seguridad**: Mejores prácticas de gestión de accesos
- **API de usuarios**: Integración con otros sistemas
- **Logs de auditoría**: Cómo revisar el historial completo

### Recursos adicionales

#### Documentación relacionada

- [Dashboard Administrativo](/docs/dashboard)
- [Sistema de Autenticación](/docs/authentication)
- [Roles y Permisos](/docs/roles)
- [Logs de Auditoría](/docs/audit-logs)

#### Soporte y ayuda

¿Tienes preguntas o encontraste un problema?

- 📧 **Email de soporte**: soporte@iner.gob.mx
- 📞 **Extensión interna**: 1234
- 🐛 **Reportar bug**: Sistema de tickets interno

### Mejores prácticas recordatorias

#### 🔐 Seguridad

- Cambia las contraseñas por defecto inmediatamente
- No compartas credenciales entre usuarios
- Revisa periódicamente los usuarios activos
- Bloquea usuarios que ya no trabajan en la institución

#### 📊 Administración

- Mantén actualizada la información de los usuarios
- Documenta cambios de estado importantes
- Realiza auditorías mensuales de accesos
- Asigna roles apropiados según funciones reales

#### 🚀 Productividad

- Usa la búsqueda para encontrar usuarios rápidamente
- Aprovecha los filtros para análisis masivos
- Revisa las estadísticas regularmente
- Capacita a nuevos administradores con este tutorial

---

## ¿Preguntas frecuentes?

### ¿Puedo eliminar usuarios?

No. El sistema usa **eliminación lógica** mediante el estado BLOCKED. Esto preserva:
- Historial de turnos atendidos
- Registros de auditoría
- Integridad referencial de la base de datos

### ¿Cuántos administradores debo tener?

Recomendamos mínimo **2 administradores**:
- 1 administrador principal
- 1 administrador de respaldo

En instituciones grandes: 3-5 administradores.

### ¿Cada cuánto debo cambiar contraseñas?

**Política recomendada**:
- Admins: cada 90 días
- Flebotomistas: cada 180 días
- Después de incidentes de seguridad: inmediatamente

### ¿Puedo recuperar un usuario bloqueado?

Sí. Un administrador puede cambiar el estado de BLOCKED a ACTIVE, pero:
- ⚠️ Debe haber justificación documentada
- 📝 Queda registrado en auditoría
- 🔍 Se recomienda investigar el motivo original del bloqueo

### ¿Qué pasa si bloqueo por error?

Puedes revertir el cambio inmediatamente:
1. Localiza el usuario
2. Cambia estado a ACTIVE
3. El cambio es instantáneo
4. Ambas acciones quedan en auditoría

---

**¡Gracias por completar el tutorial!** 🎉

Ahora estás listo para administrar usuarios de manera profesional y segura.`
      }
    ],

    screenshots: [
      {
        step: 1,
        filename: "01-login-page.png",
        title: "Página de login",
        description: "Pantalla inicial de autenticación del sistema con campos para usuario y contraseña",
        path: "/docs/screenshots/users/01-login-page.png",
        tags: ["autenticación", "login", "acceso"]
      },
      {
        step: 2,
        filename: "02-username-entered.png",
        title: "Usuario ingresado",
        description: "Campo de usuario completado con 'admin'",
        path: "/docs/screenshots/users/02-username-entered.png",
        tags: ["login", "formulario"]
      },
      {
        step: 3,
        filename: "03-password-entered.png",
        title: "Contraseña ingresada",
        description: "Ambos campos completados, listos para iniciar sesión",
        path: "/docs/screenshots/users/03-password-entered.png",
        tags: ["login", "autenticación"]
      },
      {
        step: 4,
        filename: "04-dashboard.png",
        title: "Dashboard principal",
        description: "Página principal del sistema después de autenticarse exitosamente",
        path: "/docs/screenshots/users/04-dashboard.png",
        tags: ["dashboard", "inicio"]
      },
      {
        step: 5,
        filename: "05-users-initial.png",
        title: "Vista inicial del módulo",
        description: "Interfaz completa del módulo de usuarios con tabla, estadísticas y controles",
        path: "/docs/screenshots/users/05-users-initial.png",
        tags: ["usuarios", "vista-general"]
      },
      {
        step: 6,
        filename: "06-users-table.png",
        title: "Tabla de usuarios",
        description: "Tabla mostrando todos los usuarios con sus datos principales: nombre, usuario, rol y estado",
        path: "/docs/screenshots/users/06-users-table.png",
        tags: ["tabla", "listado"]
      },
      {
        step: 7,
        filename: "18-search-field.png",
        title: "Campo de búsqueda",
        description: "Barra de búsqueda para filtrar usuarios por nombre o username",
        path: "/docs/screenshots/users/18-search-field.png",
        tags: ["búsqueda", "filtro"]
      },
      {
        step: 8,
        filename: "19-search-pedro.png",
        title: "Búsqueda: Pedro",
        description: "Resultados filtrados mostrando solo usuarios que coinciden con 'Pedro'",
        path: "/docs/screenshots/users/19-search-pedro.png",
        tags: ["búsqueda", "filtrado"]
      },
      {
        step: 9,
        filename: "20-search-cleared.png",
        title: "Búsqueda limpiada",
        description: "Tabla volviendo a mostrar todos los usuarios después de limpiar la búsqueda",
        path: "/docs/screenshots/users/20-search-cleared.png",
        tags: ["búsqueda", "reset"]
      },
      {
        step: 10,
        filename: "21-search-admin.png",
        title: "Búsqueda: admin",
        description: "Filtro aplicado buscando usuarios con 'admin' en nombre o username",
        path: "/docs/screenshots/users/21-search-admin.png",
        tags: ["búsqueda", "administrador"]
      },
      {
        step: 11,
        filename: "39-final-overview.png",
        title: "Vista final completa",
        description: "Estado final del módulo después de realizar todas las operaciones",
        path: "/docs/screenshots/users/39-final-overview.png",
        tags: ["resumen", "vista-final"]
      },
      {
        step: 12,
        filename: "40-final-table.png",
        title: "Tabla final",
        description: "Tabla de usuarios con todos los cambios aplicados y estados actualizados",
        path: "/docs/screenshots/users/40-final-table.png",
        tags: ["tabla", "final"]
      },
      {
        step: 13,
        filename: "41-statistics.png",
        title: "Estadísticas del módulo",
        description: "Panel de estadísticas mostrando métricas actualizadas: total, activos, inactivos, por rol",
        path: "/docs/screenshots/users/41-statistics.png",
        tags: ["estadísticas", "métricas"]
      }
    ],

    features: [
      {
        icon: "🔐",
        title: "Autenticación segura",
        description: "Sistema de login con JWT tokens y sesiones de 8 horas. Bloqueo automático después de 5 intentos fallidos."
      },
      {
        icon: "👥",
        title: "Gestión completa de usuarios",
        description: "Crea, edita, activa, desactiva y bloquea usuarios. Control total sobre el acceso al sistema."
      },
      {
        icon: "🔍",
        title: "Búsqueda en tiempo real",
        description: "Filtra usuarios instantáneamente por nombre o username mientras escribes. Sin recargas de página."
      },
      {
        icon: "🎭",
        title: "Sistema de roles",
        description: "Dos roles disponibles: Admin (acceso completo) y Flebotomista (módulos de turnos). Cambia roles fácilmente."
      },
      {
        icon: "📊",
        title: "Estadísticas en vivo",
        description: "Visualiza métricas actualizadas en tiempo real: total de usuarios, activos, por rol. Dashboard informativo."
      },
      {
        icon: "🔒",
        title: "Estados de usuario",
        description: "Tres estados para control granular: ACTIVE (acceso completo), INACTIVE (temporal), BLOCKED (permanente)."
      },
      {
        icon: "📝",
        title: "Auditoría completa",
        description: "Cada acción queda registrada con usuario, fecha/hora, IP y cambios realizados. Trazabilidad total."
      },
      {
        icon: "🛡️",
        title: "Validaciones robustas",
        description: "Validación en cliente y servidor. Usernames únicos, contraseñas seguras (8+ caracteres, mayúsculas, números)."
      },
      {
        icon: "⚡",
        title: "Respuesta instantánea",
        description: "Interfaz optimizada con actualizaciones en tiempo real. Sin esperas ni recargas innecesarias."
      },
      {
        icon: "🎨",
        title: "Interfaz intuitiva",
        description: "Diseño limpio con Chakra UI. Badges de colores por estado, iconos claros, mensajes de confirmación."
      }
    ],

    tips: [
      {
        icon: "💡",
        title: "Usa la búsqueda para bases grandes",
        description: "Si tienes más de 50 usuarios, la búsqueda en tiempo real te ahorrará mucho tiempo."
      },
      {
        icon: "🔐",
        title: "Cambia contraseñas por defecto",
        description: "Después de crear un usuario, pídele que cambie su contraseña en el primer login."
      },
      {
        icon: "📊",
        title: "Revisa estadísticas regularmente",
        description: "Las métricas te ayudan a detectar problemas: muchos inactivos, pocos admins, etc."
      },
      {
        icon: "⚪",
        title: "Usa INACTIVE para temporales",
        description: "Para vacaciones o permisos, usa INACTIVE en vez de BLOCKED. Es más claro y reversible."
      },
      {
        icon: "🎯",
        title: "Nombra usuarios consistentemente",
        description: "Usa un patrón para usernames: inicialApellido (ej: pgarcia) o nombre.apellido"
      },
      {
        icon: "👥",
        title: "Mantén al menos 2 admins",
        description: "Nunca tengas un solo administrador. Si no está disponible, nadie podrá gestionar usuarios."
      },
      {
        icon: "🔍",
        title: "Audita usuarios inactivos",
        description: "Cada 3 meses, revisa usuarios INACTIVE y decide si reactivarlos o bloquearlos."
      },
      {
        icon: "📝",
        title: "Documenta cambios importantes",
        description: "Aunque el sistema registra todo, lleva un documento con motivos de bloqueos o cambios críticos."
      },
      {
        icon: "🚀",
        title: "Capacita nuevos admins con este tutorial",
        description: "Comparte este tutorial con nuevos administradores para que aprendan el sistema rápidamente."
      }
    ],

    warnings: [
      {
        icon: "⚠️",
        title: "No compartas credenciales",
        description: "Cada usuario debe tener su propia cuenta. No compartas el usuario 'admin' entre varias personas."
      },
      {
        icon: "🚫",
        title: "El bloqueo es permanente por diseño",
        description: "Usa BLOCKED solo para casos graves o usuarios que ya no trabajan. Para temporales usa INACTIVE."
      },
      {
        icon: "🔒",
        title: "Usuarios bloqueados no pueden eliminarse",
        description: "El sistema usa eliminación lógica. Los usuarios BLOCKED permanecen en la BD por auditoría."
      },
      {
        icon: "⏰",
        title: "Cambios de estado no son retroactivos",
        description: "Si un usuario tiene sesión activa, el cambio a INACTIVE/BLOCKED aplica en su próximo request."
      },
      {
        icon: "🎭",
        title: "Cambiar roles afecta permisos inmediatamente",
        description: "Si cambias Admin → Flebotomista, el usuario pierde acceso a módulos administrativos al instante."
      },
      {
        icon: "📝",
        title: "Usernames no pueden duplicarse",
        description: "El sistema rechaza usernames duplicados. Planifica una nomenclatura clara desde el inicio."
      },
      {
        icon: "🔐",
        title: "Contraseñas se encriptan irreversiblemente",
        description: "No puedes 'ver' las contraseñas de usuarios. Solo puedes cambiarlas por nuevas."
      }
    ],

    relatedModules: [
      {
        moduleId: "dashboard",
        title: "Dashboard Administrativo",
        description: "Vista general del sistema con métricas y accesos rápidos"
      },
      {
        moduleId: "authentication",
        title: "Sistema de Autenticación",
        description: "Gestión de sesiones, tokens y seguridad"
      },
      {
        moduleId: "audit-logs",
        title: "Logs de Auditoría",
        description: "Historial completo de acciones en el sistema"
      }
    ]
  }
};

// Actualizar el módulo en el array
fullDocumentation[usersModuleIndex] = updatedUsersModule;

// Guardar el archivo actualizado
fs.writeFileSync(fullDocPath, JSON.stringify(fullDocumentation, null, 2));

console.log('\n✅ Documentación estilo Claude Docs creada exitosamente');
console.log('📚 Formato: Tutorial autoexplicativo paso a paso');
console.log('📊 Total de pasos: 7 pasos detallados');
console.log('📸 Total de screenshots: 13 con contexto');
console.log('💡 Total de tips: 9 consejos prácticos');
console.log('⚠️  Total de warnings: 7 advertencias importantes');
console.log('🎯 Total de features: 10 características destacadas');
console.log('\n📁 Archivo actualizado:', fullDocPath);
console.log('\n🎉 ¡Listo para copiar a public/ y visualizar!');
