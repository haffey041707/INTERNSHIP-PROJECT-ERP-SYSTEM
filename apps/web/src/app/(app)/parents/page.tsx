import Link from 'next/link';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { Phone } from 'lucide-react';

export const dynamic = 'force-dynamic';

/** Guardians are derived from student records (guardianName/guardianPhone), grouped so
 *  one guardian shows all their children — a real parent directory with no extra table. */
export default async function ParentsPage() {
  const institutionId = getSession()!.institutionId;
  const students = await db.student.findMany({
    where: { institutionId, guardianName: { not: null } },
    include: { section: true },
    orderBy: { guardianName: 'asc' },
  });

  const map = new Map<string, { name: string; phone: string | null; children: typeof students }>();
  for (const s of students) {
    const key = `${s.guardianName}|${s.guardianPhone ?? ''}`;
    if (!map.has(key)) map.set(key, { name: s.guardianName!, phone: s.guardianPhone, children: [] });
    map.get(key)!.children.push(s);
  }
  const guardians = [...map.values()];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Parents &amp; Guardians</h1>
        <p className="text-slate-500 text-sm">{guardians.length} guardians · linked to their children</p>
      </div>

      {guardians.length === 0 ? (
        <div className="py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
          No guardians yet. Add students with guardian details and they’ll appear here.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {guardians.map((g, i) => (
            <div key={i} className="card-hover bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-brand-100 grid place-items-center text-brand-700 font-bold">
                  {g.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{g.name}</p>
                  {g.phone && <p className="text-sm text-slate-500 flex items-center gap-1"><Phone size={12} /> {g.phone}</p>}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-1">Children ({g.children.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {g.children.map((c) => (
                    <Link key={c.id} href={`/students/${c.id}`}
                      className="text-xs px-2 py-1 rounded-md bg-slate-50 border border-slate-200 hover:border-brand-400 text-slate-700">
                      {c.firstName} {c.lastName} · {c.section?.name ?? '—'}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
