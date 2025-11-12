# Guía de Captura de Screenshots - TomaTurno v2.6.0

## 📋 Información General

**Fecha de creación:** $(date)
**Cobertura actual:** 43% (10/23 rutas)
**Screenshots pendientes:** 13
**Screenshots a actualizar:** 2

## 🎯 Objetivo

Capturar screenshots de alta calidad de todas las pantallas del sistema para actualizar la documentación.

## ⚙️ Configuración Previa

### 1. Configuración del Navegador
- **Navegador recomendado:** Google Chrome o Firefox
- **Resolución de ventana:** 1920x1080 (Full HD) o 1440x900
- **Zoom:** 100% (sin zoom)
- **Extensiones:** Desactivar extensiones que modifiquen la UI (adblockers, dark mode, etc.)

### 2. Preparación del Sistema
```bash
# Asegurarse que el servidor esté corriendo en puerto 3005
cd /Users/samuelquiroz/Documents/proyectos/toma-turno
PORT=3005 npm run dev

# Abrir en navegador
open http://localhost:3005
```

### 3. Datos de Prueba
Asegurarse de tener:
- Usuarios de prueba con diferentes roles (admin, flebotomista, usuario)
- Pacientes en cola
- Datos de estadísticas
- Cubículos configurados

## 📸 Plan de Captura

### FASE 1: Autenticación (5-10 min)

#### 1.1. Login Vacío
- **Ruta:** `http://localhost:3005/login`
- **Nombre archivo:** `login-empty.png`
- **Descripción:** Pantalla de login sin credenciales
- **Puntos clave:**
  - Formulario de login visible
  - Logo del INER
  - Campos de usuario y contraseña vacíos

**Capturar:** Pantalla completa del navegador

---

#### 1.2. Login con Credenciales
- **Ruta:** `http://localhost:3005/login`
- **Nombre archivo:** `login-filled.png`
- **Descripción:** Formulario con credenciales ingresadas
- **Pasos:**
  1. Ingresar usuario: `admin`
  2. Ingresar contraseña: `•••••••`

**Capturar:** Antes de hacer clic en "Iniciar Sesión"

---

#### 1.3. Selección de Cubículo (Flebotomista)
- **Ruta:** `http://localhost:3005/select-cubicle`
- **Nombre archivo:** `select-cubicle.png`
- **Descripción:** Pantalla para seleccionar cubículo
- **Pasos:**
  1. Hacer login como flebotomista
  2. Capturar pantalla de selección de cubículo
- **Puntos clave:**
  - Lista de cubículos disponibles
  - Cubículos generales vs especiales
  - Botones de selección

**Capturar:** Pantalla completa mostrando todos los cubículos

---

### FASE 2: Dashboards (10-15 min)

#### 2.1. Dashboard Admin
- **Ruta:** `http://localhost:3005/`
- **Nombre archivo:** `dashboard-admin-main.png`
- **Descripción:** Dashboard principal del administrador
- **Pasos:**
  1. Login como admin
  2. Esperar a que carguen todos los datos
- **Puntos clave:**
  - Métricas en tiempo real
  - Gráficas de estadísticas
  - Menú lateral completo
  - Header con nombre de usuario

**Capturar:** Scroll al inicio, pantalla completa

---

#### 2.2. Dashboard Flebotomista
- **Ruta:** `http://localhost:3005/`
- **Nombre archivo:** `dashboard-phlebotomist-main.png`
- **Descripción:** Dashboard principal del flebotomista
- **Pasos:**
  1. Logout
  2. Login como flebotomista
  3. Seleccionar cubículo
- **Puntos clave:**
  - Vista diferente a la del admin
  - Acciones rápidas disponibles
  - Estadísticas personales

**Capturar:** Pantalla completa

---

#### 2.3. Dashboard de Estadísticas
- **Ruta:** `http://localhost:3005/statistics/dashboard`
- **Nombre archivo:** `statistics-dashboard-main.png`
- **Descripción:** Dashboard completo de estadísticas
- **Pasos:**
  1. Login como admin
  2. Navegar a /statistics/dashboard
  3. Esperar carga de gráficas
- **Puntos clave:**
  - Todas las gráficas visibles
  - Filtros de fecha
  - Métricas principales

**Capturar:** Hacer scroll para capturar todo el contenido (múltiples capturas si es necesario)

---

### FASE 3: Gestión de Usuarios (10-15 min)

