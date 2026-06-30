import { Test } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { StudentsService } from './students.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CLS_TENANT_KEY, TenantContext } from '../../core/tenancy/tenant-context';

/**
 * MANDATORY cross-tenant isolation test (CI gate — see docs/03 §3.7 & docs/15).
 * Proves a student created under Tenant A is invisible to Tenant B through the
 * tenant-scoped Prisma client. Replicate this shape for EVERY feature module.
 *
 * Run against a real Postgres (testcontainers) with RLS enabled for full LAYER-3 proof.
 */
describe('Students — tenant isolation', () => {
  let service: StudentsService;
  let cls: ClsService;
  let prisma: PrismaService;

  const ctxFor = (tenantId: string): TenantContext => ({
    tenantId, institutionCode: tenantId, roles: ['INSTITUTION_ADMIN'],
    permissions: ['students:read', 'students:create'], scope: {}, locale: 'en', requestId: 't',
  });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [StudentsService, PrismaService, ClsService],
    }).compile();
    service = moduleRef.get(StudentsService);
    cls = moduleRef.get(ClsService);
    prisma = moduleRef.get(PrismaService);
  });

  it('does not leak Tenant A students to Tenant B', async () => {
    const tenantA = process.env.TEST_TENANT_A!;
    const tenantB = process.env.TEST_TENANT_B!;

    await cls.run(async () => {
      cls.set(CLS_TENANT_KEY, ctxFor(tenantA));
      await service.create({ admissionNo: 'ISO-1', firstName: 'Alpha', lastName: 'One' });
    });

    const fromB = await cls.run(async () => {
      cls.set(CLS_TENANT_KEY, ctxFor(tenantB));
      return service.list({});
    });

    expect(fromB.data.find((s) => s.admissionNo === 'ISO-1')).toBeUndefined();
  });

  afterAll(async () => {
    await prisma.platform.$disconnect();
  });
});
