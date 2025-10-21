const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function create5Turns() {
  try {
    // Obtener el último turno asignado para continuar la secuencia
    const lastTurn = await prisma.turnRequest.findFirst({
      orderBy: { assignedTurn: 'desc' },
      select: { assignedTurn: true }
    });

    let nextTurnNumber = lastTurn?.assignedTurn ? lastTurn.assignedTurn + 1 : 1;

    const patients = [
      {
        patientName: "María González López",
        age: 45,
        gender: "Femenino",
        contactInfo: "555-1234",
        studies: "Biometría hemática completa, Química sanguínea",
        tubesRequired: 3,
        observations: "Paciente en ayuno de 8 horas",
        tipoAtencion: "General"
      },
      {
        patientName: "Carlos Ramírez Santos",
        age: 62,
        gender: "Masculino",
        contactInfo: "555-5678",
        studies: "Perfil de lípidos, Glucosa",
        tubesRequired: 2,
        observations: "Diabético tipo 2, medicación controlada",
        tipoAtencion: "General"
      },
      {
        patientName: "Ana Patricia Morales",
        age: 28,
        gender: "Femenino",
        contactInfo: "555-9012",
        studies: "Pruebas de función hepática",
        tubesRequired: 2,
        observations: null,
        tipoAtencion: "Special"
      },
      {
        patientName: "José Luis Hernández",
        age: 55,
        gender: "Masculino",
        contactInfo: "555-3456",
        studies: "Hemoglobina glucosilada, Creatinina",
        tubesRequired: 2,
        observations: "Control mensual de diabetes",
        tipoAtencion: "General"
      },
      {
        patientName: "Laura Beatriz Mendoza",
        age: 38,
        gender: "Femenino",
        contactInfo: "555-7890",
        studies: "Perfil tiroideo completo",
        tubesRequired: 3,
        observations: "Primera vez en el instituto",
        tipoAtencion: "Special"
      }
    ];

    const createdTurns = [];

    for (const patient of patients) {
      const turn = await prisma.turnRequest.create({
        data: {
          patientName: patient.patientName,
          age: patient.age,
          gender: patient.gender,
          contactInfo: patient.contactInfo,
          studies: patient.studies,
          tubesRequired: patient.tubesRequired,
          observations: patient.observations,
          tipoAtencion: patient.tipoAtencion,
          assignedTurn: nextTurnNumber,
          status: "WAITING",
          isCalled: false,
          callCount: 0,
          isDeferred: false
        }
      });

      createdTurns.push(turn);
      console.log(`✅ Turno #${nextTurnNumber} creado: ${patient.patientName} (${patient.tipoAtencion})`);
      nextTurnNumber++;
    }

    console.log(`\n🎉 Se crearon ${createdTurns.length} turnos exitosamente`);
    console.log(`📊 Rango de turnos: #${createdTurns[0].assignedTurn} a #${createdTurns[createdTurns.length - 1].assignedTurn}`);

    // Resumen por tipo
    const generalTurns = createdTurns.filter(t => t.tipoAtencion === 'General').length;
    const specialTurns = createdTurns.filter(t => t.tipoAtencion === 'Special').length;
    console.log(`\n📋 Resumen:`);
    console.log(`   - Turnos Generales: ${generalTurns}`);
    console.log(`   - Turnos Especiales: ${specialTurns}`);

  } catch (error) {
    console.error('❌ Error creando turnos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

create5Turns();
