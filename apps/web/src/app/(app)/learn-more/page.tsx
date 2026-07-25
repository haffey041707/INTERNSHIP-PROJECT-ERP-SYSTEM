import Link from 'next/link';
import { requireCurrentInstitutionSuite } from '@/lib/current-institution-suite';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  Library,
  ShieldCheck,
  Users,
  Wallet,
} from 'lucide-react';

const modules = [
  {
    icon: <Users size={18} />,
    title: 'Student lifecycle',
    text: 'Admissions, learner profiles, sections, guardians, documents, attendance history, and academic progress stay connected in one record.',
  },
  {
    icon: <GraduationCap size={18} />,
    title: 'Academic operations',
    text: 'Classes, programmes, submissions, examinations, certificates, training, internships, schedules, and results are managed with clear workflows.',
  },
  {
    icon: <Wallet size={18} />,
    title: 'Finance control',
    text: 'Invoices, fee collection, pending balances, payment records, and revenue views help administrators understand financial movement quickly.',
  },
  {
    icon: <Building2 size={18} />,
    title: 'Campus services',
    text: 'Transport, hostel, library, support, community, and help centre sections give each service a dedicated operational workspace.',
  },
];

const workflow = [
  'Create the institution profile and academic structure.',
  'Add learners, staff, classes, programmes, and service records.',
  'Run attendance, fees, exams, submissions, and certificate workflows.',
  'Use dashboard analytics to track progress, revenue, and activity.',
];

export default async function LearnMorePage() {
  const suite = await requireCurrentInstitutionSuite();
  const heroImage =
    suite.type === 'INSTITUTE'
      ? { src: '/images/institute-learn-more-workspace.png?v=1', alt: 'Institute ERP workspace' }
      : suite.type === 'SCHOOL'
        ? { src: '/images/school-learn-more-workspace.png?v=1', alt: 'School ERP workspace' }
        : suite.type === 'COLLEGE'
          ? { src: '/images/college-learn-more-workspace.png?v=1', alt: 'College ERP workspace' }
          : { src: '/images/university-learn-more-workspace.png?v=1', alt: 'University ERP workspace' };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 xl:grid-cols-[minmax(0,.86fr)_minmax(420px,.74fr)]">
          <div className="p-5 sm:p-7">
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
              <ArrowLeft size={15} /> Back to dashboard
            </Link>
            <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-brand-600">EduNexus ERP system</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl">
              A complete institution management platform for modern education operations.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
              EduNexus brings academic, administrative, financial, and campus-service work into one professional ERP experience. It is designed for schools, colleges, universities, and institutes that need clean workflows, connected records, and clear reporting.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/students" className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700">
                Open records <ArrowRight size={15} />
              </Link>
              <Link href="/dashboard" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-white">
                View dashboard
              </Link>
            </div>
          </div>
          <div className="learn-more-hero-visual relative overflow-hidden border-t border-slate-200 bg-[#0F172A] p-3 xl:border-l xl:border-t-0">
            <img
              src={heroImage.src}
              alt={heroImage.alt}
              className="learn-more-hero-image block h-auto w-full object-contain object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/70 via-slate-950/25 to-transparent" />
            <div className="learn-more-image-caption absolute bottom-5 left-5 right-5 rounded-xl border border-white/20 bg-slate-950/45 p-4 text-white backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/80">Professional ERP workspace</p>
              <p className="mt-1 text-sm font-bold">One system for daily {suite.shortTitle.toLowerCase()} control.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <Metric icon={<ShieldCheck size={18} />} label="Secure access" value="Role based" />
        <Metric icon={<BarChart3 size={18} />} label="Live analytics" value="Dashboard ready" />
        <Metric icon={<CalendarDays size={18} />} label="Daily workflows" value="2-3 clicks" />
        <Metric icon={<FileCheck2 size={18} />} label="Documents" value="Organized" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {modules.map((item) => (
          <div key={item.title} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">{item.icon}</span>
            <h2 className="mt-4 text-lg font-extrabold text-slate-950">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">How it works</p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-950">Clear setup, clean operation, useful reporting.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              The system is arranged around the work an institution does every day, so users can move from setup to live operation without searching through cluttered screens.
            </p>
          </div>
          <div className="grid gap-3">
            {workflow.map((item, index) => (
              <div key={item} className="flex min-w-0 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-600 text-xs font-bold text-white">{index + 1}</span>
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-slate-900">{item}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Designed to keep data connected and actions simple.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-[#0F172A] p-5 text-white shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-200">Ready workspace</p>
            <h2 className="mt-1 text-2xl font-extrabold">Continue managing your institution.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Return to the dashboard to view analytics, create records, and operate your ERP modules.
            </p>
          </div>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
            Go to dashboard <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">{icon}</span>
      <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-extrabold text-slate-950">{value}</p>
    </div>
  );
}
