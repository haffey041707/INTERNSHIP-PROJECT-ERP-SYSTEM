import Link from 'next/link';
import type { ReactNode } from 'react';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, BarChart3, CheckCircle2, ClipboardList, Save, Target, Trophy, Users } from 'lucide-react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { grade } from '@/lib/grade';
import { getInstitutionTerminology } from '@/lib/institution-terminology';
import { saveMarks } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function ExamDetailPage({ params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) redirect('/login');
  const institutionId = session.institutionId;
  const [institution, exam] = await Promise.all([
    db.institution.findUnique({ where: { id: institutionId }, select: { type: true } }),
    db.exam.findFirst({
      where: { id: params.id, institutionId },
      include: { section: true, marks: true },
    }),
  ]);
  if (!exam) notFound();
  const terms = getInstitutionTerminology(institution?.type);
  const isInstitute = terms.type === 'INSTITUTE';
  const label = isInstitute ? 'Assessment' : 'Exam';

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
  const completion = students.length ? Math.round((ranked.length / students.length) * 100) : 0;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] p-4 text-white shadow-sm sm:p-5">
        <Link href="/exams" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white sm:text-sm">
          <ArrowLeft size={15} /> Back to {isInstitute ? 'assessments' : 'exams'}
        </Link>
        <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">{label} score workspace</p>
            <h1 className="mt-2 break-words text-xl font-extrabold leading-tight sm:text-3xl">{exam.name} · {exam.subject}</h1>
            <p className="mt-3 text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">
              {exam.section.name} · max {exam.maxMarks} · {exam.date}
            </p>
          </div>
          <ResultVisual average={classAvg} max={exam.maxMarks} completion={completion} />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <Stat icon={<Users size={18} />} label={terms.learners} value={String(students.length)} tone="from-sky-500 to-cyan-500" />
        <Stat icon={<CheckCircle2 size={18} />} label="Entered" value={String(ranked.length)} tone="from-emerald-500 to-teal-500" />
        <Stat icon={<BarChart3 size={18} />} label="Average" value={`${classAvg}/${exam.maxMarks}`} tone="from-amber-500 to-orange-500" />
        <Stat icon={<Target size={18} />} label="Completion" value={`${completion}%`} tone="from-violet-600 to-fuchsia-500" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
        {/* Marks entry */}
        <form action={saveMarks} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] shadow-sm">
          <input type="hidden" name="examId" value={exam.id} />
          <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3 font-semibold text-white">
            <ClipboardList size={17} className="text-amber-200" />
            <span className="text-sm">Enter / edit marks</span>
          </div>
          <div className="max-h-[460px] overflow-auto">
            <table className="w-full text-sm">
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-t border-white/10 text-slate-100">
                    <td className="px-4 py-3">{s.firstName} {s.lastName}</td>
                    <td className="px-4 py-3 text-right">
                      <input name={`score_${s.id}`} type="number" min={0} max={exam.maxMarks} defaultValue={markFor(s.id) ?? ''}
                        className="h-9 w-20 rounded-lg border border-white/10 bg-white/8 px-2 text-right text-sm text-white outline-none focus:ring-2 focus:ring-amber-400/40" />
                      <span className="ml-1 text-xs text-slate-400">/{exam.maxMarks}</span>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && <tr><td colSpan={2} className="px-4 py-8 text-center text-slate-400">No {terms.learners.toLowerCase()} in this {isInstitute ? 'batch' : 'section'}.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="border-t border-white/10 p-3">
            <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 text-sm font-semibold text-white sm:w-auto">
              <Save size={16} /> Save marks
            </button>
          </div>
        </form>

        {/* Results / ranking */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] shadow-sm">
          <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3 font-semibold text-white">
            <Trophy size={17} className="text-amber-200" />
            <span className="text-sm">Results &amp; ranking</span>
          </div>
          <div className="max-h-[460px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-400"><tr><th className="px-4 py-2">#</th><th>Student</th><th>Score</th><th>%</th><th>Grade</th></tr></thead>
              <tbody>
                {ranked.map((r, i) => {
                  const pct = Math.round((r.score! / exam.maxMarks) * 100);
                  const g = grade(pct);
                  return (
                    <tr key={r.s.id} className="border-t border-white/10 text-slate-100">
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

function ResultVisual({ average, max, completion }: { average: number; max: number; completion: number }) {
  const pct = max ? Math.min(100, Math.round((average / max) * 100)) : 0;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-300/14 text-amber-200">
          <BarChart3 size={19} />
        </span>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/75 sm:text-[11px]">Live score</span>
      </div>
      <div className="mt-4 space-y-3">
        <Progress label="Average" value={`${pct}%`} width={`${pct}%`} tone="bg-amber-400" />
        <Progress label="Completion" value={`${completion}%`} width={`${completion}%`} tone="bg-emerald-400" />
      </div>
    </div>
  );
}

function Progress({ label, value, width, tone }: { label: string; value: string; width: string; tone: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between gap-3 text-[11px] text-slate-300 sm:text-xs"><span>{label}</span><span>{value}</span></div>
      <div className="h-2 rounded-full bg-white/10"><div className={`h-2 rounded-full ${tone}`} style={{ width }} /></div>
    </div>
  );
}

function Stat({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0F172A] p-3 text-white shadow-sm sm:rounded-2xl sm:p-4">
      <span className={`grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br ${tone} sm:h-9 sm:w-9`}>{icon}</span>
      <p className="mt-2 truncate text-[10px] font-semibold uppercase tracking-widest text-white/55 sm:mt-3 sm:text-xs">{label}</p>
      <p className="mt-1 break-words text-lg font-extrabold sm:text-2xl">{value}</p>
    </div>
  );
}
