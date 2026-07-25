import Link from 'next/link';
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { Award, BookOpen, CalendarDays, Mail, Phone, Plus, ShieldCheck, Users } from 'lucide-react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { getInstitutionTerminology } from '@/lib/institution-terminology';

export const dynamic = 'force-dynamic';

export default async function TeachersPage() {
  const session = getSession();
  if (!session) redirect('/login');
  const institutionId = session.institutionId;
  const [institution, teachers] = await Promise.all([
    db.institution.findUnique({ where: { id: institutionId }, select: { type: true } }),
    db.teacher.findMany({ where: { institutionId }, orderBy: { name: 'asc' } }),
  ]);
  const terms = getInstitutionTerminology(institution?.type);
  const subjects = new Set(teachers.map((teacher) => teacher.subject).filter(Boolean)).size;
  const contactReady = teachers.filter((teacher) => teacher.email || teacher.phone).length;
  const qualified = teachers.filter((teacher) => teacher.qualification).length;
  const isHigherEd = terms.type === 'COLLEGE' || terms.type === 'UNIVERSITY';
  const educatorPlural = terms.educators;
  const educatorSingular = terms.educator;
  const copy = {
    eyebrow: isHigherEd ? 'Lecturer and faculty operations' : terms.type === 'INSTITUTE' ? 'Trainer operations' : 'Faculty operations',
    title: `${educatorPlural} Command Desk`,
    summary: isHigherEd
      ? `Manage ${educatorPlural.toLowerCase()} profiles, department ownership, course load, qualification records, contact readiness, timetable responsibility, and academic advising.`
      : `Manage ${educatorPlural.toLowerCase()} profiles, subject ownership, qualification records, contact readiness, class links, timetable load, and academic responsibility.`,
    addLabel: `Add ${educatorSingular}`,
    assignmentLabel: isHigherEd ? 'Course allocation' : terms.type === 'INSTITUTE' ? 'Trainer allocation' : 'Teacher assignment',
    loadLabel: isHigherEd ? 'Lecture load' : terms.type === 'INSTITUTE' ? 'Session load' : 'Timetable load',
    assignmentHref: terms.type === 'SCHOOL' ? '/modules/school/academics-and-classes/teacher-assignment' : terms.type === 'INSTITUTE' ? '/institutes' : terms.type === 'COLLEGE' ? '/colleges' : '/university',
    loadHref: terms.type === 'SCHOOL' ? '/modules/school/academics-and-classes/timetable-planning' : terms.type === 'INSTITUTE' ? '/training' : terms.type === 'COLLEGE' ? '/colleges' : '/university',
  };
  const panels = isHigherEd
    ? [
        { icon: <BookOpen size={18} />, title: 'Course Ownership', detail: 'Course allocation, credit load, departments, semester coverage, lab ownership, and advising responsibility.', href: copy.assignmentHref, tone: 'from-violet-600 to-fuchsia-500' },
        { icon: <CalendarDays size={18} />, title: 'Lecture Load', detail: 'Lecture slots, rooms, labs, timetable conflicts, office hours, and substitute planning.', href: copy.loadHref, tone: 'from-sky-500 to-cyan-500' },
        { icon: <ShieldCheck size={18} />, title: 'Academic Profile', detail: 'Qualification, publications, workload, advising notes, contact readiness, and approval trail.', href: terms.type === 'COLLEGE' ? '/colleges' : '/university', tone: 'from-emerald-500 to-teal-500' },
      ]
    : [
        { icon: <BookOpen size={18} />, title: copy.assignmentLabel, detail: 'Subject allocation, class load, syllabus coverage, substitutes, and teacher responsibility.', href: copy.assignmentHref, tone: 'from-violet-600 to-fuchsia-500' },
        { icon: <CalendarDays size={18} />, title: copy.loadLabel, detail: 'Periods, rooms, lab slots, conflicts, published timetable, and substitution planning.', href: copy.loadHref, tone: 'from-sky-500 to-cyan-500' },
        { icon: <ShieldCheck size={18} />, title: 'Performance File', detail: 'Qualification, workload, contact readiness, review notes, and academic approval trail.', href: copy.assignmentHref, tone: 'from-emerald-500 to-teal-500' },
      ];

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] p-4 text-white shadow-sm sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[1fr_340px] xl:gap-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">{copy.eyebrow}</p>
            <h1 className="mt-2 break-words text-xl font-extrabold leading-tight sm:text-3xl">{copy.title}</h1>
            <p className="mt-3 max-w-2xl text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">
              {copy.summary}
            </p>
            <div className="mt-4 grid gap-2 sm:mt-5 sm:flex sm:flex-wrap">
              <Link href="/teachers/new" className="inline-flex h-9 w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 text-xs font-semibold text-white shadow-sm sm:h-10 sm:w-auto sm:text-sm">
                <Plus size={15} className="shrink-0" />
                <span className="truncate">{copy.addLabel}</span>
              </Link>
              <Link href={copy.assignmentHref} className="inline-flex h-9 w-full min-w-0 items-center justify-center rounded-xl border border-white/10 bg-white/8 px-3 text-xs font-semibold text-white transition hover:bg-white/12 sm:h-10 sm:w-auto sm:text-sm">
                <span className="truncate">{copy.assignmentLabel}</span>
              </Link>
              <Link href={copy.loadHref} className="inline-flex h-9 w-full min-w-0 items-center justify-center rounded-xl border border-white/10 bg-white/8 px-3 text-xs font-semibold text-white transition hover:bg-white/12 sm:h-10 sm:w-auto sm:text-sm">
                <span className="truncate">{copy.loadLabel}</span>
              </Link>
            </div>
          </div>
          <TeacherVisual teachers={teachers.length} subjects={subjects} qualified={qualified} educatorLabel={educatorPlural} subjectLabel={isHigherEd ? 'Courses' : 'Subjects'} />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <Stat icon={<Users size={18} />} label={educatorPlural} value={String(teachers.length)} tone="from-violet-600 to-fuchsia-500" />
        <Stat icon={<BookOpen size={18} />} label={isHigherEd ? 'Courses' : 'Subjects'} value={String(subjects)} tone="from-sky-500 to-cyan-500" />
        <Stat icon={<Award size={18} />} label="Qualified" value={String(qualified)} tone="from-emerald-500 to-teal-500" />
        <Stat icon={<Mail size={18} />} label="Contact Ready" value={String(contactReady)} tone="from-amber-500 to-orange-500" />
      </div>

      <section className="grid gap-2 sm:gap-3 md:grid-cols-3">
        {panels.map((panel) => (
          <FacultyPanel key={panel.title} {...panel} />
        ))}
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teachers.map((teacher, index) => (
          <Link key={teacher.id} href={`/teachers/${teacher.id}`} className="group min-w-0 rounded-2xl border border-white/10 bg-[#0F172A] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300/30">
            <div className="flex items-center gap-3">
              <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${avatarTone(index)} font-bold text-white shadow-sm`}>
                {teacher.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold text-white">{teacher.name}</p>
                <p className="truncate text-sm font-semibold text-violet-200">{teacher.subject}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <ContactLine icon={<Mail size={14} />} value={teacher.email} breakAll />
              {teacher.phone && <ContactLine icon={<Phone size={14} />} value={teacher.phone} />}
              {teacher.qualification && <ContactLine icon={<Award size={14} />} value={teacher.qualification} />}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">{educatorSingular} profile</span>
              <span className="rounded-full bg-violet-300/10 px-2.5 py-1 text-xs font-bold text-violet-200 transition group-hover:bg-violet-300/15">Open</span>
            </div>
          </Link>
        ))}
        {teachers.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-6 text-center text-sm text-slate-400 shadow-sm">
            No {educatorPlural.toLowerCase()} yet.
          </div>
        )}
      </div>
    </div>
  );
}

function TeacherVisual({ teachers, subjects, qualified, educatorLabel, subjectLabel }: { teachers: number; subjects: number; qualified: number; educatorLabel: string; subjectLabel: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/8 p-3 sm:min-h-56 sm:p-5">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-fuchsia-400/14" />
      <div className="absolute -bottom-12 left-8 h-32 w-32 rounded-full bg-cyan-400/12" />
      <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-950/35 sm:h-24 sm:w-24 sm:rounded-[2rem]">
        <Users size={28} />
      </div>
      <div className="relative mt-4 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-3">
        {[
          [educatorLabel, teachers],
          [subjectLabel, subjects],
          ['Verified', qualified],
        ].map(([label, value]) => (
          <div key={label} className="min-w-0 rounded-xl border border-white/10 bg-white/8 p-2.5 text-center sm:rounded-2xl sm:p-3">
            <p className="text-xl font-extrabold text-white sm:text-2xl">{value}</p>
            <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-widest text-slate-400 sm:text-[11px]">{label}</p>
          </div>
        ))}
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

function FacultyPanel({ icon, title, detail, href, tone }: { icon: ReactNode; title: string; detail: string; href: string; tone: string }) {
  return (
    <Link href={href} className="group min-w-0 rounded-xl border border-white/10 bg-[#0F172A] p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300/30 sm:rounded-2xl sm:p-4">
      <span className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white sm:h-10 sm:w-10 sm:rounded-2xl`}>{icon}</span>
      <h2 className="mt-3 break-words text-sm font-bold text-white sm:mt-4 sm:text-base">{title}</h2>
      <p className="mt-2 text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">{detail}</p>
    </Link>
  );
}

function ContactLine({ icon, value, breakAll }: { icon: ReactNode; value: string; breakAll?: boolean }) {
  return (
    <p className="flex min-w-0 items-center gap-2 rounded-xl bg-white/7 px-3 py-2">
      <span className="shrink-0 text-violet-200">{icon}</span>
      <span className={`min-w-0 ${breakAll ? 'break-all' : 'truncate'}`}>{value}</span>
    </p>
  );
}

function avatarTone(index: number) {
  const tones = ['from-violet-600 to-fuchsia-500', 'from-sky-500 to-cyan-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500'];
  return tones[index % tones.length];
}
