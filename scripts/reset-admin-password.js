const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const updatedUser = await prisma.user.update({
      where: { username: 'admin' },
      data: { 
        password: hashedPassword,
        failedAttempts: 0,
        lockedUntil: null
      }
    });
    
    console.log('Password reset successfully for user:', updatedUser.username);
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
