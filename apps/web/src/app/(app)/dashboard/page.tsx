import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Users, Briefcase, FileText,
  UserPlus, ArrowUpRight, ArrowRight, CircleDollarSign,
} from 'lucide-react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { money, longDate, daysSince, lastDays } from '@/lib/format';
import { ensureStudentSections } from '@/lib/academic-structure';
import { getInstitutionSuiteForType } from '@/lib/institution-suites';
import { getInstitutionTerminology } from '@/lib/institution-terminology';
import { DashboardVisuals } from '@/components/DashboardVisuals';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = getSession();
  if (!session) redirect('/login');

  const institutionId = session.institutionId;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const days = lastDays(7);
  await ensureStudentSections(institutionId);

  const [
    institution, students, sections, invoiceAgg, paidAgg, recentStudents, recentPayments, trendRows, marks,
    learnerRows, invoiceRows, moduleStatusRows, todayCollectionAgg, totalInternships, totalPrograms,
  ] = await Promise.all([
    db.institution.findUnique({ where: { id: institutionId } }),
    db.student.count({ where: { institutionId } }),
    db.section.count({ where: { institutionId } }),
    db.feeInvoice.aggregate({ where: { institutionId }, _sum: { amountCents: true } }),
    db.feeInvoice.aggregate({ where: { institutionId }, _sum: { paidCents: true } }),
    db.student.findMany({
      where: { institutionId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { section: { include: { schoolClass: true } } },
    }),
    db.payment.findMany({ where: { institutionId }, orderBy: { paidAt: 'desc' }, take: 5, include: { invoice: { include: { student: true } } } }),
    db.attendanceRecord.groupBy({ by: ['date', 'status'], where: { institutionId, date: { in: days } }, _count: { _all: true } }),
    db.mark.findMany({ where: { institutionId }, include: { exam: { select: { maxMarks: true } } }, take: 2000 }),
    db.student.findMany({ where: { institutionId }, select: { createdAt: true, status: true }, take: 5000 }),
    db.feeInvoice.findMany({ where: { institutionId }, select: { amountCents: true, paidCents: true, status: true, createdAt: true }, take: 5000 }),
    db.moduleRecord.groupBy({ by: ['status'], where: { institutionId }, _count: { _all: true } }),
    db.payment.aggregate({ where: { institutionId, paidAt: { gte: todayStart, lt: tomorrowStart } }, _sum: { amountCents: true } }),
    db.moduleRecord.count({ where: { institutionId, module: 'internship' } }),
    db.moduleRecord.count({ where: { institutionId, module: 'programmes' } }),
  ]);

  const currency = institution?.currency ?? 'USD';
  const billed = invoiceAgg._sum.amountCents ?? 0;
  const collected = paidAgg._sum.paidCents ?? 0;
  const todayCollections = todayCollectionAgg._sum.amountCents ?? 0;
  const collectedPct = billed ? Math.round((collected / billed) * 100) : 0;

  const trend = days.map((date) => {
    const total = trendRows.filter((r) => r.date === date).reduce((n, r) => n + r._count._all, 0);
    const present = trendRows.find((r) => r.date === date && r.status === 'PRESENT')?._count._all ?? 0;
    const absent = trendRows.find((r) => r.date === date && r.status === 'ABSENT')?._count._all ?? 0;
    const late = trendRows.find((r) => r.date === date && r.status === 'LATE')?._count._all ?? 0;
    return { date: date.slice(5), pct: total ? Math.round((present / total) * 100) : 0, present, absent, late, has: total > 0 };
  });

  const suite = getInstitutionSuiteForType(institution?.type);
  const terms = getInstitutionTerminology(institution?.type);
  const dashboardBanner =
    suite.type === 'INSTITUTE'
      ? { src: '/images/institute-dashboard-banner.png', alt: 'Modern institute training center ERP dashboard banner' }
      : suite.type === 'SCHOOL'
        ? { src: '/images/school-dashboard-banner.png', alt: 'Modern school campus ERP dashboard banner' }
      : suite.type === 'COLLEGE'
      ? { src: '/images/college-dashboard-banner.png', alt: 'Modern college campus ERP dashboard banner' }
      : suite.type === 'UNIVERSITY'
        ? { src: '/images/university-dashboard-banner.png', alt: 'Modern university campus ERP dashboard banner' }
        : { src: '/images/dashboard-erp-banner.png', alt: 'Modern institution ERP dashboard banner' };
  const learnMoreImage =
    suite.type === 'INSTITUTE'
      ? { src: '/images/institute-learn-more-workspace.png?v=1', alt: 'Institute ERP workspace' }
      : suite.type === 'SCHOOL'
        ? { src: '/images/school-learn-more-workspace.png?v=1', alt: 'School ERP workspace' }
        : suite.type === 'COLLEGE'
          ? { src: '/images/college-learn-more-workspace.png?v=1', alt: 'College ERP workspace' }
          : { src: '/images/university-learn-more-workspace.png?v=1', alt: 'University ERP workspace' };
  const monthKeys = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));
    return {
      key: date.toISOString().slice(0, 7),
      label: date.toLocaleString('en-US', { month: 'short' }),
    };
  });
  const learnerGrowth = monthKeys.map((month) => ({
    label: month.label,
    count: learnerRows.filter((student) => student.createdAt.toISOString().slice(0, 7) === month.key).length,
  }));
  const financeTrend = monthKeys.map((month) => {
    const rows = invoiceRows.filter((invoice) => invoice.createdAt.toISOString().slice(0, 7) === month.key);
    return {
      label: month.label,
      billed: Math.round(rows.reduce((sum, invoice) => sum + invoice.amountCents, 0) / 100),
      collected: Math.round(rows.reduce((sum, invoice) => sum + invoice.paidCents, 0) / 100),
    };
  });
  const feeStatus = ['PAID', 'PARTIAL', 'PENDING'].map((status) => ({
    name: status.charAt(0) + status.slice(1).toLowerCase(),
    value: invoiceRows.filter((invoice) => invoice.status === status).length,
  }));
  const performanceBands = [
    { range: '90-100', min: 90, max: 101 },
    { range: '75-89', min: 75, max: 90 },
    { range: '60-74', min: 60, max: 75 },
    { range: '<60', min: 0, max: 60 },
  ].map((band) => ({
    range: band.range,
    count: marks.filter((mark) => {
      const pct = (mark.score / (mark.exam.maxMarks || 100)) * 100;
      return pct >= band.min && pct < band.max;
    }).length,
  }));
  const workspaceStatus = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'CLOSED'].map((status) => ({
    name: status.replace('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()),
    value: moduleStatusRows.find((row) => row.status === status)?._count._all ?? 0,
  }));

  // unified recent-activity feed
  const activity = [
    ...recentStudents.map((s) => ({ at: s.createdAt, text: `${terms.learner} added: ${s.firstName} ${s.lastName}`, tag: 'Enrollment' })),
    ...recentPayments.map((p) => ({ at: p.paidAt, text: `Fee collected from ${p.invoice.student.firstName} ${p.invoice.student.lastName} (${money(p.amountCents, currency)})`, tag: 'Payment' })),
  ].sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 6);

  return (
    <div className="space-y-4">
      <section className="dashboard-banner-panel relative overflow-hidden rounded-none border border-white/20 shadow-sm">
        <img
          src={dashboardBanner.src}
          alt={dashboardBanner.alt}
          className="dashboard-main-banner h-36 w-full object-cover object-center sm:h-44 lg:h-52"
        />
        <div className="absolute inset-0 flex items-end justify-between gap-3 p-4 sm:p-5">
          <div className="max-w-2xl">
            <p
              className="text-xs font-semibold uppercase tracking-widest text-cyan-100"
              style={{ textShadow: '0 0 18px rgba(103,232,249,.8), 0 3px 18px rgba(2,6,23,.75)' }}
            >
              {suite.shortTitle} workspace
            </p>
            <h1
              className="mt-1 text-xl font-extrabold text-white sm:text-3xl"
              style={{ textShadow: '0 0 26px rgba(255,255,255,.6), 0 8px 30px rgba(2,6,23,.9)' }}
            >
              Welcome back, {session.name}
            </h1>
            <p
              className="mt-1 text-xs font-medium text-white/90 sm:text-sm"
              style={{ textShadow: '0 0 18px rgba(255,255,255,.35), 0 4px 20px rgba(2,6,23,.9)' }}
            >
              {institution?.name} · ID {institution?.code} · Member since {institution ? longDate(institution.createdAt) : '—'}
              {institution && <> · Day {daysSince(institution.createdAt)}</>}
            </p>
          </div>
          <Link
            href="/students/new"
            className="hidden items-center gap-1.5 rounded-lg border border-white/30 bg-white/15 px-3 py-2 text-sm font-semibold text-white shadow-[0_0_24px_rgba(255,255,255,.2)] backdrop-blur-sm hover:bg-white/20 sm:flex"
          >
            <UserPlus size={16} /> {terms.addLearner}
          </Link>
        </div>
      </section>

      {/* KPI cards — clickable, live */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 stagger">
        <Kpi href="/students" label="Total Students" value={String(students)} sub={`${sections} ${terms.sections.toLowerCase()}`} icon={<Users size={18} />} accent />
        <Kpi href="/internship" label="Total Internships" value={String(totalInternships)} sub="active records" icon={<Briefcase size={18} />} />
        <Kpi href="/fees" label="Today's Collections" value={money(todayCollections, currency)} sub="payments today" icon={<CircleDollarSign size={18} />} />
        <Kpi href="/programmes" label="Total Programs" value={String(totalPrograms)} sub="programme records" icon={<FileText size={18} />} />
      </div>

      <DashboardVisuals
        attendance={trend}
        finance={financeTrend}
        growth={learnerGrowth}
        performance={performanceBands}
        feeStatus={feeStatus}
        workspaceStatus={workspaceStatus}
        collectedPct={collectedPct}
      />

      <section className="grid items-stretch gap-3 lg:grid-cols-2">
        <div className="dashboard-learn-card h-full overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
          <div className="grid h-full min-h-0 gap-0 md:grid-cols-[minmax(0,.88fr)_minmax(0,1.12fr)]">
            <div className="p-3.5">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">ERP platform</p>
              <h2 className="mt-1 text-base font-extrabold leading-snug text-slate-950">
                One connected system for modern institution operations.
              </h2>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Manage academics, fees, exams, certificates, transport, hostel, library, and support in a single ERP workspace.
              </p>
              <Link href="/learn-more" className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700">
                Learn more <ArrowRight size={15} />
              </Link>
            </div>
            <div className="dashboard-learn-visual relative grid min-h-60 place-items-center overflow-hidden border-t border-slate-200 bg-[#0F172A] md:min-h-full md:border-l md:border-t-0">
              <img
                src={learnMoreImage.src}
                alt={learnMoreImage.alt}
                className="dashboard-learn-visual-image absolute inset-0 h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/64 via-slate-950/16 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 rounded-lg border border-white/20 bg-white/15 px-2.5 py-2 text-white backdrop-blur-md">
                <p className="text-[11px] font-bold leading-4">{suite.shortTitle} operations workspace.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-full rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Recent movement</p>
              <h2 className="text-base font-extrabold text-slate-950">Activity timeline</h2>
            </div>
            <Link href="/students" className="text-xs font-semibold text-brand-600">Open records</Link>
          </div>
          {activity.length ? (
            <div className="mt-3 grid gap-2">
              {activity.slice(0, 3).map((item, index) => (
                <div key={`${item.text}-${index}`} className="flex min-w-0 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-aurora" />
                  <div className="min-w-0">
                    <p className="break-words text-xs font-semibold leading-5 text-slate-800">{item.text}</p>
                    <p className="mt-1 text-xs text-slate-400">{item.tag} · {longDate(item.at)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyHint icon={<FileText size={20} />} text="Activity will appear here as you use the system." cta="Open dashboard" href="/dashboard" />
          )}
        </div>
      </section>
    </div>
  );
}

function Kpi({ href, label, value, sub, icon, accent }:
  { href: string; label: string; value: string; sub?: string; icon: React.ReactNode; accent?: boolean }) {
  return (
    <Link href={href}
      className={`group card-hover rounded-xl p-3 shadow-sm ${accent ? 'premium-kpi-accent bg-aurora text-white' : 'premium-kpi glass'}`}>
      <div className="flex items-center justify-between">
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${accent ? 'bg-white/20' : 'bg-brand-50 text-brand-600'}`}>{icon}</span>
        <ArrowUpRight size={16} className={`opacity-0 group-hover:opacity-100 transition ${accent ? 'text-white/80' : 'text-slate-400'}`} />
      </div>
      <p className={`mt-2 text-xs ${accent ? 'text-white/80' : 'text-slate-500'}`}>{label}</p>
      <div className="text-xl font-extrabold">{value}</div>
      {sub && <p className={`text-xs mt-0.5 ${accent ? 'text-white/70' : 'text-slate-400'}`}>{sub}</p>}
    </Link>
  );
}

function EmptyHint({ icon, text, cta, href }: { icon: React.ReactNode; text: string; cta: string; href: string }) {
  return (
    <div className="py-8 flex flex-col items-center gap-2 text-center">
      <span className="grid place-items-center w-11 h-11 rounded-full bg-slate-100 text-slate-400">{icon}</span>
      <p className="text-sm text-slate-500">{text}</p>
      <Link href={href} className="text-sm text-brand-600 font-medium">{cta} →</Link>
    </div>
  );
}
