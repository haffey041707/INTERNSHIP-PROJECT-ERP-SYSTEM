import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Award, CalendarDays, FileText, Mail, Phone, Users } from 'lucide-react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function TeacherProfilePage({ params }: { params: { id: string } }) {
  const institutionId = getSession()!.institutionId;
  const teacher = await db.teacher.findFirst({ where: { id: params.id, institutionId } });
  if (!teacher) notFound();

  const [subjectExams, timetableSlots, classes] = await Promise.all([
    db.exam.count({ where: { institutionId, subject: teacher.subject } }),
    db.timetableSlot.findMany({
      where: { institutionId, teacherName: teacher.name },
      include: { section: { include: { schoolClass: true } } },
      orderBy: [{ day: 'asc' }, { period: 'asc' }],
      take: 8,
    }),
    db.schoolClass.count({ where: { institutionId } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="premium-home-hero rounded-2xl p-5 text-white">
        <Link href="/teachers" className="inline-flex items-center gap-1.5 text-sm text-white/75 hover:text-white">
          <ArrowLeft size={15} /> Back to teachers
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/20 text-2xl font-bold">
            {teacher.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Staff profile</p>
            <h1 className="text-2xl font-extrabold text-white">{teacher.name}</h1>
            <p className="text-sm text-white/75">{teacher.subject} · {teacher.qualification ?? 'Qualification not set'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <Stat icon={<Users size={18} />} label="Classes" value={String(classes)} accent />
        <Stat icon={<FileText size={18} />} label="Subject exams" value={String(subjectExams)} />
        <Stat icon={<CalendarDays size={18} />} label="Timetable slots" value={String(timetableSlots.length)} />
        <Stat icon={<Award size={18} />} label="Status" value="Active" />
      </div>

      <div className="grid lg:grid-cols-[.8fr_1.2fr] gap-4">
        <section className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Contact</h2>
          <div className="mt-4 space-y-2 text-sm">
            <Row icon={<Mail size={15} />} label="Email" value={teacher.email} />
            <Row icon={<Phone size={15} />} label="Phone" value={teacher.phone ?? 'Not set'} />
            <Row icon={<Award size={15} />} label="Qualification" value={teacher.qualification ?? 'Not set'} />
          </div>
        </section>

        <section className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Teaching Schedule</h2>
          <div className="mt-4 space-y-2">
            {timetableSlots.length ? timetableSlots.map((slot) => (
              <div key={slot.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                <p className="font-medium text-slate-900">{slot.day} · Period {slot.period} · {slot.subject}</p>
                <p className="text-slate-500">{slot.section.schoolClass.name} · {slot.section.name} · {slot.startTime} - {slot.endTime}</p>
              </div>
            )) : (
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-6 text-center text-sm text-slate-400">
                No timetable slots assigned yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-4 shadow-sm ${accent ? 'premium-kpi-accent bg-aurora text-white' : 'premium-kpi glass'}`}>
      <span className={`grid h-9 w-9 place-items-center rounded-lg ${accent ? 'bg-white/20' : 'bg-brand-50 text-brand-600'}`}>{icon}</span>
      <p className={`mt-3 text-sm ${accent ? 'text-white/80' : 'text-slate-500'}`}>{label}</p>
      <p className="text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <span className="flex items-center gap-2 text-slate-500">{icon}{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}
