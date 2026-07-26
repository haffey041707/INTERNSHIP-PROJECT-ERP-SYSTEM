'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/hash';
import { restorePersistedAuth } from '@/lib/persistent-auth';
import { establishSessionForUser, getSession } from '@/lib/session';

export async function switchAccountAction(formData: FormData) {
  const targetUserId = String(formData.get('targetUserId') ?? '');
  const session = getSession();

  if (!session || !targetUserId) redirect('/login');

  await restorePersistedAuth();

  const [currentUser, targetUser] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId }, select: { email: true, institutionId: true } }),
    db.user.findUnique({ where: { id: targetUserId }, select: { id: true, email: true, institutionId: true } }),
  ]);

  if (!currentUser || !targetUser) redirect('/dashboard');

  const sameInstitution = targetUser.institutionId === session.institutionId;
  const sameEmail = targetUser.email.toLowerCase() === currentUser.email.toLowerCase();

  if (!sameInstitution && !sameEmail) redirect('/dashboard');

  await establishSessionForUser(targetUser.id);
  redirect('/dashboard');
}

export async function addAccountFromSwitcherAction(_prev: { error?: string } | null, formData: FormData) {
  const session = getSession();
  if (!session) redirect('/login');

  await restorePersistedAuth();

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) return { error: 'Enter email and password.' };

  let users = await db.user.findMany({ where: { email }, orderBy: { createdAt: 'desc' } });
  if (users.length === 0) {
    await restorePersistedAuth({ force: true });
    users = await db.user.findMany({ where: { email }, orderBy: { createdAt: 'desc' } });
  }
  if (users.length === 0) return { error: 'No account found for that email.' };

  let passwordUsers = users.filter((user) => user.passwordHash);
  if (passwordUsers.length === 0) {
    return { error: `This account uses ${users[0].provider} sign-in.` };
  }

  let user = passwordUsers.find((candidate) => verifyPassword(password, candidate.passwordHash!));
  if (!user) {
    await restorePersistedAuth({ force: true });
    users = await db.user.findMany({ where: { email }, orderBy: { createdAt: 'desc' } });
    passwordUsers = users.filter((candidate) => candidate.passwordHash);
    user = passwordUsers.find((candidate) => verifyPassword(password, candidate.passwordHash!));
  }
  if (!user) return { error: 'Incorrect password.' };

  await establishSessionForUser(user.id);
  redirect('/dashboard');
}
