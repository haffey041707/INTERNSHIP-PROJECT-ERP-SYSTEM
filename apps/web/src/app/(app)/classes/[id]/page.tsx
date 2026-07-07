import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, CalendarDays, FileText, Users } from 'lucide-react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { getInstitutionTerminology } from '@/lib/institution-terminology';
import { createSection } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function ClassDetailPage({ params, searchParams }: { params: { id: string }; searchParams: { section?: string } }) {
  const session = getSession();
  if (!session) redirect('/login');

  const institutionId = session.institutionId;
  const [institution, klass] = await Promise.all([
    db.institution.findUnique({ where: { id: institutionId }, select: { type: true } }),
    db.schoolClass.findFirst({
      where: { id: params.id, institutionId },
      include: {
        sections: {
          include: {
            _count: { select: { students: true } },
            students: { orderBy: { firstName: 'asc' }, take: 8 },
            exams: { orderBy: { date: 'desc' }, take: 5 },
            timetable: { orderBy: [{ day: 'asc' }, { period: 'asc' }], take: 8 },
          },
          orderBy: { name: 'asc' },
        },
      },
    }),
  ]);
  if (!klass) notFound();
  const terms = getInstitutionTerminology(institution?.type);

  const selected = klass.sections.find((section) => section.id === searchParams.section) ?? klass.sections[0];
  const totalStudents = klass.sections.reduce((sum, section) => sum + section._count.students, 0);
  const totalCapacity = klass.sections.reduce((sum, section) => sum + section.capacity, 0);

  return (
    <div className="space-y-6">
      <div className="premium-home-hero rounded-2xl p-5 text-white">
        <Link href="/classes" className="inline-flex items-center gap-1.5 text-sm text-white/75 hover:text-white">
          <ArrowLeft size={15} /> Back to {terms.groups.toLowerCase()}
        </Link>
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Academic structure</p>
          <h1 className="text-2xl font-extrabold text-white">{klass.name}</h1>
          <p className="mt-2 text-sm text-white/75">{klass.sections.length} {terms.sections.toLowerCase()} · {totalStudents} {terms.learners.toLowerCase()} · {totalCapacity} seats</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <Stat icon={<Users size={18} />} label={terms.learners} value={String(totalStudents)} accent />
        <Stat icon={<CalendarDays size={18} />} label={terms.sections} value={String(klass.sections.length)} />
        <Stat icon={<FileText size={18} />} label={terms.examLabel} value={String(klass.sections.reduce((sum, section) => sum + section.exams.length, 0))} />
        <Stat icon={<Users size={18} />} label="Capacity" value={String(totalCapacity)} />
      </div>

      <div className="grid lg:grid-cols-[.8fr_1.2fr] gap-4">
        <section className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">{terms.sections}</h2>
          <div className="mt-4 space-y-2">
            {klass.sections.map((section) => {
              const active = selected?.id === section.id;
              return (
                <Link
                  key={section.id}
                  href={`/classes/${klass.id}?section=${section.id}`}
                  className={`block rounded-lg border px-3 py-2 text-sm transition ${active ? 'border-brand-400 bg-brand-50' : 'border-slate-200 bg-slate-50 hover:border-brand-400'}`}
                >
                  <p className="font-medium text-slate-900">{section.name}</p>
                  <p className="text-slate-500">{section._count.students} / {section.capacity} {terms.learners.toLowerCase()}</p>
                </Link>
              );
            })}
            {klass.sections.length === 0 && <Empty text={`No ${terms.sections.toLowerCase()} created yet.`} />}
          </div>
          <form action={createSection} className="mt-4 space-y-2 border-t border-slate-200 pt-4">
            <input type="hidden" name="classId" value={klass.id} />
            <label className="block">
              <span className="text-xs text-slate-600">{terms.section} name</span>
              <input name="name" placeholder={`e.g. ${terms.defaults.sections[0]}`} required
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500" />
            </label>
            <label className="block">
              <span className="text-xs text-slate-600">Capacity</span>
              <input name="capacity" type="number" min={1} placeholder="40"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500" />
            </label>
            <button className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-brand-600 hover:bg-slate-50">Add {terms.section.toLowerCase()}</button>
          </form>
        </section>

        <section className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">{selected ? selected.name : `No ${terms.section.toLowerCase()}`}</h2>
          {selected ? (
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <Panel title={terms.learners}>
                {selected.students.length ? selected.students.map((student) => (
                  <Link key={student.id} href={`/students/${student.id}`} className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm hover:border-brand-400">
                    <span className="font-medium text-slate-900">{student.firstName} {student.lastName}</span>
                    <span className="block text-xs text-slate-500">{student.admissionNo}</span>
                  </Link>
                )) : <Empty text={`No ${terms.learners.toLowerCase()} assigned.`} />}
              </Panel>
              <Panel title={terms.examLabel}>
                {selected.exams.length ? selected.exams.map((exam) => (
                  <Link key={exam.id} href={`/exams/${exam.id}`} className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm hover:border-brand-400">
                    <span className="font-medium text-slate-900">{exam.name}</span>
                    <span className="block text-xs text-slate-500">{exam.subject} · {exam.date}</span>
                  </Link>
                )) : <Empty text={`No ${terms.examLabel.toLowerCase()} created.`} />}
              </Panel>
              <div className="md:col-span-2">
                <Panel title="Timetable">
                  {selected.timetable.length ? selected.timetable.map((slot) => (
                    <div key={slot.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                      <span className="font-medium text-slate-900">{slot.day} · Period {slot.period} · {slot.subject}</span>
                      <span className="block text-xs text-slate-500">{slot.teacherName ?? 'Teacher not set'} · {slot.startTime} - {slot.endTime}</span>
                    </div>
                  )) : <Empty text="No timetable slots." />}
                </Panel>
              </div>
            </div>
          ) : (
            <Empty text={`No ${terms.sections.toLowerCase()} created yet.`} />
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-4 shadow-sm ${accent ? 'premium-kpi-accent bg-aurora text-white' : 'premium-kpi glass'}`}>
      <span className={`grid h-9 w-9 place-items-center rounded-lg ${accent ? 'bg-white/20' : 'bg-brand-50 text-brand-600'}`}>{icon}</span>
      <p className={`mt-3 text-sm ${accent ? 'text-white/80' : 'text-slate-500'}`}>{label}</p>
      <p className="text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <div className="mt-2 space-y-2">{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-6 text-center text-sm text-slate-400">{text}</p>;
}
