require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Nombres de pacientes ficticios
const firstNames = [
  'María', 'José', 'Ana', 'Carlos', 'Luisa', 'Miguel', 'Carmen', 'Francisco', 
  'Elena', 'Antonio', 'Isabel', 'Manuel', 'Rosa', 'David', 'Pilar', 'Juan',
  'Dolores', 'Javier', 'Mercedes', 'Rafael', 'Concepción', 'Daniel', 'Josefa',
  'Alejandro', 'Francisca', 'Adrián', 'Antonia', 'Fernando', 'Teresa', 'Diego'
];

const lastNames = [
  'García', 'González', 'Rodríguez', 'Fernández', 'López', 'Martínez', 'Sánchez',
  'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno',
  'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez', 'Navarro', 'Torres',
  'Domínguez', 'Vázquez', 'Ramos', 'Gil', 'Ramírez', 'Serrano', 'Blanco', 'Suárez'
];

// Tipos de estudios médicos
const studiesTypes = [
  'Biometría Hemática Completa',
  'Química Sanguínea 24 elementos',
  'Perfil Lipídico',
  'Glucosa en ayunas',
  'Hemoglobina Glicosilada',
  'Perfil Tiroideo',
  'Examen General de Orina',
  'Perfil Hepático',
  'Perfil Renal',
  'Marcadores Tumorales',
  'Perfil Cardíaco',
  'Electrolitos Séricos',
  'Proteína C Reactiva',
  'Factor Reumatoide',
  'Antiestreptolisinas',
  'Cultivo de Orina',
  'Coproparasitoscópico',
  'VDRL',
  'VIH',
  'Hepatitis B y C'
];