#### 3.1. Perfil de Usuario
- **Ruta:** `http://localhost:3005/profile`
- **Nombre archivo:** `profile-view.png`
- **Descripción:** Vista del perfil personal del usuario
- **Pasos:**
  1. Login como cualquier usuario
  2. Navegar a perfil
- **Puntos clave:**
  - Información personal
  - Foto de perfil
  - Opción de cambiar contraseña
  - Estadísticas personales (si aplica)

**Capturar:** Pantalla completa del perfil

---

#### 3.2. Perfil - Editar
- **Ruta:** `http://localhost:3005/profile`
- **Nombre archivo:** `profile-edit-mode.png`
- **Descripción:** Modo de edición del perfil
- **Pasos:**
  1. Desde el perfil, hacer clic en "Editar"
  2. Capturar con formulario de edición visible
- **Puntos clave:**
  - Campos editables
  - Botones de guardar/cancelar

**Capturar:** Modal o formulario de edición

---

### FASE 4: Turnos y Atención (20-30 min)

#### 4.1. Panel de Atención - Vacío
- **Ruta:** `http://localhost:3005/turns/attention`
- **Nombre archivo:** `attention-panel-empty.png`
- **Descripción:** Panel de atención sin paciente seleccionado
- **Pasos:**
  1. Login como flebotomista
  2. Seleccionar cubículo
  3. Navegar a panel de atención
- **Puntos clave:**
  - Botón "Llamar Siguiente"
  - Sidebar con pacientes sugeridos
  - Estado vacío del panel central

**Capturar:** Pantalla completa

---

#### 4.2. Panel de Atención - Con Paciente
- **Ruta:** `http://localhost:3005/turns/attention`
- **Nombre archivo:** `attention-panel-active.png`
- **Descripción:** Panel con paciente activo en atención
- **Pasos:**
  1. Desde el panel vacío, llamar a un paciente
  2. Esperar a que el paciente aparezca
- **Puntos clave:**
  - Información del paciente visible
  - Botones de acción (Atender, No Asistió, etc.)
  - Timer de tiempo de atención
  - Datos del paciente completos

**Capturar:** Pantalla completa con paciente activo

---

#### 4.3. Panel de Atención - Sidebar Pacientes
- **Ruta:** `http://localhost:3005/turns/attention`
- **Nombre archivo:** `attention-sidebar-patients.png`
- **Descripción:** Detalle del sidebar con pacientes sugeridos
- **Pasos:**
  1. Desde el panel de atención
  2. Hacer zoom o captura del sidebar derecho
- **Puntos clave:**
  - Lista de pacientes sugeridos
  - Iconos de prioridad
  - Tiempo de espera

**Capturar:** Enfocado en el sidebar derecho

---

#### 4.4. Panel de Atención - Modal Observaciones
- **Ruta:** `http://localhost:3005/turns/attention`
- **Nombre archivo:** `attention-modal-notes.png`
- **Descripción:** Modal de notas/observaciones
- **Pasos:**
  1. Con un paciente activo
  2. Hacer clic en "Agregar Observación" o similar
  3. Capturar modal abierto
- **Puntos clave:**
  - Formulario de observaciones
  - Campo de texto
  - Botones de acción

**Capturar:** Modal centrado con fondo visible

---

#### 4.5. Cola Pública (TV Display)
- **Ruta:** `http://localhost:3005/turns/queue-tv`
- **Nombre archivo:** `queue-tv-display.png`
- **Descripción:** Pantalla pública de cola para TV/monitor
- **Pasos:**
  1. Abrir en ventana incógnito (no requiere login)
  2. Asegurar que haya pacientes en cola
- **Puntos clave:**
  - Lista de pacientes en espera
  - Prioridades visuales
  - Información de última actualización
  - Diseño optimizado para pantalla grande

**Capturar:** Pantalla completa (simular pantalla de TV)

---

### FASE 5: Estadísticas (25-35 min)

#### 5.1. Hub de Estadísticas
- **Ruta:** `http://localhost:3005/statistics`
- **Nombre archivo:** `statistics-hub.png`
- **Descripción:** Página principal de estadísticas con opciones
- **Pasos:**
  1. Login como admin
  2. Navegar a /statistics
- **Puntos clave:**
  - Cards de acceso a diferentes reportes
  - Estadísticas resumidas
  - Accesos rápidos

**Capturar:** Pantalla completa

