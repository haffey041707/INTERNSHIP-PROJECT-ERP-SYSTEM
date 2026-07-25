import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, BookOpen, GraduationCap, Search, Users } from 'lucide-react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

const helpGuides = [
  {
    title: 'Reset password or recover account access',
    category: 'Account & Settings',
    href: '/forgot-password',
    summary: 'Use the password reset flow, verify your email, and return to login with the new password.',
    steps: ['Open Forgot password', 'Enter your account email', 'Use the reset link or code', 'Sign in again'],
    keywords: ['reset', 'password', 'forgot', 'recover', 'login', 'account', 'access'],
  },
  {
    title: 'Create a new account',
    category: 'Getting Started',
    href: '/signup',
    summary: 'Register a new institution admin account and complete the first setup details.',
    steps: ['Open Create account', 'Add institution details', 'Set email and password', 'Continue to dashboard'],
    keywords: ['create', 'account', 'signup', 'sign up', 'register', 'new account', 'institution'],
  },
  {
    title: 'Fix Google login issues',
    category: 'Account & Settings',
    href: '/modules/help-centre/google-login-troubleshooting',
    summary: 'Check account creation, allowed email access, Google callback settings, and blocked login messages.',
    steps: ['Confirm the account exists', 'Use the same Google email', 'Check blocked or callback errors', 'Try normal email login if needed'],
    keywords: ['google', 'gmail', 'oauth', 'blocked', 'callback', 'login issue', 'sign in'],
  },
  {
    title: 'Payment failed or amount deducted',
    category: 'Payments & Billing',
    href: '/modules/help-centre/payment-failed',
    summary: 'Review payment status, receipt generation, retry rules, and what to check when a payment fails.',
    steps: ['Open Payments', 'Search the invoice', 'Check status and receipt', 'Contact support with transaction ID'],
    keywords: ['payment', 'failed', 'billing', 'fee', 'fees', 'invoice', 'receipt', 'deducted'],
  },
  {
    title: 'Download or verify a certificate',
    category: 'Certificates',
    href: '/certificates',
    summary: 'Find released certificates, verify certificate status, and download the final document.',
    steps: ['Open Certificates', 'Search student or programme', 'Check release status', 'Download or verify'],
    keywords: ['certificate', 'certificates', 'download', 'verify', 'release', 'award'],
  },
  {
    title: 'Submit a task or assignment',
    category: 'Submissions',
    href: '/submissions',
    summary: 'Upload work, attach required documents, and track review status from submission to approval.',
    steps: ['Open Submissions', 'Choose programme or task', 'Upload required files', 'Submit for review'],
    keywords: ['submit', 'submission', 'task', 'assignment', 'upload task', 'evaluation', 'review'],
  },
  {
    title: 'Upload documents',
    category: 'Documents',
    href: '/documents',
    summary: 'Store admission files, profile documents, certificates, and institution records safely.',
    steps: ['Open Documents', 'Choose document type', 'Upload file', 'Attach it to the correct profile'],
    keywords: ['upload', 'document', 'documents', 'file', 'files', 'profile document'],
  },
  {
    title: 'Track internship approval',
    category: 'Internship',
    href: '/internship',
    summary: 'Follow internship applications, mentor review, approval status, tasks, and completion progress.',
    steps: ['Open Internship', 'Select application', 'Review approval stage', 'Complete pending requirements'],
    keywords: ['internship', 'approval', 'training', 'mentor', 'application', 'status'],
  },
  {
    title: 'Contact support',
    category: 'Support',
    href: '/support',
    summary: 'Send a support request with issue type, priority, screenshots, and account details.',
    steps: ['Open Support', 'Select issue type', 'Add clear details', 'Submit and track response'],
    keywords: ['support', 'contact', 'help', 'issue', 'problem', 'report'],
  },
  {
    title: 'Change profile or institution settings',
    category: 'Settings',
    href: '/settings',
    summary: 'Update institution profile, account details, brand settings, and system preferences.',
    steps: ['Open Settings', 'Choose the profile section', 'Update details', 'Save changes'],
    keywords: ['profile', 'settings', 'change', 'institution name', 'email', 'brand', 'preferences'],
  },
];

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const institutionId = getSession()!.institutionId;
  const q = (searchParams.q ?? '').trim();
  const guideResults = q ? findHelpGuides(q) : [];

  const [students, teachers] = q
    ? await Promise.all([
        db.student.findMany({
          where: { institutionId, OR: [{ firstName: { contains: q } }, { lastName: { contains: q } }, { admissionNo: { contains: q } }] },
          include: { section: true }, take: 25,
        }),
        db.teacher.findMany({
          where: { institutionId, OR: [{ name: { contains: q } }, { email: { contains: q } }, { subject: { contains: q } }] },
          take: 25,
        }),
      ])
    : [[], []];

  const total = students.length + teachers.length + guideResults.length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Search</h1>
        <p className="text-slate-500 text-sm">{q ? `${total} result${total === 1 ? '' : 's'} for "${q}"` : 'Search students, staff, and help guides.'}</p>
      </div>

      <form action="/search" className="flex items-center gap-2 max-w-lg px-3 py-2 rounded-lg bg-white border border-slate-200">
        <Search size={16} className="text-slate-400" />
        <input name="q" defaultValue={q} placeholder="Search reset password, certificates, students..." autoFocus
          className="bg-transparent text-sm text-slate-900 outline-none w-full" />
      </form>

      {q && total === 0 && <p className="text-slate-400">No matches found.</p>}

      {guideResults.length > 0 && (
        <Section title="Help Guides" icon={<BookOpen size={16} />} count={guideResults.length}>
          <div className="grid gap-3 p-3 md:grid-cols-2">
            {guideResults.map((guide) => (
              <Link key={guide.title} href={guide.href} className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">{guide.category}</p>
                    <h2 className="mt-1 text-sm font-extrabold text-slate-950">{guide.title}</h2>
                  </div>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                    <ArrowRight size={15} />
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{guide.summary}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {guide.steps.slice(0, 3).map((step) => (
                    <span key={step} className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">{step}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {students.length > 0 && (
        <Section title="Students" icon={<Users size={16} />} count={students.length}>
          {students.map((s) => (
            <Link key={s.id} href={`/students/${s.id}`} className="flex min-w-0 flex-col gap-1 px-4 py-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-0 sm:flex-row sm:items-center sm:justify-between">
              <span className="truncate text-sm text-slate-800">{s.firstName} {s.lastName}</span>
              <span className="truncate text-xs text-slate-400">{s.admissionNo} · {s.section?.name ?? '—'}</span>
            </Link>
          ))}
        </Section>
      )}

      {teachers.length > 0 && (
        <Section title="Teachers" icon={<GraduationCap size={16} />} count={teachers.length}>
          {teachers.map((t) => (
            <Link key={t.id} href="/teachers" className="flex min-w-0 flex-col gap-1 px-4 py-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-0 sm:flex-row sm:items-center sm:justify-between">
              <span className="truncate text-sm text-slate-800">{t.name}</span>
              <span className="truncate text-xs text-slate-400">{t.subject} · {t.email}</span>
            </Link>
          ))}
        </Section>
      )}
    </div>
  );
}

function findHelpGuides(query: string) {
  const normalized = query.toLowerCase();
  const tokens = normalized.split(/\s+/).filter(Boolean);

  return helpGuides
    .map((guide) => {
      const haystack = [guide.title, guide.category, guide.summary, ...guide.steps, ...guide.keywords].join(' ').toLowerCase();
      const exact = haystack.includes(normalized) ? 3 : 0;
      const score = exact + tokens.reduce((sum, token) => sum + (haystack.includes(token) ? 1 : 0), 0);
      return { guide, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.guide)
    .slice(0, 8);
}

function Section({ title, icon, count, children }: { title: string; icon: ReactNode; count: number; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 bg-slate-50 flex items-center gap-2 text-sm font-semibold text-slate-700">{icon} {title} <span className="text-slate-400 font-normal">({count})</span></div>
      {children}
    </div>
  );
}
