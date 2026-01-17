import prisma from '@/lib/prisma';
import { z } from 'zod';
import { calculateTotalTubes, TUBE_TYPES } from '@/lib/tubesCatalog';
import { processStudiesComplete } from '@/lib/studiesProcessor';
import { getMappingByLabsisCode } from '@/lib/labsisTubeMapping';
import DOMPurify from 'isomorphic-dompurify';

// Generar array de IDs de tubos válidos desde el catálogo actualizado (43 tipos INER)
const validTubeTypes = TUBE_TYPES.map(t => t.id);

// Esquema de validación con Zod

// Schema para TubeDetail (acepta formato LABSIS con containerCode o formato INER con type)
const TubeDetailSchema = z.object({
  type: z.string().max(20).optional(),              // ID INER (ej: "mor", "rojo") - opcional si viene containerCode
  containerCode: z.string().max(20).optional(),     // Código LABSIS (ej: "MOR", "ROJO") - KAB-7378
  containerType: z.string().max(100).optional(),    // Nombre completo LABSIS (ej: "TUBO TAPA LILA") - KAB-7378
  sampleType: z.string().max(50).optional().nullable(),  // Tipo de muestra (ej: Suero, SangreT, Plasma)
  quantity: z.number().int().min(1).max(10)
});

// Schema para Container (información de contenedor de LABSIS)
const ContainerSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  type: z.string().min(1).max(100),
  abbreviation: z.string().max(10).optional(),
  color: z.string().max(50).optional(),
  volumeMin: z.number().positive().optional(),
  volumeMax: z.number().positive().optional(),
  groupId: z.number().int().positive().optional()
}).optional();

// Schema para Sample (información de muestra biológica)
const SampleSchema = z.object({
  id: z.number().int().positive().optional(),
  type: z.string().min(1).max(100),
  code: z.string().max(10).optional(),
  interfaceCode: z.string().max(10).optional()
}).optional();

// Schema para Study (estudio individual con información completa de LABSIS)
const StudyDetailSchema = z.object({
  id: z.number().int().positive().optional(),
  code: z.string().max(50).optional(),
  name: z.string().min(1).max(200),
  category: z.string().max(100).optional(),
  container: ContainerSchema,
  sample: SampleSchema
});

// Schema para SampleGenerated (muestras físicas generadas con barcode)
const SampleGeneratedSchema = z.object({
  correlative: z.number().int().positive(),
  barcode: z.string().max(50),
  container: z.object({
    id: z.union([z.number(), z.string()]),
    type: z.string(),
    color: z.string().optional()
  }),
  studiesInTube: z.array(z.object({
    id: z.number().int().positive().optional(),
    name: z.string()
  }))
});

// Schema principal para TurnRequest
const TurnSchema = z.object({
  patientName: z.string().min(1, "Nombre es requerido").max(100),
  age: z.number().int().min(0).max(150),
  gender: z.enum(['M', 'F', 'Masculino', 'Femenino']),
  contactInfo: z.string().optional(),

  // Studies acepta AMBOS formatos: array de strings (legacy) o array de objetos (nuevo)
  studies: z.union([
    z.array(z.string()).max(20),              // Formato legacy: ["Hemograma", "Glucosa"]
    z.array(StudyDetailSchema).max(20)        // Formato nuevo: [{ name, container, sample, ... }]
  ]).default([]),

  tubesRequired: z.number().int().min(0).optional(),  // Opcional si se envía tubesDetails
  tubesDetails: z.array(TubeDetailSchema).optional(),  // Array de { type, quantity }
  observations: z.string().max(500).optional(),
  clinicalInfo: z.string().max(1000).optional(),
  // KAB-7378: Aceptar tipoAtencion en inglés o español
  tipoAtencion: z.enum(['General', 'Special', 'Especial', 'general', 'special', 'especial']).default('General'),

  // NUEVOS CAMPOS LABSIS
  labsisOrderId: z.string().max(50).optional(),       // ID de orden en LABSIS
  samplesGenerated: z.array(SampleGeneratedSchema).optional(),  // Muestras físicas generadas

  // NUEVOS CAMPOS HIS (expediente y orden de trabajo)
  patientID: z.string().max(50).optional(),           // CI/Expediente del paciente
  workOrder: z.string().max(50).optional(),           // Número de orden de trabajo (OT) - minúscula
  WorkOrder: z.string().max(50).optional(),           // Número de orden de trabajo (OT) - mayúscula (KAB-7378)
  codigoAtencion: z.string().max(50).optional()       // Código departamento laboratorio (KAB-7378)
});

