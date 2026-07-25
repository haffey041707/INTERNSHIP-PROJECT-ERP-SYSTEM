import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Flag,
  MessageSquare,
  Megaphone,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Vote,
} from 'lucide-react';
import { db } from '@/lib/db';
import { getMainWorkspace, slugifyWorkspace } from '@/lib/main-workspaces';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

const workspace = getMainWorkspace('community')!;

type CommunityVisualType = 'groups' | 'events' | 'discussion' | 'moderation';

type CommunityRecord = {
  id: string;
  feature: string;
  title: string;
  status: string;
};

const groupFeatures = ['groups-and-clubs', 'student-groups', 'faculty-circles', 'alumni-communities', 'club-memberships', 'create-group'];
const engagementFeatures = ['engagement', 'announcements', 'event-calendar', 'discussion-boards', 'polls-and-feedback', 'publish-announcement', 'schedule-event', 'open-poll'];
const moderationFeatures = ['moderation', 'post-approvals', 'community-rules', 'member-reports', 'engagement-analytics', 'review-post'];

const commandActions = [
  { label: 'Create group', href: '/modules/community/create-group', icon: <Users size={16} /> },
  { label: 'Announcement', href: '/modules/community/publish-announcement', icon: <Megaphone size={16} /> },
  { label: 'Schedule event', href: '/modules/community/schedule-event', icon: <CalendarDays size={16} /> },
  { label: 'Open poll', href: '/modules/community/open-poll', icon: <Vote size={16} /> },
  { label: 'Review post', href: '/modules/community/review-post', icon: <ShieldCheck size={16} /> },
];

const communitySpaces: Array<{
  title: string;
  eyebrow: string;
  summary: string;
  href: string;
  icon: ReactNode;
  gradient: string;
  tint: string;
  visual: CommunityVisualType;
  points: string[];
}> = [
  {
    title: 'Groups & Clubs',
    eyebrow: 'Member network',
    summary: 'Create student groups, faculty circles, alumni spaces, club memberships, and moderator ownership.',
    href: '/modules/community/groups-and-clubs',
    icon: <Users size={20} strokeWidth={2.35} />,
    gradient: 'from-violet-600 to-fuchsia-500',
    tint: 'bg-violet-50 border-violet-100',
    visual: 'groups',
    points: ['Membership rules', 'Moderator roles', 'Group visibility', 'Approval queue'],
  },
  {
    title: 'Events & Announcements',
    eyebrow: 'Campus broadcast',
    summary: 'Plan events, publish notices, target audiences, manage capacity, and keep participation visible.',
    href: '/modules/community/engagement',
    icon: <Megaphone size={20} strokeWidth={2.35} />,
    gradient: 'from-sky-500 to-cyan-500',
    tint: 'bg-sky-50 border-sky-100',
    visual: 'events',
    points: ['Audience targeting', 'Event capacity', 'Notice drafts', 'Schedule board'],
  },
  {
    title: 'Discussions & Polls',
    eyebrow: 'Feedback studio',
    summary: 'Run discussion boards, feedback windows, quick polls, idea threads, and response tracking.',
    href: '/modules/community/polls-and-feedback',
    icon: <MessageSquare size={20} strokeWidth={2.35} />,
    gradient: 'from-emerald-500 to-teal-500',
    tint: 'bg-emerald-50 border-emerald-100',
    visual: 'discussion',
    points: ['Post permissions', 'Feedback windows', 'Poll responses', 'Discussion topics'],
  },
  {
    title: 'Moderation & Safety',
    eyebrow: 'Governance desk',
    summary: 'Review posts, reports, rules, approvals, and community quality before public activity goes live.',
    href: '/modules/community/moderation',
    icon: <ShieldCheck size={20} strokeWidth={2.35} />,
    gradient: 'from-amber-500 to-orange-500',
    tint: 'bg-amber-50 border-amber-100',
    visual: 'moderation',
    points: ['Content review', 'Rule enforcement', 'Report handling', 'Governance report'],
  },
];

const topicChips = [
  'Student groups',
  'Faculty circles',
  'Alumni communities',
  'Announcements',
  'Event calendar',
  'Discussion boards',
  'Polls and feedback',
  'Community rules',
];

