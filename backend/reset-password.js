const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function run() {
  const hash = await bcrypt.hash('password123', 10);
  await prisma.user.updateMany({ data: { password: hash } });
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true } });
  console.log('Users:', JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}
run();