---

#### 5.2. Estadísticas Diarias
- **Ruta:** `http://localhost:3005/statistics/daily`
- **Nombre archivo:** `statistics-daily-report.png`
- **Descripción:** Reporte diario con gráficas
- **Pasos:**
  1. Desde hub de estadísticas
  2. Clic en "Estadísticas Diarias"
  3. Esperar carga de gráficas
  4. Seleccionar rango de fechas con datos
- **Puntos clave:**
  - Gráfica de barras/líneas
  - Filtros de fecha
  - Tabla de datos
  - Botón de exportar PDF

**Capturar:** Pantalla completa, hacer scroll si es necesario

---

#### 5.3. Estadísticas Mensuales
- **Ruta:** `http://localhost:3005/statistics/monthly`
- **Nombre archivo:** `statistics-monthly-report.png`
- **Descripción:** Reporte mensual con comparativas
- **Pasos:**
  1. Navegar a estadísticas mensuales
  2. Seleccionar mes/año con datos
  3. Esperar carga
- **Puntos clave:**
  - Gráficas de tendencias
  - Comparativa con mes anterior
  - Métricas mensuales

**Capturar:** Vista completa con gráficas

---

#### 5.4. Rendimiento de Flebotomistas
- **Ruta:** `http://localhost:3005/statistics/phlebotomists`
- **Nombre archivo:** `statistics-phlebotomists-ranking.png`
- **Descripción:** Ranking y métricas de flebotomistas
- **Pasos:**
  1. Navegar a estadísticas de flebotomistas
  2. Esperar carga de datos
- **Puntos clave:**
  - Tabla de ranking
  - Métricas por flebotomista
  - Gráficas de rendimiento
  - Filtros de período

**Capturar:** Vista completa de la tabla y gráficas

---

#### 5.5. Tiempo Promedio de Atención
- **Ruta:** `http://localhost:3005/statistics/average-time`
- **Nombre archivo:** `statistics-average-time.png`
- **Descripción:** Análisis de tiempos promedio
- **Pasos:**
  1. Navegar a análisis de tiempos
  2. Esperar carga de datos
- **Puntos clave:**
  - Gráfica de tiempos
  - Promedios por período
  - Comparativas

**Capturar:** Vista completa

---

### FASE 6: Otros Módulos (10-15 min)

#### 6.1. Encuesta de Satisfacción
- **Ruta:** `http://localhost:3005/satisfaction-survey`
- **Nombre archivo:** `satisfaction-survey.png`
- **Descripción:** Encuesta post-atención
- **Pasos:**
  1. Abrir en ventana incógnito
  2. Si requiere token/ID, obtenerlo primero
- **Puntos clave:**
  - Preguntas de satisfacción
  - Escala de calificación
  - Diseño amigable

**Capturar:** Formulario completo

---

#### 6.2. Panel de Anuncios
- **Ruta:** `http://localhost:3005/announce`
- **Nombre archivo:** `announce-panel.png`
- **Descripción:** Panel de anuncios/llamado de pacientes
- **Pasos:**
  1. Abrir la ruta
  2. Verificar que se muestre información
- **Puntos clave:**
  - Anuncios activos
  - Información de llamados
  - Diseño para display público

**Capturar:** Pantalla completa

---

### FASE 7: Actualizar Screenshots Existentes

#### 7.1. Formulario de Turnos
- **Ruta:** Determinar ruta exacta (puede ser modal en /turns/attention)
- **Nombre archivo:** `turnos-form-new.png`
- **Descripción:** Formulario completo para crear turnos
- **Pasos:**
  1. Localizar el formulario de creación de turnos
  2. Capturar formulario completo con todos los campos
- **Puntos clave:**
  - Todos los campos visibles
  - Labels claros
  - Botones de acción

**Capturar:** Formulario completo en alta calidad (> 100 KB)

---

#### 7.2. Detalles de Turno
- **Ruta:** Vista de detalles de turno
- **Nombre archivo:** `turnos-details-new.png`
- **Descripción:** Vista detallada de información de turno
- **Pasos:**
  1. Desde donde se vean los turnos
  2. Seleccionar un turno
  3. Capturar vista de detalles
- **Puntos clave:**
  - Información completa del turno
  - Estado del turno
  - Acciones disponibles

**Capturar:** Vista completa de detalles (> 100 KB)

---

## 🛠️ Herramientas de Captura

