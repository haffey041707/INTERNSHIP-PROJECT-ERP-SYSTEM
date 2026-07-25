import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  Archive,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  FileText,
  PenLine,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
} from 'lucide-react';
import { db } from '@/lib/db';
import { getMainWorkspace, slugifyWorkspace } from '@/lib/main-workspaces';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

const workspace = getMainWorkspace('submissions')!;

type SubmissionVisualType = 'intake' | 'review' | 'integrity' | 'publishing';

type SubmissionRecord = {
  id: string;
  feature: string;
  title: string;
  status: string;
  priority: string;
  requester: string | null;
  owner: string | null;
};

const intakeFeatures = ['submission-desk', 'create-submission-task', 'assignment-uploads', 'project-reports', 'internship-reports', 'document-evidence'];
const reviewFeatures = ['review-queue', 'assign-evaluator', 'evaluator-assignment', 'rubric-marking', 'revision-requests', 'open-revision'];
const integrityFeatures = ['plagiarism-status', 'originality-check', 'late-submissions', 'file-requirements', 'version-history', 'revision-deadline'];
const publishingFeatures = ['publishing', 'publish-feedback', 'result-posting', 'feedback-release', 'archive-records', 'submission-analytics', 'export-evidence'];

const submissionActions = [
  { label: 'Create task', href: '/modules/submissions/create-submission-task', icon: <FileText size={16} /> },
  { label: 'Assign evaluator', href: '/modules/submissions/assign-evaluator', icon: <ClipboardCheck size={16} /> },
  { label: 'Open revision', href: '/modules/submissions/open-revision', icon: <PenLine size={16} /> },
  { label: 'Publish feedback', href: '/modules/submissions/publish-feedback', icon: <CheckCircle2 size={16} /> },
  { label: 'Export evidence', href: '/modules/submissions/export-evidence', icon: <Archive size={16} /> },
];

const submissionDesks: Array<{
  title: string;
  eyebrow: string;
  summary: string;
  href: string;
  icon: ReactNode;
  tone: string;
  visual: SubmissionVisualType;
  points: string[];
}> = [
  {
    title: 'Submission Intake',
    eyebrow: 'Upload desk',
    summary: 'Collect assignment files, project reports, internship evidence, documents, version history, and required fields.',
    href: '/modules/submissions/submission-desk',
    icon: <Upload size={20} strokeWidth={2.35} />,
    tone: 'from-sky-500 to-cyan-500',
    visual: 'intake',
    points: ['Assignment uploads', 'Project reports', 'Internship reports', 'Document evidence'],
  },
  {
    title: 'Review Queue',
    eyebrow: 'Evaluator workflow',
    summary: 'Assign evaluators, lock rubrics, track comments, score progress, revision status, and owner workload.',
    href: '/modules/submissions/review-queue',
    icon: <ClipboardCheck size={20} strokeWidth={2.35} />,
    tone: 'from-violet-600 to-fuchsia-500',
    visual: 'review',
    points: ['Evaluator assignment', 'Rubric marking', 'Reviewer comments', 'Revision requests'],
  },
  {
    title: 'Integrity and Revision',
    eyebrow: 'Policy control',
    summary: 'Monitor originality checks, late cases, file compliance, resubmission windows, and exception decisions.',
    href: '/modules/submissions/plagiarism-status',
    icon: <ShieldCheck size={20} strokeWidth={2.35} />,
    tone: 'from-amber-500 to-orange-500',
    visual: 'integrity',
    points: ['Plagiarism status', 'Late policy', 'Version history', 'Revision deadline'],
  },
  {
    title: 'Publishing Archive',
    eyebrow: 'Feedback release',
    summary: 'Release outcomes, publish feedback, archive evidence, export packs, and track submission analytics.',
    href: '/modules/submissions/publishing',
    icon: <Archive size={20} strokeWidth={2.35} />,
    tone: 'from-emerald-500 to-teal-500',
    visual: 'publishing',
    points: ['Result posting', 'Feedback release', 'Archive records', 'Submission analytics'],
  },
];

