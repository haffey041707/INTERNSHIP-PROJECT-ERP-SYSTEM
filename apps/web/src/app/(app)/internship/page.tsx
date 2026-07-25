import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  Award,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { getMainWorkspace, slugifyWorkspace } from '@/lib/main-workspaces';

const workspace = getMainWorkspace('internship')!;

function moduleHref(label: string) {
  return `/modules/internship/${slugifyWorkspace(label)}`;
}

function sectionDetailHref(section: string, label: string) {
  return `/modules/internship/${slugifyWorkspace(section)}/${slugifyWorkspace(label)}`;
}

export default function InternshipPage() {
  const sections = workspace.sections;
  const actions = workspace.quickActions;
  const reports = workspace.reports;

  return (
    <div className="space-y-5">
      <section className="relative min-h-[340px] overflow-hidden rounded-[28px] border border-white/10 bg-[#0F172A] text-white shadow-sm sm:min-h-[430px]">
        <img
          src="/images/internship-desk-hero.png?v=3"
          alt="Internship placement desk"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/90 via-[#0F172A]/46 to-[#0F172A]/10" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0F172A]/86 to-transparent" />
        <div className="relative flex min-h-[340px] items-end p-5 sm:min-h-[430px] sm:p-7">
          <div className="max-w-4xl">
            <p className="text-xs font-black uppercase tracking-widest text-cyan-300">Internship command centre</p>
            <h1 className="mt-2 max-w-3xl break-words text-3xl font-black text-white sm:text-5xl">Placement office workspace</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200 sm:text-base sm:leading-7">
              Manage company partners, student eligibility, offer letters, mentor reviews, weekly progress logs, risk notes, completion proof, and internship certificates from one visual desk.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {actions.map((action) => (
                <Link key={action} href={moduleHref(action)} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-[#0F172A]/72 px-3 py-2 text-sm font-bold text-slate-100 backdrop-blur-md transition hover:border-cyan-300/50 hover:bg-white/12">
                  {action}
                  <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: <Users size={18} />, label: 'Eligible students', value: 'Ready', note: 'Screened by programme and documents' },
          { icon: <Building2 size={18} />, label: 'Partner companies', value: 'Managed', note: 'Contacts, vacancies, and MoUs' },
          { icon: <ClipboardList size={18} />, label: 'Weekly logs', value: 'Tracked', note: 'Student and mentor updates' },
          { icon: <Award size={18} />, label: 'Completion proof', value: 'Approved', note: 'Evidence and certificates' },
        ].map((item, index) => (
          <Link key={item.label} href={moduleHref(item.label)} className={`min-w-0 rounded-2xl p-4 shadow-sm transition hover:-translate-y-0.5 ${index === 0 ? 'bg-aurora text-white' : 'glass premium-kpi'}`}>
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${index === 0 ? 'bg-white/20' : 'bg-brand-50 text-brand-600'}`}>{item.icon}</span>
            <p className={`mt-3 text-sm ${index === 0 ? 'text-white/80' : 'text-slate-500'}`}>{item.label}</p>
            <p className="text-2xl font-black">{item.value}</p>
            <p className={`mt-1 text-xs ${index === 0 ? 'text-white/70' : 'text-slate-500'}`}>{item.note}</p>
          </Link>
        ))}
      </div>

      <section className="grid gap-4 xl:grid-cols-[.95fr_1.05fr]">
        <div className="rounded-[28px] border border-white/10 bg-[#0F172A] p-5 text-white shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-cyan-300">Live placement flow</p>
              <h2 className="mt-1 text-xl font-black text-white">Student to company pipeline</h2>
            </div>
            <Link href={moduleHref('Placement Pipeline')} className="rounded-xl bg-cyan-300/14 px-3 py-2 text-sm font-bold text-cyan-100">
              Open pipeline
            </Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {workspace.workflow.map((step, index) => (
              <Link key={step.title} href={moduleHref(step.title)} className="group min-w-0 rounded-2xl border border-white/10 bg-white/8 p-4 transition hover:border-cyan-300/50 hover:bg-white/12">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-300/14 text-sm font-black text-cyan-100">{index + 1}</span>
                <h3 className="mt-4 break-words text-sm font-black text-white">{step.title}</h3>
                <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-300">{step.detail}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-cyan-200">
                  Open page <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <InternshipMiniPanel
            title="Partner CRM"
            icon={<Building2 size={18} />}
            tone="from-sky-500 to-cyan-500"
            items={['Company directory', 'Mentor contacts', 'Vacancy tracker', 'MoU documents']}
          />
          <InternshipMiniPanel
            title="Student readiness"
            icon={<ShieldCheck size={18} />}
            tone="from-emerald-500 to-teal-500"
            items={['Eligibility review', 'Student checklist', 'Document status', 'Programme fit']}
          />
          <InternshipMiniPanel
            title="Progress review"
            icon={<ClipboardList size={18} />}
            tone="from-violet-600 to-fuchsia-500"
            items={['Weekly logs', 'Supervisor review', 'Risk note', 'Performance notes']}
          />
          <InternshipMiniPanel
            title="Completion office"
            icon={<Award size={18} />}
            tone="from-amber-500 to-orange-500"
            items={['Completion approval', 'Evidence archive', 'Completion report', 'Certificate request']}
          />
        </div>
      </section>

      <InternshipOperationsVisual />

      <section className="grid gap-4 lg:grid-cols-3">
        {sections.map((section, index) => (
          <InternshipSectionCard key={section.title} section={section} index={index} />
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
              <h2 className="font-black text-slate-950">Placement analytics and evidence</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {reports.map((report) => (
              <Link key={report} href={moduleHref(report)} className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-brand-300 hover:bg-white">
                <p className="break-words text-sm font-black text-slate-950">{report}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Filter by batch, company, mentor, status, risk, and completion evidence.</p>
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
              <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Evidence pack</p>
              <h2 className="font-black text-slate-950">Documents needed for closure</h2>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {['Offer letter', 'Company agreement', 'Weekly log proof', 'Mentor feedback', 'Completion certificate'].map((item) => (
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

function InternshipOperationsVisual() {
  return (
    <section className="space-y-4">
      <div className="relative aspect-[16/9] min-h-[260px] overflow-hidden rounded-[28px] border border-white/10 bg-[#0F172A] shadow-sm sm:min-h-[400px]">
        <img
          src="/images/internship-desk-operations.png?v=2"
          alt="Internship progress operations"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/86 via-[#0F172A]/24 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0F172A]/82 to-transparent" />
        <div className="relative flex h-full items-end p-5 sm:p-7">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-widest text-cyan-200">Progress operations</p>
            <h2 className="mt-1 text-2xl font-black text-white sm:text-4xl">Weekly logs, mentor review, completion evidence</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              A separate operations view for tracking student work, supervisor feedback, reports, approvals, and certificate readiness.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Weekly log board', detail: 'Track attendance, tasks, blockers, and proof from each student.' },
          { title: 'Mentor feedback', detail: 'Capture ratings, comments, review cycles, and escalation notes.' },
          { title: 'Evidence archive', detail: 'Keep offer letters, reports, screenshots, supervisor files, and approvals.' },
          { title: 'Certificate ready', detail: 'Confirm completion evidence before certificate release.' },
        ].map((item) => (
          <Link key={item.title} href={moduleHref(item.title)} className="group min-w-0 rounded-2xl border border-white/10 bg-[#0F172A] p-4 text-white transition hover:border-cyan-300/50 hover:bg-white/8">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-300/12 text-cyan-200">
              <CheckCircle2 size={16} />
            </span>
            <h3 className="mt-3 break-words text-sm font-black text-white">{item.title}</h3>
            <p className="mt-2 text-xs leading-5 text-slate-300">{item.detail}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-cyan-200">
              Open page <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function InternshipMiniPanel({ title, icon, tone, items }: { title: string; icon: ReactNode; tone: string; items: string[] }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] shadow-sm">
      <div className={`bg-gradient-to-br ${tone} p-4 text-white`}>
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/18 ring-1 ring-white/25">{icon}</span>
        <h2 className="mt-4 break-words font-black text-white">{title}</h2>
      </div>
      <div className="space-y-2 p-4">
        {items.map((item) => (
          <Link key={item} href={moduleHref(item)} className="group flex min-w-0 items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/12 hover:text-cyan-200">
            <CheckCircle2 size={15} className="shrink-0 text-cyan-300" />
            <span className="min-w-0 break-words">{item}</span>
            <ArrowRight size={13} className="ml-auto shrink-0 opacity-0 transition group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function InternshipSectionCard({ section, index }: { section: (typeof workspace.sections)[number]; index: number }) {
  const tones = ['from-cyan-500 to-blue-600', 'from-violet-600 to-fuchsia-500', 'from-emerald-500 to-teal-500'];
  const icons = [<BriefcaseBusiness key="placement" size={21} />, <Building2 key="partner" size={21} />, <ClipboardList key="progress" size={21} />];
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
        <div className="grid gap-2">
          {section.items.map((item) => (
            <Link key={item} href={moduleHref(item)} className="group flex min-w-0 items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/12 hover:text-cyan-200">
              <CheckCircle2 size={15} className="shrink-0 text-cyan-300" />
              <span className="min-w-0 break-words">{item}</span>
              <ArrowRight size={13} className="ml-auto shrink-0 opacity-0 transition group-hover:opacity-100" />
            </Link>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/6 p-3">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Controls</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {section.controls?.map((control) => (
              <Link key={control} href={sectionDetailHref(section.title, control)} className="rounded-full border border-white/10 bg-white/8 px-2 py-1 text-[11px] font-bold text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-200">
                {control}
              </Link>
            ))}
          </div>
          {section.output && (
            <Link href={sectionDetailHref(section.title, section.output)} className="mt-3 inline-flex items-center gap-1 text-xs font-black text-cyan-200">
              Output: {section.output} <ArrowRight size={12} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
