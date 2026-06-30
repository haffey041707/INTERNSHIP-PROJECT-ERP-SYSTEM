import Link from 'next/link';
import { AlertTriangle, TrendingDown, Wallet, Award, Lightbulb } from 'lucide-react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { money } from '@/lib/format';

export const dynamic = 'force-dynamic';

/** Actionable signals computed from live attendance, fee, and exam data. */
export default async function InsightsPage() {
  const session = getSession()!;
  const institutionId = session.institutionId;
  const inst = await db.institution.findUnique({ where: { id: institutionId } });
  const currency = inst?.currency ?? 'USD';

  const [students, attendance, invoices, marks] = await Promise.all([
    db.student.findMany({ where: { institutionId }, include: { section: true } }),
    db.attendanceRecord.findMany({ where: { institutionId }, select: { studentId: true, status: true } }),
    db.feeInvoice.findMany({ where: { institutionId, status: { not: 'PAID' } }, include: { student: true } }),
    db.mark.findMany({ where: { institutionId }, include: { exam: { select: { maxMarks: true } }, student: true } }),
  ]);

  // Attendance risk: students below 75% attendance
  const attByStudent = new Map<string, { present: number; total: number }>();
  for (const a of attendance) {
    const r = attByStudent.get(a.studentId) ?? { present: 0, total: 0 };
    r.total++; if (a.status === 'PRESENT') r.present++;
    attByStudent.set(a.studentId, r);
  }
  const atRisk = students
    .map((s) => { const r = attByStudent.get(s.id); const pct = r && r.total ? Math.round((r.present / r.total) * 100) : null; return { s, pct }; })
    .filter((x) => x.pct !== null && x.pct < 75)
    .sort((a, b) => a.pct! - b.pct!);

  // Fee defaulters
  const defaulters = invoices
    .map((i) => ({ student: i.student, due: i.amountCents - i.paidCents }))
    .filter((d) => d.due > 0)
    .sort((a, b) => b.due - a.due);
  const totalDue = defaulters.reduce((n, d) => n + d.due, 0);

  // Low performers: avg < 50%
  const perfByStudent = new Map<string, { sum: number; n: number; name: string }>();
  for (const m of marks) {
    const pct = (m.score / (m.exam.maxMarks || 100)) * 100;
    const r = perfByStudent.get(m.studentId) ?? { sum: 0, n: 0, name: `${m.student.firstName} ${m.student.lastName}` };
    r.sum += pct; r.n++; perfByStudent.set(m.studentId, r);
  }
  const lowPerformers = [...perfByStudent.values()]
    .map((r) => ({ name: r.name, avg: Math.round(r.sum / r.n) }))
    .filter((r) => r.avg < 50)
    .sort((a, b) => a.avg - b.avg);

  const hasData = attendance.length || invoices.length || marks.length;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="grid place-items-center w-10 h-10 rounded-xl bg-aurora text-white"><Lightbulb size={20} /></span>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Institution Insights</h1>
          <p className="text-slate-500 text-sm">Actionable signals computed from your institution’s data.</p>
        </div>
      </div>

      {!hasData && (
        <div className="rounded-xl bg-white border border-slate-200 p-8 text-center text-slate-400">
          <Lightbulb className="mx-auto mb-2 text-slate-300" />
          Add students and record attendance, fees and exams — insights will appear here automatically.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <Summary icon={<TrendingDown size={18} />} label="At-risk attendance" value={String(atRisk.length)} tone="danger" />
        <Summary icon={<Wallet size={18} />} label="Fee defaulters" value={String(defaulters.length)} tone="warning" />
        <Summary icon={<Award size={18} />} label="Low performers" value={String(lowPerformers.length)} tone="warning" />
        <Summary icon={<Wallet size={18} />} label="Total outstanding" value={money(totalDue, currency)} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Attendance risk (<75%)" icon={<AlertTriangle size={16} className="text-danger" />}>
          {atRisk.length === 0 ? <Empty /> : atRisk.slice(0, 8).map(({ s, pct }) => (
            <Row key={s.id} href={`/students/${s.id}`} left={`${s.firstName} ${s.lastName}`} sub={s.section?.name ?? '—'} right={`${pct}%`} tone="danger" />
          ))}
        </Panel>
        <Panel title="Top fee defaulters" icon={<Wallet size={16} className="text-warning" />}>
          {defaulters.length === 0 ? <Empty /> : defaulters.slice(0, 8).map((d, i) => (
            <Row key={i} href="/fees" left={`${d.student.firstName} ${d.student.lastName}`} sub="outstanding" right={money(d.due, currency)} tone="warning" />
          ))}
        </Panel>
        <Panel title="Students needing support (<50%)" icon={<Award size={16} className="text-warning" />}>
          {lowPerformers.length === 0 ? <Empty /> : lowPerformers.slice(0, 8).map((r, i) => (
            <Row key={i} href="/exams" left={r.name} sub="avg result" right={`${r.avg}%`} tone="warning" />
          ))}
        </Panel>
      </div>

      <p className="text-xs text-slate-400">Recommendations: contact guardians of at-risk students, send fee reminders to defaulters, and arrange remedial sessions for low performers.</p>
    </div>
  );
}

function Summary({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone?: 'danger' | 'warning' }) {
  const c = tone === 'danger' ? 'text-danger bg-red-50' : tone === 'warning' ? 'text-warning bg-amber-50' : 'text-brand-600 bg-brand-50';
  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-4">
      <span className={`grid place-items-center w-9 h-9 rounded-lg ${c}`}>{icon}</span>
      <p className="text-sm text-slate-500 mt-2">{label}</p>
      <p className="text-2xl font-extrabold text-slate-900">{value}</p>
    </div>
  );
}
function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 bg-slate-50 flex items-center gap-2 text-sm font-semibold text-slate-700">{icon} {title}</div>
      <div>{children}</div>
    </div>
  );
}
function Row({ href, left, sub, right, tone }: { href: string; left: string; sub: string; right: string; tone: 'danger' | 'warning' }) {
  const c = tone === 'danger' ? 'text-danger' : 'text-warning';
  return (
    <Link href={href} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-0">
      <span><span className="block text-sm text-slate-800">{left}</span><span className="block text-xs text-slate-400">{sub}</span></span>
      <span className={`text-sm font-bold ${c}`}>{right}</span>
    </Link>
  );
}
function Empty() { return <p className="px-4 py-6 text-center text-sm text-slate-400">Nothing flagged.</p>; }
