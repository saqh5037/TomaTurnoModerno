/**
 * Crea un paciente de prueba y lo prepara para testing de toma diferida
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Creando paciente de prueba...\n');

  // Obtener el siguiente número de turno
  const lastTurn = await prisma.turnRequest.findFirst({
    orderBy: { assignedTurn: 'desc' },
    select: { assignedTurn: true }
  });

  const nextTurn = lastTurn ? lastTurn.assignedTurn + 1 : 1;

  // Buscar cubículo y usuario
  const cubicle = await prisma.cubicle.findFirst({
    where: { isActive: true }
  });

  const user = await prisma.user.findFirst({
    where: { role: 'Flebotomista' }
  });

  if (!cubicle || !user) {
    console.log('❌ No hay cubículos o usuarios disponibles');
    return;
  }

  // Crear paciente en estado "In Progress" con callCount = 2
  const testPatient = await prisma.turnRequest.create({
    data: {
      patientName: 'PACIENTE PRUEBA DIFERIDO',
      assignedTurn: nextTurn,
      age: 30,
      gender: 'M',
      studies: 'BIOMETRIA HEMATICA',
      tubesRequired: 2,
      tipoAtencion: 'General',
      status: 'In Progress',
      isCalled: true,
      callCount: 1,  // Primer llamado
      isDeferred: false,
      attendedBy: user.id,
      cubicleId: cubicle.id,
      calledAt: new Date(),
      createdAt: new Date()
    },
    include: {
      cubicle: true,
      user: {
        select: { name: true }
      }
    }
  });

  console.log('✅ Paciente de prueba creado:');
  console.log(`   ID: ${testPatient.id}`);
  console.log(`   Turno: #${testPatient.assignedTurn}`);
  console.log(`   Nombre: ${testPatient.patientName}`);
  console.log(`   Estado: ${testPatient.status}`);
  console.log(`   Llamados: ${testPatient.callCount} ✓`);
  console.log(`   Cubículo: ${testPatient.cubicle?.name || 'N/A'}`);
  console.log(`   Flebotomista: ${testPatient.user?.name || 'N/A'}`);
  console.log('\n✅ Ahora ve a http://localhost:3005/turns/attention');
  console.log('   El botón "Regresar a Cola" 🕒 aparece desde el primer llamado\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
