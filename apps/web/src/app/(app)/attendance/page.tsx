import Link from 'next/link';
import type { ReactNode } from 'react';
import { AlertTriangle, BarChart3, CalendarDays, CheckCircle2, Clock3, ShieldCheck, Users } from 'lucide-react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { markAttendance } from '../actions';

export const dynamic = 'force-dynamic';

export default async function AttendancePage({ searchParams }: { searchParams: { section?: string } }) {
  const institutionId = getSession()!.institutionId;
  const today = new Date().toISOString().slice(0, 10);
  const sections = await db.section.findMany({ where: { institutionId }, orderBy: { name: 'asc' } });
  const sectionId = searchParams.section ?? sections[0]?.id;
  const selectedSection = sections.find((section) => section.id === sectionId);

  const students = sectionId
    ? await db.student.findMany({
        where: { institutionId, sectionId },
        orderBy: { firstName: 'asc' },
        include: { attendance: { where: { date: today } } },
      })
    : [];

  const present = students.filter((student) => (student.attendance[0]?.status ?? 'PRESENT') === 'PRESENT').length;
  const absent = students.filter((student) => student.attendance[0]?.status === 'ABSENT').length;
  const late = students.filter((student) => student.attendance[0]?.status === 'LATE').length;
  const percentage = students.length ? Math.round((present / students.length) * 100) : 0;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] p-5 text-white shadow-sm">
        <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">Daily care register</p>
            <h1 className="mt-2 break-words text-2xl font-extrabold sm:text-3xl">Attendance Control Board</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Mark daily attendance, review absences, identify late arrivals, and keep parent follow-up ready for every selected section.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-sm font-semibold text-white">Date: {today}</span>
              <span className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-sm font-semibold text-emerald-200">
                {selectedSection?.name ?? 'No section selected'}
              </span>
            </div>
          </div>
          <AttendanceVisual percentage={percentage} present={present} absent={absent} late={late} />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={<Users size={18} />} label="Students" value={String(students.length)} tone="from-sky-500 to-cyan-500" />
        <Stat icon={<CheckCircle2 size={18} />} label="Present" value={String(present)} tone="from-emerald-500 to-teal-500" />
        <Stat icon={<AlertTriangle size={18} />} label="Absent" value={String(absent)} tone="from-rose-500 to-pink-500" />
        <Stat icon={<Clock3 size={18} />} label="Late" value={String(late)} tone="from-amber-500 to-orange-500" />
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#0F172A] p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-white">Section Selector</h2>
            <p className="text-xs text-slate-400">Choose a section before marking attendance.</p>
          </div>
          <span className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-semibold text-slate-300">{sections.length} sections</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <Link
              key={section.id}
              href={`/attendance?section=${section.id}`}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                section.id === sectionId
                  ? 'border-emerald-300/25 bg-emerald-300/12 text-emerald-100'
                  : 'border-white/10 bg-white/7 text-slate-300 hover:border-cyan-300/35 hover:bg-white/11'
              }`}
            >
              {section.name}
            </Link>
          ))}
        </div>
      </section>

      {students.length > 0 ? (
        <form action={markAttendance} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] shadow-sm">
          <input type="hidden" name="date" value={today} />
          <input type="hidden" name="sectionId" value={sectionId} />
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div>
              <h2 className="font-bold text-white">Mark Attendance</h2>
              <p className="text-xs text-slate-400">Saved to your database on submit.</p>
            </div>
            <button className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-sm">
              Save attendance
            </button>
          </div>

          <div className="hidden md:block">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-white/5 text-left text-slate-400">
                <tr><th className="px-4 py-3">Adm. No</th><th className="px-4 py-3">Student</th><th className="px-4 py-3 text-right">Status</th></tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const current = student.attendance[0]?.status ?? 'PRESENT';
                  return (
                    <tr key={student.id} className="border-t border-white/10 text-slate-100 transition hover:bg-white/5">
                      <td className="px-4 py-3 font-mono text-xs text-cyan-200">{student.admissionNo}</td>
                      <td className="px-4 py-3 font-semibold">{student.firstName} {student.lastName}</td>
                      <td className="px-4 py-3 text-right">
                        <AttendanceSelect name={`status_${student.id}`} current={current} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-4 md:hidden">
            {students.map((student) => {
              const current = student.attendance[0]?.status ?? 'PRESENT';
              return (
                <article key={student.id} className="rounded-2xl border border-white/10 bg-white/7 p-4">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] uppercase tracking-wide text-cyan-200">{student.admissionNo}</p>
                      <p className="mt-1 truncate font-semibold text-white">{student.firstName} {student.lastName}</p>
                    </div>
                    <AttendanceSelect name={`status_${student.id}`} current={current} compact />
                  </div>
                </article>
              );
            })}
          </div>
        </form>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-8 text-center shadow-sm">
          <CalendarDays className="mx-auto text-slate-500" size={34} />
          <h2 className="mt-3 font-bold text-white">No students in this section</h2>
          <p className="mt-1 text-sm text-slate-400">Add students or choose another section to start marking attendance.</p>
        </div>
      )}
    </div>
  );
}

function AttendanceVisual({ percentage, present, absent, late }: { percentage: number; present: number; absent: number; late: number }) {
  return (
    <div className="relative min-h-56 overflow-hidden rounded-2xl border border-white/10 bg-white/8 p-5">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/14" />
      <div className="absolute -bottom-12 left-8 h-32 w-32 rounded-full bg-cyan-400/12" />
      <div className="relative mx-auto grid h-28 w-28 place-items-center rounded-full border-[10px] border-emerald-400/70 bg-slate-950/40">
        <span className="text-3xl font-extrabold text-white">{percentage}%</span>
      </div>
      <div className="relative mt-5 grid grid-cols-3 gap-3">
        {[
          ['Present', present, 'bg-emerald-400'],
          ['Absent', absent, 'bg-rose-400'],
          ['Late', late, 'bg-amber-400'],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/8 p-3 text-center">
            <span className={`mx-auto block h-2 w-8 rounded-full ${color}`} />
            <p className="mt-3 text-xl font-extrabold text-white">{value}</p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-4 text-white shadow-sm">
      <span className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${tone}`}>{icon}</span>
      <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-white/55">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function AttendanceSelect({ name, current, compact }: { name: string; current: string; compact?: boolean }) {
  return (
    <select
      name={name}
      defaultValue={current}
      className={`rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm font-semibold text-white outline-none focus:ring-2 focus:ring-cyan-400 ${compact ? 'max-w-[120px]' : ''}`}
    >
      <option value="PRESENT">Present</option>
      <option value="ABSENT">Absent</option>
      <option value="LATE">Late</option>
    </select>
  );
}
