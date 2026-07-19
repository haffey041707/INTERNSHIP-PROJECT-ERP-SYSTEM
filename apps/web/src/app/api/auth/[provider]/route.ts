import { NextRequest, NextResponse } from 'next/server';
import { createHmac, randomBytes } from 'crypto';
import { buildAuthUrl, isConfigured, Provider } from '@/lib/oauth';

const VALID: Provider[] = ['google', 'microsoft'];
const STATE_SECRET = process.env.SESSION_SECRET ?? 'dev-session-secret';

function preferredCallbackOrigin(req: NextRequest): string {
  return req.nextUrl.origin;
}

function signedState(provider: Provider, nonce: string, callbackOrigin: string): string {
  const payload = Buffer.from(JSON.stringify({
    provider,
    nonce,
    callbackOrigin,
    iat: Date.now(),
  })).toString('base64url');
  const sig = createHmac('sha256', STATE_SECRET).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

/** Step 1 of OAuth: redirect the user to the provider's consent screen. */
export function GET(req: NextRequest, { params }: { params: { provider: string } }) {
  const provider = params.provider as Provider;
  if (!VALID.includes(provider)) {
    return NextResponse.redirect(new URL('/login?error=oauth_failed', req.url));
  }
  if (!isConfigured(provider)) {
    return NextResponse.redirect(new URL(`/login?error=${provider}_not_configured`, req.url));
  }

  const nonce = randomBytes(16).toString('hex');
  const callbackOrigin = preferredCallbackOrigin(req);
  const state = signedState(provider, nonce, callbackOrigin);
  const res = NextResponse.redirect(buildAuthUrl(provider, state, callbackOrigin));
  // CSRF: bind state to a short-lived cookie verified on callback.
  res.cookies.set(`oauth_state_${provider}`, nonce, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}
