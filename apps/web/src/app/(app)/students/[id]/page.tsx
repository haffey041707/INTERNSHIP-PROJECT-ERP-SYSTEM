import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function StudentProfile({ params }: { params: { id: string } }) {
  const institutionId = getSession()!.institutionId;
  const student = await db.student.findFirst({
    where: { id: params.id, institutionId },
    include: {
      section: { include: { schoolClass: true } },
      attendance: { orderBy: { date: 'desc' }, take: 10 },
      invoices: { include: { payments: true } },
    },
  });
  if (!student) notFound();

  const present = student.attendance.filter((a) => a.status === 'PRESENT').length;
  const attendancePct = student.attendance.length ? Math.round((present / student.attendance.length) * 100) : 0;
  const billed = student.invoices.reduce((n, i) => n + i.amountCents, 0);
  const paid = student.invoices.reduce((n, i) => n + i.paidCents, 0);
  const fmt = (c: number) => `$${(c / 100).toLocaleString()}`;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <Link href="/students" className="text-sm text-slate-500">← Back to students</Link>
        <Link href={`/students/${student.id}/edit`} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-brand-400"><Pencil size={14} /> Edit</Link>
      </div>

      <div className="mt-3 rounded-xl bg-aurora text-white p-6 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white/20 grid place-items-center text-2xl font-bold">
          {student.firstName[0]}{student.lastName[0]}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold">{student.firstName} {student.lastName}</h1>
          <p className="text-white/80 text-sm">
            {student.admissionNo} · {student.section ? `${student.section.schoolClass.name} · ${student.section.name}` : 'Unassigned'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <Stat label="Attendance" value={`${attendancePct}%`} />
        <Stat label="Fees billed" value={fmt(billed)} />
        <Stat label="Fees paid" value={fmt(paid)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Card title="Details">
          <Row k="Gender" v={student.gender ?? '—'} />
          <Row k="Status" v={student.status} />
          <Row k="Guardian" v={student.guardianName ?? '—'} />
          <Row k="Guardian phone" v={student.guardianPhone ?? '—'} />
        </Card>
        <Card title="Recent attendance">
          {student.attendance.length === 0 && <p className="text-sm text-slate-400">No records.</p>}
          {student.attendance.map((a) => (
            <Row key={a.id} k={a.date} v={a.status} />
          ))}
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
    <p className="text-sm text-slate-500">{label}</p><p className="text-xl font-bold text-slate-900">{value}</p></div>;
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
    <h2 className="font-semibold text-slate-900 mb-3">{title}</h2><div className="space-y-1">{children}</div></div>;
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between text-sm py-1 border-b border-slate-50 last:border-0">
    <span className="text-slate-500">{k}</span><span className="text-slate-900 font-medium">{v}</span></div>;
}
