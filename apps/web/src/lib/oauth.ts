// Real OAuth 2.0 / OIDC (authorization-code flow) for Google and Microsoft.
// Works as soon as the provider's CLIENT_ID/SECRET are set in .env — until then
// `isConfigured` is false and the UI shows a setup message instead of a fake button.

export type Provider = 'google' | 'microsoft';

interface ProviderConfig {
  clientId: string;
  clientSecret?: string;
  authUrl: string;
  tokenUrl: string;
  userInfoUrl?: string;
  scope: string;
}

const fallbackBase = process.env.APP_URL ?? 'http://localhost:3000';

export function redirectUri(provider: Provider, origin = fallbackBase): string {
  return `${origin}/api/auth/${provider}/callback`;
}

export function providerConfig(provider: Provider): ProviderConfig {
  if (provider === 'google') {
    return {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
      scope: 'openid email profile',
    };
  }
  return {
    clientId: process.env.MICROSOFT_CLIENT_ID ?? '',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET ?? '',
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    userInfoUrl: 'https://graph.microsoft.com/oidc/userinfo',
    scope: 'openid email profile',
  };
}

export function isConfigured(provider: Provider): boolean {
  const c = providerConfig(provider);
  return Boolean(c.clientId && c.clientSecret);
}

export function buildAuthUrl(provider: Provider, state: string, origin?: string): string {
  const c = providerConfig(provider);
  const params = new URLSearchParams({
    client_id: c.clientId,
    redirect_uri: redirectUri(provider, origin),
    response_type: 'code',
    scope: c.scope,
    state,
  });

  if (provider === 'google') {
    params.set('access_type', 'offline');
    params.set('prompt', 'select_account');
  }
  return `${c.authUrl}?${params.toString()}`;
}

/** Exchange the authorization code for tokens, then fetch the user's email + name. */
export async function exchangeCodeForUser(provider: Provider, code: string, origin?: string):
  Promise<{ email: string; name: string }> {
  const c = providerConfig(provider);
  const tokenRes = await fetch(c.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: c.clientId,
      client_secret: c.clientSecret ?? '',
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri(provider, origin),
    }),
  });
  if (!tokenRes.ok) throw new Error(`Token exchange failed: ${await tokenRes.text()}`);
  const tokens = (await tokenRes.json()) as { access_token?: string; id_token?: string };

  if (!c.userInfoUrl || !tokens.access_token) throw new Error('OAuth provider did not return an access token');
  const userRes = await fetch(c.userInfoUrl, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!userRes.ok) throw new Error(`Userinfo failed: ${await userRes.text()}`);
  const profile = (await userRes.json()) as { email?: string; name?: string; preferred_username?: string };

  const email = (profile.email ?? profile.preferred_username ?? '').toLowerCase();
  if (!email) throw new Error('No email returned by provider');
  return { email, name: profile.name ?? email.split('@')[0] };
}
