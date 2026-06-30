import Link from 'next/link';
import { ArrowLeft, BarChart3, CheckCircle2, ClipboardList, FileText, Settings2, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

const MODULE_LABELS: Record<string, string> = {
  admissions: 'Admissions',
  curriculum: 'Curriculum',
  hr: 'HR & Payroll',
  library: 'Library',
  transport: 'Transport',
  hostel: 'Hostel',
  inventory: 'Inventory',
  procurement: 'Procurement',
  assets: 'Assets',
  documents: 'Documents',
  calendar: 'Calendar',
  'help-desk': 'Help Desk',
  school: 'School ERP',
  colleges: 'College ERP',
  university: 'University ERP',
  institutes: 'Institute ERP',
};

const WORKFLOW = [
  { title: 'Intake', detail: 'Capture new requests, records, and required fields with owner assignment.' },
  { title: 'Review', detail: 'Validate details, documents, approvals, and exception notes before posting.' },
  { title: 'Action', detail: 'Move the item through scheduled tasks, responsible teams, and status updates.' },
  { title: 'Close', detail: 'Publish outcome, archive evidence, and update analytics for management review.' },
];

function titleFromSlug(value: string) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function sampleRows(feature: string) {
  const short = feature.replace(/\s+/g, ' ');
  return [
    { ref: 'REQ-2048', name: `${short} request`, owner: 'Operations desk', status: 'Active', due: 'Today' },
    { ref: 'REV-1187', name: `${short} review`, owner: 'Academic office', status: 'Review', due: 'Tomorrow' },
    { ref: 'APR-0732', name: `${short} approval`, owner: 'Admin team', status: 'Approved', due: 'This week' },
    { ref: 'RPT-0315', name: `${short} report`, owner: 'Management', status: 'Ready', due: 'Month end' },
  ];
}

export default function ModuleFeaturePage({ params }: { params: { module: string; feature: string } }) {
  const moduleName = MODULE_LABELS[params.module] ?? titleFromSlug(params.module);
  const featureName = titleFromSlug(params.feature);
  const rows = sampleRows(featureName);

  return (
    <div className="space-y-6">
      <div className="premium-home-hero rounded-2xl p-5 text-white">
        <Link href={`/${params.module}`} className="inline-flex items-center gap-1.5 text-sm text-white/75 hover:text-white">
          <ArrowLeft size={15} /> Back to {moduleName}
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">{moduleName}</p>
            <h1 className="mt-1 text-2xl font-extrabold text-white">{featureName}</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/75">
              A complete operational workspace for records, owners, approvals, reporting, and follow-up actions.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/documents" className="rounded-lg border border-white/20 bg-white/15 px-3 py-2 text-sm text-white">
              Attach Files
            </Link>
            <Link href="/reports" className="rounded-lg border border-white/20 bg-white/15 px-3 py-2 text-sm text-white">
              View Reports
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <Metric icon={<ClipboardList size={18} />} label="Open records" value="24" accent />
        <Metric icon={<Users size={18} />} label="Owners" value="8" />
        <Metric icon={<CheckCircle2 size={18} />} label="Completed" value="76%" />
        <Metric icon={<BarChart3 size={18} />} label="Reports" value="12" />
      </div>

      <div className="grid xl:grid-cols-[1.15fr_.85fr] gap-4">
        <section className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">Live Records</h2>
              <p className="text-sm text-slate-500">Current queue for this feature workspace.</p>
            </div>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-600">Updated now</span>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-400">
                <tr>
                  <th className="px-4 py-3">Ref</th>
                  <th>Name</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th className="px-4">Due</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.ref} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-mono text-xs">{row.ref}</td>
                    <td className="font-medium text-slate-900">{row.name}</td>
                    <td className="text-slate-500">{row.owner}</td>
                    <td><span className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-success">{row.status}</span></td>
                    <td className="px-4 text-slate-500">{row.due}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Workflow</h2>
          <div className="mt-4 space-y-3">
            {WORKFLOW.map((step, index) => (
              <div key={step.title} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-aurora text-xs font-bold text-white">{index + 1}</span>
                  <h3 className="font-medium text-slate-900">{step.title}</h3>
                </div>
                <p className="mt-2 text-sm text-slate-500">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Panel icon={<FileText size={18} />} title="Forms and Templates" items={['Smart intake forms', 'Document checklist', 'Letter and certificate templates', 'Bulk record generation']} />
        <Panel icon={<Settings2 size={18} />} title="Controls" items={['Approval rules', 'Role-based access', 'Status automation', 'Audit history']} />
        <Panel icon={<BarChart3 size={18} />} title="Management Reports" items={['Daily summary', 'Pending items', 'Owner performance', 'Export-ready reports']} />
      </div>
    </div>
  );
}

function Metric({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-4 shadow-sm ${accent ? 'premium-kpi-accent bg-aurora text-white' : 'premium-kpi glass'}`}>
      <div className="flex items-center justify-between">
        <span className={`grid h-9 w-9 place-items-center rounded-lg ${accent ? 'bg-white/20' : 'bg-brand-50 text-brand-600'}`}>{icon}</span>
      </div>
      <p className={`mt-3 text-sm ${accent ? 'text-white/80' : 'text-slate-500'}`}>{label}</p>
      <p className="text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function Panel({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <section className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">{icon}</span>
        <h2 className="font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-aurora shrink-0" />
            <span className="text-slate-700">{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
