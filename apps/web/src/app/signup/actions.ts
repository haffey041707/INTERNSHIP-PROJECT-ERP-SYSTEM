'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/hash';
import { ensureStudentSections } from '@/lib/academic-structure';
import { persistWorkspaceByInstitutionId, restorePersistedAuth } from '@/lib/persistent-auth';

function codeFrom(name: string): string {
  const base = name.replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase() || 'INST';
  return `${base}-${Math.floor(100 + Math.random() * 900)}`;
}

export async function signupAction(_prev: unknown, formData: FormData) {
  await restorePersistedAuth({ force: true });

  const name = String(formData.get('name') ?? '').trim();
  const adminName = String(formData.get('adminName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');
  const type = String(formData.get('type') || 'SCHOOL');

  if (!name || !adminName || !email) return { error: 'Please fill in all fields.' };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: 'Enter a valid email address.' };
  if (password.length < 6) return { error: 'Password must be at least 6 characters.' };
  if (password !== confirm) return { error: 'Passwords do not match.' };

  // unique institution code
  let code = codeFrom(name);
  while (await db.institution.findUnique({ where: { code } })) code = codeFrom(name);

  const institution = await db.institution.create({ data: { name, type, currency: 'USD', code } });
  await db.user.create({
    data: {
      institutionId: institution.id, email, name: adminName,
      role: 'INSTITUTION_ADMIN', passwordHash: hashPassword(password), provider: 'password',
    },
  });

  // starter academic structure so the new admin can add students immediately
  await ensureStudentSections(institution.id);
  await persistWorkspaceByInstitutionId(institution.id);

  // No auto-login — send them to sign in (as requested).
  redirect('/login?registered=1');
}
