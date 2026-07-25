import Link from 'next/link';
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { BookOpen, CalendarDays, GraduationCap, Plus, ShieldCheck, Users } from 'lucide-react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { ensureStudentSections } from '@/lib/academic-structure';
import { getInstitutionTerminology } from '@/lib/institution-terminology';
import { createClassWithSection, createSection } from '../actions';

export const dynamic = 'force-dynamic';

export default async function ClassesPage() {
  const session = getSession();
  if (!session) redirect('/login');

  const institutionId = session.institutionId;
  await ensureStudentSections(institutionId);
  const [institution, classes] = await Promise.all([
    db.institution.findUnique({ where: { id: institutionId }, select: { type: true } }),
    db.schoolClass.findMany({
      where: { institutionId },
      include: { sections: { include: { _count: { select: { students: true } } } } },
      orderBy: { grade: 'asc' },
    }),
  ]);
  const terms = getInstitutionTerminology(institution?.type);

  const totalSections = classes.reduce((sum, c) => sum + c.sections.length, 0);

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] p-5 text-white shadow-sm">
        <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">Academic operations</p>
            <h1 className="mt-2 break-words text-2xl font-extrabold sm:text-3xl">{terms.structure}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Build classes, sections, capacity, roll groups, timetable lanes, teacher ownership, and student placement for the current academic year.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                ['Class Setup', '/modules/school/academics-and-classes/class-setup'],
                ['Section Allocation', '/modules/school/academics-and-classes/section-allocation'],
                ['Timetable Planning', '/modules/school/academics-and-classes/timetable-planning'],
              ].map(([label, href]) => (
                <Link key={label} href={href} className="rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/12">
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <AcademicVisual groups={classes.length} sections={totalSections} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
        <form action={createClassWithSection} className="rounded-2xl border border-white/10 bg-[#0F172A] p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white"><Plus size={17} /></span>
            <div>
              <h2 className="font-semibold text-white">{terms.setupStructure}</h2>
              <p className="text-xs text-slate-400">Adds the {terms.group.toLowerCase()} and its first {terms.section.toLowerCase()} together.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field name="name" label={`${terms.group} name`} placeholder={terms.defaults.className} required />
            <Field name="grade" label={`${terms.group} code`} placeholder={terms.defaults.grade} />
            <Field name="sectionName" label={`First ${terms.section.toLowerCase()}`} placeholder={terms.defaults.sections[0]} required />
            <Field name="capacity" label="Capacity" type="number" placeholder="40" />
          </div>
          <button className="mt-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-sm">{terms.setupStructure}</button>
        </form>

        <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-5 shadow-sm">
          <h2 className="font-semibold text-white">Structure Summary</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Summary icon={<GraduationCap size={18} />} label={terms.groups} value={String(classes.length)} tone="from-violet-600 to-fuchsia-500" />
            <Summary icon={<Users size={18} />} label={terms.sections} value={String(totalSections)} tone="from-sky-500 to-cyan-500" />
          </div>
          <p className="mt-4 rounded-xl border border-white/10 bg-white/7 px-3 py-2 text-sm text-slate-300">
            Create at least one {terms.group.toLowerCase()} and one {terms.section.toLowerCase()} to complete the setup item.
          </p>
          <div className="mt-4 grid gap-2">
            <QuickAcademicLink icon={<BookOpen size={15} />} label="Curriculum mapping" href="/modules/school/academics-and-classes/curriculum-mapping" />
            <QuickAcademicLink icon={<CalendarDays size={15} />} label="Timetable lock" href="/modules/school/academics-and-classes/timetable-lock" />
            <QuickAcademicLink icon={<ShieldCheck size={15} />} label="Class capacity" href="/modules/school/academics-and-classes/class-capacity" />
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {classes.map((c) => (
          <div key={c.id} className="rounded-2xl border border-white/10 bg-[#0F172A] p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
                  <GraduationCap size={19} />
                </span>
                <div>
                  <h2 className="font-semibold text-white">{c.name}</h2>
                  <p className="text-xs text-slate-400">{c.sections.length} {terms.sections.toLowerCase()}</p>
                </div>
              </div>
              <Link href={`/classes/${c.id}`} className="rounded-full border border-violet-300/25 bg-violet-300/10 px-3 py-1 text-xs font-bold text-violet-200">Open {terms.group.toLowerCase()}</Link>
            </div>
            <div className="flex flex-wrap gap-3">
              {c.sections.map((s) => (
                <Link key={s.id} href={`/classes/${c.id}?section=${s.id}`} className="min-w-[150px] rounded-2xl border border-white/10 bg-white/7 px-4 py-3 transition hover:border-cyan-300/35 hover:bg-white/11">
                  <p className="font-medium text-white">{s.name}</p>
                  <p className="text-xs text-slate-400">{s._count.students} / {s.capacity} {terms.learners.toLowerCase()}</p>
                </Link>
              ))}
              {c.sections.length === 0 && (
                <p className="rounded-xl border border-white/10 bg-white/7 px-4 py-3 text-sm text-slate-400">No {terms.sections.toLowerCase()} yet.</p>
              )}
            </div>
            <form action={createSection} className="mt-4 grid gap-2 border-t border-white/10 pt-4 sm:grid-cols-[1fr_120px_auto]">
              <input type="hidden" name="classId" value={c.id} />
              <input name="name" placeholder={`New ${terms.section.toLowerCase()} name`} required
                className="rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-400" />
              <input name="capacity" type="number" min={1} placeholder="40"
                className="rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-400" />
              <button className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/15">Add {terms.section.toLowerCase()}</button>
            </form>
          </div>
        ))}
        {classes.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-6 text-center shadow-sm">
            <p className="font-medium text-white">No {terms.groups.toLowerCase()} yet.</p>
            <p className="mt-1 text-sm text-slate-400">Use the form above to create your first {terms.group.toLowerCase()} and {terms.section.toLowerCase()}.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ name, label, type = 'text', placeholder, required }:
  { name: string; label: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-300">{label}</span>
      <input name={name} type={type} placeholder={placeholder} required={required} min={type === 'number' ? 1 : undefined}
        className="mt-1 w-full rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-400" />
    </label>
  );
}

function Summary({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/7 p-3">
      <span className={`grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white`}>{icon}</span>
      <p className="mt-3 text-xs text-slate-400">{label}</p>
      <p className="text-xl font-extrabold text-white">{value}</p>
    </div>
  );
}

function QuickAcademicLink({ icon, label, href }: { icon: ReactNode; label: string; href: string }) {
  return (
    <Link href={href} className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/7 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/35 hover:bg-white/11">
      <span className="shrink-0 text-cyan-200">{icon}</span>
      <span className="min-w-0 break-words">{label}</span>
    </Link>
  );
}

function AcademicVisual({ groups, sections }: { groups: number; sections: number }) {
  return (
    <div className="relative min-h-56 overflow-hidden rounded-2xl border border-white/10 bg-white/8 p-5">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-400/15" />
      <div className="absolute -bottom-12 left-8 h-32 w-32 rounded-full bg-cyan-400/12" />
      <div className="relative grid grid-cols-3 gap-3">
        {['Class', 'Section', 'Teacher', 'Room', 'Period', 'Plan'].map((item, index) => (
          <div key={item} className={`rounded-2xl border border-white/10 p-3 text-center ${index % 2 ? 'bg-white/8 text-cyan-100' : 'bg-violet-400/16 text-violet-100'}`}>
            <span className="mx-auto grid h-8 w-8 place-items-center rounded-xl bg-white/12 text-xs font-bold">{index + 1}</span>
            <p className="mt-2 text-xs font-semibold">{item}</p>
          </div>
        ))}
      </div>
      <div className="relative mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/8 p-3">
          <p className="text-xs text-slate-400">Groups</p>
          <p className="text-2xl font-extrabold text-white">{groups}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/8 p-3">
          <p className="text-xs text-slate-400">Sections</p>
          <p className="text-2xl font-extrabold text-white">{sections}</p>
        </div>
      </div>
    </div>
  );
}
