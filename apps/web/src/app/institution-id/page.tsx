'use client';

import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { useFormState, useFormStatus } from 'react-dom';
import { changeInstitutionIdAction, findInstitutionIdAction } from '../login/actions';

type FindState = {
  ok?: boolean;
  error?: string;
  institutions?: { name: string; code: string; role: string }[];
} | null;

type ChangeState = {
  ok?: boolean;
  error?: string;
  code?: string;
  message?: string;
} | null;

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending}
      className="auth-bar auth-submit-button grid w-full place-items-center rounded-lg bg-brand-600 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60">
      {pending ? pendingLabel : label}
    </button>
  );
}

export default function InstitutionIdPage() {
  const [findState, findAction] = useFormState(findInstitutionIdAction, null as FindState);
  const [changeState, changeAction] = useFormState(changeInstitutionIdAction, null as ChangeState);

  return (
    <div className="premium-login min-h-[100svh] grid place-items-center bg-white p-2 sm:p-5">
      <div className="w-full max-w-4xl">
        <div className="login-mobile-brand mb-2 flex items-center justify-center gap-2 text-base font-extrabold">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-aurora text-white"><GraduationCap size={16} /></span>
          EduNexus
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <form action={findAction} className="premium-auth-card glass w-full space-y-3 rounded-2xl border border-white/50 p-3 sm:p-5">
            <div>
              <Link href="/login" className="text-xs text-brand-600 hover:underline">Back to sign in</Link>
              <h1 className="mt-2 text-lg font-extrabold text-slate-900 sm:text-xl">Find Institution ID</h1>
              <p className="hidden text-xs text-slate-500 sm:block">Verify your admin account to see the workspace ID.</p>
            </div>

            {findState?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{findState.error}</p>}
            {findState?.ok && findState.institutions && (
              <div className="space-y-2">
                {findState.institutions.map((institution) => (
                  <div key={institution.code} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-xs text-slate-500">{institution.name}</p>
                    <p className="font-mono text-lg font-extrabold text-slate-900">{institution.code}</p>
                    <p className="text-[11px] text-slate-500">{institution.role}</p>
                  </div>
                ))}
              </div>
            )}

            <Field name="email" label="Admin email" type="email" autoComplete="email" placeholder="you@institution.edu" required />
            <Field name="password" label="Password" type="password" autoComplete="current-password" required />
            <SubmitButton label="Show Institution ID" pendingLabel="Checking..." />
          </form>

          <form action={changeAction} className="premium-auth-card glass w-full space-y-3 rounded-2xl border border-white/50 p-3 sm:p-5">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">Change Institution ID</h2>
              <p className="hidden text-xs text-slate-500 sm:block">Use a clear ID your staff can type easily.</p>
            </div>

            {changeState?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{changeState.error}</p>}
            {changeState?.ok && (
              <div className="rounded-lg bg-green-50 px-3 py-2">
                <p className="text-sm font-medium text-success">{changeState.message}</p>
                <p className="font-mono text-lg font-extrabold text-slate-900">{changeState.code}</p>
              </div>
            )}

            <Field name="email" label="Admin email" type="email" autoComplete="email" placeholder="you@institution.edu" required />
            <Field name="password" label="Password" type="password" autoComplete="current-password" required />
            <Field name="currentCode" label="Current Institution ID" placeholder="Only needed if your email has multiple workspaces" />
            <Field name="newCode" label="New Institution ID" placeholder="e.g. GREEN-2026" />
            <SubmitButton label="Change Institution ID" pendingLabel="Updating..." />
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ name, label, type = 'text', placeholder, autoComplete, required }:
  { name: string; label: string; type?: string; placeholder?: string; autoComplete?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-600">{label}</span>
      <input name={name} type={type} placeholder={placeholder} autoComplete={autoComplete} required={required}
        className="auth-bar mt-1 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500" />
    </label>
  );
}
