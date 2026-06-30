import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { grade } from '@/lib/grade';
import { saveMarks } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function ExamDetailPage({ params }: { params: { id: string } }) {
  const institutionId = getSession()!.institutionId;
  const exam = await db.exam.findFirst({
    where: { id: params.id, institutionId },
    include: { section: true, marks: true },
  });
  if (!exam) notFound();

  const students = await db.student.findMany({
    where: { institutionId, sectionId: exam.sectionId },
    orderBy: { firstName: 'asc' },
  });
  const markFor = (sid: string) => exam.marks.find((m) => m.studentId === sid)?.score;

  // results / ranking
  const ranked = students
    .map((s) => ({ s, score: markFor(s.id) }))
    .filter((r) => r.score !== undefined)
    .sort((a, b) => (b.score! - a.score!));
  const classAvg = ranked.length ? Math.round(ranked.reduce((n, r) => n + r.score!, 0) / ranked.length) : 0;

  return (
    <div className="max-w-4xl">
      <Link href="/exams" className="text-sm text-slate-500">← Back to exams</Link>
      <div className="mt-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{exam.name} · {exam.subject}</h1>
          <p className="text-slate-500 text-sm">{exam.section.name} · max {exam.maxMarks} · {exam.date}</p>
        </div>
        <div className="text-right text-sm">
          <p className="text-slate-500">Class average</p>
          <p className="text-xl font-bold text-slate-900">{classAvg}/{exam.maxMarks}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        {/* Marks entry */}
        <form action={saveMarks} className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <input type="hidden" name="examId" value={exam.id} />
          <div className="px-4 py-3 bg-slate-50 font-semibold text-slate-900 text-sm">Enter / edit marks</div>
          <div className="max-h-[460px] overflow-auto">
            <table className="w-full text-sm">
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-t border-slate-100">
                    <td className="px-4 py-2">{s.firstName} {s.lastName}</td>
                    <td className="px-4 py-2 text-right">
                      <input name={`score_${s.id}`} type="number" min={0} max={exam.maxMarks} defaultValue={markFor(s.id) ?? ''}
                        className="w-20 px-2 py-1 rounded-md border border-slate-200 text-right text-slate-900" />
                      <span className="text-slate-400"> /{exam.maxMarks}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-slate-100"><button className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm">Save marks</button></div>
        </form>

        {/* Results / ranking */}
        <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 font-semibold text-slate-900 text-sm">Results &amp; ranking</div>
          <div className="max-h-[460px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-400"><tr><th className="px-4 py-2">#</th><th>Student</th><th>Score</th><th>%</th><th>Grade</th></tr></thead>
              <tbody>
                {ranked.map((r, i) => {
                  const pct = Math.round((r.score! / exam.maxMarks) * 100);
                  const g = grade(pct);
                  return (
                    <tr key={r.s.id} className="border-t border-slate-100">
                      <td className="px-4 py-2 text-slate-400">{i + 1}</td>
                      <td>{r.s.firstName} {r.s.lastName}</td>
                      <td>{r.score}</td>
                      <td>{pct}%</td>
                      <td className={`font-bold ${g.color}`}>{g.letter}</td>
                    </tr>
                  );
                })}
                {ranked.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No marks entered yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
