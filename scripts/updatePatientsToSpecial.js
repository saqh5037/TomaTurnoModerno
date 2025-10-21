/**
 * Actualiza pacientes específicos a tipo de atención "Special"
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Actualizando pacientes a tipo Special...\n');

  const patientsToUpdate = [
    { turn: 38939, name: 'Petra Herrera' },
    { turn: 38940, name: 'Rosa Lia' }
  ];

  for (const patient of patientsToUpdate) {
    const updated = await prisma.turnRequest.updateMany({
      where: {
        assignedTurn: patient.turn,
        patientName: {
          contains: patient.name.split(' ')[0]
        }
      },
      data: {
        tipoAtencion: 'Special'
      }
    });

    if (updated.count > 0) {
      console.log(`✅ Paciente #${patient.turn} - ${patient.name} actualizado a tipo SPECIAL`);
    } else {
      console.log(`⚠️ No se encontró paciente #${patient.turn} - ${patient.name}`);
    }
  }

  console.log('\n✅ Actualización completada');
  console.log('🔄 Recarga http://localhost:3005/turns/queue para ver los cambios\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
