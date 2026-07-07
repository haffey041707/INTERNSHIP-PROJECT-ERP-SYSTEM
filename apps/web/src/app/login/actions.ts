'use server';

import { redirect } from 'next/navigation';
import { createHash, randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/hash';
import { persistWorkspaceByInstitutionId, restorePersistedAuth } from '@/lib/persistent-auth';
import { destroySession, establishSessionForUser } from '@/lib/session';

const sha = (v: string) => createHash('sha256').update(v).digest('hex');

/** Real login: email + password. Institution is resolved automatically from the account. */
export async function loginAction(_prev: unknown, formData: FormData) {
  await restorePersistedAuth();

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) return { error: 'Enter your email and password.' };

  let users = await db.user.findMany({ where: { email }, orderBy: { createdAt: 'desc' } });
  if (users.length === 0) {
    await restorePersistedAuth({ force: true });
    users = await db.user.findMany({ where: { email }, orderBy: { createdAt: 'desc' } });
  }
  if (users.length === 0) return { error: 'No account found for that email.' };

  const passwordUsers = users.filter((user) => user.passwordHash);
  if (passwordUsers.length === 0) {
    return { error: `This account uses ${users[0].provider} sign-in. Use that button above.` };
  }

  const user = passwordUsers.find((candidate) => verifyPassword(password, candidate.passwordHash!));
  if (!user) return { error: 'Incorrect password.' };

  await establishSessionForUser(user.id);
  redirect('/dashboard');
}

export async function logoutAction() {
  destroySession();
  redirect('/login');
}

/**
 * Forgot password: always responds the same way (no account enumeration). When the
 * account exists we create a single-use token (valid 1h). With no email service wired
 * in this environment, the reset link is returned to the page (clearly labelled).
 * In production this link is emailed instead.
 */
export async function forgotPasswordAction(_prev: unknown, formData: FormData) {
  await restorePersistedAuth();

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const user = await db.user.findFirst({ where: { email } });

  let devLink: string | undefined;
  if (user) {
    const token = randomBytes(32).toString('hex');
    await db.passwordReset.create({
      data: { userId: user.id, tokenHash: sha(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    const link = `${process.env.APP_URL ?? 'http://localhost:3000'}/reset-password?token=${token}`;
    // TODO: send via email provider in production. Dev fallback below.
    devLink = link;
  }
  return {
    ok: true,
    message: 'If an account exists for that email, a password-reset link has been generated.',
    devLink,
  };
}

export async function resetPasswordAction(_prev: unknown, formData: FormData) {
  const token = String(formData.get('token') ?? '');
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (password.length < 6) return { error: 'Password must be at least 6 characters.' };
  if (password !== confirm) return { error: 'Passwords do not match.' };

  const reset = await db.passwordReset.findUnique({ where: { tokenHash: sha(token) } });
  if (!reset || reset.used || reset.expiresAt < new Date()) {
    return { error: 'This reset link is invalid or has expired.' };
  }

  const user = await db.user.update({ where: { id: reset.userId }, data: { passwordHash: hashPassword(password), provider: 'password' } });
  await db.passwordReset.update({ where: { id: reset.id }, data: { used: true } });
  await persistWorkspaceByInstitutionId(user.institutionId);
  redirect('/login?reset=1');
}
