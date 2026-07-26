import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Bus,
  CalendarDays,
  CreditCard,
  FileText,
  GraduationCap,
  MessageSquare,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { ModuleExperience } from '@/components/ModuleExperience';

interface ERPModulePageProps {
  title: string;
  eyebrow: string;
  description: string;
  stats: Array<{ label: string; value: string; note?: string }>;
  sections: Array<{ title: string; summary?: string; items: string[]; controls?: string[]; output?: string }>;
  workflow?: Array<{ title: string; detail: string }>;
  quickActions?: string[];
  reports?: string[];
  moduleSlug?: string;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

type VisualTheme = {
  icon: ReactNode;
  tone: string;
  glow: string;
  dot: string;
  label: string;
};

function sectionTheme(sectionTitle: string, moduleSlug?: string, index = 0): VisualTheme {
  const title = `${moduleSlug ?? ''} ${sectionTitle}`.toLowerCase();

  if (/(parent|guardian|consent|message|alert|meeting)/.test(title)) {
    return { icon: <MessageSquare size={19} />, tone: 'from-fuchsia-500 to-violet-600', glow: 'bg-fuchsia-500/18', dot: 'bg-fuchsia-300', label: 'Family communication' };
  }
  if (/(fee|payment|receipt|invoice|balance|concession|revenue)/.test(title)) {
    return { icon: <CreditCard size={19} />, tone: 'from-emerald-500 to-teal-500', glow: 'bg-emerald-500/18', dot: 'bg-emerald-300', label: 'Finance control' };
  }
  if (/(academic|class|section|teacher|timetable|curriculum|homework|course|batch)/.test(title)) {
    return { icon: <GraduationCap size={19} />, tone: 'from-indigo-500 to-blue-600', glow: 'bg-indigo-500/18', dot: 'bg-indigo-300', label: 'Academic planning' };
  }
  if (/(admission|enquiry|application|enrollment|lead)/.test(title)) {
    return { icon: <Users size={19} />, tone: 'from-cyan-500 to-blue-500', glow: 'bg-cyan-500/18', dot: 'bg-cyan-300', label: 'Intake pipeline' };
  }
  if (/(attendance|behaviour|conduct|leave|late|house)/.test(title)) {
    return { icon: <CalendarDays size={19} />, tone: 'from-amber-500 to-orange-500', glow: 'bg-amber-500/18', dot: 'bg-amber-300', label: 'Daily care' };
  }
  if (/(exam|report card|grade|marks|promotion|certificate)/.test(title)) {
    return { icon: <Award size={19} />, tone: 'from-violet-600 to-fuchsia-500', glow: 'bg-violet-500/18', dot: 'bg-violet-300', label: 'Result control' };
  }
  if (/(transport|hostel|library|service|campus)/.test(title)) {
    return { icon: <Bus size={19} />, tone: 'from-sky-500 to-cyan-500', glow: 'bg-sky-500/18', dot: 'bg-sky-300', label: 'Service desk' };
  }

  const themes: VisualTheme[] = [
    { icon: <FileText size={19} />, tone: 'from-violet-600 to-fuchsia-500', glow: 'bg-violet-500/18', dot: 'bg-violet-300', label: 'Workspace' },
    { icon: <BookOpen size={19} />, tone: 'from-sky-500 to-cyan-500', glow: 'bg-sky-500/18', dot: 'bg-sky-300', label: 'Operations' },
    { icon: <ShieldCheck size={19} />, tone: 'from-emerald-500 to-teal-500', glow: 'bg-emerald-500/18', dot: 'bg-emerald-300', label: 'Controls' },
    { icon: <BarChart3 size={19} />, tone: 'from-amber-500 to-orange-500', glow: 'bg-amber-500/18', dot: 'bg-amber-300', label: 'Reports' },
  ];

  return themes[index % themes.length];
}

function MiniVisual({ theme, items }: { theme: VisualTheme; items: string[] }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.tone} p-4 text-white`}>
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/16" />
      <div className="absolute -bottom-10 left-8 h-24 w-24 rounded-full bg-white/10" />
      <div className="relative flex items-center justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/18 ring-1 ring-white/25">
          {theme.icon}
        </span>
        <span className="rounded-full bg-white/16 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white/85">
          {theme.label}
        </span>
      </div>
      <div className="relative mt-5 space-y-2">
        {items.slice(0, 3).map((item, itemIndex) => (
          <div key={item} className="flex items-center gap-2 rounded-xl bg-white/14 px-3 py-2 text-xs font-semibold text-white/90">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/18 text-[10px]">{itemIndex + 1}</span>
            <span className="min-w-0 truncate">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ERPModulePage({ title, eyebrow, description, stats, sections, workflow, quickActions = [], reports = [], moduleSlug }: ERPModulePageProps) {
  const primaryItems = sections.flatMap((section) => section.items).slice(0, 6);
  const heroImage =
    moduleSlug === 'school'
      ? '/images/school-dashboard-banner.png'
      : moduleSlug === 'colleges'
        ? '/images/college-dashboard-banner.png'
        : moduleSlug === 'university'
          ? '/images/university-dashboard-banner.png'
          : moduleSlug === 'institutes'
            ? '/images/institute-dashboard-banner.png'
        : null;
  const steps = workflow ?? [
    { title: 'Plan', detail: 'Prepare records, owners, policies, and checklists.' },
    { title: 'Assign', detail: 'Route work to responsible teams and due dates.' },
    { title: 'Track', detail: 'Monitor progress, exceptions, evidence, and approvals.' },
    { title: 'Review', detail: 'Approve, report, archive, and improve the workflow.' },
  ];
  const actions = quickActions.length ? quickActions : ['Create request', 'Assign owner', 'Review status', 'Export report'];
  const reportItems = reports.length ? reports : ['Daily summary', 'Pending work', 'Owner review', 'Export pack'];
  const moduleControls = Array.from(new Set(sections.flatMap((section) => section.controls ?? [])));
  const moduleOutput = sections.find((section) => section.output)?.output ?? `${title} operations record`;

  return (
    <div className="space-y-6">
      <div className={`premium-home-hero relative overflow-hidden rounded-2xl text-white ${moduleSlug === 'institutes' ? 'p-3 sm:p-4' : 'p-4 sm:p-5'}`}>
        {heroImage && (
          <>
            <img
              src={heroImage}
              alt={`${title} workspace`}
              className="erp-desk-hero-image absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/88 via-slate-950/48 to-slate-950/12" />
          </>
        )}
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60">{eyebrow}</p>
          <h1 className="mt-1 break-words text-2xl font-extrabold leading-tight text-white sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-white/75 sm:text-sm sm:leading-6">{description}</p>
          <div className={moduleSlug === 'institutes' ? 'mt-3 flex flex-wrap gap-2' : 'mt-3 flex flex-wrap gap-2 sm:mt-4'}>
            {actions.slice(0, 4).map((action) => (
              <Link key={action} href={moduleSlug ? `/modules/${moduleSlug}/${slugify(action)}` : '#'} className="rounded-lg border border-white/20 bg-white/15 px-2.5 py-1.5 text-xs font-medium text-white sm:px-3 sm:py-2 sm:text-sm">
                {action}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4 stagger">
        {stats.map((stat, index) => (
          <div key={stat.label} className={`rounded-xl p-3 shadow-sm sm:p-4 ${index === 0 ? 'premium-kpi-accent bg-aurora text-white' : 'premium-kpi glass'}`}>
            <p className="break-words text-xs leading-4 text-white/70 sm:text-sm">{stat.label}</p>
            <p className="mt-1 break-words text-xl font-extrabold leading-tight sm:text-2xl">{stat.value}</p>
            {stat.note && <p className="mt-1 text-xs text-white/60">{stat.note}</p>}
          </div>
        ))}
      </div>

      <ModuleExperience
        moduleSlug={moduleSlug}
        moduleName={title}
        featureName={title}
        summary={description}
        capabilities={primaryItems}
        controls={moduleControls}
        output={moduleOutput}
        workflow={steps}
        reports={reportItems}
        mode="workspace"
      />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-2xl border border-white/10 bg-[#0F172A] p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-white">Command Overview</h2>
              <p className="mt-1 text-sm text-slate-300">Important actions, owner queues, and follow-ups for this workspace.</p>
            </div>
            <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2.5 py-1 text-xs font-medium text-cyan-200">Live workspace</span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {primaryItems.map((item, index) => {
              const theme = sectionTheme(item, moduleSlug, index);
              return (
              <Link
                key={item}
                href={moduleSlug ? `/modules/${moduleSlug}/${slugify(item)}` : '#'}
                className="group flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/7 px-3 py-2.5 text-sm transition hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-white/11"
              >
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${theme.dot}`} />
                <span className="min-w-0 break-words font-medium text-slate-100">{item}</span>
                <ArrowRight size={14} className="ml-auto shrink-0 text-cyan-200 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
              </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0F172A] p-5 shadow-sm">
          <h2 className="font-semibold text-white">Professional Workflow</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {steps.map((step, index) => (
              <Link key={step.title} href={moduleSlug ? `/modules/${moduleSlug}/workflow/${slugify(step.title)}` : '#'} className="group rounded-xl border border-white/10 bg-white/7 p-3 transition hover:-translate-y-0.5 hover:border-violet-300/35 hover:bg-white/11">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 text-xs font-bold text-white">{index + 1}</span>
                <span className="mt-2 flex items-start gap-2">
                  <span className="min-w-0 flex-1 font-semibold text-white">{step.title}</span>
                  <ArrowRight size={14} className="shrink-0 text-cyan-200 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                </span>
                <p className="mt-1 text-xs leading-5 text-slate-300">{step.detail}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sections.map((section, index) => {
          const theme = sectionTheme(section.title, moduleSlug, index);
          return (
          <div key={section.title} className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] p-4 shadow-sm">
            <MiniVisual theme={theme} items={section.items} />
            <div className="flex items-center justify-between gap-3">
              <h2 className="mt-4 min-w-0 break-words font-semibold text-white">{section.title}</h2>
              {moduleSlug && (
                <Link
                  href={`/modules/${moduleSlug}/${slugify(section.title)}`}
                  className="mt-4 shrink-0 text-xs font-bold text-cyan-200"
                >
                  Open
                </Link>
              )}
            </div>
            {section.summary && <p className="mt-2 text-sm leading-6 text-slate-300">{section.summary}</p>}
            <div className="mt-4 space-y-2">
              {section.items.map((item) => (
                moduleSlug ? (
                  <Link
                    key={item}
                    href={`/modules/${moduleSlug}/${slugify(item)}`}
                    className="group flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/7 px-3 py-2 text-sm transition hover:border-cyan-300/35 hover:bg-white/11"
                  >
                    <span className={`h-2 w-2 rounded-full ${theme.dot} shrink-0`} />
                    <span className="min-w-0 break-words text-slate-100">{item}</span>
                    <ArrowRight size={14} className="ml-auto shrink-0 text-cyan-200 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                ) : (
                  <div key={item} className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/7 px-3 py-2 text-sm">
                    <span className={`h-2 w-2 rounded-full ${theme.dot} shrink-0`} />
                    <span className="min-w-0 break-words text-slate-100">{item}</span>
                  </div>
                )
              ))}
            </div>
            {(section.controls?.length || section.output) && (
              <div className={`mt-4 rounded-2xl border border-white/10 ${theme.glow} p-3`}>
                {section.controls?.length ? (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Controls</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {section.controls.map((control) => (
                        moduleSlug ? (
                          <Link key={control} href={`/modules/${moduleSlug}/${slugify(section.title)}/${slugify(control)}`} className="rounded-full border border-white/10 bg-white/9 px-2 py-1 text-xs text-slate-100 transition hover:border-cyan-300/35 hover:bg-white/14">
                            {control}
                          </Link>
                        ) : (
                          <span key={control} className="rounded-full border border-white/10 bg-white/9 px-2 py-1 text-xs text-slate-100">{control}</span>
                        )
                      ))}
                    </div>
                  </>
                ) : null}
                {section.output && (
                  moduleSlug ? (
                    <Link href={`/modules/${moduleSlug}/${slugify(section.title)}/${slugify(section.output)}`} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-cyan-200">
                      Output: {section.output} <ArrowRight size={12} />
                    </Link>
                  ) : (
                    <p className="mt-3 text-xs font-bold text-cyan-200">Output: {section.output}</p>
                  )
                )}
              </div>
            )}
          </div>
          );
        })}
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#0F172A] p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-white">Reports and Governance</h2>
            <p className="mt-1 text-sm text-slate-300">Professional ERP outputs for management review, audit trails, and operational decisions.</p>
          </div>
          <Link href={moduleSlug ? `/modules/${moduleSlug}/reports` : '/reports'} className="rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-sm font-bold text-cyan-200">
            Open reports
          </Link>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {reportItems.map((report) => (
            <Link key={report} href={moduleSlug ? `/modules/${moduleSlug}/${slugify(report)}` : '#'} className="rounded-xl border border-white/10 bg-white/7 px-3 py-2 text-sm text-slate-100 transition hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-white/11">
              {report}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