### Opción 1: Extensión de Chrome "GoFullPage"
1. Instalar desde Chrome Web Store
2. Hacer clic en el icono de la extensión
3. Esperar a que capture toda la página
4. Descargar PNG

### Opción 2: Firefox Screenshot Tool (Built-in)
1. Clic derecho → "Tomar captura de pantalla"
2. Seleccionar "Guardar página completa"

### Opción 3: macOS Screenshot (Cmd+Shift+4)
1. Presionar `Cmd + Shift + 4`
2. Presionar `Espacio` para capturar ventana completa
3. Clic en la ventana del navegador

### Opción 4: Script Automatizado (Playwright)
```bash
# Ejecutar script de captura automática (próximamente)
node scripts/capture-screenshots.js
```

---

## 📦 Organización de Archivos

### Guardar Screenshots en:
```
/Users/samuelquiroz/Documents/proyectos/toma-turno/public/docs/screenshots/
```

### Nomenclatura de Archivos:
- Usar kebab-case: `nombre-archivo.png`
- Ser descriptivo: `attention-panel-active.png` ✅ vs `pantalla1.png` ❌
- Incluir estado si aplica: `users-list-empty.png` vs `users-list-with-data.png`

### Estructura Sugerida:
```
screenshots/
├── auth/
│   ├── login-empty.png
│   ├── login-filled.png
│   └── select-cubicle.png
├── dashboards/
│   ├── dashboard-admin-main.png
│   ├── dashboard-phlebotomist-main.png
│   └── statistics-dashboard-main.png
├── users/
│   ├── users-list.png (existente)
│   ├── users-details.png (existente)
│   ├── profile-view.png
│   └── profile-edit-mode.png
├── turns/
│   ├── attention-panel-empty.png
│   ├── attention-panel-active.png
│   ├── attention-sidebar-patients.png
│   ├── attention-modal-notes.png
│   ├── queue-tv-display.png
│   ├── turnos-form-new.png
│   └── turnos-details-new.png
├── statistics/
│   ├── statistics-hub.png
│   ├── statistics-daily-report.png
│   ├── statistics-monthly-report.png
│   ├── statistics-phlebotomists-ranking.png
│   └── statistics-average-time.png
└── other/
    ├── satisfaction-survey.png
    └── announce-panel.png
```

---

## ✅ Checklist de Calidad

Antes de dar por bueno un screenshot, verificar:

- [ ] Resolución mínima 1440x900 o superior
- [ ] Archivo PNG > 100 KB (indica buena calidad)
- [ ] Zoom del navegador al 100%
- [ ] No hay elementos de desarrollo visibles (console, React DevTools)
- [ ] Datos de prueba realistas (no "Test Test" o "Lorem Ipsum")
- [ ] Colores y estilos se ven correctamente
- [ ] Textos legibles (no borrosos)
- [ ] Sin información sensible visible (si aplica)
- [ ] Captura completa de la funcionalidad

---

## 📝 Después de Capturar

1. **Organizar archivos** en la estructura sugerida
2. **Actualizar metadata**: Ejecutar script de actualización
   ```bash
   node scripts/update-screenshots-metadata.js
   ```
3. **Actualizar documentación**: Revisar que las rutas en `content.js` apunten a los screenshots correctos
4. **Probar visualización**: Abrir `/docs` y verificar que los screenshots se vean

---

## 🎯 Próximos Pasos

Después de completar todas las capturas:
1. Actualizar `/lib/docs/content.js` con las nuevas rutas
2. Actualizar `/public/docs/screenshots/screenshots-metadata.json`
3. Revisar y actualizar descripciones en la documentación
4. Generar reporte final de cambios

---

## ⏱️ Tiempo Estimado Total

- **FASE 1:** 10 min
- **FASE 2:** 15 min
- **FASE 3:** 15 min
- **FASE 4:** 30 min
- **FASE 5:** 35 min
- **FASE 6:** 15 min
- **FASE 7:** 10 min

**TOTAL:** ~2 horas (120 min)

---

## 📞 Soporte

Si encuentras algún problema durante la captura:
1. Verificar que el servidor esté corriendo en puerto 3005
2. Revisar que tengas datos de prueba cargados
3. Limpiar caché del navegador si hay problemas de visualización
4. Consultar el archivo `AUDIT_SCREENSHOTS_REPORT.md` para más detalles

---

**¡Éxito con las capturas! 📸**
