import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { buildAuthUrl, isConfigured, Provider } from '@/lib/oauth';

const VALID: Provider[] = ['google', 'microsoft'];

/** Step 1 of OAuth: redirect the user to the provider's consent screen. */
export function GET(req: NextRequest, { params }: { params: { provider: string } }) {
  const provider = params.provider as Provider;
  if (!VALID.includes(provider)) {
    return NextResponse.redirect(new URL('/login?error=oauth_failed', req.url));
  }
  if (!isConfigured(provider)) {
    return NextResponse.redirect(new URL(`/login?error=${provider}_not_configured`, req.url));
  }

  const state = randomBytes(16).toString('hex');
  const res = NextResponse.redirect(buildAuthUrl(provider, state, req.nextUrl.origin));
  // CSRF: bind state to a short-lived cookie verified on callback.
  res.cookies.set(`oauth_state_${provider}`, state, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}
