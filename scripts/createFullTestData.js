/**
 * Script para crear datos de prueba completos
 * Crea pacientes con diferentes estados y tipos de atención
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestData() {
  console.log('🚀 Iniciando creación de datos de prueba...\n');

  try {
    // 1. Verificar que existan cubículos
    const cubicles = await prisma.cubicle.findMany({
      where: { isActive: true }
    });

    if (cubicles.length === 0) {
      console.log('❌ No hay cubículos activos. Creando cubículos de prueba...');

      await prisma.cubicle.createMany({
        data: [
          { name: 'Cubículo Test 1', type: 'GENERAL', isActive: true, isSpecial: false },
          { name: 'Cubículo Test 2', type: 'GENERAL', isActive: true, isSpecial: false },
          { name: 'Cubículo Test 3', type: 'SPECIAL', isActive: true, isSpecial: true },
          { name: 'Cubículo Test 4', type: 'SPECIAL', isActive: true, isSpecial: true },
        ]
      });

      console.log('✅ 4 cubículos creados\n');
    } else {
      console.log(`✅ Encontrados ${cubicles.length} cubículos activos\n`);
    }

    // 2. Obtener el siguiente número de turno
    const lastTurn = await prisma.turnRequest.findFirst({
      orderBy: { assignedTurn: 'desc' }
    });

    let nextTurn = lastTurn ? lastTurn.assignedTurn + 1 : 1;

    console.log(`📋 Próximo turno disponible: ${nextTurn}\n`);

    // 3. Crear pacientes de prueba con diferentes características
    const testPatients = [
      {
        patientName: 'Ana García López',
        age: 75,
        gender: 'Femenino',
        contactInfo: '55-1234-5678',
        studies: 'Biometría Hemática, Glucosa',
        tubesRequired: 2,
        observations: 'Adulto mayor, requiere atención especial',
        tipoAtencion: 'Special',
        status: 'PENDING',
        assignedTurn: nextTurn++,
        isDeferred: false
      },
      {
        patientName: 'Carlos Ramírez Santos',
        age: 35,
        gender: 'Masculino',
        contactInfo: '55-2345-6789',
        studies: 'Química Sanguínea',
        tubesRequired: 1,
        observations: 'Consulta de rutina',
        tipoAtencion: 'General',
        status: 'PENDING',
        assignedTurn: nextTurn++,
        isDeferred: false
      },
      {
        patientName: 'María Fernández Cruz',
        age: 28,
        gender: 'Femenino',
        contactInfo: '55-3456-7890',
        studies: 'Glucosa, Perfil Tiroideo',
        tubesRequired: 2,
        observations: 'Embarazo de 6 meses',
        clinicalInfo: 'Paciente embarazada',
        tipoAtencion: 'Special',
        status: 'PENDING',
        assignedTurn: nextTurn++,
        isDeferred: false
      },
      {
        patientName: 'Juan Pérez Gómez',
        age: 42,
        gender: 'Masculino',
        contactInfo: '55-4567-8901',
        studies: 'Biometría Hemática',
        tubesRequired: 1,
        observations: 'Chequeo anual',
        tipoAtencion: 'General',
        status: 'PENDING',
        assignedTurn: nextTurn++,
        isDeferred: false
      },
      {
        patientName: 'Laura Martínez Díaz',
        age: 29,
        gender: 'Femenino',
        contactInfo: '55-5678-9012',
        studies: 'Química Sanguínea, Perfil de Lípidos',
        tubesRequired: 2,
        observations: 'Análisis de rutina',
        tipoAtencion: 'General',
        status: 'PENDING',
        assignedTurn: nextTurn++,
        isDeferred: false
      },
      {
        patientName: 'Roberto Sánchez Flores',
        age: 68,
        gender: 'Masculino',
        contactInfo: '55-6789-0123',
        studies: 'Biometría Hemática, Glucosa, Creatinina',
        tubesRequired: 3,
        observations: 'Paciente con movilidad reducida',
        clinicalInfo: 'Requiere silla de ruedas',
        tipoAtencion: 'Special',
        status: 'PENDING',
        assignedTurn: nextTurn++,
        isDeferred: false
      },
    ];

    console.log('👥 Creando pacientes de prueba...\n');

    for (const patient of testPatients) {
      const created = await prisma.turnRequest.create({
        data: patient
      });

      const tipo = patient.tipoAtencion === 'Special' ? '⭐ ESPECIAL' : '📄 GENERAL';
      console.log(`  ✅ Turno #${created.assignedTurn} - ${tipo} - ${patient.patientName}`);
    }

    console.log('\n📊 Resumen de datos creados:');
    console.log(`  • Total de pacientes: ${testPatients.length}`);
    console.log(`  • Pacientes especiales: ${testPatients.filter(p => p.tipoAtencion === 'Special').length}`);
    console.log(`  • Pacientes generales: ${testPatients.filter(p => p.tipoAtencion === 'General').length}`);
    console.log(`  • Turnos asignados: ${nextTurn - (lastTurn ? lastTurn.assignedTurn + 1 : 1)}`);

    // 4. Mostrar estado actual de la cola
    const allPending = await prisma.turnRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: [
        { tipoAtencion: 'desc' },
        { isDeferred: 'desc' },
        { assignedTurn: 'asc' }
      ]
    });

    console.log(`\n📋 Cola actual (${allPending.length} pacientes en espera):`);
    allPending.forEach((turn, index) => {
      const tipo = turn.tipoAtencion === 'Special' ? '⭐' : '📄';
      const diferido = turn.isDeferred ? '⏳' : '  ';
      console.log(`  ${index + 1}. ${tipo} ${diferido} Turno #${turn.assignedTurn} - ${turn.patientName}`);
    });

    console.log('\n✅ Datos de prueba creados exitosamente!');
    console.log('\n📌 Puedes verificar los datos en:');
    console.log('   - Cola pública: http://localhost:3005/turns/queue');
    console.log('   - Prisma Studio: http://localhost:5555');

  } catch (error) {
    console.error('❌ Error al crear datos de prueba:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
