const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setSimplePassword() {
  try {
    const hashedPassword = await bcrypt.hash('123', 10);
    
    const updatedUser = await prisma.user.update({
      where: { username: 'admin' },
      data: { 
        password: hashedPassword,
        failedAttempts: 0,
        lockedUntil: null
      }
    });
    
    console.log('Password cambiado exitosamente a "123" para el usuario:', updatedUser.username);
  } catch (error) {
    console.error('Error cambiando password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setSimplePassword();
