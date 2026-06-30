import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenancy/tenant-context';

export const IS_PUBLIC_KEY = 'is_public';
/** Mark a route as not requiring authentication. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

interface AccessClaims {
  sub: string;   // userId
  tid: string;   // tenantId
  sid: string;   // sessionId
}

/**
 * Verifies the access JWT, asserts its tenant matches the URL/header-resolved tenant
 * (tenant-confusion protection — see docs/03/09), then enriches the TenantContext with
 * the user's roles + permissions + ABAC scope for the RbacGuard and services.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly ctx: TenantContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const token = (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
    if (!token) throw new UnauthorizedException('Missing access token');

    let claims: AccessClaims;
    try {
      claims = await this.jwt.verifyAsync<AccessClaims>(token, { secret: process.env.JWT_ACCESS_SECRET });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const tenant = this.ctx.get();
    // CRITICAL: the JWT's tenant must equal the tenant resolved from the request.
    if (claims.tid !== tenant.tenantId) {
      throw new UnauthorizedException('Tenant mismatch');
    }

    // Load roles + permissions for the user (tenant-scoped client enforces isolation).
    const userRoles = await this.prisma.tenant.userRole.findMany({
      where: { userId: claims.sub },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });
    if (userRoles.length === 0) throw new UnauthorizedException('User has no roles');

    const permissions = new Set<string>();
    const scope: Record<string, unknown> = {};
    for (const ur of userRoles) {
      Object.assign(scope, ur.scope as object);
      for (const rp of ur.role.permissions) permissions.add(rp.permission.key);
    }

    this.ctx.set({
      ...tenant,
      userId: claims.sub,
      roles: userRoles.map((ur) => ur.role.key),
      permissions: [...permissions],
      scope,
    });
    return true;
  }
}
