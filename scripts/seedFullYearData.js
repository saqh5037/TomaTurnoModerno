require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Nombres de pacientes ficticios
const firstNames = [
  'María', 'José', 'Ana', 'Carlos', 'Luisa', 'Miguel', 'Carmen', 'Francisco', 
  'Elena', 'Antonio', 'Isabel', 'Manuel', 'Rosa', 'David', 'Pilar', 'Juan',
  'Dolores', 'Javier', 'Mercedes', 'Rafael', 'Concepción', 'Daniel', 'Josefa',
  'Alejandro', 'Francisca', 'Adrián', 'Antonia', 'Fernando', 'Teresa', 'Diego',
  'Patricia', 'Roberto', 'Cristina', 'Eduardo', 'Beatriz', 'Ángel', 'Rocío',
  'Sergio', 'Nuria', 'Pablo', 'Silvia', 'Rubén', 'Montserrat', 'Álvaro',
  'Gloria', 'Víctor', 'Esperanza', 'Raúl', 'Amparo', 'Gonzalo'
];

const lastNames = [
  'García', 'González', 'Rodríguez', 'Fernández', 'López', 'Martínez', 'Sánchez',
  'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno',
  'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez', 'Navarro', 'Torres',
  'Domínguez', 'Vázquez', 'Ramos', 'Gil', 'Ramírez', 'Serrano', 'Blanco', 'Suárez',
  'Castro', 'Ortega', 'Delgado', 'Herrera', 'Peña', 'Guerrero', 'Mendoza',
  'Aguilar', 'Flores', 'León', 'Vega', 'Cabrera', 'Reyes', 'Cruz', 'Molina'
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
  'Hepatitis B y C',
  'Ácido Úrico',
  'Triglicéridos',
  'Colesterol Total',
  'HDL y LDL',
  'Tiempo de Protrombina',
  'Fibrinógeno',
  'Dímero D',
  'PCR Cuantitativa',
  'Vitamina D',
  'Vitamina B12'
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
  const femaleNames = ['María', 'Ana', 'Luisa', 'Carmen', 'Elena', 'Isabel', 'Rosa', 'Pilar', 'Dolores', 'Mercedes', 'Concepción', 'Josefa', 'Francisca', 'Antonia', 'Teresa', 'Patricia', 'Cristina', 'Beatriz', 'Rocío', 'Nuria', 'Silvia', 'Montserrat', 'Gloria', 'Esperanza', 'Amparo'];
  const firstName = name.split(' ')[0];
  return femaleNames.includes(firstName) ? 'Femenino' : 'Masculino';
}

// Generar estudios aleatorios
function generateRandomStudies() {
  const numStudies = Math.random() < 0.6 ? 1 : Math.floor(Math.random() * 4) + 1; // 60% una prueba, 40% múltiples
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
  if (rand < 0.08) return Math.floor(Math.random() * 3) + 5;   // 5-7 min (8% - muy rápido)
  if (rand < 0.55) return Math.floor(Math.random() * 6) + 8;   // 8-13 min (47% - normal)
  if (rand < 0.85) return Math.floor(Math.random() * 5) + 14;  // 14-18 min (30% - normal-lento)
  return Math.floor(Math.random() * 7) + 19;                 // 19-25 min (15% - complicado)
}

// Generar variación estacional (más pacientes en ciertos meses)
function getSeasonalMultiplier(month) {
  // Enero-Febrero: Alta demanda post-navidad
  // Marzo-Mayo: Demanda normal-alta
  // Junio-Agosto: Demanda normal (vacaciones)  
  // Septiembre-Noviembre: Alta demanda (regreso de vacaciones)
  // Diciembre: Baja demanda (navidad)
  const seasonalFactors = [
    1.15, // Enero - alta
    1.10, // Febrero - alta
    1.05, // Marzo - normal-alta
    1.02, // Abril - normal-alta
    1.00, // Mayo - normal
    0.90, // Junio - baja (vacaciones)
    0.85, // Julio - muy baja (vacaciones)
    0.88, // Agosto - baja (vacaciones)
    1.08, // Septiembre - alta (regreso)
    1.12, // Octubre - alta
    1.06, // Noviembre - normal-alta
    0.80  // Diciembre - muy baja (navidad)
  ];
  
  return seasonalFactors[month - 1];
}

