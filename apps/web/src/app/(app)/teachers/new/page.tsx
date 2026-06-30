import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createTeacher } from '../../actions';

export const dynamic = 'force-dynamic';

export default function NewTeacherPage() {
  async function action(formData: FormData) {
    'use server';
    await createTeacher(formData);
    redirect('/teachers');
  }

  return (
    <div className="max-w-2xl">
      <Link href="/teachers" className="text-sm text-slate-500">← Back to teachers</Link>
      <h1 className="text-2xl font-extrabold text-slate-900 mt-2 mb-6">Add Teacher</h1>

      <form action={action} className="space-y-4 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <Field name="name" label="Full name" required />
          <Field name="email" label="Email" required />
          <Field name="subject" label="Subject" required />
          <Field name="phone" label="Phone" />
          <Field name="qualification" label="Qualification" />
        </div>
        <div className="flex gap-3 pt-2">
          <button className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm">Save Teacher</button>
          <Link href="/teachers" className="px-4 py-2 rounded-lg border border-slate-200 text-sm">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

function Field({ name, label, required }: { name: string; label: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-600">{label}</span>
      <input name={name} required={required}
        className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none" />
    </label>
  );
}
