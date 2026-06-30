import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../prisma/prisma.service';
import { CLS_TENANT_KEY, TenantContext } from './tenant-context';

/**
 * LAYER 1 of tenant isolation (see docs/03).
 * Resolves the tenant from (in priority order): custom domain → subdomain →
 * X-Institution-Id header, then stores a partial TenantContext in CLS.
 * The AuthGuard later enriches it with userId/roles/permissions and verifies the
 * JWT's tenant matches this one (tenant-confusion protection).
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly baseDomain = process.env.APP_BASE_DOMAIN ?? 'edunexus.local';

  constructor(
    private readonly prisma: PrismaService,
    private readonly cls: ClsService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const code = await this.resolveInstitutionCode(req);
    if (!code) {
      throw new UnauthorizedException('Institution could not be determined for this request');
    }

    // Use the unscoped (platform) client only for this tenant lookup.
    const tenant = await this.prisma.platform.tenant.findUnique({
      where: { institutionCode: code },
      select: { id: true, institutionCode: true, status: true },
    });
    if (!tenant || tenant.status !== 'ACTIVE') {
      throw new UnauthorizedException('Unknown or inactive institution');
    }

    const ctx: TenantContext = {
      tenantId: tenant.id,
      institutionCode: tenant.institutionCode,
      roles: [],
      permissions: [],
      scope: {},
      locale: (req.headers['accept-language'] as string)?.split(',')[0] ?? 'en',
      requestId: (req.headers['x-request-id'] as string) ?? randomUUID(),
      ip: req.ip,
      device: req.headers['user-agent'] as string,
    };
    this.cls.set(CLS_TENANT_KEY, ctx);
    next();
  }

  private async resolveInstitutionCode(req: Request): Promise<string | null> {
    const host = (req.headers.host ?? '').split(':')[0];

    // 2. subdomain: <code>.edunexus.local
    if (host.endsWith(this.baseDomain)) {
      const sub = host.slice(0, -(this.baseDomain.length + 1));
      if (sub && sub !== 'www' && sub !== 'app') return sub.toUpperCase();
    }

    // 1. custom domain mapping
    const domain = await this.prisma.platform.tenantDomain.findUnique({
      where: { domain: host },
      select: { tenant: { select: { institutionCode: true } } },
    });
    if (domain?.tenant) return domain.tenant.institutionCode;

    // 3. explicit header (mobile / API clients)
    const header = req.headers['x-institution-id'];
    if (typeof header === 'string' && header.length > 0) return header.toUpperCase();

    return null;
  }
}