// API para crear turnos manuales con validación Zod y soporte UTF-8
export async function POST(req) {
  let requestData;

  try {
    // Análisis del JSON de la solicitud
    requestData = await req.json();
  } catch (parseError) {
    console.error("Error al analizar el cuerpo de la solicitud:", parseError);
    return new Response(
      JSON.stringify({ error: "Formato de solicitud inválido" }),
      { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }

  // Validación con Zod
  let validatedData;
  try {
    validatedData = TurnSchema.parse(requestData);
  } catch (validationError) {
    console.error("Error de validación:", validationError);

    // ZodError usa .issues no .errors
    const errors = validationError.issues?.map(err => ({
      field: err.path.join('.'),
      message: err.message
    })) || [];

    return new Response(
      JSON.stringify({
        error: "Datos inválidos",
        details: errors
      }),
      { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }

  console.log("Datos validados:", {
    patientName: validatedData.patientName,
    age: validatedData.age,
    gender: validatedData.gender,
    studiesCount: validatedData.studies?.length || 0,
    tubesDetails: validatedData.tubesDetails,
    tipoAtencion: validatedData.tipoAtencion,
    labsisOrderId: validatedData.labsisOrderId
  });

  try {
    // PROCESAR STUDIES: Detectar formato y procesar automáticamente
    const processedData = processStudiesComplete(validatedData.studies);

    if (!processedData.success) {
      console.error("Error procesando estudios:", processedData.error);
      return new Response(
        JSON.stringify({
          error: "Error procesando estudios",
          details: processedData.error
        }),
        { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    console.log("Estudios procesados:", {
      totalStudies: processedData.stats.totalStudies,
      totalTubes: processedData.stats.totalTubes,
      uniqueTubeTypes: processedData.stats.uniqueTubeTypes
    });

    // Calcular tubesRequired y tubesDetails finales
    let finalTubesRequired = validatedData.tubesRequired || 0;
    let finalTubesDetails = validatedData.tubesDetails || null;

    // Si se enviaron tubesDetails explícitos, procesarlos (prioridad manual)
    if (validatedData.tubesDetails && validatedData.tubesDetails.length > 0) {
      // KAB-7378: Procesar containerCode → type si viene formato LABSIS
      finalTubesDetails = validatedData.tubesDetails.map(tube => {
        // Si viene containerCode pero no type, mapear usando labsisTubeMapping
        if (tube.containerCode && !tube.type) {
          const mapping = getMappingByLabsisCode(tube.containerCode);
          const mappedType = mapping ? mapping.inerId : tube.containerCode.toLowerCase();
          console.log(`[KAB-7378] Mapeando containerCode "${tube.containerCode}" → type "${mappedType}"`);
          return {
            type: mappedType,
            containerCode: tube.containerCode,      // Preservar código original
            containerType: tube.containerType,      // Preservar nombre original
            sampleType: tube.sampleType,
            quantity: tube.quantity
          };
        }
        // Si ya viene con type, usar tal cual
        return tube;
      });
      finalTubesRequired = calculateTotalTubes(finalTubesDetails);
      console.log("Usando tubesDetails enviados manualmente (procesados)");
    }
    // Si NO se enviaron tubesDetails pero se procesaron estudios, usar los generados
    else if (processedData.tubesDetails && processedData.tubesDetails.length > 0) {
      finalTubesRequired = processedData.tubesRequired;
      finalTubesDetails = processedData.tubesDetails;
      console.log("Usando tubesDetails generados automáticamente desde estudios");
    }
    // Si solo se envió tubesRequired (compatibilidad legacy muy antigua)
    else if (validatedData.tubesRequired && validatedData.tubesRequired > 0) {
      finalTubesRequired = validatedData.tubesRequired;
      finalTubesDetails = null;
      console.log("Usando tubesRequired legacy (sin detalles)");
    }

    // Preparar studies para almacenar (usar campo temporal studies_json)
    const studiesForDb = processedData.studies && processedData.studies.length > 0
      ? processedData.studies
      : validatedData.studies;

    // Sanitizar studies si son strings simples
    const sanitizedStudies = Array.isArray(studiesForDb)
      ? studiesForDb.map(study => {
          if (typeof study === 'string') {
            return DOMPurify.sanitize(study);
          }
          // Si es objeto, sanitizar el nombre
          return {
            ...study,
            name: study.name ? DOMPurify.sanitize(study.name) : study.name
          };
        })
      : [];

    // Estructura de datos para la creación en Prisma (con sanitización XSS)
    const dataToInsert = {
      patientName: DOMPurify.sanitize(validatedData.patientName),
      age: validatedData.age,
      gender: validatedData.gender,
      contactInfo: validatedData.contactInfo ? DOMPurify.sanitize(validatedData.contactInfo) : null,

      // CAMPO LEGACY (String) - mantener compatibilidad con código existente
      studies: JSON.stringify(sanitizedStudies),

      // CAMPO NUEVO (Json) - almacenar estudios estructurados
      studies_json: sanitizedStudies,

      tubesRequired: finalTubesRequired,
      tubesDetails: finalTubesDetails,
      observations: validatedData.observations ? DOMPurify.sanitize(validatedData.observations) : null,
      clinicalInfo: validatedData.clinicalInfo ? DOMPurify.sanitize(validatedData.clinicalInfo) : null,
      // KAB-7378: Normalizar tipoAtencion (Especial/especial/Special → Special)
      tipoAtencion: ['Especial', 'especial', 'Special', 'special'].includes(validatedData.tipoAtencion) ? 'Special' : 'General',
      status: "Pending",

      // NUEVOS CAMPOS LABSIS
      labsisOrderId: validatedData.labsisOrderId || null,
      samplesGenerated: validatedData.samplesGenerated || null,

      // NUEVOS CAMPOS HIS (expediente y orden de trabajo)
      patientID: validatedData.patientID || null,
      // KAB-7378: Aceptar tanto WorkOrder (mayúscula) como workOrder (minúscula)
      workOrder: validatedData.WorkOrder || validatedData.workOrder || null,
      // KAB-7378: Código del departamento de laboratorio
      codigoAtencion: validatedData.codigoAtencion || null
    };

    console.log("Datos a insertar en Prisma:", {
      ...dataToInsert,
      studies: `[${sanitizedStudies.length} estudios]`,
      studies_json: `[${sanitizedStudies.length} estudios estructurados]`
    });

    // Creación del turno en Prisma
    const newTurn = await prisma.turnRequest.create({
      data: dataToInsert,
    });

    console.log("Turno creado exitosamente en Prisma:", newTurn);

    // Actualización con el turno asignado
    const assignedTurn = newTurn.id;
    await prisma.turnRequest.update({
      where: { id: newTurn.id },
      data: { assignedTurn },
    });

    // Respuesta enriquecida con información procesada
    return new Response(
      JSON.stringify({
        assignedTurn,
        message: "Turno asignado con éxito",
        tipoAtencion: newTurn.tipoAtencion,
        tubesRequired: finalTubesRequired,
        tubesDetails: finalTubesDetails,

        // Información adicional del procesamiento (útil para debugging y UI)
        studiesProcessed: processedData.studies?.map(s => ({
          name: s.name,
          container: s.container ? {
            type: s.container.name || s.container.type,
            color: s.container.color
          } : null
        })),

        tubesGrouped: processedData.tubesGrouped,

        stats: {
          totalStudies: processedData.stats.totalStudies,
          totalTubes: processedData.stats.totalTubes,
          uniqueTubeTypes: processedData.stats.uniqueTubeTypes
        }
      }),
      { status: 201, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  } catch (error) {
    // Registro detallado del error
    console.error("Error al crear o asignar el turno en Prisma:", error);
    console.error("Stack trace:", error.stack);

    return new Response(
      JSON.stringify({
        error: "Error en el servidor al procesar el turno",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }
}
