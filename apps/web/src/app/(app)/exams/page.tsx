import Link from 'next/link';
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { Award, BarChart3, BookOpen, CalendarDays, CheckCircle2, ClipboardList, FileText, Plus, Target, Users } from 'lucide-react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { getInstitutionTerminology } from '@/lib/institution-terminology';

export const dynamic = 'force-dynamic';

export default async function ExamsPage() {
  const session = getSession();
  if (!session) redirect('/login');
  const institutionId = session.institutionId;
  const [institution, exams] = await Promise.all([
    db.institution.findUnique({ where: { id: institutionId }, select: { type: true } }),
    db.exam.findMany({
      where: { institutionId },
      include: { section: true, _count: { select: { marks: true } } },
      orderBy: { date: 'desc' },
    }),
  ]);
  const terms = getInstitutionTerminology(institution?.type);
  const isInstitute = terms.type === 'INSTITUTE';
  const label = isInstitute ? 'Assessment' : 'Exam';
  const totalMarks = exams.reduce((sum, exam) => sum + exam._count.marks, 0);
  const sections = new Set(exams.map((exam) => exam.sectionId)).size;
  const maxAverage = exams.length ? Math.round(exams.reduce((sum, exam) => sum + exam.maxMarks, 0) / exams.length) : 0;
  const copy = {
    title: isInstitute ? 'Assessments & Tests Center' : 'Exams & Results Center',
    eyebrow: isInstitute ? 'Institute assessment operations' : 'Academic examination operations',
    summary: isInstitute
      ? 'Build tests, practical assessments, skill checks, trainer evaluations, result entry, feedback release, and learner progress evidence from one visual desk.'
      : 'Plan exams, assign sections, enter marks, review gradebooks, publish results, and prepare report-card evidence from one clean academic desk.',
    newLabel: isInstitute ? 'New Assessment' : 'New Exam',
    sectionLabel: isInstitute ? 'Batch' : terms.section,
  };

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] p-4 text-white shadow-sm sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[1fr_340px] xl:gap-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">{copy.eyebrow}</p>
            <h1 className="mt-2 break-words text-xl font-extrabold leading-tight sm:text-3xl">{copy.title}</h1>
            <p className="mt-3 max-w-2xl text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">{copy.summary}</p>
            <div className="mt-4 grid gap-2 sm:mt-5 sm:flex sm:flex-wrap">
              <Link href="/exams/new" className="inline-flex h-9 w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 text-xs font-semibold text-white shadow-sm sm:h-10 sm:w-auto sm:text-sm">
                <Plus size={15} className="shrink-0" />
                <span className="truncate">{copy.newLabel}</span>
              </Link>
              <Link href="/reports" className="inline-flex h-9 w-full min-w-0 items-center justify-center rounded-xl border border-white/10 bg-white/8 px-3 text-xs font-semibold text-white transition hover:bg-white/12 sm:h-10 sm:w-auto sm:text-sm">
                <span className="truncate">Performance reports</span>
              </Link>
              <Link href="/calendar" className="inline-flex h-9 w-full min-w-0 items-center justify-center rounded-xl border border-white/10 bg-white/8 px-3 text-xs font-semibold text-white transition hover:bg-white/12 sm:h-10 sm:w-auto sm:text-sm">
                <span className="truncate">{label} calendar</span>
              </Link>
            </div>
          </div>
          <ExamVisual exams={exams.length} marks={totalMarks} sections={sections} label={label} />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <Stat icon={<FileText size={18} />} label={`${label}s`} value={String(exams.length)} tone="from-amber-500 to-orange-500" />
        <Stat icon={<Users size={18} />} label={copy.sectionLabel} value={String(sections)} tone="from-sky-500 to-cyan-500" />
        <Stat icon={<CheckCircle2 size={18} />} label="Marks entered" value={String(totalMarks)} tone="from-emerald-500 to-teal-500" />
        <Stat icon={<Target size={18} />} label="Max average" value={maxAverage ? String(maxAverage) : '0'} tone="from-violet-600 to-fuchsia-500" />
      </div>

      <section className="grid gap-2 sm:gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ControlCard icon={<CalendarDays size={18} />} title={`${label} Plan`} detail={isInstitute ? 'Batch, trainer, skill area, test window, and evaluation method.' : 'Section, subject, paper, room, invigilator, and exam date.'} tone="from-indigo-500 to-blue-600" />
        <ControlCard icon={<ClipboardList size={18} />} title="Marks Entry" detail={isInstitute ? 'Practical score, rubric mark, feedback, and skill evidence.' : 'Subject marks, corrections, moderation notes, and gradebook checks.'} tone="from-amber-500 to-orange-500" />
        <ControlCard icon={<BarChart3 size={18} />} title="Result Review" detail={isInstitute ? 'Learner progress, pass status, remedial needs, and trainer review.' : 'Class average, ranking, grade spread, and result approval.'} tone="from-emerald-500 to-teal-500" />
        <ControlCard icon={<Award size={18} />} title="Output" detail={isInstitute ? 'Assessment summary, feedback report, and certificate readiness.' : 'Report cards, promotion notes, parent remarks, and result archive.'} tone="from-violet-600 to-fuchsia-500" />
      </section>

      <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] shadow-sm md:block">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div>
            <h2 className="font-bold text-white">{label} Register</h2>
            <p className="text-xs text-slate-400">Schedules, sections, marks, and result actions.</p>
          </div>
          <span className="rounded-full bg-amber-300/10 px-2.5 py-1 text-xs font-semibold text-amber-200">{exams.length} records</span>
        </div>
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-white/5 text-left text-slate-400">
            <tr><th className="px-4 py-3">{label}</th><th className="px-4 py-3">{isInstitute ? 'Skill / course' : 'Subject'}</th><th className="px-4 py-3">{copy.sectionLabel}</th><th className="px-4 py-3">Max</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Marks</th><th className="px-4 text-right">Action</th></tr>
          </thead>
          <tbody>
            {exams.map((e) => (
              <tr key={e.id} className="border-t border-white/10 text-slate-100 transition hover:bg-white/5">
                <td className="px-4 py-3 font-semibold text-white">{e.name}</td>
                <td className="px-4 py-3 text-slate-300">{e.subject}</td>
                <td className="px-4 py-3 text-slate-300">{e.section.name}</td>
                <td className="px-4 py-3">{e.maxMarks}</td>
                <td className="px-4 py-3 text-slate-300">{e.date}</td>
                <td className="px-4 py-3">{e._count.marks} entered</td>
                <td className="px-4 text-right"><Link href={`/exams/${e.id}`} className="font-semibold text-amber-200 hover:text-amber-100">Enter / view</Link></td>
              </tr>
            ))}
            {exams.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No {label.toLowerCase()} records yet. <Link href="/exams/new" className="font-semibold text-amber-200">Create one</Link></td></tr>}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {exams.map((e) => (
          <Link key={e.id} href={`/exams/${e.id}`} className="rounded-xl border border-white/10 bg-[#0F172A] p-3 shadow-sm">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{e.name}</p>
                <p className="mt-1 truncate text-xs text-slate-400">{e.subject} · {e.section.name}</p>
              </div>
              <span className="shrink-0 rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-[10px] font-semibold text-amber-200">{e.date}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Mini label="Max" value={String(e.maxMarks)} />
              <Mini label="Marks" value={`${e._count.marks} entered`} />
            </div>
          </Link>
        ))}
        {exams.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-6 text-center text-sm text-slate-400 shadow-sm">
            <BookOpen className="mx-auto mb-3 text-amber-200" size={28} />
            No {label.toLowerCase()} records yet.
          </div>
        )}
      </div>
    </div>
  );
}

