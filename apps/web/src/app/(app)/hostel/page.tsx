import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  BarChart3,
  BedDouble,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  DoorOpen,
  HeartPulse,
  KeyRound,
  PackageCheck,
  Search,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react';
import { db } from '@/lib/db';
import { getMainWorkspace, slugifyWorkspace } from '@/lib/main-workspaces';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

const workspace = getMainWorkspace('hostel')!;

type HostelVisualType = 'rooms' | 'care' | 'visitors' | 'administration';

type HostelRecord = {
  id: string;
  feature: string;
  title: string;
  status: string;
  priority: string;
  requester: string | null;
  owner: string | null;
};

const accommodationFeatures = [
  'accommodation',
  'room-allocation',
  'allocate-room',
  'bed-capacity',
  'warden-assignment',
  'room-transfer',
  'review-occupancy',
  'occupancy-reports',
];

const careFeatures = [
  'student-care',
  'leave-passes',
  'issue-leave-pass',
  'visitor-register',
  'register-visitor',
  'meal-plans',
  'health-notes',
];

const administrationFeatures = [
  'administration',
  'hostel-fees',
  'inventory-checks',
  'incident-records',
  'log-incident',
  'occupancy-reports',
  'hostel-administration-report',
];

const incidentFeatures = ['incident-records', 'log-incident', 'health-notes'];

const hostelActions = [
  { label: 'Allocate room', href: '/modules/hostel/allocate-room', icon: <BedDouble size={16} /> },
  { label: 'Issue leave pass', href: '/modules/hostel/issue-leave-pass', icon: <DoorOpen size={16} /> },
  { label: 'Register visitor', href: '/modules/hostel/register-visitor', icon: <Users size={16} /> },
  { label: 'Log incident', href: '/modules/hostel/log-incident', icon: <ShieldAlert size={16} /> },
  { label: 'Review occupancy', href: '/modules/hostel/review-occupancy', icon: <BarChart3 size={16} /> },
];

const hostelDesks: Array<{
  title: string;
  eyebrow: string;
  summary: string;
  href: string;
  icon: ReactNode;
  tone: string;
  visual: HostelVisualType;
  points: string[];
}> = [
  {
    title: 'Accommodation',
    eyebrow: 'Room and bed control',
    summary: 'Assign blocks, floors, rooms, beds, resident category, transfer requests, and warden ownership.',
    href: '/modules/hostel/accommodation',
    icon: <Building2 size={20} strokeWidth={2.35} />,
    tone: 'from-emerald-500 to-teal-500',
    visual: 'rooms',
    points: ['Room allocation', 'Bed capacity', 'Warden assignment', 'Room transfer'],
  },
  {
    title: 'Student Care',
    eyebrow: 'Residential supervision',
    summary: 'Track leave passes, health notes, guardian approvals, meal category, and daily care follow-ups.',
    href: '/modules/hostel/student-care',
    icon: <HeartPulse size={20} strokeWidth={2.35} />,
    tone: 'from-violet-600 to-fuchsia-500',
    visual: 'care',
    points: ['Leave passes', 'Health notes', 'Care alerts', 'Guardian approval'],
  },
  {
    title: 'Visitors and Movement',
    eyebrow: 'Gate register',
    summary: 'Manage visitor ID checks, entry logs, exit timing, leave pass windows, and warden approvals.',
    href: '/modules/hostel/visitor-register',
    icon: <DoorOpen size={20} strokeWidth={2.35} />,
    tone: 'from-amber-500 to-orange-500',
    visual: 'visitors',
    points: ['Visitor register', 'Leave timing', 'ID check', 'Movement log'],
  },
  {
    title: 'Administration',
    eyebrow: 'Operations pack',
    summary: 'Coordinate hostel fees, inventory checks, incident records, meal plans, and occupancy reports.',
    href: '/modules/hostel/administration',
    icon: <PackageCheck size={20} strokeWidth={2.35} />,
    tone: 'from-sky-500 to-cyan-500',
    visual: 'administration',
    points: ['Hostel fees', 'Inventory checks', 'Incident records', 'Occupancy reports'],
  },
];

