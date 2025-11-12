import prisma from '@/lib/prisma';
import { z } from 'zod';
import { calculateTotalTubes, TUBE_TYPES } from '@/lib/tubesCatalog';
import DOMPurify from 'isomorphic-dompurify';

// Generar array de IDs de tubos válidos desde el catálogo actualizado (43 tipos INER)
const validTubeTypes = TUBE_TYPES.map(t => t.id);

// Esquema de validación con Zod
const TubeDetailSchema = z.object({
  type: z.enum(validTubeTypes),
  quantity: z.number().int().min(1).max(10)
});

const TurnSchema = z.object({
  patientName: z.string().min(1, "Nombre es requerido").max(100),
  age: z.number().int().min(0).max(150),
  gender: z.enum(['M', 'F', 'Masculino', 'Femenino']),
  contactInfo: z.string().optional(),
  studies: z.array(z.string()).max(20).default([]),
  tubesRequired: z.number().int().min(0).optional(),  // Opcional si se envía tubesDetails
  tubesDetails: z.array(TubeDetailSchema).optional(),  // Nuevo campo
  observations: z.string().max(500).optional(),
  clinicalInfo: z.string().max(1000).optional(),
  tipoAtencion: z.enum(['General', 'Special']).default('General')
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
    tubesDetails: validatedData.tubesDetails,
    tipoAtencion: validatedData.tipoAtencion
  });

  try {
    // Calcular tubesRequired automáticamente si se enviaron tubesDetails
    let finalTubesRequired = validatedData.tubesRequired || 0;
    let finalTubesDetails = validatedData.tubesDetails || null;

    if (validatedData.tubesDetails && validatedData.tubesDetails.length > 0) {
      // Si se enviaron tubesDetails, calcular el total automáticamente
      finalTubesRequired = calculateTotalTubes(validatedData.tubesDetails);
      finalTubesDetails = validatedData.tubesDetails;
    } else if (validatedData.tubesRequired && validatedData.tubesRequired > 0) {
      // Si solo se envió tubesRequired (compatibilidad legacy), usarlo directamente
      finalTubesRequired = validatedData.tubesRequired;
      finalTubesDetails = null;  // No tenemos detalles
    }

    // Estructura de datos para la creación en Prisma (con sanitización XSS)
    const dataToInsert = {
      patientName: DOMPurify.sanitize(validatedData.patientName),
      age: validatedData.age,
      gender: validatedData.gender,
      contactInfo: validatedData.contactInfo ? DOMPurify.sanitize(validatedData.contactInfo) : null,
      studies: Array.isArray(validatedData.studies)
        ? JSON.stringify(validatedData.studies.map(s => DOMPurify.sanitize(s)))
        : "[]",
      tubesRequired: finalTubesRequired,
      tubesDetails: finalTubesDetails,  // Nuevo campo JSON
      observations: validatedData.observations ? DOMPurify.sanitize(validatedData.observations) : null,
      clinicalInfo: validatedData.clinicalInfo ? DOMPurify.sanitize(validatedData.clinicalInfo) : null,
      tipoAtencion: validatedData.tipoAtencion,
      status: "Pending",
    };

    console.log("Datos a insertar en Prisma:", dataToInsert);

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

    // Simplificación de la respuesta
    return new Response(
      JSON.stringify({
        assignedTurn,
        message: "Turno asignado con éxito",
        tipoAtencion: newTurn.tipoAtencion,
        tubesRequired: finalTubesRequired,
        tubesDetails: finalTubesDetails
      }),
      { status: 201, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  } catch (error) {
    // Registro detallado del error
    console.error("Error al crear o asignar el turno en Prisma:", error);
    return new Response(
      JSON.stringify({ error: "Error en el servidor al procesar el turno" }),
      { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }
}
