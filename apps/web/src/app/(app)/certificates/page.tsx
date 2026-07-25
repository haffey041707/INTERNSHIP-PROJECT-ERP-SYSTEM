import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  Archive,
  ArrowRight,
  Award,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FileText,
  PenLine,
  Printer,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { db } from '@/lib/db';
import { getMainWorkspace, slugifyWorkspace } from '@/lib/main-workspaces';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

const workspace = getMainWorkspace('certificates')!;

type CertificateVisualType = 'issue' | 'approval' | 'verification' | 'archive';

type CertificateRecord = {
  id: string;
  feature: string;
  title: string;
  status: string;
  priority: string;
  requester: string | null;
  owner: string | null;
};

const issueFeatures = ['certificate-issuing', 'issue-certificate', 'completion-certificates', 'bonafide-letters', 'transfer-certificates', 'internship-letters'];
const approvalFeatures = ['approval-control', 'approve-request', 'template-selection', 'approver-routing', 'digital-signatures', 'create-template'];
const verificationFeatures = ['verify-certificate', 'qr-verification', 'verification-logs', 'template-usage'];
const archiveFeatures = ['archive', 'print-queue', 'print-batch', 'reissue-requests', 'certificate-reports', 'issue-register'];

const certificateActions = [
  { label: 'Issue certificate', href: '/modules/certificates/issue-certificate', icon: <Award size={16} /> },
  { label: 'Create template', href: '/modules/certificates/create-template', icon: <FileText size={16} /> },
  { label: 'Approve request', href: '/modules/certificates/approve-request', icon: <ClipboardCheck size={16} /> },
  { label: 'Verify certificate', href: '/modules/certificates/verify-certificate', icon: <QrCode size={16} /> },
  { label: 'Print batch', href: '/modules/certificates/print-batch', icon: <Printer size={16} /> },
];

const certificateDesks: Array<{
  title: string;
  eyebrow: string;
  summary: string;
  href: string;
  icon: ReactNode;
  tone: string;
  visual: CertificateVisualType;
  points: string[];
}> = [
  {
    title: 'Certificate Issuing',
    eyebrow: 'Request to draft',
    summary: 'Create completion, bonafide, transfer, internship, training, and institutional certificates with eligibility checks.',
    href: '/modules/certificates/certificate-issuing',
    icon: <Award size={20} strokeWidth={2.35} />,
    tone: 'from-violet-600 to-fuchsia-500',
    visual: 'issue',
    points: ['Completion certificates', 'Bonafide letters', 'Transfer certificates', 'Internship letters'],
  },
  {
    title: 'Approval Control',
    eyebrow: 'Signature authority',
    summary: 'Route certificate drafts through approvers, wording checks, template locks, and signature permission control.',
    href: '/modules/certificates/approval-control',
    icon: <ClipboardCheck size={20} strokeWidth={2.35} />,
    tone: 'from-sky-500 to-cyan-500',
    visual: 'approval',
    points: ['Template selection', 'Approver routing', 'Digital signatures', 'Change log'],
  },
  {
    title: 'Verification Desk',
    eyebrow: 'QR and audit',
    summary: 'Validate issued certificates using QR status, issue reference, verification events, and external check history.',
    href: '/modules/certificates/qr-verification',
    icon: <QrCode size={20} strokeWidth={2.35} />,
    tone: 'from-emerald-500 to-teal-500',
    visual: 'verification',
    points: ['QR verification', 'Verification logs', 'Access log', 'Certificate status'],
  },
  {
    title: 'Archive and Reissue',
    eyebrow: 'Print and records',
    summary: 'Manage print queues, reissue reasons, batch delivery, retention rules, certificate reports, and audit archive.',
    href: '/modules/certificates/archive',
    icon: <Archive size={20} strokeWidth={2.35} />,
    tone: 'from-amber-500 to-orange-500',
    visual: 'archive',
    points: ['Print queue', 'Reissue requests', 'Issue register', 'Certificate reports'],
  },
];

