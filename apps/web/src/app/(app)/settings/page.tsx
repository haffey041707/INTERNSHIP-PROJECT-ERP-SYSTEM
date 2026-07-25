import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  ChevronRight,
  Database,
  Gauge,
  KeyRound,
  LockKeyhole,
  Palette,
  ServerCog,
  Settings,
  ShieldCheck,
  UserCircle,
  Users,
} from 'lucide-react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { longDate } from '@/lib/format';
import { updateInstitution } from '../actions';
import { ChangePasswordForm } from './ChangePasswordForm';
import { DataManagement } from './DataManagement';

export const dynamic = 'force-dynamic';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'PKR', 'INR', 'AED', 'SAR', 'NGN', 'CAD', 'AUD'];
const TYPES = ['SCHOOL', 'COLLEGE', 'UNIVERSITY', 'INSTITUTE'];

export default async function SettingsPage() {
  const session = getSession();
  if (!session) redirect('/login');

  const [inst, user, students, teachers, sections, users, moduleRecords] = await Promise.all([
    db.institution.findUnique({ where: { id: session.institutionId } }),
    db.user.findUnique({ where: { id: session.userId } }),
    db.student.count({ where: { institutionId: session.institutionId } }),
    db.teacher.count({ where: { institutionId: session.institutionId } }),
    db.section.count({ where: { institutionId: session.institutionId } }),
    db.user.count({ where: { institutionId: session.institutionId } }),
    db.moduleRecord.count({ where: { institutionId: session.institutionId } }),
  ]);
  if (!inst || !user) return null;

  const accountProvider = user.provider === 'google' ? 'Google account' : user.provider === 'microsoft' ? 'Microsoft account' : 'Email password';
  const recordTotal = students + teachers + sections + users + moduleRecords;

  return (
    <div className="settings-console space-y-5">
      <section className="settings-hero overflow-hidden rounded-2xl border border-white/10 bg-white p-5 shadow-sm">
        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">
              <ServerCog size={14} />
              Admin configuration
            </div>
            <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">Settings Control Center</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Manage institution identity, workspace access, account security, and data operations from one clean control surface.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <HeroMini icon={<Building2 size={17} />} label="Workspace" value={inst.type.toLowerCase()} />
              <HeroMini icon={<Palette size={17} />} label="Currency" value={inst.currency} />
              <HeroMini icon={<ShieldCheck size={17} />} label="Access" value={accountProvider} />
            </div>
          </div>
          <ControlVisual />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat icon={<Users size={18} />} label="Students" value={String(students)} tone="from-cyan-500 to-blue-600" />
        <Stat icon={<UserCircle size={18} />} label="Staff" value={String(teachers)} tone="from-violet-500 to-fuchsia-500" />
        <Stat icon={<Building2 size={18} />} label="Sections" value={String(sections)} tone="from-emerald-500 to-teal-500" />
        <Stat icon={<Database size={18} />} label="ERP records" value={String(moduleRecords)} tone="from-amber-500 to-orange-500" />
        <Stat icon={<CalendarDays size={18} />} label="Member since" value={longDate(inst.createdAt)} tone="from-slate-500 to-slate-700" wide />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.12fr_.88fr]">
        <SettingsCard
          icon={<Building2 size={19} />}
          title="Institution Profile"
          subtitle="Update the visible workspace name, institution category, and finance currency."
          action="Core identity"
        >
          <form action={updateInstitution} className="grid gap-4 sm:grid-cols-2">
            <Field label="Institution name" name="name" defaultValue={inst.name} />
            <Select label="System type" name="type" defaultValue={inst.type} options={TYPES} />
            <Select label="Currency" name="currency" defaultValue={inst.currency} options={CURRENCIES} raw />
            <ReadRow label="Institution ID" value={inst.code} />
            <div className="sm:col-span-2">
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white transition hover:bg-brand-700">
                <BadgeCheck size={16} />
                Save profile
              </button>
            </div>
          </form>
        </SettingsCard>

        <SettingsCard
          icon={<Gauge size={19} />}
          title="Workspace Pulse"
          subtitle="Current saved records and module readiness for this institution."
          action="Live status"
        >
          <div className="space-y-4">
            <ProgressLine label="Student records" value={students} total={Math.max(recordTotal, 1)} />
            <ProgressLine label="Staff records" value={teachers} total={Math.max(recordTotal, 1)} />
            <ProgressLine label="Section records" value={sections} total={Math.max(recordTotal, 1)} />
            <ProgressLine label="ERP module records" value={moduleRecords} total={Math.max(recordTotal, 1)} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <StatusBadge label="Tenant scope" value="Protected" />
            <StatusBadge label="Workspace mode" value={inst.type.toLowerCase()} />
          </div>
        </SettingsCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <SettingsCard
          icon={<UserCircle size={19} />}
          title="Signed-in Account"
          subtitle="The active admin identity for this workspace."
          action="Profile"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <ReadRow label="Name" value={user.name} />
            <ReadRow label="Email" value={user.email} />
            <ReadRow label="Role" value={user.role.replace('_', ' ')} />
            <ReadRow label="Provider" value={accountProvider} />
          </div>
        </SettingsCard>

        <SettingsCard
          icon={<LockKeyhole size={19} />}
          title="Security"
          subtitle="Update the account password used for email login."
          action="Account access"
        >
          <div className="grid gap-5 lg:grid-cols-[1fr_220px]">
            <ChangePasswordForm />
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-100">
                <KeyRound size={20} />
              </div>
              <h3 className="mt-4 text-sm font-extrabold text-white">Password policy</h3>
              <div className="mt-3 space-y-2 text-xs text-slate-300">
                <CheckItem text="Minimum 6 characters" />
                <CheckItem text="Current password verification" />
                <CheckItem text="Email login stays enabled" />
              </div>
            </div>
          </div>
        </SettingsCard>
      </section>

      <SettingsCard
        icon={<Database size={19} />}
        title="Data Management"
        subtitle="Populate or clean the records inside this institution workspace."
        action="Workspace data"
      >
        <DataManagement />
      </SettingsCard>
    </div>
  );
}

