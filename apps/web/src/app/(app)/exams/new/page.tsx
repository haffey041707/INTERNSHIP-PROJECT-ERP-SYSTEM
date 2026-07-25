import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft, CalendarDays, ClipboardList, FileText, Save, Target } from 'lucide-react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { getInstitutionTerminology } from '@/lib/institution-terminology';
import { createExam } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function NewExamPage() {
  const session = getSession();
  if (!session) redirect('/login');
  const institutionId = session.institutionId;
  const [institution, sections] = await Promise.all([
    db.institution.findUnique({ where: { id: institutionId }, select: { type: true } }),
    db.section.findMany({ where: { institutionId }, orderBy: { name: 'asc' } }),
  ]);
  const terms = getInstitutionTerminology(institution?.type);
  const isInstitute = terms.type === 'INSTITUTE';
  const label = isInstitute ? 'Assessment' : 'Exam';

  async function action(formData: FormData) {
    'use server';
    const id = await createExam(formData);
    redirect(`/exams/${id}`);
  }

  return (
    <div className="erp-form-page space-y-4 sm:space-y-5">
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] p-4 text-white shadow-sm sm:p-5">
        <Link href="/exams" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white sm:text-sm">
          <ArrowLeft size={15} /> Back to {isInstitute ? 'assessments' : 'exams'}
        </Link>
        <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">{isInstitute ? 'Assessment setup' : 'Exam setup'}</p>
            <h1 className="mt-2 break-words text-xl font-extrabold leading-tight sm:text-3xl">New {label}</h1>
            <p className="mt-3 max-w-2xl text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">
              {isInstitute
                ? 'Create a practical test, skill check, trainer assessment, or final evaluation for a course batch.'
                : 'Create an exam schedule with subject, section, maximum marks, and date before entering results.'}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <SetupTile icon={<ClipboardList size={17} />} label="Plan" />
            <SetupTile icon={<Target size={17} />} label="Score" />
            <SetupTile icon={<FileText size={17} />} label="Report" />
          </div>
        </div>
      </section>

      <form action={action} className="w-full max-w-none space-y-4 rounded-2xl border border-white/10 bg-[#0F172A] p-4 text-white shadow-sm sm:max-w-3xl sm:p-6">
        <Field name="name" label={`${label} name`} placeholder={isInstitute ? 'Skill Test 01' : 'Mid-Term'} required />
        <Field name="subject" label={isInstitute ? 'Course / skill' : 'Subject'} placeholder={isInstitute ? 'Web Development' : 'Mathematics'} required />
        <label className="erp-form-field grid w-full min-w-0 gap-1">
          <span className="erp-form-label block text-xs font-semibold text-slate-300 sm:text-sm">{isInstitute ? 'Batch' : terms.section}</span>
          <select name="sectionId" required className="erp-form-control block h-10 w-full min-w-0 rounded-lg border border-white/10 bg-white/8 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-amber-400/40 sm:h-11">
            {sections.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="maxMarks" label="Max marks" type="number" defaultValue="100" required />
          <Field name="date" label="Date" type="date" required />
        </div>
        {sections.length === 0 && (
          <div className="rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">
            Add a {isInstitute ? 'batch' : 'section'} first before creating {label.toLowerCase()} records.
          </div>
        )}
        <div className="grid w-full grid-cols-1 gap-2 pt-2 sm:flex">
          <button disabled={sections.length === 0} className="inline-flex min-h-10 w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-center text-sm font-semibold leading-tight text-white transition disabled:opacity-50 sm:w-auto sm:whitespace-nowrap">
            <Save size={16} className="shrink-0" /> <span>Create &amp; enter marks</span>
          </button>
          <Link href="/exams" className="inline-flex min-h-10 w-full min-w-0 items-center justify-center rounded-xl border border-white/10 bg-white/8 px-4 py-2 text-center text-sm font-semibold leading-tight text-slate-200 transition hover:bg-white/12 sm:w-auto sm:whitespace-nowrap">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

function SetupTile({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/8 p-3 text-center sm:rounded-2xl">
      <span className="mx-auto grid h-9 w-9 place-items-center rounded-xl bg-amber-300/14 text-amber-200">{icon}</span>
      <p className="mt-2 truncate text-[10px] font-bold uppercase tracking-widest text-slate-300 sm:text-xs">{label}</p>
    </div>
  );
}

function Field({ name, label, type = 'text', placeholder, defaultValue, required }:
  { name: string; label: string; type?: string; placeholder?: string; defaultValue?: string; required?: boolean }) {
  return <label className="erp-form-field grid w-full min-w-0 gap-1"><span className="erp-form-label block text-xs font-semibold text-slate-300 sm:text-sm">{label}</span>
    <input name={name} type={type} placeholder={placeholder} defaultValue={defaultValue} required={required}
      className="erp-form-control block h-10 w-full min-w-0 rounded-lg border border-white/10 bg-white/8 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-amber-400/40 sm:h-11" /></label>;
}
