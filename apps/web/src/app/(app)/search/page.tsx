import Link from 'next/link';
import { Search, Users, GraduationCap } from 'lucide-react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const institutionId = getSession()!.institutionId;
  const q = (searchParams.q ?? '').trim();

  const [students, teachers] = q
    ? await Promise.all([
        db.student.findMany({
          where: { institutionId, OR: [{ firstName: { contains: q } }, { lastName: { contains: q } }, { admissionNo: { contains: q } }] },
          include: { section: true }, take: 25,
        }),
        db.teacher.findMany({
          where: { institutionId, OR: [{ name: { contains: q } }, { email: { contains: q } }, { subject: { contains: q } }] },
          take: 25,
        }),
      ])
    : [[], []];

  const total = students.length + teachers.length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Search</h1>
        <p className="text-slate-500 text-sm">{q ? `${total} result${total === 1 ? '' : 's'} for “${q}”` : 'Type in the top bar to search.'}</p>
      </div>

      <form action="/search" className="flex items-center gap-2 max-w-lg px-3 py-2 rounded-lg bg-white border border-slate-200">
        <Search size={16} className="text-slate-400" />
        <input name="q" defaultValue={q} placeholder="Search students, teachers…" autoFocus
          className="bg-transparent text-sm text-slate-900 outline-none w-full" />
      </form>

      {q && total === 0 && <p className="text-slate-400">No matches found.</p>}

      {students.length > 0 && (
        <Section title="Students" icon={<Users size={16} />} count={students.length}>
          {students.map((s) => (
            <Link key={s.id} href={`/students/${s.id}`} className="flex min-w-0 flex-col gap-1 px-4 py-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-0 sm:flex-row sm:items-center sm:justify-between">
              <span className="truncate text-sm text-slate-800">{s.firstName} {s.lastName}</span>
              <span className="truncate text-xs text-slate-400">{s.admissionNo} · {s.section?.name ?? '—'}</span>
            </Link>
          ))}
        </Section>
      )}

      {teachers.length > 0 && (
        <Section title="Teachers" icon={<GraduationCap size={16} />} count={teachers.length}>
          {teachers.map((t) => (
            <Link key={t.id} href="/teachers" className="flex min-w-0 flex-col gap-1 px-4 py-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-0 sm:flex-row sm:items-center sm:justify-between">
              <span className="truncate text-sm text-slate-800">{t.name}</span>
              <span className="truncate text-xs text-slate-400">{t.subject} · {t.email}</span>
            </Link>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, icon, count, children }: { title: string; icon: React.ReactNode; count: number; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 bg-slate-50 flex items-center gap-2 text-sm font-semibold text-slate-700">{icon} {title} <span className="text-slate-400 font-normal">({count})</span></div>
      {children}
    </div>
  );
}
