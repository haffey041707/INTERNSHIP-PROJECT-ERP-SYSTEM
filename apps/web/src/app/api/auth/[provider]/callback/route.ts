import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { db } from '@/lib/db';
import { exchangeCodeForUser, Provider } from '@/lib/oauth';
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

async function finishOAuth(req: NextRequest, params: { provider: string }, input: { code: string | null; state: string | null; user?: string | null }) {
  const provider = params.provider as Provider;
  const code = input.code;
  const state = input.state;
  const cookieState = req.cookies.get(`oauth_state_${provider}`)?.value;
  const fail = (e: string) => NextResponse.redirect(new URL(`/login?error=${e}`, req.url));

  if (!VALID.includes(provider) || !code) return fail('oauth_failed');
  const signedState = verifySignedState(state, provider);
  if (!signedState) return fail('oauth_failed');
  if (cookieState && cookieState !== signedState.nonce) return fail('oauth_failed');

  let profile: { email: string; name: string };
  try {
    profile = await exchangeCodeForUser(provider, code, signedState.callbackOrigin);
  } catch {
    return fail('oauth_failed');
  }

  // Match the OAuth email to an existing account (created via signup or a prior OAuth login).
  const users = await db.user.findMany({ where: { email: profile.email }, include: { institution: true } });
  let user = users[0];

  if (!user) {
    // First-time social sign-in: provision a fresh institution + admin (real "Sign up with Google").
    const baseName = `${profile.name}'s Institution`;
    const codeFrom = () => {
      const b = profile.name.replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase() || 'INST';
      return `${b}-${Math.floor(100 + Math.random() * 900)}`;
    };
    let code = codeFrom();
    while (await db.institution.findUnique({ where: { code } })) code = codeFrom();

    const institution = await db.institution.create({ data: { name: baseName, type: 'SCHOOL', currency: 'USD', code } });
    user = await db.user.create({
      data: { institutionId: institution.id, email: profile.email, name: profile.name, role: 'INSTITUTION_ADMIN', provider },
      include: { institution: true },
    });
    const klass = await db.schoolClass.create({ data: { institutionId: institution.id, name: 'Grade 1', grade: '1' } });
    await db.section.create({ data: { institutionId: institution.id, classId: klass.id, name: '1-A', capacity: 40 } });
  } else if (user.provider === 'password') {
    // Existing password account → link this provider so future social logins work too.
    await db.user.update({ where: { id: user.id }, data: { provider } });
  }

  createSession({
    userId: user.id,
    institutionId: user.institutionId,
    institutionCode: user.institution.code,
    name: user.name,
    role: user.role,
  });

  const res = NextResponse.redirect(new URL('/dashboard', req.url));
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