const submissionTopics = [
  'Assignment uploads',
  'Project reports',
  'Internship reports',
  'Document evidence',
  'Evaluator assignment',
  'Rubric marking',
  'Plagiarism status',
  'Revision requests',
  'Result posting',
  'Feedback release',
  'Archive records',
  'Submission analytics',
];

export default async function SubmissionsPage() {
  const session = getSession();
  const institutionId = session?.institutionId;

  let totalRecords = 0;
  let intakeRecords = 0;
  let reviewRecords = 0;
  let integrityRecords = 0;
  let publishingRecords = 0;
  let recentRecords: SubmissionRecord[] = [];

  if (institutionId) {
    [totalRecords, intakeRecords, reviewRecords, integrityRecords, publishingRecords, recentRecords] = await Promise.all([
      db.moduleRecord.count({ where: { institutionId, module: 'submissions' } }),
      db.moduleRecord.count({ where: { institutionId, module: 'submissions', feature: { in: intakeFeatures } } }),
      db.moduleRecord.count({ where: { institutionId, module: 'submissions', feature: { in: reviewFeatures } } }),
      db.moduleRecord.count({ where: { institutionId, module: 'submissions', feature: { in: integrityFeatures } } }),
      db.moduleRecord.count({ where: { institutionId, module: 'submissions', feature: { in: publishingFeatures } } }),
      db.moduleRecord.findMany({
        where: { institutionId, module: 'submissions' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, feature: true, title: true, status: true, priority: true, requester: true, owner: true },
      }),
    ]);
  }

  return (
    <div className="submissions-module space-y-5">
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0F172A] shadow-[0_24px_80px_rgba(2,6,23,.28)]">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_.95fr]">
          <div className="min-w-0 p-5 sm:p-6 lg:p-7">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-300">
              <Sparkles size={15} /> {workspace.eyebrow}
            </Link>
            <h1 className="mt-4 max-w-2xl text-3xl font-black text-white sm:text-4xl">Submission review command</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{workspace.description}</p>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/8 p-3">
              <form action="/search" className="flex min-w-0 gap-2 rounded-2xl border border-white/12 bg-[#08111F] p-2">
                <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
                  <Search size={17} className="shrink-0 text-slate-300" />
                  <input
                    name="q"
                    placeholder="Search submissions, students, projects, evidence..."
                    className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                  />
                </div>
                <button className="grid h-10 w-11 shrink-0 place-items-center rounded-xl bg-cyan-300 text-slate-950 transition hover:bg-cyan-200" aria-label="Search submissions">
                  <Search size={18} />
                </button>
              </form>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                {submissionActions.map((action) => (
                  <Link key={action.label} href={action.href} className="flex min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-2 py-3 text-center text-xs font-bold text-white transition hover:-translate-y-0.5 hover:border-cyan-300/60 hover:bg-white/12">
                    <span className="grid h-9 w-9 place-items-center rounded-2xl bg-cyan-300/14 text-cyan-200">{action.icon}</span>
                    <span className="break-words">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
              {workspace.workflow.map((step, index) => (
                <SubmissionStep key={step.title} index={index} title={step.title} detail={step.detail} />
              ))}
            </div>
          </div>

          <aside className="border-t border-white/10 bg-[radial-gradient(circle_at_18%_20%,rgba(14,165,233,.25),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(124,58,237,.22),transparent_30%),linear-gradient(180deg,#08111F,#0F172A)] p-5 sm:p-6 lg:border-l lg:border-t-0 lg:p-7">
            <div className="erp-main-visual-frame mx-auto w-full max-w-[460px] shadow-[0_22px_55px_rgba(2,6,23,.34)]">
              <img src="/images/submissions-main-submit-rounded.png?v=1" alt="" className="erp-main-visual-image w-full object-contain object-center" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <SubmissionMetric label="Records" value={totalRecords} note="Saved submission work" />
              <SubmissionMetric label="Intake" value={intakeRecords} note="Upload and evidence" />
              <SubmissionMetric label="Review" value={reviewRecords} note="Evaluator queue" />
              <SubmissionMetric label="Publish" value={publishingRecords} note="Feedback archive" />
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_330px]">
        <main className="space-y-4">
          <section className="rounded-[24px] border border-white/10 bg-[#0F172A] p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Submission desks</p>
                <h2 className="mt-1 text-xl font-black text-white">Collect, review, revise, and publish</h2>
              </div>
              <Link href="/modules/submissions/submission-status" className="inline-flex items-center gap-1.5 rounded-xl border border-white/12 bg-white/10 px-3 py-2 text-sm font-bold text-cyan-200 transition hover:bg-white/14">
                Status board <ArrowRight size={15} />
              </Link>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {submissionDesks.map((desk) => (
                <SubmissionDeskCard key={desk.title} desk={desk} />
              ))}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[.95fr_1.05fr]">
            <div className="rounded-[24px] border border-white/10 bg-[#0F172A] p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-300/14 text-cyan-200">
                  <FileCheck2 size={21} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Evidence control</p>
                  <h2 className="mt-1 text-lg font-black text-white">Open the correct submission queue</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Keep uploads, review ownership, integrity checks, revisions, result release, and archive work separated clearly.</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {submissionTopics.map((topic) => (
                  <Link key={topic} href={`/modules/submissions/${slugifyWorkspace(topic)}`} className="rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-cyan-300/60 hover:text-cyan-200">
                    {topic}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-[#0F172A] p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white">
                  <BarChart3 size={20} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Operations insight</p>
                  <h2 className="mt-1 text-lg font-black text-white">Intake, review, integrity, publishing</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Track saved submission work from real records only. Uploads, evaluator decisions, revision cases, and feedback releases appear here.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-4">
                {[
                  { label: 'Intake', value: intakeRecords },
                  { label: 'Review', value: reviewRecords },
                  { label: 'Integrity', value: integrityRecords },
                  { label: 'Publish', value: publishingRecords },
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
                <h2 className="mt-1 text-lg font-black text-white">Submission records</h2>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cyan-300/14 text-cyan-200">
                <ClipboardCheck size={19} />
              </span>
            </div>

            {recentRecords.length ? (
              <div className="mt-4 space-y-2">
                {recentRecords.map((record) => (
                  <Link key={record.id} href={`/modules/submissions/${record.feature}`} className="block min-w-0 rounded-2xl border border-white/10 bg-white/8 p-3 transition hover:border-cyan-300/50 hover:bg-white/12">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-300">{record.feature.replace(/-/g, ' ')}</p>
                    <h3 className="mt-1 break-words text-sm font-black text-white">{record.title}</h3>
                    <p className="mt-1 text-xs text-slate-400">{record.requester ? `Student: ${record.requester}` : record.owner ? `Owner: ${record.owner}` : 'Student not attached'}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-slate-300">{record.status.replace(/_/g, ' ')}</span>
                      <span className="rounded-full bg-cyan-300/12 px-2.5 py-1 text-[11px] font-bold text-cyan-200">{record.priority.replace(/_/g, ' ')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-white/14 bg-white/8 p-5 text-sm leading-6 text-slate-300">
                No submission records saved yet. Create submission tasks, assign evaluators, record revisions, or publish feedback and they will appear here.
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-[24px] border border-white/10 bg-[#0F172A] shadow-sm">
            <div className="bg-gradient-to-br from-sky-500 to-cyan-500 p-5 text-white">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/18 ring-1 ring-white/25">
                  <ShieldCheck size={22} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Review checklist</p>
                  <h2 className="text-lg font-black text-white">Release control</h2>
                </div>
              </div>
            </div>
            <div className="space-y-2 p-4">
              {['Files validated', 'Rubric locked', 'Originality checked', 'Feedback released'].map((item) => (
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

function SubmissionStep({ index, title, detail }: { index: number; title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 p-3">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-cyan-300/18 text-xs font-black text-cyan-100">{index + 1}</span>
      <h3 className="mt-3 break-words text-sm font-black text-white">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-300">{detail}</p>
    </div>
  );
}

function SubmissionDeskCard({
  desk,
}: {
  desk: {
    title: string;
    eyebrow: string;
    summary: string;
    href: string;
    icon: ReactNode;
    tone: string;
    visual: SubmissionVisualType;
    points: string[];
  };
}) {
  return (
    <Link href={desk.href} className="group min-w-0 overflow-hidden rounded-[24px] border border-white/10 bg-white/8 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-white/12 hover:shadow-md">
      <div className="flex items-start gap-3">
        <SubmissionIconTile tone={desk.tone}>{desk.icon}</SubmissionIconTile>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-300">{desk.eyebrow}</p>
          <h3 className="mt-1 break-words text-lg font-black text-white">{desk.title}</h3>
          <p className="mt-2 text-xs leading-5 text-slate-300">{desk.summary}</p>
        </div>
      </div>
      <div className="mt-4">
        <SubmissionMiniVisual visual={desk.visual} tone={desk.tone} points={desk.points} />
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-cyan-200">
        Open desk <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function SubmissionMiniVisual({ visual, tone, points }: { visual: SubmissionVisualType; tone: string; points: string[] }) {
  if (visual === 'intake') {
    return (
      <div className="grid items-stretch gap-3 sm:grid-cols-[.82fr_1fr]">
        <div className="rounded-[18px] bg-white p-3 text-slate-950 shadow-[0_16px_38px_rgba(2,6,23,.22)]">
          <div className="flex items-center justify-between gap-2">
            <span className="h-2.5 w-20 rounded-full bg-slate-200" />
            <Upload size={18} className="text-sky-500" />
          </div>
          <div className="mt-5 rounded-2xl bg-sky-50 p-4 text-center">
            <Upload size={30} className="mx-auto text-sky-500" />
            <p className="mt-2 text-[11px] font-black text-slate-700">Evidence upload</p>
          </div>
        </div>
        <SubmissionPointStack points={points} tone={tone} />
      </div>
    );
  }

  if (visual === 'review') {
    return (
      <div className="grid gap-2">
        {points.map((point, index) => (
          <div key={point} className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 break-words text-xs font-bold text-white">{point}</p>
              <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-cyan-200">{index + 1}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <span className={`block h-2 rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${84 - index * 13}%` }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (visual === 'integrity') {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {points.map((point, index) => (
          <div key={point} className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
            <span className={`grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white`}>
              {index === 0 ? <ShieldCheck size={14} /> : index === 1 ? <Clock3 size={14} /> : index === 2 ? <FileText size={14} /> : <AlertTriangle size={14} />}
            </span>
            <p className="mt-3 break-words text-xs font-bold text-white">{point}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid items-center gap-3 sm:grid-cols-[.75fr_1fr]">
      <div className="grid aspect-square place-items-center rounded-[18px] border border-white/10 bg-white/8">
        <Archive size={42} className="text-emerald-300" />
      </div>
      <SubmissionPointStack points={points} tone={tone} />
    </div>
  );
}

function SubmissionPointStack({ points, tone }: { points: string[]; tone: string }) {
  return (
    <div className="grid gap-2">
      {points.slice(0, 4).map((point, index) => (
        <div key={point} className="flex min-w-0 items-center gap-2 rounded-2xl bg-white/8 px-3 py-2 ring-1 ring-white/10">
          <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${tone} text-[10px] font-black text-white`}>{index + 1}</span>
          <p className="min-w-0 break-words text-xs font-bold text-slate-200">{point}</p>
        </div>
      ))}
    </div>
  );
}

function SubmissionMetric({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 p-3">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 break-words text-xs text-slate-400">{note}</p>
    </div>
  );
}

function SubmissionIconTile({ tone, children }: { tone: string; children: ReactNode }) {
  return <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-sm`}>{children}</span>;
}
