import { PrismaClient } from "@prisma/client";

// Configuración optimizada para producción
const prismaClientOptions = {
  log: process.env.NODE_ENV === 'production' 
    ? ['error'] 
    : ['query', 'info', 'warn', 'error'],
  errorFormat: process.env.NODE_ENV === 'production' ? 'minimal' : 'pretty',
};

// Singleton pattern para evitar múltiples instancias
const prisma = global.prisma || new PrismaClient(prismaClientOptions);

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

// Manejo de desconexión en producción
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

export default prisma;
