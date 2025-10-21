/**
 * Actualiza el callCount de un paciente específico
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const turnNumber = 38937;

  console.log(`🔧 Actualizando paciente #${turnNumber}...\n`);

  const patient = await prisma.turnRequest.findFirst({
    where: { assignedTurn: turnNumber }
  });

  if (!patient) {
    console.log('❌ Paciente no encontrado');
    return;
  }

  console.log(`📊 Estado actual:`);
  console.log(`   callCount: ${patient.callCount}`);
  console.log(`   status: ${patient.status}`);
  console.log(`   isCalled: ${patient.isCalled}\n`);

  const updated = await prisma.turnRequest.update({
    where: { id: patient.id },
    data: {
      callCount: 1,
      isCalled: true
    }
  });

  console.log(`✅ Paciente actualizado:`);
  console.log(`   callCount: ${updated.callCount}`);
  console.log(`   isCalled: ${updated.isCalled}`);
  console.log(`\n🔄 Recarga la página para ver el botón "Regresar a Cola"\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