// Generar nombre aleatorio
function generateRandomName() {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName1 = lastNames[Math.floor(Math.random() * lastNames.length)];
  const lastName2 = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName1} ${lastName2}`;
}

// Generar género basado en el nombre
function getGenderFromName(name) {
  const femaleNames = ['María', 'Ana', 'Luisa', 'Carmen', 'Elena', 'Isabel', 'Rosa', 'Pilar', 'Dolores', 'Mercedes', 'Concepción', 'Josefa', 'Francisca', 'Antonia', 'Teresa'];
  const firstName = name.split(' ')[0];
  return femaleNames.includes(firstName) ? 'Femenino' : 'Masculino';
}

// Generar estudios aleatorios
function generateRandomStudies() {
  const numStudies = Math.random() < 0.7 ? 1 : Math.floor(Math.random() * 3) + 1; // 70% una prueba, 30% múltiples
  const selectedStudies = [];
  
  for (let i = 0; i < numStudies; i++) {
    const study = studiesTypes[Math.floor(Math.random() * studiesTypes.length)];
    if (!selectedStudies.includes(study)) {
      selectedStudies.push(study);
    }
  }
  
  return selectedStudies.join(', ');
}

// Función para verificar si es día hábil (lunes a viernes)
function isWeekday(date) {
  const day = date.getDay();
  return day >= 1 && day <= 5; // 1=Lunes, 5=Viernes
}

// Generar tiempo de atención realista (en minutos)
function generateAttentionTime() {
  // Distribución realista: mayoría entre 8-15 minutos
  const rand = Math.random();
  if (rand < 0.1) return Math.floor(Math.random() * 3) + 5;   // 5-7 min (10% - muy rápido)
  if (rand < 0.6) return Math.floor(Math.random() * 6) + 8;   // 8-13 min (50% - normal)
  if (rand < 0.9) return Math.floor(Math.random() * 5) + 14;  // 14-18 min (30% - normal-lento)
  return Math.floor(Math.random() * 7) + 19;                 // 19-25 min (10% - complicado)
}

async function seedTestData() {
  try {
    console.log('🌱 Iniciando generación de datos de prueba...');

    // Primero, obtener o crear usuarios flebotomistas
    let phlebotomists = await prisma.user.findMany({
      where: { role: 'Flebotomista' }
    });

    // Si no hay flebotomistas, crear algunos
    if (phlebotomists.length === 0) {
      console.log('📋 Creando flebotomistas de prueba...');
      
      const phlebotomistData = [
        { username: 'flebotomista1', name: 'Dr. Ana Patricia López', role: 'Flebotomista' },
        { username: 'flebotomista2', name: 'Dr. Carlos Eduardo Martín', role: 'Flebotomista' },
        { username: 'flebotomista3', name: 'Dra. María Isabel García', role: 'Flebotomista' },
        { username: 'flebotomista4', name: 'Dr. Fernando Ruiz Hernández', role: 'Flebotomista' },
        { username: 'flebotomista5', name: 'Dra. Rosa Elena Jiménez', role: 'Flebotomista' }
      ];

      for (const phlebData of phlebotomistData) {
        await prisma.user.create({
          data: {
            ...phlebData,
            password: 'password123' // Password simple para pruebas
          }
        });
      }

      phlebotomists = await prisma.user.findMany({
        where: { role: 'Flebotomista' }
      });
    }

    console.log(`👨‍⚕️ Usando ${phlebotomists.length} flebotomistas existentes`);

    // Obtener cubículos existentes
    let cubicles = await prisma.cubicle.findMany();
    if (cubicles.length === 0) {
      console.log('🏥 Creando cubículos de prueba...');
      
      const cubicleData = [
        { name: 'Cubículo 1', type: 'GENERAL' },
        { name: 'Cubículo 2', type: 'GENERAL' },
        { name: 'Cubículo 3', type: 'GENERAL' },
        { name: 'Cubículo Especial 1', type: 'SPECIAL', isSpecial: true },
        { name: 'Cubículo Especial 2', type: 'SPECIAL', isSpecial: true }
      ];

      for (const cubData of cubicleData) {
        await prisma.cubicle.create({ data: cubData });
      }

      cubicles = await prisma.cubicle.findMany();
    }

    console.log(`🏥 Usando ${cubicles.length} cubículos existentes`);

    // Generar datos para Noviembre y Diciembre 2024
    const months = [
      { year: 2024, month: 11, name: 'Noviembre' }, // Noviembre
      { year: 2024, month: 12, name: 'Diciembre' }  // Diciembre
    ];

    let totalRecordsCreated = 0;

    for (const { year, month, name } of months) {
      console.log(`\n📅 Generando datos para ${name} ${year}...`);
      
      // Obtener número de días en el mes
      const daysInMonth = new Date(year, month, 0).getDate();
      
      let monthRecords = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month - 1, day);
        
        // Solo generar datos para días hábiles (lunes a viernes)
        if (!isWeekday(currentDate)) {
          console.log(`⏭️  Saltando ${currentDate.toLocaleDateString()} (fin de semana)`);
          continue;
        }

        // Generar entre 35-65 pacientes por día (promedio ~50)
        const basePatients = 45;
        const variation = Math.floor(Math.random() * 21) - 10; // -10 a +10
        const patientsForDay = Math.max(30, Math.min(70, basePatients + variation));

        console.log(`  📝 Generando ${patientsForDay} pacientes para ${currentDate.toLocaleDateString()}`);

        // Generar horarios de trabajo de 7:00 AM a 4:00 PM
        const workStartHour = 7;
        const workEndHour = 16;
        const workMinutes = (workEndHour - workStartHour) * 60; // 540 minutos

        for (let i = 0; i < patientsForDay; i++) {
          // Generar datos del paciente
          const patientName = generateRandomName();
          const gender = getGenderFromName(patientName);
          const age = Math.floor(Math.random() * 60) + 18; // 18-78 años
          const studies = generateRandomStudies();
          const tubesRequired = Math.floor(Math.random() * 4) + 1; // 1-4 tubos
          const attentionTime = generateAttentionTime();

          // Calcular horarios dentro del día laboral
          const minuteOffset = Math.floor(Math.random() * (workMinutes - 60)); // Dejar margen para la atención
          const createdAt = new Date(year, month - 1, day, workStartHour, 0, 0);
          createdAt.setMinutes(createdAt.getMinutes() + minuteOffset);

          // Tiempo entre creación y llamada (5-30 minutos)
          const calledAt = new Date(createdAt.getTime() + (Math.floor(Math.random() * 25) + 5) * 60000);
          
          // Tiempo entre llamada e inicio de atención (2-10 minutos)
          const attendedAt = new Date(calledAt.getTime() + (Math.floor(Math.random() * 8) + 2) * 60000);
          
          // Tiempo de finalización basado en el tiempo de atención
          const finishedAt = new Date(attendedAt.getTime() + attentionTime * 60000);

          // Asignar flebotomista y cubículo aleatoriamente
          const assignedPhlebotomist = phlebotomists[Math.floor(Math.random() * phlebotomists.length)];
          const assignedCubicle = cubicles[Math.floor(Math.random() * cubicles.length)];
          const assignedTurn = Math.floor(Math.random() * 200) + 1; // Número de turno 1-200

          try {
            await prisma.turnRequest.create({
              data: {
                patientName,
                age,
                gender,
                contactInfo: `555-${Math.floor(Math.random() * 9000) + 1000}`,
                studies,
                tubesRequired,
                observations: Math.random() < 0.3 ? 'Paciente en ayunas' : null,
                clinicalInfo: Math.random() < 0.2 ? 'Diabetes tipo 2' : null,
                status: 'Completed',
                tipoAtencion: Math.random() < 0.8 ? 'General' : 'Especial',
                assignedTurn,
                isCalled: true,
                createdAt,
                calledAt,
                attendedAt,
                finishedAt,
                attendedBy: assignedPhlebotomist.id,
                cubicleId: assignedCubicle.id,
                updatedAt: finishedAt
              }
            });

            monthRecords++;
          } catch (error) {
            console.error(`❌ Error creando registro para ${patientName}:`, error.message);
          }
        }
      }

      console.log(`✅ ${name}: ${monthRecords} registros creados`);
      totalRecordsCreated += monthRecords;
    }

    console.log(`\n🎉 ¡Generación completada!`);
    console.log(`📊 Total de registros creados: ${totalRecordsCreated}`);
    console.log(`👨‍⚕️ Flebotomistas: ${phlebotomists.length}`);
    console.log(`🏥 Cubículos: ${cubicles.length}`);

    // Mostrar resumen por mes
    console.log('\n📈 Resumen por mes:');
    
    const novemberCount = await prisma.turnRequest.count({
      where: {
        finishedAt: {
          gte: new Date(2024, 10, 1), // Noviembre 1
          lt: new Date(2024, 11, 1)   // Diciembre 1
        },
        status: 'Completed'
      }
    });

    const decemberCount = await prisma.turnRequest.count({
      where: {
        finishedAt: {
          gte: new Date(2024, 11, 1), // Diciembre 1
          lt: new Date(2025, 0, 1)    // Enero 1
        },
        status: 'Completed'
      }
    });

    console.log(`📅 Noviembre 2024: ${novemberCount} pacientes`);
    console.log(`📅 Diciembre 2024: ${decemberCount} pacientes`);
    console.log(`📊 Total: ${novemberCount + decemberCount} pacientes`);

  } catch (error) {
    console.error('❌ Error durante la generación de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
if (require.main === module) {
  seedTestData();
}

module.exports = { seedTestData };