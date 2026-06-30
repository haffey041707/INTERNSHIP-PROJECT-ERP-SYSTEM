import { ClsService } from 'nestjs-cls';
import { Injectable } from '@nestjs/common';

/**
 * Per-request tenant + auth context, stored in AsyncLocalStorage (nestjs-cls).
 * Repositories, the audit interceptor, and the Prisma RLS hook all read from here,
 * so tenant scoping is automatic and impossible to forget.
 */
export interface TenantContext {
  tenantId: string;
  institutionCode: string;
  userId?: string;
  roles: string[];
  permissions: string[];
  scope: Record<string, unknown>;
  locale: string;
  requestId: string;
  ip?: string;
  device?: string;
}

export const CLS_TENANT_KEY = 'tenant';

@Injectable()
export class TenantContextService {
  constructor(private readonly cls: ClsService) {}

  set(ctx: TenantContext): void {
    this.cls.set(CLS_TENANT_KEY, ctx);
  }

  /** Returns the current tenant context or throws — there is never an unscoped request. */
  get(): TenantContext {
    const ctx = this.cls.get<TenantContext>(CLS_TENANT_KEY);
    if (!ctx?.tenantId) {
      throw new Error('TenantContext missing — request was not tenant-resolved');
    }
    return ctx;
  }

  get tenantId(): string {
    return this.get().tenantId;
  }

  has(permission: string): boolean {
    return this.get().permissions.includes(permission);
  }
}
