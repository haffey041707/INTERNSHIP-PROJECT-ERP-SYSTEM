import { Body, Controller, Post, Get, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { Public } from './auth.guard';
import { TenantContextService } from '../tenancy/tenant-context';

class LoginDto {
  @IsString() identifier!: string;          // email or username
  @IsString() @MinLength(8) password!: string;
}

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly ctx: TenantContextService,
  ) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email/username + password (tenant resolved from domain/header)' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.identifier, dto.password);
  }

  @Post('logout')
  logout(@Req() req: Request) {
    const sessionId = (req.headers['x-session-id'] as string) ?? '';
    return this.auth.logout(sessionId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Current authenticated principal' })
  me() {
    const { userId, roles, permissions, institutionCode } = this.ctx.get();
    return { userId, institutionCode, roles, permissions };
  }
}
