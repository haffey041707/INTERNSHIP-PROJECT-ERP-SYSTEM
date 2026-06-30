import Link from 'next/link';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { deleteStudent } from '../actions';

export const dynamic = 'force-dynamic';

export default async function StudentsPage({ searchParams }: { searchParams: { q?: string } }) {
  const institutionId = getSession()!.institutionId;
  const q = searchParams.q?.trim() ?? '';

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
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Students</h1>
          <p className="text-slate-500 text-sm">{students.length} shown · stored in your database</p>
        </div>
        <Link href="/students/new" className="px-3 py-2 text-sm rounded-lg bg-brand-600 text-white">+ Add Student</Link>
      </div>

      <form className="mb-4">
        <input name="q" defaultValue={q} placeholder="Search by name or admission no…"
          className="w-full max-w-sm px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
      </form>

      <div className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-400 bg-slate-50">
            <tr>
              <th className="px-4 py-3">Adm. No</th><th>Name</th><th>Section</th><th>Gender</th>
              <th>Guardian</th><th>Status</th><th className="text-right px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs">{s.admissionNo}</td>
                <td>
                  <Link href={`/students/${s.id}`} className="font-medium text-slate-900 hover:text-brand-600">
                    {s.firstName} {s.lastName}
                  </Link>
                </td>
                <td>{s.section?.name ?? '—'}</td>
                <td>{s.gender ?? '—'}</td>
                <td className="text-slate-500">{s.guardianName ?? '—'}</td>
                <td><span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-success">{s.status}</span></td>
                <td className="text-right px-4">
                  <form action={deleteStudent} className="inline">
                    <input type="hidden" name="id" value={s.id} />
                    <button className="text-xs text-danger hover:underline">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                No students found. <Link href="/students/new" className="text-brand-600">Add one →</Link>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
