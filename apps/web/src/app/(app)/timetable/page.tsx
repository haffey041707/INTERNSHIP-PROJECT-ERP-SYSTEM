import Link from 'next/link';
import type { ReactNode } from 'react';
import { BarChart3, BookOpen, CalendarDays, Clock3, GraduationCap, Plus, Trash2, Users } from 'lucide-react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { saveTimetableSlot, deleteTimetableSlot } from '../actions';

export const dynamic = 'force-dynamic';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const PERIODS = [1, 2, 3, 4, 5, 6];

export default async function TimetablePage({ searchParams }: { searchParams: { section?: string } }) {
  const institutionId = getSession()!.institutionId;
  const sections = await db.section.findMany({ where: { institutionId }, orderBy: { name: 'asc' } });
  const sectionId = searchParams.section ?? sections[0]?.id;
  const selectedSection = sections.find((section) => section.id === sectionId);

  const slots = sectionId
    ? await db.timetableSlot.findMany({ where: { institutionId, sectionId } })
    : [];
  const slotAt = (day: string, period: number) => slots.find((slot) => slot.day === day && slot.period === period);
  const totalCells = DAYS.length * PERIODS.length;
  const freeCells = totalCells - slots.length;
  const utilization = totalCells ? Math.round((slots.length / totalCells) * 100) : 0;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] p-5 text-white shadow-sm">
        <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-300">Academic timeline</p>
            <h1 className="mt-2 break-words text-2xl font-extrabold sm:text-3xl">Timetable Planner</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Build a weekly teaching timeline with periods, subjects, teachers, class sections, timings, empty slots, and quick edit controls.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-sm font-semibold text-white">
                {selectedSection?.name ?? 'No section selected'}
              </span>
              <span className="rounded-xl border border-sky-300/20 bg-sky-300/10 px-3 py-2 text-sm font-semibold text-sky-200">
                {utilization}% scheduled
              </span>
            </div>
          </div>
          <TimetableVisual scheduled={slots.length} free={freeCells} utilization={utilization} />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={<CalendarDays size={18} />} label="Week Cells" value={String(totalCells)} tone="from-sky-500 to-cyan-500" />
        <Stat icon={<BookOpen size={18} />} label="Scheduled" value={String(slots.length)} tone="from-violet-600 to-fuchsia-500" />
        <Stat icon={<Clock3 size={18} />} label="Free Slots" value={String(freeCells)} tone="from-amber-500 to-orange-500" />
        <Stat icon={<BarChart3 size={18} />} label="Utilization" value={`${utilization}%`} tone="from-emerald-500 to-teal-500" />
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#0F172A] p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-white">Section Timeline</h2>
            <p className="text-xs text-slate-400">Choose the class section before editing its timetable.</p>
          </div>
          <span className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-semibold text-slate-300">{sections.length} sections</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <Link
              key={section.id}
              href={`/timetable?section=${section.id}`}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                section.id === sectionId
                  ? 'border-sky-300/25 bg-sky-300/12 text-sky-100'
                  : 'border-white/10 bg-white/7 text-slate-300 hover:border-cyan-300/35 hover:bg-white/11'
              }`}
            >
              {section.name}
            </Link>
          ))}
        </div>
      </section>

      {!sectionId ? (
        <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-8 text-center shadow-sm">
          <CalendarDays className="mx-auto text-slate-500" size={34} />
          <h2 className="mt-3 font-bold text-white">Create a section first</h2>
          <p className="mt-1 text-sm text-slate-400">The timetable board needs at least one class section.</p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-white/10 bg-[#0F172A] shadow-sm md:block">
            <table className="w-full min-w-[840px] border-collapse text-sm">
              <thead>
                <tr className="bg-white/5 text-left text-slate-400">
                  <th className="w-20 px-3 py-3">Period</th>
                  {DAYS.map((day) => <th key={day} className="px-3 py-3">{day}</th>)}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((period) => (
                  <tr key={period} className="border-t border-white/10">
                    <td className="px-3 py-3 align-top">
                      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/8 text-sm font-bold text-sky-200">P{period}</span>
                    </td>
                    {DAYS.map((day) => {
                      const slot = slotAt(day, period);
                      return (
                        <td key={day} className="relative p-2 align-top">
                          <details className="group" data-close-outside>
                            <summary className={`min-h-[78px] cursor-pointer list-none rounded-2xl border px-3 py-3 text-xs transition ${
                              slot
                                ? 'border-sky-300/25 bg-sky-300/10 text-sky-100 hover:bg-sky-300/14'
                                : 'border-dashed border-white/10 bg-white/7 text-slate-400 hover:border-cyan-300/35 hover:bg-white/11'
                            }`}>
                              {slot ? (
                                <>
                                  <p className="break-words font-bold text-white">{slot.subject}</p>
                                  {slot.teacherName && <p className="mt-1 break-words text-slate-300">{slot.teacherName}</p>}
                                  {slot.startTime && <p className="mt-1 text-slate-400">{slot.startTime} - {slot.endTime}</p>}
                                </>
                              ) : (
                                <span className="inline-flex items-center gap-1 font-semibold"><Plus size={13} /> add slot</span>
                              )}
                            </summary>
                            <SlotForm sectionId={sectionId} day={day} period={period} slot={slot} />
                          </details>
                          {slot && (
                            <form action={deleteTimetableSlot}>
                              <input type="hidden" name="id" value={slot.id} />
                              <button className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-red-200 hover:text-red-100">
                                <Trash2 size={10} /> remove
                              </button>
                            </form>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 md:hidden">
            {DAYS.map((day) => (
              <section key={day} className="rounded-2xl border border-white/10 bg-[#0F172A] p-4 shadow-sm">
                <h2 className="font-bold text-white">{day}</h2>
                <div className="mt-3 space-y-3">
                  {PERIODS.map((period) => {
                    const slot = slotAt(day, period);
                    return (
                      <div key={period} className="relative rounded-2xl border border-white/10 bg-white/7 p-3">
                        <details data-close-outside>
                          <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs font-bold uppercase tracking-widest text-sky-200">P{period}</p>
                              <p className="mt-1 break-words font-semibold text-white">{slot?.subject ?? 'Add timetable slot'}</p>
                              {slot?.teacherName && <p className="mt-1 text-sm text-slate-400">{slot.teacherName}</p>}
                            </div>
                            <span className="rounded-full bg-white/8 px-2 py-1 text-[11px] font-semibold text-slate-300">{slot ? 'Edit' : 'Add'}</span>
                          </summary>
                          <SlotForm sectionId={sectionId} day={day} period={period} slot={slot} mobile />
                        </details>
                        {slot && (
                          <form action={deleteTimetableSlot} className="mt-3 border-t border-white/10 pt-3">
                            <input type="hidden" name="id" value={slot.id} />
                            <button className="inline-flex items-center gap-1 rounded-lg border border-red-300/20 bg-red-300/10 px-2.5 py-1.5 text-xs font-semibold text-red-200">
                              <Trash2 size={13} /> Remove
                            </button>
                          </form>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

type TimetableSlotLike = {
  id: string;
  subject: string;
  teacherName: string | null;
  startTime: string;
  endTime: string;
};

function SlotForm({ sectionId, day, period, slot, mobile }: { sectionId: string; day: string; period: number; slot?: TimetableSlotLike; mobile?: boolean }) {
  return (
    <form action={saveTimetableSlot} className={`${mobile ? 'mt-3 w-full' : 'absolute z-20 mt-2 w-56'} space-y-2 rounded-2xl border border-white/10 bg-slate-950 p-3 shadow-xl`}>
      <input type="hidden" name="sectionId" value={sectionId} />
      <input type="hidden" name="day" value={day} />
      <input type="hidden" name="period" value={period} />
      <input name="subject" defaultValue={slot?.subject} placeholder="Subject" required className="w-full rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-400" />
      <input name="teacherName" defaultValue={slot?.teacherName ?? ''} placeholder="Teacher" className="w-full rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-400" />
      <div className="flex gap-2">
        <input name="startTime" defaultValue={slot?.startTime} placeholder="09:00" className="min-w-0 w-full rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-400" />
        <input name="endTime" defaultValue={slot?.endTime} placeholder="09:45" className="min-w-0 w-full rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-400" />
      </div>
      <button className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 py-2 text-sm font-semibold text-white">Save slot</button>
    </form>
  );
}

function TimetableVisual({ scheduled, free, utilization }: { scheduled: number; free: number; utilization: number }) {
  return (
    <div className="relative min-h-56 overflow-hidden rounded-2xl border border-white/10 bg-white/8 p-5">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sky-400/14" />
      <div className="absolute -bottom-12 left-8 h-32 w-32 rounded-full bg-violet-400/12" />
      <div className="relative grid grid-cols-5 gap-2">
        {DAYS.map((day, dayIndex) => (
          <div key={day} className="space-y-2">
            <p className="text-center text-[10px] font-bold text-slate-400">{day}</p>
            {PERIODS.slice(0, 4).map((period) => (
              <span key={period} className={`block h-5 rounded-lg ${dayIndex + period <= 7 ? 'bg-sky-400/70' : 'bg-white/12'}`} />
            ))}
          </div>
        ))}
      </div>
      <div className="relative mt-5 grid grid-cols-3 gap-3">
        {[
          ['Scheduled', scheduled],
          ['Free', free],
          ['Load', `${utilization}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/8 p-3 text-center">
            <p className="text-xl font-extrabold text-white">{value}</p>
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
