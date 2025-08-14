// scripts/create-test-turns.js
import prisma from '../lib/prisma.js';

const firstNames = [
  'María', 'José', 'Ana', 'Luis', 'Carlos', 'Rosa', 'Pedro', 'Carmen',
  'Miguel', 'Laura', 'Fernando', 'Patricia', 'Roberto', 'Sofía', 'Diego',
  'Alejandra', 'Ricardo', 'Valentina', 'Javier', 'Isabel'
];

const lastNames = [
  'García', 'Rodríguez', 'Martínez', 'López', 'González', 'Hernández',
  'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera',
  'Gómez', 'Díaz', 'Cruz', 'Morales', 'Reyes', 'Gutiérrez', 'Jiménez', 'Ruiz'
];

const studies = [
  'Hemograma completo',
  'Química sanguínea',
  'Perfil lipídico',
  'Glucosa en ayunas',
  'Pruebas de función hepática',
  'Pruebas de función renal',
  'Electrolitos séricos',
  'Hormona estimulante de tiroides (TSH)',
  'Tiempo de protrombina',
  'Biometría hemática',
  'Examen general de orina',
  'Cultivo de sangre',
  'Proteína C reactiva',
  'Velocidad de sedimentación globular',
  'Ácido úrico'
];

async function createTestTurns() {
  console.log('🔄 Creando 20 turnos de prueba...');
  
  const turns = [];
  
  for (let i = 0; i < 20; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName1 = lastNames[Math.floor(Math.random() * lastNames.length)];
    const lastName2 = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${firstName} ${lastName1} ${lastName2}`;
    
    const age = Math.floor(Math.random() * 60) + 18; // Entre 18 y 78 años
    const gender = Math.random() > 0.5 ? 'M' : 'F';
    const selectedStudies = [];
    const numStudies = Math.floor(Math.random() * 3) + 1; // Entre 1 y 3 estudios
    
    for (let j = 0; j < numStudies; j++) {
      const study = studies[Math.floor(Math.random() * studies.length)];
      if (!selectedStudies.includes(study)) {
        selectedStudies.push(study);
      }
    }
    
    const tubesRequired = Math.floor(Math.random() * 4) + 1; // Entre 1 y 4 tubos
    const phoneNumber = `55${Math.floor(Math.random() * 90000000) + 10000000}`;
    
    const observations = Math.random() > 0.7 ? 
      ['Paciente en ayunas', 'Paciente diabético', 'Alérgico al látex', 'Requiere atención especial'][Math.floor(Math.random() * 4)] : 
      null;
    
    const clinicalInfo = Math.random() > 0.6 ?
      ['Hipertensión arterial', 'Diabetes mellitus tipo 2', 'Hipotiroidismo', 'Enfermedad renal crónica'][Math.floor(Math.random() * 4)] :
      null;
    
    const turnData = {
      patientName: fullName,
      age: age,
      gender: gender,
      contactInfo: phoneNumber,
      studies: selectedStudies.join(', '),
      tubesRequired: tubesRequired,
      observations: observations,
      clinicalInfo: clinicalInfo,
      status: 'Pending',
      assignedTurn: i + 1,
      tipoAtencion: Math.random() > 0.8 ? 'Especial' : 'General',
      isCalled: false
    };
    
    turns.push(turnData);
  }
  
  try {
    // Crear todos los turnos
    const createdTurns = await prisma.turnRequest.createMany({
      data: turns
    });
    
    console.log(`✅ Se crearon ${createdTurns.count} turnos exitosamente`);
    
    // Mostrar resumen
    const summary = await prisma.turnRequest.count({
      where: {
        status: 'Pending'
      }
    });
    
    console.log(`📊 Total de turnos pendientes: ${summary}`);
    
  } catch (error) {
    console.error('❌ Error al crear turnos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función
createTestTurns();