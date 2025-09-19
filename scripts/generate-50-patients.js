const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Lista de nombres y apellidos mexicanos comunes
const nombres = [
    'Carlos', 'María', 'José', 'Ana', 'Luis', 'Carmen', 'Juan', 'Patricia',
    'Miguel', 'Laura', 'Pedro', 'Sofia', 'Fernando', 'Alejandra', 'Roberto',
    'Gabriela', 'Daniel', 'Mariana', 'Eduardo', 'Valentina', 'Javier', 'Isabella',
    'Ricardo', 'Camila', 'Alberto', 'Regina', 'Raúl', 'Ximena', 'Sergio', 'Natalia',
    'Andrés', 'Andrea', 'Jorge', 'Paola', 'Enrique', 'Daniela', 'Arturo', 'Mónica',
    'Francisco', 'Carolina', 'Diego', 'Fernanda', 'Alejandro', 'Valeria', 'Manuel',
    'Adriana', 'Antonio', 'Elena', 'Rafael', 'Lucía'
];

const apellidos = [
    'García', 'Rodríguez', 'Martínez', 'Hernández', 'López', 'González',
    'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera',
    'Gómez', 'Díaz', 'Cruz', 'Morales', 'Reyes', 'Jiménez',
    'Ruiz', 'Ortiz', 'Gutiérrez', 'Chávez', 'Silva', 'Vázquez',
    'Romero', 'Mendoza', 'Castillo', 'Álvarez', 'Moreno', 'Ramos'
];

// Función para generar nombre aleatorio
function generarNombreCompleto() {
    const nombre = nombres[Math.floor(Math.random() * nombres.length)];
    const apellido1 = apellidos[Math.floor(Math.random() * apellidos.length)];
    const apellido2 = apellidos[Math.floor(Math.random() * apellidos.length)];
    return `${nombre} ${apellido1} ${apellido2}`;
}

// Función para generar edad aleatoria
function generarEdad() {
    return Math.floor(Math.random() * 60) + 18; // Entre 18 y 78 años
}

// Función para generar género aleatorio
function generarGenero() {
    return Math.random() > 0.5 ? 'M' : 'F';
}

// Función para generar estudios aleatorios
const estudios = [
    'Biometría Hemática', 'Química Sanguínea', 'Perfil Lipídico',
    'Pruebas de Función Hepática', 'Electrolitos Séricos', 'Hemoglobina Glucosilada',
    'Perfil Tiroideo', 'Urocultivo', 'Coprocultivo', 'VDRL',
    'Prueba de Embarazo', 'Antígeno Prostático', 'Perfil Hormonal'
];

function generarEstudios() {
    const numEstudios = Math.floor(Math.random() * 3) + 1;
    const estudiosSeleccionados = [];
    for (let i = 0; i < numEstudios; i++) {
        const estudio = estudios[Math.floor(Math.random() * estudios.length)];
        if (!estudiosSeleccionados.includes(estudio)) {
            estudiosSeleccionados.push(estudio);
        }
    }
    return estudiosSeleccionados.join(', ');
}

async function main() {
    console.log('🧹 Limpiando turnos existentes...');
    
    // Limpiar todos los turnos existentes
    await prisma.turnRequest.deleteMany({});
    console.log('✅ Turnos anteriores eliminados');

    // Obtener cubículos disponibles
    const cubicles = await prisma.cubicle.findMany();
    
    if (cubicles.length === 0) {
        console.log('📦 No hay cubículos, creando cubículos...');
        // Crear cubículos si no existen
        for (let i = 1; i <= 6; i++) {
            await prisma.cubicle.create({
                data: {
                    name: i.toString(),
                    type: i <= 4 ? 'GENERAL' : 'SPECIAL',
                    isSpecial: i > 4
                }
            });
        }
        console.log('✅ Cubículos creados');
    }

    console.log('\n🏥 Generando 50 pacientes de prueba...\n');

    const turnRequests = [];
    let turnNumber = 100; // Empezar desde el turno 100

    // Generar 8 pacientes en atención (distribuidos en cubículos)
    const cubiculosDisponibles = await prisma.cubicle.findMany();
    
    for (let i = 0; i < 8 && i < cubiculosDisponibles.length; i++) {
        const patientName = generarNombreCompleto();
        const turn = {
            patientName,
            age: generarEdad(),
            gender: generarGenero(),
            studies: generarEstudios(),
            tubesRequired: Math.floor(Math.random() * 4) + 1,
            status: 'InProgress',
            assignedTurn: turnNumber++,
            tipoAtencion: i === 7 ? 'Special' : 'General', // Uno especial
            attendedAt: new Date(),
            cubicleId: cubiculosDisponibles[i].id,
            isCalled: true
        };
        turnRequests.push(turn);
        console.log(`✅ Paciente en atención: ${patientName} - Cubículo ${cubiculosDisponibles[i].name}`);
    }

    // Generar 42 pacientes en espera
    for (let i = 0; i < 42; i++) {
        const patientName = generarNombreCompleto();
        const isSpecial = Math.random() < 0.15; // 15% de pacientes prioritarios
        
        const turn = {
            patientName,
            age: generarEdad(),
            gender: generarGenero(),
            studies: generarEstudios(),
            tubesRequired: Math.floor(Math.random() * 4) + 1,
            status: 'Pending',
            assignedTurn: turnNumber++,
            tipoAtencion: isSpecial ? 'Special' : 'General',
            isCalled: false
        };
        turnRequests.push(turn);
        
        if (i < 20) { // Solo mostrar los primeros 20
            console.log(`⏳ Paciente en espera #${i + 1}: ${patientName}${isSpecial ? ' 🦽' : ''}`);
        }
    }

    // Insertar todos los turnos en la base de datos
    console.log('\n💾 Guardando en la base de datos...');
    
    for (const turn of turnRequests) {
        await prisma.turnRequest.create({ data: turn });
    }

    console.log('\n🎉 ¡Generación completada!');
    console.log(`📊 Resumen:`);
    console.log(`   - ${8} pacientes en atención`);
    console.log(`   - ${42} pacientes en espera`);
    console.log(`   - ${turnRequests.filter(t => t.tipoAtencion === 'Special').length} pacientes prioritarios (♿)`);
    console.log(`   - Total: ${turnRequests.length} pacientes`);
    console.log('\n🖥️  Visita http://localhost:3000/turns/queue para ver la pantalla');
}

main()
    .catch(e => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });