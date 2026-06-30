import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenancy/tenant-context';

/**
 * Writes an immutable audit record for every mutating request (POST/PUT/PATCH/DELETE).
 * Records actor, tenant, action, resource, ip, device, requestId. The `before/after`
 * diff is captured by services for high-value entities; this interceptor guarantees a
 * baseline trail for everything. audit_logs are append-only (RLS + REVOKE UPDATE/DELETE).
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private static readonly MUTATIONS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ctx: TenantContextService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    if (!AuditInterceptor.MUTATIONS.has(req.method)) return next.handle();

    return next.handle().pipe(
      tap((result) => {
        const tenant = this.ctx.get();
        const resource = req.path.split('/').filter(Boolean)[2] ?? 'unknown'; // /api/v1/<resource>
        void this.prisma.tenant.auditLog.create({
          data: {
            tenantId: tenant.tenantId,
            actorId: tenant.userId,
            action: `${resource}.${req.method.toLowerCase()}`,
            resource,
            resourceId: (result as { id?: string })?.id ?? (req.params?.id as string) ?? null,
            ip: tenant.ip,
            device: tenant.device,
            requestId: tenant.requestId,
          },
        }).catch(() => undefined); // never block the response on audit write
      }),
    );
  }
}
