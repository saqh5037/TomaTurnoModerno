const fs = require('fs');
const path = require('path');

const fullDocPath = path.join(__dirname, '../lib/docs/fullDocumentation.json');
const fullDocumentation = JSON.parse(fs.readFileSync(fullDocPath, 'utf8'));

// Encontrar el módulo de estadísticas
const estadisticasModuleIndex = fullDocumentation.findIndex(m => m.moduleId === 'estadisticas');

if (estadisticasModuleIndex === -1) {
  console.error('❌ Módulo de estadísticas no encontrado');
  process.exit(1);
}

// Crear documentación completa para Estadísticas
const updatedEstadisticasModule = {
  ...fullDocumentation[estadisticasModuleIndex],
  content: {
    overview: `# Módulo de Estadísticas

El módulo de **Estadísticas** te permite analizar el rendimiento del sistema de gestión de turnos, generar reportes detallados y tomar decisiones basadas en datos. Con este módulo podrás visualizar métricas diarias, mensuales, anuales y por flebotomista.

## ¿Qué aprenderás en esta guía?

En este tutorial aprenderás a:
- ✅ Acceder al módulo de estadísticas y métricas
- ✅ Interpretar las estadísticas diarias de atención
- ✅ Analizar tendencias mensuales y anuales
- ✅ Evaluar el rendimiento individual de flebotomistas
- ✅ Generar reportes profesionales en PDF
- ✅ Usar gráficos interactivos para visualización
- ✅ Exportar datos para análisis externo

## Antes de comenzar

### Requisitos previos

Para seguir este tutorial necesitas:
- ✓ Tener credenciales de acceso al sistema
- ✓ Contar con rol de **Administrador**
- ✓ Tener datos históricos en el sistema (turnos atendidos)
- ✓ Acceso al sistema en \`http://localhost:3005\`

### Conceptos clave

**Estadística**: Métrica calculada a partir de datos históricos de turnos atendidos. Ejemplos: total de pacientes, promedio de atención, tiempos de espera.

**Período**: Rango de tiempo para el cual se calculan estadísticas. Puede ser diario, mensual o anual.

**Gráfico interactivo**: Visualización dinámica de datos que permite explorar información con hover, zoom y filtros.

**Reporte PDF**: Documento profesional generado automáticamente con estadísticas, gráficos y análisis del sistema.

**Tiempo promedio de atención**: Métrica calculada como el tiempo transcurrido desde que un paciente es llamado hasta que finaliza su atención.

**Rendimiento de flebotomista**: Conjunto de métricas individuales: turnos atendidos, tiempo promedio, eficiencia comparativa.

---

## Tutorial completo paso a paso`,

    sections: [
      {
        id: "step-1-access",
        title: "Paso 1: Accede al módulo de estadísticas",
        description: "Navega al módulo y explora el dashboard de métricas",
        content: `## Paso 1: Accede al módulo de estadísticas

Para comenzar a analizar datos, primero debes acceder al módulo desde el Dashboard.

### 1.1 Inicia sesión como administrador

Si aún no has iniciado sesión:

\`\`\`
1. Abre http://localhost:3005/login
2. Ingresa usuario: admin
3. Ingresa contraseña: 123
4. Haz clic en "Iniciar Sesión"
\`\`\`

### 1.2 Localiza la tarjeta "Estadísticas"

En el Dashboard Principal, busca la tarjeta con el ícono **📊** y el título **"Estadísticas"**.

Esta tarjeta muestra:
- **Icono**: 📊 (representa análisis de datos)
- **Título**: Estadísticas
- **Descripción**: "Visualiza métricas y genera reportes"
- **Botón**: "Acceder"

### 1.3 Haz clic para acceder

Haz clic en cualquier parte de la tarjeta o en el botón **"Acceder"** para entrar al módulo.

### 1.4 Vista inicial del módulo

Serás redirigido a \`/statistics\` y verás el dashboard completo de estadísticas:

![Vista inicial del módulo de estadísticas](/docs/screenshots/estadisticas/01-stats-initial.png)

### Componentes del dashboard

La interfaz de estadísticas contiene:

#### 📅 Selector de período

En la parte superior:
- **Rango de fechas**: Selector de fecha inicial y final
- **Botones rápidos**: Hoy, Esta semana, Este mes, Este año
- **Aplicar**: Botón para actualizar estadísticas con nuevo período

#### 📊 Cards de métricas generales

Panel con métricas clave del período seleccionado:
- **Total de pacientes**: Contador total de turnos atendidos
- **Promedio diario**: Pacientes promedio por día
- **Tiempo promedio de atención**: Duración promedio en minutos
- **Tasa de completados**: Porcentaje de turnos finalizados exitosamente
- **Turnos especiales**: Cantidad y porcentaje de turnos prioritarios
- **Cubículos utilizados**: Número de cubículos que atendieron pacientes

#### 📈 Gráficos de visualización

Sección con gráficos interactivos:
- **Gráfico de líneas**: Evolución temporal de atenciones
- **Gráfico de barras**: Comparación diaria/mensual
- **Gráfico circular**: Distribución de turnos por tipo
- **Gráfico de rendimiento**: Comparación entre flebotomistas

#### 📋 Tabla de datos detallados

Listado con información granular:
- Fecha de atención
- Turnos atendidos ese día
- Flebotomista responsable
- Tiempo promedio
- Observaciones

#### 🔽 Botones de exportación

En la parte inferior:
- **Generar PDF**: Crea reporte profesional
- **Exportar Excel**: Descarga datos en formato XLSX
- **Exportar CSV**: Descarga datos en formato texto plano

![Dashboard completo de estadísticas](/docs/screenshots/estadisticas/02-stats-dashboard.png)

> **💡 Tip**: Por defecto, el módulo carga las estadísticas del mes actual. Usa los selectores de fecha para explorar otros períodos.

---`
      },
      {
        id: "step-2-daily-stats",
        title: "Paso 2: Analiza estadísticas diarias",
        description: "Explora métricas de atención día por día",
        content: `## Paso 2: Analiza estadísticas diarias

Las estadísticas diarias te permiten monitorear el rendimiento del sistema día a día.

### 2.1 Selecciona el rango de fechas

Para ver estadísticas de un día específico:

1. Haz clic en el selector **"Fecha inicial"**
2. Selecciona la fecha que deseas analizar
3. Haz clic en el selector **"Fecha final"**
4. Selecciona la misma fecha (para ver solo ese día)
5. Haz clic en **"Aplicar"**

![Selector de fecha diaria](/docs/screenshots/estadisticas/03-date-selector.png)

#### Atajos rápidos

Usa los botones de período rápido:

\`\`\`
[Hoy]  [Ayer]  [Esta semana]  [Este mes]  [Este año]
\`\`\`

- **Hoy**: Estadísticas del día actual
- **Ayer**: Estadísticas del día anterior
- **Esta semana**: Últimos 7 días
- **Este mes**: Mes actual completo
- **Este año**: Año actual completo

> **💡 Tip**: El botón "Hoy" es el más usado para monitoreo en tiempo real durante la jornada.

### 2.2 Interpreta las métricas diarias

Una vez seleccionado el día, verás las métricas clave:

#### 📊 Total de pacientes atendidos

\`\`\`
Ejemplo: 87 pacientes
\`\`\`

**Qué indica**:
- Volumen de trabajo del día
- Capacidad utilizada del sistema
- Comparación con promedios históricos

**Valores de referencia**:
- **Bajo**: < 50 pacientes (día lento)
- **Normal**: 50-100 pacientes (demanda estándar)
- **Alto**: > 100 pacientes (día ocupado)

#### ⏱️ Tiempo promedio de atención

\`\`\`
Ejemplo: 8.5 minutos por paciente
\`\`\`

**Qué indica**:
- Eficiencia del personal
- Complejidad de casos atendidos
- Posibles cuellos de botella

**Valores de referencia**:
- **Excelente**: < 7 minutos
- **Bueno**: 7-10 minutos
- **Aceptable**: 10-15 minutos
- **Problemático**: > 15 minutos

> **⚠️ Nota**: Tiempos muy cortos (<5 min) pueden indicar atención apresurada. Tiempos muy largos (>20 min) sugieren problemas operativos.

#### 🎯 Tasa de completados

\`\`\`
Ejemplo: 95% (83 de 87 turnos)
\`\`\`

**Qué indica**:
- Porcentaje de pacientes que completaron atención
- Turnos que no se presentaron o cancelaron
- Eficiencia del proceso completo

**Valores de referencia**:
- **Excelente**: > 95%
- **Bueno**: 90-95%
- **Revisar**: < 90% (alta tasa de no completados)

#### 🟣 Turnos especiales vs generales

\`\`\`
Ejemplo: 18 especiales (21%) / 69 generales (79%)
\`\`\`

**Qué indica**:
- Proporción de casos prioritarios
- Distribución de carga entre cubículos
- Necesidad de cubículos SPECIAL

**Valores de referencia**:
- **Normal**: 15-25% especiales
- **Alto**: > 30% especiales (considerar más cubículos SPECIAL)
- **Bajo**: < 10% especiales (posible subutilización)

### 2.3 Visualiza el gráfico de evolución diaria

El gráfico de líneas muestra la evolución hora por hora:

![Gráfico de evolución diaria](/docs/screenshots/estadisticas/04-daily-chart.png)

#### Cómo interpretar el gráfico

**Eje X**: Horas del día (7:00 - 19:00)
**Eje Y**: Número de pacientes atendidos

**Patrones comunes**:

\`\`\`
Patrón típico de día laboral:

Alta demanda:  📈 8:00-10:00 (apertura)
Valle:         📉 10:00-12:00 (media mañana)
Pico del día:  📈📈 12:00-14:00 (hora de comida)
Estable:       📊 14:00-17:00 (tarde)
Descenso:      📉 17:00-19:00 (cierre)
\`\`\`

**Qué buscar**:
- ✅ Picos identificables (horarios de mayor demanda)
- ✅ Valles identificables (horarios de baja demanda)
- ⚠️ Caídas bruscas (posibles problemas operativos)
- ⚠️ Demanda constante sin variación (atípico, revisar datos)

### 2.4 Revisa la tabla de detalles

Debajo del gráfico, la tabla muestra información granular:

| Hora | Turnos | Flebotomista | Cubículo | Tiempo promedio |
|------|--------|--------------|----------|-----------------|
| 08:00-09:00 | 12 | Pedro García | Cubículo 1 | 7.5 min |
| 09:00-10:00 | 15 | María López | Cubículo 2 | 8.2 min |
| 10:00-11:00 | 11 | Pedro García | Cubículo 1 | 9.1 min |

**Información útil**:
- Distribución de carga entre personal
- Rendimiento por hora
- Identificación de horas pico
- Comparación de eficiencia entre flebotomistas

> **💡 Tip**: Ordena la tabla por columna haciendo clic en los encabezados. Útil para identificar períodos más/menos productivos.

### 2.5 Comparación con días anteriores

El sistema muestra comparación automática:

\`\`\`
📊 Total hoy: 87 pacientes
📅 Promedio últimos 7 días: 82 pacientes
📈 Variación: +6.1% (+5 pacientes)
\`\`\`

**Indicadores de tendencia**:
- 🟢 Verde: Aumento respecto al promedio (más pacientes)
- 🔴 Rojo: Disminución respecto al promedio (menos pacientes)
- ⚪ Gris: Sin cambio significativo (±5%)

**Uso práctico**:
- Identificar días atípicos (muy alto o bajo)
- Detectar tendencias (aumento/disminución progresiva)
- Planificar recursos (más personal en días de alta demanda)

### 2.6 Casos de uso de estadísticas diarias

#### Monitoreo en tiempo real

\`\`\`
Escenario: Estás en mitad de la jornada y quieres saber el progreso

Acción:
1. Seleccionar "Hoy"
2. Revisar total de pacientes hasta el momento
3. Comparar con promedio de la misma hora días anteriores
4. Ajustar recursos si es necesario (activar más cubículos, rotar personal)
\`\`\`

#### Análisis post-jornada

\`\`\`
Escenario: Final del día, quieres evaluar el rendimiento

Acción:
1. Seleccionar "Hoy" (día completo)
2. Revisar métricas finales
3. Identificar horas pico y valle
4. Evaluar tiempos de atención
5. Documentar observaciones para mejora continua
\`\`\`

#### Investigación de problemas

\`\`\`
Escenario: Recibiste quejas de largos tiempos de espera un día específico

Acción:
1. Seleccionar la fecha reportada
2. Revisar tiempo promedio de atención
3. Verificar número de cubículos activos
4. Analizar distribución horaria (identificar cuellos de botella)
5. Revisar rendimiento individual de flebotomistas
6. Generar reporte para análisis de causa raíz
\`\`\`

---`
      },
      {
        id: "step-3-monthly-annual",
        title: "Paso 3: Analiza tendencias mensuales y anuales",
        description: "Explora datos agregados para identificar patrones",
        content: `## Paso 3: Analiza tendencias mensuales y anuales

Las estadísticas mensuales y anuales te permiten identificar patrones, tendencias y planificar a largo plazo.

### 3.1 Selecciona vista mensual

Para ver estadísticas de un mes completo:

1. Haz clic en el botón **"Este mes"**
2. O selecciona manualmente:
   - Fecha inicial: Primer día del mes (ej: 01/01/2025)
   - Fecha final: Último día del mes (ej: 31/01/2025)
3. Haz clic en **"Aplicar"**

### 3.2 Interpreta métricas mensuales

#### 📊 Total del mes

\`\`\`
Ejemplo: 1,847 pacientes en enero 2025
\`\`\`

**Qué indica**:
- Volumen mensual de operación
- Capacidad instalada utilizada
- Base para planificación de recursos

**Cálculo de capacidad**:
\`\`\`
Días laborables: 22 días
Total pacientes: 1,847
Promedio diario: 1,847 / 22 = 84 pacientes/día
\`\`\`

#### 📈 Gráfico de evolución mensual

El gráfico de barras muestra el día a día del mes:

![Gráfico mensual](/docs/screenshots/estadisticas/05-monthly-chart.png)

**Eje X**: Días del mes (1-31)
**Eje Y**: Número de pacientes

**Patrones a identificar**:

1. **Días de la semana**:
   \`\`\`
   Lunes: 🔵 Alta demanda (pacientes acumulados del fin de semana)
   Martes-Jueves: 🟢 Demanda normal
   Viernes: 🟡 Demanda variable
   Sábado-Domingo: ⚪ Cerrado o baja demanda
   \`\`\`

2. **Eventos especiales**:
   \`\`\`
   Campañas de salud: 📈 Picos identificables
   Días festivos: 📉 Caídas bruscas (cerrado)
   Inicio/fin de mes: 📊 Variaciones por factores externos
   \`\`\`

3. **Tendencias progresivas**:
   \`\`\`
   Aumento gradual: 📈📈📈 (mayor demanda con el tiempo)
   Disminución gradual: 📉📉📉 (menor demanda con el tiempo)
   Estable: 📊📊📊 (sin cambio significativo)
   \`\`\`

#### 📅 Comparación mes a mes

El sistema muestra comparación con meses anteriores:

\`\`\`
📊 Enero 2025: 1,847 pacientes
📅 Diciembre 2024: 1,723 pacientes
📈 Variación: +7.2% (+124 pacientes)
\`\`\`

**Interpretación**:
- ✅ Aumento constante: Crecimiento de demanda, buena señal
- ⚠️ Disminución constante: Pérdida de demanda, investigar causas
- 📊 Variaciones estacionales: Normales según época del año

### 3.3 Selecciona vista anual

Para ver estadísticas de todo el año:

1. Haz clic en el botón **"Este año"**
2. O selecciona manualmente:
   - Fecha inicial: 01/01/2025
   - Fecha final: 31/12/2025
3. Haz clic en **"Aplicar"**

### 3.4 Interpreta métricas anuales

#### 📊 Total del año

\`\`\`
Ejemplo: 20,345 pacientes en 2024
\`\`\`

**Métricas derivadas**:
\`\`\`
Días laborables: 260 días
Promedio diario: 20,345 / 260 = 78 pacientes/día
Promedio mensual: 20,345 / 12 = 1,695 pacientes/mes
\`\`\`

#### 📈 Gráfico de evolución anual

El gráfico de barras muestra mes por mes:

![Gráfico anual](/docs/screenshots/estadisticas/06-yearly-chart.png)

**Eje X**: Meses del año (Ene-Dic)
**Eje Y**: Número de pacientes

**Patrones estacionales comunes**:

\`\`\`
Enero-Febrero: 📈 Alta demanda (inicio de año, propósitos de salud)
Marzo-Mayo: 📊 Demanda normal
Junio-Julio: 📉 Baja demanda (vacaciones escolares)
Agosto: 📈 Repunte (regreso a actividades)
Septiembre-Noviembre: 📊 Demanda estable
Diciembre: 📉 Baja demanda (festividades)
\`\`\`

> **💡 Tip**: Los patrones estacionales son normales. Úsalos para planificar vacaciones del personal, mantenimientos y presupuestos.

### 3.5 Análisis comparativo anual

#### Comparación año a año

\`\`\`
📊 2024: 20,345 pacientes
📅 2023: 18,912 pacientes
📈 Crecimiento: +7.6% (+1,433 pacientes)
\`\`\`

#### Tabla de comparación mensual

| Mes | 2023 | 2024 | Variación |
|-----|------|------|-----------|
| Enero | 1,623 | 1,847 | +13.8% 🟢 |
| Febrero | 1,489 | 1,701 | +14.2% 🟢 |
| Marzo | 1,712 | 1,654 | -3.4% 🔴 |
| ... | ... | ... | ... |

**Uso práctico**:
- Identificar meses de mejor/peor rendimiento
- Detectar tendencias de crecimiento
- Planificar recursos para próximo año

### 3.6 Indicadores clave de rendimiento (KPIs)

El módulo calcula automáticamente KPIs anuales:

#### 🎯 Tasa de crecimiento anual

\`\`\`
Fórmula: ((Año actual - Año anterior) / Año anterior) × 100
Ejemplo: ((20,345 - 18,912) / 18,912) × 100 = 7.6%
\`\`\`

**Interpretación**:
- 🟢 > 5%: Crecimiento saludable
- 🟡 0-5%: Crecimiento moderado
- 🔴 < 0%: Decrecimiento (requiere atención)

#### ⏱️ Tiempo promedio anual

\`\`\`
Ejemplo: 8.7 minutos por paciente (promedio de todo el año)
\`\`\`

**Uso**:
- Benchmark para establecer metas
- Comparación con años anteriores
- Evaluación de mejoras de proceso

#### 📊 Capacidad utilizada

\`\`\`
Fórmula: (Pacientes atendidos / Capacidad máxima teórica) × 100

Ejemplo:
Capacidad máxima: 5 cubículos × 8 pacientes/hora × 10 horas × 260 días = 104,000 pacientes/año
Atendidos: 20,345 pacientes
Utilización: (20,345 / 104,000) × 100 = 19.6%
\`\`\`

**Interpretación**:
- < 30%: Subutilización (capacidad excesiva)
- 30-70%: Utilización óptima
- > 70%: Alta utilización (considerar expansión)

### 3.7 Casos de uso de estadísticas mensuales/anuales

#### Planificación de presupuesto

\`\`\`
Escenario: Preparar presupuesto para 2026

Acción:
1. Revisar tendencia anual 2023-2024
2. Calcular tasa de crecimiento promedio
3. Proyectar demanda para 2026
4. Estimar necesidades de personal, insumos, equipamiento
\`\`\`

#### Evaluación de campañas de salud

\`\`\`
Escenario: Medir impacto de campaña de detección temprana

Acción:
1. Identificar meses de la campaña
2. Comparar con mismos meses de años anteriores
3. Calcular incremento de demanda
4. Evaluar ROI de la campaña
\`\`\`

#### Optimización de recursos

\`\`\`
Escenario: Determinar mejor época para vacaciones del personal

Acción:
1. Revisar estadísticas de últimos 2-3 años
2. Identificar meses de baja demanda consistente
3. Programar vacaciones y mantenimientos en esos períodos
4. Minimizar impacto en atención
\`\`\`

---`
      },
      {
        id: "step-4-phlebotomist-performance",
        title: "Paso 4: Evalúa rendimiento de flebotomistas",
        description: "Analiza métricas individuales y comparativas del personal",
        content: `## Paso 4: Evalúa rendimiento de flebotomistas

El módulo te permite evaluar el desempeño individual de cada flebotomista.

### 4.1 Accede a la vista de rendimiento

En el menú del módulo de estadísticas:

1. Haz clic en la pestaña **"Rendimiento de Flebotomistas"**
2. O navega directamente a \`/statistics/phlebotomists\`

![Vista de rendimiento de flebotomistas](/docs/screenshots/estadisticas/07-phlebotomist-view.png)

### 4.2 Tabla de rendimiento individual

La tabla muestra métricas para cada flebotomista:

| Flebotomista | Turnos atendidos | Tiempo promedio | Eficiencia | Rating |
|--------------|------------------|-----------------|-----------|--------|
| Pedro García | 523 | 7.8 min | 98% | ⭐⭐⭐⭐⭐ |
| María López | 487 | 8.2 min | 95% | ⭐⭐⭐⭐⭐ |
| José Ramírez | 412 | 9.1 min | 91% | ⭐⭐⭐⭐ |

#### Columnas explicadas

**Turnos atendidos**:
- Cantidad total de pacientes atendidos en el período
- Mayor número = mayor productividad
- Considerar jornadas trabajadas (no solo total)

**Tiempo promedio**:
- Duración promedio de atención por paciente
- Menor tiempo = mayor eficiencia (sin sacrificar calidad)
- Comparar con el promedio general del sistema

**Eficiencia**:
- Porcentaje calculado basado en múltiples factores:
  - Tasa de completados (pacientes que finalizaron atención)
  - Tiempo de respuesta (qué tan rápido llaman al siguiente)
  - Consistencia (variabilidad de tiempos)
- Mayor porcentaje = mejor rendimiento

**Rating (Calificación)**:
- Estrellas de 1-5 basadas en métricas combinadas
- ⭐⭐⭐⭐⭐ (5 estrellas): Rendimiento excelente
- ⭐⭐⭐⭐ (4 estrellas): Rendimiento bueno
- ⭐⭐⭐ (3 estrellas): Rendimiento aceptable
- ⭐⭐ (2 estrellas): Rendimiento bajo (requiere apoyo)
- ⭐ (1 estrella): Rendimiento deficiente (requiere intervención)

### 4.3 Gráfico comparativo

El gráfico de barras muestra comparación visual:

![Gráfico comparativo de flebotomistas](/docs/screenshots/estadisticas/08-phlebotomist-chart.png)

**Tipos de gráficos disponibles**:

1. **Gráfico de turnos atendidos** (barras verticales)
   - Compara productividad absoluta
   - Identifica quién atendió más pacientes

2. **Gráfico de tiempo promedio** (barras horizontales)
   - Compara eficiencia temporal
   - Identifica quién es más rápido/lento

3. **Gráfico de eficiencia** (radar)
   - Muestra múltiples métricas simultáneamente
   - Vista holística del rendimiento

### 4.4 Detalles individuales de flebotomista

Haz clic en una fila para ver detalles completos:

![Detalle de flebotomista](/docs/screenshots/estadisticas/09-phlebotomist-detail.png)

#### Información mostrada

**Datos básicos**:
- Nombre completo
- Usuario (username)
- Fecha de ingreso al sistema
- Días trabajados en el período

**Métricas de rendimiento**:
\`\`\`
📊 Total de turnos: 523
⏱️ Tiempo promedio: 7.8 minutos
🎯 Tasa de completados: 98.5%
⚡ Tiempo de respuesta: 1.2 minutos (llamar siguiente paciente)
📈 Turnos por día: 23.8 (promedio)
\`\`\`

**Distribución de turnos**:
\`\`\`
🔵 Turnos GENERAL: 421 (80.5%)
🟣 Turnos SPECIAL: 102 (19.5%)
\`\`\`

**Cubículos asignados**:
\`\`\`
Cubículo 1: 312 turnos (59.7%)
Cubículo 3: 211 turnos (40.3%)
\`\`\`

**Tendencia temporal**:
- Gráfico de líneas mostrando evolución día a día
- Identifica días de mayor/menor productividad
- Detecta patrones o anomalías

### 4.5 Análisis comparativo

El sistema calcula automáticamente posiciones relativas:

\`\`\`
Ranking de rendimiento (período actual):

1. 🥇 Pedro García - 98% eficiencia
2. 🥈 María López - 95% eficiencia
3. 🥉 José Ramírez - 91% eficiencia
4. 📊 Ana Martínez - 89% eficiencia
\`\`\`

**Estadísticas del grupo**:
\`\`\`
👥 Total de flebotomistas: 4
📊 Promedio de eficiencia: 93.3%
⏱️ Tiempo promedio general: 8.4 minutos
📈 Desviación estándar: 0.5 minutos (consistencia alta)
\`\`\`

### 4.6 Identificación de oportunidades

El sistema sugiere automáticamente áreas de mejora:

#### Para flebotomistas con tiempo alto (>10 min)

\`\`\`
⚠️ José Ramírez - Tiempo promedio: 9.1 min (vs 8.4 min general)

Sugerencias:
- Revisar proceso de atención (posibles pasos redundantes)
- Capacitación en técnicas de eficiencia
- Verificar si atiende casos más complejos (justifica tiempo mayor)
- Evaluar ergonomía del cubículo asignado
\`\`\`

#### Para flebotomistas con baja tasa de completados (<95%)

\`\`\`
⚠️ Ana Martínez - Tasa de completados: 89% (vs 95% general)

Causas posibles:
- Pacientes no se presentan cuando son llamados
- Problemas técnicos durante atención (requieren reintentos)
- Falta de comunicación con recepción

Acciones:
- Revisar protocolo de llamado
- Capacitación en gestión de situaciones especiales
- Mejorar coordinación con recepción
\`\`\`

### 4.7 Uso de métricas para gestión de personal

#### Reconocimiento y motivación

\`\`\`
Escenario: Fin de mes, quieres reconocer al mejor desempeño

Acción:
1. Revisar ranking de eficiencia
2. Identificar al flebotomista con mejor rating
3. Generar certificado o reconocimiento
4. Compartir métricas positivas con el equipo
\`\`\`

#### Capacitación focalizada

\`\`\`
Escenario: Detectas flebotomista con rendimiento bajo

Acción:
1. Revisar métricas individuales
2. Identificar métrica específica problemática
3. Diseñar capacitación personalizada
4. Dar seguimiento mensual
5. Medir mejora después de 2-3 meses
\`\`\`

#### Asignación óptima de cubículos

\`\`\`
Escenario: Decidir quién atiende cubículo SPECIAL

Acción:
1. Revisar tiempos promedio de cada flebotomista
2. Identificar al más eficiente y con mejor tasa de completados
3. Asignar cubículos SPECIAL a los de mayor rendimiento
4. Rotar periódicamente para desarrollo del equipo
\`\`\`

### 4.8 Consideraciones éticas

> **⚠️ Importante**: Las métricas deben usarse para apoyo y mejora, NO para castigo o presión excesiva.

**Mejores prácticas**:
- ✅ Usar métricas como herramienta de desarrollo
- ✅ Considerar contexto (complejidad de casos, recursos disponibles)
- ✅ Celebrar mejoras, no solo resultados absolutos
- ✅ Mantener confidencialidad de métricas individuales
- ❌ No comparar públicamente flebotomistas
- ❌ No establecer metas inalcanzables
- ❌ No usar métricas como única base para decisiones de personal

**Balance entre eficiencia y calidad**:
\`\`\`
Tiempo muy bajo (<6 min) + Tasa de completados baja = Atención apresurada ❌
Tiempo moderado (7-9 min) + Tasa de completados alta = Atención de calidad ✅
Tiempo alto (>10 min) + Tasa de completados alta = Posible sobre-atención ⚠️
\`\`\`

---`
      },
      {
        id: "step-5-reports",
        title: "Paso 5: Genera y exporta reportes",
        description: "Crea documentos profesionales con estadísticas y análisis",
        content: `## Paso 5: Genera y exporta reportes

El módulo te permite generar reportes profesionales en múltiples formatos.

### 5.1 Genera reporte PDF

#### Paso 1: Configura el período

Antes de generar el reporte, selecciona el rango de fechas deseado:

\`\`\`
Ejemplo: Reporte mensual de enero 2025
- Fecha inicial: 01/01/2025
- Fecha final: 31/01/2025
- Clic en "Aplicar"
\`\`\`

#### Paso 2: Haz clic en "Generar PDF"

Busca el botón **"Generar PDF"** en la parte inferior del módulo y haz clic.

![Botón de generación de PDF](/docs/screenshots/estadisticas/10-pdf-button.png)

#### Paso 3: Espera la generación

El sistema generará el reporte (puede tomar 5-15 segundos):

\`\`\`
[Procesando...]
Generando gráficos...
Compilando datos...
Creando documento...
[Listo]
\`\`\`

#### Paso 4: Descarga automática

El PDF se descargará automáticamente con nombre descriptivo:

\`\`\`
Nombre: Reporte_Estadisticas_2025-01.pdf
Tamaño: ~2-5 MB
Formato: PDF/A (compatible con todos los lectores)
\`\`\`

### 5.2 Contenido del reporte PDF

El reporte profesional incluye:

#### Portada

\`\`\`
═══════════════════════════════════════
  INSTITUTO NACIONAL DE ENFERMEDADES
         RESPIRATORIAS (INER)

  Sistema de Gestión de Turnos
  Reporte Estadístico Mensual

  Período: Enero 2025
  Generado: 01/02/2025 14:30
═══════════════════════════════════════
\`\`\`

#### Resumen ejecutivo

- Total de pacientes atendidos
- Promedio diario
- Tiempo promedio de atención
- Comparación con período anterior
- Resumen en 3-4 bullets con insights clave

#### Gráficos y visualizaciones

- **Gráfico de evolución temporal**: Línea de tendencia del período
- **Gráfico de distribución por tipo**: Pie chart (general vs especial)
- **Gráfico comparativo de flebotomistas**: Barras de rendimiento
- **Gráfico de horarios pico**: Heatmap de demanda por hora

#### Tablas de datos

- Tabla de métricas diarias
- Tabla de rendimiento por flebotomista
- Tabla de cubículos utilizados
- Tabla de tiempos de atención

#### Análisis y recomendaciones

El sistema genera automáticamente recomendaciones basadas en los datos:

\`\`\`
📊 ANÁLISIS Y RECOMENDACIONES

1. Volumen de atención:
   - Total: 1,847 pacientes (+7.2% vs mes anterior)
   - Análisis: Crecimiento sostenido de demanda
   - Recomendación: Considerar activar cubículo adicional en horas pico

2. Eficiencia operativa:
   - Tiempo promedio: 8.4 minutos (dentro de rango óptimo)
   - Análisis: Personal mantiene eficiencia consistente
   - Recomendación: Mantener prácticas actuales

3. Horarios de mayor demanda:
   - Pico identificado: 12:00-14:00 (35% de demanda)
   - Análisis: Concentración excesiva en horario de comida
   - Recomendación: Programar descansos rotativos, no simultáneos

4. Rendimiento del personal:
   - Todos los flebotomistas con eficiencia >89%
   - Análisis: Equipo bien capacitado y motivado
   - Recomendación: Reconocer rendimiento, mantener capacitación
\`\`\`

#### Pie de página

- Logo de INER
- Número de página
- Fecha y hora de generación
- Usuario que generó el reporte
- Disclaimer: "Documento de uso interno"

### 5.3 Exporta a Excel

Para análisis más detallados o manipulación de datos:

#### Paso 1: Haz clic en "Exportar Excel"

Botón ubicado junto a "Generar PDF".

#### Paso 2: Descarga automática

Archivo XLSX se descarga:

\`\`\`
Nombre: Estadisticas_2025-01.xlsx
Hojas incluidas:
  - Resumen (métricas principales)
  - Datos Diarios (tabla día por día)
  - Flebotomistas (rendimiento individual)
  - Cubículos (uso por cubículo)
  - Datos Crudos (todos los turnos individuales)
\`\`\`

#### Uso del archivo Excel

\`\`\`
✅ Análisis personalizado con tablas dinámicas
✅ Creación de gráficos adicionales
✅ Integración con otros sistemas (ERP, BI)
✅ Archivo de respaldo de datos
✅ Envío a directivos para revisión
\`\`\`

### 5.4 Exporta a CSV

Para máxima compatibilidad o importación a otros sistemas:

#### Paso 1: Haz clic en "Exportar CSV"

Botón ubicado junto a las otras opciones de exportación.

#### Paso 2: Descarga de archivo de texto

\`\`\`
Nombre: Estadisticas_2025-01.csv
Formato: UTF-8, separado por comas
Tamaño: ~100-500 KB (mucho más ligero que PDF o Excel)
\`\`\`

#### Contenido del CSV

\`\`\`
Fecha,Turnos,Promedio_Atencion,Flebotomista,Cubiculos_Activos
2025-01-02,87,8.5,"Pedro García,María López",3
2025-01-03,92,8.2,"Pedro García,María López,José Ramírez",4
2025-01-04,79,9.1,"María López,José Ramírez",2
...
\`\`\`

#### Uso del archivo CSV

\`\`\`
✅ Importación a Python/R para análisis estadístico avanzado
✅ Carga en bases de datos externas
✅ Procesamiento con scripts automatizados
✅ Integración con herramientas de BI (Tableau, Power BI)
✅ Compatibilidad universal (cualquier sistema puede leerlo)
\`\`\`

### 5.5 Programación de reportes automáticos

(Funcionalidad avanzada, si está disponible en tu versión)

#### Configurar envío automático

\`\`\`
Escenario: Quieres recibir reporte mensual por email automáticamente

Pasos:
1. Ve a Configuración → Reportes Automáticos
2. Haz clic en "Nuevo Reporte Programado"
3. Configura:
   - Tipo: Reporte Mensual
   - Formato: PDF
   - Destinatarios: admin@iner.gob.mx, director@iner.gob.mx
   - Frecuencia: Primer día de cada mes, 8:00 AM
   - Período: Mes anterior completo
4. Guarda configuración
5. Sistema enviará automáticamente cada mes
\`\`\`

### 5.6 Mejores prácticas para reportes

#### Frecuencia recomendada

| Tipo de reporte | Frecuencia | Destinatarios |
|----------------|-----------|---------------|
| **Diario** | Al final de cada jornada | Supervisor de área |
| **Semanal** | Viernes por la tarde | Coordinador + Supervisor |
| **Mensual** | Primer día del mes siguiente | Dirección + Coordinación |
| **Anual** | Enero (año anterior completo) | Dirección + Archivo institucional |

#### Distribución de reportes

\`\`\`
1. Genera el reporte en formato deseado (PDF para lectura, Excel para análisis)
2. Revisa el contenido antes de distribuir (verifica que datos sean correctos)
3. Envía por email con asunto descriptivo:
   "Reporte Estadístico Mensual - Enero 2025 - INER Turnos"
4. Incluye resumen ejecutivo en el cuerpo del email
5. Adjunta PDF para lectura y Excel para análisis (si aplica)
6. Archiva copia en carpeta institucional (drive compartido)
\`\`\`

#### Almacenamiento y archivo

\`\`\`
Estructura recomendada:
/Reportes
  /2024
    /01_Enero
      - Reporte_Estadisticas_2024-01.pdf
      - Reporte_Estadisticas_2024-01.xlsx
    /02_Febrero
      - Reporte_Estadisticas_2024-02.pdf
      - Reporte_Estadisticas_2024-02.xlsx
    ...
  /2025
    /01_Enero
      - Reporte_Estadisticas_2025-01.pdf
      - Reporte_Estadisticas_2025-01.xlsx
\`\`\`

### 5.7 Casos de uso de reportes

#### Junta mensual de coordinación

\`\`\`
Escenario: Presentación de resultados del mes a directivos

Preparación:
1. Generar reporte PDF del mes completo
2. Preparar presentación con gráficos clave
3. Imprimir copias para asistentes
4. Proyectar PDF en reunión
5. Discutir métricas principales
6. Definir acciones de mejora basadas en datos
\`\`\`

#### Auditoría institucional

\`\`\`
Escenario: Auditoría interna solicita evidencia de operación

Respuesta:
1. Exportar reportes de últimos 12 meses en PDF
2. Exportar datos crudos en Excel para verificación
3. Incluir log de auditoría del sistema
4. Preparar documento explicativo de métricas
5. Entregar paquete completo a auditoría
\`\`\`

#### Solicitud de presupuesto

\`\`\`
Escenario: Solicitar presupuesto para nuevo cubículo

Justificación con datos:
1. Generar reporte anual mostrando crecimiento de demanda
2. Calcular capacidad actual vs demanda
3. Proyectar demanda futura
4. Presentar análisis costo-beneficio
5. Adjuntar reportes PDF como evidencia
6. Fundamentar solicitud con métricas objetivas
\`\`\`

---

## ✅ ¡Has completado el tutorial de estadísticas!

Ahora dominas todas las herramientas de análisis y generación de reportes del sistema.

### Próximos pasos

- 📊 Revisa estadísticas regularmente (diarias, semanales, mensuales)
- 📈 Identifica tendencias y patrones para toma de decisiones
- 👥 Usa métricas de flebotomistas para desarrollo del equipo
- 📄 Genera reportes para junt as y auditorías
- 🎯 Implementa mejoras basadas en datos, no en suposiciones

`
      }
    ],

    features: [
      {
        icon: "📊",
        title: "Dashboard completo de métricas",
        description: "Visualiza todas las estadísticas clave en un solo lugar: volumen, tiempos, eficiencia, tendencias. Información centralizada y clara."
      },
      {
        icon: "📈",
        title: "Gráficos interactivos",
        description: "Visualizaciones dinámicas con Chart.js y Recharts. Hover para detalles, zoom, filtros. Fácil interpretación de tendencias."
      },
      {
        icon: "📅",
        title: "Análisis multi-período",
        description: "Estadísticas diarias, mensuales y anuales. Selector de rango de fechas flexible. Atajos rápidos para períodos comunes."
      },
      {
        icon: "👥",
        title: "Rendimiento individual de flebotomistas",
        description: "Métricas por persona: turnos atendidos, tiempos promedio, eficiencia. Identificación de oportunidades de mejora."
      },
      {
        icon: "📄",
        title: "Generación de reportes PDF profesionales",
        description: "Documentos con branding de INER. Incluye gráficos, tablas, análisis y recomendaciones automáticas. Listo para presentar."
      },
      {
        icon: "📊",
        title: "Exportación a Excel y CSV",
        description: "Descarga datos en formatos estándar para análisis personalizado. Todas las hojas necesarias incluidas."
      },
      {
        icon: "🔄",
        title: "Comparación de períodos",
        description: "Compara automáticamente con período anterior. Identifica variaciones, tendencias de crecimiento/decrecimiento."
      },
      {
        icon: "🎯",
        title: "KPIs calculados automáticamente",
        description: "Indicadores clave sin necesidad de cálculos manuales: eficiencia, capacidad utilizada, tasa de crecimiento."
      },
      {
        icon: "⏱️",
        title: "Análisis de tiempos de atención",
        description: "Tiempo promedio por paciente, distribución de tiempos, identificación de cuellos de botella. Optimiza procesos."
      },
      {
        icon: "🏆",
        title: "Rankings y comparativas",
        description: "Sistema de clasificación de flebotomistas. Identifica mejores prácticas. Reconocimiento basado en datos objetivos."
      }
    ],

    tips: [
      {
        icon: "💡",
        title: "Revisa estadísticas diarias al final de cada jornada",
        description: "Toma 5 minutos cada día para revisar las métricas. Detecta problemas temprano y ajusta recursos al día siguiente."
      },
      {
        icon: "📊",
        title: "Usa gráficos para comunicar mejor",
        description: "Un gráfico comunica más que una tabla de números. Usa visualizaciones en presentaciones y juntas."
      },
      {
        icon: "📈",
        title: "Identifica patrones estacionales",
        description: "Analiza datos anuales para encontrar meses de alta/baja demanda. Usa esta info para planificar vacaciones y mantenimientos."
      },
      {
        icon: "👥",
        title: "Usa métricas de flebotomistas para desarrollo, no castigo",
        description: "Las estadísticas individuales deben servir para identificar necesidades de capacitación, no para presionar."
      },
      {
        icon: "🎯",
        title: "Establece metas basadas en datos históricos",
        description: "No inventes metas. Usa promedios y tendencias del sistema para establecer objetivos realistas y alcanzables."
      },
      {
        icon: "📄",
        title: "Archiva reportes mensualmente",
        description: "Mantén biblioteca de reportes en formato PDF. Útil para auditorías, análisis histórico y toma de decisiones."
      },
      {
        icon: "🔍",
        title: "Profundiza cuando detectes anomalías",
        description: "Si ves un dato extraño (pico o caída), investiga: ¿campaña de salud?, ¿problema operativo?, ¿día festivo?"
      },
      {
        icon: "📊",
        title: "Compara siempre con períodos anteriores",
        description: "Un número aislado no dice mucho. Siempre compara con mes anterior, mismo mes año pasado, o promedio histórico."
      },
      {
        icon: "📱",
        title: "Comparte insights con el equipo",
        description: "Comunica hallazgos importantes al equipo. Personal informado toma mejores decisiones y se siente más involucrado."
      }
    ],

    warnings: [
      {
        icon: "⚠️",
        title: "No uses métricas de flebotomistas de forma punitiva",
        description: "Las estadísticas individuales son para apoyo y desarrollo. Usarlas para castigo daña moral y confianza del equipo."
      },
      {
        icon: "📊",
        title: "Datos sin contexto pueden engañar",
        description: "Un flebotomista con tiempo alto puede atender casos más complejos. Siempre considera contexto antes de juzgar."
      },
      {
        icon: "🚫",
        title: "No compares públicamente a flebotomistas",
        description: "Rankings y comparativas son para gestión interna. Comparaciones públicas generan competencia negativa."
      },
      {
        icon: "⏰",
        title: "Tiempo muy bajo no siempre es bueno",
        description: "Tiempos menores a 5 minutos pueden indicar atención apresurada. Balance entre eficiencia y calidad es clave."
      },
      {
        icon: "📈",
        title: "Crecimientos muy rápidos requieren atención",
        description: "Aumento de demanda >20% en corto tiempo puede saturar el sistema. Planifica recursos proactivamente."
      },
      {
        icon: "🔢",
        title: "No todas las métricas tienen el mismo peso",
        description: "Tasa de completados es más importante que velocidad. Prioriza calidad de atención sobre cantidad."
      },
      {
        icon: "📄",
        title: "Reportes automáticos no reemplazan revisión humana",
        description: "Siempre revisa reportes generados antes de distribuir. El sistema puede no capturar contexto importante."
      }
    ],

    screenshots: [
      {
        step: 1,
        filename: "01-stats-initial.png",
        title: "Vista inicial de estadísticas",
        description: "Dashboard completo del módulo de estadísticas mostrando selector de período, métricas principales y gráficos",
        path: "/docs/screenshots/estadisticas/01-stats-initial.png",
        tags: ["inicial", "dashboard", "vista-general"]
      },
      {
        step: 2,
        filename: "02-stats-dashboard.png",
        title: "Dashboard completo",
        description: "Vista expandida con todas las secciones: cards de métricas, gráficos interactivos, tabla de datos y opciones de exportación",
        path: "/docs/screenshots/estadisticas/02-stats-dashboard.png",
        tags: ["dashboard", "completo", "métricas"]
      },
      {
        step: 3,
        filename: "03-date-selector.png",
        title: "Selector de fechas",
        description: "Interfaz de selección de rango de fechas con calendario y botones de período rápido (Hoy, Esta semana, Este mes)",
        path: "/docs/screenshots/estadisticas/03-date-selector.png",
        tags: ["selector", "fechas", "período"]
      },
      {
        step: 4,
        filename: "04-daily-chart.png",
        title: "Gráfico de evolución diaria",
        description: "Gráfico de líneas mostrando distribución horaria de atenciones durante un día, con picos y valles identificados",
        path: "/docs/screenshots/estadisticas/04-daily-chart.png",
        tags: ["gráfico", "diario", "evolución"]
      },
      {
        step: 5,
        filename: "05-monthly-chart.png",
        title: "Gráfico mensual",
        description: "Gráfico de barras mostrando el total de pacientes atendidos día por día durante todo el mes",
        path: "/docs/screenshots/estadisticas/05-monthly-chart.png",
        tags: ["gráfico", "mensual", "barras"]
      }
    ]
  }
};

// Actualizar el módulo en el array
fullDocumentation[estadisticasModuleIndex] = updatedEstadisticasModule;

// Guardar el archivo actualizado
fs.writeFileSync(fullDocPath, JSON.stringify(fullDocumentation, null, 2));

console.log('\n✅ Documentación de Estadísticas creada exitosamente');
console.log('📚 Formato: Tutorial completo paso a paso');
console.log('📊 Total de secciones: 5 pasos detallados');
console.log('📸 Total de screenshots: 5 capturas con contexto');
console.log('💡 Total de tips: 9 consejos prácticos');
console.log('⚠️  Total de warnings: 7 advertencias importantes');
console.log('🎯 Total de features: 10 características destacadas');
console.log('\n📁 Archivo actualizado:', fullDocPath);
console.log('\n🎉 Módulo de Estadísticas documentado completamente!');
