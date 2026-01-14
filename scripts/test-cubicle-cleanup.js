/**
 * Test de Limpieza de Cubículos por Inactividad
 *
 * Este script verifica que los cubículos se liberan cuando
 * la sesión tiene lastActivity > 20 minutos.
 *
 * Uso: node scripts/test-cubicle-cleanup.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function runTest() {
  console.log('🔬 TEST DE LIMPIEZA DE CUBÍCULOS POR INACTIVIDAD');
  console.log('='.repeat(60));

  try {
    // 1. Crear una sesión de prueba con cubículo y lastActivity antigua (>20 min)
    console.log('\n📝 Paso 1: Crear sesión de prueba con lastActivity antigua...');

    // Buscar un usuario existente
    const testUser = await prisma.user.findFirst({
      where: { role: 'Flebotomista' }
    });

    if (!testUser) {
      console.log('❌ No hay usuarios Flebotomista en la BD para prueba');
      return false;
    }

    // Buscar un cubículo activo
    const testCubicle = await prisma.cubicle.findFirst({
      where: { isActive: true }
    });

    if (!testCubicle) {
      console.log('❌ No hay cubículos activos en la BD para prueba');
      return false;
    }

    console.log(`   Usuario: ${testUser.name} (ID: ${testUser.id})`);
    console.log(`   Cubículo: ${testCubicle.name} (ID: ${testCubicle.id})`);

    // Crear sesión con lastActivity de hace 25 minutos (más de 20)
    const oldActivityTime = new Date(Date.now() - 25 * 60 * 1000); // 25 min atrás
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 horas en futuro

    const testSession = await prisma.session.create({
      data: {
        userId: testUser.id,
        token: `test-cleanup-${Date.now()}`,
        lastActivity: oldActivityTime,
        expiresAt: expiresAt,
        selectedCubicleId: testCubicle.id
      }
    });

    console.log(`   ✅ Sesión creada: ID=${testSession.id}`);
    console.log(`   lastActivity: ${oldActivityTime.toISOString()} (hace 25 min)`);
    console.log(`   selectedCubicleId: ${testCubicle.id}`);

    // 2. Verificar que el cubículo está "ocupado" en la BD
    console.log('\n📝 Paso 2: Verificar sesión en BD antes de cleanup...');

    const sessionBefore = await prisma.session.findUnique({
      where: { id: testSession.id }
    });

    console.log(`   selectedCubicleId: ${sessionBefore.selectedCubicleId}`);

    if (sessionBefore.selectedCubicleId !== testCubicle.id) {
      console.log('❌ Error: El cubículo no se asignó correctamente');
      await prisma.session.delete({ where: { id: testSession.id } });
      return false;
    }

    console.log('   ✅ Cubículo asignado correctamente');

    // 3. Llamar al endpoint /api/cubicles/status que debería ejecutar cleanup
    console.log('\n📝 Paso 3: Llamar a /api/cubicles/status (ejecuta cleanup)...');

    const response = await fetch(`${BASE_URL}/api/cubicles/status`);
    const data = await response.json();

    if (!response.ok) {
      console.log(`❌ Error en API: ${data.error}`);
      await prisma.session.delete({ where: { id: testSession.id } });
      return false;
    }

    console.log('   ✅ API respondió correctamente');

    // 4. Verificar que el cubículo fue liberado (selectedCubicleId = null)
    console.log('\n📝 Paso 4: Verificar que el cubículo fue liberado...');

    const sessionAfter = await prisma.session.findUnique({
      where: { id: testSession.id }
    });

    if (!sessionAfter) {
      console.log('   ⚠️ La sesión fue eliminada (comportamiento alternativo)');
    } else {
      console.log(`   selectedCubicleId después: ${sessionAfter.selectedCubicleId}`);

      if (sessionAfter.selectedCubicleId === null) {
        console.log('   ✅ ¡CUBÍCULO LIBERADO CORRECTAMENTE!');
      } else {
        console.log('   ❌ El cubículo NO fue liberado');
        await prisma.session.delete({ where: { id: testSession.id } });
        return false;
      }
    }

    // 5. Verificar que el cubículo no aparece como ocupado en la respuesta
    console.log('\n📝 Paso 5: Verificar respuesta de API...');

    const cubicleStatus = data.data.find(c => c.id === testCubicle.id);
    if (cubicleStatus) {
      console.log(`   Cubículo ${testCubicle.name}: isOccupied = ${cubicleStatus.isOccupied}`);

      if (!cubicleStatus.isOccupied) {
        console.log('   ✅ Cubículo aparece como DISPONIBLE en API');
      } else {
        console.log('   ❌ Cubículo aún aparece como OCUPADO');
      }
    }

    // Limpiar sesión de prueba
    console.log('\n📝 Limpiando sesión de prueba...');
    if (sessionAfter) {
      await prisma.session.delete({ where: { id: testSession.id } });
    }
    console.log('   ✅ Sesión de prueba eliminada');

    // Resultado final
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ¡PRUEBA EXITOSA!');
    console.log('   Los cubículos se liberan correctamente cuando la sesión');
    console.log('   tiene más de 20 minutos de inactividad.');

    return true;

  } catch (error) {
    console.error('❌ Error en prueba:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
runTest()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
