# Integración LABSIS - Sistema TomaTurno

**Versión:** 2.7.0
**Fecha:** Noviembre 2025
**Estado:** Implementado y en Testing

---

## Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura de la Integración](#arquitectura-de-la-integración)
3. [Formato del JSON](#formato-del-json)
4. [Endpoint de Creación de Turnos](#endpoint-de-creación-de-turnos)
5. [Mapeo de Tubos LABSIS ↔ INER](#mapeo-de-tubos-labsis--iner)
6. [Procesamiento de Estudios](#procesamiento-de-estudios)
7. [Ejemplos de Uso](#ejemplos-de-uso)
8. [Migración de Datos Existentes](#migración-de-datos-existentes)
9. [Troubleshooting](#troubleshooting)

---

## Resumen Ejecutivo

El sistema TomaTurno ahora puede recibir información detallada de estudios desde LABSIS, incluyendo:

- **Información de tubos/contenedores** por cada estudio
- **Tipos de muestra biológica** (sangre, suero, orina, etc.)
- **Códigos de interfaces** para sistemas externos
- **Muestras físicas generadas** con barcodes y correlativos
- **Agrupación automática** de estudios por tipo de tubo

### ¿Qué cambió?

| Antes | Ahora |
|-------|-------|
| `studies`: Array de strings simples | `studies`: Array de objetos con información completa |
| Sin información de tubos/contenedores | Cada estudio incluye su contenedor específico |
| `tubesDetails` calculado manualmente | `tubesDetails` se genera automáticamente |
| Sin mapeo LABSIS | Mapeo bidireccional LABSIS ↔ INER |

---

## Arquitectura de la Integración

```
LABSIS
  ↓ (Envía JSON con estudios y contenedores)
  ↓
POST /api/turns/create
  ↓
  ├─> Validación Zod (schemas extendidos)
  ├─> Procesamiento de estudios (studiesProcessor.js)
  │   ├─> Detección de formato (legacy vs nuevo)
  │   ├─> Mapeo de tubos LABSIS → INER (labsisTubeMapping.js)
  │   ├─> Enriquecimiento con catálogo INER (tubesCatalog.js)
  │   └─> Agrupación por contenedor
  ├─> Generación automática de tubesDetails
  └─> Almacenamiento en PostgreSQL
      ├─> Campo `studies` (String) - Legacy, mantiene compatibilidad
      ├─> Campo `studies_json` (Json) - NUEVO, formato estructurado
      ├─> Campo `tubesDetails` (Json) - Tubos agrupados
      ├─> Campo `labsisOrderId` (String) - ID de orden LABSIS
      └─> Campo `samplesGenerated` (Json) - Muestras físicas generadas
```

### Componentes Principales

| Componente | Ubicación | Función |
|-----------|-----------|---------|
| **Endpoint** | `src/app/api/turns/create/route.js` | Recibe requests, valida y crea turnos |
| **Studies Processor** | `lib/studiesProcessor.js` | Procesa y convierte formatos de estudios |
| **LABSIS Tube Mapping** | `lib/labsisTubeMapping.js` | Mapea tubos entre LABSIS e INER |
| **Tubes Catalog** | `lib/tubesCatalog.js` | Catálogo de 43 tipos de tubos INER |
| **Schema Prisma** | `prisma/schema.prisma` | Estructura de base de datos |
| **Script de Migración** | `scripts/migrate-studies-to-structured-format.js` | Migra datos existentes |

---

## Formato del JSON

### Formato Completo (Recomendado)

```json
{
  "patientName": "María Elena Rodríguez",
  "age": 62,
  "gender": "F",
  "contactInfo": "555-5678",

  "studies": [
    {
      "id": 1042,
      "code": "17HIDROPROGEST",
      "name": "17 HIDROXIPROGESTERONA",
      "category": "Hormonas",

      "container": {
        "id": 1,
        "type": "Tubo Tapa Roja",
        "abbreviation": "TR",
        "color": "Rojo",
        "volumeMin": 3.0,
        "volumeMax": 5.0,
        "groupId": 1
      },

      "sample": {
        "id": 3,
        "type": "Suero",
        "code": "SUE",
        "interfaceCode": "SER"
      }
    },
    {
      "id": 789,
      "code": "HEMOGRAMA",
      "name": "HEMOGRAMA COMPLETO",
      "category": "Hematología",

      "container": {
        "id": 2,
        "type": "Tubo Tapa Lila (EDTA)",
        "abbreviation": "TL",
        "color": "Lila",
        "volumeMin": 2.0,
        "volumeMax": 4.0
      },

      "sample": {
        "type": "Sangre Total",
        "code": "SAN",
        "interfaceCode": "WB"
      }
    }
  ],

  "observations": "Paciente diabética en ayunas de 12 horas",
  "clinicalInfo": "Evaluación preoperatoria completa. Historia de diabetes tipo 2.",
  "tipoAtencion": "Special",

  "labsisOrderId": "ORD-2025-11-18-00123",

  "samplesGenerated": [
    {
      "correlative": 1,
      "barcode": "2025111812345001",
      "container": {
        "id": 1,
        "type": "Tubo Tapa Roja",
        "color": "Rojo"
      },
      "studiesInTube": [
        {
          "id": 1042,
          "name": "17 HIDROXIPROGESTERONA"
        }
      ]
    },
    {
      "correlative": 2,
      "barcode": "2025111812345002",
      "container": {
        "id": 2,
        "type": "Tubo Tapa Lila (EDTA)",
        "color": "Lila"
      },
      "studiesInTube": [
        {
          "id": 789,
          "name": "HEMOGRAMA COMPLETO"
        }
      ]
    }
  ]
}
```

### Formato Simplificado (Mínimo Requerido)

```json
{
  "patientName": "Carlos Méndez",
  "age": 28,
  "gender": "M",

  "studies": [
    {
      "name": "Biometría hemática",
      "container": {
        "type": "Tubo Tapa Lila"
      }
    }
  ],

  "tipoAtencion": "General"
}
```

### Formato Legacy (Aún Soportado)

```json
{
  "patientName": "Juan Pérez",
  "age": 45,
  "gender": "M",
  "studies": ["Biometría hemática", "Glucosa", "Colesterol"],
  "tubesRequired": 2,
  "tipoAtencion": "General"
}
```

---

## Endpoint de Creación de Turnos

### URL

```
POST /api/turns/create
Content-Type: application/json; charset=utf-8
```

### Request Headers

```
Content-Type: application/json
```

### Campos del Request

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `patientName` | String | ✅ | Nombre completo del paciente (1-100 caracteres) |
| `age` | Number | ✅ | Edad del paciente (0-150) |
| `gender` | String | ✅ | Género: "M", "F", "Masculino", "Femenino" |
| `contactInfo` | String | ❌ | Información de contacto |
| `studies` | Array | ✅ | Array de estudios (strings u objetos) |
| `tubesRequired` | Number | ❌ | Total de tubos (se calcula automáticamente) |
| `tubesDetails` | Array | ❌ | Detalles de tubos (se genera automáticamente) |
| `observations` | String | ❌ | Observaciones (máx 500 caracteres) |
| `clinicalInfo` | String | ❌ | Información clínica (máx 1000 caracteres) |
| `tipoAtencion` | String | ❌ | "General" o "Special" (default: "General") |
| `labsisOrderId` | String | ❌ | ID de orden en LABSIS (máx 50 caracteres) |
| `samplesGenerated` | Array | ❌ | Muestras físicas generadas con barcodes |

### Response Exitoso (HTTP 201)

```json
{
  "assignedTurn": 38984,
  "message": "Turno asignado con éxito",
  "tipoAtencion": "Special",
  "tubesRequired": 2,

  "tubesDetails": [
    {
      "type": "rojo",
      "quantity": 1
    },
    {
      "type": "mor",
      "quantity": 1
    }
  ],

  "studiesProcessed": [
    {
      "name": "17 HIDROXIPROGESTERONA",
      "container": {
        "type": "Tubo Tapa Roja",
        "color": "Rojo"
      }
    },
    {
      "name": "HEMOGRAMA COMPLETO",
      "container": {
        "type": "Tubo Tapa Lila",
        "color": "Lila/Morado"
      }
    }
  ],

  "tubesGrouped": [
    {
      "tubeName": "Tubo Tapa Roja",
      "tubeColor": "Rojo",
      "tubeColorHex": "#fc181e",
      "tubeId": "rojo",
      "quantity": 1,
      "studies": ["17 HIDROXIPROGESTERONA"]
    },
    {
      "tubeName": "Tubo Tapa Lila",
      "tubeColor": "Lila/Morado",
      "tubeColorHex": "#d510da",
      "tubeId": "mor",
      "quantity": 1,
      "studies": ["HEMOGRAMA COMPLETO"]
    }
  ],

  "stats": {
    "totalStudies": 2,
    "totalTubes": 2,
    "uniqueTubeTypes": 2
  }
}
```

### Response de Error (HTTP 400)

```json
{
  "error": "Datos inválidos",
  "details": [
    {
      "field": "age",
      "message": "Expected number, received string"
    }
  ]
}
```

---

## Mapeo de Tubos LABSIS ↔ INER

El sistema utiliza un mapeo bidireccional definido en [`lib/labsisTubeMapping.js`](../lib/labsisTubeMapping.js).

### Tubos Mapeados

| LABSIS ID | LABSIS Código | LABSIS Nombre | INER ID | INER Nombre |
|-----------|---------------|---------------|---------|-------------|
| 1 | TR | Tubo Tapa Roja | `rojo` | Tubo Tapa Roja |
| 2 | TL | Tubo Tapa Lila (EDTA) | `mor` | Tubo Tapa Lila |
| 3 | TA | Tubo Tapa Amarilla | `morq` | Tubo Tapa Amarilla |
| 4 | TV | Tubo Tapa Verde (Heparina) | `verd` | Tubo Tapa Verde |
| 5 | TAZ | Tubo Tapa Azul (Citrato) | `azul` | Tubo Tapa Azul |
| 10 | RE | Recipiente Estéril | `est` | Recipiente Estéril |
| 11 | REL | Recipiente Estéril Líquidos | `estl` | Estéril Líquidos |
| 12 | RO | Recipiente para Orina | `garr` | Recolección Orina |
| 20 | TC | Tubo Cónico | `ori` | Tubo Cónico |
| 21 | HIS | Hisopo | `his` | Hisopo |
| 22 | LAM | Laminilla | `lam` | Laminilla |

### Funciones de Mapeo Disponibles

```javascript
import {
  labsisToIner,
  inerToLabsis,
  convertLabsisContainerToIner,
  convertLabsisStudiesToIner
} from '@/lib/labsisTubeMapping';

// Convertir ID de LABSIS a INER
const inerId = labsisToIner(1); // → "rojo"

// Convertir código de LABSIS a INER
const inerId2 = labsisToIner("TR"); // → "rojo"

// Convertir INER a LABSIS
const labsisInfo = inerToLabsis("rojo");
// → { labsisId: 1, labsisCode: "TR", labsisName: "Tubo Tapa Roja" }

// Convertir contenedor completo
const inerTube = convertLabsisContainerToIner({
  id: 1,
  type: "Tubo Tapa Roja",
  abbreviation: "TR",
  color: "Rojo"
});
// → Objeto completo del catálogo INER con info de LABSIS
```

---

## Procesamiento de Estudios

El procesamiento de estudios se realiza automáticamente en el endpoint utilizando [`lib/studiesProcessor.js`](../lib/studiesProcessor.js).

### Flujo de Procesamiento

```
1. Detección de formato
   ├─> Legacy: Array de strings ["Hemograma", "Glucosa"]
   ├─> Semi-estructurado: Array de objetos sin contenedores
   └─> Estructurado: Array de objetos con contenedores

2. Parseo y normalización
   └─> Conversión a formato estructurado unificado

3. Mapeo de tubos LABSIS → INER
   └─> Conversión de IDs/códigos de LABSIS a catálogo INER

4. Enriquecimiento
   └─> Agregar información completa del catálogo INER

5. Agrupación
   └─> Agrupar estudios por tipo de contenedor

6. Generación de tubesDetails
   └─> Crear array [{ type, quantity }]
```

### Funciones Principales

```javascript
import {
  processStudiesComplete,
  parseStudies,
  mapLabsisToInternalTubes,
  generateTubesDetails,
  groupStudiesForDisplay
} from '@/lib/studiesProcessor';

// Procesar estudios completamente (función principal)
const result = processStudiesComplete(rawStudies);

// result = {
//   success: true,
//   studies: [...],          // Estudios procesados y mapeados
//   tubesDetails: [...],     // Array para BD
//   tubesRequired: 3,        // Total calculado
//   tubesGrouped: [...],     // Para visualización
//   stats: { ... }           // Estadísticas
// }
```

---

## Ejemplos de Uso

### Ejemplo 1: Estudios con Tubos Diferentes

**Request:**

```bash
curl -X POST http://localhost:3005/api/turns/create \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "María García",
    "age": 45,
    "gender": "F",
    "studies": [
      {
        "name": "HEMOGRAMA",
        "container": {
          "id": 2,
          "type": "Tubo Tapa Lila"
        }
      },
      {
        "name": "GLUCOSA",
        "container": {
          "id": 1,
          "type": "Tubo Tapa Roja"
        }
      }
    ],
    "tipoAtencion": "General"
  }'
```

**Response:**

```json
{
  "assignedTurn": 38985,
  "message": "Turno asignado con éxito",
  "tubesRequired": 2,
  "tubesDetails": [
    { "type": "mor", "quantity": 1 },
    { "type": "rojo", "quantity": 1 }
  ],
  "stats": {
    "totalStudies": 2,
    "totalTubes": 2,
    "uniqueTubeTypes": 2
  }
}
```

### Ejemplo 2: Múltiples Estudios en el Mismo Tubo

**Request:**

```json
{
  "patientName": "Juan Pérez",
  "age": 35,
  "gender": "M",
  "studies": [
    {
      "name": "GLUCOSA",
      "container": { "id": 1, "type": "Tubo Tapa Roja" }
    },
    {
      "name": "COLESTEROL",
      "container": { "id": 1, "type": "Tubo Tapa Roja" }
    },
    {
      "name": "TRIGLICÉRIDOS",
      "container": { "id": 1, "type": "Tubo Tapa Roja" }
    }
  ]
}
```

**Response:**

```json
{
  "assignedTurn": 38986,
  "tubesRequired": 1,
  "tubesDetails": [
    { "type": "rojo", "quantity": 1 }
  ],
  "tubesGrouped": [
    {
      "tubeName": "Tubo Tapa Roja",
      "tubeColor": "Rojo",
      "quantity": 1,
      "studies": ["GLUCOSA", "COLESTEROL", "TRIGLICÉRIDOS"]
    }
  ]
}
```

### Ejemplo 3: Formato Legacy (Compatibilidad)

**Request:**

```json
{
  "patientName": "Pedro López",
  "age": 50,
  "gender": "M",
  "studies": ["Hemograma", "Glucosa", "Colesterol"],
  "tubesRequired": 2
}
```

**Response:** El sistema lo procesa normalmente, pero sin información de tubos específicos.

---

## Migración de Datos Existentes

Para migrar datos existentes del formato antiguo (`studies` String) al nuevo (`studies_json` Json), usa el script de migración:

### Comando Básico

```bash
# Simular migración (no aplica cambios)
node scripts/migrate-studies-to-structured-format.js --dry-run

# Ejecutar migración real
node scripts/migrate-studies-to-structured-format.js

# Migrar solo registros pendientes
node scripts/migrate-studies-to-structured-format.js --status Pending

# Migrar con límite de 100 registros (para pruebas)
node scripts/migrate-studies-to-structured-format.js --limit 100

# Modo verbose (mostrar detalles)
node scripts/migrate-studies-to-structured-format.js --verbose
```

### Output Esperado

```
===========================================
MIGRACIÓN: studies (String) → studies_json (Json)
===========================================

📊 Total de registros a migrar: 1523

📥 Registros obtenidos: 1523

✅ Ya migrados: 0
⏳ Pendientes de migrar: 1523

🔄 Iniciando migración...

....................

===========================================
RESUMEN DE MIGRACIÓN
===========================================

✅ Exitosos: 1523
❌ Fallidos: 0
⏭️  Omitidos (ya migrados): 0
📊 Total procesados: 1523

✨ ¡Migración completada!

🔍 Verificando integridad...

📋 Muestra de registros migrados:

   Turno #1: 3 estudios estructurados
   Turno #2: 2 estudios estructurados
   Turno #3: 1 estudios estructurados
   Turno #4: 5 estudios estructurados
   Turno #5: 2 estudios estructurados

✅ Verificación completada

👋 Script finalizado
```

---

## Troubleshooting

### Problema: Error "No se encontró mapeo para tubo"

**Síntoma:**
```json
{
  "error": "Error procesando estudios",
  "details": "Contenedor no mapeado"
}
```

**Solución:**
1. Verificar que el `container.id` o `container.abbreviation` esté en el mapeo ([`lib/labsisTubeMapping.js`](../lib/labsisTubeMapping.js))
2. Si es un tubo nuevo, agregar al mapeo:

```javascript
// En labsisTubeMapping.js
{
  labsisId: 40,
  labsisCode: 'NUEVO',
  labsisName: 'Tubo Nuevo',
  inerId: 'nuevo_id',
  notes: 'Descripción del mapeo'
}
```

### Problema: Studies vacío o no se procesan

**Síntoma:**
```json
{
  "stats": {
    "totalStudies": 0,
    "totalTubes": 0
  }
}
```

**Solución:**
1. Verificar que `studies` sea un array válido
2. Verificar estructura de cada estudio:
   ```json
   {
     "name": "REQUERIDO",
     "container": {
       "type": "REQUERIDO"
     }
   }
   ```

### Problema: Error de validación Zod

**Síntoma:**
```json
{
  "error": "Datos inválidos",
  "details": [
    {
      "field": "studies.0.name",
      "message": "String must contain at least 1 character(s)"
    }
  ]
}
```

**Solución:**
1. Verificar que todos los campos requeridos estén presentes
2. Verificar tipos de datos (números como números, no strings)
3. Verificar límites de caracteres

### Problema: Base de datos - Error en studies_json

**Síntoma:**
```
PrismaClientKnownRequestError: column "studies_json" does not exist
```

**Solución:**
```bash
# Aplicar migración de schema
npx prisma db push

# O crear migración formal
npx prisma migrate dev --name add_studies_json_field
```

### Logs Útiles

Los logs del servidor muestran información detallada del procesamiento:

```bash
# Ver logs en desarrollo
npm run dev

# Ver logs en producción con PM2
pm2 logs toma-turno --lines 100
```

Buscar en logs:
- `"Estudios procesados:"` - Estadísticas de procesamiento
- `"Usando tubesDetails..."` - Origen de los tubos usados
- `"[studiesProcessor]"` - Logs del procesador de estudios
- `"[labsisTubeMapping]"` - Logs del mapeo de tubos

---

## Soporte y Contacto

**Desarrollador:** Samuel Quiroz
**Email:** saqh5037@gmail.com
**Proyecto:** TomaTurnoModerno - INER

Para reportar issues o solicitar nuevos mapeos de tubos, contactar directamente.

---

**Versión del documento:** 1.0
**Última actualización:** Noviembre 18, 2025
