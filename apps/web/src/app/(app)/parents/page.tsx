import Link from 'next/link';
import type { ReactNode } from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { CalendarDays, MessageSquare, Phone, ShieldCheck, Users } from 'lucide-react';

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
  const linkedChildren = guardians.reduce((sum, guardian) => sum + guardian.children.length, 0);
  const reachableGuardians = guardians.filter((guardian) => guardian.phone).length;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] p-5 text-white shadow-sm">
        <div className="grid gap-5 xl:grid-cols-[1fr_330px]">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-fuchsia-300">Family engagement</p>
            <h1 className="mt-2 break-words text-2xl font-extrabold sm:text-3xl">Parents &amp; Guardians</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Guardian directory, student links, parent communication, meeting follow-ups, consent records, and school updates in one family portal.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                ['Parent Dashboard', '/modules/school/parent-and-guardian-portal/parent-dashboard'],
                ['Guardian Contacts', '/modules/school/parent-and-guardian-portal/guardian-contacts'],
                ['Meeting Requests', '/modules/school/parent-and-guardian-portal/meeting-requests'],
              ].map(([label, href]) => (
                <Link key={label} href={href} className="rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/12">
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <ParentVisual />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <ParentStat icon={<Users size={18} />} label="Guardians" value={String(guardians.length)} tone="from-fuchsia-500 to-violet-600" />
        <ParentStat icon={<ShieldCheck size={18} />} label="Linked Children" value={String(linkedChildren)} tone="from-emerald-500 to-teal-500" />
        <ParentStat icon={<Phone size={18} />} label="With Phone" value={String(reachableGuardians)} tone="from-sky-500 to-cyan-500" />
        <ParentStat icon={<MessageSquare size={18} />} label="Messages" value="0" tone="from-amber-500 to-orange-500" />
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        <ParentAction icon={<MessageSquare size={18} />} title="Communication Desk" detail="Notices, fee reminders, homework updates, alerts, and response tracking." href="/modules/school/parent-and-guardian-portal/message-history" tone="from-fuchsia-500 to-violet-600" />
        <ParentAction icon={<CalendarDays size={18} />} title="Meeting Planner" detail="Teacher meetings, counsellor follow-ups, appointment slots, and meeting minutes." href="/modules/school/parent-and-guardian-portal/meeting-requests" tone="from-sky-500 to-cyan-500" />
        <ParentAction icon={<ShieldCheck size={18} />} title="Consent Records" detail="Consent forms, approvals, acknowledgement proof, access rules, and audit notes." href="/modules/school/parent-and-guardian-portal/consent-forms" tone="from-emerald-500 to-teal-500" />
      </section>

      {guardians.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0F172A] px-5 py-12 text-center text-sm text-slate-400 shadow-sm">
          No guardians yet. Add students with guardian details and they will appear here.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guardians.map((g, i) => (
            <div key={i} className="min-w-0 rounded-2xl border border-white/10 bg-[#0F172A] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-fuchsia-300/30">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 font-bold text-white shadow-sm">
                  {g.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="break-words font-semibold text-white">{g.name}</p>
                  {g.phone && <p className="mt-1 flex items-center gap-1 text-sm text-slate-400"><Phone size={12} /> {g.phone}</p>}
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/7 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">Children ({g.children.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {g.children.map((c) => (
                    <Link key={c.id} href={`/students/${c.id}`}
                      className="rounded-full border border-white/10 bg-white/8 px-2 py-1 text-xs font-semibold text-slate-100 transition hover:border-fuchsia-300/35 hover:bg-white/12">
                      {c.firstName} {c.lastName} - {c.section?.name ?? 'Unassigned'}
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

function ParentVisual() {
  return (
    <div className="relative min-h-56 overflow-hidden rounded-2xl border border-white/10 bg-white/8 p-5">
      <div className="absolute inset-x-8 top-1/2 h-px bg-gradient-to-r from-transparent via-fuchsia-300/45 to-transparent" />
      <div className="absolute left-1/2 top-8 h-[72%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-cyan-300/35 to-transparent" />
      <div className="relative mx-auto grid h-24 w-24 place-items-center rounded-[2rem] bg-gradient-to-br from-fuchsia-500 to-violet-600 shadow-lg shadow-fuchsia-950/35">
        <Users size={34} />
      </div>
      <div className="relative mt-5 grid grid-cols-2 gap-3">
        {[
          ['Alerts', <MessageSquare key="alerts" size={17} />, 'bg-fuchsia-400/16 text-fuchsia-100'],
          ['Meetings', <CalendarDays key="meetings" size={17} />, 'bg-sky-400/16 text-sky-100'],
          ['Consent', <ShieldCheck key="consent" size={17} />, 'bg-emerald-400/16 text-emerald-100'],
          ['Calls', <Phone key="calls" size={17} />, 'bg-amber-400/16 text-amber-100'],
        ].map(([label, icon, className]) => (
          <div key={String(label)} className={`rounded-2xl border border-white/10 p-3 ${className}`}>
            {icon}
            <p className="mt-2 text-xs font-bold">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ParentStat({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-4 text-white shadow-sm">
      <span className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${tone}`}>{icon}</span>
      <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-white/55">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function ParentAction({ icon, title, detail, href, tone }: { icon: ReactNode; title: string; detail: string; href: string; tone: string }) {
  return (
    <Link href={href} className="group min-w-0 rounded-2xl border border-white/10 bg-[#0F172A] p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-fuchsia-300/30">
      <span className={`grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br ${tone} text-white`}>{icon}</span>
      <h2 className="mt-4 break-words font-bold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p>
    </Link>
  );
}
