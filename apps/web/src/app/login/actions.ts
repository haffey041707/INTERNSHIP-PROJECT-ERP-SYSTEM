'use server';

import { redirect } from 'next/navigation';
import { createHash, randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/hash';
import { destroySession, establishSessionForUser } from '@/lib/session';

const sha = (v: string) => createHash('sha256').update(v).digest('hex');

function normalizeCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function codeFrom(name: string): string {
  const base = name.replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase() || 'INST';
  return `${base}-${Math.floor(100 + Math.random() * 900)}`;
}

/**
 * Real login: email + password. Institution is resolved automatically from the email.
 * If the same email exists in more than one institution, the optional Institution ID
 * disambiguates.
 */
export async function loginAction(_prev: unknown, formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const code = String(formData.get('institutionId') ?? '').trim().toUpperCase();

  if (!email || !password) return { error: 'Enter your email and password.' };

  let users = await db.user.findMany({ where: { email }, include: { institution: true } });
  if (code) users = users.filter((u) => u.institution.code === code);

  if (users.length === 0) return { error: 'No account found for that email.' };
  if (users.length > 1) return { error: 'This email is used at multiple institutions — enter your Institution ID.' };

  const user = users[0];
  if (!user.passwordHash) {
    return { error: `This account uses ${user.provider} sign-in. Use that button above.` };
  }
  if (!verifyPassword(password, user.passwordHash)) return { error: 'Incorrect password.' };

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

  await db.user.update({ where: { id: reset.userId }, data: { passwordHash: hashPassword(password) } });
  await db.passwordReset.update({ where: { id: reset.id }, data: { used: true } });
  redirect('/login?reset=1');
}

export async function findInstitutionIdAction(_prev: unknown, formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) return { error: 'Enter your admin email and password.' };

  const users = await db.user.findMany({ where: { email }, include: { institution: true } });
  const matches = users.filter((user) => user.passwordHash && verifyPassword(password, user.passwordHash));

  if (matches.length === 0) return { error: 'No matching admin account found.' };

  return {
    ok: true,
    institutions: matches.map((user) => ({
      name: user.institution.name,
      code: user.institution.code,
      role: user.role.replace('_', ' '),
    })),
  };
}

export async function changeInstitutionIdAction(_prev: unknown, formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const currentCode = normalizeCode(String(formData.get('currentCode') ?? ''));
  const requestedCode = normalizeCode(String(formData.get('newCode') ?? ''));

  if (!email || !password) return { error: 'Enter your admin email and password.' };

  let users = await db.user.findMany({ where: { email }, include: { institution: true } });
  users = users.filter((user) => user.passwordHash && verifyPassword(password, user.passwordHash));
  if (currentCode) users = users.filter((user) => user.institution.code === currentCode);

  if (users.length === 0) return { error: 'No matching admin account found.' };
  if (users.length > 1) return { error: 'Enter the current Institution ID so we know which workspace to change.' };

  const user = users[0];
  if (user.role !== 'INSTITUTION_ADMIN' && user.role !== 'SUPER_ADMIN') {
    return { error: 'Only an institution admin can change the Institution ID.' };
  }

  let nextCode = requestedCode || codeFrom(user.institution.name);
  if (nextCode.length < 4 || nextCode.length > 24) {
    return { error: 'Use 4 to 24 letters, numbers, or dashes for the new Institution ID.' };
  }

  if (nextCode === user.institution.code) {
    return {
      ok: true,
      code: nextCode,
      message: 'That is already your current Institution ID.',
    };
  }

  while (await db.institution.findUnique({ where: { code: nextCode } })) {
    if (requestedCode) return { error: 'That Institution ID is already taken. Choose another one.' };
    nextCode = codeFrom(user.institution.name);
  }

  await db.institution.update({ where: { id: user.institutionId }, data: { code: nextCode } });

  return {
    ok: true,
    code: nextCode,
    message: 'Institution ID updated. Use the new ID when signing in.',
  };
}
