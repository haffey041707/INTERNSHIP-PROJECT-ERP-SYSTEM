import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';
import { db } from './db';
import { restorePersistedAuth } from './persistent-auth';

const COOKIE = 'edunexus_session';
const SECRET = process.env.SESSION_SECRET ?? 'dev-session-secret';
/** Keep users signed in long-term ("stay logged in"). ~5 years. */
const SESSION_MAX_AGE = 60 * 60 * 24 * 365 * 5;

export interface SessionData {
  userId: string;
  institutionId: string;
  institutionCode: string;
  name: string;
  role: string;
}

function sign(payload: string): string {
  return createHmac('sha256', SECRET).update(payload).digest('hex');
}

/** Create a signed session cookie. */
export function createSession(data: SessionData): void {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  const token = `${payload}.${sign(payload)}`;
  cookies().set(COOKIE, token, {
    httpOnly: true, sameSite: 'lax', path: '/',
    maxAge: SESSION_MAX_AGE, secure: process.env.NODE_ENV === 'production',
  });
}

export function destroySession(): void {
  cookies().delete(COOKIE);
}

/** Read + verify the current session (or null). */
export function getSession(): SessionData | null {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString()) as SessionData;
  } catch {
    return null;
  }
}

/** Create a session for a user id (used by password + OAuth login). */
export async function establishSessionForUser(userId: string): Promise<void> {
  await restorePersistedAuth();
  const user = await db.user.findUnique({ where: { id: userId }, include: { institution: true } });
  if (!user) throw new Error('User not found');
  createSession({
    userId: user.id,
    institutionId: user.institutionId,
    institutionCode: user.institution.code,
    name: user.name,
    role: user.role,
  });
}

/** Helper used by every protected page: returns session or throws redirect upstream. */
export async function requireSession(): Promise<SessionData> {
  const s = getSession();
  if (!s) throw new Error('UNAUTHENTICATED');
  await restorePersistedAuth();
  // verify institution still exists
  const inst = await db.institution.findUnique({ where: { id: s.institutionId } });
  if (!inst) throw new Error('UNAUTHENTICATED');
  return s;
}