function ExamVisual({ exams, marks, sections, label }: { exams: number; marks: number; sections: number; label: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/8 p-3 sm:min-h-56 sm:p-5">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-400/14" />
      <div className="absolute -bottom-12 left-8 h-32 w-32 rounded-full bg-violet-400/12" />
      <div className="relative grid grid-cols-3 gap-2 sm:gap-3">
        {[
          [`${label}s`, exams, 'from-amber-500 to-orange-500'],
          ['Marks', marks, 'from-emerald-500 to-teal-500'],
          ['Groups', sections, 'from-sky-500 to-cyan-500'],
        ].map(([text, value, tone]) => (
          <div key={text} className="min-w-0 rounded-xl border border-white/10 bg-white/8 p-2.5 text-center sm:rounded-2xl sm:p-3">
            <span className={`mx-auto block h-2 w-8 rounded-full bg-gradient-to-r ${tone}`} />
            <p className="mt-3 truncate text-[10px] text-slate-400 sm:mt-4 sm:text-xs">{text}</p>
            <p className="text-xl font-extrabold text-white sm:text-2xl">{value}</p>
          </div>
        ))}
      </div>
      <div className="relative mt-3 rounded-xl border border-white/10 bg-slate-950/35 p-3 sm:mt-4 sm:rounded-2xl sm:p-4">
        <div className="grid grid-cols-5 items-end gap-2">
          {[52, 78, 44, 88, 64].map((height, index) => (
            <span key={index} className="rounded-t-xl bg-gradient-to-t from-amber-500 to-cyan-400" style={{ height }} />
          ))}
        </div>
        <p className="mt-3 text-[11px] font-semibold text-slate-300 sm:text-xs">Schedule and result movement</p>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0F172A] p-3 text-white shadow-sm sm:rounded-2xl sm:p-4">
      <span className={`grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br ${tone} sm:h-9 sm:w-9`}>{icon}</span>
      <p className="mt-2 truncate text-[10px] font-semibold uppercase tracking-widest text-white/55 sm:mt-3 sm:text-xs">{label}</p>
      <p className="mt-1 text-xl font-extrabold sm:text-2xl">{value}</p>
    </div>
  );
}

function ControlCard({ icon, title, detail, tone }: { icon: ReactNode; title: string; detail: string; tone: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-[#0F172A] p-3 text-white shadow-sm sm:rounded-2xl sm:p-4">
      <span className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white sm:h-10 sm:w-10 sm:rounded-2xl`}>{icon}</span>
      <h2 className="mt-3 break-words text-sm font-bold text-white sm:mt-4 sm:text-base">{title}</h2>
      <p className="mt-2 text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">{detail}</p>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-white/8 px-3 py-2"><p className="text-[11px] text-slate-400">{label}</p><p className="truncate text-sm font-semibold text-white">{value}</p></div>;
}