const certificateTopics = [
  'Completion certificates',
  'Bonafide letters',
  'Transfer certificates',
  'Internship letters',
  'Template selection',
  'Approver routing',
  'Digital signatures',
  'QR verification',
  'Print queue',
  'Reissue requests',
  'Verification logs',
  'Certificate reports',
];

export default async function CertificatesPage() {
  const session = getSession();
  const institutionId = session?.institutionId;

  let totalRecords = 0;
  let issueRecords = 0;
  let approvalRecords = 0;
  let verificationRecords = 0;
  let archiveRecords = 0;
  let recentRecords: CertificateRecord[] = [];

  if (institutionId) {
    [totalRecords, issueRecords, approvalRecords, verificationRecords, archiveRecords, recentRecords] = await Promise.all([
      db.moduleRecord.count({ where: { institutionId, module: 'certificates' } }),
      db.moduleRecord.count({ where: { institutionId, module: 'certificates', feature: { in: issueFeatures } } }),
      db.moduleRecord.count({ where: { institutionId, module: 'certificates', feature: { in: approvalFeatures } } }),
      db.moduleRecord.count({ where: { institutionId, module: 'certificates', feature: { in: verificationFeatures } } }),
      db.moduleRecord.count({ where: { institutionId, module: 'certificates', feature: { in: archiveFeatures } } }),
      db.moduleRecord.findMany({
        where: { institutionId, module: 'certificates' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, feature: true, title: true, status: true, priority: true, requester: true, owner: true },
      }),
    ]);
  }

  return (
    <div className="certificates-module space-y-5">
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0F172A] shadow-[0_24px_80px_rgba(2,6,23,.28)]">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_.95fr]">
          <div className="min-w-0 p-5 sm:p-6 lg:p-7">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-violet-300">
              <Sparkles size={15} /> {workspace.eyebrow}
            </Link>
            <h1 className="mt-4 max-w-2xl text-3xl font-black text-white sm:text-4xl">Certificate issue command</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{workspace.description}</p>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/8 p-3">
              <form action="/search" className="flex min-w-0 gap-2 rounded-2xl border border-white/12 bg-[#08111F] p-2">
                <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
                  <Search size={17} className="shrink-0 text-slate-300" />
                  <input
                    name="q"
                    placeholder="Search certificates, templates, approvals, QR logs..."
                    className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                  />
                </div>
                <button className="grid h-10 w-11 shrink-0 place-items-center rounded-xl bg-violet-300 text-slate-950 transition hover:bg-violet-200" aria-label="Search certificates">
                  <Search size={18} />
                </button>
              </form>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                {certificateActions.map((action) => (
                  <Link key={action.label} href={action.href} className="flex min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-2 py-3 text-center text-xs font-bold text-white transition hover:-translate-y-0.5 hover:border-violet-300/60 hover:bg-white/12">
                    <span className="grid h-9 w-9 place-items-center rounded-2xl bg-violet-300/14 text-violet-200">{action.icon}</span>
                    <span className="break-words">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
              {workspace.workflow.map((step, index) => (
                <CertificateStep key={step.title} index={index} title={step.title} detail={step.detail} />
              ))}
            </div>
          </div>

          <aside className="border-t border-white/10 bg-[radial-gradient(circle_at_18%_20%,rgba(124,58,237,.25),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(20,184,166,.20),transparent_30%),linear-gradient(180deg,#08111F,#0F172A)] p-5 sm:p-6 lg:border-l lg:border-t-0 lg:p-7">
            <img src="/images/certificates-main-template-clean.png?v=1" alt="" className="mx-auto w-full max-w-[420px] object-contain object-center shadow-[0_22px_55px_rgba(2,6,23,.34)]" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <CertificateMetric label="Records" value={totalRecords} note="Saved certificate work" />
              <CertificateMetric label="Issue" value={issueRecords} note="Draft and release" />
              <CertificateMetric label="Approve" value={approvalRecords} note="Signature routing" />
              <CertificateMetric label="Verify" value={verificationRecords} note="QR and audit logs" />
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_330px]">
        <main className="space-y-4">
          <section className="rounded-[24px] border border-white/10 bg-[#0F172A] p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">Certificate desks</p>
                <h2 className="mt-1 text-xl font-black text-white">Issue, approve, verify, and archive</h2>
              </div>
              <Link href="/modules/certificates/issue-register" className="inline-flex items-center gap-1.5 rounded-xl border border-white/12 bg-white/10 px-3 py-2 text-sm font-bold text-violet-200 transition hover:bg-white/14">
                Issue register <ArrowRight size={15} />
              </Link>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {certificateDesks.map((desk) => (
                <CertificateDeskCard key={desk.title} desk={desk} />
              ))}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[.95fr_1.05fr]">
            <div className="rounded-[24px] border border-white/10 bg-[#0F172A] p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-300/14 text-violet-200">
                  <ShieldCheck size={21} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">Document control</p>
                  <h2 className="mt-1 text-lg font-black text-white">Open the correct certificate queue</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Keep certificate requests, templates, approval authority, QR checks, print batches, and reissue history separated clearly.</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {certificateTopics.map((topic) => (
                  <Link key={topic} href={`/modules/certificates/${slugifyWorkspace(topic)}`} className="rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-violet-300/60 hover:text-violet-200">
                    {topic}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-[#0F172A] p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
                  <BadgeCheck size={20} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">Operations insight</p>
                  <h2 className="mt-1 text-lg font-black text-white">Issue, approval, verification, archive</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Track saved certificate work from real records only. New drafts, approvals, QR checks, and reissues will appear here.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-4">
                {[
                  { label: 'Issue', value: issueRecords },
                  { label: 'Approve', value: approvalRecords },
                  { label: 'Verify', value: verificationRecords },
                  { label: 'Archive', value: archiveRecords },
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
                <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">Recent movement</p>
                <h2 className="mt-1 text-lg font-black text-white">Certificate records</h2>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-violet-300/14 text-violet-200">
                <FileCheck2 size={19} />
              </span>
            </div>

            {recentRecords.length ? (
              <div className="mt-4 space-y-2">
                {recentRecords.map((record) => (
                  <Link key={record.id} href={`/modules/certificates/${record.feature}`} className="block min-w-0 rounded-2xl border border-white/10 bg-white/8 p-3 transition hover:border-violet-300/50 hover:bg-white/12">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-violet-300">{record.feature.replace(/-/g, ' ')}</p>
                    <h3 className="mt-1 break-words text-sm font-black text-white">{record.title}</h3>
                    <p className="mt-1 text-xs text-slate-400">{record.requester ? `Request: ${record.requester}` : record.owner ? `Owner: ${record.owner}` : 'Requester not attached'}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-slate-300">{record.status.replace(/_/g, ' ')}</span>
                      <span className="rounded-full bg-violet-300/12 px-2.5 py-1 text-[11px] font-bold text-violet-200">{record.priority.replace(/_/g, ' ')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-white/14 bg-white/8 p-5 text-sm leading-6 text-slate-300">
                No certificate records saved yet. Issue certificates, templates, approvals, verification logs, or reissue records and they will appear here.
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-[24px] border border-white/10 bg-[#0F172A] shadow-sm">
            <div className="bg-gradient-to-br from-violet-600 to-fuchsia-500 p-5 text-white">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/18 ring-1 ring-white/25">
                  <QrCode size={22} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Verification checklist</p>
                  <h2 className="text-lg font-black text-white">Release control</h2>
                </div>
              </div>
            </div>
            <div className="space-y-2 p-4">
              {['Template locked', 'Eligibility checked', 'Signature approved', 'QR log saved'].map((item) => (
                <div key={item} className="flex min-w-0 items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-sm font-semibold text-slate-200">
                  <CheckCircle2 size={15} className="shrink-0 text-violet-300" />
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

function CertificateStep({ index, title, detail }: { index: number; title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 p-3">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-violet-300/18 text-xs font-black text-violet-100">{index + 1}</span>
      <h3 className="mt-3 break-words text-sm font-black text-white">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-300">{detail}</p>
    </div>
  );
}

function CertificateDeskCard({
  desk,
}: {
  desk: {
    title: string;
    eyebrow: string;
    summary: string;
    href: string;
    icon: ReactNode;
    tone: string;
    visual: CertificateVisualType;
    points: string[];
  };
}) {
  return (
    <Link href={desk.href} className="group min-w-0 overflow-hidden rounded-[24px] border border-white/10 bg-white/8 p-4 transition hover:-translate-y-0.5 hover:border-violet-300/50 hover:bg-white/12 hover:shadow-md">
      <div className="flex items-start gap-3">
        <CertificateIconTile tone={desk.tone}>{desk.icon}</CertificateIconTile>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-violet-300">{desk.eyebrow}</p>
          <h3 className="mt-1 break-words text-lg font-black text-white">{desk.title}</h3>
          <p className="mt-2 text-xs leading-5 text-slate-300">{desk.summary}</p>
        </div>
      </div>
      <div className="mt-4">
        <CertificateMiniVisual visual={desk.visual} tone={desk.tone} points={desk.points} />
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-violet-200">
        Open desk <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function CertificateMiniVisual({ visual, tone, points }: { visual: CertificateVisualType; tone: string; points: string[] }) {
  if (visual === 'issue') {
    return (
      <div className="grid items-stretch gap-3 sm:grid-cols-[.82fr_1fr]">
        <div className="rounded-[18px] bg-white p-3 text-slate-950 shadow-[0_16px_38px_rgba(2,6,23,.22)]">
          <div className="flex items-center justify-between gap-2">
            <span className="h-2.5 w-20 rounded-full bg-slate-200" />
            <Award size={18} className="text-amber-500" />
          </div>
          <div className="mt-5 space-y-2">
            <span className="block h-2 rounded-full bg-slate-200" />
            <span className="block h-2 w-4/5 rounded-full bg-slate-100" />
            <span className="block h-2 w-2/3 rounded-full bg-slate-100" />
          </div>
          <div className="mt-5 flex justify-end">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-violet-600 text-white">
              <CheckCircle2 size={17} />
            </span>
          </div>
        </div>
        <CertificatePointStack points={points} tone={tone} />
      </div>
    );
  }

  if (visual === 'approval') {
    return (
      <div className="grid gap-2">
        {points.map((point, index) => (
          <div key={point} className="flex min-w-0 items-center gap-2 rounded-2xl bg-white/8 px-3 py-2 ring-1 ring-white/10">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white`}>
              {index === 0 ? <FileText size={14} /> : index === 1 ? <PenLine size={14} /> : index === 2 ? <ShieldCheck size={14} /> : <ClipboardCheck size={14} />}
            </span>
            <p className="min-w-0 break-words text-xs font-bold text-slate-200">{point}</p>
          </div>
        ))}
      </div>
    );
  }

  if (visual === 'verification') {
    return (
      <div className="grid items-center gap-3 sm:grid-cols-[.75fr_1fr]">
        <div className="grid aspect-square place-items-center rounded-[18px] border border-white/10 bg-white/8">
          <div className="grid h-20 w-20 grid-cols-3 gap-1 rounded-2xl bg-white p-2">
            {Array.from({ length: 9 }).map((_, index) => (
              <span key={index} className={index % 2 === 0 || index === 5 ? 'rounded bg-slate-950' : 'rounded bg-slate-200'} />
            ))}
          </div>
        </div>
        <CertificatePointStack points={points} tone={tone} />
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {points.map((point, index) => (
        <div key={point} className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
          <span className={`grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white`}>
            {index % 2 ? <Printer size={14} /> : <Archive size={14} />}
          </span>
          <p className="mt-3 break-words text-xs font-bold text-white">{point}</p>
        </div>
      ))}
    </div>
  );
}

function CertificatePointStack({ points, tone }: { points: string[]; tone: string }) {
  return (
    <div className="grid gap-2">
      {points.slice(0, 4).map((point, index) => (
        <div key={point} className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 break-words text-xs font-bold text-white">{point}</p>
            <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-violet-200">{index + 1}</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-white/10">
            <span className={`block h-2 rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${82 - index * 12}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function CertificateMetric({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 p-3">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 break-words text-xs text-slate-400">{note}</p>
    </div>
  );
}

function CertificateIconTile({ tone, children }: { tone: string; children: ReactNode }) {
  return <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-sm`}>{children}</span>;
}
