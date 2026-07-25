import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Headphones,
  LifeBuoy,
  MessageSquare,
  PhoneCall,
  Search,
  Send,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { db } from '@/lib/db';
import { getMainWorkspace, slugifyWorkspace } from '@/lib/main-workspaces';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

const workspace = getMainWorkspace('support')!;

type SupportRecord = {
  id: string;
  feature: string;
  title: string;
  status: string;
  priority: string;
  owner: string | null;
};

type SupportVisualType = 'intake' | 'resolution' | 'quality' | 'escalation';

const intakeFeatures = ['request-intake', 'student-support', 'staff-requests', 'parent-messages', 'department-issues', 'create-request'];
const resolutionFeatures = ['resolution-desk', 'ticket-assignment', 'priority-rules', 'internal-notes', 'escalations', 'assign-owner', 'escalate-case', 'send-update', 'close-request'];
const qualityFeatures = ['service-quality', 'sla-dashboard', 'feedback-ratings', 'issue-trends', 'support-reports'];

const supportActions = [
  { label: 'Create request', href: '/modules/support/create-request', icon: <Send size={16} /> },
  { label: 'Assign owner', href: '/modules/support/assign-owner', icon: <UserCheck size={16} /> },
  { label: 'Escalate case', href: '/modules/support/escalate-case', icon: <AlertTriangle size={16} /> },
  { label: 'Send update', href: '/modules/support/send-update', icon: <MessageSquare size={16} /> },
  { label: 'Close request', href: '/modules/support/close-request', icon: <CheckCircle2 size={16} /> },
];

const supportDesks: Array<{
  title: string;
  eyebrow: string;
  summary: string;
  href: string;
  icon: ReactNode;
  tone: string;
  visual: SupportVisualType;
  points: string[];
}> = [
  {
    title: 'Request Intake',
    eyebrow: 'First response',
    summary: 'Capture student, staff, parent, and department requests from one professional service channel.',
    href: '/modules/support/request-intake',
    icon: <LifeBuoy size={20} strokeWidth={2.35} />,
    tone: 'from-sky-500 to-cyan-500',
    visual: 'intake',
    points: ['Request category', 'Requester type', 'Priority level', 'Visibility rules'],
  },
  {
    title: 'Resolution Desk',
    eyebrow: 'Owner queue',
    summary: 'Assign tickets, set response ownership, manage internal notes, and track every resolution action.',
    href: '/modules/support/resolution-desk',
    icon: <UserCheck size={20} strokeWidth={2.35} />,
    tone: 'from-violet-600 to-fuchsia-500',
    visual: 'resolution',
    points: ['Ticket assignment', 'Owner queue', 'Internal notes', 'Response templates'],
  },
  {
    title: 'SLA & Escalation',
    eyebrow: 'Service control',
    summary: 'Watch urgent requests, escalation paths, due windows, SLA gaps, and service deadlines.',
    href: '/modules/support/escalations',
    icon: <Clock3 size={20} strokeWidth={2.35} />,
    tone: 'from-amber-500 to-orange-500',
    visual: 'escalation',
    points: ['SLA timer', 'Escalation path', 'Priority rules', 'SLA exceptions'],
  },
  {
    title: 'Service Quality',
    eyebrow: 'Improvement loop',
    summary: 'Review feedback, issue trends, owner performance, response quality, and management reports.',
    href: '/modules/support/service-quality',
    icon: <BarChart3 size={20} strokeWidth={2.35} />,
    tone: 'from-emerald-500 to-teal-500',
    visual: 'quality',
    points: ['Feedback ratings', 'Issue trends', 'Support reports', 'Management exports'],
  },
];

const supportTopics = [
  'Student support',
  'Staff requests',
  'Parent messages',
  'Department issues',
  'Ticket assignment',
  'Priority rules',
  'Escalations',
  'SLA dashboard',
  'Feedback ratings',
  'Issue trends',
];

