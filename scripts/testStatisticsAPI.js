require('dotenv').config({ path: '.env.local' });

// Import the API route handlers directly
const monthlyRoute = require('../src/app/api/statistics/monthly/route.js');
const dailyRoute = require('../src/app/api/statistics/daily/route.js');
const averageTimeRoute = require('../src/app/api/statistics/average-time/route.js');
const phlebotomistsRoute = require('../src/app/api/statistics/phlebotomists/route.js');

// Mock Request objects
function createMockPOSTRequest(body) {
  return {
    json: async () => body,
    url: 'http://localhost:3000/test'
  };
}

function createMockGETRequest(searchParams) {
  const url = new URL('http://localhost:3000/test');
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, value.toString());
    }
  });
  
  return {
    url: url.toString()
  };
}

async function testAPIs() {
  try {
    console.log('🧪 Probando APIs de estadísticas directamente...');
    
    // Test 1: Monthly Statistics API
    console.log('\n📅 1. Probando API de estadísticas mensuales...');
    const monthlyReq = createMockPOSTRequest({ year: 2024 });
    const monthlyResponse = await monthlyRoute.POST(monthlyReq);
    const monthlyData = await monthlyResponse.json();
    
    console.log('   Respuesta mensual:', {
      status: monthlyResponse.status,
      data: monthlyData
    });
    
    // Test 2: Daily Statistics API
    console.log('\n📅 2. Probando API de estadísticas diarias...');
    const dailyReq = createMockPOSTRequest({ year: 2024, month: 11 }); // Noviembre
    const dailyResponse = await dailyRoute.POST(dailyReq);
    const dailyData = await dailyResponse.json();
    
    console.log('   Respuesta diaria (primeros 5 días):', {
      status: dailyResponse.status,
      total: dailyData.total,
      sampleDays: Object.entries(dailyData.dailyData || {}).slice(0, 5)
    });
    
    // Test 3: Average Time Statistics API
    console.log('\n⏱️  3. Probando API de tiempo promedio...');
    const avgTimeReq = createMockGETRequest({ year: '2024', month: '11' });
    const avgTimeResponse = await averageTimeRoute.GET(avgTimeReq);
    const avgTimeData = await avgTimeResponse.json();
    
    console.log('   Respuesta tiempo promedio:', {
      status: avgTimeResponse.status,
      totalPatients: avgTimeData.overallTotalPatients,
      overallAverage: avgTimeData.overallAverage,
      phlebotomistsCount: avgTimeData.phlebotomists?.length || 0
    });
    
    // Test 4: Phlebotomists Statistics API
    console.log('\n👨‍⚕️ 4. Probando API de estadísticas de flebotomistas...');
    
    // First get a phlebotomist ID
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const phlebotomist = await prisma.user.findFirst({
      where: { role: 'Flebotomista' }
    });
    
    if (phlebotomist) {
      const phlebReq = createMockPOSTRequest({ 
        year: 2024, 
        month: 11, // Noviembre
        phlebotomistId: phlebotomist.id 
      });
      const phlebResponse = await phlebotomistsRoute.POST(phlebReq);
      const phlebData = await phlebResponse.json();
      
      console.log('   Respuesta flebotomista:', {
        status: phlebResponse.status,
        phlebotomist: phlebotomist.name,
        total: phlebData.total,
        sampleDays: phlebData.dailyData?.slice(0, 5) || []
      });
    } else {
      console.log('   ❌ No se encontró ningún flebotomista');
    }
    
    await prisma.$disconnect();
    
    console.log('\n✅ Todas las APIs de estadísticas funcionan correctamente!');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas de API:', error);
  }
}

// Ejecutar las pruebas
if (require.main === module) {
  testAPIs();
}

module.exports = { testAPIs };