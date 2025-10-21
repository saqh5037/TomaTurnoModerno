/**
 * Script de prueba para funcionalidad de toma diferida
 * Simula un paciente que ha sido llamado 2 veces
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Iniciando prueba de toma diferida...\n');

  // 1. Buscar o crear un paciente de prueba
  const testPatient = await prisma.turnRequest.findFirst({
    where: { status: 'Pending' },
    orderBy: { assignedTurn: 'asc' }
  });

  if (!testPatient) {
    console.log('❌ No hay pacientes pendientes para probar');
    return;
  }

  console.log(`✅ Paciente seleccionado: #${testPatient.assignedTurn} - ${testPatient.patientName}`);
  console.log(`   Estado inicial: ${testPatient.status}, callCount: ${testPatient.callCount}\n`);

  // 2. Buscar un cubículo activo
  const cubicle = await prisma.cubicle.findFirst({
    where: { isActive: true }
  });

  // 3. Buscar un usuario (flebotomista)
  const user = await prisma.user.findFirst({
    where: { role: 'Flebotomista' }
  });

  if (!cubicle || !user) {
    console.log('❌ No hay cubículos o usuarios disponibles');
    return;
  }

  // 4. Simular primer llamado
  console.log('📞 Simulando primer llamado...');
  await prisma.turnRequest.update({
    where: { id: testPatient.id },
    data: {
      status: 'In Progress',
      isCalled: true,
      callCount: 1,
      calledAt: new Date(),
      attendedBy: user.id,
      cubicleId: cubicle.id
    }
  });
  console.log('   ✓ Primer llamado registrado (callCount = 1)\n');

  // Esperar un momento
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 5. Simular segundo llamado (repetir)
  console.log('📞 Simulando segundo llamado...');
  await prisma.turnRequest.update({
    where: { id: testPatient.id },
    data: {
      callCount: 2,
      updatedAt: new Date()
    }
  });
  console.log('   ✓ Segundo llamado registrado (callCount = 2)\n');

  // 6. Verificar estado final
  const updatedPatient = await prisma.turnRequest.findUnique({
    where: { id: testPatient.id },
    include: {
      cubicle: true,
      user: {
        select: {
          name: true
        }
      }
    }
  });

  console.log('📊 Estado final del paciente:');
  console.log(`   ID: ${updatedPatient.id}`);
  console.log(`   Turno: #${updatedPatient.assignedTurn}`);
  console.log(`   Nombre: ${updatedPatient.patientName}`);
  console.log(`   Estado: ${updatedPatient.status}`);
  console.log(`   Llamados: ${updatedPatient.callCount}`);
  console.log(`   Cubículo: ${updatedPatient.cubicle?.name || 'N/A'}`);
  console.log(`   Flebotomista: ${updatedPatient.user?.name || 'N/A'}`);
  console.log(`   Es diferido: ${updatedPatient.isDeferred}`);
  console.log('\n✅ Ahora ve a http://localhost:3005/turns/attention');
  console.log('   El paciente debe aparecer con el botón "Regresar a Cola"\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
