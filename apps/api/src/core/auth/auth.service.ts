import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomUUID, createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenancy/tenant-context';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; firstName: string; lastName: string; roles: string[] };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly ctx: TenantContextService,
  ) {}

  /** Email/username + password login within the request's resolved tenant. */
  async login(identifier: string, password: string): Promise<LoginResult> {
    const tenant = this.ctx.get();

    const user = await this.prisma.tenant.user.findFirst({
      where: {
        OR: [{ email: identifier.toLowerCase() }, { username: identifier }],
        status: 'ACTIVE',
        deletedAt: null,
      },
      include: { roles: { include: { role: true } } },
    });
    if (!user?.passwordHash || !(await argon2.verify(user.passwordHash, password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const session = await this.prisma.tenant.session.create({
      data: {
        tenantId: tenant.tenantId,
        userId: user.id,
        refreshHash: '', // set below after we mint the token
        device: tenant.device,
        ip: tenant.ip,
        expiresAt: new Date(Date.now() + Number(process.env.JWT_REFRESH_TTL ?? 2592000) * 1000),
      },
    });

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, tid: tenant.tenantId, sid: session.id },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: Number(process.env.JWT_ACCESS_TTL ?? 600) },
    );
    const refreshToken = randomUUID() + '.' + randomUUID();
    await this.prisma.tenant.session.update({
      where: { id: session.id },
      data: { refreshHash: this.hash(refreshToken) },
    });

    await this.prisma.tenant.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    return {
      accessToken,
      refreshToken: `${session.id}:${refreshToken}`,
      user: {
        id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName,
        roles: user.roles.map((r) => r.role.key),
      },
    };
  }

  async logout(sessionId: string): Promise<void> {
    await this.prisma.tenant.session.updateMany({
      where: { id: sessionId }, data: { revokedAt: new Date() },
    });
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
