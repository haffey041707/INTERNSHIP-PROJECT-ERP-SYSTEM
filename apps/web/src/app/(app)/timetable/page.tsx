import Link from 'next/link';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { saveTimetableSlot, deleteTimetableSlot } from '../actions';
import { CloseDetailsOnOutside } from './CloseDetailsOnOutside';

export const dynamic = 'force-dynamic';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const PERIODS = [1, 2, 3, 4, 5, 6];

export default async function TimetablePage({ searchParams }: { searchParams: { section?: string } }) {
  const institutionId = getSession()!.institutionId;
  const sections = await db.section.findMany({ where: { institutionId }, orderBy: { name: 'asc' } });
  const sectionId = searchParams.section ?? sections[0]?.id;

  const slots = sectionId
    ? await db.timetableSlot.findMany({ where: { institutionId, sectionId } })
    : [];
  const slotAt = (day: string, period: number) => slots.find((s) => s.day === day && s.period === period);

  return (
    <div className="space-y-4">
      <CloseDetailsOnOutside />
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Timetable</h1>
        <p className="text-slate-500 text-sm">Weekly schedule per section. Click any cell to set the class.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {sections.map((s) => (
          <Link key={s.id} href={`/timetable?section=${s.id}`}
            className={`px-3 py-1.5 rounded-lg text-sm border ${s.id === sectionId ? 'bg-brand-600 text-white border-brand-600' : 'bg-white border-slate-200 text-slate-600'}`}>
            {s.name}
          </Link>
        ))}
      </div>

      {!sectionId ? (
        <p className="text-slate-400">Create a section first.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white border border-slate-200 shadow-sm">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400">
                <th className="p-2 w-16 text-left">Period</th>
                {DAYS.map((d) => <th key={d} className="p-2 text-left">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((p) => (
                <tr key={p} className="border-t border-slate-100">
                  <td className="p-2 font-medium text-slate-500">P{p}</td>
                  {DAYS.map((d) => {
                    const slot = slotAt(d, p);
                    return (
                      <td key={d} className="p-1.5 align-top">
                        <details className="group" data-close-outside>
                          <summary className={`list-none cursor-pointer rounded-lg px-2.5 py-2 min-h-[52px] text-xs
                            ${slot ? 'bg-brand-50 border border-brand-200' : 'bg-slate-50 border border-dashed border-slate-200 text-slate-400 hover:border-brand-300'}`}>
                            {slot ? (
                              <>
                                <p className="font-semibold text-brand-700">{slot.subject}</p>
                                {slot.teacherName && <p className="text-slate-500">{slot.teacherName}</p>}
                                {slot.startTime && <p className="text-slate-400">{slot.startTime}–{slot.endTime}</p>}
                              </>
                            ) : '+ add'}
                          </summary>
                          <form action={saveTimetableSlot} className="mt-2 space-y-1.5 bg-white border border-slate-200 rounded-lg p-2 shadow-lg w-44 absolute z-10">
                            <input type="hidden" name="sectionId" value={sectionId} />
                            <input type="hidden" name="day" value={d} />
                            <input type="hidden" name="period" value={p} />
                            <input name="subject" defaultValue={slot?.subject} placeholder="Subject" required className="w-full px-2 py-1 rounded border border-slate-200 text-slate-900" />
                            <input name="teacherName" defaultValue={slot?.teacherName ?? ''} placeholder="Teacher" className="w-full px-2 py-1 rounded border border-slate-200 text-slate-900" />
                            <div className="flex gap-1">
                              <input name="startTime" defaultValue={slot?.startTime} placeholder="09:00" className="w-full px-2 py-1 rounded border border-slate-200 text-slate-900" />
                              <input name="endTime" defaultValue={slot?.endTime} placeholder="09:45" className="w-full px-2 py-1 rounded border border-slate-200 text-slate-900" />
                            </div>
                            <button className="w-full py-1 rounded bg-brand-600 text-white">Save</button>
                          </form>
                        </details>
                        {slot && (
                          <form action={deleteTimetableSlot}>
                            <input type="hidden" name="id" value={slot.id} />
                            <button className="text-[10px] text-danger hover:underline mt-1">remove</button>
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
      )}
    </div>
  );
}
