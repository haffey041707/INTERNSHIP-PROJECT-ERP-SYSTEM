import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

const TERMS = [
  'Institutions are responsible for the accuracy of records entered into their workspace.',
  'Access must be limited to authorized staff, administrators, and approved account holders.',
  'Operational data should be used for education management, reporting, and institution services.',
  'Account owners are responsible for user permissions, password security, and workspace activity.',
];

export default function TermsPage() {
  return (
    <main className="premium-login min-h-screen p-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-white/75 hover:text-white">
          <GraduationCap size={16} /> EduNexus
        </Link>
        <section className="mt-6 rounded-2xl glass border border-white/20 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Legal</p>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Terms</h1>
          <p className="mt-3 text-sm text-slate-500">
            These terms outline responsible use of the EduNexus institution workspace.
          </p>
          <div className="mt-6 space-y-3">
            {TERMS.map((item) => (
              <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {item}
              </div>
            ))}
          </div>
          <Link href="/login" className="mt-6 inline-flex rounded-lg bg-aurora px-4 py-2 text-sm font-medium text-white">
            Back to sign in
          </Link>
        </section>
      </div>
    </main>
  );
}
