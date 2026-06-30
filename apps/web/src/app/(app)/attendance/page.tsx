import Link from 'next/link';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { markAttendance } from '../actions';

export const dynamic = 'force-dynamic';

export default async function AttendancePage({ searchParams }: { searchParams: { section?: string } }) {
  const institutionId = getSession()!.institutionId;
  const today = new Date().toISOString().slice(0, 10);
  const sections = await db.section.findMany({ where: { institutionId }, orderBy: { name: 'asc' } });
  const sectionId = searchParams.section ?? sections[0]?.id;

  const students = sectionId
    ? await db.student.findMany({
        where: { institutionId, sectionId },
        orderBy: { firstName: 'asc' },
        include: { attendance: { where: { date: today } } },
      })
    : [];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Attendance</h1>
      <p className="text-slate-500 text-sm mb-4">Marking for <b>{today}</b>. Saved to your database on submit.</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {sections.map((s) => (
          <Link key={s.id} href={`/attendance?section=${s.id}`}
            className={`px-3 py-1.5 rounded-lg text-sm border ${s.id === sectionId ? 'bg-brand-600 text-white border-brand-600' : 'bg-white border-slate-200 text-slate-600'}`}>
            {s.name}
          </Link>
        ))}
      </div>

      {students.length > 0 ? (
        <form action={markAttendance} className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <input type="hidden" name="date" value={today} />
          <input type="hidden" name="sectionId" value={sectionId} />
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-400 text-left">
              <tr><th className="px-4 py-3">Adm. No</th><th>Student</th><th className="text-right px-4">Status</th></tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const current = s.attendance[0]?.status ?? 'PRESENT';
                return (
                  <tr key={s.id} className="border-t border-slate-100">
                    <td className="px-4 py-2 font-mono text-xs">{s.admissionNo}</td>
                    <td>{s.firstName} {s.lastName}</td>
                    <td className="text-right px-4 py-2">
                      <select name={`status_${s.id}`} defaultValue={current}
                        className="px-2 py-1 rounded-md border border-slate-200 bg-white text-slate-900">
                        <option value="PRESENT">Present</option>
                        <option value="ABSENT">Absent</option>
                        <option value="LATE">Late</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="p-4 border-t border-slate-100">
            <button className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm">Save attendance</button>
          </div>
        </form>
      ) : (
        <p className="text-slate-400">No students in this section.</p>
      )}
    </div>
  );
}
