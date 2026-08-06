import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { db } from '@/lib/db';
import { exchangeCodeForUser, Provider } from '@/lib/oauth';
import { persistWorkspaceByInstitutionId, restorePersistedAuth } from '@/lib/persistent-auth';
import { createSession } from '@/lib/session';

const VALID: Provider[] = ['google', 'microsoft'];
const STATE_SECRET = process.env.SESSION_SECRET ?? 'dev-session-secret';

type SignedState = {
  provider: Provider;
  nonce: string;
  callbackOrigin: string;
  iat: number;
};

function verifySignedState(state: string | null, provider: Provider): SignedState | null {
  if (!state) return null;
  const [payload, sig] = state.split('.');
  if (!payload || !sig) return null;

  const expected = createHmac('sha256', STATE_SECRET).update(payload).digest('hex');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString()) as SignedState;
    if (parsed.provider !== provider || !parsed.nonce || !parsed.callbackOrigin) return null;
    if (Date.now() - parsed.iat > 10 * 60 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

function appUrl(path: string): URL {
  return new URL(path, process.env.APP_URL ?? 'http://localhost:3000');
}

async function finishOAuth(req: NextRequest, params: { provider: string }, input: { code: string | null; state: string | null; user?: string | null }) {
  const provider = params.provider as Provider;
  const code = input.code;
  const state = input.state;
  const cookieState = req.cookies.get(`oauth_state_${provider}`)?.value;
  const fail = (e: string) => NextResponse.redirect(appUrl(`/login?error=${e}`));

  if (!VALID.includes(provider) || !code) return fail('oauth_failed');
  const signedState = verifySignedState(state, provider);
  if (!signedState) return fail('oauth_failed');
  // The state cookie is created by this ERP before leaving for the provider.
  // Requiring it prevents callbacks copied from another browser or relay app.
  if (!cookieState || cookieState !== signedState.nonce) return fail('oauth_failed');

  let profile: { email: string; name: string };
  try {
    profile = await exchangeCodeForUser(provider, code, signedState.callbackOrigin);
  } catch {
    return fail('oauth_failed');
  }

  await restorePersistedAuth();

  // Match the OAuth email to an existing account (created via signup or a prior OAuth login).
  let users = await db.user.findMany({ where: { email: profile.email }, include: { institution: true } });
  if (users.length === 0) {
    await restorePersistedAuth({ force: true });
    users = await db.user.findMany({ where: { email: profile.email }, include: { institution: true } });
  }
  let user = users[0];

  if (!user) {
    return fail('oauth_no_account');
  } else if (user.provider === 'password') {
    // Existing password account → link this provider so future social logins work too.
    user = await db.user.update({ where: { id: user.id }, data: { provider }, include: { institution: true } });
    await persistWorkspaceByInstitutionId(user.institutionId);
  }

  createSession({
    userId: user.id,
    institutionId: user.institutionId,
    institutionCode: user.institution.code,
    name: user.name,
    role: user.role,
  });

  const res = NextResponse.redirect(appUrl('/dashboard'));
  res.cookies.delete(`oauth_state_${provider}`);
  return res;
}

/** Step 2 of OAuth: provider redirects back here with a code. Verify, fetch the
 *  user's email, match it to an existing institution account, and open a session. */
export async function GET(req: NextRequest, { params }: { params: { provider: string } }) {
  const url = new URL(req.url);
  return finishOAuth(req, params, {
    code: url.searchParams.get('code'),
    state: url.searchParams.get('state'),
  });
}
