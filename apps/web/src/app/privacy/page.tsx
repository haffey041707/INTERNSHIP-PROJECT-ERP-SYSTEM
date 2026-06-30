import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

const PRIVACY = [
  'Institution data is separated by workspace and scoped to the signed-in institution.',
  'Student, staff, finance, and academic records should only be viewed by authorized users.',
  'Session cookies are used to keep account access secure and connected to the right workspace.',
  'Operational records can be reviewed, corrected, exported, or removed by institution administrators.',
];

export default function PrivacyPage() {
  return (
    <main className="premium-login min-h-screen p-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-white/75 hover:text-white">
          <GraduationCap size={16} /> EduNexus
        </Link>
        <section className="mt-6 rounded-2xl glass border border-white/20 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Legal</p>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
          <p className="mt-3 text-sm text-slate-500">
            This policy explains how the workspace protects and organizes institution records.
          </p>
          <div className="mt-6 space-y-3">
            {PRIVACY.map((item) => (
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
