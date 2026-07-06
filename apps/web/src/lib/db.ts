import { PrismaClient } from '@prisma/client';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

// Single Prisma instance (avoids exhausting connections on hot-reload in dev).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function prepareVercelSqlite() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!process.env.VERCEL || !databaseUrl?.startsWith('file:/tmp/')) return;

  const target = databaseUrl.replace(/^file:/, '');
  if (existsSync(target)) return;

  const candidates = [
    path.join(process.cwd(), 'prisma', 'vercel-seed.db.template'),
    path.join(process.cwd(), 'apps', 'web', 'prisma', 'vercel-seed.db.template'),
  ];
  const source = candidates.find((file) => existsSync(file));
  if (!source) return;

  mkdirSync(path.dirname(target), { recursive: true });
  copyFileSync(source, target);
}

prepareVercelSqlite();

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
