/**
 * Script de prueba para verificar el orden de asignación de pacientes
 * basado en el orden de login de los flebotomistas
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3005';

async function testPhlebotomistOrder() {
  console.log('🧪 Prueba de Orden de Asignación de Pacientes\n');
  console.log('=' .repeat(60));

  // 1. Verificar orden de flebotomistas
  console.log('\n📋 PASO 1: Obteniendo orden de flebotomistas logueados...\n');

  try {
    const orderResponse = await fetch(`${BASE_URL}/api/queue/phlebotomists-order`);
    const orderData = await orderResponse.json();

    if (orderData.success) {
      console.log(`✅ Total de flebotomistas activos: ${orderData.totalActive}\n`);

      orderData.phlebotomists.forEach((phlebotomist) => {
        console.log(`   Posición #${phlebotomist.order}: ${phlebotomist.name} (@${phlebotomist.username})`);
        console.log(`      Login: ${new Date(phlebotomist.loginTime).toLocaleString('es-ES')}`);
        console.log(`      Tiempo desde login: ${phlebotomist.minutesSinceLogin} minutos`);
        console.log(`      Pacientes sugeridos: ${phlebotomist.suggestedPatients}`);
        console.log(`      Pacientes en atención: ${phlebotomist.patientsInAttention}`);
        console.log('');
      });
    } else {
      console.error('❌ Error al obtener orden de flebotomistas');
      return;
    }

    // 2. Ejecutar asignación de sugerencias
    console.log('=' .repeat(60));
    console.log('\n🔄 PASO 2: Ejecutando asignación automática de pacientes...\n');

    const assignResponse = await fetch(`${BASE_URL}/api/queue/assignSuggestions`, {
      method: 'POST'
    });
    const assignData = await assignResponse.json();

    if (assignData.success) {
      console.log(`✅ ${assignData.assigned} pacientes asignados\n`);

      if (assignData.assignments && assignData.assignments.length > 0) {
        console.log('📊 Asignaciones realizadas:\n');
        assignData.assignments.forEach((assignment) => {
          console.log(`   Flebotomista #${assignment.loginOrder}: ${assignment.assignedTo}`);
          console.log(`      → Turno #${assignment.turnNumber}: ${assignment.patientName}`);
          console.log('');
        });
      }

      console.log('=' .repeat(60));
      console.log('\n📈 Resumen:');
      console.log(`   • Flebotomistas activos: ${assignData.activePhlebotomists}`);
      console.log(`   • Pacientes disponibles: ${assignData.availablePatients}`);
      console.log(`   • Asignaciones realizadas: ${assignData.assigned}`);
      console.log('');
    } else {
      console.log(`ℹ️  ${assignData.message || 'No se realizaron asignaciones'}`);
    }

    console.log('=' .repeat(60));
    console.log('\n✅ Prueba completada\n');

  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error.message);
  }
}

// Ejecutar prueba
testPhlebotomistOrder();
