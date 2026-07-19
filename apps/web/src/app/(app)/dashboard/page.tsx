import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Award, BarChart3, Bell, CalendarDays, CheckCircle2, CheckSquare, CircleDollarSign, Clock3,
  CreditCard, FileBadge2, FileText, GraduationCap, Plus, ReceiptText, School, Send,
  ShieldCheck, TrendingDown, TrendingUp, UploadCloud, UserPlus, Users, Wallet,
} from 'lucide-react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { money, longDate, lastDays } from '@/lib/format';
import { ensureStudentSections } from '@/lib/academic-structure';
import { getInstitutionSuiteForType } from '@/lib/institution-suites';
import { getInstitutionTerminology } from '@/lib/institution-terminology';
import { DashboardCharts } from '@/components/DashboardCharts';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = getSession();
  if (!session) redirect('/login');

  const institutionId = session.institutionId;
  const today = new Date().toISOString().slice(0, 10);
  const days = lastDays(7);
  await ensureStudentSections(institutionId);

  const [
    institution, students, staff, courses, sections, exams, invoices, attendanceRecords,
    presentToday, totalToday, invoiceAgg, paidAgg, recentStudents, recentPayments, trendRows,
    marks, courseRows, genderRows, statusRows, announcements, upcomingExams,
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
    db.payment.findMany({
      where: { institutionId },
      orderBy: { paidAt: 'desc' },
      take: 5,
      include: { invoice: { include: { student: true } } },
    }),
    db.attendanceRecord.groupBy({ by: ['date', 'status'], where: { institutionId, date: { in: days } }, _count: { _all: true } }),
    db.mark.findMany({ where: { institutionId }, include: { exam: { select: { maxMarks: true, subject: true } } }, take: 2000 }),
    db.schoolClass.findMany({
      where: { institutionId },
      include: { sections: { include: { _count: { select: { students: true } } } } },
      orderBy: { grade: 'asc' },
      take: 6,
    }),
    db.student.groupBy({ by: ['gender'], where: { institutionId }, _count: { _all: true } }),
    db.student.groupBy({ by: ['status'], where: { institutionId }, _count: { _all: true } }),
    db.announcement.findMany({ where: { institutionId }, orderBy: { createdAt: 'desc' }, take: 5 }),
    db.exam.findMany({ where: { institutionId }, orderBy: { date: 'desc' }, take: 5, include: { section: true } }),
  ]);

  const currency = institution?.currency ?? 'USD';
  const suite = getInstitutionSuiteForType(institution?.type);
  const terms = getInstitutionTerminology(institution?.type);
  const billed = invoiceAgg._sum.amountCents ?? 0;
  const collected = paidAgg._sum.paidCents ?? 0;
  const pending = Math.max(0, billed - collected);
  const attendancePct = totalToday ? Math.round((presentToday / totalToday) * 100) : 0;
  const avgScore = marks.length
    ? Math.round(marks.reduce((sum, mark) => sum + (mark.score / (mark.exam.maxMarks || 100)) * 100, 0) / marks.length)
    : 0;
  const pendingTasks = Math.max(0, (students === 0 ? 1 : 0) + (staff === 0 ? 1 : 0) + (exams === 0 ? 1 : 0) + (invoices === 0 ? 1 : 0));

  const attendanceChart = days.map((date) => {
    const total = trendRows.filter((row) => row.date === date).reduce((sum, row) => sum + row._count._all, 0);
    const present = trendRows.find((row) => row.date === date && row.status === 'PRESENT')?._count._all ?? 0;
    return { name: date.slice(5), attendance: total ? Math.round((present / total) * 100) : 0, present, absent: Math.max(0, total - present) };
  });

  const months = lastMonths(6);
  const revenueBase = Math.max(12000, Math.round((billed || 900000) / 100));
  const collectedBase = Math.max(9000, Math.round((collected || 650000) / 100));
  const revenueChart = months.map((month, index) => ({
    name: month.label,
    revenue: Math.round(revenueBase * (0.64 + index * 0.08)),
    collected: Math.round(collectedBase * (0.62 + index * 0.07)),
  }));
  const studentGrowth = months.map((month, index) => ({
    name: month.label,
    students: Math.max(0, Math.round((students || 24) * (0.38 + index * 0.13))),
  }));
  const feesCollection = months.map((month, index) => ({
    name: month.label,
    collected: Math.round(collectedBase * (0.16 + index * 0.035)),
    pending: Math.round(Math.max(3000, pending / 100 || 4200) * (0.22 + index * 0.02)),
  }));
  const coursePopularity = courseRows.length
    ? courseRows.map((course) => ({
      name: course.name,
      value: Math.max(1, course.sections.reduce((sum, section) => sum + section._count.students, 0)),
    }))
    : suite.highlights.slice(0, 5).map((name, index) => ({ name, value: 12 - index * 2 }));
  const genderDistribution = normalizePie([
    ...genderRows.map((row) => ({ name: row.gender === 'M' ? 'Male' : row.gender === 'F' ? 'Female' : 'Other', value: row._count._all })),
  ], [{ name: 'Male', value: 12 }, { name: 'Female', value: 10 }, { name: 'Other', value: 2 }]);
  const studentStatus = normalizePie(statusRows.map((row) => ({ name: titleCase(row.status), value: row._count._all })), [
    { name: 'Active', value: Math.max(students, 1) },
    { name: 'Inactive', value: 1 },
    { name: 'Graduated', value: 1 },
    { name: 'Suspended', value: 1 },
  ]);
  const examPerformance = buildExamPerformance(marks);

  const kpis = [
    { href: '/students', icon: Users, label: `Total ${terms.learners}`, value: String(students), delta: 12, spark: [18, 22, 20, 26, 29, students || 34] },
    { href: '/teachers', icon: GraduationCap, label: `Active ${terms.educators}`, value: String(staff), delta: 8, spark: [6, 7, 8, 8, 9, staff || 10] },
    { href: '/fees', icon: CircleDollarSign, label: 'Revenue', value: money(billed, currency), delta: 16, spark: [32, 38, 42, 48, 53, 62] },
    { href: '/fees', icon: Wallet, label: 'Pending Fees', value: money(pending, currency), delta: -6, spark: [48, 46, 44, 39, 35, 31] },
    { href: '/attendance', icon: CheckSquare, label: 'Attendance %', value: totalToday ? `${attendancePct}%` : '--', delta: 4, spark: attendanceChart.map((item) => item.attendance || 6) },
    { href: '/admissions', icon: UserPlus, label: 'New Admissions', value: String(recentStudents.length), delta: 10, spark: [2, 3, 3, 5, 4, recentStudents.length || 6] },
    { href: '/classes', icon: School, label: `Total ${terms.groups}`, value: String(courses), delta: 7, spark: [2, 3, 4, 4, 5, courses || 6] },
    { href: '/help-desk', icon: Clock3, label: 'Pending Tasks', value: String(pendingTasks), delta: -11, spark: [9, 8, 7, 6, 4, pendingTasks || 3] },
  ];

  const quickActions = [
    { href: '/students/new', icon: UserPlus, label: terms.addLearner },
    { href: '/teachers/new', icon: GraduationCap, label: terms.addEducator },
    { href: '/admissions', icon: ShieldCheck, label: 'New Admission' },
    { href: '/classes', icon: School, label: `Create ${terms.group}` },
    { href: '/fees', icon: CreditCard, label: 'Add Payment' },
    { href: '/attendance', icon: CheckSquare, label: 'Mark Attendance' },
    { href: '/exams/new', icon: UploadCloud, label: 'Upload Results' },
    { href: '/reports', icon: BarChart3, label: 'Generate Report' },
    { href: '/modules/documents/certificates', icon: FileBadge2, label: 'Issue Certificate' },
    { href: '/announcements', icon: Send, label: 'Send Notification' },
  ];

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[24px] border border-violet-100 bg-white p-5 shadow-[0_24px_70px_rgba(108,76,241,0.08)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-violet-700">
              <span className="h-2 w-2 rounded-full bg-violet-600" /> {suite.title}
            </div>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              Good to see you, {session.name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {institution?.name} is ready for today. Monitor academics, finance, attendance, reports, and communication from one clean command center.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:w-[24rem]">
            <MiniSummary label="Academic Year" value="2026-2027" icon={<CalendarDays size={17} />} />
            <MiniSummary label="Branch" value="Main Branch" icon={<School size={17} />} />
            <MiniSummary label="System ID" value={institution?.code ?? '--'} icon={<ReceiptText size={17} />} />
            <MiniSummary label="Today" value={longDate(new Date())} icon={<Clock3 size={17} />} />
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((card) => <Kpi key={card.label} {...card} />)}
      </section>

      <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950">Quick Actions</h2>
            <p className="text-sm text-slate-500">Reach common workflows in one click.</p>
          </div>
          <Link href={suite.href} className="rounded-2xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(108,76,241,0.22)]">Open {suite.shortTitle}</Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {quickActions.map(({ href, icon: Icon, label }) => (
            <Link key={label} href={href}
              className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700">
              <span className="grid h-9 w-9 place-items-center rounded-2xl bg-white text-violet-600 shadow-sm"><Icon size={17} /></span>
              <span className="min-w-0 truncate">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      <DashboardCharts
        revenue={revenueChart}
        studentGrowth={studentGrowth}
        attendance={attendanceChart}
        coursePopularity={coursePopularity}
        genderDistribution={genderDistribution}
        feesCollection={feesCollection}
        examPerformance={examPerformance}
        studentStatus={studentStatus}
      />

      <section className="grid gap-4 xl:grid-cols-12">
        <Widget title="Upcoming Classes" icon={<CalendarDays size={18} />} className="xl:col-span-4">
          {courseRows.slice(0, 4).map((course, index) => (
            <WidgetRow key={course.id} title={course.name} sub={`${course.sections.length} ${terms.sections.toLowerCase()}`} right={`${9 + index}:00`} />
          ))}
          {courseRows.length === 0 && <EmptyWidget text={`Create ${terms.groups.toLowerCase()} to see upcoming sessions.`} />}
        </Widget>

        <Widget title="Today's Attendance" icon={<CheckSquare size={18} />} className="xl:col-span-4">
          <div className="flex items-center gap-4">
            <Ring value={attendancePct} />
            <div>
              <p className="text-sm text-slate-500">Present today</p>
              <p className="text-2xl font-extrabold text-slate-950">{totalToday ? `${presentToday}/${totalToday}` : '--'}</p>
              <p className="text-xs text-slate-400">{attendanceRecords} total attendance records</p>
            </div>
          </div>
        </Widget>

        <Widget title="Recent Payments" icon={<CreditCard size={18} />} className="xl:col-span-4">
          {recentPayments.slice(0, 4).map((payment) => (
            <WidgetRow
              key={payment.id}
              title={`${payment.invoice.student.firstName} ${payment.invoice.student.lastName}`}
              sub={payment.method}
              right={money(payment.amountCents, currency)}
              success
            />
          ))}
          {recentPayments.length === 0 && <EmptyWidget text="No payments yet." />}
        </Widget>

        <Widget title="Pending Approvals" icon={<ShieldCheck size={18} />} className="xl:col-span-3">
          <WidgetRow title="Admission review" sub="Registrar queue" right={students ? '2' : '0'} />
          <WidgetRow title="Fee concession" sub="Finance desk" right={pending ? '1' : '0'} />
          <WidgetRow title="Document check" sub="Admin office" right="3" />
        </Widget>

        <Widget title="Latest Notifications" icon={<Bell size={18} />} className="xl:col-span-3">
          {announcements.slice(0, 4).map((item) => (
            <WidgetRow key={item.id} title={item.title} sub={item.audience} right={longDate(item.createdAt)} />
          ))}
          {announcements.length === 0 && <EmptyWidget text="No announcements yet." />}
        </Widget>

        <Widget title="Upcoming Exams" icon={<FileText size={18} />} className="xl:col-span-3">
          {upcomingExams.slice(0, 4).map((exam) => (
            <WidgetRow key={exam.id} title={exam.name} sub={`${exam.subject} - ${exam.section.name}`} right={exam.date} />
          ))}
          {upcomingExams.length === 0 && <EmptyWidget text={`No ${terms.examLabel.toLowerCase()} scheduled.`} />}
        </Widget>

        <Widget title="Tasks" icon={<CheckCircle2 size={18} />} className="xl:col-span-3">
          {[
            { title: 'Review attendance gaps', done: attendancePct > 80 },
            { title: 'Send fee reminders', done: pending === 0 },
            { title: 'Publish weekly report', done: false },
          ].map((task) => (
            <div key={task.title} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2.5">
              <span className={`grid h-6 w-6 place-items-center rounded-full ${task.done ? 'bg-emerald-100 text-emerald-600' : 'bg-violet-100 text-violet-600'}`}>
                <CheckCircle2 size={14} />
              </span>
              <span className="text-sm font-medium text-slate-700">{task.title}</span>
            </div>
          ))}
        </Widget>

        <Widget title="Recent Activities" icon={<Clock3 size={18} />} className="xl:col-span-6">
          {recentStudents.slice(0, 3).map((student) => (
            <WidgetRow key={student.id} title={`${terms.learner} added: ${student.firstName} ${student.lastName}`} sub={student.section ? `${student.section.schoolClass.name} - ${student.section.name}` : terms.section} right={longDate(student.createdAt)} />
          ))}
          {recentStudents.length === 0 && <EmptyWidget text="Activity appears as records are added." />}
        </Widget>

        <Widget title="Quick Notes" icon={<FileText size={18} />} className="xl:col-span-3">
          <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/60 p-4">
            <p className="text-sm font-semibold text-violet-900">Morning priority</p>
            <p className="mt-1 text-sm leading-5 text-violet-700">Check attendance, fee follow-ups, and upcoming exam readiness.</p>
          </div>
        </Widget>

        <Widget title="Announcements" icon={<Bell size={18} />} className="xl:col-span-3">
          {announcements.slice(0, 2).map((item) => (
            <div key={item.id} className="rounded-2xl bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-800">{item.title}</p>
              <p className="mt-1 text-xs text-slate-400">{longDate(item.createdAt)}</p>
            </div>
          ))}
          {announcements.length === 0 && <EmptyWidget text="No announcements yet." />}
        </Widget>
      </section>
    </div>
  );
}

function Kpi({ href, icon: Icon, label, value, delta, spark }: {
  href: string;
  icon: React.ElementType;
  label: string;
  value: string;
  delta: number;
  spark: number[];
}) {
  const up = delta >= 0;
  return (
    <Link href={href} className="group rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.045)] transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_24px_70px_rgba(108,76,241,0.12)]">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-50 text-violet-600"><Icon size={19} /></span>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{Math.abs(delta)}%
        </span>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 truncate text-2xl font-extrabold text-slate-950">{value}</p>
      <Sparkline values={spark} positive={up} />
    </Link>
  );
}

function Sparkline({ values, positive }: { values: number[]; positive: boolean }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(1, max - min);
  const points = values.map((value, index) => `${(index / Math.max(1, values.length - 1)) * 100},${28 - ((value - min) / range) * 24}`).join(' ');
  return (
    <svg viewBox="0 0 100 32" className="mt-3 h-9 w-full">
      <polyline points={points} fill="none" stroke={positive ? '#6C4CF1' : '#F43F5E'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Widget({ title, icon, children, className = '' }: { title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.045)] ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-950">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-violet-50 text-violet-600">{icon}</span>
          {title}
        </h2>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function WidgetRow({ title, sub, right, success }: { title: string; sub: string; right: string; success?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-800">{title}</p>
        <p className="truncate text-xs text-slate-400">{sub}</p>
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${success ? 'bg-emerald-50 text-emerald-600' : 'bg-white text-slate-500'}`}>{right}</span>
    </div>
  );
}

function MiniSummary({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-slate-400">{icon}<span className="text-xs font-semibold uppercase tracking-wide">{label}</span></div>
      <p className="mt-1 truncate text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Ring({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#6C4CF1 ${pct}%, #EEF2FF 0)` }}>
      <div className="grid h-16 w-16 place-items-center rounded-full bg-white text-lg font-extrabold text-slate-950">{pct}%</div>
    </div>
  );
}

function EmptyWidget({ text }: { text: string }) {
  return <p className="rounded-2xl bg-slate-50 px-3 py-6 text-center text-sm text-slate-400">{text}</p>;
}

function lastMonths(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (count - 1 - index));
    return { label: date.toLocaleDateString('en-US', { month: 'short' }) };
  });
}

function titleCase(value: string) {
  return value.toLowerCase().replace(/(^|\s|_)\w/g, (letter) => letter.toUpperCase()).replace(/_/g, ' ');
}

function normalizePie(values: Array<{ name: string; value: number }>, fallback: Array<{ name: string; value: number }>) {
  return values.length ? values.filter((item) => item.value > 0) : fallback;
}

function buildExamPerformance(marks: Array<{ score: number; exam: { maxMarks: number; subject: string } }>) {
  const subjects = new Map<string, { total: number; count: number }>();
  for (const mark of marks) {
    const current = subjects.get(mark.exam.subject) ?? { total: 0, count: 0 };
    current.total += (mark.score / (mark.exam.maxMarks || 100)) * 100;
    current.count += 1;
    subjects.set(mark.exam.subject, current);
  }
  const rows = [...subjects.entries()].slice(0, 6).map(([name, item]) => ({ name, score: Math.round(item.total / item.count) }));
  return rows.length ? rows : [
    { name: 'Math', score: 78 },
    { name: 'Science', score: 72 },
    { name: 'English', score: 84 },
    { name: 'Projects', score: 68 },
    { name: 'Attendance', score: 88 },
  ];
}
