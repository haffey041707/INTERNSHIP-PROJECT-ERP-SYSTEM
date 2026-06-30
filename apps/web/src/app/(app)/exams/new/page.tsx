import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { createExam } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function NewExamPage() {
  const institutionId = getSession()!.institutionId;
  const sections = await db.section.findMany({ where: { institutionId }, orderBy: { name: 'asc' } });

  async function action(formData: FormData) {
    'use server';
    const id = await createExam(formData);
    redirect(`/exams/${id}`);
  }

  return (
    <div className="max-w-xl">
      <Link href="/exams" className="text-sm text-slate-500">← Back to exams</Link>
      <h1 className="text-2xl font-extrabold text-slate-900 mt-2 mb-6">New Exam</h1>
      <form action={action} className="space-y-4 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <Field name="name" label="Exam name" placeholder="Mid-Term" required />
        <Field name="subject" label="Subject" placeholder="Mathematics" required />
        <label className="block"><span className="text-sm text-slate-600">Section</span>
          <select name="sectionId" required className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900">
            {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select></label>
        <div className="grid grid-cols-2 gap-4">
          <Field name="maxMarks" label="Max marks" type="number" defaultValue="100" required />
          <Field name="date" label="Date" type="date" required />
        </div>
        <div className="flex gap-3 pt-2">
          <button className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm">Create &amp; enter marks</button>
          <Link href="/exams" className="px-4 py-2 rounded-lg border border-slate-200 text-sm">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

function Field({ name, label, type = 'text', placeholder, defaultValue, required }:
  { name: string; label: string; type?: string; placeholder?: string; defaultValue?: string; required?: boolean }) {
  return <label className="block"><span className="text-sm text-slate-600">{label}</span>
    <input name={name} type={type} placeholder={placeholder} defaultValue={defaultValue} required={required}
      className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none" /></label>;
}
