import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Database,
  FileText,
  GraduationCap,
  Layers,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { getMainWorkspace, slugifyWorkspace } from '@/lib/main-workspaces';

const workspace = getMainWorkspace('programmes')!;

function moduleHref(label: string) {
  return `/modules/programmes/${slugifyWorkspace(label)}`;
}

function sectionDetailHref(section: string, label: string) {
  return `/modules/programmes/${slugifyWorkspace(section)}/${slugifyWorkspace(label)}`;
}

export default function ProgrammesPage() {
  const sections = workspace.sections;
  const reports = workspace.reports;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0F172A] p-5 text-white shadow-sm">
        <div className="grid gap-5 xl:grid-cols-[1fr_430px]">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-widest text-violet-300">Academic programme office</p>
            <h1 className="mt-2 break-words text-3xl font-black text-white sm:text-4xl">Programme catalogue and curriculum governance</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Build programme structures, curriculum versions, credits, eligibility rules, intake capacity, department ownership, academic approvals, published catalogue records, and compliance evidence.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {workspace.quickActions.map((action) => (
                <Link key={action} href={moduleHref(action)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-sm font-bold text-slate-100 transition hover:border-violet-300/50 hover:bg-white/12">
                  {action}
                  <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          </div>
          <ProgrammeHeroVisual />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: <BookOpen size={18} />, label: 'Catalogue', value: 'Governed', note: 'Programme and course structure' },
          { icon: <Layers size={18} />, label: 'Curriculum', value: 'Versioned', note: 'Credits, semesters, outcomes' },
          { icon: <ShieldCheck size={18} />, label: 'Eligibility', value: 'Defined', note: 'Entry and progression rules' },
          { icon: <Database size={18} />, label: 'Compliance', value: 'Audited', note: 'Evidence and approval packs' },
        ].map((item, index) => (
          <Link key={item.label} href={moduleHref(item.label)} className={`min-w-0 rounded-2xl p-4 shadow-sm transition hover:-translate-y-0.5 ${index === 0 ? 'bg-aurora text-white' : 'glass premium-kpi'}`}>
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${index === 0 ? 'bg-white/20' : 'bg-brand-50 text-brand-600'}`}>{item.icon}</span>
            <p className={`mt-3 text-sm ${index === 0 ? 'text-white/80' : 'text-slate-500'}`}>{item.label}</p>
            <p className="text-2xl font-black">{item.value}</p>
            <p className={`mt-1 text-xs ${index === 0 ? 'text-white/70' : 'text-slate-500'}`}>{item.note}</p>
          </Link>
        ))}
      </div>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
        <div className="rounded-[28px] border border-white/10 bg-[#0F172A] p-5 text-white shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-violet-300">Curriculum map</p>
              <h2 className="mt-1 text-xl font-black text-white">Credit, semester, and outcome structure</h2>
            </div>
            <Link href={moduleHref('Curriculum')} className="rounded-xl bg-violet-300/14 px-3 py-2 text-sm font-bold text-violet-100">
              Open curriculum
            </Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {['Foundation', 'Core', 'Elective', 'Capstone'].map((band, index) => (
              <Link key={band} href={moduleHref(band)} className="group min-w-0 rounded-2xl border border-white/10 bg-white/8 p-4 transition hover:border-violet-300/50 hover:bg-white/12">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-300/14 text-sm font-black text-violet-100">{index + 1}</span>
                <h3 className="mt-4 break-words text-sm font-black text-white">{band}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-300">
                  {index === 0 ? 'Entry modules, bridge courses, orientation and readiness.' : index === 1 ? 'Required courses, credit load, semesters and outcomes.' : index === 2 ? 'Elective groups, specialization paths and prerequisites.' : 'Projects, internship links, thesis and completion evidence.'}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-violet-200">
                  Open layer <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
          <CurriculumVisual />
        </div>

        <div className="grid gap-4">
          <ProgrammeMiniPanel
            title="Approval governance"
            icon={<ShieldCheck size={18} />}
            tone="from-violet-600 to-fuchsia-500"
            items={['Approval workflow', 'Committee review', 'Change approvals', 'Audit history']}
          />
          <ProgrammeMiniPanel
            title="Eligibility matrix"
            icon={<ClipboardList size={18} />}
            tone="from-emerald-500 to-teal-500"
            items={['Eligibility rules', 'Prerequisites', 'Intake capacity', 'Progression rules']}
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {sections.map((section, index) => (
          <ProgrammeSectionCard key={section.title} section={section} index={index} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <BarChart3 size={20} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Reports</p>
              <h2 className="font-black text-slate-950">Academic governance outputs</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {reports.map((report) => (
              <Link key={report} href={moduleHref(report)} className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-brand-300 hover:bg-white">
                <p className="break-words text-sm font-black text-slate-950">{report}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Export programme, credits, curriculum changes, eligibility, outcome, and compliance views.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-600">
                  Open report <ArrowRight size={13} />
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <FileText size={20} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Compliance pack</p>
              <h2 className="font-black text-slate-950">Documents for approval and audit</h2>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {['Programme profile', 'Curriculum version', 'Credit mapping', 'Eligibility matrix', 'Outcome mapping'].map((item) => (
              <Link key={item} href={moduleHref(item)} className="group flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition hover:border-brand-300 hover:bg-white">
                <CheckCircle2 size={16} className="shrink-0 text-brand-600" />
                <span className="min-w-0 break-words font-semibold text-slate-800">{item}</span>
                <ArrowRight size={14} className="ml-auto shrink-0 text-slate-400 opacity-0 transition group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ProgrammeHeroVisual() {
  return (
    <div className="relative min-h-72 overflow-hidden rounded-[26px] border border-white/10 bg-white/8 p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(124,58,237,.34),transparent_34%),radial-gradient(circle_at_86%_24%,rgba(14,165,233,.26),transparent_30%)]" />
      <div className="relative rounded-2xl bg-white p-4 text-slate-950 shadow-[0_24px_70px_rgba(2,6,23,.28)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Programme builder</p>
            <h3 className="text-lg font-black text-slate-950">Catalogue + curriculum + approval</h3>
          </div>
          <GraduationCap className="text-violet-600" size={32} />
        </div>
        <div className="mt-5 grid gap-3">
          {['Programme catalogue', 'Curriculum version', 'Eligibility rules'].map((item, index) => (
            <div key={item} className="rounded-2xl bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black text-slate-700">{item}</p>
                <span className={`rounded-full px-2 py-1 text-[10px] font-black ${index === 0 ? 'bg-violet-100 text-violet-700' : index === 1 ? 'bg-cyan-100 text-cyan-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {index === 0 ? 'Draft' : index === 1 ? 'Review' : 'Ready'}
                </span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-200">
                <span className={`block h-full rounded-full ${index === 0 ? 'w-2/5 bg-violet-500' : index === 1 ? 'w-3/5 bg-cyan-500' : 'w-4/5 bg-emerald-500'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative mt-4 grid grid-cols-4 gap-2">
        {['Credits', 'Courses', 'Intake', 'Audit'].map((item, index) => (
          <div key={item} className="rounded-2xl border border-white/10 bg-white/10 p-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-violet-200">0{index + 1}</p>
            <p className="mt-2 text-xs font-bold text-white">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CurriculumVisual() {
  return (
    <div className="mt-5 rounded-[24px] border border-white/10 bg-white/6 p-4">
      <div className="grid gap-3 md:grid-cols-4">
        {[
          ['Sem 1', 'Foundation', '18 credits'],
          ['Sem 2', 'Core labs', '21 credits'],
          ['Sem 3', 'Electives', '18 credits'],
          ['Sem 4', 'Project', '24 credits'],
        ].map(([semester, label, credits], index) => (
          <Link key={semester} href={moduleHref(`${semester} ${label}`)} className="group rounded-2xl border border-white/10 bg-white/8 p-3 transition hover:border-violet-300/50 hover:bg-white/12">
            <p className="text-[11px] font-black uppercase tracking-widest text-violet-200">{semester}</p>
            <p className="mt-2 text-sm font-black text-white">{label}</p>
            <p className="mt-1 text-xs text-slate-300">{credits}</p>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-violet-300" style={{ width: `${48 + index * 12}%` }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ProgrammeMiniPanel({ title, icon, tone, items }: { title: string; icon: ReactNode; tone: string; items: string[] }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] shadow-sm">
      <div className={`bg-gradient-to-br ${tone} p-4 text-white`}>
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/18 ring-1 ring-white/25">{icon}</span>
        <h2 className="mt-4 break-words font-black text-white">{title}</h2>
      </div>
      <div className="space-y-2 p-4">
        {items.map((item) => (
          <Link key={item} href={moduleHref(item)} className="group flex min-w-0 items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/12 hover:text-violet-200">
            <CheckCircle2 size={15} className="shrink-0 text-violet-300" />
            <span className="min-w-0 break-words">{item}</span>
            <ArrowRight size={13} className="ml-auto shrink-0 opacity-0 transition group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProgrammeSectionCard({ section, index }: { section: (typeof workspace.sections)[number]; index: number }) {
  const tones = ['from-indigo-500 to-blue-600', 'from-violet-600 to-fuchsia-500', 'from-emerald-500 to-teal-500'];
  const icons = [<BookOpen key="setup" size={21} />, <Layers key="curriculum" size={21} />, <ShieldCheck key="governance" size={21} />];
  return (
    <article className="min-w-0 overflow-hidden rounded-[28px] border border-white/10 bg-[#0F172A] text-white shadow-sm">
      <Link href={moduleHref(section.title)} className={`group block bg-gradient-to-br ${tones[index % tones.length]} p-5 transition hover:brightness-110`}>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/18 ring-1 ring-white/25">{icons[index % icons.length]}</span>
        <span className="mt-5 flex min-w-0 items-start gap-2">
          <span className="min-w-0">
            <span className="block break-words text-xl font-black text-white">{section.title}</span>
            <span className="mt-2 block text-sm leading-6 text-white/78">{section.summary}</span>
          </span>
          <ArrowRight size={16} className="ml-auto shrink-0 opacity-80 transition group-hover:translate-x-0.5" />
        </span>
      </Link>
      <div className="p-5">
        <ProgrammeSectionVisual index={index} />
        <div className="mt-4 grid gap-2">
          {section.items.map((item) => (
            <Link key={item} href={moduleHref(item)} className="group flex min-w-0 items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/12 hover:text-violet-200">
              <CheckCircle2 size={15} className="shrink-0 text-violet-300" />
              <span className="min-w-0 break-words">{item}</span>
              <ArrowRight size={13} className="ml-auto shrink-0 opacity-0 transition group-hover:opacity-100" />
            </Link>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/6 p-3">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Controls</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {section.controls?.map((control) => (
              <Link key={control} href={sectionDetailHref(section.title, control)} className="rounded-full border border-white/10 bg-white/8 px-2 py-1 text-[11px] font-bold text-slate-200 transition hover:border-violet-300/50 hover:text-violet-200">
                {control}
              </Link>
            ))}
          </div>
          {section.output && (
            <Link href={sectionDetailHref(section.title, section.output)} className="mt-3 inline-flex items-center gap-1 text-xs font-black text-violet-200">
              Output: {section.output} <ArrowRight size={12} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function ProgrammeSectionVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/8 p-3">
        <div className="grid grid-cols-2 gap-2">
          {['Profile', 'Courses', 'Intake', 'Status'].map((item) => (
            <div key={item} className="rounded-xl bg-white/8 p-3">
              <Database size={16} className="text-cyan-200" />
              <p className="mt-2 text-xs font-bold text-white">{item}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/8 p-3">
        {['Credits', 'Electives', 'Outcomes'].map((item, row) => (
          <div key={item} className="mb-3 last:mb-0">
            <div className="flex justify-between text-xs font-bold text-slate-200">
              <span>{item}</span>
              <span>{row === 0 ? '72%' : row === 1 ? '58%' : '86%'}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-violet-300" style={{ width: row === 0 ? '72%' : row === 1 ? '58%' : '86%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 p-3">
      {['Draft', 'Committee', 'Published'].map((item, step) => (
        <div key={item} className="flex items-center gap-3 py-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-300/14 text-xs font-black text-emerald-100">{step + 1}</span>
          <p className="text-sm font-bold text-white">{item}</p>
        </div>
      ))}
    </div>
  );
}