export default async function CommunityPage() {
  const session = getSession();
  const institutionId = session?.institutionId;

  let totalRecords = 0;
  let groupRecords = 0;
  let engagementRecords = 0;
  let moderationRecords = 0;
  let recentRecords: CommunityRecord[] = [];

  if (institutionId) {
    [totalRecords, groupRecords, engagementRecords, moderationRecords, recentRecords] = await Promise.all([
      db.moduleRecord.count({ where: { institutionId, module: 'community' } }),
      db.moduleRecord.count({ where: { institutionId, module: 'community', feature: { in: groupFeatures } } }),
      db.moduleRecord.count({ where: { institutionId, module: 'community', feature: { in: engagementFeatures } } }),
      db.moduleRecord.count({ where: { institutionId, module: 'community', feature: { in: moderationFeatures } } }),
      db.moduleRecord.findMany({
        where: { institutionId, module: 'community' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, feature: true, title: true, status: true },
      }),
    ]);
  }

  return (
    <div className="community-module space-y-5">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 xl:grid-cols-[1.02fr_.98fr]">
          <div className="p-5 sm:p-6 lg:p-7">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-600">
              <Sparkles size={15} /> {workspace.eyebrow}
            </Link>
            <h1 className="mt-4 max-w-2xl text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">Community engagement hub</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{workspace.description}</p>

            <form action="/search" className="mt-6 flex min-w-0 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-inner">
              <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
                <Search size={17} className="shrink-0 text-slate-400" />
                <input
                  name="q"
                  placeholder="Search groups, events, polls, announcements..."
                  className="h-10 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
              <button className="grid h-10 w-11 shrink-0 place-items-center rounded-xl bg-slate-950 text-white transition hover:bg-brand-700" aria-label="Search community">
                <Search size={18} />
              </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {commandActions.map((action) => (
                <Link key={action.label} href={action.href} className="community-light-card inline-flex min-w-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-600">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">{action.icon}</span>
                  <span className="break-words">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="relative isolate min-h-[330px] overflow-hidden bg-slate-950 p-5 sm:p-6 lg:p-7">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#0F172A,#111827)]" />
            <div className="erp-main-visual-frame relative mx-auto w-full max-w-[360px] shadow-[0_22px_55px_rgba(2,6,23,.28)]">
              <img src="/images/community-main-workspace-rounded.png?v=1" alt="Community workspace visual" className="erp-main-visual-image community-main-workspace-image h-auto w-full object-contain object-center" />
            </div>
            <div className="relative mt-4 grid grid-cols-2 gap-3">
              <MetricCard label="Records" value={totalRecords} note="Saved community work" />
              <MetricCard label="Groups" value={groupRecords} note="Group records" />
              <MetricCard label="Engagement" value={engagementRecords} note="Events and posts" />
              <MetricCard label="Moderation" value={moderationRecords} note="Review records" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_330px]">
        <main className="space-y-4">
          <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Community spaces</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">Choose the area you want to run</h2>
              </div>
              <Link href="/modules/community/reports" className="community-light-card inline-flex items-center gap-1.5 rounded-xl bg-brand-50 px-3 py-2 text-sm font-bold text-brand-600 transition hover:bg-brand-100">
                Reports <ArrowRight size={15} />
              </Link>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {communitySpaces.map((space) => (
                <CommunitySpaceCard key={space.title} space={space} />
              ))}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[.95fr_1.05fr]">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white">
                  <CalendarDays size={21} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Community operating flow</p>
                  <h2 className="mt-1 text-lg font-black text-slate-950">Create, engage, moderate, measure</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">A community ERP should feel like an active workspace, not a long list. These steps keep activity organized and reviewable.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {workspace.workflow.map((step, index) => (
                  <div key={step.title} className="community-light-card rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-xs font-black text-brand-600 shadow-sm">{index + 1}</span>
                    <h3 className="mt-3 text-sm font-black text-slate-950">{step.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{step.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
                  <Search size={20} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Topic shortcuts</p>
                  <h2 className="mt-1 text-lg font-black text-slate-950">Move fast without clutter</h2>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {topicChips.map((item) => (
                  <Link key={item} href={`/modules/community/${slugifyWorkspace(item)}`} className="community-light-card rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-brand-300 hover:bg-white hover:text-brand-600">
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </main>

        <aside className="space-y-4">
          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Live wall</p>
                <h2 className="mt-1 text-lg font-black text-slate-950">Recent records</h2>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                <BarChart3 size={19} />
              </span>
            </div>
            {recentRecords.length ? (
              <div className="mt-4 space-y-2">
                {recentRecords.map((record) => (
                  <Link key={record.id} href={`/modules/community/${record.feature}`} className="community-light-card block min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-brand-300 hover:bg-white">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-brand-600">{record.feature.replace(/-/g, ' ')}</p>
                    <h3 className="mt-1 break-words text-sm font-black text-slate-950">{record.title}</h3>
                    <span className="mt-3 inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500 shadow-sm">{record.status.replace(/_/g, ' ')}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="community-light-card mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-500">
                No community records saved yet. Create a real group, event, poll, announcement, or review record from this module.
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
            <div className="bg-slate-950 p-5 text-white">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15">
                  <Flag size={22} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Moderation board</p>
                  <h2 className="text-lg font-black text-white">Safe community activity</h2>
                </div>
              </div>
            </div>
            <div className="space-y-2 p-4">
              {['Review content before publishing', 'Assign moderators for groups', 'Track reported posts clearly', 'Export governance reports'].map((item) => (
                <div key={item} className="community-light-card flex min-w-0 items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                  <CheckCircle2 size={15} className="shrink-0 text-brand-600" />
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

function CommunitySpaceCard({
  space,
}: {
  space: {
    title: string;
    eyebrow: string;
    summary: string;
    href: string;
    icon: ReactNode;
    gradient: string;
    tint: string;
    visual: CommunityVisualType;
    points: string[];
  };
}) {
  return (
    <Link href={space.href} className={`community-light-card group grid min-w-0 overflow-hidden rounded-[24px] border ${space.tint} transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-white hover:shadow-md sm:grid-cols-[.9fr_1.1fr]`}>
      <div className="p-4">
        <IconTile gradient={space.gradient}>{space.icon}</IconTile>
        <p className="mt-4 text-[11px] font-bold uppercase tracking-widest text-brand-600">{space.eyebrow}</p>
        <h3 className="mt-1 break-words text-lg font-black text-slate-950">{space.title}</h3>
        <p className="mt-2 text-xs leading-5 text-slate-500">{space.summary}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-brand-600">
          Open workspace <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
        </span>
      </div>
      <div className="community-light-card min-h-48 bg-white/65 p-4">
        <CommunityMiniVisual visual={space.visual} gradient={space.gradient} points={space.points} />
      </div>
    </Link>
  );
}

function CommunityMiniVisual({ visual, gradient, points }: { visual: CommunityVisualType; gradient: string; points: string[] }) {
  if (visual === 'groups') {
    return (
      <div className="community-light-card relative h-full min-h-40 overflow-hidden rounded-2xl bg-white p-4 shadow-sm">
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-violet-100" />
        <div className="relative flex -space-x-3">
          {['ST', 'FC', 'AL', 'CL'].map((item, index) => (
            <span key={item} className={`grid h-12 w-12 place-items-center rounded-full border-4 border-white bg-gradient-to-br ${index % 2 ? 'from-emerald-500 to-teal-500' : gradient} text-xs font-black text-white shadow-sm`}>
              {item}
            </span>
          ))}
        </div>
        <div className="relative mt-5 space-y-2">
          {points.slice(0, 3).map((item) => (
            <VisualLine key={item} text={item} />
          ))}
        </div>
      </div>
    );
  }

  if (visual === 'events') {
    return (
      <div className="community-light-card h-full min-h-40 rounded-2xl bg-white p-4 shadow-sm">
        <div className={`rounded-2xl bg-gradient-to-br ${gradient} p-4 text-white`}>
          <CalendarDays size={28} />
          <p className="mt-4 text-sm font-black">Event calendar</p>
          <p className="mt-1 text-xs text-white/75">Announcements and audience planning</p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {['Plan', 'Post', 'Invite'].map((item) => (
            <span key={item} className="rounded-xl bg-slate-50 px-2 py-2 text-center text-[11px] font-bold text-slate-600">{item}</span>
          ))}
        </div>
      </div>
    );
  }

  if (visual === 'discussion') {
    return (
      <div className="community-light-card h-full min-h-40 rounded-2xl bg-white p-4 shadow-sm">
        <div className="space-y-3">
          <div className="ml-auto max-w-[78%] rounded-2xl rounded-tr-md bg-brand-600 px-3 py-2 text-xs font-semibold text-white">Discussion topic</div>
          <div className="max-w-[84%] rounded-2xl rounded-tl-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">Feedback reply</div>
        </div>
        <div className="mt-5 space-y-2">
          {['Poll response', 'Idea thread', 'Feedback window'].map((item, index) => (
            <div key={item} className="community-light-card rounded-xl bg-slate-50 p-2">
              <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-slate-500">
                <span>{item}</span>
                <span>{index + 1}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-200">
                <span className={`block h-2 rounded-full bg-gradient-to-r ${gradient}`} style={{ width: `${62 - index * 14}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="community-light-card h-full min-h-40 rounded-2xl bg-white p-4 shadow-sm">
      <div className={`mx-auto grid h-16 w-16 place-items-center rounded-[24px] bg-gradient-to-br ${gradient} text-white shadow-lg`}>
        <ShieldCheck size={31} />
      </div>
      <div className="mt-5 space-y-2">
        {points.slice(0, 4).map((item) => (
          <VisualLine key={item} text={item} />
        ))}
      </div>
    </div>
  );
}

function VisualLine({ text }: { text: string }) {
  return (
    <div className="community-light-card flex min-w-0 items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
      <CheckCircle2 size={14} className="shrink-0 text-brand-600" />
      <span className="min-w-0 break-words">{text}</span>
    </div>
  );
}

function MetricCard({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white shadow-sm backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/55">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-[11px] leading-4 text-white/60">{note}</p>
    </div>
  );
}

function IconTile({ children, gradient }: { children: ReactNode; gradient: string }) {
  return (
    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-[0_16px_30px_rgba(15,23,42,.16)]`}>
      {children}
    </span>
  );
}
