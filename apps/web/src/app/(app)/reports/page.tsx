import Link from 'next/link';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { money } from '@/lib/format';
import { grade } from '@/lib/grade';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const session = getSession()!;
  const institutionId = session.institutionId;

  const [institution, sections, invoices, marks, attendance, totalStudents] = await Promise.all([
    db.institution.findUnique({ where: { id: institutionId } }),
    db.section.findMany({ where: { institutionId }, include: { schoolClass: true, _count: { select: { students: true } } }, orderBy: { name: 'asc' } }),
    db.feeInvoice.findMany({ where: { institutionId }, select: { amountCents: true, paidCents: true, status: true } }),
    db.mark.findMany({ where: { institutionId }, include: { exam: { select: { maxMarks: true } } }, take: 5000 }),
    db.attendanceRecord.groupBy({ by: ['status'], where: { institutionId }, _count: { _all: true } }),
    db.student.count({ where: { institutionId } }),
  ]);

  const currency = institution?.currency ?? 'USD';

  // Fee status
  const billed = invoices.reduce((n, i) => n + i.amountCents, 0);
  const collected = invoices.reduce((n, i) => n + i.paidCents, 0);
  const paidCount = invoices.filter((i) => i.status === 'PAID').length;
  const pendingCount = invoices.length - paidCount;

  // Grade distribution
  const gradeBuckets: Record<string, number> = { 'A+': 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
  for (const m of marks) gradeBuckets[grade(Math.round((m.score / (m.exam.maxMarks || 100)) * 100)).letter]++;
  const maxGrade = Math.max(1, ...Object.values(gradeBuckets));

  // Attendance overall
  const attTotal = attendance.reduce((n, a) => n + a._count._all, 0);
  const present = attendance.find((a) => a.status === 'PRESENT')?._count._all ?? 0;
  const overallAttendance = attTotal ? Math.round((present / attTotal) * 100) : 0;

  const maxEnroll = Math.max(1, ...sections.map((s) => s._count.students));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Analytics &amp; Reports</h1>
        <p className="text-slate-500 text-sm">Live metrics for {institution?.name}, computed from your data.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <Stat label="Total students" value={String(totalStudents)} />
        <Stat label="Overall attendance" value={attTotal ? `${overallAttendance}%` : '—'} />
        <Stat label="Fees collected" value={money(collected, currency)} accent />
        <Stat label="Collection rate" value={billed ? `${Math.round((collected / billed) * 100)}%` : '—'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Enrollment by section */}
        <Card title="Enrollment by section">
          {sections.length ? (
            <div className="space-y-2">
              {sections.map((s) => (
                <div key={s.id} className="flex items-center gap-3 text-sm">
                  <span className="w-24 shrink-0 text-slate-600">{s.name}</span>
                  <div className="flex-1 h-5 rounded bg-slate-100 overflow-hidden">
                    <div className="h-full bg-aurora" style={{ width: `${(s._count.students / maxEnroll) * 100}%` }} />
                  </div>
                  <span className="w-8 text-right text-slate-500">{s._count.students}</span>
                </div>
              ))}
            </div>
          ) : <Empty />}
        </Card>

        {/* Grade distribution */}
        <Card title="Grade distribution">
          {marks.length ? (
            <div className="flex items-end gap-3 h-44">
              {Object.entries(gradeBuckets).map(([g, n]) => (
                <div key={g} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-slate-400">{n}</span>
                  <div className="w-full rounded-t-md bg-brand-500" style={{ height: `${Math.max((n / maxGrade) * 100, 2)}%` }} />
                  <span className="text-xs font-medium text-slate-600">{g}</span>
                </div>
              ))}
            </div>
          ) : <Empty />}
        </Card>

        {/* Fee status */}
        <Card title="Fee status">
          <div className="grid grid-cols-2 gap-3">
            <Mini label="Paid invoices" value={String(paidCount)} tone="success" />
            <Mini label="Pending invoices" value={String(pendingCount)} tone="warning" />
            <Mini label="Billed" value={money(billed, currency)} />
            <Mini label="Outstanding" value={money(billed - collected, currency)} tone="warning" />
          </div>
        </Card>

        {/* Attendance breakdown */}
        <Card title="Attendance breakdown (all-time)">
          {attTotal ? (
            <div className="space-y-2">
              {['PRESENT', 'LATE', 'ABSENT'].map((st) => {
                const n = attendance.find((a) => a.status === st)?._count._all ?? 0;
                const pct = Math.round((n / attTotal) * 100);
                const color = st === 'PRESENT' ? 'bg-success' : st === 'LATE' ? 'bg-warning' : 'bg-danger';
                return (
                  <div key={st} className="flex items-center gap-3 text-sm">
                    <span className="w-20 text-slate-600 capitalize">{st.toLowerCase()}</span>
                    <div className="flex-1 h-5 rounded bg-slate-100 overflow-hidden"><div className={`h-full ${color}`} style={{ width: `${pct}%` }} /></div>
                    <span className="w-12 text-right text-slate-500">{pct}%</span>
                  </div>
                );
              })}
            </div>
          ) : <Empty />}
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return <div className={`rounded-xl p-4 shadow-sm ${accent ? 'bg-aurora text-white' : 'bg-white border border-slate-200'}`}>
    <p className={`text-sm ${accent ? 'text-white/80' : 'text-slate-500'}`}>{label}</p><p className="text-2xl font-extrabold">{value}</p></div>;
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-5"><h2 className="font-semibold text-slate-900 mb-4">{title}</h2>{children}</div>;
}
function Mini({ label, value, tone }: { label: string; value: string; tone?: 'success' | 'warning' }) {
  const c = tone === 'success' ? 'text-success' : tone === 'warning' ? 'text-warning' : 'text-slate-900';
  return <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className={`text-lg font-bold ${c}`}>{value}</p></div>;
}
function Empty() {
  return <p className="py-8 text-center text-sm text-slate-400">No data yet — it appears here as you use the system.</p>;
}
