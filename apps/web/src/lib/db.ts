import { PrismaClient } from '@prisma/client';

// Single Prisma instance (avoids exhausting connections on hot-reload in dev).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
