import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bookmark,
  CheckCircle2,
  Clock3,
  FileText,
  Library,
  Repeat2,
  Search,
  Sparkles,
} from 'lucide-react';
import { db } from '@/lib/db';
import { getMainWorkspace, slugifyWorkspace } from '@/lib/main-workspaces';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

const workspace = getMainWorkspace('library')!;

type LibraryVisualType = 'catalogue' | 'circulation' | 'overdue' | 'engagement';

type LibraryRecord = {
  id: string;
  feature: string;
  title: string;
  status: string;
  requester: string | null;
};

const catalogueFeatures = ['catalogue', 'book-records', 'isbn-lookup', 'categories', 'digital-resources', 'add-resource'];
const circulationFeatures = ['circulation', 'issue-and-return', 'issue-book', 'reservations', 'reserve-item', 'record-return', 'overdue-tracking', 'fine-rules'];
const engagementFeatures = ['engagement', 'reading-history', 'popular-titles', 'class-reading-lists', 'library-reports', 'create-reading-list'];
const overdueFeatures = ['overdue-tracking', 'fine-rules'];

const libraryActions = [
  { label: 'Add resource', href: '/modules/library/add-resource', icon: <BookOpen size={16} /> },
  { label: 'Issue book', href: '/modules/library/issue-book', icon: <Repeat2 size={16} /> },
  { label: 'Reserve item', href: '/modules/library/reserve-item', icon: <Bookmark size={16} /> },
  { label: 'Record return', href: '/modules/library/record-return', icon: <CheckCircle2 size={16} /> },
  { label: 'Reading list', href: '/modules/library/create-reading-list', icon: <FileText size={16} /> },
];

const libraryDesks: Array<{
  title: string;
  eyebrow: string;
  summary: string;
  href: string;
  icon: ReactNode;
  tone: string;
  visual: LibraryVisualType;
  points: string[];
}> = [
  {
    title: 'Catalogue',
    eyebrow: 'Resource master',
    summary: 'Maintain book records, ISBN lookup, categories, copies, and digital resource ownership.',
    href: '/modules/library/catalogue',
    icon: <Library size={20} strokeWidth={2.35} />,
    tone: 'from-teal-500 to-cyan-500',
    visual: 'catalogue',
    points: ['Book records', 'ISBN lookup', 'Categories', 'Digital resources'],
  },
  {
    title: 'Circulation',
    eyebrow: 'Issue desk',
    summary: 'Control issue, return, borrower rules, reservations, due dates, and copy availability.',
    href: '/modules/library/circulation',
    icon: <Repeat2 size={20} strokeWidth={2.35} />,
    tone: 'from-violet-600 to-fuchsia-500',
    visual: 'circulation',
    points: ['Issue and return', 'Reservations', 'Borrowing limits', 'Due date policy'],
  },
  {
    title: 'Overdue & Fines',
    eyebrow: 'Due control',
    summary: 'Track overdue resources, reminders, fine rules, priority handling, and return exceptions.',
    href: '/modules/library/overdue-tracking',
    icon: <Clock3 size={20} strokeWidth={2.35} />,
    tone: 'from-amber-500 to-orange-500',
    visual: 'overdue',
    points: ['Overdue tracking', 'Fine rules', 'Fine calculation', 'Reservation priority'],
  },
  {
    title: 'Reading Engagement',
    eyebrow: 'Usage insight',
    summary: 'Measure reading history, popular titles, class reading lists, recommendations, and reports.',
    href: '/modules/library/engagement',
    icon: <BarChart3 size={20} strokeWidth={2.35} />,
    tone: 'from-emerald-500 to-teal-500',
    visual: 'engagement',
    points: ['Reading history', 'Popular titles', 'Class reading lists', 'Library reports'],
  },
];

const libraryTopics = [
  'Book records',
  'ISBN lookup',
  'Categories',
  'Digital resources',
  'Issue and return',
  'Reservations',
  'Overdue tracking',
  'Fine rules',
  'Reading history',
  'Popular titles',
  'Class reading lists',
  'Library reports',
];

