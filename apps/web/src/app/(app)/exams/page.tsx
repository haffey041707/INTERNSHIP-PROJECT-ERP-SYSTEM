import Link from 'next/link';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function ExamsPage() {
  const institutionId = getSession()!.institutionId;
  const exams = await db.exam.findMany({
    where: { institutionId },
    include: { section: true, _count: { select: { marks: true } } },
    orderBy: { date: 'desc' },
  });

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-slate-900">Exams &amp; Results</h1>
          <p className="text-slate-500 text-sm">{exams.length} exams · enter marks and publish grades</p>
        </div>
        <Link href="/exams/new" className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-brand-600 px-3 text-sm font-medium text-white">+ New Exam</Link>
      </div>

      <div className="hidden rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden md:block">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-50 text-slate-400 text-left">
            <tr><th className="px-4 py-3">Exam</th><th className="px-4 py-3">Subject</th><th className="px-4 py-3">Section</th><th className="px-4 py-3">Max</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Marks</th><th className="px-4 text-right">Action</th></tr>
          </thead>
          <tbody>
            {exams.map((e) => (
              <tr key={e.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2 font-medium text-slate-900">{e.name}</td>
                <td className="px-4 py-2">{e.subject}</td>
                <td className="px-4 py-2">{e.section.name}</td>
                <td className="px-4 py-2">{e.maxMarks}</td>
                <td className="px-4 py-2 text-slate-500">{e.date}</td>
                <td className="px-4 py-2">{e._count.marks} entered</td>
                <td className="px-4 text-right"><Link href={`/exams/${e.id}`} className="text-brand-600 hover:underline">Enter / view →</Link></td>
              </tr>
            ))}
            {exams.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No exams yet. <Link href="/exams/new" className="text-brand-600">Create one →</Link></td></tr>}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {exams.map((e) => (
          <Link key={e.id} href={`/exams/${e.id}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{e.name}</p>
                <p className="mt-1 truncate text-sm text-slate-500">{e.subject} · {e.section.name}</p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-50 px-2 py-1 text-[11px] text-slate-500">{e.date}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <Mini label="Max" value={String(e.maxMarks)} />
              <Mini label="Marks" value={`${e._count.marks} entered`} />
            </div>
          </Link>
        ))}
        {exams.length === 0 && <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400 shadow-sm">No exams yet.</div>}
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-slate-50 px-3 py-2"><p className="text-[11px] text-slate-400">{label}</p><p className="truncate font-semibold text-slate-900">{value}</p></div>;
}