async function seedFullYearData() {
  try {
    console.log('🌱 Iniciando generación de datos para TODO EL AÑO 2024...');
    console.log('📈 Rango: 80-120 pacientes por día hábil');

    // Primero, limpiar datos existentes de 2024
    console.log('🧹 Eliminando datos existentes de 2024...');
    const deletedCount = await prisma.turnRequest.deleteMany({
      where: {
        createdAt: {
          gte: new Date(2024, 0, 1),
          lt: new Date(2025, 0, 1)
        }
      }
    });
    console.log(`   Eliminados: ${deletedCount.count} registros anteriores`);

    // Obtener o crear usuarios flebotomistas
    let phlebotomists = await prisma.user.findMany({
      where: { role: 'Flebotomista' }
    });

    // Si no hay suficientes flebotomistas, crear más
    if (phlebotomists.length < 8) {
      console.log('📋 Creando flebotomistas adicionales...');
      
      const phlebotomistData = [
        { username: 'flebotomista1', name: 'Dr. Ana Patricia López', role: 'Flebotomista' },
        { username: 'flebotomista2', name: 'Dr. Carlos Eduardo Martín', role: 'Flebotomista' },
        { username: 'flebotomista3', name: 'Dra. María Isabel García', role: 'Flebotomista' },
        { username: 'flebotomista4', name: 'Dr. Fernando Ruiz Hernández', role: 'Flebotomista' },
        { username: 'flebotomista5', name: 'Dra. Rosa Elena Jiménez', role: 'Flebotomista' },
        { username: 'flebotomista6', name: 'Dr. Miguel Ángel Torres', role: 'Flebotomista' },
        { username: 'flebotomista7', name: 'Dra. Carmen Dolores Vega', role: 'Flebotomista' },
        { username: 'flebotomista8', name: 'Dr. Roberto González Silva', role: 'Flebotomista' }
      ];

      for (const phlebData of phlebotomistData) {
        const existing = await prisma.user.findUnique({
          where: { username: phlebData.username }
        });
        
        if (!existing) {
          await prisma.user.create({
            data: {
              ...phlebData,
              password: 'password123'
            }
          });
        }
      }

      phlebotomists = await prisma.user.findMany({
        where: { role: 'Flebotomista' }
      });
    }

    console.log(`👨‍⚕️ Usando ${phlebotomists.length} flebotomistas`);

    // Obtener cubículos existentes
    let cubicles = await prisma.cubicle.findMany();
    if (cubicles.length === 0) {
      console.log('🏥 Creando cubículos...');
      
      const cubicleData = [
        { name: 'Cubículo 1', type: 'GENERAL' },
        { name: 'Cubículo 2', type: 'GENERAL' },
        { name: 'Cubículo 3', type: 'GENERAL' },
        { name: 'Cubículo 4', type: 'GENERAL' },
        { name: 'Cubículo 5', type: 'GENERAL' },
        { name: 'Cubículo Especial 1', type: 'SPECIAL', isSpecial: true },
        { name: 'Cubículo Especial 2', type: 'SPECIAL', isSpecial: true }
      ];

      for (const cubData of cubicleData) {
        await prisma.cubicle.create({ data: cubData });
      }

      cubicles = await prisma.cubicle.findMany();
    }

    console.log(`🏥 Usando ${cubicles.length} cubículos`);

    // Generar datos para todos los meses de 2024
    let totalRecordsCreated = 0;
    let totalWorkdays = 0;

    const months = [
      { year: 2024, month: 1, name: 'Enero' },
      { year: 2024, month: 2, name: 'Febrero' },
      { year: 2024, month: 3, name: 'Marzo' },
      { year: 2024, month: 4, name: 'Abril' },
      { year: 2024, month: 5, name: 'Mayo' },
      { year: 2024, month: 6, name: 'Junio' },
      { year: 2024, month: 7, name: 'Julio' },
      { year: 2024, month: 8, name: 'Agosto' },
      { year: 2024, month: 9, name: 'Septiembre' },
      { year: 2024, month: 10, name: 'Octubre' },
      { year: 2024, month: 11, name: 'Noviembre' },
      { year: 2024, month: 12, name: 'Diciembre' }
    ];

    for (const { year, month, name } of months) {
      console.log(`\n📅 Generando datos para ${name} ${year}...`);
      
      const seasonalMultiplier = getSeasonalMultiplier(month);
      console.log(`   Factor estacional: ${(seasonalMultiplier * 100).toFixed(0)}%`);
      
      const daysInMonth = new Date(year, month, 0).getDate();
      let monthRecords = 0;
      let monthWorkdays = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month - 1, day);
        
        // Solo generar datos para días hábiles
        if (!isWeekday(currentDate)) {
          continue;
        }

        monthWorkdays++;
        totalWorkdays++;

        // Calcular número de pacientes para el día (80-120 base + factor estacional)
        const basePatients = 80 + Math.floor(Math.random() * 41); // 80-120
        const adjustedPatients = Math.round(basePatients * seasonalMultiplier);
        const finalPatients = Math.max(60, Math.min(150, adjustedPatients)); // límites 60-150

        if (day <= 5 || day % 5 === 0) { // Mostrar progreso cada 5 días hábiles
          console.log(`  📝 Día ${currentDate.toLocaleDateString()}: ${finalPatients} pacientes`);
        }

        // Generar horarios de trabajo de 7:00 AM a 4:00 PM
        const workStartHour = 7;
        const workEndHour = 16;
        const workMinutes = (workEndHour - workStartHour) * 60; // 540 minutos

        for (let i = 0; i < finalPatients; i++) {
          // Generar datos del paciente
          const patientName = generateRandomName();
          const gender = getGenderFromName(patientName);
          const age = Math.floor(Math.random() * 65) + 18; // 18-82 años
          const studies = generateRandomStudies();
          const tubesRequired = Math.floor(Math.random() * 5) + 1; // 1-5 tubos
          const attentionTime = generateAttentionTime();

          // Calcular horarios dentro del día laboral
          const minuteOffset = Math.floor(Math.random() * (workMinutes - 60)); // Dejar margen
          const createdAt = new Date(year, month - 1, day, workStartHour, 0, 0);
          createdAt.setMinutes(createdAt.getMinutes() + minuteOffset);

          // Tiempo entre creación y llamada (3-25 minutos)
          const calledAt = new Date(createdAt.getTime() + (Math.floor(Math.random() * 22) + 3) * 60000);
          
          // Tiempo entre llamada e inicio de atención (1-8 minutos)
          const attendedAt = new Date(calledAt.getTime() + (Math.floor(Math.random() * 7) + 1) * 60000);
          
          // Tiempo de finalización basado en el tiempo de atención
          const finishedAt = new Date(attendedAt.getTime() + attentionTime * 60000);

          // Asignar flebotomista y cubículo aleatoriamente
          const assignedPhlebotomist = phlebotomists[Math.floor(Math.random() * phlebotomists.length)];
          const assignedCubicle = cubicles[Math.floor(Math.random() * cubicles.length)];
          const assignedTurn = Math.floor(Math.random() * 300) + 1; // Número de turno 1-300

          try {
            await prisma.turnRequest.create({
              data: {
                patientName,
                age,
                gender,
                contactInfo: `555-${Math.floor(Math.random() * 9000) + 1000}`,
                studies,
                tubesRequired,
                observations: Math.random() < 0.25 ? 'Paciente en ayunas' : null,
                clinicalInfo: Math.random() < 0.15 ? ['Diabetes tipo 2', 'Hipertensión arterial', 'Dislipidemia'][Math.floor(Math.random() * 3)] : null,
                status: 'Completed',
                tipoAtencion: Math.random() < 0.85 ? 'General' : 'Especial',
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

      console.log(`   ✅ ${name}: ${monthRecords} registros en ${monthWorkdays} días hábiles (${Math.round(monthRecords/monthWorkdays)} promedio/día)`);
      totalRecordsCreated += monthRecords;
    }

    console.log(`\n🎉 ¡Generación completada para todo 2024!`);
    console.log(`📊 Total de registros creados: ${totalRecordsCreated.toLocaleString()}`);
    console.log(`📅 Total de días hábiles: ${totalWorkdays}`);
    console.log(`👨‍⚕️ Promedio por día hábil: ${Math.round(totalRecordsCreated/totalWorkdays)} pacientes`);
    console.log(`👨‍⚕️ Flebotomistas activos: ${phlebotomists.length}`);
    console.log(`🏥 Cubículos disponibles: ${cubicles.length}`);

    // Mostrar resumen por trimestre
    console.log('\n📈 Resumen por trimestre:');
    
    const q1Count = await prisma.turnRequest.count({
      where: {
        status: 'Completed',
        createdAt: {
          gte: new Date(2024, 0, 1),  // Enero 1
          lt: new Date(2024, 3, 1)    // Abril 1
        }
      }
    });

    const q2Count = await prisma.turnRequest.count({
      where: {
        status: 'Completed',
        createdAt: {
          gte: new Date(2024, 3, 1),  // Abril 1
          lt: new Date(2024, 6, 1)    // Julio 1
        }
      }
    });

    const q3Count = await prisma.turnRequest.count({
      where: {
        status: 'Completed',
        createdAt: {
          gte: new Date(2024, 6, 1),  // Julio 1
          lt: new Date(2024, 9, 1)    // Octubre 1
        }
      }
    });

    const q4Count = await prisma.turnRequest.count({
      where: {
        status: 'Completed',
        createdAt: {
          gte: new Date(2024, 9, 1),  // Octubre 1
          lt: new Date(2025, 0, 1)    // Enero 1, 2025
        }
      }
    });

    console.log(`📊 Q1 (Ene-Mar): ${q1Count.toLocaleString()} pacientes`);
    console.log(`📊 Q2 (Abr-Jun): ${q2Count.toLocaleString()} pacientes`);
    console.log(`📊 Q3 (Jul-Sep): ${q3Count.toLocaleString()} pacientes`);
    console.log(`📊 Q4 (Oct-Dic): ${q4Count.toLocaleString()} pacientes`);
    console.log(`📊 Total verificado: ${(q1Count + q2Count + q3Count + q4Count).toLocaleString()} pacientes`);

  } catch (error) {
    console.error('❌ Error durante la generación de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
if (require.main === module) {
  seedFullYearData();
}

module.exports = { seedFullYearData };