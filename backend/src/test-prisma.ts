import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.users.findMany({ take: 1 });
    console.log('DB connection OK. First user:', users);
  } catch (err) {
    console.error('DB connection FAILED:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();