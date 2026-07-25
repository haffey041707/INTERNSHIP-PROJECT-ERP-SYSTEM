import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bus,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  MapPinned,
  Navigation,
  Radio,
  Route,
  Search,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { db } from '@/lib/db';
import { getMainWorkspace, slugifyWorkspace } from '@/lib/main-workspaces';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

const workspace = getMainWorkspace('transport')!;

type TransportVisualType = 'routes' | 'fleet' | 'trips' | 'safety';

type TransportRecord = {
  id: string;
  feature: string;
  title: string;
  status: string;
  priority: string;
  requester: string | null;
  owner: string | null;
};

const routeFeatures = ['route-planning', 'route-map', 'stops', 'add-stop', 'pickup-assignment', 'capacity-balancing', 'create-route'];
const fleetFeatures = ['fleet', 'vehicle-register', 'assign-vehicle', 'driver-assignment', 'maintenance-schedule', 'fuel-logs'];
const operationsFeatures = ['operations', 'daily-trip-sheet', 'record-trip-sheet', 'transport-fees', 'guardian-notifications'];
const safetyFeatures = ['incident-records', 'log-incident', 'incident-summary', 'maintenance-schedule'];

const transportActions = [
  { label: 'Create route', href: '/modules/transport/create-route', icon: <Route size={16} /> },
  { label: 'Assign vehicle', href: '/modules/transport/assign-vehicle', icon: <Bus size={16} /> },
  { label: 'Add stop', href: '/modules/transport/add-stop', icon: <MapPinned size={16} /> },
  { label: 'Record trip sheet', href: '/modules/transport/record-trip-sheet', icon: <ClipboardCheck size={16} /> },
  { label: 'Log incident', href: '/modules/transport/log-incident', icon: <ShieldAlert size={16} /> },
];

const transportDesks: Array<{
  title: string;
  eyebrow: string;
  summary: string;
  href: string;
  icon: ReactNode;
  tone: string;
  visual: TransportVisualType;
  points: string[];
}> = [
  {
    title: 'Route Planning',
    eyebrow: 'Map and stops',
    summary: 'Plan route coverage, stop order, pickup points, capacity rules, area ownership, and route status.',
    href: '/modules/transport/route-planning',
    icon: <MapPinned size={20} strokeWidth={2.35} />,
    tone: 'from-sky-500 to-cyan-500',
    visual: 'routes',
    points: ['Route map', 'Stops', 'Pickup assignment', 'Capacity balancing'],
  },
  {
    title: 'Fleet Control',
    eyebrow: 'Vehicle readiness',
    summary: 'Manage vehicle register, driver assignment, maintenance reminders, fuel logs, and compliance documents.',
    href: '/modules/transport/fleet',
    icon: <Bus size={20} strokeWidth={2.35} />,
    tone: 'from-violet-600 to-fuchsia-500',
    visual: 'fleet',
    points: ['Vehicle register', 'Driver assignment', 'Maintenance schedule', 'Fuel logs'],
  },
  {
    title: 'Daily Operations',
    eyebrow: 'Trip desk',
    summary: 'Run daily trip sheets, pickup confirmation, rider status, route changes, and guardian notifications.',
    href: '/modules/transport/operations',
    icon: <Navigation size={20} strokeWidth={2.35} />,
    tone: 'from-emerald-500 to-teal-500',
    visual: 'trips',
    points: ['Daily trip sheet', 'Trip confirmation', 'Rider status', 'Guardian notifications'],
  },
  {
    title: 'Safety and Incidents',
    eyebrow: 'Service control',
    summary: 'Record incidents, driver duty exceptions, vehicle issues, safety checks, and escalation notes.',
    href: '/modules/transport/incident-records',
    icon: <ShieldAlert size={20} strokeWidth={2.35} />,
    tone: 'from-amber-500 to-orange-500',
    visual: 'safety',
    points: ['Incident records', 'Incident severity', 'Driver duty', 'Service alerts'],
  },
];

