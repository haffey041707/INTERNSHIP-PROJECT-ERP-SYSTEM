import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { createStudent } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function NewStudentPage() {
  const institutionId = getSession()!.institutionId;
  const sections = await db.section.findMany({ where: { institutionId }, orderBy: { name: 'asc' } });

  async function action(formData: FormData) {
    'use server';
    await createStudent(formData);
    redirect('/students');
  }

  return (
    <div className="max-w-2xl">
      <Link href="/students" className="text-sm text-slate-500">← Back to students</Link>
      <h1 className="text-2xl font-extrabold text-slate-900 mt-2 mb-1">Add Student</h1>
      <p className="text-slate-500 text-sm mb-6">This saves a real record to your database.</p>

      <form action={action} className="space-y-4 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <Field name="firstName" label="First name" required />
          <Field name="lastName" label="Last name" required />
          <Field name="admissionNo" label="Admission no (optional)" placeholder="auto-generated if blank" />
          <label className="block">
            <span className="text-sm text-slate-600">Gender</span>
            <select name="gender" className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900">
              <option value="">—</option><option value="M">Male</option><option value="F">Female</option>
            </select>
          </label>
          <label className="block col-span-2">
            <span className="text-sm text-slate-600">Section</span>
            <select name="sectionId" className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900">
              <option value="">— Unassigned —</option>
              {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <Field name="guardianName" label="Guardian name" />
          <Field name="guardianPhone" label="Guardian phone" />
        </div>
        <div className="flex gap-3 pt-2">
          <button className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm">Save Student</button>
          <Link href="/students" className="px-4 py-2 rounded-lg border border-slate-200 text-sm">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

function Field({ name, label, required, placeholder }:
  { name: string; label: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-600">{label}</span>
      <input name={name} required={required} placeholder={placeholder}
        className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none" />
    </label>
  );
}
