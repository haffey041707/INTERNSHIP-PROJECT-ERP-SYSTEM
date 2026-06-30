'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { changePassword } from '../actions';

function Submit() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm disabled:opacity-60">{pending ? 'Saving…' : 'Update password'}</button>;
}

export function ChangePasswordForm() {
  const [state, action] = useFormState(changePassword, null as { error?: string; ok?: boolean; message?: string } | null);
  return (
    <form action={action} className="space-y-3 max-w-sm">
      {state?.error && <p className="text-sm text-danger bg-red-50 rounded-lg px-3 py-2">{state.error}</p>}
      {state?.ok && <p className="text-sm text-success bg-green-50 rounded-lg px-3 py-2">{state.message}</p>}
      <Field name="current" label="Current password" />
      <Field name="next" label="New password" />
      <Field name="confirm" label="Confirm new password" />
      <Submit />
    </form>
  );
}

function Field({ name, label }: { name: string; label: string }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-600">{label}</span>
      <input name={name} type="password" required minLength={name === 'current' ? 1 : 6}
        className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none" />
    </label>
  );
}