export default async function SupportPage() {
  const session = getSession();
  const institutionId = session?.institutionId;

  let totalRecords = 0;
  let intakeRecords = 0;
  let resolutionRecords = 0;
  let qualityRecords = 0;
  let urgentRecords = 0;
  let recentRecords: SupportRecord[] = [];

  if (institutionId) {
    [totalRecords, intakeRecords, resolutionRecords, qualityRecords, urgentRecords, recentRecords] = await Promise.all([
      db.moduleRecord.count({ where: { institutionId, module: 'support' } }),
      db.moduleRecord.count({ where: { institutionId, module: 'support', feature: { in: intakeFeatures } } }),
      db.moduleRecord.count({ where: { institutionId, module: 'support', feature: { in: resolutionFeatures } } }),
      db.moduleRecord.count({ where: { institutionId, module: 'support', feature: { in: qualityFeatures } } }),
      db.moduleRecord.count({ where: { institutionId, module: 'support', priority: { in: ['HIGH', 'URGENT'] }, status: { not: 'CLOSED' } } }),
      db.moduleRecord.findMany({
        where: { institutionId, module: 'support' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, feature: true, title: true, status: true, priority: true, owner: true },
      }),
    ]);
  }

  return (
    <div className="support-module space-y-5">
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0F172A] shadow-[0_24px_80px_rgba(2,6,23,.28)]">
        <div className="grid gap-0 lg:grid-cols-[250px_1fr_240px] 2xl:grid-cols-[310px_1fr_310px]">
          <aside className="order-2 min-w-0 border-b border-white/10 bg-[radial-gradient(circle_at_20%_18%,rgba(14,165,233,.22),transparent_32%),linear-gradient(180deg,#08111F,#0F172A)] p-5 lg:order-1 lg:border-b-0 lg:border-r">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Agent console</p>
            <div className="erp-main-visual-frame mt-4 shadow-[0_22px_55px_rgba(2,6,23,.34)]">
              <img src="/images/support-main-helpdesk-rounded.png?v=1" alt="" className="erp-main-visual-image w-full object-contain object-center" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <SupportMetric label="Tickets" value={totalRecords} note="Saved" />
              <SupportMetric label="Urgent" value={urgentRecords} note="Open high" />
            </div>
          </aside>

          <div className="order-1 min-w-0 p-5 sm:p-6 lg:order-2 lg:p-7">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-300">
              <Sparkles size={15} /> {workspace.eyebrow}
            </Link>
            <h1 className="mt-4 max-w-2xl text-3xl font-black text-white sm:text-4xl">Support service desk</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{workspace.description}</p>

            <form action="/search" className="mt-6 flex min-w-0 gap-2 rounded-2xl border border-white/12 bg-white/10 p-2 shadow-inner">
              <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
                <Search size={17} className="shrink-0 text-slate-300" />
                <input
                  name="q"
                  placeholder="Search tickets, owners, SLA, requester, issue..."
                  className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                />
              </div>
              <button className="grid h-10 w-11 shrink-0 place-items-center rounded-xl bg-cyan-400 text-slate-950 transition hover:bg-cyan-300" aria-label="Search support">
                <Search size={18} />
              </button>
            </form>

            <div className="support-action-row mt-4 flex flex-wrap gap-2">
              {supportActions.map((action) => (
                <Link key={action.label} href={action.href} className="support-action-chip inline-flex min-w-0 items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300/60 hover:bg-white/14">
                  <span className="support-action-chip-icon grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cyan-300/14 text-cyan-200">{action.icon}</span>
                  <span className="break-words">{action.label}</span>
                </Link>
              ))}
            </div>

            <div className="support-workflow-grid mt-6 grid gap-3 md:grid-cols-4">
              {workspace.workflow.map((step, index) => (
                <SupportConsoleStep key={step.title} index={index} title={step.title} detail={step.detail} />
              ))}
            </div>
          </div>

          <aside className="order-3 min-w-0 overflow-hidden border-t border-white/10 bg-[#08111F] p-5 lg:border-l lg:border-t-0">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300/14 text-cyan-200">
                <Clock3 size={23} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Live SLA board</p>
                <h2 className="text-lg font-black text-white">Service pulse</h2>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <SupportSignal label="Intake queue" value={intakeRecords} detail="Captured requests" tone="from-sky-500 to-cyan-500" />
              <SupportSignal label="Resolution queue" value={resolutionRecords} detail="Owner work" tone="from-violet-600 to-fuchsia-500" />
              <SupportSignal label="Quality loop" value={qualityRecords} detail="Reports and feedback" tone="from-emerald-500 to-teal-500" />
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_330px]">
        <main className="space-y-4">
          <section className="rounded-[24px] border border-white/10 bg-[#0F172A] p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Support desks</p>
                <h2 className="mt-1 text-xl font-black text-white">Choose the service area</h2>
              </div>
              <Link href="/modules/support/support-reports" className="inline-flex items-center gap-1.5 rounded-xl border border-white/12 bg-white/10 px-3 py-2 text-sm font-bold text-cyan-200 transition hover:bg-white/14">
                Reports <ArrowRight size={15} />
              </Link>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {supportDesks.map((desk) => (
                <SupportDeskCard key={desk.title} desk={desk} />
              ))}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[.94fr_1.06fr]">
            <div className="rounded-[24px] border border-white/10 bg-[#0F172A] p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-300/14 text-cyan-200">
                  <Clock3 size={21} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Service flow</p>
                  <h2 className="mt-1 text-lg font-black text-white">Capture, route, resolve, improve</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Support work should move like a service desk: clean intake, visible ownership, escalation, and feedback.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {workspace.workflow.map((step, index) => (
                  <Link key={step.title} href={`/modules/support/service-flow/${slugifyWorkspace(step.title)}`} className="group rounded-2xl border border-white/10 bg-white/8 p-3 transition hover:border-cyan-300/50 hover:bg-white/12">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-cyan-300/18 text-xs font-black text-cyan-100">{index + 1}</span>
                    <span className="mt-3 flex items-start gap-2">
                      <h3 className="min-w-0 flex-1 text-sm font-black text-white">{step.title}</h3>
                      <ArrowRight size={13} className="shrink-0 text-cyan-200 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </span>
                    <p className="mt-1 text-xs leading-5 text-slate-300">{step.detail}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-[#0F172A] p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white">
                  <Search size={20} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Fast filters</p>
                  <h2 className="mt-1 text-lg font-black text-white">Find the right queue</h2>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {supportTopics.map((topic) => (
                  <Link key={topic} href={`/modules/support/${slugifyWorkspace(topic)}`} className="rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-cyan-300/60 hover:text-cyan-200">
                    {topic}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </main>

        <aside className="space-y-4">
          <section className="rounded-[24px] border border-white/10 bg-[#0F172A] p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Ticket wall</p>
                <h2 className="mt-1 text-lg font-black text-white">Recent requests</h2>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-300/14 text-emerald-200">
                <Headphones size={19} />
              </span>
            </div>

            {recentRecords.length ? (
              <div className="mt-4 space-y-2">
                {recentRecords.map((record) => (
                  <Link key={record.id} href={`/modules/support/${record.feature}`} className="block min-w-0 rounded-2xl border border-white/10 bg-white/8 p-3 transition hover:border-cyan-300/50 hover:bg-white/12">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-300">{record.feature.replace(/-/g, ' ')}</p>
                        <h3 className="mt-1 break-words text-sm font-black text-white">{record.title}</h3>
                        <p className="mt-1 text-xs text-slate-400">{record.owner ? `Owner: ${record.owner}` : 'Owner not assigned'}</p>
                      </div>
                      <span className={priorityBadgeClass(record.priority)}>{record.priority}</span>
                    </div>
                    <span className="mt-3 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-slate-300">{record.status.replace(/_/g, ' ')}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-white/14 bg-white/8 p-5 text-sm leading-6 text-slate-300">
                No support requests saved yet. Create real request records from Support options and they will appear here.
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-[24px] border border-white/10 bg-[#0F172A] shadow-sm">
            <div className="bg-gradient-to-br from-cyan-500 to-teal-500 p-5 text-white">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/18 ring-1 ring-white/25">
                  <PhoneCall size={22} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Support channels</p>
                  <h2 className="text-lg font-black text-white">One desk, many requests</h2>
                </div>
              </div>
            </div>
            <div className="space-y-2 p-4">
              {['Student and parent requests', 'Staff and department issues', 'Escalation and owner queues', 'Feedback and service reports'].map((item) => (
                <Link key={item} href={`/modules/support/support-channels/${slugifyWorkspace(item)}`} className="group flex min-w-0 items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/12 hover:text-cyan-200">
                  <CheckCircle2 size={15} className="shrink-0 text-cyan-300" />
                  <span className="min-w-0 break-words">{item}</span>
                  <ArrowRight size={13} className="ml-auto shrink-0 opacity-0 transition group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

function priorityBadgeClass(priority: string) {
  const base = 'shrink-0 rounded-full border px-2 py-1 text-[11px] font-black';

  if (priority === 'URGENT') return `${base} border-red-300/40 bg-red-400/16 text-red-100`;
  if (priority === 'HIGH') return `${base} border-orange-300/40 bg-orange-400/16 text-orange-100`;
  if (priority === 'LOW') return `${base} border-slate-300/20 bg-white/8 text-slate-300`;
  return `${base} border-cyan-300/30 bg-cyan-300/12 text-cyan-100`;
}

function SupportConsoleStep({ index, title, detail }: { index: number; title: string; detail: string }) {
  return (
    <Link href={`/modules/support/service-flow/${slugifyWorkspace(title)}`} className="support-workflow-card group relative min-w-0 rounded-2xl border border-white/10 bg-white/8 p-3 transition hover:border-cyan-300/50 hover:bg-white/12">
      <span data-step-index className="grid h-8 w-8 place-items-center rounded-xl bg-cyan-300/18 text-xs font-black text-cyan-100">{index + 1}</span>
      <span className="mt-3 flex items-start gap-2">
        <h3 className="min-w-0 flex-1 break-words text-sm font-black text-white">{title}</h3>
        <ArrowRight size={13} className="shrink-0 text-cyan-200 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
      </span>
      <p className="mt-1 text-xs leading-5 text-slate-300">{detail}</p>
    </Link>
  );
}

function SupportSignal({ label, value, detail, tone }: { label: string; value: number; detail: string; tone: string }) {
  const toneKey = supportToneKey(tone);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-xs font-bold text-slate-300">{label}</p>
          <p className="mt-1 text-2xl font-black text-white">{value}</p>
        </div>
        <span className={`support-chart-chip support-chart-${toneKey} block h-10 w-10 rounded-2xl`} />
      </div>
      <p className="mt-2 break-words text-[11px] text-slate-400">{detail}</p>
      <div className="mt-3 h-2 rounded-full bg-white/10">
        <span className={`support-chart-fill support-chart-${toneKey} block h-2 rounded-full`} style={{ width: `${Math.min(88, 36 + value * 8)}%` }} />
      </div>
    </div>
  );
}

function SupportDeskCard({
  desk,
}: {
  desk: {
    title: string;
    eyebrow: string;
    summary: string;
    href: string;
    icon: ReactNode;
    tone: string;
    visual: SupportVisualType;
    points: string[];
  };
}) {
  return (
    <article className="group min-w-0 overflow-hidden rounded-[24px] border border-white/10 bg-white/8 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-white/12 hover:shadow-md">
      <Link href={desk.href} className="flex items-start gap-3">
        <IconTile tone={desk.tone}>{desk.icon}</IconTile>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-300">{desk.eyebrow}</p>
          <h3 className="mt-1 break-words text-lg font-black text-white">{desk.title}</h3>
          <p className="mt-2 text-xs leading-5 text-slate-300">{desk.summary}</p>
        </div>
      </Link>
      <div className="mt-4">
        <SupportMiniVisual visual={desk.visual} tone={desk.tone} points={desk.points} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {desk.points.slice(0, 3).map((point) => (
          <Link key={point} href={`${desk.href}/${slugifyWorkspace(point)}`} className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[11px] font-bold text-slate-200 transition hover:border-cyan-300/60 hover:text-cyan-200">{point}</Link>
        ))}
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-cyan-200">
        <Link href={desk.href} className="inline-flex items-center gap-1">
          Open desk <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
        </Link>
      </span>
    </article>
  );
}

function SupportMiniVisual({ visual, tone, points }: { visual: SupportVisualType; tone: string; points: string[] }) {
  const toneKey = supportToneKey(tone);

  if (visual === 'intake') {
    return (
      <div className="h-full min-h-40 rounded-2xl border border-white/10 bg-[#101A2D] p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className={`support-chart-chip support-chart-${toneKey} grid h-12 w-12 place-items-center rounded-2xl text-white`}>
            <LifeBuoy size={24} />
          </span>
          <div>
            <p className="text-xs font-black text-white">Request intake</p>
            <p className="text-[11px] text-slate-400">Classify and route</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          {['Student', 'Staff', 'Parent', 'Dept'].map((item) => (
            <span key={item} className="rounded-xl bg-white/8 px-2 py-2 text-center text-[11px] font-bold text-slate-200">{item}</span>
          ))}
        </div>
      </div>
    );
  }

  if (visual === 'resolution') {
    return (
      <div className="h-full min-h-40 rounded-2xl border border-white/10 bg-[#101A2D] p-4 shadow-sm">
        <div className="space-y-3">
          {['Assigned', 'In progress', 'Waiting'].map((item, index) => (
            <div key={item} className="rounded-xl bg-white/8 p-2">
              <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-slate-300">
                <span>{item}</span>
                <span>{index + 2}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/10">
                <span className={`support-chart-fill support-chart-${toneKey} block h-2 rounded-full`} style={{ width: `${72 - index * 18}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visual === 'quality') {
    return (
      <div className="h-full min-h-40 rounded-2xl border border-white/10 bg-[#101A2D] p-4 shadow-sm">
        <div className="flex items-end gap-2">
          {[58, 82, 64, 92, 74].map((height, index) => (
            <span key={height} className={`support-chart-bar support-chart-${toneKey} block flex-1 rounded-t-xl`} style={{ height: `${height}px`, opacity: 0.72 + index * 0.04 }} />
          ))}
        </div>
        <div className="mt-4 space-y-2">
          {points.slice(0, 2).map((item) => (
            <VisualLine key={item} text={item} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-40 rounded-2xl border border-white/10 bg-[#101A2D] p-4 shadow-sm">
      <div className={`support-chart-chip support-chart-${toneKey} mx-auto grid h-16 w-16 place-items-center rounded-[24px] text-white shadow-lg`}>
        <AlertTriangle size={30} />
      </div>
      <div className="mt-5 space-y-2">
        {points.slice(0, 3).map((item) => (
          <VisualLine key={item} text={item} />
        ))}
      </div>
    </div>
  );
}

function VisualLine({ text }: { text: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-xs font-semibold text-slate-200">
      <CheckCircle2 size={14} className="shrink-0 text-cyan-300" />
      <span className="min-w-0 break-words">{text}</span>
    </div>
  );
}

function SupportMetric({ label, value, note }: { label: string; value: number; note: string }) {
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
    <span className={`support-chart-chip support-chart-${supportToneKey(tone)} grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white shadow-[0_16px_30px_rgba(15,23,42,.16)]`}>
      {children}
    </span>
  );
}

function supportToneKey(tone: string) {
  if (tone.includes('violet') || tone.includes('fuchsia')) return 'violet';
  if (tone.includes('emerald') || tone.includes('teal')) return 'emerald';
  if (tone.includes('amber') || tone.includes('orange')) return 'amber';
  return 'sky';
}