export default async function LibraryPage() {
  const session = getSession();
  const institutionId = session?.institutionId;

  let totalRecords = 0;
  let catalogueRecords = 0;
  let circulationRecords = 0;
  let engagementRecords = 0;
  let overdueRecords = 0;
  let recentRecords: LibraryRecord[] = [];

  if (institutionId) {
    [totalRecords, catalogueRecords, circulationRecords, engagementRecords, overdueRecords, recentRecords] = await Promise.all([
      db.moduleRecord.count({ where: { institutionId, module: 'library' } }),
      db.moduleRecord.count({ where: { institutionId, module: 'library', feature: { in: catalogueFeatures } } }),
      db.moduleRecord.count({ where: { institutionId, module: 'library', feature: { in: circulationFeatures } } }),
      db.moduleRecord.count({ where: { institutionId, module: 'library', feature: { in: engagementFeatures } } }),
      db.moduleRecord.count({ where: { institutionId, module: 'library', feature: { in: overdueFeatures } } }),
      db.moduleRecord.findMany({
        where: { institutionId, module: 'library' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, feature: true, title: true, status: true, requester: true },
      }),
    ]);
  }

  return (
    <div className="library-module space-y-5">
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0F172A] shadow-[0_24px_80px_rgba(2,6,23,.28)]">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_.95fr]">
          <div className="min-w-0 p-5 sm:p-6 lg:p-7">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-300">
              <Sparkles size={15} /> {workspace.eyebrow}
            </Link>
            <h1 className="mt-4 max-w-2xl text-3xl font-black text-white sm:text-4xl">Library circulation desk</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{workspace.description}</p>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/8 p-3">
              <form action="/search" className="flex min-w-0 gap-2 rounded-2xl border border-white/12 bg-[#08111F] p-2">
                <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
                  <Search size={17} className="shrink-0 text-slate-300" />
                  <input
                    name="q"
                    placeholder="Search catalogue, ISBN, borrower, reservation..."
                    className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                  />
                </div>
                <button className="grid h-10 w-11 shrink-0 place-items-center rounded-xl bg-teal-300 text-slate-950 transition hover:bg-teal-200" aria-label="Search library">
                  <Search size={18} />
                </button>
              </form>

              <div className="mt-3 grid gap-2 sm:grid-cols-5">
                {libraryActions.map((action) => (
                  <Link key={action.label} href={action.href} className="flex min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-2 py-3 text-center text-xs font-bold text-white transition hover:-translate-y-0.5 hover:border-teal-300/60 hover:bg-white/12">
                    <span className="grid h-9 w-9 place-items-center rounded-2xl bg-teal-300/14 text-teal-200">{action.icon}</span>
                    <span className="break-words">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {workspace.workflow.map((step, index) => (
                <LibraryStep key={step.title} index={index} title={step.title} detail={step.detail} />
              ))}
            </div>
          </div>

          <aside className="border-t border-white/10 bg-[radial-gradient(circle_at_18%_20%,rgba(20,184,166,.28),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(124,58,237,.22),transparent_30%),linear-gradient(180deg,#08111F,#0F172A)] p-5 sm:p-6 lg:border-l lg:border-t-0 lg:p-7">
            <div className="erp-main-visual-frame mx-auto w-full max-w-[500px] shadow-[0_22px_55px_rgba(2,6,23,.34)]">
              <img src="/images/library-main-aisle-rounded.png?v=1" alt="" className="erp-main-visual-image w-full object-contain object-center" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <LibraryMetric label="Records" value={totalRecords} note="Saved library work" />
              <LibraryMetric label="Catalogue" value={catalogueRecords} note="Resource records" />
              <LibraryMetric label="Circulation" value={circulationRecords} note="Issue desk" />
              <LibraryMetric label="Overdue" value={overdueRecords} note="Due control" />
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_330px]">
        <main className="space-y-4">
          <section className="rounded-[24px] border border-white/10 bg-[#0F172A] p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Library desks</p>
                <h2 className="mt-1 text-xl font-black text-white">Run catalogue, lending, and reading insight</h2>
              </div>
              <Link href="/modules/library/library-reports" className="inline-flex items-center gap-1.5 rounded-xl border border-white/12 bg-white/10 px-3 py-2 text-sm font-bold text-cyan-200 transition hover:bg-white/14">
                Reports <ArrowRight size={15} />
              </Link>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {libraryDesks.map((desk) => (
                <LibraryDeskCard key={desk.title} desk={desk} />
              ))}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[.95fr_1.05fr]">
            <div className="rounded-[24px] border border-white/10 bg-[#0F172A] p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-teal-300/14 text-teal-200">
                  <BookOpen size={21} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Shelf map</p>
                  <h2 className="mt-1 text-lg font-black text-white">Find the right library queue</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Library work is easiest when catalogue, circulation, overdue, and engagement are separated but connected.</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {libraryTopics.map((topic) => (
                  <Link key={topic} href={`/modules/library/${slugifyWorkspace(topic)}`} className="rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-teal-300/60 hover:text-teal-200">
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
                  <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Reading insight</p>
                  <h2 className="mt-1 text-lg font-black text-white">Engagement records</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Track reading lists, popular titles, digital resource usage, and report exports.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                {['Reading history', 'Popular titles', 'Reports'].map((item, index) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/8 p-3">
                    <p className="text-xs font-bold text-slate-300">{item}</p>
                    <p className="mt-2 text-2xl font-black text-white">{index === 2 ? workspace.reports.length : engagementRecords}</p>
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
                <h2 className="mt-1 text-lg font-black text-white">Library records</h2>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-teal-300/14 text-teal-200">
                <Library size={19} />
              </span>
            </div>

            {recentRecords.length ? (
              <div className="mt-4 space-y-2">
                {recentRecords.map((record) => (
                  <Link key={record.id} href={`/modules/library/${record.feature}`} className="block min-w-0 rounded-2xl border border-white/10 bg-white/8 p-3 transition hover:border-teal-300/50 hover:bg-white/12">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-300">{record.feature.replace(/-/g, ' ')}</p>
                    <h3 className="mt-1 break-words text-sm font-black text-white">{record.title}</h3>
                    <p className="mt-1 text-xs text-slate-400">{record.requester ? `Borrower: ${record.requester}` : 'Borrower not attached'}</p>
                    <span className="mt-3 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-slate-300">{record.status.replace(/_/g, ' ')}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-white/14 bg-white/8 p-5 text-sm leading-6 text-slate-300">
                No library records saved yet. Add real catalogue, issue, reservation, or reading list records and they will appear here.
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-[24px] border border-white/10 bg-[#0F172A] shadow-sm">
            <div className="bg-gradient-to-br from-teal-500 to-cyan-500 p-5 text-white">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/18 ring-1 ring-white/25">
                  <Clock3 size={22} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Due date control</p>
                  <h2 className="text-lg font-black text-white">Overdue-ready desk</h2>
                </div>
              </div>
            </div>
            <div className="space-y-2 p-4">
              {['Borrowing limits', 'Due date policy', 'Reservation priority', 'Fine calculation'].map((item) => (
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

function LibraryStep({ index, title, detail }: { index: number; title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 p-3">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-teal-300/18 text-xs font-black text-teal-100">{index + 1}</span>
      <h3 className="mt-3 break-words text-sm font-black text-white">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-300">{detail}</p>
    </div>
  );
}

function LibraryDeskCard({
  desk,
}: {
  desk: {
    title: string;
    eyebrow: string;
    summary: string;
    href: string;
    icon: ReactNode;
    tone: string;
    visual: LibraryVisualType;
    points: string[];
  };
}) {
  return (
    <Link href={desk.href} className="group min-w-0 overflow-hidden rounded-[24px] border border-white/10 bg-white/8 p-4 transition hover:-translate-y-0.5 hover:border-teal-300/50 hover:bg-white/12 hover:shadow-md">
      <div className="flex items-start gap-3">
        <IconTile tone={desk.tone}>{desk.icon}</IconTile>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-300">{desk.eyebrow}</p>
          <h3 className="mt-1 break-words text-lg font-black text-white">{desk.title}</h3>
          <p className="mt-2 text-xs leading-5 text-slate-300">{desk.summary}</p>
        </div>
      </div>
      <div className="mt-4">
        <LibraryMiniVisual visual={desk.visual} tone={desk.tone} points={desk.points} />
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-cyan-200">
        Open desk <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function LibraryMiniVisual({ visual, tone, points }: { visual: LibraryVisualType; tone: string; points: string[] }) {
  if (visual === 'catalogue') {
    return (
      <div className="h-full min-h-40 rounded-2xl border border-white/10 bg-[#101A2D] p-4 shadow-sm">
        <div className="grid grid-cols-4 gap-2">
          {['h-20', 'h-24', 'h-16', 'h-28'].map((height, index) => (
            <span key={`${height}-${index}`} className={`block ${height} rounded-xl bg-gradient-to-t ${index % 2 ? 'from-violet-600 to-fuchsia-500' : tone}`} />
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

  if (visual === 'circulation') {
    return (
      <div className="h-full min-h-40 rounded-2xl border border-white/10 bg-[#101A2D] p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className={`rounded-2xl bg-gradient-to-br ${tone} p-4 text-white`}>
            <Repeat2 size={26} />
            <p className="mt-3 text-xs font-black">Issue</p>
          </div>
          <div className="rounded-2xl bg-white/8 p-4 text-slate-200">
            <CheckCircle2 size={26} />
            <p className="mt-3 text-xs font-black">Return</p>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-white/10">
          <span className={`block h-2 w-3/4 rounded-full bg-gradient-to-r ${tone}`} />
        </div>
      </div>
    );
  }

  if (visual === 'engagement') {
    return (
      <div className="h-full min-h-40 rounded-2xl border border-white/10 bg-[#101A2D] p-4 shadow-sm">
        <div className="flex items-end gap-2">
          {[60, 88, 72, 98, 80].map((height, index) => (
            <span key={height} className={`block flex-1 rounded-t-xl bg-gradient-to-t ${tone}`} style={{ height: `${height}px`, opacity: 0.7 + index * 0.05 }} />
          ))}
        </div>
        <p className="mt-4 text-xs font-bold text-slate-300">Reading and usage insight</p>
      </div>
    );
  }

  return (
    <div className="h-full min-h-40 rounded-2xl border border-white/10 bg-[#101A2D] p-4 shadow-sm">
      <div className={`mx-auto grid h-16 w-16 place-items-center rounded-[24px] bg-gradient-to-br ${tone} text-white shadow-lg`}>
        <Clock3 size={30} />
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

function LibraryMetric({ label, value, note }: { label: string; value: number; note: string }) {
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