function ControlVisual() {
  return (
    <div className="settings-control-visual" aria-hidden="true">
      <div className="settings-ring ring-a" />
      <div className="settings-ring ring-b" />
      <div className="settings-core">
        <Settings size={32} />
      </div>
      <span className="settings-node node-profile"><Building2 size={16} /></span>
      <span className="settings-node node-security"><ShieldCheck size={16} /></span>
      <span className="settings-node node-data"><Database size={16} /></span>
      <span className="settings-node node-access"><KeyRound size={16} /></span>
    </div>
  );
}

function HeroMini({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
      <div className="flex items-center gap-2 text-slate-300">
        {icon}
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <p className="mt-2 truncate text-sm font-extrabold capitalize text-white">{value}</p>
    </div>
  );
}

function SettingsCard({ icon, title, subtitle, action, children }: { icon: ReactNode; title: string; subtitle: string; action: string; children: ReactNode }) {
  return (
    <section className="settings-card rounded-2xl border border-white/10 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-100">{icon}</span>
          <div className="min-w-0">
            <h2 className="break-words text-lg font-extrabold text-white">{title}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-300">{subtitle}</p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">
          {action}
          <ChevronRight size={13} />
        </span>
      </div>
      {children}
    </section>
  );
}

function Stat({ icon, label, value, tone, wide }: { icon: ReactNode; label: string; value: string; tone: string; wide?: boolean }) {
  return (
    <div className={`settings-stat rounded-2xl border border-white/10 bg-white p-4 shadow-sm ${wide ? 'col-span-2 lg:col-span-1' : ''}`}>
      <span className={`grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-sm`}>{icon}</span>
      <p className="mt-3 text-xs font-bold text-slate-300">{label}</p>
      <p className="mt-1 truncate text-lg font-extrabold text-white">{value}</p>
    </div>
  );
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return (
    <label className="block min-w-0">
      <span className="text-sm font-bold text-slate-200">{label}</span>
      <input name={name} defaultValue={defaultValue} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/10 px-3 text-sm text-white outline-none transition focus:ring-2 focus:ring-cyan-300/40" />
    </label>
  );
}

function Select({ label, name, defaultValue, options, raw }: { label: string; name: string; defaultValue: string; options: string[]; raw?: boolean }) {
  return (
    <label className="block min-w-0">
      <span className="text-sm font-bold text-slate-200">{label}</span>
      <select name={name} defaultValue={defaultValue} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/10 px-3 text-sm text-white outline-none transition focus:ring-2 focus:ring-cyan-300/40">
        {options.map((option) => (
          <option key={option} value={option}>
            {raw ? option : option[0] + option.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
    </label>
  );
}

function ReadRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-white/10 px-3 py-2.5">
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function ProgressLine({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = Math.max(7, Math.min(100, Math.round((value / total) * 100)));
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-bold text-slate-200">{label}</span>
        <span className="text-xs font-bold text-slate-400">{value}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StatusBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 px-3 py-2">
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-extrabold capitalize text-white">{value}</p>
    </div>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-400/14 text-emerald-200">
        <BadgeCheck size={12} />
      </span>
      <span>{text}</span>
    </div>
  );
}