const hostelTopics = [
  'Room allocation',
  'Bed capacity',
  'Warden assignment',
  'Room transfer',
  'Leave passes',
  'Visitor register',
  'Meal plans',
  'Health notes',
  'Hostel fees',
  'Inventory checks',
  'Incident records',
  'Occupancy reports',
];

export default async function HostelPage() {
  const session = getSession();
  const institutionId = session?.institutionId;

  let totalRecords = 0;
  let accommodationRecords = 0;
  let careRecords = 0;
  let administrationRecords = 0;
  let incidentRecords = 0;
  let recentRecords: HostelRecord[] = [];

  if (institutionId) {
    [totalRecords, accommodationRecords, careRecords, administrationRecords, incidentRecords, recentRecords] = await Promise.all([
      db.moduleRecord.count({ where: { institutionId, module: 'hostel' } }),
      db.moduleRecord.count({ where: { institutionId, module: 'hostel', feature: { in: accommodationFeatures } } }),
      db.moduleRecord.count({ where: { institutionId, module: 'hostel', feature: { in: careFeatures } } }),
      db.moduleRecord.count({ where: { institutionId, module: 'hostel', feature: { in: administrationFeatures } } }),
      db.moduleRecord.count({ where: { institutionId, module: 'hostel', feature: { in: incidentFeatures } } }),
      db.moduleRecord.findMany({
        where: { institutionId, module: 'hostel' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, feature: true, title: true, status: true, priority: true, requester: true, owner: true },
      }),
    ]);
  }

  return (
    <div className="hostel-module space-y-5">
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0F172A] shadow-[0_24px_80px_rgba(2,6,23,.28)]">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_.95fr]">
          <div className="min-w-0 p-5 sm:p-6 lg:p-7">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-300">
              <Sparkles size={15} /> {workspace.eyebrow}
            </Link>
            <h1 className="mt-4 max-w-2xl text-3xl font-black text-white sm:text-4xl">Hostel residential command</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{workspace.description}</p>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/8 p-3">
              <form action="/search" className="flex min-w-0 gap-2 rounded-2xl border border-white/12 bg-[#08111F] p-2">
                <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
                  <Search size={17} className="shrink-0 text-slate-300" />
                  <input
                    name="q"
                    placeholder="Search residents, rooms, beds, wardens, visitors..."
                    className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                  />
                </div>
                <button className="grid h-10 w-11 shrink-0 place-items-center rounded-xl bg-emerald-300 text-slate-950 transition hover:bg-emerald-200" aria-label="Search hostel">
                  <Search size={18} />
                </button>
              </form>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                {hostelActions.map((action) => (
                  <Link key={action.label} href={action.href} className="flex min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-2 py-3 text-center text-xs font-bold text-white transition hover:-translate-y-0.5 hover:border-emerald-300/60 hover:bg-white/12">
                    <span className="grid h-9 w-9 place-items-center rounded-2xl bg-emerald-300/14 text-emerald-200">{action.icon}</span>
                    <span className="break-words">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
              {workspace.workflow.map((step, index) => (
                <HostelStep key={step.title} index={index} title={step.title} detail={step.detail} />
              ))}
            </div>
          </div>

          <aside className="border-t border-white/10 bg-[radial-gradient(circle_at_18%_20%,rgba(16,185,129,.25),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(124,58,237,.20),transparent_30%),linear-gradient(180deg,#08111F,#0F172A)] p-5 sm:p-6 lg:border-l lg:border-t-0 lg:p-7">
            <div className="erp-main-visual-frame mx-auto w-full max-w-[500px] shadow-[0_22px_55px_rgba(2,6,23,.34)]">
              <img src="/images/hostel-main-room-rounded.png?v=1" alt="" className="erp-main-visual-image w-full object-contain object-center" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <HostelMetric label="Records" value={totalRecords} note="Saved hostel work" />
              <HostelMetric label="Rooms" value={accommodationRecords} note="Allocation desk" />
              <HostelMetric label="Care" value={careRecords} note="Resident support" />
              <HostelMetric label="Incidents" value={incidentRecords} note="Care alerts" />
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_330px]">
        <main className="space-y-4">
          <section className="rounded-[24px] border border-white/10 bg-[#0F172A] p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">Hostel desks</p>
                <h2 className="mt-1 text-xl font-black text-white">Run rooms, care, movement, and administration</h2>
              </div>
              <Link href="/modules/hostel/hostel-administration-report" className="inline-flex items-center gap-1.5 rounded-xl border border-white/12 bg-white/10 px-3 py-2 text-sm font-bold text-emerald-200 transition hover:bg-white/14">
                Reports <ArrowRight size={15} />
              </Link>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {hostelDesks.map((desk) => (
                <HostelDeskCard key={desk.title} desk={desk} />
              ))}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[.95fr_1.05fr]">
            <div className="rounded-[24px] border border-white/10 bg-[#0F172A] p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-300/14 text-emerald-200">
                  <KeyRound size={21} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">Residential map</p>
                  <h2 className="mt-1 text-lg font-black text-white">Open the correct hostel queue</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Hostel operations work best when allocation, movement, care, fees, inventory, and incident follow-up are separated clearly.</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {hostelTopics.map((topic) => (
                  <Link key={topic} href={`/modules/hostel/${slugifyWorkspace(topic)}`} className="rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-emerald-300/60 hover:text-emerald-200">
                    {topic}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-[#0F172A] p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                  <BarChart3 size={20} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">Occupancy insight</p>
                  <h2 className="mt-1 text-lg font-black text-white">Rooms, care, and admin records</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Track residential occupancy, care activity, administration work, and report readiness from saved hostel records.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                {[
                  { label: 'Accommodation', value: accommodationRecords },
                  { label: 'Student care', value: careRecords },
                  { label: 'Administration', value: administrationRecords },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/8 p-3">
                    <p className="text-xs font-bold text-slate-300">{item.label}</p>
                    <p className="mt-2 text-2xl font-black text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <aside className="space-y-4">
          <section className="rounded-[24px] border border-white/10 bg-[#0F172A] p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">Recent movement</p>
                <h2 className="mt-1 text-lg font-black text-white">Hostel records</h2>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-300/14 text-emerald-200">
                <Building2 size={19} />
              </span>
            </div>

            {recentRecords.length ? (
              <div className="mt-4 space-y-2">
                {recentRecords.map((record) => (
                  <Link key={record.id} href={`/modules/hostel/${record.feature}`} className="block min-w-0 rounded-2xl border border-white/10 bg-white/8 p-3 transition hover:border-emerald-300/50 hover:bg-white/12">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-300">{record.feature.replace(/-/g, ' ')}</p>
                    <h3 className="mt-1 break-words text-sm font-black text-white">{record.title}</h3>
                    <p className="mt-1 text-xs text-slate-400">{record.requester ? `Resident: ${record.requester}` : record.owner ? `Owner: ${record.owner}` : 'Resident not attached'}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-slate-300">{record.status.replace(/_/g, ' ')}</span>
                      <span className="rounded-full bg-emerald-300/12 px-2.5 py-1 text-[11px] font-bold text-emerald-200">{record.priority.replace(/_/g, ' ')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-white/14 bg-white/8 p-5 text-sm leading-6 text-slate-300">
                No hostel records saved yet. Add real room allocation, leave pass, visitor, incident, fee, or inventory records and they will appear here.
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-[24px] border border-white/10 bg-[#0F172A] shadow-sm">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-5 text-white">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/18 ring-1 ring-white/25">
                  <ClipboardCheck size={22} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Warden checklist</p>
                  <h2 className="text-lg font-black text-white">Daily residential control</h2>
                </div>
              </div>
            </div>
            <div className="space-y-2 p-4">
              {['Room count verified', 'Leave pass reviewed', 'Visitor ID checked', 'Incident follow-up assigned'].map((item) => (
                <div key={item} className="flex min-w-0 items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-sm font-semibold text-slate-200">
                  <CheckCircle2 size={15} className="shrink-0 text-emerald-300" />
                  <span className="min-w-0 break-words">{item}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

function HostelStep({ index, title, detail }: { index: number; title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 p-3">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-300/18 text-xs font-black text-emerald-100">{index + 1}</span>
      <h3 className="mt-3 break-words text-sm font-black text-white">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-300">{detail}</p>
    </div>
  );
}

function HostelDeskCard({
  desk,
}: {
  desk: {
    title: string;
    eyebrow: string;
    summary: string;
    href: string;
    icon: ReactNode;
    tone: string;
    visual: HostelVisualType;
    points: string[];
  };
}) {
  return (
    <Link href={desk.href} className="group min-w-0 overflow-hidden rounded-[24px] border border-white/10 bg-white/8 p-4 transition hover:-translate-y-0.5 hover:border-emerald-300/50 hover:bg-white/12 hover:shadow-md">
      <div className="flex items-start gap-3">
        <IconTile tone={desk.tone}>{desk.icon}</IconTile>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-300">{desk.eyebrow}</p>
          <h3 className="mt-1 break-words text-lg font-black text-white">{desk.title}</h3>
          <p className="mt-2 text-xs leading-5 text-slate-300">{desk.summary}</p>
        </div>
      </div>
      <div className="mt-4">
        <HostelMiniVisual visual={desk.visual} tone={desk.tone} points={desk.points} />
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-emerald-200">
        Open desk <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function HostelMiniVisual({ visual, tone, points }: { visual: HostelVisualType; tone: string; points: string[] }) {
  if (visual === 'rooms') {
    return (
      <div className="h-full min-h-40 rounded-2xl border border-white/10 bg-[#101A2D] p-4 shadow-sm">
        <div className="grid grid-cols-3 gap-2">
          {points.map((point, index) => (
            <div key={point} className={`rounded-2xl border border-white/10 p-3 ${index % 2 ? 'bg-white/8' : 'bg-emerald-300/12'}`}>
              <span className="block h-8 rounded-xl bg-white/12" />
              <p className="mt-3 text-[11px] font-bold text-slate-300">Block {index + 1}</p>
            </div>
          ))}
        </div>
        <VisualLine text="Room, bed, resident, and warden linked" />
      </div>
    );
  }

  if (visual === 'care') {
    return (
      <div className="h-full min-h-40 rounded-2xl border border-white/10 bg-[#101A2D] p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className={`rounded-2xl bg-gradient-to-br ${tone} p-4 text-white`}>
            <HeartPulse size={26} />
            <p className="mt-3 text-xs font-black">Care notes</p>
          </div>
          <div className="rounded-2xl bg-white/8 p-4 text-slate-200">
            <DoorOpen size={26} />
            <p className="mt-3 text-xs font-black">Leave pass</p>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-white/10">
          <span className={`block h-2 w-3/4 rounded-full bg-gradient-to-r ${tone}`} />
        </div>
      </div>
    );
  }

  if (visual === 'visitors') {
    return (
      <div className="h-full min-h-40 rounded-2xl border border-white/10 bg-[#101A2D] p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${tone} text-white`}>
            <Users size={27} />
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <span className="block h-2 rounded-full bg-white/14" />
            <span className="block h-2 w-3/4 rounded-full bg-white/14" />
            <span className="block h-2 w-1/2 rounded-full bg-white/14" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <VisualLine text="In time" />
          <VisualLine text="Exit check" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-40 rounded-2xl border border-white/10 bg-[#101A2D] p-4 shadow-sm">
      <div className="flex items-end gap-2">
        {[74, 102, 86, 118, 94].map((height, index) => (
          <span key={height} className={`block flex-1 rounded-t-xl bg-gradient-to-t ${tone}`} style={{ height: `${height}px`, opacity: 0.68 + index * 0.06 }} />
        ))}
      </div>
      <p className="mt-4 text-xs font-bold text-slate-300">Fees, inventory, incidents, occupancy</p>
    </div>
  );
}

function VisualLine({ text }: { text: string }) {
  return (
    <div className="mt-3 flex min-w-0 items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-xs font-semibold text-slate-200">
      <CheckCircle2 size={14} className="shrink-0 text-emerald-300" />
      <span className="min-w-0 break-words">{text}</span>
    </div>
  );
}

function HostelMetric({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white shadow-sm backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/55">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-[11px] leading-4 text-white/60">{note}</p>
    </div>
  );
}

function IconTile({ children, tone }: { children: ReactNode; tone: string }) {
  return (
    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-[0_16px_30px_rgba(15,23,42,.16)]`}>
      {children}
    </span>
  );
}
