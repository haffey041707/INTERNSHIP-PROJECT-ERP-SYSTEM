'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { KeyRound } from 'lucide-react';
import { changePassword } from '../actions';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60">
      <KeyRound size={16} />
      {pending ? 'Saving...' : 'Update password'}
    </button>
  );
}

export function ChangePasswordForm() {
  const [state, action] = useFormState(changePassword, null as { error?: string; ok?: boolean; message?: string } | null);
  return (
    <form action={action} className="space-y-3">
      {state?.error && <p className="rounded-xl border border-red-300/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-100">{state.error}</p>}
      {state?.ok && <p className="rounded-xl border border-emerald-300/20 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-100">{state.message}</p>}
      <Field name="current" label="Current password" />
      <Field name="next" label="New password" />
      <Field name="confirm" label="Confirm new password" />
      <Submit />
    </form>
  );
}

function Field({ name, label }: { name: string; label: string }) {
  return (
    <label className="block min-w-0">
      <span className="text-sm font-bold text-slate-200">{label}</span>
      <input name={name} type="password" required minLength={name === 'current' ? 1 : 6}
        className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/10 px-3 text-sm text-white outline-none transition focus:ring-2 focus:ring-cyan-300/40" />
    </label>
  );
}
