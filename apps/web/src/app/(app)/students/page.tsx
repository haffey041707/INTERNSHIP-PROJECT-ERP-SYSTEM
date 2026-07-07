import Link from 'next/link';
import { Search, Trash2, UserPlus } from 'lucide-react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { ensureStudentSections } from '@/lib/academic-structure';
import { deleteStudent } from '../actions';

export const dynamic = 'force-dynamic';

export default async function StudentsPage({ searchParams }: { searchParams: { q?: string } }) {
  const institutionId = getSession()!.institutionId;
  const q = searchParams.q?.trim() ?? '';
  await ensureStudentSections(institutionId);

  const students = await db.student.findMany({
    where: {
      institutionId,
      ...(q ? { OR: [
        { firstName: { contains: q } }, { lastName: { contains: q } }, { admissionNo: { contains: q } },
      ] } : {}),
    },
    include: { section: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-slate-900">Students</h1>
          <p className="text-slate-500 text-sm">{students.length} shown · stored in your database</p>
        </div>
        <Link href="/students/new" className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 text-sm font-medium text-white">
          <UserPlus size={16} /> Add Student
        </Link>
      </div>

      <form className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:max-w-md">
        <Search size={16} className="shrink-0 text-slate-400" />
        <input name="q" defaultValue={q} placeholder="Search by name or admission no…"
          className="min-w-0 w-full bg-transparent text-sm text-slate-900 outline-none" />
      </form>

      <div className="hidden rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden md:block">
        <table className="w-full min-w-[780px] text-sm">
          <thead className="text-left text-slate-400 bg-slate-50">
            <tr>
              <th className="px-4 py-3">Adm. No</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Section</th>
              <th className="px-4 py-3">Gender</th>
              <th className="px-4 py-3">Guardian</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{s.admissionNo}</td>
                <td className="px-4 py-3">
                  <Link href={`/students/${s.id}`} className="font-medium text-slate-900 hover:text-brand-600">
                    {s.firstName} {s.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{s.section?.name ?? '—'}</td>
                <td className="px-4 py-3 whitespace-nowrap">{s.gender ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500">{s.guardianName ?? '—'}</td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-success">{s.status}</span></td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteStudent} className="inline">
                    <input type="hidden" name="id" value={s.id} />
                    <button className="inline-flex items-center gap-1 text-xs text-danger hover:underline">
                      <Trash2 size={13} /> Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                No students found.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {students.map((s) => (
          <article key={s.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[11px] uppercase tracking-wide text-slate-400">{s.admissionNo}</p>
                <Link href={`/students/${s.id}`} className="mt-1 block truncate text-base font-semibold text-slate-900">
                  {s.firstName} {s.lastName}
                </Link>
              </div>
              <span className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-[11px] font-medium text-success">{s.status}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <Info label="Section" value={s.section?.name ?? 'Unassigned'} />
              <Info label="Gender" value={s.gender ?? '—'} />
              <Info label="Guardian" value={s.guardianName ?? '—'} wide />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
              <Link href={`/students/${s.id}`} className="text-sm font-medium text-brand-600">Open profile</Link>
              <form action={deleteStudent}>
                <input type="hidden" name="id" value={s.id} />
                <button className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-danger">
                  <Trash2 size={13} /> Delete
                </button>
              </form>
            </div>
          </article>
        ))}
        {students.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-slate-400">No students found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`min-w-0 rounded-lg bg-slate-50 px-3 py-2 ${wide ? 'col-span-2' : ''}`}>
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="truncate text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
