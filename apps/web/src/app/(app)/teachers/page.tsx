import Link from 'next/link';
import { Mail, Phone, Award } from 'lucide-react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function TeachersPage() {
  const institutionId = getSession()!.institutionId;
  const teachers = await db.teacher.findMany({ where: { institutionId }, orderBy: { name: 'asc' } });

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-slate-900">Teachers</h1>
          <p className="text-slate-500 text-sm">{teachers.length} staff members</p>
        </div>
        <Link href="/teachers/new" className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-brand-600 px-3 text-sm font-medium text-white">+ Add Teacher</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
        {teachers.map((t) => (
          <Link key={t.id} href={`/teachers/${t.id}`} className="card-hover min-w-0 rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 shrink-0 rounded-full bg-brand-100 grid place-items-center text-brand-700 font-bold">
                {t.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{t.name}</p>
                <p className="truncate text-sm text-brand-600">{t.subject}</p>
              </div>
            </div>
            <div className="mt-3 text-sm text-slate-500 space-y-1.5">
              <p className="flex min-w-0 items-center gap-2"><Mail size={14} className="text-slate-400 shrink-0" /> <span className="min-w-0 break-all">{t.email}</span></p>
              {t.phone && <p className="flex min-w-0 items-center gap-2"><Phone size={14} className="text-slate-400 shrink-0" /> <span className="truncate">{t.phone}</span></p>}
              {t.qualification && <p className="flex min-w-0 items-center gap-2"><Award size={14} className="text-slate-400 shrink-0" /> <span className="truncate">{t.qualification}</span></p>}
            </div>
          </Link>
        ))}
        {teachers.length === 0 && <p className="text-slate-400">No teachers yet.</p>}
      </div>
    </div>
  );
}
