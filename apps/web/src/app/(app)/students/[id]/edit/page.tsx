import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { ensureStudentSections } from '@/lib/academic-structure';
import { getInstitutionTerminology } from '@/lib/institution-terminology';
import { updateStudent } from '../../../actions';

export const dynamic = 'force-dynamic';

export default async function EditStudentPage({ params }: { params: { id: string } }) {
  const institutionId = getSession()!.institutionId;
  const [student, sections, institution] = await Promise.all([
    db.student.findFirst({ where: { id: params.id, institutionId } }),
    ensureStudentSections(institutionId),
    db.institution.findUnique({ where: { id: institutionId }, select: { type: true } }),
  ]);
  if (!student) notFound();
  const terms = getInstitutionTerminology(institution?.type);

  async function action(formData: FormData) {
    'use server';
    await updateStudent(formData);
    redirect(`/students/${params.id}`);
  }

  return (
    <div className="max-w-3xl">
      <Link href={`/students/${student.id}`} className="text-sm text-slate-500">← Back to profile</Link>
      <h1 className="text-2xl font-extrabold text-slate-900 mt-2 mb-6">Edit {terms.learner}</h1>

      <form action={action} className="space-y-4 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <input type="hidden" name="id" value={student.id} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field name="firstName" label="First name" defaultValue={student.firstName} required />
          <Field name="lastName" label="Last name" defaultValue={student.lastName} required />
          <Select name="gender" label="Gender" defaultValue={student.gender ?? ''} options={[['', '—'], ['M', 'Male'], ['F', 'Female']]} />
          <Select name="status" label="Status" defaultValue={student.status}
            options={[['ACTIVE', 'Active'], ['GRADUATED', 'Graduated'], ['TRANSFERRED', 'Transferred'], ['WITHDRAWN', 'Withdrawn']]} />
          <label className="block sm:col-span-2"><span className="text-sm text-slate-600">{terms.section}</span>
            <select name="sectionId" required defaultValue={student.sectionId ?? ''} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900">
              <option value="" disabled>Choose {terms.section.toLowerCase()}</option>
              {sections.map((s) => <option key={s.id} value={s.id}>{sectionLabel(s)}</option>)}
            </select></label>
          <Field name="guardianName" label="Guardian name" defaultValue={student.guardianName ?? ''} />
          <Field name="guardianPhone" label="Guardian phone" defaultValue={student.guardianPhone ?? ''} />
        </div>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white">Save changes</button>
          <Link href={`/students/${student.id}`} className="rounded-lg border border-slate-200 px-4 py-2 text-center text-sm">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

function sectionLabel(section: { name: string; schoolClass?: { name: string } | null }) {
  return section.schoolClass?.name ? `${section.schoolClass.name} · ${section.name}` : section.name;
}

function Field({ name, label, defaultValue, required }: { name: string; label: string; defaultValue?: string; required?: boolean }) {
  return <label className="block"><span className="text-sm text-slate-600">{label}</span>
    <input name={name} defaultValue={defaultValue} required={required}
      className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none" /></label>;
}
function Select({ name, label, defaultValue, options }: { name: string; label: string; defaultValue: string; options: [string, string][] }) {
  return <label className="block"><span className="text-sm text-slate-600">{label}</span>
    <select name={name} defaultValue={defaultValue} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900">
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>;
}
