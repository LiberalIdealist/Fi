import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

// Fix the global declaration to properly type prisma on globalThis
type GlobalWithPrisma = typeof globalThis & {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined;
};

// Access prisma through the properly typed global object
const globalWithPrisma = globalThis as GlobalWithPrisma;

const prisma = globalWithPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalWithPrisma.prisma = prisma;

export { prisma };