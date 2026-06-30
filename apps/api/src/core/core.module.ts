import { Global, Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ClsModule } from 'nestjs-cls';
import { PrismaService } from './prisma/prisma.service';
import { TenantContextService } from './tenancy/tenant-context';
import { TenantMiddleware } from './tenancy/tenant.middleware';
import { AuthGuard } from './auth/auth.guard';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { RbacGuard } from './rbac/rbac.guard';
import { AuditInterceptor } from './audit/audit.interceptor';

/**
 * Cross-cutting platform module. Provides tenancy, Prisma, auth, RBAC, and audit
 * to the whole app. Guards run in order: AuthGuard → RbacGuard (default-deny).
 * Marked @Global so every feature module gets PrismaService + TenantContextService.
 */
@Global()
@Module({
  imports: [
    ClsModule.forRoot({ global: true, middleware: { mount: true } }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
    TenantContextService,
    AuthService,
    { provide: APP_GUARD, useClass: AuthGuard },   // 1st: authenticate + enrich context
    { provide: APP_GUARD, useClass: RbacGuard },   // 2nd: authorize (default-deny)
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
  exports: [PrismaService, TenantContextService],
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Tenant resolution runs before guards, for every route.
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
