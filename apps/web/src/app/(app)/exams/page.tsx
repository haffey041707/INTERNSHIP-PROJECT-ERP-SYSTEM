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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Exams &amp; Results</h1>
          <p className="text-slate-500 text-sm">{exams.length} exams · enter marks and publish grades</p>
        </div>
        <Link href="/exams/new" className="px-3 py-2 text-sm rounded-lg bg-brand-600 text-white">+ New Exam</Link>
      </div>

      <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-400 text-left">
            <tr><th className="px-4 py-3">Exam</th><th>Subject</th><th>Section</th><th>Max</th><th>Date</th><th>Marks</th><th className="px-4 text-right">Action</th></tr>
          </thead>
          <tbody>
            {exams.map((e) => (
              <tr key={e.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2 font-medium text-slate-900">{e.name}</td>
                <td>{e.subject}</td>
                <td>{e.section.name}</td>
                <td>{e.maxMarks}</td>
                <td className="text-slate-500">{e.date}</td>
                <td>{e._count.marks} entered</td>
                <td className="px-4 text-right"><Link href={`/exams/${e.id}`} className="text-brand-600 hover:underline">Enter / view →</Link></td>
              </tr>
            ))}
            {exams.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No exams yet. <Link href="/exams/new" className="text-brand-600">Create one →</Link></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
