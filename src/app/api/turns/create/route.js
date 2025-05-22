import prisma from '@/lib/prisma';

export async function POST(req) {
  let requestData;

  try {
    // Análisis del JSON de la solicitud
    requestData = await req.json();
  } catch (parseError) {
    console.error("Error al analizar el cuerpo de la solicitud:", parseError);
    return new Response(
      JSON.stringify({ error: "Formato de solicitud inválido" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const {
    patientName,
    age,
    gender,
    contactInfo,
    studies = [],
    tubesRequired,
    observations,
    clinicalInfo,
    tipoAtencion = "General"
  } = requestData;

  console.log("Datos recibidos en API:", { patientName, age, gender, studies, tipoAtencion });

  try {
    // Estructura de datos para la creación en Prisma
    const dataToInsert = {
      patientName,
      age,
      gender,
      contactInfo: contactInfo || null,
      studies: Array.isArray(studies) ? JSON.stringify(studies) : "[]",
      tubesRequired: tubesRequired || 0,
      observations: observations || null,
      clinicalInfo: clinicalInfo || null,
      tipoAtencion,
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
        tipoAtencion: newTurn.tipoAtencion
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    // Registro detallado del error
    console.error("Error al crear o asignar el turno en Prisma:", error);
    return new Response(
      JSON.stringify({ error: "Error en el servidor al procesar el turno" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
