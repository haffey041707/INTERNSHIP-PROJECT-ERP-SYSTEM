import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import { CLS_TENANT_KEY, TenantContext } from '../tenancy/tenant-context';

/**
 * Provides two clients:
 *  - `platform`  : raw, UNSCOPED client. Only for tenancy/auth bootstrap and the
 *                  super-admin PlatformService. Never injected into feature modules.
 *  - `tenant`    : tenant-scoped client (LAYER 2 + 3). Every query is auto-filtered
 *                  by tenantId AND every transaction sets the Postgres GUC
 *                  `app.tenant_id` so Row-Level Security (LAYER 3) enforces isolation
 *                  even against raw SQL or ORM bugs.
 *
 * The app connects with a NON-superuser DB role that cannot BYPASSRLS — that is what
 * makes isolation provable (see docs/03).
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  /** Unscoped client — handle with care. */
  readonly platform = new PrismaClient();

  /** Tenant-scoped client (Prisma $extends). */
  readonly tenant: PrismaClient;

  // Models that are global (not tenant-scoped) and must NOT get a tenantId filter.
  private static readonly GLOBAL_MODELS = new Set(['Tenant', 'TenantDomain', 'TenantSettings', 'Permission']);

  constructor(private readonly cls: ClsService) {
    this.tenant = this.buildTenantClient();
  }

  async onModuleInit(): Promise<void> {
    await this.platform.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.platform.$disconnect();
  }

  private ctx(): TenantContext {
    const ctx = this.cls.get<TenantContext>(CLS_TENANT_KEY);
    if (!ctx?.tenantId) throw new Error('No tenant context for tenant-scoped query');
    return ctx;
  }

  private buildTenantClient(): PrismaClient {
    const base = this.platform;
    const self = this;

    return base.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const tenantId = self.ctx().tenantId;
            const scoped = model && !PrismaService.GLOBAL_MODELS.has(model);

            // LAYER 3: set the RLS GUC for this logical operation.
            await base.$executeRawUnsafe(`SET app.tenant_id = '${tenantId}'`);

            if (!scoped) return query(args);

            // LAYER 2: auto-inject tenantId on reads and writes.
            const a = (args ?? {}) as Record<string, any>;
            if (['findMany', 'findFirst', 'findUnique', 'count', 'aggregate', 'updateMany', 'deleteMany'].includes(operation)) {
              a.where = { ...(a.where ?? {}), tenantId };
            }
            if (operation === 'create') {
              a.data = { ...(a.data ?? {}), tenantId };
            }
            if (operation === 'createMany') {
              const rows = Array.isArray(a.data) ? a.data : [a.data];
              a.data = rows.map((r: any) => ({ ...r, tenantId }));
            }
            if (['update', 'delete', 'upsert'].includes(operation)) {
              a.where = { ...(a.where ?? {}), tenantId };
            }
            return query(a);
          },
        },
      },
    }) as unknown as PrismaClient;
  }
}
