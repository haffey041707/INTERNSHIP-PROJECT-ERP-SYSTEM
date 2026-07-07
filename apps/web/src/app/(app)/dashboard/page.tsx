import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Users, GraduationCap, School, CheckSquare, FileText,
  UserPlus, ArrowUpRight, ArrowRight, CircleDollarSign, TrendingUp, Wallet, Award, Check,
} from 'lucide-react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { money, longDate, daysSince, lastDays } from '@/lib/format';
import { ensureStudentSections } from '@/lib/academic-structure';
import { getInstitutionSuiteForType, slugifyFeature } from '@/lib/institution-suites';
import { getInstitutionTerminology } from '@/lib/institution-terminology';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = getSession();
  if (!session) redirect('/login');

  const institutionId = session.institutionId;
  const today = new Date().toISOString().slice(0, 10);
  const days = lastDays(7);
  await ensureStudentSections(institutionId);

  const [
    institution, students, teachers, classes, sections, exams, invoiceCount, attendanceCount,
    presentToday, totalToday, invoiceAgg, paidAgg, recentStudents, recentPayments, trendRows, marks,
  ] = await Promise.all([
    db.institution.findUnique({ where: { id: institutionId } }),
    db.student.count({ where: { institutionId } }),
    db.teacher.count({ where: { institutionId } }),
    db.schoolClass.count({ where: { institutionId } }),
    db.section.count({ where: { institutionId } }),
    db.exam.count({ where: { institutionId } }),
    db.feeInvoice.count({ where: { institutionId } }),
    db.attendanceRecord.count({ where: { institutionId } }),
    db.attendanceRecord.count({ where: { institutionId, date: today, status: 'PRESENT' } }),
    db.attendanceRecord.count({ where: { institutionId, date: today } }),
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
  ]);

  const currency = institution?.currency ?? 'USD';
  const attendancePct = totalToday ? Math.round((presentToday / totalToday) * 100) : 0;
  const billed = invoiceAgg._sum.amountCents ?? 0;
  const collected = paidAgg._sum.paidCents ?? 0;
  const outstanding = billed - collected;
  const collectedPct = billed ? Math.round((collected / billed) * 100) : 0;
  const avgScore = marks.length
    ? Math.round(marks.reduce((n, m) => n + (m.score / (m.exam.maxMarks || 100)) * 100, 0) / marks.length)
    : null;

  const trend = days.map((date) => {
    const total = trendRows.filter((r) => r.date === date).reduce((n, r) => n + r._count._all, 0);
    const present = trendRows.find((r) => r.date === date && r.status === 'PRESENT')?._count._all ?? 0;
    return { date, pct: total ? Math.round((present / total) * 100) : 0, has: total > 0 };
  });

  const suite = getInstitutionSuiteForType(institution?.type);
  const suiteModule = suite.href.replace(/^\//, '');
  const terms = getInstitutionTerminology(institution?.type);

  // onboarding state (drives the new-institution experience)
  const steps = [
    { done: classes > 0 && sections > 0, label: terms.setupStructure, href: '/classes' },
    { done: students > 0, label: `Add your first ${terms.learner.toLowerCase()}`, href: '/students/new' },
    { done: teachers > 0, label: terms.addEducator, href: '/teachers/new' },
    { done: attendanceCount > 0, label: 'Mark attendance', href: '/attendance' },
    { done: exams > 0, label: `Create ${terms.examLabel.toLowerCase().replace(/s$/, '')}`, href: '/exams/new' },
    { done: invoiceCount > 0, label: 'Issue a fee invoice', href: '/fees' },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const setupComplete = doneCount === steps.length;

  // unified recent-activity feed
  const activity = [
    ...recentStudents.map((s) => ({ at: s.createdAt, text: `${terms.learner} added: ${s.firstName} ${s.lastName}`, tag: 'Enrollment' })),
    ...recentPayments.map((p) => ({ at: p.paidAt, text: `Fee collected from ${p.invoice.student.firstName} ${p.invoice.student.lastName} (${money(p.amountCents, currency)})`, tag: 'Payment' })),
  ].sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="premium-home-hero flex flex-wrap items-end justify-between gap-3 rounded-2xl p-5 text-white">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Welcome back, {session.name}</h1>
          <p className="text-white/75 text-sm">
            {institution?.name} · ID {institution?.code} · Member since {institution ? longDate(institution.createdAt) : '—'}
            {institution && <> · Day {daysSince(institution.createdAt)}</>}
          </p>
        </div>
        <Link href="/students/new" className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-white/15 text-white border border-white/25 hover:bg-white/20">
          <UserPlus size={16} /> {terms.addLearner}
        </Link>
      </div>

      {/* Onboarding (new institutions) */}
      {!setupComplete && (
        <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-900">{terms.setupTitle}</h2>
            <span className="text-sm text-slate-500">{doneCount}/{steps.length} complete</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-4">
            <div className="h-full bg-aurora" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {steps.map((s) => (
              <Link key={s.label} href={s.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition
                  ${s.done ? 'border-green-200 bg-green-50 text-slate-500' : 'border-slate-200 hover:border-brand-400 text-slate-700'}`}>
                <span className={`grid place-items-center w-5 h-5 rounded-full shrink-0 ${s.done ? 'bg-success text-white' : 'border border-slate-300'}`}>
                  {s.done && <Check size={12} />}
                </span>
                <span>{s.label}</span>
                {!s.done && <ArrowRight size={14} className="ml-auto text-slate-300" />}
              </Link>
            ))}
          </div>
        </div>
      )}

      <section className="rounded-2xl glass border border-white/20 p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">{suite.eyebrow}</p>
            <h2 className="text-xl font-extrabold text-slate-900">{suite.title} command center</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-500">
              {suite.description}
            </p>
          </div>
          <Link href={suite.href} className="flex items-center gap-1.5 rounded-lg bg-aurora px-3 py-2 text-sm font-medium text-white">
            Open {suite.shortTitle} <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-4 grid md:grid-cols-2 xl:grid-cols-4 gap-3 stagger">
          {suite.sections.map((section) => (
            <div key={section.title} className="rounded-xl border border-white/15 bg-white/10 p-4 shadow-sm">
              <h3 className="font-semibold text-slate-900">{section.title}</h3>
              <div className="mt-3 space-y-2">
                {section.items.map((item) => (
                  <Link
                    key={item}
                    href={`/modules/${suiteModule}/${slugifyFeature(item)}`}
                    className="group flex items-center gap-2 rounded-lg border border-white/15 bg-slate-50 px-3 py-2 text-sm"
                  >
                    <span className="h-2 w-2 rounded-full bg-aurora shrink-0" />
                    <span className="text-slate-700">{item}</span>
                    <ArrowRight size={14} className="ml-auto text-slate-400 opacity-0 transition group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {suite.highlights.map((item) => (
            <Link
              key={item}
              href={`/modules/${suiteModule}/${slugifyFeature(item)}`}
              className="rounded-full border border-white/15 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
            >
              {item}
            </Link>
          ))}
        </div>
      </section>

      {/* KPI cards — clickable, live */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <Kpi href="/students" label={terms.learners} value={String(students)} sub={`${sections} ${terms.sections.toLowerCase()}`} icon={<Users size={18} />} accent />
        <Kpi href="/teachers" label={terms.educators} value={String(teachers)} sub={`${classes} ${terms.groups.toLowerCase()}`} icon={<GraduationCap size={18} />} />
        <Kpi href="/attendance" label={terms.attendanceLabel} value={totalToday ? `${attendancePct}%` : '—'} sub={totalToday ? `${presentToday}/${totalToday} present` : 'not taken yet'} icon={<CheckSquare size={18} />} />
        <Kpi href="/exams" label={terms.resultLabel} value={avgScore !== null ? `${avgScore}%` : '—'} sub={`${exams} ${terms.examLabel.toLowerCase()}`} icon={<Award size={18} />} />
        <Kpi href="/fees" label={terms.feeLabel} value={billed ? `${collectedPct}%` : '—'} sub={money(collected, currency)} icon={<CircleDollarSign size={18} />} />
        <Kpi href="/fees" label={terms.outstandingLabel} value={money(outstanding, currency)} sub={`${invoiceCount} invoices`} icon={<Wallet size={18} />} />
        <Kpi href="/classes" label={terms.groups} value={String(classes)} sub={`${sections} ${terms.sections.toLowerCase()}`} icon={<School size={18} />} />
        <Kpi href="/exams" label={terms.examLabel} value={String(exams)} sub="published" icon={<FileText size={18} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: trend + recent students */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl p-5 bg-white shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2"><TrendingUp size={18} className="text-brand-600" /> Attendance trend (last 7 days)</h2>
            </div>
            {trend.some((t) => t.has) ? (
              <div className="h-40 flex items-end gap-2">
                {trend.map((t) => (
                  <div key={t.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-400">{t.has ? `${t.pct}%` : '—'}</span>
                    <div className="w-full rounded-t-md bg-aurora" style={{ height: `${Math.max(t.pct, 3)}%` }} title={`${t.date}: ${t.pct}%`} />
                    <span className="text-[10px] text-slate-400">{t.date.slice(5)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyHint icon={<CheckSquare size={20} />} text="No attendance recorded yet." cta="Mark attendance" href="/attendance" />
            )}
          </div>

          <div className="rounded-xl p-5 bg-white shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Recently added {terms.learners.toLowerCase()}</h2>
              <Link href="/students" className="text-sm text-brand-600 flex items-center gap-1">View all <ArrowRight size={14} /></Link>
            </div>
            {recentStudents.length ? (
              <table className="w-full text-sm">
                <thead className="text-left text-slate-400"><tr><th className="py-2">{terms.idLabel}</th><th>Name</th><th>{terms.section}</th><th>Status</th></tr></thead>
                <tbody>
                  {recentStudents.map((s) => (
                    <tr key={s.id} className="border-t border-slate-100">
                      <td className="py-2 font-mono text-xs">{s.admissionNo}</td>
                      <td><Link href={`/students/${s.id}`} className="hover:text-brand-600">{s.firstName} {s.lastName}</Link></td>
                      <td>{s.section ? `${s.section.schoolClass.name} · ${s.section.name}` : '—'}</td>
                      <td><span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-success">{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyHint icon={<UserPlus size={20} />} text={`No ${terms.learners.toLowerCase()} yet.`} cta={`Add your first ${terms.learner.toLowerCase()}`} href="/students/new" />
            )}
          </div>
        </div>

        {/* Right: fee summary + activity */}
        <div className="space-y-4">
          <div className="rounded-xl p-5 glass shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-3">Fee collection</h2>
            <div className="flex items-center gap-4">
              <Donut pct={collectedPct} />
              <div className="text-sm space-y-1">
                <p className="text-slate-500">Collected</p>
                <p className="font-bold text-slate-900">{money(collected, currency)}</p>
                <p className="text-slate-500 mt-2">Outstanding</p>
                <p className="font-bold text-warning">{money(outstanding, currency)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-5 bg-white shadow-sm border border-slate-200">
            <h2 className="font-semibold text-slate-900 mb-3">Recent activity</h2>
            {activity.length ? (
              <ul className="space-y-3 text-sm">
                {activity.map((a, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-0.5 w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                    <div>
                      <p className="text-slate-700">{a.text}</p>
                      <p className="text-xs text-slate-400">{a.tag} · {longDate(a.at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">Activity will appear here as you use the system.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ href, label, value, sub, icon, accent }:
  { href: string; label: string; value: string; sub?: string; icon: React.ReactNode; accent?: boolean }) {
  return (
    <Link href={href}
      className={`group card-hover rounded-xl p-4 shadow-sm ${accent ? 'premium-kpi-accent bg-aurora text-white' : 'premium-kpi glass'}`}>
      <div className="flex items-center justify-between">
        <span className={`grid place-items-center w-9 h-9 rounded-lg ${accent ? 'bg-white/20' : 'bg-brand-50 text-brand-600'}`}>{icon}</span>
        <ArrowUpRight size={16} className={`opacity-0 group-hover:opacity-100 transition ${accent ? 'text-white/80' : 'text-slate-400'}`} />
      </div>
      <p className={`text-sm mt-3 ${accent ? 'text-white/80' : 'text-slate-500'}`}>{label}</p>
      <div className="text-2xl font-extrabold">{value}</div>
      {sub && <p className={`text-xs mt-0.5 ${accent ? 'text-white/70' : 'text-slate-400'}`}>{sub}</p>}
    </Link>
  );
}

function Donut({ pct }: { pct: number }) {
  const r = 28, c = 2 * Math.PI * r;
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" className="shrink-0">
      <circle cx="38" cy="38" r={r} fill="none" stroke="#E2E8F0" strokeWidth="9" />
      <circle cx="38" cy="38" r={r} fill="none" stroke="var(--theme-accent)" strokeWidth="9" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} transform="rotate(-90 38 38)" />
      <text x="38" y="43" textAnchor="middle" className="fill-slate-900 font-bold" fontSize="16">{pct}%</text>
    </svg>
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
