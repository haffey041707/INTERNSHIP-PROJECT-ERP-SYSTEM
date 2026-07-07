import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
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
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">{terms.structure}</h1>
        <p className="text-slate-500 text-sm">Academic structure for the current year.</p>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
        <form action={createClassWithSection} className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600"><Plus size={16} /></span>
            <div>
              <h2 className="font-semibold text-slate-900">{terms.setupStructure}</h2>
              <p className="text-xs text-slate-500">Adds the {terms.group.toLowerCase()} and its first {terms.section.toLowerCase()} together.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field name="name" label={`${terms.group} name`} placeholder={terms.defaults.className} required />
            <Field name="grade" label={`${terms.group} code`} placeholder={terms.defaults.grade} />
            <Field name="sectionName" label={`First ${terms.section.toLowerCase()}`} placeholder={terms.defaults.sections[0]} required />
            <Field name="capacity" label="Capacity" type="number" placeholder="40" />
          </div>
          <button className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">{terms.setupStructure}</button>
        </form>

        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Structure summary</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Summary label={terms.groups} value={String(classes.length)} />
            <Summary label={terms.sections} value={String(totalSections)} />
          </div>
          <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
            Create at least one {terms.group.toLowerCase()} and one {terms.section.toLowerCase()} to complete the setup item.
          </p>
        </div>
      </section>

      <div className="space-y-4">
        {classes.map((c) => (
          <div key={c.id} className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">{c.name}</h2>
                <p className="text-xs text-slate-500">{c.sections.length} {terms.sections.toLowerCase()}</p>
              </div>
              <Link href={`/classes/${c.id}`} className="text-xs font-medium text-brand-600">Open {terms.group.toLowerCase()}</Link>
            </div>
            <div className="flex flex-wrap gap-3">
              {c.sections.map((s) => (
                <Link key={s.id} href={`/classes/${c.id}?section=${s.id}`} className="px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-brand-400">
                  <p className="font-medium text-slate-900">{s.name}</p>
                  <p className="text-xs text-slate-500">{s._count.students} / {s.capacity} {terms.learners.toLowerCase()}</p>
                </Link>
              ))}
              {c.sections.length === 0 && (
                <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">No {terms.sections.toLowerCase()} yet.</p>
              )}
            </div>
            <form action={createSection} className="mt-4 grid gap-2 border-t border-slate-200 pt-4 sm:grid-cols-[1fr_120px_auto]">
              <input type="hidden" name="classId" value={c.id} />
              <input name="name" placeholder={`New ${terms.section.toLowerCase()} name`} required
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500" />
              <input name="capacity" type="number" min={1} placeholder="40"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500" />
              <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-brand-600 hover:bg-slate-50">Add {terms.section.toLowerCase()}</button>
            </form>
          </div>
        ))}
        {classes.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="font-medium text-slate-900">No {terms.groups.toLowerCase()} yet.</p>
            <p className="mt-1 text-sm text-slate-500">Use the form above to create your first {terms.group.toLowerCase()} and {terms.section.toLowerCase()}.</p>
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
      <span className="text-xs text-slate-600">{label}</span>
      <input name={name} type={type} placeholder={placeholder} required={required} min={type === 'number' ? 1 : undefined}
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500" />
    </label>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-xl font-extrabold text-slate-900">{value}</p>
    </div>
  );
}