const transportTopics = [
  'Route map',
  'Stops',
  'Pickup assignment',
  'Capacity balancing',
  'Vehicle register',
  'Driver assignment',
  'Maintenance schedule',
  'Fuel logs',
  'Daily trip sheet',
  'Transport fees',
  'Incident records',
  'Guardian notifications',
];

export default async function TransportPage() {
  const session = getSession();
  const institutionId = session?.institutionId;

  let totalRecords = 0;
  let routeRecords = 0;
  let fleetRecords = 0;
  let operationsRecords = 0;
  let safetyRecords = 0;
  let recentRecords: TransportRecord[] = [];

  if (institutionId) {
    [totalRecords, routeRecords, fleetRecords, operationsRecords, safetyRecords, recentRecords] = await Promise.all([
      db.moduleRecord.count({ where: { institutionId, module: 'transport' } }),
      db.moduleRecord.count({ where: { institutionId, module: 'transport', feature: { in: routeFeatures } } }),
      db.moduleRecord.count({ where: { institutionId, module: 'transport', feature: { in: fleetFeatures } } }),
      db.moduleRecord.count({ where: { institutionId, module: 'transport', feature: { in: operationsFeatures } } }),
      db.moduleRecord.count({ where: { institutionId, module: 'transport', feature: { in: safetyFeatures } } }),
      db.moduleRecord.findMany({
        where: { institutionId, module: 'transport' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, feature: true, title: true, status: true, priority: true, requester: true, owner: true },
      }),
    ]);
  }

  return (
    <div className="transport-module space-y-5">
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0F172A] shadow-[0_24px_80px_rgba(2,6,23,.28)]">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_.95fr]">
          <div className="min-w-0 p-5 sm:p-6 lg:p-7">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-300">
              <Sparkles size={15} /> {workspace.eyebrow}
            </Link>
            <h1 className="mt-4 max-w-2xl text-3xl font-black text-white sm:text-4xl">Transport route command</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{workspace.description}</p>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/8 p-3">
              <form action="/search" className="flex min-w-0 gap-2 rounded-2xl border border-white/12 bg-[#08111F] p-2">
                <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
                  <Search size={17} className="shrink-0 text-slate-300" />
                  <input
                    name="q"
                    placeholder="Search routes, stops, vehicles, drivers, trips..."
                    className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                  />
                </div>
                <button className="grid h-10 w-11 shrink-0 place-items-center rounded-xl bg-cyan-300 text-slate-950 transition hover:bg-cyan-200" aria-label="Search transport">
                  <Search size={18} />
                </button>
              </form>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                {transportActions.map((action) => (
                  <Link key={action.label} href={action.href} className="flex min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-2 py-3 text-center text-xs font-bold text-white transition hover:-translate-y-0.5 hover:border-cyan-300/60 hover:bg-white/12">
                    <span className="grid h-9 w-9 place-items-center rounded-2xl bg-cyan-300/14 text-cyan-200">{action.icon}</span>
                    <span className="break-words">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
              {workspace.workflow.map((step, index) => (
                <TransportStep key={step.title} index={index} title={step.title} detail={step.detail} />
              ))}
            </div>
          </div>

          <aside className="border-t border-white/10 bg-[radial-gradient(circle_at_18%_20%,rgba(14,165,233,.25),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(20,184,166,.20),transparent_30%),linear-gradient(180deg,#08111F,#0F172A)] p-5 sm:p-6 lg:border-l lg:border-t-0 lg:p-7">
            <div className="erp-main-visual-frame mx-auto w-full max-w-[460px] shadow-[0_22px_55px_rgba(2,6,23,.34)]">
              <img src="/images/transport-main-gps-rounded.png?v=1" alt="" className="erp-main-visual-image w-full object-contain object-center" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <TransportMetric label="Records" value={totalRecords} note="Saved transport work" />
              <TransportMetric label="Routes" value={routeRecords} note="Mapped coverage" />
              <TransportMetric label="Fleet" value={fleetRecords} note="Vehicle readiness" />
              <TransportMetric label="Safety" value={safetyRecords} note="Incident desk" />
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_330px]">
        <main className="space-y-4">
          <section className="rounded-[24px] border border-white/10 bg-[#0F172A] p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Transport desks</p>
                <h2 className="mt-1 text-xl font-black text-white">Run routes, fleet, trips, and safety</h2>
              </div>
              <Link href="/modules/transport/daily-trip-sheet" className="inline-flex items-center gap-1.5 rounded-xl border border-white/12 bg-white/10 px-3 py-2 text-sm font-bold text-cyan-200 transition hover:bg-white/14">
                Trip sheet <ArrowRight size={15} />
              </Link>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {transportDesks.map((desk) => (
                <TransportDeskCard key={desk.title} desk={desk} />
              ))}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[.95fr_1.05fr]">
            <div className="rounded-[24px] border border-white/10 bg-[#0F172A] p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-300/14 text-cyan-200">
                  <Route size={21} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Route map</p>
                  <h2 className="mt-1 text-lg font-black text-white">Open the correct transport queue</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Transport operations work best when route planning, vehicle readiness, daily trips, fees, safety, and guardian updates are separated clearly.</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {transportTopics.map((topic) => (
                  <Link key={topic} href={`/modules/transport/${slugifyWorkspace(topic)}`} className="rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-cyan-300/60 hover:text-cyan-200">
                    {topic}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-[#0F172A] p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white">
                  <Gauge size={20} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Operations insight</p>
                  <h2 className="mt-1 text-lg font-black text-white">Routes, fleet, and trip records</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Track mapped routes, vehicle readiness, daily trip work, and safety follow-up from saved transport records.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                {[
                  { label: 'Route work', value: routeRecords },
                  { label: 'Fleet work', value: fleetRecords },
                  { label: 'Trip work', value: operationsRecords },
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
                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Recent movement</p>
                <h2 className="mt-1 text-lg font-black text-white">Transport records</h2>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cyan-300/14 text-cyan-200">
                <Bus size={19} />
              </span>
            </div>

            {recentRecords.length ? (
              <div className="mt-4 space-y-2">
                {recentRecords.map((record) => (
                  <Link key={record.id} href={`/modules/transport/${record.feature}`} className="block min-w-0 rounded-2xl border border-white/10 bg-white/8 p-3 transition hover:border-cyan-300/50 hover:bg-white/12">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-300">{record.feature.replace(/-/g, ' ')}</p>
                    <h3 className="mt-1 break-words text-sm font-black text-white">{record.title}</h3>
                    <p className="mt-1 text-xs text-slate-400">{record.requester ? `Rider: ${record.requester}` : record.owner ? `Owner: ${record.owner}` : 'Rider not attached'}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-slate-300">{record.status.replace(/_/g, ' ')}</span>
                      <span className="rounded-full bg-cyan-300/12 px-2.5 py-1 text-[11px] font-bold text-cyan-200">{record.priority.replace(/_/g, ' ')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-white/14 bg-white/8 p-5 text-sm leading-6 text-slate-300">
                No transport records saved yet. Add real route, stop, vehicle, driver, trip, fee, or incident records and they will appear here.
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-[24px] border border-white/10 bg-[#0F172A] shadow-sm">
            <div className="bg-gradient-to-br from-sky-500 to-cyan-500 p-5 text-white">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/18 ring-1 ring-white/25">
                  <ClipboardCheck size={22} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Dispatcher checklist</p>
                  <h2 className="text-lg font-black text-white">Daily trip control</h2>
                </div>
              </div>
            </div>
            <div className="space-y-2 p-4">
              {['Route timing verified', 'Driver duty confirmed', 'Vehicle readiness checked', 'Incident channel open'].map((item) => (
                <div key={item} className="flex min-w-0 items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-sm font-semibold text-slate-200">
                  <CheckCircle2 size={15} className="shrink-0 text-cyan-300" />
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

function TransportStep({ index, title, detail }: { index: number; title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 p-3">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-cyan-300/18 text-xs font-black text-cyan-100">{index + 1}</span>
      <h3 className="mt-3 break-words text-sm font-black text-white">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-300">{detail}</p>
    </div>
  );
}

function TransportDeskCard({
  desk,
}: {
  desk: {
    title: string;
    eyebrow: string;
    summary: string;
    href: string;
    icon: ReactNode;
    tone: string;
    visual: TransportVisualType;
    points: string[];
  };
}) {
  return (
    <Link href={desk.href} className="group min-w-0 overflow-hidden rounded-[24px] border border-white/10 bg-white/8 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-white/12 hover:shadow-md">
      <div className="flex items-start gap-3">
        <IconTile tone={desk.tone}>{desk.icon}</IconTile>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-300">{desk.eyebrow}</p>
          <h3 className="mt-1 break-words text-lg font-black text-white">{desk.title}</h3>
          <p className="mt-2 text-xs leading-5 text-slate-300">{desk.summary}</p>
        </div>
      </div>
      <div className="mt-4">
        <TransportMiniVisual visual={desk.visual} tone={desk.tone} points={desk.points} />
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-cyan-200">
        Open desk <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function TransportMiniVisual({ visual, tone, points }: { visual: TransportVisualType; tone: string; points: string[] }) {
  if (visual === 'routes') {
    return (
      <div className="grid items-stretch gap-3 sm:grid-cols-[minmax(138px,.82fr)_1fr]">
        <div className="erp-main-visual-frame shadow-[0_16px_38px_rgba(2,6,23,.26)]">
          <img
            src="/images/transport-route-planning-map-rounded.png?v=1"
            alt=""
            className="erp-main-visual-image aspect-square w-full object-cover object-center"
          />
        </div>
        <div className="grid gap-2">
          {points.map((point, index) => (
            <div key={point} className="flex min-w-0 items-center gap-2 rounded-2xl bg-white/8 px-3 py-2 ring-1 ring-white/10">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-cyan-300/14 text-[10px] font-black text-cyan-200">{index + 1}</span>
              <p className="min-w-0 break-words text-xs font-bold text-slate-200">{point}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visual === 'fleet') {
    return (
      <div className="h-full min-h-40 rounded-2xl border border-white/10 bg-[#101A2D] p-4 shadow-sm">
        <div className={`rounded-2xl bg-gradient-to-br ${tone} p-4 text-white`}>
          <Bus size={28} />
          <p className="mt-3 text-xs font-black">Vehicle and driver ready</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <VisualLine text="Maintenance" />
          <VisualLine text="Fuel logs" />
        </div>
      </div>
    );
  }

  if (visual === 'trips') {
    return (
      <div className="h-full min-h-40 rounded-2xl border border-white/10 bg-[#101A2D] p-4 shadow-sm">
        <div className="space-y-3">
          {points.slice(0, 3).map((point, index) => (
            <div key={point} className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-white">{point}</p>
                <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-cyan-200">{index + 1}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <span className={`block h-2 rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${80 - index * 15}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-40 rounded-2xl border border-white/10 bg-[#101A2D] p-4 shadow-sm">
      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-2xl bg-gradient-to-br ${tone} p-4 text-white`}>
          <ShieldAlert size={27} />
          <p className="mt-3 text-xs font-black">Incident</p>
        </div>
        <div className="rounded-2xl bg-white/8 p-4 text-slate-200">
          <Radio size={27} />
          <p className="mt-3 text-xs font-black">Alert</p>
        </div>
      </div>
      <VisualLine text="Safety and escalation ready" />
    </div>
  );
}

function VisualLine({ text }: { text: string }) {
  return (
    <div className="mt-3 flex min-w-0 items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-xs font-semibold text-slate-200">
      <CheckCircle2 size={14} className="shrink-0 text-cyan-300" />
      <span className="min-w-0 break-words">{text}</span>
    </div>
  );
}

function TransportMetric({ label, value, note }: { label: string; value: number; note: string }) {
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
