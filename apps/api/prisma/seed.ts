/**
 * Seed a demo tenant with roles, permissions, an admin user, sections and students.
 * Uses the UNSCOPED platform client because we are bootstrapping tenant data.
 * Run: pnpm --filter @edunexus/api seed
 */
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { PERMISSIONS, ROLE_PERMISSIONS } from '../src/core/rbac/permissions';

const prisma = new PrismaClient();

async function main() {
  // 1) Permission catalog (global)
  const allPerms = Object.values(PERMISSIONS);
  for (const key of allPerms) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key, group: key.split(':')[0] },
    });
  }

  // 2) Demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { institutionCode: 'DEMO-001' },
    update: { status: 'ACTIVE' },
    create: {
      institutionCode: 'DEMO-001',
      name: 'EduNexus Demo School',
      type: 'SCHOOL',
      status: 'ACTIVE',
      settings: { create: { currency: 'USD', locale: 'en', branding: { primaryColor: '#6D28D9' } } },
      domains: { create: { domain: 'demo-001.edunexus.local', isPrimary: true, verified: true } },
    },
  });

  // 3) Roles + role→permission wiring
  const permRows = await prisma.permission.findMany();
  const permId = (k: string) => permRows.find((p) => p.key === k)!.id;
  const roleIds: Record<string, string> = {};
  for (const [key, perms] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.upsert({
      where: { tenantId_key: { tenantId: tenant.id, key } },
      update: {},
      create: { tenantId: tenant.id, key, name: key.replace('_', ' '), isSystem: true },
    });
    roleIds[key] = role.id;
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: perms.map((p) => ({ roleId: role.id, permissionId: permId(p) })),
      skipDuplicates: true,
    });
  }

  // 4) Institution admin user
  const passwordHash = await argon2.hash('ChangeMe!123');
  const admin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@demo.edu' } },
    update: {},
    create: {
      tenantId: tenant.id, email: 'admin@demo.edu', username: 'admin',
      firstName: 'Demo', lastName: 'Admin', passwordHash, status: 'ACTIVE',
    },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: roleIds.INSTITUTION_ADMIN } },
    update: {},
    create: { userId: admin.id, roleId: roleIds.INSTITUTION_ADMIN },
  });

  // 5) A section + a few students
  const section = await prisma.section.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: '9-A' } },
    update: {},
    create: { tenantId: tenant.id, name: '9-A', grade: '9', capacity: 40 },
  });
  for (const [i, name] of [['Aisha', 'Khan'], ['Omar', 'Lopez'], ['Mei', 'Chen']].entries()) {
    await prisma.student.upsert({
      where: { tenantId_admissionNo: { tenantId: tenant.id, admissionNo: `ADM-${100 + i}` } },
      update: {},
      create: {
        tenantId: tenant.id, admissionNo: `ADM-${100 + i}`, rollNo: String(i + 1),
        firstName: name[0], lastName: name[1], sectionId: section.id,
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log('✅ Seeded tenant DEMO-001 · admin@demo.edu / ChangeMe!123');
}

main().finally(() => prisma.$disconnect());
