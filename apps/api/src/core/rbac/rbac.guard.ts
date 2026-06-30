import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, PermissionKey } from './permissions';
import { TenantContextService } from '../tenancy/tenant-context';

/**
 * Default-deny RBAC guard. Reads the @Permissions() required on the handler and
 * checks them against the permissions resolved into the TenantContext at auth time.
 * Runs AFTER AuthGuard. ABAC scope (e.g. "own sections only") is enforced in the
 * service layer using ctx.scope.
 */
@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly ctx: TenantContextService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<PermissionKey[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true; // no decorator → no RBAC requirement

    const { permissions } = this.ctx.get();
    const missing = required.filter((p) => !permissions.includes(p));
    if (missing.length > 0) {
      throw new ForbiddenException(`Missing permission(s): ${missing.join(', ')}`);
    }
    return true;
  }
}
