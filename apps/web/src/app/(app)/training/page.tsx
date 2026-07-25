import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  GraduationCap,
  PenLine,
  PlayCircle,
  ShieldCheck,
  Target,
  Upload,
  UserCheck,
  Users,
} from 'lucide-react';
import { getMainWorkspace, slugifyWorkspace } from '@/lib/main-workspaces';

const workspace = getMainWorkspace('training')!;

function moduleHref(label: string) {
  return `/modules/training/${slugifyWorkspace(label)}`;
}

function sectionDetailHref(section: string, label: string) {
  return `/modules/training/${slugifyWorkspace(section)}/${slugifyWorkspace(label)}`;
}

export default function TrainingPage() {
  const sections = workspace.sections;
  const reports = workspace.reports;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0F172A] p-5 text-white shadow-sm">
        <div className="grid gap-5 xl:grid-cols-[1fr_430px]">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-widest text-cyan-300">Training delivery centre</p>
            <h1 className="mt-2 break-words text-3xl font-black text-white sm:text-4xl">Batch, trainer, session, and skill progress workspace</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Plan training batches, assign trainers, schedule sessions, share resources, capture attendance, run skill checks, publish feedback, and track learner progress from one professional training desk.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {workspace.quickActions.map((action) => (
                <Link key={action} href={moduleHref(action)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-sm font-bold text-slate-100 transition hover:border-cyan-300/50 hover:bg-white/12">
                  {action}
                  <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          </div>
          <TrainingHeroVisual />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: <CalendarDays size={18} />, label: 'Batch model', value: 'Planned', note: 'Capacity and calendar aligned' },
          { icon: <Users size={18} />, label: 'Trainer load', value: 'Balanced', note: 'Availability and allocation' },
          { icon: <PlayCircle size={18} />, label: 'Delivery', value: 'Tracked', note: 'Sessions and attendance' },
          { icon: <Target size={18} />, label: 'Skills', value: 'Measured', note: 'Assessments and feedback' },
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
              <p className="text-xs font-black uppercase tracking-widest text-cyan-300">Live delivery planner</p>
              <h2 className="mt-1 text-xl font-black text-white">Training calendar and skill pipeline</h2>
            </div>
            <Link href={moduleHref('Training calendar')} className="rounded-xl bg-cyan-300/14 px-3 py-2 text-sm font-bold text-cyan-100">
              Open calendar
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
          <TrainingCalendarVisual />
        </div>

        <div className="grid gap-4">
          <TrainingMiniPanel
            title="Trainer allocation"
            icon={<UserCheck size={18} />}
            tone="from-violet-600 to-fuchsia-500"
            items={['Trainer assignment', 'Trainer availability', 'Trainer workload', 'Session owners']}
          />
          <TrainingMiniPanel
            title="Skill assessment"
            icon={<Target size={18} />}
            tone="from-emerald-500 to-teal-500"
            items={['Skill checks', 'Practical tasks', 'Rubrics', 'Progress reports']}
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {sections.map((section, index) => (
          <TrainingSectionCard key={section.title} section={section} index={index} />
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
              <h2 className="font-black text-slate-950">Training progress and delivery reports</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {reports.map((report) => (
              <Link key={report} href={moduleHref(report)} className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-brand-300 hover:bg-white">
                <p className="break-words text-sm font-black text-slate-950">{report}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Filter by batch, trainer, attendance, skill score, remedial status, and completion readiness.</p>
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
              <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Delivery evidence</p>
              <h2 className="font-black text-slate-950">Files needed for training closure</h2>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {['Training delivery plan', 'Session delivery record', 'Attendance proof', 'Trainer feedback', 'Learner progress report'].map((item) => (
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

function TrainingHeroVisual() {
  return (
    <div className="relative min-h-72 overflow-hidden rounded-[26px] border border-white/10 bg-white/8 p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(14,165,233,.34),transparent_34%),radial-gradient(circle_at_84%_24%,rgba(124,58,237,.30),transparent_30%)]" />
      <div className="relative rounded-2xl bg-white p-4 text-slate-950 shadow-[0_24px_70px_rgba(2,6,23,.28)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Training studio</p>
            <h3 className="text-lg font-black text-slate-950">Batch + trainer + skill outcome</h3>
          </div>
          <GraduationCap className="text-cyan-600" size={32} />
        </div>
        <div className="mt-5 grid gap-3">
          {['Batch calendar', 'Trainer allocation', 'Skill progress'].map((item, index) => (
            <div key={item} className="rounded-2xl bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black text-slate-700">{item}</p>
                <span className={`rounded-full px-2 py-1 text-[10px] font-black ${index === 0 ? 'bg-cyan-100 text-cyan-700' : index === 1 ? 'bg-violet-100 text-violet-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {index === 0 ? 'Planned' : index === 1 ? 'Assigned' : 'Measured'}
                </span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-200">
                <span className={`block h-full rounded-full ${index === 0 ? 'w-3/5 bg-cyan-500' : index === 1 ? 'w-4/5 bg-violet-500' : 'w-2/3 bg-emerald-500'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative mt-4 grid grid-cols-4 gap-2">
        {['Batches', 'Sessions', 'Attendance', 'Skills'].map((item, index) => (
          <div key={item} className="rounded-2xl border border-white/10 bg-white/10 p-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-200">0{index + 1}</p>
            <p className="mt-2 text-xs font-bold text-white">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrainingCalendarVisual() {
  return (
    <div className="mt-5 rounded-[24px] border border-white/10 bg-white/6 p-4">
      <div className="grid gap-3 md:grid-cols-5">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
          <Link key={day} href={moduleHref(`${day} training schedule`)} className="group rounded-2xl border border-white/10 bg-white/8 p-3 transition hover:border-cyan-300/50 hover:bg-white/12">
            <p className="text-[11px] font-black uppercase tracking-widest text-cyan-200">{day}</p>
            <div className="mt-3 space-y-2">
              <span className="block h-2 rounded-full bg-cyan-300" style={{ width: `${68 - index * 4}%` }} />
              <span className="block h-2 rounded-full bg-violet-300" style={{ width: `${42 + index * 7}%` }} />
              <span className="block h-2 rounded-full bg-emerald-300" style={{ width: `${54 + index * 3}%` }} />
            </div>
            <p className="mt-3 text-xs font-bold text-white">{index + 2} sessions</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function TrainingMiniPanel({ title, icon, tone, items }: { title: string; icon: ReactNode; tone: string; items: string[] }) {
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

function TrainingSectionCard({ section, index }: { section: (typeof workspace.sections)[number]; index: number }) {
  const tones = ['from-cyan-500 to-blue-600', 'from-violet-600 to-fuchsia-500', 'from-emerald-500 to-teal-500'];
  const icons = [<CalendarDays key="batch" size={21} />, <PlayCircle key="delivery" size={21} />, <Target key="assessment" size={21} />];
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
        <TrainingSectionVisual index={index} />
        <div className="mt-4 grid gap-2">
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

function TrainingSectionVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/8 p-3">
        <div className="grid grid-cols-2 gap-2">
          {['Batch', 'Calendar', 'Capacity', 'Mode'].map((item) => (
            <div key={item} className="rounded-xl bg-white/8 p-3">
              <CalendarDays size={16} className="text-cyan-200" />
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
        {['Attendance', 'Resources', 'Recordings'].map((item, row) => (
          <div key={item} className="mb-3 last:mb-0">
            <div className="flex justify-between text-xs font-bold text-slate-200">
              <span>{item}</span>
              <span>{row === 0 ? '86%' : row === 1 ? '64%' : '52%'}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-cyan-300" style={{ width: row === 0 ? '86%' : row === 1 ? '64%' : '52%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 p-3">
      <div className="grid grid-cols-2 gap-2">
        {[
          ['Rubric', <PenLine key="rubric" size={16} />],
          ['Task', <ClipboardList key="task" size={16} />],
          ['Feedback', <BookOpen key="feedback" size={16} />],
          ['Progress', <BarChart3 key="progress" size={16} />],
        ].map(([item, icon]) => (
          <div key={String(item)} className="rounded-xl bg-white/8 p-3">
            <span className="text-emerald-200">{icon as ReactNode}</span>
            <p className="mt-2 text-xs font-bold text-white">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
