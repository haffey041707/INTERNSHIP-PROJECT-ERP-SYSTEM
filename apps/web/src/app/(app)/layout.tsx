import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { longDate } from '@/lib/format';
import { restorePersistedAuth } from '@/lib/persistent-auth';
import { AppShell } from '@/components/AppShell';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = getSession();
  if (!session) redirect('/login');

  await restorePersistedAuth();

  let [user, institution, announcements] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId }, select: { email: true, name: true, role: true } }),
    db.institution.findUnique({ where: { id: session.institutionId }, select: { code: true, name: true, type: true } }),
    db.announcement.findMany({ where: { institutionId: session.institutionId }, orderBy: { createdAt: 'desc' }, take: 6, select: { id: true, title: true, audience: true, createdAt: true } }),
  ]);
  if (!user || !institution) {
    await restorePersistedAuth({ force: true });
    [user, institution, announcements] = await Promise.all([
      db.user.findUnique({ where: { id: session.userId }, select: { email: true, name: true, role: true } }),
      db.institution.findUnique({ where: { id: session.institutionId }, select: { code: true, name: true, type: true } }),
      db.announcement.findMany({ where: { institutionId: session.institutionId }, orderBy: { createdAt: 'desc' }, take: 6, select: { id: true, title: true, audience: true, createdAt: true } }),
    ]);
  }
  if (!user || !institution) redirect('/login');

  const brand = '#0F172A';
  const notifications = announcements.map((a) => ({ id: a.id, title: a.title, audience: a.audience, when: longDate(a.createdAt) }));

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `:root{--brand-500:${brand};--brand-600:${brand};--brand-700:${brand};}` }} />
      <AppShell
        user={{
          name: user.name,
          email: user.email,
          role: user.role,
          institutionCode: institution.code,
          institutionName: institution.name,
          institutionType: institution.type,
        }}
        notifications={notifications}
      >
        {children}
      </AppShell>
    </>
  );
}
