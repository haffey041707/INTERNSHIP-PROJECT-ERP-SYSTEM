import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Building2, ShieldCheck, UserCircle, Copy, Database } from 'lucide-react';
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

  const [inst, user, students, teachers, sections] = await Promise.all([
    db.institution.findUnique({ where: { id: session.institutionId } }),
    db.user.findUnique({ where: { id: session.userId } }),
    db.student.count({ where: { institutionId: session.institutionId } }),
    db.teacher.count({ where: { institutionId: session.institutionId } }),
    db.section.count({ where: { institutionId: session.institutionId } }),
  ]);
  if (!inst || !user) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm">Manage your institution profile and security.</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Students" value={String(students)} />
        <Stat label="Teachers" value={String(teachers)} />
        <Stat label="Sections" value={String(sections)} />
        <Stat label="Member since" value={longDate(inst.createdAt)} />
      </div>

      {/* Institution profile (editable) */}
      <Card icon={<Building2 size={18} />} title="Institution profile" subtitle="Update your institution’s details and system type.">
        <form action={updateInstitution} className="grid sm:grid-cols-2 gap-4">
          <Field label="Institution name" name="name" defaultValue={inst.name} />
          <Select label="Type" name="type" defaultValue={inst.type} options={TYPES} />
          <Select label="Currency" name="currency" defaultValue={inst.currency} options={CURRENCIES} raw />
          <div className="sm:col-span-2">
            <button className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm">Save changes</button>
          </div>
        </form>
      </Card>

      {/* Institution ID / identity */}
      <Card icon={<UserCircle size={18} />} title="Workspace" subtitle="Identifiers for this institution.">
        <div className="grid sm:grid-cols-2 gap-3">
          <ReadRow label="Institution ID" value={inst.code} mono />
          <ReadRow label="Signed in as" value={`${user.name}`} />
          <ReadRow label="Email" value={user.email} />
          <ReadRow label="Role" value={user.role.replace('_', ' ')} />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-400 flex items-center gap-1"><Copy size={12} /> Share your Institution ID with staff so they can sign in to this workspace.</p>
          <Link href="/institution-id" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-brand-600 hover:bg-slate-50">Change Institution ID</Link>
        </div>
      </Card>

      {/* Security */}
      <Card icon={<ShieldCheck size={18} />} title="Security" subtitle="Change your account password.">
        <ChangePasswordForm />
      </Card>

      {/* Data management */}
      <Card icon={<Database size={18} />} title="Data" subtitle="Populate your workspace to explore the system, or clear it.">
        <DataManagement />
      </Card>
    </div>
  );
}

function Card({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6">
      <div className="flex items-start gap-3 mb-4">
        <span className="grid place-items-center w-9 h-9 rounded-lg bg-brand-50 text-brand-600">{icon}</span>
        <div><h2 className="font-semibold text-slate-900">{title}</h2><p className="text-sm text-slate-500">{subtitle}</p></div>
      </div>
      {children}
    </div>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-4"><p className="text-xs text-slate-500">{label}</p><p className="text-lg font-bold text-slate-900 truncate">{value}</p></div>;
}
function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return <label className="block"><span className="text-sm text-slate-600">{label}</span>
    <input name={name} defaultValue={defaultValue} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none" /></label>;
}
function Select({ label, name, defaultValue, options, raw }: { label: string; name: string; defaultValue: string; options: string[]; raw?: boolean }) {
  return <label className="block"><span className="text-sm text-slate-600">{label}</span>
    <select name={name} defaultValue={defaultValue} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900">
      {options.map((o) => <option key={o} value={o}>{raw ? o : o[0] + o.slice(1).toLowerCase()}</option>)}</select></label>;
}
function ReadRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return <div className="rounded-lg bg-slate-50 px-3 py-2"><p className="text-xs text-slate-400">{label}</p><p className={`text-sm text-slate-800 ${mono ? 'font-mono' : ''}`}>{value}</p></div>;
}
