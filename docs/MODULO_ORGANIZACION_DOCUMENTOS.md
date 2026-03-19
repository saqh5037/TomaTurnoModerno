# Módulo de Organización de Documentos

## Manual de Usuario - TomaTurno v2.8.28

---

## ¿Qué es este módulo?

El módulo de **Organización de Documentos** permite al supervisor preparar las **etiquetas y papeletas** de los pacientes en el orden correcto de atención, sin necesidad de consultar múltiples pantallas.

---

## ¿Cómo acceder?

1. Iniciar sesión como **Administrador** o **Supervisor**
2. En la página principal, hacer clic en la tarjeta verde **"Organización"**
3. O acceder directamente a: `/supervisor/document-prep`

---

## Pantalla Principal

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORGANIZACIÓN DE DOCUMENTOS                    │
├─────────────────────────────────────────────────────────────────┤
│  Atendidos: 5  │  Pendientes: 12  │  Prior: 4  │  General: 8   │
├────────────────────────────┬────────────────────────────────────┤
│      PRIORITARIOS          │           GENERALES                │
├────────────────────────────┼────────────────────────────────────┤
│ 🔔 MARIA ELENA RODRIGUEZ   │  ⏳ 1. PEDRO MARTINEZ              │
│    (Cubículo 2)            │  ⏳ 2. LUCIA FERNANDEZ             │
│ ⏳ 1. JUAN CARLOS          │  ⏳ 3. MIGUEL ANGEL                │
│ ⏳ 2. ANA PATRICIA         │     4. ROSA MARIA                  │
│ ⏳ 3. ROBERTO ANTONIO      │     5. FRANCISCO JAVIER            │
│    4. CARMEN LUCIA         │     6. ELENA PATRICIA              │
└────────────────────────────┴────────────────────────────────────┘
```

---

## Indicadores Visuales

| Indicador | Color | Significado | Acción del Supervisor |
|-----------|-------|-------------|----------------------|
| 🔔 | **Verde** | Paciente siendo llamado AHORA | Ya pasó, documentos entregados |
| ⏳ | **Amarillo** | Próximos 3 en la cola | **PREPARAR DOCUMENTOS YA** |
| (sin icono) | Blanco | En cola, esperando | Preparar cuando suba a amarillo |

---

## Estadísticas en Tiempo Real

| Estadística | Descripción |
|-------------|-------------|
| **Atendidos Hoy** | Cantidad de pacientes ya atendidos en el día |
| **Pendientes** | Total de pacientes en cola (prioritarios + generales) |
| **Prioritarios** | Pacientes con atención especial (adultos mayores, discapacidad, etc.) |
| **Generales** | Pacientes de cola normal |

---

## Flujo de Trabajo Recomendado

### Paso 1: Abrir el módulo
- Hacer clic en la tarjeta verde "Organización" desde la página principal

### Paso 2: Identificar próximos pacientes
- Buscar los pacientes marcados con ⏳ (amarillo) en ambas columnas
- Estos son los **próximos 3** de cada cola

### Paso 3: Preparar documentos
- Buscar las etiquetas y papeletas de los pacientes amarillos
- Organizarlas en el orden mostrado (1, 2, 3)

### Paso 4: Monitorear llamadas
- Cuando aparece 🔔 (verde), ese paciente está siendo llamado
- Sus documentos ya deben estar listos para entregar

### Paso 5: Actualización automática
- La pantalla se actualiza **cada 3 segundos**
- No es necesario refrescar manualmente

---

## Información Mostrada por Paciente

| Campo | Descripción |
|-------|-------------|
| **Posición** | Número en la cola (1, 2, 3...) |
| **Nombre** | Nombre completo del paciente |
| **Orden** | Número de orden de trabajo |
| **Tubos** | Cantidad de tubos requeridos |
| **Estudios** | Cantidad de estudios solicitados |

---

## Preguntas Frecuentes

### ¿Cada cuánto se actualiza la información?
Cada 3 segundos automáticamente. También puede desactivar el auto-refresh con el botón en la esquina superior derecha.

### ¿Qué pasa si un paciente es llamado y no responde?
El paciente puede ser diferido (regresado a la cola). Aparecerá nuevamente en la lista con su nueva posición.

### ¿Por qué hay dos columnas?
- **Prioritarios**: Pacientes con atención preferencial (adultos mayores, embarazadas, personas con discapacidad)
- **Generales**: Pacientes de cola normal

### ¿Quiénes pueden ver este módulo?
Solo usuarios con rol de **Administrador** o **Supervisor**.

---

## Soporte Técnico

Si tiene problemas con el módulo:
1. Verificar conexión a internet
2. Refrescar la página (F5)
3. Cerrar sesión y volver a iniciar
4. Contactar al administrador del sistema

---

*Documento generado para TomaTurno v2.8.28*
*Última actualización: Enero 2026*
